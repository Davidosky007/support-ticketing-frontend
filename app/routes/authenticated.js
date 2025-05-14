import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AuthenticatedRoute extends Route {
  @service session;
  @service router;

  beforeModel(transition) {
    this.session.restore();

    if (!this.session.isAuthenticated) {
      // Save the attempted transition to redirect after login
      this.session.attemptedTransition = transition;
      this.router.transitionTo('login');
    }
  }
}
