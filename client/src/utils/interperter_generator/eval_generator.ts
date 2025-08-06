// TODO MAKE THIS INTO A FREAKING GENERATOR
import luaparser from "luaparse";
import {
    Lua_Environment,
    builtin,
    Lua_False,
    Lua_Null,
    Lua_True,
    Lua_Table,
} from "../interperter/lua_types.ts";
import { parseLongString } from "../interperter/eval.ts";
import type {
    Lua_Builtin,
    Lua_Error,
    Lua_Function,
    Lua_Number,
    Lua_Object,
    Lua_Return,
    Lua_String,
} from "../interperter/lua_types.ts";
import type { Lua_Object_Visualizer } from "./generator_types.ts";



// TODO add this to the og one
export function setGLobalEnvironmentGenerator(env: Lua_Environment) {
    Lua_Global_Environment = env;
}
export let Lua_Global_Environment = new Lua_Environment();

export function evalChunkTestHelper(node: luaparser.Chunk, environment: Lua_Environment) {
    const g = evalChunk(node, environment);
    let v: ReturnType<typeof g.next> = { done: true, value: Lua_Null }
    do { v = g.next(); } while (!v.done);
    return v.value;
}

export function* evalChunk(node: luaparser.Chunk, environment: Lua_Environment): Generator<
    [Lua_Object_Visualizer | null, Lua_Environment],
    Lua_Object,
    [Lua_Object_Visualizer | null, Lua_Environment]
> {
    //TODO
    let gen = evalStatementsArray(node.body, environment)
    let p: ReturnType<typeof gen.next> = { done: true, value: [null, Lua_Null] };
    do {
        p = gen.next();
        if (!p.value) continue;
        yield [p.value[0], environment];
    } while (!p.done);
    return p.value![1]
}

export function* evalStatementsArray(
    node: luaparser.Statement[],
    environment: Lua_Environment,
): Generator<[Lua_Object_Visualizer | null, Lua_Object], [Lua_Object_Visualizer | null, Lua_Object], [Lua_Object_Visualizer, Lua_Object] | undefined> {
    //TODO multiple statements now lets just assume one
    for (let statement of node) {
        let gen = evalStatements(statement, environment)

        let lua: ReturnType<typeof gen.next> = { done: true, value: [null, Lua_Null] }
        do {
            lua = gen.next();
            yield lua.value;
        } while (!lua.done)

        let obj = lua.value[1];
        if (obj.kind === "return" || obj.kind === "error") {
            return [null, obj];
        }
    }

    return [null!, Lua_Null];
}
export function* evalStatements(
    node: luaparser.Statement,
    environment: Lua_Environment,
): Generator<
    [Lua_Object_Visualizer | null, Lua_Object],
    [Lua_Object_Visualizer | null, Lua_Object],
    [Lua_Object_Visualizer | null, Lua_Object]
