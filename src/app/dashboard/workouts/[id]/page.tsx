'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Dumbbell,
  Trash2,
  MoreVertical,
  Loader2,
  Trophy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

interface SetLog {
  id: string;
  setNumber: number;
  reps: number;
  weight: number;
  weightUnit: string;
  rpe: number | null;
  isWarmup: boolean;
  isDropSet: boolean;
  isFailure: boolean;
}

interface ExerciseLog {
  id: string;
  orderIndex: number;
  exercise: {
    id: string;
    name: string;
    equipmentType: string;
    muscleContributions: Array<{
      isPrimary: boolean;
      muscleGroup: {
        name: string;
      };
    }>;
  };
  sets: SetLog[];
}

interface WorkoutSession {
  id: string;
  startTime: string;
  endTime: string | null;
  workoutType: string | null;
  name: string | null;
  notes: string | null;
  exercises: ExerciseLog[];
}

const typeColors: Record<string, string> = {
  push: 'bg-red-500/10 text-red-500',
  pull: 'bg-blue-500/10 text-blue-500',
  legs: 'bg-green-500/10 text-green-500',
  upper: 'bg-purple-500/10 text-purple-500',
  lower: 'bg-orange-500/10 text-orange-500',
  full_body: 'bg-cyan-500/10 text-cyan-500',
  custom: 'bg-gray-500/10 text-gray-500',
};

export default function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [workout, setWorkout] = useState<WorkoutSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchWorkout() {
      try {
        const res = await fetch(`/api/sessions/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError('Workout not found');
          } else {
            throw new Error('Failed to fetch workout');
          }
          return;
        }
        const data = await res.json();
        setWorkout(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setIsLoading(false);
      }
    }
    fetchWorkout();
  }, [id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/sessions/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.push('/dashboard/workouts');
      } else {
        throw new Error('Failed to delete workout');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getDuration = () => {
    if (!workout) return 0;
    const start = new Date(workout.startTime);
    const end = workout.endTime ? new Date(workout.endTime) : new Date();
    return Math.round((end.getTime() - start.getTime()) / 60000);
  };

  const getTotalVolume = () => {
    if (!workout) return 0;
    return workout.exercises.reduce((total, ex) => {
      return total + ex.sets
        .filter(s => !s.isWarmup)
        .reduce((sum, s) => sum + s.weight * s.reps, 0);
    }, 0);
  };

  const getTotalSets = () => {
    if (!workout) return 0;
    return workout.exercises.reduce((total, ex) => {
      return total + ex.sets.filter(s => !s.isWarmup).length;
    }, 0);
  };

  const getPrimaryMuscle = (exerciseLog: ExerciseLog): string => {
    const primary = exerciseLog.exercise.muscleContributions.find(mc => mc.isPrimary);
    return primary?.muscleGroup.name || 'Other';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !workout) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="text-center py-12">
          <p className="text-destructive mb-4">{error || 'Workout not found'}</p>
          <Link href="/dashboard/workouts">
            <Button>Back to Workouts</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              {workout.workoutType && (
                <span
                  className={cn(
                    'px-2 py-0.5 rounded text-xs font-medium capitalize',
                    typeColors[workout.workoutType] || typeColors.custom
                  )}
                >
                  {workout.workoutType.replace('_', ' ')}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold">
              {workout.name || `${workout.workoutType?.replace('_', ' ') || 'Workout'}`}
            </h1>
            <p className="text-muted-foreground">
              {formatDate(workout.startTime)}
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Workout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Clock className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
            <p className="text-2xl font-bold">{getDuration()}</p>
            <p className="text-xs text-muted-foreground">Minutes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Dumbbell className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
            <p className="text-2xl font-bold">{workout.exercises.length}</p>
            <p className="text-xs text-muted-foreground">Exercises</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Trophy className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
            <p className="text-2xl font-bold">{getTotalSets()}</p>
            <p className="text-xs text-muted-foreground">Sets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Calendar className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
            <p className="text-2xl font-bold">
              {(getTotalVolume() / 1000).toFixed(1)}k
            </p>
            <p className="text-xs text-muted-foreground">Volume (lb)</p>
          </CardContent>
        </Card>
      </div>

      {/* Time Info */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Started</span>
            <span>{formatTime(workout.startTime)}</span>
          </div>
          {workout.endTime && (
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-muted-foreground">Ended</span>
              <span>{formatTime(workout.endTime)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      {workout.notes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{workout.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Exercises */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Exercises</h2>
        {workout.exercises.map((exerciseLog) => (
          <Card key={exerciseLog.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">
                    {exerciseLog.exercise.name}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground capitalize">
                    {getPrimaryMuscle(exerciseLog)} • {exerciseLog.exercise.equipmentType}
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">
                  {exerciseLog.sets.filter(s => !s.isWarmup).length} sets
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {/* Set Header */}
                <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground px-2">
                  <span>Set</span>
                  <span className="text-center">Weight</span>
                  <span className="text-center">Reps</span>
                  <span className="text-center">RPE</span>
                </div>
                {/* Sets */}
                {exerciseLog.sets.map((set) => (
                  <div
                    key={set.id}
                    className={cn(
                      'grid grid-cols-4 gap-2 py-2 px-2 rounded text-sm',
                      set.isWarmup && 'bg-muted/50 text-muted-foreground'
                    )}
                  >
                    <span>
                      {set.isWarmup ? 'W' : set.setNumber}
                      {set.isDropSet && ' (D)'}
                      {set.isFailure && ' 💪'}
                    </span>
                    <span className="text-center font-medium">
                      {set.weight} lb
                    </span>
                    <span className="text-center">{set.reps}</span>
                    <span className="text-center text-muted-foreground">
                      {set.rpe || '-'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workout?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              workout and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
