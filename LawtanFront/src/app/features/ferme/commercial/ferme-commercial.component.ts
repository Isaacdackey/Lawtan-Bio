import { Component, inject, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FermeMockService } from '../services/ferme-mock.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CommandeLait, StatutCommande, TypeClient } from '../models/vente.model';

@Component({
  selector: 'app-ferme-commercial',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './ferme-commercial.component.html',
  styleUrl: './ferme-commercial.component.css'
})
export class FermeCommercialComponent {
  fermeService = inject(FermeMockService);
  notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);

  modalCommandeOuvert = signal<boolean>(false);
  enregistrementEnCours = signal<boolean>(false);
  formCommande!: FormGroup;

  modalAvisOuvert = signal<boolean>(false);
  commandePourAvis = signal<CommandeLait | null>(null);
  formAvis!: FormGroup;

  filtreStatut = signal<'tous' | 'en_cours' | 'termines'>('tous');

  readonly statutCommandeLabels: Record<StatutCommande, string> = {
    en_attente: 'En attente',
    en_livraison: 'En livraison',
    livre: 'Livré',
    paye: 'Payé',
    annule: 'Annulé'
  };

  readonly typeClientLabels: Record<TypeClient, string> = {
    marche_local: 'Marché local',
    restaurant: 'Restaurant',
    hotel: 'Hôtel',
    supermarche: 'Supermarché',
    particulier: 'Particulier'
  };

  readonly commandesFiltrees = computed(() => {
    const list = this.fermeService.commandesLait();
    const f = this.filtreStatut();
    if (f === 'en_cours') {
      return list.filter(c => c.statut === 'en_attente' || c.statut === 'en_livraison');
    }
    if (f === 'termines') {
      return list.filter(c => c.statut === 'livre' || c.statut === 'paye');
    }
    return list;
  });

  constructor() {
    this.formCommande = this.fb.group({
      clientNom: ['', [Validators.required, Validators.minLength(3)]],
      clientTelephone: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s-]{8,16}$/)]],
      clientType: ['restaurant', [Validators.required]],
      produit: ['lait_bio_frais', [Validators.required]],
      quantiteUnites: [25, [Validators.required, Validators.min(1), Validators.max(500)]],
      prixUnitaireFCFA: [1200, [Validators.required, Validators.min(100)]],
      lieuLivraison: ['', [Validators.required, Validators.minLength(3)]]
    });

    this.formAvis = this.fb.group({
      noteSatisfaction: [5, [Validators.required]],
      avisClient: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.modalCommandeOuvert()) this.fermerModalCommande();
    if (this.modalAvisOuvert()) this.fermerModalAvis();
  }

  getLibelleStatutCommande(statut: StatutCommande): string {
    return this.statutCommandeLabels[statut] || statut;
  }

  getLibelleClient(type: TypeClient): string {
    return this.typeClientLabels[type] || type;
  }

  genererLienWhatsApp(cmd: CommandeLait): string {
    const tel = cmd.clientTelephone.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(
      `Bonjour ${cmd.clientNom}, votre commande LAWTAN BIO (${cmd.reference}) de ${cmd.quantiteUnites} L de ${cmd.produit === 'lait_bio_frais' ? 'lait frais bio' : 'lait caillé bio'} (Lot : ${cmd.numeroLotLait}) est bien prise en compte. Merci de votre confiance !`
    );
    return `https://wa.me/${tel}?text=${msg}`;
  }

  changerStatut(cmd: CommandeLait, nouveauStatut: StatutCommande): void {
    this.fermeService.mettreAJourStatutCommande(cmd.id, nouveauStatut);
    this.notificationService.afficherToast(`Statut de ${cmd.reference} mis à jour : ${this.getLibelleStatutCommande(nouveauStatut)}`);
  }

  ouvrirModalCommande(): void {
    this.formCommande.patchValue({
      clientNom: '',
      clientTelephone: '+221 77 ',
      clientType: 'restaurant',
      produit: 'lait_bio_frais',
      quantiteUnites: 25,
      prixUnitaireFCFA: 1200,
      lieuLivraison: ''
    });
    this.modalCommandeOuvert.set(true);
  }

  fermerModalCommande(): void {
    this.modalCommandeOuvert.set(false);
  }

  soumettreCommande(): void {
    if (this.formCommande.invalid || this.enregistrementEnCours()) return;
    this.enregistrementEnCours.set(true);

    const val = this.formCommande.value;
    const auj = new Date().toISOString().split('T')[0];
    const lotAuj = `BIO-${auj.replace(/-/g, '')}-N1`;

    this.fermeService.ajouterCommande({
      date: auj,
      clientNom: val.clientNom,
      clientTelephone: val.clientTelephone,
      clientType: val.clientType,
      produit: val.produit,
      quantiteUnites: Number(val.quantiteUnites),
      format: Number(val.quantiteUnites) >= 20 ? 'bidon_20L' : 'bouteille_1L',
      prixUnitaireFCFA: Number(val.prixUnitaireFCFA),
      montantTotalFCFA: Number(val.quantiteUnites) * Number(val.prixUnitaireFCFA),
      numeroLotLait: lotAuj,
      lieuLivraison: val.lieuLivraison,
      statut: 'en_attente'
    });

    this.notificationService.afficherToast(`Commande créée pour ${val.clientNom} (${val.quantiteUnites} L) !`);
    this.fermerModalCommande();
    setTimeout(() => this.enregistrementEnCours.set(false), 250);
  }

  ouvrirModalAvis(cmd: CommandeLait): void {
    this.commandePourAvis.set(cmd);
    this.formAvis.patchValue({
      noteSatisfaction: 5,
      avisClient: ''
    });
    this.modalAvisOuvert.set(true);
  }

  fermerModalAvis(): void {
    this.modalAvisOuvert.set(false);
    this.commandePourAvis.set(null);
  }

  soumettreAvis(): void {
    if (this.formAvis.invalid || !this.commandePourAvis() || this.enregistrementEnCours()) return;
    this.enregistrementEnCours.set(true);

    const val = this.formAvis.value;
    const cmd = this.commandePourAvis()!;

    this.fermeService.enregistrerAvisClient(cmd.id, Number(val.noteSatisfaction), val.avisClient);
    this.notificationService.afficherToast(`Avis client enregistré pour ${cmd.clientNom} !`);
    this.fermerModalAvis();
    setTimeout(() => this.enregistrementEnCours.set(false), 250);
  }
}
