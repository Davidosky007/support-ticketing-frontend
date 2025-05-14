import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class RegisterController extends Controller {
  @service apollo;
  @service session;
  @service router;

  @tracked firstName = '';
  @tracked lastName = '';
  @tracked email = '';
  @tracked password = '';
  @tracked errorMessage = null;
  @tracked isLoading = false;

  @action
  updateFirstName(event) {
    this.firstName = event.target.value;
  }

  @action
  updateLastName(event) {
    this.lastName = event.target.value;
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
  async handleRegister(event) {
    event.preventDefault();
    this.isLoading = true;
    this.errorMessage = null;

    try {
      console.log('Attempting registration:', {
        email: this.email,
        firstName: this.firstName,
        lastName: this.lastName,
      });

      const mutation = `
        mutation Register($input: RegisterInput!) {
          register(input: $input) {
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

      const variables = {
        input: {
          firstName: this.firstName,
          lastName: this.lastName,
          email: this.email,
          password: this.password,
        },
      };

      // Direct fetch approach
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
      console.log('Registration response:', result);

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      const { token, user } = result.data.register;
      this.session.authenticate(token, user);

      // Redirect to customer tickets page after registration
      this.router.transitionTo('customer.tickets');
    } catch (error) {
      console.error('Registration error:', error);
      this.errorMessage =
        error.message || 'Registration failed. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }
}
