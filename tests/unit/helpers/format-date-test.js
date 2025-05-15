import { module, test } from 'qunit';
import { formatDate } from 'support-ticketing-frontend/helpers/format-date';

module('Unit | Helper | format-date', function () {
  test('it formats dates correctly', function (assert) {
    const testDate = new Date('2023-01-15T12:30:00');
    const result = formatDate([testDate]);

    // Test that the result contains the expected parts (can vary by locale)
    assert.ok(result.includes('2023'), 'Formatted date includes year');
    assert.ok(/Jan|January/.test(result), 'Formatted date includes month');
    assert.ok(result.includes('15'), 'Formatted date includes day');

    // Test with null date
    assert.strictEqual(
      formatDate([null]),
      '',
      'Returns empty string for null date',
    );
  });
});
