import { test as base, createBdd } from 'playwright-bdd';

// Define custom fixture types here
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type Fixtures = {
  // Add page object fixtures here as the project grows:
  // loginPage: LoginPage;
  // dashboardPage: DashboardPage;
};

export const test = base.extend<Fixtures>({
  // Register page object fixtures here:
  // loginPage: async ({ page }, use) => {
  //   await use(new LoginPage(page));
  // },
});

export const { Given, When, Then } = createBdd(test);
