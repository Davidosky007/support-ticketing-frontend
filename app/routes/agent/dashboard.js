import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AgentDashboardRoute extends Route {
  @service apollo;
  @service session;
  @service router;

  async model() {
    // Fetch all tickets for dashboard filtering
    try {
      const query = `
        query {
          tickets {
            id
            subject
            status
            createdAt
            customer {
              id
              name
            }
            agent {
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
}
