import { expect } from '@playwright/test';

export class LoginPage {
    constructor(page) {
        this.page = page;

        // Application login page
        this.signInButton = page.getByRole('button', { name: 'SIGN IN' });

        // AWS Cognito hosted UI
        this.emailField = page.locator('(//input[@name="username"])[2]');;
        this.passwordField = page.locator('(//input[@name="password"])[2]');
        this.cognitoSubmitButton = page.locator("(//input[@class='btn btn-primary submitButton-customizable'])[2]");
         
    }

    async goto(baseUrl) {
        await this.page.goto(baseUrl);
    }

    async login(username, password) {
        // Click SIGN IN on the application
        await this.signInButton.click();

        // Cognito login page
        await this.emailField.fill(username);
        await this.passwordField.fill(password);

        await this.cognitoSubmitButton.click();
    }

    async verifyLoggedIn() {
        await expect(this.page).toHaveURL(/\/project-creation/);
    }
}