> {

    let id = `${node.loc!.start.line}-${node.loc!.end.line} | ${node.loc!.start.column}-${node.loc!.end.column}`
    void id
    switch (node.type) {
        case "ReturnStatement": {
            let vals: Lua_Object[] = [];
            for (let exp of node.arguments) {
                const gen = evalExpression(exp, environment)
                let visualiser: ReturnType<typeof gen.next> = { done: true, value: [null, Lua_Null] }
                do {
                    visualiser = gen.next();
                    yield visualiser.value;
                } while (!visualiser.done)
                let obj = visualiser.value[1]
                if (obj.kind === "error") return visualiser.value;
                if (obj.kind === "return") vals.push(...obj.value);
                else vals.push(obj);
            }

            return [
                null,
                { id: crypto.randomUUID(), kind: "return", value: vals } satisfies Lua_Return
            ]
        }
        case "IfStatement": {
            for (const clause of node.clauses) {
                const gen = evalClause(clause, environment)
                let visual_obj: ReturnType<typeof gen.next> = { done: true, value: [null, [false, Lua_Null]] }
                do {
                    visual_obj = gen.next();
                    if (!visual_obj.done) {
                        yield visual_obj.value;
                    }
                } while (!visual_obj.done);

                const [t, obj] = visual_obj.value[1];
                if (obj.kind === "error") return [visual_obj.value[0], obj];
                if (t) return [visual_obj.value[0], obj];
            }
            return [null, Lua_Null];
        }

        // TODO some visuals 
        case "LocalStatement": {
            const vals: Lua_Object[] = [];
            for (let v of node.init) {
                const gen = evalExpression(v, environment);
                let visual_obj: ReturnType<typeof gen.next> = { done: true, value: [null, Lua_Null] };
                do {
                    visual_obj = gen.next();
                    yield visual_obj.value;
                } while (!visual_obj.done);
                let val = visual_obj.value[1];
                if (val.kind === "error") return [null, val];
                if (val.kind === "return") vals.push(...val.value);
                else vals.push(val);
            }
            while (true) {
                if (vals.length >= node.variables.length) break;
                vals.push(Lua_Null);
            }

            for (let i = 0; i < node.variables.length; i++) {

                const gen = evalAssignment(node.variables[i], vals[i], environment, false);
                let value_obj: ReturnType<typeof gen.next> = { done: true, value: [null, Lua_Null] };
                do {
                    value_obj = gen.next();
                } while (!value_obj.done);

                const e = value_obj.value[1];
                if (e.kind === "error") return [null, e];
            }

            return [null, Lua_Null];
        }

        case "AssignmentStatement": {
            const vals: Lua_Object[] = [];
            for (let v of node.init) {

                const gen_val = evalExpression(v, environment);
                let visual_val: ReturnType<typeof gen_val.next> = { done: true, value: [null, Lua_Null] }
                do {
                    visual_val = gen_val.next();
                    yield visual_val.value;
                } while (!visual_val.done);
                let val = visual_val.value[1]
                if (val.kind === "error") return [null, val];
                // TODO idk if this is good unwrapping return
                if (val.kind === "return") vals.push(...val.value);
                else vals.push(val);
            }
            while (true) {
                if (vals.length >= node.variables.length) break;
                vals.push(Lua_Null);
            }

            for (let i = 0; i < node.variables.length; i++) {

                const gen_e = evalAssignment(
                    node.variables[i],
                    vals[i],
                    environment,
                    true
                );
                let visual_e: ReturnType<typeof gen_e.next> = { done: true, value: [null, Lua_Null] };
                do {
                    visual_e = gen_e.next()
                    yield visual_e.value;
                } while (!visual_e.done)

                let e = visual_e.value[1];
                if (e.kind === "error") return [null, e];
            }

            return [null, Lua_Null];
        }

        case "FunctionDeclaration": {

            const func = {
                id: crypto.randomUUID(),
                kind: "function",
                self: false,
                body: node.body,
                parameters: node.parameters,
                environment: environment,
            } satisfies Lua_Function;
            if (node.identifier) {

                let gen = evalAssignment(node.identifier, func, environment, false);
                let visual_obj: ReturnType<typeof gen.next> = { done: true, value: [null, Lua_Null] };
                do {
                    visual_obj = gen.next();
                    yield visual_obj.value;
                } while (!visual_obj.done);
            }
            return [null, func];
        }

        case "CallStatement": {

            let gen = evalExpression(node.expression, environment);
            let visual_obj: ReturnType<typeof gen.next> = { done: true, value: [null, Lua_Null] };
            do {
                visual_obj = gen.next();
                yield visual_obj.value;
            } while (!visual_obj.done);
            return visual_obj.value;
        }

        case "ForNumericStatement": {

            let gen_start = evalExpression(node.start, environment);
            let visual_start: ReturnType<typeof gen_start.next> = { done: true, value: [null, Lua_Null] }
            do {
                visual_start = gen_start.next();
                yield visual_start.value;
            } while (!visual_start.done);

            let start = visual_start.value[1];
            if (start.kind === "return") start = start.value[0] || Lua_Null;
            if (start.kind === "error") return [null, start];
            if (start.kind !== "number") {
                return [
                    null,
                    {
                        id: crypto.randomUUID(),
                        kind: "error",
                        message: `${start.kind} cannot be used in a numeric for loop`,
                    } satisfies Lua_Error
                ];
            }

            let gen_obj = evalAssignment(node.variable, start, environment, false);
            let visual_obj: ReturnType<typeof gen_obj.next> = { done: true, value: [null, Lua_Null] }
            do {
                visual_obj = gen_obj.next();
                yield visual_obj.value;
            } while (!visual_obj.done);

            let [start_obj, exist] = environment.get(node.variable.name);
            if (!exist) {
                return [null,
                    {
                        id: crypto.randomUUID(),
                        kind: "error",
                        message: `${node.variable.name} does not exist interperter error`,
                    } satisfies Lua_Error
                ];
            }
            if (start_obj.kind === "error") return [null, start_obj];
            if (start_obj.kind !== "number") {
                return [
                    null,
                    {
                        id: crypto.randomUUID(),
                        kind: "error",
                        message: `${start_obj.kind} shoudve been a number interpert error`,
                    } satisfies Lua_Error
                ];
            }


            let gen_end = evalExpression(node.end, environment);
            let visual_end: ReturnType<typeof gen_end.next> = { done: true, value: [null, Lua_Null] }
            do {
                visual_end = gen_end.next();
                yield visual_end.value;
            } while (!visual_end.done);
            let end = visual_end.value[1];
            if (end.kind === "return") end = end.value[0] || Lua_Null;
            if (end.kind === "error") return [null, end];
            if (end.kind !== "number") {
                return [
                    null,
                    {
                        id: crypto.randomUUID(),
                        kind: "error",
                        message: `${end.kind} cannot be used in a numeric for loop`,
                    } satisfies Lua_Error
                ];
            }

            let step: Lua_Object = { id: crypto.randomUUID(), kind: "number", value: 1 };
            if (node.step) {

                const gen_step = evalExpression(node.step, environment)
                let visual_step: ReturnType<typeof gen_step.next> = { done: true, value: [null, Lua_Null] };
                do {
                    visual_step = gen_step.next();
                    yield visual_step.value
                } while (!visual_step.done);
                step = visual_step.value[1]
            }

            if (step.kind === "return") step = step.value[0] || Lua_Null;
            if (step.kind === "error") return [null, step];
            if (step.kind !== "number") {
                return [
                    null,
                    {
                        id: crypto.randomUUID(),
                        kind: "error",
                        message: `${end.kind} cannot be used in a numeric for loop`,
                    } satisfies Lua_Error
                ];
            }

            let i = start.value;

            while (
                (step.value > 0 && i <= end.value) ||
                (step.value < 0 && i >= end.value)
            ) {
                environment.set(node.variable.name, {
                    id: crypto.randomUUID(),
                    kind: "number",
                    value: i,
                } satisfies Lua_Number);

                const gen_body = evalStatementsArray(node.body, environment);
                let visual_body: ReturnType<typeof gen_body.next> = { done: true, value: [null, Lua_Null] };
                do {
                    visual_body = gen_body.next()
                    yield visual_body.value
                } while (!visual_body.done);
                const body = visual_body.value[1];

                if (body.kind === "error" || body.kind === "return") return [null, body];
                i += step.value;
            }
            return [null, Lua_Null];
        }

        default: {
            return [
                null, {
                    id: crypto.randomUUID(),
                    kind: "error",
                    message: `${node.type} statement not implemented`,
                } satisfies Lua_Error
            ];
        }
    }
}

