import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, inject, Input, Output, Renderer2, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MovieDetailComponent } from '../movie-detail/movie-detail.component';
import { EventEmitter } from '@angular/core';
import { obj } from 'video.js/dist/types/utils/obj';
import { MatIconModule } from '@angular/material/icon';
import { WindowService } from '../../shared/services/window.service';

@Component({
  selector: 'app-category',
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss',
  host: { 'ngSkipHydration': '' }
})
export class CategoryComponent {
  windowService = inject(WindowService);
  dialog = inject(MatDialog);
  el = inject(ElementRef);
  renderer = inject(Renderer2);
  cdr = inject(ChangeDetectorRef);

  @ViewChild('scrollContainer', { static: true }) scrollContainer!: ElementRef;

  @Input() category: { genre: string, movies: any[] } = { genre: '', movies: [] };
  @Output() muteBackgroundVideo = new EventEmitter<boolean>();

  rotateX: number = 0;
  rotateY: number = 0;
  effectIntensity: number = 8;
  animationFrameId: number | null = null;

  isAtStart: boolean = true;
  isAtEnd: boolean = false;
  windowWidth: number = 0;


  /**
   * Lifecycle hook that is called after Angular has initialized the component.
   * Sets the category name and subscribes to the `width$` observable from the
   * `WindowService` to update the `windowWidth` property whenever the window width changes.
   */
  ngOnInit(): void {
    this.setCategoryName();
    this.windowService.width.subscribe(width => {
      this.windowWidth = width;
    });
  }

  /**
   * Lifecycle hook that is called after the view has been fully initialized.
   * Calls the `checkScrollPosition` method to set the initial scroll position state.
   */
  ngAfterViewInit(): void {+
    this.checkScrollPosition();
  }

  /**
   * Checks the current scroll position of the movie container and updates
   * the `isAtStart` and `isAtEnd` properties accordingly.
   */
  checkScrollPosition(): void {
    const container = this.scrollContainer.nativeElement;
    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    this.isAtStart = container.scrollLeft === 0;
    this.isAtEnd = container.scrollLeft >= maxScrollLeft;
    this.cdr.detectChanges();
  }

  /**
   * Scrolls the movie container in the specified direction ('left' or 'right').
   * The scroll amount is calculated based on the container's width divided by
   * the number of visible cards.
   *
   * @param direction - The direction to scroll, either 'left' or 'right'.
   * 
   * Behavior:
   * - Smooth scrolling is applied for a better user experience.
   * - After scrolling, a delay of 500ms is applied before checking the scroll position.
   */
  scrollMovies(direction: 'left' | 'right') {
    const container = this.scrollContainer.nativeElement;
    const scrollAmount = container.offsetWidth / this.checkAmountOfCards();
    if (direction === 'right') {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
    setTimeout(() => this.checkScrollPosition(), 500);
  }

  /**
   * Determines the number of cards to display based on the current window width.
   *
   * @returns {number} The number of cards to display:
   * - 3 cards if the window width is less than 700 pixels.
   * - 4 cards if the window width is between 700 and 999 pixels.
   * - 5 cards if the window width is between 1000 and 1299 pixels.
   * - 6 cards if the window width is 1300 pixels or greater.
   */
  checkAmountOfCards(): number {
    if (this.windowWidth < 700) {
      return 3;
    } else if (this.windowWidth < 1000) {
      return 4;
    } else if (this.windowWidth < 1300) {
      return 5;
    }
    return 6;
  }


  /**
   * Updates the `genre` property of the `category` object to a more user-friendly name
   * based on its current value. Specifically:
   * - If the genre is 'continue_watching', it is updated to 'Continue Watching'.
   * - If the genre is 'new_on_videoflix', it is updated to 'New on Videoflix'.
   *
   * @returns {void}
   */
  setCategoryName(): void {
    if (this.category.genre == 'continue_watching') this.category.genre = 'Continue Watching';
    if (this.category.genre == 'new_on_videoflix') this.category.genre = 'New on Videoflix';
  }

  /**
   * Opens a dialog to display the details of a selected movie.
   *
   * @param movie - An object representing the movie to display in the detail dialog.
   */
  openMovieDetail(movie: { movie: object }): void {
    this.muteBackgroundVideo.emit(true);
    this.dialog.open(MovieDetailComponent, {
      autoFocus: false,
      data: {
        movie: movie.movie || movie,
      },
    });
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
   * Converts the first letter of the given category name to uppercase
   * and returns the modified string.
   *
   * @param categoryName - The name of the category to be transformed.
   * @returns A string with the first letter capitalized and the rest unchanged.
   */
  firstLetterBig(categoryName: string): string {
    return categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
  }
}
