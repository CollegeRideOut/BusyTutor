import { expect, test, describe } from "vitest";
import { evalChunkTestHelper } from "./eval_generator";
import luaparser from 'luaparse'
import { Lua_Environment } from "../interperter/lua_types";

test("StringLiteral", () => {
    const tests = [
        {
            exp: evalChunkTestHelper(luaparser.parse('return "hello"', { locations: true }), new Lua_Environment()),
            value: "hello",
        },
        {
            exp: evalChunkTestHelper(luaparser.parse("return 'hello'", { locations: true }), new Lua_Environment()),
            value: "hello",
        },
        {
            exp: evalChunkTestHelper(
                luaparser.parse("return [[hello]]", { locations: true }),
                new Lua_Environment(),
            ),
            value: "hello",
        },
        {
            exp: evalChunkTestHelper(
                luaparser.parse("return [==[hello]==]", { locations: true }),
                new Lua_Environment(),
            ),
            value: "hello",
        },
    ];

    for (const test of tests) {
        expect(test.exp).toBeDefined();
        if (!test.exp) throw Error(`test.exp is not defined`);

        expect(test.exp.kind).toBe("return");
        if (test.exp.kind !== "return") throw Error(`test.exp is not defined`);

        expect(test.exp.value[0].kind).toBe("string");
        if (test.exp.value[0].kind !== "string")
            throw Error(`test.exp value[0] is not a boolean ${test.exp}`);
        expect(test.exp.value[0].value).toBe(test.value);
    }
});

// false and nil are false anything els is true 2.5.3
test("NotOperator", () => {
    const tests = [
        {
            exp: evalChunkTestHelper(luaparser.parse("return not true", { locations: true }), new Lua_Environment()),
            value: false,
        },
        {
            exp: evalChunkTestHelper(
                luaparser.parse("return not false", { locations: true }),
                new Lua_Environment(),
            ),
            value: true,
        },
        {
            exp: evalChunkTestHelper(
                luaparser.parse("return not not true", { locations: true }),
                new Lua_Environment(),
            ),
            value: true,
        },
        {
            exp: evalChunkTestHelper(
                luaparser.parse("return not not false", { locations: true }),
                new Lua_Environment(),
            ),
            value: false,
        },
        {
            exp: evalChunkTestHelper(luaparser.parse("return not 5", { locations: true }), new Lua_Environment()),
            value: false,
        },
        {
            exp: evalChunkTestHelper(
                luaparser.parse("return not not 5", { locations: true }),
                new Lua_Environment(),
            ),
            value: true,
        },
        {
            exp: evalChunkTestHelper(
                luaparser.parse("return not not 5", { locations: true }),
                new Lua_Environment(),
            ),
            value: true,
        },
        {
            exp: evalChunkTestHelper(luaparser.parse("return not nil", { locations: true }), new Lua_Environment()),
            value: true,
        },
        {
            exp: evalChunkTestHelper(
                luaparser.parse("return not not nil", { locations: true }),
                new Lua_Environment(),
            ),
            value: false,
        },
    ];

    for (const test of tests) {
        expect(test.exp).toBeDefined();
        if (!test.exp) throw Error(`test.exp is not defined`);

        expect(test.exp.kind).toBe("return");
        if (test.exp.kind !== "return") throw Error(`test.exp is not defined`);

        expect(test.exp.value[0].kind).toBe("boolean");
        if (test.exp.value[0].kind !== "boolean")
            throw Error(`test.exp value[0] is not a boolean ${test.exp}`);
        expect(test.exp.value[0].value).toBe(test.value);
    }
});

test("LengthOperator #", () => {
    const tests = [
        {
            exp: evalChunkTestHelper(luaparser.parse('return #"hello"', { locations: true }), new Lua_Environment()),
            value: 5,
        },
        {
            exp: evalChunkTestHelper(
                luaparser.parse('x = "22" return #x', { locations: true }),
                new Lua_Environment(),
            ),
            value: 2,
        },
        {
            exp: evalChunkTestHelper(
                luaparser.parse("x = {1,2,3} return #x", { locations: true }),
                new Lua_Environment(),
            ),
            value: 3,
        },
        {
            exp: evalChunkTestHelper(
                luaparser.parse("return #{1,2,3, 4}", { locations: true }),
                new Lua_Environment(),
            ),
            value: 4,
        },
    ];

    for (const test of tests) {
        expect(test.exp).toBeDefined();
        if (!test.exp) throw Error(`test.exp is not defined`);

        expect(test.exp.kind).toBe("return");
        if (test.exp.kind !== "return") throw Error(`test.exp is not defined`);

        expect(test.exp.value[0].kind).toBe("number");
        if (test.exp.value[0].kind !== "number")
            throw Error(`test.exp value[0] is not a number ${test.exp}`);
        expect(test.exp.value[0].value).toBe(test.value);
    }
});

