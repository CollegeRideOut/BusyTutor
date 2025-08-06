import luaparser from "luaparse";
import {
    Lua_Table,
    Lua_Environment,
    Lua_Null,
    Lua_True,
    Lua_False,
    builtin,
} from "./lua_types";
import type {
    Lua_Number,
    Lua_Error,
    Lua_Object,
    Lua_Return,
    Lua_Function,
    Lua_String,
    Lua_Builtin,
} from "./lua_types";

let Lua_Global_Environment = new Lua_Environment();

export function Inspect(obj: Lua_Object) {
    switch (obj.kind) {
        case "null": {
            return "null";
        }
        case "error": {
            return `ERROR: ${obj.message}`;
        }
        default: {
            //return obj.value.toString();
        }
    }
}

export function evalChunk(node: luaparser.Chunk, environment: Lua_Environment) {
    //TODO
    Lua_Global_Environment = new Lua_Environment();
    return evalStatementsArray(node.body, environment);
}

export function evalStatementsArray(
    node: luaparser.Statement[],
    environment: Lua_Environment,
) {
    //TODO multiple statements now lets just assume one
    for (let statement of node) {
        let lua = evalStatements(statement, environment);
        if (lua.kind === "return" || lua.kind === "error") {
            return lua;
        }
    }

    return Lua_Null;
}
export function evalStatements(
    node: luaparser.Statement,
    environment: Lua_Environment,
): Lua_Object {
    switch (node.type) {
        case "ReturnStatement": {
            let vals: Lua_Object[] = [];
            for (let exp of node.arguments) {
                const obj = evalExpression(exp, environment);
                if (obj.kind === "error") return obj;
                // unwrapping returns
                if (obj.kind === "return") vals.push(...obj.value);
                else vals.push(obj);
            }
            return { id: crypto.randomUUID(), kind: "return", value: vals } satisfies Lua_Return;
        }
        case "IfStatement": {
            for (const clause of node.clauses) {
                const [t, obj] = evalClause(clause, environment);
                if (obj.kind === "error") return obj;
                if (t) return obj;
            }
            return Lua_Null;
        }
        case "LocalStatement": {
            const vals: Lua_Object[] = [];
            for (let v of node.init) {
                let val = evalExpression(v, environment);
                if (val.kind === "error") return val;
                // TODO idk if this is good unwrapping return
                if (val.kind === "return") vals.push(...val.value);
                else vals.push(val);
            }
            while (true) {
                if (vals.length >= node.variables.length) break;
                vals.push(Lua_Null);
            }

            for (let i = 0; i < node.variables.length; i++) {
                let e = evalAssignment(node.variables[i], vals[i], environment, false);
                if (e.kind === "error") return e;
            }

            return Lua_Null;
        }

        case "AssignmentStatement": {
            const vals: Lua_Object[] = [];
            for (let v of node.init) {
                let val = evalExpression(v, environment);
                if (val.kind === "error") return val;
                // TODO idk if this is good unwrapping return
                if (val.kind === "return") vals.push(...val.value);
                else vals.push(val);
            }
            while (true) {
                if (vals.length >= node.variables.length) break;
                vals.push(Lua_Null);
            }

            for (let i = 0; i < node.variables.length; i++) {
                let e = evalAssignment(
                    node.variables[i],
                    vals[i],
                    environment,
                    true
                );
                if (e.kind === "error") return e;
            }

            return Lua_Null;
        }
        case "FunctionDeclaration": {
            const func: Lua_Function = {
                id: crypto.randomUUID(),
                kind: "function",
                self: false,
                body: node.body,
                parameters: node.parameters,
                environment: environment,
            };
            if (node.identifier) {
                evalAssignment(node.identifier, func, environment, false);
            }
            return func;
        }
        case "CallStatement": {
            return evalExpression(node.expression, environment);
        }
        case "ForNumericStatement": {
            let start = evalExpression(node.start, environment);
            if (start.kind === "return") start = start.value[0] || Lua_Null;
            if (start.kind === "error") return start;
            if (start.kind !== "number")
                return {
                    id: crypto.randomUUID(),
                    kind: "error",
                    message: `${start.kind} cannot be used in a numeric for loop`,
                } satisfies Lua_Error;

            evalAssignment(node.variable, start, environment, false);
            let [start_obj, exist] = environment.get(node.variable.name);
            if (!exist)
                return {
                    id: crypto.randomUUID(),
                    kind: "error",
                    message: `${node.variable.name} does not exist interperter error`,
                } satisfies Lua_Error;
            if (start_obj.kind === "error") return start_obj;
            if (start_obj.kind !== "number")
                return {
                    id: crypto.randomUUID(),
                    kind: "error",
                    message: `${start_obj.kind} shoudve been a number interpert error`,
                } satisfies Lua_Error;

            let end = evalExpression(node.end, environment);
            if (end.kind === "return") end = end.value[0] || Lua_Null;
            if (end.kind === "error") return end;
            if (end.kind !== "number")
                return {
                    id: crypto.randomUUID(),
                    kind: "error",
                    message: `${end.kind} cannot be used in a numeric for loop`,
                } satisfies Lua_Error;

            let step = node.step
                ? evalExpression(node.step, environment)
                : ({ id: crypto.randomUUID(), kind: "number", value: 1 } satisfies Lua_Number);

            if (step.kind === "return") step = step.value[0] || Lua_Null;
            if (step.kind === "error") return step;
            if (step.kind !== "number")
                return {
                    id: crypto.randomUUID(),
                    kind: "error",
                    message: `${end.kind} cannot be used in a numeric for loop`,
                } satisfies Lua_Error;

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
                const body = evalStatementsArray(node.body, environment);
                if (body.kind === "error" || body.kind === "return") return body;
                i += step.value;
            }
            return Lua_Null;
        }
        //TODO
        case "LabelStatement":
        case "BreakStatement":
        case "GotoStatement":
        case "WhileStatement":
        case "DoStatement":
        case "RepeatStatement":
        case "ForGenericStatement":
        default: {
            return {
                id: crypto.randomUUID(),
                kind: "error",
                message: `${node.type} statement not implemented`,
            } satisfies Lua_Error;
        }
    }
}

