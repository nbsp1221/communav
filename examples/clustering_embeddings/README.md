## Intro

한국어 사전 학습 모델 "klue/roberta-base"의 임베딩 레이어를 활용해서 에타 크롤링 데이터에서 상위 29000개를 뽑아서 임베딩 진행

Kmeans.ipynb : Kmeans 에서 k를 늘려가면서 실루엣 점수가 높은 상위 4개를 골라서 뽑아서 진행.( 이진 분류는 제외함)

clustering_Tokens.ipynb : 분류된 각 코퍼스에서 상위 100개 키워드를 출력
