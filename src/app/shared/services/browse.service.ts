import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, inject, Inject, Injectable } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import Hls from 'hls.js';

@Injectable({
  providedIn: 'root'
})
export class BrowseService {
  hlsMap = new Map<HTMLVideoElement, Hls>();
  platformId = inject(PLATFORM_ID);
  onIOS = false;

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
      let hls = new Hls();
      hls.loadSource(movie_url);
      hls.attachMedia(video);
      this.hlsMap.set(video, hls);
    } else if (video.canPlayType && video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = movie_url;
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
