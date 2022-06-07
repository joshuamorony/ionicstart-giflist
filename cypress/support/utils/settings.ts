import { getSettingsButton } from './home';

export const navigateToSettingsPage = () => {
  cy.visit('/');
  getSettingsButton().click();
};

export const getDefaultSubredditInput = () =>
  cy.get('[data-test="default-subreddit"] input');

export const getSettingsSaveButton = () =>
  cy.get('[data-test="settings-save-button"]');
