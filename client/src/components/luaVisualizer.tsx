import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { trpc } from '../lib/trpc';
import { Button } from './ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Lua_Table } from '@busytutor/server/src/interpreter';
import type {
  Lua_Object,
  Lua_Visualzer,
} from '@busytutor/server/src/interpreter';
import { Heap } from 'mnemonist';
import { reviver, revive_heap } from '../utils/jsonParser';
import {
  PixelAssigment,
  PixelOperation,
  PixelReturn,
  PixelTable,
  PixelUnaryOperation,
  PixelVariable,
} from './PixelArt';

//const VIUAL_PARENT_ID = '.%!@#PARENT';
//const ArrowHead = {
//  primary: { id: 'arrowhead-primary', color: '#4c6ef5' },
//  secondary: { id: 'arrowhead-secondary', color: '#6c5ce7' },
//  pointer: {
//    id: 'arrowhead-pointer',
//    color: '#4C6EF54C',
//    strokeDasharray: '4,4',
//  },
//};

const Lines = {
  primary: { color: '#4c6ef5', strokeDasharray: '' },
  secondary: { color: '#6c5ce7', strokeDasharray: '' },
  pointer: {
    color: 'rgba(76, 110, 245, 0.3)',
    strokeDasharray: '10 20',
    colorHover: '#14b8a6',
  },
};
const PIXEL_WIDTH = 5;

