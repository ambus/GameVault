import { setGlobalOptions } from 'firebase-functions/v2';
import { onRequest } from 'firebase-functions/v2/https';
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';

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

  // In Cloud Functions, __dirname points to /workspace/lib
  // Try multiple possible locations
  const possiblePaths = [
    path.join(__dirname, '..', 'dist', 'GameVault', 'server', 'server.mjs'), // functions/dist/GameVault/server/server.mjs
    path.join(process.cwd(), 'dist', 'GameVault', 'server', 'server.mjs'), // /workspace/dist/GameVault/server/server.mjs
    path.join(__dirname, '..', '..', 'dist', 'GameVault', 'server', 'server.mjs'), // Alternative relative path
  ];

  let serverPath: string | null = null;
  
  // Find the first existing path
  for (const testPath of possiblePaths) {
    if (fs.existsSync(testPath)) {
      serverPath = testPath;
      break;
    }
  }
  
  // If not found, log debug info and throw error
  if (!serverPath) {
    const debugInfo = {
      __dirname,
      cwd: process.cwd(),
      possiblePaths,
      checkedPaths: possiblePaths.map(p => ({ path: p, exists: fs.existsSync(p) }))
    };
    console.error('Server file not found. Debug info:', JSON.stringify(debugInfo, null, 2));
    throw new Error(`Server file not found. Checked paths: ${possiblePaths.join(', ')}`);
  }

  console.log(`Loading server module from: ${serverPath}`);

  // Convert to absolute path and then to file:// URL for ES module import
  const absolutePath = path.resolve(serverPath);
  const serverUrl = url.pathToFileURL(absolutePath).href;
  
  // Use dynamic import() - this works for ES modules in Node.js
  // TypeScript may compile this, but we need to ensure it's not transformed to require()
  // Using eval to prevent TypeScript from transforming the import
  serverModuleCache = await (eval('import'))(serverUrl);
  
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
    region: 'europe-west1',
    invoker: 'public' // Allow public access (unauthenticated requests)
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

