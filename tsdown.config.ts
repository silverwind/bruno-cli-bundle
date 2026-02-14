import {nodeCli} from "tsdown-config-silverwind";
import {defineConfig} from "tsdown";

export default defineConfig(nodeCli({
  url: import.meta.url,
  entry: ["./index.ts"],
  shims: true,
  clean: true,
  format: "esm",
  target: "node20",
  inputOptions: {
    // suppress warnings about eval() in @usebruno/requests
    onLog(level, log, defaultHandler) {
      if (log.code === "EVAL") return;
      defaultHandler(level, log);
    },
  },
}));
