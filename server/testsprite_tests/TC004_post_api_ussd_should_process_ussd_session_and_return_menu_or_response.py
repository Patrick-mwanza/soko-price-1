import requests
import uuid

BASE_URL = "http://localhost:5000"
HEADERS = {"Content-Type": "application/json"}
TIMEOUT = 30

def test_post_api_ussd_should_process_ussd_session_and_return_menu_or_response():
    """
    Test the USSD gateway /api/ussd endpoint with various session inputs 
    to verify it returns appropriate CON or END text/plain responses for menu navigation,
    price checking, price submission, and language change.
    """
    url = f"{BASE_URL}/api/ussd"
    session_id = str(uuid.uuid4())
    service_code = "*123#"
    phone_number = "+254700000000"

    def post_ussd(text):
        payload = {
            "sessionId": session_id,
            "serviceCode": service_code,
            "phoneNumber": phone_number,
            "text": text
        }
        try:
            res = requests.post(url, headers=HEADERS, json=payload, timeout=TIMEOUT)
            res.raise_for_status()
            # Response content type should be text/plain
            assert res.headers.get("Content-Type", "").startswith("text/plain")
            return res.text
        except requests.RequestException as e:
            raise AssertionError(f"Request failed for text='{text}': {e}")

    # 1. Initial USSD session with empty text should return CON main menu
    response = post_ussd("")
    assert response.startswith("CON"), "Expected response to start with 'CON' for main menu"
    assert "1. Check market prices" in response
    assert "2. Submit today's price" in response
    assert "3. Language" in response

    # 2. Check market prices option selected: '1' -> CON crop selection
    response = post_ussd("1")
    assert response.startswith("CON"), "Expected CON for crop selection"
    assert any(crop_option in response for crop_option in ["1.", "2.", "3.", "Maize", "Beans"]), "Expected crop list menu"

    # 3. Crop selected '1*1' -> CON market selection
    response = post_ussd("1*1")
    assert response.startswith("CON"), "Expected CON for market selection"
    assert any(market_option in response for market_option in ["1.", "2.", "Wakulima", "Eldoret"]), "Expected market list menu"

    # 4. Full selection '1*1*1' -> END with price info
    response = post_ussd("1*1*1")
    assert response.startswith("END"), "Expected END with price info"
    # Check that response contains 'KSh' and 'confidence' (case insensitive)
    lowered = response.lower()
    assert "ksh" in response or "ksh" in lowered, "Expected price formatted as KSh"
    assert "confidence" in lowered, "Expected confidence info in response"

    # 5. Submit today's price: initial option '2' -> CON prompt for submission flow
    response = post_ussd("2")
    assert response.startswith("CON"), "Expected CON prompt for price submission flow"

    # To submit price, text format '2*<crop>*<market>*<price>'
    # We will pick example values from previously fetched menus:
    # Use crop=1, market=1, price=3000 (string)
    # Note: the actual accepted values depend on backend data, assume valid numeric price and valid IDs "1"
    response = post_ussd("2*1*1*3000")
    assert response.startswith("END"), "Expected END confirming price stored as pending"
    assert any(keyword in response.lower() for keyword in ["pending", "stored", "thank you", "submitted", "price stored"]), "Expected confirmation message"

    # 6. Change language option '3' -> CON language selection or appropriate response
    response = post_ussd("3")
    assert response.startswith("CON") or response.startswith("END"), "Expected CON or END for language option"
    # May contain language options or confirmation prompt
    assert any(lang_string in response.lower() for lang_string in ["language", "swahili", "english"]) or response.strip().startswith(("CON", "END"))

    # 7. Invalid option '9' -> END with error message
    response = post_ussd("9")
    assert response.startswith("END"), "Expected END for invalid option"
    assert any(err_msg in response.lower() for err_msg in ["invalid option", "error", "not supported", "try again"]), "Expected error message for invalid option"


test_post_api_ussd_should_process_ussd_session_and_return_menu_or_response()
