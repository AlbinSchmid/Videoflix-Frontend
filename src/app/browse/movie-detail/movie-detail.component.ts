import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ChangeDetectorRef } from '@angular/core';
import Hls from 'hls.js';

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
  dialogRef = inject(MatDialogRef<MovieDetailComponent>);
  data = inject(MAT_DIALOG_DATA);
  cdr = inject(ChangeDetectorRef);
  hls?: Hls;

  @ViewChild('videoRef', { static: true }) videoElementRef!: ElementRef<HTMLVideoElement>;
  
  video: any = null;
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
    let movie_url = this.data.movie.hls_url;
    if (this.videoElementRef) {
      this.video = this.videoElementRef.nativeElement;
      this.video.muted = false;
      this.cdr.detectChanges();
      this.laodMovieAndPlayWhenHlsReady(movie_url);
    }
  }

  /**
   * Loads a movie from the given URL and prepares it for playback using HLS (HTTP Live Streaming).
   * If HLS is supported, it initializes an HLS instance, loads the source, and attaches it to the video element.
   * If HLS is not supported but the browser can play HLS natively (e.g., Safari), it sets the video source directly.
   * 
   * @param movie_url - The URL of the movie to be loaded and played.
   */
  laodMovieAndPlayWhenHlsReady(movie_url: string): void {
    if (Hls.isSupported()) {
      this.hls?.destroy();
      this.hls = new Hls();
      this.hls.loadSource(movie_url);
      this.hls.attachMedia(this.video);
      this.video.addEventListener('loadedmetadata', () => {
        this.formatDuration(this.video.duration);
      });
    } else if (this.video.canPlayType && this.video.canPlayType('application/vnd.apple.mpegurl')) {
      this.video.src = movie_url;
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
    this.hls?.destroy();
  }

  /**
   * Toggles the sound of the video element by muting or unmuting it.
   * If the video is currently muted, this method will unmute it, and vice versa.
   */
  toggleSoundOfMovie(): void {
    this.video.muted = !this.video.muted;
  }

  /**
   * Closes the movie detail dialog.
   * This method is used to close the currently open dialog
   * that displays detailed information about a movie.
   */
  closeMovieDetail(): void {
    this.dialogRef.close();
  }
}
