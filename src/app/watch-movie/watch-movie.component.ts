import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, inject, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../shared/services/api.service';
import { MatIconModule } from '@angular/material/icon';
import videojs, { VideoJsPlayer } from 'video.js';
import Hls from 'hls.js';
import 'videojs-thumbnails';
import { BrowseService } from '../shared/services/browse.service';


declare module 'video.js' {
  interface VideoJsPlayer {
    thumbnails?: (options: Record<string, { src: string }>) => void;
  }
}

@Component({
  selector: 'app-watch-movie',
  imports: [
    MatIconModule,
    CommonModule
  ],
  templateUrl: './watch-movie.component.html',
  styleUrl: './watch-movie.component.scss'
})
export class WatchMovieComponent {
  browseService = inject(BrowseService);
  apiService = inject(ApiService);
  routerNavigation = inject(Router);
  router = inject(ActivatedRoute);
  cdr = inject(ChangeDetectorRef);

  player!: any;

  @ViewChild('movie', { static: false }) movieRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('videoHeader', { static: true }) headerRef!: ElementRef<HTMLElement>;

  hls?: Hls;

  video: any = null;
  movieEndpoint: string = 'movies/';
  movie: any = {};
  h3: string = ''


  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  /**
   * Lifecycle hook that is called after Angular has fully initialized the component's view.
   * 
   * This method performs the following actions:
   * - Uses a `setTimeout` to defer execution until the next JavaScript event loop cycle.
   * - Checks if the code is running in a browser environment using `isPlatformBrowser`.
   * - Retrieves the 'slug' parameter from the route's snapshot and sends a GET request using `sendGetRequest`.
   * - Initializes the Video.js player by calling `getVideoJsPLayerReady`.
   * 
   * Note: The `setTimeout` ensures that the operations are executed after the view is fully rendered.
   */
  ngAfterViewInit(): void {
    setTimeout(() => {
      if (isPlatformBrowser(this.platformId)) {
        const slug = this.router.snapshot.paramMap.get('slug');
        this.sendGetRequest(slug);
      }
      this.getVideoJsPLayerReady();
    });
  }

  /**
   * Retrieves the video element and the movie's HLS (HTTP Live Streaming) URL,
   * then initializes the video player with the specified settings and starts
   * loading and playing the video.
   *
   * @remarks
   * - Ensures the video element is obtained from the `movieRef` property.
   * - Configures the player's volume and mute settings.
   * - Delegates the loading and playback of the HLS stream to the `browseService`.
   *
   * @throws
   * This method assumes that `this.movieRef` and `this.movie.hls_url` are defined.
   * If `this.movieRef` is null or undefined, the method will not execute properly.
   */
  getVideoElementAndMovieHlsUrl(): void {
    if (this.movieRef) {
      this.player.muted(false);
      this.player.volume(1);
      let movieHlsUrl = this.movie.hls_url;
      this.video = this.movieRef.nativeElement;
      setTimeout(() => {
        this.browseService.loadHlsAndPlayWhenReady(this.video, movieHlsUrl, false);
      });
    }
  }

  /**
   * Initializes the Video.js player when the platform is a browser.
   * This method sets up the Video.js player instance, configures it, and attaches
   * event handlers for additional functionality such as modifying the header
   * in the fullscreen container and changing the header's opacity based on user activity.
   *
   * @returns {void}
   */
  getVideoJsPLayerReady(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.setVideoJsPlayer();
      this.player = videojs(this.movieRef.nativeElement) as any;
      this.player.ready(() => {
        this.putHeaderOfVideoInFullscreenContainer();
        this.changeHeaderOpacityOnUserActivity();
      });
    }
  }

  /**
   * Initializes the Video.js player instance with the specified configuration.
   * The player is attached to the native HTML element referenced by `movieRef`.
   * 
   * Configuration options:
   * - `controls`: Enables player controls.
   * - `autoplay`: Automatically starts playback when the player is ready.
   * - `muted`: Starts playback with the audio muted.
   * - `fluid`: Makes the player responsive to the container's size.
   * 
   * @returns void
   */
  setVideoJsPlayer(): void {
    this.player = videojs(this.movieRef.nativeElement, {
      controls: true,
      autoplay: true,
      muted: true,
      fluid: true
    }) as VideoJsPlayer;
  }

  /**
   * Moves the header element into the fullscreen container when the video player enters fullscreen mode,
   * and restores it to the original container when exiting fullscreen mode.
   *
   * This method listens for the `fullscreenchange` event on the video player and dynamically appends
   * the header element to the appropriate container based on the fullscreen state.
   *
   * @remarks
   * - The header element is referenced using `this.headerRef.nativeElement`.
   * - The fullscreen container is identified by the `.vjs-fullscreen` class.
   * - The original container is identified by the `.video-js-container` class.
   *
   * @returns void
   */
  putHeaderOfVideoInFullscreenContainer(): void {
    this.player.on('fullscreenchange', () => {
      const isFullscreen = this.player.isFullscreen();
      const headerEl = this.headerRef.nativeElement;
      if (isFullscreen) {
        const fsContainer = document.querySelector('.vjs-fullscreen');
        fsContainer?.appendChild(headerEl);
      } else {
        const container = document.querySelector('.video-js-container');
        container?.appendChild(headerEl);
      }
    });
  }

  /**
   * Adjusts the opacity and pointer events of the header element based on user activity.
   * 
   * This method listens for `userinactive` and `useractive` events from the video player.
   * When the user becomes inactive, the header's opacity is set to `0` and pointer events
   * are disabled. When the user becomes active, the header's opacity is restored to `1`
   * and pointer events are re-enabled.
   * 
   * @returns {void}
   */
  changeHeaderOpacityOnUserActivity(): void {
    this.player.on('userinactive', () => {
      this.headerRef.nativeElement.style.opacity = '0';
      this.headerRef.nativeElement.style.pointerEvents = 'none';
    });
    this.player.on('useractive', () => {
      this.headerRef.nativeElement.style.opacity = '1';
      this.headerRef.nativeElement.style.pointerEvents = 'auto';
    });
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
          this.h3 = res.title;
          this.getVideoElementAndMovieHlsUrl();
        },
        (err) => {
          console.error(err);
        }
      )
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
