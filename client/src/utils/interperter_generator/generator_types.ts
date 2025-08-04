//import type { Lua_Object } from "../interperter/lua_types"

import type { Lua_Object } from "../interperter/lua_types";

export type Lua_Object_Visualizer = {
    location: {
        start: {
            line: number;
            column: number;
        };
        end: {
            line: number;
            column: number;
        };
    };
    chilld?: Lua_Object_Visualizer[]
    mainString?: string,
    kind: Lua_Object['kind']
    tooltip?: string,
    id: string
}
