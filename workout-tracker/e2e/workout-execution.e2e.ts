import { expect, test } from './support/test-fixtures';
import {
  RATING,
  WorkoutExecutionPage,
  WorkoutPlanPage,
  WorkoutSelectPage,
} from './support/pages';
import { ResistanceType } from '../src/app/api/types.gen';

/*
 * The app's core loop, end to end through the UI: pick a workout, plan it, execute it, complete it.
 *
 * Each test builds its own single-exercise workout via the API so the planning and execution
 * screens stay small enough to assert on precisely — the flow is identical for larger workouts,
 * just with more rows.
 */
test.describe('workout execution', () => {

  test('a workout can be selected, planned, executed and completed', async ({ page, api, uniqueName }) => {
    const exerciseName = uniqueName('E2E Execution Exercise');
    const workoutName = uniqueName('E2E Execution Workout');

    const exercise = await api.createExerciseWithTargetAreas(exerciseName, ['Legs']);
    await api.createWorkout(workoutName, [{ exerciseId: exercise.id, numberOfSets: 1 }]);

    const selectPage = new WorkoutSelectPage(page);
    const planPage = new WorkoutPlanPage(page);
    const executionPage = new WorkoutExecutionPage(page);

    //1. Select — choosing from the dropdown routes straight to planning.
    await selectPage.goto();
    await selectPage.selectWorkout(workoutName);

    await expect(page).toHaveURL(/\/workouts\/plan\/[0-9a-f-]{36}$/);
    await expect(planPage.heading).toBeVisible();
    //A brand new workout has no history, so the "Last Time" columns are suppressed.
    await expect(planPage.neverDoneBefore).toBeVisible();

    //2. Plan — resistance and target reps are both required before the workout can start.
    await expect(planPage.startWorkoutButton).toBeDisabled();
    await planPage.planExercise(0, 95, 10);
    await expect(planPage.startWorkoutButton).toBeEnabled();
    await planPage.startWorkout();

    //3. Execute.
    await expect(page).toHaveURL(/\/workouts\/start\/[0-9a-f-]{36}$/);
    await expect(executionPage.heading(workoutName)).toBeVisible();
    await expect(executionPage.startedText).toBeVisible();

    //Planning pre-populates the target rep count, so only the actuals and ratings are missing.
    await expect(executionPage.completeButton).toBeDisabled();
    await executionPage.fillSet(0, 0, {
      resistance: 95,
      actualReps: 9,
      formRating: RATING.GOOD,
      rangeOfMotionRating: RATING.EXCELLENT,
    });

    //The panel header gains "(DONE)" once that exercise's field tree is valid.
    await expect(executionPage.exercisePanelHeader(exerciseName)).toContainText('(DONE)');

    await executionPage.journal.fill('Felt strong today.');
    await expect(executionPage.completeButton).toBeEnabled();
    await executionPage.complete();

    //4. Completed.
    await expect(executionPage.completedText).toBeVisible();
    await expect(executionPage.viewHistoryButton).toBeVisible();
    await expect(executionPage.planNextButton).toBeVisible();

    //5. Verify it landed server-side, not just in the UI.
    const executed = await api.getExecutedWorkouts(workoutName);
    expect(executed.results).toHaveLength(1);
    expect(executed.results[0].name).toBe(workoutName);
    expect(executed.results[0].endDateTime).toBeTruthy();
  });

  test('a completed workout shows up in analytics', async ({ page, api, uniqueName }) => {
    const exerciseName = uniqueName('E2E Analytics Exercise');
    const workoutName = uniqueName('E2E Analytics Workout');

    const exercise = await api.createExerciseWithTargetAreas(exerciseName, ['Biceps']);
    await api.createWorkout(workoutName, [{ exerciseId: exercise.id, numberOfSets: 1 }]);

    const selectPage = new WorkoutSelectPage(page);
    const planPage = new WorkoutPlanPage(page);
    const executionPage = new WorkoutExecutionPage(page);

    await selectPage.goto();
    await selectPage.selectWorkout(workoutName);
    await planPage.planExercise(0, 40, 12);
    await planPage.startWorkout();

    await executionPage.fillSet(0, 0, { resistance: 40, actualReps: 12 });
    await executionPage.complete();
    await expect(executionPage.completedText).toBeVisible();

    /*
     * Analytics is driven by completed workouts, so it only renders anything once at least one
     * exists — which is why this assertion lives here rather than in a standalone analytics test.
     * The count is deliberately loose: other tests in the run complete workouts for this user too.
     */
    await page.goto('/analytics');

    await expect(page.getByRole('heading', { name: 'Analytics' })).toBeVisible();
    await expect(page.getByText(/You have logged [1-9]\d* workouts since/)).toBeVisible();
    await expect(page.locator('tbody tr').filter({ hasText: 'Biceps' })).toBeVisible();
  });

  test('planning for later saves a plan without starting it', async ({ page, api, uniqueName }) => {
    const exercise = await api.createExerciseWithTargetAreas(uniqueName('E2E Later Exercise'), ['Chest']);
    const workoutName = uniqueName('E2E Later Workout');
    await api.createWorkout(workoutName, [{ exerciseId: exercise.id, numberOfSets: 1 }]);

    const selectPage = new WorkoutSelectPage(page);
    const planPage = new WorkoutPlanPage(page);

    await selectPage.gotoForLater();
    await selectPage.selectWorkout(workoutName);

    await expect(page).toHaveURL(/\/workouts\/plan-for-later\/[0-9a-f-]{36}$/);
    //The for-later route offers "Save Workout Plan" in place of "Start Workout".
    await expect(planPage.savePlanButton).toBeVisible();
    await expect(planPage.startWorkoutButton).toHaveCount(0);

    await planPage.planExercise(0, 60, 8);
    await planPage.savePlanButton.click();

    /*
     * A saved-but-unstarted plan is only visible through the dedicated "planned" endpoint — the
     * main executed-workout list filters these out. That endpoint takes no name filter, so match
     * on the name here.
     */
    await expect(async () => {
      const planned = await api.getPlannedWorkouts();
      const match = planned.results.filter(result => result.name === workoutName);

      expect(match).toHaveLength(1);
      expect(match[0].endDateTime).toBeFalsy();
    }).toPass();
  });

  test('the exercise resistance type drives which planning inputs appear', async ({ page, api, uniqueName }) => {
    //Body-weight exercises have no resistance amount to enter — the card shows text instead.
    const exerciseName = uniqueName('E2E BodyWeight Exercise');
    const exercise = await api.createExercise({
      name: exerciseName,
      resistanceType: ResistanceType.BODY_WEIGHT,
      exerciseTargetAreaLinks: [],
    });
    const workoutName = uniqueName('E2E BodyWeight Workout');
    await api.createWorkout(workoutName, [{ exerciseId: exercise.id, numberOfSets: 1 }]);

    const selectPage = new WorkoutSelectPage(page);
    const planPage = new WorkoutPlanPage(page);

    await selectPage.goto();
    await selectPage.selectWorkout(workoutName);

    await expect(planPage.resistanceAmount(0)).toHaveCount(0);
    await expect(planPage.bodyWeightLabel(0)).toHaveText('Body Weight');

    //Reps are still required, so the workout can start once they're supplied.
    await expect(planPage.startWorkoutButton).toBeDisabled();
    await planPage.targetRepCount(0).fill('15');
    await expect(planPage.startWorkoutButton).toBeEnabled();
  });
});
