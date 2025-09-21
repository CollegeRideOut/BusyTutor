import { User, Trophy, Target, TrendingUp, Clock } from 'lucide-react';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';

export function PracticeSidebar() {
  return (
    <div className="w-80 bg-card/50 border-r p-6 space-y-6">
      {/* User Profile */}
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Guest User</h3>
            <p className="text-sm text-muted-foreground">Beginner</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>23%</span>
          </div>
          <Progress value={23} className="h-2" />
        </div>
      </Card>

      {/* Statistics */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Your Statistics
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Problems Solved</span>
            <span className="font-semibold">23/100</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Success Rate</span>
            <span className="font-semibold">87%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Streak</span>
            <span className="font-semibold">5 days</span>
          </div>
        </div>
      </Card>

      {/* Problem Levels */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Target className="h-4 w-4" />
          Problem Levels
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                Easy
              </Badge>
            </div>
            <span className="text-sm">18/35</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                Medium
              </Badge>
            </div>
            <span className="text-sm">4/40</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">
                Hard
              </Badge>
            </div>
            <span className="text-sm">1/25</span>
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Recent Activity
        </h3>
        <div className="space-y-3">
          <div className="text-sm">
            <div className="flex justify-between">
              <span>Debug Loop Error</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 text-xs">
                Solved
              </Badge>
            </div>
            <p className="text-muted-foreground text-xs">2 hours ago</p>
          </div>
          <div className="text-sm">
            <div className="flex justify-between">
              <span>Binary Search Tree</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 text-xs">
                Solved
              </Badge>
            </div>
            <p className="text-muted-foreground text-xs">Yesterday</p>
          </div>
          <div className="text-sm">
            <div className="flex justify-between">
              <span>API Architecture</span>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                Attempted
              </Badge>
            </div>
            <p className="text-muted-foreground text-xs">2 days ago</p>
          </div>
        </div>
      </Card>

      {/* Achievements */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Trophy className="h-4 w-4" />
          Achievements
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-muted/50 rounded-md">
            <Trophy className="h-6 w-6 mx-auto text-yellow-500 mb-1" />
            <p className="text-xs">First Solve</p>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-md">
            <Target className="h-6 w-6 mx-auto text-blue-500 mb-1" />
            <p className="text-xs">10 Problems</p>
          </div>
          <div className="text-center p-2 bg-muted/30 rounded-md opacity-50">
            <TrendingUp className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
            <p className="text-xs">Weekly Streak</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
