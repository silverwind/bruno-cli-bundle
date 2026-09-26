import {execFile} from "node:child_process";
import {mkdtemp, readFile, rm} from "node:fs/promises";
import {createServer} from "node:http";
import type {AddressInfo} from "node:net";
import {tmpdir} from "node:os";
import {join, resolve} from "node:path";
import {test, expect} from "vitest";

const root = resolve(import.meta.dirname, "..");
const cli = resolve(root, "dist/index.js");
const collectionDir = resolve(root, "test/fixtures/collection");

function run(args: string[]): Promise<{code: number | null; stdout: string; stderr: string}> {
  return new Promise((resolve) => {
    execFile("node", [cli, ...args], {cwd: collectionDir}, (error, stdout, stderr) => {
      resolve({code: error ? Number(error.code ?? 1) : 0, stdout, stderr});
    });
  });
}

test.for(["safe", "developer"])("run ping.yml with %s sandbox against mock server", async (sandbox) => {
  const server = createServer((_req, res) => {
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.end("pong");
  });

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });

  const {port} = server.address() as AddressInfo;

  try {
    const {code, stdout, stderr} = await run([
      "run", "ping.yml",
      "--env-var", `baseUrl=http://127.0.0.1:${port}`,
      "--sandbox", sandbox,
    ]);

    if (code !== 0) {
      console.error("stdout:", stdout);
      console.error("stderr:", stderr);
    }

    expect(code).toBe(0);
    expect(stdout).toContain("PASS");
  } finally {
    server.close();
  }
});

test("docs generate writes collection docs", async () => {
  const outDir = await mkdtemp(join(tmpdir(), "bruno-cli-bundle-"));
  try {
    const output = join(outDir, "docs.html");
    expect((await run(["docs", "generate", "-o", output])).code).toBe(0);
    expect(await readFile(output, "utf8")).toContain("<title>test - API Documentation</title>");
  } finally {
    await rm(outDir, {recursive: true});
  }
});
