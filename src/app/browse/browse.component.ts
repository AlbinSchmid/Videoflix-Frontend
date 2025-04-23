import { ChangeDetectorRef, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { HeaderComponent } from '../shared/components/header/header.component';
import { ApiService } from '../shared/services/api.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CategoryComponent } from './category/category.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BrowseService } from '../shared/services/browse.service';
import videojs from 'video.js';
import Hls from 'hls.js';
import { WindowService } from '../shared/services/window.service';

@Component({
  selector: 'app-browse',
  imports: [
    HeaderComponent,
    MatButtonModule,
    MatIconModule,
    CategoryComponent,
    FormsModule,
    CommonModule,
    CategoryComponent
  ],
  templateUrl: './browse.component.html',
  styleUrl: './browse.component.scss'
})
export class BrowseComponent {
  router = inject(Router);
  browseService = inject(BrowseService);
  apiService = inject(ApiService);
  windowService = inject(WindowService);
  cdr = inject(ChangeDetectorRef);
  @ViewChild('backgroundMovie', { static: true }) backgroundMovieRef!: ElementRef<HTMLVideoElement>;

  movieSections: { genre: string; movies: any[] }[] = [];
  continueWatching: { genre: string; movies: any[] }[] = [];
  randomMovie: any = {};

  hls?: Hls;
  player!: any;

  moviesEndpoint: string = 'movies/';
  movieProgressEndpoint: string = 'movies/progress/';
  video: any = null;
  windowWidth: number = 0;


  /**
   * Lifecycle hook that is called after Angular has initialized the component.
   * Subscribes to the `width$` observable from the `WindowService` to update the
   * `windowWidth` property whenever the window width changes.
   */
  ngOnInit(): void {
    this.windowService.width.subscribe(width => {
      this.windowWidth = width;
    });
  }

  /**
   * Lifecycle hook that is called after Angular has fully initialized the component's view.
   * This method sets a timeout to perform two actions:
   * 1. Sends a GET request by invoking the `sendGetRequest` method.
   * 2. Retrieves the video element and initializes the movie's HLS (HTTP Live Streaming) URL
   *    by calling the `getVideoElementAndMovieHlsUrl` method with the `hls_url` of the random movie.
   * 
   * Note: The use of `setTimeout` ensures these actions are executed after the view initialization
   *       is complete, allowing any necessary DOM elements to be available.
   */
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.loadMovieLists();
    });
  }

  /**
   * Retrieves the video element from the background movie reference and loads the provided HLS URL for playback.
   * If the `backgroundMovieRef` is defined, it assigns the native video element to the `video` property
   * and uses the `browseService` to load and play the HLS stream when ready.
   *
   * @param movieHlsUrl - The URL of the HLS stream to be loaded and played.
   */
  getVideoElementAndMovieHlsUrl(): void {
    if (this.backgroundMovieRef) {
      let movieHlsUrl = this.randomMovie.hls_url;
      this.video = this.backgroundMovieRef.nativeElement;
      this.browseService.loadHlsAndPlayWhenReady(this.video, movieHlsUrl, true);
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (nav?.type !== 'reload') {
        setTimeout(() => {
          this.video.muted = false;
        });
      }
    }
  }

  /**
 * Lifecycle hook that is called when the component is destroyed.
 * Cleans up resources by destroying the HLS instance if it exists.
 */
  ngOnDestroy(): void {
    if (this.video) this.browseService.destroyHls(this.video);
  }

  /**
   * Selects a random movie from the available movie sections and assigns it to the `randomMovie` property.
   * 
   * The method first ensures that there are movie sections available. If so, it randomly selects a movie
   * section and then randomly selects a movie from that section.
   * 
   * @remarks
   * - If `movieSections` is empty, the method does nothing.
   * - The randomness is achieved using `Math.random()` to generate indices for both the section and the movie.
   * 
   * @example
   * // Assuming `movieSections` is populated with categories and movies:
   * this.getRandomMovie();
   */
  getRandomMovie(): void {
    if (this.movieSections.length != 0) {
      let randomIndex = Math.floor(Math.random() * this.movieSections.length);
      let randomCategory = this.movieSections[randomIndex];
      let randomMovieIndex = Math.floor(Math.random() * randomCategory.movies.length);
      this.randomMovie = randomCategory.movies[randomMovieIndex];
      this.stopVideoAt30Seconds();
      this.getVideoElementAndMovieHlsUrl();
    }
  }

  /**
   * Stops the video playback when it reaches 30 seconds.
   * 
   * This method initializes a Video.js player instance using the `backgroundMovieRef` element,
   * sets the player's volume to 5%, and listens for the `timeupdate` event. When the video's
   * current playback time reaches or exceeds 30 seconds, the video is paused automatically.
   * 
   * @remarks
   * Ensure that the `backgroundMovieRef` is properly initialized and points to a valid video element.
   * The `videojs` library must also be included and properly configured in the project.
   */
  stopVideoAt30Seconds(): void {
    this.player = videojs(this.backgroundMovieRef.nativeElement) as any;
    this.player.volume(0.05);
    this.player.ready(() => {
      setTimeout(() => {
        this.player.dimensions('100%', '100%');
      }, 100);
    });
    this.player.on('timeupdate', () => {
      if (this.player.currentTime() >= 30) {
        this.player.pause();
      }
    });
  }

  /**
   * Loads movie lists from the API and organizes them into different sections.
   * 
   * This method fetches data from the specified movies endpoint and processes
   * the response to categorize movies into two main sections:
   * - `movieSections`: Contains movies grouped by genres, excluding "continue_watching" 
   *   and "watched" genres, and only includes genres with at least one movie.
   * - `continueWatching`: Contains movies from the "continue_watching" and "watched" 
   *   genres, provided they have at least one movie.
   * 
   * After organizing the movies, it selects a random movie using the `getRandomMovie` method.
   * 
   * @returns {void} This method does not return a value.
   */
  loadMovieLists(): void {
    this.apiService.getData(this.moviesEndpoint).subscribe((response) => {
      this.movieSections = Object.entries(response as { [genre: string]: any[] })
        .filter(([genre, movies]) => genre != 'continue_watching' && genre != 'watched' && movies.length > 0)
        .map(([genre, movies]) => ({ genre, movies }));
      this.continueWatching = Object.entries(response as { [genre: string]: any[] })
        .filter(([genre, movies]) => (genre == 'continue_watching' || genre == 'watched') && movies.length > 0)
        .map(([genre, movies]) => ({ genre, movies }));
      this.getRandomMovie();
      this.cdr.detectChanges();
    });
  }

  /**
  * Toggles the sound of the video element by muting or unmuting it.
  * If the video is currently muted, this method will unmute it, and vice versa.
  */
  toggleSoundOfMovie(event?: boolean): void {
    if (this.video) {
      this.video.muted = !this.video.muted
      if (event) this.video.muted = true;
    }
  }

  /**
   * Navigates to the "watch" component for a randomly selected movie.
   * Constructs the route using the base path '/browse/watch' and the slug
   * of the randomly selected movie.
   *
   * @returns {void}
   */
  navigateToWatchComponent(): void {
    this.postMovieProgress();
    this.router.navigate(['/browse/watch', this.randomMovie.slug]);
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
      movie_slug: this.randomMovie.slug,
      progress_seconds: 0,
      finished: false,
    }
    this.apiService.postData(this.movieProgressEndpoint, data).subscribe();
  }
}
