import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, Input, Renderer2, ViewChild } from '@angular/core';

@Component({
  selector: 'app-category',
  imports: [
    CommonModule
  ],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss'
})
export class CategoryComponent {
  el = inject(ElementRef);
  renderer = inject(Renderer2);
  @Input() category: any;
  @ViewChild('movieCard') movieCard!: ElementRef;
  rotateX = 0;
  rotateY = 0;

  effectIntensity = 8;
  private animationFrameId: number | null = null;

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

  ngOnInit() {
    console.log(this.category.movies[0].movie_cover);
  }

  firstLetterBig(categoryName: string): string {
    return categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
  }
}
