import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { ResistanceBandColorPipe } from './resistance-band-color.pipe';

describe('ResistanceBandColorPipe', () => {

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [ 
        ResistanceBandColorPipe, 
        {
          provide: DomSanitizer, 
          useValue: {
            bypassSecurityTrustHtml: (value: string): string => value //Thanks to Zakary Keck for the solution for this
          }
        }
      ]
    })
    .compileComponents();
  });

  it('create an instance', () => {
    const pipe = TestBed.inject(ResistanceBandColorPipe);
    expect(pipe).toBeTruthy();
  });

  it('should transform input correctly', () => {

    //ARRANGE
    const input = "Red, Purple, Blue";
    const pipe = TestBed.inject(ResistanceBandColorPipe);

    //ACT
    const output = pipe.transform(input);

    //ASSERT
    expect(output).toBe("<span style='color: Red; text-shadow: 1px 1px #000000;'>Red</span>, <span style='color: Purple; text-shadow: 1px 1px #000000;'>Purple</span>, <span style='color: Blue; text-shadow: 1px 1px #000000;'>Blue</span>");

  });

});
