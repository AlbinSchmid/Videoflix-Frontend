import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, Input, Renderer2, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
// import Hls from 'hls.js';
import { MovieDetailComponent } from '../movie-detail/movie-detail.component';

@Component({
  selector: 'app-category',
  imports: [
    CommonModule
  ],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss',
  host: { 'ngSkipHydration': '' }
})
export class CategoryComponent {
  dialog = inject(MatDialog);
  el = inject(ElementRef);
  renderer = inject(Renderer2);
  @Input() category: any;
  rotateX = 0;
  rotateY = 0;
  effectIntensity = 8;
  animationFrameId: number | null = null;

  /**
   * Opens a dialog to display the details of a selected movie.
   *
   * @param movie - An object representing the movie to display in the detail dialog.
   */
  openMovieDetail(movie: object): void {
    this.dialog.open(MovieDetailComponent, {
      autoFocus: false,
      data: {
        movie: movie,
      },
    });
  }

  /**
   * Handles the mouse move event on a card element.
   * Removes the 'leave-transition' class from the card and cancels any ongoing animation frame.
   * Initiates the card animation based on the current mouse event.
   *
   * @param event - The mouse event triggered by the user's interaction.
   */
  onMouseMove(event: MouseEvent): void {
    let card = event.currentTarget as HTMLElement;
    card.classList.remove('leave-transition');
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.cardAnimation(card, event);
  }

  /**
   * Applies a 3D card animation effect based on mouse movement over the card element.
   * The animation adjusts the card's rotation and scale to create a perspective effect.
   *
   * @param card - The HTML element representing the card to which the animation is applied.
   * @param event - The MouseEvent containing the cursor's position relative to the card.
   * 
   * The animation calculates the cursor's offset from the center of the card and uses
   * this offset to determine the rotation angles (rotateX and rotateY) and applies a
   * perspective transformation to the card element.
   */
  cardAnimation(card: any, event: MouseEvent): void {
    this.animationFrameId = requestAnimationFrame(() => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const midX = rect.width / 2;
      const midY = rect.height / 2;
      const offsetX = (x - midX) / midX;
      const offsetY = (y - midY) / midY;
      const rotateX = offsetY * this.effectIntensity;
      const rotateY = offsetX * -this.effectIntensity;
      const transformStyle = `perspective(500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
      this.renderer.setStyle(card, 'transform', transformStyle);
    });
  }

  /**
   * Handles the mouse leave event on a card element.
   * Cancels any ongoing animation frame and resets the card's transform style.
   * Additionally, applies a CSS class for a leave transition effect.
   *
   * @param event - The mouse event triggered when the pointer leaves the card element.
   */
  onMouseLeave(event: MouseEvent): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    let card = event.currentTarget as HTMLElement;
    card.classList.add('leave-transition');
    const resetTransform = 'perspective(500px) rotateX(0deg) rotateY(0deg) scale(1)';
    this.renderer.setStyle(card, 'transform', resetTransform);
  }

  firstLetterBig(categoryName: string): string {
    return categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
  }
}
