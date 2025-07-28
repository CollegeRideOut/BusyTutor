import luaparser from 'luaparse'
import type {
    Lua_Boolean,
    Lua_Number,
    Lua_Null,
    Lua_Error,
    Lua_Object,
    Lua_Return
} from './lua_types';


const Lua_True: Lua_Boolean = { kind: 'boolean', value: true };
const Lua_False: Lua_Boolean = { kind: 'boolean', value: false };
const Lua_Null: Lua_Null = { kind: 'null' };



export function Inspect(obj: Lua_Object) {
    switch (obj.kind) {
        case 'null': {
            return "null"
        }
        case 'error': {
            return `ERROR: ${obj.message}`
        }
        default: {
            return obj.value.toString();
        }
    }
}

export function evalChunk(node: luaparser.Chunk) {
    //TODO
    return evalStatementsArray(node.body)
}

export function evalStatementsArray(node: luaparser.Statement[]) {
    //TODO multiple statements now lets just assume one
    for (let statement of node) {
        let lua = evalStatements(statement);
        if (lua.kind === 'return' || lua.kind === 'error') {
            return lua;
        }
    }

    return Lua_Null;

}
export function evalStatements(node: luaparser.Statement) {
    switch (node.type) {
        case 'ReturnStatement': {
            let vals: Lua_Object[] = [];
            for (let exp of node.arguments) {
                const obj = evalExpression(exp)
                if (obj.kind === 'error') return obj;
                vals.push(obj)
            }
            return { kind: 'return', value: vals } as Lua_Return
        }
        case 'IfStatement': {
            for (const clause of node.clauses) {
                const [t, obj] = evalClause(clause);
                if (obj.kind === 'error') return obj;
                if (t) return obj;
            }
            return Lua_Null
        }
        default: {
            return Lua_Null;
        }
    }
}
export function evalClause(clause: luaparser.IfClause | luaparser.ElseifClause | luaparser.ElseClause): [boolean, Lua_Object] {
    switch (clause.type) {
        case 'ElseClause': {
            return [true, evalStatementsArray(clause.body)];
        }
        default: {
            let condition = evalExpression(clause.condition);
            if (condition.kind === 'error') return [false, condition];
            if (isThruthy(condition).value === false) return [false, Lua_Null];
            else return [true, evalStatementsArray(clause.body)]
        }
    }

}



export function evalExpression(exp: luaparser.Expression): Lua_Object {
    switch (exp.type) {
        case 'NumericLiteral': {
            return { kind: 'number', value: exp.value } as Lua_Number;
        }
        case 'BooleanLiteral': {
            return exp.value ? Lua_True : Lua_False;
        }
        case 'NilLiteral': {
            return Lua_Null;
        }
        case 'UnaryExpression': {
            const arg = evalExpression(exp.argument);
            if (arg.kind === 'error') return arg;
            return evalUnaryExpression(exp.operator, arg)
        }
        case 'BinaryExpression': {
            const left = evalExpression(exp.left);
            if (left.kind === 'error') return left;

            const right = evalExpression(exp.right);
            if (right.kind === 'error') return right;

            return evalBinaryExpression(exp.operator, left, right)
            //return evalBinaryExpression(exp.operator, left, right)
        }

        default: {
            return { kind: 'error', message: `${exp.type} not implemented` } as Lua_Error
        }
    }
}

type Binary_Opereators = "-" | "~" | "+" | "*" | "%" | "^" | "/" | "//" | "&" | "|" | "<<" | ">>" | ".." | "~=" | "==" | "<" | "<=" | ">" | ">=";
export function evalBinaryExpression(operator: Binary_Opereators, left: Lua_Object, right: Lua_Object) {
    switch (true) {
        case left.kind === 'number' && right.kind === 'number': {
            return evalIntegerBinaryExpression(operator, left, right);
        }
        // TODO strings and more
        default: {
            return { kind: 'error', message: `type missmatch ${left.kind} ${operator} ${right.kind}` } as Lua_Error;

            //return Lua_Null
        }
    }
}

export function evalIntegerBinaryExpression(operator: Binary_Opereators, left: Lua_Object, right: Lua_Object) {
    //TODO there was an error;
    if (left.kind !== 'number' || right.kind !== 'number')
        return { kind: 'error', message: `type missmatch ${left.kind} ${operator} ${right.kind}` } as Lua_Error;

    //TODO bunch of opeartions todo and chekcout //
    switch (operator) {
        // arimethic
        case '+': {
            return { kind: 'number', value: left.value + right.value } as Lua_Number;
        }
        case '-': {
            return { kind: 'number', value: left.value - right.value } as Lua_Number;
        }
        case '*': {
            return { kind: 'number', value: left.value * right.value } as Lua_Number;
        }
        case '/': {
            return { kind: 'number', value: left.value / right.value } as Lua_Number;
        }
        case '%': {
            return {
                kind: 'number',
                value: left.value - Math.floor(left.value / right.value) * right.value
            } as Lua_Number;
        }
        case '//': {
            return {
                kind: 'number',
                value: Math.floor(left.value / right.value)
            } as Lua_Number;
        }
        //TODO javascript and its god dammed percision freaking points
        case '^': {
            return {
                kind: 'number',
                value: Math.exp(right.value * Math.log(left.value))
            } as Lua_Number;
        }

        // boolean
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
        // TODO there was an error;
        default: {
            return { kind: 'error', message: `Binary operator ${operator} not implemented` } as Lua_Error
            //return Lua_Null;
        }
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
        default: {
            return { kind: 'error', message: `type missmatch ${operator}${arg.kind} not implemented` } as Lua_Error
            //return Lua_Null`
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
            return { kind: 'error', message: `type missmatch -${arg.kind} not implemented` } as Lua_Error
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

