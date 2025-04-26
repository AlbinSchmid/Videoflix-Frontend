import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { WindowService } from '../../services/window.service';

class ApiServiceMock {
  postLoginOrLogouData = jasmine.createSpy('postLoginOrLogouData').and.returnValue(of({}));
}

class RouterMock {
  navigate = jasmine.createSpy('navigate');
}

class LocationMock {
  back = jasmine.createSpy('back');
}

class WindowServiceMock {
  width = new BehaviorSubject<number>(1024);
}

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let api: ApiServiceMock;
  let router: RouterMock;
  let location: LocationMock;
  let win: WindowServiceMock;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, HeaderComponent],
      providers: [
        { provide: ApiService, useClass: ApiServiceMock },
        { provide: Router, useClass: RouterMock },
        { provide: Location, useClass: LocationMock },
        { provide: WindowService, useClass: WindowServiceMock }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    api = TestBed.inject(ApiService) as unknown as ApiServiceMock;
    router = TestBed.inject(Router) as unknown as RouterMock;
    location = TestBed.inject(Location) as unknown as LocationMock;
    win = TestBed.inject(WindowService) as unknown as WindowServiceMock;
    fixture.detectChanges();
  });

  it('should create and respond to width changes', () => {
    expect(component).toBeTruthy();
    win.width.next(800);
    expect(component.windowWidth).toBe(800);
  });

  it('logout should call api and navigate to root on success', () => {
    component.logout();
    expect(api.postLoginOrLogouData).toHaveBeenCalledWith('logout/', {});
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('logout should NOT navigate on API error', fakeAsync(() => {
    api.postLoginOrLogouData.and.returnValue(throwError(() => new Error('Logout failed')));
    component.logout();
    tick();
    expect(router.navigate).not.toHaveBeenCalled();
  }));

  it('goToPreviosPage should call location.back', () => {
    component.goToPreviosPage();
    expect(location.back).toHaveBeenCalled();
  });
});
