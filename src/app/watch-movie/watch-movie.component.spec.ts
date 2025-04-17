import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { WatchMovieComponent } from './watch-movie.component';
import { ApiService } from '../shared/services/api.service';
import { BrowseService } from '../shared/services/browse.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PLATFORM_ID, NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

class MockApiService {
  getData = jasmine.createSpy('getData');
  patchData = jasmine.createSpy('patchData').and.returnValue(of({}));
}

class MockBrowseService {
  loadHlsAndPlayWhenReady = jasmine.createSpy('loadHlsAndPlayWhenReady');
}

class MockActivatedRoute {
  snapshot = {
    paramMap: {
      get: jasmine.createSpy('get').and.returnValue('test-slug')
    }
  };
}

describe('WatchMovieComponent', () => {
  let component: WatchMovieComponent;
  let fixture: ComponentFixture<WatchMovieComponent>;
  let apiService: MockApiService;
  let browseService: MockBrowseService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WatchMovieComponent],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        { provide: ApiService, useClass: MockApiService },
        { provide: BrowseService, useClass: MockBrowseService },
        { provide: ActivatedRoute, useClass: MockActivatedRoute },
        { provide: Router, useValue: {} },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(WatchMovieComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as any;
    browseService = TestBed.inject(BrowseService) as any;

    component.movieRef = { nativeElement: document.createElement('video') } as any;
    component.player = {
      muted: jasmine.createSpy('muted'),
      volume: jasmine.createSpy('volume'),
      currentTime: jasmine.createSpy('currentTime'),
      duration: jasmine.createSpy('duration').and.returnValue(200),
      on: jasmine.createSpy('on'),
      ready: (fn: Function) => fn(),
      isFullscreen: jasmine.createSpy('isFullscreen').and.returnValue(false),
      dispose: jasmine.createSpy('dispose')
    } as any;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch movie progress and initialize video in ngAfterViewInit', fakeAsync(() => {
    const mockResponse = { movie: { title: 'Test Movie', slug: 'test-slug', hls_url: 'url.m3u8' }, progress_seconds: 42 };
    apiService.getData.and.returnValue(of(mockResponse));

    spyOn(component, 'getVideoElementAndMovieHlsUrl');
    spyOn(component, 'getVideoJsPLayerReady');

    component.ngAfterViewInit();
    tick();

    expect(apiService.getData).toHaveBeenCalledWith('movie/progress/test-slug/');
    expect(component.showLoading).toBeFalse();
    expect(component.showNotFound).toBeFalse();
    expect(component.progressMovie).toEqual(mockResponse);
    expect(component.movieTitle).toBe('Test Movie');
    expect(component.player.currentTime).toHaveBeenCalledWith(42);
    expect(component.getVideoElementAndMovieHlsUrl).toHaveBeenCalled();
    expect(component.getVideoJsPLayerReady).toHaveBeenCalled();
  }));

  it('should handle API error and show not found', fakeAsync(() => {
    apiService.getData.and.returnValue(throwError(() => new Error('Error')));

    component.ngAfterViewInit();
    tick();

    expect(component.showLoading).toBeFalse();
    expect(component.showNotFound).toBeTrue();
  }));

  describe('getVideoElementAndMovieHlsUrl', () => {
    it('should call browseService.loadHlsAndPlayWhenReady with correct arguments', fakeAsync(() => {
      const videoEl = document.createElement('video');
      component.movieRef = { nativeElement: videoEl } as any;
      component.progressMovie = { movie: { hls_url: 'test-url.m3u8' } } as any;
      component.player = {
        muted: jasmine.createSpy('muted'),
        volume: jasmine.createSpy('volume'),
        dispose: jasmine.createSpy('dispose')
      } as any;

      component.getVideoElementAndMovieHlsUrl();
      tick();

      expect(component.player.muted).toHaveBeenCalledWith(false);
      expect(component.player.volume).toHaveBeenCalledWith(0.3);
      expect(browseService.loadHlsAndPlayWhenReady).toHaveBeenCalledWith(videoEl, 'test-url.m3u8', false);
    }));
  });

  describe('setData', () => {
    it('should reset progress and mark finished when remainingTime < 150', () => {
      component.progressMovie = { movie: { slug: 'slug' } } as any;
      component.setData(30, 100);
      expect(apiService.patchData).toHaveBeenCalledWith('movie/progress/slug/', { progress_seconds: 0, finished: true });
    });

    it('should update progress when remainingTime >= 150', () => {
      component.progressMovie = { movie: { slug: 'slug' } } as any;
      component.setData(50, 200);
      expect(apiService.patchData).toHaveBeenCalledWith('movie/progress/slug/', { progress_seconds: 50, finished: false });
    });
  });

  it('should dispose player on destroy', () => {
    component.ngOnDestroy();
    expect((component.player as any).dispose).toHaveBeenCalled();
  });
});
