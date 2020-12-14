// import {LogLevel, WasmResult, MetricType, PeerType, HeaderMapType, BufferType, BufferFlags} from "./exports";
import * as imports from "./imports";
import { free } from "./malloc";
import { proc_exit } from "bindings/wasi_unstable";


// abort function.
// use with:
// --use abort=index/abort_proc_exit
// compiler flag
// @ts-ignore: decorator
@global
export function abort_proc_exit(message: string | null, fileName: string | null, lineNumber: u32, columnNumber: u32): void {
  let logMessage = "";
  if (message !== null) {
    logMessage += message.toString();
  }
  if (fileName !== null) {
    logMessage += " at: " + fileName.toString() + "(" + lineNumber.toString() + ":" + columnNumber.toString() + ")";
  }
  log(LogLevelValues.critical, logMessage);
  proc_exit(255);
}

function CHECK_RESULT(c: imports.WasmResult): void {
  if (c != WasmResultValues.Ok) {
    log(LogLevelValues.critical, c.toString());
    throw new Error(":(");
  }
}

/////////////// Access helpers

export class Reference<T> {
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
    // should we return a this sliced up to size?
    return array;
  }
}

var globalArrayBufferReference = new ArrayBufferReference();
let globalU32Ref = new Reference<u32>();
let globalLogLevelRef = new Reference<imports.LogLevel>();
let globalU64Ref = new Reference<u64>();
let globalUsizeRef = new Reference<usize>();

export class HeaderPair {
  key: ArrayBuffer;
  value: ArrayBuffer;

  toString(): string {
    return this.key.toString() + ":" + this.value.toString();
  }

  constructor(header_key_data: ArrayBuffer, header_value_data: ArrayBuffer) {
    this.key = header_key_data;
    this.value = header_value_data;
  }
}

export type Headers = Array<HeaderPair>;


export enum LogLevelValues { trace, debug, info, warn, error, critical }
export enum FilterStatusValues { Continue = 0, StopIteration = 1 }
export enum FilterHeadersStatusValues {
  Continue = 0,
  StopIteration = 1,
  ContinueAndEndStream = 2,
  StopAllIterationAndBuffer = 3,
  StopAllIterationAndWatermark = 4,
}
export enum FilterMetadataStatusValues { Continue = 0 }
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

export enum WasmResultValues {
  Ok = 0,
  // The result could not be found, e.g. a provided key did not appear in a
  // table.
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
  // Feature not implemented.
  Unimplemented = 12,
}

export enum HeaderMapTypeValues {
  RequestHeaders = 0,   // During the onLog callback these are immutable
  RequestTrailers = 1,  // During the onLog callback these are immutable
  ResponseHeaders = 2,  // During the onLog callback these are immutable
  ResponseTrailers = 3, // During the onLog callback these are immutable
  GrpcReceiveInitialMetadata = 4,  // Immutable
  GrpcReceiveTrailingMetadata = 5, // Immutable
  HttpCallResponseHeaders = 6,     // Immutable
  HttpCallResponseTrailers = 7,    // Immutable
  MAX = 7,
}
export enum BufferTypeValues {
  HttpRequestBody = 0,       // During the onLog callback these are immutable
  HttpResponseBody = 1,      // During the onLog callback these are immutable
  NetworkDownstreamData = 2, // During the onLog callback these are immutable
  NetworkUpstreamData = 3,   // During the onLog callback these are immutable
  HttpCallResponseBody = 4,  // Immutable
  GrpcReceiveBuffer = 5,     // Immutable
  VmConfiguration = 6,       // Immutable
  PluginConfiguration = 7,   // Immutable
  CallData = 8,              // Immutable
  MAX = 8,
}
export enum BufferFlagsValues {
  // These must be powers of 2.
  EndOfStream = 1,
}
export enum StreamTypeValues {
  Request = 0,
  Response = 1,
  Downstream = 2,
  Upstream = 3,
  MAX = 3,
}

/////////////////// wrappers below
/////////////////// these are the same as the imports above, but with more native typescript interface.

