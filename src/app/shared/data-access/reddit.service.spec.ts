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
        name: 'somecoolpost',
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

      const mockReqTwo = httpMock.expectOne((req) => req.url.includes(api));
      mockReqTwo.flush(testResponse);

      const sizeBefore = getGifsSpy.getValueAt(
        getGifsSpy.getValuesLength() - 2
      ).length;
      const sizeAfter = getGifsSpy.getLastValue()?.length;

      expect(sizeAfter).toBeGreaterThan(sizeBefore);
    });

    it('should add the after parameter set to the name of the previous last gif if additional gifs are being loaded', () => {
      service.loadGifs();

      const mockReq = httpMock.expectOne(api);
      mockReq.flush(testResponse);

      const lastGifName =
        testResponse.data.children[testResponse.data.children.length - 1].data
          .name;

      service.loadGifs();

      const mockReqTwo = httpMock.expectOne(api + `&after=${lastGifName}`);
      mockReqTwo.flush(testResponse);
    });

    it('should call complete method on infinite scroll target if supplied once data has loaded', () => {
      const fakeInfiniteEvent = {
        target: {
          complete: jest.fn(),
        },
      } as any;

      service.loadGifs(fakeInfiniteEvent);

      const mockReq = httpMock.expectOne(api);
      mockReq.flush(testResponse);

      expect(fakeInfiniteEvent.target.complete).toHaveBeenCalled();
    });

    it('should filter out any gifs that do not have a useable src property', () => {
      testResponse.data.children[0].data.secure_media = null as any;
      testResponse.data.children[0].data.media.reddit_video = null as any;
      testResponse.data.children[0].data.preview = null as any;

      const lengthWithNoPostFiltered = testResponse.data.children.length;

      service.loadGifs();

      const mockReq = httpMock.expectOne(api);
      mockReq.flush(testResponse);

      const result = getGifsSpy.getLastValue();

      expect(result?.length).toBeLessThan(lengthWithNoPostFiltered);
    });

    it('should leave src unchanged if already in mp4 format', () => {
      testResponse.data.children[0].data.url = 'https://test.com/test.mp4';

      service.loadGifs();

      const mockReq = httpMock.expectOne(api);
      mockReq.flush(testResponse);

      const result = getGifsSpy.getLastValue();

      expect(
        result?.find((gif) => gif.src === 'https://test.com/test.mp4')
      ).toBeTruthy();
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

    it('should convert src to mp4 format if the post is in .webm format', () => {
      testResponse.data.children[0].data.url = 'https://test.com/test.webm';

      service.loadGifs();

      const mockReq = httpMock.expectOne(api);
      mockReq.flush(testResponse);

      const result = getGifsSpy.getLastValue();

      expect(
        result?.find((gif) => gif.src === 'https://test.com/test.mp4')
      ).toBeTruthy();
    });

    it('should convert src to secure media if available, if gifv or webm not available', () => {
      testResponse.data.children[0].data.secure_media.reddit_video.fallback_url =
        'test';

      service.loadGifs();

      const mockReq = httpMock.expectOne(api);
      mockReq.flush(testResponse);

      const result = getGifsSpy.getLastValue();

      expect(result?.find((gif) => gif.src === 'test')).toBeTruthy();
    });

    it('should convert src to media if available and none of the above available', () => {
      testResponse.data.children[0].data.secure_media = null as any;
      testResponse.data.children[0].data.media.reddit_video.fallback_url =
        'test';

      service.loadGifs();

      const mockReq = httpMock.expectOne(api);
      mockReq.flush(testResponse);

      const result = getGifsSpy.getLastValue();

      expect(result?.find((gif) => gif.src === 'test')).toBeTruthy();
    });

    it('should convert src to fallback url of preview if no media objects are available', () => {
      testResponse.data.children[0].data.secure_media = null as any;
      testResponse.data.children[0].data.media.reddit_video = null as any;
      testResponse.data.children[0].data.preview.reddit_video_preview = {
        fallback_url: 'test',
      } as any;

      service.loadGifs();

      const mockReq = httpMock.expectOne(api);
      mockReq.flush(testResponse);

      const result = getGifsSpy.getLastValue();

      expect(result?.find((gif) => gif.src === 'test')).toBeTruthy();
    });
  });

  describe('reset()', () => {
    it('should make a request to the API for the subreddit supplied', () => {
      const testSubreddit = 'test';
      service.reset(testSubreddit);

      const mockReq = httpMock.expectOne(api.replace('gifs', testSubreddit));
      mockReq.flush(testResponse);
    });

    it('should emit the returned data on getGifs stream, clearing all other data', () => {
      service.loadGifs();

      const mockReq = httpMock.expectOne(api);
      mockReq.flush(testResponse);

      const testSubreddit = 'test';
      service.reset(testSubreddit);

      const mockReqTwo = httpMock.expectOne(api.replace('gifs', testSubreddit));
      mockReqTwo.flush(testResponse);

      expect(getGifsSpy.getLastValue()?.length).toEqual(
        testResponse.data.children.length
      );
    });
  });
});
