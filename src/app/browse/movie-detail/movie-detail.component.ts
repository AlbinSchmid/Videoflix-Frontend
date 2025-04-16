import { CommonModule } from '@angular/common';
import { Component, CSP_NONCE, ElementRef, inject, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { BrowseService } from '../../shared/services/browse.service';
import { ApiService } from '../../shared/services/api.service';
import videojs, { VideoJsPlayer } from 'video.js';

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
  apiService = inject(ApiService);
  browseService = inject(BrowseService);
  dialogRef = inject(MatDialogRef<MovieDetailComponent>);
  router = inject(Router);
  data = inject(MAT_DIALOG_DATA);

  movieProgressEndpoint: string = 'movies/progress/';
  continueWatching: boolean = false;
  allreadyWatched: boolean = false;


  @ViewChild('videoRef', { static: true }) videoElementRef!: ElementRef<HTMLVideoElement>;

  video: HTMLVideoElement | undefined;
  movieDuration: string = '';
  player!: any;

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
      this.loadMoviesProgress();
    });
  }

  /**
   * Loads the progress of movies being watched by the user.
   * This method fetches data from the `continueWatchingEndpoint` using the `apiService`
   * and checks if the current movie exists in the response. If the movie exists,
   * it sets the `continueWatching` flag to `true`, otherwise to `false`.
   *
   * @returns {void} This method does not return a value.
   */
  loadMoviesProgress(): void {
    this.apiService.getData(this.movieProgressEndpoint).subscribe(
      (response) => {
        if (response) {
          const movieDetailId = this.data.movie.id
          const existContinue = response.some((item: any) => item.id === movieDetailId && item.finished === false);
          const existFinished = response.some((item: any) => item.id === movieDetailId && item.finished === true);
          existContinue ? this.continueWatching = true : this.continueWatching = false;
          existFinished ? this.allreadyWatched = true : this.allreadyWatched = false;
        };
      }
    )
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
      this.setPlayerAndResumeVolumeAndPauseAt30Sec();
      this.browseService.loadHlsAndPlayWhenReady(this.video, movieHlsUrl, false);
      this.video.addEventListener('loadedmetadata', () => {
        if (this.video) this.formatDuration(this.video.duration);
      });
    }
  }

  /**
   * Sets up the Video.js player instance with specific configurations and event listeners.
   * It sets the volume to 0.05 and pauses the video when it reaches 30 seconds.
   *
   * @remarks
   * This method initializes the Video.js player using the `videoElementRef` and sets up
   * an event listener to pause the video at 30 seconds.
   */
  setPlayerAndResumeVolumeAndPauseAt30Sec(): void {
    this.player = videojs(this.videoElementRef.nativeElement);
    this.player.volume(0.05);
    this.player.on('timeupdate', () => {
      if (this.player.currentTime() >= 30) {
        this.player.pause();
      }
    });
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
   * Navigates to the watch component for the current movie.
   * 
   * This method performs the following actions:
   * 1. Posts the movie progress if the `continueWatching` flag is not set.
   * 2. Closes the movie detail view.
   * 3. Navigates to the watch component using the movie's slug.
   * 
   * @returns {void}
   */
  navigateToWatchComponent(): void {
    if (!this.continueWatching && !this.allreadyWatched) this.postMovieProgress();
    this.closeMovieDetail();
    this.router.navigate(['/browse/watch', this.data.movie.slug]);
  }

  /**
   * Sends the progress of the currently viewed movie to the server.
   * 
   * This method constructs a data object containing the movie's slug, 
   * the progress in seconds (defaulting to 0), and a flag indicating 
   * whether the movie has been finished (defaulting to false). 
   * It then posts this data to the specified movie progress endpoint 
   * using the `apiService`.
   * 
   * @returns {void} This method does not return a value.
   */
  postMovieProgress(): void {
    let data = {
      movie_slug: this.data.movie.slug,
      progress_seconds: 0,
      finished: false,
    }
    console.log(data)
    this.apiService.postData(this.movieProgressEndpoint, data).subscribe()
  }

  /**
   * Determines the appropriate action label based on the user's watching status.
   *
   * @returns {string} - Returns 'Continue' if the user has a partially watched movie,
   *                     otherwise returns 'Play' for a new viewing session.
   */
  checkIfContinueToMovie(): string {
    return this.continueWatching ? 'Continue' : 'Play';
  }
}
