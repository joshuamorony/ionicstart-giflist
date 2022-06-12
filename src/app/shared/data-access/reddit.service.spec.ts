/* eslint-disable @typescript-eslint/naming-convention */
import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  HttpClientTestingModule,
} from '@angular/common/http/testing';
import { SubscriberSpy, subscribeSpyTo } from '@hirez_io/observer-spy';
import { Gif } from '../interfaces/gif';
import { SettingsService } from './settings.service';
import { RedditPost } from '../interfaces/reddit-post';
import { RedditResponse } from '../interfaces/reddit-response';

import { RedditService } from './reddit.service';
import { BehaviorSubject, of } from 'rxjs';
import { Settings } from '../interfaces';
import { FormControl } from '@angular/forms';

describe('RedditService', () => {
  let service: RedditService;
  let httpMock: HttpTestingController;

  let getGifsSpy: SubscriberSpy<Gif[]>;
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
            getSettings: jest.fn().mockReturnValue(testSettings),
          },
        },
      ],
    });
    service = TestBed.inject(RedditService);
    httpMock = TestBed.inject(HttpTestingController);
    getGifsSpy = subscribeSpyTo(service.getGifs(testSubredditFormControl));

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

  describe('getGifs()', () => {
    it('should make a request to the sort order specified in settings', () => {
      const mockReq = httpMock.expectOne(api);
      mockReq.flush(testResponse);
    });

    it('should not emit more than the amount of items specified as perPage with each new emission', () => {
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

    it('should keep trying to find gifs if it does not get enough results to fill a page', () => {
      const testPerPage = 15;

      testSettings.next({
        ...testSettings.value,
        perPage: testPerPage,
      });

      const totalRequestsRequired = Math.ceil(
        testPerPage / testResponse.data.children.length
      );

      const mockRequests = httpMock.match(() => true);
      expect(mockRequests.length).toBe(totalRequestsRequired);

      mockRequests.forEach((request) => {
        request.flush(testResponse);
      });
    });

    it('should give up after 10 attempts', () => {});

    it('stream should continue to work after http error', () => {
      const mockReq = httpMock.expectOne(api);
      mockReq.flush('', { status: 0, statusText: 'Unknown Error' });

      service.nextPage({} as any, '');

      const mockReqTwo = httpMock.expectOne(api);
      mockReqTwo.flush(testResponse);

      expect(getGifsSpy.getLastValue()?.length).toBeGreaterThan(0);
    });

    it('should clear cached gif data if subreddit changes', () => {
      const lengthBefore = getGifsSpy.getLastValue()?.length;
      testSubredditFormControl.setValue('test2');
      const lengthAfter = getGifsSpy.getLastValue()?.length;
      expect(lengthAfter).toEqual(lengthBefore);
    });
  });

  describe('nextPage()', () => {
    it('should add additional data to getGifs() array every time it is called', () => {
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

      const mockReq = httpMock.expectOne(api);
      mockReq.flush(testResponse);

      service.nextPage(fakeInfiniteEvent, testAfter);

      const mockReqTwo = httpMock.expectOne(api + `&after=${testAfter}`);
      mockReqTwo.flush(testResponse);

      expect(fakeInfiniteEvent.target.complete).toHaveBeenCalled();
    });

    it('should filter out any gifs that do not have a useable src property', () => {
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
      testResponse.data.children[0].data.url = 'https://test.com/test.mp4';

      const mockReq = httpMock.expectOne(api);
      mockReq.flush(testResponse);

      const result = getGifsSpy.getLastValue();

      expect(
        result?.find((gif) => gif.src === 'https://test.com/test.mp4')
      ).toBeTruthy();
    });

    it('should convert src to mp4 format if the post is in .gifv format', () => {
      testResponse.data.children[0].data.url = 'https://test.com/test.gifv';

      const mockReq = httpMock.expectOne(api);
      mockReq.flush(testResponse);

      const result = getGifsSpy.getLastValue();

      expect(
        result?.find((gif) => gif.src === 'https://test.com/test.mp4')
      ).toBeTruthy();
    });

    it('should convert src to mp4 format if the post is in .webm format', () => {
      testResponse.data.children[0].data.url = 'https://test.com/test.webm';

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

      const mockReq = httpMock.expectOne(api);
      mockReq.flush(testResponse);

      const result = getGifsSpy.getLastValue();

      expect(result?.find((gif) => gif.src === 'test')).toBeTruthy();
    });

    it('should convert src to media if available and none of the above available', () => {
      testResponse.data.children[0].data.secure_media = null as any;
      testResponse.data.children[0].data.media.reddit_video.fallback_url =
        'test';

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

      const mockReq = httpMock.expectOne(api);
      mockReq.flush(testResponse);

      const result = getGifsSpy.getLastValue();

      expect(result?.find((gif) => gif.src === 'test')).toBeTruthy();
    });
  });
});
