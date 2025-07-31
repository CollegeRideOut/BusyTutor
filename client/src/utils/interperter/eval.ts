import luaparser from 'luaparse'
import { Lua_Table, Lua_Environment, Lua_Null, Lua_True, Lua_False, builtin } from './lua_types';
import type {
    Lua_Number,
    Lua_Error,
    Lua_Object,
    Lua_Return,
    Lua_Function,
    Lua_String,
    Lua_Builtin
} from './lua_types';

let Lua_Global_Environment = new Lua_Environment();

export function Inspect(obj: Lua_Object) {
    switch (obj.kind) {
        case 'null': {
            return "null"
        }
        case 'error': {
            return `ERROR: ${obj.message}`
        }
        default: {
            //return obj.value.toString();
        }
    }
}

export function evalChunk(node: luaparser.Chunk, environment: Lua_Environment) {
    //TODO
    Lua_Global_Environment = new Lua_Environment()
    return evalStatementsArray(node.body, environment)
}

export function evalStatementsArray(node: luaparser.Statement[], environment: Lua_Environment) {
    //TODO multiple statements now lets just assume one
    for (let statement of node) {
        let lua = evalStatements(statement, environment);
        if (lua.kind === 'return' || lua.kind === 'error') {
            return lua;
        }
    }

    return Lua_Null;

}
export function evalStatements(node: luaparser.Statement, environment: Lua_Environment): Lua_Object {
    switch (node.type) {
        case 'ReturnStatement': {
            let vals: Lua_Object[] = [];
            for (let exp of node.arguments) {
                const obj = evalExpression(exp, environment)
                if (obj.kind === 'error') return obj;
                // unwrapping returns
                if (obj.kind === 'return') vals.push(...obj.value);
                else vals.push(obj);
            }
            return { kind: 'return', value: vals } as Lua_Return
        }
        case 'IfStatement': {
            for (const clause of node.clauses) {
                const [t, obj] = evalClause(clause, environment);
                if (obj.kind === 'error') return obj;
                if (t) return obj;
            }
            return Lua_Null
        }
        case 'LocalStatement': {
            const vals: Lua_Object[] = [];
            for (let v of node.init) {
                let val = evalExpression(v, environment)
                if (val.kind === 'error') return val;
                // TODO idk if this is good unwrapping return
                if (val.kind === 'return') vals.push(...val.value);
                else vals.push(val);
            }
            while (true) {
                if (vals.length >= node.variables.length) break;
                vals.push(Lua_Null);
            }

            for (let i = 0; i < node.variables.length; i++) {
                let e = evalAssignment(node.variables[i], vals[i], environment);
                if (e.kind === 'error') return e;
            }

            return Lua_Null
        }

        case 'AssignmentStatement': {
            const vals: Lua_Object[] = [];
            for (let v of node.init) {
                let val = evalExpression(v, environment)
                if (val.kind === 'error') return val;
                // TODO idk if this is good unwrapping return
                if (val.kind === 'return') vals.push(...val.value);
                else vals.push(val);
            }
            while (true) {
                if (vals.length >= node.variables.length) break;
                vals.push(Lua_Null);
            }

            for (let i = 0; i < node.variables.length; i++) {
                let e = evalAssignment(node.variables[i], vals[i], Lua_Global_Environment);
                if (e.kind === 'error') return e;
            }

            return Lua_Null
        }
        case 'FunctionDeclaration': {
            const func = { kind: 'function', self: false, body: node.body, parameters: node.parameters, environment: environment } as Lua_Function
            if (node.identifier) { evalAssignment(node.identifier, func, environment); }
            return func
        }
        case 'CallStatement': {
            return evalExpression(node.expression, environment);
        }
        case 'ForNumericStatement': {
            let start = evalExpression(node.start, environment)
            if (start.kind === 'return') start = start.value[0] || Lua_Null;
            if (start.kind === 'error') return start;
            if (start.kind !== 'number') return { kind: 'error', message: `${start.kind} cannot be used in a numeric for loop` } as Lua_Error;


            evalAssignment(node.variable, start, environment);
            let [start_obj, exist] = environment.get(node.variable.name)
            if (!exist) return { kind: 'error', message: `${node.variable.name} does not exist interperter error` } as Lua_Error;
            if (start_obj.kind === 'error') return start_obj;
            if (start_obj.kind !== 'number') return { kind: 'error', message: `${start_obj.kind} shoudve been a number interpert error` } as Lua_Error;

            let end = evalExpression(node.end, environment)
            if (end.kind === 'return') end = end.value[0] || Lua_Null;
            if (end.kind === 'error') return start;
            if (end.kind !== 'number') return { kind: 'error', message: `${end.kind} cannot be used in a numeric for loop` } as Lua_Error;

            let step = node.step ? evalExpression(node.step, environment) : { kind: 'number', value: 1 } as Lua_Number;

            if (step.kind === 'return') step = step.value[0] || Lua_Null;
            if (step.kind === 'error') return step;
            if (step.kind !== 'number') return { kind: 'error', message: `${end.kind} cannot be used in a numeric for loop` } as Lua_Error;

            let i = start.value

            while ((step.value > 0 && i <= end.value) || (step.value < 0 && i >= end.value)) {
                environment.set(node.variable.name, { kind: 'number', value: i } as Lua_Number)
                const body = evalStatementsArray(node.body, environment)
                if (body.kind === 'error' || body.kind === 'return') return body;
                i += step.value
            }
            return Lua_Null;
        }
        default: {
            return { kind: 'error', message: `${node.type} statement not implemented` } as Lua_Error;
        }
    }
}

