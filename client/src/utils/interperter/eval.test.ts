import luaparser from 'luaparse'
import { describe, expect, test } from 'vitest'
import { evalExpression, evalProgram } from './eval'
import type { Lua_Boolean, Lua_Number } from './lua_types'
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
        expect(val.kind).toBe('number');
        expect((val as Lua_Number).value).toBe(test.value)
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
test('NotOperator', () => {

    const tests = [
        { exp: evalProgram(luaparser.parse('return not true')), value: false },
        { exp: evalProgram(luaparser.parse('return not false')), value: true },
        { exp: evalProgram(luaparser.parse('return not not true')), value: true },
        { exp: evalProgram(luaparser.parse('return not not false')), value: false },
        { exp: evalProgram(luaparser.parse('return not 5')), value: false },
        { exp: evalProgram(luaparser.parse('return not not 5')), value: true },
        { exp: evalProgram(luaparser.parse('return not not 5')), value: true },
        { exp: evalProgram(luaparser.parse('return not nil')), value: true },
        { exp: evalProgram(luaparser.parse('return not not nil')), value: false },
    ];

    for (const test of tests) {
        expect(test.exp).toBeDefined()
        if (!test.exp) throw Error(`test.exp is not defined`);

        expect(test.exp.value[0].kind).toBe('boolean');
        if (test.exp.value[0].kind !== 'boolean') throw Error(`test.exp value[0] is not a boolean ${test.exp}`);
        expect(test.exp.value[0].value).toBe(test.value)
    }
})



describe('Minues operator', () => {
    test('Integer', () => {
        const tests = [
            { exp: evalProgram(luaparser.parse('return -2')), value: -2 },
            { exp: evalProgram(luaparser.parse('return -10')), value: -10 },
        ];

        for (const test of tests) {
            expect(test.exp).toBeDefined()
            if (!test.exp) throw Error(`test.exp is not defined`);

            expect(test.exp.value[0].kind).toBe('number');
            if (test.exp.value[0].kind !== 'number') throw Error(`test.exp value[0] is not a number ${test.exp}`);
            expect(test.exp.value[0].value).toBe(test.value)
        }
        //TODO string coerces to int
    })



})

