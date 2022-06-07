import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  settingsForm = this.fb.group({
    subreddit: this.fb.control(''),
    sort: this.fb.control(''),
  });

  constructor(private fb: FormBuilder) {}
}
