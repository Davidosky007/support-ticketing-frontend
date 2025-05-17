import { module, test } from 'qunit';
import { setupTest } from 'support-ticketing-frontend/tests/helpers';

module('Unit | Controller | agent/tickets', function (hooks) {
  setupTest(hooks);

  test('it computes filteredTickets correctly with ALL filter', function (assert) {
    const controller = this.owner.lookup('controller:agent/tickets');

    controller.statusFilter = 'ALL';
    controller.tickets = [
      { id: '1', status: 'OPEN' },
      { id: '2', status: 'CLOSED' },
      { id: '3', status: 'PENDING' },
    ];

    assert.strictEqual(
      controller.filteredTickets.length,
      3,
      'All tickets returned when filter is ALL',
    );
  });

  test('it computes filteredTickets correctly with specific filter', function (assert) {
    const controller = this.owner.lookup('controller:agent/tickets');

    controller.statusFilter = 'OPEN';
    controller.tickets = [
      { id: '1', status: 'OPEN' },
      { id: '2', status: 'CLOSED' },
      { id: '3', status: 'OPEN' },
    ];

    assert.strictEqual(
      controller.filteredTickets.length,
      2,
      'Only tickets with matching status are returned',
    );
    assert.strictEqual(
      controller.filteredTickets[0].id,
      '1',
      'First filtered ticket is correct',
    );
    assert.strictEqual(
      controller.filteredTickets[1].id,
      '3',
      'Second filtered ticket is correct',
    );
  });
});
