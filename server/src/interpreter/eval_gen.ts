import luaparser from 'luaparse';
import {
  Lua_Table,
  Lua_Null,
  Lua_True,
  Lua_False,
  builtin,
  Lua_Visualzer,
  Lua_Break,
  Lua_Console,
} from './lua_types';

import type {
  Lua_Number,
  Lua_Error,
  Lua_Object,
  Lua_Return,
  Lua_Function,
  Lua_String,
  Lua_Builtin,
  indexingVisual,
} from './lua_types';

import {
  ipairs,
  pcall,
  print,
  xpcall,
  _VERSION,
  setmetatable,
  getfenv,
  math_fn,
} from './builtin';

export function selfContainedEvalGenerator() {
  let Lua_Global_Environment: Lua_Table = new Lua_Table();
  let Lua_GLobal_Console: Lua_Console = new Lua_Console();
  let Lua_Global_Value_Registry: Map<string, Lua_Object> = new Map();
  let Lua_Current_Environment = Lua_Global_Environment;
  let Lua_Heap: Map<string, Lua_Table> = new Map();
  let Global_Partial_Visuals: Lua_Visualzer[] = [];
  let Global_Nest_Loop_Count = 0;
  let Current_Compelte_Visual: Lua_Visualzer | null = null;
  Lua_Current_Environment.set(
    Lua_Current_Environment.id,
    Lua_Current_Environment
  );

  function evalChunkTestHelper(
    node: luaparser.Chunk,
    environment: Lua_Table,
    valueRegistry: Map<string, Lua_Object>
  ) {
    Lua_Global_Value_Registry = valueRegistry;
    const g = evalChunkGenerator(node, environment, valueRegistry);
    let v: ReturnType<typeof g.next> = { done: true, value: Lua_Null };

    do {
      v = g.next();
    } while (!v.done);

    Global_Partial_Visuals = [];
    return v.value;
  }

  function setGlobalTables(environment: Lua_Table) {
    Lua_Global_Value_Registry.set(Lua_True.id, Lua_True);
    Lua_Global_Value_Registry.set(Lua_False.id, Lua_False);
    Lua_Global_Value_Registry.set(Lua_Null.id, Lua_Null);
    environment.set(
      createLuaObject({
        kind: 'string',
        value: '_VERSION',
        hidden: true,
        registry: Lua_Global_Value_Registry,
      }),
      _VERSION
    );

    environment.set(
      createLuaObject({
        kind: 'string',
        value: '_G',
        registry: Lua_Global_Value_Registry,
        hidden: true,
      }),
      environment
    );

    let math_table = new Lua_Table();
    math_table.hidden = true;
    for (let [k, v] of Object.entries(math_fn)) {
      math_table.set(k, v);
    }

    environment.set(
      createLuaObject({
        registry: Lua_Global_Value_Registry,
        kind: 'string',
        value: 'math',
        hidden: true,
      }),
      math_table
    );
  }

  let Hidden_Environment: Lua_Table | null = null;
  function* evalChunkGenerator(
    node: luaparser.Chunk,
    environment: Lua_Table,
    valueRegistry: Map<string, Lua_Object>
  ): Generator<Lua_Visualzer, Lua_Object> {
    //TODO
    const y = createYielder(node.loc);
    Lua_Global_Value_Registry = valueRegistry;
    Lua_Global_Environment = environment || new Lua_Table();
    Lua_Current_Environment = Lua_Global_Environment;
    setGlobalTables(Lua_Global_Environment);
    Lua_GLobal_Console = new Lua_Console();
    Lua_Heap = new Map();
    Lua_Heap.set(Lua_Global_Environment.id, Lua_Global_Environment);
    Hidden_Environment = new Lua_Table();
    setUp(Hidden_Environment);

    yield* y({ type: 'NEW', name: 'main' });
    let val = yield* evalStatementsArray(node.body, Lua_Global_Environment);

    yield* y({ type: 'EXIT', name: 'main' });
    return val;
  }
  const ipairs_aux = 'ipairs_aux';

  function setUp(environment: Lua_Table) {
    let chunk = luaparser.parse(`
function ${ipairs_aux}(t, i)
  i = i + 1
  local v = t[i]
  if v ~= nil then
    return i, v
  end
end
`);
    let x = evalStatementsArray(chunk.body, environment);
    let v = x.next();
    while (!v.done) {
      v = x.next();
    }
    void v;
  }

  function* evalStatementsArray(
    node: luaparser.Statement[],
    environment: Lua_Table
  ): Generator<Lua_Visualzer, Lua_Object> {
    //TODO multiple statements now lets just assume one
    //

    for (let statement of node) {
      let lua = yield* evalStatements(statement, environment);
      if (
        lua.kind === 'return' ||
        lua.kind === 'error' ||
        lua.kind === 'break'
      ) {
        return lua;
      }
    }

    return Lua_Null;
  }
  function* evalStatements(
    node: luaparser.Statement,
    environment: Lua_Table
  ): Generator<Lua_Visualzer, Lua_Object> {
    const y = createYielder(node.loc);

    switch (node.type) {
      case 'ReturnStatement': {
        let vals: Lua_Object[] = [];
        let valsId: string[] = [];
        for (let exp of node.arguments) {
          const obj = yield* evalExpression(exp, environment);
          if (obj.kind === 'error') return obj;
          // unwrapping returns
          if (obj.kind === 'return') {
            for (let v of obj.value) {
              if (v.kind === 'error') return v;
              vals.push(v);
              valsId.push(v.id);
            }
          } else {
            vals.push(obj);
            valsId.push(obj.id);
          }
        }
        yield* y({ visualStatement: { return: { vals: valsId } } });
        return {
          id: crypto.randomUUID(),
          kind: 'return',
          value: vals,
        };
      }
      case 'IfStatement': {
        for (const clause of node.clauses) {
          const [t, obj] = yield* evalClause(clause, environment);
          if (obj.kind === 'error') return obj;
          if (t) return obj;
        }
        return Lua_Null;
      }
      case 'LocalStatement': {
        const vals: Lua_Object[] = [];
        for (let v of node.init) {
          let val = yield* evalExpression(v, environment);
          if (val.kind === 'error') return val;
          // TODO idk if this is good unwrapping return

          if (val.kind === 'return') vals.push(...val.value);
          else vals.push(val);
        }

        while (true) {
          if (vals.length >= node.variables.length) break;
          vals.push(Lua_Null);
        }

        for (let i = 0; i < node.variables.length; i++) {
          let e = yield* evalAssignment(
            node.variables[i],
            vals[i],
            environment,
            false
          );
          if (e.kind === 'error') return e;
        }

        return Lua_Null;
      }

      case 'AssignmentStatement': {
        const vals: Lua_Object[] = [];

        for (let v of node.init) {
          let val = yield* evalExpression(v, environment);
          if (val.kind === 'error') return val;
          // TODO idk if this is good unwrapping return
          if (val.kind === 'return') vals.push(...val.value);
          else vals.push(val);
        }

        // console
        while (true) {
          if (vals.length >= node.variables.length) break;
          vals.push(Lua_Null);
        }

        for (let i = 0; i < node.variables.length; i++) {
          // check if variable exist
          let e = yield* evalAssignment(
            node.variables[i],
            vals[i],
            environment,
            true
          );
          if (e.kind === 'error') return e;
        }
        Current_Compelte_Visual = null;
        Current_Compelte_Visual = {
          visualStatement: { assigment: { variables: [], valsId: [] } },
        };
        for (let x of Global_Partial_Visuals) {
          console.log(Global_Partial_Visuals);
          if (x.expresion?.assigmentIdentifier) {
            Current_Compelte_Visual.visualStatement!.assigment!.variables.push(
              x.expresion.assigmentIdentifier.name
            );
            Current_Compelte_Visual.visualStatement!.assigment!.valsId.push(
              x.expresion.assigmentIdentifier.valId
            );
          }
        }
        console.log(Current_Compelte_Visual);
        yield* y(Current_Compelte_Visual);

        return Lua_Null;
      }
      case 'FunctionDeclaration': {
        const func: Lua_Function = {
          id: crypto.randomUUID(),
          kind: 'function',
          self: false,
          body: node.body,
          parameters: node.parameters,
          environment: environment,
        };
        if (node.identifier) {
          yield* evalAssignment(node.identifier, func, environment, false);
        }
        return func;
      }
      case 'CallStatement': {
        //TODO idk this probably some type of wrong
        let obj = yield* evalExpression(node.expression, environment);
        if (obj.kind === 'error') return obj;
        return Lua_Null;
      }
      case 'ForNumericStatement': {
        try {
          Global_Nest_Loop_Count++;
          let start = yield* evalExpression(node.start, environment);
          if (start.kind === 'return') start = start.value[0] || Lua_Null;
          if (start.kind === 'error') return start;
          if (start.kind !== 'number')
            return {
              id: crypto.randomUUID(),
              kind: 'error',
              message: `${start.kind} cannot be used in a numeric for loop`,
            } satisfies Lua_Error;

          yield* evalAssignment(node.variable, start, environment, false);
          let start_obj = environment.get(node.variable.name);
          if (start_obj.kind === 'null')
            return {
              id: crypto.randomUUID(),
              kind: 'error',
              message: `${node.variable.name} does not exist interperter error`,
            } satisfies Lua_Error;
          if (start_obj.kind === 'error') return start_obj;
          if (start_obj.kind !== 'number')
            return {
              id: crypto.randomUUID(),
              kind: 'error',
              message: `${start_obj.kind} shoudve been a number interpert error`,
            } satisfies Lua_Error;

          // VISUAL
          yield* y({
            visualStatement: {
              assigment: {
                variables: [node.variable.name],
                valsId: [start.id],
              },
            },
          });

          let end = yield* evalExpression(node.end, environment);
          if (end.kind === 'return') end = end.value[0] || Lua_Null;
          if (end.kind === 'error') return end;
          if (end.kind !== 'number')
            return {
              id: crypto.randomUUID(),
              kind: 'error',
              message: `${end.kind} cannot be used in a numeric for loop`,
            } satisfies Lua_Error;

          let step = node.step
            ? yield* evalExpression(node.step, environment)
            : createLuaObject({
                registry: Lua_Global_Value_Registry,
                kind: 'number',
                value: 1,
              });

          if (step.kind === 'return') step = step.value[0] || Lua_Null;
          if (step.kind === 'error') return step;
          if (step.kind !== 'number')
            return {
              id: crypto.randomUUID(),
              kind: 'error',
              message: `${end.kind} cannot be used in a numeric for loop`,
            } satisfies Lua_Error;

          let i = start.value;

          yield* y({
            expresion: {
              binaryExpression: {
                left: { id: start.id },
                operation: { op: step.value > 0 ? '<' : '>' },
                right: { id: end.id },
                val: {
                  id:
                    step.value > 0
                      ? (start as Lua_Number).value < end.value
                        ? Lua_True.id
                        : Lua_False.id
                      : (start as Lua_Number).value > end.value
                        ? Lua_True.id
                        : Lua_False.id,
                },
              },
            },
          });

          while (
            (step.value > 0 && i <= end.value) ||
            (step.value < 0 && i >= end.value)
          ) {
            const body = yield* evalStatementsArray(node.body, environment);
            if (body.kind === 'break') break;
            if (body.kind === 'error' || body.kind === 'return') return body;

            i += step.value;
            let new_i = createLuaObject({
              registry: Lua_Global_Value_Registry,
              kind: 'number',
              value: i,
            });
            environment.set(node.variable.name, new_i);
            yield* y({
              expresion: {
                binaryExpression: {
                  left: { id: start.id },
                  operation: { op: step.value > 0 ? '+' : '-' },
                  right: { id: step.id },
                  val: { id: new_i.id },
                },
              },
            });

            start = new_i;
            yield* y({
              visualStatement: {
                assigment: {
                  variables: [node.variable.name],
                  valsId: [start.id],
                },
              },
            });

            yield* y({
              expresion: {
                binaryExpression: {
                  left: { id: start.id },
                  operation: { op: step.value > 0 ? '<' : '>' },
                  right: { id: end.id },
                  val: {
                    id:
                      step.value > 0
                        ? (start as Lua_Number).value < end.value
                          ? Lua_True.id
                          : Lua_False.id
                        : (start as Lua_Number).value > end.value
                          ? Lua_True.id
                          : Lua_False.id,
                  },
                },
              },
            });
          }
          return Lua_Null;
        } finally {
          Global_Nest_Loop_Count--;
        }
      }
      //TODO
      case 'BreakStatement': {
        return Lua_Break;
      }
      case 'DoStatement': {
        // generator specific
        let prev_env = environment;
        const env = extendEnv(environment);
        Lua_Heap.set(env.id, env);
        Lua_Current_Environment = env;
        let val = yield* evalStatementsArray(node.body, env);
        Lua_Heap.delete(env.id);
        Lua_Current_Environment = prev_env;
        return val;
      }

      case 'WhileStatement': {
        let condition = yield* evalExpression(node.condition, environment);
        if (condition.kind === 'error') return condition;
        let is_true = isThruthy(condition).value;
        while (is_true) {
          let body = yield* evalStatementsArray(node.body, environment);
          if (body.kind === 'break') break;
          if (body.kind === 'error' || body.kind === 'return') return body;

          condition = yield* evalExpression(node.condition, environment);
          if (condition.kind === 'error') return condition;
          is_true = isThruthy(condition).value;
        }
        return Lua_Null;
      }
      case 'RepeatStatement': {
        let condition = yield* evalExpression(node.condition, environment);
        if (condition.kind === 'error') return condition;
        let is_true = isThruthy(condition).value;
        do {
          let body = yield* evalStatementsArray(node.body, environment);
          if (body.kind === 'break') break;
          if (body.kind === 'error' || body.kind === 'return') return body;

          condition = yield* evalExpression(node.condition, environment);
          if (condition.kind === 'error') return condition;
          is_true = isThruthy(condition).value;
        } while (!is_true);

        return Lua_Null;
      }
      // TODO TODO TODO
      case 'ForGenericStatement':
      case 'LabelStatement':
      case 'GotoStatement':

      default: {
        return {
          id: crypto.randomUUID(),
          kind: 'error',
          message: `${node.type} statement not implemented`,
        } satisfies Lua_Error;
      }
    }
  }

  function* handleTableIndexAssigment(
    exp: luaparser.MemberExpression | luaparser.IndexExpression,
    val: Lua_Object,
    environment: Lua_Table,
    identifier: Lua_Table
  ): Generator<Lua_Visualzer, Lua_Object> {
    switch (exp.type) {
      case 'IndexExpression': {
        let idx = yield* evalExpression(exp.index, environment);

        if (idx.kind === 'return') idx = idx.value[0] || Lua_Null;
        if (idx.kind === 'error') return idx;
        if (idx.kind === 'null')
          return {
            id: crypto.randomUUID(),
            kind: 'error',
            message: 'nil cannot be used as index for table',
          } satisfies Lua_Error;

        // check if metatable
        // TOOD smell repeated
        //
        if (identifier.metatable.kind !== 'null') {
          let __newindex = identifier.metatable.get(
            createLuaObject({
              registry: Lua_Global_Value_Registry,
              kind: 'string',
              value: '__newindex',
            })
          );
          if (__newindex.kind === 'function') {
            yield* applyFunction(
              __newindex,
              [identifier, idx, val],
              environment
            );
            return Lua_Null;
          } else if (__newindex.kind === 'table') {
            return yield* handleTableIndexAssigment(
              exp,
              val,
              environment,
              __newindex
            );
          } else if (__newindex.kind !== 'null') {
            return {
              id: crypto.randomUUID(),
              kind: 'error',
              message: '__newindex should be function or table',
            } satisfies Lua_Error;
          }
        }

        identifier.set(idx, val);

        return Lua_Null;
      }

      case 'MemberExpression': {
        if (exp.indexer === ':') {
          if (val.kind !== 'function')
            return {
              id: crypto.randomUUID(),
              kind: 'error',
              message: `member ':' is used on functons not${val.kind}`,
            };
          val.parameters.unshift({ name: 'self', type: 'Identifier' });
          identifier.set(
            createLuaObject({
              registry: Lua_Global_Value_Registry,
              kind: 'string',
              value: exp.identifier.name,
            }),
            val
          );
        } else {
          // check if metatable
          // TOOD smell repeated
          if (identifier.metatable.kind !== 'null') {
            let __newindex = identifier.metatable.get(
              createLuaObject({
                registry: Lua_Global_Value_Registry,
                kind: 'string',
                value: '__newindex',
              })
            );
            if (__newindex.kind === 'function') {
              applyFunction(
                __newindex,
                [
                  identifier,
                  createLuaObject({
                    registry: Lua_Global_Value_Registry,
                    kind: 'string',
                    value: exp.identifier.name,
                  }),
                  val,
                ],
                environment
              );

              return Lua_Null;
            } else if (__newindex.kind === 'table') {
              return yield* handleTableIndexAssigment(
                exp,
                val,
                environment,
                __newindex
              );
            } else if (__newindex.kind !== 'null') {
              return {
                id: crypto.randomUUID(),
                kind: 'error',
                message: '__newindex should be function or table',
              } satisfies Lua_Error;
            }
          }

          identifier.set(
            createLuaObject({
              registry: Lua_Global_Value_Registry,
              kind: 'string',
              value: exp.identifier.name,
            }),
            val
          );
        }

        return Lua_Null;
      }
    }
  }

  function* evalAssignment(
    exp:
      | luaparser.Identifier
      | luaparser.MemberExpression
      | luaparser.IndexExpression,
    val: Lua_Object,
    environment: Lua_Table,
    global: boolean
  ): Generator<Lua_Visualzer, Lua_Null | Lua_Error> {
    switch (exp.type) {
      case 'Identifier': {
        return evalIdentiferAssignment(exp, val, environment, global);
      }

      case 'MemberExpression':
      case 'IndexExpression': {
        let identifier = yield* evalExpression(exp.base, environment);
        if (identifier.kind === 'return') {
          identifier = identifier.value.at(0) || Lua_Null;
        }
        if (identifier.kind === 'error') return identifier;
        if (identifier.kind !== 'table')
          return {
            id: crypto.randomUUID(),
            kind: 'error',
            message: `${identifier.kind} cannot be indexed`,
          } satisfies Lua_Error;

        Global_Partial_Visuals.push({
          expresion: { assigmentIdentifier: { name: 'TODO', valId: val.id } },
        });
        yield* handleTableIndexAssigment(exp, val, environment, identifier);

        return Lua_Null;
      }

      default: {
        return {
          id: crypto.randomUUID(),
          kind: 'error',
          message: `AssignmentStatement of  not implemented`,
        } satisfies Lua_Error;
      }
    }
  }

  function evalIdentiferAssignment(
    id: luaparser.Identifier,
    val: Lua_Object,
    environment: Lua_Table,
    global: boolean
  ) {
    // TODO wtf ? why did i do this cant it just get the first val or some?
    switch (val.kind) {
      case 'return': {
        return {
          id: crypto.randomUUID(),
          kind: 'error',
          message: 'cant assing an return?',
        } satisfies Lua_Error;
      }
      case 'error': {
        return val;
      }
      default: {
        //console.log('all values', id, val, environment, global);
        //TODO maybe many errors ehere no need to go up the chain should just find last which usually be the global env
        if (global) {
          // if exist find it find env
          let env =
            environment.findEnvCotaining(id.name) || environment.findTopTable();
          //if (env == false) Lua_Global_Environment.set(id.name, val);
          env.set(id.name, val);
          val.name = id.name;
          //console
        } else {
          environment.set(id.name, val);
          val.name = id.name;
        }

        Global_Partial_Visuals.push({
          expresion: { assigmentIdentifier: { name: id.name, valId: val.id } },
        });
        return Lua_Null;
      }
    }
  }

  function* evalClause(
    clause: luaparser.IfClause | luaparser.ElseifClause | luaparser.ElseClause,
    environment: Lua_Table
  ): Generator<Lua_Visualzer, [boolean, Lua_Object]> {
    switch (clause.type) {
      case 'ElseClause': {
        return [true, yield* evalStatementsArray(clause.body, environment)];
      }
      default: {
        let condition = yield* evalExpression(clause.condition, environment);
        if (condition.kind === 'error') return [false, condition];
        if (isThruthy(condition).value === false) return [false, Lua_Null];
        else
          return [true, yield* evalStatementsArray(clause.body, environment)];
      }
    }
  }

  function* evalExpression(
    exp: luaparser.Expression,
    environment: Lua_Table
  ): Generator<Lua_Visualzer, Lua_Object> {
    const y = createYielder(exp.loc);

    switch (exp.type) {
      case 'NumericLiteral': {
        //yield {} satisfies Lua_Visualzer;
        return createLuaObject({
          registry: Lua_Global_Value_Registry,
          kind: 'number',
          value: exp.value,
        });
      }
      case 'BooleanLiteral': {
        return exp.value ? Lua_True : Lua_False;
      }

      case 'StringLiteral': {
        let val = '';
        if (exp.raw[0] === "'" || exp.raw[0] === '"') {
          for (let i = 1; i < exp.raw.length - 1; i++) {
            val += exp.raw[i];
          }
        } else {
          val = parseLongString(exp.raw);
        }
        return {
          id: crypto.randomUUID(),
          kind: 'string',
          value: val,
        } satisfies Lua_String;
      }
      case 'NilLiteral': {
        return Lua_Null;
      }
      case 'UnaryExpression': {
        const arg = yield* evalExpression(exp.argument, environment);
        if (arg.kind === 'error') return arg;
        let val = yield* evalUnaryExpression(exp.operator, arg);

        Current_Compelte_Visual = {
          expresion: {
            unaryExpression: {
              arg: { id: arg.id },
              val: { id: val.id },
              operation: { op: exp.operator },
            },
          },
        };

        yield* y(Current_Compelte_Visual);
        return val;
      }
      case 'BinaryExpression': {
        let left = yield* evalExpression(exp.left, environment);
        if (left.kind === 'return') left = left.value[0] || Lua_Null;
        if (left.kind === 'error') return left;

        let right = yield* evalExpression(exp.right, environment);
        if (right.kind === 'return') right = right.value[0] || Lua_Null;
        if (right.kind === 'error') return right;

        let val = yield* evalBinaryExpression(exp, left, right);

        Current_Compelte_Visual = {
          expresion: {
            binaryExpression: {
              left: { id: left.id },
              right: { id: right.id },
              val: { id: val.id },
              operation: { op: exp.operator },
            },
          },
        };
        yield* y(Current_Compelte_Visual);

        return val;
      }
      case 'Identifier': {
        let val = environment.get(exp.name);

        if (val.kind !== 'null') {
          Global_Partial_Visuals.push({
            expresion: { identifier: { name: exp.name, valId: val.id } },
          });
          return val;
        }

        val = Lua_Global_Environment!.get(exp.name);
        if (val.kind !== 'null') {
          Global_Partial_Visuals.push({
            expresion: { identifier: { name: exp.name, valId: val.id } },
          });
          return val;
        }

        let val_builtin = builtin.get(exp.name);
        if (!val_builtin) return Lua_Null;

        Global_Partial_Visuals.push({
          expresion: { identifier: { name: exp.name, valId: val_builtin.id } },
        });

        return val_builtin;
      }
      case 'CallExpression': {
        let func = yield* evalExpression(exp.base, environment);
        if (func.kind === 'error') return func;
        if (
          func.kind !== 'function' &&
          func.kind !== 'builtin' &&
          func.kind !== 'table'
        )
          return {
            id: crypto.randomUUID(),
            kind: 'error',
            message: `${func.kind} is supposed to be a function`,
          } satisfies Lua_Error;

        if (func.kind === 'table') {
          if (func.metatable.kind === 'null') {
            return {
              id: crypto.randomUUID(),
              kind: 'error',
              message: `table has no metabtable`,
            } satisfies Lua_Error;
          }
          let f = func.metatable.get(
            createLuaObject({
              registry: Lua_Global_Value_Registry,
              kind: 'string',
              value: '__call',
            })
          );

          if (f.kind !== 'function')
            return {
              id: crypto.randomUUID(),
              kind: 'error',
              message: `__call should be a function`,
            } satisfies Lua_Error;

          // TODO  stop mutating
          f.self = func;
          func = f;
        }

        const args: Lua_Object[] = [];
        if (func.kind === 'function') {
          if (func.self) args.push(func.self);
        }

        for (let a of exp.arguments) {
          const arg = yield* evalExpression(a, environment);

          if (arg.kind === 'error') return arg;
          else if (arg.kind === 'return') args.push(...arg.value);
          else args.push(arg);
        }

        if (func.kind === 'function') {
          if (func.self) func.self = false;
        }
        const v = yield* applyFunction(func, args, environment);
        return v;
      }

      case 'FunctionDeclaration': {
        const func = {
          id: crypto.randomUUID(),
          kind: 'function',
          self: false,
          body: exp.body,
          parameters: exp.parameters,
          environment: environment,
        } satisfies Lua_Function;
        if (exp.identifier) {
          evalAssignment(exp.identifier, func, environment, true);
        }
        return func;
      }

      case 'TableConstructorExpression': {
        let t = new Lua_Table();
        Lua_Heap.set(t.id, t);
        for (const field of exp.fields) {
          const [key, val] = yield* evalTableField(field, environment);
          if (key.kind === 'error') return key;
          if (val.kind === 'error') return val;
          if (key.kind === 'null') t.setValue(val);
          else t.set(key, val);
        }
        return t;
      }
      case 'IndexExpression': {
        // visualzer
        Global_Partial_Visuals.push(
          { expresion: { indexExpresssion: { status: 'start' } } },
          { expresion: { indexExpresssion: { status: 'identifier' } } }
        );
        let identifier = yield* evalExpression(exp.base, environment);

        if (identifier.kind === 'return') {
          identifier = identifier.value.at(0) || Lua_Null;
        }
        if (identifier.kind === 'error') return identifier;
        if (identifier.kind !== 'table') {
          return {
            id: crypto.randomUUID(),
            kind: 'error',
            message: `${identifier.kind} cannot be indexed`,
          } satisfies Lua_Error;
        }

        Global_Partial_Visuals.push(
          {
            expresion: {
              indexExpresssion: {
                status: 'identifier',
                identifierId: identifier.id,
              },
            },
          },
          {
            expresion: {
              indexExpresssion: { status: 'idx' },
            },
          }
        );

        let idx = yield* evalExpression(exp.index, environment);

        if (idx.kind === 'return') idx = idx.value[0] || Lua_Null;
        if (idx.kind === 'error') {
          return idx;
        }
        if (idx.kind === 'null') {
          return {
            id: crypto.randomUUID(),
            kind: 'error',
            message: 'nil cannot be used as index for table',
          } satisfies Lua_Error;
        }

        Global_Partial_Visuals.push({
          expresion: {
            indexExpresssion: { status: 'idx', idxId: idx.id },
          },
        });

        const val = identifier.get(idx);

        Global_Partial_Visuals.push(
          {
            expresion: {
              indexExpresssion: { status: 'val', valId: val.id },
            },
          },
          {
            expresion: {
              indexExpresssion: { status: 'end' },
            },
          }
        );

        Current_Compelte_Visual = {
          indexingVisual: [BuildVisualIndexing(Global_Partial_Visuals)],
        };
        Global_Partial_Visuals = [];
        yield* y(Current_Compelte_Visual);

        return val;
      }
      // TODO a lot of bugs when have to use as ansighemtn  or call expression test has error cause of this
      case 'MemberExpression': {
        let identifier = yield* evalExpression(exp.base, environment);
        if (identifier.kind === 'return') {
          identifier = identifier.value.at(0) || Lua_Null;
        }
        if (identifier.kind === 'error') return identifier;
        if (identifier.kind !== 'table')
          return {
            id: crypto.randomUUID(),
            kind: 'error',
            message: `${identifier.kind} cannot be indexed`,
          } satisfies Lua_Error;

        if (exp.indexer === '.') {
          const val = identifier.get(exp.identifier.name);
          if (val.kind !== 'null') return val;
          if (identifier.metatable.kind !== 'table') return val;

          const __index = identifier.metatable.get('__index');

          // all of this should be uncesary i think
          if (__index.kind === 'null') return Lua_Null;

          if (__index.kind === 'function') {
            return yield* applyFunction(
              __index,
              [
                identifier,
                createLuaObject({
                  registry: Lua_Global_Value_Registry,
                  kind: 'string',
                  value: exp.identifier.name,
                }),
              ],
              environment
            );
          }
          if (__index.kind !== 'table')
            return {
              id: crypto.randomUUID(),
              kind: 'error',
              message: '__index should be table',
            } satisfies Lua_Error;

          return __index.get(exp.identifier.name);
        } else {
          const val = identifier.get(exp.identifier.name);

          if (val.kind !== 'function' && val.kind !== 'null') {
            return {
              id: crypto.randomUUID(),
              kind: 'error',
              message: 'member : can olny be used on functions',
            };
          }
          if (val.kind === 'function') {
            val.self = identifier;
            return val;
          }

          if (identifier.metatable.kind !== 'table') return val;
          const __index = identifier.metatable.get('__index');

          if (__index.kind === 'null') return Lua_Null;
          if (__index.kind === 'function') {
            __index.self = identifier;
            // TODO should not have to call the function since idxer : always come from call expression
            return __index;
          }
          if (__index.kind !== 'table')
            return {
              id: crypto.randomUUID(),
              kind: 'error',
              message: '__index should be table or function',
            } satisfies Lua_Error;

          let func = __index.get(exp.identifier.name);

          if (func.kind !== 'function' && func.kind !== 'null') {
            return {
              id: crypto.randomUUID(),
              kind: 'error',
              message: 'member : can olny be used on functions',
            } satisfies Lua_Error;
          }
          if (func.kind === 'null') return Lua_Null;
          func.self = identifier;
          return func;
        }
        //return { kind: 'error', message: `indexer : not implemented` } as Lua_Error
      }

      case 'TableCallExpression': {
        let func = yield* evalExpression(exp.base, environment);
        if (func.kind === 'error') return func;
        if (func.kind !== 'function' && func.kind !== 'builtin')
          return {
            id: crypto.randomUUID(),
            kind: 'error',
            message: `${func.kind} is supposed to be a function`,
          } satisfies Lua_Error;

        const args: Lua_Object[] = [];
        if (func.kind === 'function') {
          if (func.self) args.push(func.self);
        }

        const arg = yield* evalExpression(exp.arguments, environment);
        if (arg.kind === 'error') return arg;
        args.push(arg);

        if (func.kind === 'function') {
          if (func.self) func.self = false;
        }
        return yield* applyFunction(func, args, environment);
      }
      case 'StringCallExpression': {
        let func = yield* evalExpression(exp.base, environment);
        if (func.kind === 'error') return func;
        if (func.kind !== 'function' && func.kind !== 'builtin')
          return {
            id: crypto.randomUUID(),
            kind: 'error',
            message: `${func.kind} is supposed to be a function`,
          } satisfies Lua_Error;

        const args: Lua_Object[] = [];
        if (func.kind === 'function') {
          if (func.self) args.push(func.self);
        }

        const arg = yield* evalExpression(exp.argument, environment);
        if (arg.kind === 'error') return arg;
        args.push(arg);

        if (func.kind === 'function') {
          if (func.self) func.self = false;
        }
        return yield* applyFunction(func, args, environment);
      }

      case 'LogicalExpression': {
        let left: Lua_Object = yield* evalExpression(exp.left, environment);
        if (left.kind === 'error') return left;
        if (left.kind === 'return')
          left = left.value.at(0) ? left.value[0] : Lua_Null;

        let right: Lua_Object = yield* evalExpression(exp.right, environment);
        if (right.kind === 'error') return right;
        if (right.kind === 'return')
          right = right.value.at(0) ? right.value[0] : Lua_Null;

        if (exp.operator === 'or') return isThruthy(left).value ? left : right;
        else return isThruthy(left).value ? right : left;
      }
      case 'VarargLiteral': {
        const val = environment.get('...varg');
        //if (!exist) return Lua_Null;
        return val;
      }

      default: {
        return {
          id: crypto.randomUUID(),
          kind: 'error',
          message: ` not implemented`,
        } satisfies Lua_Error;
      }
    }
  }
  function* evalTableField(
    field: luaparser.TableKey | luaparser.TableKeyString | luaparser.TableValue,
    environment: Lua_Table
  ): Generator<Lua_Visualzer, [Lua_Object, Lua_Object]> {
    switch (field.type) {
      case 'TableKey': {
        const key = yield* evalExpression(field.key, environment);
        if (key.kind === 'null')
          return [
            {
              id: crypto.randomUUID(),
              kind: 'error',
              message: 'Nil cannot be use as key',
            } satisfies Lua_Error,
            Lua_Null,
          ];
        const val = yield* evalExpression(field.value, environment);
        return [key, val];
      }
      case 'TableKeyString': {
        const val = yield* evalExpression(field.value, environment);
        return [
          createLuaObject({
            registry: Lua_Global_Value_Registry,
            kind: 'string',
            value: field.key.name,
          }),
          val,
        ];
      }
      case 'TableValue': {
        const val = yield* evalExpression(field.value, environment);
        return [Lua_Null, val];
      }
    }
  }

  function* applyFunction(
    func: Lua_Function | Lua_Builtin,
    args: Lua_Object[],
    environment?: Lua_Table
  ): Generator<Lua_Visualzer, Lua_Object> {
    switch (func.kind) {
      case 'function': {
        //TODO
        let prevEnv = environment || Lua_Global_Environment;

        const extendedEnv = extendeFunctionEnv(
          func,
          args,
          environment || Lua_Global_Environment!
        );
        Lua_Current_Environment = extendedEnv;

        Lua_Heap.set(extendedEnv.id, extendedEnv);
        yield { type: 'NEW', name: func.name || 'anonymous' };
        const evaulated = yield* evalStatementsArray(func.body, extendedEnv);
        Lua_Current_Environment = prevEnv;
        Lua_Heap.delete(extendedEnv.id);
        yield { type: 'EXIT' };

        return evaulated;
      }
      case 'builtin': {
        // TODO handle what happens whtn i do pcall
        switch (func.id) {
          case getfenv.id: {
            // TODO make test cases for this but fuck it
            if (args.length === 0) {
              return Lua_Global_Environment!;
            }
            let val = args[0]!;
            if (val.kind === 'function') {
              return val.environment;
            } else if (val.kind === 'number') {
              return Lua_Global_Environment!.climbEnv(val.value);
            } else {
              return {
                id: crypto.randomUUID(),
                kind: 'error',
                value: {
                  id: crypto.randomUUID(),
                  kind: 'string',
                  value: 'invalid frist argument to getfenv',
                } satisfies Lua_String,
              } satisfies Lua_Error;
            }
          }
          case xpcall.id: {
            if (args.length < 2) {
              return {
                id: crypto.randomUUID(),
                kind: 'error',
                message: 'TODO',
                value: {
                  id: crypto.randomUUID(),
                  kind: 'string',
                  value: `bad argument ${args.length + 1} to 'xpcall' (function expected, got no value)`,
                } satisfies Lua_String,
              } satisfies Lua_Error;
            }

            const func_passed = args.shift()!;
            const err_handler = args.shift()!;
            if (
              func_passed.kind !== 'function' ||
              err_handler.kind !== 'function'
            )
              return {
                id: crypto.randomUUID(),
                kind: 'error',
                message: 'TODO',
                value: {
                  id: crypto.randomUUID(),
                  kind: 'string',
                  value: '',
                } satisfies Lua_String,
              } satisfies Lua_Error;

            let vals: Lua_Object = yield* applyFunction(func_passed, args);
            let ok = Lua_True;
            if (vals.kind === 'error') {
              ok = Lua_False;
              vals = vals.value!;
            }
            if (vals.kind === 'return') {
              if (vals.value.length > 0 && vals.value[0].kind === 'error') {
                ok = Lua_False;
                vals = vals.value[0].value!;
              }
            }

            let returned_vals = vals.kind === 'return' ? vals.value : [vals];
            if (ok.value === false) {
              let handler_val = yield* applyFunction(
                err_handler,
                returned_vals
              );

              if (handler_val.kind === 'error') {
                returned_vals = [handler_val.value || Lua_Null];
              } else if (handler_val.kind === 'return') {
                returned_vals = handler_val.value;
              } else {
                returned_vals = [handler_val];
              }
            }

            return {
              id: crypto.randomUUID(),
              kind: 'return',
              value: [ok, ...returned_vals],
            } satisfies Lua_Return;
          }
          case pcall.id: {
            if (args.length < 1) {
              return {
                id: crypto.randomUUID(),
                kind: 'error',
                message: 'TODO',
                value: {
                  id: crypto.randomUUID(),
                  kind: 'string',
                  value: '',
                } satisfies Lua_String,
              } satisfies Lua_Error;
            }

            const func_passed = args.shift()!;
            if (func_passed.kind !== 'function')
              return {
                id: crypto.randomUUID(),
                kind: 'error',
                message: 'TODO',
                value: {
                  id: crypto.randomUUID(),
                  kind: 'string',
                  value: '',
                } satisfies Lua_String,
              } satisfies Lua_Error;
            let vals: Lua_Object = yield* applyFunction(func_passed, args);
            let ok = Lua_True;
            if (vals.kind === 'error') {
              ok = Lua_False;
              vals = vals.value!;
            }
            if (vals.kind === 'return') {
              if (vals.value.length > 0 && vals.value[0].kind === 'error') {
                ok = Lua_False;
                vals = vals.value[0].value!;
              }
            }
            let returned_vals = vals.kind === 'return' ? vals.value : [vals];

            return {
              id: crypto.randomUUID(),
              kind: 'return',
              value: [ok, ...returned_vals],
            } satisfies Lua_Return;
          }
          case ipairs.id: {
            if (args.length < 1) {
              return {
                id: crypto.randomUUID(),
                kind: 'error',
                message: 'TODO',
                value: {
                  id: crypto.randomUUID(),
                  kind: 'string',
                  value: 'ipairs needs 1 arument',
                } satisfies Lua_String,
              } satisfies Lua_Error;
            }

            let table = args.at(0)!;
            if (table.kind !== 'table') {
              return {
                id: crypto.randomUUID(),
                kind: 'error',
                message: 'TODO',
                value: {
                  id: crypto.randomUUID(),
                  kind: 'string',
                  value: 'ipairs needs 1 arument',
                } satisfies Lua_String,
              } satisfies Lua_Error;
            }

            let func = Hidden_Environment!.get(ipairs_aux);
            //if (!exist) throw Error('interperter error iparis should exist');
            if (func.kind !== 'function')
              throw Error('interperter error iparis_aux should be a function');

            let idx = createLuaObject({
              registry: Lua_Global_Value_Registry,
              kind: 'number',
              value: 0,
            });
            return {
              id: crypto.randomUUID(),
              kind: 'return',
              value: [func, table, idx],
            } satisfies Lua_Return;
          }
          case print.id: {
            if (func.fn === undefined)
              throw Error('print should not be undefined');
            let val = func.fn(...args);
            if (val.kind === 'error') return val;
            for (let s of val.value) {
              if (s.kind !== 'string') {
                Lua_GLobal_Console!.flush();
                return {
                  id: crypto.randomUUID(),
                  kind: 'error',
                  value: {
                    id: crypto.randomUUID(),
                    kind: 'string',
                    value: 'TODO',
                  } satisfies Lua_String,
                } satisfies Lua_Error;
              }
              Lua_GLobal_Console!.write(s);
            }
            return Lua_Null;
          }
          default: {
            if (func.fn === undefined) throw Error('TODO idk man');
            return func.fn(...args);
          }
        }
      }
    }
  }

  function extendEnv(environment: Lua_Table) {
    const partial_env = new Lua_Table();
    partial_env.hidden = true;

    // TODO figure out a way to delete it fater we are done with it
    partial_env.set('__index', environment);
    let partial_helper = new Lua_Table();
    partial_helper.hidden = true;
    let returned_env = setmetatable.fn!(partial_helper, partial_env);
    if (returned_env.kind === 'error') {
      throw Error('interperter error extend function setmetable');
    }
    if (returned_env.value.length === 0)
      throw Error('interperter error extend function setmetable lenth is 0');
    const env = returned_env.value[0];
    if (env.kind !== 'table')
      throw Error(
        'interper error extendfunction setmetatable did not return table'
      );

    // TODO figure out a way to delete it fater we are done with it
    return env;
  }

  function extendeFunctionEnv(
    func: Lua_Function,
    args: Lua_Object[],
    environment: Lua_Table
  ): Lua_Table {
    let env = extendEnv(func.environment || environment);
    for (let paramIdx = 0; paramIdx < func.parameters.length; paramIdx++) {
      let param = func.parameters[paramIdx];
      switch (param.type) {
        case 'Identifier': {
          if (args[paramIdx]) {
            env.set(param.name, args[paramIdx]);
          }
          break;
        }
        case 'VarargLiteral': {
          let varg: Lua_Return = {
            id: crypto.randomUUID(),
            kind: 'return',
            value: args.slice(paramIdx),
          };
          env.set('...varg', varg);
        }
      }
    }

    return env;
  }
  let MetatableOperationsLookup = {
    '+': '__add',
    '-': '__sub',
    '*': '__mul',
    '/': '__div',
    '%': '__mod',
    '^': '__pow',
    '==': '__eq',
    '~=': '__eq',
    '<': '__lt',
    '>': '__lt',
    '<=': '__le',

    '>=': '__le',
    '..': '__concat',
  } as const;

  const ArithmeticOperators = ['+', '-', '*', '/', '%', '^', '//'] as const;
  const RelationalOperators = ['==', '~=', '<', '<=', '>', '>='] as const;
  const BitwiseOperators = ['&', '|', '<<', '>>', '~'] as const;
  const ConcatenationOperation = '..' as const;

  type BinaryOperators =
    | (typeof ArithmeticOperators)[number]
    | (typeof BitwiseOperators)[number]
    | (typeof RelationalOperators)[number]
    | typeof ConcatenationOperation;

  function isArithmeticOperators(
    op: BinaryOperators
  ): op is (typeof ArithmeticOperators)[number] {
    return (ArithmeticOperators as readonly string[]).includes(op);
  }

  function isRelationalOperators(
    op: BinaryOperators
  ): op is (typeof RelationalOperators)[number] {
    return (RelationalOperators as readonly string[]).includes(op);
  }
  function isBitwiseOperator(
    op: BinaryOperators
  ): op is (typeof BitwiseOperators)[number] {
    return (BitwiseOperators as readonly string[]).includes(op);
  }

  function* evalBinaryExpression(
    exp: luaparser.BinaryExpression,
    left: Lua_Object,
    right: Lua_Object
  ): Generator<Lua_Visualzer, Lua_Object> {
    const operator = exp.operator;
    switch (true) {
      case isArithmeticOperators(operator): {
        // TODO take this out and code smells
        let metaOperator = operator in MetatableOperationsLookup;
        if (left.kind === 'table' && right.kind === 'table' && metaOperator) {
          let op =
            MetatableOperationsLookup[
              operator as keyof typeof MetatableOperationsLookup
            ];
          if (left.metatable.kind !== 'null') {
            let func = left.metatable.get(op);
            if (func.kind !== 'null' && func.kind !== 'function')
              return {
                id: crypto.randomUUID(),
                kind: 'error',
                message: 'must be a function',
              } satisfies Lua_Error;
            if (func.kind === 'function') {
              return yield* applyFunction(func, [left, right]);
            }
          } else if (right.metatable.kind !== 'null') {
            let func = right.metatable.get(op);
            if (func.kind !== 'null' && func.kind !== 'function')
              return {
                id: crypto.randomUUID(),
                kind: 'error',
                message: 'must be a function',
              } satisfies Lua_Error;
            if (func.kind === 'function') {
              return yield* applyFunction(func, [left, right]);
            }
          }
        }

        let ar = evalArimaticOperator(operator, left, right);
        return ar;
      }

      case isRelationalOperators(operator): {
        //TODO relational smell
        let metaOperator = operator in MetatableOperationsLookup;
        if (left.kind === 'table' && right.kind === 'table' && metaOperator) {
          let op =
            MetatableOperationsLookup[
              operator as keyof typeof MetatableOperationsLookup
            ];
          if (
            left.metatable.kind !== 'null' &&
            left.metatable === right.metatable
          ) {
            let func = left.metatable.get(op);
            if (func.kind !== 'null' && func.kind !== 'function')
              return {
                id: crypto.randomUUID(),
                kind: 'error',
                message: 'must be a function',
              } satisfies Lua_Error;
            if (func.kind === 'function') {
              if (operator === '>' || operator === '>=') {
                return yield* applyFunction(func, [right, left]);
              }
              if (operator === '~=') {
                let v = yield* applyFunction(func, [left, right]);
                if (v.kind === 'error') return v;
                return isThruthy(v).value ? Lua_False : Lua_True;
              }
              return yield* applyFunction(func, [left, right]);
            }
          }
        }

        return evalRelationalOperations(operator, left, right);
      }
      case operator === ConcatenationOperation: {
        if (left.kind === 'table' && right.kind === 'table') {
          if (left.metatable.kind !== 'null') {
            let func = left.metatable.get('__concat');
            if (func.kind !== 'null' && func.kind !== 'function')
              return {
                id: crypto.randomUUID(),
                kind: 'error',
                message: 'must be a function',
              } satisfies Lua_Error;
            if (func.kind === 'function') {
              return yield* applyFunction(func, [left, right]);
            }
          } else if (right.metatable.kind !== 'null') {
            let func = right.metatable.get('__concat');
            if (func.kind !== 'null' && func.kind !== 'function')
              return {
                id: crypto.randomUUID(),
                kind: 'error',
                message: 'must be a function',
              } satisfies Lua_Error;
            if (func.kind === 'function') {
              return yield* applyFunction(func, [left, right]);
            }
          }
        }

        let nleft = coerceString(left);
        if (nleft.kind === 'error') return nleft;
        let nright = coerceString(right);
        if (nright.kind === 'error') return nright;
        return createLuaObject({
          registry: Lua_Global_Value_Registry,
          kind: 'string',
          value: nleft.value + nright.value,
        });
      }
      case isBitwiseOperator(operator):

      default: {
        return {
          id: crypto.randomUUID(),
          kind: 'error',
          message: `type missmatch ${left.kind} ${operator} ${right.kind}`,
        } satisfies Lua_Error;

        //return Lua_Null
      }
    }
  }

  function coerceString(obj: Lua_Object): Lua_String | Lua_Error {
    switch (obj.kind) {
      case 'string':
      case 'number': {
        //TODO
        return createLuaObject({
          registry: Lua_Global_Value_Registry,
          kind: 'string',
          value: String(obj.value),
        }) as Lua_String;
      }
      case 'table': {
        throw Error('TODO coerce to string');
      }

      default: {
        return {
          id: crypto.randomUUID(),
          kind: 'error',
          message: 'cannot voerce to string',
        } satisfies Lua_Error;
      }
    }
  }

  function coerceToNumber(obj: Lua_Object): Lua_Number | Lua_Error {
    switch (obj.kind) {
      case 'number': {
        return obj;
      }
      case 'string': {
        let val = Number(obj.value);
        if (Number.isNaN(val))
          return {
            id: crypto.randomUUID(),
            kind: 'error',
            message: 'failed numeric coerciong on type string',
          } satisfies Lua_Error;
        //TODO
        return createLuaObject({
          registry: Lua_Global_Value_Registry,
          kind: 'number',
          value: val,
        }) as Lua_Number;
      }
      default: {
        return {
          id: crypto.randomUUID(),
          kind: 'error',
          message: `failed numeric coerciong on type ${obj.kind}`,
        } satisfies Lua_Error;
      }
    }
  }

  function evalArimaticOperator(
    operator: (typeof ArithmeticOperators)[number],
    left: Lua_Object,
    right: Lua_Object
  ) {
    // How to handle meta tables?
    let nleft = coerceToNumber(left);
    if (nleft.kind === 'error') return nleft;
    let nright = coerceToNumber(right);
    if (nright.kind === 'error') return nright;

    switch (operator) {
      // arimethic
      case '+': {
        return createLuaObject({
          registry: Lua_Global_Value_Registry,
          kind: 'number',
          value: nleft.value + nright.value,
        });
      }
      case '-': {
        return createLuaObject({
          registry: Lua_Global_Value_Registry,
          kind: 'number',
          value: nleft.value - nright.value,
        });
      }
      case '*': {
        return createLuaObject({
          registry: Lua_Global_Value_Registry,
          kind: 'number',
          value: nleft.value * nright.value,
        });
      }
      case '/': {
        return createLuaObject({
          registry: Lua_Global_Value_Registry,
          kind: 'number',
          value: nleft.value / nright.value,
        });
      }
      case '%': {
        return createLuaObject({
          registry: Lua_Global_Value_Registry,
          kind: 'number',
          value:
            nleft.value - Math.floor(nleft.value / nright.value) * nright.value,
        });
      }
      case '//': {
        return createLuaObject({
          registry: Lua_Global_Value_Registry,
          kind: 'number',
          value: Math.floor(nleft.value / nright.value),
        });
      }
      //TODO javascript and its god dammed percision freaking points
      case '^': {
        return createLuaObject({
          registry: Lua_Global_Value_Registry,
          kind: 'number',
          value: Math.pow(nleft.value, nright.value),
        });
      }
    }
  }

  // function evalBitwiseOperations(
  //  operator: (typeof BitwiseOperators)[number],
  //  left: Lua_Object,
  //  right: Lua_Object
  //) {
  //  void operator;
  //  void left;
  //  void right;
  //}
  function evalRelationalOperations(
    operator: (typeof RelationalOperators)[number],
    left: Lua_Object,
    right: Lua_Object
  ) {
    // TODO metabables operations stuff
    switch (operator) {
      case '==': {
        return evalEquality(left, right);
      }
      case '~=': {
        return evalEquality(left, right).value ? Lua_False : Lua_True;
      }
      case '<': {
        let result = evalLessThanOrEqual(left, right);
        if (result.kind === 'error') return result;
        if (result.value === 1) return Lua_True;
        else return Lua_False;
      }
      case '<=': {
        let result = evalLessThanOrEqual(left, right);
        if (result.kind === 'error') return result;
        if (result.value === -1) return Lua_False;
        else return Lua_True;
      }
      case '>': {
        let result = evalLessThanOrEqual(left, right);
        if (result.kind === 'error') return result;
        if (result.value === -1) return Lua_True;
        else return Lua_False;
      }
      case '>=': {
        let result = evalLessThanOrEqual(left, right);
        if (result.kind === 'error') return result;
        if (result.value === 1) return Lua_False;
        else return Lua_True;
      }
    }
  }

  function evalEquality(left: Lua_Object, right: Lua_Object) {
    if (left.kind !== right.kind) return Lua_False;
    switch (left.kind) {
      case 'string':
      case 'number':
      case 'boolean': {
        return left.value! === (right as typeof left).value
          ? Lua_True
          : Lua_False;
      }
      case 'null': {
        return Lua_True;
      }
      default: {
        return left.id === right.id ? Lua_True : Lua_False;
      }
    }
  }

  function evalLessThanOrEqual(left: Lua_Object, right: Lua_Object) {
    if (evalEquality(left, right).value)
      return {
        id: crypto.randomUUID(),
        kind: 'number',
        value: 0,
      } satisfies Lua_Number;
    if (left.kind !== right.kind)
      return {
        id: crypto.randomUUID(),
        kind: 'error',
        message: 'comparing differnt types',
      } satisfies Lua_Error;
    switch (left.kind) {
      case 'string':
      case 'number': {
        return {
          id: crypto.randomUUID(),
          kind: 'number',
          value: left.value < (right as typeof left).value ? 1 : -1,
        } satisfies Lua_Number;
      }
      case 'table': {
        throw Error('TODO table relation');
      }
      default: {
        return {
          id: crypto.randomUUID(),
          kind: 'error',
          message: `comparing ${left.kind} types`,
        } satisfies Lua_Error;
      }
    }
  }

  function* evalUnaryExpression(
    operator: 'not' | '-' | '~' | '#',
    arg: Lua_Object
  ): Generator<Lua_Visualzer, Lua_Object> {
    switch (operator) {
      case 'not': {
        return evalNotOperator(arg);
      }
      case '-': {
        return yield* evalUnaryMinuesOperator(arg);
      }
      case '#': {
        return yield* evalUnaryLengthOperator(arg);
      }
      case '~':
      default: {
        return {
          id: crypto.randomUUID(),
          kind: 'error',
          message: `${operator}$ not implemented`,
        } satisfies Lua_Error;
        //return Lua_Null`
      }
    }
  }
  function* evalUnaryLengthOperator(
    arg: Lua_Object
  ): Generator<Lua_Visualzer, Lua_Object> {
    switch (arg.kind) {
      case 'string':
        return createLuaObject({
          kind: 'number',
          value: arg.value.length,
          registry: Lua_Global_Value_Registry,
        });
      case 'table': {
        if (arg.metatable.kind !== 'null') {
          let fun = arg.metatable.get({
            id: crypto.randomUUID(),
            kind: 'string',
            value: '__len',
          });
          if (fun.kind === 'function') {
            return yield* applyFunction(fun, [arg]);
          }
        }
        return createLuaObject({
          kind: 'number',
          value: arg.idx,
          registry: Lua_Global_Value_Registry,
        });
      }
      default: {
        return {
          id: crypto.randomUUID(),
          kind: 'error',
          message: `type missmatch #${arg.kind}`,
        } satisfies Lua_Error;
      }
    }
  }

  function* evalUnaryMinuesOperator(
    arg: Lua_Object
  ): Generator<Lua_Visualzer, Lua_Object> {
    switch (arg.kind) {
      case 'number': {
        return createLuaObject({
          kind: 'number',
          value: -arg.value,
          registry: Lua_Global_Value_Registry,
        });
      }
      case 'table': {
        if (arg.metatable.kind !== 'null') {
          let fun = arg.metatable.get({
            id: crypto.randomUUID(),
            kind: 'string',
            value: '__unm',
          });
          if (fun.kind === 'function') {
            return yield* applyFunction(fun, [arg]);
          }
        }
        return {
          id: crypto.randomUUID(),
          kind: 'error',
          message: `type missmatch -${arg.kind}`,
        } satisfies Lua_Error;
      }
      //TODO string are coerced into integers
      default: {
        return {
          id: crypto.randomUUID(),
          kind: 'error',
          message: `type missmatch -${arg.kind}`,
        } satisfies Lua_Error;
      }
    }
  }

  function isThruthy(arg: Lua_Object) {
    switch (arg.kind) {
      case 'boolean': {
        return arg.value ? Lua_True : Lua_False;
      }
      case 'return': {
        let val = arg.value.at(0);
        if (val === undefined) return Lua_False;
        return isThruthy(val);
      }

      case 'null': {
        return Lua_False;
      }
      default: {
        return Lua_True;
        //throw Error(`Not operator has not implemented ${(arg as any).kind}`)
        //return Lua_Null;
      }
    }
  }

  function evalNotOperator(arg: Lua_Object) {
    //TODO switchit to use isThruthy waiting for now

    return isThruthy(arg).value ? Lua_False : Lua_True;
  }
  return {
    evalChunkGenerator,
    evalChunkTestHelper,
    applyFunction,
    getGlobal: () => {
      return {
        Lua_Global_Environment,
        Lua_Current_Environment,
        Lua_Heap,
        Lua_GLobal_Console,
        Lua_Global_Value_Registry,
        Global_Nest_Loop_Count,
      };
    },
  };
}

