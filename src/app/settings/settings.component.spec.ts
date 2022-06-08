import { Component } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';

import { SettingsComponent } from './settings.component';

@Component({
  selector: 'app-settings',
  template: '',
})
export class MockSettingsComponent {}

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SettingsComponent],
      imports: [IonicModule.forRoot(), ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('settingsForm', () => {
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

    it('should pass data to save method of settings service when form is submitted', () => {
      const settingsForm = fixture.debugElement.query(By.css('form'));

      settingsForm.triggerEventHandler('ngSubmit', null);
    });
  });
});
