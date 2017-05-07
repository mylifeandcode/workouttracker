import { NamedEntity } from './named-entity';
import { TargetArea } from './target-area';

export class Exercise extends NamedEntity {
    description: string;
    targetAreas: Array<TargetArea>;
}
