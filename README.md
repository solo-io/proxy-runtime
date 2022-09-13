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
    "asbuild:debug": "asc assembly/index.ts -b build/untouched.wasm --use abort=abort_proc_exit -t build/untouched.wat --sourceMap http://127.0.0.1:8081/build/untouched.wasm.map --debug",
    "asbuild:release": "asc assembly/index.ts -b build/optimized.wasm --use abort=abort_proc_exit -t build/optimized.wat --sourceMap --optimize",
```

Add `"@solo-io/proxy-runtime": "file:/home/yuval/Projects/solo/proxy-assemblyscript"` to your dependencies.
run `npm install`

# using NPM

Just include the `@solo-io/proxy-runtime` package.

# Hello, World

## Code
Copy this into assembly/index.ts:

```ts
export * from "@solo-io/proxy-runtime/proxy"; // this exports the required functions for the proxy to interact with us.
import { RootContext, Context, registerRootContext, FilterHeadersStatusValues, stream_context } from "@solo-io/proxy-runtime";

class AddHeaderRoot extends RootContext {
  createContext(context_id: u32): Context {
    return new AddHeader(context_id, this);
  }
}

class AddHeader extends Context {
  constructor(context_id: u32, root_context: AddHeaderRoot) {
    super(context_id, root_context);
  }
  onResponseHeaders(a: u32, end_of_stream: bool): FilterHeadersStatusValues {
    const root_context = this.root_context;
    if (root_context.getConfiguration() == "") {
      stream_context.headers.response.add("hello", "world!");
    } else {
      stream_context.headers.response.add("hello", root_context.getConfiguration());
    }
    return FilterHeadersStatusValues.Continue;
  }
}

registerRootContext((context_id: u32) => { return new AddHeaderRoot(context_id); }, "add_header");
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
