import { createFileRoute } from '@tanstack/react-router';
import {
  User,
  Trophy,
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  Circle,
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';

export const Route = createFileRoute('/practice')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className='flex h-full'>
      <PracticeSidebar />
      <ProblemList />
    </div>
  );
}

export function PracticeSidebar() {
  return (
    <div className='w-80 bg-card/50 border-r p-6 space-y-6'>
      {/* User Profile */}
      <Card className='p-4'>
        <div className='flex items-center gap-3 mb-4'>
          <div className='h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center'>
            <User className='h-6 w-6 text-primary' />
          </div>
          <div>
            <h3 className='font-semibold'>Guest User</h3>
            <p className='text-sm text-muted-foreground'>Beginner</p>
          </div>
        </div>
        <div className='space-y-2'>
          <div className='flex justify-between text-sm'>
            <span>Progress</span>
            <span>23%</span>
          </div>
          <Progress value={23} className='h-2' />
        </div>
      </Card>

      {/* Statistics */}
      <Card className='p-4'>
        <h3 className='font-semibold mb-4 flex items-center gap-2'>
          <TrendingUp className='h-4 w-4' />
          Your Statistics
        </h3>
        <div className='space-y-3'>
          <div className='flex justify-between items-center'>
            <span className='text-sm text-muted-foreground'>
              Problems Solved
            </span>
            <span className='font-semibold'>23/100</span>
          </div>
          <div className='flex justify-between items-center'>
            <span className='text-sm text-muted-foreground'>Success Rate</span>
            <span className='font-semibold'>87%</span>
          </div>
          <div className='flex justify-between items-center'>
            <span className='text-sm text-muted-foreground'>Streak</span>
            <span className='font-semibold'>5 days</span>
          </div>
        </div>
      </Card>

      {/* Problem Levels */}
      <Card className='p-4'>
        <h3 className='font-semibold mb-4 flex items-center gap-2'>
          <Target className='h-4 w-4' />
          Problem Levels
        </h3>
        <div className='space-y-3'>
          <div className='flex justify-between items-center'>
            <div className='flex items-center gap-2'>
              <Badge
                variant='secondary'
                className='bg-green-100 text-green-800 border-green-200'
              >
                Easy
              </Badge>
            </div>
            <span className='text-sm'>18/35</span>
          </div>
          <div className='flex justify-between items-center'>
            <div className='flex items-center gap-2'>
              <Badge
                variant='secondary'
                className='bg-yellow-100 text-yellow-800 border-yellow-200'
              >
                Medium
              </Badge>
            </div>
            <span className='text-sm'>4/40</span>
          </div>
          <div className='flex justify-between items-center'>
            <div className='flex items-center gap-2'>
              <Badge
                variant='secondary'
                className='bg-red-100 text-red-800 border-red-200'
              >
                Hard
              </Badge>
            </div>
            <span className='text-sm'>1/25</span>
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className='p-4'>
        <h3 className='font-semibold mb-4 flex items-center gap-2'>
          <Clock className='h-4 w-4' />
          Recent Activity
        </h3>
        <div className='space-y-3'>
          <div className='text-sm'>
            <div className='flex justify-between'>
              <span>Debug Loop Error</span>
              <Badge
                variant='secondary'
                className='bg-green-100 text-green-800 border-green-200 text-xs'
              >
                Solved
              </Badge>
            </div>
            <p className='text-muted-foreground text-xs'>2 hours ago</p>
          </div>
          <div className='text-sm'>
            <div className='flex justify-between'>
              <span>Binary Search Tree</span>
              <Badge
                variant='secondary'
                className='bg-green-100 text-green-800 border-green-200 text-xs'
              >
                Solved
              </Badge>
            </div>
            <p className='text-muted-foreground text-xs'>Yesterday</p>
          </div>
          <div className='text-sm'>
            <div className='flex justify-between'>
              <span>API Architecture</span>
              <Badge
                variant='secondary'
                className='bg-yellow-100 text-yellow-800 border-yellow-200 text-xs'
              >
                Attempted
              </Badge>
            </div>
            <p className='text-muted-foreground text-xs'>2 days ago</p>
          </div>
        </div>
      </Card>

      {/* Achievements */}
      <Card className='p-4'>
        <h3 className='font-semibold mb-4 flex items-center gap-2'>
          <Trophy className='h-4 w-4' />
          Achievements
        </h3>
        <div className='grid grid-cols-3 gap-2'>
          <div className='text-center p-2 bg-muted/50 rounded-md'>
            <Trophy className='h-6 w-6 mx-auto text-yellow-500 mb-1' />
            <p className='text-xs'>First Solve</p>
          </div>
          <div className='text-center p-2 bg-muted/50 rounded-md'>
            <Target className='h-6 w-6 mx-auto text-blue-500 mb-1' />
            <p className='text-xs'>10 Problems</p>
          </div>
          <div className='text-center p-2 bg-muted/30 rounded-md opacity-50'>
            <TrendingUp className='h-6 w-6 mx-auto text-muted-foreground mb-1' />
            <p className='text-xs'>Weekly Streak</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
interface Problem {
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  status: 'solved' | 'attempted' | 'not-started';
  acceptance: string;
  category: string;
}

const problems: Problem[] = [
  {
    id: 1,
    title: 'Debug Basic Loop',
    difficulty: 'Easy',
    status: 'solved',
    acceptance: '95.2%',
    category: 'Debugging',
  },
  {
    id: 2,
    title: 'Two Sum Algorithm',
    difficulty: 'Easy',
    status: 'solved',
    acceptance: '87.4%',
    category: 'Algorithms',
  },
  {
    id: 3,
    title: 'Stack Implementation',
    difficulty: 'Easy',
    status: 'solved',
    acceptance: '91.8%',
    category: 'Data Structures',
  },
  {
    id: 4,
    title: 'Memory Leak Detection',
    difficulty: 'Easy',
    status: 'attempted',
    acceptance: '78.9%',
    category: 'Debugging',
  },
  {
    id: 5,
    title: 'Array Search Optimization',
    difficulty: 'Easy',
    status: 'solved',
    acceptance: '89.3%',
    category: 'Algorithms',
  },
  {
    id: 6,
    title: 'Queue Operations',
    difficulty: 'Easy',
    status: 'solved',
    acceptance: '92.1%',
    category: 'Data Structures',
  },
  {
    id: 7,
    title: 'Binary Search Tree',
    difficulty: 'Medium',
    status: 'attempted',
    acceptance: '67.5%',
    category: 'Data Structures',
  },
  {
    id: 8,
    title: 'Merge Sort Analysis',
    difficulty: 'Medium',
    status: 'not-started',
    acceptance: '45.8%',
    category: 'Algorithms',
  },
  {
    id: 9,
    title: 'Race Condition Fix',
    difficulty: 'Easy',
    status: 'solved',
    acceptance: '83.7%',
    category: 'Debugging',
  },
  {
    id: 10,
    title: 'Hash Table Design',
    difficulty: 'Medium',
    status: 'not-started',
    acceptance: '52.4%',
    category: 'Data Structures',
  },
  {
    id: 11,
    title: 'Linked List Debugging',
    difficulty: 'Medium',
    status: 'not-started',
    acceptance: '41.2%',
    category: 'Debugging',
  },
  {
    id: 12,
    title: 'Graph Traversal',
    difficulty: 'Medium',
    status: 'not-started',
    acceptance: '33.8%',
    category: 'Algorithms',
  },
  {
    id: 13,
    title: 'MVC Architecture',
    difficulty: 'Medium',
    status: 'not-started',
    acceptance: '48.9%',
    category: 'Architecture',
  },
  {
    id: 14,
    title: 'Sorting Algorithms',
    difficulty: 'Medium',
    status: 'not-started',
    acceptance: '56.7%',
    category: 'Algorithms',
  },
  {
    id: 15,
    title: 'Database Schema Design',
    difficulty: 'Medium',
    status: 'not-started',
    acceptance: '42.1%',
    category: 'Architecture',
  },
  {
    id: 16,
    title: 'Tree Balancing',
    difficulty: 'Medium',
    status: 'not-started',
    acceptance: '51.3%',
    category: 'Data Structures',
  },
  {
    id: 17,
    title: 'API Design Patterns',
    difficulty: 'Medium',
    status: 'not-started',
    acceptance: '38.6%',
    category: 'Architecture',
  },
  {
    id: 18,
    title: 'Dynamic Programming',
    difficulty: 'Medium',
    status: 'not-started',
    acceptance: '49.2%',
    category: 'Algorithms',
  },
  {
    id: 19,
    title: 'Microservices Debug',
    difficulty: 'Medium',
    status: 'not-started',
    acceptance: '61.8%',
    category: 'Debugging',
  },
  {
    id: 20,
    title: 'Cache Architecture',
    difficulty: 'Medium',
    status: 'not-started',
    acceptance: '39.4%',
    category: 'Architecture',
  },
];

// Generate more problems to reach 100
for (let i = 21; i <= 100; i++) {
  const difficulties = ['Easy', 'Medium', 'Hard'] as const;
  const categories = [
    'Algorithms',
    'Data Structures',
    'Debugging',
    'Architecture',
    'Performance',
    'Testing',
  ];
  const difficulty =
    difficulties[Math.floor(Math.random() * difficulties.length)];
  const category = categories[Math.floor(Math.random() * categories.length)];
  const acceptance = `${Math.floor(Math.random() * 60 + 20)}.${Math.floor(Math.random() * 10)}%`;

  const topicPrefixes = {
    Algorithms: ['Sort', 'Search', 'Graph', 'Tree', 'Hash'],
    'Data Structures': ['Stack', 'Queue', 'Tree', 'Graph', 'Heap'],
    Debugging: ['Memory', 'Logic', 'Performance', 'Race', 'Deadlock'],
    Architecture: ['Design', 'Pattern', 'System', 'API', 'Database'],
    Performance: ['Optimize', 'Cache', 'Memory', 'Speed', 'Scale'],
    Testing: ['Unit', 'Integration', 'Mock', 'Coverage', 'E2E'],
  };

  const prefix =
    topicPrefixes[category][
      Math.floor(Math.random() * topicPrefixes[category].length)
    ];

  problems.push({
    id: i,
    title: `${prefix} Challenge ${i}`,
    difficulty,
    status: 'not-started',
    acceptance,
    category,
  });
}

export function ProblemList() {
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
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                {getStatusIcon(problem.status)}
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
                {getDifficultyBadge(problem.difficulty)}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
