import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject } from 'rxjs';
import { Settings } from '../../interfaces';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private settings$ = new BehaviorSubject<Settings>({
    sort: 'hot',
    perPage: 10,
  });

  private storage: Storage | null = null;

  constructor(private ionicStorage: Storage) {}

  async init() {
    this.storage = await this.ionicStorage.create();

    const settings = await this.storage?.get('settings');
    if (settings) {
      this.settings$.next(settings);
    }
  }

  getSettings() {
    return this.settings$.asObservable();
  }

  save(settings: Settings) {
    this.settings$.next(settings);
    this.storage?.set('settings', settings);
  }
}
