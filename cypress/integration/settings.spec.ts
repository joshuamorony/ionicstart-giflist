import {
  getDefaultSubredditInput,
  getSettingsSaveButton,
  navigateToSettingsPage,
} from 'cypress/support/utils';

describe('Settings', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/gifs/hot/.json?limit=100*', {
      fixture: 'reddit-gifs.json',
    }).as('redditData');
    cy.intercept('GET', '**/chemicalreactiongifs/hot/.json?limit=100*', {
      fixture: 'reddit-chemical.json',
    }).as('redditDataTwo');
    navigateToSettingsPage();
  });

  it('should be able to change the default subreddit', () => {
    getDefaultSubredditInput().type('chemicalreactiongifs');
    getSettingsSaveButton().click();
    cy.wait('@redditDataTwo');
  });

  it('should be able to change the posts shown per page', () => {});

  it('should be able to change the default subreddit', () => {});

  it('should be able to change sorting from hot to new', () => {});
});
