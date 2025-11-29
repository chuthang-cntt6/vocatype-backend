import React from 'react';
import { createRoot } from 'react-dom/client';
import VocaTypeDictionary from './VocaTypeDictionary.jsx';

// Load selected word từ storage
chrome.storage.local.get(['selectedWord'], (result) => {
  if (result.selectedWord) {
    localStorage.setItem('selectedWord', result.selectedWord);
    chrome.storage.local.remove('selectedWord');
  }
  
  const root = createRoot(document.getElementById('root'));
  root.render(<VocaTypeDictionary />);
});