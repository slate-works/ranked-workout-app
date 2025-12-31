'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Dumbbell,
  Target,
  Award,
  Calendar,
  ChevronDown,
  Info,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RankBadge, RankProgress } from '@/components/rank-badge';
import { AnatomyVisualization, MuscleGroupData } from '@/components/anatomy-visualization';
import { RankTier, getRankTier } from '@/lib/scoring';

interface DashboardStats {
  user: { name: string | null; email: string };
  stats: {
    workoutsThisWeek: number;
    totalWorkouts: number;
    currentStreak: number;
    longestStreak: number;
    weeklyVolume: number;
  };
  rank: { overall: RankTier; score: number; progress: number };
  muscleScores: Record<string, number>;
  muscleRecovery: Record<string, number>;
  recentPRs: Array<{
    exercise: string;
    weight: number;
    reps: number;
    estimated1RM: number;
    date: string;
  }>;
}

export default function ProgressPage() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/stats');
        if (!res.ok) throw new Error('Failed to fetch stats');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-muted-foreground';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error || 'No data available'}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  // Build muscle group data from stats
  const muscleGroupsData = Object.entries(stats.muscleScores).map(([name, score]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    score,
    change: 0, // We don't have historical data yet
    rank: getRankTier(score),
  }));

  // Create muscleScores object for anatomy visualization
  const muscleScoresForViz: Record<string, number> = {};
  Object.entries(stats.muscleScores).forEach(([name, score]) => {
    muscleScoresForViz[name] = score;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Progress</h1>
          <p className="text-muted-foreground">
            Track your strength gains and improvements
          </p>
        </div>
        <div className="flex gap-2">
          {(['week', 'month', 'year'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
              className="capitalize"
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* Overall Progress */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Overall Strength Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <RankBadge rank={stats.rank.overall} size="lg" showLabel />
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold">{stats.rank.score}</span>
                  <span className="text-muted-foreground">/ 100</span>
                </div>
                <RankProgress 
                  currentRank={stats.rank.overall} 
                  progress={stats.rank.progress}
                  showNextRank
                />
                <div className="flex gap-4 mt-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Dumbbell className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {stats.stats.totalWorkouts} total workouts
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Recent PRs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.recentPRs.length > 0 ? (
              stats.recentPRs.slice(0, 3).map((pr, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{pr.exercise}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(pr.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{Math.round(pr.estimated1RM)}lb</p>
                    <p className="text-xs text-muted-foreground">Est. 1RM</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No PRs yet. Log workouts to track progress!
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Muscle Group Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Muscle Group Scores</CardTitle>
            <CardDescription>
              Individual strength scores by muscle group
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnatomyVisualization
              muscleScores={muscleScoresForViz}
              onMuscleClick={(muscle: MuscleGroupData) => setSelectedMuscle(muscle.name.toLowerCase())}
              selectedMuscle={selectedMuscle}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Muscle Group Breakdown</CardTitle>
            <CardDescription>
              Detailed progress for each muscle group
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {muscleGroupsData.length > 0 ? (
              muscleGroupsData.map((muscle) => (
                <div 
                  key={muscle.name}
                  className={`p-3 rounded-lg transition-colors cursor-pointer ${
                    selectedMuscle === muscle.name.toLowerCase()
                      ? 'bg-primary/10 ring-1 ring-primary'
                      : 'bg-muted/50 hover:bg-muted'
                  }`}
                  onClick={() => setSelectedMuscle(muscle.name.toLowerCase())}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <RankBadge rank={muscle.rank} size="sm" />
                      <span className="font-medium">{muscle.name}</span>
                    </div>
                    <span className="font-bold">{muscle.score}</span>
                  </div>
                  <Progress value={muscle.score} className="h-2" />
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No muscle data yet. Log workouts to see your progress!
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Volume Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            Training Stats
          </CardTitle>
          <CardDescription>
            Your workout volume and consistency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{stats.stats.totalWorkouts}</p>
              <p className="text-sm text-muted-foreground">Total Workouts</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{stats.stats.workoutsThisWeek}</p>
              <p className="text-sm text-muted-foreground">This Week</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{stats.stats.currentStreak}</p>
              <p className="text-sm text-muted-foreground">Current Streak</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">
                {stats.stats.weeklyVolume > 0
                  ? `${(stats.stats.weeklyVolume / 1000).toFixed(1)}k`
                  : '0'}
              </p>
              <p className="text-sm text-muted-foreground">Weekly Volume (lb)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <h4 className="font-medium text-green-500 mb-2">💪 Strengths</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                {muscleGroupsData.length > 0 ? (
                  <>
                    {muscleGroupsData
                      .filter(m => m.score > 0)
                      .sort((a, b) => b.score - a.score)
                      .slice(0, 3)
                      .map((m, i) => (
                        <li key={i}>• {m.name} is at {m.rank} rank ({m.score}/100)</li>
                      ))}
                    {muscleGroupsData.filter(m => m.score > 0).length === 0 && (
                      <li>• Start logging workouts to identify strengths</li>
                    )}
                  </>
                ) : (
                  <li>• Log workouts to see your strengths</li>
                )}
              </ul>
            </div>
            <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <h4 className="font-medium text-yellow-500 mb-2">🎯 Areas to Focus</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                {muscleGroupsData.length > 0 ? (
                  <>
                    {muscleGroupsData
                      .filter(m => m.score === 0)
                      .slice(0, 3)
                      .map((m, i) => (
                        <li key={i}>• {m.name} needs attention - no PRs recorded</li>
                      ))}
                    {muscleGroupsData.filter(m => m.score === 0).length === 0 && (
                      <li>• Great job! You&apos;re training all muscle groups</li>
                    )}
                  </>
                ) : (
                  <li>• Log workouts to identify areas to improve</li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
