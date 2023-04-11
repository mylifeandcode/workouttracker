import { ResistanceType } from "../enums/resistance-type";
import { SetType } from "../enums/set-type";

export class ExerciseInWorkoutDTO {
  id: number = -1;
  exerciseId: number = -1;
  exerciseName: string = ''; //TODO: Revisit. Is this being used?
  numberOfSets: number = 0;
  setType: SetType = SetType.Repetition;
  resistanceType: ResistanceType = ResistanceType.BodyWeight;
}