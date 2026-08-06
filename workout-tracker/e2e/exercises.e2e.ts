import { expect, test } from './support/test-fixtures';
import { ExerciseEditPage, ExerciseListPage } from './support/pages';
import type { ExerciseFormValues } from './support/pages';

/*
 * Exercise create/read/update through the UI, verified against the API.
 *
 * There is no delete coverage because the API cannot delete exercises —
 * DELETE api/Exercises/{publicId} throws NotImplementedException. Everything these tests create
 * therefore lives for the rest of the run, which the per-run database reset makes harmless.
 */
test.describe('exercises', () => {

  test('creating an exercise saves it and moves to its edit route', async ({ page, api, uniqueName }) => {
    const editPage = new ExerciseEditPage(page);
    const name = uniqueName('E2E Created Exercise');

    await editPage.gotoNew();
    await editPage.fillForm(exerciseValues(name, ['Legs']));
    await editPage.save();

    /*
     * Not asserting the "Exercise created at ..." message here: saving a new exercise sets it and
     * then immediately navigates to the edit route, which tears the component down and takes the
     * message with it. (Worth noting that this means a real user rarely sees that confirmation.)
     * The durable outcomes are the redirect and the record itself.
     */
    await expect(page).toHaveURL(/\/exercises\/edit\/[0-9a-f-]{36}$/);
    await expect(editPage.name).toHaveValue(name);

    const found = await api.searchExercises(name);
    expect(found.totalCount).toBe(1);
    expect(found.results[0].name).toBe(name);
  });

  test('the save button stays disabled until the form is complete', async ({ page, uniqueName }) => {
    const editPage = new ExerciseEditPage(page);

    await editPage.gotoNew();
    await expect(editPage.saveButton).toBeDisabled();

    //Every text field filled, but no target area selected — still invalid.
    await editPage.name.fill(uniqueName('E2E Incomplete'));
    await editPage.description.fill('Description');
    await editPage.setup.fill('Setup');
    await editPage.movement.fill('Movement');
    await editPage.pointsToRemember.fill('Points');
    await expect(editPage.saveButton).toBeDisabled();

    await editPage.targetArea('Core').check();
    await expect(editPage.saveButton).toBeEnabled();
  });

  test('a created exercise appears in the list with its target areas', async ({ page, api, uniqueName }) => {
    const name = uniqueName('E2E Listed Exercise');
    await api.createExerciseWithTargetAreas(name, ['Back']);

    const listPage = new ExerciseListPage(page);
    await listPage.goto();
    await listPage.searchByName(name);

    await expect(listPage.row(name)).toBeVisible();
    await expect(listPage.targetAreasFor(name)).toHaveText('Back');
    await expect(listPage.totalRecords).toHaveText('1 total exercise(s)');
  });

  test('editing an exercise from the list persists the change', async ({ page, api, uniqueName }) => {
    const originalName = uniqueName('E2E Editable Exercise');
    const created = await api.createExerciseWithTargetAreas(originalName, ['Chest']);

    const listPage = new ExerciseListPage(page);
    const editPage = new ExerciseEditPage(page);

    await listPage.goto();
    await listPage.searchByName(originalName);
    await listPage.editLink(originalName).click();

    await expect(page).toHaveURL(new RegExp(`/exercises/edit/${created.publicId}$`));
    await expect(editPage.name).toHaveValue(originalName);

    const updatedName = `${originalName} (updated)`;
    await editPage.name.fill(updatedName);
    await editPage.description.fill('Updated description');
    await editPage.save();

    await expect(editPage.savedMessage('updated')).toBeVisible();

    const reloaded = await api.getExerciseByPublicId(created.publicId);
    expect(reloaded.name).toBe(updatedName);
    expect(reloaded.description).toBe('Updated description');
  });

  test('the view route opens read-only and can be switched into editing', async ({ page, api, uniqueName }) => {
    const name = uniqueName('E2E Viewable Exercise');
    const created = await api.createExerciseWithTargetAreas(name, ['Biceps']);

    const editPage = new ExerciseEditPage(page);
    await editPage.gotoView(created.publicId);

    await expect(editPage.name).toHaveValue(name);
    //The fieldset is disabled on the view route, so there is no Save button at all.
    await expect(editPage.name).toBeDisabled();
    await expect(editPage.saveButton).toHaveCount(0);

    await editPage.enableEditing();

    await expect(editPage.name).toBeEnabled();
    await expect(editPage.saveButton).toBeVisible();
  });
});

function exerciseValues(name: string, targetAreas: string[]): ExerciseFormValues {
  return {
    name,
    description: `${name} description`,
    setup: 'Get into position.',
    movement: 'Perform the movement.',
    pointsToRemember: 'Keep good form.',
    targetAreas,
  };
}
