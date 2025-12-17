import { createFileRoute } from '@tanstack/react-router';
import { useAuth } from './__root';
import { useState } from 'react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { difficulty_enum } from '@busytutor/server/src/db/schema';
import type { difficulty_enum_type } from '@busytutor/server/src/db/schema';
import { trpc } from '../lib/trpc';
import { Textarea } from '../components/ui/textarea';
export const Route = createFileRoute('/admin')({
  component: RouteComponent,
});

function RouteComponent() {
  useAuth();
  const createProblem = trpc.problem.create.useMutation();

  const [problemInfo, setProblemInfo] = useState({
    id: '',
    title: '',
    description: '',
    starterCode: '',
    tests: [] as [string, string][][],
    constraints: [] as string[],
    examples: [] as {
      input: string;
      output: string;
      explanation: string;
    }[],

    hints: [] as string[],
    difficulty: 'easy' as difficulty_enum_type,
  });

  return (
    <div>
      <div>Uplaod a problem</div>
      <div>dificulty</div>
      <Select>
        <SelectTrigger className='w-[180px]'>
          <SelectValue placeholder='Select a diffuculty' />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>dificulty</SelectLabel>
            {Object.values(difficulty_enum).map((diff, idx) => {
              return (
                <SelectItem
                  key={`${diff}-${idx}`}
                  value={diff}
                  onSelect={() => {
                    const problemInfoCopy = JSON.parse(
                      JSON.stringify(problemInfo),
                    ) as typeof problemInfo;
                    problemInfoCopy.difficulty = diff;
                    setProblemInfo(problemInfoCopy);
                  }}
                >
                  {diff}
                </SelectItem>
              );
            })}
          </SelectGroup>
        </SelectContent>
      </Select>
      <div>Id</div>
      <Input
        value={problemInfo.id}
        onChange={(e) => {
          const problemInfoCopy = JSON.parse(
            JSON.stringify(problemInfo),
          ) as typeof problemInfo;
          problemInfoCopy.id = e.target.value;
          setProblemInfo(problemInfoCopy);
        }}
      />
      <div>Title</div>
      <Input
        value={problemInfo.title}
        onChange={(e) => {
          const problemInfoCopy = JSON.parse(
            JSON.stringify(problemInfo),
          ) as typeof problemInfo;
          problemInfoCopy.title = e.target.value;
          setProblemInfo(problemInfoCopy);
        }}
      />
      <div>Description</div>
      <Textarea
        value={problemInfo.description}
        onChange={(e) => {
          const problemInfoCopy = JSON.parse(
            JSON.stringify(problemInfo),
          ) as typeof problemInfo;
          problemInfoCopy.description = e.target.value;
          setProblemInfo(problemInfoCopy);
        }}
      />

      <div>StarterCode</div>
      <Textarea
        value={problemInfo.starterCode}
        onChange={(e) => {
          const problemInfoCopy = JSON.parse(
            JSON.stringify(problemInfo),
          ) as typeof problemInfo;
          problemInfoCopy.starterCode = e.target.value;
          setProblemInfo(problemInfoCopy);
        }}
      />

      <div>Tests</div>
      {problemInfo.tests.map((t, idx) => {
        return (
          <div key={`t-${idx}`}>
            {t.map((test, testIdx) => {
              return (
                <div key={`t-${idx}-test-${testIdx}`} className='flex'>
                  <Input
                    value={test[0]}
                    onChange={(e) => {
                      const problemInfoCopy = JSON.parse(
                        JSON.stringify(problemInfo),
                      ) as typeof problemInfo;
                      problemInfoCopy.tests[idx][testIdx][0] = e.target.value;
                      setProblemInfo(problemInfoCopy);
                    }}
                  />

                  <Input
                    value={test[1]}
                    onChange={(e) => {
                      const problemInfoCopy = JSON.parse(
                        JSON.stringify(problemInfo),
                      ) as typeof problemInfo;
                      problemInfoCopy.tests[idx][testIdx][1] = e.target.value;
                      setProblemInfo(problemInfoCopy);
                    }}
                  />

                  <Button
                    onClick={() => {
                      let copyProblemInfo = JSON.parse(
                        JSON.stringify(problemInfo),
                      ) as typeof problemInfo;
                      copyProblemInfo.tests[idx].push(['', '']);
                      setProblemInfo(copyProblemInfo);
                    }}
                  >
                    add
                  </Button>
                </div>
              );
            })}
          </div>
        );
      })}
      <Button
        onClick={() => {
          let copyProblemInfo = JSON.parse(
            JSON.stringify(problemInfo),
          ) as typeof problemInfo;
          copyProblemInfo.tests.push([['', '']]);
          setProblemInfo(copyProblemInfo);
        }}
      >
        add
      </Button>

      <div>Constraints</div>
      {problemInfo.constraints.map((constrain, idx) => {
        return (
          <div key={`constrain-${idx}`}>
            <Input
              value={constrain}
              onChange={(e) => {
                const problemInfoCopy = JSON.parse(
                  JSON.stringify(problemInfo),
                ) as typeof problemInfo;
                problemInfoCopy.constraints[idx] = e.target.value;
                setProblemInfo(problemInfoCopy);
              }}
            />
          </div>
        );
      })}
      <Button
        onClick={() => {
          let copyProblemInfo = JSON.parse(
            JSON.stringify(problemInfo),
          ) as typeof problemInfo;
          copyProblemInfo.constraints.push('');
          setProblemInfo(copyProblemInfo);
        }}
      >
        add
      </Button>
      <div>Example</div>
      {problemInfo.examples.map((example, idx) => {
        return (
          <div key={`example-${idx}`}>
            Input:
            <Input
              value={example.input}
              onChange={(e) => {
                const problemInfoCopy = JSON.parse(
                  JSON.stringify(problemInfo),
                ) as typeof problemInfo;
                problemInfoCopy.examples[idx].input = e.target.value;
                setProblemInfo(problemInfoCopy);
              }}
            />
            output:
            <Input
              value={example.output}
              onChange={(e) => {
                const problemInfoCopy = JSON.parse(
                  JSON.stringify(problemInfo),
                ) as typeof problemInfo;
                problemInfoCopy.examples[idx].output = e.target.value;
                setProblemInfo(problemInfoCopy);
              }}
            />
            exaplanation:
            <Input
              value={example.explanation}
              onChange={(e) => {
                const problemInfoCopy = JSON.parse(
                  JSON.stringify(problemInfo),
                ) as typeof problemInfo;
                problemInfoCopy.examples[idx].explanation = e.target.value;
                setProblemInfo(problemInfoCopy);
              }}
            />
          </div>
        );
      })}
      <Button
        onClick={() => {
          let copyProblemInfo = JSON.parse(
            JSON.stringify(problemInfo),
          ) as typeof problemInfo;
          copyProblemInfo.examples.push({
            input: '',
            output: '',
            explanation: '',
          });
          setProblemInfo(copyProblemInfo);
        }}
      >
        add
      </Button>
      <div>Hints</div>

      {problemInfo.hints.map((hint, idx) => {
        return (
          <div key={`hint-${idx}`}>
            <Input
              value={hint}
              onChange={(e) => {
                const problemInfoCopy = JSON.parse(
                  JSON.stringify(problemInfo),
                ) as typeof problemInfo;
                problemInfoCopy.hints[idx] = e.target.value;
                setProblemInfo(problemInfoCopy);
              }}
            />
          </div>
        );
      })}
      <Button
        onClick={() => {
          let copyProblemInfo = JSON.parse(
            JSON.stringify(problemInfo),
          ) as typeof problemInfo;
          copyProblemInfo.hints.push('');
          setProblemInfo(copyProblemInfo);
        }}
      >
        add
      </Button>
      <Button
        onClick={async () => {
          try {
            // building test
            let tests: any[] = [];
            for (let test of problemInfo.tests) {
              let t = Object.fromEntries(test);
              tests.push(t);
            }
            console.log(tests);
            console.log(JSON.stringify(tests));
            await createProblem.mutateAsync({
              ...problemInfo,
              examples: JSON.stringify(problemInfo.examples),
              hints: JSON.stringify(problemInfo.hints),
              constraints: JSON.stringify(problemInfo.constraints),
              tests: JSON.stringify(tests),
            });
          } catch (e) {
            throw e;
          }
        }}
      >
        Create Problem
      </Button>
    </div>
  );
}
//
//interface AdminPageProps {
//  onNavigate: (page: string) => void;
//  problems: any[];
//  onAddProblem: (problem: any) => void;
//  onUpdateProblem: (id: number, problem: any) => void;
//  onDeleteProblem: (id: number) => void;
//}
//
//interface ExampleInput {
//  input: string;
//  output: string;
//  explanation: string;
//}

