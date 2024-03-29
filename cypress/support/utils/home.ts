export const navigateToHomePage = () => {
  cy.visit('/', {
    onBeforeLoad: (win) => {
      cy.stub(win, 'open');
    },
  });
};

export const getScrollableContent = () =>
  cy.get('ion-content').shadow().find('main');

export const getListItems = () => cy.get('[data-test="gif-list-item"]');

export const getVideo = () => cy.get('[data-test="gif-list-item"] video');

export const getCommentsButton = () =>
  cy.get('[data-test="gif-comments-button"]');

export const getSubredditBar = () =>
  cy.get('[data-test="subreddit-bar"] input');

export const getSettingsButton = () => cy.get('[data-test="settings-button"]');
