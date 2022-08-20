import { NamedEntity } from '../../shared/models/named-entity';
import { UserSettings } from './user-settings';

export class User extends NamedEntity {
  public emailAddress: string;
  public profilePic: string;
  public settings: UserSettings;
  public role: number;

  public constructor(init?: Partial<User>) {
    super();
    Object.assign(this, init);
  }
}
