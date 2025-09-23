export interface IHasAuditDates {
  createdDateTime: Date;
  modifiedDateTime?: Date | null;
}