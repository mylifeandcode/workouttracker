import { NamedEntity } from './named-entity';
import { ExerciseTargetAreaLink } from './exercise-target-area-link';

export class Exercise extends NamedEntity {
    description: string;
    exerciseTargetAreaLinks: Array<ExerciseTargetAreaLink>;
}
