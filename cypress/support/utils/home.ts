export const navigateToHomePage = () => {
  cy.visit('/');
};

export const getListItems = () => cy.get('[data-test="gif-list-item"]');

export const getVideo = () => cy.get('[data-test="gif-video"]');