export function evalAssignment(exp: luaparser.Identifier | luaparser.MemberExpression | luaparser.IndexExpression, val: Lua_Object, environment: Lua_Environment) {
    switch (exp.type) {
        case 'Identifier':
            return evalIdentiferAssignment(exp, val, environment);

        case 'IndexExpression':
            const identifier = evalExpression(exp.base, environment);
            if (identifier.kind === 'error') return identifier;
            if (identifier.kind !== 'table') return { kind: 'error', message: `${identifier.kind} cannot be indexed` } as Lua_Error;

            let idx = evalExpression(exp.index, environment);

            if (idx.kind === 'return') idx = idx.value[0] || Lua_Null;
            if (idx.kind === 'error') return idx;
            if (idx.kind === 'null') return { kind: 'error', message: 'nil cannot be used as index for table' } as Lua_Error
            identifier.set(idx, val);
            return Lua_Null

        default: {
            return { kind: 'error', message: `AssignmentStatement of ${exp.type} not implemented` } as Lua_Error
        }
    }
}

export function evalIdentiferAssignment(id: luaparser.Identifier, val: Lua_Object, environment: Lua_Environment) {
    switch (val.kind) {
        case 'return': {
            return { kind: 'error', message: 'can assing an error' } as Lua_Error
        }
        case 'error': {
            return val
        }
        default: {
            environment.set(id.name, val)
            return Lua_Null
        }
    }
}





export function evalClause(clause: luaparser.IfClause | luaparser.ElseifClause | luaparser.ElseClause, environment: Lua_Environment): [boolean, Lua_Object] {
    switch (clause.type) {
        case 'ElseClause': {
            return [true, evalStatementsArray(clause.body, environment)];
        }
        default: {
            let condition = evalExpression(clause.condition, environment);
            if (condition.kind === 'error') return [false, condition];
            if (isThruthy(condition).value === false) return [false, Lua_Null];
            else return [true, evalStatementsArray(clause.body, environment)]
        }
    }

}



