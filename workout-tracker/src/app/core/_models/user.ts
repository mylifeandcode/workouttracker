import { NamedEntity } from '../../shared/models/named-entity';
import { UserSettings } from './user-settings';

export class User extends NamedEntity {
  public emailAddress: string = '';
  public profilePic: string = '';
  public settings: UserSettings = new UserSettings();
  public role: number = 0;
  public publicId: string | null = null; //GUID

  public constructor(init?: Partial<User>) {
    super();
    Object.assign(this, init);
  }
}
