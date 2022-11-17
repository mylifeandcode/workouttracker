import { Entity } from "app/shared/models/entity";
import { SetType } from "../enums/set-type";

export class UserMinMaxReps extends Entity {
  public userSettingsId: number;
  public setType: SetType;
  public duration: number | null;
  public minReps: number;
  public maxReps: number;
}
