import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { subscribeSpyTo } from '@hirez_io/observer-spy';
import { IonicModule } from '@ionic/angular';
import { BehaviorSubject, of } from 'rxjs';
import { MockSettingsComponent } from '../settings/settings.component.spec';
import { RedditService } from '../shared/data-access/reddit.service';
import { SettingsService } from '../shared/data-access/settings.service';

import { HomePage } from './home.page';
import { MockGifListComponent } from './ui/gif-list/gif-list.component.spec';
import { MockSearchBarComponent } from './ui/search-bar/search-bar.component.spec';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  const testGifs = [
    {
      permalink: 'test',
      loading: false,
      dataLoaded: false,
      name: 'hello',
    },
  ];

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        HomePage,
        MockGifListComponent,
        MockSearchBarComponent,
        MockSettingsComponent,
      ],
      imports: [IonicModule.forRoot()],
      providers: [
        {
          provide: RedditService,
          useValue: {
            getGifs: jest.fn().mockReturnValue(of(testGifs)),
            loadGifs: jest.fn(),
            reset: jest.fn(),
            nextPage: jest.fn(),
          },
        },
        {
          provide: SettingsService,
          useValue: {
            getSettings: jest.fn().mockReturnValue(
              of({
                perPage: 1,
              })
            ),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;

    component.subredditFormControl = {
      valueChanges: new BehaviorSubject(''),
    } as any;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
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

  it('should set gifs dataLoaded state to true once it has loaded', () => {
    const observerSpy = subscribeSpyTo<any>(component.gifs$);

    const gifList = fixture.debugElement.query(By.css('app-gif-list'));
    gifList.triggerEventHandler('gifLoadComplete', testGifs[0].permalink);
    fixture.detectChanges();

    const gif = observerSpy.getLastValue()[0];

    expect(gif.dataLoaded).toBe(true);
  });

  describe('settings modal', () => {
    it('should open the settings modal when the settings button is clicked', () => {
      const settingsButton = fixture.debugElement.query(
        By.css('[data-test="settings-button"]')
      );

      settingsButton.nativeElement.click();

      fixture.detectChanges();

      const settingsModal = fixture.debugElement.query(By.css('ion-modal'));
      expect(settingsModal.componentInstance.isOpen).toBe(true);
    });

    it('should close the settings modal when the modals ionModalDidDismiss emits', () => {
      const settingsButton = fixture.debugElement.query(
        By.css('[data-test="settings-button"]')
      );

      settingsButton.nativeElement.click();

      fixture.detectChanges();

      const settingsModal = fixture.debugElement.query(By.css('ion-modal'));
      expect(settingsModal.componentInstance.isOpen).toBe(true);

      settingsModal.triggerEventHandler('ionModalDidDismiss', true);

      fixture.detectChanges();

      const settingsModalAfter = fixture.debugElement.query(
        By.css('ion-modal')
      );

      expect(settingsModalAfter.componentInstance.isOpen).toBe(false);
    });
  });

  describe('infinite scroll', () => {
    it('should call the nextPage method in the reddit service when infinite scroll is triggered', () => {
      const redditService = fixture.debugElement.injector.get(RedditService);

      const infiniteElement = fixture.debugElement.query(
        By.css('ion-infinite-scroll')
      );

      const fakeInfiniteEvent = 'test';
      const lastGifName = testGifs[testGifs.length - 1].name;

      infiniteElement.triggerEventHandler('ionInfinite', fakeInfiniteEvent);

      expect(redditService.nextPage).toHaveBeenCalledWith(
        fakeInfiniteEvent,
        lastGifName
      );
    });

    it('should not display infinite scroll if enough gifs for one page have not been loaded', () => {
      expect(true).toBeFalsy();
    });
  });
});
