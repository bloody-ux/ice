import Mtop from '@ali/universal-mtop';
import type { StaticDataLoader } from '@ice/runtime/types';

function decorator(dataLoader: Function) {
  return dataLoader;
}

function request(config: StaticDataLoader) {
  const { key } = config;
  if (
    typeof window !== 'undefined' &&
    typeof window.pha === 'object' &&
    typeof window.pha.environment === 'object' &&
    window.pha.dataPrefetch &&
    window.pha.dataPrefetch.call &&
    key
  ) {
    return new Promise((resolve) => {
      window.pha.dataPrefetch.getData({
        key
      },
      (data) => {
        resolve(data);
      },
      (error) => {
        console.error('pha prefetch failed, fallback to mtop request', error, config);
        resolve(Mtop.request(config));
        // reject(error);
      });
    });
  } else {
    return Mtop.request(config);
  }
}

export {
  request,
  decorator,
};
