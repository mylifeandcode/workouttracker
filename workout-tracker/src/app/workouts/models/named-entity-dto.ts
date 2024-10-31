import { EntityDTO } from "app/shared/models/entity-dto";

export abstract class NamedEntityDTO extends EntityDTO {
  public name: string = '';
}
