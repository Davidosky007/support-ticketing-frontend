import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class UnauthorizedRoute extends Route {
  @service session;
  @service router;

  beforeModel() {
    this.session.restore();

    // If authenticated, redirect to appropriate dashboard
    if (this.session.isAuthenticated) {
      const user = this.session.data.authenticated.user;
      if (user.role === 'AGENT') {
        this.router.transitionTo('agent.dashboard');
      } else {
        this.router.transitionTo('customer.tickets');
      }
    }
  }
}
