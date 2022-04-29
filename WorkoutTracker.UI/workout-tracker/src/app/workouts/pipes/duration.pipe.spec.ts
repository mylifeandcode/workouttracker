import { DurationPipe } from './duration.pipe';

describe('DurationPipe', () => {
  
  it('should create an instance', () => {
    const pipe = new DurationPipe();
    expect(pipe).toBeTruthy();
  });

  it('should remove leading zeroes', () => {
    const pipe = new DurationPipe();
    expect(pipe.transform(3721, true)).toBe("1h2m1s");
  });

  it('should show full 2-digit values', () => {
    const pipe = new DurationPipe();
    expect(pipe.transform(84030, true)).toBe("23h20m30s");
  });

  it('should leave off seconds when precise time not requested', () => {
    const pipe = new DurationPipe();
    expect(pipe.transform(84000, false)).toBe("23h20m");
  });

});
