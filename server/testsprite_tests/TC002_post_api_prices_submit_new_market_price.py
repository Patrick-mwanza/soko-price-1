import requests

BASE_URL = "http://localhost:5000"
LOGIN_ENDPOINT = f"{BASE_URL}/api/auth/login"
PRICES_ENDPOINT = f"{BASE_URL}/api/prices"
TIMEOUT = 30

ADMIN_CREDENTIALS = {
    "username": "admin",
    "password": "adminpassword"
}

def test_post_api_prices_submit_new_market_price():
    # Authenticate admin user to get JWT token
    try:
        login_resp = requests.post(LOGIN_ENDPOINT, json=ADMIN_CREDENTIALS, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Login request failed: {e}"
    assert login_resp.status_code == 200, f"Expected 200 on login but got {login_resp.status_code}"
    login_json = login_resp.json()
    token = login_json.get("token")
    assert token, "Login response missing JWT token"

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # Define a new price submission payload
    price_payload = {
        "cropId": "crop123",
        "marketId": "market123",
        "pricePerKg": 3500,
        "notes": "Test price submission"
    }

    # 1. Test authenticated submission (should succeed)
    try:
        post_resp = requests.post(PRICES_ENDPOINT, json=price_payload, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Authenticated POST /api/prices request failed: {e}"
    assert post_resp.status_code == 201, f"Expected 201 but got {post_resp.status_code}"
    post_json = post_resp.json()
    # Validate that price object includes expected fields and confidence score
    assert isinstance(post_json, dict), "Response is not a JSON object"
    assert "cropId" in post_json and post_json["cropId"] == price_payload["cropId"]
    assert "marketId" in post_json and post_json["marketId"] == price_payload["marketId"]
    assert "pricePerKg" in post_json and post_json["pricePerKg"] == price_payload["pricePerKg"]
    assert "notes" in post_json and post_json["notes"] == price_payload["notes"]
    assert "confidenceScore" in post_json, "Response missing confidenceScore field"
    confidence = post_json["confidenceScore"]
    assert isinstance(confidence, (float, int)), f"confidenceScore should be numeric, got {type(confidence)}"

    # 2. Test unauthenticated submission (should be denied)
    try:
        unauth_resp = requests.post(PRICES_ENDPOINT, json=price_payload, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Unauthenticated POST /api/prices request failed: {e}"
    assert unauth_resp.status_code == 401, f"Expected 401 Unauthorized but got {unauth_resp.status_code}"

test_post_api_prices_submit_new_market_price()