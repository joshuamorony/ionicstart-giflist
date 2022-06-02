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

    it('should trigger loading the video if the video has not yet loaded', () => {
      const target: Partial<HTMLVideoElement> = {
        readyState: 0,
        load: jest.fn(),
      };

      const testEvent = {
        target,
      } as Event;

      component.playVideo(testEvent, testGif);

      expect(target.load).toHaveBeenCalled();
    });

    it('should play the video once it has finished loading', () => {});

    it('should add the data-event-loadeddata attribute once a load is triggered', () => {});

    it('should not attempt to load the video if the data-event-loadeddata attribute is present', () => {});

    it('should set the gifs loading state to true once a load is triggered', () => {});

    it('should set the gifs loading state to false and dataLoaded state to true once a load has finished', () => {});

    it('should play the video if it is paused', () => {});

    it('should pause the video if it is playing', () => {});
  });
});
