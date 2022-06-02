import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';
import { Gif } from '../../../shared/interfaces/gif';

import { GifListComponent } from './gif-list.component';

@Component({
  selector: 'app-gif-list',
  template: '',
})
export class MockGifListComponent {
  @Input() gifs!: Gif[];
}

describe('GifListComponent', () => {
  let component: GifListComponent;
  let fixture: ComponentFixture<GifListComponent>;

  const testGifs = [{}, {}, {}] as any[];

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

    it('should set the gifs loading state to true once a load is triggered', () => {});

    it('should set the gifs loading state to false and dataLoaded state to true once a load has finished', () => {});

    it('should play the video if it is paused', () => {});

    it('should pause the video if it is playing', () => {});
  });
});
