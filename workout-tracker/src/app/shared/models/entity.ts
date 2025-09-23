import { IMightHaveAuditDates } from "../interfaces/i-might-have-audit-dates";
export abstract class Entity implements IMightHaveAuditDates {
  id: number = 0;
  createdByUserId: number | undefined;
  createdDateTime: Date | undefined;
  modifiedByUserId: number | null = null;
  modifiedDateTime: Date | null = null;
}
