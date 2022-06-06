import {
  getCommentsButton,
  getScrollableContent,
  getListItems,
  getVideo,
  navigateToHomePage,
  getSubredditBar,
} from '../support/utils';

describe('Home', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/gifs/hot/.json?limit=100*', {
      fixture: 'reddit-gifs.json',
    }).as('redditData');
    cy.intercept('GET', '**/chemicalreactiongifs/hot/.json?limit=100*', {
      fixture: 'reddit-gifs.json',
    }).as('redditDataTwo');
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

  it('should be able to scroll to bottom load more videos', () => {
    // Wait for initial load
    cy.wait('@redditData');

    getListItems().then((elements) => {
      const lengthBefore = elements.length;
      getScrollableContent().scrollTo('bottom');

      cy.wait('@redditData');

      getListItems().then((elementsAfter) => {
        const lengthAfter = elementsAfter.length;

        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect(lengthAfter > lengthBefore).to.be.true;
      });
    });
  });

  it('should be able to change subreddits by typing in the bar', () => {
    getSubredditBar().type('chemicalreactiongifs');
    cy.wait('@redditDataTwo');
  });
});
