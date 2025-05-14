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

  // Assigned tickets: agent matches current user
  get assignedTickets() {
    let user = this.session.data.authenticated.user;
    if (!user) return [];
    return this.tickets.filter((t) => t.agent && t.agent.id === user.id);
  }

  // Unassigned tickets: status OPEN and agent is null
  get unassignedTickets() {
    return this.tickets.filter((t) => t.status === 'OPEN' && !t.agent);
  }

  // Filtered tickets (all tickets, not just unassigned)
  get filteredTickets() {
    if (this.statusFilter === 'ALL') {
      return this.tickets;
    }
    return this.tickets.filter((ticket) => ticket.status === this.statusFilter);
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
    try {
      // Calculate last month's date range more precisely
      const today = new Date();
      const lastMonth = new Date(today);
      lastMonth.setMonth(today.getMonth() - 1);
      
      // First day of last month
      const startDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
      // Last day of last month
      const endDate = new Date(today.getFullYear(), today.getMonth(), 0);
      
      console.log(`Exporting tickets from ${startDate.toISOString()} to ${endDate.toISOString()}`);
      
      // Use the generateTicketsCsv method from the route
      const csvUrl = await this.target.currentRoute.instance.generateTicketsCsv(
        'CLOSED', 
        startDate.toISOString(), 
        endDate.toISOString()
      );
      
      // Open CSV in new window
      if (csvUrl) {
        window.open(csvUrl, '_blank');
      } else {
        throw new Error('No URL returned for CSV download');
      }
    } catch (error) {
      console.error('Error generating CSV:', error);
      alert(`Error generating CSV: ${error.message}`);
    } finally {
      this.isLoading = false;
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
