import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Gif } from '../interfaces/gif';
import { RedditPost } from '../interfaces/reddit-post';

@Injectable({
  providedIn: 'root',
})
export class RedditService {
  private gifs$ = new BehaviorSubject<Gif[]>([]);

  constructor() {}

  getGifs() {
    this.loadGifs();
    return this.gifs$.asObservable();
  }

  loadGifs() {
    const newData = this.fetchData();

    this.gifs$.next([...this.gifs$.value, ...newData]);
  }

  private fetchData() {
    const dummyData = [
      { title: 'hello', url: 'https://google.com', src: '' },
      { title: 'there', url: 'https://google.com', src: '' },
    ];

    // make request
    // map(convertRedditPostToGif)
    // filter(unuseable)
    // map
    // .subscribe
    // next

    return dummyData;
  }

  private convertRedditPostsToGifs(data: RedditPost[]) {
    // return empty array if response.data.children === 0
    // convert to Gif format, using best src for gif method
  }

  private getBestSrcForGif(post: RedditPost) {
    // if gifv or webm, return mp4
    // if not, check return media or secure media if it is available
    // if not, check if a preview is available
    // otherwise return false
  }
}
