import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Gif } from '../../../shared/interfaces/gif';

@Component({
  selector: 'app-gif-list',
  templateUrl: './gif-list.component.html',
  styleUrls: ['./gif-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GifListComponent {
  @Input() gifs!: Gif[];
}
