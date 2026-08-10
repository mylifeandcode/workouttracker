import { expect, test } from './support/test-fixtures';
import { WorkoutEditPage, WorkoutListPage } from './support/pages';
import type { ApiClient } from './support/api-client';

/*
 * Workout create/edit through the UI, plus the list's server-side paging, filtering and
 * retire/reactivate actions.
 *
 * Like exercises, workouts cannot be deleted (the API's DELETE throws NotImplementedException) —
 * retiring is the closest thing. Everything created here survives the run, which the per-run
 * database reset makes harmless.
 */
test.describe('workouts', () => {

  test('creating a workout saves it and moves to its edit route', async ({ page, api, uniqueName }) => {
    const exerciseName = uniqueName('E2E Workout Exercise');
    await api.createExerciseWithTargetAreas(exerciseName, ['Legs']);

    const editPage = new WorkoutEditPage(page);
    const workoutName = uniqueName('E2E Created Workout');

    await editPage.gotoNew();
    await editPage.name.fill(workoutName);
    await editPage.addExercise(exerciseName);
    await editPage.numberOfSets(0).fill('3');
    await editPage.save();

    //As with exercises, a new workout redirects to its own edit route once the API returns a publicId.
    await expect(page).toHaveURL(/\/workouts\/edit\/[0-9a-f-]{36}$/);

    const saved = await findWorkout(api, workoutName);
    expect(saved.exercises).toHaveLength(1);
    expect(saved.exercises[0].numberOfSets).toBe(3);
  });

  test('the save button stays disabled until the workout is valid', async ({ page, api, uniqueName }) => {
    const exerciseName = uniqueName('E2E Validation Exercise');
    await api.createExerciseWithTargetAreas(exerciseName, ['Core']);

    const editPage = new WorkoutEditPage(page);
    await editPage.gotoNew();

    //No name, no exercises.
    await expect(editPage.saveButton).toBeDisabled();

    await editPage.name.fill(uniqueName('E2E Invalid Workout'));
    await editPage.addExercise(exerciseName);

    //Number of sets defaults to 0, and the form requires at least 1.
    await expect(editPage.numberOfSets(0)).toHaveValue('0');
    await expect(editPage.saveButton).toBeDisabled();

    await editPage.numberOfSets(0).fill('2');
    await expect(editPage.saveButton).toBeEnabled();
  });

  test('exercises can be reordered and removed before saving', async ({ page, api, uniqueName }) => {
    const first = uniqueName('E2E Reorder First');
    const second = uniqueName('E2E Reorder Second');
    await api.createExerciseWithTargetAreas(first, ['Back']);
    await api.createExerciseWithTargetAreas(second, ['Chest']);

    const editPage = new WorkoutEditPage(page);
    await editPage.gotoNew();
    await editPage.name.fill(uniqueName('E2E Reordered Workout'));
    await editPage.addExercise(first);
    await editPage.addExercise(second);

    await expect(editPage.exerciseName(0)).toHaveValue(first);
    await expect(editPage.exerciseName(1)).toHaveValue(second);

    await editPage.moveDownButton(0).click();
    await expect(editPage.exerciseName(0)).toHaveValue(second);
    await expect(editPage.exerciseName(1)).toHaveValue(first);

    await editPage.removeButton(0).click();
    await expect(editPage.exerciseRows).toHaveCount(1);
    await expect(editPage.exerciseName(0)).toHaveValue(first);
  });

  test('editing a workout from the list persists the change', async ({ page, api, uniqueName }) => {
    const exerciseName = uniqueName('E2E Editable Workout Exercise');
    const exercise = await api.createExerciseWithTargetAreas(exerciseName, ['Shoulders']);
    const workoutName = uniqueName('E2E Editable Workout');
    const created = await api.createWorkout(workoutName, [{ exerciseId: exercise.id, numberOfSets: 2 }]);

    const listPage = new WorkoutListPage(page);
    const editPage = new WorkoutEditPage(page);

    await listPage.goto();
    await listPage.searchByName(workoutName);
    await listPage.editLink(workoutName).click();

    await expect(page).toHaveURL(new RegExp(`/workouts/edit/${created.publicId}$`));
    await expect(editPage.name).toHaveValue(workoutName);
    await expect(editPage.numberOfSets(0)).toHaveValue('2');

    await editPage.numberOfSets(0).fill('4');
    await editPage.save();

    await expect(editPage.savedMessage()).toBeVisible();

    const reloaded = await api.getWorkoutByPublicId(created.publicId);
    expect(reloaded.exercises[0].numberOfSets).toBe(4);
  });

  test('the view route opens read-only and can be switched into editing', async ({ page, api, uniqueName }) => {
    const exercise = await api.createExerciseWithTargetAreas(uniqueName('E2E Viewable Workout Exercise'), ['Abs']);
    const workoutName = uniqueName('E2E Viewable Workout');
    const created = await api.createWorkout(workoutName, [{ exerciseId: exercise.id }]);

    const editPage = new WorkoutEditPage(page);
    await editPage.gotoView(created.publicId);

    await expect(editPage.name).toHaveValue(workoutName);
    await expect(editPage.name).toBeDisabled();
    //The Add Exercise and Save buttons only render once editing is enabled.
    await expect(editPage.addExerciseButton).toHaveCount(0);

    await editPage.enableEditing();

    await expect(editPage.name).toBeEnabled();
    await expect(editPage.addExerciseButton).toBeVisible();
  });

  test.describe('the list', () => {

    test('filters by name and reports the total', async ({ page, api, uniqueName }) => {
      const exercise = await api.createExerciseWithTargetAreas(uniqueName('E2E Filter Exercise'), ['Legs']);
      const workoutName = uniqueName('E2E Filtered Workout');
      await api.createWorkout(workoutName, [{ exerciseId: exercise.id }]);

      const listPage = new WorkoutListPage(page);
      await listPage.goto();
      await listPage.searchByName(workoutName);

      await expect(listPage.row(workoutName)).toBeVisible();
      await expect(listPage.totalRecords).toHaveText('1 total workout(s)');
      await expect(listPage.rows).toHaveCount(1);
    });

    test('pages server-side at ten rows', async ({ page, api, uniqueName }) => {
      const exercise = await api.createExerciseWithTargetAreas(uniqueName('E2E Paging Exercise'), ['Legs']);
      const prefix = uniqueName('E2E Paged Workout');

      //Twelve workouts sharing a prefix: enough for a second page at the default size of ten.
      for (let i = 1; i <= 12; i++) {
        await api.createWorkout(`${prefix} ${String(i).padStart(2, '0')}`, [{ exerciseId: exercise.id }]);
      }

      const listPage = new WorkoutListPage(page);
      await listPage.goto();
      await listPage.searchByName(prefix);

      await expect(listPage.totalRecords).toHaveText('12 total workout(s)');
      await expect(listPage.rows).toHaveCount(10);
      await expect(listPage.row(`${prefix} 01`)).toBeVisible();
      await expect(listPage.row(`${prefix} 11`)).toHaveCount(0);

      await listPage.pageButton(2).click();

      await expect(listPage.rows).toHaveCount(2);
      await expect(listPage.row(`${prefix} 11`)).toBeVisible();
      await expect(listPage.row(`${prefix} 12`)).toBeVisible();
    });

    test('a workout can be retired and reactivated', async ({ page, api, uniqueName }) => {
      const exercise = await api.createExerciseWithTargetAreas(uniqueName('E2E Retire Exercise'), ['Legs']);
      const workoutName = uniqueName('E2E Retirable Workout');
      await api.createWorkout(workoutName, [{ exerciseId: exercise.id }]);

      const listPage = new WorkoutListPage(page);
      await listPage.goto();
      await listPage.searchByName(workoutName);

      await expect(listPage.statusCell(workoutName)).toContainText('Active');

      /*
       * Both actions confirm via window.confirm first. Playwright auto-dismisses dialogs that
       * have no handler, which silently cancels the action — so accept them for the rest of
       * this test.
       */
      page.on('dialog', dialog => dialog.accept());

      await listPage.retireButton(workoutName).click();

      //Retiring drops the workout out of the list entirely: the Status column filters to
      //"Active Only" by default. Clearing that filter is the only way to see it again.
      await expect(listPage.row(workoutName)).toHaveCount(0);
      await listPage.includeRetiredWorkouts();

      await expect(listPage.statusCell(workoutName)).toContainText('Retired');

      await listPage.reactivateButton(workoutName).click();
      await expect(listPage.statusCell(workoutName)).toContainText('Active');
    });
  });

  test.describe('the unsaved-changes guard', () => {

    test('leaving a dirty form prompts, and staying keeps the edits', async ({ page, uniqueName }) => {
      const editPage = new WorkoutEditPage(page);
      const workoutName = uniqueName('E2E Abandoned Workout');

      await editPage.gotoNew();
      await editPage.name.fill(workoutName);

      //The guard uses window.confirm; dismissing it cancels the navigation.
      let promptText: string | null = null;
      page.once('dialog', async dialog => {
        promptText = dialog.message();
        await dialog.dismiss();
      });

      await page.getByRole('link', { name: 'Workout Tracker' }).click();

      expect(promptText).toContain('unsaved changes');
      await expect(page).toHaveURL(/\/workouts\/new$/);
      await expect(editPage.name).toHaveValue(workoutName);
    });

    test('accepting the prompt leaves the page', async ({ page, uniqueName }) => {
      const editPage = new WorkoutEditPage(page);

      await editPage.gotoNew();
      await editPage.name.fill(uniqueName('E2E Discarded Workout'));

      page.once('dialog', dialog => dialog.accept());
      await page.getByRole('link', { name: 'Workout Tracker' }).click();

      await expect(page).toHaveURL(/\/home$/);
    });

    test('an untouched form navigates away without prompting', async ({ page }) => {
      const editPage = new WorkoutEditPage(page);
      await editPage.gotoNew();
      await expect(editPage.name).toBeVisible();

      let dialogAppeared = false;
      page.once('dialog', async dialog => {
        dialogAppeared = true;
        await dialog.dismiss();
      });

      await page.getByRole('link', { name: 'Workout Tracker' }).click();

      await expect(page).toHaveURL(/\/home$/);
      expect(dialogAppeared).toBe(false);
    });
  });
});

/** The workout list returns WorkoutDTOs; this fetches the full entity behind one by name. */
async function findWorkout(api: ApiClient, name: string) {
  const matches = await api.searchWorkouts(name);
  expect(matches.results, `Expected exactly one workout named "${name}"`).toHaveLength(1);

  return api.getWorkoutByPublicId(matches.results[0].id);
}
