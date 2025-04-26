import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LegalNoticeComponent } from './legal-notice.component';
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
  width = new BehaviorSubject<number>(1280);
}

class RouterMock {
  navigate = jasmine.createSpy('navigate');
}

class LocationMock {
  back = jasmine.createSpy('back');
}

describe('LegalNoticeComponent', () => {
  let component: LegalNoticeComponent;
  let fixture: ComponentFixture<LegalNoticeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, LegalNoticeComponent],
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
    fixture = TestBed.createComponent(LegalNoticeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
