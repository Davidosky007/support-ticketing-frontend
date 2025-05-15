import { module, test } from 'qunit';
import { setupRenderingTest } from 'support-ticketing-frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ticket-row', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders ticket information correctly', async function (assert) {
    this.set('ticket', {
      id: '123',
      subject: 'Test Ticket',
      status: 'OPEN',
      customer: { name: 'John Doe' },
      createdAt: new Date().toISOString(),
      agent: null,
    });

    await render(hbs`
      <div class="tickets-grid ticket-row {{this.ticket.status}}">
        <div class="ticket-id">{{this.ticket.id}}</div>
        <div class="ticket-subject">{{this.ticket.subject}}</div>
        <div class="ticket-customer">{{this.ticket.customer.name}}</div>
        <div class="ticket-status">
          <span class="status-badge {{this.ticket.status}}">{{this.ticket.status}}</span>
        </div>
      </div>
    `);

    assert.dom('.ticket-id').hasText('123');
    assert.dom('.ticket-subject').hasText('Test Ticket');
    assert.dom('.ticket-customer').hasText('John Doe');
    assert.dom('.status-badge').hasText('OPEN');
    assert.dom('.status-badge').hasClass('OPEN');
  });
});
