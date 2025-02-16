import json
import sys
import logging
from predict_case_module import predict_case

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')

def main():
    if len(sys.argv) != 4:
        print("Usage: python predictLabel.py predict <model_path> <input_json>")
        sys.exit(1)

    command = sys.argv[1]
    model_path = sys.argv[2]
    input_json_file = sys.argv[3]

    if command == "predict":
        # Load cases from the JSON file
        with open(input_json_file, 'r') as file:
            cases = json.load(file)

        predictions = []
        for case_data in cases:
            prediction = predict_case(case_data, model_path)
            predictions.append(prediction)

        # Print predictions as JSON
        print(json.dumps(predictions))
    else:
        print("Invalid command. Only 'predict' is supported.")
        sys.exit(1)

if __name__ == "__main__":
    main()
