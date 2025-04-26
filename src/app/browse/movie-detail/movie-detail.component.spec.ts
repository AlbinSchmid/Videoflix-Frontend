import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MovieDetailComponent } from './movie-detail.component';
import { ApiService } from '../../shared/services/api.service';
import { BrowseService } from '../../shared/services/browse.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA, ElementRef } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { WindowService } from '../../shared/services/window.service';

class ApiServiceMock {
  getData = jasmine.createSpy('getData').and.returnValue(of([]));
  postData = jasmine.createSpy('postData').and.returnValue(of({}));
}

class BrowseServiceMock {
  onIOS = false;
  loadHlsAndPlayWhenReady = jasmine.createSpy('loadHlsAndPlayWhenReady');
  destroyHls = jasmine.createSpy('destroyHls');
}

class DialogRefMock {
  close = jasmine.createSpy('close');
}

class RouterMock {
  navigate = jasmine.createSpy('navigate');
}

class WindowServiceMock {
  width = new BehaviorSubject<number>(1024);
}

(globalThis as any).videojs = () => ({
  volume: () => {},
  on: () => {},
  currentTime: () => 0,
  pause: () => {}
});

describe('MovieDetailComponent', () => {
  let component: MovieDetailComponent;
  let fixture: ComponentFixture<MovieDetailComponent>;
  let api: ApiServiceMock;
  let browse: BrowseServiceMock;
  let dialog: DialogRefMock;
  let router: RouterMock;

  const mockData = {
    movie: {
      id: 1,
      slug: 'slug',
      hls_url: 'url',
      title: 'Title',
      release_year: '2024',
      description: 'Desc',
      author: 'Auth',
      author_url: 'aurl',
      license: 'Lic',
      license_url: 'lurl'
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, MovieDetailComponent],
      providers: [
        { provide: ApiService, useClass: ApiServiceMock },
        { provide: BrowseService, useClass: BrowseServiceMock },
        { provide: MatDialogRef, useClass: DialogRefMock },
        { provide: Router, useClass: RouterMock },
        { provide: WindowService, useClass: WindowServiceMock },
        { provide: MAT_DIALOG_DATA, useValue: mockData }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MovieDetailComponent);
    component = fixture.componentInstance;
    api = TestBed.inject(ApiService) as unknown as ApiServiceMock;
    browse = TestBed.inject(BrowseService) as unknown as BrowseServiceMock;
    dialog = TestBed.inject(MatDialogRef) as unknown as DialogRefMock;
    router = TestBed.inject(Router) as unknown as RouterMock;
  });

  it('should create and set strings', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    expect(component.title).toBe('Title');
    expect(component.releaseYear).toBe('2024');
    expect(component.description).toBe('Desc');
    expect(component.author).toBe('Auth');
    expect(component.license).toBe('Lic');
  }));

  it('should filter response for continue watching', () => {
    const resp = [{ movie: { id: 1 }, finished: false }];
    component.filterResponse(resp);
    expect(component.continueWatching).toBeTrue();
    expect(component.alreadyWatched).toBeFalse();
  });

  it('should filter response for already watched', () => {
    const resp = [{ movie: { id: 1 }, finished: true }];
    component.filterResponse(resp);
    expect(component.continueWatching).toBeFalse();
    expect(component.alreadyWatched).toBeTrue();
  });

  it('loadMoviesProgress should handle error', fakeAsync(() => {
    api.getData.and.returnValue(throwError(() => new Error('err')));
    component.loadMoviesProgress();
    tick();
    expect(component.loading).toBeFalse();
  }));

  it('navigateToWatchComponent should post progress when not watched', () => {
    component.continueWatching = false;
    component.alreadyWatched = false;
    component.navigateToWatchComponent();
    expect(api.postData).toHaveBeenCalledWith('movies/progress/', jasmine.any(Object));
    expect(dialog.close).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/browse/watch', 'slug']);
  });

  it('navigateToWatchComponent should not post when already watched', () => {
    component.continueWatching = true;
    component.navigateToWatchComponent();
    expect(api.postData).not.toHaveBeenCalled();
  });

  it('toggleSoundOfMovie toggles muted', () => {
    const vid = { muted: true } as any;
    component.video = vid;
    component.toggleSoundOfMovie();
    expect(vid.muted).toBeFalse();
  });

  it('checkIfContinueToMovie returns correct label', () => {
    component.continueWatching = true;
    expect(component.checkIfContinueToMovie()).toBe('Continue');
    component.continueWatching = false;
    expect(component.checkIfContinueToMovie()).toBe('Play');
  });

  it('ngOnDestroy destroys hls', () => {
    const vid = {} as any;
    component.video = vid;
    component.ngOnDestroy();
    expect(browse.destroyHls).toHaveBeenCalledWith(vid);
  });
});
