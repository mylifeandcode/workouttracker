export abstract class Entity {
    id: number = 0;
    createdByUserId: number | undefined;
    createdDateTime: Date | undefined;
    modifiedByUserId: number | null = null;
    modifiedDateTime: Date | null = null;
}
