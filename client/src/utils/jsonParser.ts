import { Lua_Table } from '@busytutor/server/src/interpreter';

export function reviver(_key: any, value: any) {
  if (typeof value === 'object' && value !== null) {
    if (value.dataType === 'Map') {
      return new Map(value.value);
    } else if (value.dataType === 'Set') {
      return new Set(value.value);
    }
  }
  return value;
}

export function revive_heap(heap: Record<string, any>) {
  const map = new Map<string, Lua_Table>();

  // 1️⃣ create shells
  for (const data of Object.values(heap)) {
    const t = new Lua_Table();
    t.id = data.id;
    t.idx = data.idx;
    t.kind = data.kind;
    t.hidden = data.hidden;
    t.name = data.name;
    t.store = new Map();
    map.set(t.id, t);
  }

  // 2️⃣ wire connections safely
  for (const data of Object.values(heap)) {
    const t = map.get(data.id)!;

    // ✅ guard here
    if (Array.isArray(data.store)) {
      for (const [k, v] of data.store) {
        if (v && typeof v === 'object' && '$ref' in v) {
          t.store.set(k, map.get(v.$ref)!);
        } else {
          t.store.set(k, v);
        }
      }
    }

    if (data.metatable && map.has(data.metatable))
      t.metatable = map.get(data.metatable)!;
    if (data.__index && map.has(data.__index))
      t.__index = map.get(data.__index)!;
  }

  return map;
}
