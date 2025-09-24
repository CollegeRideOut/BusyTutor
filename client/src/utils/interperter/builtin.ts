import {
  Lua_Null,
  type Lua_Builtin,
  type Lua_Error,
  type Lua_Return,
  type Lua_String,
} from './lua_types';

export const toStringBuilt: Lua_Builtin = {
  id: crypto.randomUUID(),
  kind: 'builtin',
  fn: function (...args) {
    if (args.length === 0) {
      return {
        id: crypto.randomUUID(),
        kind: 'error',
        message: 'tostring expects 1 arguent',
      } as Lua_Error;
    }

    let obj = args[0];
    switch (obj.kind) {
      case 'string': {
        return {
          id: crypto.randomUUID(),
          kind: 'return',
          value: [obj],
        };
      }
      case 'number': {
        return {
          id: crypto.randomUUID(),
          kind: 'return',
          value: [
            {
              id: crypto.randomUUID(),
              kind: 'string',
              value: obj.value.toString(),
            } as Lua_String,
          ],
        };
      }
      case 'boolean': {
        return {
          id: crypto.randomUUID(),
          kind: 'return',
          value: [
            {
              id: crypto.randomUUID(),
              kind: 'string',
              value: obj.value.toString(),
            } as Lua_String,
          ],
        };
      }
      case 'function': {
        return {
          id: crypto.randomUUID(),
          kind: 'return',
          value: [
            {
              id: crypto.randomUUID(),
              kind: 'string',
              value: obj.body.join(),
            } as Lua_String,
          ],
        };
      }
      case 'error': {
        return {
          id: crypto.randomUUID(),
          kind: 'return',
          value: [
            {
              id: crypto.randomUUID(),
              kind: 'string',
              value: obj.message,
            } as Lua_String,
          ],
        };
      }

      case 'return': {
        return this.fn(...obj.value);
      }
      case 'null':
        return {
          id: crypto.randomUUID(),
          kind: 'return',
          value: [
            {
              id: crypto.randomUUID(),
              kind: 'string',
              value: 'nil',
            } as Lua_String,
          ],
        };
      case 'builtin':
      default: {
        return {
          id: crypto.randomUUID(),
          kind: 'error',
          message: `tostring not implemented with ${obj.kind} `,
        } as Lua_Error;
      }
    }
  },
};
export const setmetatable: Lua_Builtin = {
  id: crypto.randomUUID(),
  kind: 'builtin',
  fn: function (...args) {
    if (args.length !== 2)
      return {
        id: crypto.randomUUID(),
        kind: 'error',
        message: 'setmetatable takes 2 arguments',
      };

    let curr = args[0];

    if (curr.kind !== 'table')
      return {
        id: crypto.randomUUID(),
        kind: 'error',
        message: 'argument 1 must be of type table',
      };

    let meta = args[1];

    if (meta.kind !== 'table')
      return {
        id: crypto.randomUUID(),
        kind: 'error',
        message: 'argument 2 must be of type table',
      };

    curr.metatable = meta;

    return { id: crypto.randomUUID(), kind: 'return', value: [curr] };
  },
};

export const error: Lua_Builtin = {
  id: crypto.randomUUID(),
  kind: 'builtin',
  fn: function (...args) {
    let err_obj = args[0] || Lua_Null;
    let lvl = args[1] || Lua_Null;
    void lvl;

    return {
      id: crypto.randomUUID(),
      kind: 'error',
      message: 'TODO take message out of Lua_Error',
      value: err_obj,
    } satisfies Lua_Error;
  },
};

export const pcall: Lua_Builtin = {
  id: crypto.randomUUID(),
  kind: 'builtin',
};
