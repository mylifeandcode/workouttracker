import { DomSanitizer } from '@angular/platform-browser';
import { SentencesToTagsPipe } from './sentences-to-tags.pipe';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

describe('SentencesToTagsPipe', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        SentencesToTagsPipe,
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
    const pipe = TestBed.inject(SentencesToTagsPipe);
    expect(pipe).toBeTruthy();
  });

  it('should transform sentences to tags', () => {
    const pipe = TestBed.inject(SentencesToTagsPipe);
    const sentences = 'I prefer introspection. Gimme that space for reflection. Gimme those endless dull moments.';
    const expectedTags = "<span class=\"tag\">I prefer introspection</span><br /> <span class=\"tag\">Gimme that space for reflection</span><br /> <span class=\"tag\">Gimme those endless dull moments</span><br />";
    expect(pipe.transform(sentences)).toEqual(expectedTags);
  });
});
