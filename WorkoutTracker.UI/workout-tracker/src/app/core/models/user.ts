import { NamedEntity } from '../../shared/models/named-entity';

export class User extends NamedEntity {
  public profilePic: string;

  public constructor(init?:Partial<User>) {
    super();
    Object.assign(this, init);
  }
}
