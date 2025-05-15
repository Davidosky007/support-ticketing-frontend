import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class AgentDashboardController extends Controller {
  @service session;
  @service apollo;
  @service router;

  @tracked isLoading = false;
  @tracked downloadError = null;

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
    this.downloadError = null;

    try {
      // Get current date for end date
      const endDate = new Date();

      // Start date should be 90 days ago from today (not from 2025)
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 90);

      // Validate that dates are not in the future
      const now = new Date();
      if (startDate > now || endDate > now) {
        throw new Error('Cannot use future dates for ticket export');
      }

      console.log(
        `Exporting tickets from ${startDate.toISOString()} to ${endDate.toISOString()}`,
      );

      const mutation = `
        mutation GenerateTicketsCsv($status: String, $startDate: ISO8601DateTime, $endDate: ISO8601DateTime) {
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
        status: 'closed', // Use lowercase as the server expects
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };

      console.log('Request variables:', JSON.stringify(variables, null, 2));

      const result = await this.apollo.mutate({ mutation, variables });

      if (!result || !result.generateTicketsCsv) {
        throw new Error('Invalid response from server');
      }

      if (
        result.generateTicketsCsv.errors &&
        result.generateTicketsCsv.errors.length > 0
      ) {
        throw new Error(result.generateTicketsCsv.errors[0]);
      }

      const url = result.generateTicketsCsv.url;
      if (!url) {
        throw new Error('No download URL was returned');
      }

      // Create a programmatic download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'closed_tickets.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating CSV:', error);
      this.downloadError = error.message || 'Failed to generate CSV report';
    } finally {
      this.isLoading = false;
    }
  }

  @action
  retryDownload() {
    this.downloadTicketsCsv();
  }
}
