import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApiBaseService } from './api-base.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { Injectable, provideZonelessChangeDetection } from '@angular/core';
import { ConfigService } from '../config/config.service';
import { firstValueFrom } from 'rxjs';

const API_ROOT = "https://someUrl/api/";
import { type Mocked } from 'vitest';

class Widget {
  id: number = 0;
  createdByUserId: number | undefined;
  createdDateTime: Date | undefined;
  modifiedByUserId: number | null = null;
  modifiedDateTime: Date | null = null;
}

//Because ApiBaseService<T> is (and should be) abstract, we'll create a class local
//to this spec to extend it so we can test it.
@Injectable({
  providedIn: 'root',
})
class WidgetService extends ApiBaseService<Widget> {
  constructor() {
    super("widgets");
  }
}

describe('ApiBaseService', () => {

  let service: WidgetService;
  let http: HttpTestingController;

  beforeEach(() => {
    const ConfigServiceMock: Partial<Mocked<ConfigService>> = {
      get: vi.fn().mockReturnValue(API_ROOT)
    };

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        provideZonelessChangeDetection(),
        WidgetService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        {
          provide: ConfigService,
          useValue: ConfigServiceMock
        }
      ]
    });

    service = TestBed.inject(WidgetService);
    http = TestBed.inject(HttpTestingController);

  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all', async () => {

    //ARRANGE
    const widgets = new Array<Widget>();

    //ACT
    const result = firstValueFrom(service.all$);

    //ASSERT
    const req = http.expectOne(`${API_ROOT}widgets`);
    expect(req.request.method).toEqual('GET');

    req.flush(widgets);
    expect(await result).toBe(widgets);
  });

  it('should get by ID', async () => {

    //ARRANGE
    const widget = new Widget();
    const WIDGET_ID: string = '1';

    //ACT
    const result = firstValueFrom(service.getById(WIDGET_ID));

    //ASSERT
    const req = http.expectOne(`${API_ROOT}widgets/${WIDGET_ID}`);
    expect(req.request.method).toEqual('GET');
    
    req.flush(widget);
    expect(await result).toBe(widget);
  });

  it('should add', async () => {

    //ARRANGE
    const widget = new Widget();

    //ACT
    const result = firstValueFrom(service.add(widget));

    //ASSERT
    const req = http.expectOne(`${API_ROOT}widgets`);
    expect(req.request.method).toEqual('POST');

    req.flush(widget);
    expect(await result).toBe(widget);
  });

  it('should update', async () => {

    //ARRANGE
    const widget = new Widget();
    const WIDGET_ID: number = 1;
    widget.id = WIDGET_ID;

    //ACT
    const result = firstValueFrom(service.update(widget));

    //ASSERT
    const req = http.expectOne(`${API_ROOT}widgets/${WIDGET_ID}`);
    expect(req.request.method).toEqual('PUT');

    req.flush(widget);
    expect(await result).toBe(widget);
  });

  it('should delete', async () => {

    //ARRANGE
    const WIDGET_ID: string = '1';

    //ACT
    const result = firstValueFrom(service.deleteById(WIDGET_ID));

    //ASSERT
    const req = http.expectOne(`${API_ROOT}widgets/${WIDGET_ID}`);
    expect(req.request.method).toEqual('DELETE');

    req.flush(new Object());
    expect(await result).toEqual(new Object());
  });

  it('should cache data', async () => {

    //ARRANGE
    const widgets = new Array<Widget>();

    //ACT
    const result1 = firstValueFrom(service.all$); //Only this one should trigger an HTTP request
    const result2 = firstValueFrom(service.all$);
    const result3 = firstValueFrom(service.all$);

    //ASSERT
    const req = http.expectOne(`${API_ROOT}widgets`);
    expect(req.request.method).toEqual('GET');

    req.flush(widgets);

    expect(await result1).toBe(widgets);
    expect(await result2).toBe(widgets);
    expect(await result3).toBe(widgets);
  });

  it('should clear cached data', async () => {

    //ARRANGE
    const widgets = new Array<Widget>();

    //ACT
    const result1 = firstValueFrom(service.all$); //Should trigger HTTP request
    const result2 = firstValueFrom(service.all$); //Should return cached data

    service.invalidateCache();

    const result3 = firstValueFrom(service.all$); //Should trigger HTTP request


    //ASSERT
    const requests = http.match(`${API_ROOT}widgets`);
    expect(requests.length).toBe(2);
    requests.forEach(request => {
      expect(request.request.method).toEqual('GET');

      request.flush(widgets);
    });

    expect(await result1).toBe(widgets);
    expect(await result2).toBe(widgets);
    expect(await result3).toBe(widgets);
  });

});

