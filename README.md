# APISIX Dashboard Backup

English | [简体中文](./README_zh.md)

APISIX Dashboard Backup is a Chrome extension for backing up and restoring APISIX Dashboard configuration data.

## Features

- One-click backup of all current APISIX Dashboard configurations
- Support backup and restore of the following data:
  - Route configurations
  - Upstream configurations
  - Service configurations
  - Consumer configurations
- Real-time backup/restore progress display
- Detailed operation logs
- Support for Chinese and English interfaces

## Installation

### Install from Chrome Web Store
1. Visit [Chrome Web Store](https://chromewebstore.google.com/detail/apisix-dashboard-%E5%A4%87%E4%BB%BD%E5%B7%A5%E5%85%B7/lmpmkfjofnifhiooomploklbchoeckfg)
2. Click "Add to Chrome"

### Manual Installation
1. Download the latest version of the extension
2. Open Chrome browser, go to extensions page (chrome://extensions/)
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the unzipped extension folder

## Usage

1. Backup Data
   - Log in to APISIX Dashboard
   - Click the extension icon
   - Click "Backup Current Site"
   - Wait for backup to complete, file will download automatically

2. Restore Data
   - Log in to target APISIX Dashboard
   - Click the extension icon
   - Click "Restore Current Site"
   - Select backup file
   - Wait for restore to complete

## Notes

- Make sure you are logged into APISIX Dashboard before use
- Ensure target environment version is compatible when restoring
- Recommended to backup current configuration before restoration

## Privacy Statement

This extension does not collect or upload any personal data. See [Privacy Policy](./PRIVACY.md) for details.

## License

This project is licensed under the Apache License 2.0, see [LICENSE](./LICENSE) file for details.

## Feedback

For issues or suggestions, please submit an [Issue](https://github.com/ahululu/apisix-dashboard-backup/issues). 