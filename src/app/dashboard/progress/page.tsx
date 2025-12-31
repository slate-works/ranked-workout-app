'use client';

import { useState } from 'react';
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
import { RankTier } from '@/lib/scoring';

// Mock progress data
const mockProgressData = {
  overallScore: 67.5,
  rank: 'champion' as RankTier,
  rankProgress: 35,
  weeklyChange: +2.3,
  monthlyChange: +8.7,
  
  muscleGroups: [
    { name: 'Chest', score: 72, change: +3.2, rank: 'champion' as RankTier },
    { name: 'Back', score: 68, change: +2.1, rank: 'diamond' as RankTier },
    { name: 'Shoulders', score: 65, change: +1.8, rank: 'diamond' as RankTier },
    { name: 'Biceps', score: 63, change: +2.5, rank: 'diamond' as RankTier },
    { name: 'Triceps', score: 61, change: +1.2, rank: 'diamond' as RankTier },
    { name: 'Quads', score: 75, change: +4.1, rank: 'champion' as RankTier },
    { name: 'Hamstrings', score: 58, change: -0.5, rank: 'diamond' as RankTier },
    { name: 'Glutes', score: 56, change: +0.8, rank: 'diamond' as RankTier },
    { name: 'Core', score: 52, change: +1.5, rank: 'gold' as RankTier },
    { name: 'Calves', score: 45, change: +0.3, rank: 'gold' as RankTier },
  ],
  
  recentPRs: [
    { exercise: 'Barbell Bench Press', value: '110kg', date: '2024-12-31', improvement: '+5kg' },
    { exercise: 'Barbell Back Squat', value: '150kg', date: '2024-12-30', improvement: '+10kg' },
    { exercise: 'Barbell Deadlift', value: '190kg', date: '2024-12-28', improvement: '+5kg' },
    { exercise: 'Overhead Press', value: '70kg', date: '2024-12-25', improvement: '+2.5kg' },
    { exercise: 'Barbell Row', value: '90kg', date: '2024-12-22', improvement: '+5kg' },
  ],
  
  volumeHistory: [
    { week: 'W1', volume: 42000 },
    { week: 'W2', volume: 45000 },
    { week: 'W3', volume: 43500 },
    { week: 'W4', volume: 48000 },
    { week: 'W5', volume: 51000 },
    { week: 'W6', volume: 49000 },
    { week: 'W7', volume: 52500 },
    { week: 'W8', volume: 55000 },
  ],
  
  exerciseProgress: [
    { 
      name: 'Barbell Bench Press',
      currentMax: 110,
      previousMax: 95,
      history: [85, 90, 92, 95, 100, 105, 107, 110],
    },
    {
      name: 'Barbell Back Squat',
      currentMax: 150,
      previousMax: 130,
      history: [110, 120, 125, 130, 135, 140, 145, 150],
    },
    {
      name: 'Barbell Deadlift',
      currentMax: 190,
      previousMax: 170,
      history: [150, 160, 165, 170, 175, 180, 185, 190],
    },
  ],
};

const muscleScores: Record<string, number> = {
  chest: 72,
  back: 68,
  shoulders: 65,
  biceps: 63,
  triceps: 61,
  core: 52,
  quads: 75,
  hamstrings: 58,
  glutes: 56,
  calves: 45,
};

