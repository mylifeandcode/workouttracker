import { Entity } from "app/shared/models/entity";
import { SetType } from "../enums/set-type";

export class UserMinMaxReps extends Entity {
  public userSettingsId: number = 0;
  public setType: SetType = SetType.Repetition;
  public duration: number | null = null;
  public minReps: number = 0;
  public maxReps: number = 0;
}
