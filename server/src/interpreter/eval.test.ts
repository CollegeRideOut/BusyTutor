import luaparser from 'luaparse';
import { describe, expect, test } from 'vitest';
import { evalExpression, evalChunk, Lua_GLobal_Console } from './eval';
import type { Lua_Boolean, Lua_Number } from './lua_types';
import { Lua_Table } from './lua_types';

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
    let val = evalExpression(test.exp, new Lua_Table());
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
    let val = evalExpression(test.exp, new Lua_Table());
    expect(val.kind).toBe('boolean');
    expect((val as Lua_Boolean).value).toBe(test.value);
  }
});

test('StringLiteral', () => {
  const tests = [
    {
      exp: evalChunk(luaparser.parse('return "hello"'), new Lua_Table()),
      value: 'hello',
    },
    {
      exp: evalChunk(luaparser.parse("return 'hello'"), new Lua_Table()),
      value: 'hello',
    },
    {
      exp: evalChunk(luaparser.parse('return [[hello]]'), new Lua_Table()),
      value: 'hello',
    },
    {
      exp: evalChunk(luaparser.parse('return [==[hello]==]'), new Lua_Table()),
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
      exp: evalChunk(luaparser.parse('return not true'), new Lua_Table()),
      value: false,
    },
    {
      exp: evalChunk(luaparser.parse('return not false'), new Lua_Table()),
      value: true,
    },
    {
      exp: evalChunk(luaparser.parse('return not not true'), new Lua_Table()),
      value: true,
    },
    {
      exp: evalChunk(luaparser.parse('return not not false'), new Lua_Table()),
      value: false,
    },
    {
      exp: evalChunk(luaparser.parse('return not 5'), new Lua_Table()),
      value: false,
    },
    {
      exp: evalChunk(luaparser.parse('return not not 5'), new Lua_Table()),
      value: true,
    },
    {
      exp: evalChunk(luaparser.parse('return not not 5'), new Lua_Table()),
      value: true,
    },
    {
      exp: evalChunk(luaparser.parse('return not nil'), new Lua_Table()),
      value: true,
    },
    {
      exp: evalChunk(luaparser.parse('return not not nil'), new Lua_Table()),
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
      exp: evalChunk(luaparser.parse('return #"hello"'), new Lua_Table()),
      value: 5,
    },
    {
      exp: evalChunk(luaparser.parse('x = "22" return #x'), new Lua_Table()),
      value: 2,
    },
    {
      exp: evalChunk(luaparser.parse('x = {1,2,3} return #x'), new Lua_Table()),
      value: 3,
    },
    {
      exp: evalChunk(luaparser.parse('return #{1,2,3, 4}'), new Lua_Table()),
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
        exp: evalChunk(luaparser.parse('return -2'), new Lua_Table()),
        value: -2,
      },
      {
        exp: evalChunk(luaparser.parse('return -10'), new Lua_Table()),
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
          new Lua_Table()
        ),
        value: 40,
      },
      {
        exp: evalChunk(luaparser.parse('return 10 + 10 '), new Lua_Table()),
        value: 20,
      },
      {
        exp: evalChunk(luaparser.parse('return 10 + 10 + 20'), new Lua_Table()),
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
          new Lua_Table()
        ),
        value: -20,
      },
      {
        exp: evalChunk(luaparser.parse('return 10 - 10 '), new Lua_Table()),
        value: 0,
      },
      {
        exp: evalChunk(luaparser.parse('return 10  - 20'), new Lua_Table()),
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
          new Lua_Table()
        ),
        value: 10000,
      },
      {
        exp: evalChunk(luaparser.parse('return 10 * 10 '), new Lua_Table()),
        value: 100,
      },
      {
        exp: evalChunk(luaparser.parse('return 10 * 20'), new Lua_Table()),
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
        exp: evalChunk(luaparser.parse('return 10 / 10'), new Lua_Table()),
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
        exp: evalChunk(luaparser.parse('return 10 % 10'), new Lua_Table()),
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
        exp: evalChunk(luaparser.parse('return 10 ^ 10'), new Lua_Table()),
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
        exp: evalChunk(luaparser.parse('return "hel".."lo"'), new Lua_Table()),
        value: 'hello',
      },
      {
        exp: evalChunk(
          luaparser.parse('x = "he"; return x .. "llo" '),
          new Lua_Table()
        ),
        value: 'hello',
      },
      {
        exp: evalChunk(
          luaparser.parse('x, y = "hel", "lo"; return x .. y'),
          new Lua_Table()
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
        exp: evalChunk(luaparser.parse('return 10 < 10'), new Lua_Table()),
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
        exp: evalChunk(luaparser.parse('return 10 > 10'), new Lua_Table()),
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
        exp: evalChunk(luaparser.parse('return 10 == 10'), new Lua_Table()),
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
        exp: evalChunk(luaparser.parse('return 10 ~= 10'), new Lua_Table()),
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
        exp: evalChunk(luaparser.parse('return 10 <= 10'), new Lua_Table()),
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
        exp: evalChunk(luaparser.parse('return 10 >= 10'), new Lua_Table()),
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
        exp: evalChunk(luaparser.parse('return 10'), new Lua_Table()),
        value: 10,
      },
      {
        exp: evalChunk(luaparser.parse('return 12'), new Lua_Table()),
        value: 12,
      },
      {
        exp: evalChunk(luaparser.parse('return 14'), new Lua_Table()),
        value: 14,
      },
      {
        exp: evalChunk(luaparser.parse('return 20'), new Lua_Table()),
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
        exp: evalChunk(luaparser.parse('return 10, 20'), new Lua_Table()),
        value: [10, 20],
      },
      {
        exp: evalChunk(luaparser.parse('return 12, 30'), new Lua_Table()),
        value: [12, 30],
      },
      {
        exp: evalChunk(luaparser.parse('return 14, 50'), new Lua_Table()),
        value: [14, 50],
      },
      {
        exp: evalChunk(luaparser.parse('return 20, 11'), new Lua_Table()),
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
          new Lua_Table()
        ),
        value: 5,
      },
      {
        exp: evalChunk(
          luaparser.parse(
            `if false then return 5 elseif true then return 10 end return 20`
          ),
          new Lua_Table()
        ),
        value: 10,
      },
      {
        exp: evalChunk(
          luaparser.parse(
            `if false then return 5 elseif false then return 10 else return 2 end return 20`
          ),
          new Lua_Table()
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
          new Lua_Table()
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
        exp: evalChunk(luaparser.parse('return 5 + true'), new Lua_Table()),
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
        exp: evalChunk(luaparser.parse('x = 5; return x'), new Lua_Table()),
        value: [5],
      },
      {
        exp: evalChunk(luaparser.parse('x = 10; return x'), new Lua_Table()),
        value: [10],
      },
      {
        exp: evalChunk(
          luaparser.parse('x,y = 10; return x, y'),
          new Lua_Table()
        ),
        value: [10, null],
      },
      {
        exp: evalChunk(
          luaparser.parse('x,y = 10, 20; return x, y'),
          new Lua_Table()
        ),
        value: [10, 20],
      },
      {
        exp: evalChunk(
          luaparser.parse('x,y = 10, 20, 30; return x, y'),
          new Lua_Table()
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
          new Lua_Table()
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
          new Lua_Table()
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
          new Lua_Table()
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
          new Lua_Table()
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
          new Lua_Table()
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
          new Lua_Table()
        ),
        value: [true],
      },
    ];

    for (const test of tests) {
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
          new Lua_Table()
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
          new Lua_Table()
        ),
        value: [2],
      },
      {
        exp: evalChunk(
          luaparser.parse(`
                    x = { name = 1 }
                    return x['name']
                `),
          new Lua_Table()
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
          new Lua_Table()
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
          new Lua_Table()
        ),
        value: [1],
      },
      {
        exp: evalChunk(
          luaparser.parse(`
                    x = { name = 1 }
                    return x['na']
                `),
          new Lua_Table()
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
          new Lua_Table()
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
          new Lua_Table()
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
          new Lua_Table()
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
          new Lua_Table()
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
          new Lua_Table()
        ),
        value: ['no'],
      },
      {
        exp: evalChunk(
          luaparser.parse(`
                    local t = { sound = { 1, sound = { 31 } } }
                    return t['sound']['sound'][1]
                `),
          new Lua_Table()
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
          new Lua_Table()
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
          new Lua_Table()
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
          new Lua_Table()
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
          new Lua_Table()
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
          new Lua_Table()
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
          new Lua_Table()
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
          new Lua_Table()
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
          new Lua_Table()
        ),
        value: [null],
      },
    ];

    let t = 0;
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
        ) {
          console.log(val);
          throw Error(` test error kind is ${val.kind} -  ${t}`);
        } else expect(val.value).toBe(test.value[i]);
      }
      t++;
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
          new Lua_Table()
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
          new Lua_Table()
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
          new Lua_Table()
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
          new Lua_Table()
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
          new Lua_Table()
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
          new Lua_Table()
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
          new Lua_Table()
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
          new Lua_Table()
        ),
        value: [1],
      },
    ];

    let t = 0;
    for (const test of tests) {
      expect(test.exp).toBeDefined();
      if (!test.exp) throw Error('Return should be defined');
      if (test.exp.kind !== 'return')
        throw Error(
          ` heeeeeeeey idx ${t} '${test.exp.kind === 'error' ? test.exp.kind : test.exp.kind}`
        );

      expect(test.exp.kind).toBe('return');

      let r = 0;

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
        new Lua_Table()
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
        new Lua_Table()
      ),
      value: [15],
    },
  ];

  for (const test of tests) {
    expect(test.exp).toBeDefined();
    if (!test.exp) throw Error('Return should be defined');
    if (test.exp.kind !== 'return')
      throw Error(
        `${test.exp.kind === 'error' ? test.exp.kind : test.exp.kind}`
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
        new Lua_Table()
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
        new Lua_Table()
      ),
      value: [10],
    },
  ];

  for (const test of tests) {
    expect(test.exp).toBeDefined();
    if (!test.exp) throw Error('Return should be defined');
    if (test.exp.kind !== 'return')
      throw Error(
        `${test.exp.kind === 'error' ? test.exp.kind : test.exp.kind}`
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
        new Lua_Table()
      ),
      value: [99, 'hi', 42, null, 77, null, 0, 66],
    },
  ];

  for (const test of tests) {
    expect(test.exp).toBeDefined();
    if (!test.exp) throw Error('Return should be defined');
    if (test.exp.kind !== 'return')
      throw Error(
        `${test.exp.kind === 'error' ? test.exp.kind : test.exp.kind}`
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
          ` should be a value is ${val.kind} should be value = ${test.value[i]}`
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
        new Lua_Table()
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
        new Lua_Table()
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

  let t = 0;
  for (const test of tests) {
    console.log('current t', t);
    expect(test.exp).toBeDefined();
    if (!test.exp) throw Error('Return should be defined');
    if (test.exp.kind !== 'return')
      throw Error(
        `${test.exp.kind === 'error' ? test.exp.kind : test.exp.kind}`
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
          ` should be a value is ${val.kind} should be value = ${test.value[i]}`
        );
      else expect(val.value).toBe(test.value[i]);
    }
    t++;
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
        new Lua_Table()
      ),
      value: [6, 6],
    },
  ];

  for (const test of tests) {
    expect(test.exp).toBeDefined();
    if (!test.exp) throw Error('Return should be defined');
    if (test.exp.kind !== 'return')
      throw Error(
        `${test.exp.kind === 'error' ? test.exp.message : test.exp.kind}`
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
        new Lua_Table()
      ),
      value: ['hey!', 'hey!'],
    },
  ];

  for (const test of tests) {
    expect(test.exp).toBeDefined();
    if (!test.exp) throw Error('Return should be defined');
    if (test.exp.kind !== 'return')
      throw Error(
        `${test.exp.kind === 'error' ? test.exp.kind : test.exp.kind}`
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
        new Lua_Table()
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
        new Lua_Table()
      ),
      value: [10, 213],
    },
  ];

  for (const test of tests) {
    expect(test.exp).toBeDefined();
    if (!test.exp) throw Error('Return should be defined');
    if (test.exp.kind !== 'return')
      throw Error(
        `${test.exp.kind === 'error' ? test.exp.kind : test.exp.kind}`
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

test('pcall', () => {
  const tests = [
    {
      exp: evalChunk(
        luaparser.parse(`
return pcall(function() error("bad") end)
        `),
        new Lua_Table()
      ),
      value: [false, 'bad'],
    },
  ];

  for (const test of tests) {
    if (!test.exp) throw Error('Return should be defined');
    if (test.exp.kind !== 'return')
      throw Error(
        `${test.exp.kind === 'error' ? 'what is? ' + test.exp.message : test.exp.kind}`
      );

    expect(test.exp.kind).toBe('return');

    for (let i = 0; i < test.value.length; i++) {
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

test('type', () => {
  const tests = [
    {
      exp: evalChunk(
        luaparser.parse(`
local r1 = type(nil)
local r2 = type(123)
local r3 = type("hi")
local r4 = type(function() end)
local r5 = type({})
return r1, r2, r3, r4, r5
        `),
        new Lua_Table()
      ),
      value: ['nil', 'number', 'string', 'function', 'table'],
    },
  ];

  for (const test of tests) {
    if (!test.exp) throw Error('Return should be defined');
    if (test.exp.kind !== 'return')
      throw Error(
        `${test.exp.kind === 'error' ? 'what is? ' + test.exp.message : test.exp.kind}`
      );

    expect(test.exp.kind).toBe('return');

    for (let i = 0; i < test.value.length; i++) {
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

test('_VERSION', () => {
  const tests = [
    {
      exp: evalChunk(
        luaparser.parse(`
local r1 = _VERSION

_VERSION = "custom"
local r2 = _VERSION

return r1, r2
        `),
        new Lua_Table()
      ),
      value: ['Lua 5.1', 'custom'],
    },
  ];

  for (const test of tests) {
    if (!test.exp) throw Error('Return should be defined');
    if (test.exp.kind !== 'return')
      throw Error(
        `${test.exp.kind === 'error' ? 'what is? ' + test.exp.message : test.exp.kind}`
      );

    expect(test.exp.kind).toBe('return');

    for (let i = 0; i < test.value.length; i++) {
      const val = test.exp.value[i];

      if (test.value[i] === null) expect(val.kind).toBe('null');
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

test('_G', () => {
  const tests = [
    {
      exp: evalChunk(
        luaparser.parse(`
_G.hello = "world"
return hello
        `),
        new Lua_Table()
      ),
      value: ['world'],
    },
  ];

  for (const test of tests) {
    if (!test.exp) throw Error('Return should be defined');
    if (test.exp.kind !== 'return')
      throw Error(
        `${test.exp.kind === 'error' ? 'what is? ' + test.exp.message : test.exp.kind}`
      );

    expect(test.exp.kind).toBe('return');

    for (let i = 0; i < test.value.length; i++) {
      const val = test.exp.value[i];

      if (test.value[i] === null) expect(val.kind).toBe('null');
      else if (val.kind === 'error') throw Error('should not be an error');
      else if (
        val.kind !== 'number' &&
        val.kind !== 'boolean' &&
        val.kind !== 'string'
      )
        throw Error(` the kind is unxpected =  ${val.kind}, ${i}`);
      else expect(val.value).toBe(test.value[i]);
    }
  }
});

test('getmetatable', () => {
  const tests = [
    {
      exp: evalChunk(
        luaparser.parse(`
-- Case 1: simple metatable with some values
local t1 = {}
local mt1 = { foo = "bar", num = 123 }
setmetatable(t1, mt1)
local r1 = getmetatable(t1).foo    -- "bar"
local r2 = getmetatable(t1).num    -- 123

-- Case 2: protected metatable
local t2 = {}
local mt2 = { __metatable = "locked", hidden = "secret" }
setmetatable(t2, mt2)
local r3 = getmetatable(t2)        -- "locked"

-- Case 3: no metatable
local t3 = {}
local r4 = getmetatable(t3)        -- nil

return r1, r2, r3, r4
        `),
        new Lua_Table()
      ),
      value: ['bar', 123, 'locked', null],
    },
  ];

  for (const test of tests) {
    if (!test.exp) throw Error('Return should be defined');
    if (test.exp.kind !== 'return')
      throw Error(
        `${test.exp.kind === 'error' ? 'what is? ' + test.exp.message : test.exp.kind}`
      );

    expect(test.exp.kind).toBe('return');

    for (let i = 0; i < test.value.length; i++) {
      const val = test.exp.value[i];

      if (test.value[i] === null) expect(val.kind).toBe('null');
      else if (val.kind === 'error') throw Error('should not be an error');
      else if (
        val.kind !== 'number' &&
        val.kind !== 'boolean' &&
        val.kind !== 'string'
      )
        throw Error(` the kind is unxpected =  ${val.kind}, ${i}`);
      else expect(val.value).toBe(test.value[i]);
    }
  }
});

test('getfenv', () => {
  const tests = [
    {
      exp: evalChunk(
        luaparser.parse(`
-- make a function that returns nothing special
local f = function() return end

-- create a new environment with a = 2
local env = { a = 2 }

-- set the environment of f
setfenv(f, env)

-- grab the environment back with getfenv
local got = getfenv(f)

-- return the 'a' field from that environment
return got.a
        `),
        new Lua_Table()
      ),
      value: [2],
    },
  ];

  for (const test of tests) {
    if (!test.exp) throw Error('Return should be defined');
    if (test.exp.kind !== 'return')
      throw Error(
        `${test.exp.kind === 'error' ? 'what is? ' + test.exp.value : test.exp.kind}`
      );

    expect(test.exp.kind).toBe('return');

    for (let i = 0; i < test.value.length; i++) {
      const val = test.exp.value[i];

      if (test.value[i] === null) expect(val.kind).toBe('null');
      else if (val.kind === 'error') throw Error('should not be an error');
      else if (
        val.kind !== 'number' &&
        val.kind !== 'boolean' &&
        val.kind !== 'string'
      )
        throw Error(` the kind is unxpected =  ${val.kind}, ${i}`);
      else expect(val.value).toBe(test.value[i]);
    }
  }
});

test('setfenv', () => {
  const tests = [
    {
      exp: evalChunk(
        luaparser.parse(`
-- Case 1: function in default environment
local f1 = function() return a end
a = 10
local r1 = f1()   -- sees global a (10)

-- Case 2: move function into new environment
local f2 = function() return b end
local env2 = { b = 20 }
setfenv(f2, env2)
local r2 = f2()   -- 20

-- Case 3: environment without needed var
local f3 = function() return c end
local env3 = {}   -- no "c" inside
setfenv(f3, env3)
local r3 = f3()   -- nil

-- Case 4: assignment goes into environment
local f4 = function() d = 40; return d end
local env4 = {}
setfenv(f4, env4)
local r4a = f4()       -- 40
local r4b = env4.d     -- 40

return r1, r2, r3, r4a, r4b
        `),
        new Lua_Table()
      ),
      value: [10, 20, null, 40, 40],
    },
  ];

  for (const test of tests) {
    if (!test.exp) throw Error('Return should be defined');
    if (test.exp.kind !== 'return')
      throw Error(
        `${test.exp.kind === 'error' ? 'what is? ' + test.exp.value : test.exp.kind}`
      );

    expect(test.exp.kind).toBe('return');

    for (let i = 0; i < test.value.length; i++) {
      const val = test.exp.value[i];

      if (test.value[i] === null) expect(val.kind).toBe('null');
      else if (val.kind === 'error') throw Error('should not be an error');
      else if (
        val.kind !== 'number' &&
        val.kind !== 'boolean' &&
        val.kind !== 'string'
      )
        throw Error(` the kind is unxpected =  ${val.kind}, ${i}`);
      else expect(val.value).toBe(test.value[i]);
    }
  }
});

test('xpcall', () => {
  const tests = [
    {
      exp: evalChunk(
        luaparser.parse(`
local r1a, r1b = xpcall(
  function() return 42 end,
  function(e) return "handled:" .. e end
)
local r2a, r2b = xpcall(
  function() error("boom") end,
  function(e) return "handled:" .. e end
)
local r3a, r3b = xpcall(
  function() error("kaboom") end,
  function(e) end
)
local r4a, r4b = xpcall(
  function() error("oops") end,
  function(e) error("handler failed") end
)

return r1a, r1b, 
       r2a, r2b,
       r3a, r3b,
       r4a, r4b
        `),
        new Lua_Table()
      ),
      value: [
        true,
        42,
        false,
        'handled:boom',
        false,
        null,
        false,
        'handler failed',
      ],
    },
  ];

  for (const test of tests) {
    if (!test.exp) throw Error('Return should be defined');
    if (test.exp.kind !== 'return')
      throw Error(
        `${test.exp.kind === 'error' ? 'what is? ' + test.exp.message : test.exp.kind}`
      );

    expect(test.exp.kind).toBe('return');

    for (let i = 0; i < test.value.length; i++) {
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

test('unpack', () => {
  const tests = [
    {
      exp: evalChunk(
        luaparser.parse(`
local a1, b1, c1 = unpack({1, 2, 3})
local a2, b2, c2 = unpack({1, 2, 3, sound = {1, 2}})
local a3, b3, c3 = unpack({1, nil, 3})
return a1, b1, c1,
       a2, b2, c2,
       a3, b3, c3
        `),
        new Lua_Table()
      ),
      value: [1, 2, 3, 1, 2, 3, 1, null, 3],
    },
  ];

  for (const test of tests) {
    if (!test.exp) throw Error('Return should be defined');
    if (test.exp.kind !== 'return')
      throw Error(
        `${test.exp.kind === 'error' ? 'what is? ' + test.exp.message : test.exp.kind}`
      );

    expect(test.exp.kind).toBe('return');

    for (let i = 0; i < test.value.length; i++) {
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

//TODO base bullllshit idk fuck you tomorro me
test('tonumber', () => {
  const tests = [
    {
      exp: evalChunk(
        luaparser.parse(`
local r1 = tonumber()
local r2 = tonumber(123)
local r3 = tonumber("3.14")
local r4 = tonumber("101", 2)   

return r1, r2, r3, r4
        `),
        new Lua_Table()
      ),
      value: [null, 123, 3.14],
    },
  ];

  for (const test of tests) {
    if (!test.exp) throw Error('Return should be defined');
    if (test.exp.kind !== 'return')
      throw Error(
        `${test.exp.kind === 'error' ? 'what is? ' + test.exp.message : test.exp.kind}`
      );

    expect(test.exp.kind).toBe('return');

    for (let i = 0; i < test.value.length; i++) {
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

test('select', () => {
  const tests = [
    {
      exp: evalChunk(
        luaparser.parse(`
function test_select(...)
  -- counting
  local c = select("#", ...)

  -- from 1
  local a1, b1, c1 = select(1, ...)

  -- from 2
  local a2, b2, c2 = select(2, ...)

  -- from 3
  local a3, b3, c3 = select(3, ...)

  return c,
         a1, b1, c1,
         a2, b2, c2,
         a3, b3, c3
end
return test_select("x", "y", "z")
        `),
        new Lua_Table()
      ),
      value: [3, 'x', 'y', 'z', 'y', 'z', null, 'z', null, null],
    },
  ];

  for (const test of tests) {
    if (!test.exp) throw Error('Return should be defined');
    if (test.exp.kind !== 'return')
      throw Error(
        `${test.exp.kind === 'error' ? 'what is? ' + test.exp.message : test.exp.kind}`
      );

    expect(test.exp.kind).toBe('return');

    for (let i = 0; i < test.value.length; i++) {
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

test('next', () => {
  const tests = [
    {
      exp: evalChunk(
        luaparser.parse(`

-- Table with two entries
t = { a = 10, b = 20 }
-- Start from beginning
k1, v1 = next(t, nil)

-- Get next after k1
k2, v2 = next(t, k1)

-- Try next after k2 (should end)
k3, v3 = next(t, k2)

-- Invalid key (not in table)
ok4, err4 = pcall(function() return next(t, "nope") end)

return k1, v1,
       k2, v2,
       k3, v3,
       ok4, err4

        `),
        new Lua_Table()
      ),
      value: ['a', 10, 'b', 20, null, null, false, "invalid key to 'next'"],
    },
  ];

  for (const test of tests) {
    if (!test.exp) throw Error('Return should be defined');
    if (test.exp.kind !== 'return')
      throw Error(
        `${test.exp.kind === 'error' ? 'what is? ' + test.exp.message : test.exp.kind}`
      );

    expect(test.exp.kind).toBe('return');

    for (let i = 0; i < test.value.length; i++) {
      const val = test.exp.value[i];

      if (test.value[i] === null) expect(val.kind).toBe('null');
      else if (val.kind === 'error') throw Error('should not be an error');
      else if (
        val.kind !== 'number' &&
        val.kind !== 'boolean' &&
        val.kind !== 'string'
      ) {
        throw Error(` should be a number is ${val.kind} -- ${i}`);
      } else expect(val.value).toBe(test.value[i]);
    }
  }
});

test('ipairs', () => {
  const tests = [
    {
      exp: evalChunk(
        luaparser.parse(`
-- 1. Basic table
f1, t1, i1 = ipairs({"a", "b"})
r1, r2 = f1(t1, i1)
r3, r4 = f1(t1, r1)
r5, r6 = f1(t1, r3)
-- expected:
-- r1=1, r2="a"
-- r3=2, r4="b"
-- r5=nil, r6=nil

-- 2. Empty table
f2, t2, i2 = ipairs({})
s1, s2 = f2(t2, i2)
-- expected:
-- s1=nil, s2=nil

return r1, r2, r3, r4, r5, r6,
       s1, s2
        `),
        new Lua_Table()
      ),
      value: [1, 'a', 2, 'b', null, null, null, null],
    },
  ];

  for (const test of tests) {
    if (!test.exp) throw Error('Return should be defined');
    if (test.exp.kind !== 'return')
      throw Error(
        `${test.exp.kind === 'error' ? 'what is? ' + test.exp.message : test.exp.kind}`
      );

    expect(test.exp.kind).toBe('return');

    for (let i = 0; i < test.value.length; i++) {
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

test('print', () => {
  const tests = [
    {
      exp: evalChunk(
        luaparser.parse(`
x1 = print("hello", "bye", "bye")  
        `),
        new Lua_Table()
      ),
      value: [['hello', 'bye', 'bye'].join('\t') + '\n'],
    },
  ];

  for (const test of tests) {
    for (let i = 0; i < test.value.length; i++) {
      console.log(test.exp);
      expect(Lua_GLobal_Console!.flush()).toBe(test.value[i]);
    }
  }
});

test('rawset', () => {
  const tests = [
    {
      exp: evalChunk(
        luaparser.parse(`
-- 1. Basic set
t = {}
a1 = rawset(t, "x", 100)
v1 = t.x                  -- 100

-- 2. Overwrite existing key
rawset(t, "x", 200)
v2 = t.x                  -- 200
return 100 
`),
        new Lua_Table()
      ),
      value: [
        100, // v1
      ],
    },
  ];

  for (const test of tests) {
    if (!test.exp) throw Error('Return should be defined');
    if (test.exp.kind !== 'return')
      throw Error(
        `${test.exp.kind === 'error' ? 'what is? ' + test.exp.message : test.exp.kind}`
      );

    expect(test.exp.kind).toBe('return');

    for (let i = 0; i < test.value.length; i++) {
      const val = test.exp.value[i];

      if (val.kind === 'null') expect(test.value[i]).toBe(null);
      else if (val.kind === 'error') throw Error('should not be an error');
      else if (
        val.kind !== 'number' &&
        val.kind !== 'boolean' &&
        val.kind !== 'string'
      )
        throw Error(` should be a number ${val.kind} --- ${i}`);
      else expect(val.value).toBe(test.value[i]);
    }
  }
});

test('rawget', () => {
  const tests = [
    {
      exp: evalChunk(
        luaparser.parse(`
-- 1. Existing key
t = { a = 123 }
a1 = rawget(t, "a")             -- 123

-- 2. Missing key
a2 = rawget(t, "b")             -- nil

-- 3. Ignoring __index metamethod
mt = { __index = function() return "meta!" end }
u = setmetatable({ x = 5 }, mt)
a3 = rawget(u, "y")             -- nil (ignores metamethod)

-- 4. No arguments
ok4, err4 = pcall(function() return rawget() end)
-- expected: ok4 = false
-- expected: err4 = "bad argument #1 to 'rawget' (table expected, got no value)"

-- 5. One argument only
ok5, err5 = pcall(function() return rawget(t) end)
-- expected: ok5 = false
-- expected: err5 = "bad argument #2 to 'rawget' (value expected)"

return a1, a2, a3, ok4, err4, ok5, err5
        `),
        new Lua_Table()
      ),
      value: [
        123, // a1
        null, // a2
        null, // a3
        false, // ok4
        "bad argument #1 to 'rawget' (value expected)", // err4
        false, // ok5
        "bad argument #2 to 'rawget' (value expected)", // err4
      ],
    },
  ];

  for (const test of tests) {
    if (!test.exp) throw Error('Return should be defined');
    if (test.exp.kind !== 'return')
      throw Error(
        `${test.exp.kind === 'error' ? 'what is? ' + test.exp.message : test.exp.kind}`
      );

    expect(test.exp.kind).toBe('return');

    for (let i = 0; i < test.value.length; i++) {
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

test('raweqal', () => {
  const tests = [
    {
      exp: evalChunk(
        luaparser.parse(`

-- 1. Same number
a1 = rawequal(42, 42)        -- true

-- 2. Different types
a2 = rawequal(1, "1")        -- false

-- 3. Same table reference
t = {}
a3 = rawequal(t, t)          -- true

-- 4. No arguments
ok4, err4 = pcall(function() return rawequal() end)
-- expected: ok4 = false
-- expected: err4 = "bad argument #1 to 'rawequal' (value expected)"

-- 5. One argument only
ok5, err5 = pcall(function() return rawequal(123) end)
-- expected: ok5 = false
-- expected: err5 = "bad argument #2 to 'rawequal' (value expected)"
return a1, a2, a3, ok4, err4, ok5, err5
        `),
        new Lua_Table()
      ),
      value: [
        true,
        false,
        true,
        false,
        `bad argument #1 to 'rawequal' (value expected)`,
        false,
        `bad argument #2 to 'rawequal' (value expected)`,
      ],
    },
  ];

  for (const test of tests) {
    if (!test.exp) throw Error('Return should be defined');
    if (test.exp.kind !== 'return')
      throw Error(
        `${test.exp.kind === 'error' ? 'what is? ' + test.exp.message : test.exp.kind}`
      );

    expect(test.exp.kind).toBe('return');

    for (let i = 0; i < test.value.length; i++) {
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

test('pairs', () => {
  const tests = [
    {
      exp: evalChunk(
        luaparser.parse(`
-- 1. Basic table
f1, t1, k1 = pairs({a=10, b=20})
r1k, r1v = f1(t1, k1)      -- first entry
r2k, r2v = f1(t1, r1k)     -- next entry
r3k, r3v = f1(t1, r2k)     -- should end (nil,nil)

-- 2. Empty table
f2, t2, k2 = pairs({})
s1k, s1v = f2(t2, k2)      -- should be nil,nil

-- 3. Extra arguments (ignored)
f3, t3, k3 = pairs({1,2}, "extra", 123)
x1k, x1v = f3(t3, k3)      -- first entry (1,1)

-- 4. Wrong type
ok4, err4 = pcall(function() return pairs("not a table") end)

-- 5. No arguments
ok5, err5 = pcall(function() return pairs() end)

return r1k, r1v,
       r2k, r2v,
       r3k, r3v,
       s1k, s1v,
       x1k, x1v,
       ok4, err4,
       ok5, err5
        `),
        new Lua_Table()
      ),
      value: [
        // r1k, r1v  (first entry from pairs/next)
        'a',
        10, // OR "b", 20

        // r2k, r2v  (second entry)
        'b',
        20, // OR "a", 10

        // r3k, r3v  (end of table)
        null,
        null,

        // s1k, s1v  (empty table)
        null,
        null,

        // x1k, x1v  (extra args ignored, first entry in {1,2})
        1,
        1, // then next would be 2,2

        // ok4, err4  (wrong type)
        false,
        "bad argument #1 to 'pairs' (table expected, got string)",

        // ok5, err5  (no args)
        false,
        "bad argument #1 to 'pairs' (table expected, got no value)",
      ],
    },
  ];

  for (const test of tests) {
    if (!test.exp) throw Error('Return should be defined');
    if (test.exp.kind !== 'return')
      throw Error(
        `${test.exp.kind === 'error' ? 'what is? ' + test.exp.message : test.exp.kind}`
      );

    expect(test.exp.kind).toBe('return');

    for (let i = 0; i < test.value.length; i++) {
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

test('assert', () => {
  const tests = [
    {
      exp: evalChunk(
        luaparser.parse(`
a1, a2 = pcall(function() return assert(123) end)
-- expected: a1 = true,  a2 = 123

-- 2. Falsy, no message
b1, b2 = pcall(function() return assert(false) end)
-- expected: b1 = false, b2 = "assertion failed!"

-- 3. Truthy, with message
c1, c2, c3 = pcall(function() return assert(1, "ok") end)
-- expected: c1 = true,  c2 = 1, c3 = "ok"

-- 4. Falsy, with message
d1, d2 = pcall(function() return assert(nil, "bad") end)
-- expected: d1 = false, d2 = "bad"

-- 5. Truthy, multiple args
e1, e2, e3, e4, e5 = pcall(function() return assert(1, "x", 2, 3) end)
-- expected: e1 = true, e2 = 1, e3 = "x", e4 = 2, e5 = 3

-- 6. No args at all
f1, f2 = pcall(function() return assert() end)
-- expected: f1 = false, f2 = "bad argument #1 to 'assert' (value expected)"

return a1, a2, b1, b2, c1, c2, c3, d1, d2, e1, e2, e3, e4, e5, f1, f2


        `),
        new Lua_Table()
      ),
      value: [
        true,
        123,
        false,
        'assertion failed!',
        true,
        1,
        'ok',
        false,
        'bad',
        true,
        1,
        'x',
        2,
        3,
        false,
        "bad argument #1 to 'assert' (value expected)",
      ],
    },
  ];

  for (const test of tests) {
    if (!test.exp) throw Error('Return should be defined');
    if (test.exp.kind !== 'return')
      throw Error(
        `${test.exp.kind === 'error' ? 'what is? ' + test.exp.message : test.exp.kind}`
      );

    expect(test.exp.kind).toBe('return');

    for (let i = 0; i < test.value.length; i++) {
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
        new Lua_Table()
      ),
      value: [4],
    },
  ];

  for (const test of tests) {
    expect(test.exp).toBeDefined();
    if (!test.exp) throw Error('Return should be defined');
    if (test.exp.kind !== 'return')
      throw Error(
        `${test.exp.kind === 'error' ? test.exp.kind : test.exp.kind}`
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
