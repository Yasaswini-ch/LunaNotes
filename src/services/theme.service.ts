import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  theme = signal<Theme>('light');

  initTheme() {
    const savedTheme = localStorage.getItem('lunanotes-theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    this.setTheme(initialTheme);
  }

  toggleTheme() {
    this.theme.update(currentTheme => (currentTheme === 'light' ? 'dark' : 'light'));
    this.applyTheme();
  }
  
  private setTheme(theme: Theme) {
    this.theme.set(theme);
    this.applyTheme();
  }

  private applyTheme() {
    localStorage.setItem('lunanotes-theme', this.theme());
    if (this.theme() === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}