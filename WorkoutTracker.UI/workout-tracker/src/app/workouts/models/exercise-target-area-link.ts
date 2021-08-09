import { Entity } from "../../shared/models/entity";

export class ExerciseTargetAreaLink extends Entity {
    exerciseId: number;
    targetAreaId: number;

    constructor(exId: number, targId: number, createdBy: number) {
        super();
        this.exerciseId = exId;
        this.targetAreaId = targId;
        this.createdByUserId = createdBy;
        this.createdDateTime = new Date();
    }
}
