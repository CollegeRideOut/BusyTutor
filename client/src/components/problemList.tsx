import { CheckCircle, Circle, Clock } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { problems } from '../db.json' with { type: 'json' };
import { useNavigate } from '@tanstack/react-router';

interface Problem {
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  status: 'solved' | 'attempted' | 'not-started';
  acceptance: string;
  category: string;
}

export function ProblemList() {
  const navigation = useNavigate();
  const getStatusIcon = (status: Problem['status']) => {
    switch (status) {
      case 'solved':
        return <CheckCircle className='h-4 w-4 text-green-500' />;
      case 'attempted':
        return <Clock className='h-4 w-4 text-yellow-500' />;
      default:
        return <Circle className='h-4 w-4 text-muted-foreground' />;
    }
  };

  const getDifficultyBadge = (difficulty: Problem['difficulty']) => {
    const colors = {
      Easy: 'bg-green-100 text-green-800 border-green-200',
      Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Hard: 'bg-red-100 text-red-800 border-red-200',
    };

    return (
      <Badge variant='secondary' className={colors[difficulty]}>
        {difficulty}
      </Badge>
    );
  };

  return (
    <div className='flex-1 p-6'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold mb-2'>
          Programming Fundamentals Challenges
        </h1>
        <p className='text-muted-foreground'>
          Master debugging, algorithms, data structures, and architecture with
          our curated collection of challenges
        </p>
      </div>

      <div className='space-y-2'>
        {problems.map((problem) => (
          <Card
            key={problem.id}
            className='p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-transparent hover:border-l-primary'
            onClick={() => {
              //TODO
              console.log('TODO nviage to the problem');
              navigation({ to: `/problems/${problem.id}` });
            }}
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                {getStatusIcon(problem.status as any)}
                <div className='flex items-center gap-2'>
                  <span className='text-muted-foreground text-sm'>
                    #{problem.id}
                  </span>
                  <span className='font-medium'>{problem.title}</span>
                </div>
              </div>

              <div className='flex items-center gap-4'>
                <span className='text-sm text-muted-foreground'>
                  {problem.category}
                </span>
                <span className='text-sm text-muted-foreground'>
                  {problem.acceptance}
                </span>
                {getDifficultyBadge(problem.difficulty as any)}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
