import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { ActivateAccountComponent } from './activate-account.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ApiService } from '../shared/services/api.service';
import { PLATFORM_ID } from '@angular/core';
import { of, throwError  } from 'rxjs';

describe('ActivateAccountComponent', () => {
  let component: ActivateAccountComponent;
  let fixture: ComponentFixture<ActivateAccountComponent>;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    const routerMock = {
      snapshot: {
        paramMap: {
          get: (key: string) => {
            if (key === 'uid') return '12345';
            if (key === 'token') return 'abcdf';
            return null;
          },
        },
      },
    };

    apiServiceSpy = jasmine.createSpyObj('ApiService', ['postData']);
    apiServiceSpy.postData.and.returnValue(of({ message: 'Verification successful' }));

    await TestBed.configureTestingModule({
      providers: [
        { provide: ActivatedRoute, useValue: routerMock },
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: PLATFORM_ID, useValue: 'browser' },
        provideHttpClient(withInterceptorsFromDi()),
      ],
      imports: [ActivateAccountComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ActivateAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call verifyUser on ngOnInit when on browser', () => {
    spyOn(component, 'verifyUser');
    component.ngOnInit();
    expect(component.verifyUser).toHaveBeenCalled();
  })

  it('should call sendRequest with correct data in verifyUser', () => {
    spyOn(component, 'sendRequest');
    component.verifyUser();
    expect(component.sendRequest).toHaveBeenCalledWith({uid: '12345', token: 'abcdf'});
  })

  it('should set message on successful request in sendRequest', () => {
    component.sendRequest({ uid: '12345', token: 'abcdef' });
    expect(component.message).toBe('Verification successful');
  })

  it('should set message on error in sendRequest', () => {
    const errorResponse = {
      error: { detail: 'Verification failed' },
    };
    apiServiceSpy.postData.and.returnValue(throwError(() => errorResponse));

    component.sendRequest({ uid: '12345', token: 'abcdef' });
    expect(component.message).toBe('Verification failed');
  });
});
