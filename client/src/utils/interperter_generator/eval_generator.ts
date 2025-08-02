// TODO MAKE THIS INTO A FREAKING GENERATOR
import luaparser from "luaparse";
import {
    Lua_Environment,
    Lua_Null,
} from "../interperter/lua_types.ts";
import type {
    Lua_Number,
    Lua_Error,
    Lua_Object,
    Lua_Return,
} from "../interperter/lua_types.ts";
import type { Lua_Object_Visualizer } from "./generator_types.ts";

let Lua_Global_Environment = new Lua_Environment();

export function* evalChunk(node: luaparser.Chunk, environment: Lua_Environment) {
    //TODO
    Lua_Global_Environment = new Lua_Environment();
    let gen = evalStatementsArray(node.body, environment)
    let p: ReturnType<typeof gen.next> = { done: true, value: Lua_Null };
    do {
        p = gen.next();
        yield p.value;
    } while (!p.done);
    //return evalStatementsArray(node.body, environment);
}

export function* evalStatementsArray(
    node: luaparser.Statement[],
    environment: Lua_Environment,
): Generator<Lua_Object_Visualizer, Lua_Object_Visualizer, Lua_Object_Visualizer> {
    //TODO multiple statements now lets just assume one
    for (let statement of node) {
        let gen = evalStatements(statement, environment)

        let lua: ReturnType<typeof gen.next> = { done: true, value: { obj: Lua_Null } }
        do {
            lua = gen.next();

            if (lua.value.obj && (lua.value.obj.kind === "return" || lua.value.obj.kind === "error")) {
                return lua.value;
            }
            yield lua.value;
        } while (!lua.done)
    }

    return { obj: Lua_Null };
}
export function* evalStatements(
    node: luaparser.Statement,
    environment: Lua_Environment,
): Generator<Lua_Object_Visualizer, Lua_Object_Visualizer, Lua_Object_Visualizer> {
    switch (node.type) {
        case "ReturnStatement": {
            let vals: Lua_Object[] = [];
            for (let exp of node.arguments) {
                const gen = evalExpression(exp, environment)
                let obj: ReturnType<typeof gen.next> = { done: true, value: { obj: Lua_Null } }
                do {
                    obj = gen.next();
                    if (!obj.value.obj) { yield obj.value; continue; }
                    if (obj.value.obj.kind === "error") return { obj: obj.value.obj, loction: node.loc };
                    // unwrapping returns
                    if (obj.value.obj.kind === "return") vals.push(...obj.value.obj.value);
                    else vals.push(obj.value.obj);
                    yield obj.value
                } while (!obj.done)
            }
            return { obj: { kind: "return", value: vals } as Lua_Return, loction: node.loc }
        }
        default: {
            return {
                loction: node.loc,
                obj: {
                    kind: "error",
                    message: `${node.type} statement not implemented`,
                } as Lua_Error
            };
        }
    }
}


export function* evalExpression(
    exp: luaparser.Expression,
    environment: Lua_Environment,
): Generator<Lua_Object_Visualizer, Lua_Object_Visualizer, Lua_Object_Visualizer> {
    void environment
    switch (exp.type) {
        case "NumericLiteral": {
            let v = {
                obj: { kind: "number", value: exp.value } as Lua_Number,
                location: exp.loc
            } as Lua_Object_Visualizer;
            return v
        }
        default: {
            return {
                obj: {
                    kind: "error",
                    message: `${exp.type} not implemented`,
                } as Lua_Error

            } as Lua_Object_Visualizer;
        }
    }
}