export function evalExpression(exp: luaparser.Expression, environment: Lua_Environment): Lua_Object {
    switch (exp.type) {
        case 'NumericLiteral': {
            return { kind: 'number', value: exp.value } as Lua_Number;
        }
        case 'BooleanLiteral': {
            return exp.value ? Lua_True : Lua_False;
        }

        case 'StringLiteral': {
            let val = ""
            if (exp.raw[0] === "'" || exp.raw[0] === "\"") {
                for (let i = 1; i < exp.raw.length - 1; i++) {
                    val += exp.raw[i];
                }
            } else {
                val = parseLongString(exp.raw);
            }
            return { kind: 'string', value: val } as Lua_String;
        }
        case 'NilLiteral': {
            return Lua_Null;
        }
        case 'UnaryExpression': {
            const arg = evalExpression(exp.argument, environment);
            if (arg.kind === 'error') return arg;
            return evalUnaryExpression(exp.operator, arg)
        }
        case 'BinaryExpression': {
            let left = evalExpression(exp.left, environment);
            if (left.kind === 'return') left = left.value[0] || Lua_Null
            if (left.kind === 'error') return left;

            let right = evalExpression(exp.right, environment);
            if (right.kind === 'return') right = right.value[0] || Lua_Null
            if (right.kind === 'error') return right;

            return evalBinaryExpression(exp.operator, left, right)
            //return evalBinaryExpression(exp.operator, left, right)
        }
        case 'Identifier': {
            let [val, exist] = environment.get(exp.name)
            if (exist) return val;

            [val, exist] = Lua_Global_Environment.get(exp.name);
            if (exist) return val

            let val_builtin = builtin.get(exp.name)
            if (!val_builtin) return Lua_Null;
            return val_builtin;
        }
        case 'CallExpression': {
            let func = evalExpression(exp.base, environment);
            if (func.kind === 'error') return func;
            if (func.kind !== 'function' && func.kind !== 'builtin')
                return { kind: 'error', message: `${func.kind} is supposed to be a function` };

            const args: Lua_Object[] = [];
            if (func.kind === 'function') {
                if (func.self) args.push(func.self)
            }

            for (let a of exp.arguments) {
                const arg = evalExpression(a, environment);
                if (arg.kind === 'error') return arg;

                args.push(arg);
            }

            if (func.kind === 'function') {
                if (func.self) func.self = false
            }
            return applyFunction(func, args);
        }

        case 'FunctionDeclaration': {
            const func = { kind: 'function', self: false, body: exp.body, parameters: exp.parameters, environment: environment } as Lua_Function
            //if (exp.identifier) { evalAssignment(exp.identifier, func, environment); }
            return func
        }

        case 'TableConstructorExpression': {
            let t = new Lua_Table();
            for (const field of exp.fields) {
                const [key, val] = evalTableField(field, environment)
                if (key.kind === 'error') return key;
                if (val.kind === 'error') return val;
                if (key.kind === 'null') t.setValue(val);
                else t.set(key, val);
            }
            return t;
        }
        case 'IndexExpression': {
            const identifier = evalExpression(exp.base, environment);
            if (identifier.kind === 'error') return identifier;
            if (identifier.kind !== 'table') return { kind: 'error', message: `${identifier.kind} cannot be indexed` } as Lua_Error;

            let idx = evalExpression(exp.index, environment);

            if (idx.kind === 'return') idx = idx.value[0] || Lua_Null;
            if (idx.kind === 'error') return idx;
            if (idx.kind === 'null') return { kind: 'error', message: 'nil cannot be used as index for table' } as Lua_Error

            const val = identifier.get(idx);
            return val;
        }
        // TODO a lot of bugs when have to use as ansighemtn  or call expression test has error cause of this
        case 'MemberExpression': {
            const identifier = evalExpression(exp.base, environment);
            if (identifier.kind === 'error') return identifier;
            if (identifier.kind !== 'table') return { kind: 'error', message: `${identifier.kind} cannot be indexed` } as Lua_Error;

            if (exp.indexer === '.') {
                const val = identifier.get({ kind: 'string', value: exp.identifier.name } as Lua_String);
                return val;
            } else {
                const val = identifier.get({ kind: 'string', value: exp.identifier.name } as Lua_String);
                return val;
            }
            //return { kind: 'error', message: `indexer : not implemented` } as Lua_Error
        }

        default: {
            return { kind: 'error', message: `${exp.type} not implemented` } as Lua_Error
        }
    }
}
export function evalTableField(field: (luaparser.TableKey | luaparser.TableKeyString | luaparser.TableValue), environment: Lua_Environment): [Lua_Object, Lua_Object] {
    switch (field.type) {
        case 'TableKey': {
            const key = evalExpression(field.key, environment)
            if (key.kind === "null") return [{ kind: 'error', message: 'Nil cannot be use as key' } as Lua_Error, Lua_Null]
            const val = evalExpression(field.value, environment)
            return [key, val]
        }
        case 'TableKeyString': {
            const val = evalExpression(field.value, environment)
            return [{ kind: 'string', value: field.key.name } as Lua_String, val]
        }
        case 'TableValue': {
            const val = evalExpression(field.value, environment);
            return [Lua_Null, val];
        }
    }
}
export function applyFunction(func: Lua_Function | Lua_Builtin, args: Lua_Object[]): Lua_Object {
    switch (func.kind) {
        case 'function': {
            const extendedEnv = extendeFunctionEnv(func, args);
            const evaulated = evalStatementsArray(func.body, extendedEnv);
            return evaulated;
        }
        case 'builtin': {
            return func.fn(...args)
        }
    }

}

