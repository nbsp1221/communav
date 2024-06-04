let pageTitle = '';
let pageText = '';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'SET_TITLE') {
    pageTitle = request.title;
    console.log(pageTitle)
  }
});
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'SET_TEXT') {
      pageText = request.text;
      console.log(pageText)
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_TITLE') {
    sendResponse({title: pageTitle});
  }
});
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'GET_TEXT') {
      sendResponse({text: pageText});
    }
});