import { Entity } from './entity';

export abstract class NamedEntity extends Entity {
  name: string = '';
}
