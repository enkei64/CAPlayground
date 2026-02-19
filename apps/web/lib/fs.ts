const IS_DESKTOP = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_DESKTOP === 'true';

let lastRequestId = 0;
const pendingRequests = new Map<number, { resolve: (v: any) => void; reject: (e: Error) => void }>();

if (typeof window !== 'undefined' && IS_DESKTOP) {
  const eb = (window as any).__electrobun = (window as any).__electrobun || {};
  const originalReceive = eb.receiveMessageFromBun;

  eb.receiveMessageFromBun = (msg: any) => {
    if (msg && msg.type === 'response') {
      const pending = pendingRequests.get(msg.id);
      if (pending) {
        pendingRequests.delete(msg.id);
        if (msg.success) pending.resolve(msg.payload);
        else pending.reject(new Error(msg.error || 'RPC Error'));
      }
    }
    if (originalReceive) originalReceive(msg);
  };
}

async function bunRequest(method: string, params: any = {}): Promise<any> {
  if (typeof window === 'undefined') return null;
  const bridge = (window as any).__electrobunBunBridge;
  if (!bridge) {
    console.error("[FS Bridge] Bridge missing!");
    return null;
  }
  const id = ++lastRequestId;
  return new Promise((resolve, reject) => {
    pendingRequests.set(id, { resolve, reject });
    const packet = { type: 'request', id, method, params };
    bridge.postMessage(JSON.stringify(packet));

    setTimeout(() => {
      if (pendingRequests.has(id)) {
        pendingRequests.delete(id);
        reject(new Error(`RPC Request ${method} timed out`));
      }
    }, 10000);
  });
}

export function bunMessage(method: string, params: any = {}): void {
  if (typeof window === 'undefined') return;
  const bridge = (window as any).__electrobunBunBridge;
  if (!bridge) {
    console.error("[FS Bridge] Bridge missing!");
    return;
  }
  const packet = { type: 'message', id: method, payload: params };
  bridge.postMessage(JSON.stringify(packet));
}

async function blobToBase64(blob: Blob | ArrayBuffer): Promise<string> {
  const b = blob instanceof Blob ? blob : new Blob([blob]);
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.readAsDataURL(b);
  });
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// OPFS helpers
export async function isOPFSSupported(): Promise<boolean> {
  if (IS_DESKTOP) return true;

  try {
    const hasAPI = !!(navigator?.storage && (navigator.storage as any).getDirectory);
    if (!hasAPI) return false;

    const root: any = await (navigator.storage as any).getDirectory();
    if (!root) return false;

    const probeDir = '__opfs_probe__';
    let dir: any | null = null;
    try {
      dir = await root.getDirectoryHandle(probeDir, { create: true });
      const fh = await dir.getFileHandle('t.txt', { create: true });
      const w = await fh.createWritable();
      await w.write(new Blob(['ok'], { type: 'text/plain' }));
      await w.close();
      // cleanup
      try { await (dir as any).removeEntry('t.txt'); } catch { }
      try { await (root as any).removeEntry(probeDir, { recursive: true }); } catch { }
      return true;
    } catch {
      try { if (dir) await (dir as any).removeEntry('t.txt'); } catch { }
      try { await (root as any).removeEntry(probeDir, { recursive: true }); } catch { }
      return false;
    }
  } catch {
    return false;
  }
}

async function getRoot(): Promise<FileSystemDirectoryHandle | null> {
  if (IS_DESKTOP) return null;
  const root: FileSystemDirectoryHandle = await navigator.storage.getDirectory();
  return root;
}

function splitPath(p: string): string[] {
  return p.split('/').filter(Boolean);
}

async function resolveDir(root: FileSystemDirectoryHandle, parts: string[], create = false): Promise<FileSystemDirectoryHandle> {
  let dir = root;
  for (const part of parts) {
    dir = await dir.getDirectoryHandle(part, { create });
  }
  return dir;
}

