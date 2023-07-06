# @ali/ice-plugin-pha

ice3结合pha容器的插件

## Usage

```js
import { defineConfig } from '@ice/app';
import pha from '@ali/ice-plugin-pha';

export default defineConfig(() => ({
  plugins: [pha()],
}));
```

## 和@ice/plugin-pha的区别

- 实现本地开发环境下的页面，也能直接在手淘中开启pha容器调试（包括支持pha的data prefetch）
- 实现pha容器data prefetch失败后，兜底使用universal-mtop来访问
- 合并了`@ali/ice-plugin-prefetch`的逻辑，这样更加合理
- 自动识别`routes`并写入到manifest中，无需手动在`app.ts`中配置
- 默认禁用`dataLoader.useAppWorker`
