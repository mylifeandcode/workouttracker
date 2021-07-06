import { SetType } from "../enums/set-type";
import { UserGoal } from "../enums/user-goal";

export class UserMinMaxReps {
  public userSettingsId: number;
  public goal: UserGoal;
  public setType: SetType;
  public duration: number;
  public minReps: number;
  public maxReps: number;
}
