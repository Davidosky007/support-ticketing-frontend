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
            customer {
              id
              name
            }
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
      try {
        // Read file as base64
        const base64Content = await this.readFileAsBase64(file);

        const mutation = `
          mutation UploadAttachment($ticketId: ID!, $file: String!, $filename: String!, $contentType: String!) {
            uploadAttachment(input: {
              ticketId: $ticketId
              file: $file
              filename: $filename
              contentType: $contentType
            }) {
              success
              attachment {
                id
                filename
                contentType
                url
              }
              errors
            }
          }
        `;

        const variables = {
          ticketId,
          file: base64Content,
          filename: file.name,
          contentType: file.type,
        };

        // Use apollo client for the mutation
        const result = await this.apollo.mutate({ mutation, variables });

        if (
          result.uploadAttachment.errors &&
          result.uploadAttachment.errors.length > 0
        ) {
          throw new Error(result.uploadAttachment.errors[0]);
        }

        return result.uploadAttachment.attachment;
      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error);
        throw error;
      }
    });

    return Promise.all(uploadPromises);
  }

  // Helper function to read file as base64
  readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Get the base64 string by removing the prefix (e.g., "data:image/jpeg;base64,")
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }
}
