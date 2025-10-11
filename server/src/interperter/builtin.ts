import { evalEquality, isThruthy } from './eval';
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
      case 'builtin':
      case 'function': {
        return {
          id: crypto.randomUUID(),
          kind: 'return',
          value: [
            {
              id: crypto.randomUUID(),
              kind: 'string',
              value: obj.id,
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
        let vals = obj.value.map((v) => this.fn!(v));
        let return_vals: Lua_Object[] = [];
        for (let v of vals) {
          if (v.kind === 'error') return v;
          //TODO ts smell the !
          return_vals.push(...v.value);
        }
        return {
          id: crypto.randomUUID(),
          kind: 'return',
          value: return_vals,
        } satisfies Lua_Return;
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
      case 'table': // TODO
      case 'break':
      case 'varg':
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

export const xpcall: Lua_Builtin = {
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
        console.log('you did find me rmember');
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

export const pairs: Lua_Builtin = {
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
      error.value.value = `bad argument #1 to 'pairs' (table expected, got no value)`;
      return error;
    }

    // TODO ts smell
    let table = args.at(0)!;
    if (table.kind !== 'table') {
      error.value.value = `bad argument #1 to 'pairs' (table expected, got ${table.kind})`;
      return error;
    }

    return {
      id: crypto.randomUUID(),
      kind: 'return',
      value: [next, table, Lua_Null],
    } satisfies Lua_Return;
  },
};

export const print: Lua_Builtin = {
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

    let obj_strings: Lua_String[] = [];
    for (let arg of args) {
      let s = toStringBuilt.fn!(arg);
      if (s.kind === 'error') return s;
      for (let string_value of s.value) {
        if (string_value.kind !== 'string') {
          error.value.value = 'TODO interperr error print builtint func';
          return error;
        }
        obj_strings.push(string_value);
      }
    }

    return {
      id: crypto.randomUUID(),
      kind: 'return',
      value: obj_strings,
    } satisfies Lua_Return;
  },
};

export const rawequal: Lua_Builtin = {
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

    if (args.length <= 1) {
      error.value.value = `bad argument #${args.length + 1} to 'rawequal' (value expected)`;
      return error;
    }
    // TODO ts smell
    let left = args.at(0)!;
    let right = args.at(1)!;
    return {
      id: crypto.randomUUID(),
      kind: 'return',
      value: [evalEquality(left, right)],
    };
  },
};

export const rawget: Lua_Builtin = {
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

    if (args.length <= 1) {
      error.value.value = `bad argument #${args.length + 1} to 'rawget' (value expected)`;
      return error;
    }
    // TODO ts smell
    let table = args.at(0)!;
    let key = args.at(1)!;
    if (table.kind !== 'table') {
      error.value.value = `bad argument #1 to 'rawget' (table expected, got ${table.kind})`;
      return error;
    }
    let val: Lua_Object = Lua_Null;
    switch (key.kind) {
      case 'string':
      case 'number': {
        val = table.store.get(key.value) || Lua_Null;
        break;
      }
      case 'boolean':
      case 'function':
      case 'table':
      case 'builtin': {
        val = table.store.get(key) || Lua_Null;
        break;
      }
      case 'error':
      case 'return':
      default: {
        return Lua_Null;
      }
    }

    return {
      id: crypto.randomUUID(),
      kind: 'return',
      value: [val],
    };
  },
};

export const rawset: Lua_Builtin = {
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

    if (args.length <= 2) {
      error.value.value = `bad argument #${args.length + 1} to 'rawget' (value expected)`;
      return error;
    }
    // TODO ts smell
    let table = args.at(0)!;
    let key = args.at(1)!;
    let value = args.at(2)!;
    if (table.kind !== 'table') {
      error.value.value = `bad argument #1 to 'rawget' (table expected, got ${table.kind})`;
      return error;
    }
    table.set(key, value);
    return {
      id: crypto.randomUUID(),
      kind: 'return',
      value: [table],
    };
  },
};

export const select: Lua_Builtin = {
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

    if (args.length < 2) {
      error.value.value = `bad argument #${args.length + 1} to 'rawget' (value expected)`;
      return error;
    }
    // TODO ts smell
    //console.log('BUILTINT', args);

    const return_obj = {
      id: crypto.randomUUID(),
      kind: 'return',
      value: [] as Lua_Object[],
    } satisfies Lua_Return;
    let mode = args.shift()!;
    switch (mode.kind) {
      case 'string': {
        if (mode.value !== '#') {
          error.value.value = `bad argument #1 to 'select' (number expected, got string)`;
          return error;
        }
        return_obj.value = [
          {
            id: crypto.randomUUID(),
            kind: 'number',
            value: args.length,
          } as Lua_Number,
        ];
        return return_obj;
      }
      case 'number': {
        let val = args.slice(mode.value - 1);
        return_obj.value = val.length > 0 ? val : [Lua_Null];
        return return_obj;
      }
      default: {
        error.value.value = `bad argument #1 to 'select' (number expected, got string)`;
        return error;
      }
    }
  },
};

