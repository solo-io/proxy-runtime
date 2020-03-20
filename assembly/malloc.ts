import {
  __retain,
  __release,
} from "rt/index-full";

/// Allow host to allocate memory.
export function malloc(size: i32): usize {
  let buffer = new ArrayBuffer(size);
  let ptr = changetype<usize>(buffer);
  return __retain(ptr);
}

/// Allow host to free memory.
export function free(ptr: usize): void {
  __release(ptr);
}
