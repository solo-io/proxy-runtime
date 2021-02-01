
export * from "@solo-io/proxy-runtime/proxy"; // this exports the required functions for the proxy to interact with us.
//this.setEffectiveContext(callback.origin_context_id);
import {
  RootContext, Context, BaseContext, registerRootContext, Headers, makeHeaderPair, log,
  BufferTypeValues, LogLevelValues, FilterHeadersStatusValues, FilterDataStatusValues,
  FilterTrailersStatusValues, GrpcStatusValues, WasmResultValues, stream_context,
  send_local_response, set_tick_period_milliseconds, get_buffer_bytes, set_shared_data, get_shared_data
} from "@solo-io/proxy-runtime";

class AuthSingleton extends RootContext {

  onConfigure(configuration_size: u32): bool {
    super.onConfigure(configuration_size);
    log(LogLevelValues.info, "singleton onConfigure! ");
    set_tick_period_milliseconds(1000);
    return true
  }

  onTick(): void {
    this.updateConfig();
  }

  updateConfig(): void {
    let h: Headers = [];
    h.push(makeHeaderPair(":path", "/fetch"));
    h.push(makeHeaderPair(":method", "GET"));
    h.push(makeHeaderPair(":authority", "foo"));
    let cluster = this.getConfiguration();
    log(LogLevelValues.info, "singleton updateConfig! "+cluster);

    let result = this.httpCall(cluster,
      // provide the auth cluster our headers, so it can make an auth decision.
      h,
      // no need for body or trailers
      new ArrayBuffer(0), [],
      // 1 second timeout
      1000,
      // pass us, so that the callback receives us back.
      // once AssemblyScript supports closures, this will not be needed.
      this,
      // http callback: called when there's a response. if the request failed, headers will be 0
      (origin_context: BaseContext, headers: u32, body_size: usize, trailers: u32) => {
        log(LogLevelValues.info, "callback called!");
        let bytes = get_buffer_bytes(BufferTypeValues.HttpCallResponseBody, 0, body_size);
        set_shared_data("data", bytes);
      });
  }
}
class AuthRoot extends RootContext {
  token: string = "";

  createContext(context_id: u32): Context {
    log(LogLevelValues.debug, "AuthRoot createContext called!");
    return new Auth(context_id, this);
  }
  onConfigure(configuration_size: u32): bool {
    set_tick_period_milliseconds(1000);
    return true
  }

  onTick(): void {
    this.syncConfig();
  }

  syncConfig(): void {
    let data = get_shared_data("data");
    if (data.result != WasmResultValues.Ok) {
      return;
    }
    let bytes = data.value;
    if (bytes == null) {
      return;
    }

    if (bytes.byteLength == 0) {
      return;
    }

    this.token = String.UTF8.decode(bytes);
  }
}

class Auth extends Context {
  constructor(context_id: u32, root_context: AuthRoot) {
    super(context_id, root_context);
  }

  onRequestHeaders(a: u32, end_of_stream: bool): FilterHeadersStatusValues {
    log(LogLevelValues.debug, "onRequestHeaders called!");
    // make an http call to the auth cluster
    let root_context = this.root_context as AuthRoot;
    let value = stream_context.headers.request.get("x-auth");
    if (value == root_context.token) {
      return FilterHeadersStatusValues.Continue;
    }

    send_local_response(401, "not authorized", new ArrayBuffer(0), [], GrpcStatusValues.Internal);

    return FilterHeadersStatusValues.StopIteration;
  }

}

registerRootContext((context_id: u32) => { return new AuthRoot(context_id); }, "auth");
registerRootContext((context_id: u32) => { return new AuthSingleton(context_id); }, "auth_singleton");

// Test by curling with foo header:
// curl localhost:8080/ -H"x-auth: foo"