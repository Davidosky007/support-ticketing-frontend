import { module, test } from 'qunit';
import { setupTest } from 'support-ticketing-frontend/tests/helpers';

module('Unit | Controller | agent/dashboard', function (hooks) {
  setupTest(hooks);

  test('it computes assignedTickets correctly', function (assert) {
    const controller = this.owner.lookup('controller:agent/dashboard');

    // Set up session stub
    controller.session = {
      data: {
        authenticated: {
          user: { id: '123' },
        },
      },
    };

    // Set up model data
    controller.model = [
      { id: '1', agent: { id: '123' }, status: 'OPEN' },
      { id: '2', agent: { id: '456' }, status: 'OPEN' },
      { id: '3', agent: null, status: 'OPEN' },
    ];

    assert.strictEqual(
      controller.assignedTickets.length,
      1,
      'Only tickets assigned to the current agent are returned',
    );
    assert.strictEqual(
      controller.assignedTickets[0].id,
      '1',
      'Correct ticket is returned',
    );
  });

  test('it computes unassignedTickets correctly', function (assert) {
    const controller = this.owner.lookup('controller:agent/dashboard');

    // Set up model data
    controller.model = [
      { id: '1', agent: { id: '123' }, status: 'OPEN' },
      { id: '2', agent: { id: '456' }, status: 'OPEN' },
      { id: '3', agent: null, status: 'OPEN' },
      { id: '4', agent: null, status: 'CLOSED' },
    ];

    assert.strictEqual(
      controller.unassignedTickets.length,
      1,
      'Only open tickets with no agent are returned',
    );
    assert.strictEqual(
      controller.unassignedTickets[0].id,
      '3',
      'Correct ticket is returned',
    );
  });
});
