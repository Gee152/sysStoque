process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import 'reflect-metadata'
import { bootstrap } from './delivery/cmd/bootstrap.js';

bootstrap().catch((err) => {
  console.error('[Fatal] Failed to start server:', err);
  process.exit(1);
});
