import {
  getCommentsButton,
  getListItems,
  getVideo,
  navigateToHomePage,
} from '../support/utils';

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

  it('should be able to play videos', () => {
    getVideo()
      .first()
      .then((element) => {
        element.on('playing', cy.stub().as('playing'));
      });

    getVideo().first().click();

    cy.get('@playing').should('have.been.called');
  });

  it('should be able to click comments button to open the source reddit thread for the gif', () => {
    getCommentsButton().first().click();
    cy.window().its('open').should('be.called');
  });
});
