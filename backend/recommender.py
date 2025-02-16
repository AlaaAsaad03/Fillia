
import sys
import requests
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import json 
# Fetch cases from the API
def fetch_cases(api_url, token):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(api_url, headers=headers)
    if response.status_code == 200:
        return response.json().get("cases", [])
    else:
        raise Exception(f"Failed to fetch cases. Status code: {response.status_code}")

# Fetch user history cases
def fetch_user_history(api_url, token):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(api_url, headers=headers)
    if response.status_code == 200:
        return response.json().get("cases", [])
    else:
        raise Exception(f"Failed to fetch user history. Status code: {response.status_code}")

# Prepare dataset
def prepare_dataset(cases):
    processed_cases = []
    for case in cases:
        if isinstance(case, dict) and 'itemsNeeded' in case:
            case['itemsNeeded'] = [item['name'] for item in case['itemsNeeded']]
        processed_cases.append(case)

    df = pd.json_normalize(processed_cases)
    df['combined_features'] = df.apply(
        lambda row: f"{row['title']} {row['description']} {', '.join(row['itemsNeeded'])} {row['budgetNeeded']}",
        axis=1
    )
    return df

# Recommend cases
def recommend_cases(user_history_cases, all_cases):
    # Combine user history features
    user_features = " ".join(
        user_history_cases["combined_features"]
    )

    # Prepare recommendation dataset
    cv = CountVectorizer()
    combined_features = all_cases["combined_features"].tolist()
    count_matrix = cv.fit_transform([user_features] + combined_features)

    # Compute similarity
    cosine_sim = cosine_similarity(count_matrix)

    # Get top recommendations (skip the first row as it is the user's features)
    similar_cases = list(enumerate(cosine_sim[0][1:], start=1))
    sorted_similar_cases = sorted(similar_cases, key=lambda x: x[1], reverse=True)

    return [all_cases.iloc[i[0] - 1]["title"] for i in sorted_similar_cases[:5]]

# Main execution
if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python recommender.py <CASES_API_URL> <HISTORY_API_URL> <TOKEN>")
        sys.exit(1)

    cases_api_url = sys.argv[1]
    history_api_url = sys.argv[2]
    token = sys.argv[3]

    try:
        all_cases = fetch_cases(cases_api_url, token)
        user_history = fetch_user_history(history_api_url, token)

        all_cases_df = prepare_dataset(all_cases)
        user_history_df = prepare_dataset(user_history)

        recommendations = recommend_cases(user_history_df, all_cases_df)
        print(json.dumps(recommendations))
    except Exception as e:
        print(f"Error: {e}")
