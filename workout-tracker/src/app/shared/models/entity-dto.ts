import { IMightHaveAuditDates } from "../interfaces/i-might-have-audit-dates";

export abstract class EntityDTO implements IMightHaveAuditDates {
  public id: string = ''; //GUID in API
  public createdDateTime: Date = new Date();
  public modifiedDateTime?: Date | null = null;
}