describe("Minues operator", () => {
    test("Integer", () => {
        const tests = [
            {
                exp: evalChunkTestHelper(luaparser.parse("return -2", { locations: true }), new Lua_Environment()),
                value: -2,
            },
            {
                exp: evalChunkTestHelper(luaparser.parse("return -10", { locations: true }), new Lua_Environment()),
                value: -10,
            },
        ];

        for (const test of tests) {
            expect(test.exp).toBeDefined();
            if (!test.exp) throw Error(`test.exp is not defined`);

            expect(test.exp.kind).toBe("return");
            if (test.exp.kind !== "return") throw Error(`test.exp is not defined`);

            expect(test.exp.value[0].kind).toBe("number");
            if (test.exp.value[0].kind !== "number")
                throw Error(`test.exp value[0] is not a number ${test.exp}`);
            expect(test.exp.value[0].value).toBe(test.value);
        }
        //TODO string coerces to int
    });
});

describe("BinaryExpression", () => {
    test("+", () => {
        const tests = [
            {
                exp: evalChunkTestHelper(
                    luaparser.parse("return 10 + 10 + 10 + 10", { locations: true }),
                    new Lua_Environment(),
                ),
                value: 40,
            },
            {
                exp: evalChunkTestHelper(
                    luaparser.parse("return 10 + 10 ", { locations: true }),
                    new Lua_Environment(),
                ),
                value: 20,
            },
            {
                exp: evalChunkTestHelper(
                    luaparser.parse("return 10 + 10 + 20", { locations: true }),
                    new Lua_Environment(),
                ),
                value: 40,
            },
        ];
        for (const test of tests) {
            expect(test.exp).toBeDefined();
            if (!test.exp) throw Error(`test.exp is not defined`);

            expect(test.exp.kind).toBe("return");
            if (test.exp.kind !== "return") throw Error(`test.exp is not defined`);

            expect(test.exp.value[0].kind).toBe("number");
            if (test.exp.value[0].kind !== "number")
                throw Error(`test.exp value[0] is not a number ${test.exp}`);
            expect(test.exp.value[0].value).toBe(test.value);
        }
    });

    test("-", () => {
        const tests = [
            {
                exp: evalChunkTestHelper(
                    luaparser.parse("return 10 - 10 - 10 - 10", { locations: true }),
                    new Lua_Environment(),
                ),
                value: -20,
            },
            {
                exp: evalChunkTestHelper(
                    luaparser.parse("return 10 - 10 ", { locations: true }),
                    new Lua_Environment(),
                ),
                value: 0,
            },
            {
                exp: evalChunkTestHelper(
                    luaparser.parse("return 10  - 20", { locations: true }),
                    new Lua_Environment(),
                ),
                value: -10,
            },
        ];
        for (const test of tests) {
            expect(test.exp).toBeDefined();
            if (!test.exp) throw Error(`test.exp is not defined`);

            expect(test.exp.kind).toBe("return");
            if (test.exp.kind !== "return") throw Error(`test.exp is not defined`);

            expect(test.exp.value[0].kind).toBe("number");
            if (test.exp.value[0].kind !== "number")
                throw Error(`test.exp value[0] is not a number ${test.exp}`);
            expect(test.exp.value[0].value).toBe(test.value);
        }
    });

    test("*", () => {
        const tests = [
            {
                exp: evalChunkTestHelper(
                    luaparser.parse("return 10 * 10 * 10 * 10", { locations: true }),
                    new Lua_Environment(),
                ),
                value: 10000,
            },
            {
                exp: evalChunkTestHelper(
                    luaparser.parse("return 10 * 10 ", { locations: true }),
                    new Lua_Environment(),
                ),
                value: 100,
            },
            {
                exp: evalChunkTestHelper(
                    luaparser.parse("return 10 * 20", { locations: true }),
                    new Lua_Environment(),
                ),
                value: 200,
            },
        ];
        for (const test of tests) {
            expect(test.exp).toBeDefined();
            if (!test.exp) throw Error(`test.exp is not defined`);

            expect(test.exp.kind).toBe("return");
            if (test.exp.kind !== "return") throw Error(`test.exp is not defined`);
            expect(test.exp.value[0].kind).toBe("number");

            if (test.exp.value[0].kind !== "number")
                throw Error(`test.exp value[0] is not a number ${test.exp}`);
            expect(test.exp.value[0].value).toBe(test.value);
        }
    });

    test("/", () => {
        const tests = [
            {
                exp: evalChunkTestHelper(
                    luaparser.parse("return 10 / 10", { locations: true }),
                    new Lua_Environment(),
                ),
                value: 1,
            },
        ];
        for (const test of tests) {
            expect(test.exp).toBeDefined();
            if (!test.exp) throw Error(`test.exp is not defined`);

            expect(test.exp.kind).toBe("return");
            if (test.exp.kind !== "return") throw Error(`test.exp is not defined`);

            expect(test.exp.value[0].kind).toBe("number");
            if (test.exp.value[0].kind !== "number")
                throw Error(`test.exp value[0] is not a number ${test.exp}`);
            expect(test.exp.value[0].value).toBe(test.value);
        }
    });

    test("%", () => {
        const tests = [
            {
                exp: evalChunkTestHelper(
                    luaparser.parse("return 10 % 10", { locations: true }),
                    new Lua_Environment(),
                ),
                value: 0,
            },
        ];
        for (const test of tests) {
            expect(test.exp).toBeDefined();
            if (!test.exp) throw Error(`test.exp is not defined`);

            expect(test.exp.kind).toBe("return");
            if (test.exp.kind !== "return") throw Error(`test.exp is not defined`);

            expect(test.exp.value[0].kind).toBe("number");
            if (test.exp.value[0].kind !== "number")
                throw Error(`test.exp value[0] is not a number ${test.exp}`);
            expect(test.exp.value[0].value).toBe(test.value);
        }
    });

    //TODO idk
    //test('//', () => {
    //    const tests = [
    //        { exp: evalChunkTestHelper(luaparser.parse('return 1 // 2', {locations: true})), value: 0 },
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
    test("^", () => {
        const tests = [
            {
                exp: evalChunkTestHelper(
                    luaparser.parse("return 10 ^ 10", { locations: true }),
                    new Lua_Environment(),
                ),
                value: Math.exp(10 * Math.log(10)),
            },
        ];
        for (const test of tests) {
            expect(test.exp).toBeDefined();
            if (!test.exp) throw Error(`test.exp is not defined`);

            expect(test.exp.kind).toBe("return");
            if (test.exp.kind !== "return") throw Error(`test.exp is not defined`);

            expect(test.exp.value[0].kind).toBe("number");
            if (test.exp.value[0].kind !== "number")
                throw Error(`test.exp value[0] is not a number ${test.exp}`);
            expect(test.exp.value[0].value).toBe(test.value);
        }
    });

    // string
    test("..", () => {
        const tests = [
            {
                exp: evalChunkTestHelper(
                    luaparser.parse('return "hel".."lo"', { locations: true }),
                    new Lua_Environment(),
                ),
                value: "hello",
            },
            {
                exp: evalChunkTestHelper(
                    luaparser.parse('x = "he"; return x .. "llo" ', { locations: true }),
                    new Lua_Environment(),
                ),
                value: "hello",
            },
            {
                exp: evalChunkTestHelper(
                    luaparser.parse('x, y = "hel", "lo"; return x .. y', { locations: true }),
                    new Lua_Environment(),
                ),
                value: "hello",
            },
        ];
        for (const test of tests) {
            expect(test.exp).toBeDefined();
            if (!test.exp) throw Error(`test.exp is not defined`);

            expect(test.exp.kind).toBe("return");
            if (test.exp.kind !== "return") throw Error(`test.exp is not defined`);
            expect(test.exp.value[0].kind).toBe("string");

            if (test.exp.value[0].kind !== "string")
                throw Error(`test.exp value[0] is not a number ${test.exp}`);
            expect(test.exp.value[0].value).toBe(test.value);
        }
    });

    //booleans
    test("<", () => {
        const tests = [
            {
                exp: evalChunkTestHelper(
                    luaparser.parse("return 10 < 10", { locations: true }),
                    new Lua_Environment(),
                ),
                value: false,
            },
        ];
        for (const test of tests) {
            expect(test.exp).toBeDefined();
            if (!test.exp) throw Error(`test.exp is not defined`);

            expect(test.exp.kind).toBe("return");
            if (test.exp.kind !== "return") throw Error(`test.exp is not defined`);

            expect(test.exp.value[0].kind).toBe("boolean");
            if (test.exp.value[0].kind !== "boolean")
                throw Error(`test.exp value[0] is not a boolean ${test.exp}`);
            expect(test.exp.value[0].value).toBe(test.value);
        }
    });

    test(">", () => {
        const tests = [
            {
                exp: evalChunkTestHelper(
                    luaparser.parse("return 10 > 10", { locations: true }),
                    new Lua_Environment(),
                ),
                value: false,
            },
        ];
        for (const test of tests) {
            expect(test.exp).toBeDefined();
            if (!test.exp) throw Error(`test.exp is not defined`);

            expect(test.exp.kind).toBe("return");
            if (test.exp.kind !== "return") throw Error(`test.exp is not defined`);

            expect(test.exp.value[0].kind).toBe("boolean");
            if (test.exp.value[0].kind !== "boolean")
                throw Error(`test.exp value[0] is not a boolean ${test.exp}`);
            expect(test.exp.value[0].value).toBe(test.value);
        }
    });

    test("==", () => {
        const tests = [
            {
                exp: evalChunkTestHelper(
                    luaparser.parse("return 10 == 10", { locations: true }),
                    new Lua_Environment(),
                ),
                value: true,
            },
        ];
        for (const test of tests) {
            expect(test.exp).toBeDefined();
            if (!test.exp) throw Error(`test.exp is not defined`);

            expect(test.exp.kind).toBe("return");
            if (test.exp.kind !== "return") throw Error(`test.exp is not defined`);

            expect(test.exp.value[0].kind).toBe("boolean");
            if (test.exp.value[0].kind !== "boolean")
                throw Error(`test.exp value[0] is not a boolean ${test.exp}`);
            expect(test.exp.value[0].value).toBe(test.value);
        }
    });

    test("~=", () => {
        const tests = [
            {
                exp: evalChunkTestHelper(
                    luaparser.parse("return 10 ~= 10", { locations: true }),
                    new Lua_Environment(),
                ),
                value: false,
            },
        ];
        for (const test of tests) {
            expect(test.exp).toBeDefined();
            if (!test.exp) throw Error(`test.exp is not defined`);

            expect(test.exp.kind).toBe("return");
            if (test.exp.kind !== "return") throw Error(`test.exp is not defined`);

            expect(test.exp.value[0].kind).toBe("boolean");
            if (test.exp.value[0].kind !== "boolean")
                throw Error(`test.exp value[0] is not a boolean ${test.exp}`);
            expect(test.exp.value[0].value).toBe(test.value);
        }
    });

    test("<=", () => {
        const tests = [
            {
                exp: evalChunkTestHelper(
                    luaparser.parse("return 10 <= 10", { locations: true }),
                    new Lua_Environment(),
                ),
                value: true,
            },
        ];
        for (const test of tests) {
            expect(test.exp).toBeDefined();
            if (!test.exp) throw Error(`test.exp is not defined`);

            expect(test.exp.kind).toBe("return");
            if (test.exp.kind !== "return") throw Error(`test.exp is not defined`);

            expect(test.exp.value[0].kind).toBe("boolean");
            if (test.exp.value[0].kind !== "boolean")
                throw Error(`test.exp value[0] is not a boolean ${test.exp}`);
            expect(test.exp.value[0].value).toBe(test.value);
        }
    });
    test(">=", () => {
        const tests = [
            {
                exp: evalChunkTestHelper(
                    luaparser.parse("return 10 >= 10", { locations: true }),
                    new Lua_Environment(),
                ),
                value: true,
            },
        ];
        for (const test of tests) {
            expect(test.exp).toBeDefined();

            if (!test.exp) throw Error(`test.exp is not defined`);

            expect(test.exp.kind).toBe("return");
            if (test.exp.kind !== "return") throw Error(`test.exp is not defined`);

            expect(test.exp.value[0].kind).toBe("boolean");
            if (test.exp.value[0].kind !== "boolean")
                throw Error(`test.exp value[0] is not a boolean ${test.exp}`);
            expect(test.exp.value[0].value).toBe(test.value);
        }
    });
});

