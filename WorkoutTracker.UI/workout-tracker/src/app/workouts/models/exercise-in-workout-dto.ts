import { ResistanceType } from "../enums/resistance-type";
import { SetType } from "../enums/set-type";

export class ExerciseInWorkoutDTO {
  id: number;
  exerciseId: number;
  exerciseName: number;
  numberOfSets: number;
  setType: SetType;
  resistanceType: ResistanceType;
}