export function LuaVisualizer({
  id,
  didSolutionPass,
  setDidSolutionPass,
  setCurrLoc,
}: {
  id: string;
  didSolutionPass?: boolean;
  setDidSolutionPass: Dispatch<SetStateAction<boolean | undefined>>;
  setCurrLoc: Dispatch<
    SetStateAction<
      | {
          start: {
            line: number;
            column: number;
          };
          end: {
            line: number;
            column: number;
          };
        }
      | undefined
    >
  >;
}) {
  const [enabled, setEnabled] = useState(false);
  const [isTree, setIsTree] = useState(true);
  const [currentOnStack, setCurrentOnStack] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setEnabled(true), 2000); // wait 2 s
    return () => clearTimeout(timer);
  }, []);

  let { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    trpc.lua.progress.useInfiniteQuery(
      { id: id, limit: 10 },
      {
        initialCursor: 0,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        enabled,
      },
    );

  useEffect(() => {
    const interval = setInterval(() => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage(); // ✅ ask TRPC for next cursor
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const timeline = useMemo(() => {
    let flatData = data?.pages.flatMap((page) => page.items) ?? [];
    let lastOne = data?.pages[data.pages.length - 1].didSolutionPass;
    if (didSolutionPass !== lastOne) {
      setDidSolutionPass(lastOne);
    }
    return flatData.map((d) => {
      let refs = JSON.parse(d.currEnv, reviver) as { refid: string };
      let heap = revive_heap(JSON.parse(d.heap) as Record<string, any>);
      let valueRegistry = JSON.parse(d.valueRegistry, reviver) as Map<
        string,
        Lua_Object
      >;
      // console.log('string verion', valueRegistry);

      //console.log(valueRegistry);

      let currEnv = heap.get(refs.refid);
      if (!currEnv) {
        throw new Error('Lua_Table should exist');
      }

      return {
        visual: JSON.parse(d.visual) as Lua_Visualzer,
        currEnv,
        valueRegistry,
        heap,
      };
    });
  }, [data]);

  return (
    <div className='flex flex-col flex-1 p-4 overflow-y-auto'>
      <div className='w-full '>
        {/* heahder */}
        <div className='w-full justify-center flex flex-row  gap-x-2'>
          <Button
            variant='outline'
            onClick={() => {
              setCurrentOnStack(Math.max(currentOnStack - 1, 0));
              setCurrLoc(timeline[currentOnStack].visual.loc);
            }}
          >
            <ArrowLeft />
          </Button>
          <Button
            variant='outline'
            onClick={() => {
              setCurrentOnStack(
                Math.min(currentOnStack + 1, timeline.length - 1),
              );
              setCurrLoc(timeline[currentOnStack].visual.loc);
              //console.log(timeline[currentOnStack].heap);
              //console.log(timeline[currentOnStack].currEnv);
              //console.log(timeline.map((t) => t.visual));
            }}
          >
            <ArrowRight />
          </Button>
        </div>

        <Button variant='outline' onClick={() => setIsTree(!isTree)}>
          {isTree ? 'Stack' : 'Tree'}
        </Button>

        {/* tree */}
        {isTree && (
          <div>
            <NAryTree visualStack={timeline} currentIdx={currentOnStack} />
          </div>
        )}

        {!isTree && timeline[currentOnStack] && (
          <div className='flex flex-row gap-x-4 '>
            <Timeline visualStack={timeline} currentIdx={currentOnStack} />
            <VisualizeExecution
              env={timeline[currentOnStack].currEnv}
              heap={timeline[currentOnStack].heap}
              registry={timeline[currentOnStack].valueRegistry}
              visual={timeline[currentOnStack].visual}
              currentIdx={currentOnStack}
            />
          </div>
        )}
      </div>
    </div>
  );
}
function Timeline({
  visualStack,
  currentIdx,
}: {
  visualStack: { visual: Lua_Visualzer }[];
  currentIdx: number;
}) {
  const timeline = useMemo(() => {
    let mid = currentIdx;
    let start: number | null = null;
    let end: number | null = null;
    let curr = visualStack[mid].visual;
    if (curr.type && curr.type === 'NEW') {
      start = mid;
    } else if (curr.type && curr.type === 'EXIT') {
      end = mid;
    }

    if (start === null) {
      for (let i = mid; i > -1; i--) {
        let ncurr = visualStack[i].visual;
        if (ncurr.type && ncurr.type === 'NEW') {
          start = i;
          break;
        }
      }
    }
    if (end === null) {
      let deep = 0;
      for (let i = mid; i < visualStack.length; i++) {
        let ncurr = visualStack[i].visual;
        if (ncurr.type && ncurr.type === 'EXIT' && deep === 0) {
          end = i;
          break;
        }

        if (ncurr.type && ncurr.type === 'EXIT') {
          deep--;
        }

        if (ncurr.type && ncurr.type === 'NEW') {
          deep++;
        }
      }
    }
    end = end ? end : visualStack.length;
    if (start === null)
      throw new Error(
        `Timeline start or end are null  start = ${start} | end = ${end}`,
      );
    let idx: number[] = [];
    for (let i = start; i < end + 1; i++) {
      idx.push(i);
    }
    return idx;
  }, [currentIdx, visualStack]);

  return (
    <div className='h-80 overflow-auto'>
      {timeline.map((i, idx) => {
        return <div key={`timeline-${i}-${idx}`}>{i}</div>;
      })}
    </div>
  );
}

type cell = {
  left: number;
  right: number;
  id?: string;
  top: number;
  bottom: number;
  occupied: boolean;
  isArrow?: boolean;
  softOccupied: number;
  start: boolean;
  end: boolean;
};

//let globalEnv = 0;
function VisualizeExecution({
  env,
  heap,
  currentIdx,
  visual,
  registry,
}: {
  env: Lua_Table;
  currentIdx: number;
  heap: Map<string, Lua_Table>;
  registry: Map<string, Lua_Object>;
  visual: Lua_Visualzer;
}) {
  const visualEnvironmentRef = useRef<Map<string, HTMLElement>>(new Map());
  const scrollRefs = useRef<Map<string, HTMLElement>>(new Map());
  const visualPointersRef = useRef<Map<string, string>>(new Map());
  const parentRef = useRef<HTMLDivElement | null>(null);
  //const layoutRef = useRef<ReturnType<typeof rasterize> | null>(null);
  const lineRef = useRef<SVGSVGElement>(null);
  const currentHover = useRef<[string, string]>(['', '']);

  const highlighted = useMemo(() => {
    let HighlightedSet: Set<string> = new Set();
    if (visual.clearIndexingVisuals) {
      //console.log('clear');
      HighlightedSet.clear();
    }
    if (visual.indexingVisual && visual.indexingVisual.length > 0) {
      for (let indexedVisual of visual.indexingVisual) {
        let s = HighlightedSet;
        if (indexedVisual.val) {
          s.add(indexedVisual.val.valId);
        }
        if (indexedVisual.idexer) {
          s.add(indexedVisual.idexer.valId);
        }
      }
    } else {
      if (HighlightedSet.size > 0) {
        HighlightedSet.clear();
      }
    }
    return HighlightedSet;
  }, [visual]);
  useMemo(() => {
    visualEnvironmentRef.current = new Map();
  }, [heap, env, currentIdx]);

  function updateVIsuals() {
    if (lineRef.current === null) return;
    Array.from(lineRef!.current!.children).forEach((child) => {
      lineRef!.current!.removeChild(child);
    });

    let indexed = (visual.indexingVisual || [])
      .map((i) => {
        let rect1 = visualEnvironmentRef.current
          .get(i.idexer?.valId || '')
          ?.getBoundingClientRect();

        let rect2 = visualEnvironmentRef.current
          .get(i.val?.valId || '')
          ?.getBoundingClientRect();

        if (rect1 === undefined || rect2 === undefined) return null;

        let x: [[DOMRect, DOMRect], [string, string]] = [
          [rect1, rect2],
          [i.idexer!.valId, i.val!.valId],
        ];
        return x;
      })
      .filter((pr) => !!pr);

    let pairedRects = [...visualPointersRef.current.entries()]
      .map(([rect1id, rect2id]) => {
        let rect1 = visualEnvironmentRef.current
          .get(rect1id)
          ?.getBoundingClientRect();

        let rect2 = visualEnvironmentRef.current
          .get(rect2id)
          ?.getBoundingClientRect();

        if (rect1 === undefined || rect2 === undefined) return null;

        let x: [[DOMRect, DOMRect], [string, string]] = [
          [rect1, rect2],
          [rect1id, rect2id],
        ];
        return x;
      })
      .filter((pr) => !!pr);
    pairedRects = pairedRects.concat(indexed);

    let parentRefRect = parentRef.current?.getBoundingClientRect();
    if (!parentRefRect)
      throw new Error('parent ref does not exist visualize execution');
    const newlayout = rasterize({
      ref: visualEnvironmentRef,
      parentRef: parentRefRect,
    });
    //layoutRef.current = newlayout;

    //drawCellsSVG(newlayout, svgRef.current);
    //console.log('layout', newlayout);
    //    layoutRef.current = newlayout;

    let i = 0;
    for (let [[rect1, rect2], [rect1Id, rect2Id]] of pairedRects) {
      let linetype: keyof typeof Lines = 'primary';
      if (i > 0) linetype = 'secondary';
      if (visualPointersRef.current.has(rect1Id)) {
        linetype = 'pointer';
      }
      const scrollRef = scrollRefs.current.get(`scroll-${rect2Id}`);
      if (scrollRef !== undefined) {
        console.log('scrollref?');
        const scrollRect = scrollRef.getBoundingClientRect();
        if (!isHorizontallyVisible(scrollRect, rect2)) {
          continue;
        }

        if (linetype === 'pointer') {
          console.log('this one is a pointer');
        }
      }

      pathFind(
        newlayout,
        currentHover,
        lineRef.current!,
        rect1,
        rect2,
        rect1Id,
        rect2Id,
        parentRefRect,
        linetype,
      );
      i++;
    }
  }

  useLayoutEffect(() => {
    updateVIsuals();
  }, [env, heap, currentIdx, visual, lineRef.current, currentHover]);

  return (
    <div className='w-full flex flex-col relative' ref={parentRef}>
      <div>{visual.nestedLoopCount}⚙</div>
      <div className='w-full flex flex-row justify-between relative'>
        <VisulizeEnvironment
          env={env}
          ref={visualEnvironmentRef}
          pointerRef={visualPointersRef}
          highlighted={highlighted}
          setHovered={(val: [string, string]) => {
            currentHover.current = val;
            updateVIsuals();
          }}
        />
        <VisulizeHeap
          heap={heap}
          env={env}
          scrollRefs={scrollRefs}
          ref={visualEnvironmentRef}
          pointerRef={visualPointersRef}
          setHovered={(val: [string, string]) => {
            currentHover.current = val;
            updateVIsuals();
          }}
          highlighted={highlighted}
        />
      </div>

      <svg
        id='line-layer'
        ref={lineRef}
        width='100%'
        height='100%'
        preserveAspectRatio='none'
        className='absolute top-0 left-0 w-full h-full pointer-events-none'
      />

      <VisualizeMoment registry={registry} visual={visual} heap={heap} />
    </div>
  );
}

function VisualizeMoment({
  heap,
  registry,
  visual,
}: {
  heap: Map<string, Lua_Table>;
  registry: Map<string, Lua_Object>;
  visual: Lua_Visualzer;
}) {
  if (
    visual.expresion !== undefined &&
    visual.expresion.binaryExpression !== undefined
  ) {
    return (
      <div className='absolute w-[100%] h-[100%] flex items-center justify-center'>
        <PixelOperation
          left={registry.get(visual.expresion.binaryExpression.left.id)!}
          operation={visual.expresion.binaryExpression.operation.op}
          right={registry.get(visual.expresion.binaryExpression.right.id)!}
          value={registry.get(visual.expresion.binaryExpression.val.id)!}
        />
      </div>
    );
  } else if (
    visual.expresion !== undefined &&
    visual.expresion.unaryExpression !== undefined
  ) {
    let currArg = registry.get(visual.expresion.unaryExpression.arg.id)!;
    if ((currArg as any).refId) {
      currArg = heap.get((currArg as any).refId)!;
    }
    let currValue = registry.get(visual.expresion.unaryExpression.val.id)!;

    return (
      <div className='absolute w-[100%] h-[100%] flex items-center justify-center'>
        <PixelUnaryOperation
          arg={currArg}
          operation={visual.expresion.unaryExpression.operation.op}
          value={currValue}
        />
      </div>
    );
  } else if (visual.visualStatement?.return) {
    let values: Lua_Object[] = visual.visualStatement.return.vals.map(
      (id) => registry.get(id)!,
    );
    return (
      <div className='absolute w-[100%] h-[100%] flex items-center justify-center'>
        <PixelReturn values={values} />
      </div>
    );
  } else if (visual.visualStatement?.assigment) {
    let values: Lua_Object[] = visual.visualStatement.assigment.valsId.map(
      (id) => registry.get(id)!,
    );
    let names: string[] = visual.visualStatement.assigment.variables;

    console.log(values);
    return (
      <div className='absolute w-[100%] h-[100%] flex items-center justify-center'>
        <PixelAssigment names={names} values={values} />
      </div>
    );
  } else {
    return null;
  }
}
function VisulizeHeap({
  heap,
  env,
  ref,
  highlighted,
  setHovered,
  pointerRef,
  scrollRefs,
}: {
  heap: Map<string, Lua_Table>;
  highlighted: Set<string>;
  env: Lua_Table;
  ref: React.RefObject<Map<string, HTMLElement>>;
  scrollRefs: React.RefObject<Map<string, HTMLElement>>;
  setHovered: (val: [string, string]) => void;
  pointerRef: React.RefObject<Map<string, string>>;
}) {
  let rc = [...heap.entries()]
    .map(([key, table], index) => {
      if (table.hidden) return null;
      if (env.id === table.id) return null;
      if (ref.current.has(table.id)) return null;
      return (
        <div key={`${key}-${index}`} className='w-fit'>
          <PixelTable
            table={table}
            ref={ref}
            scrollRefs={scrollRefs}
            highlighted={highlighted}
            pointerRef={pointerRef}
            setHovered={setHovered}
          />
        </div>
      );
    })
    .filter((i) => i !== null);
  return (
    <div className='flex flex-col gap-y-10 w-1/2'>
      <div
        ref={(el) => {
          el && ref.current.set('+_CurrHeap', el);
        }}
      >
        Heap:
      </div>
      {rc}
    </div>
  );
}

function VisulizeEnvironment({
  env,
  ref,
  highlighted,
  pointerRef,
  setHovered,
}: {
  env: Lua_Table;
  highlighted: Set<string>;
  setHovered: (val: [string, string]) => void;
  pointerRef: React.RefObject<Map<string, string>>;
  ref: React.RefObject<Map<string, HTMLElement>>;
}) {
  //let rc: ReactNode[] = [];

  //globalEnv++;
  //
  //let outter = env.climbEnv(1);
  //if (outter.kind !== 'error' && outter.id !== env.id) {
  //  rc.push(VisulizeEnvironment({ env: outter, ref: ref }));
  //}

  let curr: ReactNode[] = [...env.store.entries()].map(([identifier, obj]) => {
    let identiferString = '';
    if (typeof identifier !== 'object') {
      identiferString = String(identifier);
    } else {
      identiferString = identifier.id;
    }

    if (obj.hidden) return null;
    if (obj.id === env.id) return null;

    switch (obj.kind) {
      case 'string':
      case 'number':
      case 'null':
      case 'boolean': {
        return (
          <div
            key={identiferString + obj.id}
            className='w-fit'
            ref={(el) => {
              //     el && ref.current.set(identiferString, el);
              el && ref.current.set(obj.id, el);
            }}
          >
            <PixelVariable
              name={identiferString}
              value={obj}
              skipObj={false}
              isHighlighted={highlighted.has(obj.id)}
            />
          </div>
        );
      }
      case 'table':
      case 'function': {
        return (
          <div
            key={`${obj.id}-${identiferString}`}
            className='w-fit'
            onMouseEnter={() => {
              //console.log('hover');
              setHovered([`${obj.id}-${identiferString}`, obj.id]);
            }}
            onMouseLeave={() => {
              setHovered(['', '']);
            }}
            ref={(el) => {
              el && ref.current.set(`${obj.id}-${identiferString}`, el);
              el &&
                pointerRef.current.set(`${obj.id}-${identiferString}`, obj.id);
            }}
          >
            <PixelVariable
              name={identiferString}
              value={obj}
              equalSign={false}
              skipObj={true}
              isHighlighted={highlighted.has(obj.id)}
            />
          </div>
        );
      }
      case 'error':
      case 'builtin':
      case 'return':
    }
  });
  //globalEnv--;

  return (
    <div className='flex flex-col gap-y-10 w-1/2'>
      <div
        ref={(el) => {
          el && ref.current.set('+_CurrEnv', el);
        }}
      >
        Current Environment:
      </div>
      {curr}
    </div>
  );
}

class TreeNode {
  public id: number = 0;
  public name: string = '';
  public children: TreeNode[] = [];
}

function NAryTree({
  visualStack,
  currentIdx,
}: {
  visualStack: { visual: Lua_Visualzer }[];
  currentIdx?: number;
}) {
  let root: TreeNode | null = new TreeNode();
  let currentTree = 0;
  root.name = visualStack.at(0)?.visual?.name || '';
  const stack = [root];

  for (let i = 1; i < visualStack.length; i++) {
    let ev = visualStack[i];
    if (ev.visual.type && ev.visual.type === 'NEW') {
      const node = {
        id: i,
        name: ev.visual.name || 'should have a name',
        children: [],
      } satisfies TreeNode;

      stack[stack.length - 1].children!.push(node);
      stack.push(node);
    } else if (ev.visual.type && ev.visual.type === 'EXIT') {
      stack.pop();
    }
    if (currentIdx === i) {
      currentTree = stack[stack.length - 1].id;
    }
  }

  return (
    <div className='w-full min-h-[50vh]  py-6 flex justify-center'>
      <style>{css}</style>
      <Node
        node={root}
        depth={0}
        currentId={currentTree}
        onCurrentClick={() => {}}
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
  node: TreeNode;
  depth: number;
  currentId?: number;
  onCurrentClick: (node: TreeNode) => void;
}) {
  if (node === null) return;
  const kids = node.children?.length ? node.children : [];
  const isCurrent = currentId === node.id;

  return (
    <div className='inline-flex flex-col items-center relative '>
      {/* Card */}
      <button
        type='button'
        onClick={() => onCurrentClick(node)}
        className={[
          'bg-slate-800 border-slate-700 text-slate-100 p-4',
          isCurrent
            ? 'ring-4 ring-indigo-500/50 shadow-indigo-700/30'
            : 'hover:bg-slate-750/50',
        ].join(' ')}
        style={{
          //TODO in tailwind
          border: '10px solid transparent',
          //borderImage: `url(${squareBorderImage}) 26 round`,
        }}
        aria-current={isCurrent || undefined}
        data-node-id={node.id}
      >
        <div className='text-sm font-semibold truncate max-w-[140px]'>
          {node.name}
        </div>
        {/*<div className='text-[10px] text-slate-400'>depth {depth}</div>*/}
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

export function printGrid(grid: cell[][]) {
  const lines = grid.map((row) =>
    row
      .map((cell) => {
        if (cell.start) return 'S'; // start
        if (cell.end) return 'E'; // end
        if (cell.occupied) return 'X'; // occupied
        return 'O'; // open
      })
      .join(' '),
  );
  return lines.join('\n');
}

export function rasterize({
  ref,
  parentRef,
}: {
  ref: React.RefObject<Map<string, HTMLElement>>;
  parentRef: DOMRect;
}): cell[][] {
  let topLeft = { x: parentRef.left, y: parentRef.top };
  let bottomRight = { x: parentRef.right, y: parentRef.bottom };

  let rows = Math.ceil(Math.abs((topLeft.y - bottomRight.y) / PIXEL_WIDTH));
  let cols = Math.ceil(Math.abs((topLeft.x - bottomRight.x) / PIXEL_WIDTH));

  let grid: cell[][] = [];
  let rects = [...ref.current.entries()].map(([id, el]) => {
    const r = el.getBoundingClientRect();
    const rect: cell = {
      id: id,
      left: r.left - parentRef.left - PIXEL_WIDTH,
      right: r.right - parentRef.left + PIXEL_WIDTH,
      top: r.top - parentRef.top - PIXEL_WIDTH,
      bottom: r.bottom - parentRef.top + PIXEL_WIDTH,
      occupied: true,
      start: false,
      end: false,
      softOccupied: 0,
    };
    return rect;
  });

  let rectOverlapTop: Map<string, cell[]> = new Map();
  let rectOverlapBottom: Map<string, cell[]> = new Map();

  for (let r = 0; r < rows; r++) {
    let cellRow: cell[] = [];
    for (let c = 0; c < cols; c++) {
      let newCell: cell = {
        left: c * PIXEL_WIDTH,
        right: (c + 1) * PIXEL_WIDTH,
        top: r * PIXEL_WIDTH,
        bottom: (r + 1) * PIXEL_WIDTH,
        occupied: false,
        softOccupied: 0,
        start: false,
        end: false,
      };
      for (let rect of rects) {
        const horizontalOverlap = !(
          newCell.right <= rect.left || newCell.left >= rect.right
        );
        const verticalOverlap = !(
          newCell.bottom <= rect.top || newCell.top >= rect.bottom
        );

        const overlaps = horizontalOverlap && verticalOverlap;
        const overlappedTop =
          overlaps && newCell.top <= rect.top && newCell.bottom >= rect.top; // touching/overlapping rect’s top

        const overlappedBottom =
          overlaps &&
          newCell.top <= rect.bottom &&
          newCell.bottom >= rect.bottom; // touching/overlapping rect’s bottom
        //if (overlaps) console.log('we overlap boi');

        if (overlaps) {
          newCell.occupied = true;

          if (overlappedTop) {
            if (!rectOverlapTop.has(rect.id!)) {
              rectOverlapTop.set(rect.id!, [newCell])!;
            } else {
              let top = rectOverlapTop.get(rect.id!)!;
              top.push(newCell);
            }
          }

          if (overlappedBottom) {
            if (!rectOverlapBottom.has(rect.id!)) {
              rectOverlapBottom.set(rect.id!, [newCell])!;
            } else {
              let top = rectOverlapBottom.get(rect.id!)!;
              top.push(newCell);
            }
          }
          //      newCell.id = rect.id;
          //     newCell.id = rect.id;
        }
      }
      cellRow.push(newCell);
    }
    grid.push(cellRow);
  }

  [...rectOverlapTop.entries(), ...rectOverlapBottom.entries()].forEach(
    ([id, cells]) => {
      if (cells.length !== 0) {
        let c = cells.at(Math.floor((cells.length - 1) / 2));
        if (c) c.id = id;
      }
    },
  );

  //console.log(grid.slice(10))
  //console.log(printGrid(grid.slice(10)));

  return grid;
}

export function old_rasterize({
  ref,
  parentRef,
}: {
  ref: React.RefObject<Map<string, HTMLElement>>;
  parentRef: DOMRect;
}): cell[][] {
  if (!ref.current) throw new Error('ref is empty');
  if (!parentRef) throw new Error('parentRef is missing');
  const margin = 4;
  const xLines = new Set<number>();
  const yLines = new Set<number>();
  const rects: {
    top: number;
    left: number;
    id: string;
    right: number;
    bottom: number;
  }[] = [];

  // Collect element bounds (normalized to parent)
  for (const [id, el] of ref.current.entries()) {
    const r = el.getBoundingClientRect();

    const rect = {
      id: id,
      left: r.left - parentRef.left - margin,
      right: r.right - parentRef.left + margin,
      top: r.top - parentRef.top - margin,
      bottom: r.bottom - parentRef.top,
    };

    rects.push(rect);
    xLines.add(rect.left);
    xLines.add(rect.right);
    yLines.add(rect.top);
    yLines.add(rect.bottom);
  }

  // Sort grid lines
  const xSorted = Array.from(xLines).sort((a, b) => a - b);
  const ySorted = Array.from(yLines).sort((a, b) => a - b);

  // Build cells
  const grid: cell[][] = [];

  for (let j = 0; j < ySorted.length - 1; j++) {
    const row: cell[] = [];
    for (let i = 0; i < xSorted.length - 1; i++) {
      const cell: cell = {
        left: xSorted[i],

        softOccupied: 0,
        right: xSorted[i + 1],
        top: ySorted[j],
        bottom: ySorted[j + 1],
        occupied: false,
        start: false,
        end: false,
      };

      //  Check if cell overlaps any element
      for (const rect of rects) {
        const horizontalOverlap = !(
          cell.right <= rect.left || cell.left >= rect.right
        );
        const verticalOverlap = !(
          cell.bottom <= rect.top || cell.top >= rect.bottom
        );

        const overlaps = horizontalOverlap && verticalOverlap;
        const overlappedTopOrBottom =
          overlaps &&
          ((cell.top <= rect.top && cell.bottom >= rect.top) || // touching/overlapping rect’s top
            (cell.top <= rect.bottom && cell.bottom >= rect.bottom)); // touching/overlapping rect’s bottom

        if (overlaps) {
          cell.occupied = true;

          if (overlappedTopOrBottom) {
            cell.id = rect.id;
            cell.id = rect.id;
          }
          break;
        }
      }

      row.push(cell);
    }
    grid.push(row);
  }

  return grid;
}

export function highlightRect(rect: DOMRect) {
  const div = document.createElement('div');
  Object.assign(div.style, {
    position: 'absolute',
    left: rect.left + 'px',
    top: rect.top + 'px',
    width: rect.width + 'px',
    height: rect.height + 'px',
    background: 'rgba(255, 255, 0, 0.3)',
    pointerEvents: 'none',
    zIndex: 9999,
  });
  document.body.appendChild(div);
}

function pathFind(
  grid: cell[][],
  hovered: React.RefObject<[string, string]>,
  lineRef: SVGSVGElement,
  _rect1: DOMRect,
  rect2: DOMRect,
  rect1Id: string,
  rect2Id: string,
  parentRef: DOMRect,
  lineType: keyof typeof Lines,
) {
  console.log('we pathfinding bois');

  const makeCellToAcell = (c: cell, p: Point): Acell => {
    return {
      h: 0,
      softOccupied: c.softOccupied,
      parent: null,
      g: 0,
      f: 0,
      i: p.i,
      j: p.j,
      occupied: c.occupied,
      id: c.id,
    };
  };

  let openList = new Heap<Acell>((a, b) => a.f - b.f);
  //highlightRect(rect2);
  type Point = { i: number; j: number };
  // TODO busca una forma de hacer esto mejor y ma bacano
  //  set starting points
  let startingNodes: Acell[] = [];
  let endNodes: Acell[] = [];
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (grid[i][j].id === rect1Id) {
        grid[i][j].start = true;
        grid[i][j].occupied = false;

        let startNode = makeCellToAcell(grid[i][j], { i, j });
        startingNodes.push(startNode);
      } else if (grid[i][j].id === rect2Id) {
        grid[i][j].end = true;

        grid[i][j].occupied = false;

        let endNode = makeCellToAcell(grid[i][j], { i, j });
        endNodes.push(endNode);
      }
    }
  }

  const calculateHeuristic = (s: Acell, e: Acell) => {
    return Math.abs(s.i - e.i) + Math.abs(s.j - e.j);
  };
  const calculateHeuristicMultipleEnd = (s: Acell, ends: Acell[]) => {
    return Math.min(...ends.map((e) => calculateHeuristic(s, e)));
  };

  startingNodes.forEach((n) => {
    n.g = 0;
    n.h = calculateHeuristicMultipleEnd(n, endNodes);
    n.f = n.g + n.h;
    openList.push(n);
  });

  type Acell = {
    parent: null | Acell;
    i: number;
    j: number;
    g: number;
    h: number;
    f: number;
    occupied: boolean;
    softOccupied: number;
    id?: string;
  };

  //
  // -------- A*   <--- clerance based THISI IS NOT TRUE I THINK

  // adding more radious to softOccupied

  function isValid(c: Acell | Point) {
    if (c.i < 0 || c.j < 0 || c.i >= grid.length || c.j >= grid[0].length)
      return false;
    if (grid[c.i][c.j].occupied) return false;
    return true;
  }

  function radiateSoftOccupied(i: number, j: number) {
    const radius = 2;

    grid[i][j].softOccupied += radius;
    const directions = [
      { i: 1, j: 0 },
      { i: -1, j: 0 },
      { i: 0, j: 1 },
      { i: 0, j: -1 },
    ];
    for (let dir of directions) {
      let x = { i: i + dir.i, j: j + dir.j };
      for (let i = radius; i > 0; i--) {
        if (isValid(x)) {
          grid[x.i][x.j].softOccupied += i;
        }
        x.i += dir.i;
        x.j += dir.j;
      }
    }
    isValid({ i: i, j: j });
  }

  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[0].length; j++) {
      if (grid[i][j].isArrow) {
        radiateSoftOccupied(i, j);
      }
    }
  }

  if (startingNodes.length === 0 || endNodes.length === 0) {
    console.log('IS NO STARTING NODES');
    return;
    //throw new Error(
    //  (startingNodes.length === 0 &&
    //    'No starting nodes' +
    //      ((endNodes.length === 0 && 'NO endingNodes') || '')) ||
    //    '',
    //);
  }

  let openDict: Map<string, Acell> = new Map();
  let closedSet: Set<string> = new Set();

  let directions: Point[] = [
    { i: 1, j: 0 },
    { i: 0, j: 1 },
    { i: -1, j: 0 },
    { i: 0, j: -1 },
  ];
  const getValidNeighbors = (c: Acell) =>
    directions
      .map((p) => {
        return { i: c.i + p.i, j: c.j + p.j } satisfies Point;
      })
      .filter(isValid)
      .map((p) => makeCellToAcell(grid[p.i][p.j], p));

  const reconstructPath = (c: Acell) => {
    let path: Acell[] = [];
    while (c.parent !== null) {
      path.push(c);
      c = c.parent;
    }
    return path.reverse();
  };

  let path: Acell[] = [];

  while (openList.size > 0) {
    let currNode = openList.pop()!;
    //let currNode = _key;

    // is goal
    if (currNode.id === rect2Id) {
      path = reconstructPath(currNode);
      break;
    }
    closedSet.add(`${currNode.i}-${currNode.j}`);
    let validNeighbors = getValidNeighbors(currNode);

    let parent = currNode.parent;
    let currentDirection = { i: 0, j: 0 };
    if (parent) {
      currentDirection = { i: currNode.i - parent.i, j: currNode.j - parent.j };
    }
    for (let n of validNeighbors) {
      if (closedSet.has(`${n.i}-${n.j}`)) continue;

      let directionPenalty = 0;
      let newDirection = { i: n.i - currNode.i, j: n.j - currNode.j };

      if (
        newDirection.i - currentDirection.i !== 0 ||
        newDirection.j - currentDirection.j !== 0
      ) {
        directionPenalty = 2;
      }
      let softOccupiedPenalty = n.softOccupied * 2;

      const tentativeG =
        currNode.g + 1 + directionPenalty + softOccupiedPenalty;
      n.h = calculateHeuristicMultipleEnd(n, endNodes);
      n.f = n.g + n.h;

      if (!openDict.has(`${n.i}-${n.j}`)) {
        n.g = tentativeG;
        n.h = calculateHeuristicMultipleEnd(n, endNodes);
        n.f = n.g + n.h;
        n.parent = currNode;
        openList.push(n);
        openDict.set(`${n.i}-${n.j}`, n);
      } else if (tentativeG < openDict.get(`${n.i}-${n.j}`)!.g) {
        n.g = tentativeG;
        n.f = tentativeG + n.h * 1.001;
        n.parent = currNode;
      }
    }
  }

  // A* end
  //
  let pend = ``;
  let lastXY = { x: -1, y: -1 };
  let blastXY = { x: -1, y: -1 };
  let svg_path = path
    .map(({ i, j }, idx) => {
      let curr_cell = grid[i][j];

      let x = curr_cell.left + rect2.x / 2 / (path.length + 2);
      let y = curr_cell.top;

      if (idx === 0) return `M${x} ${y}`;

      curr_cell.isArrow = true;
      if (path.length - idx <= 10) {
        //curr_cell.occupied = false;
      }
      if (idx === path.length - 2) {
        blastXY = { x, y };
        pend = `M${x} ${y}`;
      }
      if (idx === path.length - 1) {
        lastXY = { x, y };
        pend += `L${x} ${y}`;
        return `L${x} ${y}`;
      }

      return `L${x} ${y}`;
    })
    .join(' ');

  // remove that is start
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (grid[i][j].id === rect1Id) {
        grid[i][j].start = false;
        grid[i][j].occupied = true;
      } else if (grid[i][j].id === rect2Id) {
        grid[i][j].end = false;
        grid[i][j].occupied = true;
      }
    }
  }

  //let plast = path.at(-2)!;
  //let last = path.at(-1)!;

  drawArrow(
    hovered,
    lineRef,
    svg_path,
    lineType,
    pend,
    [blastXY, lastXY],
    rect1Id,
    rect2Id,
    parentRef,
  );
}

