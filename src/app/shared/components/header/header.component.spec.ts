import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

class MockApiService {
  postLoginOrLogouData = jasmine.createSpy('postLoginOrLogouData');
}

class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let apiService: MockApiService;
  let router: MockRouter;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent, MatButtonModule, MatIconModule, CommonModule],
      providers: [
        { provide: ApiService, useClass: MockApiService },
        { provide: Router, useClass: MockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as unknown as MockApiService;
    router = TestBed.inject(Router) as unknown as MockRouter;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call logout API and navigate to root on success', fakeAsync(() => {
    const response = { message: 'Logged out' };
    apiService.postLoginOrLogouData.and.returnValue(of(response));

    component.logout();
    tick();

    expect(apiService.postLoginOrLogouData).toHaveBeenCalledWith('logout/', {});
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  }));

  it('should log error and not navigate on API failure', fakeAsync(() => {
    const error = new Error('Logout failed');
    apiService.postLoginOrLogouData.and.returnValue(throwError(() => error));
    spyOn(console, 'log');

    component.logout();
    tick();

    expect(apiService.postLoginOrLogouData).toHaveBeenCalledWith('logout/', {});
    expect(console.log).toHaveBeenCalledWith(error);
    expect(router.navigate).not.toHaveBeenCalled();
  }));
});
