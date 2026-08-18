import { expect } from '@playwright/test';

/**
 * Verified LIVE on https://inventory-qa.mint360.in for all three unit
 * types (Plot, Villa, Apartment) — 2026-08-18, via Playwright MCP
 * browser session (login: management@adglobal360.com).
 *
 * Header cards: "TOTAL UNITS", "AVAILABLE", "SOLD", "BOOKED", "HOLD".
 *
 * A project has ONE unit type only. The other two tab buttons are
 * rendered *disabled* on that project's inventory page.
 *
 * "Add Unit" opens a "Create Unit" dialog. THE FIELD SET AND ORDER
 * DIFFERS PER UNIT TYPE — this is the root cause of the previous
 * Jenkins failure (IM_004 Villa), where fields were located by
 * positional index (`.nth(2)`, `.nth(3)`, ...) assuming the 6-field
 * Plot layout. Villa/Apartment have 14 fields each, so those indices
 * silently landed on the wrong inputs and several required fields
 * were never filled, leaving the dialog open after submit.
 *
 * Confirmed field order per type (label -> input type):
 *
 *  PLOT (6 fields):
 *    Total Units* (text) | Unit Number* (text) | Plot Area (Sqft) (text)
 *    | Facing* (select) | Sqft Price* (text) | Status* (select)
 *
 *  VILLA (14 fields):
 *    Total Units* | Unit Number* | Carpet Area | Built-up Area | Plot Size
 *    | Facing* (select) | No of Floors* | No of Bedroom* | No of Hall*
 *    | No of Kitchen* | Toilets* | Car Parking* | Sqft Price*
 *    | Status* (select)
 *
 *  APARTMENT (14 fields):
 *    Total Units* | Unit Number* | Plot Area (Sqft) | UDS (Sqft)
 *    | Carpet Area | Facing* (select) | Floor Number* | No of Bedroom*
 *    | No of Hall* | No of Kitchen* | Toilets* | Car Parking*
 *    | Sqft Price* | Status* (select)
 *
 * FIX APPROACH: every field is now located by walking up from its
 * label text to the dialog, then finding the nearest input/select —
 * NOT by raw position. This is resilient to field count/order
 * differing across unit types, and to future fields being inserted.
 *
 * Unit card prefixes confirmed live: Plot -> "P#", Villa -> "V#",
 * Apartment -> "A#" (e.g. P1, V1, A1).
 *
 * TODO: this.createUnitSubmitButton is matched by accessible name
 * regex /save|create|submit/i. Confirm the exact visible label against
 * live DevTools before relying on it in CI — the accessibility
 * snapshot used to build this file did not expose the submit button's
 * name explicitly.
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

    // ---- Create Unit dialog ----
    this.createUnitDialog = page.getByRole('dialog').filter({ hasText: 'Create Unit' });

    // Header row holds the dialog title + a close (X) icon button.
    this._headerButtons = this.createUnitDialog.locator('> div').first().locator('button');
    this.createUnitCloseButton = this._headerButtons.first();

    // TODO: confirm exact visible label in DevTools before relying on this
    // in CI (see class-level TODO above).
    this.createUnitSubmitButton = this.createUnitDialog.getByRole('button', { name: /save|create|submit/i });

    this.plotUnitCards = page.locator('p', { hasText: /^P\d+$/ });
    this.villaUnitCards = page.locator('p', { hasText: /^V\d+$/ });
    this.apartmentUnitCards = page.locator('p', { hasText: /^A\d+$/ });
  }

  // ---------------------------------------------------------------
  // Generic, label-scoped field locators (unit-type agnostic)
  // ---------------------------------------------------------------

  /** Textbox whose field label (exact or prefix) is `labelText`. */
  fieldInput(labelText) {
    return this.createUnitDialog
      .locator('div', { has: this.page.locator('text=' + labelText) })
      .locator('input, textarea')
      .first();
  }

  /** <select> whose field label (exact or prefix) is `labelText`. */
  fieldSelect(labelText) {
    return this.createUnitDialog
      .locator('div', { has: this.page.locator('text=' + labelText) })
      .locator('select')
      .first();
  }

  // ---------------------------------------------------------------
  // Page-level actions
  // ---------------------------------------------------------------

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
   * Fills the Create Unit form for a PLOT project.
   * Confirmed fields: Total Units*, Unit Number*, Plot Area (Sqft),
   * Facing*, Sqft Price*, Status*.
   */
  async fillPlotUnitForm({ totalUnits, unitNumber, area, facing, price, status }) {
    if (totalUnits !== undefined) {
      await this.fieldInput('Total Units').fill(String(totalUnits));
    }
    await this.fieldInput('Unit Number').fill(unitNumber);
    if (area !== undefined) {
      await this.fieldInput('Plot Area').fill(String(area));
    }
    await this.fieldSelect('Facing').selectOption(facing.toUpperCase());
    await this.fieldInput('Sqft Price').fill(String(price));
    await this.fieldSelect('Status').selectOption(status.toUpperCase());
  }

  /**
   * Fills the Create Unit form for a VILLA project.
   * Confirmed fields: Total Units*, Unit Number*, Carpet Area,
   * Built-up Area, Plot Size, Facing*, No of Floors*, No of Bedroom*,
   * No of Hall*, No of Kitchen*, Toilets*, Car Parking*, Sqft Price*,
   * Status*.
   */
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
    await this.fieldInput('Unit Number').fill(unitNumber);
    if (carpetArea !== undefined) {
      await this.fieldInput('Carpet Area').fill(String(carpetArea));
    }
    if (builtUpArea !== undefined) {
      await this.fieldInput('Built-up Area').fill(String(builtUpArea));
    }
    if (plotSize !== undefined) {
      await this.fieldInput('Plot Size').fill(String(plotSize));
    }
    await this.fieldSelect('Facing').selectOption(facing.toUpperCase());
    await this.fieldInput('No of Floors').fill(String(floors));
    await this.fieldInput('No of Bedroom').fill(String(bedrooms));
    await this.fieldInput('No of Hall').fill(String(halls));
    await this.fieldInput('No of Kitchen').fill(String(kitchens));
    await this.fieldInput('Toilets').fill(String(toilets));
    await this.fieldInput('Car Parking').fill(String(carParking));
    await this.fieldInput('Sqft Price').fill(String(price));
    await this.fieldSelect('Status').selectOption(status.toUpperCase());
  }

  /**
   * Fills the Create Unit form for an APARTMENT project.
   * Confirmed fields: Total Units*, Unit Number*, Plot Area (Sqft),
   * UDS (Sqft), Carpet Area, Facing*, Floor Number*, No of Bedroom*,
   * No of Hall*, No of Kitchen*, Toilets*, Car Parking*, Sqft Price*,
   * Status*.
   */
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
    await this.fieldInput('Unit Number').fill(unitNumber);
    if (plotArea !== undefined) {
      await this.fieldInput('Plot Area').fill(String(plotArea));
    }
    if (uds !== undefined) {
      await this.fieldInput('UDS').fill(String(uds));
    }
    if (carpetArea !== undefined) {
      await this.fieldInput('Carpet Area').fill(String(carpetArea));
    }
    await this.fieldSelect('Facing').selectOption(facing.toUpperCase());
    await this.fieldInput('Floor Number').fill(String(floorNumber));
    await this.fieldInput('No of Bedroom').fill(String(bedrooms));
    await this.fieldInput('No of Hall').fill(String(halls));
    await this.fieldInput('No of Kitchen').fill(String(kitchens));
    await this.fieldInput('Toilets').fill(String(toilets));
    await this.fieldInput('Car Parking').fill(String(carParking));
    await this.fieldInput('Sqft Price').fill(String(price));
    await this.fieldSelect('Status').selectOption(status.toUpperCase());
  }

  async submitCreateUnit() {
    await this.createUnitSubmitButton.click();
  }

  async closeCreateUnitDialog() {
    await this.createUnitCloseButton.click();
  }

  /** Full happy-path helper: add a Plot unit. */
  async addPlotUnit(unitData) {
    await this.openAddUnitDialog();
    await this.fillPlotUnitForm(unitData);
    console.log(`Saving Plot unit: ${unitData.unitNumber}`);
    await this.submitCreateUnit();
    await expect(this.createUnitDialog).toBeHidden({ timeout: 10000 });
  }

  /** Full happy-path helper: add a Villa unit. */
  async addVillaUnit(unitData) {
    await this.openAddUnitDialog();
    await this.fillVillaUnitForm(unitData);
    console.log(`Saving Villa unit: ${unitData.unitNumber}`);
    await this.submitCreateUnit();
    await expect(this.createUnitDialog).toBeHidden({ timeout: 10000 });
  }

  /** Full happy-path helper: add an Apartment unit. */
  async addApartmentUnit(unitData) {
    await this.openAddUnitDialog();
    await this.fillApartmentUnitForm(unitData);
    console.log(`Saving Apartment unit: ${unitData.unitNumber}`);
    await this.submitCreateUnit();
    await expect(this.createUnitDialog).toBeHidden({ timeout: 10000 });
  }

  async verifyUnitVisible(unitCode) {
    const unit = this.page.getByText(unitCode, { exact: true });
    await expect(unit).toBeVisible({ timeout: 15000 });
  }
}