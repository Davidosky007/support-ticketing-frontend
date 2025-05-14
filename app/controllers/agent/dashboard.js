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

  @action
  async downloadTicketsCsv() {
    this.isLoading = true;
    try {
      // Calculate dates for last month
      const today = new Date();
      const endDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      );
      const startDate = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        today.getDate(),
      );

      const mutation = `
        mutation GenerateTicketsCsv($status: String!, $startDate: ISO8601DateTime, $endDate: ISO8601DateTime) {
          generateTicketsCsv(input: {
            status: $status,
            startDate: $startDate,
            endDate: $endDate
          }) {
            url
            errors
          }
        }
      `;

      const variables = {
        status: 'CLOSED', // This needs to match the $status variable in the mutation
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };

      console.log('Generating CSV with variables:', variables);
      const result = await this.apollo.mutate({ mutation, variables });

      if (
        result.generateTicketsCsv.errors &&
        result.generateTicketsCsv.errors.length > 0
      ) {
        throw new Error(result.generateTicketsCsv.errors[0]);
      }

      // Open the CSV file URL in a new tab
      window.open(result.generateTicketsCsv.url, '_blank');
    } catch (error) {
      console.error('Error generating CSV:', error);
      alert('Error generating CSV: ' + error.message);
    } finally {
      this.isLoading = false;
    }
  }
}
