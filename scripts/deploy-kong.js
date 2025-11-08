const fetch = require('node-fetch');

const KONG_ADMIN = process.env.KONG_ADMIN || 'http://localhost:8001';
const [,, serviceName, upstreamUrl] = process.argv;

if (!serviceName || !upstreamUrl) {
  console.error('Usage: node deploy-kong.js <serviceName> <upstreamUrl>');
  process.exit(1);
}

async function createService() {
  await fetch(`${KONG_ADMIN}/services`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({name: serviceName, url: upstreamUrl})
  });
}

async function createRoute() {
  await fetch(`${KONG_ADMIN}/services/${serviceName}/routes`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({paths: ['/v1/orders'], methods:['GET','POST']})
  });
}

async function addRateLimit() {
  await fetch(`${KONG_ADMIN}/services/${serviceName}/plugins`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({
      name: 'rate-limiting',
      config: {minute: 100, policy: 'local'}
    })
  });
}

(async ()=>{
  await createService();
  await createRoute();
  await addRateLimit();
  console.log('✅ Deployed to Kong:', serviceName);
})();