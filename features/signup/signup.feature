@JIRA-001 @web @mobile @signup
Feature: Sign Up

  As a new user
  I want to create an account with valid credentials
  So that I can access the application

  @smoke
  Scenario: User can sign up with valid credentials
    Given I am on the sign-up page
    When I enter valid credentials
    And I click the sign-up button
    Then I should see a confirmation message