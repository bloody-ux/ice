# Changelog

## 1.3.6
- fix: 非localhost场景下，重写manifest里面页面path为基于域名的地址，而非ip的地址，从而避免在manifest被缓存的情况下，出现ip地址失效后无法访问页面问题
- chore: 通过Cache-Control: no-store，使得本地manifest返回时，强制其失效

## 1.3.5
- fix: 修复`bounces`参数无法设置问题

## 1.3.1
- chore: 由于当前worker链路存在问题，默认禁用`dataLoader.useAppWorker`
- refactor: 支持自动识别manifest的`routes`，无需开发者显式在app.ts中定义

## 1.3.0
- feat: 整合pha dataPrefetch特性，这样子更加合理，因为pha有dataLoader.useAppWorker的配置，而dataPrefetch的支持也会依赖appWorker。之前额外拆分出`@ali/ice-plugin-prefetch`并不科学。
- refactor: 更合理的app-worker生成逻辑：当存在`app-worker.ts`或者`dataLoader.useAppWorker`有开启的情况下，未来如果有新特性加入的话，可能这个逻辑还会变
- fix: 修复`appWorker.ejs`中postMessage传参错误的问题，传入的第二个参数必须是当前页面的`key`，而不能是随意的字符串
- fix: 修复`app-worker.js`生成出来是`esm`模块的问题，导致worker环境报错，当前改为`iife`格式
- fix: 修复`appWorker.ejs`中错误获取loader的问题，少了一层`config.loader`

## 1.2.0
- feat: 支持更加符合常识地生成`app-worker.js`以及更新对应的manifest项更新。原本的逻辑是有了`app-worker.ts`才会生成。现在的逻辑是，只要有依赖`app-worker.js`的场景（比如dataLoader要求使用appWorker），就会生成。

## 1.1.0
- feat: 本地开发环境下npm start开启的服务页面，在手淘中打开时(需要添加?pha=true查询字符串)，可以开启pha容器，从而实现快速调试开发。

## 1.0.0

- feat: 将包发布到内网npm
- fix: 修复pha生成`data_prefetch`配置时错误层级导致pha data prefetch始终不生效的问题

## 3.0.0

### Major Changes

- 583c29b3: feat: the target of PHA worker should be appWorker.

## 2.0.3

### Patch Changes

- b1e89bc7: fix: PHA plugin can only run in web
- d4f943fb: feat: support downgradeUrl
- 922f0700: feat: support config of dataLoader for pha plugin
- ce94e054: fix: fix frames build err in multiple
- a878225f: fix: dataLoader is sent repeatedly in PHA

## 2.0.2

### Patch Changes

- 4e1d9065: refactor: reuse route paths
- 085498aa: fix: use latest plugin API of excuteServerEntry
- 83af2887: feat: support pull refresh

## 2.0.1

### Patch Changes

- 0c61f469: fix: prevent data loader to breack generate manifest
  fix: should replace env vars when build appWork

## 2.0.0

### Major Changes

- 6824ad63: fix: fix data of prefetch decamelize (break change)
- 73ae8bf4: fix: app-worker is not compiled when set a custom name
- 1c09e79e: fix: support plugin-pha interface optional
- 56fb406e: fix: support types definition without specify esm folder

## 1.1.3

### Patch Changes

- [fix] dev manifest should work when manifest has not tabBar
- [fix] preload should be false default
- [fix] print log once
- [feat] support configure for resource_prefetch

## 1.1.2

- [fix] should't parse template in SSR/SSG
- [feat] support dynamic data loader for pha worker

## 1.1.1

- [feat] support resource_prefetch to preload resource
- [feat] support enableExpiredManifest
- [feat] support configure `enableExpiredManifest`

## 1.1.0

- [feat] support static dataloader set to manifest

## 1.0.3

- [fix] fix lanUrlForTerminal when dev start
- [feat] optimize log

## 1.0.2

- [fix] fix dev lanUrlForTerminal err
- [fix] add title of manifest
- [fix] add pha = true when dev

## 1.0.1

- [fix] failed to get route config when re-define route path

## 1.0.0

- [feat] plugin to enable PHA features
