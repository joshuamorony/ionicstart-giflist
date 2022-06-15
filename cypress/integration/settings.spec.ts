import {
  getListItems,
  getNewSegment,
  getPerPageInput,
  getSettingsSaveButton,
  navigateToSettingsPage,
} from 'cypress/support/utils';

describe('Settings', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/gifs/hot/.json?limit=100*', {
      fixture: 'reddit-gifs.json',
    }).as('redditData');
    cy.intercept('GET', '**/gifs/new/.json?limit=100*', {
      fixture: 'reddit-chemical.json',
    }).as('redditDataTwo');
    navigateToSettingsPage();
  });

  it('should be able to change the posts shown per page', () => {
    getPerPageInput().click();
    getSettingsSaveButton().click();
    getListItems().should('have.length', 20);
  });

  it('should be able to change sorting from hot to new', () => {
    getNewSegment().click();
    getSettingsSaveButton().click();
    cy.wait('@redditDataTwo');
  });
});
