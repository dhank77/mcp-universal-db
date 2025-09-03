import { spawn } from "child_process";

const child = spawn("node", [
  "../dist/index.js",
  "--transport",
  "stdio"
], {
  env: {
    ...process.env,
    DOTENV_CONFIG_PATH: "/Users/hamdaniilham/Nextjs/mcp-universal-db/.env"
  },
  stdio: ["pipe", "pipe", "pipe"]
});

// listen logs
child.stdout.on("data", (data) => {
  console.log("STDOUT:", data.toString());
});
child.stderr.on("data", (data) => {
  console.error("STDERR:", data.toString());
});

// send a request ke MCP server
const request = {
  jsonrpc: "2.0",
  id: 1,
  method: "connect",
  params: {}
};

child.stdin.write(JSON.stringify(request) + "\n");
