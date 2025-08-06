import luaparser from "luaparse";
export type Lua_Object =
    | Lua_Return
    | Lua_Error
    | Lua_Number
    | Lua_Boolean
    | Lua_Null
    | Lua_Function
    | Lua_String
    | Lua_Builtin
    | Lua_Table;

export class Lua_Environment {
    public kind: "environment" = "environment";
    public store: Map<string, Lua_Object>;
    public outer: Lua_Environment | null;

    constructor(outer: Lua_Environment | null = null) {
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
        tostring: {
            id: crypto.randomUUID(),
            kind: "builtin",
            fn: function(...args) {
                if (args.length === 0) {
                    return {
                        id: crypto.randomUUID(),
                        kind: "return",
                        value: [
                            {

                                id: crypto.randomUUID(),
                                kind: "error",
                                message: "tostring expects 1 arguent",
                            } as Lua_Error,
                        ],
                    };
                }

                let obj = args[0];
                switch (obj.kind) {
                    case "string": {
                        return (
                            {
                                id: crypto.randomUUID(),
                                kind: "return",
                                value: [obj]
                            }
                        );
                    }
                    case "number": {
                        return {
                            id: crypto.randomUUID(),
                            kind: "return",
                            value: [
                                {

                                    id: crypto.randomUUID(),
                                    kind: "string", value: obj.value.toString()
                                } as Lua_String,
                            ],
                        };
                    }
                    case "boolean": {
                        return {
                            id: crypto.randomUUID(),
                            kind: "return",
                            value: [
                                {
                                    id: crypto.randomUUID(),
                                    kind: "string",
                                    value: obj.value.toString()
                                } as Lua_String,
                            ],
                        };
                    }
                    case "function": {
                        return {
                            id: crypto.randomUUID(),
                            kind: "return",
                            value: [{
                                id: crypto.randomUUID(),
                                kind: "string",
                                value: obj.body.join()
                            } as Lua_String],
                        };
                    }
                    case "error": {
                        return {
                            id: crypto.randomUUID(),
                            kind: "return",
                            value: [{ id: crypto.randomUUID(), kind: "string", value: obj.message } as Lua_String],
                        };
                    }

                    case "return": {
                        return this.fn(...obj.value);
                    }
                    case "null":
                        return {
                            id: crypto.randomUUID(),
                            kind: "return",
                            value: [{ id: crypto.randomUUID(), kind: "string", value: "nil" } as Lua_String],
                        };
                    case "builtin":
                    default: {
                        return {
                            id: crypto.randomUUID(),
                            kind: "return",
                            value: [
                                {
                                    id: crypto.randomUUID(),
                                    kind: "error",
                                    message: `tostring not implemented with ${obj.kind} `,
                                } as Lua_Error,
                            ],
                        };
                    }
                }
            },
        },
        setmetatable: {
            id: crypto.randomUUID(),
            kind: "builtin",
            fn: function(...args) {
                if (args.length !== 2)
                    return { id: crypto.randomUUID(), kind: 'return', value: [{ id: crypto.randomUUID(), kind: 'error', message: 'setmetatable takes 2 arguments' }] };

                let curr = args[0];

                if (curr.kind !== 'table')
                    return { id: crypto.randomUUID(), kind: 'return', value: [{ id: crypto.randomUUID(), kind: 'error', message: 'argument 1 must be of type table' }] };

                let meta = args[1];

                if (meta.kind !== 'table')
                    return { id: crypto.randomUUID(), kind: 'return', value: [{ id: crypto.randomUUID(), kind: 'error', message: 'argument 2 must be of type table' }] };

                curr.metatable = meta;

                return { id: crypto.randomUUID(), kind: 'return', value: [curr] };
            }
        },

        //
    }),
);

export type Lua_Builtin = {
    id: string;
    kind: "builtin";
    fn: Lua_Builtin_Function;
};

type Lua_Builtin_Function = (...args: Lua_Object[]) => Lua_Return;

export type Lua_Function = {
    id: string,
    kind: "function";
    self: Lua_Object | false;
    parameters: (luaparser.Identifier | luaparser.VarargLiteral)[];
    body: luaparser.Statement[];
    environment: Lua_Environment;
};

export type Lua_Return = { id: string, kind: "return"; value: Lua_Object[] };

export type Lua_Identifier = { id: string, kind: "identifier"; name: string };

export type Lua_Error = { id: string, kind: "error"; message: string };

export type Lua_Number = { id: string, kind: "number"; value: number };

export type Lua_Boolean = { id: string, kind: "boolean"; value: boolean };

export type Lua_String = { id: string, kind: "string"; value: string };

export type Lua_Null = { id: string, kind: "null" };

// constants
export const Lua_True: Lua_Boolean = { id: crypto.randomUUID(), kind: "boolean", value: true };
export const Lua_False: Lua_Boolean = { id: crypto.randomUUID(), kind: "boolean", value: false };
export const Lua_Null: Lua_Null = { id: crypto.randomUUID(), kind: "null" };

//TODO delete if value is set to null and do something about the idx is suppsed to be contiguos numeric values
export class Lua_Table {
    id: string;
    kind: "table" = "table";
    store: Map<Lua_Object | string | number, Lua_Object>;
    __index: Lua_Object = Lua_Null
    metatable: Lua_Table | Lua_Null = Lua_Null
    idx: number;

    constructor() {
        this.id = crypto.randomUUID();
        this.store = new Map();
        this.idx = 0;
    }

    setValue(val: Lua_Object): Lua_Null | Lua_Error {
        switch (val.kind) {
            case "string":
            case "number":
            case "boolean":
            case "function":
            case "table":
            case "null":
            case "builtin": {
                this.idx++;
                this.store.set(this.idx, val);
                return Lua_Null;
            }
            case "return": {
                this.idx++;
                this.store.set(this.idx, val.value[0] || Lua_Null);
                return Lua_Null;
            }

            case "error": {
                return { id: crypto.randomUUID(), kind: "error", message: "error cannot be used as value" };
            }
        }
    }

    set(key: Lua_Object, val: Lua_Object): Lua_Null | Lua_Error {
        const delete_key = val.kind === 'null';
        switch (key.kind) {
            // use value
            case "string":
            case "number": {
                if (delete_key) this.store.delete(key.value);
                else this.store.set(key.value, val);
                return Lua_Null;
            }

            // use reference
            case "builtin":
            case "table":
            case "boolean":
            case "function": {
                if (delete_key) this.store.delete(key);
                else this.store.set(key, val);
                return Lua_Null;
            }

            // should not happen
            case "return":
            case "error":
            case "null": {
                return {
                    kind: "error",
                    message: `${key.kind} cannot be used as key heererer`,
                } as Lua_Error;
            }

            default: {
                return {
                    kind: "error",
                    message: `Lua_table key not implemented`,
                } as Lua_Error;
            }
        }
    }

    get(key: Lua_Object): Lua_Object {
        switch (key.kind) {
            case "string":
            case "number": {
                return this.store.get(key.value) || Lua_Null;
            }
            case "boolean":
            case "function":
            case "table":
            case "builtin": {
                return this.store.get(key) || Lua_Null;
            }

            case "error":
            case "return":
            case "null": {
                return {
                    kind: "error",
                    message: `${key.kind} cannot be used as key for table`,
                } as Lua_Error;
            }
        }
    }
}

