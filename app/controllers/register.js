import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class RegisterController extends Controller {
  @service apollo;
  @service session;
  @service router;

  @tracked name = '';
  @tracked email = '';
  @tracked password = '';
  @tracked role = 'customer'; // Default role
  @tracked errorMessage = null;
  @tracked isLoading = false;

  @action
  updateName(event) {
    this.name = event.target.value;
  }

  @action
  updateEmail(event) {
    this.email = event.target.value;
  }

  @action
  updatePassword(event) {
    this.password = event.target.value;
  }

  @action
  setRole(role) {
    this.role = role;
  }

  @action
  async handleRegister(event) {
    event.preventDefault();
    this.isLoading = true;
    this.errorMessage = null;

    try {
  

      // Expected register mutation structure
      const mutation = `
        mutation Register($name: String!, $email: String!, $password: String!, $role: String!) {
          register(input: {
            name: $name
            email: $email
            password: $password
            role: $role
          }) {
            user {
              id
              name
              email
              role
            }
            token
            errors
          }
        }
      `;

      const variables = {
        name: this.name,
        email: this.email,
        password: this.password,
        role: this.role === 'agent' ? 'AGENT' : 'CUSTOMER',
      };

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
    

      if (
        result.errors ||
        (result.data?.register?.errors &&
          result.data.register.errors.length > 0)
      ) {
        const errorMessage = result.errors
          ? result.errors[0].message
          : result.data.register.errors[0];
        throw new Error(errorMessage);
      }

      const { token, user } = result.data.register;
      this.session.authenticate(token, user);

      // Redirect based on user role
      if (user.role === 'AGENT') {
        this.router.transitionTo('agent.dashboard');
      } else {
        this.router.transitionTo('customer.tickets');
      }
    } catch (error) {
      console.error('Registration error:', error);
      this.errorMessage =
        error.message || 'Registration failed. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }
}
