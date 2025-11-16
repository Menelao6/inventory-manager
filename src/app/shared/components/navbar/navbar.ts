import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

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

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleDropdown(dropdown: keyof typeof this.dropdowns) {
    this.dropdowns[dropdown] = !this.dropdowns[dropdown];
  }

  closeMenu() {
    this.isMenuOpen = false;
    this.dropdowns.admin = false;
  }
}