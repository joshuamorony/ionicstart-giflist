import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';

import { SearchBarComponent } from './search-bar.component';

@Component({
  selector: 'app-search-bar',
  template: '',
})
export class MockSearchBarComponent {
  @Input() formControl!: FormControl;
}

describe('SearchBarComponent', () => {
  let component: SearchBarComponent;
  let fixture: ComponentFixture<SearchBarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SearchBarComponent],
      imports: [IonicModule.forRoot(), ReactiveFormsModule],
    })
      .overrideComponent(SearchBarComponent, {
        set: {
          changeDetection: ChangeDetectionStrategy.Default,
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(SearchBarComponent);
    component = fixture.componentInstance;

    component.formControl = new FormControl('');

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('@formControl', () => {
    it('should bind search bar input to supplied form control', () => {
      const testValue = 'test';
      component.formControl.setValue(testValue);

      fixture.detectChanges();

      const searchBarInput = fixture.debugElement.query(
        By.css('[data-test="subreddit-bar"]')
      );

      expect(searchBarInput.componentInstance.value).toEqual(testValue);
    });
  });
});
