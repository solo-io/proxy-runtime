
type char = u8;
type ptr<T> = usize;
type size_t = usize;

export type LogLevel = usize;
export type WasmResult = u32;
export type MetricType = i32;
export type PeerType = i32;
export type HeaderMapType = i32;
export type BufferType = i32;
export type BufferFlags = i32;
export type StreamType = i32;


// @ts-ignore: decorator
@external("env", "proxy_get_status")
// Results status details for any previous ABI call and onGrpcClose.
export declare function proxy_get_status(status_code_ptr: ptr<u32>, message_ptr: ptr<ptr<char>>, message_size: ptr<usize>): u32;

// Logging
// @ts-ignore: decorator
@external("env", "proxy_log")
export declare function proxy_log(level: LogLevel, logMessage: ptr<char>, messageSize: size_t): WasmResult;
// @ts-ignore: decorator
@external("env", "proxy_get_log_level")
export declare function proxy_get_log_level(status_code_ptr: ptr<LogLevel>): WasmResult;

// Timer (must be called from a root context, e.g. onStart, onTick).
// @ts-ignore: decorator
@external("env", "proxy_set_tick_period_milliseconds")
export declare function proxy_set_tick_period_milliseconds(millisecond: u32): WasmResult;

// Time
// @ts-ignore: decorator
@external("env", "proxy_get_current_time_nanoseconds")
export declare function proxy_get_current_time_nanoseconds(nanoseconds: ptr<u64>): WasmResult;

// State accessors
// @ts-ignore: decorator
@external("env", "proxy_get_property")
export declare function proxy_get_property(path_ptr: ptr<char>, path_size: size_t, value_ptr_ptr: ptr<ptr<char>>, value_size_ptr: ptr<usize>): WasmResult;
// @ts-ignore: decorator
@external("env", "proxy_set_property")
export declare function proxy_set_property(path_ptr: ptr<char>, path_size: size_t, value_ptr: ptr<char>, value_size: size_t): WasmResult;


// Continue/Reply/Route
// @ts-ignore: decorator
@external("env", "proxy_continue_stream")
export declare function proxy_continue_stream(stream_type: StreamType): WasmResult;
// @ts-ignore: decorator
@external("env", "proxy_close_stream")
export declare function proxy_close_stream(stream_type: StreamType): WasmResult;
// @ts-ignore: decorator
@external("env", "proxy_send_local_response")
export declare function proxy_send_local_response(response_code: u32, response_code_details_ptr: ptr<char>,
  response_code_details_size: size_t, body_ptr: ptr<char>, body_size: size_t,
  additional_response_header_pairs_ptr: ptr<char>,
  additional_response_header_pairs_size: size_t, grpc_status: u32): WasmResult;
// @ts-ignore: decorator
@external("env", "proxy_clear_route_cache")
export declare function proxy_clear_route_cache(): WasmResult;

// SharedData
// Returns: Ok, NotFound
// @ts-ignore: decorator
@external("env", "proxy_get_shared_data")
export declare function proxy_get_shared_data(key_ptr: ptr<char>, key_size: size_t, value_ptr: ptr<ptr<char>>, value_size: ptr<usize>, cas: ptr<u32>): WasmResult;
//  If cas != 0 and cas != the current cas for 'key' return false, otherwise set the value and
//  return true.
// Returns: Ok, CasMismatch
// @ts-ignore: decorator
@external("env", "proxy_set_shared_data")
export declare function proxy_set_shared_data(key_ptr: ptr<char>, key_size: size_t, value_ptr: ptr<char>, value_size: size_t, cas: u32): WasmResult;

// SharedQueue
// Note: Registering the same queue_name will overwrite the old registration while preseving any
// pending data. Consequently it should typically be followed by a call to
// proxy_dequeue_shared_queue. Returns: Ok
// @ts-ignore: decorator
@external("env", "proxy_register_shared_queue")
export declare function proxy_register_shared_queue(queue_name_ptr: ptr<char>, queue_name_size: size_t, token: ptr<u32>): WasmResult;
// Returns: Ok, NotFound
// @ts-ignore: decorator
@external("env", "proxy_resolve_shared_queue")
export declare function proxy_resolve_shared_queue(vm_id: ptr<char>, vm_id_size: size_t, queue_name_ptr: ptr<char>, queue_name_size: size_t, token: ptr<u32>): WasmResult;
// Returns Ok, Empty, NotFound (token not registered).
// @ts-ignore: decorator
@external("env", "proxy_dequeue_shared_queue")
export declare function proxy_dequeue_shared_queue(token: u32, data_ptr: ptr<ptr<char>>, data_size: ptr<usize>): WasmResult;
// Returns false if the queue was not found and the data was not enqueued.
// @ts-ignore: decorator
@external("env", "proxy_enqueue_shared_queue")
export declare function proxy_enqueue_shared_queue(token: u32, data_ptr: ptr<char>, data_size: size_t): WasmResult;

