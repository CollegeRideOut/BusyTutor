//import type { Lua_Object } from "../interperter/lua_types"

import type { Lua_Object } from '../interperter/lua_types';

let a: Lua_Object | null = null;
void a;

export type Lua_Object_Visualizer = {
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
  clear_indexed?: boolean;
  indexer?: { id: string; type: string; name: string; value: string | number };
  identifier?: { id: string; type: string; name: string; value: any };
};
