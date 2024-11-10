import { Entity } from "../../shared/models/entity";
import { TargetArea } from "./target-area";

export class ExerciseTargetAreaLink extends Entity {
    targetArea: TargetArea | undefined;

    constructor(public exerciseId: number, public targetAreaId: number) {
        super();
    }
}
