import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { ResistanceBandColorPipe } from './resistance-band-color.pipe';

describe('ResistanceBandColorPipe', () => {

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [ ResistanceBandColorPipe, DomSanitizer ] //NOTE: Using *real* DomSanitizer
    })
    .compileComponents();
  });

  it('create an instance', () => {
    const pipe = TestBed.inject(ResistanceBandColorPipe);
    expect(pipe).toBeTruthy();
  });

  //TODO: Revisit. Getting "bypassSecurityTrustHtml is not a function" error.
  xit('should transform input correctly', () => {

    //ARRANGE
    const input = "Red, Purple, Blue";
    const pipe = TestBed.inject(ResistanceBandColorPipe);

    //ACT
    const output = pipe.transform(input);

    //ASSERT
    console.log("output: ", output);

  });

});
