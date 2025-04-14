import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, inject, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../shared/services/api.service';
import Hls from 'hls.js';
import 'videojs-thumbnails';
import videojs, { VideoJsPlayer } from 'video.js';

declare module 'video.js' {
  interface VideoJsPlayer {
    thumbnails?: (options: Record<string, { src: string }>) => void;
  }
}

@Component({
  selector: 'app-watch-movie',
  imports: [],
  templateUrl: './watch-movie.component.html',
  styleUrl: './watch-movie.component.scss'
})
export class WatchMovieComponent {
  apiService = inject(ApiService);
  router = inject(ActivatedRoute);
  cdr = inject(ChangeDetectorRef);

  player!: VideoJsPlayer;

  @ViewChild('movie', { static: false }) movieRef!: ElementRef<HTMLVideoElement>;

  hls?: Hls;


  video: any = null;

  movieEndpoint: string = 'movies/';

  movie: any = {};


  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  /**
   * Lifecycle hook that is called after the component is initialized.
   * This method checks if the code is running in a browser environment
   * and retrieves the 'slug' parameter from the route's snapshot.
   * It then sends a GET request using the retrieved slug.
   */
  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const slug = this.router.snapshot.paramMap.get('slug');
      this.sendGetRequest(slug);
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.player = videojs(this.movieRef.nativeElement, {
        controls: true,
        autoplay: true,
        muted: true,
        fluid: true
      }) as VideoJsPlayer;

      // (this.player as any).ready(() => {
      //   (this.player as any).thumbnails({
      //     0: {src: 'assets/thumbs/0000.jpg'},
      //     10: {src: 'assets/thumbs/0010.jpg'},
      //     20: {src: 'assets/thumbs/0020.jpg'},
      //   });
      // });
    }
  }

  /**
   * Sends a GET request to fetch movie data using the provided slug.
   * If the slug is valid, it retrieves the movie data from the API and assigns it to the `movie` property.
   * Once the data is retrieved, it triggers the process to load and play the movie when HLS is ready.
   * Logs an error to the console if the request fails.
   *
   * @param slug - The unique identifier for the movie. Can be a string or null.
   */
  sendGetRequest(slug: string | null) {
    if (slug) {
      this.apiService.getDataWithSlug(this.movieEndpoint, slug).subscribe(
        (res) => {
          this.movie = res;
          this.laodMovieAndPlayWhenHlsReady();
        },
        (err) => {
          console.error(err);
        }
      )
    }
  }

  /**
   * Loads the movie and plays it when HLS is ready.
   * This method checks if the movie reference and HLS URL are available,
   * then initializes the video element and calls the method to load and play the movie.
   * It also sets the video element to be unmuted and triggers change detection.
   */
  laodMovieAndPlayWhenHlsReady(): void {
    let movie_url = this.movie.hls_url;
    if (this.movieRef && movie_url) {
      console.log(movie_url);
      this.video = this.movieRef.nativeElement;
      this.video.muted = false;
      this.cdr.detectChanges();
      this.ifHlsReadyLoadAndPlay(movie_url);
    }
  }

  /**
   * Loads and plays a movie using HLS (HTTP Live Streaming) if supported.
   * If HLS is not supported but the browser can play HLS natively, it sets the video source directly.
   *
   * @param movie_url - The URL of the movie to be loaded and played.
   * 
   * @remarks
   * - This method checks if HLS is supported and the platform is a browser.
   * - If HLS is supported, it initializes an HLS instance, destroys any existing instance,
   *   loads the movie source, and attaches it to the video element.
   * - If HLS is not supported but the browser can natively play HLS streams, it directly sets
   *   the video element's source to the provided URL.
   * 
   * @requires Hls - The HLS.js library must be available for this method to work.
   * @requires isPlatformBrowser - A utility function to check if the code is running in a browser environment.
   * 
   * @throws This method does not explicitly throw errors but relies on the HLS.js library and browser capabilities.
   */
  ifHlsReadyLoadAndPlay(movie_url: string): void {
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
   * Cleans up the video player instance by disposing of it if it exists.
   * This ensures that resources are properly released and prevents memory leaks.
   */
  ngOnDestroy(): void {
    if (this.player) {
      (this.player as any).dispose();
    }
  }
}
