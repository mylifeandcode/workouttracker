import { ExerciseTargetAreaLink } from '../models/exercise-target-area-link';
import { TargetArea } from '../models/target-area';
import { TargetAreasPipe } from './target-areas.pipe';

describe('TargetAreasPipe', () => {
  it('create an instance', () => {
    const pipe = new TargetAreasPipe();
    expect(pipe).toBeTruthy();
  });

  it('should return a string of the target area names', () => {

    //ARRANGE
    let link1 = new ExerciseTargetAreaLink(1, 2, 3);
    let link2 = new ExerciseTargetAreaLink(4, 5, 6);
    let link3 = new ExerciseTargetAreaLink(7, 8, 9);

    link1.targetArea = new TargetArea(1, "Chest", 1, new Date(), null, null, false);
    link2.targetArea = new TargetArea(2, "Triceps", 1, new Date(), null, null, false);
    link3.targetArea = new TargetArea(3, "Shoulders", 1, new Date(), null, null, false);

    let links = new Array<ExerciseTargetAreaLink>();
    links.push(link1, link2, link3);

    //ACT
    const pipe = new TargetAreasPipe();

    //ASSERT
    expect(pipe.transform(links)).toEqual("Chest, Triceps, Shoulders");

  });
});
