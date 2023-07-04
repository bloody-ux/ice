# @ali/ice-plugin-pha

An ice.js plugin to enable PHA features.

## Usage

```js
import { defineConfig } from '@ice/app';
import pha from '@ali/ice-plugin-pha';

export default defineConfig(() => ({
  plugins: [pha()],
}));
```

## New Features

- 实现本地开发环境下的页面，也能直接在手淘中开启pha容器调试