export function log(level: LogLevelValues, logMessage: string): void {
  // from the docs:
  // Like JavaScript, AssemblyScript stores strings in UTF-16 encoding represented by the API as UCS-2, 
  let buffer = String.UTF8.encode(logMessage);
  imports.proxy_log(level as imports.LogLevel, changetype<usize>(buffer), buffer.byteLength);
}

export function logLevel(): LogLevelValues {
  let level = globalLogLevelRef;
  CHECK_RESULT(imports.proxy_get_log_level(level.ptr()));
  return level.data;
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

function pairsSize(headers: Headers): i32 {
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
  let sizes = Uint32Array.wrap(result, 0, 1 + 2 * headers.length);
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
    let keyData = data.subarray(currentOffset, currentOffset + wrappedKey.byteLength);
    for (let i = 0; i < wrappedKey.byteLength; i++) {
      keyData[i] = wrappedKey[i];
    }
    currentOffset += wrappedKey.byteLength + 1; // + 1 for terminating nil

    let wrappedValue = Uint8Array.wrap(header.value);
    let valueData = data.subarray(currentOffset, currentOffset + wrappedValue.byteLength);
    for (let i = 0; i < wrappedValue.byteLength; i++) {
      valueData[i] = wrappedValue[i];
    }
    currentOffset += wrappedValue.byteLength + 1; // + 1 for terminating nil
  }
  return result;
}

function deserializeHeaders(headers: ArrayBuffer): Headers {
  if (headers.byteLength == 0) {
    return [];
  }
  let numheaders = Uint32Array.wrap(headers, 0, 1)[0];
  let sizes = Uint32Array.wrap(headers, sizeof<u32>(), 2 * numheaders);
  let data = headers.slice(sizeof<u32>() * (1 + 2 * numheaders));
  let result: Headers = [];
  let sizeIndex = 0;
  let dataIndex = 0;
  // for in loop doesn't seem to be supported..
  for (let i: u32 = 0; i < numheaders; i++) {
    let keySize = sizes[sizeIndex];
    sizeIndex++;
    let header_key_data = data.slice(dataIndex, dataIndex + keySize);
    dataIndex += keySize + 1; // +1 for nil termination.

    let valueSize = sizes[sizeIndex];
    sizeIndex++;
    let header_value_data = data.slice(dataIndex, dataIndex + valueSize);
    dataIndex += valueSize + 1; // +1 for nil termination.

    let pair = new HeaderPair(header_key_data, header_value_data);
    result.push(pair);
  }

  return result;
}

export function continue_request(): WasmResultValues { return imports.proxy_continue_stream(StreamTypeValues.Request); }
export function continue_response(): WasmResultValues { return imports.proxy_continue_stream(StreamTypeValues.Response); }
export function send_local_response(response_code: u32, response_code_details: string, body: ArrayBuffer,
  additional_headers: Headers, grpc_status: GrpcStatusValues): WasmResultValues {
  let response_code_details_buffer = String.UTF8.encode(response_code_details);
  let headers = serializeHeaders(additional_headers);
  return imports.proxy_send_local_response(response_code, changetype<usize>(response_code_details_buffer), response_code_details_buffer.byteLength,
    changetype<usize>(body), body.byteLength, changetype<usize>(headers), headers.byteLength, grpc_status);
}


export function clear_route_cache(): WasmResultValues { return imports.proxy_clear_route_cache(); }

export function get_shared_data(key: string, value: ArrayBuffer/*, cas*/): WasmResultValues {
  const key_buffer = String.UTF8.encode(key);
  let dummy = globalUsizeRef;
  return imports.proxy_get_shared_data(changetype<usize>(key_buffer), key_buffer.byteLength, changetype<usize>(value), value.byteLength, dummy.ptr());
}

class SetSharedData {
  value: ArrayBuffer;
  result: WasmResultValues;
}
export function set_shared_data(key: string/*, cas*/): SetSharedData {
  const key_buffer = String.UTF8.encode(key);
  let dummy = globalUsizeRef;
  let value = globalArrayBufferReference;
  let result = new SetSharedData();
  result.result = imports.proxy_set_shared_data(changetype<usize>(key_buffer), key_buffer.byteLength, value.bufferPtr(), value.sizePtr(), dummy.ptr())
  if (result.result == WasmResultValues.Ok) {
    result.value = value.toArrayBuffer();
  }
  return result;
}

