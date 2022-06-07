import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Gif,
  RedditPagination,
  RedditPost,
  RedditResponse,
  Settings,
} from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class RedditService {
  private gifs$ = new BehaviorSubject<Gif[]>([]);
  private paginationState: RedditPagination = {
    after: null,
  };
  private settings: Settings = {
    subreddit: 'gifs',
    perPage: 10,
    sort: 'hot',
  };

  constructor(private http: HttpClient) {}

  getGifs() {
    return this.gifs$.asObservable();
  }

  loadGifs(infiniteScrollEvent?: Event) {
    const api = `https://www.reddit.com/r/${this.settings.subreddit}/hot/.json?limit=100`;

    this.http
      .get<RedditResponse>(
        this.paginationState.after
          ? api + `&after=${this.paginationState.after}`
          : api
      )
      .pipe(
        map((res) => this.convertRedditPostsToGifs(res.data.children)),
        map((gifs) => gifs.filter((gif) => gif.src !== null))
      )
      .subscribe((gifs) => {
        this.gifs$.next([...this.gifs$.value, ...gifs]);

        this.paginationState = {
          after: gifs[gifs.length - 1].name,
        };

        if (infiniteScrollEvent) {
          const infiniteElement =
            infiniteScrollEvent.target as HTMLIonInfiniteScrollElement;
          infiniteElement.complete();
        }
      });
  }

  reset(subreddit: string) {
    this.settings = {
      ...this.settings,
      subreddit,
    };

    this.paginationState = {
      ...this.paginationState,
      after: null,
    };

    this.gifs$.next([]);

    this.loadGifs();
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
