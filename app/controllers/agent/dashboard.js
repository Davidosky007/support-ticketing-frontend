import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class AgentDashboardController extends Controller {
  @service session;

  get assignedTickets() {
    let user = this.session.data.authenticated.user;
    if (!user) return [];
    return this.model.filter((t) => t.agent && t.agent.id === user.id);
  }

  get unassignedTickets() {
    return this.model.filter((t) => t.status === 'OPEN' && !t.agent);
  }
}