function drawArrow(
  hovered: React.RefObject<[string, string]>,
  lineRef: SVGSVGElement,
  svg_path: string,
  lineType: keyof typeof Lines,
  _pend: string,
  lastOnes: { x: number; y: number }[],
  rect1id: string,
  _rect2id: string,
  _parentRef: DOMRect,
) {
  //console.log('we drawing bois');
  //Clear previous drawings

  // remove all children except <defs>
  //Array.from(svg.children).forEach((child) => {
  //  if (child.tagName !== 'defs') svg.removeChild(child);
  //});

  const svgNS = 'http://www.w3.org/2000/svg';
  const color = Lines[lineType].color;
  const group = document.createElementNS(svgNS, 'g');
  group.classList.add('arrow-group');
  group.classList.add(lineType);

  // Path (the actual arrow)
  const path = document.createElementNS(svgNS, 'path');
  lineRef.setAttribute(
    'viewBox',
    `0 0 ${lineRef.clientWidth} ${lineRef.clientHeight}`,
  );
  lineRef.setAttribute('preserveAspectRatio', 'none');
  path.setAttribute('d', svg_path);
  if (lineType === 'pointer' && hovered.current[0] === rect1id) {
    path.setAttribute('stroke', Lines[lineType].colorHover);
  } else {
    path.setAttribute('stroke', color);
  }
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  path.setAttribute('stroke-width', '4');
  path.setAttribute('stroke-width', '4');
  path.setAttribute('stroke-dasharray', Lines[lineType].strokeDasharray || '');

  const size = 20; // size of the triangle

  const sy = lastOnes[0].y;
  const ex = lastOnes[1].x;
  let ey = lastOnes[1].y;

  const dy = ey - sy;
  let direction: 'up' | 'down' | 'left' | 'right';
  direction = dy > 0 ? 'down' : 'up';

  let d = '';
  switch (direction) {
    case 'up':
      ey += size;
      d = `M${ex} ${ey - size} L${ex - size / 2} ${ey + size / 2} L${ex + size / 2} ${ey + size / 2} Z`;
      break;
    case 'down':
      ey -= size;
      d = `M${ex} ${ey + size} L${ex - size / 2} ${ey - size / 2} L${ex + size / 2} ${ey - size / 2} Z`;
      break;
  }

  path.classList.add(lineType);
  group.appendChild(path);

  const arrowHead = document.createElementNS(svgNS, 'path');

  arrowHead.setAttribute('d', d);
  arrowHead.setAttribute('fill', 'none');
  arrowHead.setAttribute('stroke', color);

  if (lineType === 'pointer' && hovered.current[0] === rect1id) {
    arrowHead.setAttribute('stroke', Lines[lineType].colorHover);
  } else {
    arrowHead.setAttribute('stroke', color);
  }

  arrowHead.setAttribute('stroke-width', '4');

  group.appendChild(arrowHead);
  //
  //drawBoxOverlay(group, rect1, parentRef, '#00000000');
  //drawBoxOverlay(group, rect2, parentRef, '#00000000');

  lineRef.appendChild(group);

  //const arrowPath = document.createElementNS(svgNS, 'path');
  //arrowPath.setAttribute('d', pend); // tiny line, just to host the marker
  //arrowPath.setAttribute('stroke', color);
  //arrowPath.setAttribute('stroke-width', '4');
  //arrowPath.setAttribute('fill', 'none');
  //arrowPath.setAttribute('marker-end', `url(#${ArrowHead[lineType].id})`);
  //arrowPath.classList.add(lineType);
  //
  //arrowRef.appendChild(arrowPath);

  // Draw rect boxes
}

