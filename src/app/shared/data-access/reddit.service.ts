import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map, pairwise, startWith, switchMap, tap } from 'rxjs/operators';
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
    infiniteScroll: null,
  });

  constructor(
    private http: HttpClient,
    private settingsService: SettingsService
  ) {}

  getGifs() {
    return combineLatest([this.settings$, this.pagination$]).pipe(
      // Get previous emission to see if subreddit has changed
      startWith(null),
      pairwise(),
      tap(([previous, current]) => {
        if (!previous || !current) {
          return;
        }

        const [previousSettings] = previous;
        const [currentSettings] = current;

        if (previousSettings.subreddit !== currentSettings.subreddit) {
          // Subreddit has changed, reset cached gifs
          this.gifs$.next([]);
        }
      }),
      // We no longer need previous value, so just switch back to the latest value
      map(([_, current]) => current as [Settings, RedditPagination]),
      switchMap(([settings, pagination]) =>
        // Fetch next batch of gifs with current settings/pagination data
        this.http
          .get<RedditResponse>(
            `https://www.reddit.com/r/${settings.subreddit}/${settings.sort}/.json?limit=100` +
              (pagination.after ? `&after=${pagination.after}` : '')
          )
          .pipe(
            map((res) => this.convertRedditPostsToGifs(res.data.children)),
            map((gifs) => gifs.filter((gif) => gif.src !== null)),
            // Add new gifs to cached gifs
            tap((gifs) => {
              this.gifs$.next([...this.gifs$.value, ...gifs]);
              pagination.infiniteScroll?.complete();
            }),
            // Return cached gifs
            switchMap(() => this.gifs$)
          )
      )
    );
  }

  nextPage(infiniteScrollEvent?: Event) {
    this.pagination$.next({
      after: this.gifs$.value[this.gifs$.value.length - 1]?.name,
      infiniteScroll:
        infiniteScrollEvent?.target as HTMLIonInfiniteScrollElement,
    });
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
