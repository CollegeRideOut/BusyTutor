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
      <Input
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
