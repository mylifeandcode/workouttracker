import { RatingPipe } from './rating.pipe';

describe('RatingPipe', () => {
  it('create an instance', () => {
    const pipe = new RatingPipe();
    expect(pipe).toBeTruthy();
  });

  it('should return the correct string for a rating of 0', () => {
    const pipe = new RatingPipe();
    expect(pipe.transform(0)).toBe('N/A');
  });

  it('should return the correct string for a rating of 1', () => {
    const pipe = new RatingPipe();
    expect(pipe.transform(1)).toBe('Bad');
  });

  it('should return the correct string for a rating of 2', () => {
    const pipe = new RatingPipe();
    expect(pipe.transform(2)).toBe('Poor');
  });

  it('should return the correct string for a rating of 3', () => {
    const pipe = new RatingPipe();
    expect(pipe.transform(3)).toBe('OK');
  });

  it('should return the correct string for a rating of 4', () => {
    const pipe = new RatingPipe();
    expect(pipe.transform(4)).toBe('Good');
  });

  it('should return the correct string for a rating of 5', () => {
    const pipe = new RatingPipe();
    expect(pipe.transform(5)).toBe('Excellent');
  });

  it('should return the correct string for a rating not in the expected range', () => {
    const pipe = new RatingPipe();
    expect(pipe.transform(6)).toBe('Unknown');
  });

});
