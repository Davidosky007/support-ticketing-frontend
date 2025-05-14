import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class AgentTicketController extends Controller {
  @service apollo;
  @service session;
  @service router;

  @tracked isLoading = false;
  @tracked newComment = '';
  @tracked isSubmitting = false;

  @action
  async assignTicket(ticketId) {
    this.isLoading = true;
    try {
      const mutation = `
        mutation AssignTicket($ticketId: ID!) {
          assignTicket(input: { ticketId: $ticketId }) {
            ticket {
              id
              status
              agent {
                id
                name
              }
            }
            errors
          }
        }
      `;

      const variables = { ticketId };

      const result = await this.apollo.mutate({ mutation, variables });

      if (result.assignTicket.errors && result.assignTicket.errors.length > 0) {
        throw new Error(result.assignTicket.errors[0]);
      }

      // Update the model after successful assignment
      this.model.agent = result.assignTicket.ticket.agent;
      this.model.status = result.assignTicket.ticket.status;

      // Refresh the page to show the updated ticket
      this.router.refresh();

      return result.assignTicket.ticket;
    } catch (error) {
      console.error('Error assigning ticket:', error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  @action
  updateComment(event) {
    this.newComment = event.target.value;
  }

  @action
  async addComment(event) {
    event.preventDefault();
    
    if (!this.newComment.trim()) {
      return;
    }
    
    this.isSubmitting = true;
    
    try {
      const mutation = `
        mutation CreateComment($ticketId: ID!, $content: String!) {
          createComment(input: {
            ticketId: $ticketId,
            content: $content
          }) {
            comment {
              id
              content
              createdAt
              user {
                id
                name
                role
              }
            }
            errors
          }
        }
      `;
      
      const variables = {
        ticketId: this.model.id,
        content: this.newComment
      };
      
      const result = await this.apollo.mutate({ mutation, variables });
      
      if (result.createComment.errors && result.createComment.errors.length > 0) {
        throw new Error(result.createComment.errors[0]);
      }
      
      // Add the new comment to the model's comments
      this.model.comments = [...this.model.comments, result.createComment.comment];
      
      // Clear the comment input
      this.newComment = '';
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  async updateTicketStatus(status) {
    this.isLoading = true;
    
    try {
      const mutation = `
        mutation UpdateTicketStatus($ticketId: ID!, $status: String!) {
          updateTicketStatus(input: {
            ticketId: $ticketId,
            status: $status
          }) {
            ticket {
              id
              status
            }
            errors
          }
        }
      `;
      
      const variables = {
        ticketId: this.model.id,
        status: status
      };
      
      const result = await this.apollo.mutate({ mutation, variables });
      
      if (result.updateTicketStatus.errors && result.updateTicketStatus.errors.length > 0) {
        throw new Error(result.updateTicketStatus.errors[0]);
      }
      
      // Update the model's status
      this.model.status = result.updateTicketStatus.ticket.status;
    } catch (error) {
      console.error('Error updating ticket status:', error);
      alert('Failed to update ticket status. Please try again.');
    } finally {
      this.isLoading = false;
    }
  }
}
