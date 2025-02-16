import joblib
import numpy as np
import pandas as pd
from transformers import AutoTokenizer, AutoModel
import re
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import nltk
import torch
import json

# Download necessary NLTK data
nltk.download('stopwords')
nltk.download('punkt_tab')

STOPWORDS = set(stopwords.words('english'))

class BERTEmbedding:
    def __init__(self, model_name="bert-base-uncased"):
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModel.from_pretrained(model_name)

    def encode(self, text):
        tokens = self.tokenizer(text, return_tensors='pt', truncation=True, padding=True, max_length=128)
        with torch.no_grad():
            outputs = self.model(**tokens)
        return outputs.last_hidden_state.mean(dim=1).squeeze().numpy()

bert_embedder = BERTEmbedding()

def preprocess_text(text):
    if not isinstance(text, str):
        return ''
    text = re.sub(r'\W', ' ', text).lower()
    tokens = word_tokenize(text)
    return ' '.join(word for word in tokens if word not in STOPWORDS)

def preprocess_items(items):
    if isinstance(items, str):
        try:
            items = json.loads(items)
        except json.JSONDecodeError:
            return ''
    elif not isinstance(items, list):
        return ''
    return ' '.join(item.get('name', '') for item in items if isinstance(item, dict))

def predict_case(case_data, model_path):
    model_data = joblib.load(model_path)
    model = model_data['model']
    scaler = model_data['scaler']
    encoded_columns = joblib.load("encoded_columns.pkl")

    case_data['title'] = preprocess_text(case_data['title'])
    case_data['description'] = preprocess_text(case_data['description'])
    items_text = preprocess_items(case_data['itemsNeeded'])

    title_embedding = bert_embedder.encode(case_data['title'])
    description_embedding = bert_embedder.encode(case_data['description'])
    items_embedding = bert_embedder.encode(items_text)

    X_text = np.concatenate([title_embedding, description_embedding, items_embedding])

    tabular_features_df = pd.DataFrame(
        [[case_data['salary'], case_data['creatorReputationScore']]],
        columns=['salary', 'creatorReputationScore']
    )
    X_tabular = scaler.transform(tabular_features_df)

    salary_image_validation_encoded = pd.DataFrame(
        [[1 if case_data['salaryImage_validation'] == val else 0 for val in ['valid', 'not valid', 'null']]],
        columns=[f"salaryImage_{val}" for val in ['valid', 'not valid', 'null']]
    )
    case_type_image_validation_encoded = pd.DataFrame(
        [[1 if case_data['caseTypeImage_validation'] == val else 0 for val in ['valid', 'not valid', 'null']]],
        columns=[f"caseTypeImage_{val}" for val in ['valid', 'not valid', 'null']]
    )

    encoded_features_df = pd.concat([salary_image_validation_encoded, case_type_image_validation_encoded], axis=1)
    encoded_features_df = encoded_features_df.reindex(columns=encoded_columns, fill_value=0)

    X_features = np.hstack((X_tabular[0], encoded_features_df.values.flatten()))
    X = np.hstack((X_text, X_features))

    prediction = model.predict([X])
    prediction_proba = model.predict_proba([X])

    return {
        "label": prediction[0],
        "probabilities": dict(zip(model.classes_, prediction_proba[0]))
    }

