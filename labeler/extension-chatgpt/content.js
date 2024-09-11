async function delay(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

async function waitForElement(selector) {
  let element = document.querySelector(selector);

  while (!element) {
    await delay(100);
    element = document.querySelector(selector);
  }

  return element;
}

async function waitForElementDisappear(selector) {
  let element = document.querySelector(selector);

  while (element) {
    await delay(100);
    element = document.querySelector(selector);
  }
}

async function chromeRuntimeSendMessage(action, data) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action, data }, (response) => {
      resolve(response);
    });
  });
}

const TEXTAREA_SELECTOR = '#prompt-textarea';
const SEND_BUTTON_SELECTOR = 'button[data-testid="send-button"]';
const STOP_BUTTON_SELECTOR = 'button[data-testid="stop-button"]';

function insertText(element, text) {
  element.focus();
  document.execCommand('insertText', false, text);
}

function simulateShiftEnter(element) {
  const shiftEnterEvent = new KeyboardEvent('keydown', {
    bubbles: true,
    cancelable: true,
    keyCode: 13,
    which: 13,
    key: 'Enter',
    shiftKey: true,
  });
  element.dispatchEvent(shiftEnterEvent);
}

async function createConversation(message) {
  const textArea = await waitForElement(TEXTAREA_SELECTOR);

  // 메시지를 줄 단위로 분할
  const lines = message.split('\n');

  for (let i = 0; i < lines.length; i++) {
    insertText(textArea, lines[i]);

    // 마지막 줄이 아니라면 Shift+Enter 이벤트를 발생시킴
    if (i < lines.length - 1) {
      simulateShiftEnter(textArea);
    }
  }

  textArea.dispatchEvent(new Event('input', { bubbles: true }));

  while (true) {
    const sendButton = document.querySelector(SEND_BUTTON_SELECTOR);

    if (!sendButton.disabled) {
      sendButton.click();
      break;
    }

    await delay(100);
  }

  await delay(5000);
  await waitForElementDisappear(STOP_BUTTON_SELECTOR);

  const article = [...document.querySelectorAll('article')].slice(-1)[0].querySelector('div.markdown');
  const response = article.innerText;

  return response;
}

async function getPrompt() {
  const { data, error } = await chromeRuntimeSendMessage('GET_PROMPT');

  if (!data) {
    console.error('No prompt received.');
    return [];
  }

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}

async function patchArticles(articles) {
  const { error } = await chromeRuntimeSendMessage('PATCH_ARTICLES', articles);

  if (error) {
    console.error(error);
  }
}

function preprocessConversationResponse(response) {
  const matches = response.replace(/[^0-9,[\]]/g, '').match(/\[.*\]/g);
  const longestMatch = matches.reduce((left, right) => left.length > right.length ? left : right, '');

  try {
    const parsedData = JSON.parse(longestMatch);

    return parsedData.map(([id, categoryId]) => ({
      id,
      category_id: categoryId,
    }));
  }
  catch (error) {
    console.error('Failed to parse conversation response:', error);
    return [];
  }
}

(async () => {
  console.log('ChatGPT labeler extension is running.');

  await waitForElement(TEXTAREA_SELECTOR);
  await delay(5000);

  const prompt = await getPrompt();
  console.log('Received prompt:', prompt);

  const response = await createConversation(prompt);
  console.log('Received response:', response);

  const articles = preprocessConversationResponse(response);
  console.log('Preprocessed articles:', articles);

  await patchArticles(articles);
  await delay(3 * 60 * 1000);

  location.href = 'https://chatgpt.com';
})();

setTimeout(() => {
  location.href = 'https://chatgpt.com';
}, 5 * 60 * 1000);
