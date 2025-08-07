import luaparser from 'luaparse';
import { describe, expect, test } from 'vitest';
import { evalExpression, evalChunk } from './eval';
import type { Lua_Boolean, Lua_Number } from './lua_types';
import { Lua_Environment } from './lua_types';

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
    let val = evalExpression(test.exp, new Lua_Environment());
    expect(val.kind).toBe('number');
    expect((val as Lua_Number).value).toBe(test.value);
  }
});

test('BooleanLiteral', () => {
  const tests = [
    { exp: generateBooleanLiteral(false), value: false },
    { exp: generateBooleanLiteral(true), value: true },
  ];

  for (const test of tests) {
    let val = evalExpression(test.exp, new Lua_Environment());
    expect(val.kind).toBe('boolean');
    expect((val as Lua_Boolean).value).toBe(test.value);
  }
});

test('StringLiteral', () => {
  const tests = [
    {
      exp: evalChunk(luaparser.parse('return "hello"'), new Lua_Environment()),
      value: 'hello',
    },
    {
      exp: evalChunk(luaparser.parse("return 'hello'"), new Lua_Environment()),
      value: 'hello',
    },
    {
      exp: evalChunk(
        luaparser.parse('return [[hello]]'),
        new Lua_Environment(),
      ),
      value: 'hello',
    },
    {
      exp: evalChunk(
        luaparser.parse('return [==[hello]==]'),
        new Lua_Environment(),
      ),
      value: 'hello',
    },
  ];

  for (const test of tests) {
    expect(test.exp).toBeDefined();
    if (!test.exp) throw Error(`test.exp is not defined`);

    expect(test.exp.kind).toBe('return');
    if (test.exp.kind !== 'return') throw Error(`test.exp is not defined`);

    expect(test.exp.value[0].kind).toBe('string');
    if (test.exp.value[0].kind !== 'string')
      throw Error(`test.exp value[0] is not a boolean ${test.exp}`);
    expect(test.exp.value[0].value).toBe(test.value);
  }
});

// false and nil are false anything els is true 2.5.3
test('NotOperator', () => {
  const tests = [
    {
      exp: evalChunk(luaparser.parse('return not true'), new Lua_Environment()),
      value: false,
    },
    {
      exp: evalChunk(
        luaparser.parse('return not false'),
        new Lua_Environment(),
      ),
      value: true,
    },
    {
      exp: evalChunk(
        luaparser.parse('return not not true'),
        new Lua_Environment(),
      ),
      value: true,
    },
    {
      exp: evalChunk(
        luaparser.parse('return not not false'),
        new Lua_Environment(),
      ),
      value: false,
    },
    {
      exp: evalChunk(luaparser.parse('return not 5'), new Lua_Environment()),
      value: false,
    },
    {
      exp: evalChunk(
        luaparser.parse('return not not 5'),
        new Lua_Environment(),
      ),
      value: true,
    },
    {
      exp: evalChunk(
        luaparser.parse('return not not 5'),
        new Lua_Environment(),
      ),
      value: true,
    },
    {
      exp: evalChunk(luaparser.parse('return not nil'), new Lua_Environment()),
      value: true,
    },
    {
      exp: evalChunk(
        luaparser.parse('return not not nil'),
        new Lua_Environment(),
      ),
      value: false,
    },
  ];

  for (const test of tests) {
    expect(test.exp).toBeDefined();
    if (!test.exp) throw Error(`test.exp is not defined`);

    expect(test.exp.kind).toBe('return');
    if (test.exp.kind !== 'return') throw Error(`test.exp is not defined`);

    expect(test.exp.value[0].kind).toBe('boolean');
    if (test.exp.value[0].kind !== 'boolean')
      throw Error(`test.exp value[0] is not a boolean ${test.exp}`);
    expect(test.exp.value[0].value).toBe(test.value);
  }
});

test('LengthOperator #', () => {
  const tests = [
    {
      exp: evalChunk(luaparser.parse('return #"hello"'), new Lua_Environment()),
      value: 5,
    },
    {
      exp: evalChunk(
        luaparser.parse('x = "22" return #x'),
        new Lua_Environment(),
      ),
      value: 2,
    },
    {
      exp: evalChunk(
        luaparser.parse('x = {1,2,3} return #x'),
        new Lua_Environment(),
      ),
      value: 3,
    },
    {
      exp: evalChunk(
        luaparser.parse('return #{1,2,3, 4}'),
        new Lua_Environment(),
      ),
      value: 4,
    },
  ];

  for (const test of tests) {
    expect(test.exp).toBeDefined();
    if (!test.exp) throw Error(`test.exp is not defined`);

    expect(test.exp.kind).toBe('return');
    if (test.exp.kind !== 'return') throw Error(`test.exp is not defined`);

    expect(test.exp.value[0].kind).toBe('number');
    if (test.exp.value[0].kind !== 'number')
      throw Error(`test.exp value[0] is not a number ${test.exp}`);
    expect(test.exp.value[0].value).toBe(test.value);
  }
});

