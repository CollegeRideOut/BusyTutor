import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { trpc } from '../lib/trpc';
import { Button } from './ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Lua_Table } from '@busytutor/server/src/interperter/lua_types';
import type { Lua_Visualzer } from '@busytutor/server/src/interperter/lua_types';

import { reviver } from '../utils/jsonParser';

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
      let currEnv = new Lua_Table(JSON.parse(d.currEnv, reviver)) as Lua_Table;
      let heap = JSON.parse(d.heap, reviver) as Map<string, Lua_Table>;
      return {
        visual: JSON.parse(d.visual) as Lua_Visualzer,
        currEnv,
        heap,
      };
    });
  }, [data]);

  return (
    <div className='w-full flex flex-row items-center justify-center p-4'>
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
              console.log(timeline[currentOnStack].heap);
              console.log(timeline[currentOnStack].currEnv);
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

        {!isTree && (
          <VisualizeExecution
            env={timeline[currentOnStack].currEnv}
            heap={timeline[currentOnStack].heap}
          />
        )}
      </div>
    </div>
  );
}

let globalEnv = 0;
function VisualizeExecution({
  env,
  heap,
}: {
  env: Lua_Table;
  heap: Map<string, Lua_Table>;
}) {
  const visualEnvironmentRef = useRef<Map<string, HTMLElement>>(new Map());
  globalEnv = 0;

  return (
    <VisulizeEnvironment env={env} heap={heap} ref={visualEnvironmentRef} />
  );
}

function VisulizeEnvironment({
  env,
  ref,
  heap,
}: {
  env: Lua_Table;
  ref: React.RefObject<Map<string, HTMLElement>>;
  heap: Map<string, Lua_Table>;
}) {
  let rc: ReactNode[] = [];

  globalEnv++;

  //if (outter.kind !== 'error' && outter.id !== env.id) {
  //  rc.push(VisulizeEnvironment({ env: outter, ref: ref, heap }));
  //}

  let curr: ReactNode[] = [...env.store.entries()].map(([identifier, obj]) => {
    let identiferString = '';
    if (typeof identifier !== 'object') {
      identiferString = String(identifier);
    } else {
      identiferString = identifier.id;
    }

    switch (obj.kind) {
      case 'string':
      case 'number':
      case 'boolean': {
        return (
          <div
            className=' flex p-1 items-center h-[50px] w-[50px] justify-center'
            ref={(el) => {
              el && ref.current.set(identiferString, el);
            }}
          >
            {identiferString} : {String(obj.value)}
          </div>
        );
      }
      case 'table':
      case 'return':
      case 'error':
      case 'null':
      case 'builtin':
      case 'function': {
        return (
          <div
            className='flex w-full justify-between items-center '
            style={{
              border: '10px solid transparent',
            }}
          >
            {identiferString}
          </div>
        );
      }
    }
  });
  globalEnv--;

  return (
    <div>
      {rc}
      <div>Env: #{globalEnv}</div>
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

  console.log(currentIdx);
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
    <div className='w-full min-h-[50vh] overflow-auto py-6 flex justify-center'>
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

function climbEnv(
  t: Lua_Table,
  heap: Map<string, Lua_Table>,
): Lua_Table | null {
  console.log(t);
  if (!t.metatable) {
    // TODO should be an error
    return null;
  }
  let p = new Lua_Table(heap.get(t.id));
  let outer = p.get('__index');
  if (outer.kind === 'null') {
    return null;
  }
  if (outer.kind !== 'table') return null;
  if (outer === t) {
    return t;
  }

  return outer;
}
