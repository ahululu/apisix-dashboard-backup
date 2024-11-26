function createFloatingWindow() {
  // 检查是否已存在窗口
  const existingWindow = document.getElementById('apisix-backup-floating-window');
  if (existingWindow) {
    return existingWindow;
  }

  const floatingWindow = document.createElement('div');
  floatingWindow.id = 'apisix-backup-floating-window';
  floatingWindow.innerHTML = `
    <div class="floating-header">
      <div class="header-left">
        <span class="logo">A</span>
        <span>备份/恢复进度</span>
      </div>
      <div class="header-buttons">
        <button class="minimize-btn">_</button>
        <button class="close-btn">×</button>
      </div>
    </div>
    <div class="floating-content">
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress"></div>
        </div>
        <div class="progress-text">0%</div>
      </div>
      <div class="log-container"></div>
    </div>
    <div class="minimized-content">
      <span class="minimized-logo">A</span>
    </div>
  `;
  
  const style = document.createElement('style');
  style.textContent = `
    #apisix-backup-floating-window {
      position: fixed;
      bottom: 40px;
      right: 40px;
      width: 600px;
      background: white;
      border: 1px solid #ccc;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      z-index: 10000;
      font-family: "Microsoft YaHei", "微软雅黑", sans-serif;
    }
    
    #apisix-backup-floating-window .floating-header {
      padding: 8px;
      background: #f5f5f5;
      border-bottom: 1px solid #ddd;
      border-radius: 8px 8px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: move;
    }
    
    #apisix-backup-floating-window .header-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    #apisix-backup-floating-window .logo {
      width: 24px;
      height: 24px;
      border-radius: 4px;
    }
    
    #apisix-backup-floating-window .minimized-content {
      display: none;
      width: 48px;
      height: 48px;
      cursor: pointer;
      border-radius: 50%;
      overflow: hidden;
      background: white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    }
    
    #apisix-backup-floating-window .minimized-logo {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    #apisix-backup-floating-window.minimized {
      width: 48px;
      height: 48px;
      background: transparent;
      border: none;
      box-shadow: none;
    }
    
    #apisix-backup-floating-window.minimized .floating-header,
    #apisix-backup-floating-window.minimized .floating-content {
      display: none;
    }
    
    #apisix-backup-floating-window.minimized .minimized-content {
      display: block;
    }
    
    #apisix-backup-floating-window .floating-content {
      padding: 10px;
      height: 300px;
      display: flex;
      flex-direction: column;
    }
    
    #apisix-backup-floating-window .progress-container {
      margin-bottom: 10px;
      flex-shrink: 0;
    }
    
    #apisix-backup-floating-window .progress-bar {
      width: 100%;
      height: 20px;
      background-color: #f0f0f0;
      border-radius: 10px;
      overflow: hidden;
    }
    
    #apisix-backup-floating-window .progress {
      width: 0%;
      height: 100%;
      background-color: #4CAF50;
      transition: width 0.3s ease;
    }
    
    #apisix-backup-floating-window .progress-text {
      text-align: center;
      margin-top: 5px;
      margin-bottom: 10px;
      font-size: 12px;
    }
    
    #apisix-backup-floating-window .log-container {
      flex-grow: 1;
      overflow-y: auto;
      border: 1px solid #eee;
      border-radius: 4px;
      padding: 8px;
      font-family: monospace;
      font-size: 12px;
      background-color: #fafafa;
      height: calc(100% - 80px);
      white-space: nowrap;
      overflow-x: auto;
    }
    
    #apisix-backup-floating-window .log-entry {
      margin: 2px 0;
      padding: 2px 4px;
      border-radius: 2px;
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
    }
    
    #apisix-backup-floating-window .log-success {
      color: #4CAF50;
    }
    
    #apisix-backup-floating-window .log-warning {
      color: #FFA500;
    }
    
    #apisix-backup-floating-window .log-error {
      color: #FF0000;
    }
  `;
  
  document.head.appendChild(style);
  
  // 添加持久化存储
  function saveWindowState() {
    const state = {
      minimized: floatingWindow.classList.contains('minimized'),
      position: {
        left: floatingWindow.style.left,
        top: floatingWindow.style.top,
        right: floatingWindow.style.right,
        bottom: floatingWindow.style.bottom
      },
      exists: true
    };
    chrome.storage.local.set({ 'apisixBackupWindowState': state });
  }
  
  // 恢复窗口状态
  async function restoreWindowState() {
    const result = await chrome.storage.local.get('apisixBackupWindowState');
    const state = result.apisixBackupWindowState;
    if (state) {
      if (state.minimized) {
        floatingWindow.classList.add('minimized');
        minimizeBtn.textContent = '□';
      }
      if (state.position) {
        Object.assign(floatingWindow.style, state.position);
      }
    }
  }
  
  // 添加拖拽功能
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;
  
  const minimizeBtn = floatingWindow.querySelector('.minimize-btn');
  const minimizedContent = floatingWindow.querySelector('.minimized-content');
  const closeBtn = floatingWindow.querySelector('.close-btn');
  const header = floatingWindow.querySelector('.floating-header');
  
  function handleDragStart(e) {
    initialX = e.clientX - floatingWindow.offsetLeft;
    initialY = e.clientY - floatingWindow.offsetTop;
    isDragging = true;
  }
  
  function handleDrag(e) {
    if (!isDragging) return;
    e.preventDefault();
    currentX = e.clientX - initialX;
    currentY = e.clientY - initialY;
    floatingWindow.style.left = `${currentX}px`;
    floatingWindow.style.top = `${currentY}px`;
    floatingWindow.style.right = 'auto';
    floatingWindow.style.bottom = 'auto';
  }
  
  function handleDragEnd() {
    isDragging = false;
    saveWindowState();
  }
  
  // 添加事件监听器
  header.addEventListener('mousedown', handleDragStart);
  minimizedContent.addEventListener('mousedown', handleDragStart);
  document.addEventListener('mousemove', handleDrag);
  document.addEventListener('mouseup', handleDragEnd);
  
  minimizeBtn.addEventListener('click', () => {
    const isMinimized = floatingWindow.classList.toggle('minimized');
    minimizeBtn.textContent = isMinimized ? '□' : '_';
    saveWindowState();
  });
  
  minimizedContent.addEventListener('click', (e) => {
    if (!isDragging && floatingWindow.classList.contains('minimized')) {
      floatingWindow.classList.remove('minimized');
      minimizeBtn.textContent = '_';
      saveWindowState();
    }
  });
  
  closeBtn.addEventListener('click', async () => {
    floatingWindow.remove();
    await chrome.storage.local.remove('apisixBackupWindowState');
  });
  
  document.body.appendChild(floatingWindow);
  restoreWindowState();
  
  return floatingWindow;
}

