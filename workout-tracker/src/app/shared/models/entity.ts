export abstract class Entity {
    id: number = -1;
    createdByUserId: number = -1;
    createdDateTime: Date = new Date();
    modifiedByUserId: number | null = null;
    modifiedDateTime: Date | null = null;
}
