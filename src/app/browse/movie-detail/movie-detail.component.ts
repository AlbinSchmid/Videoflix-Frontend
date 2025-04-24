import { CommonModule } from '@angular/common';
import { Component, CSP_NONCE, ElementRef, inject, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { BrowseService } from '../../shared/services/browse.service';
import { ApiService } from '../../shared/services/api.service';
import videojs, { VideoJsPlayer } from 'video.js';
import { WindowService } from '../../shared/services/window.service';

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
  windowService = inject(WindowService)
  apiService = inject(ApiService);
  browseService = inject(BrowseService);
  dialogRef = inject(MatDialogRef<MovieDetailComponent>);
  router = inject(Router);
  data = inject(MAT_DIALOG_DATA);

  movieProgressEndpoint: string = 'movies/progress/';
  movieDuration: string = '';
  title: string = '';
  releaseYear: string = '';
  description: string = '';
  author: string = '';
  authorUrl: string = '';
  license: string = '';
  licenseUrl: string = '';
  continueWatching: boolean = false;
  alreadyWatched: boolean = false;
  loading: boolean = true;

  @ViewChild('videoRef', { static: false }) videoElementRef!: ElementRef<HTMLVideoElement>;

  video: HTMLVideoElement | undefined;
  player!: any;
  windowWidth: number = 0;


  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound properties of a directive.
   * Subscribes to the `width` observable from the `windowService` to update the `windowWidth` property
   * whenever the window width changes.
   */
  ngOnInit(): void {
    this.windowService.width.subscribe(width => {
      this.windowWidth = width;
    });
  }

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
      this.setVideoElement();
      this.loadMoviesProgress();
      this.setStringsFromData();
    });
  }

  /**
   * Sets the properties of the component based on the provided data.
   * This method extracts relevant information from the `data` object
   * and assigns it to the component's properties for display in the template.
   *
   * @remarks
   * The `data` object is expected to contain a `movie` property with various
   * attributes such as title, release year, description, author, license,
   * and their respective URLs.
   *
   * @returns {void} This method does not return a value.
   */
  setStringsFromData(): void {
    this.title = this.data.movie.title;
    this.releaseYear = this.data.movie.release_year;
    this.description = this.data.movie.description;
    this.author = this.data.movie.author;
    this.authorUrl = this.data.movie.author_url;
    this.license = this.data.movie.license;
    this.licenseUrl = this.data.movie.license_url;
  }

  /**
   * Loads the movie progress from the server by making an API call to the specified endpoint.
   * It subscribes to the response and calls the `filterResponse` method to process the data.
   *
   * @remarks
   * The `loading` property is set to true while the data is being fetched,
   * and it is set to false once the data has been processed or if an error occurs.
   *
   * @returns {void} This method does not return a value.
   */
  loadMoviesProgress(): void {
    this.apiService.getData(this.movieProgressEndpoint).subscribe(
      (response) => {
        this.filterResponse(response);
      },
      (error) => {
        this.loading = false;
      }
    )
  }

  /**
   * Filters the response data to check if the current movie is already watched or in progress.
   * It updates the `continueWatching` and `allreadyWatched` flags based on the response data.
   *
   * @param response - The response data from the API call.
   *                  It is expected to be an array of objects with properties `id` and `finished`.
   *
   * @returns {void} This method does not return a value.
   */
  filterResponse(response: any): void {
    if (response) {
      const movieDetailId = this.data.movie.id
      const existContinue = response.some((item: any) => item.movie.id === movieDetailId && item.finished === false);
      const existFinished = response.some((item: any) => item.movie.id === movieDetailId && item.finished === true);
      existContinue ? this.continueWatching = true : this.continueWatching = false;
      existFinished ? this.alreadyWatched = true : this.alreadyWatched = false;
    }
    this.loading = false;
  }

  /**
   * Sets the video element by accessing the native element reference.
   * It checks if the platform is iOS and plays the video accordingly.
   * If not on iOS, it sets up the HLS stream and initializes the player.
   *
   * @remarks
   * This method is called after the view has been initialized to ensure that
   * the video element is available in the DOM. It also calls `getMovieDurationFormat`
   * to format the movie duration once the metadata is loaded.
   */
  setVideoElement(): void {
    this.video = this.videoElementRef.nativeElement;
    if (this.videoElementRef && this.browseService.onIOS) {
      this.video.play();
      this.getMovieDurationFormat();
      if (this.video.currentTime >= 30) {
        this.video.pause();
      }
    } else if (this.videoElementRef && !this.browseService.onIOS) {
      let movieHlsUrl = this.data.movie.hls_url;
      this.setPlayerAndResumeVolumeAndPauseAt30Sec();
      this.browseService.loadHlsAndPlayWhenReady(this.video, movieHlsUrl, false);
      this.getMovieDurationFormat();
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
   * Formats the movie duration by listening to the 'loadedmetadata' event of the video element.
   * It calculates the duration in hours and minutes and updates the `movieDuration` property.
   *
   * @remarks
   * This method is called when the video metadata is loaded to ensure that the duration is available.
   */
  getMovieDurationFormat(): void {
    if (this.video) {
      this.video.addEventListener('loadedmetadata', () => {
        let seconds = 0;
        if (this.video) seconds = this.video.duration;
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const hStr = h > 0 ? `${h} Std. ` : '';
        const mStr = `${m} min.`;
        this.movieDuration = hStr + mStr;
      });
    };
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
    if (!this.continueWatching && !this.alreadyWatched) this.postMovieProgress();
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
    this.apiService.postData(this.movieProgressEndpoint, data).subscribe();
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