describe('BinaryExpression', () => {
    test('+', () => {
        const tests = [
            { exp: evalProgram(luaparser.parse('return 10 + 10 + 10 + 10')), value: 40 },
            { exp: evalProgram(luaparser.parse('return 10 + 10 ')), value: 20 },
            { exp: evalProgram(luaparser.parse('return 10 + 10 + 20')), value: 40 },
        ]
        for (const test of tests) {
            expect(test.exp).toBeDefined()
            if (!test.exp) throw Error(`test.exp is not defined`);

            expect(test.exp.value[0].kind).toBe('number');
            if (test.exp.value[0].kind !== 'number') throw Error(`test.exp value[0] is not a number ${test.exp}`);
            expect(test.exp.value[0].value).toBe(test.value)
        }

    })

    test('-', () => {
        const tests = [
            { exp: evalProgram(luaparser.parse('return 10 - 10 - 10 - 10')), value: -20 },
            { exp: evalProgram(luaparser.parse('return 10 - 10 ')), value: 0 },
            { exp: evalProgram(luaparser.parse('return 10  - 20')), value: -10 },
        ]
        for (const test of tests) {
            expect(test.exp).toBeDefined()
            if (!test.exp) throw Error(`test.exp is not defined`);

            expect(test.exp.value[0].kind).toBe('number');
            if (test.exp.value[0].kind !== 'number') throw Error(`test.exp value[0] is not a number ${test.exp}`);
            expect(test.exp.value[0].value).toBe(test.value)
        }
    })

    test('*', () => {
        const tests = [
            { exp: evalProgram(luaparser.parse('return 10 * 10 * 10 * 10')), value: 10000 },
            { exp: evalProgram(luaparser.parse('return 10 * 10 ')), value: 100 },
            { exp: evalProgram(luaparser.parse('return 10 * 20')), value: 200 },
        ]
        for (const test of tests) {
            expect(test.exp).toBeDefined()
            if (!test.exp) throw Error(`test.exp is not defined`);

            expect(test.exp.value[0].kind).toBe('number');
            if (test.exp.value[0].kind !== 'number') throw Error(`test.exp value[0] is not a number ${test.exp}`);
            expect(test.exp.value[0].value).toBe(test.value)
        }
    })

    test('/', () => {
        const tests = [
            { exp: evalProgram(luaparser.parse('return 10 / 10')), value: 1 },
        ]
        for (const test of tests) {
            expect(test.exp).toBeDefined()
            if (!test.exp) throw Error(`test.exp is not defined`);

            expect(test.exp.value[0].kind).toBe('number');
            if (test.exp.value[0].kind !== 'number') throw Error(`test.exp value[0] is not a number ${test.exp}`);
            expect(test.exp.value[0].value).toBe(test.value)
        }
    })

    test('%', () => {
        const tests = [
            { exp: evalProgram(luaparser.parse('return 10 % 10')), value: 0 },
        ]
        for (const test of tests) {
            expect(test.exp).toBeDefined()
            if (!test.exp) throw Error(`test.exp is not defined`);

            expect(test.exp.value[0].kind).toBe('number');
            if (test.exp.value[0].kind !== 'number') throw Error(`test.exp value[0] is not a number ${test.exp}`);
            expect(test.exp.value[0].value).toBe(test.value)
        }
    })

    //TODO idk
    //test('//', () => {
    //    const tests = [
    //        { exp: evalProgram(luaparser.parse('return 1 // 2')), value: 0 },
    //    ]
    //    for (const test of tests) {
    //        expect(test.exp).toBeDefined()
    //        if (!test.exp) throw Error(`test.exp is not defined`);
    //
    //        expect(test.exp.value[0].kind).toBe('number');
    //        if (test.exp.value[0].kind !== 'number') throw Error(`test.exp value[0] is not a number ${test.exp}`);
    //        expect(test.exp.value[0].value).toBe(test.value)
    //    }
    //
    //})

    // TODO baaad test delete this 
    test('^', () => {
        const tests = [
            { exp: evalProgram(luaparser.parse('return 10 ^ 10')), value: Math.exp(10 * Math.log(10)) },
        ]
        for (const test of tests) {
            expect(test.exp).toBeDefined()
            if (!test.exp) throw Error(`test.exp is not defined`);

            expect(test.exp.value[0].kind).toBe('number');
            if (test.exp.value[0].kind !== 'number') throw Error(`test.exp value[0] is not a number ${test.exp}`);
            expect(test.exp.value[0].value).toBe(test.value)
        }
    })


    //booleans
    test('<', () => {
        const tests = [
            { exp: evalProgram(luaparser.parse('return 10 < 10')), value: false },
        ]
        for (const test of tests) {
            expect(test.exp).toBeDefined()
            if (!test.exp) throw Error(`test.exp is not defined`);

            expect(test.exp.value[0].kind).toBe('boolean');
            if (test.exp.value[0].kind !== 'boolean') throw Error(`test.exp value[0] is not a boolean ${test.exp}`);
            expect(test.exp.value[0].value).toBe(test.value)
        }
    })

    test('>', () => {
        const tests = [
            { exp: evalProgram(luaparser.parse('return 10 > 10')), value: false },
        ]
        for (const test of tests) {
            expect(test.exp).toBeDefined()
            if (!test.exp) throw Error(`test.exp is not defined`);

            expect(test.exp.value[0].kind).toBe('boolean');
            if (test.exp.value[0].kind !== 'boolean') throw Error(`test.exp value[0] is not a boolean ${test.exp}`);
            expect(test.exp.value[0].value).toBe(test.value)
        }
    })

    test('==', () => {
        const tests = [
            { exp: evalProgram(luaparser.parse('return 10 == 10')), value: true },
        ]
        for (const test of tests) {
            expect(test.exp).toBeDefined()
            if (!test.exp) throw Error(`test.exp is not defined`);

            expect(test.exp.value[0].kind).toBe('boolean');
            if (test.exp.value[0].kind !== 'boolean') throw Error(`test.exp value[0] is not a boolean ${test.exp}`);
            expect(test.exp.value[0].value).toBe(test.value)
        }
    })

    test('~=', () => {
        const tests = [
            { exp: evalProgram(luaparser.parse('return 10 ~= 10')), value: false },
        ]
        for (const test of tests) {
            expect(test.exp).toBeDefined()
            if (!test.exp) throw Error(`test.exp is not defined`);

            expect(test.exp.value[0].kind).toBe('boolean');
            if (test.exp.value[0].kind !== 'boolean') throw Error(`test.exp value[0] is not a boolean ${test.exp}`);
            expect(test.exp.value[0].value).toBe(test.value)
        }
    })


    test('<=', () => {
        const tests = [
            { exp: evalProgram(luaparser.parse('return 10 <= 10')), value: true },
        ]
        for (const test of tests) {
            expect(test.exp).toBeDefined()
            if (!test.exp) throw Error(`test.exp is not defined`);

            expect(test.exp.value[0].kind).toBe('boolean');
            if (test.exp.value[0].kind !== 'boolean') throw Error(`test.exp value[0] is not a boolean ${test.exp}`);
            expect(test.exp.value[0].value).toBe(test.value)
        }
    })
    test('>=', () => {
        const tests = [
            { exp: evalProgram(luaparser.parse('return 10 >= 10')), value: true },
        ]
        for (const test of tests) {
            expect(test.exp).toBeDefined()
            if (!test.exp) throw Error(`test.exp is not defined`);

            expect(test.exp.value[0].kind).toBe('boolean');
            if (test.exp.value[0].kind !== 'boolean') throw Error(`test.exp value[0] is not a boolean ${test.exp}`);
            expect(test.exp.value[0].value).toBe(test.value)
        }
    })
})



