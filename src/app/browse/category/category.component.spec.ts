import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CategoryComponent } from './category.component';
import { MatDialog } from '@angular/material/dialog';
import { Renderer2, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

describe('CategoryComponent', () => {
  let component: CategoryComponent;
  let fixture: ComponentFixture<CategoryComponent>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let renderer: jasmine.SpyObj<Renderer2>;

  beforeEach(async () => {
    dialog = jasmine.createSpyObj('MatDialog', ['open']);
    renderer = jasmine.createSpyObj('Renderer2', ['setStyle']);
    spyOn(window, 'requestAnimationFrame').and.callFake(cb => { cb(0); return 0; });
    spyOn(window, 'cancelAnimationFrame');

    await TestBed.configureTestingModule({
      imports: [CategoryComponent, CommonModule],
      providers: [
        { provide: MatDialog, useValue: dialog },
        { provide: Renderer2, useValue: renderer },
        { provide: ElementRef, useValue: new ElementRef(document.createElement('div')) }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryComponent);
    component = fixture.componentInstance;
    component.renderer = renderer;
    component.dialog = dialog;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('setCategoryName maps known genres', () => {
    component.category = { genre: 'continue_watching', movies: [] };
    component.setCategoryName();
    expect(component.category.genre).toBe('Continue Watching');
    component.category = { genre: 'new_on_videoflix', movies: [] };
    component.setCategoryName();
    expect(component.category.genre).toBe('New on Videoflix');
  });

  it('firstLetterBig capitalizes first letter', () => {
    expect(component.firstLetterBig('test')).toBe('Test');
    expect(component.firstLetterBig('')).toBe('');
  });

  it('openMovieDetail emits and opens dialog', () => {
    spyOn(component.muteBackgroundVideo, 'emit');
    const movie = { title: 'Movie' };
    component.openMovieDetail({ movie });
    expect(component.muteBackgroundVideo.emit).toHaveBeenCalledWith(true);
    expect(dialog.open).toHaveBeenCalledWith(jasmine.any(Function), { autoFocus: false, data: { movie } });
  });

  it('cardAnimation sets transform style', fakeAsync(() => {
    const card = document.createElement('div');
    spyOn(card, 'getBoundingClientRect').and.returnValue({ left: 0, top: 0, width: 100, height: 50 } as DOMRect);
    component.effectIntensity = 5;
    component.cardAnimation(card, { clientX: 75, clientY: 25 } as any);
    tick();
    expect(renderer.setStyle).toHaveBeenCalledWith(
      card,
      'transform',
      jasmine.stringMatching(/perspective\(500px\) rotateX\(-?\d+(?:\.\d+)?deg\) rotateY\(-?\d+(?:\.\d+)?deg\) scale\(1\.05\)/)
    );
  }));

  it('onMouseLeave cancels and resets transform', () => {
    component.animationFrameId = 10;
    const card = document.createElement('div');
    component.onMouseLeave({ currentTarget: card } as any);
    expect(cancelAnimationFrame).toHaveBeenCalledWith(10);
    expect(renderer.setStyle).toHaveBeenCalledWith(
      card,
      'transform',
      'perspective(500px) rotateX(0deg) rotateY(0deg) scale(1)'
    );
    expect(card.classList).toContain('leave-transition');
  });

  it('onMouseMove clears transition and calls cardAnimation', () => {
    component.animationFrameId = 20;
    spyOn(component, 'cardAnimation');
    const card = document.createElement('div');
    card.classList.add('leave-transition');
    const event = { currentTarget: card, clientX: 0, clientY: 0 } as any;
    component.onMouseMove(event);
    expect(cancelAnimationFrame).toHaveBeenCalledWith(20);
    expect(card.classList).not.toContain('leave-transition');
    expect(component.cardAnimation).toHaveBeenCalledWith(card, event);
  });
});
