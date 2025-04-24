import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, HostListener, inject, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { ApiService } from '../shared/services/api.service';
import { MatIconModule } from '@angular/material/icon';
import { BrowseService } from '../shared/services/browse.service';
import { NotFoundComponent } from "../not-found/not-found.component";
import { LoadingComponent } from '../shared/components/loading/loading.component';
import { filter } from 'rxjs/operators';
import videojs, { VideoJsPlayer } from 'video.js';
import Hls from 'hls.js';
import 'videojs-thumbnails';


declare module 'video.js' {
  interface VideoJsPlayer {
    thumbnails?: (options: Record<string, { src: string }>) => void;
  }
}

@Component({
  selector: 'app-watch-movie',
  imports: [
    MatIconModule,
    CommonModule,
    NotFoundComponent,
    NotFoundComponent,
    LoadingComponent,
  ],
  templateUrl: './watch-movie.component.html',
  styleUrl: './watch-movie.component.scss'
})
export class WatchMovieComponent {
  browseService = inject(BrowseService);
  apiService = inject(ApiService);
  routerNavigation = inject(Router);
  activatedRouter = inject(ActivatedRoute);
  router = inject(Router);
  cdr = inject(ChangeDetectorRef);

  @ViewChild('movie', { static: false }) movieRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('videoHeader', { static: false }) headerRef!: ElementRef<HTMLElement>;
  @ViewChild('videoRefIOS', { static: false }) videoRefIOS!: ElementRef<HTMLElement>;

  player!: any;
  hls?: Hls;

  video: any = null;
  movieEndpoint: string = 'movie/';
  moviesProgressEndpoint: string = 'movies/progress/';
  movieProgressEndpoint: string = 'movie/progress/';

