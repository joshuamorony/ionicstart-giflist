import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-search-bar',
  template: `
    <ion-searchbar
      [formControl]="subredditFormControl"
      data-test="subreddit-bar"
      animated
      placeholder="subreddit..."
      value=""
    ></ion-searchbar>
  `,
  styles: [
    `
      ion-searchbar {
        padding: 0 5px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchBarComponent {
  @Input() subredditFormControl!: FormControl;
}

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, IonicModule],
  declarations: [SearchBarComponent],
  exports: [SearchBarComponent],
})
export class SearchBarComponentModule {}
