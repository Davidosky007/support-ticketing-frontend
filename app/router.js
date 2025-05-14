import EmberRouter from '@ember/routing/router';
import config from 'support-ticketing-frontend/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  // Public routes
  this.route('login');
  this.route('register');

  // Protected routes
  this.route('customer', function () {
    this.route('tickets');
    this.route('new-ticket');
    this.route('ticket', { path: '/ticket/:ticket_id' });
  });

  this.route('agent', function () {
    this.route('dashboard');
    this.route('tickets');
    this.route('ticket', { path: '/ticket/:ticket_id' });
    this.route('exports');
  });
});
