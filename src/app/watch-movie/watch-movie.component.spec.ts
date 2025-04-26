import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { WatchMovieComponent } from './watch-movie.component';
import { BrowseService } from '../shared/services/browse.service';
import { ApiService } from '../shared/services/api.service';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { PLATFORM_ID, NO_ERRORS_SCHEMA, ElementRef } from '@angular/core';

class ApiServiceMock {
  getData = jasmine.createSpy('getData').and.returnValue(of({ movie: { title: 'Test Movie', slug: 'test', hls_url: 'url' }, progress_seconds: 10 }));
  patchData = jasmine.createSpy('patchData').and.returnValue(of({}));
}

class BrowseServiceMock {
  showQualityMenu = false;
  loadHlsAndPlayWhenReady = jasmine.createSpy('loadHlsAndPlayWhenReady');
}

let readyCallback: Function = () => { };
const playerStub = {
  ready: (fn: Function) => { readyCallback = fn; },
  currentTime: jasmine.createSpy('currentTime'),
  muted: jasmine.createSpy('muted'),
  volume: jasmine.createSpy('volume'),
  getChild: () => ({ addChild: () => { }, children: () => [] }),
  on: (_e: string, _cb: Function) => { },
  isFullscreen: () => false,
  dispose: jasmine.createSpy('dispose')
};

(globalThis as any).videojs = (_elem?: any) => playerStub;
(globalThis as any).videojs.registerComponent = () => { };
(globalThis as any).videojs.getComponent = () => function () { };

describe('WatchMovieComponent', () => {
  let component: WatchMovieComponent;
  let fixture: ComponentFixture<WatchMovieComponent>;
  let api: ApiServiceMock;
  let browse: BrowseServiceMock;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, WatchMovieComponent],
      providers: [
        { provide: ApiService, useClass: ApiServiceMock },
        { provide: BrowseService, useClass: BrowseServiceMock },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ slug: 'test' }) } } },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WatchMovieComponent);
    component = fixture.componentInstance;
    api = TestBed.inject(ApiService) as unknown as ApiServiceMock;
    browse = TestBed.inject(BrowseService) as unknown as BrowseServiceMock;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngAfterViewInit should trigger sendGetRequestProgessMovie', fakeAsync(() => {
    spyOn(component, 'sendGetRequestProgessMovie');
    component.ngAfterViewInit();
    tick();
    expect(component.sendGetRequestProgessMovie).toHaveBeenCalledWith('test');
  }));

  it('handleTheResponse should update flags and call checkWhichVideoElementToSet', fakeAsync(() => {
    spyOn(component, 'checkWhichVideoElementToSet');
    const res = { movie: { title: 'Test', slug: 's', hls_url: 'url' } } as any;
    component.handleTheResponse(res);
    tick();
    expect(component.showLoading).toBeFalse();
    expect(component.showNotFound).toBeFalse();
    expect(component.movieTitle).toBe('Test');
    expect(component.checkWhichVideoElementToSet).toHaveBeenCalled();
  }));

  it('safeProgress should forward values to setData', () => {
    component.video = { duration: 200, currentTime: 100 } as any;
    spyOn(component, 'setData');
    component.safeProgress();
    expect(component.setData).toHaveBeenCalledWith(100, 100);
  });

  it('setData should mark finished when remainingTime < 5', () => {
    spyOn(component, 'sendPatchRequest');
    component.progressMovie = { movie: { slug: 'slug' } } as any;
    component.setData(10, 4);
    expect(component.sendPatchRequest).toHaveBeenCalledWith({ progress_seconds: 0, finished: true }, 'slug');
  });

  it('sendPatchRequest should call api.patchData with correct endpoint', () => {
    component.sendPatchRequest({ a: 1 }, 'slug');
    expect(api.patchData).toHaveBeenCalledWith('movie/progress/slug/', { a: 1 });
    expect(component.showLoading).toBeTrue();
  });

  it('ngOnDestroy should dispose player', () => {
    component.player = playerStub as any;
    component.ngOnDestroy();
    expect(playerStub.dispose).toHaveBeenCalled();
  });

  it('onBeforeUnload should call safeProgress', () => {
    spyOn(component, 'safeProgress');
    component.onBeforeUnload(new Event('beforeunload') as BeforeUnloadEvent);
    expect(component.safeProgress).toHaveBeenCalled();
  });

  it('checkWhichVideoElementToSet should use movie element path', fakeAsync(() => {
    const videoElement = { currentTime: 0 } as any;
    component.movieRef = new ElementRef(videoElement);
    component.progressMovie = { movie: { hls_url: 'url' }, progress_seconds: 10 } as any;
    spyOn(component as any, 'setVideoJsPLayerAndPlay');
    component.checkWhichVideoElementToSet();
    tick();
    expect((component as any).setVideoJsPLayerAndPlay).toHaveBeenCalled();
    expect(browse.loadHlsAndPlayWhenReady).toHaveBeenCalledWith(videoElement, 'url', false);
  }));

  it('checkWhichVideoElementToSet should use ios element path', () => {
    const iosElement = { currentTime: 0 } as any;
    component.videoRefIOS = { nativeElement: iosElement } as ElementRef<any>;
    component.movieRef = undefined as any;
    component.progressMovie = { progress_seconds: 42, movie: {} } as any;

    component.checkWhichVideoElementToSet();

    expect(iosElement.currentTime).toBe(42);
  });
});