// import {LogLevel, WasmResult, MetricType, PeerType, HeaderMapType, BufferType, BufferFlags} from "./exports";
import * as imports from "./imports";
import { free } from "./malloc";

import {
  proc_exit,
} from "bindings/wasi";

// abort function.
// use with:
// --use abort=index/abort_proc_exit
// compiler flag
// @ts-ignore: decorator
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
type size_t = usize;

function CHECK_RESULT(c: imports.WasmResult): void {
  if (c != WasmResultValues.Ok) {
    log(LogLevelValues.critical, c.toString());
    throw new Error(":(");
  }
}

/////////////// Access helpers

class Reference<T> {
  data: T;

  ptr(): usize {
    return changetype<usize>(this) + offsetof<Reference<T>>("data");
  }
}

class ArrayBufferReference {
  private buffer: usize;
  private size: usize;

  constructor() {
  }

  sizePtr(): usize {
    return changetype<usize>(this) + offsetof<ArrayBufferReference>("size");
  }
  bufferPtr(): usize {
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
let globalU32Ref = new Reference<u32>();
let globalU64Ref = new Reference<u64>();
let globalUsizeRef = new Reference<usize>();

class WasmData {
  data: ArrayBuffer;
  constructor() { }
}

class HeaderPair {
  key: ArrayBuffer;
  value: ArrayBuffer;
}

type Headers = Array<HeaderPair>;


export enum LogLevelValues { trace, debug, info, warn, error, critical };
export enum WasmResultValues {
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
export enum FilterStatusValues { Continue = 0, StopIteration = 1 }
export enum FilterHeadersStatusValues { Continue = 0, StopIteration = 1 }
export enum FilterMetadataStatusValues { Continue = 0 };
export enum FilterTrailersStatusValues { Continue = 0, StopIteration = 1 }
export enum FilterDataStatusValues {
  Continue = 0,
  StopIterationAndBuffer = 1,
  StopIterationAndWatermark = 2,
  StopIterationNoBuffer = 3
}
export enum GrpcStatusValues {
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
export enum MetricTypeValues {
  Counter = 0,
  Gauge = 1,
  Histogram = 2,
}
export enum PeerTypeValues {
  Unknown = 0,
  Local = 1,
  Remote = 2,
}
export enum HeaderMapTypeValues {
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
export enum BufferTypeValues {
  HttpRequestBody = 0,       // During the onLog callback these are immutable
  HttpResponseBody = 1,      // During the onLog callback these are immutable
  NetworkDownstreamData = 2, // During the onLog callback these are immutable
  NetworkUpstreamData = 3,   // During the onLog callback these are immutable
  HttpCallResponseBody = 4,  // Immutable
  GrpcReceiveBuffer = 5,     // Immutable
  MAX = 5,
}
export enum BufferFlagsValues {
  // These must be powers of 2.
  EndOfStream = 1,
}

/////////////////// wrappers below
/////////////////// these are the same as the imports above, but with more native typescript interface.

export function log(level: LogLevelValues, logMessage: string): void {
  // from the docs:
  // Like JavaScript, AssemblyScript stores strings in UTF-16 encoding represented by the API as UCS-2, 
  let buffer = String.UTF8.encode(logMessage);
  imports.proxy_log(level as imports.LogLevel, changetype<usize>(buffer), buffer.byteLength);
}

// temporarily exported the function for testing
export function get_configuration(): ArrayBuffer {
  CHECK_RESULT(imports.proxy_get_configuration(globalArrayBufferReference.bufferPtr(), globalArrayBufferReference.sizePtr()));
  let array = globalArrayBufferReference.toArrayBuffer();

  log(LogLevelValues.debug, String.UTF8.decode(array));
  return array;
}

class StatusWithData {
  status: u32;
  data: ArrayBuffer;
}

export function get_status(): StatusWithData {
  let status = globalU32Ref;
  CHECK_RESULT(imports.proxy_get_status(status.ptr(), globalArrayBufferReference.bufferPtr(), globalArrayBufferReference.sizePtr()));
  return { status: status.data, data: globalArrayBufferReference.toArrayBuffer() };
}

export function set_tick_period_milliseconds(millisecond: u32): void {
  CHECK_RESULT(imports.proxy_set_tick_period_milliseconds(millisecond));
}

export function get_current_time_nanoseconds(): u64 {
  // TODO: use global var?
  let nanos = globalU64Ref;
  CHECK_RESULT(imports.proxy_get_current_time_nanoseconds(nanos.ptr()));
  return nanos.data;
}

export function get_property(path: string): ArrayBuffer {
  let buffer = String.UTF8.encode(path);

  CHECK_RESULT(imports.proxy_get_property(changetype<usize>(buffer), buffer.byteLength, globalArrayBufferReference.bufferPtr(), globalArrayBufferReference.sizePtr()));
  return globalArrayBufferReference.toArrayBuffer();
}

export function set_property(path: string, data: ArrayBuffer): WasmResultValues {
  let buffer = String.UTF8.encode(path);
  return imports.proxy_set_property(changetype<usize>(buffer), buffer.byteLength, changetype<usize>(data), data.byteLength);
}

function pairsSize(headers: Headers): usize {
  let size = 4; // number of headers
  // for in loop doesn't seem to be supported..
  for (let i = 0; i < headers.length; i++) {
    let header = headers[i];
    size += 8;                   // size of key, size of value
    size += header.key.byteLength + 1;  // null terminated key
    size += header.value.byteLength + 1; // null terminated value
  }
  return size;
}

function serializeHeaders(headers: Headers): ArrayBuffer {
  let result = new ArrayBuffer(pairsSize(headers));
  let sizes = Uint32Array.wrap(result, 0, 1 + headers.length);
  sizes[0] = headers.length;

  // header sizes:
  let index = 1;

  // for in loop doesn't seem to be supported..
  for (let i = 0; i < headers.length; i++) {
    let header = headers[i];
    sizes[index] = header.key.byteLength;
    index++;
    sizes[index] = header.value.byteLength;
    index++;
  }

  let data = Uint8Array.wrap(result, sizes.byteLength);

  let currentOffset = 0;
  // for in loop doesn't seem to be supported..
  for (let i = 0; i < headers.length; i++) {
    let header = headers[i];
    // i'm sure there's a better way to copy, i just don't know what it is :/
    let wrappedKey = Uint8Array.wrap(header.key);
    let keyData = data.subarray(currentOffset, wrappedKey.byteLength);
    for (let i = 0; i < wrappedKey.byteLength; i++) {
      keyData[i] = wrappedKey[i];
    }
    currentOffset += wrappedKey.byteLength + 1; // + 1 for terminating nil


    let wrappedValue = Uint8Array.wrap(header.value);
    let valueData = data.subarray(currentOffset, wrappedValue.byteLength);
    for (let i = 0; i < wrappedValue.byteLength; i++) {
      valueData[i] = wrappedValue[i];
    }
    currentOffset += wrappedValue.byteLength + 1; // + 1 for terminating nil
  }
  return result;
}


function deserializeHeaders(headers: ArrayBuffer): Headers {
  let numheaders = Uint32Array.wrap(headers, 0, 1)[0];
  let sizes = Uint32Array.wrap(headers, sizeof<u32>(), 2 * numheaders);
  let data = headers.slice(sizeof<u32>() * (1 + 2 * numheaders));
  let result : Headers = [];
  let sizeIndex = 0;
  let dataIndex = 0;
  // for in loop doesn't seem to be supported..
  for (let i = 0; i < numheaders; i++) {
    let keySize = sizes[sizeIndex];
    sizeIndex++;
    let header_key_data = data.slice(dataIndex, dataIndex + keySize);
    dataIndex += keySize + 1; // +1 for nil termination.

    let valueSize = sizes[sizeIndex];
    sizeIndex++;
    let header_value_data = data.slice(dataIndex, dataIndex + valueSize);
    dataIndex += valueSize + 1; // +1 for nil termination.

    let pair = new HeaderPair();
    pair.key = header_key_data;
    pair.value = header_value_data;
    result.push(pair);
  }

  return result;
}

export function continue_request(): WasmResultValues { return imports.proxy_continue_request(); }
export function continue_response(): WasmResultValues { return imports.proxy_continue_response(); }
export function send_local_response(response_code: u32, response_code_details: string, body: ArrayBuffer,
  additional_headers: Headers, grpc_status: GrpcStatusValues): WasmResultValues {
  let response_code_details_buffer = String.UTF8.encode(response_code_details);
  let headers = serializeHeaders(additional_headers);
  return imports.proxy_send_local_response(response_code, changetype<usize>(response_code_details_buffer), response_code_details_buffer.byteLength,
    changetype<usize>(body), body.byteLength, changetype<usize>(headers), headers.byteLength, grpc_status);
}


export function clear_route_cache(): WasmResultValues { return imports.proxy_clear_route_cache(); }
/*
export function get_shared_data(key_ptr, key_size, value_ptr, value_size, cas) { return 0; },
export function set_shared_data(key_ptr, key_size, value_ptr, value_size, cas) { return 0; },
export function register_shared_queue(queue_name_ptr, queue_name_size, token) { return 0; },
export function resolve_shared_queue(vm_id, vm_id_size, queue_name_ptr, queue_name_size, token) { return 0; },
export function dequeue_shared_queue(token, data_ptr, data_size) { return 0; },
export function enqueue_shared_queue(token, data_ptr, data_size) { return 0; },
*/
export function add_header_map_value(typ: HeaderMapTypeValues, key: ArrayBuffer, value: ArrayBuffer): WasmResultValues {
  return imports.proxy_add_header_map_value(typ, changetype<usize>(key), key.byteLength, changetype<usize>(value), value.byteLength);
}
export function add_header_map_value_string(typ: HeaderMapTypeValues, key: string, value: string): WasmResultValues {
  let key_arr = String.UTF8.encode(key);
  let value_arr = String.UTF8.encode(value);
  return imports.proxy_add_header_map_value(typ, changetype<usize>(key_arr), key_arr.byteLength, changetype<usize>(value_arr), value_arr.byteLength);
}
export function get_header_map_value(typ: HeaderMapTypeValues, key: ArrayBuffer): ArrayBuffer {
  let result = imports.proxy_get_header_map_value(typ, changetype<usize>(key), key.byteLength, globalArrayBufferReference.bufferPtr(), globalArrayBufferReference.sizePtr());
  if (result == WasmResultValues.Ok) {
    return globalArrayBufferReference.toArrayBuffer()
  }
  return new ArrayBuffer(0);
}
function get_header_map_flat_pairs(typ: HeaderMapTypeValues): ArrayBuffer {
  let result = imports.proxy_get_header_map_pairs(typ, globalArrayBufferReference.bufferPtr(), globalArrayBufferReference.sizePtr());
  if (result == WasmResultValues.Ok) {
    return globalArrayBufferReference.toArrayBuffer()
  }
  return new ArrayBuffer(0);
}
export function get_header_map_pairs(typ: HeaderMapTypeValues): Headers { throw new Error('un impl yet'); }
export function set_header_map_flat_pairs(typ: HeaderMapTypeValues, flat_headers: ArrayBuffer): void {
  CHECK_RESULT(imports.proxy_set_header_map_pairs(typ, changetype<usize>(flat_headers), flat_headers.byteLength));
}
export function set_header_map_pairs(typ: HeaderMapTypeValues, headers: Headers): void {
  let flat_headers = serializeHeaders(headers);
  set_header_map_flat_pairs(typ, flat_headers);
}
export function replace_header_map_value(typ: HeaderMapTypeValues, key: ArrayBuffer, value: ArrayBuffer): void {
  CHECK_RESULT(imports.proxy_replace_header_map_value(typ, changetype<usize>(key), key.byteLength, changetype<usize>(value), value.byteLength));
}
export function remove_header_map_value(typ: HeaderMapTypeValues, key: ArrayBuffer): void {
  CHECK_RESULT(imports.proxy_remove_header_map_value(typ, changetype<usize>(key), key.byteLength));
}
export function get_header_map_size(typ: HeaderMapTypeValues): usize {
  let status = globalUsizeRef;
  CHECK_RESULT(imports.proxy_get_header_map_size(typ, status.ptr()));
  return status.data;
}
// unclear if start and length are 64 or 32
export function get_buffer_bytes(typ: BufferTypeValues, start: u32, length: u32): ArrayBuffer {
  let result = imports.proxy_get_buffer_bytes(typ, start, length, globalArrayBufferReference.bufferPtr(), globalArrayBufferReference.sizePtr());
  // TODO: return the result as well. not sure what the best way to do this as it doesn't seem that
  // assembly scripts supports tuples.
  if (result == WasmResultValues.Ok) {
    return globalArrayBufferReference.toArrayBuffer()
  }
  return new ArrayBuffer(0);
}

// returning tuples is not supported.
class BufferStatusResult {
  result: WasmResultValues;
  length: usize;
  flags: u32;
}

export function get_buffer_status(typ: BufferTypeValues): BufferStatusResult {
  let length_ptr = globalUsizeRef;
  let flags_ptr = globalU32Ref;
  let result = imports.proxy_get_buffer_status(typ, length_ptr.ptr(), flags_ptr.ptr());
  let resultTuple = new BufferStatusResult();
  resultTuple.result = result;
  if (result == WasmResultValues.Ok) {
    resultTuple.length = length_ptr.data;
    resultTuple.flags = flags_ptr.data;
    return resultTuple;
  }
  return resultTuple;
}


/*
export function grpc_call(service_ptr, service_size, service_name_ptr, service_name_size, method_name_ptr, method_name_size, request_ptr, request_size, timeout_milliseconds, token_ptr) { return 0; },
export function grpc_stream(service_ptr, service_size, service_name_ptr, service_name_size, method_name_ptr, method_name_size, token_ptr) { return 0; },
export function grpc_cancel(token) { return 0; },
export function grpc_close(token) { return 0; },
export function grpc_send(token, message_ptr, message_size, end_stream) { return 0; },
*/


class MetricResult {
  result: WasmResultValues;
  metric_id: u32;
}

export function define_metric(typ: MetricTypeValues, name: string): MetricResult {
  let metric_id = globalU32Ref;
  let nameutf8 = String.UTF8.encode(name);
  let res = imports.proxy_define_metric(typ, changetype<usize>(nameutf8), nameutf8.byteLength, metric_id.ptr());
  let result = new MetricResult();
  result.result = res;
  if (res == WasmResultValues.Ok) {
    result.metric_id = metric_id.data;
  }
  return result;
}

export function increment_metric(metric_id: u32, offset: i64): WasmResultValues {
  return imports.proxy_increment_metric(metric_id, offset);
}
export function record_metric(metric_id: u32, value: u64): WasmResultValues {
  return imports.proxy_record_metric(metric_id, value);
}

class MetricData {
  result: WasmResultValues;
  data: u64;
}

export function get_metric(metric_id: u32): MetricData {
  let metric_data = globalU64Ref;
  let res = imports.proxy_record_metric(metric_id, metric_data.ptr());
  let result = new MetricData();
  result.result = res;
  if (res == WasmResultValues.Ok) {
    result.data = metric_data.data;
  }
  return result;
}

export function set_effective_context(effective_context_id: u32): WasmResultValues {
  return imports.proxy_set_effective_context(effective_context_id);
}

export function done(): WasmResultValues { return imports.proxy_done(); }
/////// runtime support

export abstract class BaseContext {
  // abstract createContext(context_id:u32):Context;
}

// we have to use a wrapper as asm script doesn't support closures just yet.
class HttpCallback {
  ctx: Context;
  cb: (c: Context) => void;
  constructor(ctx: Context, cb: (c: Context) => void) {
    this.ctx = ctx;
    this.cb = cb;
  }
}

export abstract class RootContext extends BaseContext {
  // hack to workaround lack of OOP
  validateConfiguration_: (thiz: RootContext, configuration_size: size_t) => bool;
  onConfigure_: (thiz: RootContext, configuration_size: size_t) => bool;
  onStart_: (thiz: RootContext, vm_configuration_size: size_t) => bool;
  onTick_: (thiz: RootContext) => void;
  onDone_: (thiz: RootContext) => bool;
  done_: (thiz: RootContext) => void;
  createContext_: (thiz: RootContext) => Context;

  private http_calls_: Map<u32, HttpCallback>;

  constructor() {
    super();
    this.http_calls_ = new Map<u32, HttpCallback>();
    this.validateConfiguration_ = (thiz: RootContext, configuration_size: size_t) => { return thiz.validateConfiguration(configuration_size); };
    this.onConfigure_ = (thiz: RootContext, configuration_size: size_t) => { return thiz.onConfigure(configuration_size); };
    this.onStart_ = (thiz: RootContext, vm_configuration_size: size_t) => { return thiz.onStart(vm_configuration_size); };
    this.onTick_ = (thiz: RootContext) => { thiz.onTick(); };
    this.onDone_ = (thiz: RootContext) => { return thiz.onDone(); };
    this.done_ = (thiz: RootContext) => { thiz.done(); };
    this.createContext_ = (thiz: RootContext) => { return thiz.createContext(); };
  }

  // Can be used to validate the configuration (e.g. in the control plane). Returns false if the
  // configuration is invalid.
  validateConfiguration(configuration_sizeconfiguration_size: size_t): bool { return true; }
  // Called once when the VM loads and once when each hook loads and whenever configuration changes.
  // Returns false if the configuration is invalid.
  onConfigure(configuration_size: size_t): bool { return true; }
  // Called when each hook loads.  Returns false if the configuration is invalid.
  onStart(vm_configuration_size: size_t): bool { return true; }
  // Called when the timer goes off.
  onTick(): void { }
  onDone(): bool { return true; } // Called when the VM is being torn down.
  done(): void { } // Report that we are now done following returning false from onDone.
  createContext(): Context {
    log(LogLevelValues.critical, "base ctx: can't create context")
    throw 123;
  }

  httpCall(uri: string, headers: Headers, body: ArrayBuffer, trailers: Headers,
    timeout_milliseconds: u32, ctx: Context, cb: (c: Context) => void): WasmResultValues {

    let buffer = String.UTF8.encode(uri);
    let header_pairs = serializeHeaders(headers);
    let trailer_pairs = serializeHeaders(trailers);
    let token = globalU32Ref;
    let result = imports.proxy_http_call(changetype<usize>(buffer), buffer.byteLength, changetype<usize>(header_pairs), header_pairs.byteLength, changetype<usize>(body), body.byteLength, changetype<usize>(trailer_pairs), trailer_pairs.byteLength, timeout_milliseconds, token.ptr());
    if (result == WasmResultValues.Ok) {
      this.http_calls_[token.data] = new HttpCallback(ctx, cb);
    }
    return result;
  }
  onHttpCallResponse(token: u32, headers: u32, body_size: u32, trailers: u32): void {
    if (this.http_calls_.has(token)) {
      let callback = this.http_calls_.get(token);
      this.http_calls_.delete(token);
      callback.cb(callback.ctx);
    }
  }
}

export class Context {
  readonly context_id: u32;
  readonly root_context: RootContext;

  onNewConnection_: (thiz: Context) => FilterStatusValues;
  onDownstreamData_: (thiz: Context, size: size_t, end: bool) => FilterStatusValues;
  onUpstreamData_: (thiz: Context, size: size_t, end: bool) => FilterStatusValues;
  onDownstreamConnectionClose_: (thiz: Context, t: PeerTypeValues) => void;
  onUpstreamConnectionClose_: (thiz: Context, t: PeerTypeValues) => void;
  onRequestHeaders_: (thiz: Context, a: u32) => FilterHeadersStatusValues;
  onRequestMetadata_: (thiz: Context, a: u32) => FilterMetadataStatusValues;
  onRequestBody_: (thiz: Context, body_buffer_length: size_t, end_of_stream: bool) => FilterDataStatusValues;
  onRequestTrailers_: (thiz: Context, a: u32) => FilterTrailersStatusValues;
  onResponseHeaders_: (thiz: Context, a: u32) => FilterHeadersStatusValues;
  onResponseMetadata_: (thiz: Context, a: u32) => FilterMetadataStatusValues;
  onResponseBody_: (thiz: Context, body_buffer_length: size_t, end_of_stream: bool) => FilterDataStatusValues;
  onResponseTrailers_: (thiz: Context, s: u32) => FilterTrailersStatusValues;
  onDone_: (thiz: Context) => void;
  onLog_: (thiz: Context) => void;



  constructor() {
    this.onNewConnection_ = (thiz: Context) => { return thiz.onNewConnection(); }
    this.onDownstreamData_ = (thiz: Context, size: size_t, end: bool) => { return thiz.onDownstreamData(size, end); }
    this.onUpstreamData_ = (thiz: Context, size: size_t, end: bool) => { return thiz.onUpstreamData(size, end); }
    this.onDownstreamConnectionClose_ = (thiz: Context, t: PeerTypeValues) => { thiz.onDownstreamConnectionClose(t); }
    this.onUpstreamConnectionClose_ = (thiz: Context, t: PeerTypeValues) => { thiz.onUpstreamConnectionClose(t); }
    this.onRequestHeaders_ = (thiz: Context, a: u32) => { return thiz.onRequestHeaders(a); }
    this.onRequestMetadata_ = (thiz: Context, a: u32) => { return thiz.onRequestMetadata(a); }
    this.onRequestBody_ = (thiz: Context, body_buffer_length: size_t, end_of_stream: bool) => { return thiz.onRequestBody(body_buffer_length, end_of_stream); }
    this.onRequestTrailers_ = (thiz: Context, a: u32) => { return thiz.onRequestTrailers(a); }
    this.onResponseHeaders_ = (thiz: Context, a: u32) => { return thiz.onResponseHeaders(a); }
    this.onResponseMetadata_ = (thiz: Context, a: u32) => { return thiz.onResponseMetadata(a); }
    this.onResponseBody_ = (thiz: Context, body_buffer_length: size_t, end_of_stream: bool) => { return thiz.onResponseBody(body_buffer_length, end_of_stream); }
    this.onResponseTrailers_ = (thiz: Context, s: u32) => { return thiz.onResponseTrailers(s); }
    this.onDone_ = (thiz: Context) => { thiz.onDone(); }
    this.onLog_ = (thiz: Context) => { thiz.onLog(); }
  }

  onNewConnection(): FilterStatusValues { return FilterStatusValues.Continue; }
  onDownstreamData(size: size_t, end: bool): FilterStatusValues { return FilterStatusValues.Continue; }
  onUpstreamData(size: size_t, end: bool): FilterStatusValues { return FilterStatusValues.Continue; }
  onDownstreamConnectionClose(t: PeerTypeValues): void { }
  onUpstreamConnectionClose(t: PeerTypeValues): void { }

  onRequestHeaders(a: u32): FilterHeadersStatusValues { return FilterHeadersStatusValues.Continue }
  onRequestMetadata(a: u32): FilterMetadataStatusValues { return FilterMetadataStatusValues.Continue }
  onRequestBody(body_buffer_length: size_t, end_of_stream: bool): FilterDataStatusValues { return FilterDataStatusValues.Continue }
  onRequestTrailers(a: u32): FilterTrailersStatusValues { return FilterTrailersStatusValues.Continue }
  onResponseHeaders(a: u32): FilterHeadersStatusValues { return FilterHeadersStatusValues.Continue }
  onResponseMetadata(a: u32): FilterMetadataStatusValues { return FilterMetadataStatusValues.Continue }
  onResponseBody(body_buffer_length: size_t, end_of_stream: bool): FilterDataStatusValues { return FilterDataStatusValues.Continue }
  onResponseTrailers(s: u32): FilterTrailersStatusValues { return FilterTrailersStatusValues.Continue }
  onDone(): void { } // Called when the stream has completed.
  onLog(): void { }  // Called after onDone when logging is requested.
}

function get_plugin_root_id(): string {

  let root_id = get_property("plugin_root_id");
  if (root_id.byteLength == 0) {
    return "";
  }
  return String.UTF8.decode(root_id);
}

let root_context_map = new Map<u32, RootContext>();
export function ensureRootContext(root_context_id: u32): RootContext {
  if (root_context_map.has(root_context_id)) {
    return root_context_map[root_context_id];
  }
  let root_id = get_plugin_root_id();
  if (root_factory.has(root_id)) {
    let root_context_func = root_factory.get(root_id);
    let root_context = root_context_func();
    root_context_map[root_context_id] = root_context;

    log(LogLevelValues.warn, "returning context for " + root_id);
    return root_context;
  }

  log(LogLevelValues.warn, "did not find root id " + root_id)

  let root_context = new RootContext();
  root_context_map[root_context_id] = root_context;
  return root_context;
}

let root_factory = new Map<string, () => RootContext>();
let context_map = new Map<u32, Context>();

export function getContext(context_id: u32): Context {
  return context_map[context_id];
}
export function getRootContext(context_id: u32): RootContext {
  return root_context_map[context_id];
}

export function ensureContext(context_id: u32, root_context_id: u32): Context {
  if (context_map.has(context_id)) {
    return context_map[context_id];
  }
  let root_context = root_context_map[root_context_id];

  //  if (context_factory.has(root_context.root_id)) {
  // let factory = context_factory.get(root_context.root_id);
  // let context = factory(root_context);
  let context = root_context.createContext_(root_context);
  context_map[context_id] = context;
  return context;
  //   } 

  log(LogLevelValues.warn, "ensureContext: did not find root id " + root_context.root_id)
  //  let context = new Context();
  //  context_map[context_id] = context;
  //  return context;
  //return new RootContext();
}

let context_factory = new Map<string, (r: RootContext) => Context>();

export class RootContextHelper<T extends RootContext> extends RootContext {
  static wrap<T extends RootContext>(that: T): RootContext {
    return new RootContextHelper<T>(that);
  }
  that: T;
  constructor(that: T) {
    super();
    // OOP HACK
    this.createContext_ = (thiz: RootContext) => { return (thiz as RootContextHelper<T>).that.createContext(); };
  }
}


export class ContextHelper<T extends Context> extends Context {
  static wrap<T extends Context>(that: T): Context {
    return new ContextHelper<T>(that);
  }
  that: T;
  constructor(that: T) {
    super();
    // OOP HACK
    this.onResponseHeaders_ = (thiz: Context, a: u32) => { return (thiz as ContextHelper<T>).that.onResponseHeaders(a); }
  }
}

export function registerRootContext(c: () => RootContext, name: string): void {
  root_factory.set(name, c);
}