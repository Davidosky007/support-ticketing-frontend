import AuthenticatedRoute from './authenticated';
import { inject as service } from '@ember/service';

export default class AgentRoute extends AuthenticatedRoute {
  @service session;
  @service router;

  beforeModel() {
    super.beforeModel(...arguments);

    const user = this.session.data.authenticated.user;
    if (user && user.role !== 'AGENT') {
      // Redirect customers to customer tickets if they try to access agent routes
      this.router.transitionTo('customer.tickets');
    }
  }
}
