import { ExerciseTargetAreaLink } from '../_models/exercise-target-area-link';
import { TargetArea } from '../_models/target-area';
import { TargetAreasPipe } from './target-areas.pipe';

describe('TargetAreasPipe', () => {
  
  it('should create an instance', () => {
    const pipe = new TargetAreasPipe();
    expect(pipe).toBeTruthy();
  });

  it('should return a string of the target area names', () => {

    //ARRANGE
    const link1 = new ExerciseTargetAreaLink(1, 2);
    const link2 = new ExerciseTargetAreaLink(4, 5);
    const link3 = new ExerciseTargetAreaLink(7, 8);

    link1.targetArea = new TargetArea(1, "Chest", 1, new Date(), null, null, false);
    link2.targetArea = new TargetArea(2, "Triceps", 1, new Date(), null, null, false);
    link3.targetArea = new TargetArea(3, "Shoulders", 1, new Date(), null, null, false);

    const links = new Array<ExerciseTargetAreaLink>();
    links.push(link1, link2, link3);

    //ACT
    const pipe = new TargetAreasPipe();

    //ASSERT
    expect(pipe.transform(links)).toEqual("Chest, Triceps, Shoulders");

  });
});
