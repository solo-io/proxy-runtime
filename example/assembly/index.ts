
export * from "@solo-io/proxy-runtime/proxy"; // this exports the required functions for the proxy to interact with us.
import { RootContext, Context, RootContextHelper, ContextHelper, registerRootContext, FilterHeadersStatusValues, stream_context } from "@solo-io/proxy-runtime";

class AddHeaderRoot extends RootContext {
  configuration : string;

  createContext(context_id: u32): Context {
    return ContextHelper.wrap(new AddHeader(context_id, this));
  }
}

class AddHeader extends Context {
  root_context : AddHeaderRoot;
  constructor(context_id: u32, root_context:AddHeaderRoot){
    super(context_id, root_context);
    this.root_context = root_context;
  }
  onResponseHeaders(a: u32): FilterHeadersStatusValues {
    const root_context = this.root_context;
    if (root_context.getConfiguration() == "") {
      stream_context.headers.response.add("hello", "world!");
    } else {
      stream_context.headers.response.add("hello", root_context.getConfiguration());
    }
    return FilterHeadersStatusValues.Continue;
  }
}

registerRootContext((context_id: u32) => { return RootContextHelper.wrap(new AddHeaderRoot(context_id)); }, "add_header");