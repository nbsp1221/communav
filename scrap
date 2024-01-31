from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import pandas as pd
import time

def everytime_scraping(id, pw):

    driver = webdriver.Chrome() 

    url='https://account.everytime.kr/login'

    driver.get(url) 

    username = driver.find_element(By.NAME,"id")  
    password = driver.find_element(By.NAME,"password")

    username.send_keys(id)  
    password.send_keys(pw)  

    login_button = driver.find_element(By.XPATH,'//input[@type="submit"][contains(@value, "에브리타임 로그인")]')

    login_button.click()

    link = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, "a.new")))
    link.click()

    list_sum = []  # 이 부분을 함수 내부로 이동시켰습니다.

    for _ in range(5):

        WebDriverWait(driver, 10).until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, "h2.medium.bold")))
        WebDriverWait(driver, 10).until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, "p.medium")))

        html = driver.page_source

        soup = BeautifulSoup(html, 'lxml')

        titles = driver.find_elements(By.CSS_SELECTOR,"h2.medium.bold")
        contents=driver.find_elements(By.CSS_SELECTOR,"p.medium")

        list_titles = [title.text for title in titles]
        list_contents=[content.text for content in contents]

        list_sum.extend(list(zip(list_titles,list_contents)))

        try:
            next_button=driver.find_element(By.XPATH,'//a[contains(text(), "다음")]')
            next_button.click()
        except NoSuchElementException:
                break

    driver.quit()

    col = ['제목', '내용']

    df = pd.DataFrame(list_sum, columns=col)
    df.to_excel('everytime.xlsx')

# 이렇게 함수를 사용할 수 있습니다. 
# 아래 'your_id'와 'your_pw'는 각각 본인의 아이디와 패스워드로 바꿔주셔야 합니다.
everytime_scraping('your_id', 'your_pw')