// !Important this return statement ima use it as a base for everything
describe("ReturnStatement", () => {
    test("One argument", () => {
        const tests = [
            {
                exp: evalChunkTestHelper(luaparser.parse("return 10", { locations: true }), new Lua_Environment()),
                value: 10,
            },
            {
                exp: evalChunkTestHelper(luaparser.parse("return 12", { locations: true }), new Lua_Environment()),
                value: 12,
            },
            {
                exp: evalChunkTestHelper(luaparser.parse("return 14", { locations: true }), new Lua_Environment()),
                value: 14,
            },
            {
                exp: evalChunkTestHelper(luaparser.parse("return 20", { locations: true }), new Lua_Environment()),
                value: 20,
            },
        ];

        for (const test of tests) {
            expect(test.exp).toBeDefined();
            if (!test.exp) throw Error("Return should be defined");

            expect(test.exp.kind).toBe("return");
            if (test.exp.kind !== "return") throw Error(`test.exp is not defined`);

            expect(test.exp.value[0].kind).toBe("number");
            if (test.exp.value[0].kind !== "number")
                throw Error("Return value should be number");
            expect(test.exp.value[0].value).toBe(test.value);
        }
    });

    test("Two argument", () => {
        const tests = [
            {
                exp: evalChunkTestHelper(luaparser.parse("return 10, 20", { locations: true }), new Lua_Environment()),
                value: [10, 20],
            },
            {
                exp: evalChunkTestHelper(luaparser.parse("return 12, 30", { locations: true }), new Lua_Environment()),
                value: [12, 30],
            },
            {
                exp: evalChunkTestHelper(luaparser.parse("return 14, 50", { locations: true }), new Lua_Environment()),
                value: [14, 50],
            },
            {
                exp: evalChunkTestHelper(luaparser.parse("return 20, 11", { locations: true }), new Lua_Environment()),
                value: [20, 11],
            },
        ];

        for (const test of tests) {
            expect(test.exp).toBeDefined();
            if (!test.exp) throw Error("Return should be defined");

            expect(test.exp.kind).toBe("return");
            if (test.exp.kind !== "return") throw Error(`test.exp is not defined`);

            expect(test.exp.value[0].kind).toBe("number");
            if (test.exp.value[0].kind !== "number")
                throw Error("Return value should be number");
            expect(test.exp.value[0].value).toBe(test.value[0]);

            expect(test.exp.value[1].kind).toBe("number");
            if (test.exp.value[1].kind !== "number")
                throw Error("Return value should be number");
            expect(test.exp.value[1].value).toBe(test.value[1]);
        }
    });
});

