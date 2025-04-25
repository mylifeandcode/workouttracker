import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SoundService {

  constructor() { }

  public playSound(soundFile: string): void {
    const audio = new Audio(soundFile);
    audio.play();   
  }
}
