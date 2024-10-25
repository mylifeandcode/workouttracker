import { Entity } from './entity';

export class ResistanceBand extends Entity {
    public publicId: string | null = null;
    public color: string = '';
    public maxResistanceAmount: number = 0;
    public numberAvailable: number = 0;
}
