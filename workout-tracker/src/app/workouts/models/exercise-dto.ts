export class ExerciseDTO {
  id: number = 0;
  publicId: string = '';
  createdDateTime: Date = new Date();
  modifiedDateTime?: Date | null = null;
  name: string = '';
  targetAreas: string = '';
}
