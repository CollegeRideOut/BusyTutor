import luaparser from 'luaparse'
export type Lua_Object = Lua_Return | Lua_Error | Lua_Number | Lua_Boolean | Lua_Null | Lua_Function | Lua_String | Lua_Builtin


export class Lua_Environment {
    public kind: 'environment' = 'environment';
    public store: Map<string, Lua_Object>;
    private outer: Lua_Environment | null;

    constructor(outer: Lua_Environment | null = null) {
        this.store = new Map();
        this.outer = outer;
    }


    public get(name: string): [Lua_Object, boolean] {
        let val = this.store.get(name)
        let exist = !!val;
        if (!val && this.outer !== null) {
            exist = false;
            [val, exist] = this.outer.get(name);
        }
        return [val || Lua_Null, exist]
    }

    public set(name: string, val: Lua_Object) {
        this.store.set(name, val)
    }
}

export const builtin: Map<string, Lua_Builtin> = new Map<string, Lua_Builtin>(
    Object.entries({
        //
        'tostring': {
            kind: 'builtin',
            fn: function(...args) {
                if (args.length === 0) {
                    return {
                        kind: 'return',
                        value: [
                            { kind: 'error', message: 'tostring expects 1 arguent' } as Lua_Error
                        ]
                    }
                }

                let obj = args[0];
                switch (obj.kind) {
                    case 'string': {
                        return { kind: 'return', value: [obj] }
                    }
                    case 'number': {
                        return { kind: 'return', value: [{ kind: 'string', value: obj.value.toString() } as Lua_String] }
                    }
                    case 'boolean': {
                        return { kind: 'return', value: [{ kind: 'string', value: obj.value.toString() } as Lua_String] }
                    }
                    case 'function': {
                        return { kind: 'return', value: [{ kind: 'string', value: obj.body.join() } as Lua_String] }
                    }
                    case 'error': {
                        return { kind: 'return', value: [{ kind: 'string', value: obj.message } as Lua_String] }
                    }

                    case 'return': {
                        return this.fn(...obj.value);
                    }
                    case 'null':
                        return { kind: 'return', value: [{ kind: 'string', value: 'nil' } as Lua_String] }
                    case 'builtin':
                    default: {
                        return {
                            kind: 'return',
                            value: [
                                { kind: 'error', message: `tostring not implemented with ${obj.kind} ` } as Lua_Error
                            ]
                        }
                    }
                }
            }
        }
        //
    })
);

export type Lua_Builtin = {
    kind: 'builtin',
    fn: Lua_Builtin_Function
}

type Lua_Builtin_Function = (...args: Lua_Object[]) => Lua_Return

export type Lua_Function = {
    kind: 'function';
    parameters: (luaparser.Identifier | luaparser.VarargLiteral)[],
    body: luaparser.Statement[],
    environment: Lua_Environment
};

export type Lua_Return = { kind: 'return'; value: Lua_Object[]; };

export type Lua_Identifier = { kind: 'identifier'; name: string };

export type Lua_Error = { kind: 'error'; message: string; };

export type Lua_Number = { kind: 'number'; value: number; };

export type Lua_Boolean = { kind: 'boolean'; value: boolean; };

export type Lua_String = { kind: 'string'; value: string; };

export type Lua_Null = { kind: 'null'; };

// constants
export const Lua_True: Lua_Boolean = { kind: 'boolean', value: true };
export const Lua_False: Lua_Boolean = { kind: 'boolean', value: false };
export const Lua_Null: Lua_Null = { kind: 'null' };