export const tonumber: Lua_Builtin = {
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

    const return_obj = {
      id: crypto.randomUUID(),
      kind: 'return',
      value: [] as Lua_Object[],
    } satisfies Lua_Return;

    if (args.length === 0) {
      return_obj.value = [Lua_Null];
      return return_obj;
    }
    let parsee = args.at(0)!;
    let base = args.at(1) || Lua_Null;

    console.log('arg 1', parsee);
    console.log('arg 2', base);

    if (base === Lua_Null) {
      switch (parsee.kind) {
        case 'string': {
          let v = parseFloat(parsee.value);
          if (Number.isNaN(v)) {
            return_obj.value = [Lua_Null];
            return return_obj;
          } else {
            return_obj.value = [
              {
                id: crypto.randomUUID(),
                kind: 'number',
                value: v,
              } as Lua_Number,
            ];
            return return_obj;
          }
        }
        case 'number': {
          return_obj.value = [parsee];
          return return_obj;
        }
        default: {
          return_obj.value = [Lua_Null];
          return return_obj;
        }
      }
    }

    if (parsee.kind !== 'string') {
      error.value.value = 'Parsee not a string';
      return error;
    }
    if (base.kind !== 'number') {
      error.value.value = 'BASE not a number';
      return error;
    }
    if (base.value < 2 || base.value > 36) {
      error.value.value = 'BASE outside range';
      return error;
    }
    //TODO some errors god dammit
    let v = parseInt(parsee.value, base.value);
    if (Number.isNaN(v)) {
      return_obj.value = [Lua_Null];
      return return_obj;
    }
    return_obj.value = [
      {
        id: crypto.randomUUID(),
        kind: 'number',
        value: v,
      } as Lua_Number,
    ];
    return return_obj;
  },
};

export const type: Lua_Builtin = {
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

    const return_obj = {
      id: crypto.randomUUID(),
      kind: 'return',
      value: [] as Lua_Object[],
    } satisfies Lua_Return;

    if (args.length === 0) {
      error.value.value = `bad argument #1 to 'type' (value expected)`;
      return error;
    }
    let result: string = args.at(0)!.kind;
    if (result === 'null') result = 'nil';
    else if (result === 'builtin') result = 'function';

    // TODO
    return_obj.value = [
      {
        id: crypto.randomUUID(),
        kind: 'string',
        value: result,
      } satisfies Lua_String,
    ];
    return return_obj;
  },
};

export const unpack: Lua_Builtin = {
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

    const return_obj = {
      id: crypto.randomUUID(),
      kind: 'return',
      value: [] as Lua_Object[],
    } satisfies Lua_Return;

    if (args.length === 0) {
      error.value.value = `bad argument #1 to 'unpack' (value expected)`;
      return error;
    }
    let table = args.at(0)!;
    let start = args.at(1);
    let end = args.at(2);

    if (table.kind !== 'table') {
      error.value.value = `bad argument #1 to 'unpack' (must be a table)`;
      return error;
    }
    if (start && start.kind !== 'number') {
      error.value.value = `bad argument #2 to 'unpack' (must be a number)`;
      return error;
    }
    if (end && end.kind !== 'number') {
      error.value.value = `bad argument #3 to 'unpack' (must be a number)`;
      return error;
    }

    for (
      let i = start ? start.value : 1;
      i <= (end ? end.value : table.idx);
      i++
    ) {
      return_obj.value.push(
        table.get({
          id: crypto.randomUUID(),
          kind: 'number',
          value: i,
        } satisfies Lua_Number),
      );
    }
    return return_obj;
  },
};

//TODO probbaly need to change how enviroment store works
export const setfenv: Lua_Builtin = {
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
      message: 'what ever i want',
      value: error_string,
    } satisfies Lua_Error;

    const return_obj = {
      id: crypto.randomUUID(),
      kind: 'return',
      value: [Lua_Null] as Lua_Object[],
    } satisfies Lua_Return;

    if (args.length < 2) {
      error.value.value = `bad argument #${args.length} to 'unpack' (value expected)`;
      return error;
    }
    let fn = args.at(0)!;
    let table = args.at(1)!;

    if (fn.kind !== 'function') {
      error.value.value = `bad argument #1 (function expected, got ${fn.kind})`;
      return error;
    }
    if (table.kind !== 'table') {
      error.value.value = `bad argument #2 to 'setfenv' (must be a table)`;
      return error;
    }

    fn.environment = table;

    return return_obj;
  },
};

export const _VERSION: Lua_String = {
  id: crypto.randomUUID(),
  kind: 'string',
  value: 'Lua 5.1',
};

export const getfenv: Lua_Builtin = {
  id: crypto.randomUUID(),
  kind: 'builtin',
};

export const getmetatable: Lua_Builtin = {
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
      message: 'what ever i want',
      value: error_string,
    } satisfies Lua_Error;

    const return_obj = {
      id: crypto.randomUUID(),
      kind: 'return',
      value: [Lua_Null] as Lua_Object[],
    } satisfies Lua_Return;
    if (args.length === 0) {
      error.value.value = `bad argument #1 (function expected table, got nil)`;
      return error;
    }
    let table = args.at(0)!;
    if (table.kind != 'table') {
      error.value.value = `bad argument #1 (function expected table, got ${table.kind})`;
      return error;
    }
    const metatable = table.metatable;
    if (metatable.kind === 'null') {
      return_obj.value = [Lua_Null];
      return return_obj;
    }
    const protected_meta = metatable.get('__metatable');
    if (protected_meta.kind !== 'null') {
      return_obj.value = [protected_meta];
      return return_obj;
    }

    return_obj.value = [metatable];
    return return_obj;
  },
};

function math_helper(val: Lua_Object): Lua_Number | Lua_Error {
  const error_string = {
    id: crypto.randomUUID(),
    kind: 'string',
    value: '',
  } satisfies Lua_String;
  const error = {
    id: crypto.randomUUID(),
    kind: 'error',
    message: 'what ever i want',
    value: error_string,
  } satisfies Lua_Error;

  if (val.kind !== 'string' && val.kind !== 'number') {
    error.value.value = `bad argument #1 (function expected number, got ${val.kind})`;
    return error;
  }
  if (val.kind === 'string') {
    let v = tonumber.fn!(val);
    if (v.kind === 'error') {
      return v;
    }
    let parsed = v.value.at(0) || Lua_Null;
    if (parsed.kind !== 'number') {
      error.value.value = `bad argument #1 (function expected number, got ${val.kind})`;
      return error;
    }
    val = parsed;
  }
  return val;
}