export function extendeFunctionEnv(func: Lua_Function, args: Lua_Object[]): Lua_Environment {
    const env = new Lua_Environment(func.environment);
    for (let paramIdx = 0; paramIdx < func.parameters.length; paramIdx++) {
        let param = func.parameters[paramIdx];
        switch (param.type) {
            case 'Identifier': {
                env.set(param.name, args[paramIdx]);
                break;
            }
            case 'VarargLiteral': {
                throw Error(`TODO impelement vargLitereal`);
            }
        }
    }

    return env;
}

type Binary_Opereators = "-" | "~" | "+" | "*" | "%" | "^" | "/" | "//" | "&" | "|" | "<<" | ">>" | ".." | "~=" | "==" | "<" | "<=" | ">" | ">=";
export function evalBinaryExpression(operator: Binary_Opereators, left: Lua_Object, right: Lua_Object) {
    switch (true) {
        case (left.kind === 'number' || left.kind === 'string') && (right.kind === 'number' || right.kind === 'string'): {
            return evalIntegerorStringBinaryExpression(operator, left, right);
        }
        // TODO strings and more
        default: {
            return { kind: 'error', message: `type missmatch ${left.kind} ${operator} ${right.kind}` } as Lua_Error;

            //return Lua_Null
        }
    }
}

export function evalIntegerorStringBinaryExpression(operator: Binary_Opereators, left: Lua_Object, right: Lua_Object) {
    //TODO there was an error;
    if (
        (left.kind !== 'number' && left.kind !== 'string') ||
        (right.kind !== 'number' && right.kind !== 'string')
    )
        return { kind: 'error', message: `type missmatch ${left.kind} ${operator} ${right.kind}` } as Lua_Error;

    //TODO bunch of opeartions todo and chekcout //
    const nleft = left.kind === 'number' ? left.value : parseFloat(left.value);
    const nright = right.kind === 'number' ? right.value : parseFloat(right.value);
    switch (operator) {
        // arimethic
        case '+': {
            return { kind: 'number', value: nleft + nright } as Lua_Number;
        }
        case '-': {
            return { kind: 'number', value: nleft - nright } as Lua_Number;
        }
        case '*': {
            return { kind: 'number', value: nleft * nright } as Lua_Number;
        }
        case '/': {
            return { kind: 'number', value: nleft / nright } as Lua_Number;
        }
        case '%': {
            return {
                kind: 'number',
                value: nleft - Math.floor(nleft / nright) * nright
            } as Lua_Number;
        }
        case '//': {
            return {
                kind: 'number',
                value: Math.floor(nleft / nright)
            } as Lua_Number;
        }
        //TODO javascript and its god dammed percision freaking points
        case '^': {
            return {
                kind: 'number',
                value: Math.exp(nright * Math.log(nleft))
            } as Lua_Number;
        }

        case '..': {
            return { kind: 'string', value: left.value.toString().concat(right.value.toString()) } as Lua_String;
        }
        default: {
            // boolean
            return booleanOperations(operator, left, right);
        }
    }

}


