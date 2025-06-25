import { EMPTY_GUID } from '../shared-constants';
import { Entity } from './entity';

export class ResistanceBand extends Entity {
  public publicId: string = EMPTY_GUID;
  public color: string = '';
  public maxResistanceAmount: number = 0;
  public numberAvailable: number = 0;
}
