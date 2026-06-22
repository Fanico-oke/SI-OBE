/**
 * runSeedNicoDo.ts
 * Simple runner for the Nico DO seed script.
 *
 * Usage:
 *   npx ts-node src/scripts/runSeedNicoDo.ts
 *   -- OR --
 *   npx tsx src/scripts/runSeedNicoDo.ts
 */

import { seedNicoDo } from './seedNicoDo';

seedNicoDo()
  .then(() => {
    console.log('✅ Seed script finished successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Seed script failed:', err);
    process.exit(1);
  });
