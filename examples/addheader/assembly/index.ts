
export * from "@solo-io/proxy-runtime/assembly/proxy"; // this exports the required functions for the proxy to interact with us.
import { RootContext, Context, registerRootContext, FilterHeadersStatusValues, stream_context } from "@solo-io/proxy-runtime/assembly";

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