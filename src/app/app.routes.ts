import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { LogInComponent } from './log-in/log-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ActivateAccountComponent } from './activate-account/activate-account.component';
import { BrowseComponent } from './browse/browse.component';
import { WatchMovieComponent } from './watch-movie/watch-movie.component';
import { AuthGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
    {path: '', component: LandingPageComponent},
    {path: 'login', component: LogInComponent},
    {path: 'registration', component: SignUpComponent},
    {path: 'forgot-password', component: ForgotPasswordComponent},
    {path: 'reset-password/:uid/:token', component: ResetPasswordComponent},
    {path: 'activate/:uid/:token', component: ActivateAccountComponent},
    {path: 'browse', component: BrowseComponent, canActivate: [AuthGuard]},
    {path: 'browse/watch/:slug', component: WatchMovieComponent, canActivate: [AuthGuard]},
];
