import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { GifListComponentModule } from './ui/gif-list/gif-list.module';
import { SearchBarComponentModule } from './ui/search-bar/search-bar.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    GifListComponentModule,
    SearchBarComponentModule,
  ],
  declarations: [HomePage],
})
export class HomePageModule {}
