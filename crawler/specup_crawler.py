# 네이버 카페 specup의 취준생 이야기방 게시판 크롤러

import pyperclip
from selenium import webdriver
import chromedriver_autoinstaller
from selenium.webdriver.chrome.options import Options
import random, time
from user_agents import parse
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys

# chromedriver 자동 업데이트
# chromedriver_autoinstaller.install()

# 정보 입력
naver_id = "****" # 본인 네이버 ID
naver_pw = "****" # 본인 네이버 PW
csv_file_path = "specup_crawling.csv" # 결과 저장 파일

# 해상도 설정
pc_device = ["1920,1440", "1920,1200", "1920,1080", "1600,1200",
             "1600,900", "1536,864", "1400,1080",
             "1440,900", "1360,768"]
mobile_device = ["360,640", "360,740", "375,667",
                 "375,812", "412,732", "412,846",
                 "412,869", "412,892", "412,915"]

width,height = random.choice(mobile_device).split(",")

# user agent data를 바꾸는 함수
def make_user_agent(ua,is_mobile): 
    user_agent = parse(ua)
    model = user_agent.device.model
    platform = user_agent.os.family
    platform_version = user_agent.os.version_string + ".0.0"
    version = user_agent.browser.version[0]
    ua_full_version = user_agent.browser.version_string
    architecture = "x86"
    print(platform)
    if is_mobile:
        platform_info = "Linux armv8l"
        architecture= ""
    else: 
        platform_info = "Win32"
        model = ""
    
    RET_USER_AGENT = {
        "appVersion" : ua.replace("Mozilla/", ""),
        "userAgent" : ua,
        "platform" : f"{platform_info}",
        "acceptLanguage" : "ko-KR, kr, en-US, en",
        "userAgentMetadata" : {
            "brands" : [
                {"brand" : "Not A;Brand", "version":"99"},
                {"brand" : "Google Chrome", "version":f"{version}"},
                {"brand" : "Chromium", "version":f"{version}"},
            ],
            "fullVersionList" : [
                {"brand" : "Google Chrome", "version":f"{version}"},
                {"brand" : "Chromium", "version":f"{version}"},
                {"brand" : "Not A;Brand", "version":"99"},
            ],
            "fullVersion":f"{ua_full_version}",
            "platform" : platform,
            "platformVersion" : platform_version,
            "architecture" : architecture,
            "model" : model,
            "mobile" : is_mobile
        }
    }
    return RET_USER_AGENT

UA = "Mozilla/5.0 (Linux; Android 9; Mi A2 Lite Build/PKQ1.180917.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/80.0.3987.132 Mobile Safari/537.36" # user agent 조작
options = webdriver.ChromeOptions()
UA_Data = make_user_agent(UA, True)

options.add_argument(f'--user-agent={UA}') # User Agent 변경
options.add_argument(f"--window-size={width}, {height}")
options.add_argument("--disable-blink-features=AutomationControlled")
options.add_argument('--disable-popup-blocking') # uc에서 새 탭 열기 허용
driver = uc.Chrome(options=options, headless=False) 

driver.execute_cdp_cmd("Network.setUserAgentOverride", UA_Data) # user agent data 변경

# Max Touch Point 변경
Mobile = {"enabled":True, "maxTouchPoints" : random.choice([1,5])}
driver.execute_cdp_cmd("Emulation.setTouchEmulationEnabled", Mobile)

# 위치 정보 변경 (Geo Location 변경) 
def generate_random_geolcation():
    ltop_lat = 37.61725745260699 # 좌 위도
    ltop_long = 126.92437164480178 # 좌 경도
    rbottom_lat = 37.56825361755575 # 우 위도
    rbottom_long = 127.05771697149082 # 우 경도

    targetLat = random.uniform(rbottom_lat, ltop_lat)
    targetLong = random.uniform(ltop_long, rbottom_long)
    return {"latitude" : targetLat, "longitude" : targetLong, "accuracy":100}
GEO_DATA = generate_random_geolcation()
driver.execute_cdp_cmd("Emulation.setGeolocationOverride", GEO_DATA)

# DeviceMetrics 변경(Emulation 쪽에서 setDeviceMetricsOverride 적용)
driver.execute_cdp_cmd("Emulation.setDeviceMetricsOverride", {
    "width":int(width),
    "height":int(height),
    "deviceScaleFactor":1,
    "mobile":True,
})

# 창 띄우기
driver.get('https://nid.naver.com/nidlogin.login?svctype=262144&url=http://m.naver.com/aside/')

# 로그인
try:
    input_id = driver.find_element(By.CSS_SELECTOR, "#id")
    input_pw = driver.find_element(By.CSS_SELECTOR, "#pw")
    login_btn = driver.find_element(By.CSS_SELECTOR, "#upper_login_span")
except:
    print("[오류 발생] : 로그인 과정(1)에서 오류가 발생하였습니다.")
    driver.quit()

try:
    chains = webdriver.ActionChains(driver)
    pyperclip.copy(naver_id)
    chains.key_down(Keys.CONTROL)
    chains.send_keys_to_element(input_id, 'v')
    chains.perform()
    pyperclip.copy(naver_pw)
    time.sleep(random.uniform(0.5,1))
    chains.key_down(Keys.CONTROL)
    chains.send_keys_to_element(input_pw, 'v')
    chains.perform()
    chains.pause(3) 
    chains.click(login_btn) 
    chains.perform()
except:
    print("[오류 발생] : 로그인 과정(2)에서 오류가 발생하였습니다.")
    driver.quit()

# 스펙업 카페 > 취준생 | 이야기방 게시판으로 이동
try:
    driver.get('https://m.cafe.naver.com/ca-fe/web/cafes/15754634/menus/1212')
    driver.implicitly_wait(10)
except:
    print("[오류 발생] : 게시판을 불러오는 과정에서 오류가 발생하였습니다.")
    driver.quit()


# 최신 게시글 20개 크롤링하여 csv 파일 생성
import csv
csv_headers = ["Site URL", "Title", "Content"]

with open(csv_file_path, mode='w', newline='', encoding='utf-8') as file:
    writer = csv.writer(file)
    writer.writerow(csv_headers)
    print("CSV 파일 생성 완료 성공")
    try:
        posts_url = driver.find_elements(By.CSS_SELECTOR, 'li.board_box > div.ArticleListItem > a.txt_area[href]')
        for post_url in posts_url[:20]:
            href = post_url.get_attribute("href")
            print(f"사이트 주소 : {href}")
            script = f"window.open('{href}');" 
            driver.execute_script(script)
            driver.implicitly_wait(10)
            driver.switch_to.window(driver.window_handles[1])
            subject = driver.find_element(By.CSS_SELECTOR, "h2.tit").text
            print(f"글 제목 : {subject}")
            content = driver.find_element(By.CSS_SELECTOR, "#postContent").text
            print(f"글 내용 : {content}")
            writer.writerow([href, subject, content])
            driver.close()
            time.sleep(0.5)
            driver.switch_to.window(driver.window_handles[0])
    except:
        print("[오류 발생] : 크롤링하고 csv 파일을 생성하는 과정에서 오류가 발생하였습니다")
        driver.quit() 

try:
    driver.quit() 
except Exception as e:
    print(f"종료 중 오류 발생: {e}")
    
print("데이터가 성공적으로 CSV 파일에 저장되었습니다.")
