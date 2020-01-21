
import {
  proc_exit,
} from "bindings/wasi";


//
// ABI
//

// type char = u8;
// type ptr<T> = usize;

type CharPtr = usize;
type CharPtrPtr = usize;
type UsizePtr = usize;
type Uint32Ptr = usize;
type Uint64Ptr = usize;
type size_t = usize;
type SizeTPtr = usize;
type uint32_t = u32;

type VoidPtr = usize;

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

type LogLevel = usize;
enum LogLevelValues { trace, debug, info, warn, error, critical };

type WasmResult = u32;
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
}
type FilterStatus = i32;
enum FilterStatusValues { Continue = 0, StopIteration = 1 }
type FilterHeadersStatus = i32;
enum FilterHeadersStatusValues { Continue = 0, StopIteration = 1 }
type FilterMetadataStatus = i32;
enum FilterMetadataStatusValues { Continue = 0 };
type FilterTrailersStatus = i32;
enum FilterTrailersStatusValues { Continue = 0, StopIteration = 1 }
type FilterDataStatus = i32;
enum FilterDataStatusValues {
  Continue = 0,
  StopIterationAndBuffer = 1,
  StopIterationAndWatermark = 2,
  StopIterationNoBuffer = 3
}

type GrpcStatus = i32;
enum GrpcStatusValues {
  Ok = 0,
  Canceled = 1,
  Unknown = 2,
  InvalidArgument = 3,
  DeadlineExceeded = 4,
  NotFound = 5,
  AlreadyExists = 6,
  PermissionDenied = 7,
  ResourceExhausted = 8,
  FailedPrecondition = 9,
  Aborted = 10,
  OutOfRange = 11,
  Unimplemented = 12,
  Internal = 13,
  Unavailable = 14,
  DataLoss = 15,
  Unauthenticated = 16,
  MaximumValid = Unauthenticated,
  InvalidCode = -1
}


type MetricType = i32;
enum MetricTypeValues {
  Counter = 0,
  Gauge = 1,
  Histogram = 2,
}
type PeerType = i32;
enum PeerTypeValues {
  Unknown = 0,
  Local = 1,
  Remote = 2,
}

type HeaderMapType = i32;
enum HeaderMapTypeValues {
  RequestHeaders = 0,   // During the onLog callback these are immutable
  RequestTrailers = 1,  // During the onLog callback these are immutable
  ResponseHeaders = 2,  // During the onLog callback these are immutable
  ResponseTrailers = 3, // During the onLog callback these are immutable
  GrpcCreateInitialMetadata = 4,
  GrpcReceiveInitialMetadata = 5,  // Immutable
  GrpcReceiveTrailingMetadata = 6, // Immutable
  HttpCallResponseHeaders = 7,     // Immutable
  HttpCallResponseTrailers = 8,    // Immutable
  MAX = 8,
}

type BufferType = i32;
enum BufferTypeValues {
  HttpRequestBody = 0,       // During the onLog callback these are immutable
  HttpResponseBody = 1,      // During the onLog callback these are immutable
  NetworkDownstreamData = 2, // During the onLog callback these are immutable
  NetworkUpstreamData = 3,   // During the onLog callback these are immutable
  HttpCallResponseBody = 4,  // Immutable
  GrpcReceiveBuffer = 5,     // Immutable
  MAX = 5,
}

type BufferFlags = i32;

enum BufferFlagsValues {
  // These must be powers of 2.
  EndOfStream = 1,
}


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


/////////////// Access helpers

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
    return changetype<usize>(this) + offsetof<ArrayBufferReference>("size");
  }
  bufferPtr(): CharPtr {
    return changetype<usize>(this) + offsetof<ArrayBufferReference>("buffer");
  }

  // Before calling toArrayBuffer below, you must call out to the host to fill in the values.
  // toArrayBuffer below **must** be called once and only once.
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

var globalArrayBufferReference = new ArrayBufferReference();

class WasmData {
  data: ArrayBuffer;
  constructor() { }
}

type Headers = Map<ArrayBuffer, ArrayBuffer>;

/////////////////////////// helper functions

// abort function.
// use with:
// --use abort=index/abort_proc_exit
// compiler flag
@global
export function abort_proc_exit(
  message: string | null,
  fileName: string | null,
  lineNumber: u32,
  columnNumber: u32
): void {

  if (message != null) {
    log(LogLevelValues.critical, message.toString());
  }
  // from the docs: exceptions are not supported, and will abort
  //  throw new Error(":(");
  proc_exit(255);
}

