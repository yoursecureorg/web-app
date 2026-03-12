const express = require("express");
const { execSync } = require("child_process");
const app = express();
const PORT = 3000;

app.use(express.static("public"));
app.use(express.json());

// API: return fake "production" env vars (simulating a real victim environment)
app.get("/api/env", (_req, res) => {
  res.json({
    AWS_ACCESS_KEY_ID: "AKIAIOSFODNN7EXAMPLE",
    AWS_SECRET_ACCESS_KEY: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
    NPM_TOKEN: "npm_FAKE1234567890abcdef",
    GITHUB_TOKEN: "ghp_FAKE1234567890abcdefghijklmnopqrstuv",
    DATABASE_URL: "postgres://admin:s3cret@db.internal:5432/prod",
    STRIPE_SECRET_KEY: "sk_live_FAKE1234567890",
  });
});

// API: trigger the simulated postinstall attack
app.post("/api/simulate", (_req, res) => {
  try {
    const output = execSync("node malicious-package/scripts/postinstall.js", {
      env: {
        ...process.env,
        // Inject fake secrets so the "malware" finds them
        AWS_ACCESS_KEY_ID: "AKIAIOSFODNN7EXAMPLE",
        AWS_SECRET_ACCESS_KEY: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
        NPM_TOKEN: "npm_FAKE1234567890abcdef",
        GITHUB_TOKEN: "ghp_FAKE1234567890abcdefghijklmnopqrstuv",
        DATABASE_URL: "postgres://admin:s3cret@db.internal:5432/prod",
        STRIPE_SECRET_KEY: "sk_live_FAKE1234567890",
        ATTACKER_URL: "http://localhost:4444",
      },
      timeout: 5000,
    }).toString();
    res.json({ success: true, output });
  } catch (err) {
    res.json({ success: false, output: err.stderr?.toString() || err.message });
  }
});

// API: check what the attacker server received
app.get("/api/attacker-loot", async (_req, res) => {
  try {
    const resp = await fetch("http://localhost:4444/loot");
    const data = await resp.json();
    res.json(data);
  } catch {
    res.json({ error: "Attacker server not running. Start it with: npm run attacker" });
  }
});

app.listen(PORT, () => {
  console.log(`\n  🪱 Shai Hulud Demo — Victim app running at http://localhost:${PORT}\n`);
});
