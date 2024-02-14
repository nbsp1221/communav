from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager

import time
from bs4 import BeautifulSoup
from time import sleep

import pandas as pd
import csv
from fake_useragent import UserAgent as ua

import numpy as np

# 0 이상 1 미만의 난수 생성
random_number = np.random.rand()


options = webdriver.ChromeOptions()
options.add_argument(ua().random)
driver = webdriver.Chrome(service=ChromeService(ChromeDriverManager().install()),options=options)
main_url = "https://gall.dcinside.com/mgallery/board/lists/?id=mapleland&sort_type=N&search_head="
BASE = "https://gall.dcinside.com"
start_page = 1
end_page = 45
page = 1
type = 100

articleIdList = []
try:
  with open('contents.csv', 'r', encoding='utf-8-sig') as csvfile:
    reader = csv.reader(csvfile)
    for row in reader:
        articleIdList.append(row[0])
except:
    print("No file.")
    

while True:
    try:
     if page > end_page:
         break
     articles = [] 
     url = main_url + str(type) + '&page=' + str(page)
     print(page)
     try:
         driver.get(url)
         sleep(int(np.random.rand() * 4)) 
     except:
         print("Fail to laod page.")
         continue
     page_source = driver.page_source
     soup = BeautifulSoup(page_source, "html.parser")
     
     articles = soup.find('tbody').find_all('tr')
     
     for article in articles:
         title = article.find('a').text
         id = article.find("td",{"class" : "gall_num"}).text
         if id in articleIdList:
             continue
         articleIdList.append(id)
         a_type = article.find('a',href = True)
         article_url = BASE + a_type['href']
         print(article_url)
         try:   
                driver.get(article_url)
                sleep(int(np.random.rand() * 4))
                contents_soup = BeautifulSoup(driver.page_source,"html.parser")
                contents = contents_soup.find('div', {"class": "write_div"}).text
         except Exception as ex: 
             print("Fail to load detailed page.", ex)
             continue
         
         contents_df = pd.DataFrame([{"id" : id,
                            "title" : title,
                            "contents" : title + contents,
                            "community_id" : 1,
                            "type_id" : 2
                           }])

         contents_df.to_csv('contents.csv', encoding='utf-8-sig', mode='a', index=False, header=False)
     page += 1
    except Exception as e:
        print("error occured!", e)
        break


    