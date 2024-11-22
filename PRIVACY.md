# 隐私政策

[English](./PRIVACY_en.md) | 简体中文

最后更新日期：2024-11-22

## 数据收集

APISIX Dashboard Backup 扩展程序不会收集或上传任何个人数据。所有操作均在本地完成。

## 数据访问

本扩展程序仅会访问：
1. 当前打开的 APISIX Dashboard 页面
2. Dashboard 的本地存储中的登录令牌
3. 用户选择的备份文件

## 数据存储

- 备份数据以 JSON 文件形式保存在用户选择的本地位置
- 不会在云端存储任何数据
- 不会与第三方共享任何数据

## 权限说明

本扩展程序请求的权限用途：
- `activeTab`: 用于访问当前标签页
- `scripting`: 用于执行必要的页面脚本
- `host_permissions`: 用于访问 APISIX Dashboard API

## 隐私保护

我们采取以下措施保护您的隐私：
1. 所有操作在本地执行
2. 不收集任何遥测数据
3. 不使用任何跟踪技术
4. 源代码完全开放

## 更新说明

我们可能会更新本隐私政策。更新时会在此页面发布新的内容。

## 联系我们

如有隐私相关问题，请通过以下方式联系我们：
- 提交 [Issue](https://github.com/ahululu/apisix-dashboard-backup/issues)
- 发送邮件至：ahululu404@gmail.com