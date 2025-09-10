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

  let t = 0;
  for (const test of tests) {
    expect(test.exp).toBeDefined();
    if (!test.exp) throw Error(`test.exp is not defined`);

    expect(test.exp.kind).toBe('return');
    if (test.exp.kind !== 'return') throw Error(`test.exp is not defined`);

    expect(test.exp.value[0].kind).toBe('boolean');
    if (test.exp.value[0].kind !== 'boolean')
      throw Error(`test.exp value[0] is not a boolean ${test.exp}`);
    expect(test.exp.value[0].value, `idx ${t}`).toBe(test.value);
    t++;
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
        value: Math.pow(10, 10),
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
    ];

    let t = 0;
    for (const test of tests) {
      expect(test.exp).toBeDefined();
      if (!test.exp) throw Error('Return should be defined');

      expect(test.exp.kind, `${t}`).toBe('error');
      t++;
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
  test.only('', () => {
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
        if (test.value[i] === null) expect(val.kind).toBe(null);
        else if (val.kind === 'error') throw Error('should not be an error');
        else if (
          val.kind !== 'number' &&
          val.kind !== 'boolean' &&
          val.kind !== 'string'
        )
          throw Error(` should be a string ${val.kind}`);
        else expect(val.value).toBe(test.value[i]);
      }
    }
  });
});

