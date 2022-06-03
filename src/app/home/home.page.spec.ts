import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { RedditService } from '../shared/data-access/reddit.service';

import { HomePage } from './home.page';
import { MockGifListComponent } from './ui/gif-list/gif-list.component.spec';

jest.mock('../shared/data-access/reddit.service');

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [HomePage, MockGifListComponent],
      imports: [IonicModule.forRoot()],
      providers: [RedditService],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should trigger loadGifs method in ngOnInit', () => {
    const redditService = fixture.debugElement.injector.get(RedditService);

    expect(redditService.loadGifs).toHaveBeenCalled();
  });

  // handle setting loading and dataloaded
});
