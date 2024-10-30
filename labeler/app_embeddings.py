import os
import weaviate
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv
import re
import emoji
from soynlp.normalizer import repeat_normalize
from typing import List, Optional

load_dotenv(override=True)

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
CERTAINTY_THRESHOLD = 0.7

app = FastAPI()
openai_client = OpenAI(api_key=OPENAI_API_KEY)
weaviate_client = weaviate.Client(url='http://localhost:8090')

# Data preprocessing patterns
normal_pattern = re.compile(r'[^ .,?!/@$%~％·∼()\x00-\x7Fㄱ-ㅣ가-힣]+')
url_pattern = re.compile(r'https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)')

class SearchResponse(BaseModel):
    id: int
    title: str
    text: str
    similarity: float

class PaginatedSearchResponse(BaseModel):
    data: List[SearchResponse]
    pagination: dict

def preprocess(value):
    if not value:
        return ''
    value = normal_pattern.sub(' ', value)
    value = emoji.replace_emoji(value, replace='')
    value = url_pattern.sub('', value)
    value = repeat_normalize(value, num_repeats=2)
    return value.strip()

def get_embedding(text):
    try:
        response = openai_client.embeddings.create(
            input=[text],
            model='text-embedding-3-large'
        )
        return response.data[0].embedding
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating embedding: {str(e)}")

def get_total_count(query_embedding):
    # Get total count of matching documents
    results = (
        weaviate_client.query
        .get('Article', ['article_id'])
        .with_near_vector({
            'vector': query_embedding,
            'certainty': CERTAINTY_THRESHOLD
        })
        .with_limit(1000)  # Use a large number to get total count
        .do()
    )
    return len(results['data']['Get']['Article'])

@app.get("/search", response_model=PaginatedSearchResponse)
async def search(
    query: str, 
    start: Optional[int] = 0,
    limit: Optional[int] = 20
):
    try:
        # Validate pagination parameters
        if start < 0:
            raise HTTPException(status_code=400, detail="Start parameter must be non-negative")
        if limit <= 0:
            raise HTTPException(status_code=400, detail="Limit parameter must be positive")

        # Preprocess and get embedding
        processed_query = preprocess(query)
        query_embedding = get_embedding(processed_query)
        
        if not query_embedding:
            return {
                "data": [],
                "pagination": {
                    "totalCount": 0,
                    "start": start,
                    "limit": limit
                }
            }
        
        # Get total count for pagination
        total_count = get_total_count(query_embedding)
        
        # Perform Weaviate search with pagination
        results = (
            weaviate_client.query
            .get('Article', ['article_id', 'title', 'text'])
            .with_near_vector({
                'vector': query_embedding,
                'certainty': CERTAINTY_THRESHOLD
            })
            .with_additional(['certainty'])
            .with_limit(limit)
            .with_offset(start)
            .do()
        )

        # Format results
        articles = results['data']['Get']['Article']
        formatted_results = []
        for article in articles:
            formatted_results.append(SearchResponse(
                id=article['article_id'],
                title=article['title'],
                text=article['text'][:200] + '...' if len(article['text']) > 200 else article['text'],
                similarity=article.get('_additional', {}).get('certainty', 0)
            ))
            
        return {
            "data": formatted_results,
            "pagination": {
                "totalCount": total_count,
                "start": start,
                "limit": limit
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == '__main__':
    try:
        uvicorn.run(app, host='0.0.0.0', port=11050)
    except KeyboardInterrupt:
        pass
    except Exception as error:
        print(error)
