import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { subscribeSpyTo } from '@hirez_io/observer-spy';
import { IonicModule } from '@ionic/angular';
import { of } from 'rxjs';
import { RedditService } from '../shared/data-access/reddit.service';

import { HomePage } from './home.page';
import { MockGifListComponent } from './ui/gif-list/gif-list.component.spec';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  const testGifs = [
    {
      permalink: 'test',
      loading: false,
      dataLoaded: false,
    },
  ];

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [HomePage, MockGifListComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        {
          provide: RedditService,
          useValue: {
            getGifs: jest.fn().mockReturnValue(of(testGifs)),
            loadGifs: jest.fn(),
          },
        },
      ],
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

  it('should change loading state of gif when start event emits from gif-list', () => {
    const observerSpy = subscribeSpyTo<any>(component.gifs$);

    const gifList = fixture.debugElement.query(By.css('app-gif-list'));
    gifList.triggerEventHandler('gifLoadStart', testGifs[0].permalink);
    fixture.detectChanges();

    const gif = observerSpy.getLastValue()[0];

    expect(gif.loading).toBe(true);
  });

  it('should change loading state of gif when complete event emits from gif-list', () => {
    const observerSpy = subscribeSpyTo<any>(component.gifs$);

    const gifList = fixture.debugElement.query(By.css('app-gif-list'));
    gifList.triggerEventHandler('gifLoadStart', testGifs[0].permalink);
    fixture.detectChanges();
    gifList.triggerEventHandler('gifLoadComplete', testGifs[0].permalink);
    fixture.detectChanges();

    const gif = observerSpy.getLastValue()[0];

    expect(gif.loading).toBe(false);
  });

  // handle setting loading and dataloaded
});