export function* evalClause(
    clause: luaparser.IfClause | luaparser.ElseifClause | luaparser.ElseClause,
    environment: Lua_Environment,
): Generator<
    [Lua_Object_Visualizer, Lua_Object] |
    [Lua_Object_Visualizer | null, Lua_Object],
    [Lua_Object_Visualizer | null, [boolean, Lua_Object]],
    any
> {

    //TODO some visuals
    let id = `${clause.loc!.start.line}-${clause.loc!.end.line} | ${clause.loc!.start.column}-${clause.loc!.end.column}`
    void id;
    switch (clause.type) {
        case "ElseClause": {
            const gen = evalStatementsArray(clause.body, environment);
            let visuals: ReturnType<typeof gen.next> = { done: true, value: [null, Lua_Null] }
            do {
                visuals = gen.next();
                yield visuals.value!
            } while (!visuals.done);
            if (!visuals.value) { throw Error('ElseClase we shold have a value') }

            return [visuals.value[0], [true, visuals.value![1]]];

        }
        default: {
            const gen = evalExpression(clause.condition, environment);
            let visuals: ReturnType<typeof gen.next> = { done: true, value: [null, Lua_Null] };
            do {
                visuals = gen.next();
                yield visuals.value || [null, Lua_Null];
            } while (!visuals.done);
            let condition = visuals.value[1]
            if (condition.kind === "error") return [null, [false, condition]];
            if (isThruthy(condition).value === false) return [null, [false, Lua_Null]];
            else {
                let gen_statement = evalStatementsArray(clause.body, environment);
                let visuals_statement: ReturnType<typeof gen_statement.next> = { done: true, value: [null, Lua_Null] };
                do {
                    visuals_statement = gen_statement.next();
                    yield visuals_statement.value;
                } while (!visuals_statement.done);
                let obj = visuals_statement.value[1]

                return [visuals.value[0], [true, obj]]
            };
        }
    }
}
export function isThruthy(arg: Lua_Object) {
    switch (arg.kind) {
        case "boolean": {
            return arg.value ? Lua_True : Lua_False;
        }
        case "null": {
            return Lua_False;
        }
        default: {
            return Lua_False;
            //throw Error(`Not operator has not implemented ${(arg as any).kind}`)
            //return Lua_Null;
        }
    }
}

