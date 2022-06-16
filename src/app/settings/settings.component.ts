import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { PopoverController } from '@ionic/angular';
import { SettingsService } from '../shared/data-access/settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  settingsForm = this.fb.group({
    sort: this.fb.control(''),
    perPage: this.fb.control(10),
  });

  constructor(
    private fb: FormBuilder,
    public settingsService: SettingsService,
    public popoverCtrl: PopoverController
  ) {}
}