// !Important this return statement ima use it as a base for everything
describe('ReturnStatement', () => {
    test('One argument', () => {
        const tests = [
            { exp: evalProgram(luaparser.parse('return 10')), value: 10 },
            { exp: evalProgram(luaparser.parse('return 12')), value: 12 },
            { exp: evalProgram(luaparser.parse('return 14')), value: 14 },
            { exp: evalProgram(luaparser.parse('return 20')), value: 20 },
        ]

        for (const test of tests) {
            expect(test.exp).toBeDefined();
            if (!test.exp) throw Error('Return should be defined');

            expect(test.exp.kind).toBe('return');
            expect(test.exp.value[0].kind).toBe('number');
            if (test.exp.value[0].kind !== 'number') throw Error('Return value should be number');
            expect(test.exp.value[0].value).toBe(test.value);
        }
    })


    test('Two argument', () => {
        const tests = [
            { exp: evalProgram(luaparser.parse('return 10, 20')), value: [10, 20] },
            { exp: evalProgram(luaparser.parse('return 12, 30')), value: [12, 30] },
            { exp: evalProgram(luaparser.parse('return 14, 50')), value: [14, 50] },
            { exp: evalProgram(luaparser.parse('return 20, 11')), value: [20, 11] },
        ]

        for (const test of tests) {
            expect(test.exp).toBeDefined();
            if (!test.exp) throw Error('Return should be defined');

            expect(test.exp.kind).toBe('return');
            expect(test.exp.value[0].kind).toBe('number');
            if (test.exp.value[0].kind !== 'number') throw Error('Return value should be number');
            expect(test.exp.value[0].value).toBe(test.value[0]);

            expect(test.exp.value[1].kind).toBe('number');
            if (test.exp.value[1].kind !== 'number') throw Error('Return value should be number');
            expect(test.exp.value[1].value).toBe(test.value[1]);
        }

    })
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