(describe('Metable Operatons', () => {
  test('__newindex', () => {
    const tests = [
      {
        exp: evalChunk(
          luaparser.parse(`
local sink = {}
local t = setmetatable({}, { __newindex = sink })

t.foo = 7        -- redirected to sink
return sink.foo, t.foo   -- expect: 7, nil
                `),
          new Lua_Environment(),
        ),
        value: [7, null],
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

  test('__call', () => {
    const tests = [
      {
        exp: evalChunk(
          luaparser.parse(`
local mt = {
  __call = function(self, x)
    return self.val + x
  end
}

local t = setmetatable({ val = 5 }, mt)

return t(3)   -- expect 8
                `),
          new Lua_Environment(),
        ),
        value: [8],
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

  test('__concat', () => {
    const tests = [
      {
        exp: evalChunk(
          luaparser.parse(`
local mt = {
  __concat = function(a, b)
    return a.val .. "-" .. b.val
  end
}

local t1 = setmetatable({ val = "foo" }, mt)
local t2 = setmetatable({ val = "bar" }, mt)

return t1 .. t2   -- expect "foo-bar"
                `),
          new Lua_Environment(),
        ),
        value: ['foo-bar'],
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

  test('all arimethic', () => {
    const tests = [
      {
        exp: evalChunk(
          luaparser.parse(`
-- arithmetic metamethods test

local mt_add = {
  __add = function(a, b) return a.x + b.x end
}
local mt_sub = {
  __sub = function(a, b) return a.x - b.x end
}
local mt_mul = {
  __mul = function(a, b) return a.x * b.x end
}
local mt_div = {
  __div = function(a, b) return a.x / b.x end
}
local mt_mod = {
  __mod = function(a, b) return a.x % b.x end
}
local mt_pow = {
  __pow = function(a, b) return a.x ^ b.x end
}
local mt_unm = {
  __unm = function(a) return -(a.x) end
}

local a = setmetatable({ x = 10 }, mt_add)
local b = setmetatable({ x = 3 }, mt_add)
local c = setmetatable({ x = 10 }, mt_sub)
local d = setmetatable({ x = 3 }, mt_sub)
local e = setmetatable({ x = 10 }, mt_mul)
local f = setmetatable({ x = 3 }, mt_mul)
local g = setmetatable({ x = 10 }, mt_div)
local h = setmetatable({ x = 2 }, mt_div)
local i = setmetatable({ x = 10 }, mt_mod)
local j = setmetatable({ x = 6 }, mt_mod)
local k = setmetatable({ x = 2 }, mt_pow)
local l = setmetatable({ x = 3 }, mt_pow)
local m = setmetatable({ x = 7 }, mt_unm)

return
  a + b,    -- expect 13
  c - d,    -- expect 7
  e * f,    -- expect 30
  g / h,    -- expect 5
  i % j,    -- expect 4
  k ^ l,    -- expect 8
  -m        -- expect -7
                `),
          new Lua_Environment(),
        ),
        value: [13, 7, 30, 5, 4, 8, -7],
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

  test('all relation', () => {
    const tests = [
      {
        exp: evalChunk(
          luaparser.parse(`
local mt = {
  __eq = function(a, b) return a.id == b.id end,
  __lt = function(a, b) return a.id < b.id end,
  __le = function(a, b) return a.id <= b.id end,
}

local t1 = setmetatable({ id = 1 }, mt)
local t2 = setmetatable({ id = 1 }, mt)
local t3 = setmetatable({ id = 2 }, mt)

return
 t1 == t2,   -- expect true  (ids equal)
  t1 == t3,   -- expect false (ids differ)
  t1 ~= t3,   -- expect true  (negation of __eq)
  t1 < t3,    -- expect true  (1 < 2)
  t3 > t1    -- expect true  (rewritten as t1 < t3)
                `),
          new Lua_Environment(),
        ),
        value: [true, false, true, true, true],
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
}),
  test('break staement', () => {
    const tests = [
      {
        exp: evalChunk(
          luaparser.parse(`
local sum = 0
for i = 1, 5 do
  if i == 3 then
    break
  end
  sum = sum + i
end
return sum
                `),
          new Lua_Environment(),
        ),
        value: [3],
      },

      {
        exp: evalChunk(
          luaparser.parse(`
local sum = 0
for i = 1, 5 do
    sum = sum + i
    break
end
return sum
                `),
          new Lua_Environment(),
        ),
        value: [1],
      },
    ];

    let t = 0;
    for (const test of tests) {
      console.error('test number', t);
      expect(test.exp).toBeDefined();
      if (!test.exp) throw Error('Return should be defined');
      if (test.exp.kind !== 'return')
        throw Error(
          ` heeeeeeeey idx ${t} '${test.exp.kind === 'error' ? test.exp.kind : test.exp.kind}`,
        );

      expect(test.exp.kind).toBe('return');

      let r = 0;

      for (let i = 0; i < test.exp.value.length; i++) {
        console.log('res number', r);
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
        r++;
      }

      t++;
    }
  }));

test('DoStatement', () => {
  const tests = [
    {
      exp: evalChunk(
        luaparser.parse(`
local x = 1
do
  local x = 99   -- shadow outer x
end
return x
                `),
        new Lua_Environment(),
      ),
      value: [1],
    },

    {
      exp: evalChunk(
        luaparser.parse(`
local x = 5
do
  x = x + 10     -- affects outer x
end
return x
                `),
        new Lua_Environment(),
      ),
      value: [15],
    },
  ];

  for (const test of tests) {
    expect(test.exp).toBeDefined();
    if (!test.exp) throw Error('Return should be defined');
    if (test.exp.kind !== 'return')
      throw Error(
        `${test.exp.kind === 'error' ? test.exp.kind : test.exp.kind}`,
      );

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

test('WhileStement', () => {
  const tests = [
    {
      exp: evalChunk(
        luaparser.parse(`
local x = 0
while x < 5 do
  x = x + 1
end
return x
                `),
        new Lua_Environment(),
      ),
      value: [5],
    },

    {
      exp: evalChunk(
        luaparser.parse(`
local x = 10
while x < 5 do
  x = x + 1
end
return x
                `),
        new Lua_Environment(),
      ),
      value: [10],
    },
  ];

  for (const test of tests) {
    expect(test.exp).toBeDefined();
    if (!test.exp) throw Error('Return should be defined');
    if (test.exp.kind !== 'return')
      throw Error(
        `${test.exp.kind === 'error' ? test.exp.kind : test.exp.kind}`,
      );

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

test('LogicalExpressions', () => {
  const tests = [
    {
      exp: evalChunk(
        luaparser.parse(`
-- multi-return: only first value counts
function f() return nil, 111, 222 end
function g() return "hi", 123 end
function h() end  -- returns nothing

local a = f() or 99      -- nil → falsey → picks 99
local b = g() or 99      -- "hi" → truthy → picks "hi"
local c = g() and 42     -- "hi" → truthy → picks right side 42
local d = f() and 42     -- nil → falsey → returns nil
local e = h() or 77      -- no return → treated as nil → picks 77
local f_ = h() and 88    -- no return → treated as nil → returns nil
local g_ = 0 or 55       -- 0 is truthy → returns 0
local h_ = false or 66   -- false → falsey → picks 66

return a, b, c, d, e, f_, g_, h_
                `),
        new Lua_Environment(),
      ),
      value: [99, 'hi', 42, null, 77, null, 0, 66],
    },
  ];

  for (const test of tests) {
    expect(test.exp).toBeDefined();
    if (!test.exp) throw Error('Return should be defined');
    if (test.exp.kind !== 'return')
      throw Error(
        `${test.exp.kind === 'error' ? test.exp.kind : test.exp.kind}`,
      );

    expect(test.exp.kind).toBe('return');

    for (let i = 0; i < test.exp.value.length; i++) {
      const val = test.exp.value[i];
      if (test.value[i] === null) expect(val.kind).toBe('null');
      else if (val.kind === 'error') throw Error('should not be an error');
      else if (
        val.kind !== 'number' &&
        val.kind !== 'boolean' &&
        val.kind !== 'string'
      )
        throw Error(
          ` should be a value is ${val.kind} should be value = ${test.value[i]}`,
        );
      else expect(val.value).toBe(test.value[i]);
    }
  }
});

test('VargLitereal', () => {
  const tests = [
    {
      exp: evalChunk(
        luaparser.parse(`
function test(...)
  -- single-value context (only first value)
  local a = ...
  
  -- multi-assignment (expands to multiple values)
  local b, c, d = ...
  
  -- return in list context (expands fully)
  return a, b, c, d, ...
end

-- call with three args
local r1, r2, r3, r4, r5, r6, r7 = test(10, 20, 30)

-- call with one arg
local s1, s2, s3 = test(42)

-- call with no args
local t1, t2 = test()

return r1, r2, r3, r4, r5, r6, r7, s1, s2, s3, t1, t2
                `),
        new Lua_Environment(),
      ),
      value: [10, 10, 20, 30, 10, 20, 30, 42, 42, null, null, null],
    },
    {
      exp: evalChunk(
        luaparser.parse(`
function test(a, b, ...)
  -- single-value context: only first vararg
  local first = ...

  -- multi-assign: expands across variables
  local x, y, z = ...

  -- simple checksum using named + first few varargs
  local sum = (a or 0) + (b or 0) + (x or 0) + (y or 0) + (z or 0)

  -- return named, inspected pieces, checksum, then full vararg expansion
  return a, b, first, x, y, z, sum, ...
end

-- Call with more than named params (two varargs)
local A1, B1, C1, D1, E1, F1, S1, V1, V2 = test(1, 2, 3, 4)
-- Call with fewer (no varargs)
local A2, B2, C2, D2, E2, F2, S2, V3, V4 = test(5)
-- Call with exactly one vararg
local A3, B3, C3, D3, E3, F3, S3, V5, V6 = test(7, 8, 9)

return
  A1, B1, C1, D1, E1, F1, S1, V1, V2,
  A2, B2, C2, D2, E2, F2, S2, V3, V4,
  A3, B3, C3, D3, E3, F3, S3, V5, V6
                `),
        new Lua_Environment(),
      ),
      value: [
        1,
        2,
        3,
        3,
        4,
        null,
        10,
        3,
        4,
        5,
        null,
        null,
        null,
        null,
        null,
        5,
        null,
        null,
        7,
        8,
        9,
        9,
        null,
        null,
        24,
        9,
        null,
      ],
    },
  ];

  for (const test of tests) {
    expect(test.exp).toBeDefined();
    if (!test.exp) throw Error('Return should be defined');
    if (test.exp.kind !== 'return')
      throw Error(
        `${test.exp.kind === 'error' ? test.exp.kind : test.exp.kind}`,
      );

    expect(test.exp.kind).toBe('return');

    for (let i = 0; i < test.exp.value.length; i++) {
      const val = test.exp.value[i];
      if (test.value[i] === null) expect(val.kind).toBe('null');
      else if (val.kind === 'error') throw Error('should not be an error');
      else if (
        val.kind !== 'number' &&
        val.kind !== 'boolean' &&
        val.kind !== 'string'
      )
        throw Error(
          ` should be a value is ${val.kind} should be value = ${test.value[i]}`,
        );
      else expect(val.value).toBe(test.value[i]);
    }
  }
});

test('tableCallExpression', () => {
  const tests = [
    {
      exp: evalChunk(
        luaparser.parse(`
-- function that sums elements of a table
function sum(tbl)
  local s = 0
  for i = 1, #tbl do
    s = s + tbl[i]
  end
  return s
end

-- sugar call
local a = sum {1, 2, 3}

-- normal call
local b = sum({1, 2, 3})

return a, b
                `),
        new Lua_Environment(),
      ),
      value: [6, 6],
    },
  ];

  for (const test of tests) {
    expect(test.exp).toBeDefined();
    if (!test.exp) throw Error('Return should be defined');
    if (test.exp.kind !== 'return')
      throw Error(
        `${test.exp.kind === 'error' ? test.exp.message : test.exp.kind}`,
      );

    expect(test.exp.kind).toBe('return');

    for (let i = 0; i < test.exp.value.length; i++) {
      const val = test.exp.value[i];
      if (val.kind === 'error') throw Error('should not be an error');
      else if (
        val.kind !== 'number' &&
        val.kind !== 'boolean' &&
        val.kind !== 'string'
      )
        throw Error(` should be a number  is ${val.kind}`);
      else expect(val.value).toBe(test.value[i]);
    }
  }
});

test('StringCallExpression', () => {
  const tests = [
    {
      exp: evalChunk(
        luaparser.parse(`
function shout(s)
  return s .. "!"
end

-- sugar call
local a = shout "hey"

-- normal call
local b = shout("hey")

return a, b
                `),
        new Lua_Environment(),
      ),
      value: ['hey!', 'hey!'],
    },
  ];

  for (const test of tests) {
    expect(test.exp).toBeDefined();
    if (!test.exp) throw Error('Return should be defined');
    if (test.exp.kind !== 'return')
      throw Error(
        `${test.exp.kind === 'error' ? test.exp.kind : test.exp.kind}`,
      );

    expect(test.exp.kind).toBe('return');

    for (let i = 0; i < test.exp.value.length; i++) {
      const val = test.exp.value[i];
      if (val.kind === 'error') throw Error('should not be an error');
      else if (
        val.kind !== 'number' &&
        val.kind !== 'boolean' &&
        val.kind !== 'string'
      )
        throw Error(` should be a number  is ${val.kind}`);
      else expect(val.value).toBe(test.value[i]);
    }
  }
});

test('Environemnt testing', () => {
  const tests = [
    {
      exp: evalChunk(
        luaparser.parse(`
a = 0        
local mid_final
local inner_final

-- nested blocks (lexical scopes)
do
  local a = 10         -- middle scope
  do
    local a = 20       -- inner scope
    a = a + 1          -- should update INNER a -> 21
    inner_final = a    -- writes to top-level local (found by lookup)
  end
  a = a + 1            -- should update MIDDLE a -> 11
  mid_final = a
end

a = a + 1              -- no local in scope -> updates GLOBAL a -> 1

-- upvalue test: function closes over its defining 'b'
local b = 100
local function inc()
  b = b + 5            -- always updates the upvalue 'b' from its definition scope
end

inc()                  -- b = 105
do
  local b = 999        -- shadows name, but inc() still touches the upvalue b=105
  inc()                -- b = 110 (outer), NOT 1004
end
inc()                  -- b = 115

return a, mid_final, inner_final, b

                `),
        new Lua_Environment(),
      ),
      value: [1, 11, 21, 115],
    },

    {
      exp: evalChunk(
        luaparser.parse(`
a = 0                -- global
local outer = 1

for i = 1, 2 do
  local loopVar = i
  loopVar = loopVar + 10   -- updates local loopVar in this iteration

  if i == 2 then
    outer = outer + loopVar   -- updates outer local, not global
  end

  do
    local shadow = 99
    shadow = shadow + loopVar  -- stays in inner block
  end
end

local function bump()
  a = a + 5      -- updates GLOBAL a
  outer = outer + 100  -- updates OUTER local (captured upvalue)
end

bump()
bump()

return a, outer

                `),
        new Lua_Environment(),
      ),
      value: [10, 213],
    },
  ];

  for (const test of tests) {
    expect(test.exp).toBeDefined();
    if (!test.exp) throw Error('Return should be defined');
    if (test.exp.kind !== 'return')
      throw Error(
        `${test.exp.kind === 'error' ? test.exp.kind : test.exp.kind}`,
      );

    expect(test.exp.kind).toBe('return');

    for (let i = 0; i < test.exp.value.length; i++) {
      const val = test.exp.value[i];
      if (val.kind === 'error') throw Error('should not be an error');
      else if (
        val.kind !== 'number' &&
        val.kind !== 'boolean' &&
        val.kind !== 'string'
      )
        throw Error(` should be a number  is ${val.kind}`);
      else expect(val.value).toBe(test.value[i]);
    }
  }
});

test('RepeatStament', () => {
  const tests = [
    {
      exp: evalChunk(
        luaparser.parse(`
local x = 0
repeat
  x = x + 1
until x > 3
return x
                `),
        new Lua_Environment(),
      ),
      value: [4],
    },
  ];

  for (const test of tests) {
    expect(test.exp).toBeDefined();
    if (!test.exp) throw Error('Return should be defined');
    if (test.exp.kind !== 'return')
      throw Error(
        `${test.exp.kind === 'error' ? test.exp.kind : test.exp.kind}`,
      );

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
