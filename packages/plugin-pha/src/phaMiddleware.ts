import * as path from 'path';
import type { ServerResponse } from 'http';
import * as fs from 'fs';
import type { ExpressRequestHandler } from 'webpack-dev-server';
import { getCompilerConfig } from './constants.js';
import { parseManifest, rewriteAppWorker, getAppWorkerUrl, getMultipleManifest, type ParseOptions } from './manifestHelpers.js';
import { getAppWorkerContent, type Options } from './generateManifest.js';
import type { Manifest } from './types.js';

function sendResponse(res: ServerResponse, content: string, mime: string): void {
  res.statusCode = 200;
  // 禁用缓存
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', `${mime}; charset=utf-8`);
  res.end(content);
}

const createPHAMiddleware = ({
  rootDir,
  outputDir,
  parseOptions,
  getAllPlugin,
  getAppConfig,
  dataLoaderUseAppWorker,
  getRoutesConfig,
  getDataloaderConfig,
  compiler,
  logger,
}: Options): ExpressRequestHandler => {
  const phaMiddleware: ExpressRequestHandler = async (req, res, next) => {
    let requestPath = path.basename(req.path);

    // 支持从pha容器来的manifest请求，从而支持调试本地代码
    const { wh_ttid, pha } = req.query;
    if (wh_ttid === 'native' && pha === 'true') {
        requestPath += '-manifest.json';
    }
    const requestManifest = requestPath.endsWith('manifest.json');

    const requestAppWorker = req.url === '/app-worker.js';
    if (requestManifest || requestAppWorker) {
      const [appConfig, routesConfig] = await Promise.all([getAppConfig(['phaManifest']), getRoutesConfig()]);

      let dataloaderConfig;
      try {
        // dataLoader may have side effect code.
        dataloaderConfig = await getDataloaderConfig();
      } catch (err) {
        logger.briefError('GetDataloaderConfig failed.');
        logger.debug(err);
      }

      let manifest: Manifest = appConfig.phaManifest;
      const appWorkerPath = getAppWorkerUrl(manifest, path.join(rootDir, 'src'));
      const entry = path.join(rootDir, './.ice/appWorker.ts');
      const entryExists = fs.existsSync(entry);

      if (appWorkerPath || (entryExists && dataLoaderUseAppWorker)) {
        // over rewrite appWorker.url to app-worker.js
        manifest = rewriteAppWorker(manifest);
        if (requestAppWorker) {
          const entry = path.join(rootDir, './.ice/appWorker.ts');
          sendResponse(
            res,
            await getAppWorkerContent(compiler, {
              entry: entryExists ? entry : appWorkerPath,
              outfile: path.join(outputDir, 'app-worker.js'),
            }, getCompilerConfig({
              getAllPlugin,
            })),
            'text/javascript',
          );
          return;
        }
      }

      // 将hostname还原为实际页面请求的hostname，而非ip地址
      const baseUrl = new URL(parseOptions.publicPath);
      const prefixUrl = new URL(parseOptions.urlPrefix);
      if (req.hostname !== 'localhost') {
          baseUrl.hostname = req.hostname;
          prefixUrl.hostname = req.hostname;
      }

      const phaManifest = await parseManifest(manifest, {
        ...parseOptions,
        // 由于
        publicPath: baseUrl.href,
        urlPrefix: prefixUrl.href,
        routesConfig,
        dataloaderConfig,
      } as ParseOptions);

      // 对于本地请求，永远取最新的manifest，不能缓存
      phaManifest.max_age = 0;
      if (!phaManifest?.tab_bar) {
        const multipleManifest = getMultipleManifest(phaManifest);
        const manifestKey = requestPath.replace('-manifest.json', '').replace(/^\//, '');
        if (multipleManifest[manifestKey]) {
          sendResponse(res, JSON.stringify(multipleManifest[manifestKey]), 'application/json');
          return;
        }
      } else if (requestPath === 'manifest.json') {
        sendResponse(res, JSON.stringify(phaManifest), 'application/json');
        return;
      }
    }
    next();
  };
  return phaMiddleware;
};

export default createPHAMiddleware;
