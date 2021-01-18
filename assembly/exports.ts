import { getBaseContext, getContext, getRootContext, ensureContext, ensureRootContext, deleteContext, PeerTypeValues } from "./runtime";

///// CALLS IN
type FilterStatus = i32;
type FilterHeadersStatus = i32;
type FilterMetadataStatus = i32;
type FilterTrailersStatus = i32;
type FilterDataStatus = i32;
type GrpcStatus = i32;
type WasmOnDoneResult = u32;

// Calls in.
export function proxy_abi_version_0_2_1(): void { }

export function proxy_on_vm_start(root_context_id: u32, configuration_size: u32): u32 {
  let root_context = getRootContext(root_context_id);
  return root_context.onStart(configuration_size) ? 1 : 0;
}
export function proxy_validate_configuration(root_context_id: u32, configuration_size: u32): u32 {
  let root_context = getRootContext(root_context_id);
  return root_context.validateConfiguration(configuration_size) ? 1 : 0;
}
export function proxy_on_configure(root_context_id: u32, configuration_size: u32): u32 {
  let root_context = getRootContext(root_context_id);
  return root_context.onConfigure(configuration_size) ? 1 : 0;
}
export function proxy_on_tick(root_context_id: u32): void {
  let root_context = getRootContext(root_context_id);
  root_context.onTick();
}
export function proxy_on_foreign_function(root_context_id: u32, function_id: u32, data_size: u32): void {
  // TODO: implement me
}

export function proxy_on_queue_ready(root_context_id: u32, token: u32): void {
  let root_context = getRootContext(root_context_id);
  root_context.onQueueReady(token);
}
// Stream calls.
export function proxy_on_context_create(context_id: u32, root_context_id: u32): void {
  if (root_context_id != 0) {
    ensureContext(context_id, root_context_id);
  } else {
    ensureRootContext(context_id);
  }
}

export function proxy_on_request_headers(context_id: u32, headers: u32, end_of_stream: u32): FilterHeadersStatus {
  let ctx = getContext(context_id);
  return ctx.onRequestHeaders(headers, end_of_stream != 0) as FilterHeadersStatus;
}
export function proxy_on_request_body(context_id: u32, body_buffer_length: u32, end_of_stream: u32): FilterDataStatus {
  let ctx = getContext(context_id);
  return ctx.onRequestBody(body_buffer_length, end_of_stream != 0) as FilterDataStatus;
}
export function proxy_on_request_trailers(context_id: u32, trailers: u32): FilterTrailersStatus {
  let ctx = getContext(context_id);
  return ctx.onRequestTrailers(trailers) as FilterTrailersStatus;
}
export function proxy_on_request_metadata(context_id: u32, nelements: u32): FilterMetadataStatus {
  let ctx = getContext(context_id);
  return ctx.onRequestMetadata(nelements) as FilterMetadataStatus;
}
export function proxy_on_response_headers(context_id: u32, headers: u32, end_of_stream: u32): FilterHeadersStatus {
  let ctx = getContext(context_id);
  return ctx.onResponseHeaders(headers, end_of_stream != 0) as FilterHeadersStatus;
}
export function proxy_on_response_body(context_id: u32, body_buffer_length: u32, end_of_stream: u32): FilterDataStatus {
  let ctx = getContext(context_id);
  return ctx.onResponseBody(body_buffer_length, end_of_stream != 0) as FilterDataStatus;
}
export function proxy_on_response_trailers(context_id: u32, trailers: u32): FilterTrailersStatus {
  let ctx = getContext(context_id);
  return ctx.onResponseTrailers(trailers) as FilterTrailersStatus;
}
export function proxy_on_response_metadata(context_id: u32, nelements: u32): FilterMetadataStatus {
  let ctx = getContext(context_id);
  return ctx.onResponseMetadata(nelements) as FilterMetadataStatus;
}

// HTTP/gRPC.
export function proxy_on_http_call_response(context_id: u32, token: u32, headers: u32, body_size: u32, trailers: u32): void {
  let ctx = getRootContext(context_id);
  ctx.onHttpCallResponse(token, headers, body_size, trailers);
}
export function proxy_on_grpc_receive_initial_metadata(context_id: u32, token: u32, headers: u32): void {
  getRootContext(context_id).on_grpc_receive_initial_metadata(token, headers)
}
export function proxy_on_grpc_trailing_metadata(context_id: u32, token: u32, trailers: u32): void {
  getRootContext(context_id).on_grpc_trailing_metadata(token, trailers)
}
export function proxy_on_grpc_receive(context_id: u32, token: u32, response_size: u32): void {
  getRootContext(context_id).on_grpc_receive(token, response_size)
}
export function proxy_on_grpc_close(context_id: u32, token: u32, status_code: u32): void {
  getRootContext(context_id).on_grpc_close(token, status_code)
}

// NETWORK_FILTER support (TCP and, perhaps one day, UDP).
export function proxy_on_downstream_data(context_id: u32, body_buffer_length: u32, end_of_stream: u32): FilterStatus {
    let ctx = getContext(context_id);
    return ctx.onDownstreamData(body_buffer_length, end_of_stream != 0) as FilterStatus;
}
export function proxy_on_upstream_data(context_id: u32, body_buffer_length: u32, end_of_stream: u32): FilterStatus {
    let ctx = getContext(context_id);
    return ctx.onUpstreamData(body_buffer_length, end_of_stream != 0) as FilterStatus;
}
export function proxy_on_upstream_connection_close(context_id: u32, peer_type: u32): void {
    let ctx = getContext(context_id);
    ctx.onUpstreamConnectionClose(peer_type as PeerTypeValues);
}
export function proxy_on_downstream_connection_close(context_id: u32, peer_type: u32): void {
    let ctx = getContext(context_id);
    ctx.onDownstreamConnectionClose(peer_type as PeerTypeValues);
}
export function proxy_on_new_connection(context_id: u32): FilterStatus {
    let ctx = getContext(context_id);
    return ctx.onNewConnection() as FilterStatus;
}

// The stream/vm has completed.

export function proxy_on_done(context_id: u32): u32 {
  let ctx = getBaseContext(context_id);
  return ctx.onDone() ? 1 : 0;
}

// proxy_on_log occurs after proxy_on_done.
export function proxy_on_log(context_id: u32): void {
  let ctx = getContext(context_id);
  ctx.onLog();
}
// The Context in the proxy has been destroyed and no further calls will be coming.
export function proxy_on_delete(context_id: u32): void {
  let ctx = getBaseContext(context_id);
  ctx.onDelete();
  deleteContext(context_id);
}
