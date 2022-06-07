import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SettingsComponent } from './settings.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, IonicModule],
  declarations: [SettingsComponent],
  exports: [SettingsComponent],
})
export class SettingsComponentModule {}
