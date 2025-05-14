import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class AgentDashboardController extends Controller {
  @service session;
  @service apollo;
  @service router;

  @tracked isLoading = false;

  get assignedTickets() {
    let user = this.session.data.authenticated.user;
    if (!user) return [];
    return this.model.filter((t) => t.agent && t.agent.id === user.id);
  }

  get unassignedTickets() {
    return this.model.filter((t) => t.status === 'OPEN' && !t.agent);
  }

  @action
  async assignTicket(ticketId) {
    this.isLoading = true;
    try {
      const mutation = `
        mutation AssignTicket($ticketId: ID!) {
          assignTicket(input: { ticketId: $ticketId }) {
            ticket {
              id
              status
              agent {
                id
                name
              }
            }
            errors
          }
        }
      `;

      const variables = { ticketId };

      const result = await this.apollo.mutate({ mutation, variables });

      if (result.assignTicket.errors && result.assignTicket.errors.length > 0) {
        throw new Error(result.assignTicket.errors[0]);
      }

      // Refresh the route to update the displayed tickets
      this.router.refresh();

      return result.assignTicket.ticket;
    } catch (error) {
      console.error('Error assigning ticket:', error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }
}
