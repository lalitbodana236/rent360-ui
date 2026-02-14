import { Injectable } from '@angular/core';

@Injectable()
export class ThemeService {
  private readonly key = 'r360_theme';

  constructor() {
    const stored = localStorage.getItem(this.key);
    if (stored === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }

  toggleTheme(): void {
    document.documentElement.classList.toggle('dark');
    const mode = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    localStorage.setItem(this.key, mode);
  }
}
