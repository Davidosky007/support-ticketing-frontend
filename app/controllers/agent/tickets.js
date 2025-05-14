import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class AgentTicketsController extends Controller {
  @service apollo;

  @tracked tickets = [];
  @tracked isLoading = true;
  @tracked statusFilter = 'ALL';

  // Replace @computed with a native getter
  get filteredTickets() {
    // This will automatically track this.tickets and this.statusFilter
    if (this.statusFilter === 'ALL') {
      return this.tickets;
    }

    return this.tickets.filter((ticket) => ticket.status === this.statusFilter);
  }

  @action
  changeStatusFilter(event) {
    this.statusFilter = event.target.value;
  }

  @action
  async refreshTickets() {
    await this.fetchTickets();
  }

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
            customer {
              id
              name
            }
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
