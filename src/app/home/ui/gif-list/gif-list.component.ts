import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { Browser } from '@capacitor/browser';
import { Gif } from '../../../shared/interfaces/gif';

@Component({
  selector: 'app-gif-list',
  templateUrl: './gif-list.component.html',
  styleUrls: ['./gif-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GifListComponent {
  @Input() gifs!: Gif[] | null;
  @Output() gifLoadStart = new EventEmitter<string>();
  @Output() gifLoadComplete = new EventEmitter<string>();

  playVideo(ev: Event, gif: Gif) {
    const video = ev.target as HTMLVideoElement;

    if (video.readyState === 4) {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    } else {
      if (video.getAttribute('data-event-loaddeddata') !== 'true') {
        this.gifLoadStart.emit(gif.permalink);
        video.load();

        const handleVideoLoaded = async () => {
          await video.play();
          this.gifLoadComplete.emit(gif.permalink);
          video.removeEventListener('loadeddata', handleVideoLoaded);
        };

        video.addEventListener('loadeddata', handleVideoLoaded);
        video.setAttribute('data-event-loadeddata', 'true');
      }
    }
  }

  showComments(gif: Gif) {
    Browser.open({
      toolbarColor: '#fff',
      url: `https://reddit.com/${gif.permalink}`,
      windowName: '_system',
    });
  }

  trackByFn(index: number, gif: Gif) {
    return gif.permalink;
  }
}
