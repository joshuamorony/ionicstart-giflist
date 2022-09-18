import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Browser } from '@capacitor/browser';
import { subscribeSpyTo } from '@hirez_io/observer-spy';
import { IonicModule } from '@ionic/angular';
import { Gif } from '../../../shared/interfaces/gif';

import { GifListComponent } from './gif-list.component';

@Component({
  selector: 'app-gif-list',
  template: '',
})
export class MockGifListComponent {
  @Input() gifs!: Gif[];
  @Output() gifLoadStart = new EventEmitter();
  @Output() gifLoadComplete = new EventEmitter();
}

describe('GifListComponent', () => {
  let component: GifListComponent;
  let fixture: ComponentFixture<GifListComponent>;

  const testGifs = [
    { permalink: 'test' },
    { permalink: 'test' },
    { permalink: 'test' },
  ] as any[];

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [GifListComponent],
      imports: [IonicModule.forRoot()],
    })
      .overrideComponent(GifListComponent, {
        set: { changeDetection: ChangeDetectionStrategy.Default },
      })
      .compileComponents();

    fixture = TestBed.createComponent(GifListComponent);
    component = fixture.componentInstance;

    component.gifs = testGifs;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  xit('should open permalink of gif when comments button clicked', () => {
    const commentsButton = fixture.debugElement.query(
      By.css('[data-test="gif-comments-button"]')
    );

    commentsButton.nativeElement.click();

    expect(Browser.open).toHaveBeenCalledWith(
      expect.objectContaining({
        url: `https://reddit.com/${testGifs[0].permalink}`,
      })
    );
  });

  describe('@Output() gifLoadStart', () => {
    const testPermalink = 'test';

    const testGif = {
      permalink: testPermalink,
    } as any;
    let testEvent: Event;
    let target: Partial<HTMLVideoElement>;

    beforeEach(() => {
      target = {
        readyState: 0,
        load: jest.fn(),
        play: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        setAttribute: jest.fn(),
        getAttribute: jest.fn(),
      };

      testEvent = {
        target,
      } as Event;
    });

    it('should emit with permalink once a load is triggered', () => {
      const observerSpy = subscribeSpyTo(component.gifLoadStart);
      component.playVideo(testEvent, testGif);
      expect(observerSpy.getLastValue()).toEqual(testPermalink);
    });
  });

  describe('@Output() gifLoadComplete', () => {
    const testPermalink = 'test';

    const testGif = {
      permalink: testPermalink,
    } as any;
    let testEvent: Event;
    let target: Partial<HTMLVideoElement>;

    beforeEach(() => {
      target = {
        readyState: 0,
        load: jest.fn(),
        play: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        setAttribute: jest.fn(),
        getAttribute: jest.fn(),
      };

      testEvent = {
        target,
      } as Event;
    });

    it('should emit with permalink once a load has finished', async () => {
      const observerSpy = subscribeSpyTo(component.gifLoadComplete);

      component.playVideo(testEvent, testGif);
      const addEventListener = target.addEventListener as jest.Mock;
      const handler = addEventListener.mock.calls[0][1];
      await handler();

      expect(observerSpy.getLastValue()).toEqual(testPermalink);
    });
  });

  describe('@Input() gifs', () => {
    it('should render an item for each gif', () => {
      const gifItems = fixture.debugElement.queryAll(
        By.css('[data-test="gif-list-item"]')
      );

      expect(gifItems.length).toEqual(testGifs.length);
    });

    it('should set preload attribute to false for video', () => {
      const testVideo = fixture.debugElement.query(
        By.css('[data-test="gif-list-item"] video')
      );

      expect(testVideo.attributes.preload).toEqual('none');
    });
  });

  describe('playVideo()', () => {
    const testGif = {} as any;
    let testEvent: Event;
    let target: Partial<HTMLVideoElement>;

    beforeEach(() => {
      target = {
        paused: false,
        readyState: 0,
        load: jest.fn(),
        play: jest.fn(),
        pause: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        setAttribute: jest.fn(),
        getAttribute: jest.fn(),
      };

      testEvent = {
        target,
      } as Event;
    });

    it('should trigger loading the video if the video has not yet loaded', () => {
      component.playVideo(testEvent, testGif);
      expect(target.load).toHaveBeenCalled();
    });

    it('should play the video once it has finished loading', () => {
      component.playVideo(testEvent, testGif);

      expect(target.addEventListener).toHaveBeenCalledWith(
        'loadeddata',
        expect.anything()
      );

      const addEventListener = target.addEventListener as jest.Mock;
      const handler = addEventListener.mock.calls[0][1];
      handler();
      expect(target.play).toHaveBeenCalled();
    });

    it('should add the data-event-loadeddata attribute once a load is triggered', () => {
      component.playVideo(testEvent, testGif);
      expect(target.setAttribute).toHaveBeenCalledWith(
        'data-event-loadeddata',
        'true'
      );
    });

    it('should not attempt to load the video if the data-event-loadeddata attribute is present', () => {
      target.getAttribute = jest.fn().mockReturnValue('true');

      component.playVideo(testEvent, testGif);
      expect(target.load).not.toHaveBeenCalled();
    });

    it('should play the video if it is paused', () => {
      (target.readyState as number) = 4;
      (target.paused as boolean) = true;
      component.playVideo(testEvent, testGif);
      expect(target.play).toHaveBeenCalled();
    });

    it('should pause the video if it is playing', () => {
      (target.readyState as number) = 4;
      component.playVideo(testEvent, testGif);
      expect(target.pause).toHaveBeenCalled();
    });
  });
});
