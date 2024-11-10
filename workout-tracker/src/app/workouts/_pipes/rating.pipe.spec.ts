import { RatingPipe } from './rating.pipe';

describe('RatingPipe', () => {

  const pipe = new RatingPipe();

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return the correct string for a rating of 0', () => {
    expect(pipe.transform(0)).toBe('N/A');
  });

  it('should return the correct string for a rating of 1', () => {
    expect(pipe.transform(1)).toBe('Bad');
  });

  it('should return the correct string for a rating of 2', () => {
    expect(pipe.transform(2)).toBe('Poor');
  });

  it('should return the correct string for a rating of 3', () => {
    expect(pipe.transform(3)).toBe('OK');
  });

  it('should return the correct string for a rating of 4', () => {
    expect(pipe.transform(4)).toBe('Good');
  });

  it('should return the correct string for a rating of 5', () => {
    expect(pipe.transform(5)).toBe('Excellent');
  });

  it('should return the correct string for a rating not in the expected range', () => {
    expect(pipe.transform(6)).toBe('Unknown');
  });

  it('should return the correct string for a rating less than 1 with a decimal value', () => {
    expect(pipe.transform(0.4)).toBe('Worse than Bad');
  });

  it('should return the correct string for a rating between 1.01 and 1.5 with a decimal value', () => {
    expect(pipe.transform(1.49)).toBe('Mostly Bad');
  });

  it('should return the correct string for a rating between 1.5 and 2 with a decimal value', () => {
    expect(pipe.transform(1.79)).toBe('Almost Poor');
  });

  it('should return the correct string for a rating between 2.01 and 2.49 with a decimal value', () => {
    expect(pipe.transform(2.3)).toBe('Mostly Poor');
  });

  it('should return the correct string for a rating between 2.5 and 2.99 with a decimal value', () => {
    expect(pipe.transform(2.6)).toBe('Almost OK');
  });

  it('should return the correct string for a rating between 3.01 and 3.49 with a decimal value', () => {
    expect(pipe.transform(3.35)).toBe('Mostly OK');
  });

  it('should return the correct string for a rating between 3.5 and 3.99 with a decimal value', () => {
    expect(pipe.transform(3.8)).toBe('Almost Good');
  });

  it('should return the correct string for a rating between 4.01 and 4.49 with a decimal value', () => {
    expect(pipe.transform(4.02)).toBe('Mostly Good');
  });

  it('should return the correct string for a rating between 4.5 and 4.99 with a decimal value', () => {
    expect(pipe.transform(4.99)).toBe('Almost Excellent');
  });

  it('should return the correct string for a rating with a decimal value not in the expected range', () => {
    expect(pipe.transform(5.1)).toBe('Unknown');
  });

});
