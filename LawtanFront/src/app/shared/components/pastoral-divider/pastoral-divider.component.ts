import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pastoral-divider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pastoral-divider.component.html',
  styleUrl: './pastoral-divider.component.css'
})
export class PastoralDividerComponent {
  @Input() label: string = 'Pâturages & Transhumance • Terroir de Dagana';
  @Input() variant: 'sheep' | 'cows' | 'mixed' = 'sheep';
  @Input() speedSeconds: number = 24;
}
