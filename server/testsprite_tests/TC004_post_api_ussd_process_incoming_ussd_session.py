import requests
import uuid

BASE_URL = "http://localhost:5000"
API_PATH = "/api/ussd"
TIMEOUT = 30

def test_post_api_ussd_process_incoming_ussd_session():
    url = BASE_URL + API_PATH
    headers = {
        "Content-Type": "application/json"
    }

    # Generate a random sessionId to simulate a unique USSD session
    session_id = str(uuid.uuid4())
    service_code = "*123#"
    phone_number = "+254700000000"
    text_inputs = ["", "1", "1*1", "1*1*1"]  # Sequence of valid USSD menu navigation inputs

    for text in text_inputs:
        payload = {
            "sessionId": session_id,
            "serviceCode": service_code,
            "phoneNumber": phone_number,
            "text": text
        }

        try:
            response = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
            assert response.status_code == 200, f"Expected status code 200 for text='{text}', got {response.status_code}"
            assert response.headers.get("Content-Type", "").startswith("text/plain"), f"Response Content-Type is not text/plain for text='{text}'"

            response_text = response.text.strip()
            assert response_text.startswith("CON") or response_text.startswith("END"), \
                f"Response text must start with 'CON' or 'END' for text='{text}', got: {response_text}"

        except requests.RequestException as e:
            assert False, f"Request failed for text='{text}' with exception: {e}"

test_post_api_ussd_process_incoming_ussd_session()