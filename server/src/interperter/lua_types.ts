import luaparser from 'luaparse';
import {
  ipairs,
  next,
  error,
  assert,
  pcall,
  setmetatable,
  toStringBuilt,
  pairs,
  print,
  rawequal,
  rawget,
  rawset,
  select,
  tonumber,
  type,
  unpack,
  xpcall,
  getfenv,
  setfenv,
  getmetatable,
} from '@busytutor/server/src/interperter/builtin';
import { applyFunction } from '@busytutor/server/src/interperter/eval';
export type Lua_Object =
  | Lua_Return
  | Lua_Error
  | Lua_Number
  | Lua_Boolean
  | Lua_Null
  | Lua_Function
  | Lua_String
  | Lua_Builtin
  | Lua_Table
  | Lua_Break
  | Lua_Vargs;

export class Lua_Environment {
  public id: string;
  public kind: 'environment' = 'environment';
  public store: Map<string, Lua_Object>;
  public outer: Lua_Environment | null;

  findEnvCotaining(name: string): Lua_Environment | false {
    let val = this.store.get(name);
    let exist = !!val;

    // TODO wtf was i doing here
    if (!exist) return false;
    if (!exist && this.outer) return this.outer?.findEnvCotaining(name);

    return this;
  }

  constructor(outer: Lua_Environment | null = null) {
    this.id = crypto.randomUUID();
    this.store = new Map();
    this.outer = outer;
  }

  public get(name: string): [Lua_Object, boolean] {
    let val = this.store.get(name);
    let exist = !!val;
    if (!val && this.outer !== null) {
      exist = false;
      [val, exist] = this.outer.get(name);
    }
    return [val || Lua_Null, exist];
  }

  public set(name: string, val: Lua_Object) {
    this.store.set(name, val);
  }
}

export const builtin: Map<string, Lua_Builtin> = new Map<string, Lua_Builtin>(
  Object.entries({
    tostring: toStringBuilt,
    setmetatable: setmetatable,
    error: error,
    pcall: pcall,
    next: next,
    assert: assert,
    ipairs: ipairs,
    print: print,
    pairs: pairs,
    rawequal: rawequal,
    rawget: rawget,
    rawset: rawset,
    select: select,
    tonumber: tonumber,
    getfenv: getfenv,
    getmetatable: getmetatable,
    type: type,
    unpack: unpack,
    xpcall: xpcall,
    setfenv: setfenv,
  })
);

export type Lua_Builtin = {
  id: string;
  kind: 'builtin';
  fn?: Lua_Builtin_Function;
};

type Lua_Builtin_Function = (...args: Lua_Object[]) => Lua_Return | Lua_Error;

export type Lua_Function = {
  id: string;
  kind: 'function';
  self: Lua_Object | false;
  parameters: (luaparser.Identifier | luaparser.VarargLiteral)[];
  body: luaparser.Statement[];
  environment: Lua_Table;
};

export type Lua_Return = { id: string; kind: 'return'; value: Lua_Object[] };

export type Lua_Identifier = { id: string; kind: 'identifier'; name: string };

//TODO remove message
export type Lua_Error = {
  id: string;
  kind: 'error';
  message?: string;
  value?: Lua_Object;
};

export type Lua_Number = { id: string; kind: 'number'; value: number };

export type Lua_Boolean = { id: string; kind: 'boolean'; value: boolean };

export type Lua_String = { id: string; kind: 'string'; value: string };

export type Lua_Null = { id: string; kind: 'null' };

export type Lua_Break = { id: string; kind: 'break' };

export type Lua_Vargs = { id: string; kind: 'varg' };

// constants
export const Lua_True: Lua_Boolean = {
  id: crypto.randomUUID(),
  kind: 'boolean',
  value: true,
};
export const Lua_False: Lua_Boolean = {
  id: crypto.randomUUID(),
  kind: 'boolean',
  value: false,
};
export const Lua_Null: Lua_Null = { id: crypto.randomUUID(), kind: 'null' };
export const Lua_Break: Lua_Break = { id: crypto.randomUUID(), kind: 'break' };
export const Lua_Vargs: Lua_Vargs = { id: crypto.randomUUID(), kind: 'varg' };

export class Lua_Console {
  public buffer: string[] = [];

  write(...args: Lua_String[]) {
    this.buffer.push(...args.map((a) => a.value));
  }

  flush(): string {
    const out = this.buffer.join('\t') + '\n';
    this.buffer = [];
    return out;
  }
}

//TODO delete if value is set to null and do something about the idx is suppsed to be contiguos numeric values
export class Lua_Table {
  id: string;
  kind: 'table' = 'table';
  store: Map<Lua_Object | string | number, Lua_Object>;
  __index: Lua_Object = Lua_Null;
  metatable: Lua_Table | Lua_Null = Lua_Null;
  idx: number;

