import { module, test } from 'qunit';
import { setupTest } from 'support-ticketing-frontend/tests/helpers';

module('Unit | Route | agent/dashboard', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const route = this.owner.lookup('route:agent/dashboard');
    assert.ok(route);
  });

  test('model handles errors gracefully', async function (assert) {
    const route = this.owner.lookup('route:agent/dashboard');

    // Mock apollo service to simulate error
    route.apollo = {
      query: () => {
        throw new Error('Test error');
      },
    };

    const result = await route.model();
    assert.deepEqual(result, [], 'Returns empty array on error');
  });
});
