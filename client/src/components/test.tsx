import { useContext, useEffect, useRef, useState } from 'react';

import { IoReturnDownBack } from "react-icons/io5";
import { MdOutlineTimeline } from 'react-icons/md';
import type { ReactNode } from 'react';
import { ThemeContext } from '../routes/__root';
import { RiResetLeftFill } from 'react-icons/ri';
import { VscDebugStepOver } from 'react-icons/vsc';
import { Lua_Environment, Lua_Table } from '../utils/interperter/lua_types';
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
import luaparser from 'luaparse';
import * as motion from 'motion/react-client';
import { evalChunkFront } from './ast_visualizer';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';

import { ScrollArea, ScrollBar } from './ui/scroll-area';
import { Tree, TreeNode } from './tree';
import { Environment } from 'vite';
import { testInterperter } from '../utils/interperter';
import {
  controller,
  History,
  type event,
} from '../utils/interperter_generator/controller';
import { make_replacer, reviver } from '../utils/jsonParser';

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
  const [controls, setControls] = useState<ReturnType<
    typeof controller
  > | null>(null);
  const [mode, setMode] = useState<'tree' | 'env'>('tree');
  const [timeline, setTimeline] = useState<History['timeline']>([]);
  const [currenTimeline, setCurrentTimeline] = useState(0);
  const [code, setCode] = useState('');
  const [history, setHistory] = useState<Tree<History>>(new Tree<History>());
  const [currentNode, setCurrentNode] = useState<TreeNode<History> | null>(
    null,
  );

  const [presentingNode, setPresintingNode] =
    useState<TreeNode<History> | null>(null);
  const [visCode, setVisCode] = useState<ReactNode[]>([]);
  const theme = useContext(ThemeContext);
  const [gen, setGen] = useState<ReturnType<typeof evalChunk>>();
  const [codeLocation, setCodeLocaltion] = useState<Lua_Object_Visualizer>();
  const [envVisual, setEnviVisual] = useState<Lua_Object_Visualizer[]>([]);
  const [ast, setAst] = useState<luaparser.Chunk | null>(null);
  const [environment, setEnvironment] = useState<Lua_Environment | null>(null);
  const [globalEnvironment, setGlobalEnvironment] =
    useState<Lua_Environment | null>(null);
  const visualEnvironmentRef = useRef<Map<string, HTMLElement>>(new Map());
  const visualParentRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<ReactNode[]>([]);
  const [heapHelper, setHeapHelper] = useState<
    { id: string; is_open: boolean }[]
  >([]);
  //const [bs, setBs] = useState<ReactNode[]>([]);
  //    const [history, setHistory] = useState<Lua_Object_Visualizer[]>([]);

  useEffect(() => {
    if (!ast) return;
    createVisCode();
  }, [ast, codeLocation, theme]);
  useEffect(() => {}, [environment]);

  //useEffect(() => {
  //  if (!globalEnvironment) return;
  //  setVisualGlobalEnvironment(
  //    environmentVisual(globalEnvironment, visualEnvironmentRef),
  //  );
  //}, [globalEnvironment]);

  //TODO REFAAACCTOOOOR
  useEffect(() => {
    if (!envVisual) return;
    if (envVisual.length < 1) return;
    let indexing = [envVisual.at(-1), envVisual.at(-2)];
    let id = '';

    // TODO get rasterizing out and we gotta refactor sooon this looks tooo bad
    let svgs: ReactNode[] = [];
    for (let current of indexing) {
      if (!current) {
        continue;
      }

      let new_id = `${current.loc!.start.line}-${current.loc!.end.line} | ${current.loc!.start.column}-${current.loc!.end.column}`;
      if (id === new_id) {
        continue;
      }
      id = new_id;
      const rect1 = visualEnvironmentRef.current
        .get(current!.indexer!.name)!
        .getBoundingClientRect();

      const rect2 = visualEnvironmentRef.current
        .get(current!.identifier!.value)!
        .getBoundingClientRect();

      // TODO look into rasterizing
      let x_lines: Set<number> = new Set();
      let y_lines: Set<number> = new Set();
      let elements = [...visualEnvironmentRef.current.values()].map((e) => {
        let rect = e.getBoundingClientRect();
        x_lines.add(rect.left);
        x_lines.add(rect.right);
        y_lines.add(rect.top);
        y_lines.add(rect.bottom);
        return rect;
      });

      type cell = {
        left: number;
        right: number;
        top: number;
        bottom: number;
        occupied: boolean;
        start: boolean;
        end: boolean;
      };
      //    let parent_ref = visualParentRef.current!.getBoundingClientRect();

      // rasterizing gpt code need to understand this better dynamc grid
      const x_sorted = Array.from(x_lines).sort((a, b) => a - b);
      const y_sorted = Array.from(y_lines).sort((a, b) => a - b);
      const grid: cell[][] = [];
      for (let i = 0; i < x_sorted.length - 1; i++) {
        let row_cells: cell[] = [];
        for (let j = 0; j < y_sorted.length - 1; j++) {
          const cell: cell = {
            left: x_sorted[i],
            right: x_sorted[i + 1],
            top: y_sorted[j],
            bottom: y_sorted[j + 1],
            occupied: false,
            start: false,
            end: false,
          };

          // check if occupied

          for (const rect of elements) {
            if (
              !(
                cell.right <= rect.left ||
                cell.left >= rect.right ||
                cell.bottom <= rect.top ||
                cell.top >= rect.bottom
              )
            ) {
              cell.occupied = true;
              if (cell.left === rect1.left && cell.top === rect1.top) {
                cell.occupied = false;
                cell.start = true;
              }
              if (cell.left === rect2.left && cell.top === rect2.top) {
                cell.occupied = false;
                cell.end = true;
              }
              break;
            }
          }
          //cell.left -= parent_ref.left;
          //cell.right -= parent_ref.left;
          //cell.top -= parent_ref.top;
          //cell.bottom -= parent_ref.top;

          row_cells.push(cell);
        }
        grid.push(row_cells);
      }
      //let bullshit: ReactNode[] = [];
      //for (let y of grid) {
      //  for (let x of y) {
      //    if (x.occupied) continue;
      //    bullshit.push(
      //      <div
      //        style={{
      //          position: 'absolute',
      //          left: x.left,
      //          top: x.top,
      //          width: x.right - x.left,
      //          height: x.bottom - x.top,
      //          background: 'yellow',
      //        }}
      //      ></div>,
      //    );
      //  }
      //}
      //setBs(bullshit);
      //// now we have to find a path

      // find start and end
      let start = { i: -1, j: -1 };
      let end = { i: -1, j: -1 };
      for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[0].length; j++) {
          if (grid[i][j].start) start = { i: i, j: j };
          if (grid[i][j].end) end = { i: i, j: j };
        }
      }

      let vistited_parent: Map<string, string> = new Map();
      vistited_parent.set(`${start.i}-${start.j}`, `${start.i}-${start.j}`);
      let dirs = [
        { i: 1, j: 0 },
        { i: -1, j: 0 },
        { i: 0, j: 1 },
        { i: 0, j: -1 },
      ];
      let q = [start];
      // shortest path
      parent: while (q.length > 0) {
        let n = q.length;
        for (let i = 0; i < n; i++) {
          let curr = q.shift();
          if (curr === undefined) {
            console.log('error');
            break;
          }
          if (curr.i === end.i && curr.j === end.j) {
            console.log('found it');
            break parent;
          }
          for (let dir of dirs) {
            let new_node = { i: curr.i + dir.i, j: curr.j + dir.j };
            if (
              new_node.i < 0 ||
              new_node.j < 0 ||
              new_node.i >= grid.length ||
              new_node.j >= grid[0].length ||
              grid[new_node.i][new_node.j].occupied ||
              vistited_parent.has(`${new_node.i}-${new_node.j}`)
            ) {
              continue;
            } else {
              vistited_parent.set(
                `${new_node.i}-${new_node.j}`,
                `${curr.i}-${curr.j}`,
              );
              q.push(new_node);
            }
          }
        }
      }
      // TODO give grid values?

      let path: { i: number; j: number }[] = [];
      let last = `${end.i}-${end.j}`;
      let parent_v = vistited_parent.get(last);
      //
      while (last !== parent_v) {
        let split = last.split('-');
        path.push({ i: parseInt(split[0]), j: parseInt(split[1]) });
        last = parent_v!;
        parent_v = vistited_parent.get(parent_v!);
      }

      path = path.reverse();

      let svg_path =
        `M${rect1.left} ${rect1.top} ` +
        path
          .map(({ i, j }, idx) => {
            let curr_cell = grid[i][j];
            let x = curr_cell.left;
            let y = curr_cell.top;

            if (idx === 0) return `L${x} ${y}`;

            return `L${grid[i][j].left} ${grid[i][j].top}`;
          })
          .join(' ');
      console.log(svg_path);

      svgs.push(
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none',
          }}
          width={window.innerWidth}
          height={window.innerHeight}
        >
          <path
            d={svg_path}
            stroke={`${theme.vals.colors.primary}`}
            fill='none'
            strokeWidth={4}
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
    }

    setSvg(svgs);
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
                  if (!controls) throw Error('controls should not be null');
                  let values = controls.next();
                  let info = controls.info();
                  if (info === null) throw Error('info should not be null');
                  console.log(info.tree);

                  const val = values;
                  if (val === undefined) throw Error('should not be undefined');

                  if (val.done) {
                    setGen(undefined);
                  } else {
                    //if (!val.value) return;
                    //setVisual([...visual, val.value])
                    //
                    //TODO god dammit this is really bad repretive code after branching i think i should really do some refactoring but for now....

                    let env = JSON.parse(
                      JSON.stringify(info.curr_env, make_replacer()),
                      reviver,
                    ) as Lua_Environment;
                    setEnvironment(env);
                    let visual = val.value[0];

                    setHistory(info.tree);

                    setCurrentNode(info.curr_node);
                    setPresintingNode(info.curr_node);
                    setTimeline(info.curr_node.value.timeline);
                    setCurrentTimeline(
                      info.curr_node.value.currentHistoryIdx(),
                    );
                    if (visual) {
                      if (visual.identifier && visual.indexer) {
                        setEnviVisual([...envVisual, visual]);
                        console.log('env visual hapened');
                      } else if (visual.loc) {
                        setCodeLocaltion(visual);
                      }
                    }
                    //setGlobalEnvironment(
                    //  JSON.parse(
                    //    JSON.stringify(Lua_Global_Environment, replacer),
                    //    reviver,
                    //  ) as Lua_Environment,
                    //);
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

              <MdOutlineTimeline
                className={`cursor-pointer hover:bg-[var(--bg-hover)] bg-[var(--bg)] rounded  active:bg-[var(--active)]`}
                style={{
                  '--bg': theme.vals.colors.background,
                  '--active': theme.vals.colors.primary,
                  '--bg-hover': theme.vals.colors.accent,
                }}
                size={30}
                onClick={() => {

                  console.log(timeline)
                  let e = timeline.at(currenTimeline + 1);
                  if (!e) return;
                  if (e.goTo) {
                      console.log('yes go to?')
                    setPresintingNode(e.goTo);
                    visualEnvironmentRef.current = new Map();
                    setEnvironment(e.goTo.value.timeline[0].env);
                    setTimeline(e.goTo.value.timeline);
                    setCurrentTimeline(0);
                    setHeapHelper([]);
                  } else {
                    setEnvironment(e.env);
                    setCurrentTimeline(currenTimeline + 1);
                      console.log('no go to?')
                  }
                }}
              />

              <IoReturnDownBack
                className={`cursor-pointer hover:bg-[var(--bg-hover)] bg-[var(--bg)] rounded  active:bg-[var(--active)]`}
                style={{
                  '--bg': theme.vals.colors.background,
                  '--active': theme.vals.colors.primary,
                  '--bg-hover': theme.vals.colors.accent,
                }}
                size={30}
                onClick={() => {

                  let e = timeline.at(currenTimeline - 1);
                  if (!e) return;
                  if (e.cameFrom) {
                    setPresintingNode(e.cameFrom.n);
                    visualEnvironmentRef.current = new Map();
                    setEnvironment(e.cameFrom.n.value.timeline[e.cameFrom.eIdx].env);
                    setTimeline(e.cameFrom.n.value.timeline);
                    setCurrentTimeline(e.cameFrom.eIdx);
                    setHeapHelper([]);
                  } else {
                    setEnvironment(e.env);
                    setCurrentTimeline(currenTimeline + -1);
                      console.log('no go to?')
                  }
                }}
              />
            </div>
            <div className='flex flex-wrap w-full h-full'>
              <div onClick={() => setMode(mode === 'tree' ? 'env' : 'tree')}>
                {mode === 'tree' ? 'env' : 'tree'}
              </div>

              {
                <div
                  className='flex h-full flex-wrap w-full justify-between gap-y-3 relative'
                  ref={visualParentRef}
                >
                  {mode === 'tree' ? (
                    <NAryTree
                      tree={history.root!}
                      currentId={currentNode?.id}
                      onCurrentClick={(node: TreeNode<History>) => {
                        setMode('env');
                        setPresintingNode(node);
                        visualEnvironmentRef.current = new Map();
                        setEnvironment(node.value.timeline[0].env);
                        setTimeline(node.value.timeline);
                        setCurrentTimeline(0);
                        setHeapHelper([]);
                      }}
                    />
                  ) : (
                    environment &&
                    timeline && (
                      <div className='h-full w-full flex'>
                        <div className='p-4'>
                          {timeline.map((e, idx) => {
                            return (
                              <div
                                key={`timeline-${idx}`}
                                onClick={() => {
                                  setEnvironment(e.env);
                                  setCurrentTimeline(idx);
                                }}
                              >
                                {idx === currenTimeline ? `${idx} me` : idx}
                              </div>
                            );
                          })}
                        </div>
                        <VisualEnvironment
                          env={environment}
                          ref={visualEnvironmentRef}
                          heapHelper={heapHelper}
                          setHeapHelper={setHeapHelper}
                        />
                      </div>
                    )
                  )}
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

                            // lets try using the controller
                            let controls = controller(_ast);
                            setControls(controls);
                            controls.init();
                            let info = controls.info();
                            if (info === null)
                              throw Error('should not be noot after init');

                            // TODO old version
                            setAst(_ast);
                            let globalEnvironment = info.global;
                            setEnvironment(info.curr_env);
                            setGLobalEnvironmentGenerator(info.global);
                            setGlobalEnvironment(info.global);
                            setGen(info.stepper);
                            // TODO
                            let curr: TreeNode<Lua_Environment> = new TreeNode(
                              globalEnvironment,
                            );

                            setCurrentNode(info.curr_node);
                            setPresintingNode(info.curr_node);
                            setHistory(info.tree);
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

type VisualEnvironmentProps = {
  env: Lua_Environment;
  ref: React.RefObject<Map<string, HTMLElement>>;
  heapHelper: { id: string; is_open: boolean }[];
  setHeapHelper: React.Dispatch<
    React.SetStateAction<{ id: string; is_open: boolean }[]>
  >;
};

export default function NAryTree({
  tree,
  currentId,
  onCurrentClick,
}: {
  tree: TreeNode<History>;
  currentId?: string;
  onCurrentClick: (node: TreeNode<History>) => void;
}) {
  return (
    <div className='w-full min-h-[50vh] overflow-auto py-6 flex justify-center'>
      {/* Pseudo-element helpers for vertical drops from the bar to each child */}
      <style>{css}</style>
      <Node
        node={tree}
        depth={0}
        currentId={currentId}
        onCurrentClick={onCurrentClick}
      />
    </div>
  );
}

function Node({
  node,
  depth,
  currentId,
  onCurrentClick,
}: {
  node: TreeNode<History>;
  depth: number;
  currentId?: string;
  onCurrentClick: (node: TreeNode<History>) => void;
}) {
  const kids = node.children?.length ? node.children : [];
  const isCurrent = currentId === node.id;

  return (
    <div className='inline-flex flex-col items-center relative'>
      {/* Card */}
      <button
        type='button'
        onClick={() => onCurrentClick(node)}
        className={[
          'rounded-xl border px-4 py-2 min-w-[96px] text-center shadow-md select-none',
          'bg-slate-800 border-slate-700 text-slate-100',
          isCurrent
            ? 'ring-4 ring-indigo-500/50 shadow-indigo-700/30'
            : 'hover:bg-slate-750/50',
        ].join(' ')}
        aria-current={isCurrent || undefined}
        data-node-id={node.id}
      >
        <div className='text-sm font-semibold truncate max-w-[140px]'>
          {node.id}
        </div>
        <div className='text-[10px] text-slate-400'>depth {depth}</div>
      </button>

      {/* Connectors + children */}
      {kids.length > 0 && (
        <>
          {/* vertical stem */}
          <div className='w-0.5 h-6 bg-slate-600 my-1' />

          {/* children row + horizontal bar */}
          <div className='relative flex gap-6 pt-6'>
            <div className='absolute left-0 right-0 top-0 h-0.5 bg-slate-600' />
            {kids.map((child) => (
              <div
                key={child.id}
                className='relative flex flex-col items-center pt-3 child-drop'
              >
                <Node
                  node={child}
                  depth={depth + 1}
                  currentId={currentId}
                  onCurrentClick={onCurrentClick}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const css = `
/* draw a short vertical line from the connectors bar to each child card */
.child-drop::before {
  content: "";
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 12px;
  background: rgb(71 85 105); /* slate-600 */
}
`;

// --- Demo usage (optional) ---

let global_env = 0;
// TODO fix this bs
function VisualEnvironment({
  env,
  ref,
  heapHelper,
  setHeapHelper,
}: VisualEnvironmentProps) {
  if (!env) return [];
  if (!env.store) return [];
  let rc: ReactNode[] = [];
  global_env++;
  if (env.outer) {
    rc.push(
      VisualEnvironment({
        env: env.outer,
        ref,
        heapHelper,
        setHeapHelper,
      }),
    );
  }
  let curr: ReactNode[] = [...env.store.entries()].map(([identifier, obj]) => {
    switch (obj.kind) {
      case 'string':
      case 'number':
      case 'boolean': {
        return (
          <motion.div
            drag
            className=' flex p-1 items-center h-[50px] w-[50px] justify-center'
            ref={(el) => {
              el && ref.current.set(identifier, el);
            }}
          >
            {identifier} : {String(obj.value)}
          </motion.div>
        );
      }
      case 'table': {
        setHeapHelper((prev) => {
          if (prev.some((h) => h.id === obj.id)) {
            return prev;
          } else {
            return [...prev, { id: obj.id, is_open: true }];
          }
        });
        // TODO fix this bs
        return (
          <motion.div drag>
            <Collapsible
              open={(() => {
                const found = heapHelper.find((h) => h.id === obj.id);
                if (!found) {
                  console.log(
                    'wtf error handle it broski heap helper not found',
                  );
                }
                return found === undefined ? true : found.is_open;
              })()}
              onOpenChange={() => {
                const heap_clone: typeof heapHelper = JSON.parse(
                  JSON.stringify(heapHelper),
                );
                const found = heap_clone.find((h) => h.id === obj.id);
                if (found) {
                  found.is_open = !found.is_open;
                } else {
                  console.log(
                    'wtf error handle it broski heap helper not found onOpenChange',
                  );
                }
                setHeapHelper(heap_clone);
              }}
              className='flex p-1 gap-2 items-center justify-center'
            >
              <CollapsibleTrigger asChild>
                <div>{identifier}</div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ResizablePanelGroup
                  direction='horizontal'
                  className='flex flex-row max-w-fit'
                >
                  <ResizablePanel className='w-2/3 flex flex-row'>
                    <ScrollArea className='w-full h-full rounded-md border p-4 flex flex-row'>
                      {tableVisualizer(obj, ref)}
                      <ScrollBar
                        className='bg-black'
                        orientation='horizontal'
                      />
                    </ScrollArea>
                  </ResizablePanel>
                  <ResizableHandle withHandle />
                  <ResizablePanel></ResizablePanel>
                </ResizablePanelGroup>
              </CollapsibleContent>
            </Collapsible>
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
  global_env--;
  return (
    <div className={`${global_env === 0 ? 'h-full' : 'h-fit'}`}>
      <Collapsible className='h-full' defaultOpen={true}>
        {rc}
        <CollapsibleTrigger>Env: #{global_env}</CollapsibleTrigger>

        <ScrollArea className='h-full'>
          <CollapsibleContent>{curr}</CollapsibleContent>
          <ScrollBar className='bg-black' orientation='vertical' />
        </ScrollArea>
      </Collapsible>
    </div>
  );
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
          <motion.div className='flex gap-3 p-1'>
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
    <motion.div drag className='flex gap-3 p-1 items-center justify-center'>
      {...rc}
    </motion.div>
  );
}
// TODO this are utils maybe take it out