// API endpoints
const API_ENDPOINTS = {
  routes: '/apisix/admin/routes',
  upstreams: '/apisix/admin/upstreams',
  services: '/apisix/admin/services',
  consumers: '/apisix/admin/consumers'
};

// 获取Authorization Token
async function getAuthToken(dashboardUrl, username, password) {
  console.log('=== 开始获取token ===');
  
  try {
    const loginUrl = `${dashboardUrl}/apisix/admin/user/login`;
    console.log('登录URL:', loginUrl);

    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    console.log('登录响应状态:', response.status);
    const data = await response.json();
    console.log('登录响应:', data);

    if (!response.ok || data.code) {
      throw new Error(`登录失败: ${data.message || response.statusText}`);
    }

    const token = data.data.token;
    if (!token) {
      throw new Error('登录成功但未获取到token');
    }

    console.log('获取到的token:', token);
    return token;
  } catch (error) {
    console.error('获取token失败:', error);
    throw error;
  }
}

// 获取数据
async function fetchData(dashboardUrl, endpoint, token) {
  const url = `${dashboardUrl}${endpoint}`;
  console.log('\n=== 请求详情 ===');
  console.log('请求URL:', url);
  console.log('请求方法: GET');
  
  try {
    const headers = {
      'Authorization': token,
      'Content-Type': 'application/json'
    };
    
    console.log('请求Headers:', JSON.stringify(headers, null, 2));

    console.log('发起请求...');
    const response = await fetch(url, { 
      method: 'GET',
      headers
    });
    
    console.log('响应详情:');
    console.log('- 状态码:', response.status);
    console.log('- 状态文本:', response.statusText);
    
    const data = await response.json();
    console.log('响应数据:', JSON.stringify(data, null, 2));
    
    if (data.code) {
      throw new Error(`API错误: ${data.message || '未知错误'} (code: ${data.code})`);
    }
    
    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status} ${response.statusText}`);
    }
    
    return data;
  } catch (error) {
    console.error('=== 请求失败 ===');
    console.error('错误类型:', error.constructor.name);
    console.error('错误消息:', error.message);
    console.error('错误堆栈:', error.stack);
    console.error('当前endpoint:', endpoint);
    console.error('=== 错误信息结束 ===\n');
    throw error;
  }
}

// 更新UI的函数
function updateFloatingProgress(percent, text) {
  let floatingWindow = document.getElementById('apisix-backup-floating-window');
  if (!floatingWindow) {
    floatingWindow = createFloatingWindow();
  }
  const progress = floatingWindow.querySelector('.progress');
  const progressText = floatingWindow.querySelector('.progress-text');
  
  if (progress && progressText) {
    progress.style.width = `${percent}%`;
    progressText.textContent = text || `${percent}%`;
  }
}

function addFloatingLog(message, type = 'info') {
  const floatingWindow = document.getElementById('apisix-backup-floating-window') || createFloatingWindow();
  const logContainer = floatingWindow.querySelector('.log-container');
  
  if (logContainer) {
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry log-${type}`;
    logEntry.textContent = message;
    
    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight;
  }
}

