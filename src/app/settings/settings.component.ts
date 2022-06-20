import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { PopoverController } from '@ionic/angular';
import { SettingsService } from '../shared/data-access/settings/settings.service';

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SettingsFormComponentModule } from './ui/settings-form/settings-form.component';

@Component({
  selector: 'app-settings',
  template: `
    <ion-header>
      <ion-toolbar color="light">
        <ion-buttons slot="end">
          <ion-button
            (click)="popoverCtrl.dismiss()"
            data-test="modal-close-button"
          >
            <ion-icon slot="icon-only" name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <app-settings-form
        [settingsForm]="settingsForm"
        (save)="settingsService.save(settingsForm.value); popoverCtrl.dismiss()"
      ></app-settings-form>
    </ion-content>
  `,
  styles: [
    `
      :host {
        height: 100%;
      }

      ion-segment {
        --ion-background-color: #fff;
      }
    `,
  ],
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

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    SettingsFormComponentModule,
  ],
  declarations: [SettingsComponent],
  exports: [SettingsComponent],
})
export class SettingsComponentModule {}
