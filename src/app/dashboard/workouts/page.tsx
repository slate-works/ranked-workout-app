'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Calendar,
  Dumbbell,
  Clock,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RankBadge } from '@/components/rank-badge';
import { RankTier } from '@/lib/scoring';

// Mock workout history data
const mockWorkouts = [
  {
    id: '1',
    date: '2024-12-31',
    name: 'Push Day',
    type: 'push',
    duration: 65,
    exercises: [
      { name: 'Barbell Bench Press', sets: 4, topSet: '100kg x 6' },
      { name: 'Incline Dumbbell Press', sets: 3, topSet: '32kg x 10' },
      { name: 'Cable Fly', sets: 3, topSet: '15kg x 12' },
      { name: 'Overhead Press', sets: 3, topSet: '60kg x 8' },
      { name: 'Lateral Raise', sets: 3, topSet: '12kg x 15' },
      { name: 'Tricep Pushdown', sets: 3, topSet: '30kg x 12' },
    ],
    volume: 12500,
    prs: ['Barbell Bench Press 1RM'],
  },
  {
    id: '2',
    date: '2024-12-30',
    name: 'Leg Day',
    type: 'legs',
    duration: 75,
    exercises: [
      { name: 'Barbell Back Squat', sets: 5, topSet: '140kg x 5' },
      { name: 'Romanian Deadlift', sets: 4, topSet: '100kg x 8' },
      { name: 'Leg Press', sets: 3, topSet: '200kg x 10' },
      { name: 'Leg Curl', sets: 3, topSet: '45kg x 12' },
      { name: 'Calf Raise', sets: 4, topSet: '80kg x 15' },
    ],
    volume: 18200,
    prs: ['Barbell Back Squat 1RM'],
  },
  {
    id: '3',
    date: '2024-12-28',
    name: 'Pull Day',
    type: 'pull',
    duration: 60,
    exercises: [
      { name: 'Barbell Deadlift', sets: 3, topSet: '180kg x 3' },
      { name: 'Pull-Up', sets: 4, topSet: 'BW x 10' },
      { name: 'Barbell Row', sets: 4, topSet: '80kg x 8' },
      { name: 'Face Pull', sets: 3, topSet: '20kg x 15' },
      { name: 'Barbell Curl', sets: 3, topSet: '35kg x 10' },
    ],
    volume: 14800,
    prs: [],
  },
];

const typeColors: Record<string, string> = {
  push: 'bg-red-500/10 text-red-500',
  pull: 'bg-blue-500/10 text-blue-500',
  legs: 'bg-green-500/10 text-green-500',
  upper: 'bg-purple-500/10 text-purple-500',
  lower: 'bg-orange-500/10 text-orange-500',
  full_body: 'bg-cyan-500/10 text-cyan-500',
  custom: 'bg-gray-500/10 text-gray-500',
};

export default function WorkoutsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredWorkouts = mockWorkouts.filter(
    (w) =>
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.exercises.some((e) =>
        e.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Workouts</h1>
          <p className="text-muted-foreground">
            View and manage your workout history
          </p>
        </div>
        <Link href="/dashboard/workouts/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Workout
          </Button>
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search workouts or exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">{mockWorkouts.length}</p>
            <p className="text-xs text-muted-foreground">This Week</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">
              {Math.round(
                mockWorkouts.reduce((acc, w) => acc + w.duration, 0) / 60
              )}h
            </p>
            <p className="text-xs text-muted-foreground">Total Time</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">
              {(
                mockWorkouts.reduce((acc, w) => acc + w.volume, 0) / 1000
              ).toFixed(1)}k
            </p>
            <p className="text-xs text-muted-foreground">Volume (kg)</p>
          </CardContent>
        </Card>
      </div>

      {/* Workout List */}
      <div className="space-y-4">
        {filteredWorkouts.map((workout) => (
          <Link key={workout.id} href={`/dashboard/workouts/${workout.id}`}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${
                          typeColors[workout.type]
                        }`}
                      >
                        {workout.type.replace('_', ' ')}
                      </span>
                      {workout.prs.length > 0 && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/10 text-yellow-500">
                          🏆 {workout.prs.length} PR
                          {workout.prs.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <h3 className="font-medium">{workout.name}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(workout.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {workout.duration}min
                      </span>
                      <span className="flex items-center gap-1">
                        <Dumbbell className="h-3 w-3" />
                        {workout.exercises.length} exercises
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {workout.exercises.slice(0, 3).map((ex) => (
                        <span
                          key={ex.name}
                          className="px-2 py-0.5 bg-muted rounded text-xs"
                        >
                          {ex.name}
                        </span>
                      ))}
                      {workout.exercises.length > 3 && (
                        <span className="px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground">
                          +{workout.exercises.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {filteredWorkouts.length === 0 && (
          <div className="text-center py-12">
            <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">No workouts found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery
                ? 'Try a different search term'
                : 'Start your first workout to begin tracking'}
            </p>
            {!searchQuery && (
              <Link href="/dashboard/workouts/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Start Workout
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
