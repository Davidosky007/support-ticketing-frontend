import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class AgentTicketsController extends Controller {
  @service apollo;
  @service session;
  @service router;

  @tracked tickets = [];
  @tracked isLoading = true;
  @tracked statusFilter = 'ALL';
  @tracked selectedFile = null;
  @tracked uploadingFile = false;
  @tracked downloadError = null;
  @tracked lastDownloadUrl = null;

  // Define the mutation properly
  generateTicketsCsvMutation = `
    mutation GenerateTicketsCsv($status: String, $startDate: ISO8601DateTime, $endDate: ISO8601DateTime) {
      generateTicketsCsv(input: {
        status: $status,
        startDate: $startDate,
        endDate: $endDate
      }) {
        url
        errors
      }
    }
  `;

  // Assigned tickets: agent matches current user
  get assignedTickets() {
    let user = this.session.data.authenticated.user;
    if (!user) return [];
    // Sort by creation date (newest first)
    return this.tickets
      .filter((t) => t.agent && t.agent.id === user.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Unassigned tickets: status OPEN and agent is null
  get unassignedTickets() {
    // Sort by creation date (newest first)
    return this.tickets
      .filter((t) => t.status === 'OPEN' && !t.agent)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Filtered tickets (all tickets, not just unassigned)
  get filteredTickets() {
    let filtered =
      this.statusFilter === 'ALL'
        ? this.tickets
        : this.tickets.filter((ticket) => ticket.status === this.statusFilter);

    // Sort by creation date (newest first)
    return filtered.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
  }

  @action
  changeStatusFilter(event) {
    this.statusFilter = event.target.value;
  }

  @action
  async refreshTickets() {
    await this.fetchTickets();
  }

  @action
  async downloadTicketsCsv() {
    this.isLoading = true;
    this.downloadError = null;

    try {
      // Get current date for end date
      const endDate = new Date();

      // Start date should be 90 days ago from today (not from 2025)
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 90);

      // Validate that dates are not in the future
      const now = new Date();
      if (startDate > now || endDate > now) {
        throw new Error('Cannot use future dates for ticket export');
      }

  

      const response = await this.apollo.mutate({
        mutation: this.generateTicketsCsvMutation,
        variables: {
          status: 'closed', // Use lowercase as the server expects
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });

  

      if (!response || !response.generateTicketsCsv) {
        throw new Error('Invalid response from server');
      }

      const { url, errors } = response.generateTicketsCsv;

      if (errors && errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      if (!url) {
        throw new Error('No download URL returned from server');
      }

      // Store the URL for retry functionality
      this.lastDownloadUrl = url;

      // Provide more direct access to the file
      const link = document.createElement('a');
      link.href = url;
      link.download = 'closed_tickets.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('CSV download failed:', error);
      this.downloadError = `Download failed: ${error.message || 'Unknown error'}`;
    } finally {
      this.isLoading = false;
    }
  }

  @action
  retryDownload() {
    if (this.lastDownloadUrl) {
      window.open(this.lastDownloadUrl, '_blank');
    } else {
      this.downloadTicketsCsv();
    }
  }

  @action
  async assignTicket(ticketId) {
    this.isLoading = true;
    try {
      // Call the route's assignTicket method
      let ticket =
        await this.target.currentRoute.instance.assignTicket(ticketId);
      // Optionally, update the ticket in the tickets array
      let idx = this.tickets.findIndex((t) => t.id === ticket.id);
      if (idx !== -1) {
        this.tickets[idx] = ticket;
      }
    } catch (e) {
      // handle error, e.g. show notification
      console.error('Error assigning ticket:', e);
    } finally {
      this.isLoading = false;
    }
  }

  @action
  handleFileChange(event) {
    this.selectedFile = event.target.files[0];
  }

  @action
  async uploadAttachment(ticketId) {
    if (!this.selectedFile) {
      return;
    }

    this.uploadingFile = true;

    try {
      // Read file as base64
      const base64Content = await this.readFileAsBase64(this.selectedFile);

      const mutation = `
        mutation UploadAttachment($ticketId: ID!, $file: String!, $filename: String!, $contentType: String!) {
          uploadAttachment(input: {
            ticketId: $ticketId,
            file: $file,
            filename: $filename,
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
        filename: this.selectedFile.name,
        contentType: this.selectedFile.type,
      };

      const result = await this.apollo.mutate({ mutation, variables });

      if (
        result.uploadAttachment.errors &&
        result.uploadAttachment.errors.length > 0
      ) {
        throw new Error(result.uploadAttachment.errors[0]);
      }

      // Clear the selected file
      this.selectedFile = null;

      // Return the attachment
      return result.uploadAttachment.attachment;
    } catch (error) {
      console.error('Error uploading attachment:', error);
      alert('Failed to upload attachment. Please try again.');
    } finally {
      this.uploadingFile = false;
    }
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

  async fetchTickets() {
    this.isLoading = true;
    try {
      const query = `
        query {
          tickets {
            id
            subject
            status
            createdAt
            updatedAt
            customer {
              id
              name
            }
            agent {
              id
              name
              email
            }
          }
        }
      `;
      const result = await this.apollo.query({ query });
      this.tickets = result.tickets;
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
