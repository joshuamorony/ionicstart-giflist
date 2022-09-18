import {
  ChangeDetectionStrategy,
  Component,
  NgModule,
  OnInit,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { SettingsService } from './shared/data-access/settings/settings.service';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { HttpClientModule } from '@angular/common/http';

import { PreloadAllModules, RouterModule } from '@angular/router';

import { Drivers } from '@ionic/storage';
import { IonicStorageModule } from '@ionic/storage-angular';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';

@Component({
  selector: 'app-root',
  template: `
    <ion-app>
      <ion-router-outlet></ion-router-outlet>
    </ion-app>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  constructor(private settingsService: SettingsService) {}

  ngOnInit() {
    this.settingsService.init();
  }
}

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    HttpClientModule,
    IonicStorageModule.forRoot({
      driverOrder: [
        // eslint-disable-next-line no-underscore-dangle
        CordovaSQLiteDriver._driver,
        Drivers.IndexedDB,
        Drivers.LocalStorage,
      ],
    }),
    RouterModule.forRoot(
      [
        {
          path: 'home',
          loadChildren: () =>
            import('./home/home.component').then((m) => m.HomeComponentModule),
        },
        {
          path: '',
          redirectTo: 'home',
          pathMatch: 'full',
        },
      ],
      { preloadingStrategy: PreloadAllModules }
    ),
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
