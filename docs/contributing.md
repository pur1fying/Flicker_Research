---
title: 如何新增文档
updated: '2026-09-16'
---

# 如何新增文档

## 运行网站

在项目的 docs 目录安装锁定依赖后：

```sh
pnpm install --frozen-lockfile
pnpm docs:dev
pnpm docs:check
pnpm docs:build
pnpm docs:preview
```

开发与预览仅监听本机。构建使用已有原文，不联网下载资料。`docs:build:subpath` 用 `/camera-research/` 验证子路径，`docs:build:public` 只准备已明确允许再分发的附件；这些命令不执行公开部署。

## 新增资料卡

在 sources 目录新增一个 Markdown 文件，frontmatter 采用以下字段。`sourceId` 为稳定的小写短名，不因标题修订而变化。

```yaml
title: 资料中文标题
sourceId: example-source
sourceType: 厂商资料
canonicalUrl: https://example.com/original
year: 2026
topics: [快门与传感器]
scenes: [场景照明]
summary: 用一两句话说明资料解决的问题。
readingStatus: 项目页已核对
accessStatus: 原文可访问
checkedAt: '2026-09-16'
updated: '2026-09-16'
```

该例是字段说明，不是纳入资料。保存符合约定的新卡片后，资料库、筛选和本地搜索会从内容生成，不需要维护第二份目录数据。

开发模式发现新增或删除 Markdown 时，会合并短时间内的改动并自动重启文档进程，使页面清单和本地搜索索引保持同步。修改现有正文仍使用正常热更新。构建输出目录不参加文件监控。

## 正文必须说明什么

- 实际读过的章节/图表/代码；全文未取得时明确写出。
- 数据规模、计数单位、GT、采集/合成过程与参数单位。
- 灯光、快门、颜色、材质与运动的适用条件。
- 作者原话的简短摘录、我们自己的解释和推断分开。
- 重要结论链接到原始章节、图表或固定提交代码行。

一般主题文档通过 `sources: [example-source]` 关联资料，页末自动显示资料入口和反向引用。镜像、版本和官方仓库在原卡片正文中关联，不另建重复记录。

## 本地原文

PDF 存在项目的本地研究归档目录，资料卡的 attachments 记录文件名、SHA256、显示名称与 `redistributable`。默认不允许公开构建复制附件；仅确有许可依据时设置为 true。

使用 `<OriginalReader />` 显示原文。准备阶段校验 PDF 文件头和校验值，缺失原文时仍可构建并显示外部来源入口。PDF 内全文查找使用浏览器阅读器，站点搜索索引的是 Markdown。

## 文件与版本约定

文档只在当前主题页维护一份，历史快照标记 archived。文件标题、更新日期和证据核查日期分开；未知发表年份可不填，不能用访问年份伪装发表年份。

本机缓存、依赖和生成原文副本通过 `.git/info/exclude` 排除。远端和公开发布不在首版范围。
