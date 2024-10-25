import { NamedEntity } from '../../shared/models/named-entity';
import { ExerciseTargetAreaLink } from './exercise-target-area-link';

export class Exercise extends NamedEntity {
  publicId: string | null = null; //GUID
  description: string = '';
  exerciseTargetAreaLinks: ExerciseTargetAreaLink[] = [];
  setup: string = '';
  movement: string = '';
  pointsToRemember: string = '';
  resistanceType: number = 0;
  oneSided: boolean = false;
  bandsEndToEnd: boolean | null = null;
  involvesReps: boolean = false;
  usesBilateralResistance: boolean = false;
}
