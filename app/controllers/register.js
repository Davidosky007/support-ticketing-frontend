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
      console.log('Attempting registration:', { 
        email: this.email, 
        name: this.name,
        role: this.role
      });
      
      // Split name into first name and last name
      const nameParts = this.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
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
          firstName,
          lastName,
          email: this.email,
          password: this.password,
          isAgent: this.role === 'agent'
        } 
      };
      
      const response = await fetch('https://support-ticketing-backend.onrender.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: mutation,
          variables
        }),
      });
      
      const result = await response.json();
      console.log('Registration response:', result);
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }
      
      const { token, user } = result.data.register;
      this.session.authenticate(token, user);

      // Redirect based on user role
      if (user.isAgent) {
        this.router.transitionTo('agent.dashboard');
      } else {
        this.router.transitionTo('customer.tickets');
      }
    } catch (error) {
      console.error('Registration error:', error);
      this.errorMessage = error.message || 'Registration failed. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }
}
