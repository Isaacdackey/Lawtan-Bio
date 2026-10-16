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
  readonly phoneNumber = '+221 77 765 76 56';
  readonly phoneRaw = '+221777657656';
  readonly email = 'lawtan@gmail.com';
}
