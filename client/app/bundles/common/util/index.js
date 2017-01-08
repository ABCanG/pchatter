import moment from 'moment';

moment.locale('ja');

export function convertError(error) {
  const res = error.response;
  if (String(res.status).startsWith('5')) {
    return {_error: res.statusText};
  }

  const {errors} = res.data;
  return errors.reduce((ret, {message}) => {
    const regexp = /params\[:(\w+)\] /;
    const match = message.match(regexp);
    if (match) {
      const name = match[1];
      const msg = message.replace(regexp, '');
      return Object.assign({}, ret, {[name]: msg});
    }

    const index = message.indexOf(' ');
    const name = message.slice(0, index).toLowerCase();
    const msg = message.slice(index + 1);
    return Object.assign({}, ret, {[name]: msg});
  }, {});
}

export function convertFormData(params) {
  return Object.entries(params).reduce((data, [k, v]) => {
    if (Array.isArray(v)) {
      for (const ele of v) {
        data.append(`${k}[]`, ele);
      }
    } else {
      data.append(k, v);
    }
    return data;
  }, (new FormData()));
}

export function formatTime(time) {
  if (!time) {
    return '';
  }

  const timeMoment = moment(time);
  return `${timeMoment.format('lll')}(${timeMoment.fromNow()})`;
}

export function statusToText(status) {
  switch (status) {
    case 'created':
      return '実行前';

    case 'assigned':
    case 'downloading':
    case 'downloaded':
    case 'collecting':
    case 'execution':
    case 'collected':
    case 'poweroff_tracer':
    case 'uploading_tracelog':
    case 'uploaded_tracelog':
      return '実行中';

    case 'done':
      return '完了';

    case 'failed':
      return '失敗';

    default:
      return '不明';
  }
}

export function statusToProgress(status) {
  if (status === 'failed') {
    return 100;
  }
  const statuses = [
    'created',
    'assigned',
    'downloading',
    'downloaded',
    'collecting',
    'execution',
    'collected',
    'poweroff_tracer',
    'uploading_tracelog',
    'uploaded_tracelog',
/*
   'analyzing',
    'analyzed',
    'uploading_report',
    'uploaded_report',
*/
    'done',
  ];
  const index = statuses.indexOf(status);
  return index >= 0 ? ((index / (statuses.length - 1)) * 100) : 0;
}
