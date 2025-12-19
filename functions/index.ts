import { onRequest } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';
import * as path from 'path';
import * as url from 'url';
import * as fs from 'fs';

// Set global options for all functions
setGlobalOptions({
  maxInstances: 10,
  memory: '512MiB',
  timeoutSeconds: 60,
  region: 'europe-west1'
});

// Cache the server module import
let serverModuleCache: any = null;

async function getServerModule() {
  if (serverModuleCache) {
    return serverModuleCache;
  }

  // The path is relative to the functions/lib directory after build
  const serverPath = path.join(__dirname, '..', 'dist', 'GameVault', 'server', 'server.mjs');
  
  // Check if file exists
  if (!fs.existsSync(serverPath)) {
    throw new Error(`Server file not found at: ${serverPath}`);
  }

  // Convert to file URL for ES module import
  const serverUrl = url.pathToFileURL(serverPath).href;
  serverModuleCache = await import(serverUrl);
  
  return serverModuleCache;
}

/**
 * Cloud Function for Server-Side Rendering
 * Handles all requests and renders the Angular application
 */
export const ssr = onRequest(
  {
    concurrency: 80,
    maxInstances: 10,
    memory: '512MiB',
    timeoutSeconds: 60,
    region: 'europe-west1'
  },
  async (req, res) => {
    try {
      const serverModule = await getServerModule();
      
      if (serverModule.reqHandler) {
        await serverModule.reqHandler(req, res);
      } else {
        throw new Error('reqHandler not found in server module');
      }
    } catch (error) {
      console.error('SSR Error:', error);
      if (!res.headersSent) {
        res.status(500).send('Internal Server Error');
      }
    }
  }
);

