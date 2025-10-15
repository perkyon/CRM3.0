import { seedDataService } from './seed-data';

// Simple script to run seed data
export async function runSeedData() {
  try {
    console.log('🚀 Starting seed data process...');
    await seedDataService.seedAll();
    console.log('✅ Seed data process completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Seed data process failed:', error);
    return false;
  }
}

// Make available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).runSeedData = runSeedData;
  console.log('🌱 Seed data runner made available globally as window.runSeedData');
}
