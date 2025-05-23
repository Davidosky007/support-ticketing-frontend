import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class IndexRoute extends Route {
  @service session;

  // Index route is public, but we want to ensure session is restored
  beforeModel() {
    this.session.restore();
  }
}
