import { expect } from '@playwright/test';

/**
 * Verified live on 2026-08-07/2026-08-10. Real form has 5 fields only:
 * Project Name, Project Type, Total Unit, Status, Location. No
 * "Created By" / "Created On" field exists. Project Type and Status are
 * custom comboboxes, not native <select>.
 *
 * IMPORTANT (found during a real run): validation errors do NOT clear
 * live as you type/select. The app only re-validates the whole form when
 * Save is clicked again. So "no error" checks must happen AFTER a fresh
 * clickSave(), never right after filling an individual field.
 */
export class ProjectCreationForm {
  constructor(page) {
    this.page = page;
    this.dialog = page.getByRole('dialog').filter({ hasText: 'Project Creation' });

    this.projectNameField = this.dialog.getByRole('textbox', { name: 'Project Name' });
    this.projectNameError = this.dialog.locator('p:has-text("Project name required")');

    this.locationField = this.dialog.getByRole('textbox', { name: 'City / Town' });
    this.locationError = this.dialog.locator('p:has-text("Location required")');

    // First combobox = Project Type, second = Status
    this.projectTypeCombobox = this.dialog.getByRole('combobox').first();
    this.projectTypeError = this.dialog.locator('p:has-text("Select project type")');

    this.totalUnitsField = this.dialog.getByRole('textbox', { name: 'Total Unit' });
    this.totalUnitsError = this.dialog.locator('p:has-text("Total unit must be greater than 0")');

    this.statusCombobox = this.dialog.getByRole('combobox').nth(1);
    this.statusError = this.dialog.locator('p:has-text("Select status")');

    this.saveButton = this.dialog.getByRole('button', { name: 'Save' });
  }

  async enterProjectName(name) {
    await this.projectNameField.fill(name);
  }

  async verifyProjectNameRequiredError() {
    await expect(this.projectNameError).toBeVisible();
  }

  /** Call only after a fresh clickSave() - errors don't clear on input alone. */
  async verifyNoProjectNameValidationError() {
    await expect(this.projectNameError).not.toBeVisible();
  }

  async enterLocation(location) {
    await this.locationField.fill(location);
  }

  async verifyLocationRequiredError() {
    await expect(this.locationError).toBeVisible();
  }

  async verifyNoLocationError() {
    await expect(this.locationError).not.toBeVisible();
  }

  async _selectFromCombobox(combobox, optionLabel) {
    await combobox.click();
    await this.page.getByRole('option', { name: optionLabel, exact: true }).click();
  }

  async ProjectType(type) {
    await this._selectFromCombobox(this.projectTypeCombobox, type.toUpperCase());
  }

  async verifyProjectTypeRequiredError() {
    await expect(this.projectTypeError).toBeVisible();
  }

  async TotalUnits(units) {
    await this.totalUnitsField.fill(String(units));
  }

  async verifyTotalUnitsError() {
    await expect(this.totalUnitsError).toBeVisible();
  }

  async Status(status) {
    await this._selectFromCombobox(this.statusCombobox, status.toUpperCase());
  }

  async verifyStatusRequiredError() {
    await expect(this.statusError).toBeVisible();
  }

  async clickSave() {
    await this.saveButton.click();
  }

  /** Convenience: fill every field and save in one call. */
  async fillAndSave({ name, type, totalUnits, status, location }) {
    await this.enterProjectName(name);
    await this.ProjectType(type);
    await this.TotalUnits(totalUnits);
    await this.Status(status);
    await this.enterLocation(location);
    await this.clickSave();
  }
}
