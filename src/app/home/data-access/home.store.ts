import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ComponentStore } from '@ngrx/component-store';
import { RedditService } from '../../shared/data-access/reddit/reddit.service';

interface HomeState {
  currentlyLoadingGifs: string[];
  loadedGifs: string[];
  settingsModalIsOpen: boolean;
}

@Injectable()
export class HomeStore extends ComponentStore<HomeState> {
  subredditFormControl = new FormControl('gifs');

  currentlyLoadingGifs$ = this.select((state) => state.currentlyLoadingGifs);
  loadedGifs$ = this.select((state) => state.loadedGifs);
  settingsModalIsOpen$ = this.select((state) => state.settingsModalIsOpen);

  gifs$ = this.select(
    this.redditService.getGifs(this.subredditFormControl),
    this.currentlyLoadingGifs$,
    this.loadedGifs$,
    (gifs, currentlyLoadingGifs, loadedGifs) =>
      gifs.map((gif) => ({
        ...gif,
        loading: currentlyLoadingGifs.includes(gif.permalink),
        dataLoaded: loadedGifs.includes(gif.permalink),
      }))
  );

  setLoading = this.updater((state, permalink: string) => ({
    ...state,
    currentlyLoadingGifs: [...state.currentlyLoadingGifs, permalink],
  }));

  setLoadingComplete = this.updater((state, permalinkToComplete: string) => ({
    ...state,
    loadedGifs: [...state.loadedGifs, permalinkToComplete],
    currentlyLoadingGifs: [
      ...state.currentlyLoadingGifs.filter(
        (permalink) => permalink !== permalinkToComplete
      ),
    ],
  }));

  constructor(private redditService: RedditService) {
    super({
      currentlyLoadingGifs: [],
      loadedGifs: [],
      settingsModalIsOpen: false,
    });
  }

  setModalIsOpen(value: boolean) {
    this.patchState({
      settingsModalIsOpen: value,
    });
  }
}