  progressMovie: any = {};
  movieTitle: string = ''
  showNotFound: boolean = false;
  showLoading: boolean = true;
  currentUrl = this.router.url

  
  /**
   * Constructs the WatchMovieComponent and initializes the router event subscription.
   * 
   * @param platformId - The platform identifier, injected to determine the current platform (e.g., browser or server).
   * 
   * The constructor sets up a subscription to the router's navigation events. It filters for `NavigationStart` events
   * where the URL has changed from the current URL. When such an event occurs, it triggers the `safeProgress` method
   * to handle any necessary actions before navigation.
   */
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.router.events
      .pipe(
        filter((e): e is NavigationStart => e instanceof NavigationStart && e.url !== this.currentUrl)
      )
      .subscribe(e => this.safeProgress());
  }

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
        const slug = this.activatedRouter.snapshot.paramMap.get('slug');
        if (slug) this.sendGetRequestProgessMovie(slug);
      }
    });
  }

  /**
 * Sends a GET request to retrieve movie progress and updates the component's state.
 *
 * @param slug - The unique identifier for the movie, used to construct the endpoint URL.
 *
 * This method performs the following actions:
 * - Constructs the endpoint URL using the provided slug.
 * - Sends a GET request to the API service to fetch movie progress data.
 * - Updates the `progressMovie` property with the response data.
 * - Sets the `movieTitle` property with the movie's title from the response.
 * - Updates the player's current playback time using the progress in seconds from the response.
 * - Calls `getVideoElementAndMovieHlsUrl` to handle further video setup.
 *
 * If an error occurs during the API request, it logs the error to the console.
 */
  sendGetRequestProgessMovie(slug: string): void {
    const slugEndpoint = this.movieProgressEndpoint + slug + '/';
    this.apiService.getData(slugEndpoint).subscribe(
      (res) => {
        this.handleTheResponse(res);
      },
      (err) => {
        this.showLoading = false;
        this.showNotFound = true;
      }
    )
  }

  /**
   * Handles the response from the API request for movie progress.
   * 
   * @param res - The response object containing movie progress data.
   * 
   * This method updates the component's state by setting the `showLoading` and `showNotFound` flags,
   * assigns the response data to `progressMovie`, and sets the `movieTitle` property.
   * It also calls `checkWhichVideoElementToSet` to determine which video element to use for playback.
   */
  handleTheResponse(res: any): void {
    this.showLoading = false;
    this.showNotFound = false;
    this.progressMovie = res;
    this.movieTitle = res.movie.title;
    setTimeout(() => {
      this.checkWhichVideoElementToSet();
    });
  }

  /**
   * Checks which video element to set based on the platform and initializes the video player accordingly.
   * 
   * If the platform is a browser, it sets up the Video.js player and loads the HLS stream.
   * If the platform is iOS, it sets the current time of the video element to the progress seconds.
   * 
   * @returns void
   */
  checkWhichVideoElementToSet(): void {
    if (this.movieRef) {
      let movieHlsUrl = this.progressMovie.movie.hls_url;
      this.video = this.movieRef.nativeElement;
      this.setVideoJsPLayer();
      setTimeout(() => {
        this.browseService.loadHlsAndPlayWhenReady(this.video, movieHlsUrl, false);
      });
    } else if (this.videoRefIOS) {
      this.video = this.videoRefIOS.nativeElement;
      this.video.currentTime = this.progressMovie.progress_seconds;
    }
  }

  /**
   * Initializes the Video.js player and sets up event listeners for fullscreen and user activity.
   * 
   * This method checks if the platform is a browser, sets the video player, and configures the player settings.
   * It also sets the current time of the video to the progress seconds and mutes the audio.
   * 
   * @returns void
   */
  setVideoJsPLayer(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.setVideoJsPlayer();
      this.player.currentTime(this.progressMovie.progress_seconds);
      this.player.muted(false);
      this.player.volume(0.3);
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
      language: 'en',
      controls: true,
      autoplay: true,
      responsive: true,
      muted: true,
      fluid: true,
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
   * Sends a PATCH request to update the movie progress for a specific slug.
   * 
   * @param data - The data to be sent in the PATCH request.
   * @param slug - The slug of the movie to be updated.
   * 
   * @remarks
   * This method constructs the endpoint URL using the provided slug and sends
   * the PATCH request using the `apiService`. If the request is successful,
   * it logs the response; otherwise, it logs an error.
   */
  sendPatchRequest(data: object, slug: string): void {
    const slugEndpoint = this.movieProgressEndpoint + slug + '/';
    this.showLoading = true;
    this.apiService.patchData(slugEndpoint, data).subscribe();
  }

  /**
   * Updates the progress of the video playback by calculating the current time, 
   * remaining time, and total duration of the video. The method then stores 
   * these values using the `setData` function.
   *
   * @remarks
   * This method retrieves the current playback time and duration from the video 
   * player instance (`this.player`) and calculates the remaining time. It 
   * converts the current time to seconds before passing the data to `setData`.
   */
  safeProgress(): void {
    let duration = this.video.duration;
    let currentTime = this.video.currentTime;
    let remainingTime = duration - currentTime;
    const seconds = Math.floor(currentTime);
    this.setData(seconds, remainingTime);
  }

  /**
   * Updates the progress data for the movie and sends a patch request to the server.
   *
   * @param seconds - The current progress in seconds.
   * @param remainingTime - The remaining time in seconds for the movie.
   *                        If the remaining time is less than 150 seconds, the movie is marked as finished.
   * 
   * @returns void
   */
  setData(seconds: number, remainingTime: number): void {
    let data = {
      progress_seconds: remainingTime < 5 ? 0 : seconds,
      finished: remainingTime < 5 ? true : false,
    }
    this.sendPatchRequest(data, this.progressMovie.movie.slug);
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

  /**
   * Lifecycle hook that is called when the component is destroyed.
   * Cleans up the HLS instance associated with the video element.
   * This ensures that resources are properly released and prevents memory leaks.
   */
  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent) {
    this.safeProgress();
  }
}
