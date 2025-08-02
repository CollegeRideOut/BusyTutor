import { expect, test } from "vitest";
import { evalChunk } from "./eval_generator";
import luaparser from 'luaparse'
import { Lua_Environment } from "../interperter/lua_types";


test('Generator First test', () => {
    let a = evalChunk(luaparser.parse(`
      a = 1
      return 1`), new Lua_Environment())
    a.next()
    a.next()
    expect(a.next()).toBe(1);
})
