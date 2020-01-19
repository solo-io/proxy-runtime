
//
// ABI
//


/// Allow host to allocate memory.

export function malloc(size: usize): usize {
  let buffer = new ArrayBuffer(size);
  let ptr = changetype<usize>(buffer);
  return __retain(ptr);
}

/// Allow host to free memory.
export function free(ptr: usize): void {
  __release(ptr);
}

/*
namespace proxy {
  function get_configuration() : ArrayBuffer {
    return 
  }
}
*/
// type char = u8;
// type ptr<T> = usize;

type WasmResult = u32;
type CharPtr = usize;
type CharPtrPtr = usize;
type UsizePtr = usize;
type Uint32Ptr = usize;
type Uint64Ptr = usize;
type LogLevel = usize;
type size_t = usize;
type SizeTPtr = usize;
type uint32_t = u32;
type HeaderMapType = usize;
type BufferType = usize;
type MetricType = usize;

type VoidPtr = usize;

type FilterHeadersStatus = u32;
type FilterDataStatus = u32;
type FilterTrailersStatus = u32;
type FilterMetadataStatus = u32;

// Configuration and Status
@external("env", "proxy_get_configuration")
export declare function proxy_get_configuration(configuration_ptr: CharPtrPtr, configuration_size: UsizePtr): WasmResult;

// Logging
@external("env", "proxy_log")
export declare function proxy_log(level: LogLevel, logMessage: CharPtr, messageSize: size_t): WasmResult;

@external("env", "proxy_get_status")
// Results status details for any previous ABI call and onGrpcClose.
export declare function proxy_get_status(status_code_ptr: Uint32Ptr, message_ptr: CharPtrPtr, message_size: UsizePtr): u32;

// Timer (must be called from a root context, e.g. onStart, onTick).
@external("env", "proxy_set_tick_period_milliseconds")
export declare function proxy_set_tick_period_milliseconds(millisecond: uint32_t): WasmResult;

// Time
@external("env", "proxy_get_current_time_nanoseconds")
export declare function proxy_get_current_time_nanoseconds(nanoseconds: Uint64Ptr): WasmResult;

// State accessors
@external("env", "proxy_get_property")
export declare function proxy_get_property(path_ptr: CharPtr, path_size: size_t, value_ptr_ptr: CharPtrPtr, value_size_ptr: SizeTPtr): WasmResult;
@external("env", "proxy_set_property")
export declare function proxy_set_property(path_ptr: CharPtr, path_size: size_t, value_ptr: CharPtr, value_size: size_t): WasmResult;


// Continue/Reply/Route
@external("env", "proxy_continue_request")
export declare function proxy_continue_request(): WasmResult;
@external("env", "proxy_continue_response")
export declare function proxy_continue_response(): WasmResult;
@external("env", "proxy_send_local_response")
export declare function proxy_send_local_response(response_code: uint32_t, response_code_details_ptr: CharPtr,
  response_code_details_size: size_t, body_ptr: CharPtr, body_size: size_t,
  additional_response_header_pairs_ptr: CharPtr,
  additional_response_header_pairs_size: size_t, grpc_status: uint32_t): WasmResult;
@external("env", "proxy_clear_route_cache")
export declare function proxy_clear_route_cache(): WasmResult;

// SharedData
// Returns: Ok, NotFound
@external("env", "proxy_get_shared_data")
export declare function proxy_get_shared_data(key_ptr: CharPtr, key_size: size_t, value_ptr: CharPtrPtr, value_size: SizeTPtr, cas: Uint32Ptr): WasmResult;
//  If cas != 0 and cas != the current cas for 'key' return false, otherwise set the value and
//  return true.
// Returns: Ok, CasMismatch
@external("env", "proxy_set_shared_data")
export declare function proxy_set_shared_data(key_ptr: CharPtr, key_size: size_t, value_ptr: CharPtr, value_size: size_t, cas: uint32_t): WasmResult;

