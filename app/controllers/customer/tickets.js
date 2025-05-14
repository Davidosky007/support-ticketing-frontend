import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CustomerTicketsController extends Controller {
  @service apollo;
  @service session;

  @tracked tickets = [];
  @tracked isLoading = true;

  async fetchTickets() {
    this.isLoading = true;

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
      this.tickets = result.tickets;
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