void appendRectBox;

export function drawBoxOverlay(
  svg: SVGElement,
  rect: DOMRect,
  parent: DOMRect,
  color = 'rgba(0, 0, 255, 0.2)',
) {
  const svgNS = 'http://www.w3.org/2000/svg';

  const x1 = rect.left - parent.left;
  const y1 = rect.top - parent.top;
  const x2 = rect.right - parent.left;
  const y2 = rect.bottom - parent.top;

  // path for a rectangle: M -> L -> L -> L -> Z
  const d = `M${x1} ${y1} L${x2} ${y1} L${x2} ${y2} L${x1} ${y2} Z`;

  const path = document.createElementNS(svgNS, 'path');
  path.classList.add('box');
  path.setAttribute('d', d);
  path.setAttribute('fill', color);
  path.setAttribute('stroke', color);
  path.setAttribute('stroke-width', '0');
  //  path.style.pointerEvents = 'visibleFill'; // so hover triggers inside

  svg.appendChild(path);
  return path;
}

function appendRectBox(
  svg: SVGElement,
  rect: DOMRect,
  parentRef: DOMRect,
  _color: string,
) {
  const svgNS = 'http://www.w3.org/2000/svg';

  const makeLine = (x1: number, y1: number, x2: number, y2: number) => {
    const line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', String(x1 - parentRef.x));
    line.setAttribute('y1', String(y1 - parentRef.y));
    line.setAttribute('x2', String(x2 - parentRef.x));
    line.setAttribute('y2', String(y2 - parentRef.y));
    line.setAttribute('stroke', 'blue');
    line.setAttribute('fill', 'blue');
    line.setAttribute('stroke-width', '4');
    svg.appendChild(line);
  };

  makeLine(rect.x, rect.y, rect.x, rect.bottom);
  makeLine(rect.right, rect.y, rect.right, rect.bottom);
  makeLine(rect.left, rect.y, rect.right, rect.y);
  makeLine(rect.left, rect.bottom, rect.right, rect.bottom);
}