function parseLongString(input: string): string {
  // 1. Match opening: '[' + zero or more '=' + '['
  let openMatch = input.match(/^\[(=*)\[/);
  if (!openMatch) throw new Error('Invalid long string start');

  const equalsCount = openMatch[1].length;
  const closePattern = new RegExp(`\\]${'='.repeat(equalsCount)}\\]`);

  // 2. Find closing bracket index after opening
  const closeIndex = input.search(closePattern);
  if (closeIndex === -1) throw new Error('Closing bracket not found');

  // 3. Extract content between opening and closing
  const contentStart = openMatch[0].length;
  const content = input.substring(contentStart, closeIndex);

  return content;
}

export function createLuaObject({
  kind,
  value,
  hidden,
  registry,
}: {
  kind: Lua_Object['kind'];
  value: unknown;
  hidden?: true;
  registry: Map<string, Lua_Object>;
}): Lua_Object {
  let helper: {
    id: Lua_Object['id'];
    hidden: typeof hidden;
  } = { id: crypto.randomUUID(), hidden: hidden };
  let obj: Lua_Object;
  switch (kind) {
    case 'string': {
      if (typeof value !== 'string') {
        throw new Error('should be the same type');
      }
      obj = { ...helper, kind, value: value } satisfies Lua_String;
      break;
    }
    case 'number': {
      if (typeof value !== 'number') {
        throw new Error('should be the same type');
      }
      obj = { ...helper, kind, value: value } satisfies Lua_Number;
      break;
    }
    case 'boolean': {
      if (typeof value !== 'boolean') {
        throw new Error('should be the same type');
      }
      if (value == true) obj = Lua_True;
      else obj = Lua_False;

      break;
    }
    case 'return': {
      if (typeof value !== 'object') throw new Error('should be the same type');
      if (!Array.isArray(value)) throw new Error('should be the same type');

      obj = { ...helper, kind, value };
      break;
    }
    default: {
      throw new Error('not handled');
    }
  }

  // mutator
  registry.set(obj.id, obj);

  return obj;
}

function BuildVisualIndexing(
  partialVisals: Lua_Visualzer[] | null
): indexingVisual {
  //TODO throw an error
  if (partialVisals === null) return {};

  let v: indexingVisual = {};
  let status: 'start' | 'end' | 'identifier' | 'idx' | 'val' | null = null;
  for (let x of partialVisals) {
    status = x.expresion?.indexExpresssion?.status || status;
    if (status === 'identifier') {
      let identifier = x.expresion?.identifier;
      if (identifier) {
        v!.identifier = {
          name: identifier.name,
          valId: identifier.valId,
        };
      }
    }
    if (status === 'idx') {
      let idx = x.expresion?.identifier;
      if (idx) {
        v!.idexer = {
          name: idx.name,
          valId: idx.valId,
        };
      }
    }
    if (status === 'val') {
      let val = x.expresion?.indexExpresssion?.valId;
      if (val) {
        v!.val = { valId: val };
      }
    }
    if (status === 'end') break;
  }

  return v;
}

function createYielder(location: Lua_Visualzer['loc']) {
  return function* (value: Lua_Visualzer) {
    yield {
      ...value,
      location,
    };
  };
}
