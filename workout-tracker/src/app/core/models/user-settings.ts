import { Entity } from "app/shared/models/entity";
import { UserMinMaxReps } from "./user-min-max-reps";

export class UserSettings extends Entity {
  public userId: number = -1;
  public repSettings: Array<UserMinMaxReps> = [];
  public recommendationsEnabled: boolean = false;
}
