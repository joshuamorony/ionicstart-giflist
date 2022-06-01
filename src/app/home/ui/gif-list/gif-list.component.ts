import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-gif-list',
  templateUrl: './gif-list.component.html',
  styleUrls: ['./gif-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GifListComponent {}
