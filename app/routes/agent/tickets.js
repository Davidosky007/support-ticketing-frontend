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

    // Add methods to the controller for status updates and CSV generation
    controller.updateTicketStatus = this.updateTicketStatus.bind(this);
    controller.generateTicketsCsv = this.generateTicketsCsv.bind(this);
  }

  async updateTicketStatus(ticketId, status) {
    try {
      const mutation = `
        mutation UpdateTicketStatus($ticketId: ID!, $status: String!) {
          updateTicketStatus(input: {
            ticketId: $ticketId
            status: $status
          }) {
            ticket {
              id
              status
            }
            errors
          }
        }
      `;

      const variables = {
        ticketId,
        status,
      };

      const result = await this.apollo.mutate({ mutation, variables });

      if (
        result.updateTicketStatus.errors &&
        result.updateTicketStatus.errors.length > 0
      ) {
        throw new Error(result.updateTicketStatus.errors[0]);
      }

      return result.updateTicketStatus.ticket;
    } catch (error) {
      console.error('Error updating ticket status:', error);
      throw error;
    }
  }

  async generateTicketsCsv(status = null, startDate = null, endDate = null) {
    try {
      const mutation = `
        mutation GenerateTicketsCsv($status: String, $startDate: ISO8601DateTime, $endDate: ISO8601DateTime) {
          generateTicketsCsv(input: {
            status: $status
            startDate: $startDate
            endDate: $endDate
          }) {
            url
            errors
          }
        }
      `;

      const variables = {
        status,
        startDate,
        endDate,
      };

      const result = await this.apollo.mutate({ mutation, variables });

      if (
        result.generateTicketsCsv.errors &&
        result.generateTicketsCsv.errors.length > 0
      ) {
        throw new Error(result.generateTicketsCsv.errors[0]);
      }

      return result.generateTicketsCsv.url;
    } catch (error) {
      console.error('Error generating tickets CSV:', error);
      throw error;
    }
  }
}
