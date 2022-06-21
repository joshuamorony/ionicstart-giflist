import { Component } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { IonicModule, PopoverController } from '@ionic/angular';
import { SettingsService } from '../shared/data-access/settings/settings.service';

import { SettingsComponent } from './settings.component';
import { MockSettingsFormComponent } from './ui/settings-form/settings-form.component.spec';

jest.mock('../shared/data-access/settings.service');

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
      declarations: [SettingsComponent, MockSettingsFormComponent],
      providers: [
        SettingsService,
        {
          provide: PopoverController,
          useValue: {
            dismiss: jest.fn(),
          },
        },
      ],
      imports: [IonicModule.forRoot(), ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should pass settingsForm data to save method of settings service when form is submitted', () => {
    const settingsService = fixture.debugElement.injector.get(SettingsService);
    const settingsForm = fixture.debugElement.query(
      By.css('app-settings-form')
    );

    settingsForm.triggerEventHandler('save', null);

    expect(settingsService.save).toHaveBeenCalledWith(
      component.settingsForm.value
    );
  });

  it('should dismiss when form is saved', () => {
    const popoverCtrl = fixture.debugElement.injector.get(PopoverController);

    const settingsForm = fixture.debugElement.query(
      By.css('app-settings-form')
    );

    settingsForm.triggerEventHandler('save', null);

    expect(popoverCtrl.dismiss).toHaveBeenCalled();
  });

  it('should be able to dismiss by clicking close button', () => {
    const popoverCtrl = fixture.debugElement.injector.get(PopoverController);

    const closeButton = fixture.debugElement.query(
      By.css('[data-test="modal-close-button"]')
    );

    closeButton.nativeElement.click();

    expect(popoverCtrl.dismiss).toHaveBeenCalled();
  });
});
