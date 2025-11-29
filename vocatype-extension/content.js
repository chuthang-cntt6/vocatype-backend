// Double-click từ để tra nhanh
document.addEventListener('dblclick', () => {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText && selectedText.split(' ').length === 1) {
      // Lưu từ và mở popup
      chrome.storage.local.set({ selectedWord: selectedText });
      chrome.runtime.sendMessage({ action: "openPopup" });
    }
  });
  
  // Listener cho hotkey (Ctrl+Shift+D)
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      e.preventDefault();
      const selectedText = window.getSelection().toString().trim();
      if (selectedText) {
        chrome.storage.local.set({ selectedWord: selectedText });
        chrome.runtime.sendMessage({ action: "openPopup" });
      }
    }
  });