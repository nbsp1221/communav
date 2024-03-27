# -*- coding: euc-kr -*-
import sys
import io
from torch import embedding
sys.stdout = io.TextIOWrapper(sys.stdout.detach(), encoding = 'utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.detach(), encoding = 'utf-8')

from transformers import AutoModel, AutoTokenizer

model_name = "klue/roberta-base"  # 사용하려는 모델의 이름을 입력하세요.
model = AutoModel.from_pretrained(model_name)
tokenizer = AutoTokenizer.from_pretrained(model_name)

from Token import Tokenizer
import pandas as pd

file_path = r"processed_corp.csv"
df = pd.read_csv(file_path, encoding='utf-8-sig')
df.columns = ["title", "contents"]
df = df['contents']
df = df[:int(len(df) * 0.1)]

i = 0
for input_seq in df:
  if len(input_seq) == 0 or len(input_seq) >= 512: continue
  i += 1
  pd.DataFrame([{
    "index": i,
    "input": input_seq
    }]).to_csv('embedding_corpus.csv', encoding='utf-8-sig', mode='a', index=False, header=False)
  tokens, outputs, embeddings = Tokenizer().HuggingToken(input_seq, model_name)
  pd.DataFrame([{
            "index": i,
            "embedding": embeddings.detach().numpy().squeeze().mean(axis = 1)
  }]).to_csv('embedding_.csv', encoding='utf-8-sig', mode='a', index=False, header=False)
