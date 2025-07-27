
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
        default: {
            throw Error('EVAL EXPRESSION ERROR' + JSON.stringify(exp));
        }
    }
}
