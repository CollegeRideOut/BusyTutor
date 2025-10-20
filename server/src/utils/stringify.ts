import { Lua_Table } from '../interperter/lua_types';

export function make_replacer() {
  const seen = new WeakSet();
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
      return value;
    } else {
      return value;
    }
  };
}
