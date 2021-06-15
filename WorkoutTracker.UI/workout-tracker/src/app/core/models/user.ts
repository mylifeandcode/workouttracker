import { NamedEntity } from '../../shared/models/named-entity';
import { UserSettings } from './user-settings';

export class User extends NamedEntity {
  public profilePic: string;
  public settings: UserSettings;

  public constructor(init?:Partial<User>) {
    super();
    Object.assign(this, init);
  }
}
