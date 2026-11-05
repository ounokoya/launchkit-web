// Production entry point: the SvelteKit Node handler, with the security headers on every response,
// static files included (adapter-node serves them before the SvelteKit hooks run).
import { createServer } from 'node:http';

const headers = {
	'X-Content-Type-Options': 'nosniff',
	'Referrer-Policy': 'strict-origin-when-cross-origin',
	'X-Frame-Options': 'DENY',
	'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
	'Cross-Origin-Resource-Policy': 'same-origin',
	'Cross-Origin-Opener-Policy': 'same-origin',
	'Cross-Origin-Embedder-Policy': 'require-corp'
};

// Without ORIGIN (local use, any host name), adapter-node would assume https and refuse every form posted over
// http (SvelteKit CSRF check). The protocol is then taken from the connection itself, never from the client.
const DIRECT_PROTO = 'x-launchkit-direct-proto';
const direct = !process.env.ORIGIN && !process.env.PROTOCOL_HEADER;
if (direct) process.env.PROTOCOL_HEADER = DIRECT_PROTO;

const { handler } = await import('./build/handler.js');
const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? '0.0.0.0';

createServer((req, res) => {
	if (direct) req.headers[DIRECT_PROTO] = 'encrypted' in req.socket && req.socket.encrypted ? 'https' : 'http';
	for (const [name, value] of Object.entries(headers)) res.setHeader(name, value);
	handler(req, res);
}).listen(port, host, () => console.log(`LaunchKit web on http://${host}:${port}`));