// SharedQueue
// Note: Registering the same queue_name will overwrite the old registration while preseving any
// pending data. Consequently it should typically be followed by a call to
// proxy_dequeue_shared_queue. Returns: Ok
@external("env", "proxy_register_shared_queue")
export declare function proxy_register_shared_queue(queue_name_ptr: CharPtr, queue_name_size: size_t, token: Uint32Ptr): WasmResult;
// Returns: Ok, NotFound
@external("env", "proxy_resolve_shared_queue")
export declare function proxy_resolve_shared_queue(vm_id: CharPtr, vm_id_size: size_t, queue_name_ptr: CharPtr, queue_name_size: size_t, token: Uint32Ptr): WasmResult;
// Returns Ok, Empty, NotFound (token not registered).
@external("env", "proxy_dequeue_shared_queue")
export declare function proxy_dequeue_shared_queue(token: uint32_t, data_ptr: CharPtrPtr, data_size: SizeTPtr): WasmResult;
// Returns false if the queue was not found and the data was not enqueued.
@external("env", "proxy_enqueue_shared_queue")
export declare function proxy_enqueue_shared_queue(token: uint32_t, data_ptr: CharPtr, data_size: size_t): WasmResult;

// Headers/Trailers/Metadata Maps
@external("env", "proxy_add_header_map_value")
export declare function proxy_add_header_map_value(typ: HeaderMapType, key_ptr: CharPtr, key_size: size_t, value_ptr: CharPtr, value_size: size_t): WasmResult;
@external("env", "proxy_get_header_map_value")
export declare function proxy_get_header_map_value(typ: HeaderMapType, key_ptr: CharPtr, key_size: size_t, value_ptr: CharPtrPtr, value_size: SizeTPtr): WasmResult;
@external("env", "proxy_get_header_map_pairs")
export declare function proxy_get_header_map_pairs(typ: HeaderMapType, ptr: CharPtrPtr, size: SizeTPtr): WasmResult;
@external("env", "proxy_set_header_map_pairs")
export declare function proxy_set_header_map_pairs(typ: HeaderMapType, ptr: CharPtr, size: size_t): WasmResult;
@external("env", "proxy_replace_header_map_value")
export declare function proxy_replace_header_map_value(typ: HeaderMapType, key_ptr: CharPtr, key_size: size_t, value_ptr: CharPtr, value_size: size_t): WasmResult;
@external("env", "proxy_remove_header_map_value")
export declare function proxy_remove_header_map_value(typ: HeaderMapType, key_ptr: CharPtr, key_size: size_t): WasmResult;
@external("env", "proxy_get_header_map_size")
export declare function proxy_get_header_map_size(typ: HeaderMapType, size: SizeTPtr): WasmResult;

// Buffer
@external("env", "proxy_get_buffer_bytes")
export declare function proxy_get_buffer_bytes(typ: BufferType, start: uint32_t, length: uint32_t, ptr: CharPtrPtr, size: SizeTPtr): WasmResult;
@external("env", "proxy_get_buffer_status")
export declare function proxy_get_buffer_status(typ: BufferType, length_ptr: SizeTPtr, flags_ptr: Uint32Ptr): WasmResult;

// HTTP
@external("env", "proxy_http_call")
export declare function proxy_http_call(uri_ptr: CharPtr, uri_size: size_t, header_pairs_ptr: VoidPtr, header_pairs_size: size_t, body_ptr: CharPtr, body_size: size_t, trailer_pairs_ptr: VoidPtr, trailer_pairs_size: size_t, timeout_milliseconds: uint32_t, token_ptr: Uint32Ptr): WasmResult;
// gRPC
@external("env", "proxy_grpc_call")
export declare function proxy_grpc_call(service_ptr: CharPtr, service_size: size_t, service_name_ptr: CharPtr, service_name_size: size_t, method_name_ptr: CharPtr, method_name_size: size_t, request_ptr: CharPtr, request_size: size_t, timeout_milliseconds: uint32_t, token_ptr: Uint32Ptr): WasmResult;
@external("env", "proxy_grpc_stream")
export declare function proxy_grpc_stream(service_ptr: CharPtr, service_size: size_t, service_name_ptr: CharPtr, service_name_size: size_t, method_name_ptr: CharPtr, method_name_size: size_t, token_ptr: Uint32Ptr): WasmResult;
@external("env", "proxy_grpc_cancel")
export declare function proxy_grpc_cancel(token: uint32_t): WasmResult;
@external("env", "proxy_grpc_close")
export declare function proxy_grpc_close(token: uint32_t): WasmResult;
@external("env", "proxy_grpc_send")
export declare function proxy_grpc_send(token: uint32_t, message_ptr: CharPtr, message_size: size_t, end_stream: uint32_t): WasmResult;

