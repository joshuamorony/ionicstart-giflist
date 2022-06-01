import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Gif } from '../interfaces/gif';

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

  fetchData() {
    const dummyData = [
      { title: 'hello', url: 'https://google.com', src: '' },
      { title: 'there', url: 'https://google.com', src: '' },
    ];

    return dummyData;
  }
}
