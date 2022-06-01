import { TestBed } from '@angular/core/testing';
import { subscribeSpyTo } from '@hirez_io/observer-spy';

import { RedditService } from './reddit.service';

describe('RedditService', () => {
  let service: RedditService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RedditService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getGifs()', () => {
    it('should return a stream of an empty array initially', () => {
      const observerSpy = subscribeSpyTo(service.getGifs());
      expect(observerSpy.getLastValue()).toEqual([]);
    });
  });
});
