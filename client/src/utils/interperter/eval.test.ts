import luaparser from 'luaparse'
import { describe, expect, test } from 'vitest'
import { evalExpression, evalChunk } from './eval'
import type { Lua_Boolean, Lua_Number } from './lua_types'
import { Lua_Environment } from './lua_types'

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
        let val = evalExpression(test.exp, new Lua_Environment())
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
        let val = evalExpression(test.exp, new Lua_Environment())
        expect(val.kind).toBe('boolean');
        expect((val as Lua_Boolean).value).toBe(test.value)
    }
})


test('StringLiteral', () => {
    const tests = [
        { exp: evalChunk(luaparser.parse('return "hello"'), new Lua_Environment()), value: "hello" },
        { exp: evalChunk(luaparser.parse("return 'hello'"), new Lua_Environment()), value: "hello" },
        { exp: evalChunk(luaparser.parse('return [[hello]]'), new Lua_Environment()), value: "hello" },
        { exp: evalChunk(luaparser.parse('return [==[hello]==]'), new Lua_Environment()), value: "hello" },
    ];

    for (const test of tests) {
        expect(test.exp).toBeDefined()
        if (!test.exp) throw Error(`test.exp is not defined`);


        expect(test.exp.kind).toBe('return');
        if (test.exp.kind !== 'return') throw Error(`test.exp is not defined`);

        expect(test.exp.value[0].kind).toBe('string');
        if (test.exp.value[0].kind !== 'string') throw Error(`test.exp value[0] is not a boolean ${test.exp}`);
        expect(test.exp.value[0].value).toBe(test.value)
    }
})


