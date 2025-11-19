import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, NavigationEnd, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  isMenuOpen = false;
  dropdowns = {
    admin: false
  };

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.closeMenu();
      });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleDropdown(dropdown: keyof typeof this.dropdowns) {
    this.dropdowns[dropdown] = !this.dropdowns[dropdown];
  }

  onNavLinkClick() {
    this.closeMenu();
  }

  closeMenu() {
    this.isMenuOpen = false;
    this.dropdowns.admin = false;
  }
}