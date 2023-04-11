import { Entity } from "../../shared/models/entity";
import { TargetArea } from "./target-area";

export class ExerciseTargetAreaLink extends Entity {
    exerciseId: number;
    targetAreaId: number;
    targetArea: TargetArea | undefined;

    constructor(exId: number, targId: number) {
        super();
        this.exerciseId = exId;
        this.targetAreaId = targId;
    }
}
