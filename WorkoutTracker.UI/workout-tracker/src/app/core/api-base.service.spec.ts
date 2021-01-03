import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Entity } from 'app/shared/models/entity';
import { ApiBaseService } from './api-base.service';
import { HttpClient } from '@angular/common/http';
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
      providers: [
        WidgetService
      ], 
      imports :[
        HttpClientTestingModule
      ]      
    });
  });

  let service: WidgetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WidgetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all', () => {

    //ARRANGE
    let httpMock = TestBed.inject(HttpTestingController);
    let widgets = new Array<Widget>();

    //ACT
    const result = service.getAll();
    result.subscribe((widgetResults: Widget[]) => {
      expect(widgetResults).toBe(widgets, fail);
    });

    //ASSERT
    const req = httpMock.expectOne(API_ROOT);
    expect(req.request.method).toEqual('GET');
    //Respond with the mock results
    req.flush(widgets);    

  });

  it('should get by ID', () => {

    //ARRANGE
    let httpMock = TestBed.inject(HttpTestingController);
    let widget = new Widget();
    const WIDGET_ID: number = 1;

    //ACT
    const result = service.getById(WIDGET_ID);
    result.subscribe((widgetResult: Widget) => {
      expect(widgetResult).toBe(widget, fail);
    });

    //ASSERT
    const req = httpMock.expectOne(`${API_ROOT}/${WIDGET_ID}`);
    expect(req.request.method).toEqual('GET');
    //Respond with the mock results
    req.flush(widget);    
    
  });

  it('should add', () => {

    //ARRANGE
    let httpMock = TestBed.inject(HttpTestingController);
    let widget = new Widget();

    //ACT
    const result = service.add(widget);
    result.subscribe((widgetResult: Widget) => {
      expect(widgetResult).toBe(widget, fail);
    });

    //ASSERT
    const req = httpMock.expectOne(API_ROOT);
    expect(req.request.method).toEqual('POST');
    //Respond with the mock results
    req.flush(widget);    
    
  });
  
  it('should update', () => {

    //ARRANGE
    let httpMock = TestBed.inject(HttpTestingController);
    let widget = new Widget();
    const WIDGET_ID: number = 1;
    widget.id = WIDGET_ID;

    //ACT
    const result = service.update(widget);
    result.subscribe((widgetResult: Widget) => {
      expect(widgetResult).toBe(widget, fail);
    });

    //ASSERT
    const req = httpMock.expectOne(`${API_ROOT}/${WIDGET_ID}`);
    expect(req.request.method).toEqual('PUT');
    //Respond with the mock results
    req.flush(widget);    
    
  });
  
  it('should delete', () => {
    
    //ARRANGE
    let httpMock = TestBed.inject(HttpTestingController);
    const WIDGET_ID: number = 1;

    //ACT
    const result = service.delete(WIDGET_ID);
    result.subscribe((result: any) => { //TODO: Re-evaluate return type to use here!
      expect(result).toBeTruthy(fail);
    });

    //ASSERT
    const req = httpMock.expectOne(`${API_ROOT}/${WIDGET_ID}`);
    expect(req.request.method).toEqual('DELETE');
    //Respond with the mock results
    req.flush(new Object());    

  });  

});
