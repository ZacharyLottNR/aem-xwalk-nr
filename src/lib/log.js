/// <reference types="@fastly/js-compute" />

import { ConfigStore } from 'fastly:config-store';

const log = (req, resp) => {
  let logLevel = 'info';
  try {
    const config = new ConfigStore('config_default');
    logLevel = config.get('LOG_LEVEL') || 'info';
  } catch {
    // no config store in local dev
  }

  const record = {
    method: req.method,
    url: req.url,
    status: resp.status,
  };

  if (logLevel === 'debug' || logLevel === 'DEBUG') {
    record.requestHeaders = Object.fromEntries(req.headers);
    record.responseHeaders = Object.fromEntries(resp.headers);
  }

  console.log(JSON.stringify(record));
};

export { log };
