import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Entity } from '../../../shared/models/entity';
import { ApiBaseService } from './api-base.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { Injectable, provideZonelessChangeDetection } from '@angular/core';
import { ConfigService } from '../config/config.service';

const API_ROOT = "https://someUrl/api/";

class MockConfigService {
    get = vi.fn().mockReturnValue(API_ROOT);
}

class Widget extends Entity {
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
        TestBed.configureTestingModule({
            imports: [],
            providers: [
                provideZonelessChangeDetection(),
                WidgetService,
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting(),
                {
                    provide: ConfigService,
                    useClass: MockConfigService
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
        const result = service.all$;
        result.subscribe((widgetResults: Widget[]) => {
            expect(widgetResults).toBe(widgets, fail);
            ;
        });

        //ASSERT
        const req = http.expectOne(`${API_ROOT}widgets`);
        expect(req.request.method).toEqual('GET');
        //Respond with the mock results
        req.flush(widgets);
    });

    it('should get by ID', async () => {

        //ARRANGE
        const widget = new Widget();
        const WIDGET_ID: string = '1';

        //ACT
        const result = service.getById(WIDGET_ID);
        result.subscribe((widgetResult: Widget) => {
            expect(widgetResult).toBe(widget, fail);
            ;
        });

        //ASSERT
        const req = http.expectOne(`${API_ROOT}widgets/${WIDGET_ID}`);
        expect(req.request.method).toEqual('GET');
        //Respond with the mock results
        req.flush(widget);
    });

    it('should add', async () => {

        //ARRANGE
        const widget = new Widget();

        //ACT
        const result = service.add(widget);
        result.subscribe((widgetResult: Widget) => {
            expect(widgetResult).toBe(widget, fail);
            ;
        });

        //ASSERT
        const req = http.expectOne(`${API_ROOT}widgets`);
        expect(req.request.method).toEqual('POST');
        //Respond with the mock results
        req.flush(widget);
    });

    it('should update', async () => {

        //ARRANGE
        const widget = new Widget();
        const WIDGET_ID: number = 1;
        widget.id = WIDGET_ID;

        //ACT
        const result = service.update(widget);
        result.subscribe((widgetResult: Widget) => {
            expect(widgetResult).toBe(widget, fail);
            ;
        });

        //ASSERT
        const req = http.expectOne(`${API_ROOT}widgets/${WIDGET_ID}`);
        expect(req.request.method).toEqual('PUT');
        //Respond with the mock results
        req.flush(widget);
    });

    it('should delete', async () => {

        //ARRANGE
        const WIDGET_ID: string = '1';

        //ACT
        const result = service.deleteById(WIDGET_ID);
        result.subscribe((serviceEntity: any) => {
            expect(serviceEntity).toBeTruthy(fail);
            ;
        });

        //ASSERT
        const req = http.expectOne(`${API_ROOT}widgets/${WIDGET_ID}`);
        expect(req.request.method).toEqual('DELETE');
        //Respond with the mock results
        req.flush(new Object());
    });

    it('should cache data', async () => {

        //ARRANGE
        const widgets = new Array<Widget>();

        //ACT
        const result1 = service.all$;
        result1.subscribe((widgetResults: Widget[]) => {
            expect(widgetResults).toBe(widgets, fail);
        });

        const result2 = service.all$;
        result2.subscribe((widgetResults: Widget[]) => {
            expect(widgetResults).toBe(widgets, fail);
        });

        const result3 = service.all$;
        result3.subscribe((widgetResults: Widget[]) => {
            expect(widgetResults).toBe(widgets, fail);
            ;
        });

        //ASSERT
        const req = http.expectOne(`${API_ROOT}widgets`);
        expect(req.request.method).toEqual('GET');
        //Respond with the mock results
        req.flush(widgets);
    });

    it('should clear cached data', async () => {

        //ARRANGE
        const widgets = new Array<Widget>();

        //ACT
        const result1 = service.all$;
        result1.subscribe((widgetResults: Widget[]) => {
            expect(widgetResults).toBe(widgets, fail);
        });

        const result2 = service.all$;
        result2.subscribe((widgetResults: Widget[]) => {
            expect(widgetResults).toBe(widgets, fail);
        });

        service.invalidateCache();

        const result3 = service.all$;
        result3.subscribe((widgetResults: Widget[]) => {
            expect(widgetResults).toBe(widgets, fail);
            ;
        });

        //ASSERT
        const requests = http.match(`${API_ROOT}widgets`);
        expect(requests.length).toBe(2);
        requests.forEach(request => {
            expect(request.request.method).toEqual('GET');
            //Respond with the mock results
            request.flush(widgets);
        });
    });

});

