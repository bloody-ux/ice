---
title: 服务端渲染 SSR
order: 11
---
:::caution
小程序端不支持该能力。
:::
服务器渲染，简称 SSR (Server Side Rendering)，是一种在服务端运行 Node.js 程序动态生成 HTML 的渲染方式。

SSR 相比传统在浏览器端渲染的模式(CSR)，受设备性能和网络情况的影响更小，可以达到更好的性能体验和 SEO 能力。

## 开启 SSR

与 SSG 不同的是，ice.js 中 SSR 不是默认启用的。

在 `ice.config.mts` 中，增加如下配置：

```tsx
import { defineConfig } from '@ice/app';

export default defineConfig(() => ({
  // ...
  ssr: true,
}));
```

## 数据请求

开启 SSR 后，路由组件中导出的 `dataLoader` 方法将会在 Server 端被执行，如果 SSR 渲染成功，在 Client 端将不会再次调用 `dataLoader`，而会复用 SSR 的结果。当页面在浏览器侧通过路由跳转，或页面降级时，才会在 Client 端调用 `dataLoader`。

因此，一般情况下 `dataLoader` 内的数据请求需要保持同构，在 Server 端和 Client 端都能执行。

如果确实需要为 Server 端指定不一样的数据请求方式，可以通过定义 `serverDataLoader` 来实现。当路由组件声明了 `serverDataLoader`，会在 SSR 优先使用这个方法。

示例：

```tsx
import { useData, defineDataLoader, defineServerDataLoader } from 'ice';

// Client 端专用的数据请求
export const dataLoader = defineDataLoader(() => {
  const data = await fetch('https://example.com/api/xxx');

  return data;
});

// Server 端专用的数据请求
export const serverDataLoader = defineServerDataLoader(() => {
  const data = await sendRequestInServer();

  return data;
});
```

构建 Client 端的 Bundle 时，会移除 `getServerData()` 及其相关依赖。