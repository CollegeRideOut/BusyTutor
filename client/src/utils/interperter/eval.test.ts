import luaparser from 'luaparse'
import { describe, expect, test } from 'vitest'
import { evalExpression, evalChunk } from './eval'
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
        { exp: evalChunk(luaparser.parse('return not true')), value: false },
        { exp: evalChunk(luaparser.parse('return not false')), value: true },
        { exp: evalChunk(luaparser.parse('return not not true')), value: true },
        { exp: evalChunk(luaparser.parse('return not not false')), value: false },
        { exp: evalChunk(luaparser.parse('return not 5')), value: false },
        { exp: evalChunk(luaparser.parse('return not not 5')), value: true },
        { exp: evalChunk(luaparser.parse('return not not 5')), value: true },
        { exp: evalChunk(luaparser.parse('return not nil')), value: true },
        { exp: evalChunk(luaparser.parse('return not not nil')), value: false },
    ];

    for (const test of tests) {
        expect(test.exp).toBeDefined()
        if (!test.exp) throw Error(`test.exp is not defined`);


        expect(test.exp.kind).toBe('return');
        if (test.exp.kind !== 'return') throw Error(`test.exp is not defined`);

        expect(test.exp.value[0].kind).toBe('boolean');
        if (test.exp.value[0].kind !== 'boolean') throw Error(`test.exp value[0] is not a boolean ${test.exp}`);
        expect(test.exp.value[0].value).toBe(test.value)
    }
})