describe("IfStatement", () => {
    test("IfCaluse", () => {
        const tests = [
            {
                exp: evalChunkTestHelper(
                    luaparser.parse("if true then return 5 end", { locations: true }),
                    new Lua_Environment(),
                ),
                value: 5,
            },
            {
                exp: evalChunkTestHelper(
                    luaparser.parse(
                        `if false then return 5 elseif true then return 10 end return 20`,
                        { locations: true }
                    ),
                    new Lua_Environment(),
                ),
                value: 10,
            },
            {
                exp: evalChunkTestHelper(
                    luaparser.parse(
                        `if false then return 5 elseif false then return 10 else return 2 end return 20`,
                        { locations: true }
                    ),
                    new Lua_Environment(),
                ),
                value: 2,
            },
            {
                exp: evalChunkTestHelper(
                    luaparser.parse(`
                 if true then 
                     if true then
                         return 99
                     end
                 elseif false then 
                    return 10 
                 else 
                     return 2 
                 end 
                 return 20`,
                        { locations: true }
                    ),
                    new Lua_Environment(),
                ),
                value: 99,
            },
        ];

        for (const test of tests) {
            expect(test.exp).toBeDefined();
            if (!test.exp) throw Error("Return should be defined");

            expect(test.exp.kind,).toBe("return");
            if (test.exp.kind !== "return") throw Error(`test.exp is not defined`);

            expect(test.exp.value[0].kind).toBe("number");
            if (test.exp.value[0].kind !== "number")
                throw Error("Return value should be number");
            expect(test.exp.value[0].value).toBe(test.value);
        }
    });
});