//math
export const math_fn = {
  abs: {
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
        message: 'what ever i want',
        value: error_string,
      } satisfies Lua_Error;

      const return_obj = {
        id: crypto.randomUUID(),
        kind: 'return',
        value: [Lua_Null] as Lua_Object[],
      } satisfies Lua_Return;
      if (args.length === 0) {
        error.value.value = `bad argument #1 (function expected number, got nil)`;
        return error;
      }
      let val = args.at(0)!;
      val = math_helper(val);
      if (val.kind === 'error') {
        return val;
      }

      let operation_value = Math.abs(val.value);
      return_obj.value = [
        {
          id: crypto.randomUUID(),
          kind: 'number',
          value: operation_value,
        } satisfies Lua_Number,
      ];
      return return_obj;
    },
  } satisfies Lua_Builtin,

  ceil: {
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
        message: 'what ever i want',
        value: error_string,
      } satisfies Lua_Error;

      const return_obj = {
        id: crypto.randomUUID(),
        kind: 'return',
        value: [Lua_Null] as Lua_Object[],
      } satisfies Lua_Return;
      if (args.length === 0) {
        error.value.value = `bad argument #1 (function expected number, got nil)`;
        return error;
      }
      let val = args.at(0)!;
      val = math_helper(val);
      if (val.kind === 'error') {
        return val;
      }

      let operation_value = Math.ceil(val.value);
      return_obj.value = [
        {
          id: crypto.randomUUID(),
          kind: 'number',
          value: operation_value,
        } satisfies Lua_Number,
      ];
      return return_obj;
    },
  } satisfies Lua_Builtin,

  floor: {
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
        message: 'what ever i want',
        value: error_string,
      } satisfies Lua_Error;

      const return_obj = {
        id: crypto.randomUUID(),
        kind: 'return',
        value: [Lua_Null] as Lua_Object[],
      } satisfies Lua_Return;
      if (args.length === 0) {
        error.value.value = `bad argument #1 (function expected number, got nil)`;
        return error;
      }
      let val = args.at(0)!;
      val = math_helper(val);
      if (val.kind === 'error') {
        return val;
      }

      let operation_value = Math.floor(val.value);
      return_obj.value = [
        {
          id: crypto.randomUUID(),
          kind: 'number',
          value: operation_value,
        } satisfies Lua_Number,
      ];
      return return_obj;
    },
  } satisfies Lua_Builtin,

  sqrt: {
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
        message: 'what ever i want',
        value: error_string,
      } satisfies Lua_Error;

      const return_obj = {
        id: crypto.randomUUID(),
        kind: 'return',
        value: [Lua_Null] as Lua_Object[],
      } satisfies Lua_Return;
      if (args.length === 0) {
        error.value.value = `bad argument #1 (function expected number, got nil)`;
        return error;
      }
      let val = args.at(0)!;
      val = math_helper(val);
      if (val.kind === 'error') {
        return val;
      }

      let operation_value = Math.sqrt(val.value);
      return_obj.value = [
        {
          id: crypto.randomUUID(),
          kind: 'number',
          value: operation_value,
        } satisfies Lua_Number,
      ];
      return return_obj;
    },
  } satisfies Lua_Builtin,

  sin: {
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
        message: 'what ever i want',
        value: error_string,
      } satisfies Lua_Error;

      const return_obj = {
        id: crypto.randomUUID(),
        kind: 'return',
        value: [Lua_Null] as Lua_Object[],
      } satisfies Lua_Return;
      if (args.length === 0) {
        error.value.value = `bad argument #1 (function expected number, got nil)`;
        return error;
      }
      let val = args.at(0)!;
      val = math_helper(val);
      if (val.kind === 'error') {
        return val;
      }

      let operation_value = Math.sin(val.value);
      return_obj.value = [
        {
          id: crypto.randomUUID(),
          kind: 'number',
          value: operation_value,
        } satisfies Lua_Number,
      ];
      return return_obj;
    },
  } satisfies Lua_Builtin,

  cos: {
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
        message: 'what ever i want',
        value: error_string,
      } satisfies Lua_Error;

      const return_obj = {
        id: crypto.randomUUID(),
        kind: 'return',
        value: [Lua_Null] as Lua_Object[],
      } satisfies Lua_Return;
      if (args.length === 0) {
        error.value.value = `bad argument #1 (function expected number, got nil)`;
        return error;
      }
      let val = args.at(0)!;
      if (val.kind !== 'string' && val.kind !== 'number') {
        error.value.value = `bad argument #1 (function expected number, got ${val.kind})`;
        return error;
      }
      if (val.kind === 'string') {
        let v = tonumber.fn!(val);
        if (v.kind === 'error') {
          return v;
        }
        let parsed = v.value.at(0) || Lua_Null;
        if (parsed.kind !== 'number') {
          error.value.value = `bad argument #1 (function expected number, got ${val.kind})`;
          return error;
        }
        val = parsed;
      }
      let operation_value = Math.cos(val.value);
      return_obj.value = [
        {
          id: crypto.randomUUID(),
          kind: 'number',
          value: operation_value,
        } satisfies Lua_Number,
      ];
      return return_obj;
    },
  } satisfies Lua_Builtin,

  tan: {
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
        message: 'what ever i want',
        value: error_string,
      } satisfies Lua_Error;

      const return_obj = {
        id: crypto.randomUUID(),
        kind: 'return',
        value: [Lua_Null] as Lua_Object[],
      } satisfies Lua_Return;
      if (args.length === 0) {
        error.value.value = `bad argument #1 (function expected number, got nil)`;
        return error;
      }
      let val = args.at(0)!;
      val = math_helper(val);
      if (val.kind === 'error') {
        return val;
      }

      let operation_value = Math.tan(val.value);
      return_obj.value = [
        {
          id: crypto.randomUUID(),
          kind: 'number',
          value: operation_value,
        } satisfies Lua_Number,
      ];
      return return_obj;
    },
  } satisfies Lua_Builtin,

  asin: {
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
        message: 'what ever i want',
        value: error_string,
      } satisfies Lua_Error;

      const return_obj = {
        id: crypto.randomUUID(),
        kind: 'return',
        value: [Lua_Null] as Lua_Object[],
      } satisfies Lua_Return;
      if (args.length === 0) {
        error.value.value = `bad argument #1 (function expected number, got nil)`;
        return error;
      }
      let val = args.at(0)!;
      val = math_helper(val);
      if (val.kind === 'error') {
        return val;
      }

      let operation_value = Math.asin(val.value);
      return_obj.value = [
        {
          id: crypto.randomUUID(),
          kind: 'number',
          value: operation_value,
        } satisfies Lua_Number,
      ];
      return return_obj;
    },
  } satisfies Lua_Builtin,

  acos: {
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
        message: 'what ever i want',
        value: error_string,
      } satisfies Lua_Error;

      const return_obj = {
        id: crypto.randomUUID(),
        kind: 'return',
        value: [Lua_Null] as Lua_Object[],
      } satisfies Lua_Return;
      if (args.length === 0) {
        error.value.value = `bad argument #1 (function expected number, got nil)`;
        return error;
      }
      let val = args.at(0)!;
      val = math_helper(val);
      if (val.kind === 'error') {
        return val;
      }

      let operation_value = Math.acos(val.value);
      return_obj.value = [
        {
          id: crypto.randomUUID(),
          kind: 'number',
          value: operation_value,
        } satisfies Lua_Number,
      ];
      return return_obj;
    },
  } satisfies Lua_Builtin,

  atan: {
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
        message: 'what ever i want',
        value: error_string,
      } satisfies Lua_Error;

      const return_obj = {
        id: crypto.randomUUID(),
        kind: 'return',
        value: [Lua_Null] as Lua_Object[],
      } satisfies Lua_Return;
      if (args.length === 0) {
        error.value.value = `bad argument #1 (function expected number, got nil)`;
        return error;
      }
      let val = args.at(0)!;
      val = math_helper(val);
      if (val.kind === 'error') {
        return val;
      }

      let operation_value = Math.atan(val.value);
      return_obj.value = [
        {
          id: crypto.randomUUID(),
          kind: 'number',
          value: operation_value,
        } satisfies Lua_Number,
      ];
      return return_obj;
    },
  } satisfies Lua_Builtin,

  atan2: {
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
        message: 'what ever i want',
        value: error_string,
      } satisfies Lua_Error;

      const return_obj = {
        id: crypto.randomUUID(),
        kind: 'return',
        value: [Lua_Null] as Lua_Object[],
      } satisfies Lua_Return;
      if (args.length < 2) {
        error.value.value = `bad argument #${args.length + 1} (function expected number, got nil)`;
        return error;
      }
      let val1 = args.at(0)!;
      val1 = math_helper(val1);
      if (val1.kind === 'error') {
        return val1;
      }

      let val2 = args.at(1)!;
      val2 = math_helper(val2);
      if (val2.kind === 'error') {
        return val2;
      }

      let operation_value = Math.atan2(val1.value, val2.value);
      return_obj.value = [
        {
          id: crypto.randomUUID(),
          kind: 'number',
          value: operation_value,
        } satisfies Lua_Number,
      ];
      return return_obj;
    },
  } satisfies Lua_Builtin,
  exp: {
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
        message: 'what ever i want',
        value: error_string,
      } satisfies Lua_Error;

      const return_obj = {
        id: crypto.randomUUID(),
        kind: 'return',
        value: [Lua_Null] as Lua_Object[],
      } satisfies Lua_Return;
      if (args.length < 1) {
        error.value.value = `bad argument #${args.length + 1} (function expected number, got nil)`;
        return error;
      }
      let val1 = args.at(0)!;
      val1 = math_helper(val1);
      if (val1.kind === 'error') {
        return val1;
      }

      let operation_value = Math.exp(val1.value);
      return_obj.value = [
        {
          id: crypto.randomUUID(),
          kind: 'number',
          value: operation_value,
        } satisfies Lua_Number,
      ];
      return return_obj;
    },
  } satisfies Lua_Builtin,

  log: {
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
        message: 'what ever i want',
        value: error_string,
      } satisfies Lua_Error;

      const return_obj = {
        id: crypto.randomUUID(),
        kind: 'return',
        value: [Lua_Null] as Lua_Object[],
      } satisfies Lua_Return;
      if (args.length < 2) {
        error.value.value = `bad argument #${args.length + 1} (function expected number, got nil)`;
        return error;
      }
      let val1 = args.at(0)!;
      val1 = math_helper(val1);
      if (val1.kind === 'error') {
        return val1;
      }

      let operation_value = Math.log(val1.value);
      return_obj.value = [
        {
          id: crypto.randomUUID(),
          kind: 'number',
          value: operation_value,
        } satisfies Lua_Number,
      ];
      return return_obj;
    },
  } satisfies Lua_Builtin,

  log10: {
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
        message: 'what ever i want',
        value: error_string,
      } satisfies Lua_Error;

      const return_obj = {
        id: crypto.randomUUID(),
        kind: 'return',
        value: [Lua_Null] as Lua_Object[],
      } satisfies Lua_Return;
      if (args.length < 1) {
        error.value.value = `bad argument #${args.length + 1} (function expected number, got nil)`;
        return error;
      }
      let val1 = args.at(0)!;
      val1 = math_helper(val1);
      if (val1.kind === 'error') {
        return val1;
      }

      let operation_value = Math.log(val1.value) / Math.LN10;
      return_obj.value = [
        {
          id: crypto.randomUUID(),
          kind: 'number',
          value: operation_value,
        } satisfies Lua_Number,
      ];
      return return_obj;
    },
  } satisfies Lua_Builtin,

  pow: {
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
        message: 'what ever i want',
        value: error_string,
      } satisfies Lua_Error;

      const return_obj = {
        id: crypto.randomUUID(),
        kind: 'return',
        value: [Lua_Null] as Lua_Object[],
      } satisfies Lua_Return;
      if (args.length < 2) {
        error.value.value = `bad argument #${args.length + 1} (function expected number, got nil)`;
        return error;
      }
      let val1 = args.at(0)!;
      val1 = math_helper(val1);
      if (val1.kind === 'error') {
        return val1;
      }

      let val2 = args.at(1)!;
      val2 = math_helper(val2);
      if (val2.kind === 'error') {
        return val2;
      }
      let operation_value = Math.pow(val1.value, val2.value);
      return_obj.value = [
        {
          id: crypto.randomUUID(),
          kind: 'number',
          value: operation_value,
        } satisfies Lua_Number,
      ];
      return return_obj;
    },
  } satisfies Lua_Builtin,

  max: {
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
        message: 'what ever i want',
        value: error_string,
      } satisfies Lua_Error;

      const return_obj = {
        id: crypto.randomUUID(),
        kind: 'return',
        value: [Lua_Null] as Lua_Object[],
      } satisfies Lua_Return;
      if (args.length === 0) {
        error.value.value = `bad argument #${args.length + 1} (function expected number, got nil)`;
        return error;
      }
      let vals: number[] = [];
      for (let arg of args) {
        let n = math_helper(arg);
        if (n.kind === 'error') return n;
        vals.push(n.value);
      }

      let operation_value = Math.max(...vals);
      return_obj.value = [
        {
          id: crypto.randomUUID(),
          kind: 'number',
          value: operation_value,
        } satisfies Lua_Number,
      ];
      return return_obj;
    },
  } satisfies Lua_Builtin,

  min: {
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
        message: 'what ever i want',
        value: error_string,
      } satisfies Lua_Error;

      const return_obj = {
        id: crypto.randomUUID(),
        kind: 'return',
        value: [Lua_Null] as Lua_Object[],
      } satisfies Lua_Return;
      if (args.length === 0) {
        error.value.value = `bad argument #${args.length + 1} (function expected number, got nil)`;
        return error;
      }
      let vals: number[] = [];
      for (let arg of args) {
        let n = math_helper(arg);
        if (n.kind === 'error') return n;
        vals.push(n.value);
      }

      let operation_value = Math.min(...vals);
      return_obj.value = [
        {
          id: crypto.randomUUID(),
          kind: 'number',
          value: operation_value,
        } satisfies Lua_Number,
      ];
      return return_obj;
    },
  } satisfies Lua_Builtin,

  deg: {
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
        message: 'what ever i want',
        value: error_string,
      } satisfies Lua_Error;

      const return_obj = {
        id: crypto.randomUUID(),
        kind: 'return',
        value: [Lua_Null] as Lua_Object[],
      } satisfies Lua_Return;
      if (args.length < 1) {
        error.value.value = `bad argument #${args.length + 1} (function expected number, got nil)`;
        return error;
      }
      let vals = args.at(0)!;
      vals = math_helper(vals);
      if (vals.kind === 'error') return vals;

      let operation_value = (vals.value * 180) / Math.PI;
      return_obj.value = [
        {
          id: crypto.randomUUID(),
          kind: 'number',
          value: operation_value,
        } satisfies Lua_Number,
      ];
      return return_obj;
    },
  } satisfies Lua_Builtin,

  rad: {
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
        message: 'what ever i want',
        value: error_string,
      } satisfies Lua_Error;

      const return_obj = {
        id: crypto.randomUUID(),
        kind: 'return',
        value: [Lua_Null] as Lua_Object[],
      } satisfies Lua_Return;
      if (args.length < 1) {
        error.value.value = `bad argument #${args.length + 1} (function expected number, got nil)`;
        return error;
      }
      let vals = args.at(0)!;
      vals = math_helper(vals);
      if (vals.kind === 'error') return vals;

      let operation_value = (vals.value * Math.PI) / 180;
      return_obj.value = [
        {
          id: crypto.randomUUID(),
          kind: 'number',
          value: operation_value,
        } satisfies Lua_Number,
      ];
      return return_obj;
    },
  } satisfies Lua_Builtin,

  pi: {
    id: crypto.randomUUID(),
    kind: 'number',
    value: Math.PI,
  } satisfies Lua_Number,

  huge: {
    id: crypto.randomUUID(),
    kind: 'number',
    value: Infinity,
  } satisfies Lua_Number,

  random: {
    id: crypto.randomUUID(),
    kind: 'builtin',
    fn: function (...args) {
      const return_obj = {
        id: crypto.randomUUID(),
        kind: 'return',
        value: [Lua_Null] as Lua_Object[],
      } satisfies Lua_Return;

      if (args.length === 0) {
        let operation_value = Math.random();
        return_obj.value = [
          {
            id: crypto.randomUUID(),
            kind: 'number',
            value: operation_value,
          } satisfies Lua_Number,
        ];

        return return_obj;
      } else if (args.length === 1) {
        let vals = args.at(0)!;
        vals = math_helper(vals);
        if (vals.kind === 'error') return vals;

        let operation_value = Math.floor(Math.random() * vals.value) + 1;
        return_obj.value = [
          {
            id: crypto.randomUUID(),
            kind: 'number',
            value: operation_value,
          } satisfies Lua_Number,
        ];
        return return_obj;
      } else {
        let val1 = args.at(0)!;
        val1 = math_helper(val1);
        if (val1.kind === 'error') return val1;

        let val2 = args.at(0)!;
        val2 = math_helper(val2);
        if (val2.kind === 'error') return val2;

        let operation_value =
          Math.floor(Math.random() * (val2.value - val1.value + 1)) +
          val1.value;
        return_obj.value = [
          {
            id: crypto.randomUUID(),
            kind: 'number',
            value: operation_value,
          } satisfies Lua_Number,
        ];
      }

      return return_obj;
    },
  } satisfies Lua_Builtin,

  fmod: {
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
        message: 'what ever i want',
        value: error_string,
      } satisfies Lua_Error;

      const return_obj = {
        id: crypto.randomUUID(),
        kind: 'return',
        value: [Lua_Null] as Lua_Object[],
      } satisfies Lua_Return;
      if (args.length < 2) {
        error.value.value = `bad argument #${args.length + 1} (function expected number, got nil)`;
        return error;
      }
      let val1 = args.at(0)!;
      val1 = math_helper(val1);
      if (val1.kind === 'error') {
        return val1;
      }

      let val2 = args.at(1)!;
      val2 = math_helper(val2);
      if (val2.kind === 'error') {
        return val2;
      }
      let operation_value =
        val1.value - Math.floor(val1.value / val2.value) * val2.value;
      return_obj.value = [
        {
          id: crypto.randomUUID(),
          kind: 'number',
          value: operation_value,
        } satisfies Lua_Number,
      ];
      return return_obj;
    },
  } satisfies Lua_Builtin,
};

