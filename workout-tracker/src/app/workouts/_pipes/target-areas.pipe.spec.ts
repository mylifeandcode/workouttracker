import { ExerciseTargetAreaLink, TargetArea } from '../../api';
import { TargetAreasPipe } from './target-areas.pipe';

describe('TargetAreasPipe', () => {
  
  it('should create an instance', () => {
    const pipe = new TargetAreasPipe();
    expect(pipe).toBeTruthy();
  });

  it('should return a string of the target area names', () => {

    //ARRANGE
    const link1 = <ExerciseTargetAreaLink>{ exerciseId: 1, targetAreaId: 2 };
    const link2 = <ExerciseTargetAreaLink>{ exerciseId: 4, targetAreaId: 5 };
    const link3 = <ExerciseTargetAreaLink>{ exerciseId: 7, targetAreaId: 8 };

    link1.targetArea = <TargetArea>{ id: 1, name: "Chest", order: 1, createdAt: new Date(), updatedAt: null, deletedAt: null, isActive: false, createdByUserId: 0, createdDateTime: new Date() };
    link2.targetArea = <TargetArea>{ id: 2, name: "Triceps", order: 1, createdAt: new Date(), updatedAt: null, deletedAt: null, isActive: false, createdByUserId: 0, createdDateTime: new Date() };
    link3.targetArea = <TargetArea>{ id: 3, name: "Shoulders", order: 1, createdAt: new Date(), updatedAt: null, deletedAt: null, isActive: false, createdByUserId: 0, createdDateTime: new Date() };

    const links = new Array<ExerciseTargetAreaLink>();
    links.push(link1, link2, link3);

    //ACT
    const pipe = new TargetAreasPipe();

    //ASSERT
    expect(pipe.transform(links)).toEqual("Chest, Triceps, Shoulders");

  });
});