describe("Errors", () => {
    test("types", () => {
        const tests = [
            {
                exp: evalChunkTestHelper(
                    luaparser.parse("return 5 + true", { locations: true }),
                    new Lua_Environment(),
                ),
                value: 5,
            },
            {
                exp: evalChunkTestHelper(luaparser.parse("return -true", { locations: true }), new Lua_Environment()),
                value: 5,
            },
            {
                exp: evalChunkTestHelper(
                    luaparser.parse("return true + false", { locations: true }),
                    new Lua_Environment(),
                ),
                value: 5,
            },
        ];

        for (const test of tests) {
            expect(test.exp).toBeDefined();
            if (!test.exp) throw Error("Return should be defined");

            expect(test.exp.kind).toBe("error");
        }
    });
});

describe("AssignmentStatement", () => {
    test("Global", () => {
        const tests = [
            {
                exp: evalChunkTestHelper(
                    luaparser.parse("x = 5; return x", { locations: true }),
                    new Lua_Environment(),
                ),
                value: [5],
            },
            {
                exp: evalChunkTestHelper(
                    luaparser.parse("x = 10; return x", { locations: true }),
                    new Lua_Environment(),
                ),
                value: [10],
            },
            {
                exp: evalChunkTestHelper(
                    luaparser.parse("x,y = 10; return x, y", { locations: true }),
                    new Lua_Environment(),
                ),
                value: [10, null],
            },
            {
                exp: evalChunkTestHelper(
                    luaparser.parse("x,y = 10, 20; return x, y", { locations: true }),
                    new Lua_Environment(),
                ),
                value: [10, 20],
            },
            {
                exp: evalChunkTestHelper(
                    luaparser.parse("x,y = 10, 20, 30; return x, y", { locations: true }),
                    new Lua_Environment(),
                ),
                value: [10, 20],
            },
        ];

        for (const test of tests) {
            expect(test.exp).toBeDefined();
            if (!test.exp) throw Error("Return should be defined");
            if (test.exp.kind !== "return")
                throw Error(`${test.exp.kind === "error" ? test.exp.message : "null"}`);
            expect(test.exp.kind).toBe("return");

            for (let i = 0; i < test.exp.value.length; i++) {
                const val = test.exp.value[i];
                if (val.kind === "null") expect(test.value[i]).toBe(null);
                else if (val.kind === "error") throw Error("should not be an error");
                else if (val.kind !== "number") throw Error(" should be a number");
                else expect(val!.value).toBe(test.value[i]);
            }
        }
    });
});