// Headers/Trailers/Metadata Maps
// @ts-ignore: decorator
@external("env", "proxy_add_header_map_value")
export declare function proxy_add_header_map_value(typ: HeaderMapType, key_ptr: ptr<char>, key_size: size_t, value_ptr: ptr<char>, value_size: size_t): WasmResult;
// @ts-ignore: decorator
@external("env", "proxy_get_header_map_value")
export declare function proxy_get_header_map_value(typ: HeaderMapType, key_ptr: ptr<char>, key_size: size_t, value_ptr: ptr<ptr<char>>, value_size: ptr<usize>): WasmResult;
// @ts-ignore: decorator
@external("env", "proxy_get_header_map_pairs")
export declare function proxy_get_header_map_pairs(typ: HeaderMapType, ptr: ptr<ptr<char>>, size: ptr<usize>): WasmResult;
// @ts-ignore: decorator
@external("env", "proxy_set_header_map_pairs")
export declare function proxy_set_header_map_pairs(typ: HeaderMapType, ptr: ptr<char>, size: size_t): WasmResult;
// @ts-ignore: decorator
@external("env", "proxy_replace_header_map_value")
export declare function proxy_replace_header_map_value(typ: HeaderMapType, key_ptr: ptr<char>, key_size: size_t, value_ptr: ptr<char>, value_size: size_t): WasmResult;
// @ts-ignore: decorator
@external("env", "proxy_remove_header_map_value")
export declare function proxy_remove_header_map_value(typ: HeaderMapType, key_ptr: ptr<char>, key_size: size_t): WasmResult;
// @ts-ignore: decorator
@external("env", "proxy_get_header_map_size")
export declare function proxy_get_header_map_size(typ: HeaderMapType, size: ptr<usize>): WasmResult;

// Buffer
// @ts-ignore: decorator
@external("env", "proxy_get_buffer_bytes")
export declare function proxy_get_buffer_bytes(typ: BufferType, start: u32, length: u32, ptr: ptr<ptr<char>>, size: ptr<usize>): WasmResult;
// @ts-ignore: decorator
@external("env", "proxy_get_buffer_status")
export declare function proxy_get_buffer_status(typ: BufferType, length_ptr: ptr<usize>, flags_ptr: ptr<u32>): WasmResult;

// HTTP
// @ts-ignore: decorator
@external("env", "proxy_http_call")
export declare function proxy_http_call(uri_ptr: ptr<char>, uri_size: size_t, header_pairs_ptr: ptr<void>, header_pairs_size: size_t, body_ptr: ptr<char>, body_size: size_t, trailer_pairs_ptr: ptr<void>, trailer_pairs_size: size_t, timeout_milliseconds: u32, token_ptr: ptr<u32>): WasmResult;
// gRPC
// @ts-ignore: decorator
@external("env", "proxy_grpc_call")
export declare function proxy_grpc_call(service_ptr: ptr<char>, service_size: size_t, service_name_ptr: ptr<char>, service_name_size: size_t, method_name_ptr: ptr<char>, method_name_size: size_t, request_ptr: ptr<char>, request_size: size_t, timeout_milliseconds: u32, token_ptr: ptr<u32>): WasmResult;
// @ts-ignore: decorator
@external("env", "proxy_grpc_stream")
export declare function proxy_grpc_stream(service_ptr: ptr<char>, service_size: size_t, service_name_ptr: ptr<char>, service_name_size: size_t, method_name_ptr: ptr<char>, method_name_size: size_t, token_ptr: ptr<u32>): WasmResult;
// @ts-ignore: decorator
@external("env", "proxy_grpc_cancel")
export declare function proxy_grpc_cancel(token: u32): WasmResult;
// @ts-ignore: decorator
@external("env", "proxy_grpc_close")
export declare function proxy_grpc_close(token: u32): WasmResult;
// @ts-ignore: decorator
@external("env", "proxy_grpc_send")
export declare function proxy_grpc_send(token: u32, message_ptr: ptr<char>, message_size: size_t, end_stream: u32): WasmResult;

// Metrics
// @ts-ignore: decorator
@external("env", "proxy_define_metric")
export declare function proxy_define_metric(type: MetricType, name_ptr: ptr<char>, name_size: size_t, metric_id: ptr<u32>): WasmResult;
// @ts-ignore: decorator
@external("env", "proxy_increment_metric")
export declare function proxy_increment_metric(metric_id: u32, offset: i64): WasmResult;
// @ts-ignore: decorator
@external("env", "proxy_record_metric")
export declare function proxy_record_metric(metric_id: u32, value: u64): WasmResult;
// @ts-ignore: decorator
@external("env", "proxy_get_metric")
export declare function proxy_get_metric(metric_id: u32, result: ptr<u64>): WasmResult;

// System
// @ts-ignore: decorator
@external("env", "proxy_set_effective_context")
export declare function proxy_set_effective_context(effective_context_id: u32): WasmResult;
// @ts-ignore: decorator
@external("env", "proxy_done")
export declare function proxy_done(): WasmResult;
// @ts-ignore: decorator
@external("env", "proxy_call_foreign_function")
export declare function proxy_call_foreign_function(function_name: ptr<char>,
  name_size: size_t, arguments: ptr<char>,
  arguments_size: size_t, results: ptr<ptr<char>>,
  results_size: ptr<size_t>): WasmResult;
