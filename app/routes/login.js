import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class LoginRoute extends Route {
  @service session;
  @service router;

  beforeModel() {
    this.session.restore();

    // If already authenticated, redirect to appropriate dashboard
    if (this.session.isAuthenticated) {
      const user = this.session.data.authenticated.user;
      if (user.isAgent) {
        this.router.transitionTo('agent.dashboard');
      } else {
        this.router.transitionTo('customer.tickets');
      }
    }
  }
}
