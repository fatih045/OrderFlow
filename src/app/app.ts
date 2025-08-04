import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { MainContent } from './main-content';
import { Footer } from './footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Header, Sidebar, MainContent, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('orderflow-frontend');
}
