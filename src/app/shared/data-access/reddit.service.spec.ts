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
    it('should return a stream of an array', () => {
      expect(getGifsSpy.getLastValue()).toBeInstanceOf(Array);
    });

    it('should trigger load method', () => {
      jest.spyOn(service, 'loadGifs');
      service.getGifs();
      expect(service.loadGifs).toHaveBeenCalled();
    });
  });

  describe('loadGifs()', () => {
    it('should cause new data to emit on getGifs() stream', () => {
      service.loadGifs();
      expect(getGifsSpy.getLastValue()?.length).toBeGreaterThan(0);
    });

    it('should add additional data to getGifs() array every time it is called', () => {
      service.loadGifs();
      service.loadGifs();

      const sizeBefore = getGifsSpy.getValueAt(
        getGifsSpy.getValuesLength() - 2
      ).length;
      const sizeAfter = getGifsSpy.getLastValue()?.length;

      expect(sizeAfter).toBeGreaterThan(sizeBefore);
    });
  });
});
