import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, NgModule } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { SettingsComponentModule } from '../settings/settings.module';
import { RedditService } from '../shared/data-access/reddit.service';
import { SettingsService } from '../shared/data-access/settings.service';
import { Gif } from '../shared/interfaces';
import { GifListComponentModule } from './ui/gif-list/gif-list.component';
import { SearchBarComponentModule } from './ui/search-bar/search-bar.component';

@Component({
  selector: 'app-home',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <app-search-bar
          [subredditFormControl]="subredditFormControl"
        ></app-search-bar>
        <ion-buttons slot="end">
          <ion-button
            id="settings-button"
            data-test="settings-button"
            (click)="settingsModalIsOpen$.next(true)"
          >
            <ion-icon slot="icon-only" name="settings"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-progress-bar
        data-test="loading-bar"
        color="dark"
        *ngIf="redditService.isLoading$ | async"
        type="indeterminate"
        reversed="true"
      ></ion-progress-bar>
    </ion-header>

    <ion-content>
      <ng-container
        *ngIf="{ gifs: gifs$ | async, settings: settings$ | async } as vm"
      >
        <app-gif-list
          [gifs]="vm.gifs"
          (gifLoadStart)="setLoading($event)"
          (gifLoadComplete)="setLoadingComplete($event)"
        ></app-gif-list>

        <ion-infinite-scroll
          *ngIf="
            vm.gifs && vm.settings && vm.gifs.length >= vm.settings.perPage
          "
          threshold="100px"
          (ionInfinite)="loadMore($event, vm.gifs)"
        >
          <ion-infinite-scroll-content
            loadingSpinner="bubbles"
            loadingText="Fetching gifs..."
          >
          </ion-infinite-scroll-content>
        </ion-infinite-scroll>
      </ng-container>
    </ion-content>

    <ion-popover
      trigger="settings-button"
      [isOpen]="settingsModalIsOpen$ | async"
      (ionPopoverDidDismiss)="settingsModalIsOpen$.next(false)"
    >
      <ng-template>
        <app-settings></app-settings>
      </ng-template>
    </ion-popover>
  `,
  styles: [
    `
      ion-infinite-scroll-content {
        margin-top: 20px;
      }

      ion-buttons {
        margin: auto 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  currentlyLoadingGifs$ = new BehaviorSubject<string[]>([]);
  loadedGifs$ = new BehaviorSubject<string[]>([]);
  settingsModalIsOpen$ = new BehaviorSubject<boolean>(false);
  subredditFormControl = new FormControl('gifs');
  settings$ = this.settingsService.getSettings();

  // Combine the stream of gifs with the streams determining their loading status
  gifs$ = combineLatest([
    this.redditService.getGifs(this.subredditFormControl),
    this.currentlyLoadingGifs$,
    this.loadedGifs$,
  ]).pipe(
    map(([gifs, currentlyLoadingGifs, loadedGifs]) =>
      gifs.map((gif) => ({
        ...gif,
        loading: currentlyLoadingGifs.includes(gif.permalink),
        dataLoaded: loadedGifs.includes(gif.permalink),
      }))
    )
  );

  constructor(
    public redditService: RedditService,
    private settingsService: SettingsService
  ) {}

  setLoading(permalink: string) {
    // Add the gifs permalink to the loading array
    this.currentlyLoadingGifs$.next([
      ...this.currentlyLoadingGifs$.value,
      permalink,
    ]);
  }

  setLoadingComplete(permalinkToComplete: string) {
    this.loadedGifs$.next([...this.loadedGifs$.value, permalinkToComplete]);

    this.currentlyLoadingGifs$.next([
      ...this.currentlyLoadingGifs$.value.filter(
        (permalink) => !this.loadedGifs$.value.includes(permalink)
      ),
    ]);
  }

  loadMore(ev: Event, currentGifs: Gif[]) {
    this.redditService.nextPage(ev, currentGifs[currentGifs.length - 1].name);
  }
}

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    GifListComponentModule,
    SearchBarComponentModule,
    SettingsComponentModule,
    RouterModule.forChild([{ path: '', component: HomeComponent }]),
  ],
  declarations: [HomeComponent],
})
export class HomeComponentModule {}
