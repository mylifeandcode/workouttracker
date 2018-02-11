import { NamedEntity } from './named-entity';

export class TargetArea extends NamedEntity {
    
    constructor (
        id: number, 
        name: string, 
        createdByUserId: number, 
        createdDateTime: Date, 
        modifiedByUserId: number, 
        modifiedDateTime: Date, 
        public selected: boolean) {

            super();
            this.id = id;
            this.name = name;
            this.createdByUserId = createdByUserId;
            this.createdDateTime = createdDateTime;
            this.modifiedByUserId = modifiedByUserId;
            this.modifiedDateTime = modifiedDateTime;

    }
}
