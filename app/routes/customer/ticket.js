import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CustomerTicketRoute extends Route {
  @service apollo;

  async model(params) {
    try {
      const query = `
        query GetTicket($id: ID!) {
          ticket(id: $id) {
            id
            subject
            description
            status
            agentCommented
            createdAt
            updatedAt
            customer {
              id
              name
              email
            }
            agent {
              id
              name
              email
            }
            comments {
              id
              content
              createdAt
              user {
                id
                name
                role
              }
            }
            attachments {
              id
              filename
              contentType
              url
            }
          }
        }
      `;

      const variables = { id: params.ticket_id };
      const result = await this.apollo.query({ query, variables });

      return result.ticket;
    } catch (error) {
      console.error('Error fetching ticket:', error);
      return null;
    }
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.ticket = model;
    controller.isLoading = false;
  }
}
