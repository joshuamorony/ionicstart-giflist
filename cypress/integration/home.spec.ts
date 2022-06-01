import { getListItems, navigateToHomePage } from '../support/utils';

describe('Home', () => {
  beforeEach(() => {
    navigateToHomePage();
  });

  it('displays a list with items', () => {
    getListItems().should('have.length.above', 0);
  });
});
