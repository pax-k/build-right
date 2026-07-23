import { main } from "./lib/openspec/ensure-openspec";

try {
  process.exit(await main(Bun.argv.slice(2)));
} catch {
  console.error("managed planning setup failed at the CLI boundary");
  process.exit(1);
}