export function* evalExpression(
    exp: luaparser.Expression,
    environment: Lua_Environment,
): Generator<[Lua_Object_Visualizer | null, Lua_Object], [Lua_Object_Visualizer | null, Lua_Object], Lua_Object_Visualizer> {
    void environment

    let id = `${exp.loc!.start.line}-${exp.loc!.end.line} | ${exp.loc!.start.column}-${exp.loc!.end.column}`
    void id
    switch (exp.type) {

        case "NumericLiteral": {
            return [
                null,
                { id: crypto.randomUUID(), kind: "number", value: exp.value } satisfies Lua_Number
            ];
        }

        case "BooleanLiteral": {
            return [null, exp.value ? Lua_True : Lua_False];
        }

        case "StringLiteral": {
            let val = "";
            if (exp.raw[0] === "'" || exp.raw[0] === '"') {
                for (let i = 1; i < exp.raw.length - 1; i++) {
                    val += exp.raw[i];
                }
            } else {
                val = parseLongString(exp.raw);
            }
            return [null, { id: crypto.randomUUID(), kind: "string", value: val } satisfies Lua_String];
        }
        case "NilLiteral": {
            return [null, Lua_Null];
        }
        case "UnaryExpression": {
            const gen_arg = evalExpression(exp.argument, environment);
            let visual_arg: ReturnType<typeof gen_arg.next> = { done: true, value: [null, Lua_Null] };
            do {
                visual_arg = gen_arg.next();
                yield visual_arg.value;
            } while (!visual_arg.done);
            const arg = visual_arg.value[1];
            if (arg.kind === "error") return [null, arg];

            return [null, evalUnaryExpression(exp.operator, arg)];
        }
        case "BinaryExpression": {
            const gen_left = evalExpression(exp.left, environment);
            let visual_left: ReturnType<typeof gen_left.next> = { done: true, value: [null, Lua_Null] }
            do {
                visual_left = gen_left.next()
                yield visual_left.value;
            } while (!visual_left.done);
            let left = visual_left.value[1];
            if (left.kind === "return") left = left.value[0] || Lua_Null;
            if (left.kind === "error") return [null, left];

            const gen_right = evalExpression(exp.right, environment);
            let visual_right: ReturnType<typeof gen_right.next> = { done: true, value: [null, Lua_Null] }
            do {
                visual_right = gen_right.next();
                yield visual_right.value;
            } while (!visual_right.done);
            let right = visual_right.value[1];
            if (right.kind === "return") right = right.value[0] || Lua_Null;
            if (right.kind === "error") return [null, right];

            return [null, evalBinaryExpression(exp.operator, left, right)];
        }

        // TODO visuals?
        case "Identifier": {
            let [val, exist] = environment.get(exp.name);
            let v = { indexer: { id: val.id, name: exp.name, type: 'indentifier', value: '', } } satisfies Lua_Object_Visualizer
            switch (val.kind) {
                case 'number': {
                    v.indexer!.value = String(val.value);
                }
            }
            if (exist) return [v, val];

            [val, exist] = Lua_Global_Environment.get(exp.name);
            switch (val.kind) {
                case 'number': {
                    v.indexer!.value = String(val.value);
                }
            }

            if (exist) return [v, val];

            let val_builtin = builtin.get(exp.name);
            if (!val_builtin) return [null, Lua_Null];
            return [null, val_builtin];
        }

        case "CallExpression": {
            const gen_func = evalExpression(exp.base, environment);
            let visual_func: ReturnType<typeof gen_func.next> = { done: true, value: [null, Lua_Null] };
            do {
                visual_func = gen_func.next();
                yield visual_func.value;
            } while (!visual_func.done);
            let func = visual_func.value[1];
            if (func.kind === "error") return [null, func];
            if (func.kind !== "function" && func.kind !== "builtin")
                return [null, {
                    id: crypto.randomUUID(),
                    kind: "error",
                    message: `${func.kind} is supposed to be a function`,
                } satisfies Lua_Error];

            const args: Lua_Object[] = [];
            if (func.kind === "function") {
                if (func.self) args.push(func.self);
            }

            for (let a of exp.arguments) {
                const gen_arg = evalExpression(a, environment);;
                let visual_arg: ReturnType<typeof gen_arg.next> = { done: true, value: [null, Lua_Null] };
                do {
                    visual_arg = gen_arg.next()
                    yield visual_arg.value
                } while (!visual_arg.done);
                const arg = visual_arg.value[1];
                if (arg.kind === "error") return [null, arg];
                args.push(arg);
            }

            if (func.kind === "function") {
                if (func.self) func.self = false;
            }

            const gen_obj = applyFunction(func, args);
            let visual_obj: ReturnType<typeof gen_obj.next> = { done: true, value: [null, Lua_Null] };
            do {
                visual_obj = gen_obj.next()
                yield visual_obj.value
            } while (!visual_obj.done);

            return visual_obj.value
        }

        case "FunctionDeclaration": {
            const func = {
                id: crypto.randomUUID(),
                kind: "function",
                self: false,
                body: exp.body,
                parameters: exp.parameters,
                environment: environment,
            } satisfies Lua_Function;
            if (exp.identifier) {
                const gen_obj = evalAssignment(exp.identifier, func, environment, true);
                let visual_obj: ReturnType<typeof gen_obj.next> = { done: true, value: [null, Lua_Null] }
                do {
                    visual_obj = gen_obj.next();
                    yield visual_obj.value;
                } while (!visual_obj.value);
            }
            return [null, func];
        }

        case "TableConstructorExpression": {
            let t = new Lua_Table();
            for (const field of exp.fields) {
                const gen_key_val = evalTableField(field, environment);
                let visual_key_val: ReturnType<typeof gen_key_val.next> = { done: true, value: [null, [Lua_Null, Lua_Null]] }
                do {
                    visual_key_val = gen_key_val.next();
                    if (!visual_key_val.done) {
                        yield visual_key_val.value;
                    }
                } while (!visual_key_val.done);
                const [key, val] = visual_key_val.value[1];
                if (key.kind === "error") return [null, key];
                if (val.kind === "error") return [null, val];
                if (key.kind === "null") t.setValue(val);
                else t.set(key, val);
            }
            return [null, t];
        }

        case "IndexExpression": {
            const gen_identifier = evalExpression(exp.base, environment);
            let visual_identifier: ReturnType<typeof gen_identifier.next> = { done: true, value: [null, Lua_Null] };
            do {
                visual_identifier = gen_identifier.next();
                yield [null, Lua_Null];

            } while (!visual_identifier.done);
            const identifier = visual_identifier.value[1];
            if (identifier.kind === "error") return [null, identifier];
            if (identifier.kind !== "table") {
                return [
                    null,
                    {
                        id: crypto.randomUUID(),
                        kind: "error",
                        message: `${identifier.kind} cannot be indexed`,
                    } satisfies Lua_Error
                ];
            }



            let gen_idx = evalExpression(exp.index, environment);
            let visual_idx: ReturnType<typeof gen_idx.next> = { done: true, value: [null, Lua_Null] };
            do {
                visual_idx = gen_idx.next();
                yield [null, Lua_Null];
            } while (!visual_idx.done);

            let idx = visual_idx.value[1];

            if (idx.kind === "return") idx = idx.value[0] || Lua_Null;
            if (idx.kind === "error") return [null, idx];
            if (idx.kind === "null") {
                return [
                    null,
                    {
                        id: crypto.randomUUID(),
                        kind: "error",
                        message: "nil cannot be used as index for table",
                    } satisfies Lua_Error
                ];
            }
            let v = null

            const val = identifier.get(idx);
            if (visual_idx.value[0] && visual_identifier.value[0]) {
                v = {
                    identifier: {
                        id: visual_identifier.value[0]!.indexer!.id,
                        type: 'identifier',
                        name: visual_identifier.value[0]!.indexer!.name,
                        value: val.id,
                    },
                    indexer: {
                        id: visual_idx.value[0]!.indexer!.id,
                        type: 'identifier',
                        name: visual_idx.value[0]!.indexer!.name,
                        value: visual_idx.value[0]!.indexer!.value,
                    },

                } satisfies Lua_Object_Visualizer
            }

            return [v, val];
        }

        case "MemberExpression": {
            const gen_identifier = evalExpression(exp.base, environment);
            let visual_identifier: ReturnType<typeof gen_identifier.next> = { done: true, value: [null, Lua_Null] };
            do {
                visual_identifier = gen_identifier.next();
                yield visual_identifier.value;
            } while (!visual_identifier.done);

            const identifier = visual_identifier.value[1];
            if (identifier.kind === "error") return [null, identifier];
            if (identifier.kind !== "table") {
                return [
                    null,
                    {
                        id: crypto.randomUUID(),
                        kind: "error",
                        message: `${identifier.kind} cannot be indexed`,
                    } satisfies Lua_Error
                ];
            }

            if (exp.indexer === ".") {
                const val = identifier.get({
                    id: crypto.randomUUID(),
                    kind: "string",
                    value: exp.identifier.name,
                } satisfies Lua_String);
                if (val.kind !== 'null') return [null, val]
                if (identifier.metatable.kind !== 'table') return [null, val];

                const __index = identifier.metatable.get({
                    id: crypto.randomUUID(),
                    kind: "string",
                    value: '__index',
                } satisfies Lua_String)

                if (__index.kind === 'null') return [null, Lua_Null];

                if (__index.kind === 'function') {
                    let gen_obj = applyFunction(
                        __index,
                        [
                            identifier,
                            {
                                id: crypto.randomUUID(),
                                kind: "string",
                                value: exp.identifier.name,
                            } satisfies Lua_String
                        ]
                    )
                    let visual_obj: ReturnType<typeof gen_obj.next> = { done: true, value: [null, Lua_Null] };
                    do {
                        visual_obj = gen_obj.next();
                        yield visual_obj.value;
                    } while (!visual_obj.done);

                    return visual_obj.value;
                }
                if (__index.kind !== 'table')
                    return ([
                        null,
                        {
                            id: crypto.randomUUID(), kind: 'error',
                            message: "__index should be table"
                        } satisfies Lua_Error
                    ]);

                return ([
                    null,
                    __index.get({
                        id: crypto.randomUUID(),
                        kind: "string",
                        value: exp.identifier.name,
                    } satisfies Lua_String)
                ]);

            } else {
                const val = identifier.get({
                    id: crypto.randomUUID(),
                    kind: "string",
                    value: exp.identifier.name,
                } satisfies Lua_String);


                if (val.kind !== 'function' && val.kind !== 'null') {
                    return (
                        [
                            null,
                            {
                                id: crypto.randomUUID(),
                                kind: 'error',
                                message: 'member : can olny be used on functions'
                            } satisfies Lua_Error
                        ]
                    )
                }
                if (val.kind === 'function') {
                    val.self = identifier;
                    return [null, val];
                }

                if (identifier.metatable.kind !== 'table') return [null, val];
                const __index = identifier.metatable.get({
                    id: crypto.randomUUID(),
                    kind: "string",
                    value: '__index',
                } satisfies Lua_String)

                if (__index.kind === 'null') return [null, Lua_Null];
                if (__index.kind === 'function') {
                    __index.self = identifier;
                    // TODO should not have to call the function since idxer : always come from call expression
                    return [null, __index]
                }
                if (__index.kind !== 'table')
                    return (
                        [
                            null,
                            {
                                id: crypto.randomUUID(),
                                kind: 'error',
                                message: "__index should be table or function"
                            } satisfies Lua_Error
                        ]
                    );

                let func = __index.get({
                    id: crypto.randomUUID(),
                    kind: "string",
                    value: exp.identifier.name,
                } satisfies Lua_String);

                if (func.kind !== 'function' && func.kind !== 'null') {
                    return (
                        [
                            null,
                            {
                                id: crypto.randomUUID(),
                                kind: 'error',
                                message: 'member : can olny be used on functions'
                            } satisfies Lua_Error
                        ]
                    );
                }
                if (func.kind === 'null') return [null, Lua_Null];
                func.self = identifier;
                return [null, func];

            }
            //return { kind: 'error', message: `indexer : not implemented` } as Lua_Error
        }

        default: {
            return (
                [
                    null,
                    {
                        id: crypto.randomUUID(),
                        kind: "error",
                        message: `${exp.type} not implemented`,
                    } satisfies Lua_Error
                ]
            );
        }
    }
}

