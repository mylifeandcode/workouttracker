import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { mergeMap, shareReplay, take } from 'rxjs/operators';
import { ConfigService } from '../../core/_services/config/config.service';
import { TargetAreaDTO } from '../../api';

/**
 * Deliberately doesn't extend ApiBaseService<T>: that base class requires T to carry a
 * createdDateTime field (for its generic audit-date conversion), but TargetAreaDTO is a lean
 * {id, name} projection with no date fields — nothing here has ever needed them. There's also
 * no write path to support (TargetAreas' Post/Put/Delete all throw NotImplementedException
 * server-side), so only a cached getAll() is needed. This mirrors ApiBaseService's own
 * caching pattern at a smaller scale.
 */
@Injectable({
  providedIn: 'root'
})
export class TargetAreaService {
  private _http = inject(HttpClient);
  private _configService = inject(ConfigService);
  private _apiRoot = (this._configService.get('apiRoot') as string) + 'TargetAreas';

  private _refreshGetAll$ = new BehaviorSubject<void>(undefined);

  public all$: Observable<TargetAreaDTO[]> = this._refreshGetAll$
    .pipe(
      mergeMap(() => this.getAllFromAPI()),
      shareReplay(1)
    );

  public getAll(fromCache: boolean = true): Observable<TargetAreaDTO[]> {
    return fromCache ? this.all$.pipe(take(1)) : this.getAllFromAPI();
  }

  private getAllFromAPI(): Observable<TargetAreaDTO[]> {
    return this._http.get<TargetAreaDTO[]>(this._apiRoot);
  }
}
