export type Lua_Object = Lua_Return | Lua_Error | Lua_Number | Lua_Boolean | Lua_Null

export type Lua_Return = { kind: 'return'; value: Lua_Object[]; };

export type Lua_Error = { kind: 'error'; message: string; };

export type Lua_Number = { kind: 'number'; value: number; };

export type Lua_Boolean = { kind: 'boolean'; value: boolean; };

export type Lua_Null = { kind: 'null'; };