// 在文件开头添加全局logs数组
let logs = [];

// 修改现有的addLog函数
function addLog(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const log = `[${timestamp}] ${message}`;
  logs.push(log);
  addFloatingLog(log, type);
}

// 备份所有数据
async function backupData(dashboardUrl, token) {
  try {
    document.body.style.cursor = 'wait';
    console.log('基础URL:', dashboardUrl);
    const backup = {};
    let hasError = false;
    
    // 创建浮动窗口
    createFloatingWindow();
    // 重置日志数组
    logs = [];
    addLog('开始备份数据...');
    
    const endpoints = Object.entries(API_ENDPOINTS);
    let processedEndpoints = 0;
    
    for (const [key, endpoint] of endpoints) {
      processedEndpoints++;
      const percent = Math.round((processedEndpoints / endpoints.length) * 100);
      updateFloatingProgress(percent, `正在备份: ${key}`);
      
      addLog(`\n开始获取${key}数据...`);
      try {
        const data = await fetchData(dashboardUrl, endpoint, token);
        // 处理数据结构
        if (data.list) {
          // 如果是list格式，直接使用
          backup[key] = data.list;
          addLog(`✅ ${key}数据获取成功: ${data.list.length}条记录`, 'success');
        } else if (data.data) {
          backup[key] = data.data.rows;
          addLog(`✅ ${key}数据获取成功: ${data.data.rows.length}条记录`, 'success');
        } else {
          backup[key] = [];
          addLog(`⚠️ ${key}数据为空`, 'warning');
        }
        
      } catch (error) {
        console.error(`获取${key}数据失败:`, error.message);
        addLog(`❌ 获取${key}数据失败: ${error.message}`, 'error');
        hasError = true;
        break;
      }
    }

    if (hasError) {
      throw new Error('数据获取失败，请检查控制台日志');
    }

    addLog('\n所有数据获取成功，开始生成备份文件...');
    const backupJson = JSON.stringify(backup, null, 2);
    
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName = `apisix-backup-${new Date().toISOString()}.json`;
    a.download = fileName;
    
    a.click();
    URL.revokeObjectURL(url);
    
    addLog(`\n✅ 备份文件已生成: ${fileName}`, 'success');
    addLog('\n=== 备份完成 ===', 'success');
    chrome.runtime.sendMessage({ type: 'backupComplete' });
    
  } catch (error) {
    console.error('\n=== 备份失败 ===');
    console.error('错误详情:', error);
    console.error('错误堆栈:', error.stack);
    console.error('=== 错误息结束 ===\n');
    addLog(`\n❌ 备份失败: ${error.message}`, 'error');
    chrome.runtime.sendMessage({ 
      type: 'backupError', 
      error: error.message 
    });
  } finally {
    document.body.style.cursor = 'default';
  }
}

