import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  constructor(private readonly title: Title) {
    this.title.setTitle(environment.branding.appName);
  }
}
