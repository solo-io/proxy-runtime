
export * from "@solo-io/proxy-runtime/proxy"; // this exports the required functions for the proxy to interact with us.
//this.setEffectiveContext(callback.origin_context_id);
import { RootContext, Context, registerRootContext, Headers, log, LogLevelValues, HeaderPair, FilterHeadersStatusValues, FilterDataStatusValues, FilterTrailersStatusValues, GrpcStatusValues, WasmResultValues, stream_context, send_local_response, continue_request } from "@solo-io/proxy-runtime";

class AuthRoot extends RootContext {

  createContext(context_id: u32): Context {
    log(LogLevelValues.debug, "AuthRoot createContext called!");
    return new Auth(context_id, this);
  }
}

class Auth extends Context {
  allow: bool = false;

  constructor(context_id: u32, root_context: AuthRoot) {
    super(context_id, root_context);
  }

  onRequestHeaders(a: u32, end_of_stream: bool): FilterHeadersStatusValues {
    log(LogLevelValues.debug, "onRequestHeaders called!");
    let cluster = this.root_context.getConfiguration();
    log(LogLevelValues.debug, "onRequestHeaders called!" + cluster);
    // make an http call to the auth cluster
    let result = this.root_context.httpCall(cluster,
      // provide the auth cluster our headers, so it can make an auth decision.
      stream_context.headers.request.get_headers(),
      // no need for body or trailers
      new ArrayBuffer(0), [],
      // 1 second timout
      1000,
      // pass us, so that the callback receives us back.
      // once AssemblyScript supports closures, this will not be needed.
      this,
      // http callback: called when there's a response. if the request failed, headers will be 0
      (origin_context: Context, headers: u32, body_size: usize, trailers: u32) => {
        let context = origin_context as Auth;
        let allow = false;

        if (headers != 0) {
          // if we have a response, allow the request if we have a 200
          log(LogLevelValues.debug, "callback called!");
          let status = stream_context.headers.http_callback.get(":status");
          log(LogLevelValues.debug, "status:" + status + ", headers: " + headers.toString() + ", body_size: " + body_size.toString() + ", trailers: " + trailers.toString());
          if (status == "200") {
            allow = true;
          }
        }

        if (allow) {
          stream_context.headers.request.add("added-header", "authorized");
          // if we are allowed, continue the request
          context.allow = true;
          continue_request();
        } else {
          // we are denied, send a local response indicating that.
          send_local_response(403, "not authorized", new ArrayBuffer(0), [], GrpcStatusValues.Unauthenticated);
        }
      });

    if (result != WasmResultValues.Ok) {
      log(LogLevelValues.debug, "auth failed http call: " + result.toString());

      send_local_response(500, "internal server error", new ArrayBuffer(0), [], GrpcStatusValues.Internal);

      return FilterHeadersStatusValues.StopIteration;
    }

    // Only pass upstream if allowed. this covers the case where the http callback was called inline.
    if (this.allow) {
      return FilterHeadersStatusValues.Continue;
    }

    return FilterHeadersStatusValues.StopIteration;
  }


  onRequestBody(body_buffer_length: usize, end_of_stream: bool): FilterDataStatusValues {
    // Only pass upstream if allowed
    if (this.allow) {
      return FilterDataStatusValues.Continue;
    }

    return FilterDataStatusValues.StopIterationAndWatermark;
  }
  onRequestTrailers(a: u32): FilterTrailersStatusValues {

    // Only pass upstream if allowed
    if (this.allow) {
      return FilterTrailersStatusValues.Continue;
    }

    return FilterTrailersStatusValues.StopIteration;
  }
}

registerRootContext((context_id: u32) => { return new AuthRoot(context_id); }, "auth");