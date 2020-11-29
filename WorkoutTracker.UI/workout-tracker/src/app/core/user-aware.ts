import { User } from 'app/core/models/user';
import { UserService } from 'app/core/user.service';

export abstract class UserAware {

    protected _userId: number;

    constructor(protected _userService: UserService) {}

    protected async getCurrentUserId(): Promise<void> {
        let result: User = await this._userService.getCurrentUserInfo().toPromise();
        this._userId = result ? result.id : 0;
    }

}