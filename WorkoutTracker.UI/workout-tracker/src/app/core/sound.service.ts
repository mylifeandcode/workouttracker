import { Injectable } from '@angular/core';
import { Howl } from 'howler';

@Injectable({
  providedIn: 'root'
})
export class SoundService {

  constructor() { }

  public playSound(soundFile: string): void {
    const sound = new Howl({
      src: [soundFile]
    });

    sound.play();
  }
}
