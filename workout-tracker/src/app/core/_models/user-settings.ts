import { Entity } from "../../shared/models/entity";
import { UserMinMaxReps } from "./user-min-max-reps";

export class UserSettings extends Entity {
  public userId: number = 0;
  public repSettings: Array<UserMinMaxReps> = [];
  public recommendationsEnabled: boolean = false;
}
