import { IMightHaveAuditDates } from "../../shared/interfaces/i-might-have-audit-dates";

export class ExerciseDTO implements IMightHaveAuditDates {
  id: number = 0;
  publicId: string = '';
  createdDateTime: Date = new Date();
  modifiedDateTime?: Date | null = null;
  name: string = '';
  targetAreas: string = '';
}
