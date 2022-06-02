import { getListItems, navigateToHomePage } from '../support/utils';

describe('Home', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/.json?limit=100', {
      fixture: 'reddit.json',
    });
    navigateToHomePage();
  });

  it('displays a list with items', () => {
    getListItems().should('have.length.above', 0);
  });
});
