import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { LoadingComponent } from './loading.component';

describe('LoadingComponent', () => {
  let component: LoadingComponent;
  let fixture: ComponentFixture<LoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingComponent, CommonModule]
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingComponent);
    component = fixture.componentInstance;
  });

  it('should create with initial properties', () => {
    expect(component).toBeTruthy();
    expect(component.showPopcorn).toBeFalse();
    expect(component.popcorns.length).toBe(10);
    expect((component as any).popcornTimeout).toBeUndefined();
  });

  it('should set showPopcorn to true after 5000ms', fakeAsync(() => {
    component.ngOnInit();
    expect(component.showPopcorn).toBeFalse();

    tick(4999);
    expect(component.showPopcorn).toBeFalse();

    tick(1);
    expect(component.showPopcorn).toBeTrue();

    component.ngOnDestroy();
  }));

  it('should clear timeout on destroy', fakeAsync(() => {
    component.ngOnInit();
    const timeoutId = (component as any).popcornTimeout;
    spyOn(window, 'clearTimeout');

    component.ngOnDestroy();
    expect(clearTimeout).toHaveBeenCalledWith(timeoutId);
  }));
});