describe("FunctionDeclaration", () => {
    test("Global", () => {
        const tests = [
            {
                exp: evalChunkTestHelper(
                    luaparser.parse(`
                    x = 1
                    function foo()
                        x = x + 1;
                        return x
                    end
                    return foo()
                `,
                        { locations: true }
                    ),
                    new Lua_Environment(),
                ),
                value: [2],
            },
            {
                exp: evalChunkTestHelper(
                    luaparser.parse(`
                    x = 1
                    function foo(x)
                        return x;
                    end
                    return foo(5), x
                `,
                        { locations: true }
                    ),
                    new Lua_Environment(),
                ),
                value: [5, 1],
            },
            {
                exp: evalChunkTestHelper(
                    luaparser.parse(`
                    x = 1
                    function foo(x, y)
                        return x + y;
                    end
                    return foo(5, 10), x
                `,
                        { locations: true }
                    ),
                    new Lua_Environment(),
                ),
                value: [15, 1],
            },
            {
                exp: evalChunkTestHelper(
                    luaparser.parse(`
                    x = function (p, y)
                        return p + y;
                    end
                    return x(5, 10)
                `,
                        { locations: true }
                    ),
                    new Lua_Environment(),
                ),
                value: [15],
            },
            {
                exp: evalChunkTestHelper(
                    luaparser.parse(`
                    newAdder = function(x)
                        f = function (y)
                            return x + y
                        end
                        return f
                    end
                    addTwo = newAdder(2)
                    return addTwo(3)
                `,
                        { locations: true }

                    ),
                    new Lua_Environment(),
                ),
                value: [5],
            },
            //
            {
                exp: evalChunkTestHelper(
                    luaparser.parse(`
                    rec = function(x)
                        if x > 100 then
                            return true
                        else
                            return rec(x + 1)
                        end
                    end
                    return rec(1)
                `,
                        { locations: true }
                    ),
                    new Lua_Environment(),
                ),
                value: [true],
            },
        ];

        for (const test of tests) {
            expect(test.exp).toBeDefined();
            if (!test.exp) throw Error("Return should be defined");
            if (test.exp.kind !== "return")
                throw Error(`${test.exp.kind === "error" ? test.exp.message : "null"}`);
            expect(test.exp.kind).toBe("return");

            for (let i = 0; i < test.exp.value.length; i++) {
                const val = test.exp.value[i];
                if (val.kind === "null") expect(test.value[i]).toBe(null);
                else if (val.kind === "error") throw Error("should not be an error");
                else if (val.kind !== "number" && val.kind !== "boolean")
                    throw Error(` should be a number ${val.kind}`);
                else expect(val.value, `test idx ${i}`).toBe(test.value[i]);
            }
        }
    });
});

describe("Builtins", () => {
    test("Function", () => {
        const tests = [
            {
                exp: evalChunkTestHelper(
                    luaparser.parse(`
                   x = tostring(5)
                   return x
                `,
                        { locations: true }
                    ),
                    new Lua_Environment(),
                ),
                value: ["5"],
            },
        ];

        for (const test of tests) {
            expect(test.exp).toBeDefined();
            if (!test.exp) throw Error("Return should be defined");
            if (test.exp.kind !== "return")
                throw Error(`${test.exp.kind === "error" ? test.exp.message : "null"}`);
            expect(test.exp.kind).toBe("return");

            for (let i = 0; i < test.exp.value.length; i++) {
                const val = test.exp.value[i];
                if (val.kind === "null") expect(test.value[i]).toBe(null);
                else if (val.kind === "error") throw Error("should not be an error");
                else if (
                    val.kind !== "number" &&
                    val.kind !== "boolean" &&
                    val.kind !== "string"
                )
                    throw Error(` should be a number ${val.kind}`);
                else expect(val.value).toBe(test.value[i]);
            }
        }
    });
});

