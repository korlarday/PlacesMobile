import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private userIsLoggedIn = true;
  private user = 'user10';

  get userIsAuthenticated() {
    return this.userIsLoggedIn;
  }

  get userId() {
    return this.user;
  }

  constructor() { }

  login() {
    this.userIsLoggedIn = true;
  }

  logout() {
    this.userIsLoggedIn = false;
  }
}
