# Camera Research

频闪数据集研究文档站。当前范围：可追溯的文献检索、真实照明成像模型、数据与真值、Kubric 能力审计；不生成训练数据、不训练网络。

## 本地启动

需要 Node.js 22+、pnpm 10.33.2。

```sh
pnpm --dir docs install --frozen-lockfile
pnpm --dir docs docs:dev
```

启动后访问终端显示的本机地址，默认 [http://127.0.0.1:5173](http://127.0.0.1:5173)。

## 构建与检查

```sh
pnpm --dir docs docs:build
pnpm --dir docs docs:preview
pnpm --dir docs docs:build:subpath
pnpm --dir docs docs:build:public
pnpm --dir docs docs:check
pnpm --dir docs docs:test
```

普通构建包含本地可用 PDF；公开构建只准备明确允许再分发的原文。以上命令均不执行部署。缺少本地原文时仍可阅读笔记和来源链接。

## 内容入口

- [研究总览](docs/overview.md)
- [检索方法与覆盖](docs/research/index.md)
- [查询日志](docs/research/search-log.md)
- [文档维护约定](docs/contributing.md)

新增内容维护在 docs 中；原始下载材料位于本地研究归档目录。网站不依赖联网下载来构建。

## 代码仓库

远程仓库：[Pur1fying/Flicker_Research](https://github.com/Pur1fying/Flicker_Research)，主分支为 `main`。

仓库包含研究文档、网站源码、检索记录和依赖锁文件。本地原文归档、依赖、缓存与构建产物不纳入版本控制；机器专用忽略规则维护在 `.git/info/exclude`。克隆后若没有本地 PDF，网站仍可构建并阅读正文、资料卡和原始来源链接。
