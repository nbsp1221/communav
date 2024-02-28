import os
import sys

absolute_path = os.path.dirname(os.path.abspath(__file__))
root_path = os.path.normpath(os.path.join(absolute_path, '..', '..'))

if root_path not in sys.path:
    sys.path.append(root_path)

import numpy as np
import torch
import uvicorn
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from sentence_transformers import util
from src.utils import db

# Load articles from database
with db.get_connection() as connection:
    with connection.cursor() as cursor:
        cursor.execute('SELECT * FROM `everytime_articles`')
        articles = cursor.fetchall()

# Load model and embeddings
model_path = os.path.join(absolute_path, 'model.pth')
embeddings_path = os.path.join(absolute_path, 'embeddings.pth')
model = torch.load(model_path)
embeddings = torch.load(embeddings_path)

app = FastAPI()

@app.post('/predict')
async def predict(request: Request):
    data = await request.json()
    query = data.get('query', '')
    top_k = data.get('top_k', 5)

    query_embedding = model.encode(query, convert_to_tensor=True)
    cos_scores = util.pytorch_cos_sim(query_embedding, embeddings)[0].cpu()
    top_results = np.argpartition(-cos_scores, range(top_k))[:top_k]

    return {
        'query': query,
        'predictions': [
            {
                'score': cos_scores[i].item(),
                'article': articles[i]
            }
            for i in top_results
        ]
    }

app.mount('/', StaticFiles(directory=os.path.join(absolute_path, 'public'), html=True), name='public')

if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=8000)
