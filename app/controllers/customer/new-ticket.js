import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class CustomerNewTicketController extends Controller {
  @service apollo;
  @service router;

  @tracked subject = '';
  @tracked description = '';
  @tracked selectedFiles = [];
  @tracked errorMessage = '';
  @tracked isSubmitting = false;

  get selectedFileNames() {
    return Array.from(this.selectedFiles).map((file) => file.name);
  }

  @action
  updateSubject(event) {
    this.subject = event.target.value;
  }

  @action
  updateDescription(event) {
    this.description = event.target.value;
  }

  @action
  handleFileChange(event) {
    this.selectedFiles = event.target.files;
  }

  @action
  async submitTicket(event) {
    event.preventDefault();
    this.isSubmitting = true;
    this.errorMessage = '';

    try {
      // Create ticket mutation
      const mutation = `
        mutation CreateTicket($input: CreateTicketInput!) {
          createTicket(input: $input) {
            id
            subject
            description
            status
          }
        }
      `;

      const variables = {
        input: {
          subject: this.subject,
          description: this.description,
        },
      };

      const result = await this.apollo.mutate({ mutation, variables });
      const ticketId = result.createTicket.id;

      // If there are files, upload them
      if (this.selectedFiles.length > 0) {
        await this.uploadFiles(ticketId);
      }

      // Redirect to the ticket detail page
      this.router.transitionTo('customer.ticket', ticketId);
    } catch (error) {
      console.error('Error creating ticket:', error);
      this.errorMessage =
        error.message || 'Failed to create ticket. Please try again.';
    } finally {
      this.isSubmitting = false;
    }
  }

  async uploadFiles(ticketId) {
    const uploadPromises = Array.from(this.selectedFiles).map(async (file) => {
      // Create form data for file upload
      const formData = new FormData();
      formData.append(
        'operations',
        JSON.stringify({
          query: `
          mutation UploadFile($ticketId: ID!, $file: Upload!) {
            uploadFile(ticketId: $ticketId, file: $file) {
              id
              filename
              contentType
              url
            }
          }
        `,
          variables: {
            ticketId: ticketId,
            file: null, // This will be replaced by the file
          },
        }),
      );

      // Map where the file should go in the variables
      formData.append(
        'map',
        JSON.stringify({
          0: ['variables.file'],
        }),
      );

      // Add the actual file
      formData.append('0', file);

      try {
        // Send the request directly (since Apollo Client might not handle file uploads properly)
        const response = await fetch(
          'https://support-ticketing-backend.onrender.com/graphql',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('jwt')}`,
            },
            body: formData,
          },
        );

        const result = await response.json();

        if (result.errors) {
          throw new Error(result.errors[0].message);
        }

        return result.data.uploadFile;
      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error);
        throw error;
      }
    });

    return Promise.all(uploadPromises);
  }
}