export function* evalAssignment(
    exp:
        | luaparser.Identifier
        | luaparser.MemberExpression
        | luaparser.IndexExpression,
    val: Lua_Object,
    environment: Lua_Environment,
    global: boolean
): Generator<
    [Lua_Object_Visualizer | null, Lua_Null | Lua_Object],
    [Lua_Object_Visualizer | null, Lua_Null | Lua_Error],
    any
> {
    //TODO add viuals. Here we can do an animation 
    switch (exp.type) {
        case "Identifier":
            return [null, evalIdentiferAssignment(exp, val, environment, global)];
        case "IndexExpression":
            const gen = evalExpression(exp.base, environment);
            let visual_obj: ReturnType<typeof gen.next> = { done: true, value: [null, Lua_Null] };
            do {
                visual_obj = gen.next();
                yield visual_obj.value;
            } while (!visual_obj.done);
            const identifier = visual_obj.value[1];

            if (identifier.kind === "error") return [null, identifier];
            if (identifier.kind !== "table")
                return (
                    [
                        null,
                        {

                            id: crypto.randomUUID(),
                            kind: "error",
                            message: `${identifier.kind} cannot be indexed`,
                        } satisfies Lua_Error
                    ]);

            const gen_idx = evalExpression(exp.index, environment);
            let visual_obj_idx: ReturnType<typeof gen_idx.next> = { done: true, value: [null, Lua_Null] };
            do {
                visual_obj_idx = gen_idx.next();
                yield visual_obj_idx.value
            } while (!visual_obj_idx.done);

            let idx = visual_obj_idx.value[1];

            if (idx.kind === "return") idx = idx.value[0] || Lua_Null;
            if (idx.kind === "error") return [null, idx];
            if (idx.kind === "null") {
                return (
                    [
                        null,
                        {
                            id: crypto.randomUUID(),
                            kind: "error",
                            message: "nil cannot be used as index for table",
                        } satisfies Lua_Error
                    ]
                );
            }
            //
            identifier.set(idx, val);
            return [null, Lua_Null];
        case "MemberExpression": {
            const gen_identifier = evalExpression(exp.base, environment)
            let visual_identifier: ReturnType<typeof gen_identifier.next> = { done: true, value: [null, Lua_Null] }
            do {
                visual_identifier = gen_identifier.next();
                yield visual_identifier.value;
            } while (!visual_identifier.done);

            const identifier = visual_identifier.value[1];
            if (identifier.kind === "error") return [null, identifier];
            if (identifier.kind !== "table") {
                return (
                    [
                        null,
                        {
                            id: crypto.randomUUID(),
                            kind: "error",
                            message: `${identifier.kind} cannot be indexed`,
                        } satisfies Lua_Error
                    ]
                );
            }

            if (exp.indexer === ":") {
                if (val.kind !== 'function') {
                    return (
                        [
                            null,
                            {
                                id: crypto.randomUUID(),
                                kind: 'error',
                                message: `member ':' is used on functons not${val.kind}`
                            } satisfies Lua_Error
                        ]
                    );
                }
                val.parameters.unshift({ name: 'self', type: 'Identifier' })
                identifier.set({
                    id: crypto.randomUUID(), kind: 'string', value: exp.identifier.name
                } satisfies Lua_String, val);
            } else {
                identifier.set({
                    id: crypto.randomUUID(),
                    kind: 'string', value: exp.identifier.name
                } satisfies Lua_String, val);
            }

            return [null, Lua_Null];
        }

        default: {
            return [
                null,
                {
                    id: crypto.randomUUID(),
                    kind: "error",
                    message: `AssignmentStatement of  not implemented`,
                } satisfies Lua_Error
            ];
        }
    }
}