export default function ProgressPage() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);

  const maxVolume = Math.max(...mockProgressData.volumeHistory.map(v => v.volume));

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
                <RankBadge rank={mockProgressData.rank} size="lg" showLabel />
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold">{mockProgressData.overallScore}</span>
                  <span className="text-muted-foreground">/ 100</span>
                </div>
                <RankProgress 
                  currentRank={mockProgressData.rank} 
                  progress={mockProgressData.rankProgress}
                  showNextRank
                />
                <div className="flex gap-4 mt-4 text-sm">
                  <div className="flex items-center gap-1">
                    {getTrendIcon(mockProgressData.weeklyChange)}
                    <span className={getTrendColor(mockProgressData.weeklyChange)}>
                      {mockProgressData.weeklyChange > 0 ? '+' : ''}{mockProgressData.weeklyChange}
                    </span>
                    <span className="text-muted-foreground">this week</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(mockProgressData.monthlyChange)}
                    <span className={getTrendColor(mockProgressData.monthlyChange)}>
                      {mockProgressData.monthlyChange > 0 ? '+' : ''}{mockProgressData.monthlyChange}
                    </span>
                    <span className="text-muted-foreground">this month</span>
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
            {mockProgressData.recentPRs.slice(0, 3).map((pr) => (
              <div key={pr.exercise} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{pr.exercise}</p>
                  <p className="text-xs text-muted-foreground">{pr.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{pr.value}</p>
                  <p className="text-xs text-green-500">{pr.improvement}</p>
                </div>
              </div>
            ))}
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
              muscleScores={muscleScores}
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
            {mockProgressData.muscleGroups.map((muscle) => (
              <div 
                key={muscle.name}
                className={`p-3 rounded-lg transition-colors ${
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
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{muscle.score}</span>
                    <span className={`text-xs ${getTrendColor(muscle.change)}`}>
                      {muscle.change > 0 ? '+' : ''}{muscle.change}
                    </span>
                  </div>
                </div>
                <Progress value={muscle.score} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Volume Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            Weekly Volume Trend
          </CardTitle>
          <CardDescription>
            Total training volume over the past 8 weeks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-end gap-2">
            {mockProgressData.volumeHistory.map((week, index) => (
              <div key={week.week} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-primary rounded-t transition-all hover:bg-primary/80"
                  style={{ 
                    height: `${(week.volume / maxVolume) * 100}%`,
                    minHeight: '8px'
                  }}
                />
                <span className="text-xs text-muted-foreground">{week.week}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-sm">
            <div>
              <span className="text-muted-foreground">Average: </span>
              <span className="font-medium">
                {Math.round(mockProgressData.volumeHistory.reduce((a, b) => a + b.volume, 0) / mockProgressData.volumeHistory.length / 1000)}k kg
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Peak: </span>
              <span className="font-medium">{Math.round(maxVolume / 1000)}k kg</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exercise Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Key Lifts Progress
          </CardTitle>
          <CardDescription>
            Estimated 1RM progression for compound movements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {mockProgressData.exerciseProgress.map((exercise) => {
              const maxValue = Math.max(...exercise.history) * 1.1;
              const improvement = exercise.currentMax - exercise.previousMax;
              const improvementPercent = ((improvement / exercise.previousMax) * 100).toFixed(1);
              
              return (
                <div key={exercise.name} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{exercise.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Current: {exercise.currentMax}kg • Previous: {exercise.previousMax}kg
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-green-500">
                        +{improvement}kg
                      </span>
                      <p className="text-xs text-muted-foreground">
                        +{improvementPercent}%
                      </p>
                    </div>
                  </div>
                  <div className="h-16 flex items-end gap-1">
                    {exercise.history.map((value, index) => (
                      <div 
                        key={index}
                        className="flex-1 bg-primary/60 rounded-t hover:bg-primary transition-all"
                        style={{ height: `${(value / maxValue) * 100}%` }}
                        title={`${value}kg`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
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
                <li>• Quads are your strongest muscle group at Champion rank</li>
                <li>• Chest has shown excellent progress (+3.2 this week)</li>
                <li>• Consistent squat improvement of 15% over 8 weeks</li>
              </ul>
            </div>
            <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <h4 className="font-medium text-yellow-500 mb-2">🎯 Areas to Focus</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Calves need attention - lowest score at Gold rank</li>
                <li>• Hamstrings showing slight decline (-0.5)</li>
                <li>• Core training could be increased for balance</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
