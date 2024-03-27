from transformers import AutoModel, AutoTokenizer

class Tokenizer:
    def __init__(self):
        self.AutoModel = AutoModel
        self.AutoTokenizer = AutoTokenizer
      
    def HuggingToken(self , inputs, model_name):
        model = self.AutoModel.from_pretrained(model_name)
        tokenizer = self.AutoTokenizer.from_pretrained(model_name)

        input_seq = inputs 
        inputs = tokenizer(input_seq, return_tensors='pt', truncation=True, max_length=512)
        tokens = tokenizer.tokenize(input_seq)
        outputs = model(**inputs)
        embeddings = outputs.last_hidden_state
        return tokens, outputs, embeddings
    