// 恢复数据
async function restoreData(dashboardUrl, token) {
  try {
    console.log('=== 开始恢复数据 ===');
    // 重置日志数组
    logs = [];
    
    // 创建文件选择器并触发点击
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    
    // 使用 Promise 包装文件选择过程
    const fileContent = await new Promise((resolve, reject) => {
      fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) {
          reject(new Error('未选择文件'));
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error('文件读取失败'));
        reader.readAsText(file);
      };
      
      // 触发文件选择
      fileInput.click();
    });
    
    try {
      addLog('开始解析备份数据...');
      const backup = JSON.parse(fileContent);
      addLog('备份数据解析功', 'success');
      
      const restoreOrder = ['upstreams', 'services', 'consumers', 'routes'];
      let totalItems = 0;
      let processedItems = 0;
      
      // 计算总项目数
      restoreOrder.forEach(key => {
        if (Array.isArray(backup[key])) {
          totalItems += backup[key].length;
        }
      });
      
      for (const key of restoreOrder) {
        const items = backup[key];
        const endpoint = API_ENDPOINTS[key];
        addLog(`\n开始恢复${key}数据...`);
        
        if (!Array.isArray(items)) {
          addLog(`⚠️ ${key}数据格式错误，应该是数组类型`, 'warning');
          continue;
        }
        
        let successCount = 0;
        let skipCount = 0;
        let errorCount = 0;
        
        for (const item of items) {
          processedItems++;
          const percent = Math.round((processedItems / totalItems) * 100);
          updateFloatingProgress(percent, `正在处理: ${key} (${processedItems}/${totalItems})`);
          
          // 移除时间戳字段
          const { create_time, update_time, ...itemData } = item;
          
          // 特殊处理 consumers 数据
          if (key === 'consumers') {
            // 移除 id 字段，只使用 username
            const { id, ...consumerData } = itemData;
            
            // 构造请求 URL 和数据
            const url = `${dashboardUrl}${endpoint}/${itemData.username}`;
            
            try {
              const response = await fetch(url, {
                method: 'PUT',
                headers: {
                  'Authorization': token,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(consumerData)
              });
              
              const responseText = await response.text();
              const responseData = responseText ? JSON.parse(responseText) : {};
              
              if (!response.ok) {
                if (responseData.code === 10000 && responseData.message?.includes('exists')) {
                  addLog(`⚠️ ${key} [${itemData.username}] 已存在，跳过`, 'warning');
                  skipCount++;
                } else {
                  addLog(`❌ 恢复${key} [${itemData.username}] 失败: ${responseText}`, 'error');
                  errorCount++;
                }
              } else {
                addLog(`✅ 恢复${key} [${itemData.username}] 成功`, 'success');
                successCount++;
              }
            } catch (error) {
              addLog(`❌ 恢复${key} [${itemData.username}] 时发生错误: ${error.message}`, 'error');
              errorCount++;
            }
            continue;  // 跳过后续处理
          }
          
          // 特殊处理 routes 数据
          if (key === 'routes') {
            // 处理 limit-req 插件
            if (itemData.plugins && itemData.plugins['limit-req']) {
              const limitReqConfig = itemData.plugins['limit-req'];
              
              // 如果没有设置 redis_host，则使用本地限流策略
              if (!limitReqConfig.redis_host) {
                limitReqConfig.policy = 'local';
              }
              
              // 确保必要字段存在
              if (!limitReqConfig.rate) {
                limitReqConfig.rate = 1;  // 默认值
              }
              if (typeof limitReqConfig.burst === 'undefined') {
                limitReqConfig.burst = 0;  // 默认值
              }
              if (!limitReqConfig.key) {
                limitReqConfig.key = 'remote_addr';  // 默认值
              }
            }
          }
          
          // 其他类型数据的处理保持不变
          const url = `${dashboardUrl}${endpoint}/${itemData.id}`;
          
          const headers = {
            'Authorization': token,
            'Content-Type': 'application/json',
          };
          const body = JSON.stringify(itemData);
          
          addLog(`正在恢复${key}: ${itemData.id}`);
          
          try {
            const response = await fetch(url, {
              method: 'PUT',
              headers,
              body
            });
            
            const responseText = await response.text();
            const responseData = responseText ? JSON.parse(responseText) : {};
            
            if (!response.ok) {
              if (responseData.code === 10000 && responseData.message?.includes('exists')) {
                addLog(`⚠️ ${key} [${itemData.id}] 已存在，跳过`, 'warning');
                skipCount++;
              } else {
                addLog(`❌ 恢复${key} [${itemData.id}] 失败: ${responseText}`, 'error');
                errorCount++;
              }
            } else {
              addLog(`✅ 恢复${key} [${itemData.id}] 成功`, 'success');
              successCount++;
            }
          } catch (error) {
            addLog(`❌ 恢复${key} [${itemData.id}] 时发生错误: ${error.message}`, 'error');
            errorCount++;
          }
        }
        
        addLog(`\n${key}恢复完成:`, 'info');
        addLog(`- 成功: ${successCount}`, 'success');
        addLog(`- 跳过: ${skipCount}`, 'warning');
        addLog(`- 失败: ${errorCount}`, 'error');
      }
      
      addLog('\n=== 所有数据恢复完成 ===', 'success');
      chrome.runtime.sendMessage({ type: 'restoreComplete' });
    } catch (error) {
      addLog(`\n❌ 恢复过程中出错: ${error.message}`, 'error');
      chrome.runtime.sendMessage({ 
        type: 'restoreError', 
        error: error.message 
      });
      throw error;
    }
  } catch (error) {
    console.error('恢复操作失败:', error);
    addLog(`❌ 恢复操作失败: ${error.message}`, 'error');
    chrome.runtime.sendMessage({ 
      type: 'restoreError', 
      error: error.message 
    });
    throw error;
  }
}

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'backup') {
    const { dashboardUrl, token } = request;
    Promise.resolve().then(async () => {
      try {
        await backupData(dashboardUrl, token);
        chrome.runtime.sendMessage({ type: 'backupComplete' });
      } catch (error) {
        chrome.runtime.sendMessage({ 
          type: 'backupError', 
          error: error.message 
        });
      }
    });
    return true;
  } else if (request.action === 'restore') {
    const { dashboardUrl, token } = request;
    Promise.resolve().then(async () => {
      try {
        await restoreData(dashboardUrl, token);
      } catch (error) {
        chrome.runtime.sendMessage({ 
          type: 'restoreError', 
          error: error.message 
        });
      }
    });
    return true;
  }
});

// 在脚本加载时打印日志
console.log('APISIX Dashboard Backup content script 已加载');

// 注入脚本以访问页面的localStorage
function injectScript() {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('injected.js');
  script.onload = function() {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(script);
}

// 确保脚本首先被注入
injectScript();

// 监听来自background.js的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.method === "getLocalStorage") {
    const eventName = `getLocalStorage_${Date.now()}`;
    
    const listener = function(event) {
      if (event.source !== window) return;
      if (event.data.type !== eventName) return;
      
      window.removeEventListener('message', listener);
      sendResponse({data: event.data.storage?.[request.key]});
    };
    window.addEventListener('message', listener);
    
    window.postMessage({
      type: 'getLocalStorage',
      eventName: eventName,
      key: request.key
    }, '*');
    
    return true;
  }
});
