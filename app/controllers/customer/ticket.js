import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class CustomerTicketController extends Controller {
  @service apollo;
  @service session;

  @tracked ticket = null;
  @tracked isLoading = true;
  @tracked newComment = '';
  @tracked isSubmitting = false;

  get canComment() {
    return this.ticket && this.ticket.agentCommented;
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
        ticketId: this.ticket.id,
        content: this.newComment,
      };

      const result = await this.apollo.mutate({ mutation, variables });

      if (
        result.createComment.errors &&
        result.createComment.errors.length > 0
      ) {
        throw new Error(result.createComment.errors[0]);
      }

      // Add the new comment to the ticket
      this.ticket.comments = [
        ...this.ticket.comments,
        result.createComment.comment,
      ];

      // Clear the comment input
      this.newComment = '';
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      this.isSubmitting = false;
    }
  }
}
