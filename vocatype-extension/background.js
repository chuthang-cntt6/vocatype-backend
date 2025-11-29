// Tạo context menu khi cài đặt extension
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "vocatype-lookup",
      title: "Tra từ VocaType: '%s'",
      contexts: ["selection"]
    });
  });
  
  // Xử lý khi click context menu
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "vocatype-lookup") {
      // Lưu từ selected
      chrome.storage.local.set({ selectedWord: info.selectionText });
      
      // Mở popup
      chrome.action.openPopup();
    }
  });
  
  // Listen message từ content script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "searchWord") {
      // Fetch từ API
      fetch(`http://localhost:3000/api/vocab/search?word=${request.word}`)
        .then(res => res.json())
        .then(data => sendResponse({ success: true, data }))
        .catch(err => sendResponse({ success: false, error: err.message }));
      return true; // Async response
    }
  });