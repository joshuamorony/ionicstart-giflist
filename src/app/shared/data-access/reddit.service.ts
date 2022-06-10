import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  BehaviorSubject,
  combineLatest,
  concat,
  EMPTY,
  Observable,
  of,
} from 'rxjs';
import {
  catchError,
  concatMap,
  debounceTime,
  distinctUntilChanged,
  map,
  mergeMap,
  pairwise,
  scan,
  startWith,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';
import {
  Gif,
  RedditPagination,
  RedditPost,
  RedditResponse,
  Settings,
} from '../interfaces';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root',
})
export class RedditService {
  private gifs$ = new BehaviorSubject<Gif[]>([]);

  private settings$ = this.settingsService.getSettings();
  private pagination$ = new BehaviorSubject<RedditPagination>({
    after: null,
    totalFound: 0,
    retries: 0,
    infiniteScroll: null,
  });

  constructor(
    private http: HttpClient,
    private settingsService: SettingsService
  ) {}

  getGifs(subredditFormControl: FormControl) {
    // Only emit when settings change
    const settings$ = this.settings$.pipe(distinctUntilChanged());

    // Start with a default emission of 'gifs', then only emit when
    // subreddit changes
    const subreddit$ = concat(
      of('gifs').pipe(take(1)),
      subredditFormControl.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        // Reset pagination values
        tap(() =>
          this.pagination$.next({
            after: null,
            totalFound: 0,
            retries: 0,
            infiniteScroll: null,
          })
        )
      )
    );

    return combineLatest([subreddit$, settings$]).pipe(
      switchMap(([subreddit, settings]) => {
        // Fetch Gifs
        const gifsForCurrentPage$ = this.pagination$.pipe(
          concatMap((pagination) =>
            this.http
              .get<RedditResponse>(
                `https://www.reddit.com/r/${subreddit}/${settings.sort}/.json?limit=100` +
                  (pagination.after ? `&after=${pagination.after}` : '')
              )
              .pipe(
                // If there is an error, just return an empty observable
                // This prevents the stream from breaking
                catchError(() => EMPTY),
                // Convert result into the format we need
                map((res) => this.convertRedditPostsToGifs(res.data.children)),
                // Filter out any gifs where an appropriate src could not be found
                map((gifs) => {
                  const validGifs = gifs.filter((gif) => gif.src !== null);

                  const notEnoughGifsToFillPage =
                    pagination.totalFound + validGifs.length < settings.perPage;

                  if (
                    notEnoughGifsToFillPage &&
                    pagination.retries < 10 &&
                    gifs.length
                  ) {
                    this.pagination$.next({
                      ...pagination,
                      after: gifs[gifs.length - 1].name,
                      totalFound: pagination.totalFound + validGifs.length,
                      retries: pagination.retries + 1,
                    });
                  } else {
                    pagination.infiniteScroll?.complete();
                  }

                  return validGifs.slice(
                    0,
                    settings.perPage - pagination.totalFound
                  );
                })
              )
          )
        );

        // Every time we get a new batch of gifs, add it to the cached gifs
        const allGifs$ = gifsForCurrentPage$.pipe(
          scan((previousGifs, currentGifs) => [...previousGifs, ...currentGifs])
        );

        return allGifs$;
      })
    );
  }

  nextPage(infiniteScrollEvent: Event, after: string) {
    console.log(after);

    this.pagination$.next({
      after,
      totalFound: 0,
      retries: 0,
      infiniteScroll:
        infiniteScrollEvent?.target as HTMLIonInfiniteScrollElement,
    });
  }

  private keepFetchingIfNotEnoughGifs(
    gifs: Gif[],
    settings: Settings,
    pagination: RedditPagination
  ) {
    const validGifs = gifs.filter((gif) => gif.src !== null);
    const isEnoughGifsToFillCurrentPage =
      validGifs.length + pagination.totalFound >= settings.perPage;

    if (isEnoughGifsToFillCurrentPage) {
      // All good, complete
      console.log('found enough gifs');
      pagination.infiniteScroll?.complete();
    } else {
      // If no gifs were returned in the previous attempt, then there is no
      // point in continuing. Also give up after 10 attempts.
      const shouldGiveUp = validGifs.length === 0 || pagination.retries > 10;

      if (shouldGiveUp) {
        pagination.infiniteScroll?.complete();
        console.log('giving up');
      } else {
        // If there was at least one result, we can keep recursively fetching more
        // gifs to try and fill a page
        this.pagination$.next({
          ...pagination,
          retries: pagination.retries + 1,
          after: gifs[gifs.length - 1].name,
          totalFound: pagination.totalFound + validGifs.length,
        });
        console.log(gifs);
        console.log(this.pagination$.value);
        console.log('try again');
      }
    }
  }

  private getValidGifs(gifs: Gif[]) {
    return gifs.filter((gif) => gif.src !== null);
  }

  private convertRedditPostsToGifs(posts: RedditPost[]) {
    return posts.map((post) => ({
      src: this.getBestSrcForGif(post),
      author: post.data.author,
      name: post.data.name,
      permalink: post.data.permalink,
      title: post.data.title,
      thumbnail: post.data.thumbnail,
      comments: post.data.num_comments,
      loading: false,
    }));
  }

  private getBestSrcForGif(post: RedditPost) {
    // If the source is in .mp4 format, leave unchanged
    if (post.data.url.indexOf('.mp4') > -1) {
      return post.data.url;
    }

    // If the source is in .gifv or .webm formats, convert to .mp4 and return
    if (post.data.url.indexOf('.gifv') > -1) {
      return post.data.url.replace('.gifv', '.mp4');
    }

    if (post.data.url.indexOf('.webm') > -1) {
      return post.data.url.replace('.webm', '.mp4');
    }

    // If the URL is not .gifv or .webm, check if media or secure media is available
    if (post.data.secure_media?.reddit_video) {
      return post.data.secure_media.reddit_video.fallback_url;
    }

    if (post.data.media?.reddit_video) {
      return post.data.media.reddit_video.fallback_url;
    }

    // If media objects are not available, check if a preview is available
    if (post.data.preview?.reddit_video_preview) {
      return post.data.preview.reddit_video_preview.fallback_url;
    }

    // No useable formats available
    return null;
  }
}
