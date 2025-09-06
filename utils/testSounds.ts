// Test file for sound effects - can be deleted after testing
import { soundEffects } from './soundEffects';

// Test function to manually test sound effects
export const testSoundEffects = () => {
  console.log('Testing sound effects...');
  
  // Test correct sound
  setTimeout(() => {
    console.log('Playing correct sound...');
    soundEffects.playCorrectSound();
  }, 1000);
  
  // Test incorrect sound
  setTimeout(() => {
    console.log('Playing incorrect sound...');
    soundEffects.playIncorrectSound();
  }, 2500);
  
  // Test celebration sound
  setTimeout(() => {
    console.log('Playing celebration sound...');
    soundEffects.playCelebrationSound();
  }, 4000);
};

// Add to window for easy testing in browser console
if (typeof window !== 'undefined') {
  (window as any).testSounds = testSoundEffects;
}
