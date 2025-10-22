import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { trpc } from '../lib/trpc';
import { Button } from './ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import {
  Lua_Null,
  Lua_Table,
} from '@busytutor/server/src/interperter/lua_types';
import type { Lua_Visualzer } from '@busytutor/server/src/interperter/lua_types';
import { MinHeap } from 'datastructures-js';
import { reviver, revive_heap } from '../utils/jsonParser';
import { PixelTable, PixelVariable } from './PixelArt';

//const VIUAL_PARENT_ID = '.%!@#PARENT';
const ArrowHead = {
  primary: { id: 'arrowhead-primary', color: '#4c6ef5' },
  secondary: { id: 'arrowhead-secondary', color: '#6c5ce7' },
};
const Lines = {
  primary: { color: '#4c6ef5' },
  secondary: { color: '#6c5ce7' },
};

export function LuaVisualizer({ id }: { id: string }) {
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
    return flatData.map((d) => {
      let refs = JSON.parse(d.currEnv, reviver) as { refid: string };
      let heap = revive_heap(JSON.parse(d.heap) as Record<string, any>);
      let currEnv = heap.get(refs.refid);
      if (!currEnv) {
        throw new Error('Lua_Table should exist');
      }

      return {
        visual: JSON.parse(d.visual) as Lua_Visualzer,
        currEnv,
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
            onClick={() => setCurrentOnStack(Math.max(currentOnStack - 1, 0))}
          >
            <ArrowLeft />
          </Button>
          <Button
            variant='outline'
            onClick={() => {
              setCurrentOnStack(
                Math.min(currentOnStack + 1, timeline.length - 1),
              );
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
    <div>
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
  start: boolean;
  end: boolean;
};

//let globalEnv = 0;
function VisualizeExecution({
  env,
  heap,
  currentIdx,
  visual,
}: {
  env: Lua_Table;
  currentIdx: number;
  heap: Map<string, Lua_Table>;
  visual: Lua_Visualzer;
}) {
  const visualEnvironmentRef = useRef<Map<string, HTMLElement>>(new Map());
  const parentRef = useRef<HTMLDivElement | null>(null);
  const layoutRef = useRef<ReturnType<typeof rasterize> | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const highlighted = useMemo(() => {
    let HighlightedSet: Set<string> = new Set();
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

  useLayoutEffect(() => {
    console.log(visual);
    if (svgRef === null || !svgRef.current) return;

    Array.from(svgRef.current.children).forEach((child) => {
      if (child.tagName !== 'defs') svgRef!.current!.removeChild(child);
    });
    if (!visual.indexingVisual || visual.indexingVisual.length === 0) {
      return;
    }
    const pairedRects = visual.indexingVisual
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

    let parentRefRect = parentRef.current?.getBoundingClientRect();
    if (!parentRefRect)
      throw new Error('parent ref does not exist visualize execution');
    const newlayout = rasterize({
      ref: visualEnvironmentRef,
      parentRef: parentRefRect,
    });
    layoutRef.current = newlayout;

    //drawCellsSVG(newlayout, svgRef.current);
    //console.log('layout', newlayout);
    //    layoutRef.current = newlayout;
    let i = 0;
    for (let [[rect1, rect2], [rect1Id, rect2Id]] of pairedRects) {
      pathFind(
        newlayout,
        svgRef.current,
        rect1,
        rect2,
        rect1Id,
        rect2Id,
        parentRefRect,
        i === 0 ? 'primary' : 'secondary',
      );
      i++;
    }
  }, [env, heap, currentIdx, visual, svgRef.current]);

  return (
    <div
      className='w-full flex flex-row justify-between relative'
      ref={parentRef}
    >
      <svg
        ref={svgRef}
        width='100%'
        height='100%'
        preserveAspectRatio='none'
        className='absolute top-0 left-0 w-full h-full pointer-events-none'
      >
        <defs>
          <marker
            id={ArrowHead.primary.id}
            markerWidth='10'
            markerHeight='10'
            refX='8'
            refY='4'
            orient='auto-start-reverse'
            markerUnits='strokeWidth'
          >
            <path d='M0,0 L10,5 L0,10 Z' fill={`${ArrowHead.primary.color}`} />
          </marker>

          <marker
            id={ArrowHead.secondary.id}
            markerWidth='10'
            markerHeight='10'
            refX='8'
            refY='4'
            orient='auto'
            markerUnits='strokeWidth'
          >
            <path d='M0,0 L0,8 L8,4 Z' fill={ArrowHead.secondary.color} />
          </marker>
        </defs>
      </svg>
      <VisulizeEnvironment
        env={env}
        ref={visualEnvironmentRef}
        highlighted={highlighted}
      />
      <VisulizeHeap
        heap={heap}
        env={env}
        ref={visualEnvironmentRef}
        highlighted={highlighted}
      />
    </div>
  );
}
function VisulizeHeap({
  heap,
  env,
  ref,
  highlighted,
}: {
  heap: Map<string, Lua_Table>;
  highlighted: Set<string>;
  env: Lua_Table;
  ref: React.RefObject<Map<string, HTMLElement>>;
}) {
  let rc = [...heap.entries()]
    .map(([key, table], index) => {
      if (table.hidden) return null;
      if (env.id === table.id) return null;
      if (ref.current.has(table.id)) return null;
      return (
        <div key={`${key}-${index}`} className='w-fit'>
          <PixelTable table={table} ref={ref} highlighted={highlighted} />
        </div>
      );
    })
    .filter((i) => i !== null);
  return (
    <div className='flex flex-col gap-y-10'>
      <div>Heap:</div>
      {rc}
    </div>
  );
}

function VisulizeEnvironment({
  env,
  ref,
  highlighted,
}: {
  env: Lua_Table;
  highlighted: Set<string>;
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
            ref={(el) => {
              el && ref.current.set(`${obj.id}-${identiferString}`, el);
            }}
          >
            <PixelVariable
              name={identiferString}
              value={obj}
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
    <div className='flex flex-col gap-y-10'>
      <div>Current Environment:</div>
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

export function rasterize({
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

  // --- 1️⃣ Collect element bounds (normalized to parent)
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

  // --- 2️⃣ Sort grid lines
  const xSorted = Array.from(xLines).sort((a, b) => a - b);
  const ySorted = Array.from(yLines).sort((a, b) => a - b);

  // --- 3️⃣ Build cells
  const grid: cell[][] = [];

  for (let j = 0; j < ySorted.length - 1; j++) {
    const row: cell[] = [];
    for (let i = 0; i < xSorted.length - 1; i++) {
      const cell: cell = {
        left: xSorted[i],
        right: xSorted[i + 1],
        top: ySorted[j],
        bottom: ySorted[j + 1],
        occupied: false,
        start: false,
        end: false,
      };

      // --- 4️⃣ Check if cell overlaps any element
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
            console.log('top');
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

function highlightRect(rect: DOMRect) {
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
  svg: SVGSVGElement,
  rect1: DOMRect,
  rect2: DOMRect,
  rect1Id: string,
  rect2Id: string,
  parentRef: DOMRect,
  lineType: keyof typeof Lines,
) {
  //highlightRect(rect2);
  type Point = { i: number; j: number };
  let start: Point = { i: -1, j: -1 };
  let end: Point = { i: -1, j: -1 };
  // TODO busca una forma de hacer esto mejor y ma bacano
  //  set starting points
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (grid[i][j].id === rect1Id) {
        if (end.i === -1) start = { i: i, j: j };
        grid[i][j].occupied = false;
        grid[i][j].start = true;
      } else if (grid[i][j].id === rect2Id) {
        if (end.i === -1) end = { i: i, j: j };
        grid[i][j].occupied = false;
        grid[i][j].end = true;
      }
    }
  }

  function printGrid(grid: cell[][]) {
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

  console.log(printGrid(grid));
  console.log('start', start, 'end', end);

  type Acell = {
    parent: null | Acell;
    i: number;
    j: number;
    g: number;
    h: number;
    f: number;
    occupied: boolean;
    id?: string;
  };
  const calculateHeuristic = (s: Acell, e: Acell) => {
    return Math.abs(s.i - e.i) + Math.abs(s.j - e.j);
  };
  const makeCellToAcell = (c: cell, p: Point): Acell => {
    return {
      h: 0,
      parent: null,
      g: 0,
      f: 0,
      i: p.i,
      j: p.j,
      occupied: c.occupied,
      id: c.id,
    };
  };

  // A*
  let startNode = makeCellToAcell(grid[start.i][start.j], start);
  let endNode = makeCellToAcell(grid[end.i][end.j], end);
  startNode.g = 0;
  startNode.h = calculateHeuristic(startNode, endNode);
  startNode.f = startNode.g + startNode.h;

  let openList = new MinHeap<Acell>((c: Acell) => c.f);
  openList.insert(startNode);
  let openDict: Map<string, Acell> = new Map();
  let closedSet: Set<string> = new Set();

  function isValid(c: Acell | Point) {
    if (c.i < 0 || c.j < 0 || c.i >= grid.length || c.j >= grid[0].length)
      return false;
    if (grid[c.i][c.j].occupied) return false;
    return true;
  }
  let directions: Point[] = [
    { i: 1, j: 0 },
    { i: 0, j: 1 },
    { i: -1, j: 0 },
    { i: 0, j: -1 },
  ];
  const getValidNeighbors = (c: Acell) =>
    directions
      .map((p) => {
        return { i: c.i - p.i, j: c.j - p.j } satisfies Point;
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
  while (openList.size() > 0) {
    let { _key } = openList.extractRoot();
    let currNode = _key;

    // is goal
    if (currNode.i === end.i && currNode.j === end.j) {
      path = reconstructPath(currNode);
      break;
    }
    closedSet.add(`${currNode.i}-${currNode.j}`);
    let validNeighbors = getValidNeighbors(currNode);
    for (let n of validNeighbors) {
      if (closedSet.has(`${n.i}-${n.j}`)) continue;

      const tentativeG = currNode.g + calculateHeuristic(currNode, n);

      if (!openDict.has(`${n.i}-${n.j}`)) {
        n.g = tentativeG;
        n.h = calculateHeuristic(n, endNode);
        n.f = n.g + n.h;
        n.parent = currNode;
        openList.insert(n);
        openDict.set(`${n.i}-${n.j}`, n);
      } else if (tentativeG < openDict.get(`${n.i}-${n.j}`)!.g) {
        n.g = tentativeG;
        n.f = tentativeG + n.h;
        n.parent = currNode;
      }
    }
  }

  // A* end

  let svg_path =
    `M${rect1.left - parentRef.left + rect1.x / 2} ${rect1.top - parentRef.top - 4} ` +
    `L${grid[start.i][start.j].left} ${grid[start.i][start.j].top} ` +
    path
      .map(({ i, j }, idx) => {
        let curr_cell = grid[i][j];
        let x = curr_cell.left + rect2.x / 2 / (path.length + 2);
        let y = curr_cell.top;
        if (idx === 0) return `L${x} ${y}`;
        if (idx === path.length - 1) return `L${x} ${y - 10}`;

        return `L${x} ${y}`;
      })
      .join(' ');
  // remove that is start

  drawArrow(svg, svg_path, lineType);
}

function drawArrow(
  svg: SVGSVGElement,
  svg_path: string,
  lineType: keyof typeof Lines,
) {
  // 🧹 Clear previous drawings

  // remove all children except <defs>
  //Array.from(svg.children).forEach((child) => {
  //  if (child.tagName !== 'defs') svg.removeChild(child);
  //});

  const svgNS = 'http://www.w3.org/2000/svg';
  const color = Lines[lineType].color;

  // Path (the actual arrow)
  const path = document.createElementNS(svgNS, 'path');
  svg.setAttribute('viewBox', `0 0 ${svg.clientWidth} ${svg.clientHeight}`);
  svg.setAttribute('preserveAspectRatio', 'none');
  path.setAttribute('d', svg_path);
  path.setAttribute('stroke', color);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  path.setAttribute('stroke-width', '4');
  path.setAttribute('marker-end', `url(#${ArrowHead[lineType].id})`);
  svg.appendChild(path);

  // Draw rect boxes
  //appendRectBox(svg, rect1, parentRef, color);
  //appendRectBox(svg, rect2, parentRef, color);
}

void appendRectBox;
function appendRectBox(
  svg: SVGSVGElement,
  rect: DOMRect,
  parentRef: DOMRect,
  color: string,
) {
  const svgNS = 'http://www.w3.org/2000/svg';

  const makeLine = (x1: number, y1: number, x2: number, y2: number) => {
    const line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', String(x1 - parentRef.x));
    line.setAttribute('y1', String(y1 - parentRef.y));
    line.setAttribute('x2', String(x2 - parentRef.x));
    line.setAttribute('y2', String(y2 - parentRef.y));
    line.setAttribute('stroke', color);
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

  // 🧹 Remove previous debug cells (keep defs/arrowheads)
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

      // 🟨 Fill occupied cells yellow, empty transparent
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
