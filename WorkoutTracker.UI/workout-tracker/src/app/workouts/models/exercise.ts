import { NamedEntity } from '../../shared/models/named-entity';
import { ExerciseTargetAreaLink } from './exercise-target-area-link';

export class Exercise extends NamedEntity {
    description: string;
    exerciseTargetAreaLinks: ExerciseTargetAreaLink[];
    setup: string;
    movement: string;
    pointsToRemember: string;
    resistanceType: number;
    oneSided: boolean;
    bandsEndToEnd: boolean;
}
