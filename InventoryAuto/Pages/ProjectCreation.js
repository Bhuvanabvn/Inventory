import { expect } from '@playwright/test';

/** Verified live against /project-creation on 2026-08-07/2026-08-10. */
export class ProjectCreation {
  constructor(page) {
    this.page = page;

    this.projectCreationMenu = page.getByRole('link', { name: 'Project Creation' });
    this.manageInventoryMenu = page.getByRole('link', { name: 'Manage Inventory' });
    this.savedProjectTab = page.getByRole('button', { name: 'Saved Project' });

    // The "Create New Project" card is itself the click target that opens
    // the dialog - there is no separate "+" button.
    this.createNewProjectCard = page.getByRole('heading', { name: 'Create New Project', exact: true });
    this.projectFormDialog = page.getByRole('dialog').filter({ hasText: 'Project Creation' });

    // Post-save success dialog
    this.successDialog = page.getByRole('dialog').filter({ hasText: 'Success' });
    this.successDialogMessage = this.successDialog.locator('p:has-text("Project Created Successfully")');
    // Icon-only close button - first button inside the success dialog.
   this.errorDialog = page.getByRole('dialog').filter({ hasText: 'Error' });
   this.successDialogErrorMessage = this.errorDialog.locator('p:has-text("Property Type \'PLOT\' Already Exists For This Site")'
);
   
  
    
    // Icon-only close button - first button inside the success dialog.
    this.successDialogCloseButton = this.successDialog.locator('button').first();
  }

  async goto(baseUrl) {
    await this.page.goto(baseUrl);
  }

  async goToProjectCreation() {
    await this.projectCreationMenu.click();
  }

  async goToManageInventory() {
    await this.manageInventoryMenu.click();
  }

  async openCreateProjectDialog() {
    await this.createNewProjectCard.click();
    await expect(this.projectFormDialog).toBeVisible();
  }

  async openSavedProjectsTab() {
    await this.savedProjectTab.click();
  }

   async verifySuccessMessage() {
  await expect(this.successDialogMessage).toBeVisible();
  }
   async verifyErrorMessage()
    { await expect(this.successDialogErrorMessage).toBeVisible(); 

    }


  async closeSuccessDialog() {
    await this.successDialogCloseButton.click();
  }
  async closeErrorDialog() { await expect(this.errorDialog).toBeVisible(); await this.errorDialogCloseButton.click(); }
}
