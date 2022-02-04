import {
  __pin,
  __unpin,
} from "rt/itcms";

/// Allow host to allocate memory.
export function malloc(size: i32): usize {
  let buffer = new ArrayBuffer(size);
  let ptr = changetype<usize>(buffer);
  return __pin(ptr);
}

/// Allow host to free memory.
export function free(ptr: usize): void {
  __unpin(ptr);
}
