/* eslint-disable @typescript-eslint/naming-convention */
import { TestBed } from '@angular/core/testing';
import { SubscriberSpy, subscribeSpyTo } from '@hirez_io/observer-spy';
import { Gif } from '../interfaces/gif';
import { RedditPost } from '../interfaces/reddit-post';
import { RedditResponse } from '../interfaces/reddit-response';

import { RedditService } from './reddit.service';

describe('RedditService', () => {
  let service: RedditService;
  let getGifsSpy: SubscriberSpy<Gif[]>;
  let testResponse: RedditResponse;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RedditService);
    getGifsSpy = subscribeSpyTo(service.getGifs());

    const testData: RedditPost = {
      data: {
        author: 'Josh',
        name: 'some cool post',
        permalink: 'https://google.com',
        preview: {
          reddit_video_preview: {
            is_gif: true,
            fallback_url: '',
          },
        },
        secure_media: {
          reddit_video: {
            is_gif: true,
            fallback_url: '',
          },
        },
        title: 'some cool post',
        media: {
          reddit_video: {
            is_gif: true,
            fallback_url: '',
          },
        },
        url: 'https://google.com',
        thumbnail: '',
        num_comments: 5,
      },
    };

    testResponse = {
      data: {
        children: [testData, testData],
      },
    };
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

  describe('fetchData()', () => {
    it('should make a request to the reddit API', () => {});
    it('should return the response from the convertRedditPostToGif method', () => {});
  });

  describe('getBestSrcForGif()', () => {
    let testData: RedditPost;

    beforeEach(() => {});
  });
});