describe('Minues operator', () => {
  test('Integer', () => {
    const tests = [
      {
        exp: evalChunk(luaparser.parse('return -2'), new Lua_Environment()),
        value: -2,
      },
      {
        exp: evalChunk(luaparser.parse('return -10'), new Lua_Environment()),
        value: -10,
      },
    ];

    for (const test of tests) {
      expect(test.exp).toBeDefined();
      if (!test.exp) throw Error(`test.exp is not defined`);

      expect(test.exp.kind).toBe('return');
      if (test.exp.kind !== 'return') throw Error(`test.exp is not defined`);

      expect(test.exp.value[0].kind).toBe('number');
      if (test.exp.value[0].kind !== 'number')
        throw Error(`test.exp value[0] is not a number ${test.exp}`);
      expect(test.exp.value[0].value).toBe(test.value);
    }
    //TODO string coerces to int
  });
});

describe('BinaryExpression', () => {
  test('+', () => {
    const tests = [
      {
        exp: evalChunk(
          luaparser.parse('return 10 + 10 + 10 + 10'),
          new Lua_Environment(),
        ),
        value: 40,
      },
      {
        exp: evalChunk(
          luaparser.parse('return 10 + 10 '),
          new Lua_Environment(),
        ),
        value: 20,
      },
      {
        exp: evalChunk(
          luaparser.parse('return 10 + 10 + 20'),
          new Lua_Environment(),
        ),
        value: 40,
      },
    ];
    for (const test of tests) {
      expect(test.exp).toBeDefined();
      if (!test.exp) throw Error(`test.exp is not defined`);

      expect(test.exp.kind).toBe('return');
      if (test.exp.kind !== 'return') throw Error(`test.exp is not defined`);

      expect(test.exp.value[0].kind).toBe('number');
      if (test.exp.value[0].kind !== 'number')
        throw Error(`test.exp value[0] is not a number ${test.exp}`);
      expect(test.exp.value[0].value).toBe(test.value);
    }
  });

  test('-', () => {
    const tests = [
      {
        exp: evalChunk(
          luaparser.parse('return 10 - 10 - 10 - 10'),
          new Lua_Environment(),
        ),
        value: -20,
      },
      {
        exp: evalChunk(
          luaparser.parse('return 10 - 10 '),
          new Lua_Environment(),
        ),
        value: 0,
      },
      {
        exp: evalChunk(
          luaparser.parse('return 10  - 20'),
          new Lua_Environment(),
        ),
        value: -10,
      },
    ];
    for (const test of tests) {
      expect(test.exp).toBeDefined();
      if (!test.exp) throw Error(`test.exp is not defined`);

      expect(test.exp.kind).toBe('return');
      if (test.exp.kind !== 'return') throw Error(`test.exp is not defined`);

      expect(test.exp.value[0].kind).toBe('number');
      if (test.exp.value[0].kind !== 'number')
        throw Error(`test.exp value[0] is not a number ${test.exp}`);
      expect(test.exp.value[0].value).toBe(test.value);
    }
  });

  test('*', () => {
    const tests = [
      {
        exp: evalChunk(
          luaparser.parse('return 10 * 10 * 10 * 10'),
          new Lua_Environment(),
        ),
        value: 10000,
      },
      {
        exp: evalChunk(
          luaparser.parse('return 10 * 10 '),
          new Lua_Environment(),
        ),
        value: 100,
      },
      {
        exp: evalChunk(
          luaparser.parse('return 10 * 20'),
          new Lua_Environment(),
        ),
        value: 200,
      },
    ];
    for (const test of tests) {
      expect(test.exp).toBeDefined();
      if (!test.exp) throw Error(`test.exp is not defined`);

      expect(test.exp.kind).toBe('return');
      if (test.exp.kind !== 'return') throw Error(`test.exp is not defined`);
      expect(test.exp.value[0].kind).toBe('number');

      if (test.exp.value[0].kind !== 'number')
        throw Error(`test.exp value[0] is not a number ${test.exp}`);
      expect(test.exp.value[0].value).toBe(test.value);
    }
  });

  test('/', () => {
    const tests = [
      {
        exp: evalChunk(
          luaparser.parse('return 10 / 10'),
          new Lua_Environment(),
        ),
        value: 1,
      },
    ];
    for (const test of tests) {
      expect(test.exp).toBeDefined();
      if (!test.exp) throw Error(`test.exp is not defined`);

      expect(test.exp.kind).toBe('return');
      if (test.exp.kind !== 'return') throw Error(`test.exp is not defined`);

      expect(test.exp.value[0].kind).toBe('number');
      if (test.exp.value[0].kind !== 'number')
        throw Error(`test.exp value[0] is not a number ${test.exp}`);
      expect(test.exp.value[0].value).toBe(test.value);
    }
  });

  test('%', () => {
    const tests = [
      {
        exp: evalChunk(
          luaparser.parse('return 10 % 10'),
          new Lua_Environment(),
        ),
        value: 0,
      },
    ];
    for (const test of tests) {
      expect(test.exp).toBeDefined();
      if (!test.exp) throw Error(`test.exp is not defined`);

      expect(test.exp.kind).toBe('return');
      if (test.exp.kind !== 'return') throw Error(`test.exp is not defined`);

      expect(test.exp.value[0].kind).toBe('number');
      if (test.exp.value[0].kind !== 'number')
        throw Error(`test.exp value[0] is not a number ${test.exp}`);
      expect(test.exp.value[0].value).toBe(test.value);
    }
  });

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
      {
        exp: evalChunk(
          luaparser.parse('return 10 ^ 10'),
          new Lua_Environment(),
        ),
        value: Math.exp(10 * Math.log(10)),
      },
    ];
    for (const test of tests) {
      expect(test.exp).toBeDefined();
      if (!test.exp) throw Error(`test.exp is not defined`);

      expect(test.exp.kind).toBe('return');
      if (test.exp.kind !== 'return') throw Error(`test.exp is not defined`);

      expect(test.exp.value[0].kind).toBe('number');
      if (test.exp.value[0].kind !== 'number')
        throw Error(`test.exp value[0] is not a number ${test.exp}`);
      expect(test.exp.value[0].value).toBe(test.value);
    }
  });

  // string
  test('..', () => {
    const tests = [
      {
        exp: evalChunk(
          luaparser.parse('return "hel".."lo"'),
          new Lua_Environment(),
        ),
        value: 'hello',
      },
      {
        exp: evalChunk(
          luaparser.parse('x = "he"; return x .. "llo" '),
          new Lua_Environment(),
        ),
        value: 'hello',
      },
      {
        exp: evalChunk(
          luaparser.parse('x, y = "hel", "lo"; return x .. y'),
          new Lua_Environment(),
        ),
        value: 'hello',
      },
    ];
    for (const test of tests) {
      expect(test.exp).toBeDefined();
      if (!test.exp) throw Error(`test.exp is not defined`);

      expect(test.exp.kind).toBe('return');
      if (test.exp.kind !== 'return') throw Error(`test.exp is not defined`);
      expect(test.exp.value[0].kind).toBe('string');

      if (test.exp.value[0].kind !== 'string')
        throw Error(`test.exp value[0] is not a number ${test.exp}`);
      expect(test.exp.value[0].value).toBe(test.value);
    }
  });

  //booleans
  test('<', () => {
    const tests = [
      {
        exp: evalChunk(
          luaparser.parse('return 10 < 10'),
          new Lua_Environment(),
        ),
        value: false,
      },
    ];
    for (const test of tests) {
      expect(test.exp).toBeDefined();
      if (!test.exp) throw Error(`test.exp is not defined`);

      expect(test.exp.kind).toBe('return');
      if (test.exp.kind !== 'return') throw Error(`test.exp is not defined`);

      expect(test.exp.value[0].kind).toBe('boolean');
      if (test.exp.value[0].kind !== 'boolean')
        throw Error(`test.exp value[0] is not a boolean ${test.exp}`);
      expect(test.exp.value[0].value).toBe(test.value);
    }
  });

  test('>', () => {
    const tests = [
      {
        exp: evalChunk(
          luaparser.parse('return 10 > 10'),
          new Lua_Environment(),
        ),
        value: false,
      },
    ];
    for (const test of tests) {
      expect(test.exp).toBeDefined();
      if (!test.exp) throw Error(`test.exp is not defined`);

      expect(test.exp.kind).toBe('return');
      if (test.exp.kind !== 'return') throw Error(`test.exp is not defined`);

      expect(test.exp.value[0].kind).toBe('boolean');
      if (test.exp.value[0].kind !== 'boolean')
        throw Error(`test.exp value[0] is not a boolean ${test.exp}`);
      expect(test.exp.value[0].value).toBe(test.value);
    }
  });

  test('==', () => {
    const tests = [
      {
        exp: evalChunk(
          luaparser.parse('return 10 == 10'),
          new Lua_Environment(),
        ),
        value: true,
      },
    ];
    for (const test of tests) {
      expect(test.exp).toBeDefined();
      if (!test.exp) throw Error(`test.exp is not defined`);

      expect(test.exp.kind).toBe('return');
      if (test.exp.kind !== 'return') throw Error(`test.exp is not defined`);

      expect(test.exp.value[0].kind).toBe('boolean');
      if (test.exp.value[0].kind !== 'boolean')
        throw Error(`test.exp value[0] is not a boolean ${test.exp}`);
      expect(test.exp.value[0].value).toBe(test.value);
    }
  });

  test('~=', () => {
    const tests = [
      {
        exp: evalChunk(
          luaparser.parse('return 10 ~= 10'),
          new Lua_Environment(),
        ),
        value: false,
      },
    ];
    for (const test of tests) {
      expect(test.exp).toBeDefined();
      if (!test.exp) throw Error(`test.exp is not defined`);

      expect(test.exp.kind).toBe('return');
      if (test.exp.kind !== 'return') throw Error(`test.exp is not defined`);

      expect(test.exp.value[0].kind).toBe('boolean');
      if (test.exp.value[0].kind !== 'boolean')
        throw Error(`test.exp value[0] is not a boolean ${test.exp}`);
      expect(test.exp.value[0].value).toBe(test.value);
    }
  });

  test('<=', () => {
    const tests = [
      {
        exp: evalChunk(
          luaparser.parse('return 10 <= 10'),
          new Lua_Environment(),
        ),
        value: true,
      },
    ];
    for (const test of tests) {
      expect(test.exp).toBeDefined();
      if (!test.exp) throw Error(`test.exp is not defined`);

      expect(test.exp.kind).toBe('return');
      if (test.exp.kind !== 'return') throw Error(`test.exp is not defined`);

      expect(test.exp.value[0].kind).toBe('boolean');
      if (test.exp.value[0].kind !== 'boolean')
        throw Error(`test.exp value[0] is not a boolean ${test.exp}`);
      expect(test.exp.value[0].value).toBe(test.value);
    }
  });
  test('>=', () => {
    const tests = [
      {
        exp: evalChunk(
          luaparser.parse('return 10 >= 10'),
          new Lua_Environment(),
        ),
        value: true,
      },
    ];
    for (const test of tests) {
      expect(test.exp).toBeDefined();

      if (!test.exp) throw Error(`test.exp is not defined`);

      expect(test.exp.kind).toBe('return');
      if (test.exp.kind !== 'return') throw Error(`test.exp is not defined`);

      expect(test.exp.value[0].kind).toBe('boolean');
      if (test.exp.value[0].kind !== 'boolean')
        throw Error(`test.exp value[0] is not a boolean ${test.exp}`);
      expect(test.exp.value[0].value).toBe(test.value);
    }
  });
});

