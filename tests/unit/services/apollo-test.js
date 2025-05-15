import { module, test } from 'qunit';
import { setupTest } from 'support-ticketing-frontend/tests/helpers';

module('Unit | Service | apollo', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const service = this.owner.lookup('service:apollo');
    assert.ok(service);
  });

  test('it adds auth headers when session is authenticated', function (assert) {
    const service = this.owner.lookup('service:apollo');

    // Mock fetch to capture request parameters
    const originalFetch = window.fetch;
    try {
      let capturedHeaders = null;
      window.fetch = (url, options) => {
        capturedHeaders = options.headers;
        return Promise.resolve({
          json: () => Promise.resolve({ data: {} }),
        });
      };

      // Set up authenticated session
      service.session = {
        isAuthenticated: true,
        data: {
          authenticated: {
            token: 'test-token',
          },
        },
      };

      // Make a test request
      service.request('query { test }');

      assert.strictEqual(
        capturedHeaders['Authorization'],
        'Bearer test-token',
        'Authentication header is added with token',
      );
    } finally {
      window.fetch = originalFetch;
    }
  });
});
