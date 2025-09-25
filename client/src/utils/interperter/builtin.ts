import { isThruthy } from './eval';
import {
  Lua_Null,
  type Lua_Builtin,
  type Lua_Error,
  type Lua_Number,
  type Lua_Object,
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
        //TODO TS smell
        return this.fn!(...obj.value);
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

export const assert: Lua_Builtin = {
  id: crypto.randomUUID(),
  kind: 'builtin',
  fn: function (...args) {
    {
      if (args.length < 1)
        return {
          id: crypto.randomUUID(),
          kind: 'error',
          message: 'TODO',
          value: {
            id: crypto.randomUUID(),
            kind: 'string',
            value: "bad argument #1 to 'assert' (value expected)",
          } satisfies Lua_String,
        } satisfies Lua_Error;
      const assertion_failed = {
        id: crypto.randomUUID(),
        kind: 'string',
        value: 'assertion failed!',
      } satisfies Lua_String;

      //TODO ts smell
      let firstObj = args.at(0)!;
      const is_truthy = isThruthy(firstObj);
      if (!is_truthy.value)
        return {
          id: crypto.randomUUID(),
          kind: 'error',
          message: 'TODO',
          value: args.at(1) || assertion_failed,
        } satisfies Lua_Error;

      return {
        id: crypto.randomUUID(),
        kind: 'return',
        value: args,
      } satisfies Lua_Return;
    }
  },
};

export const ipairs: Lua_Builtin = {
  id: crypto.randomUUID(),
  kind: 'builtin',
};

export const next: Lua_Builtin = {
  id: crypto.randomUUID(),
  kind: 'builtin',
  fn: function (...args) {
    const error_string = {
      id: crypto.randomUUID(),
      kind: 'string',
      value: '',
    } satisfies Lua_String;
    const error = {
      id: crypto.randomUUID(),
      kind: 'error',
      message: 'dw',
      value: error_string,
    } satisfies Lua_Error;

    if (args.length === 0) {
      error.value.value = 'needs 1 argument';
      return error;
    }
    //TODO ts smell
    let table = args.at(0)!;
    let key_arg = args.at(1) || Lua_Null;
    if (table.kind !== 'table') {
      error.value.value = 'firs argument must be table';
      return error;
    }

    const return_object = {
      id: crypto.randomUUID(),
      kind: 'return',
      value: [] as Lua_Object[],
    } satisfies Lua_Return;

    if (table.store.size === 0) {
      return_object.value = [Lua_Null];
      return return_object;
    }
    if (key_arg.kind === 'null') {
      let [key, value] = [...table.store.entries()][0];
      let return_key: Lua_Object;
      if (typeof key === 'string')
        return_key = {
          id: crypto.randomUUID(),
          kind: 'string',
          value: key,
        } satisfies Lua_String;
      else if (typeof key === 'number')
        return_key = {
          id: crypto.randomUUID(),
          kind: 'number',
          value: key,
        } satisfies Lua_Number;
      else return_key = key;

      return_object.value = [return_key, value];
      return return_object;
    }

    let found = false;
    for (let [key, value] of table.store) {
      if (found) {
        console.log('you did find me rmember')
        let return_key: Lua_Object;
        if (typeof key === 'string')
          return_key = {
            id: crypto.randomUUID(),
            kind: 'string',
            value: key,
          } satisfies Lua_String;
        else if (typeof key === 'number')
          return_key = {
            id: crypto.randomUUID(),
            kind: 'number',
            value: key,
          } satisfies Lua_Number;
        else return_key = key;

        return_object.value = [return_key, value];
        return return_object
      }
      switch (key_arg.kind) {
        case 'string':
        case 'number': {
          if (key === key_arg.value) found = true;
          break;
        }
        case 'boolean':
        default: {
          if (typeof key === 'string' || typeof key === 'number') continue;
          if (key_arg.id === key.id) found = true;
        }
      }
    }

    if (!found) {
      error.value.value = "invalid key to 'next'";
      return error;
    }

    return_object.value = [Lua_Null];
    return return_object;
  },
};
