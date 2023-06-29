
# CHAT-QUERY

[en](./README.md)

> Chat-Query 是一个基于元数据模型和 AI 技术，通过自然语言实现数据查询。

## 演示

> [view](https://chat-query.netlify.app/) **由于netlify网络限制问题，请尽量选择一下模式:**

+ 选择网站设置 ![Choose website settings](./public/image.png)
+ 允许不安全内容 ![Allow Unsafe](./public/image1.png)

> [demo](https://cdn.glitch.me/fd139a45-4a65-41b6-9634-41617ab20cdc/%E6%BC%94%E7%A4%BA.gif?v=1686907695067)

+ **功能特点🐂：**

	- 支持导入 DDL、DBML 和数据库逆向解析，AI 自动生成业务模型。
	- 提供业务模型的基本 CRUD 功能、AI 智能分析，支持模型导出为 DDL、DBML 以及与数据库同步。
	- 结合模型和 AI 实现自然语言数据查询，可添加至查询列表并通过 API 调用。

## 应用场景🎬

+ 从低代码到零代码开发。
+ 非业务人员快速进行数据分析。
+ 更多应用场景待探索...

## 开发环境设置

> 👏 欢迎参与 Chat-Query 的建设。

+ 后端：

  ```js
		pnpm start:dev
	```
	- 在 .env 文件中添加 OPEN_AI_API_KEY='sk-...'等环境变量

+ 前端

	```js
		pnpm install
		gitpnpm dev
	```
	-在 .env 文件中添加 NEXT_PUBLIC_OPEN_AI_API_KEY='sk-...'

## 系统架构

![架构](https://cdn.glitch.global/fd139a45-4a65-41b6-9634-41617ab20cdc/%E6%97%A0%E6%A0%87%E9%A2%98-2023-05-31-1202%20(1).png?v=1686908252244)