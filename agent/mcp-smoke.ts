import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function main() {
  const transport = new StdioClientTransport({
    command: "npm",
    args: ["run", "agent:tesco"],
    cwd: process.cwd(),
    stderr: "inherit",
  });
  const client = new Client({ name: "grocery-pilot-smoke", version: "0.1.0" });
  await client.connect(transport);
  const tools = await client.listTools();
  const names = tools.tools.map((tool) => tool.name);
  const expected = ["tesco_open_login", "tesco_session_status", "tesco_close_session", "tesco_search", "tesco_prepare_basket", "tesco_open_basket", "tesco_open_checkout_preview"];
  for (const name of expected) {
    if (!names.includes(name)) throw new Error(`Missing MCP tool: ${name}`);
  }
  console.log(`MCP smoke test passed: ${names.join(", ")}`);
  try {
    if (process.argv.includes("--live-search")) {
      const search = await client.callTool({ name: "tesco_search", arguments: { query: "milk", limit: 2 } });
      console.log("Live search response:", JSON.stringify(search.content));
      if (search.isError) throw new Error("The live Tesco search returned an MCP error.");
    }
  } finally {
    await client.callTool({ name: "tesco_close_session", arguments: {} }).catch(() => undefined);
  }
  await client.close();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
