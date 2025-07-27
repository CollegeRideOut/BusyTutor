export type Lua_Integer = {
    kind: 'integer';
    value: number;
};

export type Lua_Boolean = {
    kind: 'boolean'
    value: boolean
};

export type Lua_Null = {
    kind: 'null'
};