// false and nil are false anything els is true 2.5.3
test('NotOperator', () => {

    const tests = [
        { exp: evalChunk(luaparser.parse('return not true'), new Lua_Environment()), value: false },
        { exp: evalChunk(luaparser.parse('return not false'), new Lua_Environment()), value: true },
        { exp: evalChunk(luaparser.parse('return not not true'), new Lua_Environment()), value: true },
        { exp: evalChunk(luaparser.parse('return not not false'), new Lua_Environment()), value: false },
        { exp: evalChunk(luaparser.parse('return not 5'), new Lua_Environment()), value: false },
        { exp: evalChunk(luaparser.parse('return not not 5'), new Lua_Environment()), value: true },
        { exp: evalChunk(luaparser.parse('return not not 5'), new Lua_Environment()), value: true },
        { exp: evalChunk(luaparser.parse('return not nil'), new Lua_Environment()), value: true },
        { exp: evalChunk(luaparser.parse('return not not nil'), new Lua_Environment()), value: false },
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
            { exp: evalChunk(luaparser.parse('return -2'), new Lua_Environment()), value: -2 },
            { exp: evalChunk(luaparser.parse('return -10'), new Lua_Environment()), value: -10 },
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
            { exp: evalChunk(luaparser.parse('return 10 + 10 + 10 + 10'), new Lua_Environment()), value: 40 },
            { exp: evalChunk(luaparser.parse('return 10 + 10 '), new Lua_Environment()), value: 20 },
            { exp: evalChunk(luaparser.parse('return 10 + 10 + 20'), new Lua_Environment()), value: 40 },
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
            { exp: evalChunk(luaparser.parse('return 10 - 10 - 10 - 10'), new Lua_Environment()), value: -20 },
            { exp: evalChunk(luaparser.parse('return 10 - 10 '), new Lua_Environment()), value: 0 },
            { exp: evalChunk(luaparser.parse('return 10  - 20'), new Lua_Environment()), value: -10 },
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
            { exp: evalChunk(luaparser.parse('return 10 * 10 * 10 * 10'), new Lua_Environment()), value: 10000 },
            { exp: evalChunk(luaparser.parse('return 10 * 10 '), new Lua_Environment()), value: 100 },
            { exp: evalChunk(luaparser.parse('return 10 * 20'), new Lua_Environment()), value: 200 },
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
            { exp: evalChunk(luaparser.parse('return 10 / 10'), new Lua_Environment()), value: 1 },
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
            { exp: evalChunk(luaparser.parse('return 10 % 10'), new Lua_Environment()), value: 0 },
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
            { exp: evalChunk(luaparser.parse('return 10 ^ 10'), new Lua_Environment()), value: Math.exp(10 * Math.log(10)) },
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
            { exp: evalChunk(luaparser.parse('return 10 < 10'), new Lua_Environment()), value: false },
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
            { exp: evalChunk(luaparser.parse('return 10 > 10'), new Lua_Environment()), value: false },
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
            { exp: evalChunk(luaparser.parse('return 10 == 10'), new Lua_Environment()), value: true },
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
            { exp: evalChunk(luaparser.parse('return 10 ~= 10'), new Lua_Environment()), value: false },
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
            { exp: evalChunk(luaparser.parse('return 10 <= 10'), new Lua_Environment()), value: true },
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
            { exp: evalChunk(luaparser.parse('return 10 >= 10'), new Lua_Environment()), value: true },
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
            { exp: evalChunk(luaparser.parse('return 10'), new Lua_Environment()), value: 10 },
            { exp: evalChunk(luaparser.parse('return 12'), new Lua_Environment()), value: 12 },
            { exp: evalChunk(luaparser.parse('return 14'), new Lua_Environment()), value: 14 },
            { exp: evalChunk(luaparser.parse('return 20'), new Lua_Environment()), value: 20 },
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
            { exp: evalChunk(luaparser.parse('return 10, 20'), new Lua_Environment()), value: [10, 20] },
            { exp: evalChunk(luaparser.parse('return 12, 30'), new Lua_Environment()), value: [12, 30] },
            { exp: evalChunk(luaparser.parse('return 14, 50'), new Lua_Environment()), value: [14, 50] },
            { exp: evalChunk(luaparser.parse('return 20, 11'), new Lua_Environment()), value: [20, 11] },
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
            { exp: evalChunk(luaparser.parse('if true then return 5 end'), new Lua_Environment()), value: 5 },
            { exp: evalChunk(luaparser.parse(`if false then return 5 elseif true then return 10 end return 20`), new Lua_Environment()), value: 10 },
            { exp: evalChunk(luaparser.parse(`if false then return 5 elseif false then return 10 else return 2 end return 20`), new Lua_Environment()), value: 2 },
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
                 return 20`), new Lua_Environment()),
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
            { exp: evalChunk(luaparser.parse('return 5 + true'), new Lua_Environment()), value: 5 },
            { exp: evalChunk(luaparser.parse('return -true'), new Lua_Environment()), value: 5 },
            { exp: evalChunk(luaparser.parse('return true + false'), new Lua_Environment()), value: 5 },
        ]

        for (const test of tests) {
            expect(test.exp).toBeDefined();
            if (!test.exp) throw Error('Return should be defined');

            expect(test.exp.kind).toBe('error');
        }
    })

})


describe('AssignmentStatement', () => {
    test('Global', () => {
        const tests = [
            { exp: evalChunk(luaparser.parse('x = 5; return x'), new Lua_Environment()), value: [5] },
            { exp: evalChunk(luaparser.parse('x = 10; return x'), new Lua_Environment()), value: [10] },
            { exp: evalChunk(luaparser.parse('x,y = 10; return x, y'), new Lua_Environment()), value: [10, null] },
            { exp: evalChunk(luaparser.parse('x,y = 10, 20; return x, y'), new Lua_Environment()), value: [10, 20] },
            { exp: evalChunk(luaparser.parse('x,y = 10, 20, 30; return x, y'), new Lua_Environment()), value: [10, 20] },
        ]

        for (const test of tests) {
            expect(test.exp).toBeDefined();
            if (!test.exp) throw Error('Return should be defined');
            if (test.exp.kind !== 'return') throw Error(`${test.exp.kind === 'error' ? test.exp.message : 'null'}`);
            expect(test.exp.kind).toBe('return');

            for (let i = 0; i < test.exp.value.length; i++) {
                const val = test.exp.value[i];
                if (val.kind === 'null') expect(test.value[i]).toBe(null);
                else if (val.kind === 'error') throw Error('should not be an error');
                else if (val.kind !== 'number') throw Error(' should be a number');
                else expect(val!.value).toBe(test.value[i]);
            }
        }
    })
})


describe('FunctionDeclaration', () => {
    test('Global', () => {
        const tests = [
            {
                exp: evalChunk(luaparser.parse(`
                    x = 1
                    function foo()
                        return x;
                    end
                    return foo()
                `), new Lua_Environment()), value: [1]
            },
            {
                exp: evalChunk(luaparser.parse(`
                    x = 1
                    function foo(x)
                        return x;
                    end
                    return foo(5), x
                `), new Lua_Environment()), value: [5, 1]
            },
            {
                exp: evalChunk(luaparser.parse(`
                    x = 1
                    function foo(x, y)
                        return x + y;
                    end
                    return foo(5, 10), x
                `), new Lua_Environment()), value: [15, 1]
            },
            {
                exp: evalChunk(luaparser.parse(`
                    x = function (p, y)
                        return p + y;
                    end
                    return x(5, 10)
                `), new Lua_Environment()), value: [15]
            },
            {
                exp: evalChunk(luaparser.parse(`
                    newAdder = function(x)
                        f = function (y)
                            return x + y
                        end
                        return f
                    end
                    addTwo = newAdder(2)
                    return addTwo(3)
                `), new Lua_Environment()), value: [5]
            },

            {
                exp: evalChunk(luaparser.parse(`
                    rec = function(x)
                        if x > 100 then
                            return true
                        else
                            return rec(x + 1)
                        end
                    end
                    return rec(1)
                `), new Lua_Environment()), value: [true]
            },
        ]

        for (const test of tests) {
            expect(test.exp).toBeDefined();
            if (!test.exp) throw Error('Return should be defined');
            if (test.exp.kind !== 'return') throw Error(`${test.exp.kind === 'error' ? test.exp.message : 'null'}`);
            expect(test.exp.kind).toBe('return');

            for (let i = 0; i < test.exp.value.length; i++) {
                const val = test.exp.value[i];
                if (val.kind === 'null') expect(test.value[i]).toBe(null);
                else if (val.kind === 'error') throw Error('should not be an error')
                else if (val.kind !== 'number' && val.kind !== 'boolean') throw Error(` should be a number ${val.kind}`);
                else expect(val.value).toBe(test.value[i]);
            }
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
