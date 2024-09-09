chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'GET_PROMPT') {
    fetch('http://retn0.iptime.org:11050/prompt')
      .then((response) => response.json())
      .then(({ data }) => sendResponse({ data }))
      .catch((error) => sendResponse({ error: error.toString() }));

    return true;
  }

  if (request.action === 'PATCH_ARTICLES') {
    fetch('http://retn0.iptime.org:11050/articles', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request.data),
    })
      .then((response) => response.json())
      .then(({ data }) => sendResponse({ data }))
      .catch((error) => sendResponse({ error: error.toString() }));

    return true;
  }
});