export function booleanOperations(operator: Binary_Opereators, left: Lua_Object, right: Lua_Object): Lua_Object {
    if (left.kind != 'number' && left.kind !== 'string' || left.kind !== right.kind)
        return { kind: 'error', message: `type missmatch ${left.kind} ${operator} ${right.kind}` } as Lua_Error;

    switch (operator) {
        case '<': {
            return left.value < right.value ? Lua_True : Lua_False;
        }
        case '>': {
            return left.value > right.value ? Lua_True : Lua_False;
        }
        case '==': {
            return left.value === right.value ? Lua_True : Lua_False;
        }
        case '~=': {
            return left.value !== right.value ? Lua_True : Lua_False;
        }
        case '<=': {
            return left.value <= right.value ? Lua_True : Lua_False;
        }
        case '>=': {
            return left.value >= right.value ? Lua_True : Lua_False;
        }
        default:
            return { kind: 'error', message: `Booean operator ${operator} not implemented` } as Lua_Error
    }
}

export function evalUnaryExpression(operator: "not" | "-" | "~" | "#", arg: Lua_Object) {
    switch (operator) {
        case "not": {
            return evalNotOperator(arg);
        }
        case '-': {
            return evalUnaryMinuesOperator(arg);
        }
        case '#': {
            return evalUnaryLengthOperator(arg);

        }
        default: {
            return { kind: 'error', message: `${operator}$ not implemented` } as Lua_Error
            //return Lua_Null`
        }
    }
}
export function evalUnaryLengthOperator(arg: Lua_Object) {
    switch (arg.kind) {
        case 'string':
            return { kind: 'number', value: arg.value.length } as Lua_Number;
        case 'table':
            return { kind: 'number', value: arg.idx } as Lua_Number;
        default: {
            return { kind: 'error', message: `type missmatch #${arg.kind}` } as Lua_Error
        }
    }
}

export function evalUnaryMinuesOperator(arg: Lua_Object) {
    switch (arg.kind) {
        case 'number': {
            return { kind: 'number', value: -arg.value } as Lua_Number;
        }
        //TODO string are coerced into integers
        default: {
            return { kind: 'error', message: `type missmatch -${arg.kind}` } as Lua_Error
        }
    }
}

export function isThruthy(arg: Lua_Object) {
    switch (arg.kind) {
        case 'boolean': {
            return arg.value ? Lua_True : Lua_False;
        }
        case 'null': {
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
        case 'boolean': {
            return arg.value ? Lua_False : Lua_True;
        }
        case 'null': {
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
    let openMatch = input.match(/^\[(=*)\[/)
    if (!openMatch) throw new Error("Invalid long string start")

    const equalsCount = openMatch[1].length
    const closePattern = new RegExp(`\\]${'='.repeat(equalsCount)}\\]`)

    // 2. Find closing bracket index after opening
    const closeIndex = input.search(closePattern)
    if (closeIndex === -1) throw new Error("Closing bracket not found")

    // 3. Extract content between opening and closing
    const contentStart = openMatch[0].length
    const content = input.substring(contentStart, closeIndex)

    return content
}
