/* eslint-disable @typescript-eslint/naming-convention */
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import {
  HttpTestingController,
  HttpClientTestingModule,
} from '@angular/common/http/testing';
import { SubscriberSpy, subscribeSpyTo } from '@hirez_io/observer-spy';
import { Gif } from '../../interfaces/gif';
import { SettingsService } from '../settings/settings.service';
import { RedditPost } from '../../interfaces/reddit-post';
import { RedditResponse } from '../../interfaces/reddit-response';

import { RedditService } from './reddit.service';
import { BehaviorSubject, of } from 'rxjs';
import { Settings } from '../../interfaces';
import { FormControl } from '@angular/forms';

describe('RedditService', () => {
  let service: RedditService;
  let httpMock: HttpTestingController;

  let testResponse: RedditResponse;

  let testSettings: BehaviorSubject<Settings>;
  let testSubredditFormControl: FormControl;
  let api: string;

  beforeEach(() => {
    testSettings = new BehaviorSubject({
      sort: 'new',
      perPage: 2,
    } as Settings);

    testSubredditFormControl = new FormControl('gifs');

    api = `https://www.reddit.com/r/${testSubredditFormControl.value}/${testSettings.value.sort}/.json?limit=100`;

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: SettingsService,
          useValue: {
            settings$: testSettings,
          },
        },
      ],
    });
    service = TestBed.inject(RedditService);
    httpMock = TestBed.inject(HttpTestingController);

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
        children: [testData, testData, testData, testData],
      },
    };
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isLoading$', () => {
    let loadingSpy: SubscriberSpy<boolean>;

    beforeEach(() => {
      loadingSpy = subscribeSpyTo(service.isLoading$);
    });

    it('should be false initially', () => {
      expect(loadingSpy.getLastValue()).toEqual(false);
    });

    it('should be true when getGifs is called', () => {
      subscribeSpyTo(service.getGifs(testSubredditFormControl));
      expect(loadingSpy.getLastValue()).toEqual(true);
    });

    it('should be true when nextPage is called', () => {
      subscribeSpyTo(service.getGifs(testSubredditFormControl));

      const mockReq = httpMock.expectOne(() => true);
      mockReq.flush(testResponse);

      service.nextPage({} as any, '');
      expect(loadingSpy.getLastValue()).toEqual(true);
    });

    it('should be false once data has finished loading', () => {
      subscribeSpyTo(service.getGifs(testSubredditFormControl));

      const mockReq = httpMock.expectOne(() => true);
      mockReq.flush(testResponse);

      expect(loadingSpy.getLastValue()).toEqual(false);
    });
  });

  describe('getGifs()', () => {
    it('should make a request to the sort order specified in settings', () => {
      const getGifsSpy = subscribeSpyTo(
        service.getGifs(testSubredditFormControl)
      );

      const mockReq = httpMock.expectOne(api);
      mockReq.flush(testResponse);
    });

    it('should not emit more than the amount of items specified as perPage with each new emission', () => {
      const getGifsSpy = subscribeSpyTo(
        service.getGifs(testSubredditFormControl)
      );

      const mockReq = httpMock.expectOne(api);
      mockReq.flush(testResponse);

      service.nextPage({} as any, '');

      const mockReqTwo = httpMock.expectOne(api);
      mockReqTwo.flush(testResponse);

      const sizeBefore = getGifsSpy.getValueAt(
        getGifsSpy.getValuesLength() - 2
      ).length;
      const sizeAfter = getGifsSpy.getLastValue()?.length;

      expect(sizeAfter).toEqual(sizeBefore + testSettings.value.perPage);
    });

    it('should keep trying to find gifs if it does not get enough results to fill a page', fakeAsync(() => {
      // Require 4 requests worth of gifs
      const attempts = 4;
      const testPerPage = attempts * testResponse.data.children.length;

      testSettings.next({
        perPage: testPerPage,
        sort: 'new',
      });

      const getGifsSpy = subscribeSpyTo(
        service.getGifs(testSubredditFormControl)
      );

      [...Array(attempts)].forEach(() => {
        httpMock.expectOne(() => true).flush(testResponse);
      });

      expect(getGifsSpy.getLastValue()?.length).toEqual(16);
    }));

    it('should give up after 10 attempts', () => {
      // Require 4 requests worth of gifs
      const attempts = 11;
      const testPerPage = attempts * testResponse.data.children.length;

      testSettings.next({
        perPage: testPerPage,
        sort: 'new',
      });

      const getGifsSpy = subscribeSpyTo(
        service.getGifs(testSubredditFormControl)
      );

      [...Array(10)].forEach(() => {
        httpMock.expectOne(() => true).flush(testResponse);
      });

      expect(getGifsSpy.getLastValue()?.length).toEqual(
        10 * testResponse.data.children.length
      );
    });

    it('stream should continue to work after http error', () => {
      const getGifsSpy = subscribeSpyTo(
        service.getGifs(testSubredditFormControl)
      );

      const mockReq = httpMock.expectOne(api);
      mockReq.flush('', { status: 0, statusText: 'Unknown Error' });

      service.nextPage({} as any, '');

      const mockReqTwo = httpMock.expectOne(api);
      mockReqTwo.flush(testResponse);

      expect(getGifsSpy.getLastValue()?.length).toBeGreaterThan(0);
    });

    it('should clear cached gif data if subreddit changes', () => {
      const getGifsSpy = subscribeSpyTo(
        service.getGifs(testSubredditFormControl)
      );

      const lengthBefore = getGifsSpy.getLastValue()?.length;
      testSubredditFormControl.setValue('test2');
      const lengthAfter = getGifsSpy.getLastValue()?.length;
      expect(lengthAfter).toEqual(lengthBefore);
    });
  });

  describe('nextPage()', () => {
    it('should add additional data to getGifs() array every time it is called', () => {
      const getGifsSpy = subscribeSpyTo(
        service.getGifs(testSubredditFormControl)
      );

      const mockReq = httpMock.expectOne(api);
      mockReq.flush(testResponse);

      service.nextPage({} as any, '');

      const mockReqTwo = httpMock.expectOne((req) => req.url.includes(api));
      mockReqTwo.flush(testResponse);

      const sizeBefore = getGifsSpy.getValueAt(
        getGifsSpy.getValuesLength() - 2
      ).length;
      const sizeAfter = getGifsSpy.getLastValue()?.length;

      expect(sizeAfter).toBeGreaterThan(sizeBefore);
    });

    it('should add the after parameter set to the passed in value', () => {
      const getGifsSpy = subscribeSpyTo(
        service.getGifs(testSubredditFormControl)
      );

      const mockReq = httpMock.expectOne(api);
      mockReq.flush(testResponse);

      const testAfter = 'test';

      service.nextPage({} as any, testAfter);

      const mockReqTwo = httpMock.expectOne(api + `&after=${testAfter}`);
      mockReqTwo.flush(testResponse);
    });

    it('should call complete method on infinite scroll target if supplied once data has loaded', () => {
      const testAfter = 'test';
      const fakeInfiniteEvent = {
        target: {
          complete: jest.fn(),
        },
      } as any;

      const getGifsSpy = subscribeSpyTo(
        service.getGifs(testSubredditFormControl)
      );

      const mockReq = httpMock.expectOne(() => true);
      mockReq.flush(testResponse);

      service.nextPage(fakeInfiniteEvent, testAfter);

      const mockReqTwo = httpMock.expectOne(() => true);
      mockReqTwo.flush(testResponse);

      expect(fakeInfiniteEvent.target.complete).toHaveBeenCalled();
    });

    it('should filter out any gifs that do not have a useable src property', () => {
      const getGifsSpy = subscribeSpyTo(
        service.getGifs(testSubredditFormControl)
      );

      testResponse.data.children[0].data.secure_media = null as any;
      testResponse.data.children[0].data.media.reddit_video = null as any;
      testResponse.data.children[0].data.preview = null as any;

      const lengthWithNoPostFiltered = testResponse.data.children.length;

      const mockReq = httpMock.expectOne(api);
      mockReq.flush(testResponse);

      const result = getGifsSpy.getLastValue();

      expect(result?.length).toBeLessThan(lengthWithNoPostFiltered);
    });

    it('should leave src unchanged if already in mp4 format', () => {
      const getGifsSpy = subscribeSpyTo(
        service.getGifs(testSubredditFormControl)
      );

      testResponse.data.children[0].data.url = 'https://test.com/test.mp4';

      const mockReq = httpMock.expectOne(api);
      mockReq.flush(testResponse);

      const result = getGifsSpy.getLastValue();

      expect(
        result?.find((gif) => gif.src === 'https://test.com/test.mp4')
      ).toBeTruthy();
    });

    it('should convert src to mp4 format if the post is in .gifv format', () => {
      const getGifsSpy = subscribeSpyTo(
        service.getGifs(testSubredditFormControl)
      );

      testResponse.data.children[0].data.url = 'https://test.com/test.gifv';

      const mockReq = httpMock.expectOne(api);
      mockReq.flush(testResponse);

      const result = getGifsSpy.getLastValue();

      expect(
        result?.find((gif) => gif.src === 'https://test.com/test.mp4')
      ).toBeTruthy();
    });

    it('should convert src to mp4 format if the post is in .webm format', () => {
      const getGifsSpy = subscribeSpyTo(
        service.getGifs(testSubredditFormControl)
      );

      testResponse.data.children[0].data.url = 'https://test.com/test.webm';

      const mockReq = httpMock.expectOne(api);
      mockReq.flush(testResponse);

      const result = getGifsSpy.getLastValue();

      expect(
        result?.find((gif) => gif.src === 'https://test.com/test.mp4')
      ).toBeTruthy();
    });

    it('should convert src to secure media if available, if gifv or webm not available', () => {
      const getGifsSpy = subscribeSpyTo(
        service.getGifs(testSubredditFormControl)
      );

      testResponse.data.children[0].data.secure_media.reddit_video.fallback_url =
        'test';

      const mockReq = httpMock.expectOne(api);
      mockReq.flush(testResponse);

      const result = getGifsSpy.getLastValue();

      expect(result?.find((gif) => gif.src === 'test')).toBeTruthy();
    });

    it('should convert src to media if available and none of the above available', () => {
      const getGifsSpy = subscribeSpyTo(
        service.getGifs(testSubredditFormControl)
      );
      testResponse.data.children[0].data.secure_media = null as any;
      testResponse.data.children[0].data.media.reddit_video.fallback_url =
        'test';

      const mockReq = httpMock.expectOne(api);
      mockReq.flush(testResponse);

      const result = getGifsSpy.getLastValue();

      expect(result?.find((gif) => gif.src === 'test')).toBeTruthy();
    });

    it('should convert src to fallback url of preview if no media objects are available', () => {
      const getGifsSpy = subscribeSpyTo(
        service.getGifs(testSubredditFormControl)
      );
      testResponse.data.children[0].data.secure_media = null as any;
      testResponse.data.children[0].data.media.reddit_video = null as any;
      testResponse.data.children[0].data.preview.reddit_video_preview = {
        fallback_url: 'test',
      } as any;

      const mockReq = httpMock.expectOne(api);
      mockReq.flush(testResponse);

      const result = getGifsSpy.getLastValue();

      expect(result?.find((gif) => gif.src === 'test')).toBeTruthy();
    });
  });
});
