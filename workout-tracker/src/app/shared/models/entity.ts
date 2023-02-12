export abstract class Entity {
    id: number;
    createdByUserId: number;
    createdDateTime: Date;
    modifiedByUserId: number | null;
    modifiedDateTime: Date | null;
}
