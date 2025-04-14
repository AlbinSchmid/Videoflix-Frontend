import { ChangeDetectorRef, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { HeaderComponent } from '../shared/components/header/header.component';
import { ApiService } from '../shared/services/api.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CategoryComponent } from './category/category.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Inject } from '@angular/core';
import { Router } from '@angular/router';
import Hls from 'hls.js';

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
  router = inject(Router)
  apiService = inject(ApiService);
  cdr = inject(ChangeDetectorRef);

  @ViewChild('backgroundMovie', { static: true }) backgroundMovie!: ElementRef<HTMLVideoElement>;
  
  hls?: Hls;
  
  moviesEndpoint: string = 'movies/';

  movieSections: any[] = [];
  randomMovie: any = {};

  video: any = null;


  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  /**
   * Lifecycle hook that is called after Angular has fully initialized
   * the component's view. This method performs the following actions:
   * 
   * - Sends an HTTP GET request by invoking `sendGetRequest()`.
   * - Retrieves a random movie by calling `getRandomMovie()`.
   * - If a random movie is available and the platform is a browser:
   *   - Initializes the `video` element with the `backgroundMovie` reference.
   *   - Mutes the video element.
   *   - Triggers change detection to ensure the view is updated.
   *   - Loads the movie and plays it when the HLS (HTTP Live Streaming) source is ready.
   * 
   * @remarks
   * This method relies on the `randomMovie` object to provide the HLS URL
   * and assumes that the `backgroundMovie` is a valid `ElementRef` pointing
   * to a video element in the DOM.
   * 
   * @throws Will throw an error if `randomMovie` or `backgroundMovie` is undefined.
   */
  ngAfterViewInit() {
    this.sendGetRequest();
    this.getRandomMovie();
    console.log(this.movieSections)

    let movie_url = this.randomMovie.hls_url;
    if (this.backgroundMovie && isPlatformBrowser(this.platformId)) {
      this.video = this.backgroundMovie.nativeElement;
      this.video.muted = true;
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
    if (Hls.isSupported() && isPlatformBrowser(this.platformId)) {
      this.hls?.destroy();
      this.hls = new Hls();

      this.hls.loadSource(movie_url);
      this.hls.attachMedia(this.video);
    } else if (this.video.canPlayType && this.video.canPlayType('application/vnd.apple.mpegurl')) {
      this.video.src = movie_url;
    }
  }

  /**
 * Lifecycle hook that is called when the component is destroyed.
 * Cleans up resources by destroying the HLS instance if it exists.
 */
  ngOnDestroy(): void {
    this.hls?.destroy();
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
   * console.log(this.randomMovie); // Logs a randomly selected movie object.
   */
  getRandomMovie(): void {
    if (this.movieSections.length != 0) {
      let randomIndex = Math.floor(Math.random() * this.movieSections.length);
      let randomCategory = this.movieSections[randomIndex];
      let randomMovieIndex = Math.floor(Math.random() * randomCategory.movies.length);
      this.randomMovie = randomCategory.movies[randomMovieIndex];
    }
  }

  /**
   * Sends a GET request to fetch movie data from the specified endpoint.
   * The response is processed to extract movie sections grouped by genre,
   * filtering out genres with no movies. The processed data is stored in
   * the `movieSections` property.
   *
   * @remarks
   * - The `apiService.getData` method is used to perform the GET request.
   * - The response is expected to be an object where keys are genres and
   *   values are arrays of movies.
   * - Genres with empty movie arrays are excluded from the result.
   *
   * @throws
   * Logs an error to the console if the GET request fails.
   */
  sendGetRequest() {
    this.apiService.getData(this.moviesEndpoint).subscribe(
      (response) => {
        this.movieSections = Object.entries(response as { [genre: string]: any[] })
          .filter(([_, movies]) => movies.length > 0)
          .map(([genre, movies]) => ({ genre, movies }));
      },
      (error) => {
        console.error('GET request failed:', error);
      }
    )
  }

  /**
  * Toggles the sound of the video element by muting or unmuting it.
  * If the video is currently muted, this method will unmute it, and vice versa.
  */
  toggleSoundOfMovie(): void {
    this.video.muted = !this.video.muted;
  }

  /**
   * Navigates to the "watch" component for a randomly selected movie.
   * Constructs the route using the base path '/browse/watch' and the slug
   * of the randomly selected movie.
   *
   * @returns {void}
   */
  navigateToWatchComponent(): void {
    this.router.navigate(['/browse/watch', this.randomMovie.slug])
  }
}
