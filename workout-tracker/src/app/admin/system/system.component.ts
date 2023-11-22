import { Component, OnInit } from '@angular/core';
import { SoundService } from 'app/core/services/sound.service';

@Component({
  selector: 'wt-system',
  templateUrl: './system.component.html',
  styleUrls: ['./system.component.scss']
})
export class SystemComponent {

  constructor(private _soundService: SoundService) { }

  public testSoundService(): void {
    this._soundService.playSound('../../assets/sounds/210639764.mp3');
  }

}
