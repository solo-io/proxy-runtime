
export * from "./malloc";
export * from "./exports";

///////////////////////////////////////////////
import { RootContext, Context, RootContextHelper, ContextHelper, registerRootContext, FilterHeadersStatusValues, HeaderMapTypeValues, add_header_map_value_string } from "./runtime"

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