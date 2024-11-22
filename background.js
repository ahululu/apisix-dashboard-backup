// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.method === "getLocalStorage") {
    // 获取当前活动标签页
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (!tabs[0]) {
        sendResponse({data: null});
        return;
      }
      
      // 向content script发送消息
      chrome.tabs.sendMessage(tabs[0].id, {
        method: "getLocalStorage",
        key: request.key
      }, function(response) {
        sendResponse({data: response?.data});
      });
    });
    return true; // 保持消息通道开启
  }
});

chrome.runtime.onInstalled.addListener(() => {
  // 移除这行
  // console.log('APISIX Dashboard Backup extension installed');
}); 