// Metrics
@external("env", "proxy_define_metric")
export declare function proxy_define_metric(type: MetricType, name_ptr: CharPtr, name_size: size_t, metric_id: Uint32Ptr): WasmResult;
@external("env", "proxy_increment_metric")
export declare function proxy_increment_metric(metric_id: uint32_t, offset: i64): WasmResult;
@external("env", "proxy_record_metric")
export declare function proxy_record_metric(metric_id: uint32_t, value: u64): WasmResult;
@external("env", "proxy_get_metric")
export declare function proxy_get_metric(metric_id: uint32_t, result: Uint64Ptr): WasmResult;

// System
@external("env", "proxy_set_effective_context")
export declare function proxy_set_effective_context(effective_context_id: uint32_t): WasmResult;
@external("env", "proxy_done")
export declare function proxy_done(): WasmResult;

// wrappers below

function log(level: LogLevel, logMessage: string): void {
  // from the docs:
  // Like JavaScript, AssemblyScript stores strings in UTF-16 encoding represented by the API as UCS-2, 
  let buffer = String.UTF8.encode(logMessage);
  proxy_log(0, changetype<usize>(buffer), buffer.byteLength);
}

enum LogLevelValues { trace, debug, info, warn, error, critical };


enum WasmResultValues {
  Ok = 0,
  // The result could not be found, e.g. a provided key did not appear in a table.
  NotFound = 1,
  // An argument was bad, e.g. did not not conform to the required range.
  BadArgument = 2,
  // A protobuf could not be serialized.
  SerializationFailure = 3,
  // A protobuf could not be parsed.
  ParseFailure = 4,
  // A provided expression (e.g. "foo.bar") was illegal or unrecognized.
  BadExpression = 5,
  // A provided memory range was not legal.
  InvalidMemoryAccess = 6,
  // Data was requested from an empty container.
  Empty = 7,
  // The provided CAS did not match that of the stored data.
  CasMismatch = 8,
  // Returned result was unexpected, e.g. of the incorrect size.
  ResultMismatch = 9,
  // Internal failure: trying check logs of the surrounding system.
  InternalFailure = 10,
  // The connection/stream/pipe was broken/closed unexpectedly.
  BrokenConnection = 11,
};

function CHECK_RESULT(c: WasmResult): void {
  if (c != WasmResultValues.Ok) {
    log(LogLevelValues.critical, c.toString());
    throw new Error(":(");
  }
}

class Reference<T> {
  data: T;

  ptr(): usize {
    return changetype<usize>(this) + offsetof<Reference<T>>("data");
  }
}

class ArrayBufferReference {
  private buffer: CharPtr;
  private size: usize;

  constructor() {
  }

  sizePtr(): usize {
    return changetype<usize>(this) + offsetof<this>("size");
  }
  bufferPtr(): CharPtr {
    return changetype<usize>(this) + offsetof<this>("buffer");
  }

  // Before calling methods below, u must call out to the host to fill in the values.
  // methods below must be called once and only once
  toArrayBuffer(): ArrayBuffer {

    if (this.size == 0) {
      return new ArrayBuffer(0);
    }

    let array = changetype<ArrayBuffer>(this.buffer);
    // host code used malloc to allocate this buffer.
    // release the allocated ptr. array variable will retain it, so it won't be actually free (as it is ref counted).
    free(this.buffer);
    return array.slice(0, this.size);
  }
}

class WasmData {
  data: ArrayBuffer;
  constructor() { }
}


// temporarily exported the function for testing
export function get_configuration(): ArrayBuffer {
  let r = new ArrayBufferReference();
  CHECK_RESULT(proxy_get_configuration(r.bufferPtr(), r.sizePtr()));
  let array = r.toArrayBuffer();

  //  log(0, String.UTF8.decode(array));

  return array;
}

class StatusWithData {
  status: u32;
  data: ArrayBuffer;

}

