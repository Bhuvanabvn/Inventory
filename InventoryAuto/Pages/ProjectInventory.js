import { expect } from '@playwright/test';

/**
 * Project Inventory Page Object
 *
 * Supports:
 * - Plot
 * - Villa
 * - Apartment
 *
 * Each project has one unit type.
 */
export class ProjectInventory {
  constructor(page) {
    this.page = page;

    // ---------------------------------------------------------------
    // Page elements
    // ---------------------------------------------------------------

    this.pageTitle = page.locator('p', { hasText: /INVENTORY$/ });
    this.backButton = page.getByRole('button', { name: 'Back' });

    // ---------------------------------------------------------------
    // Inventory summary cards
    // ---------------------------------------------------------------

    this.totalUnitsCard = page
      .locator('div')
      .filter({ hasText: /^TOTAL UNITS/ })
      .last();

    this.availableCard = page
      .locator('div')
      .filter({ hasText: /^AVAILABLE/ })
      .last();

    this.soldCard = page
      .locator('div')
      .filter({ hasText: /^SOLD/ })
      .last();

    this.bookedCard = page
      .locator('div')
      .filter({ hasText: /^BOOKED/ })
      .last();

    this.holdCard = page
      .locator('div')
      .filter({ hasText: /^HOLD/ })
      .last();

    this.totalUnitsCount = this.totalUnitsCard.getByRole('heading');
    this.availableCount = this.availableCard.getByRole('heading');
    this.soldCount = this.soldCard.getByRole('heading');
    this.bookedCount = this.bookedCard.getByRole('heading');
    this.holdCount = this.holdCard.getByRole('heading');

    // ---------------------------------------------------------------
    // Unit type tabs
    // ---------------------------------------------------------------

    this.plotTab = page.getByRole('button', { name: 'Plot' });
    this.villaTab = page.getByRole('button', { name: 'Villa' });
    this.apartmentTab = page.getByRole('button', { name: 'Apartment' });

    // ---------------------------------------------------------------
    // Action buttons
    // ---------------------------------------------------------------

    this.addUnitButton = page.getByRole('button', { name: 'Add Unit' });
    this.uploadButton = page.getByRole('button', { name: 'Upload' });

    // ---------------------------------------------------------------
    // Create Unit dialog
    // ---------------------------------------------------------------

    this.createUnitDialog = page
      .getByRole('dialog')
      .filter({ hasText: 'Create Unit' });

    this._headerButtons = this.createUnitDialog
      .locator('> div')
      .first()
      .locator('button');

    this.createUnitCloseButton = this._headerButtons.first();

    this.createUnitSubmitButton = this.createUnitDialog.getByRole('button', {
      name: /save|create|submit/i,
    });

    // ---------------------------------------------------------------
    // Unit cards
    // ---------------------------------------------------------------

    this.plotUnitCards = page.locator('p', {
      hasText: /^P\d+$/,
    });

    this.villaUnitCards = page.locator('p', {
      hasText: /^V\d+$/,
    });

    this.apartmentUnitCards = page.locator('p', {
      hasText: /^A\d+$/,
    });
  }

  // ===============================================================
  // Generic field locators
  // ===============================================================

  fieldInput(labelText) {
    return this.createUnitDialog
      .locator('div', {
        has: this.page.locator(`text=${labelText}`),
      })
      .locator('input, textarea')
      .first();
  }

  fieldSelect(labelText) {
    return this.createUnitDialog
      .locator('div', {
        has: this.page.locator(`text=${labelText}`),
      })
      .locator('select')
      .first();
  }

  // ===============================================================
  // Page-level actions
  // ===============================================================

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
    await this.page
      .locator('p', {
        hasText: new RegExp(`^${code}$`),
      })
      .click();
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

  // ===============================================================
  // Create Unit dialog
  // ===============================================================

  async openAddUnitDialog() {
    await this.addUnitButton.click();

    await expect(this.createUnitDialog).toBeVisible({
      timeout: 10000,
    });
  }

  // ===============================================================
  // Plot
  // ===============================================================

  async fillPlotUnitForm({
    totalUnits,
    unitNumber,
    area,
    facing,
    price,
    status,
  }) {
    if (totalUnits !== undefined) {
      await this.fieldInput('Total Units').fill(String(totalUnits));
    }

    await this.fieldInput('Unit Number').fill(String(unitNumber));

    if (area !== undefined) {
      await this.fieldInput('Plot Area').fill(String(area));
    }

    await this.fieldSelect('Facing').selectOption(
      String(facing).toUpperCase()
    );

    await this.fieldInput('Sqft Price').fill(String(price));

    await this.fieldSelect('Status').selectOption(
      String(status).toUpperCase()
    );
  }

  // ===============================================================
  // Villa
  // ===============================================================

