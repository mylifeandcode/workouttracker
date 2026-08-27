import { Injectable, inject } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzMessageService } from 'ng-zorro-antd/message';

/**
 * The app's single seam for transient user feedback.
 *
 * Errors go to NzNotification (title + detail, dismissible, and stickable) rather
 * than NzMessage, whose 3-second auto-close with no close affordance would be a
 * regression from the window.alert() calls it replaces on a failed save. Successes
 * stay on NzMessage, which is what the app already used for them.
 *
 * Wrapping ng-zorro also keeps specs simple: the unit suite runs in jsdom, where
 * rendering a real notification (CDK overlay + animations + DOCUMENT) is fragile, so
 * every spec mocks this one service instead.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {

  private static readonly ERROR_DURATION_MS = 8_000;

  /*
  Dedupe windows. These MUST exceed the matching display duration, or an identical
  notification could be raised while the first one is still on screen.
  */
  private static readonly DEDUPE_WINDOW_MS = 9_000;
  private static readonly STICKY_DEDUPE_WINDOW_MS = 60_000;

  private _notificationService = inject(NzNotificationService);
  private _messageService = inject(NzMessageService);

  /** When each distinct notification was last shown, for deduplication. */
  private _lastShownAt = new Map<string, number>();

  //PUBLIC METHODS ////////////////////////////////////////////////////////////

  /**
   * Shows an error notification, unless an identical one was shown very recently.
   *
   * @param sticky Stays until dismissed. Use for failures the user must not miss
   *               (server errors, loss of connectivity).
   */
  public error(title: string, detail: string, options?: { sticky?: boolean }): void {
    const sticky = options?.sticky === true;
    const dedupeWindow = sticky
      ? NotificationService.STICKY_DEDUPE_WINDOW_MS
      : NotificationService.DEDUPE_WINDOW_MS;

    if (!this.claimSlot(`error|${title}|${detail}`, dedupeWindow)) return;

    this._notificationService.error(title, detail, {
      nzDuration: sticky ? 0 : NotificationService.ERROR_DURATION_MS,
      nzPlacement: 'topRight'
    });
  }

  public warning(title: string, detail: string): void {
    if (!this.claimSlot(`warning|${title}|${detail}`, NotificationService.DEDUPE_WINDOW_MS)) return;

    this._notificationService.warning(title, detail, {
      nzDuration: NotificationService.ERROR_DURATION_MS,
      nzPlacement: 'topRight'
    });
  }

  /** Success confirmations stay on NzMessage, so they look exactly as they did before. */
  public success(message: string): void {
    this._messageService.success(message);
  }

  //END PUBLIC METHODS ////////////////////////////////////////////////////////

  //PRIVATE METHODS ///////////////////////////////////////////////////////////

  /**
   * Time-window deduplication. Returns false if an identical notification is still
   * recent enough that showing another would just be noise.
   *
   * The key is the user-visible text rather than the status or URL, so several
   * endpoints failing for the same reason collapse into one notification. That's the
   * common case: a dashboard firing parallel requests, or a whole queue of requests
   * failing at once behind a dead token.
   *
   * A time window rather than tracking open notification instances: relying on
   * NzNotificationRef.onClose would need every spec's mock to return a live subject,
   * and if one didn't, suppression would become permanent. The trade-off is that a
   * sticky notification left on screen for a long time can be re-raised once per
   * window — acceptable, and fixable by layering an open-set on top of this if needed.
   */
  private claimSlot(key: string, windowMs: number): boolean {
    const now = Date.now();
    this.pruneExpired(now);

    const lastShownAt = this._lastShownAt.get(key);
    if (lastShownAt !== undefined && now - lastShownAt < windowMs) return false;

    this._lastShownAt.set(key, now);
    return true;
  }

  private pruneExpired(now: number): void {
    for (const [key, shownAt] of this._lastShownAt) {
      if (now - shownAt >= NotificationService.STICKY_DEDUPE_WINDOW_MS) {
        this._lastShownAt.delete(key);
      }
    }
  }

  //END PRIVATE METHODS ///////////////////////////////////////////////////////
}
