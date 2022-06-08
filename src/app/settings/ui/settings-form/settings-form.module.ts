import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SettingsFormComponent } from './settings-form.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, IonicModule],
  declarations: [SettingsFormComponent],
  exports: [SettingsFormComponent],
})
export class SettingsFormComponentModule {}
