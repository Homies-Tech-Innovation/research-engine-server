export const API_PREFIX = '/api/v1';

export const IGNORED_ROUTES = new Set([
  // Health Checks (K8s, AWS ALB, Docker)
  '/health',
  '/health/live',
  '/health/ready',
  '/status',
  '/ping',

  // Monitoring
  '/metrics', // Prometheus

  // Browser Noise
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
]);
