import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { subscribeSpyTo } from '@hirez_io/observer-spy';
import { IonicModule } from '@ionic/angular';

import { SettingsFormComponent } from './settings-form.component';

@Component({
  selector: 'app-settings-form',
  template: '',
})
export class MockSettingsFormComponent {
  @Input() settingsForm!: FormGroup;
  @Output() save = new EventEmitter<boolean>();
}

describe('SettingsFormComponent', () => {
  let component: SettingsFormComponent;
  let fixture: ComponentFixture<SettingsFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SettingsFormComponent],
      imports: [IonicModule.forRoot(), ReactiveFormsModule],
    })
      .overrideComponent(SettingsFormComponent, {
        set: {
          changeDetection: ChangeDetectionStrategy.Default,
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(SettingsFormComponent);
    component = fixture.componentInstance;

    component.settingsForm = new FormGroup({
      subreddit: new FormControl(''),
      sort: new FormControl(''),
      perPage: new FormControl(''),
    });

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('@Input() settingsForm', () => {
    it('should bind subreddit input', () => {
      const testValue = 'test';
      component.settingsForm.get('subreddit')?.setValue(testValue);

      fixture.detectChanges();

      const input = fixture.debugElement.query(
        By.css('[data-test="default-subreddit"]')
      );

      expect(input.componentInstance.value).toEqual(testValue);
    });

    it('should bind sort input', () => {
      const testValue = 'new';
      component.settingsForm.get('sort')?.setValue(testValue);

      fixture.detectChanges();

      const input = fixture.debugElement.query(By.css('[data-test="sort"]'));

      expect(input.componentInstance.value).toEqual(testValue);
    });

    it('should bind posts per page input', () => {
      const testValue = '30';
      component.settingsForm.get('perPage')?.setValue(testValue);

      fixture.detectChanges();

      const input = fixture.debugElement.query(By.css('[data-test="perPage"]'));

      expect(input.componentInstance.value).toEqual(testValue);
    });
  });

  describe('@Output() save', () => {
    it('should emit when the form is submitted', () => {
      const observerSpy = subscribeSpyTo(component.save);

      const form = fixture.debugElement.query(By.css('form'));
      form.triggerEventHandler('ngSubmit', null);

      expect(observerSpy.getLastValue()).toEqual(true);
    });
  });
});
