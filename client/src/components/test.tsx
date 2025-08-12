import { useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ThemeContext } from '../routes/__root';
import luaparser from 'luaparse';

import { RiResetLeftFill } from 'react-icons/ri';
import { VscDebugStepOver } from 'react-icons/vsc';
//import { evalChunk } from '../../utils/interperter_generator/eval_generator'
import { Lua_Environment, Lua_Table } from '../utils/interperter/lua_types';
//import type { Lua_Object } from '../../utils/interperter/lua_types'
import { Button } from '../components/ui/button';
import {
  ResizablePanel,
  ResizableHandle,
  ResizablePanelGroup,
} from '../components/ui/resizable';
import type { Lua_Object_Visualizer } from '../utils/interperter_generator/generator_types';
import {
  evalChunk,
  Lua_Global_Environment,
  setGLobalEnvironmentGenerator,
} from '../utils/interperter_generator/eval_generator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../components/ui/tooltip';
import { parseLongString } from '../utils/interperter/eval';
import * as motion from 'motion/react-client';

type Theme = typeof ThemeContext extends React.Context<infer U> ? U : never;
export function VisualizerTool({
  title,
  description,
  constraints,
  testString,
}: {
  title: string;
  description: string;
  constraints: string[];
  testString: {
    args: [{ name: string; value: string }];
    resultString: string;
    testToAddToCode: string;
  }[];
}) {
  const [code, setCode] = useState('');
  const [visCode, setVisCode] = useState<ReactNode[]>([]);
  const theme = useContext(ThemeContext);
  const [gen, setGen] = useState<ReturnType<typeof evalChunk>>();
  const [codeLocation, setCodeLocaltion] = useState<Lua_Object_Visualizer>();
  const [visual, setVisual] = useState<Lua_Object_Visualizer[]>([]);
  const [envVisual, setEnviVisual] = useState<Lua_Object_Visualizer[]>([]);
  const [ast, setAst] = useState<luaparser.Chunk | null>(null);
  const [environment, setEnvironment] = useState<Lua_Environment | null>(null);
  const [globalEnvironment, setGlobalEnvironment] =
    useState<Lua_Environment | null>(null);
  const [visualEnvironment, setVisualEnvironment] = useState<ReactNode[]>([]);
  const [visualGlobalEnvironment, setVisualGlobalEnvironment] = useState<
    ReactNode[]
  >([]);
  const visualEnvironmentRef = useRef<Map<string, HTMLElement>>(new Map());
  const [svg, setSvg] = useState<ReactNode>(null);
  //    const [history, setHistory] = useState<Lua_Object_Visualizer[]>([]);

  useEffect(() => {
    if (!ast) return;
    createVisCode();
  }, [ast, codeLocation, theme]);
  useEffect(() => {
    if (!environment) return;
    setVisualEnvironment(environmentVisual(environment, visualEnvironmentRef));
  }, [environment]);

  useEffect(() => {
    if (!globalEnvironment) return;
    setVisualGlobalEnvironment(
      environmentVisual(globalEnvironment, visualEnvironmentRef),
    );
  }, [globalEnvironment]);
  useEffect(() => {
    if (!envVisual) return;
    if (envVisual.length < 1) return;
    let current = envVisual.pop();

    const rect1 = visualEnvironmentRef.current
      .get(current!.indexer!.name)!
      .getBoundingClientRect();
    const rect2 = visualEnvironmentRef.current
      .get(current!.identifier!.value)!
      .getBoundingClientRect();

    let the_rest = [...visualEnvironmentRef.current.entries()].map(([_, x]) =>
      x.getBoundingClientRect(),
    );

    let min_x = -1;
    let min_y = -1;

    // only care about the top left  get min tops
    the_rest.forEach((e) => {
      if (min_x === -1 || e.x < min_x) min_x = e.x;
      if (min_y === -1 || e.y < min_y) min_y = e.y;
    });
    // normilize
    the_rest.forEach((el) => {
      el.x -= min_x;
      el.y -= min_y;
    });

    // get max
    let max_x = -1;
    let max_y = -1;
    the_rest.forEach((el) => {
      if (max_x === -1 || el.x > max_x) max_x = el.x;
      if (max_y === -1 || el.y > max_y) max_y = el.y;
    });

    // make grid
    let grid: DOMRect[][] | null = Array.from(
      { length: Math.floor(max_y / 50) + 1 },
      () => {
        return Array(Math.floor(max_x / 50) + 1).fill(null);
      },
    );
    the_rest.forEach((el) => {
      grid[Math.floor(el.y / 50)][Math.floor(el.x / 50)] = el;
    });
    // now we have to find a path

    setSvg(
      <svg
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
        width={window.innerWidth}
        height={window.innerHeight}
      >
        <marker
          id='arrow'
          viewBox='0 0 10 10'
          refX='5'
          refY='5'
          markerWidth='4'
          markerHeight='3'
          orient='auto-start-reverse'
        >
          <polygon points='0 0, 10 3.5, 0 7' fill='black' />
        </marker>
        <line
          x1={rect1.x}
          y1={rect1.y}
          x2={rect2.x}
          y2={rect2.y}
          stroke={`${theme.vals.colors.primary}`}
          strokeWidth={4}
          markerEnd='url(#arrow)'
        />

        {/* rect1 box*/}
        <line
          x1={rect1.x}
          y1={rect1.y}
          x2={rect1.x}
          y2={rect1.bottom}
          stroke={`${theme.vals.colors.primary}`}
          strokeWidth={4}
        />
        <line
          x1={rect1.right}
          y1={rect1.y}
          x2={rect1.right}
          y2={rect1.bottom}
          stroke={`${theme.vals.colors.primary}`}
          strokeWidth={4}
        />
        <line
          x1={rect1.left}
          y1={rect1.y}
          x2={rect1.right}
          y2={rect1.y}
          stroke={`${theme.vals.colors.primary}`}
          strokeWidth={4}
        />
        <line
          x1={rect1.left}
          y1={rect1.bottom}
          x2={rect1.right}
          y2={rect1.bottom}
          stroke={`${theme.vals.colors.primary}`}
          strokeWidth={4}
        />

        {/*rect2 box*/}
        <line
          x1={rect2.x}
          y1={rect2.y}
          x2={rect2.x}
          y2={rect2.bottom}
          stroke={`${theme.vals.colors.primary}`}
          strokeWidth={4}
        />
        <line
          x1={rect2.right}
          y1={rect2.y}
          x2={rect2.right}
          y2={rect2.bottom}
          stroke={`${theme.vals.colors.primary}`}
          strokeWidth={4}
        />
        <line
          x1={rect2.left}
          y1={rect2.y}
          x2={rect2.right}
          y2={rect2.y}
          stroke={`${theme.vals.colors.primary}`}
          strokeWidth={4}
        />
        <line
          x1={rect2.left}
          y1={rect2.bottom}
          x2={rect2.right}
          y2={rect2.bottom}
          stroke={`${theme.vals.colors.primary}`}
          strokeWidth={4}
        />
      </svg>,
    );
  }, [envVisual]);

  function createVisCode() {
    if (!ast) return;
    setVisCode(evalChunkFront(ast, codeLocation || {}, theme));
  }
  return (
    <ResizablePanelGroup direction='horizontal' className='flex grow w-full'>
      <ResizablePanel className='flex flex-col w-1/2 p-4'>
        <div>
          {
            //  <Button
            //  onClick={() => {
            //    if (!ast) {
            //      console.log('no ast');
            //      return;
            //    }
            //    console.log(ast);
            //    console.log(visual);
            //    console.log(envVisual);
            //  }}
            //>
            //  print ast
            //</Button>
          }
        </div>

        {!gen ? (
          <textarea
            onChange={(e) => setCode(e.target.value)}
            value={code}
            className='flex flex-col w-full h-full'
            style={{
              background: theme.vals.colors.heatmap[0],
            }}
          />
        ) : (
          <div
            className='flex flex-col w-4/5 h-full'
            style={{
              height: '100%',
              marginTop: 50,
              width: '80%',
            }}
          >
            {visCode}
          </div>
        )}
      </ResizablePanel>

      <ResizableHandle />
      <ResizablePanel className='flex flex-col w-1/2 border-solid border-l-1 border-black '>
        {gen ? (
          <div className='h-full w-full p-4 overflow-y-scroll'>
            <div className='flex gap-x-8 justify-center rounded p-4'>
              <VscDebugStepOver
                className={`cursor-pointer hover:bg-[var(--bg-hover)] bg-[var(--bg)] rounded  active:bg-[var(--active)]`}
                style={{
                  '--bg': theme.vals.colors.background,
                  '--active': theme.vals.colors.primary,
                  '--bg-hover': theme.vals.colors.primary,
                }}
                size={30}
                onClick={() => {
                  if (!gen) {
                    console.log('no Generator');
                    return;
                  }
                  const val = gen.next();
                  if (val.done) {
                    setGen(undefined);
                  } else {
                    //if (!val.value) return;
                    //setVisual([...visual, val.value])
                    //
                    let v = val.value[1];

                    let visual = val.value[0];
                    if (visual) {
                      if (visual.identifier && visual.indexer) {
                        setEnviVisual([...envVisual, visual]);
                        console.log('env visual hapened');
                      } else if (visual.loc) {
                        setCodeLocaltion(visual);
                      }
                    }
                    setEnvironment(
                      JSON.parse(
                        JSON.stringify(v, replacer),
                        reviver,
                      ) as Lua_Environment,
                    );
                    setGlobalEnvironment(
                      JSON.parse(
                        JSON.stringify(Lua_Global_Environment, replacer),
                        reviver,
                      ) as Lua_Environment,
                    );
                  }
                  //console.log('hello', environement!.store);
                }}
              />
              <RiResetLeftFill
                className={`cursor-pointer hover:bg-[var(--bg-hover)] bg-[var(--bg)] rounded  active:bg-[var(--active)]`}
                style={{
                  '--bg': theme.vals.colors.background,
                  '--active': theme.vals.colors.primary,
                  '--bg-hover': theme.vals.colors.accent,
                }}
                size={30}
                onClick={() => {
                  setAst(null);
                  setVisCode([]);
                  setGen(undefined);
                }}
              />
            </div>
            <div className='flex flex-col flex-wrap w full'>
              local
              {
                <div className='flex flex-wrap w-full justify-between gap-y-3'>
                  {visualEnvironment}
                </div>
              }
            </div>
            <div> {svg}</div>
          </div>
        ) : (
          <div className='w-full flex flex-col items-center gap-y-8 p-4'>
            <div className='font-bold text-[40px]'>{title}</div>
            <div className='w-full flex flex-col gap-y-4 text-[20px]'>
              <p>{description}</p>
              <div className='flex flex-col gap-y-4'>
                <div className='font-bold'>Constraints</div>
                <ul className='flex flex-col gap-y-3 pl-8 list-disc'>
                  {constraints.map((c) => (
                    <li>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className='w-full items-center flex flex-col  gap-y-3'>
              <div className='font-bold text-[20px]'>Tests</div>
              <div className='w-full'>
                <div className='flex items-center gap-y-3 w-full'>
                  <div className='flex flex-col gap-y-3 w-full'>
                    {testString.map((t) => {
                      let args = t.args.map((arg) => {
                        return (
                          <div>
                            <b>{arg.name}: </b>
                            {arg.value}
                          </div>
                        );
                      });
                      return (
                        <div
                          className={`flex flex-col gap-y-3 cursor-pointer w-full hover:bg-[var(--bg-hover)] bg-[var(--bg)] rounded p-2 active:bg-[var(--active)]`}
                          style={{
                            '--active': theme.vals.colors.primary,
                            '--bg-hover': theme.vals.colors.accent,
                            '--bg': theme.vals.colors.background,
                          }}
                          onClick={() => {
                            const _ast = luaparser.parse(
                              t.testToAddToCode + '\n' + code,
                              {
                                locations: true,
                              },
                            );
                            setAst(_ast);
                            let env = new Lua_Environment();
                            let globalEnvironment = new Lua_Environment();
                            setEnvironment(env);
                            setGLobalEnvironmentGenerator(globalEnvironment);
                            setGlobalEnvironment(globalEnvironment);
                            setGen(evalChunk(_ast, env));
                          }}
                        >
                          <div>{args}</div>
                          <div>
                            <b>Result:</b> {t.resultString}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

function environmentVisual(
  env: Lua_Environment,
  ref: React.RefObject<Map<string, HTMLElement>>,
) {
  if (!env) return [];
  if (!env.store) return [];
  let rc = [...env.store.entries()].map(([identifier, obj]) => {
    switch (obj.kind) {
      case 'string':
      case 'number':
      case 'boolean': {
        return (
          <motion.div
            className=' flex p-1 items-center h-[50px] w-[50px] justify-center'
            animate={{ height: 'auto', width: 'auto' }}
            ref={(el) => {
              el && ref.current.set(identifier, el);
            }}
          >
            {identifier} {String(obj.value)}
          </motion.div>
        );
      }
      case 'table': {
        return (
          <motion.div
            animate={{ height: 'auto', width: 'auto' }}
            className=' flex p-1 gap-2 items-center justify-center'
          >
            {identifier} {tableVisualizer(obj, ref)}
          </motion.div>
        );
      }
      case 'return':
      case 'error':
      case 'null':
      case 'builtin':
      case 'function': {
        return (
          <div className='flex w-full justify-between items-center '>
            {identifier} {obj.kind}
          </div>
        );
      }
    }
  });
  return rc;
}
export function tableVisualizer(
  t: Lua_Table,
  ref: React.RefObject<Map<string, HTMLElement>>,
) {
  let rc = [...t.store.entries()].map(([key, obj]) => {
    let key_s = '';
    void key_s;
    if (typeof key === 'string') key_s = key;
    else if (typeof key === 'number') key_s = String(key);
    else key_s = key.id;

    switch (obj.kind) {
      case 'string':
      case 'number':
      case 'boolean': {
        return (
          <motion.div
            animate={{ height: 'auto', width: 'auto' }}
            className='flex gap-3 p-1 h-[50px] w-[50px] justify-center items-center'
            ref={(el) => {
              el && ref.current.set(obj.id, el);
            }}
          >
            {key.toString()}:{obj.value}
          </motion.div>
        );
      }
      case 'function': {
        return (
          <motion.div
            animate={{ height: 'auto', width: 'auto' }}
            className='flex gap-3 p-1 h-[50px] w-[50px]'
            ref={(el) => {
              el && ref.current.set(obj.id, el);
            }}
          >
            {key.toString()}:{obj.kind}
          </motion.div>
        );
      }
      case 'table': {
        return (
          <motion.div
            animate={{ height: 'auto', width: 'auto' }}
            className='flex gap-3 p-1'
          >
            {key.toString()}: {tableVisualizer(obj, ref)}
          </motion.div>
        );
      }
      case 'return':
      case 'error':
      case 'null':
      case 'builtin': {
        return null;
      }
      default: {
        return <div></div>;
      }
    }
  });
  return (
    <motion.div
      animate={{ height: 'auto', width: 'auto' }}
      className='flex gap-3 p-1 items-center justify-center'
    >
      {...rc}
    </motion.div>
  );
}

export function evalChunkFront(
  node: luaparser.Chunk,
  visual: Lua_Object_Visualizer,
  theme: Theme,
) {
  return evalStatementsArray(node.body, visual, theme);
}

export function evalStatementsArray(
  node: luaparser.Statement[],
  visual: Lua_Object_Visualizer,
  theme: Theme,
) {
  const vals: ReactNode[] = [];
  for (let statement of node) {
    let lua = evalStatements(statement, visual, theme);
    vals.push(lua);
  }

  return vals;
}

export function evalStatements(
  node: luaparser.Statement,
  visuals: Lua_Object_Visualizer,
  theme: Theme,
) {
  let id = `${node.loc!.start.line}-${node.loc!.end.line} | ${node.loc!.start.column}-${node.loc!.end.column}`;
  let visualid =
    visuals.loc === undefined
      ? ''
      : `${visuals.loc.start.line}-${visuals.loc.end.line} | ${visuals.loc.start.column}-${visuals.loc.end.column}`;
  let backgroundColor = visualid === id ? theme.vals.colors.primary : '';
  switch (node.type) {
    case 'ReturnStatement': {
      let vals: ReactNode[] = [];
      for (let exp of node.arguments) {
        vals.push(evalExpression(exp, visuals, theme));
      }
      return (
        <div
          key={id}
          className='flex gap-x-1'
          style={{
            backgroundColor: backgroundColor,
          }}
        >
          <Tooltip>
            <TooltipTrigger>
              <div>return</div>
            </TooltipTrigger>
            <div>{vals}</div>
            <TooltipContent>
              <p>return</p>
            </TooltipContent>
          </Tooltip>
        </div>
      );
    }

    case 'IfStatement': {
      let children: ReactNode[] = [];
      for (const clause of node.clauses) {
        children.push(evalClause(clause, visuals, theme));
        //if (obj.kind === "error") return obj;
        //if (t) return obj;
      }
      return (
        <div
          key={id}
          style={{
            backgroundColor: backgroundColor,
          }}
        >
          {children}
          end
        </div>
      );
    }
    case 'LocalStatement': {
      let vals: ReactNode[] = [];
      for (let v of node.init) {
        vals.push(evalExpression(v, visuals, theme));
      }

      let variables: ReactNode[] = [];

      for (let i = 0; i < node.variables.length; i++) {
        let x = node.variables[i];
        const curr_var = evalAssignment(x, visuals, theme);
        variables.push(curr_var);
      }

      return (
        <div
          key={id}
          className='flex gap-x-1'
          style={{
            backgroundColor: backgroundColor,
          }}
        >
          <div>local</div> {variables} = {vals}
        </div>
      );
    }
    case 'AssignmentStatement': {
      let vals: ReactNode[] = [];
      for (let v of node.init) {
        vals.push(evalExpression(v, visuals, theme));
      }

      let variables: ReactNode[] = [];
      for (let i = 0; i < node.variables.length; i++) {
        variables.push(evalAssignment(node.variables[i], visuals, theme));
      }

      return (
        <div
          key={id}
          className='flex gap-x-1'
          style={{
            backgroundColor: backgroundColor,
          }}
        >
          {variables} = {vals}
        </div>
      );
    }

    case 'CallStatement': {
      let obj = evalExpression(node.expression, visuals, theme);
      return obj;
    }

    case 'FunctionDeclaration': {
      let identfier: ReactNode = null;
      if (node.identifier) {
        identfier = evalAssignment(node.identifier, visuals, theme);
      }
      let params: ReactNode[] = [];
      for (let x of node.parameters) {
        params.push(evalExpression(x, visuals, theme));
      }
      let body: ReactNode[] = [];
      for (let x of node.body) {
        body.push(evalStatements(x, visuals, theme));
      }

      return (
        <div
          key={id}
          style={{
            backgroundColor: backgroundColor,
          }}
        >
          <div className='flex'>
            function {identfier}({params})
          </div>
          <div className='pl-8'>{body}</div>
          end
        </div>
      );
    }
    case 'ForNumericStatement': {
      let start = evalExpression(node.start, visuals, theme);
      let obj = evalAssignment(node.variable, visuals, theme);
      let end = evalExpression(node.end, visuals, theme);
      let step: ReactNode = null;
      if (node.step) {
        step = evalExpression(node.step, visuals, theme);
      }
      const body = evalStatementsArray(node.body, visuals, theme);
      return (
        <div
          key={id}
          style={{
            backgroundColor: backgroundColor,
          }}
        >
          <div className='flex gap-x-0.5'>
            for {obj} = {start}, {end} {step ? <>, {step}</> : null} do
          </div>
          <div className='pl-8'>{body}</div>
          end
        </div>
      );
    }

    case 'LabelStatement':
    case 'BreakStatement':
    case 'GotoStatement':
    case 'WhileStatement':
    case 'DoStatement':
    case 'RepeatStatement':
    case 'ForGenericStatement':
    default: {
      return <div key={id}>NOT yet IMPLEMENTED {node.type}</div>;
    }
  }
}

export function evalExpression(
  exp: luaparser.Expression,
  visuals: Lua_Object_Visualizer,
  theme: Theme,
): ReactNode {
  let id = `${exp.loc!.start.line}-${exp.loc!.end.line} | ${exp.loc!.start.column}-${exp.loc!.end.column}`;
  let visualid =
    visuals.loc === undefined
      ? ''
      : `${visuals.loc.start.line}-${visuals.loc.end.line} | ${visuals.loc.start.column}-${visuals.loc.end.column}`;
  let backgroundColor = visualid === id ? theme.vals.colors.primary : '';
  switch (exp.type) {
    case 'NumericLiteral': {
      return (
        <div
          style={{
            backgroundColor: backgroundColor,
          }}
        >
          <Tooltip key={id}>
            <TooltipTrigger>{exp.value}</TooltipTrigger>
            <TooltipContent>
              <p># Literal</p>
            </TooltipContent>
          </Tooltip>
        </div>
      );
    }
    case 'BooleanLiteral': {
      return (
        <div
          style={{
            backgroundColor: backgroundColor,
          }}
          key={id}
        >
          {String(exp.value)}
        </div>
      );
    }
    case 'NilLiteral': {
      return (
        <div
          key={id}
          style={{
            backgroundColor: backgroundColor,
          }}
        >
          nil
        </div>
      );
    }
    case 'UnaryExpression': {
      const arg = evalExpression(exp.argument, visuals, theme);
      return (
        <div
          key={id}
          className='flex gap-x-1'
          style={{
            backgroundColor: backgroundColor,
          }}
        >
          {exp.operator}
          {arg}
        </div>
      );
    }
    case 'BinaryExpression': {
      let left = evalExpression(exp.left, visuals, theme);
      let right = evalExpression(exp.right, visuals, theme);
      return (
        <div
          key={id}
          className='flex gap-x-1'
          style={{
            backgroundColor: backgroundColor,
          }}
        >
          {left}
          {exp.operator} {right}
        </div>
      );
    }
    case 'Identifier': {
      return (
        <div
          key={id}
          style={{
            backgroundColor: backgroundColor,
          }}
        >
          {exp.name}
        </div>
      );
    }
    case 'CallExpression': {
      let func = evalExpression(exp.base, visuals, theme);
      const args: ReactNode[] = [];
      for (let a of exp.arguments) {
        const arg = evalExpression(a, visuals, theme);
        args.push(arg);
      }

      return (
        <div
          key={id}
          className='flex gap-x-1'
          style={{
            backgroundColor: backgroundColor,
          }}
        >
          {func}({args})
        </div>
      );
    }
    case 'FunctionDeclaration': {
      let identfier: ReactNode = null;
      if (exp.identifier) {
        identfier = evalAssignment(exp.identifier, visuals, theme);
      }
      let params: ReactNode[] = [];
      for (let x of exp.parameters) {
        params.push(evalExpression(x, visuals, theme));
      }
      let body: ReactNode[] = [];
      for (let x of exp.body) {
        body.push(evalStatements(x, visuals, theme));
      }

      return (
        <div
          key={id}
          style={{
            backgroundColor: backgroundColor,
          }}
        >
          <div className='flex'>
            function {identfier}({params})
          </div>
          <div className='pl-8'>{body}</div>
          end
        </div>
      );
    }
    case 'TableConstructorExpression': {
      const key_vals: ReactNode[] = [];
      for (const field of exp.fields) {
        key_vals.push(evalTableField(field, visuals, theme));
      }
      return (
        <div
          key={id}
          className='flex gap-x-1'
          style={{
            backgroundColor: backgroundColor,
          }}
        >
          {`{`} {key_vals} {`}`}
        </div>
      );
    }
    case 'IndexExpression': {
      const identifier = evalExpression(exp.base, visuals, theme);
      let idx = evalExpression(exp.index, visuals, theme);
      return (
        <div
          key={id}
          className='flex'
          style={{
            backgroundColor: backgroundColor,
          }}
        >
          {identifier}[{idx}]
        </div>
      );
    }
    case 'MemberExpression': {
      const identifier = evalExpression(exp.base, visuals, theme);
      const rest = evalExpression(exp.identifier, visuals, theme);

      return (
        <div
          key={id}
          className='flex'
          style={{
            backgroundColor: backgroundColor,
          }}
        >
          {identifier}
          {exp.indexer}
          {rest}
        </div>
      );
    }
    case 'StringLiteral': {
      let val = '';
      if (exp.raw[0] === "'" || exp.raw[0] === '"') {
        for (let i = 1; i < exp.raw.length - 1; i++) {
          val += exp.raw[i];
        }
      } else {
        //TODO
        val = parseLongString(exp.raw);
      }
      return (
        <div
          key={id}
          style={{
            backgroundColor: backgroundColor,
          }}
        >
          {val}
        </div>
      );
    }
    case 'VarargLiteral':
    case 'LogicalExpression':
    case 'TableCallExpression':
    case 'StringCallExpression':
    default: {
      return <div>NOT IMplemented expression {exp.type}</div>;
    }
  }
}
export function evalClause(
  clause: luaparser.IfClause | luaparser.ElseifClause | luaparser.ElseClause,
  visuals: Lua_Object_Visualizer,
  theme: Theme,
) {
  let id = `${clause.loc!.start.line}-${clause.loc!.end.line} | ${clause.loc!.start.column}-${clause.loc!.end.column}`;
  let visualid =
    visuals.loc === undefined
      ? ''
      : `${visuals.loc.start.line}-${visuals.loc.end.line} | ${visuals.loc.start.column}-${visuals.loc.end.column}`;
  let backgroundColor = visualid === id ? theme.vals.colors.primary : '';
  switch (clause.type) {
    case 'ElseClause': {
      const child = evalStatementsArray(clause.body, visuals, theme);
      return (
        <div
          style={{
            backgroundColor: backgroundColor,
          }}
          key={id}
          className='ml-8'
        >
          else
          {child}
        </div>
      );
    }
    default: {
      let name = clause.type === 'IfClause' ? 'if' : 'elseif';
      let condition = evalExpression(clause.condition, visuals, theme);
      const child = evalStatementsArray(clause.body, visuals, theme);
      return (
        <div
          style={{
            backgroundColor: backgroundColor,
          }}
          key={id}
        >
          <div className='flex gap-x-1'>
            {name} {condition} then
          </div>
          <div className='pl-8'>{child}</div>
        </div>
      );
    }
  }
}

export function evalAssignment(
  exp:
    | luaparser.Identifier
    | luaparser.MemberExpression
    | luaparser.IndexExpression,
  visuals: Lua_Object_Visualizer,
  theme: Theme,
) {
  //TODO add viuals. Here we can do an animation
  let id = `${exp.loc!.start.line}-${exp.loc!.end.line} | ${exp.loc!.start.column}-${exp.loc!.end.column}`;
  let visualid =
    visuals.loc === undefined
      ? ''
      : `${visuals.loc.start.line}-${visuals.loc.end.line} | ${visuals.loc.start.column}-${visuals.loc.end.column}`;
  let backgroundColor = visualid === id ? theme.vals.colors.primary : '';
  console.log(visuals);
  switch (exp.type) {
    case 'Identifier':
      return (
        <div
          key={id}
          style={{
            backgroundColor: backgroundColor,
          }}
        >
          {exp.name}
        </div>
      );
    case 'IndexExpression':
      let identifier = evalExpression(exp.base, visuals, theme);
      let idx = evalExpression(exp.index, visuals, theme);
      return (
        <div
          style={{
            backgroundColor: backgroundColor,
          }}
          key={id}
        >
          {identifier}[{idx}]
        </div>
      );
    case 'MemberExpression': {
      const identifier = evalExpression(exp.base, visuals, theme);
      const rest = evalExpression(exp.identifier, visuals, theme);

      return (
        <div
          style={{
            backgroundColor: backgroundColor,
          }}
          key={id}
          className='flex'
        >
          {identifier}
          {exp.indexer}
          {rest}
        </div>
      );
    }

    default: {
      return <div>NOT IMPLEMENTED eval assigment</div>;
    }
  }
}

export function evalTableField(
  field: luaparser.TableKey | luaparser.TableKeyString | luaparser.TableValue,
  visuals: Lua_Object_Visualizer,
  theme: Theme,
) {
  let id = `${field.loc!.start.line}-${field.loc!.end.line} | ${field.loc!.start.column}-${field.loc!.end.column}`;
  let visualid =
    visuals.loc === undefined
      ? ''
      : `${visuals.loc.start.line}-${visuals.loc.end.line} | ${visuals.loc.start.column}-${visuals.loc.end.column}`;

  let backgroundColor = visualid === id ? theme.vals.colors.primary : '';
  let render: ReactNode = null;
  switch (field.type) {
    case 'TableKey': {
      const key = evalExpression(field.key, visuals, theme);
      const val = evalExpression(field.value, visuals, theme);
      render = (
        <>
          {key} = {val}
        </>
      );
      break;
    }
    case 'TableKeyString': {
      const val = evalExpression(field.value, visuals, theme);
      render = (
        <>
          {field.key.name} = {val}
        </>
      );

      break;
    }
    case 'TableValue': {
      const val = evalExpression(field.value, visuals, theme);

      render = <>{val}</>;

      break;
    }
  }

  return (
    <div
      key={id}
      className='flex gap-x-0.5'
      style={{
        backgroundColor,
      }}
    >
      {render}
    </div>
  );
}
function replacer(_key: any, value: any) {
  if (value instanceof Map) {
    return {
      dataType: 'Map',
      value: Array.from(value.entries()), // or with spread: value: [...value]
    };
  } else {
    return value;
  }
}
function reviver(_key: any, value: any) {
  if (typeof value === 'object' && value !== null) {
    if (value.dataType === 'Map') {
      return new Map(value.value);
    }
  }
  return value;
}
