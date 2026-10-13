import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

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

  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  constructor() {
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

    const identifier = this.loginForm.get('identifier')?.value?.trim();
    const password = this.loginForm.get('password')?.value;
    const rememberMe = this.loginForm.get('rememberMe')?.value ?? false;

    this.authService.login(identifier, password, rememberMe).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.loginSuccess.set(true);
        setTimeout(() => {
          this.router.navigate(['/ferme']);
        }, 800);
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = err?.message || this.authService.authError() || 'Identifiant ou mot de passe incorrect.';
        this.loginError.set(msg);
      }
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
