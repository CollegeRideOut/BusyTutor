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
        {
            exp:
                {
                    type: "UnaryExpression",
                    operator: "not",
                    argument: {
                        type: "BooleanLiteral",
                        value: true,
                        raw: "true"
                    }
                } as luaparser.Expression,
            value: false
        },

        {
            exp:
                {
                    type: "UnaryExpression",
                    operator: "not",
                    argument: {
                        type: "BooleanLiteral",
                        value: false,
                        raw: "false"
                    }
                } as luaparser.Expression,
            value: true
        },


        {
            exp:
                {
                    type: "UnaryExpression",
                    operator: "not",
                    argument: {
                        type: "UnaryExpression",
                        operator: "not",
                        argument: {
                            type: "BooleanLiteral",
                            value: true,
                            raw: "true"
                        }
                    }
                } as luaparser.Expression,
            value: true
        },



        {
            exp:
                {
                    type: "UnaryExpression",
                    operator: "not",
                    argument: {
                        type: "UnaryExpression",
                        operator: "not",
                        argument: {
                            type: "BooleanLiteral",
                            value: false,
                            raw: "true"
                        }
                    }
                } as luaparser.Expression,
            value: false
        },



        {
            exp:
                {
                    type: "UnaryExpression",
                    operator: "not",
                    argument: {
                        type: "NumericLiteral",
                        value: 5,
                        raw: "5"
                    }
                } as luaparser.Expression,
            value: false
        },

        {
            exp:
                {
                    type: "UnaryExpression",
                    operator: "not",
                    argument: {
                        type: "UnaryExpression",
                        operator: "not",
                        argument: {
                            type: "NumericLiteral",
                            value: 5,
                            raw: "5"
                        }
                    }
                } as luaparser.Expression,
            value: true
        },

        {
            exp:
                {
                    type: "UnaryExpression",
                    operator: "not",
                    argument: {
                        type: "NilLiteral",
                        value: null,
                        raw: "nil"
                    }
                } as luaparser.Expression,
            value: true
        },
        {
            exp:
                {
                    type: "UnaryExpression",
                    operator: "not",
                    argument: {
                        type: "UnaryExpression",
                        operator: "not",
                        argument: {
                            type: "NilLiteral",
                            value: null,
                            raw: "nil"
                        }
                    }
                } as luaparser.Expression,
            value: false
        }

    ];

    for (const test of tests) {
        let val = evalExpression(test.exp)
        expect(val.kind).toBe('boolean');
        expect((val as Lua_Boolean).value, JSON.stringify(test.exp)).toBe(test.value)
    }
})



describe('Minues operator', () => {
    test('Integer', () => {
        const tests = [
            {
                exp: {
                    type: "UnaryExpression",
                    operator: "-",
                    argument: {
                        type: "NumericLiteral",
                        value: 2,
                        raw: "2"
                    }
                } as luaparser.Expression,
                value: -2
            },

            {
                exp: {
                    type: "UnaryExpression",
                    operator: "-",
                    argument: {
                        type: "NumericLiteral",
                        value: 10,
                        raw: "10"
                    }
                } as luaparser.Expression,
                value: -10
            }
        ];

        for (const test of tests) {
            let val = evalExpression(test.exp);
            expect(val.kind).toBe('number');
            expect((val as Lua_Number).value, JSON.stringify(test.exp)).toBe(test.value);
        }
        //TODO string coerces to int
    })



})

