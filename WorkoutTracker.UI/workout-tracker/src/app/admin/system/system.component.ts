import { Component, OnInit } from '@angular/core';
import { SoundService } from 'app/core/sound.service';

@Component({
  selector: 'wt-system',
  templateUrl: './system.component.html',
  styleUrls: ['./system.component.css']
})
export class SystemComponent {

  constructor(private _soundService: SoundService) { }

  public testSoundService(): void {
    this._soundService.playSound('../../assets/sounds/210639764.mp3');
  }

}
