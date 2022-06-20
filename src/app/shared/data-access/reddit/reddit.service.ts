import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, combineLatest, concat, EMPTY, of } from 'rxjs';
import {
  catchError,
  concatMap,
  debounceTime,
  distinctUntilChanged,
  expand,
  map,
  scan,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators';
import { RedditPagination, RedditPost, RedditResponse } from '../../interfaces';
import { SettingsService } from '../settings/settings.service';

@Injectable({
  providedIn: 'root',
})
export class RedditService {
  isLoading$ = new BehaviorSubject(false);

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
    // Start with a default emission of 'gifs', then only emit when
    // subreddit changes
    const subreddit$ = subredditFormControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      startWith(subredditFormControl.value),
      // Reset pagination values
      tap(() =>
        this.pagination$.next({
          after: null,
          totalFound: 0,
          retries: 0,
          infiniteScroll: null,
        })
      )
    );

    return combineLatest([subreddit$, this.settings$]).pipe(
      switchMap(([subreddit, settings]) => {
        // Fetch Gifs
        const gifsForCurrentPage$ = this.pagination$.pipe(
          tap(() => this.isLoading$.next(true)),
          concatMap((pagination) =>
            this.fetchFromReddit(
              subreddit,
              settings.sort,
              pagination.after,
              settings.perPage
            ).pipe(
              // Keep retrying until we have enough valid gifs to fill a page
              // 'expand' will keep repeating itself as long as it returns
              // a non-empty observable
              expand((res, index) => {
                const validGifs = res.gifs.filter((gif) => gif.src !== null);
                const gifsRequired = res.gifsRequired - validGifs.length;
                const maxAttempts = 10;

                // Keep trying if all criteria is met
                // - we need more gifs to fill the page
                // - we got at least one gif back from the API
                // - we haven't exceeded the max retries
                const shouldKeepTrying =
                  gifsRequired > 0 && res.gifs.length && index < maxAttempts;

                if (!shouldKeepTrying) {
                  pagination.infiniteScroll?.complete();
                  this.isLoading$.next(false);
                }

                return shouldKeepTrying
                  ? this.fetchFromReddit(
                      subreddit,
                      settings.sort,
                      res.gifs[res.gifs.length - 1].name,
                      gifsRequired
                    )
                  : EMPTY; // Return an empty observable to stop retrying
              })
            )
          ),
          // Filter out any gifs without a src, and don't return more than the amount required
          // NOTE: Even though expand will keep repeating, each result of expand will be passed
          // here immediately without waiting for all expand calls to complete
          map((res) =>
            res.gifs
              .filter((gif) => gif.src !== null)
              .slice(0, res.gifsRequired)
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
    this.pagination$.next({
      after,
      totalFound: 0,
      retries: 0,
      infiniteScroll:
        infiniteScrollEvent?.target as HTMLIonInfiniteScrollElement,
    });
  }

  private fetchFromReddit(
    subreddit: string,
    sort: string,
    after: string | null,
    gifsRequired: number
  ) {
    return this.http
      .get<RedditResponse>(
        `https://www.reddit.com/r/${subreddit}/${sort}/.json?limit=100` +
          (after ? `&after=${after}` : '')
      )
      .pipe(
        // If there is an error, just return an empty observable
        // This prevents the stream from breaking
        catchError(() => EMPTY),

        // Convert response into the gif format we need
        // AND keep track of how many gifs we want from the API
        map((res) => ({
          gifs: this.convertRedditPostsToGifs(res.data.children),
          gifsRequired,
        }))
      );
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
