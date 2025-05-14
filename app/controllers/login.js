import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class LoginController extends Controller {
  @service apollo;
  @service session;
  @service router;

  @tracked email = '';
  @tracked password = '';
  @tracked errorMessage = null;
  @tracked isLoading = false;

  @action
  updateEmail(event) {
    this.email = event.target.value;
  }

  @action
  updatePassword(event) {
    this.password = event.target.value;
  }

  @action
  async handleLogin(event) {
    event.preventDefault();
    this.isLoading = true;
    this.errorMessage = null;

    try {
      console.log('Attempting login with:', { email: this.email });

      const mutation = `
        mutation Login($email: String!, $password: String!) {
          login(email: $email, password: $password) {
            token
            user {
              id
              email
              firstName
              lastName
              isAgent
            }
          }
        }
      `;

      const variables = { email: this.email, password: this.password };

      // Direct fetch approach for debugging
      const response = await fetch(
        'https://support-ticketing-backend.onrender.com/graphql',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: mutation,
            variables,
          }),
        },
      );

      const result = await response.json();
      console.log('Login response:', result);

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      const { token, user } = result.data.login;
      this.session.authenticate(token, user);

      // Redirect based on user role
      if (user.isAgent) {
        this.router.transitionTo('agent.dashboard');
      } else {
        this.router.transitionTo('customer.tickets');
      }
    } catch (error) {
      console.error('Login error:', error);
      this.errorMessage = error.message || 'Invalid email or password';
    } finally {
      this.isLoading = false;
    }
  }
}
