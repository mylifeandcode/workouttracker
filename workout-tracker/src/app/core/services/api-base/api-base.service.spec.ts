import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Entity } from 'app/shared/models/entity';
import { ApiBaseService } from './api-base.service';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { Injectable } from '@angular/core';

const API_ROOT = "https://someApiRoot";

class Widget extends Entity {

}

//Because ApiBaseService<T> is (and should be) abstract, we'll create a class local
//to this spec to extend it so we can test it.
@Injectable({
  providedIn: 'root',
})
class WidgetService extends ApiBaseService<Widget> {
  constructor(http: HttpClient) {
    super(API_ROOT, http);
  }
}

describe('ApiBaseService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [
        WidgetService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});
  });

  let service: WidgetService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WidgetService);
    http = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all', () => {

    //ARRANGE
    const widgets = new Array<Widget>();

    //ACT
    const result = service.all$;
    result.subscribe((widgetResults: Widget[]) => {
      expect(widgetResults).toBe(widgets, fail);
    });

    //ASSERT
    const req = http.expectOne(API_ROOT);
    expect(req.request.method).toEqual('GET');
    //Respond with the mock results
    req.flush(widgets);

  });

  it('should get by ID', () => {

    //ARRANGE
    const widget = new Widget();
    const WIDGET_ID: string = '1';

    //ACT
    const result = service.getByPublicId(WIDGET_ID);
    result.subscribe((widgetResult: Widget) => {
      expect(widgetResult).toBe(widget, fail);
    });

    //ASSERT
    const req = http.expectOne(`${API_ROOT}/${WIDGET_ID}`);
    expect(req.request.method).toEqual('GET');
    //Respond with the mock results
    req.flush(widget);

  });

  it('should add', () => {

    //ARRANGE
    const widget = new Widget();

    //ACT
    const result = service.add(widget);
    result.subscribe((widgetResult: Widget) => {
      expect(widgetResult).toBe(widget, fail);
    });

    //ASSERT
    const req = http.expectOne(API_ROOT);
    expect(req.request.method).toEqual('POST');
    //Respond with the mock results
    req.flush(widget);

  });

  it('should update', () => {

    //ARRANGE
    const widget = new Widget();
    const WIDGET_ID: number = 1;
    widget.id = WIDGET_ID;

    //ACT
    const result = service.update(widget);
    result.subscribe((widgetResult: Widget) => {
      expect(widgetResult).toBe(widget, fail);
    });

    //ASSERT
    const req = http.expectOne(`${API_ROOT}/${WIDGET_ID}`);
    expect(req.request.method).toEqual('PUT');
    //Respond with the mock results
    req.flush(widget);

  });

  it('should delete', () => {

    //ARRANGE
    const WIDGET_ID: string = '1';

    //ACT
    const result = service.deleteByPublicId(WIDGET_ID);
    result.subscribe((serviceEntity: any) => { //TODO: Re-evaluate return type to use here!
      expect(serviceEntity).toBeTruthy(fail);
    });

    //ASSERT
    const req = http.expectOne(`${API_ROOT}/${WIDGET_ID}`);
    expect(req.request.method).toEqual('DELETE');
    //Respond with the mock results
    req.flush(new Object());

  });

  it('should cache data', (done: DoneFn) => {

    //ARRANGE
    const widgets = new Array<Widget>();

    //ACT
    const result1 = service.all$;
    result1.subscribe((widgetResults: Widget[]) => {
      expect(widgetResults).toBe(widgets, fail);
      done();
    });

    const result2 = service.all$;
    result2.subscribe((widgetResults: Widget[]) => {
      expect(widgetResults).toBe(widgets, fail);
      done();
    });

    const result3 = service.all$;
    result3.subscribe((widgetResults: Widget[]) => {
      expect(widgetResults).toBe(widgets, fail);
      done();
    });

    //ASSERT
    const req = http.expectOne(API_ROOT);
    expect(req.request.method).toEqual('GET');
    //Respond with the mock results
    req.flush(widgets);
  
  });

  it('should clear cached data', (done: DoneFn) => {

    //ARRANGE
    const widgets = new Array<Widget>();

    //ACT
    const result1 = service.all$;
    result1.subscribe((widgetResults: Widget[]) => {
      expect(widgetResults).toBe(widgets, fail);
      done();
    });

    const result2 = service.all$;
    result2.subscribe((widgetResults: Widget[]) => {
      expect(widgetResults).toBe(widgets, fail);
      done();
    });

    service.invalidateCache();

    const result3 = service.all$;
    result3.subscribe((widgetResults: Widget[]) => {
      expect(widgetResults).toBe(widgets, fail);
      done();
    });

    //ASSERT
    const requests = http.match(API_ROOT);
    expect(requests.length).toBe(2);
    requests.forEach(request => {
      expect(request.request.method).toEqual('GET');
      //Respond with the mock results
      request.flush(widgets);
    });
  
  });

});

