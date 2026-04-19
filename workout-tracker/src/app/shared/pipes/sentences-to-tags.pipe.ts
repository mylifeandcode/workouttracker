import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'sentencesToTags',
})
export class SentencesToTagsPipe implements PipeTransform {
  private _sanitizer = inject(DomSanitizer);

  transform(value: string | null): SafeHtml {
    if (!value) {
      return '';
    }
    const sentences: string[] = value.split('.').map(s => s.trim()).filter(s => s.length > 0);
    const tags: string[] = sentences.map(s => `<span class="tag">${s}</span><br />`);
    return this._sanitizer.bypassSecurityTrustHtml(tags.join(' '));
  }

}
