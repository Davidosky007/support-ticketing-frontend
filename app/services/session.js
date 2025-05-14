import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class SessionService extends Service {
  @tracked isAuthenticated = false;
  @tracked data = {
    authenticated: {
      token: null,
      user: null,
    },
  };

  // Store the transition that was attempted before authentication
  attemptedTransition = null;

  constructor() {
    super(...arguments);
    this.restore();
  }

  authenticate(token, user) {
    this.data.authenticated.token = token;
    this.data.authenticated.user = user;
    this.isAuthenticated = true;

    localStorage.setItem('jwt', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  invalidate() {
    this.data.authenticated.token = null;
    this.data.authenticated.user = null;
    this.isAuthenticated = false;

    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
  }

  restore() {
    const token = localStorage.getItem('jwt');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (token && user) {
      this.data.authenticated.token = token;
      this.data.authenticated.user = user;
      this.isAuthenticated = true;
    }
  }
  
  // Helper property to check if the user is an agent
  get isAgent() {
    return this.isAuthenticated && this.data.authenticated.user.role === 'AGENT';
  }
}
