import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Gif } from '../interfaces/gif';
import { RedditPost } from '../interfaces/reddit-post';
import { RedditResponse } from '../interfaces/reddit-response';

@Injectable({
  providedIn: 'root',
})
export class RedditService {
  private gifs$ = new BehaviorSubject<Gif[]>([]);
  private api = `https://www.reddit.com/r/gifs/hot/.json?limit=100`;

  constructor(private http: HttpClient) {}

  getGifs() {
    return this.gifs$.asObservable();
  }

  loadGifs() {
    this.http
      .get<RedditResponse>(this.api)
      .pipe(map((res) => this.convertRedditPostsToGifs(res.data.children)))
      .subscribe((gifs) => {
        this.gifs$.next([...this.gifs$.value, ...gifs]);
      });
  }

  private fetchData() {
    //this.http.get(this.api).subscribe();
    // make request
    // map(convertRedditPostToGif)
    // filter(unuseable)
    // map
    // .subscribe
    // next
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
    if (post.data.url.indexOf('.gifv') > -1) {
      return post.data.url.replace('.gifv', '.mp4');
    }

    return false;
    // if gifv or webm, return mp4
    // if not, check return media or secure media if it is available
    // if not, check if a preview is available
    // otherwise return false
  }
}
