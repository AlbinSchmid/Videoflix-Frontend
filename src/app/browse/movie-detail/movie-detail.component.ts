import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { BrowseService } from '../../shared/services/browse.service';

@Component({
  selector: 'app-movie-detail',
  imports: [
    MatIconModule,
    MatButtonModule,
    CommonModule
  ],
  templateUrl: './movie-detail.component.html',
  styleUrl: './movie-detail.component.scss'
})
export class MovieDetailComponent {
  browseService = inject(BrowseService);
  dialogRef = inject(MatDialogRef<MovieDetailComponent>);
  router = inject(Router);
  data = inject(MAT_DIALOG_DATA);

  @ViewChild('videoRef', { static: true }) videoElementRef!: ElementRef<HTMLVideoElement>;

  video: HTMLVideoElement | undefined;
  movieDuration: string = '';

  /**
   * Lifecycle hook that is called after Angular has fully initialized
   * the component's view. This method sets up the video element,
   * ensures it is unmuted, triggers change detection, and initiates
   * the process of loading and playing the movie using the provided HLS URL.
   *
   * @remarks
   * This method relies on the `videoElementRef` to access the video element
   * in the DOM and uses the `cdr` (ChangeDetectorRef) to manually trigger
   * change detection after modifying the video element properties.
   *
   * @throws
   * If `videoElementRef` is not defined, the video setup and playback process
   * will not be executed.
   */
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.getVideoElementAndMovieHlsUrl();
    });
  }

  /**
   * Retrieves the video element from the template and the HLS URL of the movie.
   * It then loads the HLS stream and plays the video when it's ready.
   * Additionally, it sets up an event listener to format the video's duration
   * once the metadata is loaded.
   *
   * @remarks
   * This method uses the `browseService` to load the HLS stream and play it.
   * The `videoElementRef` is used to access the video element in the DOM.
   */
  getVideoElementAndMovieHlsUrl(): void {
    if (this.videoElementRef) {
      let movieHlsUrl = this.data.movie.hls_url;
      this.video = this.videoElementRef.nativeElement;
      this.browseService.loadHlsAndPlayWhenReady(this.video, movieHlsUrl, false);
      this.video.addEventListener('loadedmetadata', () => {
        if (this.video) this.formatDuration(this.video.duration);
      });
    }
  }

  /**
   * Formats a duration given in seconds into a human-readable string
   * representing hours and minutes.
   *
   * @param seconds - The duration in seconds to be formatted.
   *                  Must be a non-negative integer.
   *
   * @remarks
   * - If the duration is less than an hour, only the minutes will be included.
   * - If the duration is one hour or more, the result will include both hours and minutes.
   *
   * @example
   * ```typescript
   * formatDuration(3600); // "1 Std. 0 min."
   * formatDuration(4500); // "1 Std. 15 min."
   * formatDuration(300);  // "5 min."
   * ```
   */
  formatDuration(seconds: number): void {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const hStr = h > 0 ? `${h} Std. ` : '';
    const mStr = `${m} min.`;
    this.movieDuration = hStr + mStr;
  }

  /**
   * Lifecycle hook that is called when the component is destroyed.
   * Cleans up resources by destroying the HLS instance if it exists.
   */
  ngOnDestroy(): void {
    if (this.video) this.browseService.destroyHls(this.video);
  }

  /**
   * Toggles the sound of the video element by muting or unmuting it.
   * If the video is currently muted, this method will unmute it, and vice versa.
   */
  toggleSoundOfMovie(): void {
    if (this.video) this.video.muted = !this.video.muted;
  }

  /**
   * Closes the movie detail dialog.
   * This method is used to close the currently open dialog
   * that displays detailed information about a movie.
   */
  closeMovieDetail(): void {
    this.dialogRef.close();
  }

  /**
   * Navigates to the watch component for the selected movie.
   * This method first closes the movie detail view and then
   * uses the Angular Router to navigate to the watch component,
   * passing the movie's slug as a route parameter.
   */
  navigateToWatchComponent(): void {
    this.closeMovieDetail();
    this.router.navigate(['/browse/watch', this.data.movie.slug]);
  }
}