// TODO do i need to ad visuals here?
export function evalIdentiferAssignment(
    id: luaparser.Identifier,
    val: Lua_Object,
    environment: Lua_Environment,
    global: boolean
) {
    switch (val.kind) {
        case "return": {
            return { id: crypto.randomUUID(), kind: "error", message: "cant assing an return?" } satisfies Lua_Error;
        }
        case "error": {
            return val;
        }
        default: {
            // TODO we can visual here to make gloabal like puff up and down
            if (global) Lua_Global_Environment.set(id.name, val);
            else environment.set(id.name, val);
            return Lua_Null;
        }
    }
}


//TODO generator? with some visuals?
export function evalUnaryExpression(
    operator: "not" | "-" | "~" | "#",
    arg: Lua_Object,
) {
    switch (operator) {
        case "not": {
            return evalNotOperator(arg);
        }
        case "-": {
            return evalUnaryMinuesOperator(arg);
        }
        case "#": {
            return evalUnaryLengthOperator(arg);
        }
        case "~":
        default: {
            return {
                id: crypto.randomUUID(),
                kind: "error",
                message: `${operator}$ not implemented`,
            } satisfies Lua_Error;
            //return Lua_Null`
        }
    }
}

//TODO generator? with some visuals?
export function evalNotOperator(arg: Lua_Object) {
    //TODO switchit to use isThruthy waiting for now
    switch (arg.kind) {
        case "boolean": {
            return arg.value ? Lua_False : Lua_True;
        }
        case "null": {
            return Lua_True;
        }
        default: {
            return Lua_False;
            //throw Error(`Not operator has not implemented ${(arg as any).kind}`)
            //return Lua_Null;
        }
    }
}
//TODO generator? visuals?
export function evalUnaryLengthOperator(arg: Lua_Object) {
    switch (arg.kind) {
        case "string":
            return { id: crypto.randomUUID(), kind: "number", value: arg.value.length } satisfies Lua_Number;
        case "table":
            return { id: crypto.randomUUID(), kind: "number", value: arg.idx } satisfies Lua_Number;
        default: {
            return {
                id: crypto.randomUUID(),
                kind: "error",
                message: `type missmatch #${arg.kind}`,
            } satisfies Lua_Error;
        }
    }
}

