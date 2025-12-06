
import { soundService, SOUND_LIBRARY } from './SoundService';

export class TestSoundService {
  async testAllSounds() {
    console.log('TestSoundService: Testing all sounds from library');
    
    for (const soundDef of SOUND_LIBRARY) {
      console.log(`TestSoundService: Testing ${soundDef.title} (${soundDef.category})`);
      console.log(`  Description: ${soundDef.description}`);
      console.log(`  URL: ${soundDef.url}`);
      
      await soundService.playSound(soundDef.id, false);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Play for 2 seconds
      await soundService.stopSound(soundDef.id);
      await new Promise(resolve => setTimeout(resolve, 500)); // Pause between sounds
    }

    console.log('TestSoundService: All sound tests completed');
  }

  async testSoundsByCategory(category: 'breathing' | 'ticking' | 'nature') {
    console.log(`TestSoundService: Testing ${category} sounds`);
    
    const categorySounds = SOUND_LIBRARY.filter(sound => sound.category === category);
    
    for (const soundDef of categorySounds) {
      console.log(`TestSoundService: Testing ${soundDef.title}`);
      console.log(`  Description: ${soundDef.description}`);
      
      await soundService.playSound(soundDef.id, false);
      await new Promise(resolve => setTimeout(resolve, 3000)); // Play for 3 seconds
      await soundService.stopSound(soundDef.id);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Pause between sounds
    }

    console.log(`TestSoundService: ${category} sound tests completed`);
  }

  async testHaptics() {
    console.log('TestSoundService: Testing haptics');
    
    console.log('TestSoundService: Light haptic');
    await soundService.playHaptic('light');
    await new Promise(resolve => setTimeout(resolve, 800));
    
    console.log('TestSoundService: Medium haptic');
    await soundService.playHaptic('medium');
    await new Promise(resolve => setTimeout(resolve, 800));
    
    console.log('TestSoundService: Heavy haptic');
    await soundService.playHaptic('heavy');
    
    console.log('TestSoundService: Haptic tests completed');
  }

  async previewSound(soundId: string, duration: number = 3000) {
    console.log(`TestSoundService: Previewing sound ${soundId} for ${duration}ms`);
    
    const soundDef = SOUND_LIBRARY.find(s => s.id === soundId);
    if (soundDef) {
      console.log(`  Title: ${soundDef.title}`);
      console.log(`  Description: ${soundDef.description}`);
      console.log(`  URL: ${soundDef.url}`);
    }
    
    await soundService.playSound(soundId, false);
    
    setTimeout(async () => {
      await soundService.stopSound(soundId);
      console.log(`TestSoundService: Preview of ${soundId} completed`);
    }, duration);
  }
}

export const testSoundService = new TestSoundService();
