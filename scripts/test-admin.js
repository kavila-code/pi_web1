#!/usr/bin/env node
// Script de prueba para consultar el endpoint admin dashboard
// Uso:
//   node scripts/test-admin.js <JWT>
// o
//   ADMIN_JWT=... node scripts/test-admin.js

import { request as httpRequest } from 'http';
import { request as httpsRequest } from 'https';
import { URL } from 'url';

const token = process.env.ADMIN_JWT || process.argv[2];
const base = process.env.BASE_URL || 'http://localhost:3000';

if (!token) {
  console.error('Error: debes proporcionar un JWT como argumento o en la variable de entorno ADMIN_JWT');
  console.error('Ejemplo: ADMIN_JWT=abc123 node scripts/test-admin.js');
  process.exit(1);
}

const path = '/api/v1/admin/dashboard/stats';
const url = new URL(path, base);

const isHttps = url.protocol === 'https:';
const options = {
  method: 'GET',
  hostname: url.hostname,
  port: url.port || (isHttps ? 443 : 80),
  path: url.pathname + url.search,
  headers: {
    Authorization: `Bearer ${token}`,
    'Accept': 'application/json',
  },
};

const req = (isHttps ? httpsRequest : httpRequest)(options, (res) => {
  const { statusCode } = res;
  let raw = '';
  res.setEncoding('utf8');
  res.on('data', (chunk) => (raw += chunk));
  res.on('end', () => {
    console.log(`HTTP ${statusCode} ${res.statusMessage || ''}`);
    try {
      const parsed = JSON.parse(raw);
      console.log('Respuesta JSON:');
      console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log('Respuesta (no JSON):');
      console.log(raw);
    }
    process.exit(statusCode >= 200 && statusCode < 300 ? 0 : 2);
  });
});

req.on('error', (err) => {
  console.error('Error en la petición:', err.message);
  process.exit(1);
});

req.end();
