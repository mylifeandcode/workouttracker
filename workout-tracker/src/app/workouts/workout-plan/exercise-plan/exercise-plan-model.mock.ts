import { ResistanceType, SetType } from '../../../api';
import { IExercisePlanModel } from './interfaces/i-exercise-plan-form-group';

//Shared test fixture: a valid IExercisePlanModel with optional per-test overrides.
export function getExercisePlanModel(overrides: Partial<IExercisePlanModel> = {}): IExercisePlanModel {
  return {
    exerciseInWorkoutId: 1,
    exerciseId: 200,
    exerciseName: 'Bench Press',
    numberOfSets: 3,
    setType: SetType.TIMED,
    resistanceType: ResistanceType.RESISTANCE_BAND,
    sequence: 0,
    targetRepCountLastTime: null,
    avgActualRepCountLastTime: null,
    avgRangeOfMotionLastTime: null,
    avgFormLastTime: null,
    recommendedTargetRepCount: null,
    targetRepCount: null,
    resistanceAmountLastTime: null,
    resistanceMakeupLastTime: null,
    recommendedResistanceAmount: null,
    recommendedResistanceMakeup: null,
    resistanceAmount: 100,
    resistanceMakeup: null,
    bandsEndToEnd: null,
    involvesReps: true,
    usesBilateralResistance: false,
    recommendationReason: null,
    ...overrides
  };
}
