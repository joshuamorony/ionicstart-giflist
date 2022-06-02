/* eslint-disable @typescript-eslint/naming-convention */
import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  HttpClientTestingModule,
} from '@angular/common/http/testing';
import { SubscriberSpy, subscribeSpyTo } from '@hirez_io/observer-spy';
import { Gif } from '../interfaces/gif';
import { RedditPost } from '../interfaces/reddit-post';
import { RedditResponse } from '../interfaces/reddit-response';

import { RedditService } from './reddit.service';

describe('RedditService', () => {
  let service: RedditService;
  let httpMock: HttpTestingController;

  let getGifsSpy: SubscriberSpy<Gif[]>;
  let testResponse: RedditResponse;
  const api = `https://www.reddit.com/r/gifs/hot/.json?limit=100`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(RedditService);
    httpMock = TestBed.inject(HttpTestingController);
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
        url: '',
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
  });

  describe('loadGifs()', () => {
    it('should cause new data to emit on getGifs() stream', () => {
      service.loadGifs();

      const mockReq = httpMock.expectOne(api);
      mockReq.flush(testResponse);

      expect(getGifsSpy.getLastValue()?.length).toBeGreaterThan(0);
    });

    it('should add additional data to getGifs() array every time it is called', () => {
      service.loadGifs();

      const mockReq = httpMock.expectOne(api);
      mockReq.flush(testResponse);

      service.loadGifs();

      const sizeBefore = getGifsSpy.getValueAt(
        getGifsSpy.getValuesLength() - 2
      ).length;
      const sizeAfter = getGifsSpy.getLastValue()?.length;

      expect(sizeAfter).toBeGreaterThan(sizeBefore);

      // this test doesn't fail

      expect(false).toBe(true);
    });

    it('should convert src to mp4 format if the post is in .gifv format', () => {
      testResponse.data.children[0].data.url = 'https://test.com/test.gifv';

      service.loadGifs();

      const mockReq = httpMock.expectOne(api);
      mockReq.flush(testResponse);

      const result = getGifsSpy.getLastValue();

      expect(
        result?.find((gif) => gif.src === 'https://test.com/test.mp4')
      ).toBeTruthy();
    });

    // same for webm format
  });
});
