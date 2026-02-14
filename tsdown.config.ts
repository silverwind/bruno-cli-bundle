import {nodeCli} from "tsdown-config-silverwind";
import {defineConfig} from "tsdown";

export default defineConfig(nodeCli({
  url: import.meta.url,
  entry: ["./src/index.js"],
  shims: true,
  clean: true,
  format: "esm",
  target: "node20",
}));
