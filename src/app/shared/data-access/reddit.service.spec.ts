import { TestBed } from '@angular/core/testing';
import { SubscriberSpy, subscribeSpyTo } from '@hirez_io/observer-spy';
import { Gif } from '../interfaces/gif';

import { RedditService } from './reddit.service';

describe('RedditService', () => {
  let service: RedditService;
  let getGifsSpy: SubscriberSpy<Gif[]>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RedditService);
    getGifsSpy = subscribeSpyTo(service.getGifs());
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getGifs()', () => {
    it('should return a stream of an empty array initially', () => {
      expect(getGifsSpy.getLastValue()).toEqual([]);
    });
  });

  describe('loadGifs()', () => {
    it('should cause new data to emit on getGifs() stream', () => {
      service.loadGifs();
      expect(getGifsSpy.getLastValue()?.length).toBeGreaterThan(0);
    });
  });
});
