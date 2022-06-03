import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { RedditService } from '../shared/data-access/reddit.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage implements OnInit {
  currentlyLoadingGifs$ = new BehaviorSubject<string[]>([]);
  gifs$ = combineLatest([
    this.redditService.getGifs(),
    this.currentlyLoadingGifs$,
  ]).pipe(
    // If the gifs permalink is in the currentlyLoading array, set loading to true
    map(([gifs, currentlyLoadingGifs]) =>
      gifs.map((gif) =>
        currentlyLoadingGifs.includes(gif.permalink)
          ? { ...gif, loading: true }
          : gif
      )
    )
  );

  constructor(private redditService: RedditService) {}

  ngOnInit() {
    this.redditService.loadGifs();
  }

  setLoading(permalink: string) {
    // Add the gifs permalink to the loading array
    this.currentlyLoadingGifs$.next([
      ...this.currentlyLoadingGifs$.value,
      permalink,
    ]);
  }

  removeLoading(permalinkToRemove: string) {
    this.currentlyLoadingGifs$.next([
      ...this.currentlyLoadingGifs$.value.filter(
        (permalink) => permalink !== permalinkToRemove
      ),
    ]);
  }
}
