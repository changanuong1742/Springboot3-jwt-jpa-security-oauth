import { Component } from '@angular/core';
import {SidebarComponent} from "./sidebar/sidebar.component";

@Component({
  selector: 'app-layout-guest',
  standalone: true,
  imports: [
    SidebarComponent
  ],
  templateUrl: './layout-guest.component.html',
  styleUrl: './layout-guest.component.scss'
})
export class LayoutGuestComponent {
}
