import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, inject, Inject, Injectable } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import Hls from 'hls.js';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BrowseService {
  qualityMenuToggle$ = new Subject<boolean>();
  hlsMap = new Map<HTMLVideoElement, Hls>();
  platformId = inject(PLATFORM_ID);
  onIOS = false;
  availableQualities: { label: string, levelIndex: number }[] = [];
  hls!: Hls;
  showQualityMenu = false;
  activeQuality = -1;
  canChangeQuality = true;
  video: any;

  isIOS(): boolean {
    const isMSStream = typeof (window as any).MSStream !== 'undefined';
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !isMSStream;
  }

  /**
   * Loads an HLS stream and plays the video when ready.
   * If the platform is a browser, this method ensures the video is muted (if specified),
   * destroys any existing HLS instance associated with the video element, and checks
   * if HLS is supported before attempting to load the stream.
   *
   * @param video - The HTMLVideoElement where the HLS stream will be loaded and played.
   * @param movie_url - The URL of the movie or video stream to be loaded.
   * @param muted - A boolean indicating whether the video should be muted.
   */
  loadHlsAndPlayWhenReady(video: HTMLVideoElement, movie_url: string, muted: boolean): void {
    if (isPlatformBrowser(this.platformId)) {
      video.muted = muted;
      const oldHls = this.hlsMap.get(video);
      oldHls?.destroy();
      this.checkIfHlsSupported(video, movie_url);
    }
  }

  /**
   * Checks if HLS (HTTP Live Streaming) is supported in the current environment and sets up the video playback accordingly.
   * 
   * If HLS is supported and the platform is a browser, it initializes an Hls instance, loads the provided video source,
   * and attaches it to the given HTMLVideoElement. The Hls instance is then stored in a map for future reference.
   * 
   * If HLS is not supported but the video element can play HLS natively (e.g., on Safari), it directly sets the video source.
   * 
   * @param video - The HTMLVideoElement where the video will be played.
   * @param movie_url - The URL of the video to be played.
   */
  checkIfHlsSupported(video: HTMLVideoElement, movie_url: string): void {
    if (Hls.isSupported() && isPlatformBrowser(this.platformId)) {
      this.hls = new Hls();
      this.hls.loadSource(movie_url);
      this.hls.attachMedia(video);
      this.hlsMap.set(video, this.hls);
      this.getAvailableQualities();
    } else if (video.canPlayType && video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = movie_url;
    }
  }

  /**
   * Retrieves the available video quality levels from the HLS manifest and stores them in the `availableQualities` property.
   * 
   * This method listens for the `MANIFEST_PARSED` event emitted by the HLS instance. When the event is triggered, it extracts
   * the quality levels from the parsed manifest and maps them into an array of objects containing the quality label (e.g., "720p")
   * and the corresponding level index. Additionally, an "Auto" option is prepended to the list with a level index of -1.
   * 
   * @remarks
   * - The `availableQualities` property is expected to be defined in the class where this method is used.
   * - The `Hls` instance must be properly initialized and configured before calling this method.
   * 
   * @example
   * // Example structure of `availableQualities` after execution:
   * [
   *   { label: 'Auto', levelIndex: -1 },
   *   { label: '1080p', levelIndex: 0 },
   *   { label: '720p', levelIndex: 1 },
   *   { label: '480p', levelIndex: 2 }
   * ]
   */
  getAvailableQualities(): void {
    this.hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
      this.availableQualities = data.levels.map((level: any, index: number) => ({
        label: level.height + 'p',
        levelIndex: index
      }));
      this.availableQualities.unshift({ label: 'Auto', levelIndex: -1 });
    });
  }

  /**
   * Sets the quality level for the video playback.
   * 
   * @param levelIndex - The index of the desired quality level to set.
   *                     This corresponds to the available quality levels
   *                     provided by the HLS instance.
   * 
   * If an HLS instance is available, the method updates the `nextLevel`
   * property of the HLS instance to the specified quality level index.
   * Additionally, it hides the quality menu by setting `showQualityMenu` to `false`.
   */
  setQuality(levelIndex: number): void {
    if (this.hls && this.canChangeQuality) {
      this.checkIfWeCanChangeQuality(levelIndex);
      this.canChangeQuality = false;
      setTimeout(() => {
        this.canChangeQuality = true;
      }, 2500);
    } else {
      console.warn('Wechsel zu schnell, bitte warten...');
    }
    this.showQualityMenu = false;
  }

  /**
   * Checks if the video player can change the quality level to the specified index.
   * If the video has sufficient data buffered (readyState >= 2), the quality level is updated.
   * Otherwise, it logs a warning, stops the current buffer loading process, and restarts it.
   *
   * @param levelIndex - The index of the desired quality level to switch to.
   */
  checkIfWeCanChangeQuality(levelIndex: number): void {
    if (this.video.readyState >= 2) { // Video hat genug Daten
      this.hls.nextLevel = levelIndex;
      this.activeQuality = levelIndex;
    } else {
      console.warn('Video nicht bereit, Buffer wird neu gestartet');
      this.hls.stopLoad();
      this.hls.startLoad();
    }
  }

  /**
   * Destroys the HLS instance associated with the given video element and removes it from the internal map.
   *
   * @param video - The HTMLVideoElement for which the HLS instance should be destroyed.
   */
  destroyHls(video: HTMLVideoElement): void {
    const hls = this.hlsMap.get(video);
    hls?.destroy();
    this.hlsMap.delete(video);
  }
}
