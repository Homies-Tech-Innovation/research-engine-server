export const IGNORED_ROUTES = new Set([
  // Health Checks (K8s, AWS ALB, Docker)
  '/health',
  '/status',
  '/api/health',
  '/ping',

  // Monitoring
  '/metrics', // Prometheus

  // Browser Noise
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
]);