export function get_status(): StatusWithData {
  let status = new Reference<u32>();
  let r = new ArrayBufferReference();
  CHECK_RESULT(proxy_get_status(status.ptr(), r.bufferPtr(), r.sizePtr()));
  return { status: status.data, data: r.toArrayBuffer() };
}

export function set_tick_period_milliseconds(millisecond: u32): void {
  CHECK_RESULT(proxy_set_tick_period_milliseconds(millisecond));
}

export function get_current_time_nanoseconds(): u64 {
  let nanos = new Reference<u64>();
  CHECK_RESULT(proxy_get_current_time_nanoseconds(nanos.ptr()));
  return nanos.data;
}

export function get_property(path: string): ArrayBuffer {
  let buffer = String.UTF8.encode(path);
  let r = new ArrayBufferReference();

  CHECK_RESULT(proxy_get_property(changetype<usize>(buffer), buffer.byteLength, r.bufferPtr(), r.sizePtr()));
  return r.toArrayBuffer();
}

export function set_property(path: string, data: ArrayBuffer): WasmResult {
  let buffer = String.UTF8.encode(path);
  return proxy_set_property(changetype<usize>(buffer), buffer.byteLength, changetype<usize>(data), data.byteLength);
}


///// CALLS IN

// Calls in.
export function proxy_on_start(root_context_id: uint32_t, configuration_size: uint32_t): uint32_t { return 0; }
export function proxy_validate_configuration(root_context_id: uint32_t, configuration_size: uint32_t): uint32_t { return 0; }
export function proxy_on_configure(root_context_id: uint32_t, configuration_size: uint32_t): uint32_t { return 0; }
export function proxy_on_tick(root_context_id: uint32_t): void { }
export function proxy_on_queue_ready(root_context_id: uint32_t, token: uint32_t): void { }

// Stream calls.
export function proxy_on_create(context_id: uint32_t, root_context_id: uint32_t): void { }
export function proxy_on_request_headers(context_id: uint32_t, headers: uint32_t): FilterHeadersStatus { return 0; }
export function proxy_on_request_body(context_id: uint32_t, body_buffer_length: uint32_t, end_of_stream: uint32_t): FilterDataStatus { return 0; }
export function proxy_on_request_trailers(context_id: uint32_t, trailers: uint32_t): FilterTrailersStatus { return 0; }
export function proxy_on_request_metadata(context_id: uint32_t, nelements: uint32_t): FilterMetadataStatus { return 0; }
export function proxy_on_response_headers(context_id: uint32_t, headers: uint32_t): FilterHeadersStatus { return 0; }
export function proxy_on_response_body(context_id: uint32_t, body_buffer_length: uint32_t, end_of_stream: uint32_t): FilterDataStatus { return 0; }
export function proxy_on_response_trailers(context_id: uint32_t, trailers: uint32_t): FilterTrailersStatus { return 0; }
export function proxy_on_response_metadata(context_id: uint32_t, nelements: uint32_t): FilterMetadataStatus { return 0; }

// HTTP/gRPC.
export function proxy_on_http_call_response(context_id: uint32_t, token: uint32_t, headers: uint32_t, body_size: uint32_t, trailers: uint32_t): void { }
export function proxy_on_grpc_create_initial_metadata(context_id: uint32_t, token: uint32_t, headers: uint32_t): void { }
export function proxy_on_grpc_receive_initial_metadata(context_id: uint32_t, token: uint32_t, headers: uint32_t): void { }
export function proxy_on_grpc_trailing_metadata(context_id: uint32_t, token: uint32_t, trailers: uint32_t): void { }
export function proxy_on_grpc_receive(context_id: uint32_t, token: uint32_t, response_size: uint32_t): void { }
export function proxy_on_grpc_close(context_id: uint32_t, token: uint32_t, status_code: uint32_t): void { }

// The stream/vm has completed.
export function proxy_on_done(context_id: uint32_t): uint32_t { return 0; }
// proxy_on_log occurs after proxy_on_done.
export function proxy_on_log(context_id: uint32_t): void { }
// The Context in the proxy has been destroyed and no further calls will be coming.
export function proxy_on_delete(context_id: uint32_t): void { }
