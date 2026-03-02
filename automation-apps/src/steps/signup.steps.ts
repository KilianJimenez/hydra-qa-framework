import { Given, When, Then } from '@wdio/cucumber-framework';
import { SignUpScreen } from '../screens/signup.screen';
import { expect } from 'expect';

const signUpScreen = new SignUpScreen();

Given('I am on the sign-up page', async () => {
  await signUpScreen.waitForScreenLoaded();
});

When('I enter valid credentials', async () => {
  await signUpScreen.enterCredentials('testuser@example.com', 'SecureP@ss123!');
});

When('I click the sign-up button', async () => {
  await signUpScreen.tapSignUp();
});

Then('I should see a confirmation message', async () => {
  const isVisible = await signUpScreen.isConfirmationDisplayed();
  expect(isVisible).toBe(true);
});

