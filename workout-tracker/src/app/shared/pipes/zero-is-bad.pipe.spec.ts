import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ZeroIsBadPipe } from './zero-is-bad.pipe';

describe('ZeroIsBadPipe', () => {

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [ 
        ZeroIsBadPipe, 
        {
          provide: DomSanitizer, 
          useValue: {
            bypassSecurityTrustHtml: (value: string): string => value //Thanks to Zakary Keck for the solution for this
          }
        },
        provideZonelessChangeDetection()
      ]
    });
  });

  it('create an instance', () => {
    const pipe = TestBed.inject(ZeroIsBadPipe);
    expect(pipe).toBeTruthy();
  });

  it('should transform input value of 0 correctly', () => {

    //ARRANGE
    const input = 0;
    const pipe = TestBed.inject(ZeroIsBadPipe);

    //ACT
    const output = pipe.transform(input);

    //ASSERT
    expect(output).toEqual("<span style='color: red'>0</span>");

  });

});
