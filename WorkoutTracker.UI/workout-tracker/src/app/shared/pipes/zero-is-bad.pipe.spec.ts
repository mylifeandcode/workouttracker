import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { ZeroIsBadPipe } from './zero-is-bad.pipe';

describe('ZeroIsBadPipe', () => {

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [ ZeroIsBadPipe, DomSanitizer ] //NOTE: Using *real* DomSanitizer
    });
  });

  it('create an instance', () => {
    const pipe = TestBed.inject(ZeroIsBadPipe);
    expect(pipe).toBeTruthy();
  });

  //TODO: Revisit. Getting "bypassSecurityTrustHtml is not a function" error.
  xit('should transform input value of 0 correctly', () => {

    //ARRANGE
    const input = 0;
    const pipe = TestBed.inject(ZeroIsBadPipe);

    //ACT
    const output = pipe.transform(input);

    //ASSERT
    expect(output).toEqual("<span style='color: red;'>0</span>");

  });

});
