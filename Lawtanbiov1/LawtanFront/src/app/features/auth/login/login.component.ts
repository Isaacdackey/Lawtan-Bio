import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  showPassword = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  loginError = signal<string | null>(null);
  loginSuccess = signal<boolean>(false);

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      identifier: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      rememberMe: [false]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((val) => !val);
  }

  onSubmit(): void {
    this.loginError.set(null);

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    // Simulation de connexion sécurisée
    setTimeout(() => {
      this.isLoading.set(false);
      const identifier = this.loginForm.get('identifier')?.value?.trim();
      
      // Démonstration : validation positive
      if (identifier) {
        this.loginSuccess.set(true);
        setTimeout(() => {
          this.router.navigate(['/ferme']);
        }, 1200);
      } else {
        this.loginError.set('Identifiant ou mot de passe incorrect.');
      }
    }, 800);
  }

  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
