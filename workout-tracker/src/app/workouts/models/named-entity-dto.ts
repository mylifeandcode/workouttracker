import { IEntity } from "app/shared/interfaces/i-entity";

export abstract class NamedEntityDTO implements IEntity {
  public id: number = 0;
  public name: string = '';
}