export function drawCellsSVG(grid: cell[][], parent: SVGSVGElement) {
  if (!parent) return;

  const svgNS = 'http://www.w3.org/2000/svg';

  //Remove previous debug cells (keep defs/arrowheads)
  Array.from(parent.querySelectorAll('.debug-cell')).forEach((el) =>
    el.remove(),
  );

  for (const row of grid) {
    for (const c of row) {
      const rect = document.createElementNS(svgNS, 'rect');
      rect.classList.add('debug-cell');

      rect.setAttribute('x', String(c.left));
      rect.setAttribute('y', String(c.top));
      rect.setAttribute('width', String(c.right - c.left));
      rect.setAttribute('height', String(c.bottom - c.top));

      // Fill occupied cells yellow, empty transparent
      if (c.occupied) {
        rect.setAttribute('fill', 'rgba(255, 255, 0, 0.4)');
        rect.setAttribute('stroke', 'orange');
      } else {
        rect.setAttribute('fill', 'none');
        rect.setAttribute('stroke', 'blue');
      }

      rect.setAttribute('stroke-width', '0.5');
      parent.appendChild(rect);
    }
  }
}
function isHorizontallyVisible(
  containerRect: DOMRect,
  itemRect: DOMRect,
  fullyVisible = false,
) {
  if (fullyVisible) {
    return (
      itemRect.left >= containerRect.left &&
      itemRect.right <= containerRect.right
    );
  }

  // partially visible
  return (
    itemRect.right > containerRect.left && itemRect.left < containerRect.right
  );
}