// !Important this return statement ima use it as a base for everything
describe('ReturnStatement', () => {
  test('One argument', () => {
    const tests = [
      {
        exp: evalChunk(luaparser.parse('return 10'), new Lua_Environment()),
        value: 10,
      },
      {
        exp: evalChunk(luaparser.parse('return 12'), new Lua_Environment()),
        value: 12,
      },
      {
        exp: evalChunk(luaparser.parse('return 14'), new Lua_Environment()),
        value: 14,
      },
      {
        exp: evalChunk(luaparser.parse('return 20'), new Lua_Environment()),
        value: 20,
      },
    ];

    for (const test of tests) {
      expect(test.exp).toBeDefined();
      if (!test.exp) throw Error('Return should be defined');

      expect(test.exp.kind).toBe('return');
      if (test.exp.kind !== 'return') throw Error(`test.exp is not defined`);

      expect(test.exp.value[0].kind).toBe('number');
      if (test.exp.value[0].kind !== 'number')
        throw Error('Return value should be number');
      expect(test.exp.value[0].value).toBe(test.value);
    }
  });

  test('Two argument', () => {
    const tests = [
      {
        exp: evalChunk(luaparser.parse('return 10, 20'), new Lua_Environment()),
        value: [10, 20],
      },
      {
        exp: evalChunk(luaparser.parse('return 12, 30'), new Lua_Environment()),
        value: [12, 30],
      },
      {
        exp: evalChunk(luaparser.parse('return 14, 50'), new Lua_Environment()),
        value: [14, 50],
      },
      {
        exp: evalChunk(luaparser.parse('return 20, 11'), new Lua_Environment()),
        value: [20, 11],
      },
    ];

    for (const test of tests) {
      expect(test.exp).toBeDefined();
      if (!test.exp) throw Error('Return should be defined');

      expect(test.exp.kind).toBe('return');
      if (test.exp.kind !== 'return') throw Error(`test.exp is not defined`);

      expect(test.exp.value[0].kind).toBe('number');
      if (test.exp.value[0].kind !== 'number')
        throw Error('Return value should be number');
      expect(test.exp.value[0].value).toBe(test.value[0]);

      expect(test.exp.value[1].kind).toBe('number');
      if (test.exp.value[1].kind !== 'number')
        throw Error('Return value should be number');
      expect(test.exp.value[1].value).toBe(test.value[1]);
    }
  });
});

