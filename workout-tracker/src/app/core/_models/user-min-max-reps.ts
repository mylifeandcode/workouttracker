import { Entity } from "../../shared/models/entity";
import { SetType } from "../../workouts/workout/_enums/set-type";

export class UserMinMaxReps extends Entity {
  public userSettingsId: number = 0;
  public setType: SetType = SetType.Repetition;
  public duration: number | null = null;
  public minReps: number = 0;
  public maxReps: number = 0;
}