describe('Minues operator', () => {
    test('Integer', () => {
        const tests = [
            { exp: evalChunk(luaparser.parse('return -2')), value: -2 },
            { exp: evalChunk(luaparser.parse('return -10')), value: -10 },
        ];

        for (const test of tests) {
            expect(test.exp).toBeDefined()
            if (!test.exp) throw Error(`test.exp is not defined`);


            expect(test.exp.kind).toBe('return');
            if (test.exp.kind !== 'return') throw Error(`test.exp is not defined`);

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
            { exp: evalChunk(luaparser.parse('return 10 + 10 + 10 + 10')), value: 40 },
            { exp: evalChunk(luaparser.parse('return 10 + 10 ')), value: 20 },
            { exp: evalChunk(luaparser.parse('return 10 + 10 + 20')), value: 40 },
        ]
        for (const test of tests) {
            expect(test.exp).toBeDefined()
            if (!test.exp) throw Error(`test.exp is not defined`);


            expect(test.exp.kind).toBe('return');
            if (test.exp.kind !== 'return') throw Error(`test.exp is not defined`);

            expect(test.exp.value[0].kind).toBe('number');
            if (test.exp.value[0].kind !== 'number') throw Error(`test.exp value[0] is not a number ${test.exp}`);
            expect(test.exp.value[0].value).toBe(test.value)
        }

    })

    test('-', () => {
        const tests = [
            { exp: evalChunk(luaparser.parse('return 10 - 10 - 10 - 10')), value: -20 },
            { exp: evalChunk(luaparser.parse('return 10 - 10 ')), value: 0 },
            { exp: evalChunk(luaparser.parse('return 10  - 20')), value: -10 },
        ]
        for (const test of tests) {
            expect(test.exp).toBeDefined()
            if (!test.exp) throw Error(`test.exp is not defined`);


            expect(test.exp.kind).toBe('return');
            if (test.exp.kind !== 'return') throw Error(`test.exp is not defined`);

            expect(test.exp.value[0].kind).toBe('number');
            if (test.exp.value[0].kind !== 'number') throw Error(`test.exp value[0] is not a number ${test.exp}`);
            expect(test.exp.value[0].value).toBe(test.value)
        }
    })

    test('*', () => {
        const tests = [
            { exp: evalChunk(luaparser.parse('return 10 * 10 * 10 * 10')), value: 10000 },
            { exp: evalChunk(luaparser.parse('return 10 * 10 ')), value: 100 },
            { exp: evalChunk(luaparser.parse('return 10 * 20')), value: 200 },
        ]
        for (const test of tests) {
            expect(test.exp).toBeDefined()
            if (!test.exp) throw Error(`test.exp is not defined`);


            expect(test.exp.kind).toBe('return');
            if (test.exp.kind !== 'return') throw Error(`test.exp is not defined`);
            expect(test.exp.value[0].kind).toBe('number');

            if (test.exp.value[0].kind !== 'number') throw Error(`test.exp value[0] is not a number ${test.exp}`);
            expect(test.exp.value[0].value).toBe(test.value)
        }
    })

    test('/', () => {
        const tests = [
            { exp: evalChunk(luaparser.parse('return 10 / 10')), value: 1 },
        ]
        for (const test of tests) {
            expect(test.exp).toBeDefined()
            if (!test.exp) throw Error(`test.exp is not defined`);


            expect(test.exp.kind).toBe('return');
            if (test.exp.kind !== 'return') throw Error(`test.exp is not defined`);

            expect(test.exp.value[0].kind).toBe('number');
            if (test.exp.value[0].kind !== 'number') throw Error(`test.exp value[0] is not a number ${test.exp}`);
            expect(test.exp.value[0].value).toBe(test.value)
        }
    })

    test('%', () => {
        const tests = [
            { exp: evalChunk(luaparser.parse('return 10 % 10')), value: 0 },
        ]
        for (const test of tests) {
            expect(test.exp).toBeDefined()
            if (!test.exp) throw Error(`test.exp is not defined`);

            expect(test.exp.kind).toBe('return');
            if (test.exp.kind !== 'return') throw Error(`test.exp is not defined`);

            expect(test.exp.value[0].kind).toBe('number');
            if (test.exp.value[0].kind !== 'number') throw Error(`test.exp value[0] is not a number ${test.exp}`);
            expect(test.exp.value[0].value).toBe(test.value)
        }
    })

    //TODO idk
    //test('//', () => {
    //    const tests = [
    //        { exp: evalChunk(luaparser.parse('return 1 // 2')), value: 0 },
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
            { exp: evalChunk(luaparser.parse('return 10 ^ 10')), value: Math.exp(10 * Math.log(10)) },
        ]
        for (const test of tests) {
            expect(test.exp).toBeDefined()
            if (!test.exp) throw Error(`test.exp is not defined`);

            expect(test.exp.kind).toBe('return');
            if (test.exp.kind !== 'return') throw Error(`test.exp is not defined`);

            expect(test.exp.value[0].kind).toBe('number');
            if (test.exp.value[0].kind !== 'number') throw Error(`test.exp value[0] is not a number ${test.exp}`);
            expect(test.exp.value[0].value).toBe(test.value)
        }
    })


    //booleans
    test('<', () => {
        const tests = [
            { exp: evalChunk(luaparser.parse('return 10 < 10')), value: false },
        ]
        for (const test of tests) {
            expect(test.exp).toBeDefined()
            if (!test.exp) throw Error(`test.exp is not defined`);


            expect(test.exp.kind).toBe('return');
            if (test.exp.kind !== 'return') throw Error(`test.exp is not defined`);

            expect(test.exp.value[0].kind).toBe('boolean');
            if (test.exp.value[0].kind !== 'boolean') throw Error(`test.exp value[0] is not a boolean ${test.exp}`);
            expect(test.exp.value[0].value).toBe(test.value)
        }
    })

    test('>', () => {
        const tests = [
            { exp: evalChunk(luaparser.parse('return 10 > 10')), value: false },
        ]
        for (const test of tests) {
            expect(test.exp).toBeDefined()
            if (!test.exp) throw Error(`test.exp is not defined`);

            expect(test.exp.kind).toBe('return');
            if (test.exp.kind !== 'return') throw Error(`test.exp is not defined`);

            expect(test.exp.value[0].kind).toBe('boolean');
            if (test.exp.value[0].kind !== 'boolean') throw Error(`test.exp value[0] is not a boolean ${test.exp}`);
            expect(test.exp.value[0].value).toBe(test.value)
        }
    })

    test('==', () => {
        const tests = [
            { exp: evalChunk(luaparser.parse('return 10 == 10')), value: true },
        ]
        for (const test of tests) {
            expect(test.exp).toBeDefined()
            if (!test.exp) throw Error(`test.exp is not defined`);


            expect(test.exp.kind).toBe('return');
            if (test.exp.kind !== 'return') throw Error(`test.exp is not defined`);

            expect(test.exp.value[0].kind).toBe('boolean');
            if (test.exp.value[0].kind !== 'boolean') throw Error(`test.exp value[0] is not a boolean ${test.exp}`);
            expect(test.exp.value[0].value).toBe(test.value)
        }
    })

    test('~=', () => {
        const tests = [
            { exp: evalChunk(luaparser.parse('return 10 ~= 10')), value: false },
        ]
        for (const test of tests) {
            expect(test.exp).toBeDefined()
            if (!test.exp) throw Error(`test.exp is not defined`);


            expect(test.exp.kind).toBe('return');
            if (test.exp.kind !== 'return') throw Error(`test.exp is not defined`);

            expect(test.exp.value[0].kind).toBe('boolean');
            if (test.exp.value[0].kind !== 'boolean') throw Error(`test.exp value[0] is not a boolean ${test.exp}`);
            expect(test.exp.value[0].value).toBe(test.value)
        }
    })


    test('<=', () => {
        const tests = [
            { exp: evalChunk(luaparser.parse('return 10 <= 10')), value: true },
        ]
        for (const test of tests) {
            expect(test.exp).toBeDefined()
            if (!test.exp) throw Error(`test.exp is not defined`);


            expect(test.exp.kind).toBe('return');
            if (test.exp.kind !== 'return') throw Error(`test.exp is not defined`);

            expect(test.exp.value[0].kind).toBe('boolean');
            if (test.exp.value[0].kind !== 'boolean') throw Error(`test.exp value[0] is not a boolean ${test.exp}`);
            expect(test.exp.value[0].value).toBe(test.value)
        }
    })
    test('>=', () => {
        const tests = [
            { exp: evalChunk(luaparser.parse('return 10 >= 10')), value: true },
        ]
        for (const test of tests) {
            expect(test.exp).toBeDefined()

            if (!test.exp) throw Error(`test.exp is not defined`);


            expect(test.exp.kind).toBe('return');
            if (test.exp.kind !== 'return') throw Error(`test.exp is not defined`);

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
            { exp: evalChunk(luaparser.parse('return 10')), value: 10 },
            { exp: evalChunk(luaparser.parse('return 12')), value: 12 },
            { exp: evalChunk(luaparser.parse('return 14')), value: 14 },
            { exp: evalChunk(luaparser.parse('return 20')), value: 20 },
        ]

        for (const test of tests) {
            expect(test.exp).toBeDefined();
            if (!test.exp) throw Error('Return should be defined');

            expect(test.exp.kind).toBe('return');
            if (test.exp.kind !== 'return') throw Error(`test.exp is not defined`);

            expect(test.exp.value[0].kind).toBe('number');
            if (test.exp.value[0].kind !== 'number') throw Error('Return value should be number');
            expect(test.exp.value[0].value).toBe(test.value);
        }
    })


    test('Two argument', () => {
        const tests = [
            { exp: evalChunk(luaparser.parse('return 10, 20')), value: [10, 20] },
            { exp: evalChunk(luaparser.parse('return 12, 30')), value: [12, 30] },
            { exp: evalChunk(luaparser.parse('return 14, 50')), value: [14, 50] },
            { exp: evalChunk(luaparser.parse('return 20, 11')), value: [20, 11] },
        ]

        for (const test of tests) {
            expect(test.exp).toBeDefined();
            if (!test.exp) throw Error('Return should be defined');


            expect(test.exp.kind).toBe('return');
            if (test.exp.kind !== 'return') throw Error(`test.exp is not defined`);

            expect(test.exp.value[0].kind).toBe('number');
            if (test.exp.value[0].kind !== 'number') throw Error('Return value should be number');
            expect(test.exp.value[0].value).toBe(test.value[0]);

            expect(test.exp.value[1].kind).toBe('number');
            if (test.exp.value[1].kind !== 'number') throw Error('Return value should be number');
            expect(test.exp.value[1].value).toBe(test.value[1]);
        }

    })
})


