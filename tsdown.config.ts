import {createRequire} from "node:module";
import {dirname, join} from "node:path";
import {nodeCli} from "tsdown-config-silverwind";
import {defineConfig} from "tsdown";

const require = createRequire(import.meta.url);

// @usebruno/cli depends on two versions of quickjs-emscripten transitively
// (@usebruno/js → 0.29.x, @usebruno/requests → 0.32.x). Each ships its own
// emscripten-module.wasm, but a single-file bundle can only carry one wasm,
// so we force both imports to resolve to the newer version's package.
const requestsPath = require.resolve("@usebruno/requests/package.json", {
  paths: [dirname(require.resolve("@usebruno/cli/package.json"))],
});
const quickjsPkg = createRequire(requestsPath).resolve("quickjs-emscripten/package.json");
const quickjsPath = dirname(quickjsPkg);
const wasmPath = join(
  dirname(createRequire(quickjsPkg).resolve("@jitl/quickjs-wasmfile-release-sync/package.json")),
  "dist/emscripten-module.wasm",
);

export default defineConfig(nodeCli({
  url: import.meta.url,
  entry: ["./index.ts"],
  shims: true,
  clean: true,
  format: "esm",
  target: "node20",
  alias: {
    "quickjs-emscripten": quickjsPath,
  },
  copy: [wasmPath],
  inputOptions: {
    // suppress warnings about eval() in @usebruno/requests
    onLog(level, log, defaultHandler) {
      if (log.code === "EVAL") return;
      defaultHandler(level, log);
    },
  },
}));
