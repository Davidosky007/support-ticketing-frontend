import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AgentTicketsRoute extends Route {
  @service apollo;

  async model() {
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
      return result.tickets;
    } catch (error) {
      console.error('Error fetching tickets:', error);
      return [];
    }
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.tickets = model;
    controller.isLoading = false;
  }
}