//string
export const string_fn = {
  bytes: {
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
        message: 'what ever i want',
        value: error_string,
      } satisfies Lua_Error;

      const return_obj = {
        id: crypto.randomUUID(),
        kind: 'return',
        value: [Lua_Null] as Lua_Object[],
      } satisfies Lua_Return;
      if (args.length === 0) {
        error.value.value = `bad argument #1 (function expected number, got nil)`;
        return error;
      }
      let s = args.at(0)!;
      let i = args.at(1);
      let j = args.at(2);

      if (s.kind !== 'string') {
        error.value.value = 'bad argument #1 to "byte" (string expected)';
        return error;
      }
      if (i === undefined) {
        i = { id: crypto.randomUUID(), kind: 'number', value: 1 } as Lua_Number;
      }
      if (j === undefined) {
        j = { id: crypto.randomUUID(), kind: 'number', value: 1 } as Lua_Number;
      }
      if (i.kind !== 'number') {
        error.value.value = 'bad argument #2 to "byte" (number expected)';
        return error;
      }
      if (j.kind !== 'number') {
        error.value.value = 'bad argument #3 to "byte" (number expected)';
        return error;
      }
      let len = s.value.length;
      if (i.value < 0) {
        i.value = len + i.value + 1;
      }
      if (j.value < 0) {
        j.value = len + j.value + 1;
      }
      i.value = Math.max(1, i.value);
      j.value = Math.max(len, j.value);
      if (i.value > j.value || i.value > len) {
        return_obj.value = [];
        return return_obj;
      }

      let result: Lua_Object[] = [];
      for (let idx = i.value; idx <= j.value; idx++) {
        result.push({
          id: crypto.randomUUID(),
          kind: 'number',
          value: s.value.charCodeAt(idx - 1),
        } satisfies Lua_Number);
      }
      return_obj.value = result;
      return return_obj;
    },
  } satisfies Lua_Builtin,

  char: {
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
        message: 'what ever i want',
        value: error_string,
      } satisfies Lua_Error;

      const return_obj = {
        id: crypto.randomUUID(),
        kind: 'return',
        value: [Lua_Null] as Lua_Object[],
      } satisfies Lua_Return;
      if (args.length === 0) {
        return_obj.value = [
          {
            id: crypto.randomUUID(),
            kind: 'string',
            value: '',
          } satisfies Lua_String,
        ];
        return return_obj;
      }

      for (let i = 0; i < args.length; i++) {
        let byte = args[i];
        if (byte.kind !== 'number') {
          error.value.value = `bad argument #${i + 1} to 'char' (number expected, got ${byte.kind})`;
          return error;
        }
        if (byte.value < 0 || byte.value > 255) {
          error.value.value = `bad argument #${i + 1} to 'char' (value out of range)`;
          return error;
        }
        // smell
        return_obj.value = [
          {
            id: crypto.randomUUID(),
            kind: 'string',
            value: String.fromCharCode(
              ...args.map((a) => (a as Lua_Number).value as number),
            ),
          },
        ];
      }

      return return_obj;
    },
  } satisfies Lua_Builtin,

  len: {
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
        message: 'what ever i want',
        value: error_string,
      } satisfies Lua_Error;

      const return_obj = {
        id: crypto.randomUUID(),
        kind: 'return',
        value: [Lua_Null] as Lua_Object[],
      } satisfies Lua_Return;
      if (args.length === 0) {
        error.value.value = `bad argument #1 (function expected string, got nil)`;
        return error;
      }
      let s = args[0];
      if (s.kind !== 'string') {
        error.value.value = `bad argument #1 (function expected stirng, got ${s.kind})`;
        return error;
      }
      return_obj.value = [
        { id: crypto.randomUUID(), kind: 'number', value: s.value.length },
      ];

      return return_obj;
    },
  } satisfies Lua_Builtin,

  lower: {
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
        message: 'what ever i want',
        value: error_string,
      } satisfies Lua_Error;

      const return_obj = {
        id: crypto.randomUUID(),
        kind: 'return',
        value: [Lua_Null] as Lua_Object[],
      } satisfies Lua_Return;
      if (args.length === 0) {
        error.value.value = `bad argument #1 (function expected string, got nil)`;
        return error;
      }
      let s = args.at(0)!;
      if (s.kind !== 'string') {
        error.value.value = `bad argument #1 (function expected string, got ${s.kind})`;
        return error;
      }

      return_obj.value = [
        {
          id: crypto.randomUUID(),
          kind: 'string',
          value: s.value.toLowerCase(),
        } satisfies Lua_String,
      ];

      return return_obj;
    },
  } satisfies Lua_Builtin,

  rep: {
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
        message: 'what ever i want',
        value: error_string,
      } satisfies Lua_Error;

      const return_obj = {
        id: crypto.randomUUID(),
        kind: 'return',
        value: [Lua_Null] as Lua_Object[],
      } satisfies Lua_Return;
      if (args.length < 2) {
        error.value.value = `bad argument #1 (function expected string, got nil)`;
        return error;
      }
      let s = args[0];
      let n = args[1];
      if (s.kind !== 'string') {
        error.value.value = `bad argument #1 (function expected string, got ${s.kind})`;
        return error;
      }

      if (n.kind !== 'number') {
        error.value.value = `bad argument #2 (function expected string, got ${n.kind})`;
        return error;
      }

      return_obj.value = [
        {
          id: crypto.randomUUID(),
          kind: 'string',
          value: s.value.repeat(n.value),
        } satisfies Lua_String,
      ];
      return return_obj;
    },
  } satisfies Lua_Builtin,

  reverse: {
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
        message: 'what ever i want',
        value: error_string,
      } satisfies Lua_Error;

      const return_obj = {
        id: crypto.randomUUID(),
        kind: 'return',
        value: [Lua_Null] as Lua_Object[],
      } satisfies Lua_Return;
      if (args.length === 0) {
        error.value.value = `bad argument #1 (function expected number, got nil)`;
        return error;
      }
      let s = args.at(0)!;
      if (s.kind !== 'string') {
        error.value.value = `bad argument #1 (function expected string, got ${s.kind})`;
        return error;
      }

      return_obj.value = [
        {
          id: crypto.randomUUID(),
          kind: 'string',
          value: s.value.split('').reverse().join(''),
        } satisfies Lua_String,
      ];
      return return_obj;
    },
  } satisfies Lua_Builtin,

  upper: {
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
        message: 'what ever i want',
        value: error_string,
      } satisfies Lua_Error;

      const return_obj = {
        id: crypto.randomUUID(),
        kind: 'return',
        value: [Lua_Null] as Lua_Object[],
      } satisfies Lua_Return;
      if (args.length === 0) {
        error.value.value = `bad argument #1 (function expected string, got nil)`;
        return error;
      }
      let s = args.at(0)!;
      if (s.kind !== 'string') {
        error.value.value = `bad argument #1 (function expected string, got ${s.kind})`;
        return error;
      }

      return_obj.value = [
        {
          id: crypto.randomUUID(),
          kind: 'string',
          value: s.value.toUpperCase(),
        } satisfies Lua_String,
      ];
      return return_obj;
    },
  } satisfies Lua_Builtin,

  dump: {
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
        message: 'what ever i want',
        value: error_string,
      } satisfies Lua_Error;

      const return_obj = {
        id: crypto.randomUUID(),
        kind: 'return',
        value: [Lua_Null] as Lua_Object[],
      } satisfies Lua_Return;
      if (args.length === 0) {
        error.value.value = `bad argument #1 (function expected funtion, got nil)`;
        return error;
      }
      let f = args.at(0)!;
      if (f.kind !== 'function') {
        error.value.value = `bad argument #1 (function expected funtion, got ${f.kind})`;
        return error;
      }

      return_obj.value = [
        {
          id: crypto.randomUUID(),
          kind: 'string',
          value: '(function dump stub)',
        } satisfies Lua_String,
      ];
      return return_obj;
    },
  } satisfies Lua_Builtin,

  find: {
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
        message: 'what ever i want',
        value: error_string,
      } satisfies Lua_Error;

      const return_obj = {
        id: crypto.randomUUID(),
        kind: 'return',
        value: [Lua_Null] as Lua_Object[],
      } satisfies Lua_Return;
      if (args.length === 0) {
        error.value.value = `bad argument #1 (function expected number, got nil)`;
        return error;
      }

      return_obj.value = [
        {
          id: crypto.randomUUID(),
          kind: 'string',
          value: 'find function stub',
        } satisfies Lua_String,
      ];
      return return_obj;
    },
  } satisfies Lua_Builtin,
};

