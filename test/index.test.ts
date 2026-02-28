import {execFile} from "node:child_process";
import {createServer} from "node:http";
import {resolve} from "node:path";
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

test("run ping.yml against mock server", async () => {
  const server = createServer((_req, res) => {
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.end("pong");
  });

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });

  const addr = server.address();
  const port = typeof addr === "object" && addr ? addr.port : 0;

  try {
    const {code, stdout, stderr} = await run([
      "run", "ping.yml",
      "--env-var", `baseUrl=http://127.0.0.1:${port}`,
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
