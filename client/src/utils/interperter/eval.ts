import luaparser from 'luaparse'
import type { Lua_Boolean, Lua_Integer, Lua_Null } from './lua_types';


const Lua_True: Lua_Boolean = { kind: 'boolean', value: true };
const Lua_False: Lua_Boolean = { kind: 'boolean', value: false };
const Lua_Null: Lua_Null = { kind: 'null' };

export function evalProgram(node: luaparser.Chunk) {
    for (let statement of node.body) {
        evalStatements(statement);
    }

}
export function evalStatements(node: luaparser.Statement) {
    switch (node.type) {
        case 'AssignmentStatement': {
            let x = node.init[0];
            void x;
            break;
        }
    }
}



export function evalExpression(exp: luaparser.Expression): Lua_Integer | Lua_Boolean | Lua_Null {
    switch (exp.type) {
        case 'NumericLiteral': {
            return { kind: 'integer', value: exp.value } as Lua_Integer;
        }
        case 'BooleanLiteral': {
            return exp.value ? Lua_True : Lua_False;
        }
        case 'NilLiteral': {
            return Lua_Null;
        }
        case 'UnaryExpression': {
            const arg = evalExpression(exp.argument);
            return evalUnaryExpression(exp.operator, arg)
        }
        default: {
            throw Error('EVAL EXPRESSION ERROR' + JSON.stringify(exp));
        }
    }
}
export function evalUnaryExpression(operator: "not" | "-" | "~" | "#", arg: ReturnType<typeof evalExpression>) {
    switch (operator) {
        case "not": {
            return evalNotOperator(arg);
        }
        case '-': {
            return evalUnaryMinuesOperator(arg);
        }
        default: {
            throw Error("Unary Expression not Implemented");
            //return Lua_Null;
        }
    }
}

export function evalUnaryMinuesOperator(arg: ReturnType<typeof evalExpression>) {
    switch (arg.kind) {
        case 'integer': {
            return { kind: 'integer', value: -arg.value } as Lua_Integer;
        }
        //TODO string are coerced into integers
        default: {
            //TODO an error?
            throw Error(`Minus operator has no implemented ${(arg as any).kind}`)
            //return Lua_Null;
        }
    }
}

export function evalNotOperator(arg: ReturnType<typeof evalExpression>) {
    switch (arg.kind) {
        case 'boolean': {
            return arg.value ? Lua_False : Lua_True;
        }
        case 'integer': {
            return Lua_False;
        }
        case 'null': {
            return Lua_True;
        }
        default: {
            throw Error(`Not operator has not implemented ${(arg as any).kind}`)
            //return Lua_Null;
        }
    }
}

