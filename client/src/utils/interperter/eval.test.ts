import luaparser from 'luaparse'
import { expect, test } from 'vitest'
import { evalExpression } from './eval'
import type { Lua_Boolean, Lua_Integer } from './lua_types'
//
// test expression

test('NumericLiteral', () => {
    const tests = [
        { exp: generateNumericLiteral(5), value: 5 },
        { exp: generateNumericLiteral(1), value: 1 },
        { exp: generateNumericLiteral(2), value: 2 },
        { exp: generateNumericLiteral(50), value: 50 },
        { exp: generateNumericLiteral(10), value: 10 },
    ];

    for (const test of tests) {
        let val = evalExpression(test.exp)
        expect(val.kind).toBe('integer');
        expect((val as Lua_Integer).value).toBe(test.value)
    }
})

test('BooleanLiteral', () => {
    const tests = [
        { exp: generateBooleanLiteral(false), value: false },
        { exp: generateBooleanLiteral(true), value: true },
    ];

    for (const test of tests) {
        let val = evalExpression(test.exp)
        expect(val.kind).toBe('boolean');
        expect((val as Lua_Boolean).value).toBe(test.value)
    }
})


// false and nil are false anything els is true 2.5.3
test('NoTOperator', () => {
    const tests = [
        { exp: generateBooleanLiteral(false), value: false },
        { exp: generateBooleanLiteral(true), value: true },
    ];

    for (const test of tests) {
        let val = evalExpression(test.exp)
        expect(val.kind).toBe('boolean');
        expect((val as Lua_Boolean).value).toBe(test.value)
    }
})


function generateNumericLiteral(n: number): luaparser.Expression {
    return {
        type: "NumericLiteral",
        value: n,
        raw: n.toString()
    }
}

function generateBooleanLiteral(b: boolean): luaparser.Expression {
    return {
        type: "BooleanLiteral",
        value: b,
        raw: b.toString()
    }
}
