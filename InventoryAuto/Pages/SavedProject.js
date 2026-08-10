import { expect } from '@playwright/test';

/**
 * Verified live at /project-creation?tab=saved.
 * Real column headers: "Project ID", "Project Name", "Project Type",
 * "Location", "Total Unit", "Status", "Edit / View", "Inventory".
 */
export class SavedProject {
  constructor(page) {
    this.page = page;
    this.table = page.getByRole('table');

    this.headers = {
      projectId: this.table.getByRole('columnheader', { name: 'Project ID' }),
      projectName: this.table.getByRole('columnheader', { name: 'Project Name' }),
      projectType: this.table.getByRole('columnheader', { name: 'Project Type' }),
      location: this.table.getByRole('columnheader', { name: 'Location' }),
      totalUnit: this.table.getByRole('columnheader', { name: 'Total Unit' }),
      status: this.table.getByRole('columnheader', { name: 'Status' }),
      editView: this.table.getByRole('columnheader', { name: 'Edit / View' }),
      inventory: this.table.getByRole('columnheader', { name: 'Inventory' }),
    };
  }

  async verifyTableHeadersVisible() {
    for (const header of Object.values(this.headers)) {
      await expect(header).toBeVisible();
    }
  }

  rowByProjectName(projectName) {
    return this.table.getByRole('row').filter({ hasText: projectName });
  }

  async verifyProjectRowVisible(projectName) {
    await expect(this.rowByProjectName(projectName.toUpperCase())).toBeVisible();
  }

  async clickInventoryForProject(projectName) {
    // Observed order in each row: [.., Edit/View button, Inventory button]
    await this.rowByProjectName(projectName.toUpperCase()).getByRole('button').nth(1).click();
  }

  async clickEditViewForProject(projectName) {
    await this.rowByProjectName(projectName.toUpperCase()).getByRole('button').nth(0).click();
  }
}
