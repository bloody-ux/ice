import Mtop from '@ali/universal-mtop';
import type { StaticDataLoader } from '@ice/runtime/types';

// 先写死timeout，未来如果有需要，可以通过dataLoader函数额外设置属性来支持
const TIMEOUT = 3000;
const APPWORKER = 'AppWorker';

function timeout(interval: number) {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('waiting appWorker timeout'))
    }, interval);
  });
}

function decorator(dataLoader: Function, index: Number = 0) {
  if (
    typeof window !== 'undefined' &&
    typeof window.pha === 'object' &&
    typeof window.pha.environment === 'object'
  ) {
    return (ctx: any) => {
      // TODO： 这个链路需要打磨，主要涉及：是否要一个manifest一个worker？worker和webview通信协议设计（类似于小程序worker和webview的相互等待握手机制）
      const appWorkerPromsie = new Promise((resolve) => {
        const handler = (event) => {
          if (event.origin === APPWORKER) {
            if (event.data && event.data.index === index) {
              resolve(event.data.data);
              // 注意只会使用一次
              removeEventListener('message', handler);
            }
          }
        };
        addEventListener('message', handler);
      })
      const result = Promise.race([appWorkerPromsie, timeout(TIMEOUT)]);

      return result.catch((reason) => {
        console.error(reason);
        // 超时后，兜底尝试
        return dataLoader(ctx);
      })
    };
  }

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
