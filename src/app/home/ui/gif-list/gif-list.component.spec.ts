import { ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';

import { GifListComponent } from './gif-list.component';

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
        By.css('[data-test="gif-item"]')
      );

      expect(gifItems.length).toEqual(testGifs.length);
    });
  });
});
