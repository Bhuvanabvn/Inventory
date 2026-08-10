import { expect } from '@playwright/test';

/**
 * Verified live on a Plot project's inventory page
 * (/manage-inventory/{id}?tab=PLOT).
 *
 * Header cards: "TOTAL UNITS", "AVAILABLE", "SOLD", "BOOKED", "HOLD"
 * (plural/uppercase).
 *
 * IMPORTANT: a project only has ONE unit type. When a project is Plot,
 * the Villa and Apartment tab buttons are rendered *disabled*.
 *
 * "Add Unit" opens a "Create Unit" dialog. Confirmed fields for a PLOT
 * project: Total Units*, Unit Number*, Plot Area (Sqft), Facing*
 * (native <select>: NORTH/EAST/WEST/SOUTH/NORTH-EAST/NORTH-WEST/
 * SOUTH-EAST/SOUTH-WEST), Sqft Price*, Status* (native <select>:
 * AVAILABLE/BOOKED/SOLD/HOLD).
 *
 * TODO (not yet confirmed live):
 * - The dialog's submit button never appeared in the accessibility
 *   snapshot even at a large viewport - `createUnitSubmitButton` below
 *   is a best-effort guess. Confirm the real name/selector in DevTools
 *   and update it before relying on `submitCreateUnit()`.
 * - Villa/Apartment "Create Unit" forms were not independently
 *   verified - they may have different/extra fields (e.g. BHK, built-up
 *   area). `fillUnitForm()` accepts an `extraFields` map for exactly
 *   this reason - wire it up once confirmed.
 */
export class ProjectInventory {
  constructor(page) {
    this.page = page;

    this.pageTitle = page.locator('p', { hasText: /INVENTORY$/ });
    this.backButton = page.getByRole('button', { name: 'Back' });

    this.totalUnitsCard = page.locator('div').filter({ hasText: /^TOTAL UNITS/ }).last();
    this.availableCard = page.locator('div').filter({ hasText: /^AVAILABLE/ }).last();
    this.soldCard = page.locator('div').filter({ hasText: /^SOLD/ }).last();
    this.bookedCard = page.locator('div').filter({ hasText: /^BOOKED/ }).last();
    this.holdCard = page.locator('div').filter({ hasText: /^HOLD/ }).last();

    this.totalUnitsCount = this.totalUnitsCard.getByRole('heading');
    this.availableCount = this.availableCard.getByRole('heading');
    this.soldCount = this.soldCard.getByRole('heading');
    this.bookedCount = this.bookedCard.getByRole('heading');
    this.holdCount = this.holdCard.getByRole('heading');

    this.plotTab = page.getByRole('button', { name: 'Plot' });
    this.villaTab = page.getByRole('button', { name: 'Villa' });
    this.apartmentTab = page.getByRole('button', { name: 'Apartment' });

    this.addUnitButton = page.getByRole('button', { name: 'Add Unit' });
    this.uploadButton = page.getByRole('button', { name: 'Upload' });

    // ---- Create Unit dialog (confirmed for Plot) ----
    this.createUnitDialog = page.getByRole('dialog').filter({ hasText: 'Create Unit' });
    this.totalUnitsInput = this.createUnitDialog.getByRole('textbox').nth(0); // defaults to "1"
    this.unitNumberInput = this.createUnitDialog.getByRole('textbox').nth(1);
    this.plotAreaInput = this.createUnitDialog.getByRole('textbox').nth(2);
    this.facingSelect = this.createUnitDialog.locator('select').nth(0);
    this.sqftPriceInput = this.createUnitDialog.getByRole('textbox').nth(3);
    this.statusSelect = this.createUnitDialog.locator('select').nth(1);
    // TODO: unconfirmed selector - verify against live DOM
    this.createUnitSubmitButton = this.createUnitDialog.getByRole('button').first();
   this.createUnitCloseButton = this.createUnitDialog.getByRole('button').nth(1);

    // TODO: confirm P/V/A prefix convention against live Villa & Apartment projects
    this.plotUnitCards = page.locator('p', { hasText: /^P\d+$/ });
    this.villaUnitCards = page.locator('p', { hasText: /^V\d+$/ });
    this.apartmentUnitCards = page.locator('p', { hasText: /^A\d+$/ });
  }

  async verifyPageTitleContains(projectName) {
    await expect(this.pageTitle).toContainText(projectName.toUpperCase());
  }

  async verifyTotalUnitsCount(expected) {
    await expect(this.totalUnitsCount).toHaveText(String(expected));
  }

  async verifyAvailableCount(expected) {
    await expect(this.availableCount).toHaveText(String(expected));
  }

  async verifySoldCount(expected) {
    await expect(this.soldCount).toHaveText(String(expected));
  }

  async verifyBookedCount(expected) {
    await expect(this.bookedCount).toHaveText(String(expected));
  }

  async verifyHoldCount(expected) {
    await expect(this.holdCount).toHaveText(String(expected));
  }

  async openUnitByCode(code) {
    await this.page.locator('p', { hasText: new RegExp(`^${code}$`) }).click();
  }

  async clickBack() {
    await this.backButton.click();
  }

  async clickPlotTab() {
    await this.plotTab.click();
  }

  async clickVillaTab() {
    await this.villaTab.click();
  }

  async clickApartmentTab() {
    await this.apartmentTab.click();
  }

  async openAddUnitDialog() {
    await this.addUnitButton.click();
    await expect(this.createUnitDialog).toBeVisible();
  }

  /**
   * Fills the Create Unit form. `extraFields` is a hook for Villa/Apartment
   * specific fields once confirmed (e.g. { bhk: '2BHK', builtUpArea: '950' }).
   */
  async fillUnitForm({ totalUnits, unitNumber, area, facing, price, status, extraFields = {} }) {
    if (totalUnits !== undefined) {
      await this.totalUnitsInput.fill(String(totalUnits));
    }
    await this.unitNumberInput.fill(unitNumber);
    if (area !== undefined) {
      await this.plotAreaInput.fill(String(area));
    }
    await this.facingSelect.selectOption(facing.toUpperCase());
    await this.sqftPriceInput.fill(String(price));
    await this.statusSelect.selectOption(status.toUpperCase());
    // TODO: apply extraFields for Villa/Apartment once those fields are confirmed
    void extraFields;
  }

  async submitCreateUnit() {
    await this.createUnitSubmitButton.click();
}

  async closeCreateUnitDialog() {
    await this.createUnitCloseButton.click();
  }

  /** Full happy-path helper for adding one unit. */
 async addUnit(unitData) {
    await this.openAddUnitDialog();

    await this.fillUnitForm(unitData);

    console.log(`Saving unit: ${unitData.unitNumber}`);

    await this.createUnitSubmitButton.click();

    await expect(this.createUnitDialog).toBeHidden({
        timeout: 10000
    });
}

async verifyUnitVisible(unitCode) {
    const unit = this.page.getByText(unitCode, {
        exact: true
    });

    await expect(unit).toBeVisible({
        timeout: 15000
    });
}
}
