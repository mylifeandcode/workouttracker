import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzMessageService } from 'ng-zorro-antd/message';
import { type Mocked } from 'vitest';

import { NotificationService } from './notification.service';

describe('NotificationService', () => {

  let service: NotificationService;
  let nzNotificationService: NzNotificationService;
  let nzMessageService: NzMessageService;

  beforeEach(() => {
    vi.useFakeTimers();

    const NzNotificationServiceMock: Partial<Mocked<NzNotificationService>> = {
      error: vi.fn<NzNotificationService['error']>(),
      warning: vi.fn<NzNotificationService['warning']>()
    };

    const NzMessageServiceMock: Partial<Mocked<NzMessageService>> = {
      success: vi.fn<NzMessageService['success']>()
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: NzNotificationService, useValue: NzNotificationServiceMock },
        { provide: NzMessageService, useValue: NzMessageServiceMock }
      ]
    });

    service = TestBed.inject(NotificationService);
    nzNotificationService = TestBed.inject(NzNotificationService);
    nzMessageService = TestBed.inject(NzMessageService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should show an error as a notification', () => {
    service.error('Something failed', 'Please try again.');

    expect(nzNotificationService.error).toHaveBeenCalledTimes(1);
    expect(nzNotificationService.error).toHaveBeenCalledWith(
      'Something failed',
      'Please try again.',
      expect.objectContaining({ nzPlacement: 'topRight' }));
  });

  it('should auto-close a non-sticky error', () => {
    service.error('Something failed', 'Please try again.');

    expect(vi.mocked(nzNotificationService.error).mock.calls[0][2]?.nzDuration).toBe(8_000);
  });

  it('should keep a sticky error up until it is dismissed', () => {
    service.error('Server error', 'Please try again.', { sticky: true });

    expect(vi.mocked(nzNotificationService.error).mock.calls[0][2]?.nzDuration).toBe(0);
  });

  describe('deduplication', () => {

    it('should collapse identical errors raised close together', () => {
      service.error('Couldn\'t load data', 'Please try again.');
      service.error('Couldn\'t load data', 'Please try again.');
      service.error('Couldn\'t load data', 'Please try again.');

      expect(nzNotificationService.error).toHaveBeenCalledTimes(1);
    });

    it('should show the error again once the dedupe window has passed', () => {
      service.error('Couldn\'t load data', 'Please try again.');

      vi.advanceTimersByTime(9_001);
      service.error('Couldn\'t load data', 'Please try again.');

      expect(nzNotificationService.error).toHaveBeenCalledTimes(2);
    });

    it('should NOT collapse errors with different detail', () => {
      service.error('Couldn\'t save changes', 'Name is required.');
      service.error('Couldn\'t save changes', 'Email is required.');

      expect(nzNotificationService.error).toHaveBeenCalledTimes(2);
    });

    it('should NOT collapse errors with different titles', () => {
      service.error('Couldn\'t load data', 'Please try again.');
      service.error('Couldn\'t save changes', 'Please try again.');

      expect(nzNotificationService.error).toHaveBeenCalledTimes(2);
    });

    /*
    The window has to outlast the notification itself, otherwise an identical one
    could be raised while the first is still visible.
    */
    it('should suppress a sticky error for longer than a transient one', () => {
      service.error('Server error', 'Please try again.', { sticky: true });

      vi.advanceTimersByTime(9_001);
      service.error('Server error', 'Please try again.', { sticky: true });
      expect(nzNotificationService.error).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(51_000);
      service.error('Server error', 'Please try again.', { sticky: true });
      expect(nzNotificationService.error).toHaveBeenCalledTimes(2);
    });

    it('should dedupe warnings independently of errors', () => {
      service.error('Heads up', 'Same text.');
      service.warning('Heads up', 'Same text.');

      expect(nzNotificationService.error).toHaveBeenCalledTimes(1);
      expect(nzNotificationService.warning).toHaveBeenCalledTimes(1);
    });
  });

  it('should route success messages to NzMessageService, not the notification service', () => {
    service.success('Settings saved.');

    expect(nzMessageService.success).toHaveBeenCalledWith('Settings saved.');
    expect(nzNotificationService.error).not.toHaveBeenCalled();
  });
});