export function evalAssignment(
    exp:
        | luaparser.Identifier
        | luaparser.MemberExpression
        | luaparser.IndexExpression,
    val: Lua_Object,
    environment: Lua_Environment,
    global: boolean
): Lua_Null | Lua_Error {
    switch (exp.type) {
        case "Identifier":
            return evalIdentiferAssignment(exp, val, environment, global);

        case "IndexExpression":
            const identifier = evalExpression(exp.base, environment);
            if (identifier.kind === "error") return identifier;
            if (identifier.kind !== "table")
                return {
                    id: crypto.randomUUID(),
                    kind: "error",
                    message: `${identifier.kind} cannot be indexed`,
                } satisfies Lua_Error;

            let idx = evalExpression(exp.index, environment);

            if (idx.kind === "return") idx = idx.value[0] || Lua_Null;
            if (idx.kind === "error") return idx;
            if (idx.kind === "null")
                return {
                    id: crypto.randomUUID(),
                    kind: "error",
                    message: "nil cannot be used as index for table",
                } satisfies Lua_Error;
            identifier.set(idx, val);
            return Lua_Null;
        case "MemberExpression": {
            const identifier = evalExpression(exp.base, environment);
            if (identifier.kind === "error") return identifier;
            if (identifier.kind !== "table")
                return {
                    id: crypto.randomUUID(),
                    kind: "error",
                    message: `${identifier.kind} cannot be indexed`,
                } satisfies Lua_Error;

            if (exp.indexer === ":") {
                if (val.kind !== 'function') return { id: crypto.randomUUID(), kind: 'error', message: `member ':' is used on functons not${val.kind}` }
                val.parameters.unshift({ name: 'self', type: 'Identifier' })
                identifier.set({ id: crypto.randomUUID(), kind: 'string', value: exp.identifier.name } satisfies Lua_String, val);
            } else {
                identifier.set({ id: crypto.randomUUID(), kind: 'string', value: exp.identifier.name } satisfies Lua_String, val);
            }

            return Lua_Null;
        }

        default: {
            return {
                id: crypto.randomUUID(),
                kind: "error",
                message: `AssignmentStatement of  not implemented`,
            } satisfies Lua_Error;
        }
    }
}

export function evalIdentiferAssignment(
    id: luaparser.Identifier,
    val: Lua_Object,
    environment: Lua_Environment,
    global: boolean
) {
    // TODO wtf ? why did i do this cant it just get the first val or some?
    switch (val.kind) {
        case "return": {
            return { id: crypto.randomUUID(), kind: "error", message: "cant assing an return?" } satisfies Lua_Error;
        }
        case "error": {
            return val;
        }
        default: {
            if (global) Lua_Global_Environment.set(id.name, val);
            else environment.set(id.name, val);

            return Lua_Null;
        }
    }
}

