// TODO MAKE THIS INTO A FREAKING GENERATOR
import luaparser from "luaparse";
import {
    Lua_Environment,
    Lua_False,
    Lua_Null,
    Lua_True,
} from "../interperter/lua_types.ts";
import { parseLongString } from "../interperter/eval.ts";
import type {
    Lua_Error,
    Lua_Function,
    Lua_Number,
    Lua_Object,
    Lua_String,
} from "../interperter/lua_types.ts";
import type { Lua_Object_Visualizer } from "./generator_types.ts";


let Lua_Global_Environment = new Lua_Environment();

export function* evalChunk(node: luaparser.Chunk, environment: Lua_Environment) {
    //TODO
    Lua_Global_Environment = new Lua_Environment();
    let gen = evalStatementsArray(node.body, environment)
    let p: ReturnType<typeof gen.next> = { done: true, value: [null, Lua_Null] };
    do {
        p = gen.next();
        if (!p.value) continue;
        yield p.value[0];
    } while (!p.done);
    return p.value![1]
    //return evalStatementsArray(node.body, environment);
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
            return lua.value;
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
                { id, location: node.loc!, mainString: 'return', kind: 'return' },
                { kind: "return", value: vals }]
        }
        case "IfStatement": {
            for (const clause of node.clauses) {
                const gen = evalClause(clause, environment)
                let visual_obj: ReturnType<typeof gen.next> = { done: true, value: [null, [false, Lua_Null]] }
                do {
                    visual_obj = gen.next();
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
                kind: "function",
                self: false,
                body: node.body,
                parameters: node.parameters,
                environment: environment,
            } as Lua_Function;
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

        //case "ForNumericStatement": {
        
        //    let start = evalExpression(node.start, environment);
        //    if (start.kind === "return") start = start.value[0] || Lua_Null;
        //    if (start.kind === "error") return start;
        //    if (start.kind !== "number")
        //        return {
        //            kind: "error",
        //            message: `${start.kind} cannot be used in a numeric for loop`,
        //        } as Lua_Error;
        //
        //    evalAssignment(node.variable, start, environment, false);
        //    let [start_obj, exist] = environment.get(node.variable.name);
        //    if (!exist)
        //        return {
        //            kind: "error",
        //            message: `${node.variable.name} does not exist interperter error`,
        //        } as Lua_Error;
        //    if (start_obj.kind === "error") return start_obj;
        //    if (start_obj.kind !== "number")
        //        return {
        //            kind: "error",
        //            message: `${start_obj.kind} shoudve been a number interpert error`,
        //        } as Lua_Error;
        //
        //    let end = evalExpression(node.end, environment);
        //    if (end.kind === "return") end = end.value[0] || Lua_Null;
        //    if (end.kind === "error") return start;
        //    if (end.kind !== "number")
        //        return {
        //            kind: "error",
        //            message: `${end.kind} cannot be used in a numeric for loop`,
        //        } as Lua_Error;
        //
        //    let step = node.step
        //        ? evalExpression(node.step, environment)
        //        : ({ kind: "number", value: 1 } as Lua_Number);
        //
        //    if (step.kind === "return") step = step.value[0] || Lua_Null;
        //    if (step.kind === "error") return step;
        //    if (step.kind !== "number")
        //        return {
        //            kind: "error",
        //            message: `${end.kind} cannot be used in a numeric for loop`,
        //        } as Lua_Error;
        //
        //    let i = start.value;
        //
        //    while (
        //        (step.value > 0 && i <= end.value) ||
        //        (step.value < 0 && i >= end.value)
        //    ) {
        //        environment.set(node.variable.name, {
        //            kind: "number",
        //            value: i,
        //        } as Lua_Number);
        //        const body = evalStatementsArray(node.body, environment);
        //        if (body.kind === "error" || body.kind === "return") return body;
        //        i += step.value;
        //    }
        //    return Lua_Null;
        //}

        default: {
            return [
                {
                    id,
                    location: node.loc!,
                    kind: 'error'
                },
                {
                    kind: "error",
                    message: `${node.type} statement not implemented`,
                }
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

                return [visuals.value[0], [true, visuals.value[1]]]
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
    switch (exp.type) {

        case "NumericLiteral": {
            return [
                {
                    id,
                    location: exp.loc!,
                    mainString: exp.value.toString(),
                    kind: 'number',
                },
                { kind: "number", value: exp.value } as Lua_Number
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
            return [null, { kind: "string", value: val } as Lua_String];
        }
        case "NilLiteral": {
            return [null, Lua_Null];
        }
        case "UnaryExpression": {

            const gen_arg = evalExpression(exp.argument, environment);
            let visual_arg: ReturnType<typeof gen_arg.next> = {done: true, value: [null, Lua_Null]};
            do{
                visual_arg = gen_arg.next();
                yield visual_arg.value;
            }while(!visual_arg.done);
            const arg = visual_arg.value[1];
            if (arg.kind === "error") return [null, arg];

            return [null, evalUnaryExpression(exp.operator, arg)];
        }



        //TODO string
        default: {
            return [{
                id,
                kind: 'error',
                location: exp.loc!
            }, {
                kind: "error",
                message: `${exp.type} not implemented`,
            }];
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
                return [
                    null, {
                        kind: "error",
                        message: `${identifier.kind} cannot be indexed`,
                    } as Lua_Error
                ];

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
                return [
                    null,
                    {
                        kind: "error",
                        message: "nil cannot be used as index for table",
                    } as Lua_Error
                ];
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
                return [
                    null,
                    {
                        kind: "error",
                        message: `${identifier.kind} cannot be indexed`,
                    } as Lua_Error
                ];
            }

            if (exp.indexer === ":") {
                if (val.kind !== 'function') return [null, { kind: 'error', message: `member ':' is used on functons not${val.kind}` }]
                val.parameters.unshift({ name: 'self', type: 'Identifier' })
                identifier.set({ kind: 'string', value: exp.identifier.name } as Lua_String, val);
            } else {
                identifier.set({ kind: 'string', value: exp.identifier.name } as Lua_String, val);
            }

            return [null, Lua_Null];
        }

        default: {
            return [
                null,
                {
                    kind: "error",
                    message: `AssignmentStatement of  not implemented`,
                } as Lua_Error
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
            return { kind: "error", message: "cant assing an return?" } as Lua_Error;
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
                kind: "error",
                message: `${operator}$ not implemented`,
            } as Lua_Error;
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
            return { kind: "number", value: arg.value.length } as Lua_Number;
        case "table":
            return { kind: "number", value: arg.idx } as Lua_Number;
        default: {
            return {
                kind: "error",
                message: `type missmatch #${arg.kind}`,
            } as Lua_Error;
        }
    }
}

//TODO generator? visuals?
export function evalUnaryMinuesOperator(arg: Lua_Object) {
    switch (arg.kind) {
        case "number": {
            return { kind: "number", value: -arg.value } as Lua_Number;
        }
        //TODO string are coerced into integers
        default: {
            return {
                kind: "error",
                message: `type missmatch -${arg.kind}`,
            } as Lua_Error;
        }
    }
}