export function register_shared_queue(queue_name: string, token: u32): WasmResultValues {
  let queue_name_buffer = String.UTF8.encode(queue_name);
  return imports.proxy_register_shared_queue(changetype<usize>(queue_name_buffer), queue_name_buffer.byteLength, token);
}

export function resolve_shared_queue(vm_id: string, queue_name: string, token: u32): WasmResultValues {
  let vm_id_buffer = String.UTF8.encode(vm_id);
  let queue_name_buffer = String.UTF8.encode(queue_name);
  return imports.proxy_resolve_shared_queue(changetype<usize>(vm_id_buffer), vm_id_buffer.byteLength,
    changetype<usize>(queue_name_buffer), queue_name_buffer.byteLength, token);
}

class DequeueSharedQueueResult {
  result: WasmResultValues;
  data: ArrayBuffer;
}
export function dequeue_shared_queue(token: u32): DequeueSharedQueueResult {
  let result = new DequeueSharedQueueResult();

  let data = globalArrayBufferReference;

  let res = imports.proxy_dequeue_shared_queue(token, data.bufferPtr(), data.sizePtr());
  result.result = res;
  if (res == WasmResultValues.Ok) {
    result.data = data.toArrayBuffer();
  }
  return result;
}

export function enqueue_shared_queue(token: u32, data: ArrayBuffer): WasmResultValues {
  return imports.proxy_enqueue_shared_queue(token, changetype<usize>(data), data.byteLength);
}

export function add_header_map_value(typ: HeaderMapTypeValues, key: ArrayBuffer, value: ArrayBuffer): WasmResultValues {
  return imports.proxy_add_header_map_value(typ, changetype<usize>(key), key.byteLength, changetype<usize>(value), value.byteLength);
}
export function add_header_map_value_string(typ: HeaderMapTypeValues, key: string, value: string): WasmResultValues {
  let key_arr = String.UTF8.encode(key);
  let value_arr = String.UTF8.encode(value);
  return imports.proxy_add_header_map_value(typ, changetype<usize>(key_arr), key_arr.byteLength, changetype<usize>(value_arr), value_arr.byteLength);
}

class HeaderStreamManipulator {
  typ: HeaderMapTypeValues;
  constructor(typ: HeaderMapTypeValues) {
    this.typ = typ;
  }


  /**
   * Add a header.
   * @param key the header name.
   * @param value the header value.
   */
  add(key: string, value: string): void {
    add_header_map_value_string(this.typ, key, value);
  }

  /**
   * Replace a header.
   * @param key the header name.
   * @param value the header value.
   */
  replace(key: string, value: string): void {
    replace_header_map_value_string(this.typ, key, value);
  }

  /**
   * Get a header.
   * @param key the header name.
   * @return the header value.
   */
  get(key: string): string {
    return get_header_map_value_string(this.typ, key);
  }
  /**
   * Remove a header.
   * @param key the header name.
   */
  remove(key: string): void {
    remove_header_map_value_string(this.typ, key);
  }
  /**
   * get all headers.
   */
  get_headers(): Headers {
    return get_header_map_pairs(this.typ);
  }

  /**
   * set all headers.
   */
  set_headers(headers: Headers): void {
    return set_header_map_pairs(this.typ, headers);
  }

}

/**
 * Manipulate request and response headers.
 * Note that request header manipulation will only have effect before the request goes upstream.
 * Response header manipulation can happen only after the response was started and before it 
 * was sent downstream.
 */
class HeaderMapManipulator {
  request: HeaderStreamManipulator;
  response: HeaderStreamManipulator;
  http_callback: HeaderStreamManipulator;
  constructor(request: HeaderStreamManipulator, response: HeaderStreamManipulator, http_callback: HeaderStreamManipulator) {
    this.request = request;
    this.response = response;
    this.http_callback = http_callback;
  }
}

/**
 * Methods to manipulate the current stream. No need to instantiate this class. use the global
 * stream_context variable.
 */
