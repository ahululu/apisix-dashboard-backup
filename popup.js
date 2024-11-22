function updateStatus(message) {
  const status = document.getElementById('status');
  status.textContent = message;
}

function updateProgress(percent, text) {
  const progressContainer = document.getElementById('progress-container');
  const progress = document.getElementById('progress');
  const progressText = document.getElementById('progress-text');
  
  progressContainer.style.display = 'block';
  progress.style.width = `${percent}%`;
  progressText.textContent = text || `${percent}%`;
}

function addLog(message, type = 'info') {
  const logContainer = document.getElementById('log-container');
  logContainer.style.display = 'block';
  
  const logEntry = document.createElement('div');
  logEntry.className = `log-entry log-${type}`;
  logEntry.textContent = message;
  
  logContainer.appendChild(logEntry);
  logContainer.scrollTop = logContainer.scrollHeight;
}

function resetUI() {
  const progressContainer = document.getElementById('progress-container');
  const logContainer = document.getElementById('log-container');
  const progress = document.getElementById('progress');
  const progressText = document.getElementById('progress-text');
  
  progressContainer.style.display = 'none';
  logContainer.style.display = 'none';
  logContainer.innerHTML = '';
  progress.style.width = '0%';
  progressText.textContent = '0%';
}

// 切换表单显示状态
function toggleForm(formId) {
  const forms = document.querySelectorAll('.form-section');
  forms.forEach(form => {
    if (form.id === formId) {
      form.classList.toggle('active');
      
      // 在表单显示时尝试获取localStorage中的token
      if (form.classList.contains('active')) {
        chrome.runtime.sendMessage({method: "getLocalStorage", key: "token"}, function(response) {
          console.log('localStorage token:', response.data);
        });
      }
    } else {
      form.classList.remove('active');
    }
  });
}

function updateButtonProgress(buttonId, percent, text) {
  const button = document.getElementById(buttonId);
  const progressOverlay = button.querySelector('.progress-overlay');
  const buttonText = button.querySelector('.button-text');
  
  if (percent > 0) {
    button.classList.add('processing');
  }
  
  progressOverlay.style.width = `${percent}%`;
  if (text) {
    buttonText.textContent = text;
  }
  
  if (percent >= 100) {
    setTimeout(() => {
      button.classList.remove('processing');
      progressOverlay.style.width = '0%';
      if (buttonId === 'backup') {
        buttonText.textContent = '备份当前站点数据';
      } else if (buttonId === 'restore-submit') {
        buttonText.textContent = '开始恢复';
      }
    }, 500);
  }
}

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'backupProgress') {
    updateButtonProgress('backup', message.percent, message.text);
  } else if (message.type === 'restoreProgress') {
    updateButtonProgress('restore', message.percent, message.text);
  } else if (message.type === 'backupComplete') {
    updateButtonProgress('backup', 100);
    updateStatus('备份完成！');
  } else if (message.type === 'backupError') {
    updateStatus(`备份失败: ${message.error}`);
    updateButtonProgress('backup', 0, '备份当前站点数据');
  } else if (message.type === 'restoreComplete') {
    updateButtonProgress('restore', 100);
    updateStatus('恢复完成！');
  } else if (message.type === 'restoreError') {
    updateStatus(`恢复失败: ${message.error}`);
    updateButtonProgress('restore', 0, '恢复当前站点数据');
  }
});

async function sendMessageToTab(tabId, message, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      await chrome.tabs.sendMessage(tabId, message);
      console.log('消息发送成功');
      return;
    } catch (error) {
      console.log(`第${i + 1}次尝试发送消息失败:`, error);
      if (i === retries - 1) {
        throw error;
      }
      // 等待一段时间后重试
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}

// 等待DOM加载完成后再添加事件监听器
document.addEventListener('DOMContentLoaded', () => {
  // 备份按钮点击事件
  document.getElementById('backup').addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) {
        throw new Error('未找到当前标签页');
      }
      const dashboardUrl = new URL(tab.url).origin;
      const token = await getToken();
      
      updateButtonProgress('backup', 0, '准备备份...');
      
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
      
      await sendMessageToTab(tab.id, { 
        action: 'backup', 
        dashboardUrl,
        token
      });
    } catch (error) {
      updateStatus(`错误: ${error.message}`);
      updateButtonProgress('backup', 0, '备份当前站点数据');
    }
  });

  // 恢复按钮点击事件 - 直接开始恢复流程
  document.getElementById('restore').addEventListener('click', async () => {
    console.log('恢复按钮被点击');
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) {
        throw new Error('未找到当前标签页');
      }
      const dashboardUrl = new URL(tab.url).origin;
      const token = await getToken();
      
      updateButtonProgress('restore', 0, '请选择文件...');
      
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
      
      await sendMessageToTab(tab.id, { 
        action: 'restore', 
        dashboardUrl,
        token
      });
    } catch (error) {
      console.error('popup错误:', error);
      updateStatus(`错误: ${error.message}`);
      updateButtonProgress('restore', 0, '恢复当前站点数据');
    }
  });

  // 文件选择处理
  const fileInput = document.getElementById('restore-file');
  const fileName = document.getElementById('file-name');
  const fileInputContainer = document.querySelector('.file-input-container');

  // 阻止文件选择器的点击事件冒泡
  fileInputContainer.addEventListener('click', (event) => {
    event.stopPropagation();
  });

  // 处理文件选择变化
  fileInput.addEventListener('change', (event) => {
    event.stopPropagation();
    const file = event.target.files[0];
    if (file) {
      fileName.textContent = file.name;
      fileName.classList.add('active');
    } else {
      fileName.textContent = '';
      fileName.classList.remove('active');
    }
  });

  // 恢复表单提交事件
  document.getElementById('restore-submit').addEventListener('click', async () => {
    console.log('恢复提交按钮被点击');
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) {
        throw new Error('未找到当前标签页');
      }
      const dashboardUrl = new URL(tab.url).origin;
      const token = await getToken();
      const fileInput = document.getElementById('restore-file');
      
      if (!fileInput.files.length) {
        throw new Error('请选择要恢复的备份文件');
      }
      
      // 读取文件内容
      const file = fileInput.files[0];
      const fileContent = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(new Error('文件读取失败'));
        reader.readAsText(file);
      });
      
      updateButtonProgress('restore-submit', 0, '准备恢复...');
      
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
      
      await sendMessageToTab(tab.id, { 
        action: 'restore', 
        dashboardUrl,
        token,
        fileContent
      });
    } catch (error) {
      console.error('popup错误:', error);
      updateStatus(`错误: ${error.message}`);
      updateButtonProgress('restore-submit', 0, '开始恢复');
    }
  });

  // 阻止整个恢复表单的点击事件冒泡
  document.getElementById('restore-form').addEventListener('click', (event) => {
    event.stopPropagation();
  });
});

// 获取token的函数
async function getToken() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({method: "getLocalStorage", key: "token"}, function(response) {
      if (response && response.data) {
        console.log('获取到token:', response.data);
        resolve(response.data);
      } else {
        reject(new Error('未找到token，请先登录APISIX Dashboard'));
      }
    });
  });
}
  