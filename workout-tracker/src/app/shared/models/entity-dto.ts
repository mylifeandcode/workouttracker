export abstract class EntityDTO {
  public id: string = ''; //GUID in API
  public createdDateTime: Date = new Date();
  public modifiedDateTime?: Date | null = null;
}