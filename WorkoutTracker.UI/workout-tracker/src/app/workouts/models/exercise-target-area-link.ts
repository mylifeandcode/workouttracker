import { Entity } from "../../shared/models/entity";
import { TargetArea } from "./target-area";

export class ExerciseTargetAreaLink extends Entity {
    exerciseId: number;
    targetAreaId: number;
    targetArea: TargetArea;

    constructor(exId: number, targId: number, createdBy: number) {
        super();
        this.exerciseId = exId;
        this.targetAreaId = targId;
        this.createdByUserId = createdBy;
        this.createdDateTime = new Date();
    }
}
