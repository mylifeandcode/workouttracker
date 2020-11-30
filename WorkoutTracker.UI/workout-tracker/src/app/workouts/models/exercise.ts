import { NamedEntity } from '../../core/models/named-entity';
import { ExerciseTargetAreaLink } from './exercise-target-area-link';

export class Exercise extends NamedEntity {
    description: string;
    exerciseTargetAreaLinks: ExerciseTargetAreaLink[];
    setup: string;
    movement: string;
    pointsToRemember: string;
    typeOfResistance: number;
    oneSided: boolean;
}
