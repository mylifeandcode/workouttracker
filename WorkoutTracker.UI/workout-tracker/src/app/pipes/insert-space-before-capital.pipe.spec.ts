import { InsertSpaceBeforeCapitalPipe } from './insert-space-before-capital.pipe';

describe('InsertSpaceBeforeCapitalPipe', () => {
  it('create an instance', () => {
    const pipe = new InsertSpaceBeforeCapitalPipe();
    expect(pipe).toBeTruthy();
  });

  it('should transform strings correctly', () => {
    const pipe = new InsertSpaceBeforeCapitalPipe();
    expect(pipe.transform('FreeWeight')).toEqual('Free Weight');
  });
});
