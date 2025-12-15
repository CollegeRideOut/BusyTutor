import { Lua_Table } from '../interpreter';

export function make_replacer() {
  const seen = new WeakSet();
  // todo problems down the line probably
  return (_key: any, value: any) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return { refId: value.id };
      }
      seen.add(value);
    }
    if (value instanceof Map) {
      return {
        dataType: 'Map',
        value: Array.from(
          [...value.entries()].map(([a, b]: any) => {
            if (b instanceof Lua_Table) {
              return [a, { refId: b.id }];
            }
            return [a, b];
          })
        ), // or with spread: value: [...value]
      };
    } else if (value instanceof Set) {
      return {
        dataType: 'Set',
        value: Array.from(value.values()), // or with spread: value: [...value]
      };
    } else if (value instanceof Lua_Table) {
      return { refid: value.id, dataType: 'table' };
    } else {
      return value;
    }
  };
}
export function serialize_heap(heapMap: Map<string, Lua_Table>) {
  const heap: Record<string, any> = {};
  const queue: Lua_Table[] = [];
  const seen = new Set<string>();

  // seed queue with all tables in the given heap
  for (const t of heapMap.values()) queue.push(t);

  while (queue.length > 0) {
    const tbl = queue.shift()!;
    if (seen.has(tbl.id)) continue;
    seen.add(tbl.id);

    // enqueue any linked tables not yet seen
    for (const v of tbl.store.values()) {
      if (v instanceof Lua_Table && !seen.has(v.id)) queue.push(v);
    }
    if (tbl.metatable instanceof Lua_Table && !seen.has(tbl.metatable.id))
      queue.push(tbl.metatable);
    if (tbl.__index instanceof Lua_Table && !seen.has(tbl.__index.id))
      queue.push(tbl.__index);

    // serialize current table
    heap[tbl.id] = {
      id: tbl.id,
      idx: tbl.idx,
      kind: tbl.kind,
      hidden: tbl.hidden,
      name: tbl.name,
      metatable: tbl.metatable instanceof Lua_Table ? tbl.metatable.id : null,
      __index: tbl.__index instanceof Lua_Table ? tbl.__index.id : null,
      store: Array.from(tbl.store.entries()).map(([k, v]) => [
        k,
        v instanceof Lua_Table ? { $ref: v.id } : v,
      ]),
    };
  }

  return heap;
}