describe('IfStatement', () => {
  test('IfCaluse', () => {
    const tests = [
      {
        exp: evalChunk(
          luaparser.parse('if true then return 5 end'),
          new Lua_Environment(),
        ),
        value: 5,
      },
      {
        exp: evalChunk(
          luaparser.parse(
            `if false then return 5 elseif true then return 10 end return 20`,
          ),
          new Lua_Environment(),
        ),
        value: 10,
      },
      {
        exp: evalChunk(
          luaparser.parse(
            `if false then return 5 elseif false then return 10 else return 2 end return 20`,
          ),
          new Lua_Environment(),
        ),
        value: 2,
      },
      {
        exp: evalChunk(
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
                 return 20`),
          new Lua_Environment(),
        ),
        value: 99,
      },
    ];

    for (const test of tests) {
      expect(test.exp).toBeDefined();
      if (!test.exp) throw Error('Return should be defined');

      expect(test.exp.kind).toBe('return');
      if (test.exp.kind !== 'return') throw Error(`test.exp is not defined`);

      expect(test.exp.value[0].kind).toBe('number');
      if (test.exp.value[0].kind !== 'number')
        throw Error('Return value should be number');
      expect(test.exp.value[0].value).toBe(test.value);
    }
  });
});

describe('Errors', () => {
  test('types', () => {
    const tests = [
      {
        exp: evalChunk(
          luaparser.parse('return 5 + true'),
          new Lua_Environment(),
        ),
        value: 5,
      },
      {
        exp: evalChunk(luaparser.parse('return -true'), new Lua_Environment()),
        value: 5,
      },
      {
        exp: evalChunk(
          luaparser.parse('return true + false'),
          new Lua_Environment(),
        ),
        value: 5,
      },
    ];

    for (const test of tests) {
      expect(test.exp).toBeDefined();
      if (!test.exp) throw Error('Return should be defined');

      expect(test.exp.kind).toBe('error');
    }
  });
});

describe('AssignmentStatement', () => {
  test('Global', () => {
    const tests = [
      {
        exp: evalChunk(
          luaparser.parse('x = 5; return x'),
          new Lua_Environment(),
        ),
        value: [5],
      },
      {
        exp: evalChunk(
          luaparser.parse('x = 10; return x'),
          new Lua_Environment(),
        ),
        value: [10],
      },
      {
        exp: evalChunk(
          luaparser.parse('x,y = 10; return x, y'),
          new Lua_Environment(),
        ),
        value: [10, null],
      },
      {
        exp: evalChunk(
          luaparser.parse('x,y = 10, 20; return x, y'),
          new Lua_Environment(),
        ),
        value: [10, 20],
      },
      {
        exp: evalChunk(
          luaparser.parse('x,y = 10, 20, 30; return x, y'),
          new Lua_Environment(),
        ),
        value: [10, 20],
      },
    ];

    for (const test of tests) {
      expect(test.exp).toBeDefined();
      if (!test.exp) throw Error('Return should be defined');
      if (test.exp.kind !== 'return')
        throw Error(`${test.exp.kind === 'error' ? test.exp.message : 'null'}`);
      expect(test.exp.kind).toBe('return');

      for (let i = 0; i < test.exp.value.length; i++) {
        const val = test.exp.value[i];
        if (val.kind === 'null') expect(test.value[i]).toBe(null);
        else if (val.kind === 'error') throw Error('should not be an error');
        else if (val.kind !== 'number') throw Error(' should be a number');
        else expect(val!.value).toBe(test.value[i]);
      }
    }
  });
});

describe('FunctionDeclaration', () => {
  test('Global', () => {
    const tests = [
      {
        exp: evalChunk(
          luaparser.parse(`
                    x = 1
                    function foo()
                        x = x + 1;
                        return x
                    end
                    return foo()
                `),
          new Lua_Environment(),
        ),
        value: [2],
      },
      {
        exp: evalChunk(
          luaparser.parse(`
                    x = 1
                    function foo(x)
                        return x;
                    end
                    return foo(5), x
                `),
          new Lua_Environment(),
        ),
        value: [5, 1],
      },
      {
        exp: evalChunk(
          luaparser.parse(`
                    x = 1
                    function foo(x, y)
                        return x + y;
                    end
                    return foo(5, 10), x
                `),
          new Lua_Environment(),
        ),
        value: [15, 1],
      },
      {
        exp: evalChunk(
          luaparser.parse(`
                    x = function (p, y)
                        return p + y;
                    end
                    return x(5, 10)
                `),
          new Lua_Environment(),
        ),
        value: [15],
      },
      {
        exp: evalChunk(
          luaparser.parse(`
                    newAdder = function(x)
                        f = function (y)
                            return x + y
                        end
                        return f
                    end
                    addTwo = newAdder(2)
                    return addTwo(3)
                `),
          new Lua_Environment(),
        ),
        value: [5],
      },
      //
      {
        exp: evalChunk(
          luaparser.parse(`
                    rec = function(x)
                        if x > 100 then
                            return true
                        else
                            return rec(x + 1)
                        end
                    end
                    return rec(1)
                `),
          new Lua_Environment(),
        ),
        value: [true],
      },
    ];

    for (const test of tests) {
      expect(test.exp).toBeDefined();
      if (!test.exp) throw Error('Return should be defined');
      if (test.exp.kind !== 'return')
        throw Error(`${test.exp.kind === 'error' ? test.exp.message : 'null'}`);
      expect(test.exp.kind).toBe('return');

      for (let i = 0; i < test.exp.value.length; i++) {
        const val = test.exp.value[i];
        if (val.kind === 'null') expect(test.value[i]).toBe(null);
        else if (val.kind === 'error') throw Error('should not be an error');
        else if (val.kind !== 'number' && val.kind !== 'boolean')
          throw Error(` should be a number ${val.kind}`);
        else expect(val.value, `test idx ${i}`).toBe(test.value[i]);
      }
    }
  });
});

describe('Builtins', () => {
  test('Function', () => {
    const tests = [
      {
        exp: evalChunk(
          luaparser.parse(`
                   x = tostring(5)
                   return x
                `),
          new Lua_Environment(),
        ),
        value: ['5'],
      },
    ];

    for (const test of tests) {
      expect(test.exp).toBeDefined();
      if (!test.exp) throw Error('Return should be defined');
      if (test.exp.kind !== 'return')
        throw Error(`${test.exp.kind === 'error' ? test.exp.message : 'null'}`);
      expect(test.exp.kind).toBe('return');

      for (let i = 0; i < test.exp.value.length; i++) {
        const val = test.exp.value[i];
        if (val.kind === 'null') expect(test.value[i]).toBe(null);
        else if (val.kind === 'error') throw Error('should not be an error');
        else if (
          val.kind !== 'number' &&
          val.kind !== 'boolean' &&
          val.kind !== 'string'
        )
          throw Error(` should be a number ${val.kind}`);
        else expect(val.value).toBe(test.value[i]);
      }
    }
  });
});

describe('Tables', () => {
  test('', () => {
    const tests = [
      {
        exp: evalChunk(
          luaparser.parse(`
                    x = { 2, 3 }
                    return x[1]
                `),
          new Lua_Environment(),
        ),
        value: [2],
      },
      {
        exp: evalChunk(
          luaparser.parse(`
                    x = { name = 1 }
                    return x['name']
                `),
          new Lua_Environment(),
        ),
        value: [1],
      },
      //
      {
        exp: evalChunk(
          luaparser.parse(`
                    name = '2'
                    x = { name = 1 }
                    return x['name']
                `),
          new Lua_Environment(),
        ),
        value: [1],
      },
      //
      {
        exp: evalChunk(
          luaparser.parse(`
                    x = { name = 1 }
                    return x['name']
                `),
          new Lua_Environment(),
        ),
        value: [1],
      },
      {
        exp: evalChunk(
          luaparser.parse(`
                    x = { name = 1 }
                    return x['na']
                `),
          new Lua_Environment(),
        ),
        value: [null],
      },
      //
      {
        exp: evalChunk(
          luaparser.parse(`
                    x = { ['2'] = 1 }
                    return x[2]
                `),
          new Lua_Environment(),
        ),
        value: [null],
      },
      //
      {
        exp: evalChunk(
          luaparser.parse(`
                    k = {}
                    x = { ['2'] = 1 }
                    x[k] = 'yes'
                    return x[k]
                `),
          new Lua_Environment(),
        ),
        value: ['yes'],
      },
      //
      {
        exp: evalChunk(
          luaparser.parse(`
                    k = {}
                    x = { ['2'] = 1 }
                    x[k] = 'yes'
                    return x[{}]
                `),
          new Lua_Environment(),
        ),
        value: [null],
      },
      //
      {
        exp: evalChunk(
          luaparser.parse(`
                    x = {3, 2}
                    y = x
                    return y[1]
                `),
          new Lua_Environment(),
        ),
        value: [3],
      },
      //
      {
        exp: evalChunk(
          luaparser.parse(`
                    local t = { [true] = "yes", [false] = "no" }
                    return t[false]
                `),
          new Lua_Environment(),
        ),
        value: ['no'],
      },
      {
        exp: evalChunk(
          luaparser.parse(`
                    local t = { sound = { 1, sound = { 31 } } }
                    return t['sound']['sound'][1]
                `),
          new Lua_Environment(),
        ),
        value: [31],
      },
      //
      {
        exp: evalChunk(
          luaparser.parse(`
                    local t = { sound = { 1, sound = { 31 } } }
                    return t.sound.sound[1]
                `),
          new Lua_Environment(),
        ),
        value: [31],
      },
      //
      {
        exp: evalChunk(
          luaparser.parse(`
                    local t = {2, sound = function(xx) return xx[1] end }
                    return t:sound()
                `),
          new Lua_Environment(),
        ),
        value: [2],
      },
      {
        exp: evalChunk(
          luaparser.parse(`
                    t = {2}
                    function t:sound()
                        return self[1]
                    end
                    return t:sound()
                `),
          new Lua_Environment(),
        ),
        value: [2],
      },
    ];

    for (const test of tests) {
      expect(test.exp).toBeDefined();
      if (!test.exp) throw Error('Return should be defined');
      if (test.exp.kind !== 'return')
        throw Error(`${test.exp.kind === 'error' ? test.exp.message : 'null'}`);
      expect(test.exp.kind).toBe('return');

      for (let i = 0; i < test.exp.value.length; i++) {
        const val = test.exp.value[i];
        if (val.kind === 'null') expect(test.value[i]).toBe(null);
        else if (val.kind === 'error') throw Error('should not be an error');
        else if (
          val.kind !== 'number' &&
          val.kind !== 'boolean' &&
          val.kind !== 'string'
        )
          throw Error(` should be a number ${val.kind}`);
        else expect(val.value).toBe(test.value[i]);
      }
    }
  });
});

describe('metatables', () => {
  test('', () => {
    const tests = [
      {
        exp: evalChunk(
          luaparser.parse(`
local fallback = { a = 10 }
local t = setmetatable({}, { __index = fallback })

return t.a
                `),
          new Lua_Environment(),
        ),
        value: [10],
      },

      {
        exp: evalChunk(
          luaparser.parse(`
local t = setmetatable({}, {
  __index = function(tbl, key)
    if key == "foo" then return 42 end
  end
})

return t.foo
                `),
          new Lua_Environment(),
        ),
        value: [42],
      },

      {
        exp: evalChunk(
          luaparser.parse(`
local fallback = { a = 10 }
local t = setmetatable({ a = 99 }, { __index = fallback })

return t.a 
                `),
          new Lua_Environment(),
        ),
        value: [99],
      },

      {
        exp: evalChunk(
          luaparser.parse(`
local t = setmetatable({}, {
  __index = function(tbl, key)
    return nil
  end
})

return t.missing
                `),
          new Lua_Environment(),
        ),
        value: [null],
      },

      {
        exp: evalChunk(
          luaparser.parse(`
local t = setmetatable({}, {
  __index = function(tbl, key)
    return nil
  end
})

return t.missing
                `),
          new Lua_Environment(),
        ),
        value: [null],
      },
    ];

    for (const test of tests) {
      expect(test.exp).toBeDefined();
      if (!test.exp) throw Error('Return should be defined');
      if (test.exp.kind !== 'return')
        throw Error(`${test.exp.kind === 'error' ? test.exp.message : 'null'}`);
      expect(test.exp.kind).toBe('return');

      for (let i = 0; i < test.exp.value.length; i++) {
        const val = test.exp.value[i];
        if (val.kind === 'null') expect(test.value[i]).toBe(null);
        else if (val.kind === 'error') throw Error('should not be an error');
        else if (
          val.kind !== 'number' &&
          val.kind !== 'boolean' &&
          val.kind !== 'string'
        )
          throw Error(` should be a number ${val.kind}`);
        else expect(val.value).toBe(test.value[i]);
      }
    }
  });
});

describe('oop', () => {
  test('', () => {
    const tests = [
      {
        exp: evalChunk(
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
                `),
          new Lua_Environment(),
        ),
        value: ['a'],
      },
    ];

    for (const test of tests) {
      expect(test.exp).toBeDefined();
      if (!test.exp) throw Error('Return should be defined');
      if (test.exp.kind !== 'return')
        throw Error(`${test.exp.kind === 'error' ? test.exp.message : 'null'}`);
      expect(test.exp.kind).toBe('return');

      for (let i = 0; i < test.exp.value.length; i++) {
        const val = test.exp.value[i];
        if (val.kind === 'null') expect(test.value[i]).toBe(null);
        else if (val.kind === 'error') throw Error('should not be an error');
        else if (
          val.kind !== 'number' &&
          val.kind !== 'boolean' &&
          val.kind !== 'string'
        )
          throw Error(` should be a number ${val.kind}`);
        else expect(val.value).toBe(test.value[i]);
      }
    }
  });
});

