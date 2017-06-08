import { NamedEntity } from './named-entity';

export class TargetArea extends NamedEntity {
    
    constructor (
        id: number, 
        name: string, 
        createdBy: string, 
        createdDateTime: Date, 
        modifiedBy: string, 
        modifiedDateTime: Date, 
        public selected: boolean) {

            super();
            this.id = id;
            this.name = name;
            this.createdBy = createdBy;
            this.createdDateTime = createdDateTime;
            this.modifiedBy = modifiedBy;
            this.modifiedDateTime = modifiedDateTime;

    }
}
