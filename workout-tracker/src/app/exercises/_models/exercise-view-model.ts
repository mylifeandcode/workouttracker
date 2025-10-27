import { schema, Schema } from "@angular/forms/signals";
import { Exercise } from "app/workouts/_models/exercise";
import { TargetArea } from "app/workouts/_models/target-area";

export class ExerciseViewModel {
  exercise: Exercise = new Exercise();
  allTargetAreas: Schema<TargetArea[]> = schema<TargetArea[]>((path) => {});
  resistanceTypes: Map<number, string> = new Map<number, string>();
}