import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { subscribeSpyTo } from '@hirez_io/observer-spy';
import { Settings } from '../../interfaces';
import { Storage } from '@ionic/storage-angular';

import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let service: SettingsService;
  let storage: Storage;

  const testLoadData = {};

  const setMock = jest.fn();
  const getMock = jest.fn().mockResolvedValue(testLoadData);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: Storage,
          useValue: {
            create: jest.fn().mockResolvedValue({
              set: setMock,
              get: getMock,
            }),
          },
        },
      ],
    });
    service = TestBed.inject(SettingsService);
    storage = TestBed.inject(Storage);

    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('init()', () => {
    it('should emit the settings from storage on getSettings if defined', (done) => {
      const observerSpy = subscribeSpyTo(service.settings$);
      service.init();
      setTimeout(() => {
        expect(observerSpy.getLastValue()).toEqual(testLoadData);
        done();
      }, 0);
    });

    it('should not emit the settings from storage on getSettings if not defined', () => {
      jest.spyOn(storage, 'create').mockResolvedValue({
        get: jest.fn().mockResolvedValue(undefined),
      } as any);

      const observerSpy = subscribeSpyTo(service.settings$);
      service.init();
      expect(observerSpy.getLastValue()).toEqual({
        sort: 'hot',
        perPage: 10,
      });
    });
  });

  describe('settings$', () => {
    it('should emit default values initially', () => {
      const observerSpy = subscribeSpyTo(service.settings$);

      expect(observerSpy.getFirstValue()).toEqual({
        sort: 'hot',
        perPage: 10,
      });
    });
  });

  describe('save()', () => {
    const testSettings: Settings = {
      sort: 'new',
      perPage: 20,
    };

    it('should save the settings in storage', (done) => {
      service.init();
      service.save(testSettings);
      setTimeout(() => {
        expect(setMock).toHaveBeenLastCalledWith('settings', testSettings);
        done();
      }, 0);
    });

    it('should emit the new settings on the settings stream', (done) => {
      const observerSpy = subscribeSpyTo(service.settings$);
      service.save(testSettings);
      setTimeout(() => {
        expect(observerSpy.getLastValue()).toEqual(testSettings);
        done();
      }, 0);
    });
  });
});
