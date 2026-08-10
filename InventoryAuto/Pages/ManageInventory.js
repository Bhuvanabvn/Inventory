import { expect } from '@playwright/test';

/**
 * Verified live at /manage-inventory. This page lists PROJECTS (each with
 * Delete/View buttons) - deleting here deletes an entire project's
 * inventory, not a single unit.
 */
export class ManageInventory {
  constructor(page) {
    this.page = page;

    this.confirmDialog = page.getByRole('dialog').filter({ hasText: 'Are you sure you want to delete' });
    this.confirmMessage = this.confirmDialog.locator('p:has-text("Are you sure you want to delete the selected units?")');
    this.okayButton = this.confirmDialog.getByRole('button', { name: 'Okay' });

    this.successDialog = page.getByRole('dialog').filter({ hasText: 'Success' });
    this.successMessage = this.successDialog.locator(
      'p:has-text("Project, Property, and Inventory are Deleted Successfully")'
    );
    this.successCloseButton = this.successDialog.locator('button').first();
  }

  projectCard(projectName) {
    return this.page.locator('div').filter({ hasText: projectName.toUpperCase() }).last();
  }

  async clickDeleteForProject(projectName) {
    await this.projectCard(projectName).getByRole('button', { name: 'Delete' }).click();
  }

  async clickViewForProject(projectName) {
    await this.projectCard(projectName).getByRole('button', { name: 'View' }).click();
  }

  async verifyDeleteConfirmationPopup() {
    await expect(this.confirmMessage).toBeVisible();
  }

  async clickOkayOnPopup() {
    await this.okayButton.click();
  }

  async verifyDeleteSuccessMessage() {
    await expect(this.successMessage).toBeVisible();
  }

  async closeSuccessDialog() {
    await this.successCloseButton.click();
  }

  async verifyProjectRemoved(projectName) {
    await expect(this.page.locator('div', { hasText: projectName.toUpperCase() })).toHaveCount(0);
  }
}
