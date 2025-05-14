import Service from '@ember/service';
import { inject as service } from '@ember/service';

export default class ApolloService extends Service {
  @service session;

  baseUrl = 'https://support-ticketing-backend.onrender.com/graphql';

  async query(queryOptions) {
    const { query, variables } = queryOptions;
    return this.request(query, variables);
  }

  async mutate(mutationOptions) {
    const { mutation, variables } = mutationOptions;
    return this.request(mutation, variables);
  }

  async request(operationString, variables = {}) {
    console.log('Apollo making request:', { operationString, variables });

    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.session.isAuthenticated) {
      headers['Authorization'] =
        `Bearer ${this.session.data.authenticated.token}`;
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query: operationString,
          variables,
        }),
      });

      const json = await response.json();
      console.log('Apollo response:', json);

      if (json.errors) {
        throw new Error(json.errors[0].message);
      }

      return json.data;
    } catch (error) {
      console.error('Apollo error:', error);
      throw error;
    }
  }
}
