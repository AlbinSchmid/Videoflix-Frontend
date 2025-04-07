import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivateAccountComponent } from "../../../activate-account/activate-account.component";

@Component({
  selector: 'app-header',
  imports: [
    MatButtonModule,
    CommonModule,
    MatIconModule,
],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
@Input() login: boolean = false;
@Input() browse: boolean = false;
}
