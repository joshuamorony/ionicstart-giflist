import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RedditService } from '../shared/data-access/reddit.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  gifs$ = this.redditService.getGifs();

  constructor(private redditService: RedditService) {}
}