test('ForNumericStatement', () => {
  const tests = [
    {
      exp: evalChunk(
        luaparser.parse(`
                    x = 0
                    for i = 1, 3 do
                        x = x + 1
                    end

                    return x
                `),
        new Lua_Environment(),
      ),
      value: [3],
    },
    {
      exp: evalChunk(
        luaparser.parse(`
                    x = 0
                    for i = 1, 3 do
                      x = x + i
                    end
                    return x
                `),
        new Lua_Environment(),
      ),
      value: [6],
    },
    {
      exp: evalChunk(
        luaparser.parse(`
                    for i = 1, 5 do
                      if i == 3 then return i end
                    end
                    return 0
                `),
        new Lua_Environment(),
      ),
      value: [3],
    },

    {
      exp: evalChunk(
        luaparser.parse(`
                    function sayHi(n)
                      return "hi" .. n
                    end

                    res = ""
                    for i = 1, 2 do
                      res = res .. sayHi(i)
                    end
                    return res
                `),
        new Lua_Environment(),
      ),
      value: ['hi1hi2'],
    },

    {
      exp: evalChunk(
        luaparser.parse(`
                    function limit()
                      return 3
                    end

                    sum = 0
                    for i = 1, limit() do
                      sum = sum + i
                    end
                    return sum 
                `),
        new Lua_Environment(),
      ),
      value: [6],
    },

    {
      exp: evalChunk(
        luaparser.parse(`
                    function getStep()
                      return 2
                    end

                    sum = 0
                    for i = 1, 5, getStep() do
                      sum = sum + i
                    end
                    return sum 
                `),
        new Lua_Environment(),
      ),
      value: [9],
    },

    {
      exp: evalChunk(
        luaparser.parse(`
                x = 0
                function addToX(n)
                  x = x + n
                end

                for i = 1, 3 do
                  addToX(i)
                end
                return x 
                `),
        new Lua_Environment(),
      ),
      value: [6],
    },
  ];

  for (const test of tests) {
    expect(test.exp).toBeDefined();
    if (!test.exp) throw Error('Return should be defined');
    if (test.exp.kind !== 'return')
      throw Error(`${test.exp.kind === 'error' ? test.exp.message : 'null'}`);
    expect(test.exp.kind).toBe('return');

    for (let i = 0; i < test.exp.value.length; i++) {
      const val = test.exp.value[i];
      if (val.kind === 'null') expect(test.value[i]).toBe(null);
      else if (val.kind === 'error') throw Error('should not be an error');
      else if (
        val.kind !== 'number' &&
        val.kind !== 'boolean' &&
        val.kind !== 'string'
      )
        throw Error(` should be a number ${val.kind}`);
      else expect(val.value).toBe(test.value[i]);
    }
  }
});

function generateNumericLiteral(n: number): luaparser.Expression {
  return {
    type: 'NumericLiteral',
    value: n,
    raw: n.toString(),
  };
}

function generateBooleanLiteral(b: boolean): luaparser.Expression {
  return {
    type: 'BooleanLiteral',
    value: b,
    raw: b.toString(),
  };
}
