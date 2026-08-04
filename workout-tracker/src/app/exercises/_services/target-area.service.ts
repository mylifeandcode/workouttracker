import { Injectable } from '@angular/core';
import { ApiBaseService } from '../../core/_services/api-base/api-base.service';
import { TargetArea } from '../../api';

@Injectable({
  providedIn: 'root'
})
export class TargetAreaService extends ApiBaseService<TargetArea> {

  constructor() {
    super("TargetAreas");
  }

}
