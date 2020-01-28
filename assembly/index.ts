
import {
  proc_exit,
} from "bindings/wasi";

import {
  __retain,
  __release,
} from "rt/index-full";

export * from "./malloc";
export * from "./runtime";
export * from "./imports";
export * from "./exports";

import {RootContext, Context, RootContextHelper, ContextHelper, registerRootContext, LogLevelValues, add_header_map_value_string} from "./runtime"

/////////////////////////////////////////////////////// code to test; move this to a separate module.
import {log} from "./runtime"
class AddHeaderRoot extends RootContext {
  constructor() {
    super();
    log(LogLevelValues.warn, "AddHeaderRoot created");
  }

  createContext(): Context {
    return ContextHelper.wrap(new AddHeader());
  }
}

class AddHeader extends Context {

  onResponseHeaders(a: u32): FilterHeadersStatusValues {
    add_header_map_value_string(HeaderMapTypeValues.ResponseHeaders, "yuval", "kohavi2");
    return FilterHeadersStatusValues.Continue;
  }
}

registerRootContext(() => {return RootContextHelper.wrap(new AddHeaderRoot()); }, "add_header");