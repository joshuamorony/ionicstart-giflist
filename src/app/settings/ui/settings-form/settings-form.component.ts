import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { FormGroup } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-settings-form',
  template: `
    <form [formGroup]="settingsForm" (ngSubmit)="save.emit(true)">
      <ion-segment color="primary" data-test="sort" formControlName="sort">
        <ion-segment-button value="hot"> Hot </ion-segment-button>
        <ion-segment-button value="new"> New </ion-segment-button>
      </ion-segment>

      <ion-segment
        color="primary"
        data-test="perPage"
        formControlName="perPage"
      >
        <ion-segment-button value="10"> 10 </ion-segment-button>
        <ion-segment-button value="20"> 20 </ion-segment-button>
        <ion-segment-button value="30"> 30 </ion-segment-button>
      </ion-segment>

      <ion-button type="submit" data-test="settings-save-button" expand="full">
        Save
      </ion-button>
    </form>
  `,
  styles: [
    `
      form > * {
        margin-bottom: 1rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsFormComponent {
  @Input() settingsForm!: FormGroup;
  @Output() save = new EventEmitter<boolean>();
}

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, IonicModule],
  declarations: [SettingsFormComponent],
  exports: [SettingsFormComponent],
})
export class SettingsFormComponentModule {}