//TODO generator? visuals?
export function evalUnaryMinuesOperator(arg: Lua_Object) {
    switch (arg.kind) {
        case "number": {
            return { id: crypto.randomUUID(), kind: "number", value: -arg.value } satisfies Lua_Number;
        }
        //TODO string are coerced into integers
        default: {
            return {
                id: crypto.randomUUID(),
                kind: "error",
                message: `type missmatch -${arg.kind}`,
            } satisfies Lua_Error;
        }
    }
}

type Binary_Opereators =
    "-"
    | "~"
    | "+"
    | "*"
    | "%"
    | "^"
    | "/"
    | "//"
    | "&"
    | "|"
    | "<<"
    | ">>"
    | ".."
    | "~="
    | "=="
    | "<"
    | "<="
    | ">"
    | ">=";

export function evalBinaryExpression(
    operator: Binary_Opereators,
    left: Lua_Object,
    right: Lua_Object,
) {
    switch (true) {
        case (
            (left.kind === "number" || left.kind === "string") &&
            (right.kind === "number" || right.kind === "string")
        ): {
                return evalIntegerorStringBinaryExpression(operator, left, right);
            }
        // TODO strings and more
        default: {
            return {
                id: crypto.randomUUID(),
                kind: "error",
                message: `type missmatch ${left.kind} ${operator} ${right.kind}`,
            } satisfies Lua_Error;

            //return Lua_Null
        }
    }
}

//TODO visual? generator?
export function evalIntegerorStringBinaryExpression(
    operator: Binary_Opereators,
    left: Lua_Object,
    right: Lua_Object,
) {
    //TODO there was an error;
    if (
        (left.kind !== "number" && left.kind !== "string") ||
        (right.kind !== "number" && right.kind !== "string")
    )
        return {
            id: crypto.randomUUID(),
            kind: "error",
            message: `type missmatch ${left.kind} ${operator} ${right.kind}`,
        } satisfies Lua_Error;

    //TODO bunch of opeartions todo and chekcout //
    const nleft = left.kind === "number" ? left.value : parseFloat(left.value);
    const nright =
        right.kind === "number" ? right.value : parseFloat(right.value);
    switch (operator) {
        // arimethic
        case "+": {
            return { id: crypto.randomUUID(), kind: "number", value: nleft + nright } satisfies Lua_Number;
        }
        case "-": {
            return { id: crypto.randomUUID(), kind: "number", value: nleft - nright } satisfies Lua_Number;
        }
        case "*": {
            return { id: crypto.randomUUID(), kind: "number", value: nleft * nright } satisfies Lua_Number;
        }
        case "/": {
            return { id: crypto.randomUUID(), kind: "number", value: nleft / nright } satisfies Lua_Number;
        }
        case "%": {
            return {
                id: crypto.randomUUID(),
                kind: "number",
                value: nleft - Math.floor(nleft / nright) * nright,
            } satisfies Lua_Number;
        }
        case "//": {
            return {
                id: crypto.randomUUID(),
                kind: "number",
                value: Math.floor(nleft / nright),
            } satisfies Lua_Number;
        }
        //TODO javascript and its god dammed percision freaking points
        case "^": {
            return {
                id: crypto.randomUUID(),
                kind: "number",
                value: Math.exp(nright * Math.log(nleft)),
            } satisfies Lua_Number;
        }

        case "..": {
            return {
                id: crypto.randomUUID(),
                kind: "string",
                value: left.value.toString().concat(right.value.toString()),
            } satisfies Lua_String;
        }
        default: {
            // boolean
            return booleanOperations(operator, left, right);
        }
    }
}

