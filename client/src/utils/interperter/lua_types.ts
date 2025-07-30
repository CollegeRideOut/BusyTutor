import luaparser from 'luaparse'
export type Lua_Object = Lua_Return | Lua_Error | Lua_Number | Lua_Boolean | Lua_Null | Lua_Function;


export class Lua_Environment {
    public kind: 'environment' = 'environment';
    public store: Map<string, Lua_Object>;
    private outer: Lua_Environment | null;

    constructor(outer: Lua_Environment | null = null) {
        this.store = new Map();
        this.outer = outer;
    }

    public get(name: string): Lua_Object {
        let val = this.store.get(name)
        if (!val && this.outer !== null) {
            val = this.outer.get(name);
        }

        return val || Lua_Null;
    }
    public set(name: string, val: Lua_Object) {
        this.store.set(name, val)
    }
}


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

export type Lua_Null = { kind: 'null'; };

// constants
export const Lua_True: Lua_Boolean = { kind: 'boolean', value: true };
export const Lua_False: Lua_Boolean = { kind: 'boolean', value: false };
export const Lua_Null: Lua_Null = { kind: 'null' };
