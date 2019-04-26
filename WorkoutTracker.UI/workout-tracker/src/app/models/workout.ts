import { NamedEntity } from "./named-entity";
import { Set } from "./set";

export class Workout extends NamedEntity {
    public userId: number;
    public sets: Array<Set>;

    constructor() {
        super();
        this.id = 0;
        this.sets = [];
    }
}
