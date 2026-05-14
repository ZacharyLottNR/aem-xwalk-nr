/// <reference types="@fastly/js-compute" />

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
});

const notFound = () => json({ error: 'Not Found' }, 404);

const error = (message = 'Internal Server Error', status = 500) => json({ error: message }, status);

const cors = () => new Response(null, { status: 204, headers: CORS_HEADERS });

export {
  json, notFound, error, cors,
};
