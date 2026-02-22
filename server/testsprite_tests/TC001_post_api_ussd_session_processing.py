import requests

base_url = "http://localhost:5000"
headers = {"Content-Type": "application/json"}
timeout = 30

def test_post_api_ussd_session_processing():
    session_id = "test-session-1234"
    service_code = "*789#"
    phone_number = "+254712345678"

    # Step 1: Initial menu
    payload1 = {
        "sessionId": session_id,
        "serviceCode": service_code,
        "phoneNumber": phone_number,
        "text": ""
    }
    resp1 = requests.post(f"{base_url}/api/ussd", json=payload1, headers=headers, timeout=timeout)
    assert resp1.status_code == 200
    assert resp1.text.startswith("CON Welcome to SokoPrice")
    assert "1. Check market prices" in resp1.text
    assert "2. Submit today's price" in resp1.text
    assert "3. Language" in resp1.text

    # Step 2: Crop selection (user inputs '1')
    payload2 = {
        "sessionId": session_id,
        "serviceCode": service_code,
        "phoneNumber": phone_number,
        "text": "1"
    }
    resp2 = requests.post(f"{base_url}/api/ussd", json=payload2, headers=headers, timeout=timeout)
    assert resp2.status_code == 200
    assert resp2.text.startswith("CON Select crop:")
    assert "1. Maize" in resp2.text
    assert "2. Beans" in resp2.text
    assert "3. Rice" in resp2.text
    assert "4. Potatoes" in resp2.text

    # Step 3: Market selection (user inputs '1*1')
    payload3 = {
        "sessionId": session_id,
        "serviceCode": service_code,
        "phoneNumber": phone_number,
        "text": "1*1"
    }
    resp3 = requests.post(f"{base_url}/api/ussd", json=payload3, headers=headers, timeout=timeout)
    assert resp3.status_code == 200
    assert resp3.text.startswith("CON Select market:")
    assert "1. Wakulima" in resp3.text
    assert "2. Eldoret" in resp3.text

    # Step 4: Price result display (user inputs '1*1*1')
    payload4 = {
        "sessionId": session_id,
        "serviceCode": service_code,
        "phoneNumber": phone_number,
        "text": "1*1*1"
    }
    resp4 = requests.post(f"{base_url}/api/ussd", json=payload4, headers=headers, timeout=timeout)
    assert resp4.status_code == 200
    # Relaxed assertion: response starts with 'END' and contains 'Maize' and 'Wakulima'
    assert resp4.text.startswith("END")
    assert "Maize" in resp4.text
    assert "Wakulima" in resp4.text
    assert "KSh" in resp4.text
    assert "Confidence:" in resp4.text
    assert "1. Get SMS copy" in resp4.text

    # Step 5: SMS copy request (user inputs '1*1*1*1')
    payload5 = {
        "sessionId": session_id,
        "serviceCode": service_code,
        "phoneNumber": phone_number,
        "text": "1*1*1*1"
    }
    resp5 = requests.post(f"{base_url}/api/ussd", json=payload5, headers=headers, timeout=timeout)
    assert resp5.status_code == 200
    assert resp5.text.startswith("CON Sending SMS copy...")

    # Step 6: Missing sessionId -> validation error
    payload6 = {
        "serviceCode": service_code,
        "phoneNumber": phone_number
    }
    resp6 = requests.post(f"{base_url}/api/ussd", json=payload6, headers=headers, timeout=timeout)
    assert resp6.status_code == 400
    # Response text should mention that sessionId is required
    assert "sessionid is required" in resp6.text.lower()

test_post_api_ussd_session_processing()
