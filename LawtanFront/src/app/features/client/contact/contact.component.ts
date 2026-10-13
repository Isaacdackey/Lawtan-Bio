import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PublicHeaderComponent } from '../../../shared/components/public-header/public-header.component';
import { PublicFooterComponent } from '../../../shared/components/public-footer/public-footer.component';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    PublicHeaderComponent,
    PublicFooterComponent,
    RevealDirective
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  isSubmitting = signal<boolean>(false);
  isSubmitted = signal<boolean>(false);
  submittedData = signal<any>(null);

  contactForm: FormGroup;

  readonly engagements = [
    {
      titre: 'Réponse Rapide Garantie',
      desc: 'Retour sous 24h ouvrées par appel ou WhatsApp direct.',
      icon: 'clock'
    },
    {
      titre: 'Disponibilité & Proximité',
      desc: 'Équipe basée à Dagana, interventions sur toute la région du Fleuve.',
      icon: 'map-pin'
    },
    {
      titre: 'Conseil Agricole & Laitier',
      desc: 'Accompagnement par des techniciens agronomes et vétérinaires.',
      icon: 'shield-check'
    }
  ];

  readonly faqs = [
    {
      question: 'Où se situe exactement la ferme LAWTAN ?',
      reponse: 'Notre exploitation principale et nos parcelles fourragères sont situées dans le département de Dagana (Région de Saint-Louis, Sénégal), au cœur du bassin agricole du Fleuve.'
    },
    {
      question: 'Peut-on visiter l’exploitation et les installations ?',
      reponse: 'Oui, nous accueillons des visites professionnelles, des groupements d’éleveurs et des partenaires institutionnels sur rendez-vous préalable via ce formulaire ou par téléphone.'
    },
    {
      question: 'Quels sont vos délais d’intervention pour les devis ?',
      reponse: 'Nous traitons l’ensemble des demandes sous 24h à 48h ouvrées. Pour les urgences, notre ligne directe et notre WhatsApp restent prioritaires.'
    }
  ];

  faqOuverte = signal<number | null>(0);

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      organization: [''],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9+ ]{8,18}$/)]],
      email: ['', [Validators.required, Validators.email]],
      locality: ['', [Validators.required]],
      subject: ['', [Validators.required, Validators.minLength(3)]],
      message: ['', [Validators.required, Validators.minLength(10)]],
      termsAccepted: [true, [Validators.requiredTrue]]
    });
  }

  toggleFaq(index: number): void {
    if (this.faqOuverte() === index) {
      this.faqOuverte.set(null);
    } else {
      this.faqOuverte.set(index);
    }
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    setTimeout(() => {
      this.submittedData.set({
        ...this.contactForm.value,
        submissionDate: new Date()
      });
      this.isSubmitting.set(false);
      this.isSubmitted.set(true);
    }, 600);
  }

  resetForm(): void {
    this.contactForm.reset({ termsAccepted: true });
    this.isSubmitted.set(false);
    this.submittedData.set(null);
  }

  isFieldInvalid(field: string): boolean {
    const ctrl = this.contactForm.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }
}
