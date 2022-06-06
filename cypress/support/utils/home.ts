export const navigateToHomePage = () => {
  cy.visit('/', {
    onBeforeLoad: (win) => {
      cy.stub(win, 'open');
    },
  });
};

export const getListItems = () => cy.get('[data-test="gif-list-item"]');

export const getVideo = () => cy.get('[data-test="gif-list-item"] video');

export const getCommentsButton = () =>
  cy.get('[data-test="gif-comments-button"]');
