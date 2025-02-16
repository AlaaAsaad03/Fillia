import pandas as pd
import pytesseract
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.metrics import confusion_matrix
from PIL import Image
import numpy as np
import pickle
import re
import json

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# Train Salary Validation Model
def train_salary_model():
    # Load salary dataset
    salary_data = pd.read_csv("C:/Users/Alaa As'ad/synthetic_dataset_with_images.csv")
    # Text Vectorization
    vectorizer = CountVectorizer()
    text_features = vectorizer.fit_transform(salary_data["text_content"]).toarray()

    # Add numerical features
    numerical_features = salary_data[
        ["salary_value", "expected_salary", "contains_salary_content"]
    ].values

    # Combine features
    X = np.hstack([text_features, numerical_features])
    y = salary_data["is_valid"]

    # Split dataset
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Train model
    clf = RandomForestClassifier(random_state=42, n_estimators=100)
    clf.fit(X_train, y_train)

    # Test the model
    y_pred = clf.predict(X_test)
    print("Salary Model Accuracy:", accuracy_score(y_test, y_pred))
    # cm = confusion_matrix(y_test, y_pred)
    # feature_importances = clf.feature_importances_
    # print("Feature Importances:", feature_importances)
    # print("Confusion Matrix:\n", cm)
    # print("Classification Report:\n", classification_report(y_test, y_pred))
    # Save the vectorizer and model

    with open("C:/Users/Alaa As'ad/salary_vectorizer.pkl", "wb") as vec_file:
        
        pickle.dump(vectorizer, vec_file)
    with open("C:/Users/Alaa As'ad/salary_model.pkl", "wb") as model_file:
        pickle.dump(clf, model_file)

    # print("Salary validation model trained and saved!")

# Train Case Type Validation Model
def train_case_type_model():
    # Load medical dataset
    medical_data = pd.read_csv("C:/Users/Alaa As'ad/medical_v2_dataset_with_images.csv")

    # Text Vectorization
    vectorizer = CountVectorizer()
    text_features = vectorizer.fit_transform(medical_data["text_content"]).toarray()
    
    numerical_features = medical_data[["contains_medical_content"]].values

    # Combine features
    X = np.hstack([text_features, numerical_features])
    y = medical_data["is_valid"]

    # Split dataset
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Train model
    clf = RandomForestClassifier(random_state=42, n_estimators=100)
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    print("Case Type Model Accuracy:", accuracy_score(y_test, y_pred))
    # cm = confusion_matrix(y_test, y_pred)
    # feature_importances = clf.feature_importances_
    # print("Feature Importances:", feature_importances)
    # print("Confusion Matrix:\n", cm)
    # print("Classification Report:\n", classification_report(y_test, y_pred))

    # Save the vectorizer and model
    with open("C:/Users/Alaa As'ad/medical_vectorizer.pkl", "wb") as vec_file:
        pickle.dump(vectorizer, vec_file)
    with open("C:/Users/Alaa As'ad/medical_model.pkl", "wb") as model_file:
        pickle.dump(clf, model_file)

    # print("Case type validation model trained and saved!")

# Validate Case Type Image
def validate_case_type_image(image_path):

    if not image_path or image_path.lower() == "null":
        return None
    
    try:
        img = Image.open(image_path)
        text_content = pytesseract.image_to_string(img)
    #    print(f"Extracted Text:\n{text_content}")
    except Exception as e:
        print(f"Error in case type image processing: {e}") 
        return None

    # Determine if it contains medical content
    medical_keywords = ["medical", "medicine", "doctor", "hospital", "prescription", "health", "treatment", "diagnosis", "price", "consultation", "Age", "height", "weight", "Gender", "sick", "emergency", "signature", "Assessment", "Dr.", "patient", "report"]
    contains_medical_content = int(any(keyword in text_content.lower() for keyword in medical_keywords))

    medical_input_data = {
        "text_content": [text_content],
        "contains_medical_content": [contains_medical_content],
    }

    medical_input_df = pd.DataFrame(medical_input_data)

    # Load saved vectorizer and model
    with open("C:/Users/Alaa As'ad/medical_vectorizer.pkl", "rb") as vec_file:
        vectorizer = pickle.load(vec_file)
    with open("C:/Users/Alaa As'ad/medical_model.pkl", "rb") as model_file:
        model = pickle.load(model_file)

    # Vectorize text
    text_features = vectorizer.transform(medical_input_df["text_content"]).toarray()
    numerical_features = medical_input_df[["contains_medical_content"]].values
    final_features = np.hstack([text_features, numerical_features])

    # Predict case type validation
    prediction = model.predict(final_features)
    return "Valid" if prediction[0] == 1 else "Not Valid"

# Validate Salary Image
def validate_salary_image(image_path, expected_salary):
    try:
        img = Image.open(image_path)
        text_content = pytesseract.image_to_string(img)
      #  print(f"Extracted Text:\n{text_content}")
    except Exception as e:
        print(f"Error in salary image processing: {e}")
        return "Error in salary image processing"

    # Determine if it contains salary content
    contains_salary_content = int("payslip" in text_content.lower() or "gross pay" in text_content.lower())

    # Extract salary value using regex
    salary_value = 0
    salary_matches = re.findall(r'\$?\d{1,3}(?:,\d{3})*(?:\.\d+)?', text_content)
    if salary_matches:
        salary_value = int(salary_matches[0].replace(',', '').replace('$', ''))
    
    # Combine features
    salary_input_data = {
        "text_content": [text_content],
        "salary_value": [salary_value],
        "expected_salary": [expected_salary],
        "contains_salary_content": [contains_salary_content],
    }
    salary_input_df = pd.DataFrame(salary_input_data)

    # Load saved vectorizer and model
    with open("C:/Users/Alaa As'ad/salary_vectorizer.pkl", "rb") as vec_file:
        vectorizer = pickle.load(vec_file)
    with open("C:/Users/Alaa As'ad/salary_model.pkl", "rb") as model_file:
        model = pickle.load(model_file)

    # Vectorize text and combine with numerical features
    text_features = vectorizer.transform(salary_input_df["text_content"]).toarray()
    numerical_features = salary_input_df[
        ["salary_value", "expected_salary", "contains_salary_content"]
    ].values
    final_features = np.hstack([text_features, numerical_features])

    # Predict salary validation
    prediction = model.predict(final_features)
    return "Valid" if prediction[0] == 1 else "Not Valid"

# Main Function to Process Cases
def process_cases(json_file):
    with open(json_file, "r") as file:
        cases = json.load(file)

    results = []
    for case in cases:
        case_id = case.get('caseId')
        salary_image_path = case.get('salaryImage')
        case_type_image_path = case.get('caseTypeImage')
        expected_salary = case.get('salary')
        
        salary_result = validate_salary_image(salary_image_path, expected_salary)
        case_type_result = validate_case_type_image(case_type_image_path)
        results.append({
            "caseId": case_id,
            "salaryImage_validation": salary_result,
            "caseTypeImage_validation": case_type_result,
        })

    return results

def print_json_output(results):
    print(json.dumps(results)) 

if __name__ == "__main__":
    json_file_path = "cases.json"
    results = process_cases(json_file_path)  # Correctly capture results
    print_json_output(results)  # Print the output