  async fillVillaUnitForm({
    totalUnits,
    unitNumber,
    carpetArea,
    builtUpArea,
    plotSize,
    facing,
    floors,
    bedrooms,
    halls,
    kitchens,
    toilets,
    carParking,
    price,
    status,
  }) {
    if (totalUnits !== undefined) {
      await this.fieldInput('Total Units').fill(String(totalUnits));
    }

    await this.fieldInput('Unit Number').fill(String(unitNumber));

    if (carpetArea !== undefined) {
      await this.fieldInput('Carpet Area').fill(String(carpetArea));
    }

    if (builtUpArea !== undefined) {
      await this.fieldInput('Built-up Area').fill(String(builtUpArea));
    }

    if (plotSize !== undefined) {
      await this.fieldInput('Plot Size').fill(String(plotSize));
    }

    await this.fieldSelect('Facing').selectOption(
      String(facing).toUpperCase()
    );

    await this.fieldInput('No of Floors').fill(String(floors));

    await this.fieldInput('No of Bedroom').fill(String(bedrooms));

    await this.fieldInput('No of Hall').fill(String(halls));

    await this.fieldInput('No of Kitchen').fill(String(kitchens));

    await this.fieldInput('Toilets').fill(String(toilets));

    await this.fieldInput('Car Parking').fill(String(carParking));

    await this.fieldInput('Sqft Price').fill(String(price));

    await this.fieldSelect('Status').selectOption(
      String(status).toUpperCase()
    );
  }

  // ===============================================================
  // Apartment
  // ===============================================================

  async fillApartmentUnitForm({
    totalUnits,
    unitNumber,
    plotArea,
    uds,
    carpetArea,
    facing,
    floorNumber,
    bedrooms,
    halls,
    kitchens,
    toilets,
    carParking,
    price,
    status,
  }) {
    if (totalUnits !== undefined) {
      await this.fieldInput('Total Units').fill(String(totalUnits));
    }

    await this.fieldInput('Unit Number').fill(String(unitNumber));

    if (plotArea !== undefined) {
      await this.fieldInput('Plot Area').fill(String(plotArea));
    }

    if (uds !== undefined) {
      await this.fieldInput('UDS').fill(String(uds));
    }

    if (carpetArea !== undefined) {
      await this.fieldInput('Carpet Area').fill(String(carpetArea));
    }

    await this.fieldSelect('Facing').selectOption(
      String(facing).toUpperCase()
    );

    await this.fieldInput('Floor Number').fill(String(floorNumber));

    await this.fieldInput('No of Bedroom').fill(String(bedrooms));

    await this.fieldInput('No of Hall').fill(String(halls));

    await this.fieldInput('No of Kitchen').fill(String(kitchens));

    await this.fieldInput('Toilets').fill(String(toilets));

    await this.fieldInput('Car Parking').fill(String(carParking));

    await this.fieldInput('Sqft Price').fill(String(price));

    await this.fieldSelect('Status').selectOption(
      String(status).toUpperCase()
    );
  }

  // ===============================================================
  // Submit / Close
  // ===============================================================

  async submitCreateUnit() {
    await this.createUnitSubmitButton.click();
  }

  async closeCreateUnitDialog() {
    await this.createUnitCloseButton.click();
  }

  // ===============================================================
  // Add Plot Unit
  // ===============================================================

  async addPlotUnit(unitData) {
    await this.openAddUnitDialog();

    await this.fillPlotUnitForm(unitData);

    console.log(`Saving Plot unit: ${unitData.unitNumber}`);

    await this.submitCreateUnit();

    await expect(this.createUnitDialog).toBeHidden({
      timeout: 10000,
    });
  }

  // ===============================================================
  // Add Villa Unit
  // ===============================================================

  async addVillaUnit(unitData) {
    await this.openAddUnitDialog();

    await this.fillVillaUnitForm(unitData);

    console.log(`Saving Villa unit: ${unitData.unitNumber}`);

    await this.submitCreateUnit();

    await expect(this.createUnitDialog).toBeHidden({
      timeout: 10000,
    });
  }

  // ===============================================================
  // Add Apartment Unit
  // ===============================================================

  async addApartmentUnit(unitData) {
    await this.openAddUnitDialog();

    await this.fillApartmentUnitForm(unitData);

    console.log(`Saving Apartment unit: ${unitData.unitNumber}`);

    await this.submitCreateUnit();

    await expect(this.createUnitDialog).toBeHidden({
      timeout: 10000,
    });
  }

  // ===============================================================
  // Generic Add Unit
  //
  // This fixes:
  // TypeError: projectInventory.addUnit is not a function
  // ===============================================================

  async addUnit(unitData) {
    if (!unitData) {
      throw new Error('Unit data is required');
    }

    const { type, ...data } = unitData;

    switch (type) {
      case 'Plot':
        await this.addPlotUnit(data);
        break;

      case 'Villa':
        await this.addVillaUnit(data);
        break;

      case 'Apartment':
        await this.addApartmentUnit(data);
        break;

      default:
        throw new Error(
          `Unsupported unit type: ${type}. Expected Plot, Villa, or Apartment.`
        );
    }
  }

  // ===============================================================
  // Verify Unit
  // ===============================================================

  async verifyUnitVisible(unitCode) {
    const unit = this.page.getByText(unitCode, {
      exact: true,
    });

    await expect(unit).toBeVisible({
      timeout: 15000,
    });
  }
}