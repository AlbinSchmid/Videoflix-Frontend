import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, inject, Inject, Injectable } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import Hls from 'hls.js';

@Injectable({
  providedIn: 'root'
})
export class BrowseService {
  hlsMap = new Map<HTMLVideoElement, Hls>();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  loadHlsAndPlayWhenReady(video: HTMLVideoElement, movie_url: string, muted: boolean): void {
    if (isPlatformBrowser(this.platformId)) {
      video.muted = muted;
      const oldHls = this.hlsMap.get(video);
      oldHls?.destroy();
      if (Hls.isSupported() && isPlatformBrowser(this.platformId)) {
        let hls = new Hls();
        hls.loadSource(movie_url);
        hls.attachMedia(video);
        this.hlsMap.set(video, hls);
      } else if (video.canPlayType && video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = movie_url;
      }
    }
  }

  destroyHls(video: HTMLVideoElement): void {
    const hls = this.hlsMap.get(video);
    hls?.destroy();
    this.hlsMap.delete(video);
  }
}
