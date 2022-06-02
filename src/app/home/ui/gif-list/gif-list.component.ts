import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Gif } from '../../../shared/interfaces/gif';

@Component({
  selector: 'app-gif-list',
  templateUrl: './gif-list.component.html',
  styleUrls: ['./gif-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GifListComponent {
  @Input() gifs!: Gif[] | null;

  playVideo(ev: Event, gif: Gif) {
    const video = ev.target as HTMLVideoElement;

    if (video.readyState === 4) {
    } else {
      if (video.getAttribute('data-event-loaddeddata') !== 'true') {
        video.load();

        const handleVideoLoaded = () => {
          video.play();
          video.removeEventListener('loadeddata', handleVideoLoaded);
        };

        video.addEventListener('loadeddata', handleVideoLoaded);
        video.setAttribute('data-event-loadeddata', 'true');
      }
    }
  }
}