export function evalClause(
    clause: luaparser.IfClause | luaparser.ElseifClause | luaparser.ElseClause,
    environment: Lua_Environment,
): [boolean, Lua_Object] {
    switch (clause.type) {
        case "ElseClause": {
            return [true, evalStatementsArray(clause.body, environment)];
        }
        default: {
            let condition = evalExpression(clause.condition, environment);
            if (condition.kind === "error") return [false, condition];
            if (isThruthy(condition).value === false) return [false, Lua_Null];
            else return [true, evalStatementsArray(clause.body, environment)];
        }
    }
}

export function evalExpression(
    exp: luaparser.Expression,
    environment: Lua_Environment,
): Lua_Object {
    switch (exp.type) {
        case "NumericLiteral": {
            return { id: crypto.randomUUID(), kind: "number", value: exp.value } satisfies Lua_Number;
        }
        case "BooleanLiteral": {
            return exp.value ? Lua_True : Lua_False;
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
            return { id: crypto.randomUUID(), kind: "string", value: val } satisfies Lua_String;
        }
        case "NilLiteral": {
            return Lua_Null;
        }
        case "UnaryExpression": {
            const arg = evalExpression(exp.argument, environment);
            if (arg.kind === "error") return arg;
            return evalUnaryExpression(exp.operator, arg);
        }
        case "BinaryExpression": {
            let left = evalExpression(exp.left, environment);
            if (left.kind === "return") left = left.value[0] || Lua_Null;
            if (left.kind === "error") return left;

            let right = evalExpression(exp.right, environment);
            if (right.kind === "return") right = right.value[0] || Lua_Null;
            if (right.kind === "error") return right;

            return evalBinaryExpression(exp.operator, left, right);
            //return evalBinaryExpression(exp.operator, left, right)
        }
        case "Identifier": {
            let [val, exist] = environment.get(exp.name);
            if (exist) return val;

            [val, exist] = Lua_Global_Environment.get(exp.name);
            if (exist) return val;

            let val_builtin = builtin.get(exp.name);
            if (!val_builtin) return Lua_Null;
            return val_builtin;
        }
        case "CallExpression": {
            let func = evalExpression(exp.base, environment);
            if (func.kind === "error") return func;
            if (func.kind !== "function" && func.kind !== "builtin")
                return {
                    id: crypto.randomUUID(),
                    kind: "error",
                    message: `${func.kind} is supposed to be a function`,
                } satisfies Lua_Error;

            const args: Lua_Object[] = [];
            if (func.kind === "function") {
                if (func.self) args.push(func.self);
            }

            for (let a of exp.arguments) {
                const arg = evalExpression(a, environment);
                if (arg.kind === "error") return arg;

                args.push(arg);
            }

            if (func.kind === "function") {
                if (func.self) func.self = false;
            }
            return applyFunction(func, args);
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
            if (exp.identifier) { evalAssignment(exp.identifier, func, environment, true); }
            return func;
        }

        case "TableConstructorExpression": {
            let t = new Lua_Table();
            for (const field of exp.fields) {
                const [key, val] = evalTableField(field, environment);
                if (key.kind === "error") return key;
                if (val.kind === "error") return val;
                if (key.kind === "null") t.setValue(val);
                else t.set(key, val);
            }
            return t;
        }
        case "IndexExpression": {
            const identifier = evalExpression(exp.base, environment);
            if (identifier.kind === "error") return identifier;
            if (identifier.kind !== "table")
                return {
                    id: crypto.randomUUID(),
                    kind: "error",
                    message: `${identifier.kind} cannot be indexed`,
                } satisfies Lua_Error;

            let idx = evalExpression(exp.index, environment);

            if (idx.kind === "return") idx = idx.value[0] || Lua_Null;
            if (idx.kind === "error") return idx;
            if (idx.kind === "null")
                return {
                    id: crypto.randomUUID(),
                    kind: "error",
                    message: "nil cannot be used as index for table",
                } satisfies Lua_Error;

            const val = identifier.get(idx);
            return val;
        }
        // TODO a lot of bugs when have to use as ansighemtn  or call expression test has error cause of this
        case "MemberExpression": {
            const identifier = evalExpression(exp.base, environment);
            if (identifier.kind === "error") return identifier;
            if (identifier.kind !== "table")
                return {
                    id: crypto.randomUUID(),
                    kind: "error",
                    message: `${identifier.kind} cannot be indexed`,
                } satisfies Lua_Error;

            if (exp.indexer === ".") {
                const val = identifier.get({
                    id: crypto.randomUUID(),
                    kind: "string",
                    value: exp.identifier.name,
                } satisfies Lua_String);
                if (val.kind !== 'null') return val
                if (identifier.metatable.kind !== 'table') return val;

                const __index = identifier.metatable.get({
                    id: crypto.randomUUID(),
                    kind: "string",
                    value: '__index',
                } satisfies Lua_String)

                if (__index.kind === 'null') return Lua_Null;

                if (__index.kind === 'function') {

                    return applyFunction(__index, [identifier, {
                        id: crypto.randomUUID(),
                        kind: "string",
                        value: exp.identifier.name,
                    } satisfies Lua_String])
                }
                if (__index.kind !== 'table')
                    return { id: crypto.randomUUID(), kind: 'error', message: "__index should be table" } satisfies Lua_Error;

                return __index.get({
                    id: crypto.randomUUID(),
                    kind: "string",
                    value: exp.identifier.name,
                } satisfies Lua_String);

            } else {
                const val = identifier.get({
                    id: crypto.randomUUID(),
                    kind: "string",
                    value: exp.identifier.name,
                } satisfies Lua_String);


                if (val.kind !== 'function' && val.kind !== 'null') {
                    return {
                        id: crypto.randomUUID(),
                        kind: 'error',
                        message: 'member : can olny be used on functions'
                    }
                }
                if (val.kind === 'function') {
                    val.self = identifier;
                    return val;
                }


                if (identifier.metatable.kind !== 'table') return val;
                const __index = identifier.metatable.get({
                    id: crypto.randomUUID(),
                    kind: "string",
                    value: '__index',
                } satisfies Lua_String)

                if (__index.kind === 'null') return Lua_Null;
                if (__index.kind === 'function') {
                    __index.self = identifier;
                    // TODO should not have to call the function since idxer : always come from call expression
                    return __index
                }
                if (__index.kind !== 'table')
                    return {
                        id: crypto.randomUUID(),
                        kind: 'error',
                        message: "__index should be table or function"
                    } satisfies Lua_Error;

                let func = __index.get({
                    id: crypto.randomUUID(),
                    kind: "string",
                    value: exp.identifier.name,
                } satisfies Lua_String);



                if (func.kind !== 'function' && func.kind !== 'null') {
                    return {
                        id: crypto.randomUUID(),
                        kind: 'error',
                        message: 'member : can olny be used on functions'
                    } satisfies Lua_Error
                }
                if (func.kind === 'null') return Lua_Null;
                func.self = identifier;
                return func;



            }
            //return { kind: 'error', message: `indexer : not implemented` } as Lua_Error
        }
        case "VarargLiteral":
        case "LogicalExpression":
        case "TableCallExpression":
        case "StringCallExpression":

        default: {
            return {
                id: crypto.randomUUID(),
                kind: "error",
                message: `${exp.type} not implemented`,
            } satisfies Lua_Error;
        }
    }
}
export function evalTableField(
    field: luaparser.TableKey | luaparser.TableKeyString | luaparser.TableValue,
    environment: Lua_Environment,
): [Lua_Object, Lua_Object] {
    switch (field.type) {
        case "TableKey": {
            const key = evalExpression(field.key, environment);
            if (key.kind === "null")
                return [
                    { id: crypto.randomUUID(), kind: "error", message: "Nil cannot be use as key" } satisfies Lua_Error,
                    Lua_Null,
                ];
            const val = evalExpression(field.value, environment);
            return [key, val];
        }
        case "TableKeyString": {
            const val = evalExpression(field.value, environment);
            return [{ id: crypto.randomUUID(), kind: "string", value: field.key.name } satisfies Lua_String, val];
        }
        case "TableValue": {
            const val = evalExpression(field.value, environment);
            return [Lua_Null, val];
        }
    }
}
export function applyFunction(
    func: Lua_Function | Lua_Builtin,
    args: Lua_Object[],
): Lua_Object {
    switch (func.kind) {
        case "function": {
            const extendedEnv = extendeFunctionEnv(func, args);
            const evaulated = evalStatementsArray(func.body, extendedEnv);
            return evaulated;
        }
        case "builtin": {
            return func.fn(...args);
        }
    }
}

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

type Binary_Opereators =
    | "-"
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

export function parseLongString(input: string): string {
    // 1. Match opening: '[' + zero or more '=' + '['
    let openMatch = input.match(/^\[(=*)\[/);
    if (!openMatch) throw new Error("Invalid long string start");

    const equalsCount = openMatch[1].length;
    const closePattern = new RegExp(`\\]${"=".repeat(equalsCount)}\\]`);

    // 2. Find closing bracket index after opening
    const closeIndex = input.search(closePattern);
    if (closeIndex === -1) throw new Error("Closing bracket not found");

    // 3. Extract content between opening and closing
    const contentStart = openMatch[0].length;
    const content = input.substring(contentStart, closeIndex);

    return content;
}