export const table_fn = {
  concat: {
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
        message: 'what ever i want',
        value: error_string,
      } satisfies Lua_Error;

      const return_obj = {
        id: crypto.randomUUID(),
        kind: 'return',
        value: [Lua_Null] as Lua_Object[],
      } satisfies Lua_Return;
      if (args.length === 0) {
        error.value.value = `bad argument #1 (function expected table, got nil)`;
        return error;
      }
      let t = args[0];
      if (t.kind !== 'table') {
        error.value.value = `bad argument #1 (function expected table, got ${t.kind})`;
        return error;
      }
      let sep = args.at(1);
      if (sep === undefined) {
        sep = { id: crypto.randomUUID(), kind: 'string', value: '' };
      }
      if (sep.kind !== 'string') {
        error.value.value = `bad argument #2 (function expected string, got ${sep.kind})`;
        return error;
      }

      let i = args.at(2);
      if (i === undefined) {
        i = { id: crypto.randomUUID(), kind: 'number', value: 1 };
      }
      if (i.kind !== 'number') {
        error.value.value = `bad argument #3 (function expected number, got ${i.kind})`;
        return error;
      }

      let j = args.at(3);
      if (j === undefined) {
        j = { id: crypto.randomUUID(), kind: 'number', value: t.idx };
      }
      if (j.kind !== 'number') {
        error.value.value = `bad argument #4 (function expected number, got ${j.kind})`;
        return error;
      }

      let result = '';
      while (i.value < j.value) {
        let val = t.get(i);
        if (val.kind === 'null') {
          break;
        }
        let val_returned = toStringBuilt.fn!(val);
        if (val_returned.kind === 'error') {
          throw Error(`interperter conversion error ${val.kind} to string`);
        }
        if (val_returned.value.length === 0) {
          throw Error(
            `interperter conversion error ${val.kind} to string came empty`,
          );
        }
        let val_string = val_returned.value[0];
        if (val_string.kind !== 'string') {
          throw Error(
            `interperter conversion error ${val.kind} to string came not as tring but ${val_string.kind}`,
          );
        }
        result += val_string.value;
        i.value++;
      }
      return_obj.value = [
        {
          id: crypto.randomUUID(),
          kind: 'string',
          value: result,
        },
      ];

      return return_obj;
    },
  } satisfies Lua_Builtin,

  insert: {
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
        message: 'what ever i want',
        value: error_string,
      } satisfies Lua_Error;

      const return_obj = {
        id: crypto.randomUUID(),
        kind: 'return',
        value: [Lua_Null] as Lua_Object[],
      } satisfies Lua_Return;
      if (args.length < 2) {
        error.value.value = `bad argument #1 (function expected table, got nil)`;
        return error;
      }
      let t = args[0];
      if (t.kind !== 'table') {
        error.value.value = `bad argument #1 (function expected table, got ${t.kind})`;
        return error;
      }
      let x = args.at(1)!;
      switch (args.length) {
        case 2: {
          t.setValue(x);
          break;
        }
        default: {
          if (x.kind !== 'number') {
            error.value.value = `bad argument #2 (function expected number, got ${x.kind})`;
            return error;
          }
          let j = args.at(2)!;
          for (let i = x.value; i >= t.idx; i--) {
            t.set(i + 1, t.get(i));
          }

          t.set(x.value, j);
          break;
        }
      }

      return return_obj;
    },
  } satisfies Lua_Builtin,

  remove: {
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
        message: 'what ever i want',
        value: error_string,
      } satisfies Lua_Error;

      const return_obj = {
        id: crypto.randomUUID(),
        kind: 'return',
        value: [Lua_Null] as Lua_Object[],
      } satisfies Lua_Return;
      if (args.length === 0) {
        error.value.value = `bad argument #1 (function expected table, got nil)`;
        return error;
      }
      let t = args[0];
      if (t.kind !== 'table') {
        error.value.value = `bad argument #1 (function expected table, got ${t.kind})`;
        return error;
      }
      let idx = args.at(1);
      if (idx === undefined) {
        idx = { id: crypto.randomUUID(), kind: 'number', value: t.idx };
      }
      if (idx.kind !== 'number') {
        error.value.value = `bad argument #2 (function expected number, got ${idx.kind})`;
        return error;
      }

      for (let i = idx.value; i < t.idx - 1; i++) {
        t.set(i, t.get(i + 1));
      }
      t.set(t.idx, Lua_Null);
      t.idx--;

      return return_obj;
    },
  } satisfies Lua_Builtin,

  maxn: {
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
        message: 'what ever i want',
        value: error_string,
      } satisfies Lua_Error;

      const return_obj = {
        id: crypto.randomUUID(),
        kind: 'return',
        value: [Lua_Null] as Lua_Object[],
      } satisfies Lua_Return;
      if (args.length === 0) {
        error.value.value = `bad argument #1 (function expected table, got nil)`;
        return error;
      }
      let t = args[0];
      if (t.kind !== 'table') {
        error.value.value = `bad argument #1 (function expected table, got ${t.kind})`;
        return error;
      }
      let max = -Infinity;
      for (let [key, _value] of t.store.entries()) {
        let k_val = 0;
        if (typeof key === 'object' && key.kind === 'number') {
          k_val = key.value;
        }
        if (typeof key === 'number') {
          k_val = key;
        }
        max = Math.max(k_val, max);
      }

      return_obj.value = [
        {
          id: crypto.randomUUID(),
          kind: 'number',
          value: Math.max(max, t.idx, 0),
        },
      ];

      return return_obj;
    },
  } satisfies Lua_Builtin,
};