// TODO visual? generator?
export function booleanOperations(
    operator: Binary_Opereators,
    left: Lua_Object,
    right: Lua_Object,
): Lua_Object {
    if (
        (left.kind != "number" && left.kind !== "string") ||
        left.kind !== right.kind
    )
        return {
            id: crypto.randomUUID(),
            kind: "error",
            message: `type missmatch ${left.kind} ${operator} ${right.kind}`,
        } satisfies Lua_Error;

    switch (operator) {
        case "<": {
            return left.value < right.value ? Lua_True : Lua_False;
        }
        case ">": {
            return left.value > right.value ? Lua_True : Lua_False;
        }
        case "==": {
            return left.value === right.value ? Lua_True : Lua_False;
        }
        case "~=": {
            return left.value !== right.value ? Lua_True : Lua_False;
        }
        case "<=": {
            return left.value <= right.value ? Lua_True : Lua_False;
        }
        case ">=": {
            return left.value >= right.value ? Lua_True : Lua_False;
        }
        default:
            return {
                id: crypto.randomUUID(),
                kind: "error",
                message: `Booean operator ${operator} not implemented`,
            } satisfies Lua_Error;
    }
}


export function* applyFunction(
    func: Lua_Function | Lua_Builtin,
    args: Lua_Object[],
): Generator<
    [Lua_Object_Visualizer | null, Lua_Object],
    [Lua_Object_Visualizer | null, Lua_Object],
    [Lua_Object_Visualizer | null, Lua_Object]
> {
    switch (func.kind) {
        case "function": {

            const extendedEnv = extendeFunctionEnv(func, args);
            const gen_evaluated = evalStatementsArray(func.body, extendedEnv);
            let visual_evaluated: ReturnType<typeof gen_evaluated.next> = { done: true, value: [null, Lua_Null] };
            do {
                visual_evaluated = gen_evaluated.next();
                yield visual_evaluated.value;
            } while (!visual_evaluated.done);
            const evaulated = visual_evaluated.value[1];
            return [null, evaulated];
        }
        case "builtin": {
            return [null, func.fn(...args)];
        }
    }
}

//TODO visual? generator?
export function extendeFunctionEnv(
    func: Lua_Function,
    args: Lua_Object[],
): Lua_Environment {
    const env = new Lua_Environment(func.environment);
    for (let paramIdx = 0; paramIdx < func.parameters.length; paramIdx++) {
        let param = func.parameters[paramIdx];
        switch (param.type) {
            case "Identifier": {
                env.set(param.name, args[paramIdx]);
                break;
            }
            case "VarargLiteral": {
                throw Error(`TODO impelement vargLitereal`);
            }
        }
    }

    return env;
}

export function* evalTableField(
    field: luaparser.TableKey | luaparser.TableKeyString | luaparser.TableValue,
    environment: Lua_Environment,
): Generator<
    [Lua_Object_Visualizer | null, Lua_Object],
    [Lua_Object_Visualizer | null, [Lua_Object, Lua_Object]],
    [Lua_Object_Visualizer | null, [Lua_Object, Lua_Object]]
> {
    switch (field.type) {
        case "TableKey": {
            const gen_key = evalExpression(field.key, environment);
            let visual_key: ReturnType<typeof gen_key.next> = { done: true, value: [null, Lua_Null] }
            do {
                visual_key = gen_key.next();
                yield visual_key.value
            } while (!visual_key.done);
            const key = visual_key.value[1];
            if (key.kind === "null")
                return [null, [
                    { id: crypto.randomUUID(), kind: "error", message: "Nil cannot be use as key" } satisfies Lua_Error,
                    Lua_Null,
                ]];

            const gen_val = evalExpression(field.value, environment);
            let visual_val: ReturnType<typeof gen_val.next> = { done: true, value: [null, Lua_Null] }
            do {
                visual_val = gen_val.next();
                yield visual_val.value
            } while (!visual_val.done);
            const val = visual_val.value[1]
            return [null, [key, val]];
        }
        case "TableKeyString": {

            const gen_val = evalExpression(field.value, environment);
            let visual_val: ReturnType<typeof gen_val.next> = { done: true, value: [null, Lua_Null] }
            do {
                visual_val = gen_val.next();
                yield visual_val.value;
            } while (!visual_val.done);
            const val = visual_val.value[1];

            return (
                [
                    null,
                    [
                        {
                            id: crypto.randomUUID(),
                            kind: "string",
                            value: field.key.name
                        } satisfies Lua_String,
                        val
                    ]
                ]
            );
        }
        case "TableValue": {

            const gen_val = evalExpression(field.value, environment);
            let visual_val: ReturnType<typeof gen_val.next> = { done: true, value: [null, Lua_Null] }
            do {
                visual_val = gen_val.next();
                yield visual_val.value;
            } while (!visual_val.done);
            const val = visual_val.value[1];
            return [null, [Lua_Null, val]];
        }
    }
}
