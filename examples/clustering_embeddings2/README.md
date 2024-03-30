# Intro
한국어 사전 학습 문장 임베딩 모델 "Huffon/sentence-klue-roberta-base"을 활용해서 문장 임베딩 후 UMAP 기법으로 차원 축소를 적용 

그 후 Kmeans 에서 k를 늘려가면서 실루엣 점수와 SSE 값이 둘 다 좋게 나온 k를 뽑고 tf_idf 값으로 각 라벨링 중 높게 나온 상위 20개 키워드 출력