function CHECK_RESULT(c: WasmResult): void {
  if (c != WasmResultValues.Ok) {
    log(LogLevelValues.critical, c.toString());
    abort_proc_exit(":(", null,0,0);
  }
}

/////////////////// wrappers below
/////////////////// these are the same as the imports above, but with more native typescript interface.

function log(level: LogLevel, logMessage: string): void {
  // from the docs:
  // Like JavaScript, AssemblyScript stores strings in UTF-16 encoding represented by the API as UCS-2, 
  let buffer = String.UTF8.encode(logMessage);
  proxy_log(0, changetype<usize>(buffer), buffer.byteLength);
}

// temporarily exported the function for testing
export function get_configuration(): ArrayBuffer {
  CHECK_RESULT(proxy_get_configuration(globalArrayBufferReference.bufferPtr(), globalArrayBufferReference.sizePtr()));
  let array = globalArrayBufferReference.toArrayBuffer();

  log(LogLevelValues.debug, String.UTF8.decode(array));
  return array;
}

class StatusWithData {
  status: u32;
  data: ArrayBuffer;
}

export function get_status(): StatusWithData {
  let status = new Reference<u32>();
  CHECK_RESULT(proxy_get_status(status.ptr(), globalArrayBufferReference.bufferPtr(), globalArrayBufferReference.sizePtr()));
  return { status: status.data, data: globalArrayBufferReference.toArrayBuffer() };
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

  CHECK_RESULT(proxy_get_property(changetype<usize>(buffer), buffer.byteLength, globalArrayBufferReference.bufferPtr(), globalArrayBufferReference.sizePtr()));
  return globalArrayBufferReference.toArrayBuffer();
}

export function set_property(path: string, data: ArrayBuffer): WasmResultValues {
  let buffer = String.UTF8.encode(path);
  return proxy_set_property(changetype<usize>(buffer), buffer.byteLength, changetype<usize>(data), data.byteLength);
}

function pairsSize(headers: Headers): usize {
  let size = 4; // number of headers
  let all_keys = headers.keys();
  // for in loop doesn't seem to be supported..
  for (let i = 0; i < all_keys.length; i++) {
    let key = all_keys[i];
    size += 8;                   // size of key, size of value
    size += key.byteLength + 1;  // null terminated key
    size += headers[key].byteLength + 1; // null terminated value
  }
  return size;
}

function serializeHeaders(headers: Headers): ArrayBuffer {
  let result = new ArrayBuffer(pairsSize(headers));
  let sizes = Uint32Array.wrap(result, 0, 1 + headers.size);
  sizes[0] = headers.size;

  // header sizes:
  let index = 1;

  let keys /*: []ArrayBuffer*/ = headers.keys();
  // for in loop doesn't seem to be supported..
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
    sizes[index] = key.byteLength;
    index++;
    sizes[index] = headers[key].byteLength;
    index++;
  }

  let data = Uint8Array.wrap(result, sizes.byteLength);

  let currentOffset = 0;
  // for in loop doesn't seem to be supported..
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
    // i'm sure there's a better way to copy, i just don't know what it is :/
    let wrappedKey = Uint8Array.wrap(key);
    let keyData = data.subarray(currentOffset, wrappedKey.byteLength);
    for (let i = 0; i < wrappedKey.byteLength; i++) {
      keyData[i] = wrappedKey[i];
    }
    currentOffset += wrappedKey.byteLength + 1; // + 1 for terminating nil


    let wrappedValue = Uint8Array.wrap(headers[key]);
    let valueData = data.subarray(currentOffset, wrappedValue.byteLength);
    for (let i = 0; i < wrappedValue.byteLength; i++) {
      valueData[i] = wrappedValue[i];
    }
    currentOffset += wrappedValue.byteLength + 1; // + 1 for terminating nil
  }
  return result;
}

export function continue_request(): WasmResult { return proxy_continue_request(); }
export function continue_response(): WasmResult { return proxy_continue_response(); }
export function send_local_response(response_code: u32, response_code_details: string, body: ArrayBuffer,
  additional_headers: Headers, grpc_status: GrpcStatusValues): WasmResultValues {
  let response_code_details_buffer = String.UTF8.encode(response_code_details);
  let headers = serializeHeaders(additional_headers);
  return proxy_send_local_response(response_code, changetype<usize>(response_code_details_buffer), response_code_details_buffer.byteLength,
    changetype<usize>(body), body.byteLength, changetype<usize>(headers), headers.byteLength, grpc_status);
}


