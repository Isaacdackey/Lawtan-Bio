import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact-info.component.html',
  styleUrl: './contact-info.component.css'
})
export class ContactInfoComponent {
  readonly phoneNumber = '+221 77 765 56 48';
  readonly phoneRaw = '+221777655648';
  readonly email = 'lawtan@gmail.com';
}
