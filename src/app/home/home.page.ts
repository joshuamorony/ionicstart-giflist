import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { RedditService } from '../shared/data-access/reddit.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage implements OnInit {
  gifs$ = this.redditService.getGifs();

  constructor(private redditService: RedditService) {}

  ngOnInit() {
    this.redditService.loadGifs();
  }
}
