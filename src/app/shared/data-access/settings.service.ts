import { Injectable } from '@angular/core';
import { Settings } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  constructor() {}

  save(settings: Settings) {}
}