describe("Tables", () => {
    test("", () => {
        const tests = [
            {
                exp: evalChunkTestHelper(
                    luaparser.parse(`
                    x = { 2, 3 }
                    return x[1]
                `,
                        { locations: true }
                    ),
                    new Lua_Environment(),
                ),
                value: [2],
            },
            {
                exp: evalChunkTestHelper(
                    luaparser.parse(`
                    x = { name = 1 }
                    return x['name']
                `,
                        { locations: true }
                    ),
                    new Lua_Environment(),
                ),
                value: [1],
            },
            //
            {
                exp: evalChunkTestHelper(
                    luaparser.parse(`
                    name = '2'
                    x = { name = 1 }
                    return x['name']
                `,
                        { locations: true }
                    ),
                    new Lua_Environment(),
                ),
                value: [1],
            },
            //
            {
                exp: evalChunkTestHelper(
                    luaparser.parse(`
                    x = { name = 1 }
                    return x['name']
                `,
                        { locations: true }
                    ),
                    new Lua_Environment(),
                ),
                value: [1],
            },
            {
                exp: evalChunkTestHelper(
                    luaparser.parse(`
                    x = { name = 1 }
                    return x['na']
                `,
                        { locations: true }
                    ),
                    new Lua_Environment(),
                ),
                value: [null],
            },
            //
            {
                exp: evalChunkTestHelper(
                    luaparser.parse(`
                    x = { ['2'] = 1 }
                    return x[2]
                `,
                        { locations: true }
                    ),
                    new Lua_Environment(),
                ),
                value: [null],
            },
            //
            {
                exp: evalChunkTestHelper(
                    luaparser.parse(`
                    k = {}
                    x = { ['2'] = 1 }
                    x[k] = 'yes'
                    return x[k]
                `,
                        { locations: true }
                    ),
                    new Lua_Environment(),
                ),
                value: ["yes"],
            },
            //
            {
                exp: evalChunkTestHelper(
                    luaparser.parse(`
                    k = {}
                    x = { ['2'] = 1 }
                    x[k] = 'yes'
                    return x[{}]
                `,
                        { locations: true }
                    ),
                    new Lua_Environment(),
                ),
                value: [null],
            },
            //
            {
                exp: evalChunkTestHelper(
                    luaparser.parse(`
                    x = {3, 2}
                    y = x
                    return y[1]
                `,
                        { locations: true }
                    ),
                    new Lua_Environment(),
                ),
                value: [3],
            },
            //
            {
                exp: evalChunkTestHelper(
                    luaparser.parse(`
                    local t = { [true] = "yes", [false] = "no" }
                    return t[false]
                `,
                        { locations: true }
                    ),
                    new Lua_Environment(),
                ),
                value: ["no"],
            },
            {
                exp: evalChunkTestHelper(
                    luaparser.parse(`
                    local t = { sound = { 1, sound = { 31 } } }
                    return t['sound']['sound'][1]
                `,
                        { locations: true }
                    ),
                    new Lua_Environment(),
                ),
                value: [31],
            },
            //
            {
                exp: evalChunkTestHelper(
                    luaparser.parse(`
                    local t = { sound = { 1, sound = { 31 } } }
                    return t.sound.sound[1]
                `,
                        { locations: true }
                    ),
                    new Lua_Environment(),
                ),
                value: [31],
            },
            //
            {
                exp: evalChunkTestHelper(
                    luaparser.parse(`
                    local t = {2, sound = function(xx) return xx[1] end }
                    return t:sound()
                `,
                        { locations: true }
                    ),
                    new Lua_Environment(),
                ),
                value: [2],
            },
            {
                exp: evalChunkTestHelper(
                    luaparser.parse(`
                    t = {2}
                    function t:sound()
                        return self[1]
                    end
                    return t:sound()
                `,
                        { locations: true }
                    ),
                    new Lua_Environment(),
                ),
                value: [2],
            },
        ];

        for (const test of tests) {
            expect(test.exp).toBeDefined();
            if (!test.exp) throw Error("Return should be defined");
            if (test.exp.kind !== "return")
                throw Error(`${test.exp.kind === "error" ? test.exp.message : "null"}`);
            expect(test.exp.kind).toBe("return");

            for (let i = 0; i < test.exp.value.length; i++) {
                const val = test.exp.value[i];
                if (val.kind === "null") expect(test.value[i]).toBe(null);
                else if (val.kind === "error") throw Error("should not be an error");
                else if (
                    val.kind !== "number" &&
                    val.kind !== "boolean" &&
                    val.kind !== "string"
                )
                    throw Error(` should be a number ${val.kind}`);
                else expect(val.value).toBe(test.value[i]);
            }
        }
    });
});


describe("metatables", () => {
    test("", () => {
        const tests = [
            {
                exp: evalChunkTestHelper(
                    luaparser.parse(`
            local fallback = { a = 10 }
            local t = setmetatable({}, { __index = fallback })

            return t.a
                            `,
                        { locations: true }
                    ),
                    new Lua_Environment(),
                ),
                value: [10],
            },

            {
                exp: evalChunkTestHelper(
                    luaparser.parse(`
local t = setmetatable({}, {
  __index = function(tbl, key)
    if key == "foo" then return 42 end
  end
})

return t.foo
                `,
                        { locations: true }
                    ),
                    new Lua_Environment(),
                ),
                value: [42],
            },

            {
                exp: evalChunkTestHelper(
                    luaparser.parse(`
            local fallback = { a = 10 }
            local t = setmetatable({ a = 99 }, { __index = fallback })

            return t.a 
                            `,
                        { locations: true }
                    ),
                    new Lua_Environment(),
                ),
                value: [99],
            },

            {
                exp: evalChunkTestHelper(
                    luaparser.parse(`
            local t = setmetatable({}, {
              __index = function(tbl, key)
                return nil
              end
            })

            return t.missing
                            `,
                        { locations: true }
                    ),
                    new Lua_Environment(),
                ),
                value: [null],
            },

            {
                exp: evalChunkTestHelper(
                    luaparser.parse(`
            local t = setmetatable({}, {
              __index = function(tbl, key)
                return nil
              end
            })

            return t.missing
                            `,
                        { locations: true }
                    ),
                    new Lua_Environment(),
                ),
                value: [null],
            },
        ];

        for (const test of tests) {
            expect(test.exp).toBeDefined();
            if (!test.exp) throw Error("Return should be defined");
            if (test.exp.kind !== "return")
                throw Error(`${test.exp.kind === "error" ? test.exp.message : "null"}`);
            expect(test.exp.kind).toBe("return");

            for (let i = 0; i < test.exp.value.length; i++) {
                const val = test.exp.value[i];
                if (val.kind === "null") expect(test.value[i]).toBe(null);
                else if (val.kind === "error") throw Error("should not be an error");
                else if (
                    val.kind !== "number" &&
                    val.kind !== "boolean" &&
                    val.kind !== "string"
                )
                    throw Error(` should be a number ${val.kind}`);
                else expect(val.value).toBe(test.value[i]);
            }
        }
    });
});



