
export * from "@solo-io/proxy-runtime/proxy"; // this exports the required functions for the proxy to interact with us.
//this.setEffectiveContext(callback.origin_context_id);
import { RootContext, Context, RootContextHelper, ContextHelper, registerRootContext, Headers, log, LogLevelValues, HeaderPair, FilterHeadersStatusValues, FilterDataStatusValues, FilterTrailersStatusValues, GrpcStatusValues, WasmResultValues, stream_context, send_local_response, continue_request } from "@solo-io/proxy-runtime";

class AuthRoot extends RootContext {
  configuration: string;

  createContext(context_id: u32): Context {
    return ContextHelper.wrap(new Auth(context_id, this));
  }
}

class Auth extends Context {
  root_context: AuthRoot;
  allow: bool = false;

  constructor(context_id: u32, root_context: AuthRoot) {
    super(context_id, root_context);
    this.root_context = root_context;
  }

  onRequestHeaders(a: u32): FilterHeadersStatusValues {
    let cluster = this.root_context.getConfiguration();
    let result = this.root_context.httpCall(cluster,
      stream_context.headers.request.get_headers(),
      new ArrayBuffer(0), [],
      1000, this,
      (origin_context: Context, headers: u32, body_size: usize, trailers: u32) => {
        let context = origin_context as Auth;
        log(LogLevelValues.debug, "callback called!");
        log(LogLevelValues.debug, "headers: " + headers.toString() + ", body_size: " + body_size.toString() + ", trailers: " + trailers.toString());
        if (stream_context.headers.http_callback.get(":status") != "200") {
          context.setEffectiveContext();
          send_local_response(403, "not authorized", new ArrayBuffer(0), [], GrpcStatusValues.Unauthenticated);
          return;
        }
        context.allow = true;
        context.setEffectiveContext();
        continue_request();
      });

    if (result != WasmResultValues.Ok) {
      log(LogLevelValues.debug, "auth failed http call: " + result.toString());

     send_local_response(500, "internal server error", new ArrayBuffer(0), [], GrpcStatusValues.Internal);

      return FilterHeadersStatusValues.StopIteration;
    }

    if (this.allow) {
      return FilterHeadersStatusValues.Continue;
    }

    return FilterHeadersStatusValues.StopIteration;
  }


  onRequestBody(body_buffer_length: usize, end_of_stream: bool): FilterDataStatusValues {

    if (this.allow) {
      return FilterDataStatusValues.Continue;
    }

    return FilterDataStatusValues.StopIterationAndWatermark;
  }
  onRequestTrailers(a: u32): FilterTrailersStatusValues {

    if (this.allow) {
      return FilterTrailersStatusValues.Continue;
    }

    return FilterTrailersStatusValues.StopIteration;
  }
}

registerRootContext((context_id: u32) => { return RootContextHelper.wrap(new AuthRoot(context_id)); }, "auth");