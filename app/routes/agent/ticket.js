import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class AgentTicketRoute extends Route {
  @service apollo;

  async model(params) {
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
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.model = model;
    controller.isLoading = false;
  }

  @action
  refresh() {
    this.refresh();
  }
}
