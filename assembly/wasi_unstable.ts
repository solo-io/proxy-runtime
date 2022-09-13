
/** Terminate the process normally. An exit code of 0 indicates successful termination of the program. The meanings of other values is dependent on the environment. */
// @ts-ignore: decorator
@unsafe
export declare function proc_exit(
  /** Input: The exit code returned by the process. */
  rval: u32
): void;
