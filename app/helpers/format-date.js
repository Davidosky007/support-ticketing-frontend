import { helper } from '@ember/component/helper';

export function formatDate([date]) {
  if (!date) {
    return '';
  }

  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  return new Date(date).toLocaleDateString(undefined, options);
}

export default helper(formatDate);