async function resolveParent(root: FileSystemDirectoryHandle, fullPath: string, create = false): Promise<{ parent: FileSystemDirectoryHandle; name: string }> {
  const parts = splitPath(fullPath);
  const name = parts.pop() as string;
  const parent = await resolveDir(root, parts, create);
  return { parent, name };
}

export async function ensureDir(path: string): Promise<FileSystemDirectoryHandle | null> {
  if (IS_DESKTOP) {
    bunMessage('fs_mkdir', { path });
    return null;
  }
  const root = await getRoot();
  if (!root) return null;
  return resolveDir(root, splitPath(path), true);
}

export async function writeText(path: string, text: string): Promise<void> {
  if (IS_DESKTOP) {
    bunMessage('fs_writeText', { path, text });
    return;
  }
  const root = await getRoot();
  if (!root) return;
  const { parent, name } = await resolveParent(root, path, true);
  const file = await parent.getFileHandle(name, { create: true });
  const w = await file.createWritable();
  await w.write(new Blob([text], { type: 'text/plain' }));
  await w.close();
}

export async function writeBlob(path: string, data: Blob | ArrayBuffer): Promise<void> {
  if (IS_DESKTOP) {
    const base64 = await blobToBase64(data);
    bunMessage('fs_writeBlob', { path, base64 });
    return;
  }
  const root = await getRoot();
  if (!root) return;
  const { parent, name } = await resolveParent(root, path, true);
  const file = await parent.getFileHandle(name, { create: true });
  const w = await file.createWritable();
  const blob = data instanceof Blob ? data : new Blob([data]);
  await w.write(blob);
  await w.close();
}

export async function readText(path: string): Promise<string | null> {
  if (IS_DESKTOP) {
    return bunRequest('fs_readText', { path });
  }
  try {
    const root = await getRoot();
    if (!root) return null;
    const { parent, name } = await resolveParent(root, path, false);
    const file = await parent.getFileHandle(name);
    const f = await file.getFile();
    return await f.text();
  } catch {
    return null;
  }
}

export async function readFile(path: string): Promise<ArrayBuffer | null> {
  if (IS_DESKTOP) {
    const base64 = await bunRequest('fs_readBlob', { path });
    if (!base64) return null;
    return base64ToArrayBuffer(base64);
  }
  try {
    const root = await getRoot();
    if (!root) return null;
    const { parent, name } = await resolveParent(root, path, false);
    const file = await parent.getFileHandle(name);
    const f = await file.getFile();
    return await f.arrayBuffer();
  } catch {
    return null;
  }
}

export async function listDir(path: string): Promise<Array<{ name: string; kind: 'file' | 'directory' }>> {
  const out: Array<{ name: string; kind: 'file' | 'directory' }> = [];
  if (IS_DESKTOP) {
    return (await bunRequest('fs_listDir', { path })) || [];
  }
  try {
    const root = await getRoot();
    if (!root) return out;
    const dir = await resolveDir(root, splitPath(path), false);
    // @ts-ignore
    for await (const [name, handle] of (dir as any).entries()) {
      out.push({ name, kind: (handle as any).kind });
    }
  } catch { }
  return out;
}

export async function exists(path: string): Promise<boolean> {
  if (IS_DESKTOP) {
    return bunRequest('fs_exists', { path });
  }
  try {
    const root = await getRoot();
    if (!root) return false;
    const { parent, name } = await resolveParent(root, path, false);
    await parent.getFileHandle(name);
    return true;
  } catch {
    try {
      const root = await getRoot();
      if (!root) return false;
      await resolveDir(root, splitPath(path), false);
      return true;
    } catch {
      return false;
    }
  }
}

export async function remove(path: string, opts: { recursive?: boolean } = {}): Promise<void> {
  if (IS_DESKTOP) {
    bunMessage('fs_remove', { path, recursive: !!opts.recursive });
    return;
  }
  try {
    const root = await getRoot();
    if (!root) return;
    const parts = splitPath(path);
    const name = parts.pop();
    const dir = await resolveDir(root, parts, false);
    await (dir as any).removeEntry(name!, { recursive: !!opts.recursive });
  } catch { }
}
