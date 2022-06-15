import { getSettingsButton } from './home';

export const navigateToSettingsPage = () => {
  cy.visit('/');
  getSettingsButton().click();
};

export const getPerPageInput = () =>
  cy.get('[data-test="perPage"] ion-segment-button[ng-reflect-value="20"]');

export const getNewSegment = () =>
  cy.get('[data-test="sort"] ion-segment-button[ng-reflect-value="new"]');

export const getSettingsSaveButton = () =>
  cy.get('[data-test="settings-save-button"]');
