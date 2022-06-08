import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { SettingsService } from './shared/data-access/settings.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  constructor(private settingsService: SettingsService) {}

  async ngOnInit() {
    await this.settingsService.init();
  }
}
