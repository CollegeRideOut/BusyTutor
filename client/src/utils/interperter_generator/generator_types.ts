import type { Lua_Object } from "../interperter/lua_types"

export type Lua_Object_Visualizer = {
    loction?: {
        start: {
            line: number;
            column: number;
        };
        end: {
            line: number;
            column: number;
        };
    };
    obj?: Lua_Object
}