describe('IfStatement', () => {
    test('IfCaluse', () => {
        const tests = [
            { exp: evalChunk(luaparser.parse('if true then return 5 end')), value: 5 },
            { exp: evalChunk(luaparser.parse(`if false then return 5 elseif true then return 10 end return 20`)), value: 10 },
            { exp: evalChunk(luaparser.parse(`if false then return 5 elseif false then return 10 else return 2 end return 20`)), value: 2 },
            {
                exp: evalChunk(luaparser.parse(`
                 if true then 
                     if true then
                         return 99
                     end
                 elseif false then 
                    return 10 
                 else 
                     return 2 
                 end 
                 return 20`)),
                value: 99
            },
        ]

        for (const test of tests) {
            expect(test.exp).toBeDefined();
            if (!test.exp) throw Error('Return should be defined');

            expect(test.exp.kind).toBe('return');
            if (test.exp.kind !== 'return') throw Error(`test.exp is not defined`);

            expect(test.exp.value[0].kind).toBe('number');
            if (test.exp.value[0].kind !== 'number') throw Error('Return value should be number');
            expect(test.exp.value[0].value).toBe(test.value);
        }
    })
})

describe('Errors', () => {
    test('types', () => {
        const tests = [
            { exp: evalChunk(luaparser.parse('return 5 + true')), value: 5 },
            { exp: evalChunk(luaparser.parse('return -true')), value: 5 },
            { exp: evalChunk(luaparser.parse('return true + false')), value: 5 },
        ]

        for (const test of tests) {
            expect(test.exp).toBeDefined();
            if (!test.exp) throw Error('Return should be defined');

            expect(test.exp.kind).toBe('error');
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
