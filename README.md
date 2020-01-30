Start a project!
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

Copy this into index.ts:

```ts
export * from "@solo-io/envoy";
import { RootContext, Context, RootContextHelper, ContextHelper, registerRootContext, FilterHeadersStatusValues, HeaderMapTypeValues, add_header_map_value_string } from "@solo-io/envoy/runtime";

class AddHeaderRoot extends RootContext {
  constructor() {
    super();
  }
  createContext(): Context {
    return ContextHelper.wrap(new AddHeader());
  }
}

class AddHeader extends Context {
  onResponseHeaders(a: u32): FilterHeadersStatusValues {
    add_header_map_value_string(HeaderMapTypeValues.ResponseHeaders, "hello", "world!");
    return FilterHeadersStatusValues.Continue;
  }
}

registerRootContext(() => { return RootContextHelper.wrap(new AddHeaderRoot()); }, "add_header");
```

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
                      filename: /PATH/TO/CODE/build/untouched.wasm
                  allow_precompiled: false
```

