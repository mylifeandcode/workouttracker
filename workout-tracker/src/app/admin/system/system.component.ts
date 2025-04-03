import { Component, inject } from '@angular/core';
import { SoundService } from 'app/core/_services/sound/sound.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@Component({
    selector: 'wt-system',
    templateUrl: './system.component.html',
    imports: [ NzSpinModule ],
    styleUrls: ['./system.component.scss']
})
export class SystemComponent {
  private _soundService = inject(SoundService);
  private readonly _messageService = inject(NzMessageService);

  public testSoundService(): void {
    this._soundService.playSound('../../assets/sounds/210639764.mp3');
  }

  public testToast(): void {
    //this._messageService.add({ severity: 'success', summary: 'Successful', detail: 'Toasty!', life: 3000 });
    this._messageService.create('success', 'Successful');
  }

}