class StreamContext {
  headers: HeaderMapManipulator;
  trailers: HeaderMapManipulator;
  constructor(headers: HeaderMapManipulator, trailers: HeaderMapManipulator) {
    this.headers = headers;
    this.trailers = trailers;
  }
}

/**
 * Use this variable to manipulate the current stream.
 */
export var stream_context = new StreamContext(
  new HeaderMapManipulator(new HeaderStreamManipulator(HeaderMapTypeValues.RequestHeaders), new HeaderStreamManipulator(HeaderMapTypeValues.ResponseHeaders), new HeaderStreamManipulator(HeaderMapTypeValues.HttpCallResponseHeaders)),
  new HeaderMapManipulator(new HeaderStreamManipulator(HeaderMapTypeValues.RequestTrailers), new HeaderStreamManipulator(HeaderMapTypeValues.ResponseTrailers), new HeaderStreamManipulator(HeaderMapTypeValues.HttpCallResponseTrailers)));


function get_header_map_value_string(typ: HeaderMapTypeValues, key: string): string {
  const key_buffer = String.UTF8.encode(key);
  let result = get_header_map_value(typ, key_buffer);
  return String.UTF8.decode(result);
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

function get_header_map_pairs(typ: HeaderMapTypeValues): Headers {
  let pairs = get_header_map_flat_pairs(typ);
  return deserializeHeaders(pairs);
}

function set_header_map_flat_pairs(typ: HeaderMapTypeValues, flat_headers: ArrayBuffer): void {
  CHECK_RESULT(imports.proxy_set_header_map_pairs(typ, changetype<usize>(flat_headers), flat_headers.byteLength));
}

function set_header_map_pairs(typ: HeaderMapTypeValues, headers: Headers): void {
  let flat_headers = serializeHeaders(headers);
  set_header_map_flat_pairs(typ, flat_headers);
}

export function replace_header_map_value_string(typ: HeaderMapTypeValues, key: string, value: string): void {
  let key_arr = String.UTF8.encode(key);
  let value_arr = String.UTF8.encode(value);
  replace_header_map_value(typ, key_arr, value_arr);
}

export function replace_header_map_value(typ: HeaderMapTypeValues, key: ArrayBuffer, value: ArrayBuffer): void {
  CHECK_RESULT(imports.proxy_replace_header_map_value(typ, changetype<usize>(key), key.byteLength, changetype<usize>(value), value.byteLength));
}

export function remove_header_map_value_string(typ: HeaderMapTypeValues, key: string): void {
  let key_arr = String.UTF8.encode(key);
  remove_header_map_value(typ, key_arr);
}

export function remove_header_map_value(typ: HeaderMapTypeValues, key: ArrayBuffer): void {
  CHECK_RESULT(imports.proxy_remove_header_map_value(typ, changetype<usize>(key), key.byteLength));
}
export function get_header_map_size(typ: HeaderMapTypeValues): usize {
  let size = globalUsizeRef;
  CHECK_RESULT(imports.proxy_get_header_map_size(typ, size.ptr()));
  return size.data;
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

class Metric {
  metric_id: u32;

  constructor(typ: MetricTypeValues, name: string) {
    let metric_res = define_metric(typ, name);
    if (metric_res.result != WasmResultValues.Ok) {
      throw new Error("can't define metric")
    }
    this.metric_id = metric_res.metric_id;
  }
}

export class Gauge extends Metric {

  constructor(name: string) {
    super(MetricTypeValues.Gauge, name);
  }

  increment(offset: i64): WasmResultValues {
    return imports.proxy_increment_metric(this.metric_id, offset);
  }
  record(metric_id: u32, value: u64): WasmResultValues {
    return imports.proxy_record_metric(metric_id, value);
  }
}

export class Histogram extends Metric {
  constructor(name: string) {
    super(MetricTypeValues.Histogram, name);
  }

  increment(offset: i64): WasmResultValues {
    return imports.proxy_increment_metric(this.metric_id, offset);
  }
  record(metric_id: u32, value: u64): WasmResultValues {
    return imports.proxy_record_metric(metric_id, value);
  }
}

export class Counter extends Metric {
  constructor(name: string) {
    super(MetricTypeValues.Counter, name);
  }

  increment(offset: u32): WasmResultValues {
    return imports.proxy_increment_metric(this.metric_id, offset);
  }
}

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

export function done(): WasmResultValues { return imports.proxy_done(); }

//Only exporting this function while we are still working on the http call support. 
//Once we decided how to read http response headers and pass those to the callback function, 
// we should remove this export and make sure this proxy call is only made thru BaseContext.setEffectiveContext().
export function proxy_set_effective_context(_id: u32): WasmResultValues {
  const result = imports.proxy_set_effective_context(_id);
  if (result != WasmResultValues.Ok) {
    log(LogLevelValues.critical, "Unable to set effective context: " + _id.toString() + " with result: " + result.toString());
  }
  return result;
}
/////// runtime support

/**
 * Sets the effective context id to this context. this is useful for example if you receive an
 * http call in a RootContext, and want to modify headers based on the response in a regular 
 * Context. You then will call `setEffectiveContext(_id)` so that the header manipulation will
 * occur in the request context and not in the root context.
 * @param _id 
 */
function setEffectiveContext(_id: u32): WasmResultValues {
  return proxy_set_effective_context(_id);
}

/**
 * BaseContexts contains things that are common to RootContext and Context.
 */
export abstract class BaseContext {
  context_id: u32;

  constructor(context_id_: u32) {
    this.context_id = context_id_;
  }

  continueRequest(): void {
    const result = imports.proxy_continue_stream(StreamTypeValues.Request);
    if (result != WasmResultValues.Ok) {
      log(LogLevelValues.critical, "Unable to continue request: " + result.toString());
    }
  }

  // Called when the VM is being torn down.
  onDone(): bool {
    log(LogLevelValues.debug, "context id: " + this.context_id.toString() + ": onDone()");
    return true;
  }

  // Called when the VM is being torn down.
  onDelete(): void {
    log(LogLevelValues.debug, "context id: " + this.context_id.toString() + ": onDelete()");
  }
}

/**
 * Wrapper around http callbacks. When AS script supports closures, we can refactor \ remove this.
 */
export class HttpCallback {
  origin_context: BaseContext;
  cb: (origin_context: BaseContext, headers: u32, body_size: usize, trailers: u32) => void;
  constructor(origin_context: BaseContext, cb: (origin_context: BaseContext, headers: u32, body_size: usize, trailers: u32) => void) {
    this.origin_context = origin_context;
    this.cb = cb;
  }
}
class GrpcCallback {
  ctx: Object;
  cb: (c: Object) => void;
  constructor(ctx: Object, cb: (c: Context) => void) {
    this.ctx = ctx;
    this.cb = cb;
  }
}

/**
 * A root context represents a class of instance specific contexts. This is usually used to hold
 * configuration that is used in the individual contexts.
 */
export class RootContext extends BaseContext {
  private configuration_: string = "";
  private http_calls_: Map<u32, HttpCallback> = new Map();
  private grpc_calls_: Map<u32, GrpcCallback> = new Map();

  constructor(context_id: u32) {
    super(context_id);
  }

  getConfiguration(): string {
    return this.configuration_;
  }

  // Need to be overloaded on Filter Root Context implementation
  createContext(context_id: u32): Context {
    log(LogLevelValues.error, "Base createContext called - this should never happen!");
    return new Context(context_id, this);
  }

  // Cancels all pending http requests. Called automatically on onDone.
  cancelPendingRequests(): void {
    log(LogLevelValues.debug, "context id: " + this.context_id.toString() + ": cancelPendingRequests()");
    const callbacks = this.http_calls_.values();
    for (let i = 0; i < callbacks.length; ++i) {
      // Calling callbacks with no response
      // TODO: return some parameter telling the filter that these requests were canceled.
      callbacks[i].cb(callbacks[i].origin_context, 0, 0, 0);
    }
    let keys = this.http_calls_.keys();
    for (let i = 0; i < keys.length; ++i) {
      let key = keys[i];
      // TODO cancel pending http requests and call callbacks with failure.?
      // when it becomes possible in the proxy.
    }
    this.http_calls_.clear()
  }

  // Can be used to validate the configuration (e.g. in the control plane). Returns false if the
  // configuration is invalid.
  validateConfiguration(configuration_size: usize): bool {
    log(LogLevelValues.debug, "context id: " + this.context_id.toString() + ": validateConfiguration(configuration_size:" + configuration_size.toString() + ")");
    return true;
  }

  // Called once when the VM loads and once when each hook loads and whenever configuration changes.
  // Returns false if the configuration is invalid.
  onConfigure(configuration_size: u32): bool {
    log(LogLevelValues.debug, "context id: " + this.context_id.toString() + ": onConfigure(configuration_size: " + configuration_size.toString() + ")");
    CHECK_RESULT(imports.proxy_get_buffer_bytes(BufferTypeValues.PluginConfiguration, 0, configuration_size, globalArrayBufferReference.bufferPtr(), configuration_size));
    this.configuration_ = String.UTF8.decode(globalArrayBufferReference.toArrayBuffer());
    log(LogLevelValues.debug, "context id: " + this.context_id.toString() + ": Updating this.configuration=" + this.configuration_);
    return true;
  }

  // Called when each hook loads.  Returns false if the configuration is invalid.
  onStart(vm_configuration_size: usize): bool {
    log(LogLevelValues.debug, "context id: " + this.context_id.toString() + ": onStart(vm_configuration_size:" + vm_configuration_size.toString() + ")");
    return true;
  }

  // Called when the timer goes off.
  onTick(): void {
    log(LogLevelValues.debug, "context id: " + this.context_id.toString() + ": onTick()");
  }

  // Calleed when 
  onQueueReady(token: u32): void {
    log(LogLevelValues.debug, "context id: " + this.context_id.toString() + ": onQueueReady(token:" + token.toString() + ")");
  }

  // Called when the VM is being torn down.
  onDone(): bool {
    log(LogLevelValues.debug, "context id: " + this.context_id.toString() + ": onDone()");
    this.cancelPendingRequests();
    return true;
  }

  // Report that we are now done following returning false from onDone.
  done(): void {
    log(LogLevelValues.debug, "context id: " + this.context_id.toString() + ": done()");
  }

  /**
   * Make an http call.
   * @param cluster The cluster name to make http request to.
   * @param headers The headers of the request.
   * @param body The body of the request.
   * @param trailers The trailers of the request.
   * @param timeout_milliseconds Timeout for the request, in milliseconds.
   * @param cb Callback to be invoked when the request is complete.
   */
  httpCall(cluster: string, headers: Headers, body: ArrayBuffer, trailers: Headers, timeout_milliseconds: u32, origin_context: BaseContext, cb: (origin_context: Context, headers: u32, body_size: usize, trailers: u32) => void): WasmResultValues {
    log(LogLevelValues.debug, "context id: " + this.context_id.toString() + ": httpCall(cluster: " + cluster + ", headers:" + headers.toString() + ", body:" + body.toString() + ", trailers:" + trailers.toString() + ")");
    let buffer = String.UTF8.encode(cluster);
    let header_pairs = serializeHeaders(headers);
    let trailer_pairs = serializeHeaders(trailers);
    let token = new Reference<u32>();
    let result = imports.proxy_http_call(changetype<usize>(buffer), buffer.byteLength, changetype<usize>(header_pairs), header_pairs.byteLength, changetype<usize>(body), body.byteLength, changetype<usize>(trailer_pairs), trailer_pairs.byteLength, timeout_milliseconds, token.ptr());
    log(LogLevelValues.debug, "Http call executed with result: " + result.toString());
    if (result == WasmResultValues.Ok) {
      log(LogLevelValues.debug, "set token: " + token.data.toString() + " on " + this.context_id.toString());
      this.http_calls_.set(token.data, new HttpCallback(origin_context, cb));
    }
    return result;
  }

  onHttpCallResponse(token: u32, headers: u32, body_size: u32, trailers: u32): void {
    log(LogLevelValues.debug, "context id: " + this.context_id.toString() + ": onHttpCallResponse(token: " + token.toString() + ", headers:" + headers.toString() + ", body_size:" + body_size.toString() + ", trailers:" + trailers.toString() + ")");
    log(LogLevelValues.debug, "http_calls_: " + this.http_calls_.size.toString());
    log(LogLevelValues.debug, "get token: " + token.toString() + " from " + this.context_id.toString());
    log(LogLevelValues.debug, "context_map: " + context_map.keys().join(", "));
    if (this.http_calls_.has(token)) {
      let callback = this.http_calls_.get(token);
      log(LogLevelValues.debug, "onHttpCallResponse: calling callback for context id: " + callback.origin_context.context_id.toString());
      this.http_calls_.delete(token);
      setEffectiveContext(callback.origin_context.context_id);
      callback.cb(callback.origin_context, headers, body_size, trailers);
    } else {
      log(LogLevelValues.error, "onHttpCallResponse: Token " + token.toString() + " not found.");
    }
  }

  on_grpc_receive_initial_metadata(token: u32, headers: u32): void { }
  on_grpc_trailing_metadata(token: u32, trailers: u32): void { }
  on_grpc_receive(token: u32, response_size: u32): void { }
  on_grpc_close(token: u32, status_code: u32): void { }

  /*
  grpc_call(service_proto:ArrayBuffer, service_name:string, method_name:string, request :ArrayBuffer, timeout_milliseconds : u32): WasmResultValues { 
    let service_name_buffer = String.UTF8.encode(service_name);
    let method_name_buffer = String.UTF8.encode(method_name);
    let token = globalU32Ref;
    let result = imports.proxy_grpc_call(changetype<usize>(service_proto), service_proto.byteLength,
    changetype<usize>(service_name_buffer), service_name_buffer.byteLength, 
    changetype<usize>(method_name_buffer), method_name_buffer.byteLength, 
    changetype<usize>(request), request.byteLength, timeout_milliseconds, token.ptr());
    if (result == WasmResultValues.Ok) {
    this.grpc_calls_.set(token.data, new GrpcCallback(ctx, cb));
    }
    return result;
  }

  grpc_stream(service_ptr, service_size, service_name_ptr, service_name_size, method_name_ptr, method_name_size, token_ptr) { return 0; },
  // {proxy_grpc_cancel as grpc_cancel,proxy_grpc_close as grpc_close,proxy_grpc_send as grpc_send} from "./imports";
*/
}

/**
 * Context class the base for class for entities that are per-request or per-connection.
 */
export class Context extends BaseContext {

  root_context: RootContext;

  constructor(context_id_: u32, root_context: RootContext) {
    super(context_id_);
    this.root_context = root_context;
  }

  createContext(): Context {
    log(LogLevelValues.critical, "ctx: can't create context");
    throw new Error("not implemented");
  }

  onNewConnection(): FilterStatusValues {
    log(LogLevelValues.debug, "context id: " + this.context_id.toString() + ": onNewConnection()");
    return FilterStatusValues.Continue;
  }

  onDownstreamData(size: usize, end: bool): FilterStatusValues {
    log(LogLevelValues.debug, "context id: " + this.context_id.toString() + ": onDownstreamData(size: " + size.toString() + ", end: " + end.toString() + ")");
    return FilterStatusValues.Continue;
  }

  onUpstreamData(size: usize, end: bool): FilterStatusValues {
    log(LogLevelValues.debug, "context id: " + this.context_id.toString() + ": onUpstreamData(size: " + size.toString() + ", end: " + end.toString() + ")");
    return FilterStatusValues.Continue;
  }

  onDownstreamConnectionClose(t: PeerTypeValues): void {
    log(LogLevelValues.debug, "context id: " + this.context_id.toString() + ": onDownstreamConnectionClose(t: " + t.toString() + ")");
  }

  onUpstreamConnectionClose(t: PeerTypeValues): void {
    log(LogLevelValues.debug, "context id: " + this.context_id.toString() + ": onUpstreamConnectionClose(t: " + t.toString() + ")");
  }

  onRequestHeaders(a: u32, end_of_stream: bool): FilterHeadersStatusValues { return FilterHeadersStatusValues.Continue }
  onRequestMetadata(a: u32): FilterMetadataStatusValues { return FilterMetadataStatusValues.Continue }
  onRequestBody(body_buffer_length: usize, end_of_stream: bool): FilterDataStatusValues { return FilterDataStatusValues.Continue }
  onRequestTrailers(a: u32): FilterTrailersStatusValues { return FilterTrailersStatusValues.Continue }
  onResponseHeaders(a: u32, end_of_stream: bool): FilterHeadersStatusValues { return FilterHeadersStatusValues.Continue }
  onResponseMetadata(a: u32): FilterMetadataStatusValues { return FilterMetadataStatusValues.Continue }
  onResponseBody(body_buffer_length: usize, end_of_stream: bool): FilterDataStatusValues { return FilterDataStatusValues.Continue }
  onResponseTrailers(s: u32): FilterTrailersStatusValues { return FilterTrailersStatusValues.Continue }

  // Called after onDone when logging is requested.
  onLog(): void {
    log(LogLevelValues.debug, "context id: " + this.context_id.toString() + ": onLog()");
  }

  setEffectiveContext(): WasmResultValues {
    return imports.proxy_set_effective_context(this.context_id);
  }
}

function get_plugin_root_id(): string {
  let root_id = get_property("plugin_root_id");
  if (root_id.byteLength == 0) {
    return "";
  }
  return String.UTF8.decode(root_id);
}

let root_context_factory_map = new Map<string, (context_id: u32) => RootContext>();

let context_map = new Map<u32, BaseContext>();

//create root context if doesn't exist
export function ensureRootContext(root_context_id: u32): RootContext {
  log(LogLevelValues.debug, "ensureRootContext(root_context_id: " + root_context_id.toString() + ")");
  log(LogLevelValues.debug, "Current context_map: " + context_map.keys().join(", "));
  if (context_map.has(root_context_id)) {
    log(LogLevelValues.debug, "Returning root context for id: " + root_context_id.toString());
    return getRootContext(root_context_id);
  }
  const root_id = get_plugin_root_id();
  log(LogLevelValues.debug, "Registering new root context for " + root_id + " with id: " + root_context_id.toString());
  if (!root_context_factory_map.has(root_id)) {
    throw new Error("Missing root context factory for root id: " + root_id);
  }
  const root_context_func = root_context_factory_map.get(root_id);
  const root_context = root_context_func(root_context_id);
  root_context.context_id = root_context_id;
  context_map.set(root_context_id, root_context);
  return root_context;
}

// create a context if doesnt exist.
export function ensureContext(context_id: u32, root_context_id: u32): void {
  log(LogLevelValues.debug, "ensureContext(context_id: " + context_id.toString() + ", root_context_id: " + root_context_id.toString() + ")");
  log(LogLevelValues.debug, "Current context_map: " + context_map.keys().join(", "));
  const root_context = ensureRootContext(root_context_id);
  if (context_map.has(context_id)) {
    log(LogLevelValues.debug, "Existing context id: " + context_id.toString());
    return;
  }
  log(LogLevelValues.debug, "Registering new context with context_id: " + context_id.toString() + " under root_context: " + root_context_id.toString());
  let context = root_context.createContext(context_id);
  context_map.set(context_id, context);
  log(LogLevelValues.debug, "Updated context_map: " + context_map.keys().join(", "));
}

export function getBaseContext(context_id: u32): BaseContext {
  return context_map.get(context_id) as BaseContext;
}
export function getContext(context_id: u32): Context {
  return context_map.get(context_id) as Context;
}
export function getRootContext(context_id: u32): RootContext {
  return context_map.get(context_id) as RootContext;
}

export function deleteContext(context_id: u32): void {
  context_map.delete(context_id);
}

/**
 * Register a root context and make it available to the runtime.
 * @param root_context_factory A function that creates a new root context.
 * @param name The name of the root context. This should match the name configured in the proxy.
 */
export function registerRootContext(
  root_context_factory: (context_id: u32) => RootContext,
  name: string): void {
  root_context_factory_map.set(name, root_context_factory);
}
