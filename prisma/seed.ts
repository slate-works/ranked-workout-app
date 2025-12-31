import { PrismaClient } from '../src/generated/prisma/index.js';

const prisma = new PrismaClient();

// Muscle groups data
const muscleGroups = [
  { name: 'chest', bodyArea: 'upper' },
  { name: 'back', bodyArea: 'upper' },
  { name: 'shoulders', bodyArea: 'upper' },
  { name: 'biceps', bodyArea: 'upper' },
  { name: 'triceps', bodyArea: 'upper' },
  { name: 'quads', bodyArea: 'lower' },
  { name: 'hamstrings', bodyArea: 'lower' },
  { name: 'glutes', bodyArea: 'lower' },
  { name: 'calves', bodyArea: 'lower' },
  { name: 'core', bodyArea: 'core' },
];

// Exercise data with muscle group mappings
// Format: { name, equipment, movement, muscles: [{ name, isPrimary, contribution }] }
const exercises = [
  // CHEST EXERCISES
  {
    name: 'Barbell Bench Press',
    equipmentType: 'barbell',
    movementPattern: 'push',
    muscles: [
      { name: 'chest', isPrimary: true, contribution: 0.6 },
      { name: 'triceps', isPrimary: false, contribution: 0.25 },
      { name: 'shoulders', isPrimary: false, contribution: 0.15 },
    ],
  },
  {
    name: 'Incline Barbell Bench Press',
    equipmentType: 'barbell',
    movementPattern: 'push',
    muscles: [
      { name: 'chest', isPrimary: true, contribution: 0.55 },
      { name: 'shoulders', isPrimary: false, contribution: 0.25 },
      { name: 'triceps', isPrimary: false, contribution: 0.2 },
    ],
  },
  {
    name: 'Dumbbell Bench Press',
    equipmentType: 'dumbbell',
    movementPattern: 'push',
    muscles: [
      { name: 'chest', isPrimary: true, contribution: 0.6 },
      { name: 'triceps', isPrimary: false, contribution: 0.25 },
      { name: 'shoulders', isPrimary: false, contribution: 0.15 },
    ],
  },
  {
    name: 'Incline Dumbbell Press',
    equipmentType: 'dumbbell',
    movementPattern: 'push',
    muscles: [
      { name: 'chest', isPrimary: true, contribution: 0.55 },
      { name: 'shoulders', isPrimary: false, contribution: 0.25 },
      { name: 'triceps', isPrimary: false, contribution: 0.2 },
    ],
  },
  {
    name: 'Dumbbell Fly',
    equipmentType: 'dumbbell',
    movementPattern: 'isolation',
    muscles: [{ name: 'chest', isPrimary: true, contribution: 1.0 }],
  },
  {
    name: 'Cable Fly',
    equipmentType: 'cable',
    movementPattern: 'isolation',
    muscles: [{ name: 'chest', isPrimary: true, contribution: 1.0 }],
  },
  {
    name: 'Push-Up',
    equipmentType: 'bodyweight',
    movementPattern: 'push',
    muscles: [
      { name: 'chest', isPrimary: true, contribution: 0.55 },
      { name: 'triceps', isPrimary: false, contribution: 0.3 },
      { name: 'shoulders', isPrimary: false, contribution: 0.15 },
    ],
  },
  {
    name: 'Chest Dip',
    equipmentType: 'bodyweight',
    movementPattern: 'push',
    muscles: [
      { name: 'chest', isPrimary: true, contribution: 0.5 },
      { name: 'triceps', isPrimary: false, contribution: 0.35 },
      { name: 'shoulders', isPrimary: false, contribution: 0.15 },
    ],
  },
  {
    name: 'Machine Chest Press',
    equipmentType: 'machine',
    movementPattern: 'push',
    muscles: [
      { name: 'chest', isPrimary: true, contribution: 0.6 },
      { name: 'triceps', isPrimary: false, contribution: 0.25 },
      { name: 'shoulders', isPrimary: false, contribution: 0.15 },
    ],
  },

  // BACK EXERCISES
  {
    name: 'Barbell Deadlift',
    equipmentType: 'barbell',
    movementPattern: 'hinge',
    muscles: [
      { name: 'back', isPrimary: true, contribution: 0.4 },
      { name: 'hamstrings', isPrimary: false, contribution: 0.25 },
      { name: 'glutes', isPrimary: false, contribution: 0.25 },
      { name: 'core', isPrimary: false, contribution: 0.1 },
    ],
  },
  {
    name: 'Romanian Deadlift',
    equipmentType: 'barbell',
    movementPattern: 'hinge',
    muscles: [
      { name: 'hamstrings', isPrimary: true, contribution: 0.45 },
      { name: 'glutes', isPrimary: false, contribution: 0.3 },
      { name: 'back', isPrimary: false, contribution: 0.25 },
    ],
  },
  {
    name: 'Barbell Row',
    equipmentType: 'barbell',
    movementPattern: 'pull',
    muscles: [
      { name: 'back', isPrimary: true, contribution: 0.6 },
      { name: 'biceps', isPrimary: false, contribution: 0.25 },
      { name: 'shoulders', isPrimary: false, contribution: 0.15 },
    ],
  },
  {
    name: 'Dumbbell Row',
    equipmentType: 'dumbbell',
    movementPattern: 'pull',
    muscles: [
      { name: 'back', isPrimary: true, contribution: 0.65 },
      { name: 'biceps', isPrimary: false, contribution: 0.25 },
      { name: 'shoulders', isPrimary: false, contribution: 0.1 },
    ],
  },
  {
    name: 'Pull-Up',
    equipmentType: 'bodyweight',
    movementPattern: 'pull',
    muscles: [
      { name: 'back', isPrimary: true, contribution: 0.6 },
      { name: 'biceps', isPrimary: false, contribution: 0.3 },
      { name: 'shoulders', isPrimary: false, contribution: 0.1 },
    ],
  },
  {
    name: 'Chin-Up',
    equipmentType: 'bodyweight',
    movementPattern: 'pull',
    muscles: [
      { name: 'back', isPrimary: true, contribution: 0.5 },
      { name: 'biceps', isPrimary: false, contribution: 0.4 },
      { name: 'shoulders', isPrimary: false, contribution: 0.1 },
    ],
  },
  {
    name: 'Lat Pulldown',
    equipmentType: 'cable',
    movementPattern: 'pull',
    muscles: [
      { name: 'back', isPrimary: true, contribution: 0.65 },
      { name: 'biceps', isPrimary: false, contribution: 0.25 },
      { name: 'shoulders', isPrimary: false, contribution: 0.1 },
    ],
  },
  {
    name: 'Seated Cable Row',
    equipmentType: 'cable',
    movementPattern: 'pull',
    muscles: [
      { name: 'back', isPrimary: true, contribution: 0.6 },
      { name: 'biceps', isPrimary: false, contribution: 0.25 },
      { name: 'shoulders', isPrimary: false, contribution: 0.15 },
    ],
  },
  {
    name: 'T-Bar Row',
    equipmentType: 'barbell',
    movementPattern: 'pull',
    muscles: [
      { name: 'back', isPrimary: true, contribution: 0.65 },
      { name: 'biceps', isPrimary: false, contribution: 0.2 },
      { name: 'shoulders', isPrimary: false, contribution: 0.15 },
    ],
  },

  // SHOULDER EXERCISES
  {
    name: 'Overhead Press',
    equipmentType: 'barbell',
    movementPattern: 'push',
    muscles: [
      { name: 'shoulders', isPrimary: true, contribution: 0.6 },
      { name: 'triceps', isPrimary: false, contribution: 0.3 },
      { name: 'chest', isPrimary: false, contribution: 0.1 },
    ],
  },
  {
    name: 'Dumbbell Shoulder Press',
    equipmentType: 'dumbbell',
    movementPattern: 'push',
    muscles: [
      { name: 'shoulders', isPrimary: true, contribution: 0.65 },
      { name: 'triceps', isPrimary: false, contribution: 0.25 },
      { name: 'chest', isPrimary: false, contribution: 0.1 },
    ],
  },
  {
    name: 'Lateral Raise',
    equipmentType: 'dumbbell',
    movementPattern: 'isolation',
    muscles: [{ name: 'shoulders', isPrimary: true, contribution: 1.0 }],
  },
  {
    name: 'Front Raise',
    equipmentType: 'dumbbell',
    movementPattern: 'isolation',
    muscles: [{ name: 'shoulders', isPrimary: true, contribution: 1.0 }],
  },
  {
    name: 'Rear Delt Fly',
    equipmentType: 'dumbbell',
    movementPattern: 'isolation',
    muscles: [
      { name: 'shoulders', isPrimary: true, contribution: 0.8 },
      { name: 'back', isPrimary: false, contribution: 0.2 },
    ],
  },
  {
    name: 'Face Pull',
    equipmentType: 'cable',
    movementPattern: 'pull',
    muscles: [
      { name: 'shoulders', isPrimary: true, contribution: 0.6 },
      { name: 'back', isPrimary: false, contribution: 0.4 },
    ],
  },
  {
    name: 'Arnold Press',
    equipmentType: 'dumbbell',
    movementPattern: 'push',
    muscles: [
      { name: 'shoulders', isPrimary: true, contribution: 0.7 },
      { name: 'triceps', isPrimary: false, contribution: 0.2 },
      { name: 'chest', isPrimary: false, contribution: 0.1 },
    ],
  },

  // ARM EXERCISES - BICEPS
  {
    name: 'Barbell Curl',
    equipmentType: 'barbell',
    movementPattern: 'isolation',
    muscles: [{ name: 'biceps', isPrimary: true, contribution: 1.0 }],
  },
  {
    name: 'Dumbbell Curl',
    equipmentType: 'dumbbell',
    movementPattern: 'isolation',
    muscles: [{ name: 'biceps', isPrimary: true, contribution: 1.0 }],
  },
  {
    name: 'Hammer Curl',
    equipmentType: 'dumbbell',
    movementPattern: 'isolation',
    muscles: [{ name: 'biceps', isPrimary: true, contribution: 1.0 }],
  },
  {
    name: 'Preacher Curl',
    equipmentType: 'barbell',
    movementPattern: 'isolation',
    muscles: [{ name: 'biceps', isPrimary: true, contribution: 1.0 }],
  },
  {
    name: 'Cable Curl',
    equipmentType: 'cable',
    movementPattern: 'isolation',
    muscles: [{ name: 'biceps', isPrimary: true, contribution: 1.0 }],
  },
  {
    name: 'Incline Dumbbell Curl',
    equipmentType: 'dumbbell',
    movementPattern: 'isolation',
    muscles: [{ name: 'biceps', isPrimary: true, contribution: 1.0 }],
  },
  {
    name: 'Concentration Curl',
    equipmentType: 'dumbbell',
    movementPattern: 'isolation',
    muscles: [{ name: 'biceps', isPrimary: true, contribution: 1.0 }],
  },

  // ARM EXERCISES - TRICEPS
  {
    name: 'Close-Grip Bench Press',
    equipmentType: 'barbell',
    movementPattern: 'push',
    muscles: [
      { name: 'triceps', isPrimary: true, contribution: 0.6 },
      { name: 'chest', isPrimary: false, contribution: 0.3 },
      { name: 'shoulders', isPrimary: false, contribution: 0.1 },
    ],
  },
  {
    name: 'Tricep Dip',
    equipmentType: 'bodyweight',
    movementPattern: 'push',
    muscles: [
      { name: 'triceps', isPrimary: true, contribution: 0.65 },
      { name: 'chest', isPrimary: false, contribution: 0.25 },
      { name: 'shoulders', isPrimary: false, contribution: 0.1 },
    ],
  },
  {
    name: 'Tricep Pushdown',
    equipmentType: 'cable',
    movementPattern: 'isolation',
    muscles: [{ name: 'triceps', isPrimary: true, contribution: 1.0 }],
  },
  {
    name: 'Overhead Tricep Extension',
    equipmentType: 'dumbbell',
    movementPattern: 'isolation',
    muscles: [{ name: 'triceps', isPrimary: true, contribution: 1.0 }],
  },
  {
    name: 'Skull Crusher',
    equipmentType: 'barbell',
    movementPattern: 'isolation',
    muscles: [{ name: 'triceps', isPrimary: true, contribution: 1.0 }],
  },
  {
    name: 'Tricep Kickback',
    equipmentType: 'dumbbell',
    movementPattern: 'isolation',
    muscles: [{ name: 'triceps', isPrimary: true, contribution: 1.0 }],
  },

  // LEG EXERCISES - QUADS
  {
    name: 'Barbell Back Squat',
    equipmentType: 'barbell',
    movementPattern: 'squat',
    muscles: [
      { name: 'quads', isPrimary: true, contribution: 0.5 },
      { name: 'glutes', isPrimary: false, contribution: 0.3 },
      { name: 'hamstrings', isPrimary: false, contribution: 0.1 },
      { name: 'core', isPrimary: false, contribution: 0.1 },
    ],
  },
  {
    name: 'Front Squat',
    equipmentType: 'barbell',
    movementPattern: 'squat',
    muscles: [
      { name: 'quads', isPrimary: true, contribution: 0.6 },
      { name: 'glutes', isPrimary: false, contribution: 0.25 },
      { name: 'core', isPrimary: false, contribution: 0.15 },
    ],
  },
  {
    name: 'Leg Press',
    equipmentType: 'machine',
    movementPattern: 'squat',
    muscles: [
      { name: 'quads', isPrimary: true, contribution: 0.55 },
      { name: 'glutes', isPrimary: false, contribution: 0.3 },
      { name: 'hamstrings', isPrimary: false, contribution: 0.15 },
    ],
  },
  {
    name: 'Leg Extension',
    equipmentType: 'machine',
    movementPattern: 'isolation',
    muscles: [{ name: 'quads', isPrimary: true, contribution: 1.0 }],
  },
  {
    name: 'Goblet Squat',
    equipmentType: 'dumbbell',
    movementPattern: 'squat',
    muscles: [
      { name: 'quads', isPrimary: true, contribution: 0.55 },
      { name: 'glutes', isPrimary: false, contribution: 0.3 },
      { name: 'core', isPrimary: false, contribution: 0.15 },
    ],
  },
  {
    name: 'Bulgarian Split Squat',
    equipmentType: 'dumbbell',
    movementPattern: 'squat',
    muscles: [
      { name: 'quads', isPrimary: true, contribution: 0.5 },
      { name: 'glutes', isPrimary: false, contribution: 0.35 },
      { name: 'hamstrings', isPrimary: false, contribution: 0.15 },
    ],
  },
  {
    name: 'Hack Squat',
    equipmentType: 'machine',
    movementPattern: 'squat',
    muscles: [
      { name: 'quads', isPrimary: true, contribution: 0.6 },
      { name: 'glutes', isPrimary: false, contribution: 0.25 },
      { name: 'hamstrings', isPrimary: false, contribution: 0.15 },
    ],
  },
  {
    name: 'Walking Lunge',
    equipmentType: 'dumbbell',
    movementPattern: 'squat',
    muscles: [
      { name: 'quads', isPrimary: true, contribution: 0.45 },
      { name: 'glutes', isPrimary: false, contribution: 0.35 },
      { name: 'hamstrings', isPrimary: false, contribution: 0.2 },
    ],
  },

  // LEG EXERCISES - HAMSTRINGS & GLUTES
  {
    name: 'Leg Curl',
    equipmentType: 'machine',
    movementPattern: 'isolation',
    muscles: [{ name: 'hamstrings', isPrimary: true, contribution: 1.0 }],
  },
  {
    name: 'Stiff-Leg Deadlift',
    equipmentType: 'barbell',
    movementPattern: 'hinge',
    muscles: [
      { name: 'hamstrings', isPrimary: true, contribution: 0.5 },
      { name: 'glutes', isPrimary: false, contribution: 0.3 },
      { name: 'back', isPrimary: false, contribution: 0.2 },
    ],
  },
  {
    name: 'Hip Thrust',
    equipmentType: 'barbell',
    movementPattern: 'hinge',
    muscles: [
      { name: 'glutes', isPrimary: true, contribution: 0.7 },
      { name: 'hamstrings', isPrimary: false, contribution: 0.3 },
    ],
  },
  {
    name: 'Glute Bridge',
    equipmentType: 'bodyweight',
    movementPattern: 'hinge',
    muscles: [
      { name: 'glutes', isPrimary: true, contribution: 0.75 },
      { name: 'hamstrings', isPrimary: false, contribution: 0.25 },
    ],
  },
  {
    name: 'Good Morning',
    equipmentType: 'barbell',
    movementPattern: 'hinge',
    muscles: [
      { name: 'hamstrings', isPrimary: true, contribution: 0.45 },
      { name: 'back', isPrimary: false, contribution: 0.35 },
      { name: 'glutes', isPrimary: false, contribution: 0.2 },
    ],
  },
  {
    name: 'Cable Pull Through',
    equipmentType: 'cable',
    movementPattern: 'hinge',
    muscles: [
      { name: 'glutes', isPrimary: true, contribution: 0.6 },
      { name: 'hamstrings', isPrimary: false, contribution: 0.4 },
    ],
  },

  // CALVES
  {
    name: 'Standing Calf Raise',
    equipmentType: 'machine',
    movementPattern: 'isolation',
    muscles: [{ name: 'calves', isPrimary: true, contribution: 1.0 }],
  },
  {
    name: 'Seated Calf Raise',
    equipmentType: 'machine',
    movementPattern: 'isolation',
    muscles: [{ name: 'calves', isPrimary: true, contribution: 1.0 }],
  },
  {
    name: 'Dumbbell Calf Raise',
    equipmentType: 'dumbbell',
    movementPattern: 'isolation',
    muscles: [{ name: 'calves', isPrimary: true, contribution: 1.0 }],
  },

  // CORE
  {
    name: 'Plank',
    equipmentType: 'bodyweight',
    movementPattern: 'isolation',
    muscles: [{ name: 'core', isPrimary: true, contribution: 1.0 }],
  },
  {
    name: 'Crunch',
    equipmentType: 'bodyweight',
    movementPattern: 'isolation',
    muscles: [{ name: 'core', isPrimary: true, contribution: 1.0 }],
  },
  {
    name: 'Cable Crunch',
    equipmentType: 'cable',
    movementPattern: 'isolation',
    muscles: [{ name: 'core', isPrimary: true, contribution: 1.0 }],
  },
  {
    name: 'Hanging Leg Raise',
    equipmentType: 'bodyweight',
    movementPattern: 'isolation',
    muscles: [{ name: 'core', isPrimary: true, contribution: 1.0 }],
  },
  {
    name: 'Ab Wheel Rollout',
    equipmentType: 'bodyweight',
    movementPattern: 'isolation',
    muscles: [{ name: 'core', isPrimary: true, contribution: 1.0 }],
  },
  {
    name: 'Russian Twist',
    equipmentType: 'bodyweight',
    movementPattern: 'isolation',
    muscles: [{ name: 'core', isPrimary: true, contribution: 1.0 }],
  },
  {
    name: 'Dead Bug',
    equipmentType: 'bodyweight',
    movementPattern: 'isolation',
    muscles: [{ name: 'core', isPrimary: true, contribution: 1.0 }],
  },

  // COMPOUND / FULL BODY
  {
    name: 'Clean and Press',
    equipmentType: 'barbell',
    movementPattern: 'push',
    muscles: [
      { name: 'shoulders', isPrimary: true, contribution: 0.3 },
      { name: 'back', isPrimary: false, contribution: 0.25 },
      { name: 'quads', isPrimary: false, contribution: 0.2 },
      { name: 'glutes', isPrimary: false, contribution: 0.15 },
      { name: 'triceps', isPrimary: false, contribution: 0.1 },
    ],
  },
  {
    name: 'Farmers Walk',
    equipmentType: 'dumbbell',
    movementPattern: 'carry',
    muscles: [
      { name: 'core', isPrimary: true, contribution: 0.3 },
      { name: 'back', isPrimary: false, contribution: 0.25 },
      { name: 'shoulders', isPrimary: false, contribution: 0.2 },
      { name: 'quads', isPrimary: false, contribution: 0.15 },
      { name: 'glutes', isPrimary: false, contribution: 0.1 },
    ],
  },
  {
    name: 'Shrugs',
    equipmentType: 'dumbbell',
    movementPattern: 'isolation',
    muscles: [
      { name: 'back', isPrimary: true, contribution: 0.8 },
      { name: 'shoulders', isPrimary: false, contribution: 0.2 },
    ],
  },
];

