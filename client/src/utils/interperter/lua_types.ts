export type Lua_Number = {
    kind: 'number';
    value: number;
    inspect: () => number
};

export type Lua_Boolean = {
    kind: 'boolean'
    value: boolean
};

export type Lua_Null = {
    kind: 'null'
};
