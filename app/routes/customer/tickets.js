import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CustomerTicketsRoute extends Route {
  @service apollo;
  @service session;

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