describe("oop", () => {
    test("", () => {

        const tests = [

            {
                exp: evalChunkTestHelper(
                    luaparser.parse(`
Person = {}
Person.__index = Person
-- Constructor
function Person:new(name)
    obj = setmetatable({}, self)
    obj.name = name
    return obj
end


function Person:get_name()
  return self.name
end

local p = Person:new('a')
return p:get_name()
                `,
                        { locations: true }
                    ),
                    new Lua_Environment(),
                ),
                value: ['a'],
            },
        ];

        for (const test of tests) {
            expect(test.exp).toBeDefined();
            if (!test.exp) throw Error("Return should be defined");
            if (test.exp.kind !== "return")
                throw Error(`${test.exp.kind === "error" ? test.exp.message : "null"}`);
            expect(test.exp.kind).toBe("return");

            for (let i = 0; i < test.exp.value.length; i++) {
                const val = test.exp.value[i];
                if (val.kind === "null") expect(test.value[i]).toBe(null);
                else if (val.kind === "error") throw Error("should not be an error");
                else if (
                    val.kind !== "number" &&
                    val.kind !== "boolean" &&
                    val.kind !== "string"
                )
                    throw Error(` should be a number ${val.kind}`);
                else expect(val.value).toBe(test.value[i]);
            }
        }
    });
});

test("ForNumericStatement", () => {
    const tests = [
        {
            exp: evalChunkTestHelper(
                luaparser.parse(`
                    x = 0
                    for i = 1, 3 do
                        x = x + 1
                    end

                    return x
                `,
                    { locations: true }
                ),
                new Lua_Environment(),
            ),
            value: [3],
        },
        {
            exp: evalChunkTestHelper(
                luaparser.parse(`
                    x = 0
                    for i = 1, 3 do
                      x = x + i
                    end
                    return x
                `,
                    { locations: true }
                ),
                new Lua_Environment(),
            ),
            value: [6],
        },
        {
            exp: evalChunkTestHelper(
                luaparser.parse(`
                    for i = 1, 5 do
                      if i == 3 then return i end
                    end
                    return 0
                `,
                    { locations: true }
                ),
                new Lua_Environment(),
            ),
            value: [3],
        },

        {
            exp: evalChunkTestHelper(
                luaparser.parse(`
                    function sayHi(n)
                      return "hi" .. n
                    end

                    res = ""
                    for i = 1, 2 do
                      res = res .. sayHi(i)
                    end
                    return res
                `,
                    { locations: true }
                ),
                new Lua_Environment(),
            ),
            value: ["hi1hi2"],
        },

        {
            exp: evalChunkTestHelper(
                luaparser.parse(`
                    function limit()
                      return 3
                    end

                    sum = 0
                    for i = 1, limit() do
                      sum = sum + i
                    end
                    return sum 
                `,
                    { locations: true }
                ),
                new Lua_Environment(),
            ),
            value: [6],
        },

        {
            exp: evalChunkTestHelper(
                luaparser.parse(`
                    function getStep()
                      return 2
                    end

                    sum = 0
                    for i = 1, 5, getStep() do
                      sum = sum + i
                    end
                    return sum 
                `,
                    { locations: true }
                ),
                new Lua_Environment(),
            ),
            value: [9],
        },

        {
            exp: evalChunkTestHelper(
                luaparser.parse(`
                x = 0
                function addToX(n)
                  x = x + n
                end

                for i = 1, 3 do
                  addToX(i)
                end
                return x 
                `,
                    { locations: true }
                ),
                new Lua_Environment(),
            ),
            value: [6],
        },
    ];

    for (const test of tests) {
        expect(test.exp).toBeDefined();
        if (!test.exp) throw Error("Return should be defined");
        if (test.exp.kind !== "return")
            throw Error(`${test.exp.kind === "error" ? test.exp.message : "null"}`);
        expect(test.exp.kind).toBe("return");

        for (let i = 0; i < test.exp.value.length; i++) {
            const val = test.exp.value[i];
            if (val.kind === "null") expect(test.value[i]).toBe(null);
            else if (val.kind === "error") throw Error("should not be an error");
            else if (
                val.kind !== "number" &&
                val.kind !== "boolean" &&
                val.kind !== "string"
            )
                throw Error(` should be a number ${val.kind}`);
            else expect(val.value).toBe(test.value[i]);
        }
    }
});
