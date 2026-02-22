import requests

def test_post_api_ussd_process_session():
    base_url = "http://localhost:5000"
    url = f"{base_url}/api/ussd"
    headers = {
        "Content-Type": "application/json"
    }
    payload = {
        "sessionId": "testsession123",
        "serviceCode": "*123#",
        "phoneNumber": "+254700000000",
        "text": ""
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        assert response.status_code == 200, f"Expected status code 200 but got {response.status_code}"
        assert response.headers.get("Content-Type") is not None, "Missing Content-Type header"
        # Content-Type may include charset, so just check startswith text/plain
        assert response.headers.get("Content-Type").startswith("text/plain"), f"Expected Content-Type to start with 'text/plain' but got {response.headers.get('Content-Type')}"
        assert response.text.startswith("CON") or response.text.startswith("END"), f"Response text should start with CON or END but got: {response.text}"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_post_api_ussd_process_session()