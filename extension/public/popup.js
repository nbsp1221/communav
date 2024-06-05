document.addEventListener('DOMContentLoaded', function () {

  chrome.runtime.sendMessage({ type: 'GET_TITLE' }, (response) => {
    document.getElementById('title').innerText = response.title;
  });
  chrome.runtime.sendMessage({ type: 'GET_TEXT' }, (response) => {
    document.getElementById('text').innerText = response.text;
  });

  document.getElementById('sendPost').addEventListener('click', async () => {
    let title = document.querySelector('div[id="title"]').textContent;
    let text = document.querySelector('div[id="text"]').textContent;

    let userText = title + ' ' + text;
    const url = `http://39.124.11.92:50000/which_tag?text=${encodeURIComponent(userText)}`;
    // const url = `http://0.0.0.0:8000/which_tag?text=${userText}`;

    const sendPostBtn = document.getElementById('sendPost');
    sendPostBtn.disabled = true;

    if (userText == '') {
      alert('No content');
    }
    else {
      try {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        const categorySelect = document.getElementById('categorySelect');
        categorySelect.innerHTML = '';

        if (Array.isArray(data.message)) {
          data.message.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = tag;
            categorySelect.appendChild(option);
          });
        }
        else {
          alert('Expected an array in data.message, but got:' + data.message);
        }
      }
      catch (error) {
        alert('Error:', error);
      }
      finally {
        sendPostBtn.disabled = false;
      }
    }
  });

  document.getElementById('archivePost').addEventListener('click', async () => {
    // 선택된 카테고리와 함께 글을 아카이빙하는 서버로 보내는 코드
    const title = document.querySelector('div[id="title"]').textContent;
    const text = document.querySelector('div[id="text"]').textContent;
    const categoryText = document.getElementById('categorySelect').value;

    const categoryMapper = {
      '자유': 0,
      '학사': 1,
      '장학/행정': 2,
      '학교생활': 3,
      '수업': 4,
      '수업/이과': 5,
      '수업/문과': 6,
      '캠퍼스': 7,
      '취업/진로': 8,
      '일상생활': 9,
      '음식점/카페': 10,
      '취미/여가': 11,
      '인간관계': 12,
      '병역': 13
    };

    const categoryId = categoryMapper[categoryText];

    const response = await fetch('http://retn0.iptime.org:11000/api/articles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: title,
        text: text,
        categoryId: categoryId,
      }),
    });

    if (response.ok) {
      alert('아카이빙에 성공했습니다.');
    }
    else {
      alert('아카이빙에 실패했습니다.');
    }
  });
});