async function main() {
  console.log('🌱 Starting database seed...');

  // Create muscle groups
  console.log('Creating muscle groups...');
  const muscleGroupMap = new Map<string, string>();

  for (const mg of muscleGroups) {
    const created = await prisma.muscleGroup.upsert({
      where: { name: mg.name },
      update: {},
      create: mg,
    });
    muscleGroupMap.set(mg.name, created.id);
  }
  console.log(`✅ Created ${muscleGroups.length} muscle groups`);

  // Create exercises with muscle group mappings
  console.log('Creating exercises...');
  let exerciseCount = 0;

  for (const ex of exercises) {
    const exercise = await prisma.exercise.upsert({
      where: { name: ex.name },
      update: {
        category: ex.equipmentType,
        equipmentType: ex.equipmentType,
        movementPattern: ex.movementPattern,
      },
      create: {
        name: ex.name,
        category: ex.equipmentType,
        equipmentType: ex.equipmentType,
        movementPattern: ex.movementPattern,
        strengthStandard: 1.0,
      },
    });

    // Create muscle group mappings
    for (const muscle of ex.muscles) {
      const muscleGroupId = muscleGroupMap.get(muscle.name);
      if (muscleGroupId) {
        await prisma.muscleContribution.upsert({
          where: {
            exerciseId_muscleGroupId: {
              exerciseId: exercise.id,
              muscleGroupId: muscleGroupId,
            },
          },
          update: {
            isPrimary: muscle.isPrimary,
            contributionPercentage: muscle.contribution * 100,
          },
          create: {
            exerciseId: exercise.id,
            muscleGroupId: muscleGroupId,
            isPrimary: muscle.isPrimary,
            contributionPercentage: muscle.contribution * 100,
          },
        });
      }
    }

    exerciseCount++;
  }

  console.log(`✅ Created ${exerciseCount} exercises with muscle group mappings`);
  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
