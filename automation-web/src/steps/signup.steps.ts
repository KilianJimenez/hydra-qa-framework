import { Given, When, Then } from '@cucumber/cucumber';
import { HydraWorld } from '../support/hooks';
import { SignUpPage } from '../pages/signup.page';

let signUpPage: SignUpPage;

Given('I am on the sign-up page', async function (this: HydraWorld) {
  signUpPage = new SignUpPage(this.page);
  await signUpPage.navigate(this.config.baseUrl);
});

When('I enter valid credentials', async function (this: HydraWorld) {
  await signUpPage.enterCredentials('testuser@example.com', 'SecureP@ss123!');
});

When('I click the sign-up button', async function () {
  await signUpPage.clickSignUp();
});

Then('I should see a confirmation message', async function () {
  await signUpPage.expectConfirmationVisible();
});

