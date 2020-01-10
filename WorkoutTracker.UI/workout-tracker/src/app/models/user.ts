import { NamedEntity } from './named-entity';

export class User extends NamedEntity {
  public HashedPassword: string;
  public ProfilePic: string;

  public constructor(init?:Partial<User>) {
    super();
    Object.assign(this, init);
  }
}
