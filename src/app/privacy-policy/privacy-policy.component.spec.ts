import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrivacyPolicyComponent } from './privacy-policy.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ApiService } from '../shared/services/api.service';
import { WindowService } from '../shared/services/window.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { BehaviorSubject, of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

class ApiServiceMock {
  postLoginOrLogouData = jasmine.createSpy('postLoginOrLogouData').and.returnValue(of({}));
}

class WindowServiceMock {
  width = new BehaviorSubject<number>(1440);
}

class RouterMock {
  navigate = jasmine.createSpy('navigate');
}

class LocationMock {
  back = jasmine.createSpy('back');
}

describe('PrivacyPolicyComponent', () => {
  let component: PrivacyPolicyComponent;
  let fixture: ComponentFixture<PrivacyPolicyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, PrivacyPolicyComponent],
      providers: [
        { provide: ApiService, useClass: ApiServiceMock },
        { provide: WindowService, useClass: WindowServiceMock },
        { provide: Router, useClass: RouterMock },
        { provide: Location, useClass: LocationMock }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivacyPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
