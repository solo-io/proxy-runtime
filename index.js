const fs = require("fs");
const compiled = new WebAssembly.Module(fs.readFileSync(__dirname + "/build/optimized.wasm"));
const imports = {
  env: {
    abort(_msg, _file, line, column) {
       console.error("abort called at index.ts:" + line + ":" + column);
    },
    proxy_get_configuration(configuration_ptr, configuration_size) {
      console.error("configuration_ptr index.ts:" + configuration_ptr + ":" + configuration_size);
    }

  }
};
Object.defineProperty(module, "exports", {
  get: () => new WebAssembly.Instance(compiled, imports).exports
});
