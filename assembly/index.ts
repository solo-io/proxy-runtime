
export * from "./malloc";
export * from "./runtime";
export * from "./imports";
export * from "./exports";

import { RootContext, Context, RootContextHelper, ContextHelper, registerRootContext, LogLevelValues, FilterHeadersStatusValues, HeaderMapTypeValues, add_header_map_value_string } from "./runtime"

import { log } from "./runtime"
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
    add_header_map_value_string(HeaderMapTypeValues.ResponseHeaders, "hello", "world!");
    return FilterHeadersStatusValues.Continue;
  }
}

registerRootContext(() => { return RootContextHelper.wrap(new AddHeaderRoot()); }, "add_header");