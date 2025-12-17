import { useMemo, useState } from 'react';
import { ArrowLeft, RotateCcw, ChevronDown, ChevronRight } from 'lucide-react';
import luarparser from 'luaparse';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useNavigate } from '@tanstack/react-router';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from './ui/resizable';
import { EvalChunkFront } from './ast_visualizer';
import type { Lua_Visualzer } from '@busytutor/server/src/interpreter/lua_types';
import { trpc } from '../lib/trpc';
import { LuaVisualizer } from './luaVisualizer';

interface ProblemPageProps {
  problemId: string;
}

const theme = {
  theme: 'dark',
  mobile: false,
  colors: {
    background: '#22223B',
    accent: '#9A8C98',
    text: '#F2E9E4',
    primary: '#4A4E69',
    secondary: '#C9ADA7',
    heapmapBackground: '#2e2e4b',
    heatmap: {
      0: '#3a3a5c',
      1: '#66667a',
      4: '#9999aa',
      8: '#cccccc',
      10: '#ffffff',
    },
  },
};
export function ProblemPage({ problemId }: ProblemPageProps) {
  const [code, setCode] = useState('');
  const [idToUse, setIdToUse] = useState<string | null>(null);
  let onNavigate = useNavigate();
  console.log(`the id -${problemId}-`);

  let { data, isLoading } = trpc.problem.getById.useQuery({
    id: String(problemId),
  });

  const problem = useMemo(() => {
    if (!data?.problem) return undefined;
    let p = {
      ...data.problem,
      starterCode: data.problem.starterCode,
      tests: JSON.parse(data.problem.tests) as any[],
      examples: JSON.parse(data.problem.examples) as {
        input: string;
        output: string;
        explanation: string;
      }[],
      constraints: JSON.parse(data.problem.constraints) as string[],
      hints: JSON.parse(data.problem.hints) as string[],
    };
    return p;
  }, [data]);

  const [isConsoleOpen, _setIsConsoleOpen] = useState(true);
  const [isVisual, _setIsVisual] = useState(false);
  const [didSolutionPass, setDidSolutionPass] = useState<boolean>();
  const [visual, _setVisual] = useState<Lua_Visualzer>({
    loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
  });
  const [ast, setAst] = useState<luarparser.Chunk | null>(null);
  const [currLoc, setCurrLoc] = useState<Lua_Visualzer['loc']>();
  const [testIdx, setTestIdx] = useState(0);
  const [questionTab, setQuestionTab] = useState('question');
  const [testTab, setTestTab] = useState('0');

  let luaRunner = trpc.lua.runLua.useMutation();

  //TODO  not found

  if (isLoading) {
    return <div> isloading </div>;
  }
  if (!problem) {
    return (
      <div className='h-screen py-12 px-4'>
        <div className='container mx-auto'>
          <Button
            variant='ghost'
            className='mb-8 text-muted-foreground hover:text-foreground'
            onClick={() => onNavigate({ to: '/practice' })}
          >
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to Practice
          </Button>
          <div className='p-8 text-center'>
            <h1 className='text-2xl font-bold mb-4'>Problem Not Found</h1>
            <p className='text-muted-foreground'>
              The requested problem could not be found.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Initialize code with starter code if empty
  if (!code && problem.starterCode) {
    setCode(problem.starterCode);
  }

  const handleReset = () => {
    // TODO set a requesto to delte curruent code visualize in the backend
    setCode(problem.starterCode);
    _setIsVisual(false);
    setAst(null);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-500/20 text-green-400';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'hard':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div
      className='max-h-screen flex flex-col flex-1 bg-background relative min-h-0'
      style={{
        //TODO why tailwind not working?
        maxHeight: '100vh',
      }}
    >
      {/* Absolute Fixed Header */}
      <div className='top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 border-b border-border bg-card/95 backdrop-blur-sm'>
        <div className='flex items-center gap-3'>
          <Button
            variant='ghost'
            size='sm'
            className='text-muted-foreground hover:text-foreground'
            onClick={() => onNavigate({ to: '/practice' })}
          >
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <span className='text-sm text-muted-foreground'>#{problemId}</span>
        </div>

        <h1 className='text-lg font-medium'>{problem.title}</h1>

        <Badge
          variant='secondary'
          className={getDifficultyColor(problem.difficulty!)}
        >
          {problem.difficulty}
        </Badge>
      </div>

      {/* Main Content - With top padding for fixed header */}
      <ResizablePanelGroup
        direction='horizontal'
        className='flex-1 flex overflow-hidden min-h-0'
      >
        {/* Left Panel - Problem Description (Scrollable) */}

        <ResizablePanel className='w-1/2 bg-card flex flex-col min-h-0 '>
          {/* TODO visualizer  des*/}

          <Tabs
            value={questionTab}
            onValueChange={(t) => setQuestionTab(t)}
            className=' flex flex-col flex-1  overflow-y-auto w-full h-full'
          >
            <div className='px-4 py-2 border-b border-border'>
              <TabsList className='w-full bg-muted grid grid-cols-3'>
                <TabsTrigger
                  key={`question-tab`}
                  value={'question'}
                  className={
                    (questionTab === 'question' && `bg-background`) || ''
                  }
                >
                  Question
                </TabsTrigger>

                <TabsTrigger
                  key={`visual`}
                  value={'visual'}
                  className={
                    (questionTab === 'visual' && `bg-background`) || ''
                  }
                >
                  Visualizer
                </TabsTrigger>

                <TabsTrigger
                  key={`attemps`}
                  value={'attemps'}
                  className={
                    (questionTab === 'attemps' && `bg-background`) || ''
                  }
                >
                  Attemps
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={'question'} className='flex-col'>
              <ProblemDescription problem={problem} />
            </TabsContent>

            <TabsContent value={'attemps'} className='flex-col'>
              <AttempsList problemId={problemId} />
            </TabsContent>

            <TabsContent value={'visual'} className='flex-col'>
              {!isVisual || idToUse === null ? (
                <VisualizerReferences />
              ) : (
                <LuaVisualizer
                  id={idToUse}
                  didSolutionPass={didSolutionPass}
                  setDidSolutionPass={setDidSolutionPass}
                  setCurrLoc={setCurrLoc}
                />
              )}
            </TabsContent>
          </Tabs>
        </ResizablePanel>

        {/* Slight Separator */}
        <ResizableHandle className='w-1 bg-border flex-shrink-0' />

        {/* Ri/*ght Panel - Code Editor & Console (Fixed) */}
        <ResizablePanel className='w-1/2 flex-1 flex flex-col bg-background min-h-0'>
          <ResizablePanelGroup
            direction='vertical'
            className='w-1/2 flex-1 flex flex-col bg-background min-h-0'
          >
            {/* Code Editor */}
            <ResizablePanel
              className={`flex flex-col min-h-0 transition-all duration-300 ${isConsoleOpen ? 'flex-1' : 'flex-1'}`}
            >
              {/* Editor Header */}
              <div className='flex items-center justify-between px-4 py-3 border-b border-border bg-card flex-shrink-0'>
                <div className='flex items-center gap-4'>
                  <span className='text-sm font-medium'>Code</span>
                  <select className='bg-transparent text-sm border-none outline-none text-muted-foreground cursor-pointer'>
                    <option>Lua</option>
                  </select>
                </div>
                <div className='flex items-center gap-2'>
                  {didSolutionPass &&
                    (didSolutionPass ? (
                      <div className='text-green-500 font-bold'>Accepted</div>
                    ) : (
                      <div className='text-red-500 font-bold'>Failed</div>
                    ))}
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleReset}
                    className='text-xs'
                  >
                    <RotateCcw className='h-3 w-3 mr-1' />
                    Reset
                  </Button>
                </div>
              </div>

              {/* Code Editor Area */}
              <div className='flex-1 p-4 min-h-0'>
                {!isVisual ? (
                  <Textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder='Write your solution here...'
                    className='w-full h-full font-mono text-sm bg-muted/30 border border-border/30 resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors'
                  />
                ) : (
                  visual &&
                  ast && (
                    <div className='flex flex-col flex-1 min-h-0 font-mono text-sm overflow-y-auto w-full h-full bg-muted/30 border border-border/30 resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors  px-3 py-2 rounded-md'>
                      <EvalChunkFront
                        theme={theme}
                        visual={currLoc}
                        node={ast}
                      />
                    </div>
                  )
                )}
              </div>
            </ResizablePanel>

            <ResizableHandle />

            <ResizablePanel className='bg-card min-h-0 flex flex-col flex-1  overflow-y-auto w-full h-full'>
              <Tabs
                value={testTab}
                onValueChange={(t) => setTestTab(t)}
                className='p-4 flex flex-col flex-1  overflow-y-auto w-full h-full '
              >
                <div className='flex gap-x-4'>
                  <TabsList className='flex justify-between gap-x-4'>
                    {problem.tests.map((_t, idx) => {
                      return (
                        <TabsTrigger
                          className={
                            (testTab === String(idx) && `bg-background`) || ''
                          }
                          key={`test-trigger${idx}`}
                          value={String(idx)}
                          onClick={() => {
                            setTestIdx(idx);
                          }}
                        >
                          Test {String(idx + 1)}
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>

                  <Button
                    onClick={async () => {
                      let result = await luaRunner.mutateAsync({
                        code: code,
                        testIdx: testIdx,
                        problemId: problemId,
                      });
                      //
                      if (result.sucess) {
                        let ast = luarparser.parse(code, {
                          locations: true,
                        });

                        setAst(ast);
                        setIdToUse(result.id!);
                        _setIsVisual(true);
                      }
                      //
                      //console.log('start visualier');
                    }}
                  >
                    Run
                  </Button>
                </div>
                {problem.tests.map((t: Record<string, string>, idx) => {
                  return (
                    <TabsContent
                      key={`test-content${idx}`}
                      value={String(idx)}
                      className='flex flex-col gap-y-4'
                    >
                      {Object.entries(t).map(([key, val], inputIdx) => {
                        return (
                          <div
                            key={`test-${idx}-${inputIdx}`}
                            className='flex flex-col gap-y-2 p-2'
                          >
                            <div>{key} =</div>
                            <div className='bg-muted text-muted-foreground inline-flex h-9  items-center  rounded-lg p-4 w-full '>
                              {val}
                            </div>
                          </div>
                        );
                      })}
                    </TabsContent>
                  );
                })}
              </Tabs>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

function ProblemDescription({ problem }: { problem: any }) {
  //TODO

  const [openHints, setOpenHints] = useState<number[]>([]);

  const toggleHint = (index: number) => {
    setOpenHints((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  return (
    <div className='flex flex-col flex-1 overflow-y-auto'>
      <div className='p-6 space-y-6'>
        {/* Problem Description */}
        <div>
          <p className='text-sm leading-relaxed text-foreground'>
            {problem.description}
          </p>
        </div>

        {/* Examples */}
        <div>
          {problem.examples.map((example: any, index: any) => (
            <div key={index} className='mb-6'>
              <h3 className='text-base font-medium mb-3'>
                Example {index + 1}:
              </h3>
              <div className='bg-muted/50 p-4 rounded-lg border border-border/30'>
                <div className='space-y-2 font-mono text-sm'>
                  <div>
                    <span className='font-medium text-foreground'>Input:</span>{' '}
                    <span className='text-primary'>{example.input}</span>
                  </div>
                  <div>
                    <span className='font-medium text-foreground'>Output:</span>{' '}
                    <span className='text-secondary'>{example.output}</span>
                  </div>
                  {example.explanation && (
                    <div>
                      <span className='font-medium text-foreground'>
                        Explanation:
                      </span>{' '}
                      <span className='text-muted-foreground'>
                        {example.explanation}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Constraints */}
        <div>
          <h3 className='text-base font-medium mb-3'>Constraints:</h3>
          <ul className='space-y-1'>
            {problem.constraints.map((constraint: any, index: any) => (
              <li
                key={index}
                className='text-sm font-mono text-muted-foreground flex items-start'
              >
                <span className='mr-2'>•</span>
                <span>{constraint}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Hints */}
        <div>
          <h3 className='text-base font-medium mb-3'>Hints:</h3>
          <div className='space-y-2'>
            {problem.hints.map((hint: any, index: any) => (
              <Collapsible
                key={index}
                open={openHints.includes(index)}
                onOpenChange={() => toggleHint(index)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant='ghost'
                    className='w-full justify-start p-3 h-auto text-left bg-muted/30 hover:bg-muted/50 border border-border/30'
                  >
                    {openHints.includes(index) ? (
                      <ChevronDown className='h-4 w-4 mr-2 flex-shrink-0' />
                    ) : (
                      <ChevronRight className='h-4 w-4 mr-2 flex-shrink-0' />
                    )}
                    <span className='text-sm font-medium'>
                      Hint {index + 1}
                    </span>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className='mt-2'>
                  <div className='p-4 bg-muted/50 border border-border/30 rounded-lg'>
                    <p className='text-sm text-muted-foreground leading-relaxed'>
                      {hint}
                    </p>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function VisualizerReferences() {
  return (
    <div className='flex flex-col items-center justify-center h-64 text-center'>
      <h3 className='text-lg font-medium mb-2'>Code Visualizer</h3>
      <p className='text-sm text-muted-foreground mb-4'>
        Run your code to see a step-by-step execution visualization
      </p>
      <div className='flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground'>
        <div className='flex items-center gap-1'>
          <div
            className='w-3 h-3 rounded border-2'
            style={{ borderColor: '#ef4444' }}
          ></div>
          <span>Numbers</span>
        </div>
        <div className='flex items-center gap-1'>
          <div
            className='w-3 h-3 rounded border-2'
            style={{ borderColor: '#10b981' }}
          ></div>
          <span>Strings</span>
        </div>
        <div className='flex items-center gap-1'>
          <div
            className='w-3 h-3 rounded border-2'
            style={{ borderColor: '#92400e' }}
          ></div>
          <span>Booleans</span>
        </div>
        <div className='flex items-center gap-1'>
          <div
            className='w-3 h-3 rounded border-2'
            style={{ borderColor: '#f97316' }}
          ></div>
          <span>Arrays</span>
        </div>
      </div>
    </div>
  );
}

function AttempsList({ problemId }: { problemId: string }) {
  let { data, hasNextPage, fetchNextPage } =
    trpc.solution.getSolutions.useInfiniteQuery(
      { problemId, limit: 10 },
      {
        initialCursor: 0,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  let attemps = useMemo(() => {
    return (
      data?.pages.flatMap((d) => {
        return d.solutions;
      }) || []
    );
  }, [data]);
  let [viewingOne, setViewingOne] = useState<number | undefined>();

  return (
    <div className='px-4 py-2 flex flex-col gap-y-4'>
      {viewingOne === undefined &&
        attemps.map((d, idx) => {
          let pass = d.status === 'accepted';

          return (
            <div key={'attemp-' + idx} className='bg-card'>
              <div className='bg-background p-4 rounded-lg border border-border/30 grid-rows-2 grid'>
                <div className='space-y-2 font-mono text-sm grid-cols-4 grid'>
                  <div>Submission</div>
                  <div>Language </div>
                  <div>Date</div>
                  <div>Code</div>
                </div>
                <div className='space-y-2 font-mono text-sm grid-cols-4 grid'>
                  <div>
                    {pass && (
                      <div className='text-green-500 font-bold'>Accepted</div>
                    )}
                    {!pass && (
                      <div className='text-red-500 font-bold'>Failed</div>
                    )}
                  </div>
                  <div>
                    <div>{d.language}</div>
                  </div>
                  <div>
                    <Button
                      variant='link'
                      className='p-0'
                      onClick={() => {
                        setViewingOne(idx);
                      }}
                    >
                      View
                    </Button>
                  </div>
                  <div>
                    <div>{d.createdAt.toISOString()}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

      {viewingOne === undefined && hasNextPage && (
        <Button
          onClick={() => {
            fetchNextPage();
          }}
        >
          fecthMore
        </Button>
      )}

      {viewingOne !== undefined &&
        (() => {
          let d = attemps[viewingOne];
          let pass = d.status === 'accepted';

          return (
            <div className='bg-background p-4 rounded-lg border border-border/30 flex-col flex gap-y-4'>
              <Button onClick={() => setViewingOne(undefined)} variant='ghost'>
                <ArrowLeft className='h-4 w-4' />
                All Submissions
              </Button>

              <div className='flex flex-col gap-y-4'>
                <div className='flex justify-between'>
                  {pass && (
                    <div className='text-green-500 font-bold'>Accepted</div>
                  )}
                  {!pass && (
                    <div className='text-red-500 font-bold'>Failed</div>
                  )}
                  <Button onClick={() => setViewingOne(undefined)}>
                    Upload
                  </Button>
                </div>
                <div>
                  <Textarea
                    value={d.code}
                    readOnly={true}
                    placeholder='Write your solution here...'
                    className='w-full h-full p-8 font-mono text-sm bg-muted/30 border border-border/30 resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors'
                  />
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}
