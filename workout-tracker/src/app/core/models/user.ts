import { IPublicEntity } from 'app/shared/interfaces/i-public-entity';
import { NamedEntity } from '../../shared/models/named-entity';
import { UserSettings } from './user-settings';

export class User extends NamedEntity implements IPublicEntity {
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
