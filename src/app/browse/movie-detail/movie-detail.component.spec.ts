import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MovieDetailComponent } from './movie-detail.component';
import { ApiService } from '../../shared/services/api.service';
import { BrowseService } from '../../shared/services/browse.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';

class MockApiService {
  getData = jasmine.createSpy('getData').and.returnValue(of([]));
  postData = jasmine.createSpy('postData').and.returnValue(of({}));
}

class MockBrowseService {
  loadHlsAndPlayWhenReady = jasmine.createSpy('loadHlsAndPlayWhenReady');
  destroyHls = jasmine.createSpy('destroyHls');
}

class MockDialogRef {
  close = jasmine.createSpy('close');
}

class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

describe('MovieDetailComponent', () => {
  let component: MovieDetailComponent;
  let fixture: ComponentFixture<MovieDetailComponent>;
  let apiService: MockApiService;
  let browseService: MockBrowseService;
  let dialogRef: MockDialogRef;
  let router: MockRouter;
  const mockData = { movie: { id: 1, slug: 'test-slug', hls_url: 'test.m3u8', title: 'Test', release_year: '2025', description: 'Desc', author: 'Auth', author_url: '', license: 'LIC', license_url: '' } };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieDetailComponent, CommonModule],
      providers: [
        { provide: ApiService, useClass: MockApiService },
        { provide: BrowseService, useClass: MockBrowseService },
        { provide: MatDialogRef, useClass: MockDialogRef },
        { provide: Router, useClass: MockRouter },
        { provide: MAT_DIALOG_DATA, useValue: mockData }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MovieDetailComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as any;
    browseService = TestBed.inject(BrowseService) as any;
    dialogRef = TestBed.inject(MatDialogRef) as any;
    router = TestBed.inject(Router) as any;
  });

  it('should create and set strings from data', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    expect(component.title).toBe('Test');
    expect(component.releaseYear).toBe('2025');
    expect(component.description).toBe('Desc');
    expect(component.author).toBe('Auth');
    expect(component.license).toBe('LIC');
  }));

  it('should load and filter movie progress', fakeAsync(() => {
    const progress = [{ id: 1, finished: false }];
    apiService.getData.and.returnValue(of(progress));
    fixture.detectChanges();
    tick();
    expect(component.continueWatching).toBeTrue();
    expect(component.allreadyWatched).toBeFalse();
  }));

  it('should handle progress load error', fakeAsync(() => {
    apiService.getData.and.returnValue(throwError(() => new Error('Err')));
    fixture.detectChanges();
    tick();
    expect(component.loading).toBeFalse();
  }));

  it('should format duration correctly', () => {
    component.formatDuration(3600 + 15 * 60);
    expect(component.movieDuration).toBe('1 Std. 15 min.');
    component.formatDuration(5 * 60);
    expect(component.movieDuration).toBe('5 min.');
  });

  it('should navigate to watch and post progress when not watched', fakeAsync(() => {
    component.continueWatching = false;
    component.allreadyWatched = false;
    component.data = mockData;
    component.navigateToWatchComponent();
    expect(apiService.postData).toHaveBeenCalledWith('movies/progress/', jasmine.any(Object));
    expect(dialogRef.close).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/browse/watch', 'test-slug']);
  }));

  it('should not post progress if already watching or watched', () => {
    component.continueWatching = true;
    component.allreadyWatched = false;
    component.navigateToWatchComponent();
    expect(apiService.postData).not.toHaveBeenCalled();
  });
});
