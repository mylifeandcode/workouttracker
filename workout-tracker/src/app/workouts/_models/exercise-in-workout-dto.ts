import { ResistanceType } from "../workout/_enums/resistance-type";
import { SetType } from "../workout/_enums/set-type";

export class ExerciseInWorkoutDTO {
  id: number = 0;
  exerciseId: string = '';
  exerciseName: string = ''; //TODO: Revisit. Is this being used?
  numberOfSets: number = 0;
  setType: SetType = SetType.Repetition;
  resistanceType: ResistanceType = ResistanceType.BodyWeight;
}