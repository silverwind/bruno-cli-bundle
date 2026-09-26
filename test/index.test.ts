import {execFile} from "node:child_process";
import {mkdtempDisposable, readFile} from "node:fs/promises";
import {createServer} from "node:http";
import type {AddressInfo} from "node:net";
import {tmpdir} from "node:os";
import {join, resolve} from "node:path";
import {promisify} from "node:util";
import {test, expect} from "vitest";

const root = resolve(import.meta.dirname, "..");
const run = (args: string[]) => promisify(execFile)("node", [resolve(root, "dist/index.js"), ...args], {
  cwd: resolve(root, "test/fixtures/collection"),
});

test.for(["safe", "developer"])("run ping.yml with %s sandbox against mock server", async (sandbox) => {
  await using server = createServer((_req, res) => res.writeHead(200, {"Content-Type": "text/plain"}).end("pong"));
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const {stdout} = await run([
    "run", "ping.yml",
    "--env-var", `baseUrl=http://127.0.0.1:${(server.address() as AddressInfo).port}`,
    "--sandbox", sandbox,
  ]);
  expect(stdout).toContain("PASS");
});

test("docs generate writes collection docs", async () => {
  await using dir = await mkdtempDisposable(join(tmpdir(), "bruno-cli-bundle-"));
  const output = join(dir.path, "docs.html");
  await run(["docs", "generate", "-o", output]);
  expect(await readFile(output, "utf8")).toContain("<title>test - API Documentation</title>");
});
