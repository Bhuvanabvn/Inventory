import { expect } from '@playwright/test';

/**
 * Verified live: clicking "Upload" (on a project's inventory page) opens
 * an intermediate dialog titled "Select The Needed Upload Option" with
 * two icon-only choice buttons. Clicking the first resolves to an
 * accessible name of "Bulk Upload".
 *
 * TODO (not yet confirmed live before the exploration session ended):
 * - The name/purpose of the second option button.
 * - The actual Bulk Upload screen that opens after choosing "Bulk
 *   Upload" - file picker, template download link, submit button, and
 *   success/error messaging are all best-effort guesses below. Verify
 *   each selector in DevTools and correct before relying on this file.
 * - The "Click to upload or drag and drop" card on the Project Creation
 *   page was seen to exist but never driven through to completion either.
 */
export class BulkUpload {
  constructor(page) {
    this.page = page;

    // Entry point on Project Creation page
    this.uploadCard = page.locator('h6:has-text("Click to upload")');

    // Entry point inside a project's inventory page
    this.uploadButton = page.getByRole('button', { name: 'Upload' });

    // Step 1: confirmed - "Select The Needed Upload Option" dialog
    this.uploadOptionsDialog = page.getByRole('dialog').filter({ hasText: 'Select The Needed Upload Option' });
    this.bulkUploadOption = this.uploadOptionsDialog.getByRole('button', { name: 'Bulk Upload' });
    // TODO: confirm the second option's real accessible name
    this.otherUploadOption = this.uploadOptionsDialog.getByRole('button').nth(1);
    this.uploadOptionsCloseButton = this.uploadOptionsDialog.locator('button').first();

    // Step 2: TODO - unconfirmed, best-effort based on other dialogs' conventions
    this.uploadDialog = page.getByRole('dialog').filter({ hasText: /upload/i });
    this.fileInput = page.locator('input[type="file"]');
    this.downloadTemplateLink = page.getByRole('link', { name: /download.*template/i });
    this.uploadSubmitButton = this.uploadDialog.getByRole('button', { name: /upload|submit/i });
    this.uploadSuccessMessage = page.locator('text=/uploaded successfully/i');
    this.uploadErrorMessage = page.locator('text=/upload failed/i');
    this.closeButton = this.uploadDialog.locator('button').first();
  }

  async openUploadOptions() {
    await this.uploadButton.click();
    await expect(this.uploadOptionsDialog).toBeVisible();
  }

  async chooseBulkUpload() {
    await this.bulkUploadOption.click();
  }

  async openFromProjectCreation() {
    await this.uploadCard.click();
  }

  async uploadFile(filePath) {
    await this.fileInput.setInputFiles(filePath);
  }

  async clickUploadSubmit() {
    await this.uploadSubmitButton.click();
  }

  async verifyUploadSuccess() {
    await expect(this.uploadSuccessMessage).toBeVisible();
  }

  async verifyUploadError() {
    await expect(this.uploadErrorMessage).toBeVisible();
  }

  async closeUploadDialog() {
    await this.closeButton.click();
  }

  /** Full flow helper - confirmed up to chooseBulkUpload(), rest is best-effort. */
  async bulkUploadFileEndToEnd(filePath) {
    await this.openUploadOptions();
    await this.chooseBulkUpload();
    await this.uploadFile(filePath);
    await this.clickUploadSubmit();
    await this.verifyUploadSuccess();
    await this.closeUploadDialog();
  }
}
