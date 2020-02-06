How to use the SDK:


# Local development
Clone this repo to somewhere on disk.

Create a new project:
```shell
npm install --save-dev assemblyscript
npx asinit .
```

add `--use abort=abort_proc_exit` to the `asc` in packages.json. for example:
```json
    "asbuild:untouched": "asc assembly/index.ts -b build/untouched.wasm --use abort=abort_proc_exit -t build/untouched.wat --sourceMap http://127.0.0.1:8081/build/untouched.wasm.map --validate --debug",
    "asbuild:optimized": "asc assembly/index.ts -b build/optimized.wasm --use abort=abort_proc_exit -t build/optimized.wat --sourceMap --validate --optimize",
```

Add `"@solo-io/envoy": "file:/home/yuval/Projects/solo/envoy-assemblyscript"` to your dependencies.
run `npm install`

# using NPM

# Hello, World

## Code
Copy this into assembly/index.ts:

```ts
export * from "@solo-io/envoy";
import { RootContext, Context, RootContextHelper, ContextHelper, registerRootContext, FilterHeadersStatusValues, HeaderMapTypeValues, stream_context } from "@solo-io/envoy/runtime";

class AddHeaderRoot extends RootContext {
  configuration : string;

  onConfigure(configuration_size: size_t): bool {
    let conf_buffer = this.getConfiguration();
    configuration = String.UTF8.decode(conf_buffer);
    return true;
  }


  createContext(): Context {
    return ContextHelper.wrap(new AddHeader());
  }
}

class AddHeader extends Context {
  onResponseHeaders(a: u32): FilterHeadersStatusValues {
    const root_context = this.root_context as AddHeaderRoot;
    if (root_context.configuration == "") {
      stream_context.headers.response.add("hello", "world!");
    } else {
      stream_context.headers.response.add("hello", root_context.configuration);
    }
    return FilterHeadersStatusValues.Continue;
  }
}

registerRootContext(() => { return RootContextHelper.wrap(new AddHeaderRoot()); }, "add_header");
```
## build

To build, simply run:
```
npm run asbuild
```

build results will be in the build folder. `untouched.wasm` and `optimized.wasm` are the compiled 
file that we will use (you only need one of them, if unsure use `optimized.wasm`).

## Run
Configure envoy with your filter:
```yaml
          - name: envoy.filters.http.wasm
            config:
              config:
                name: "add_header"
                root_id: "add_header"
                configuration: "what ever you want"
                vm_config:
                  vm_id: "my_vm_id"
                  runtime: "envoy.wasm.runtime.v8"
                  code:
                    local:
                      filename: /PATH/TO/CODE/build/optimized.wasm
                  allow_precompiled: false
```
