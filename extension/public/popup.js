document.addEventListener('DOMContentLoaded', function() {  

  chrome.runtime.sendMessage({type: 'GET_TITLE'}, (response) => {
    document.getElementById('title').innerText = response.title;
  });
  chrome.runtime.sendMessage({type: 'GET_TEXT'}, (response) => {
    document.getElementById('text').innerText = response.text;
  });

  document.getElementById('sendPost').addEventListener('click', function() {
      let title = document.querySelector('div[id="title"]').textContent;
      let text = document.querySelector('div[id="text"]').textContent;

      let userText = title + ' ' + text;
      // const url = `http://39.124.11.92:50000/which_tag?text=${encodeURIComponent(userText)}`;
      const url = `http://0.0.0.0:8000/which_tag?text=${userText}`;

      if (userText == '') alert('No content');
      else {
        fetch(url)
          .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then(data => {
            // alert(JSON.stringify(data, null, 2));
            const categorySelect = document.getElementById('categorySelect');
            categorySelect.innerHTML = ''; 

            if (Array.isArray(data.message)) {
              data.message.forEach(tag => {
                const option = document.createElement('option');
                option.value = tag;
                option.textContent = tag;
                categorySelect.appendChild(option);
              });
            } else {
              alert('Expected an array in data.message, but got:' + data.message);
            }
          })
          .catch(error => {
            alert('There was a problem with your fetch operation:' + error);
        });
      }
  });

  document.getElementById('archivePost').addEventListener('click', function() {
      
      // 선택된 카테고리와 함께 글을 아카이빙하는 서버로 보내는 코드
  });
});
