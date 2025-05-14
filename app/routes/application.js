import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ApplicationRoute extends Route {
  @service session;
  @service router;

  beforeModel() {
    // Restore session but don't redirect from public routes
    this.session.restore();

    // For now, let all routes through without authentication checks
    // We'll add authentication checks back once the basic UI is working
  }
}