export function clear_route_cache(): WasmResultValues { return proxy_clear_route_cache(); }
/*
export function get_shared_data(key_ptr, key_size, value_ptr, value_size, cas) { return 0; },
export function set_shared_data(key_ptr, key_size, value_ptr, value_size, cas) { return 0; },
export function register_shared_queue(queue_name_ptr, queue_name_size, token) { return 0; },
export function resolve_shared_queue(vm_id, vm_id_size, queue_name_ptr, queue_name_size, token) { return 0; },
export function dequeue_shared_queue(token, data_ptr, data_size) { return 0; },
export function enqueue_shared_queue(token, data_ptr, data_size) { return 0; },
*/

export function add_header_map_value(typ: HeaderMapTypeValues, key: ArrayBuffer, value: ArrayBuffer): WasmResultValues {
  return proxy_add_header_map_value(typ, changetype<usize>(key), key.byteLength, changetype<usize>(value), value.byteLength);
}
export function get_header_map_value(typ: HeaderMapTypeValues, key: ArrayBuffer): ArrayBuffer {
  let result = proxy_get_header_map_value(typ, changetype<usize>(key), key.byteLength, globalArrayBufferReference.bufferPtr(), globalArrayBufferReference.sizePtr());
  if (result == WasmResultValues.Ok) {
    return globalArrayBufferReference.toArrayBuffer()
  }
  return new ArrayBuffer(0);
}
function get_header_map_flat_pairs(typ: HeaderMapTypeValues): ArrayBuffer {
  let result = proxy_get_header_map_pairs(typ, globalArrayBufferReference.bufferPtr(), globalArrayBufferReference.sizePtr());
  if (result == WasmResultValues.Ok) {
    return globalArrayBufferReference.toArrayBuffer()
  }
  return new ArrayBuffer(0);
}
export function get_header_map_pairs(typ: HeaderMapTypeValues): Headers { throw new Error('un impl yet'); }
export function set_header_map_flat_pairs(typ: HeaderMapTypeValues, flat_headers: ArrayBuffer): void {
  CHECK_RESULT(proxy_set_header_map_pairs(typ, changetype<usize>(flat_headers), flat_headers.byteLength));
}
export function set_header_map_pairs(typ: HeaderMapTypeValues, headers: Headers): void {
  let flat_headers = serializeHeaders(headers);
  set_header_map_flat_pairs(typ, flat_headers);
}
export function replace_header_map_value(typ: HeaderMapTypeValues, key: ArrayBuffer, value: ArrayBuffer): void {
  CHECK_RESULT(proxy_replace_header_map_value(typ, changetype<usize>(key), key.byteLength, changetype<usize>(value), value.byteLength));
}
export function remove_header_map_value(typ: HeaderMapTypeValues, key: ArrayBuffer): void {
  CHECK_RESULT(proxy_remove_header_map_value(typ, changetype<usize>(key), key.byteLength));
}
export function get_header_map_size(typ: HeaderMapTypeValues): usize {
  let status = new Reference<usize>();
  CHECK_RESULT(proxy_get_header_map_size(typ, status.ptr()));
  return status.data;
}
// unclear if start and length are 64 or 32
export function get_buffer_bytes(typ: BufferTypeValues, start: u32, length: u32): ArrayBuffer {
  let result = proxy_get_buffer_bytes(typ, start, length, globalArrayBufferReference.bufferPtr(), globalArrayBufferReference.sizePtr());
  // TODO: return the result as well. not sure what the best way to do this as it doesn't seem that
  // assembly scripts supports tuples.
  if (result == WasmResultValues.Ok) {
    return globalArrayBufferReference.toArrayBuffer()
  }
  return new ArrayBuffer(0);
}

/*
export function get_buffer_status(typ, length_ptr, flags_ptr) { return 0; },
export function http_call(uri_ptr, uri_size, header_pairs_ptr, header_pairs_size, body_ptr, body_size, trailer_pairs_ptr, trailer_pairs_size, timeout_milliseconds, token_ptr) { return 0; },
export function grpc_call(service_ptr, service_size, service_name_ptr, service_name_size, method_name_ptr, method_name_size, request_ptr, request_size, timeout_milliseconds, token_ptr) { return 0; },
export function grpc_stream(service_ptr, service_size, service_name_ptr, service_name_size, method_name_ptr, method_name_size, token_ptr) { return 0; },
export function grpc_cancel(token) { return 0; },
export function grpc_close(token) { return 0; },
export function grpc_send(token, message_ptr, message_size, end_stream) { return 0; },
export function define_metric(type, name_ptr, name_size, metric_id) { return 0; },
export function increment_metric(metric_id, offset) { return 0; },
export function record_metric(metric_id, value) { return 0; },
export function get_metric(metric_id, result) { return 0; },
*/

