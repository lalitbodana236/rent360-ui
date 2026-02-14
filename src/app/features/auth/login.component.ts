import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { UserSettingsService } from '../../core/services/user-settings.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  error = '';

  form = this.fb.group({
    email: ['owner@rent360.com', [Validators.required, Validators.email]],
    password: ['password', Validators.required],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly settings: UserSettingsService,
  ) {}

  ngOnInit(): void {
    if (this.auth.snapshotUser) {
      this.router.navigate(['/dashboard'], { replaceUrl: true });
    }
  }

  submit(): void {
    this.error = '';
    if (this.form.invalid) {
      return;
    }

    const email = String(this.form.value.email ?? '');
    const password = String(this.form.value.password ?? '');

    this.auth
      .login(email, password)
      .pipe(
        switchMap((user) => {
          this.settings.updateSettings({
            fullName: user.fullName,
            email: user.email,
            mobileNumber: user.mobileNumber,
            address: user.address,
            currency: user.currency,
          });

          return this.settings.loadForUser(user.email);
        }),
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/dashboard'], { replaceUrl: true });
        },
        error: (err: Error) => {
          this.error = err.message || 'Login failed';
        },
      });
  }
}
