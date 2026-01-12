import { db } from './src/lib/db';

async function main() {
  // Find lateral raise exercises
  const exercises = await db.exercise.findMany({
    where: {
      name: {
        contains: 'Lateral'
      }
    }
  });

  console.log('=== LATERAL RAISE EXERCISES ===');
  for (const ex of exercises) {
    console.log(`Name: ${ex.name}`);
    console.log(`Strength Standard: ${ex.strengthStandard}`);
    console.log(`Created by: ${ex.createdByUserId || 'GLOBAL'}`);
    console.log('---');
  }

  // Fix the Cable Lateral Raise back to 1.0
  const cableLateralRaise = exercises.find(e => e.name === 'Lateral Raise (Cable)');
  if (cableLateralRaise && cableLateralRaise.strengthStandard === 0.5) {
    await db.exercise.update({
      where: { id: cableLateralRaise.id },
      data: { strengthStandard: 1.0 }
    });
    console.log('\n✅ Reverted Cable Lateral Raise strength standard back to 1.0');
  }

  await db.$disconnect();
}

main().catch(console.error);
