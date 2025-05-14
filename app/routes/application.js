import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ApplicationRoute extends Route {
  @service session;
  @service router;

  beforeModel(transition) {
    // Restore session
    this.session.restore();

    // Define public routes that don't require authentication
    const publicRoutes = ['index', 'login', 'register', 'unauthorized'];

    // If user is not authenticated and tries to access a protected route, redirect to login
    if (
      !this.session.isAuthenticated &&
      !publicRoutes.includes(transition.to?.name) &&
      transition.to?.name !== 'application'
    ) {
      this.router.transitionTo('login');
    }
  }
}
