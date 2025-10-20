import { useContext, useEffect, useState } from 'react';
import {
  ArrowLeft,
  Play,
  RotateCcw,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
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
import { problems } from '../db.json' with { type: 'json' };
import { CurrentPageContext } from '../routes/__root';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from './ui/resizable';
import { EvalChunkFront } from './ast_visualizer';
import type { Lua_Object_Visualizer } from '@busytutor/server/';
import { trpc } from '../lib/trpc';
import { LuaVisualizer } from './luaVisualizer';

interface ProblemPageProps {
  problemId: number | null;
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
  let { setCurrentPage } = useContext(CurrentPageContext);
  const [code, setCode] = useState('');
  const [idToUse, setIdToUse] = useState<string | null>(null);
  let onNavigate = useNavigate();
  const [problem] = useState(problems.find((p) => p.id === problemId)?.data);
  const [isConsoleOpen, _setIsConsoleOpen] = useState(true);
  const [isVisual, _setIsVisual] = useState(false);
  const [visual, _setVisual] = useState<Lua_Object_Visualizer>({
    loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
  });
  const [ast, setAst] = useState<luarparser.Chunk | null>(null);

  let luaRunner = trpc.lua.runLua.useMutation();

  useEffect(() => {
    setCurrentPage('problem');
  }, []);

  //TODO  not found

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
    setCode(problem.starterCode);
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
      className='max-h-screen flex flex-col flex-1 bg-background relative'
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
          className={getDifficultyColor(problem.difficulty)}
        >
          {problem.difficulty}
        </Badge>
      </div>

      {/* Main Content - With top padding for fixed header */}
      <ResizablePanelGroup
        direction='horizontal'
        className='flex-1 flex overflow-hidden'
      >
        {/* Left Panel - Problem Description (Scrollable) */}

        <ResizablePanel className='w-1/2 bg-card flex flex-col min-h-0'>
          {/* TODO visualizer  des*/}
          {!isVisual || idToUse === null ? (
            <ProblemDescription problemId={problemId} />
          ) : (
            <LuaVisualizer id={idToUse} />
          )}
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
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleReset}
                    className='text-xs'
                  >
                    <RotateCcw className='h-3 w-3 mr-1' />
                    Reset
                  </Button>
                  <Button
                    size='sm'
                    className='bg-primary hover:bg-primary/90 text-primary-foreground'
                    onClick={async () => {
                      let vis = await nextRUnner.mutateAsync({ id: idToUse });
                      if (vis.visual) {
                        console.log(vis.visual);
                        _setVisual(vis.visual);
                      }
                    }}
                  >
                    <Play className='h-3 w-3 mr-1' />
                    Run
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
                    style={{ minHeight: '100%' }}
                  />
                ) : (
                  visual &&
                  ast && (
                    <EvalChunkFront theme={theme} visual={visual} node={ast} />
                  )
                )}
              </div>
            </ResizablePanel>

            <ResizableHandle />

            <ResizablePanel className='bg-card'>
              <Tabs defaultValue='0' className='p-4'>
                <TabsList className='flex justify-between'>
                  {problem.tests.map((_t, idx) => {
                    return (
                      <TabsTrigger
                        key={`test-trigger${idx}`}
                        value={String(idx)}
                      >
                        Test {String(idx + 1)}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                {problem.tests.map((t, idx) => {
                  return (
                    <TabsContent
                      key={`test-content${idx}`}
                      value={String(idx)}
                      className='flex-col'
                    >
                      <Button
                        onClick={async () => {
                          let result = await luaRunner.mutateAsync({
                            code: code,
                            inputs: t.value,
                            problemId: '217',
                          });

                          if (result.sucess) {
                            let ast = luarparser.parse(result.userLuaRun!, {
                              locations: true,
                            });

                            setAst(ast);
                            setIdToUse(result.id!);
                            setCode(result.userLuaRun!);
                            _setIsVisual(true);
                          }

                          console.log('start visualier');
                        }}
                      >
                        Run
                      </Button>
                      <div>{t.input}</div>
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

function ProblemDescription({ problemId }: ProblemPageProps) {
  const [problem] = useState(problems.find((p) => p.id === problemId)!.data);

  const [openHints, setOpenHints] = useState<number[]>([]);

  const toggleHint = (index: number) => {
    setOpenHints((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  return (
    <div className=' flex flex-col flex-1 overflow-y-auto'>
      <div className='p-6 space-y-6'>
        {/* Problem Description */}
        <div>
          <p className='text-sm leading-relaxed text-foreground'>
            {problem.description}
          </p>
        </div>

        {/* Examples */}
        <div>
          {problem.examples.map((example, index) => (
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
            {problem.constraints.map((constraint, index) => (
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
            {problem.hints.map((hint, index) => (
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
