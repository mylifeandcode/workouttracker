import { Entity } from "app/shared/models/entity";
import { UserGoal } from "../enums/user-goal";
import { UserMinMaxReps } from "./user-min-max-reps";

export class UserSettings extends Entity {
  public userId: number;
  public goal: UserGoal;
  public repSettings: Array<UserMinMaxReps>;
  public recommendationsEnabled: boolean;
}