//export function AdminPage({ onNavigate, problems, onAddProblem, onUpdateProblem, onDeleteProblem }: AdminPageProps) {
//  const [isCreating, setIsCreating] = useState(false);
//  const [editingId, setEditingId] = useState<number | null>(null);
//
//  // Form state for creating/editing problems
//  const [formData, setFormData] = useState({
//    title: '',
//    difficulty: 'Easy' as 'Easy' | 'Medium' | 'Hard',
//    category: 'Algorithms',
//    acceptance: '0.0%',
//    description: '',
//    examples: [{ input: '', output: '', explanation: '' }] as ExampleInput[],
//    constraints: [''],
//    hints: [''],
//    starterCode: '',
//    solution: ''
//  });
//
//  const resetForm = () => {
//    setFormData({
//      title: '',
//      difficulty: 'Easy',
//      category: 'Algorithms',
//      acceptance: '0.0%',
//      description: '',
//      examples: [{ input: '', output: '', explanation: '' }],
//      constraints: [''],
//      hints: [''],
//      starterCode: '',
//      solution: ''
//    });
//    setIsCreating(false);
//    setEditingId(null);
//  };
//
//  const handleSubmit = () => {
//    if (!formData.title || !formData.description) {
//      alert('Please fill in at least the title and description');
//      return;
//    }
//
//    const problemData = {
//      ...formData,
//      id: editingId || problems.length + 1,
//      status: 'not-started' as const,
//    };
//
//    if (editingId) {
//      onUpdateProblem(editingId, problemData);
//    } else {
//      onAddProblem(problemData);
//    }
//
//    resetForm();
//  };
//
//  const handleEdit = (problem: any) => {
//    setEditingId(problem.id);
//    setIsCreating(true);
//    setFormData({
//      title: problem.title || '',
//      difficulty: problem.difficulty || 'Easy',
//      category: problem.category || 'Algorithms',
//      acceptance: problem.acceptance || '0.0%',
//      description: problem.description || '',
//      examples: problem.examples || [{ input: '', output: '', explanation: '' }],
//      constraints: problem.constraints || [''],
//      hints: problem.hints || [''],
//      starterCode: problem.starterCode || '',
//      solution: problem.solution || ''
//    });
//  };
//
//  const addExample = () => {
//    setFormData({
//      ...formData,
//      examples: [...formData.examples, { input: '', output: '', explanation: '' }]
//    });
//  };
//
//  const removeExample = (index: number) => {
//    setFormData({
//      ...formData,
//      examples: formData.examples.filter((_, i) => i !== index)
//    });
//  };
//
//  const updateExample = (index: number, field: keyof ExampleInput, value: string) => {
//    const newExamples = [...formData.examples];
//    newExamples[index] = { ...newExamples[index], [field]: value };
//    setFormData({ ...formData, examples: newExamples });
//  };
//
//  const addConstraint = () => {
//    setFormData({
//      ...formData,
//      constraints: [...formData.constraints, '']
//    });
//  };
//
//  const removeConstraint = (index: number) => {
//    setFormData({
//      ...formData,
//      constraints: formData.constraints.filter((_, i) => i !== index)
//    });
//  };
//
//  const updateConstraint = (index: number, value: string) => {
//    const newConstraints = [...formData.constraints];
//    newConstraints[index] = value;
//    setFormData({ ...formData, constraints: newConstraints });
//  };
//
//  const addHint = () => {
//    setFormData({
//      ...formData,
//      hints: [...formData.hints, '']
//    });
//  };
//
//  const removeHint = (index: number) => {
//    setFormData({
//      ...formData,
//      hints: formData.hints.filter((_, i) => i !== index)
//    });
//  };
//
//  const updateHint = (index: number, value: string) => {
//    const newHints = [...formData.hints];
//    newHints[index] = value;
//    setFormData({ ...formData, hints: newHints });
//  };
//
//  const getDifficultyColor = (difficulty: string) => {
//    switch (difficulty) {
//      case 'Easy':
//        return 'bg-green-100 text-green-800 border-green-200';
//      case 'Medium':
//        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
//      case 'Hard':
//        return 'bg-red-100 text-red-800 border-red-200';
//      default:
//        return 'bg-gray-100 text-gray-800 border-gray-200';
//    }
//  };
//
//  return (
//    <div className="min-h-screen py-12 px-4">
//      <div className="container mx-auto max-w-7xl">
//        {/* Header */}
//        <div className="mb-8">
//          <Button
//            variant="ghost"
//            className="mb-4 text-muted-foreground hover:text-foreground"
//            onClick={() => onNavigate('landing')}
//          >
//            <ArrowLeft className="h-4 w-4 mr-2" />
//            Back to Home
//          </Button>
//          <div className="flex items-center justify-between">
//            <div>
//              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
//                Admin Panel
//              </h1>
//              <p className="text-muted-foreground">
//                Manage practice problems and site content
//              </p>
//            </div>
//            {!isCreating && (
//              <Button onClick={() => setIsCreating(true)} className="gap-2">
//                <Plus className="h-4 w-4" />
//                Create New Problem
//              </Button>
//            )}
//          </div>
//        </div>
//
//        <Tabs defaultValue="problems" className="w-full">
//          <TabsList className="grid w-full grid-cols-3 mb-8">
//            <TabsTrigger value="problems">Problems</TabsTrigger>
//            <TabsTrigger value="statistics">Statistics</TabsTrigger>
//            <TabsTrigger value="settings">Settings</TabsTrigger>
//          </TabsList>
//
//          {/* Problems Tab */}
//          <TabsContent value="problems" className="space-y-6">
//            {isCreating && (
//              <Card className="p-6">
//                <div className="flex items-center justify-between mb-6">
//                  <h2 className="text-2xl font-bold">
//                    {editingId ? 'Edit Problem' : 'Create New Problem'}
//                  </h2>
//                  <Button variant="ghost" size="sm" onClick={resetForm}>
//                    <X className="h-4 w-4" />
//                  </Button>
//                </div>
//
//                <div className="space-y-6">
//                  {/* Basic Information */}
//                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                    <div className="space-y-2">
//                      <Label htmlFor="title">Problem Title *</Label>
//                      <Input
//                        id="title"
//                        value={formData.title}
//                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//                        placeholder="e.g., Contains Duplicate"
//                      />
//                    </div>
//
//                    <div className="space-y-2">
//                      <Label htmlFor="category">Category</Label>
//                      <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
//                        <SelectTrigger>
//                          <SelectValue />
//                        </SelectTrigger>
//                        <SelectContent>
//                          <SelectItem value="Algorithms">Algorithms</SelectItem>
//                          <SelectItem value="Data Structures">Data Structures</SelectItem>
//                          <SelectItem value="Debugging">Debugging</SelectItem>
//                          <SelectItem value="Architecture">Architecture</SelectItem>
//                          <SelectItem value="Performance">Performance</SelectItem>
//                          <SelectItem value="Testing">Testing</SelectItem>
//                        </SelectContent>
//                      </Select>
//                    </div>
//
//                    <div className="space-y-2">
//                      <Label htmlFor="difficulty">Difficulty</Label>
//                      <Select value={formData.difficulty} onValueChange={(value: any) => setFormData({ ...formData, difficulty: value })}>
//                        <SelectTrigger>
//                          <SelectValue />
//                        </SelectTrigger>
//                        <SelectContent>
//                          <SelectItem value="Easy">Easy</SelectItem>
//                          <SelectItem value="Medium">Medium</SelectItem>
//                          <SelectItem value="Hard">Hard</SelectItem>
//                        </SelectContent>
//                      </Select>
//                    </div>
//
//                    <div className="space-y-2">
//                      <Label htmlFor="acceptance">Acceptance Rate</Label>
//                      <Input
//                        id="acceptance"
//                        value={formData.acceptance}
//                        onChange={(e) => setFormData({ ...formData, acceptance: e.target.value })}
//                        placeholder="e.g., 70.1%"
//                      />
//                    </div>
//                  </div>
//
//                  {/* Description */}
//                  <div className="space-y-2">
//                    <Label htmlFor="description">Problem Description *</Label>
//                    <Textarea
//                      id="description"
//                      value={formData.description}
//                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                      placeholder="Describe the problem..."
//                      rows={4}
//                    />
//                  </div>
//
//                  {/* Examples */}
//                  <div className="space-y-4">
//                    <div className="flex items-center justify-between">
//                      <Label>Examples</Label>
//                      <Button variant="outline" size="sm" onClick={addExample}>
//                        <Plus className="h-4 w-4 mr-2" />
//                        Add Example
//                      </Button>
//                    </div>
//                    {formData.examples.map((example, index) => (
//                      <Card key={index} className="p-4 space-y-3">
//                        <div className="flex items-center justify-between">
//                          <span className="text-sm font-medium">Example {index + 1}</span>
//                          {formData.examples.length > 1 && (
//                            <Button variant="ghost" size="sm" onClick={() => removeExample(index)}>
//                              <Trash2 className="h-4 w-4 text-destructive" />
//                            </Button>
//                          )}
//                        </div>
//                        <div className="space-y-2">
//                          <Input
//                            value={example.input}
//                            onChange={(e) => updateExample(index, 'input', e.target.value)}
//                            placeholder="Input (e.g., nums = [1,2,3,1])"
//                          />
//                          <Input
//                            value={example.output}
//                            onChange={(e) => updateExample(index, 'output', e.target.value)}
//                            placeholder="Output (e.g., true)"
//                          />
//                          <Textarea
//                            value={example.explanation}
//                            onChange={(e) => updateExample(index, 'explanation', e.target.value)}
//                            placeholder="Explanation..."
//                            rows={2}
//                          />
//                        </div>
//                      </Card>
//                    ))}
//                  </div>
//
//                  {/* Constraints */}
//                  <div className="space-y-4">
//                    <div className="flex items-center justify-between">
//                      <Label>Constraints</Label>
//                      <Button variant="outline" size="sm" onClick={addConstraint}>
//                        <Plus className="h-4 w-4 mr-2" />
//                        Add Constraint
//                      </Button>
//                    </div>
//                    {formData.constraints.map((constraint, index) => (
//                      <div key={index} className="flex gap-2">
//                        <Input
//                          value={constraint}
//                          onChange={(e) => updateConstraint(index, e.target.value)}
//                          placeholder="e.g., 1 <= nums.length <= 10^5"
//                        />
//                        {formData.constraints.length > 1 && (
//                          <Button variant="ghost" size="sm" onClick={() => removeConstraint(index)}>
//                            <X className="h-4 w-4" />
//                          </Button>
//                        )}
//                      </div>
//                    ))}
//                  </div>
//
//                  {/* Hints */}
//                  <div className="space-y-4">
//                    <div className="flex items-center justify-between">
//                      <Label>Hints</Label>
//                      <Button variant="outline" size="sm" onClick={addHint}>
//                        <Plus className="h-4 w-4 mr-2" />
//                        Add Hint
//                      </Button>
//                    </div>
//                    {formData.hints.map((hint, index) => (
//                      <div key={index} className="flex gap-2">
//                        <Textarea
//                          value={hint}
//                          onChange={(e) => updateHint(index, e.target.value)}
//                          placeholder="Enter a hint..."
//                          rows={2}
//                        />
//                        {formData.hints.length > 1 && (
//                          <Button variant="ghost" size="sm" onClick={() => removeHint(index)}>
//                            <X className="h-4 w-4" />
//                          </Button>
//                        )}
//                      </div>
//                    ))}
//                  </div>
//
//                  {/* Starter Code */}
//                  <div className="space-y-2">
//                    <Label htmlFor="starterCode">Starter Code</Label>
//                    <Textarea
//                      id="starterCode"
//                      value={formData.starterCode}
//                      onChange={(e) => setFormData({ ...formData, starterCode: e.target.value })}
//                      placeholder="def functionName(params):&#10;    # Write your solution here&#10;    pass"
//                      rows={8}
//                      className="font-mono text-sm"
//                    />
//                  </div>
//
//                  {/* Solution Code */}
//                  <div className="space-y-2">
//                    <Label htmlFor="solution">Solution Code</Label>
//                    <Textarea
//                      id="solution"
//                      value={formData.solution}
//                      onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
//                      placeholder="def functionName(params):&#10;    # Solution implementation&#10;    pass"
//                      rows={8}
//                      className="font-mono text-sm"
//                    />
//                  </div>
//
//                  {/* Action Buttons */}
//                  <div className="flex gap-3 justify-end pt-4 border-t">
//                    <Button variant="outline" onClick={resetForm}>
//                      Cancel
//                    </Button>
//                    <Button onClick={handleSubmit} className="gap-2">
//                      <Save className="h-4 w-4" />
//                      {editingId ? 'Update Problem' : 'Create Problem'}
//                    </Button>
//                  </div>
//                </div>
//              </Card>
//            )}
//
//            {/* Problems List */}
//            <div className="space-y-4">
//              <h2 className="text-2xl font-bold">All Problems ({problems.length})</h2>
//              {problems.map((problem) => (
//                <Card key={problem.id} className="p-4">
//                  <div className="flex items-center justify-between">
//                    <div className="flex-1">
//                      <div className="flex items-center gap-4 mb-2">
//                        <span className="text-muted-foreground text-sm">#{problem.id}</span>
//                        <h3 className="font-medium">{problem.title}</h3>
//                        <Badge variant="secondary" className={getDifficultyColor(problem.difficulty)}>
//                          {problem.difficulty}
//                        </Badge>
//                        <span className="text-sm text-muted-foreground">{problem.category}</span>
//                      </div>
//                      {problem.description && (
//                        <p className="text-sm text-muted-foreground line-clamp-2">
//                          {problem.description}
//                        </p>
//                      )}
//                    </div>
//                    <div className="flex gap-2 ml-4">
//                      <Button variant="outline" size="sm" onClick={() => handleEdit(problem)}>
//                        <Edit className="h-4 w-4" />
//                      </Button>
//                      <Button
//                        variant="outline"
//                        size="sm"
//                        onClick={() => {
//                          if (confirm(`Are you sure you want to delete "${problem.title}"?`)) {
//                            onDeleteProblem(problem.id);
//                          }
//                        }}
//                      >
//                        <Trash2 className="h-4 w-4 text-destructive" />
//                      </Button>
//                    </div>
//                  </div>
//                </Card>
//              ))}
//            </div>
//          </TabsContent>
//
//          {/* Statistics Tab */}
//          <TabsContent value="statistics" className="space-y-6">
//            <Card className="p-6">
//              <h2 className="text-2xl font-bold mb-6">Platform Statistics</h2>
//              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                <div className="space-y-2">
//                  <p className="text-sm text-muted-foreground">Total Problems</p>
//                  <p className="text-3xl font-bold">{problems.length}</p>
//                </div>
//                <div className="space-y-2">
//                  <p className="text-sm text-muted-foreground">Easy Problems</p>
//                  <p className="text-3xl font-bold text-green-600">
//                    {problems.filter(p => p.difficulty === 'Easy').length}
//                  </p>
//                </div>
//                <div className="space-y-2">
//                  <p className="text-sm text-muted-foreground">Medium Problems</p>
//                  <p className="text-3xl font-bold text-yellow-600">
//                    {problems.filter(p => p.difficulty === 'Medium').length}
//                  </p>
//                </div>
//                <div className="space-y-2">
//                  <p className="text-sm text-muted-foreground">Hard Problems</p>
//                  <p className="text-3xl font-bold text-red-600">
//                    {problems.filter(p => p.difficulty === 'Hard').length}
//                  </p>
//                </div>
//                <div className="space-y-2">
//                  <p className="text-sm text-muted-foreground">Categories</p>
//                  <p className="text-3xl font-bold">
//                    {new Set(problems.map(p => p.category)).size}
//                  </p>
//                </div>
//                <div className="space-y-2">
//                  <p className="text-sm text-muted-foreground">Avg Acceptance</p>
//                  <p className="text-3xl font-bold">
//                    {problems.length > 0
//                      ? (problems.reduce((acc, p) => acc + parseFloat(p.acceptance), 0) / problems.length).toFixed(1) + '%'
//                      : '0%'
//                    }
//                  </p>
//                </div>
//              </div>
//            </Card>
//          </TabsContent>
//
//          {/* Settings Tab */}
//          <TabsContent value="settings" className="space-y-6">
//            <Card className="p-6">
//              <h2 className="text-2xl font-bold mb-6">Settings</h2>
//              <p className="text-muted-foreground">
//                Additional settings and configurations will be available here.
//              </p>
//            </Card>
//          </TabsContent>
//        </Tabs>
//      </div>
//    </div>
//  );
//}
