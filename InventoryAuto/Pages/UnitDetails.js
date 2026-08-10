import { expect } from '@playwright/test';

/**
 * Verified live by clicking a "P1" unit card.
 * Dialog title "Unit Details"; shows label/value pairs: Unit Number,
 * Plot Area (Sqft), Facing, Sqft Price, Status.
 */
export class UnitDetails {
  constructor(page) {
    this.page = page;
    this.dialog = page.getByRole('dialog').filter({ hasText: 'Unit Details' });

    this.unitNumberValue = this.dialog.locator('text=Unit Number').locator('..').locator('div').nth(1);
    this.plotAreaValue = this.dialog.locator('text=Plot Area (Sqft)').locator('..').locator('div').nth(1);
    this.facingValue = this.dialog.locator('text=Facing').locator('..').locator('div').nth(1);
    this.sqftPriceValue = this.dialog.locator('text=Sqft Price').locator('..').locator('div').nth(1);
    this.statusValue = this.dialog.locator('text=Status').locator('..').locator('div').nth(1);

    // 4 icon buttons in the dialog header - which one closes it is unconfirmed.
    this.headerIconButtons = this.dialog.locator('button');
    this.closeButton = this.headerIconButtons.last();
  }

  async verifyVisible() {
    await expect(this.dialog).toBeVisible();
  }

  async verifyUnitNumber(expected) {
    await expect(this.unitNumberValue).toHaveText(expected);
  }

  async verifyStatus(expected) {
    await expect(this.statusValue).toHaveText(expected);
  }

  async close() {
    await this.closeButton.click();
  }
}
