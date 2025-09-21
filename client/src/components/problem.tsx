import { useContext, useEffect, useState } from 'react';
import {
  ArrowLeft,
  Play,
  RotateCcw,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  X,
} from 'lucide-react';
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

interface ProblemPageProps {
  problemId: number | null;
}

interface TestRun {
  id: string;
  timestamp: string;
  output: string;
  status: 'running' | 'passed' | 'failed';
  message?: string;
}

// Mock problem data - you can replace this with actual data later

export function ProblemPage({ problemId }: ProblemPageProps) {
  let { setCurrentPage } = useContext(CurrentPageContext);
  const [code, setCode] = useState('');
  let onNavigate = useNavigate();
  const [problem] = useState(problems.find((p) => p.id === problemId)?.data);
  const [openHints, setOpenHints] = useState<number[]>([]);
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [runCounter, setRunCounter] = useState(0);

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

  const handleRunCode = () => {
    const newRunId = `run-${runCounter + 1}`;
    const timestamp = new Date().toLocaleTimeString();

    // Create new test run
    const newTestRun: TestRun = {
      id: newRunId,
      timestamp,
      output: 'Running code...',
      status: 'running',
    };

    setTestRuns((prev) => [...prev, newTestRun]);
    setActiveTab(newRunId);
    setRunCounter((prev) => prev + 1);

    // Automatically open console when running code
    if (!isConsoleOpen) {
      setIsConsoleOpen(true);
    }

    // Simulate code execution
    // TODO
    setTimeout(() => {
      setTestRuns((prev) =>
        prev.map((run) =>
          run.id === newRunId
            ? {
                ...run,
                output:
                  'Code executed successfully!\n\nTest case 1: [1,2,3,1] → true ✓\nTest case 2: [1,2,3,4] → false ✓\nTest case 3: [1,1,1,3,3,4,3,2,4,2] → true ✓\n\nAll test cases passed!',
                status: 'passed' as const,
                message: 'All test cases passed!',
              }
            : run,
        ),
      );
    }, 2000);
  };

  const handleReset = () => {
    setCode(problem.starterCode);
    setTestRuns([]);
    setActiveTab('');
    setRunCounter(0);
  };

  const removeTestRun = (runId: string) => {
    setTestRuns((prev) => prev.filter((run) => run.id !== runId));
    if (activeTab === runId) {
      const remainingRuns = testRuns.filter((run) => run.id !== runId);
      setActiveTab(
        remainingRuns.length > 0
          ? remainingRuns[remainingRuns.length - 1].id
          : '',
      );
    }
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

  const toggleHint = (index: number) => {
    setOpenHints((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const getStatusIcon = (status: TestRun['status']) => {
    switch (status) {
      case 'running':
        return (
          <div className='h-3 w-3 bg-yellow-400 rounded-full animate-pulse' />
        );
      case 'passed':
        return <CheckCircle className='h-3 w-3 text-green-400' />;
      case 'failed':
        return <XCircle className='h-3 w-3 text-red-400' />;
    }
  };

  const getLatestTestResult = () => {
    if (testRuns.length === 0) return null;
    const latestRun = testRuns[testRuns.length - 1];
    return latestRun.status !== 'running' ? latestRun : null;
  };

  return (
    <div className='max-h-screen flex flex-col bg-background relative' style={{
        //TODO why tailwind not working?
        maxHeight: '100vh' 
    }}>
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
      <div className='flex-1 flex overflow-hidden pt-16'>
        {/* Left Panel - Problem Description (Scrollable) */}
        <div className='w-1/2 bg-card flex flex-col min-h-0'>
          <div className='flex-1 overflow-y-auto'>
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
                          <span className='font-medium text-foreground'>
                            Input:
                          </span>{' '}
                          <span className='text-primary'>{example.input}</span>
                        </div>
                        <div>
                          <span className='font-medium text-foreground'>
                            Output:
                          </span>{' '}
                          <span className='text-secondary'>
                            {example.output}
                          </span>
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
        </div>

        {/* Slight Separator */}
        <div className='w-1 bg-border flex-shrink-0'></div>

        {/* Right Panel - Code Editor & Console (Fixed) */}
        <div className='w-1/2 flex flex-col bg-background min-h-0'>
          {/* Code Editor */}
          <div
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
                  onClick={handleRunCode}
                  size='sm'
                  className='bg-primary hover:bg-primary/90 text-primary-foreground'
                >
                  <Play className='h-3 w-3 mr-1' />
                  Run
                </Button>
              </div>
            </div>

            {/* Code Editor Area */}
            <div className='flex-1 p-4 min-h-0'>
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder='Write your solution here...'
                className='w-full h-full font-mono text-sm bg-muted/30 border border-border/30 resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors'
                style={{ minHeight: '100%' }}
              />
            </div>
          </div>

          {/* Collapsible Console with Tabs */}
          <Collapsible open={isConsoleOpen} onOpenChange={setIsConsoleOpen}>
            {/* Console Header - Always Visible */}
            <div className='border-t border-border bg-card flex-shrink-0'>
              <CollapsibleTrigger asChild>
                <Button
                  variant='ghost'
                  className='w-full justify-between px-4 py-3 h-auto text-left hover:bg-muted/20'
                >
                  <div className='flex items-center gap-4'>
                    <span className='text-sm font-medium'>Console</span>
                    {getLatestTestResult() && (
                      <div
                        className={`flex items-center gap-1 text-xs ${getLatestTestResult()?.status === 'passed' ? 'text-green-400' : 'text-red-400'}`}
                      >
                        {getStatusIcon(getLatestTestResult()!.status)}
                        {getLatestTestResult()?.message}
                      </div>
                    )}
                  </div>
                  {isConsoleOpen ? (
                    <ChevronDown className='h-4 w-4 text-muted-foreground' />
                  ) : (
                    <ChevronUp className='h-4 w-4 text-muted-foreground' />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>

            {/* Console Content - Collapsible */}
            <CollapsibleContent>
              <div className='h-48 bg-card border-t border-border flex-shrink-0'>
                {testRuns.length === 0 ? (
                  <div className='h-full p-4 flex items-center justify-center'>
                    <p className='font-mono text-xs text-muted-foreground'>
                      Click "Run" to execute your code and see the output here.
                    </p>
                  </div>
                ) : (
                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className='h-full flex flex-col'
                  >
                    {/* Tab List */}
                    <div className='border-b border-border px-2 py-1 bg-muted/20'>
                      <TabsList className='h-8 bg-transparent p-0 space-x-1'>
                        {testRuns.map((run) => (
                          <div key={run.id} className='relative'>
                            <TabsTrigger
                              value={run.id}
                              className='h-7 px-3 text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2'
                            >
                              {getStatusIcon(run.status)}
                              <span>Test {run.id.split('-')[1]}</span>
                              <span className='text-xs text-muted-foreground'>
                                ({run.timestamp})
                              </span>
                            </TabsTrigger>
                            {testRuns.length > 1 && (
                              <Button
                                variant='ghost'
                                size='sm'
                                className='absolute -top-1 -right-1 h-4 w-4 p-0 rounded-full bg-muted hover:bg-destructive hover:text-destructive-foreground'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeTestRun(run.id);
                                }}
                              >
                                <X className='h-2 w-2' />
                              </Button>
                            )}
                          </div>
                        ))}
                      </TabsList>
                    </div>

                    {/* Tab Content */}
                    <div className='flex-1 overflow-hidden'>
                      {testRuns.map((run) => (
                        <TabsContent
                          key={run.id}
                          value={run.id}
                          className='h-full p-4 overflow-y-auto m-0'
                        >
                          <pre className='font-mono text-xs text-muted-foreground whitespace-pre-wrap'>
                            {run.output}
                          </pre>
                        </TabsContent>
                      ))}
                    </div>
                  </Tabs>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  );
}
