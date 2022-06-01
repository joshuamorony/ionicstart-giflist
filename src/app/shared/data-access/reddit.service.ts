import { Injectable } from '@angular/core';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RedditService {
  constructor() {}

  getGifs() {
    return of([]);
  }
}
