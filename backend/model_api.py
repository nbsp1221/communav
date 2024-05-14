import os
from fastapi import FastAPI
from transformers import AutoModelForSequenceClassification, AutoTokenizer, pipeline

os.environ["TRANSFORMERS_CACHE"] = "./cache/"
os.environ["HF_HOME"] = "./cache/"

model_id = 'nbsp1221/communav-kcelectra-multiclass-classification-v1'
tokenizer = AutoTokenizer.from_pretrained(
    model_id
)

model = AutoModelForSequenceClassification.from_pretrained(model_id) 
pipe = pipeline("text-classification", model=model,
                tokenizer=tokenizer)

# question = "미식성은 정말 짜장면이 맛없더라고.... 밍밍해 너무 밍밍 맹맹 냥냥"

# print(pipe(question))

app = FastAPI(
  title="Model Server",
  version="1.0",
  description="A simple API server using huggingface's Runnable interfaces",
)

@app.get("/agent")  
async def agent_endpoint(query: str): 
    response = pipe(query)
    return {"message": response}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

