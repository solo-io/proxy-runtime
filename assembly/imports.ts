import {getContext, getRootContext, ensureContext, ensureRootContext} from "./runtime";

///// CALLS IN
type FilterStatus = i32;
type FilterHeadersStatus = i32;
type FilterMetadataStatus = i32;
type FilterTrailersStatus = i32;
type FilterDataStatus = i32;
type GrpcStatus = i32;


// Calls in.
export function proxy_on_vm_start(root_context_id: u32, configuration_size: u32): u32 {
    return getRootContext(root_context_id).onStart(configuration_size) ? 1 : 0;
  }
  export function proxy_validate_configuration(root_context_id: u32, configuration_size: u32): u32 {
    return getRootContext(root_context_id).validateConfiguration(configuration_size) ? 1 : 0;
  }
  export function proxy_on_configure(root_context_id: u32, configuration_size: u32): u32 {
    return getRootContext(root_context_id).onConfigure(configuration_size) ? 1 : 0;
  }
  export function proxy_on_tick(root_context_id: u32): void {
    getRootContext(root_context_id).onTick();
  }
  export function proxy_on_queue_ready(root_context_id: u32, token: u32): void { }
  
  // Stream calls.
  export function proxy_on_context_create(context_id: u32, root_context_id: u32): void {
    if (root_context_id != 0) {
      ensureContext(context_id, root_context_id);
    } else {
      ensureRootContext(context_id);
    }
  }
  
  export function proxy_on_request_headers(context_id: u32, headers: u32): FilterHeadersStatus {
    let ctx = getContext(context_id);
    return ctx.onRequestHeaders_(ctx, headers) as FilterHeadersStatus;
  }
  export function proxy_on_request_body(context_id: u32, body_buffer_length: u32, end_of_stream: u32): FilterDataStatus {
    let ctx = getContext(context_id);
    return ctx.onRequestBody_(ctx, body_buffer_length, end_of_stream != 0) as FilterDataStatus;
  }
  export function proxy_on_request_trailers(context_id: u32, trailers: u32): FilterTrailersStatus {
    let ctx = getContext(context_id);
    return ctx.onRequestTrailers_(ctx, trailers) as FilterTrailersStatus;
  }
  export function proxy_on_request_metadata(context_id: u32, nelements: u32): FilterMetadataStatus {
    let ctx = getContext(context_id);
    return ctx.onRequestMetadata_(ctx, nelements) as FilterMetadataStatus;
  }
  export function proxy_on_response_headers(context_id: u32, headers: u32): FilterHeadersStatus {
    let ctx = getContext(context_id);
    return ctx.onResponseHeaders_(ctx, headers) as FilterHeadersStatus;
  }
  export function proxy_on_response_body(context_id: u32, body_buffer_length: u32, end_of_stream: u32): FilterDataStatus {
    let ctx = getContext(context_id);
    return ctx.onResponseBody_(ctx, body_buffer_length, end_of_stream != 0) as FilterDataStatus;
  }
  export function proxy_on_response_trailers(context_id: u32, trailers: u32): FilterTrailersStatus {
    let ctx = getContext(context_id);
    return ctx.onResponseTrailers_(ctx, trailers) as FilterTrailersStatus;
  }
  export function proxy_on_response_metadata(context_id: u32, nelements: u32): FilterMetadataStatus {
    let ctx = getContext(context_id);
    return ctx.onResponseMetadata_(ctx, nelements) as FilterMetadataStatus;
  }
  
  // HTTP/gRPC.
  export function proxy_on_http_call_response(context_id: u32, token: u32, headers: u32, body_size: u32, trailers: u32): void {
    getRootContext(context_id).onHttpCallResponse(token, headers, body_size, trailers);
  }
  export function proxy_on_grpc_create_initial_metadata(context_id: u32, token: u32, headers: u32): void { }
  export function proxy_on_grpc_receive_initial_metadata(context_id: u32, token: u32, headers: u32): void { }
  export function proxy_on_grpc_trailing_metadata(context_id: u32, token: u32, trailers: u32): void { }
  export function proxy_on_grpc_receive(context_id: u32, token: u32, response_size: u32): void { }
  export function proxy_on_grpc_close(context_id: u32, token: u32, status_code: u32): void { }
  
  // The stream/vm has completed.
  
  // proxy_on_log occurs after proxy_on_done.
  export function proxy_on_log(context_id: u32): void { }
  // The Context in the proxy has been destroyed and no further calls will be coming.
  export function proxy_on_delete(context_id: u32): void { }
  