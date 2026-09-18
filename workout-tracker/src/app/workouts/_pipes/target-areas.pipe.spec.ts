import { TargetAreasPipe } from './target-areas.pipe';

describe('TargetAreasPipe', () => {

  it('should create an instance', () => {
    const pipe = new TargetAreasPipe();
    expect(pipe).toBeTruthy();
  });

  it('should return a string of the target area names', () => {
    //ARRANGE
    const pipe = new TargetAreasPipe();

    //ACT & ASSERT
    expect(pipe.transform(["Chest", "Triceps", "Shoulders"])).toEqual("Chest, Triceps, Shoulders");
  });

  it('should return an empty string when given undefined', () => {
    //ARRANGE
    const pipe = new TargetAreasPipe();

    //ACT & ASSERT
    expect(pipe.transform(undefined)).toEqual("");
  });
});
