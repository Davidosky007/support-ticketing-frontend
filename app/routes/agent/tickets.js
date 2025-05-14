import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AgentTicketsRoute extends Route {
  @service apollo;
  @service session;
  @service router;

  async model() {
    // Instead of accessing the controller, fetch the tickets directly in the model hook
    try {
      const query = `
        query {
          tickets {
            id
            subject
            status
            createdAt
            updatedAt
            customer {
              id
              name
            }
          }
        }
      `;

      const result = await this.apollo.query({ query });
      return result.tickets || [];
    } catch (error) {
      console.error('Error fetching tickets:', error);
      return [];
    }
  }

  beforeModel() {
    // Make sure user is authenticated and is an agent
    if (!this.session.isAuthenticated) {
      this.router.transitionTo('login');
      return;
    }

    if (!this.session.data.authenticated.user.isAgent) {
      this.router.transitionTo('customer.tickets');
    }
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.tickets = model;
    controller.isLoading = false;
  }
}
