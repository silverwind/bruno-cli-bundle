import {createRequire} from "node:module";
import {dirname} from "node:path";
import {nodeCli} from "tsdown-config-silverwind";
import {defineConfig} from "tsdown";

const require = createRequire(import.meta.url);

const requestsPath = require.resolve("@usebruno/requests/package.json", {
  paths: [dirname(require.resolve("@usebruno/cli/package.json"))],
});
const quickjsPkg = createRequire(requestsPath).resolve("quickjs-emscripten/package.json");
const wasmPath = createRequire(quickjsPkg).resolve("@jitl/quickjs-wasmfile-release-sync/wasm");

export default defineConfig(nodeCli({
  url: import.meta.url,
  entry: ["./index.ts"],
  shims: true,
  clean: true,
  format: "esm",
  target: "node24",
  alias: {
    // not hoisted to top-level node_modules, so resolve it via @usebruno/cli's copy
    "@usebruno/requests": dirname(requestsPath),
  },
  copy: [wasmPath],
  plugins: [{
    // developer sandbox loads npm modules from disk, serve the safe sandbox's bundled libraries instead
    name: "developer-sandbox-libs",
    transform(code: string, id: string) {
      if (!id.endsWith("/sandbox/node-vm/cjs-loader.js")) return;
      const search = "} catch (mainError) {";
      if (!code.includes(search)) throw new Error(`cjs-loader.js no longer contains "${search}"`);
      return `${code.replace(search, `${search}
      safeModeLibs ??= vm.runInContext(\`(\${require("../bundle-browser-rollup")})(); requireObject\`, vm.createContext({crypto}));
      if (Object.hasOwn(safeModeLibs, moduleName)) return safeModeLibs[moduleName];`)}
let safeModeLibs;`;
    },
  }],
  inputOptions: {
    // suppress warnings about eval() in @usebruno/requests
    onLog(level, log, defaultHandler) {
      if (log.code === "EVAL") return;
      defaultHandler(level, log);
    },
  },
}));
