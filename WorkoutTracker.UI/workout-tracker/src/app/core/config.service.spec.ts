import { TestBed, inject } from '@angular/core/testing';
import { ConfigService } from './config.service';

describe('ConfigService', () => {
  let service: ConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should convert passed-in configuration object into map', inject([ConfigService], (service: ConfigService) => {
    //ARRANGE
    let anyOldObject = {
      blah: "whatever", 
      blah2: "whateverStill", 
      hello: "world", 
      complexObject: {
        my: "complex",
        objectThing: "rocks"
      }
    };

    //ACT
    service.init(anyOldObject);

    //ASSERT
    expect(service.get("blah")).toBe("whatever");
    expect(service.get("blah2")).toBe("whateverStill");
    expect(service.get("hello")).toBe("world");
    expect(service.get("complexObject")).toBe(anyOldObject.complexObject);
  }));

  it('should return null when requested config setting not found', inject([ConfigService], (service: ConfigService) => {
    //ARRANGE
    let anyOldObject = {
      blah: "whatever", 
      blah2: "whateverStill"
    };

    //ACT
    service.init(anyOldObject);

    //ASSERT
    expect(service.get("blah3")).toBeNull();
  }));  

});
