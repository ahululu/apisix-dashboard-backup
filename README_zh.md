# APISIX Dashboard Backup

[English](./README.md) | 简体中文

APISIX Dashboard Backup 是一个 Chrome 扩展程序，用于备份和恢复 APISIX Dashboard 的配置数据。

## 功能特点

- 一键备份当前 APISIX Dashboard 的所有配置
- 支持备份和恢复以下数据：
  - 路由配置
  - 上游配置
  - 服务配置
  - 消费者配置
- 实时显示备份/恢复进度
- 详细的操作日志
- 支持中英文界面

## 安装方法

### 从 Chrome Web Store 安装(还未上线，暂不可用)
1. 访问 [Chrome Web Store](https://chromewebstore.google.com/detail/apisix-dashboard-%E5%A4%87%E4%BB%BD%E5%B7%A5%E5%85%B7/lmpmkfjofnifhiooomploklbchoeckfg)
2. 点击"添加至 Chrome"

### 手动安装
1. 下载最新版本的扩展程序
2. 打开 Chrome 浏览器，进入扩展程序页面 (chrome://extensions/)
3. 启用"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择解压后的扩展程序文件夹

## 使用说明

1. 备份数据
   - 登录到 APISIX Dashboard
   - 点击扩展程序图标
   - 点击"备份当前站点数据"
   - 等待备份完成，文件会自动下载

2. 恢复数据
   - 登录到目标 APISIX Dashboard
   - 点击扩展程序图标
   - 点击"恢复当前站点数据"
   - 选择备份文件
   - 等待恢复完成

## 注意事项

- 使用前请确保已登录 APISIX Dashboard
- 恢复时请确保目标环境版本兼容
- 建议在恢复前先备份当前配置

## 隐私说明

本扩展程序不会收集或上传任何个人数据，详见 [隐私政策](./PRIVACY.md)。

## 开源协议

本项目采用 Apache License 2.0 协议，详见 [LICENSE](./LICENSE) 文件。

## 问题反馈

如果觉得有用，star本项目是最好的了。如有问题或建议，请提交 [Issue](https://github.com/ahululu/apisix-dashboard-backup/issues)。 