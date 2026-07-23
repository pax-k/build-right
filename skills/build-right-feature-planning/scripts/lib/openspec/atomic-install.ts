import { dlopen, FFIType, ptr } from "bun:ffi";

const atFdcwd = -2;

export function atomicRenameNoReplace(source: string, destination: string): boolean {
  const sourceBuffer = Buffer.from(`${source}\0`);
  const destinationBuffer = Buffer.from(`${destination}\0`);
  if (process.platform === "darwin") {
    const library = dlopen("/usr/lib/libSystem.B.dylib", {
      renameatx_np: {
        args: [FFIType.i32, FFIType.ptr, FFIType.i32, FFIType.ptr, FFIType.u32],
        returns: FFIType.i32,
      },
    });
    try {
      return library.symbols.renameatx_np(
        atFdcwd,
        ptr(sourceBuffer),
        atFdcwd,
        ptr(destinationBuffer),
        0x00000004,
      ) === 0;
    } finally {
      library.close();
    }
  }
  if (process.platform === "linux") {
    const library = dlopen("libc.so.6", {
      renameat2: {
        args: [FFIType.i32, FFIType.ptr, FFIType.i32, FFIType.ptr, FFIType.u32],
        returns: FFIType.i32,
      },
    });
    try {
      return library.symbols.renameat2(
        atFdcwd,
        ptr(sourceBuffer),
        atFdcwd,
        ptr(destinationBuffer),
        1,
      ) === 0;
    } finally {
      library.close();
    }
  }
  throw new Error("atomic no-replace directory install is unsupported on this platform");
}

export function atomicSwapDirectories(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(`${left}\0`);
  const rightBuffer = Buffer.from(`${right}\0`);
  if (process.platform === "darwin") {
    const library = dlopen("/usr/lib/libSystem.B.dylib", {
      renameatx_np: {
        args: [FFIType.i32, FFIType.ptr, FFIType.i32, FFIType.ptr, FFIType.u32],
        returns: FFIType.i32,
      },
    });
    try {
      return library.symbols.renameatx_np(
        atFdcwd,
        ptr(leftBuffer),
        atFdcwd,
        ptr(rightBuffer),
        0x00000002,
      ) === 0;
    } finally {
      library.close();
    }
  }
  if (process.platform === "linux") {
    const library = dlopen("libc.so.6", {
      renameat2: {
        args: [FFIType.i32, FFIType.ptr, FFIType.i32, FFIType.ptr, FFIType.u32],
        returns: FFIType.i32,
      },
    });
    try {
      return library.symbols.renameat2(
        atFdcwd,
        ptr(leftBuffer),
        atFdcwd,
        ptr(rightBuffer),
        2,
      ) === 0;
    } finally {
      library.close();
    }
  }
  throw new Error("atomic directory exchange is unsupported on this platform");
}

export function tryAdvisoryFileLock(fd: number): boolean {
  const libraryPath = process.platform === "darwin" ? "/usr/lib/libSystem.B.dylib" : "libc.so.6";
  if (process.platform !== "darwin" && process.platform !== "linux") {
    throw new Error("advisory file locking is unsupported on this platform");
  }
  const library = dlopen(libraryPath, {
    flock: {
      args: [FFIType.i32, FFIType.i32],
      returns: FFIType.i32,
    },
  });
  try {
    return library.symbols.flock(fd, 2 | 4) === 0;
  } finally {
    library.close();
  }
}
