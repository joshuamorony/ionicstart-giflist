import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SearchBarComponent } from './search-bar.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, IonicModule],
  declarations: [SearchBarComponent],
  exports: [SearchBarComponent],
})
export class SearchBarComponentModule {}
