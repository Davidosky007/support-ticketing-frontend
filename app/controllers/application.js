import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class ApplicationController extends Controller {
  @service session;
  @service router;

  get currentYear() {
    return new Date().getFullYear();
  }

  @action
  logout() {
    this.session.invalidate();
    this.router.transitionTo('login');
  }
}
