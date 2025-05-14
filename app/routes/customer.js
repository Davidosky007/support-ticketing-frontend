import AuthenticatedRoute from './authenticated';
import { inject as service } from '@ember/service';

export default class CustomerRoute extends AuthenticatedRoute {
  @service session;
  @service router;

  beforeModel() {
    super.beforeModel(...arguments);

    const user = this.session.data.authenticated.user;
    if (user && user.isAgent) {
      // Redirect agents to agent dashboard if they try to access customer routes
      this.router.transitionTo('agent.dashboard');
    }
  }
}
