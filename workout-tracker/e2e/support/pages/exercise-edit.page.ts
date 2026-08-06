import type { Locator, Page } from '@playwright/test';

export interface ExerciseFormValues {
  name: string;
  description: string;
  setup: string;
  movement: string;
  pointsToRemember: string;
  targetAreas: string[];
}

/**
 * The exercise form, used for all three of `/exercises/new`, `/exercises/edit/:publicId` and
 * `/exercises/view/:publicId` — the same component, with editing switched off on the view route.
 */
export class ExerciseEditPage {
  readonly name: Locator;
  readonly description: Locator;
  readonly setup: Locator;
  readonly movement: Locator;
  readonly pointsToRemember: Locator;
  readonly resistanceType: Locator;
  readonly involvesReps: Locator;
  readonly oneSided: Locator;
  readonly usesBilateralResistance: Locator;
  readonly saveButton: Locator;
  readonly editModeToggle: Locator;
  readonly errorMessage: Locator;

  constructor(private readonly page: Page) {
    //Placeholders are the most stable handle here: the name/description labels wrap their
    //inputs, while the instruction fields are addressed by id.
    this.name = page.getByPlaceholder('Exercise Name (required)');
    this.description = page.getByPlaceholder('Exercise Description (required)');
    this.setup = page.locator('#howToPrepare');
    this.movement = page.locator('#howToPerform');
    this.pointsToRemember = page.locator('#pointsToRemember');
    this.resistanceType = page.locator('#resistanceType');
    this.involvesReps = page.getByRole('checkbox', { name: 'Involves Repetitions' });
    this.oneSided = page.getByRole('checkbox', { name: 'One Sided' });
    this.usesBilateralResistance = page.getByRole('checkbox', { name: 'Uses bilateral resistance' });
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.editModeToggle = page.locator('#editModeToggle');
    this.errorMessage = page.locator('.error-text');
  }

  async gotoNew(): Promise<void> {
    await this.page.goto('/exercises/new');
  }

  async gotoEdit(publicId: string): Promise<void> {
    await this.page.goto(`/exercises/edit/${publicId}`);
  }

  async gotoView(publicId: string): Promise<void> {
    await this.page.goto(`/exercises/view/${publicId}`);
  }

  /**
   * The target-area checkboxes have no label association in the template — the area name is a
   * text sibling of the input rather than a <label>. Scoping to the target-areas column and
   * filtering by that text is the most stable handle available without changing the markup.
   */
  targetArea(name: string): Locator {
    return this.page.locator('.target-areas > div').filter({ hasText: name }).getByRole('checkbox');
  }

  async fillForm(values: ExerciseFormValues): Promise<void> {
    await this.name.fill(values.name);
    await this.description.fill(values.description);
    await this.setup.fill(values.setup);
    await this.movement.fill(values.movement);
    await this.pointsToRemember.fill(values.pointsToRemember);

    for (const area of values.targetAreas) {
      await this.targetArea(area).check();
    }
  }

  async save(): Promise<void> {
    await this.saveButton.click();
  }

  /** Confirmation text the form shows after a successful save. */
  savedMessage(kind: 'created' | 'updated'): Locator {
    return this.page.getByText(new RegExp(`Exercise ${kind} at`));
  }

  /** The view route renders with editing disabled until this is switched on. */
  async enableEditing(): Promise<void> {
    await this.editModeToggle.click();
  }
}
