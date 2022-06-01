import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GifListComponent } from './gif-list.component';

@NgModule({
  imports: [ CommonModule, FormsModule, IonicModule,],
  declarations: [GifListComponent],
  exports: [GifListComponent]
})
export class GifListComponentModule {}
