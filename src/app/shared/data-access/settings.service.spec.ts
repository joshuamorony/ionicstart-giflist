import { TestBed } from '@angular/core/testing';
import { subscribeSpyTo } from '@hirez_io/observer-spy';
import { Settings } from '../interfaces';
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
    it('should return a promise', () => {
      expect(service.init()).toBeInstanceOf(Promise);
    });

    it('should emit the settings from storage on getSettings if defined', async () => {
      const observerSpy = subscribeSpyTo(service.getSettings());
      await service.init();
      expect(observerSpy.getLastValue()).toEqual(testLoadData);
    });

    it('should not emit the settings from storage on getSettings if not defined', async () => {
      jest.spyOn(storage, 'create').mockResolvedValue({
        get: jest.fn().mockResolvedValue(undefined),
      } as any);

      const observerSpy = subscribeSpyTo(service.getSettings());
      await service.init();
      expect(observerSpy.getLastValue()).toEqual({
        subreddit: 'gifs',
        sort: 'hot',
        perPage: 10,
      });
    });
  });

  describe('getSettings()', () => {
    it('should emit default values initially', () => {
      const observerSpy = subscribeSpyTo(service.getSettings());

      service.getSettings();

      expect(observerSpy.getFirstValue()).toEqual({
        subreddit: 'gifs',
        sort: 'hot',
        perPage: 10,
      });
    });
  });

  describe('save()', () => {
    const testSettings: Settings = {
      subreddit: 'test',
      sort: 'new',
      perPage: 20,
    };

    it('should save the settings in storage', async () => {
      await service.init();
      service.save(testSettings);
      expect(setMock).toHaveBeenLastCalledWith('settings', testSettings);
    });

    it('should emit the new settings on the settings stream', () => {
      const observerSpy = subscribeSpyTo(service.getSettings());
      service.save(testSettings);
      expect(observerSpy.getLastValue()).toEqual(testSettings);
    });
  });
});
