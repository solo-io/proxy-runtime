export * from "@solo-io/proxy-runtime/proxy";
import {
  RootContext,
  Context,
  registerRootContext,
  FilterHeadersStatusValues,
  FilterDataStatusValues,
  stream_context,
  log,
  LogLevelValues
} from "@solo-io/proxy-runtime";
class RemoveHeadersRoot extends RootContext {
  createContext(context_id: u32): Context {
    return new RemoveHeader(context_id, this);
  }
}
class RemoveHeader extends Context {

  token_str: string;
  rm_tokens: Array<string> = new Array<string>(10);

  constructor(context_id: u32, root_context: RemoveHeadersRoot) {
    super(context_id, root_context);
    this.token_str = root_context.getConfiguration();
    if (this.token_str != "") {
      // establish array of tokens to remove from response headers
      this.rm_tokens = this.token_str.split(",");
      log(LogLevelValues.debug, "rm-headers: token count: " + this.rm_tokens.length.toString() 
        + " token[0]: " + this.rm_tokens[0]);
    }
  }

  onResponseHeaders(a: u32, end_of_stream: bool): FilterHeadersStatusValues {
    const root_context = this.root_context;
    log(LogLevelValues.trace, "onResponseHeaders called!");
    if (this.token_str == "") {
      log(LogLevelValues.trace, "rm-headers: no config specified - skipping this response");
      return FilterHeadersStatusValues.Continue;
    }

    let hdr_arr = stream_context.headers.response.get_headers();
    let num_hdrs: u32 = hdr_arr.length;
    // search all header keys for the configured tokens and remove the matching headers from response
    for (let i: u32 = 0; i < num_hdrs; i++) {
      let hdr_key: string = String.UTF8.decode(hdr_arr[i].key);
      log(LogLevelValues.debug, "onResponseHeaders processing header: " + hdr_key);
      let num_tokens: u32 = this.rm_tokens.length;
      for (let j: u32 = 0; j < num_tokens; j++) {
        let rm_token: string = this.rm_tokens[j];
        if (hdr_key.startsWith(rm_token)) {
          stream_context.headers.response.remove(hdr_key);
          log(LogLevelValues.debug, "onResponseHeaders removed header: " + hdr_key);
          break;
        }
      }
    }

    return FilterHeadersStatusValues.Continue;
  }
}
registerRootContext((context_id: u32) => { return new RemoveHeadersRoot(context_id); }, "remove_headers");