describe('BinaryExpression', () => {
    test('+', () => {
        const tests = [
            {
                exp: {
                    type: "BinaryExpression",
                    operator: "+",
                    left: {
                        type: "BinaryExpression",
                        operator: "+",
                        left: {
                            type: "BinaryExpression",
                            operator: "+",
                            left: {
                                type: "NumericLiteral",
                                value: 10,
                                raw: "10"
                            },
                            right: {
                                type: "NumericLiteral",
                                value: 10,
                                raw: "10"
                            }
                        },
                        right: {
                            type: "NumericLiteral",
                            value: 10,
                            raw: "10"
                        }
                    },
                    right: {
                        type: "NumericLiteral",
                        value: 10,
                        raw: "10"
                    }
                } as luaparser.Expression,
                value: 40
            },
        ]

        for (const test of tests) {
            let val = evalExpression(test.exp)
            expect(val.kind).toBe('number');
            expect((val as Lua_Number).value, JSON.stringify(test.exp)).toBe(test.value)
        }

    })

    test('-', () => {
        const tests = [
            {
                exp: {
                    type: "BinaryExpression",
                    operator: "-",
                    left: {
                        type: "BinaryExpression",
                        operator: "-",
                        left: {
                            type: "BinaryExpression",
                            operator: "-",
                            left: {
                                type: "NumericLiteral",
                                value: 10,
                                raw: "10"
                            },
                            right: {
                                type: "NumericLiteral",
                                value: 10,
                                raw: "10"
                            }
                        },
                        right: {
                            type: "NumericLiteral",
                            value: 10,
                            raw: "10"
                        }
                    },
                    right: {
                        type: "NumericLiteral",
                        value: 10,
                        raw: "10"
                    }
                } as luaparser.Expression,
                value: -20
            },
        ]

        for (const test of tests) {
            let val = evalExpression(test.exp)
            expect(val.kind).toBe('number');
            expect((val as Lua_Number).value, JSON.stringify(test.exp)).toBe(test.value)
        }

    })

    test('*', () => {
        const tests = [
            {
                exp: {
                    type: "BinaryExpression",
                    operator: "*",
                    left: {
                        type: "BinaryExpression",
                        operator: "*",
                        left: {
                            type: "BinaryExpression",
                            operator: "*",
                            left: {
                                type: "NumericLiteral",
                                value: 10,
                                raw: "10"
                            },
                            right: {
                                type: "NumericLiteral",
                                value: 10,
                                raw: "10"
                            }
                        },
                        right: {
                            type: "NumericLiteral",
                            value: 10,
                            raw: "10"
                        }
                    },
                    right: {
                        type: "NumericLiteral",
                        value: 10,
                        raw: "10"
                    }
                } as luaparser.Expression,
                value: 10000
            },
        ]

        for (const test of tests) {
            let val = evalExpression(test.exp)
            expect(val.kind).toBe('number');
            expect((val as Lua_Number).value, JSON.stringify(test.exp)).toBe(test.value)
        }

    })

    test('/', () => {
        const tests = [
            {
                exp: {
                    type: "BinaryExpression",
                    operator: "/",
                    left: {
                        type: "NumericLiteral",
                        value: 1,
                        raw: "5"
                    },
                    right: {
                        type: "NumericLiteral",
                        value: 2,
                        raw: "5"
                    }
                } as luaparser.Expression,
                value: 0.5
            },
        ]

        for (const test of tests) {
            let val = evalExpression(test.exp)
            expect(val.kind).toBe('number');
            expect((val as Lua_Number).value, JSON.stringify(test.exp)).toBe(test.value)
        }

    })

    test('%', () => {
        const tests = [
            {
                exp: {
                    type: "BinaryExpression",
                    operator: "%",
                    left: {
                        type: "NumericLiteral",
                        value: 5,
                        raw: "5"
                    },
                    right: {
                        type: "NumericLiteral",
                        value: 5,
                        raw: "5"
                    }
                } as luaparser.Expression,
                value: 0
            },
        ]

        for (const test of tests) {
            let val = evalExpression(test.exp)
            expect(val.kind).toBe('number');
            expect((val as Lua_Number).value, JSON.stringify(test.exp)).toBe(test.value)
        }

    })

    test('//', () => {
        const tests = [
            {
                exp: {
                    type: "BinaryExpression",
                    operator: "//",
                    left: {
                        type: "NumericLiteral",
                        value: 1,
                        raw: "5"
                    },
                    right: {
                        type: "NumericLiteral",
                        value: 2,
                        raw: "5"
                    }
                } as luaparser.Expression,
                value: 0
            },
        ]

        for (const test of tests) {
            let val = evalExpression(test.exp)
            expect(val.kind).toBe('number');
            expect((val as Lua_Number).value, JSON.stringify(test.exp)).toBe(test.value)
        }

    })

    // TODO baaad test delete this 
    test('^', () => {
        const tests = [
            {
                exp: {
                    type: "BinaryExpression",
                    operator: "^",
                    left: {
                        type: "NumericLiteral",
                        value: 2,
                        raw: "2"
                    },
                    right: {
                        type: "NumericLiteral",
                        value: 4,
                        raw: "4"
                    }
                } as luaparser.Expression,
                value: Math.exp(4 * Math.log(2))
            },
        ]

        for (const test of tests) {
            let val = evalExpression(test.exp)
            expect(val.kind).toBe('number');
            expect((val as Lua_Number).value, JSON.stringify(test.exp)).toBe(test.value)
        }
    })



    test('<', () => {
        const tests = [
            {
                exp: {
                    type: "BinaryExpression",
                    operator: "<",
                    left: {
                        type: "NumericLiteral",
                        value: 5,
                        raw: "5"
                    },
                    right: {
                        type: "NumericLiteral",
                        value: 5,
                        raw: "5"
                    }
                } as luaparser.Expression,
                value: false
            },
        ]

        for (const test of tests) {
            let val = evalExpression(test.exp)
            expect(val.kind).toBe('boolean');
            expect((val as Lua_Boolean).value, JSON.stringify(test.exp)).toBe(test.value)
        }

    })

    test('>', () => {
        const tests = [
            {
                exp: {
                    type: "BinaryExpression",
                    operator: ">",
                    left: {
                        type: "NumericLiteral",
                        value: 5,
                        raw: "5"
                    },
                    right: {
                        type: "NumericLiteral",
                        value: 5,
                        raw: "5"
                    }
                } as luaparser.Expression,
                value: false
            },
        ]

        for (const test of tests) {
            let val = evalExpression(test.exp)
            expect(val.kind).toBe('boolean');
            expect((val as Lua_Boolean).value, JSON.stringify(test.exp)).toBe(test.value)
        }
    })

    test('==', () => {
        const tests = [
            {
                exp: {
                    type: "BinaryExpression",
                    operator: "==",
                    left: {
                        type: "NumericLiteral",
                        value: 5,
                        raw: "5"
                    },
                    right: {
                        type: "NumericLiteral",
                        value: 5,
                        raw: "5"
                    }
                } as luaparser.Expression,
                value: true
            },
        ]

        for (const test of tests) {
            let val = evalExpression(test.exp)
            expect(val.kind).toBe('boolean');
            expect((val as Lua_Boolean).value, JSON.stringify(test.exp)).toBe(test.value)
        }
    })

    test('~=', () => {
        const tests = [
            {
                exp: {
                    type: "BinaryExpression",
                    operator: "~=",
                    left: {
                        type: "NumericLiteral",
                        value: 5,
                        raw: "5"
                    },
                    right: {
                        type: "NumericLiteral",
                        value: 5,
                        raw: "5"
                    }
                } as luaparser.Expression,
                value: false
            },
        ]

        for (const test of tests) {
            let val = evalExpression(test.exp)
            expect(val.kind).toBe('boolean');
            expect((val as Lua_Boolean).value, JSON.stringify(test.exp)).toBe(test.value)
        }
    })


    test('<=', () => {
        const tests = [
            {
                exp: {
                    type: "BinaryExpression",
                    operator: "<=",
                    left: {
                        type: "NumericLiteral",
                        value: 5,
                        raw: "5"
                    },
                    right: {
                        type: "NumericLiteral",
                        value: 5,
                        raw: "5"
                    }
                } as luaparser.Expression,
                value: true
            },
        ]

        for (const test of tests) {
            let val = evalExpression(test.exp)
            expect(val.kind).toBe('boolean');
            expect((val as Lua_Boolean).value, JSON.stringify(test.exp)).toBe(test.value)
        }
    })
    test('>=', () => {
        const tests = [
            {
                exp: {
                    type: "BinaryExpression",
                    operator: ">=",
                    left: {
                        type: "NumericLiteral",
                        value: 5,
                        raw: "5"
                    },
                    right: {
                        type: "NumericLiteral",
                        value: 5,
                        raw: "5"
                    }
                } as luaparser.Expression,
                value: true
            },
        ]

        for (const test of tests) {
            let val = evalExpression(test.exp)
            expect(val.kind).toBe('boolean');
            expect((val as Lua_Boolean).value, JSON.stringify(test.exp)).toBe(test.value)
        }
    })
})



// !Important this return statement ima use it as a base for everything
describe('ReturnStatement', () => {
    test('One argument', () => {
        const tests = [
            { exp: evalProgram(luaparser.parse('return 10')), value: 10 }
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
