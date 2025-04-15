import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { HeaderComponent } from '../shared/components/header/header.component';
import { ApiService } from '../shared/services/api.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CategoryComponent } from './category/category.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BrowseService } from '../shared/services/browse.service';
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
  router = inject(Router);
  browseService = inject(BrowseService);
  apiService = inject(ApiService);

  @ViewChild('backgroundMovie', { static: true }) backgroundMovieRef!: ElementRef<HTMLVideoElement>;

  hls?: Hls;

  movieSections: { genre: string; movies: any[] }[] = [];
  randomMovie: any = {};
  
  moviesEndpoint: string = 'movies/';
  video: HTMLVideoElement | undefined;

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
      this.sendGetRequest();
      this.getVideoElementAndMovieHlsUrl();
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
   * Sends a GET request to fetch movie data from the specified endpoint and processes the response.
   * The response is transformed into an array of movie sections, each containing a genre and its associated movies.
   * Filters out genres with no movies and maps the remaining data into a structured format.
   * Additionally, triggers the retrieval of a random movie.
   *
   * @returns {void} This method does not return a value.
   */
  sendGetRequest(): void {
    this.apiService.getData(this.moviesEndpoint).subscribe((response) => {
      this.movieSections = Object.entries(response as { [genre: string]: any[] })
        .filter(([_, movies]) => movies.length > 0)
        .map(([genre, movies]) => ({ genre, movies }));
    });
    this.getRandomMovie();
  }

  /**
  * Toggles the sound of the video element by muting or unmuting it.
  * If the video is currently muted, this method will unmute it, and vice versa.
  */
  toggleSoundOfMovie(): void {
    if (this.video) this.video.muted = !this.video.muted;
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