  climbEnv(n: number): Lua_Table | Lua_Error {
    if (n === 0) {
      return this;
    }
    if (this.metatable.kind === 'null') {
      // TODO should be an error
      return {
        id: crypto.randomUUID(),
        kind: 'error',
        message: 'dw',
        value: {
          id: crypto.randomUUID(),
          kind: 'string',
          value: 'invalid number',
        } satisfies Lua_String,
      } satisfies Lua_Error;
    }
    let outer = this.metatable.get('__index');
    if (outer.kind === 'null') {
      return {
        id: crypto.randomUUID(),
        kind: 'error',
        message: 'dw',
        value: {
          id: crypto.randomUUID(),
          kind: 'string',
          value: 'invalid number',
        } satisfies Lua_String,
      } satisfies Lua_Error;
    }
    if (outer.kind !== 'table') return this;
    if (outer === this) {
      return {
        id: crypto.randomUUID(),
        kind: 'error',
        message: 'dw',
        value: {
          id: crypto.randomUUID(),
          kind: 'string',
          value: 'self refential clingEnv',
        } satisfies Lua_String,
      } satisfies Lua_Error;
    }
    return outer.climbEnv(n - 1);
  }
  findTopTable(): Lua_Table {
    if (this.metatable.kind === 'null') {
      // TODO should be an error
      return this;
    }
    let outer = this.metatable.get('__index');
    if (outer.kind !== 'table') return this;
    if (outer === this) return this;
    return outer.findTopTable();
  }
  findEnvCotaining(name: string | Lua_Object): Lua_Table | false {
    let val = this.get(name);
    let exist = val.kind === 'null' ? false : true;

    if (!exist) return false;
    if (this.metatable.kind === 'null') {
      // TODO should be an error
      return false;
    }
    let outer = this.metatable.get('__index');
    if (outer.kind !== 'table') return false;
    let v = this.store.get(name);
    if (!v) return outer.findEnvCotaining(name);

    return this;
  }
  constructor() {
    this.id = crypto.randomUUID();
    this.store = new Map();
    this.idx = 0;
  }

  setValue(val: Lua_Object | string | number): Lua_Null | Lua_Error {
    if (typeof val === 'number') {
      val = {
        id: crypto.randomUUID(),
        kind: 'number',
        value: val,
      } satisfies Lua_Number;
    } else if (typeof val === 'string') {
      val = {
        id: crypto.randomUUID(),
        kind: 'string',
        value: val,
      } satisfies Lua_String;
    }
    switch (val.kind) {
      case 'string':
      case 'number':
      case 'boolean':
      case 'function':
      case 'table':
      case 'null':
      case 'builtin': {
        this.idx++;
        this.store.set(this.idx, val);
        return Lua_Null;
      }
      case 'return': {
        this.idx++;
        this.store.set(this.idx, val.value[0] || Lua_Null);
        return Lua_Null;
      }
      case 'error': {
        return {
          id: crypto.randomUUID(),
          kind: 'error',
          message: 'error cannot be used as value',
        } satisfies Lua_Error;
      }
      default: {
        return Lua_Null;
      }
    }
  }

  set(
    key: Lua_Object | string | number,
    val: Lua_Object
  ): Lua_Null | Lua_Error {
    if (typeof key === 'string') {
      key = {
        id: crypto.randomUUID(),
        kind: 'string',
        value: key,
      } satisfies Lua_String;
    }

    if (typeof key === 'number') {
      key = {
        id: crypto.randomUUID(),
        kind: 'number',
        value: key,
      } satisfies Lua_Number;
    }

    const delete_key = val.kind === 'null';
    switch (key.kind) {
      // use value
      case 'string':
      case 'number': {
        if (delete_key) this.store.delete(key.value);
        else this.store.set(key.value, val);
        return Lua_Null;
      }

      // use reference
      case 'builtin':
      case 'table':
      case 'boolean':
      case 'function': {
        if (delete_key) this.store.delete(key);
        else this.store.set(key, val);
        return Lua_Null;
      }

      // should not happen
      case 'return':
      case 'error':
      case 'null': {
        return {
          kind: 'error',
          message: `${key.kind} cannot be used as key heererer`,
        } as Lua_Error;
      }

      default: {
        return {
          kind: 'error',
          message: `Lua_table key not implemented`,
        } as Lua_Error;
      }
    }
  }

  get(key: Lua_Object | string | number): Lua_Object {
    if (typeof key === 'string') {
      key = {
        id: crypto.randomUUID(),
        kind: 'string',
        value: key,
      } satisfies Lua_String;
    }
    if (typeof key === 'number') {
      key = {
        id: crypto.randomUUID(),
        kind: 'number',
        value: key,
      } satisfies Lua_Number;
    }

    let val: Lua_Object = Lua_Null;
    switch (key.kind) {
      case 'string':
      case 'number': {
        val = this.store.get(key.value) || Lua_Null;
        break;
      }
      case 'boolean':
      case 'function':
      case 'table':
      case 'builtin': {
        val = this.store.get(key) || Lua_Null;
        break;
      }

      case 'error':
      case 'return':
      case 'null': {
        return {
          kind: 'error',
          message: `${key.kind} cannot be used as key for table`,
        } as Lua_Error;
      }
      default: {
        return Lua_Null;
      }
    }
    if (val.kind !== 'null') {
      return val;
    }
    if (this.metatable.kind === 'null') {
      return val;
    }
    const __index = this.metatable.get('__index');
    if (__index.kind !== 'table') {
      if (__index.kind === 'function') {
        return applyFunction(__index, [this, key]);
      }

      return __index;
    }

    return __index.get(key);
  }
}

export type Lua_Visualzer = {
  loc?: {
    start: {
      line: number;
      column: number;
    };
    end: {
      line: number;
      column: number;
    };
  };
};
