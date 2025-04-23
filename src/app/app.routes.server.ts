import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'reset-password/:uid/:token',
    renderMode: RenderMode.Server
  },
  {
    path: 'activate/:uid/:token',
    renderMode: RenderMode.Server
  },
  {
    path: 'browse/watch/:slug',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
