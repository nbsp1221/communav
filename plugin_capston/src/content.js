let prevTitle = '';
let prevText = '';

function checkForChanges() {
    let title = document.querySelector('input[name="title"]') ? document.querySelector('input[name="title"]').value : '';
    let text = document.querySelector('textarea[name="text"]') ? document.querySelector('textarea[name="text"]').value : '';

    if(title !== prevTitle || text !== prevText) {
        chrome.runtime.sendMessage({type: 'SET_TITLE', title: title});
        chrome.runtime.sendMessage({type: 'SET_TEXT', text: text});
        console.log('Sent new values:', title, text);

        prevTitle = title;
        prevText = text;
    }
}

setInterval(checkForChanges, 1000);
