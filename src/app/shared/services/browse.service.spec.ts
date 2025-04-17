import { TestBed } from '@angular/core/testing';
import { BrowseService } from './browse.service';
import Hls from 'hls.js';

describe('BrowseService', () => {
  let service: BrowseService;
  let videoEl: HTMLVideoElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BrowseService]
    });
    service = TestBed.inject(BrowseService);
    videoEl = document.createElement('video');

    spyOn(Hls, 'isSupported').and.returnValue(true);
  });

  afterEach(() => {
    service.hlsMap.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadHlsAndPlayWhenReady', () => {
    it('should mute video, destroy old HLS, and call checkIfHlsSupported', () => {
      const fakeHls = jasmine.createSpyObj('Hls', ['destroy']);
      spyOn(service, 'checkIfHlsSupported');
      service.hlsMap.set(videoEl, fakeHls);

      service.loadHlsAndPlayWhenReady(videoEl, 'test.m3u8', true);

      expect(videoEl.muted).toBeTrue();
      expect(fakeHls.destroy).toHaveBeenCalled();
      expect(service.checkIfHlsSupported).toHaveBeenCalledWith(videoEl, 'test.m3u8');
    });
  });

  describe('checkIfHlsSupported', () => {
    it('should create new Hls, load and attach when supported', () => {
      spyOn(Hls.prototype, 'loadSource');
      spyOn(Hls.prototype, 'attachMedia');

      service.checkIfHlsSupported(videoEl, 'movie.m3u8');

      expect(service.hlsMap.has(videoEl)).toBeTrue();
      expect(Hls.prototype.loadSource).toHaveBeenCalledWith('movie.m3u8');
      expect(Hls.prototype.attachMedia).toHaveBeenCalledWith(videoEl);
    });

    it('should fallback to setting src when Hls is not supported', () => {
      (Hls.isSupported as jasmine.Spy).and.returnValue(false);
      spyOn(videoEl, 'canPlayType').and.returnValue('maybe');

      service.checkIfHlsSupported(videoEl, 'fallback.m3u8');

      expect(videoEl.src.endsWith('fallback.m3u8')).toBeTrue();
    });
  });

  describe('destroyHls', () => {
    it('should destroy and remove the Hls instance', () => {
      const fakeHls = jasmine.createSpyObj('Hls', ['destroy']);
      service.hlsMap.set(videoEl, fakeHls);

      service.destroyHls(videoEl);

      expect(fakeHls.destroy).toHaveBeenCalled();
      expect(service.hlsMap.has(videoEl)).toBeFalse();
    });
  });
});