export function set_effective_context(effective_context_id: u32): WasmResult {
  return proxy_set_effective_context(effective_context_id);
}

export function done(): WasmResult { return proxy_done(); }
/////// runtime support


interface Context {
  readonly context_id : ArrayBuffer;
  readonly root_context:RootContext;


  onNewConnection():FilterStatusValues ;
  onDownstreamData(size:size_t,end: bool):FilterStatusValues ;
  onUpstreamData(size:size_t,end: bool):FilterStatusValues ;
  onDownstreamConnectionClose(t:PeerType):void;
  onUpstreamConnectionClose(t:PeerType):void;

  onRequestHeaders(a:uint32_t):FilterHeadersStatusValues;
  onRequestMetadata(a:uint32_t):FilterMetadataStatusValues;
  onRequestBody(body_buffer_length :size_t,end_of_stream: bool):FilterDataStatusValues;
  onRequestTrailers(a: uint32_t):FilterTrailersStatusValues;
  onResponseHeaders(a: uint32_t):FilterHeadersStatusValues;
  onResponseMetadata(a: uint32_t):FilterMetadataStatusValues;
  onResponseBody(body_buffer_length :size_t,end_of_stream: bool):FilterDataStatusValues;
  onResponseTrailers(a: uint32_t):FilterTrailersStatusValues;
  onDone():void; // Called when the stream has completed.
  onLog() :void;  // Called after onDone when logging is requested.


}
class ContextBase {
  readonly context_id : ArrayBuffer;
  readonly root_context:RootContext;


  onNewConnection():FilterStatusValues  { return FilterStatusValues.Continue; }
  onDownstreamData(size:size_t,end: bool):FilterStatusValues  { return FilterStatusValues.Continue; }
  onUpstreamData(size:size_t,end: bool):FilterStatusValues  { return FilterStatusValues.Continue; }
  onDownstreamConnectionClose(p:PeerType) :void{}
  onUpstreamConnectionClose(p:PeerType) :void{}

  onRequestHeaders(a:uint32_t):FilterHeadersStatusValues{ return FilterHeadersStatusValues.Continue; }
  onRequestMetadata(a:uint32_t):FilterMetadataStatusValues {
    return FilterMetadataStatusValues.Continue;
  }
  onRequestBody(body_buffer_length :size_t,end_of_stream: bool):FilterDataStatusValues {
    return FilterDataStatusValues.Continue;
  }
  onRequestTrailers(a: uint32_t):FilterTrailersStatusValues {
    return FilterTrailersStatusValues.Continue;
  }
  onResponseHeaders(a: uint32_t):FilterHeadersStatusValues { return FilterHeadersStatusValues.Continue; }
  onResponseMetadata(a: uint32_t):FilterMetadataStatusValues {
    return FilterMetadataStatusValues.Continue;
  }
  onResponseBody(body_buffer_length :size_t,end_of_stream: bool):FilterDataStatusValues {
    return FilterDataStatusValues.Continue;
  }
  onResponseTrailers(s:uint32_t) :FilterTrailersStatusValues{
    return FilterTrailersStatusValues.Continue;
  }
  onDone():void {} // Called when the stream has completed.
  onLog() :void {}  // Called after onDone when logging is requested.

}

interface RootContext {

  readonly root_id : ArrayBuffer;

  // Can be used to validate the configuration (e.g. in the control plane). Returns false if the
  // configuration is invalid.
  validateConfiguration(configuration_size: size_t):bool;
  // Called once when the VM loads and once when each hook loads and whenever configuration changes.
  // Returns false if the configuration is invalid.
  onConfigure(configuration_size: size_t):bool;
  // Called when each hook loads.  Returns false if the configuration is invalid.
  onStart(vm_configuration_size: size_t):bool;
  // Called when the timer goes off.
  onTick():void;

  onDone():bool; // Called when the VM is being torn down.
  done() : void; // Report that we are now done following returning false from onDone.
  createContext(context_id:u32): Context;
}

function getRootContext(root_context_id : u32) : RootContext {
  throw 123;
  //return new RootContext();
}

///// CALLS IN

// Calls in.
export function proxy_on_vm_start(root_context_id: uint32_t, configuration_size: uint32_t): uint32_t {
  throw 123;
  //getRootContext(root_context_id).onStart(configuration_size);
  return 0;
}
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
