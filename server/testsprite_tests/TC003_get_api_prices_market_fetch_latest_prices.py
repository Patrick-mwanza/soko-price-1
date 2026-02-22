import requests

BASE_URL = "http://localhost:5000"
TIMEOUT = 30

def test_get_api_prices_market_fetch_latest_prices():
    created_price = {}
    headers_auth = {}
    try:
        # Step 1: Authenticate as admin to create a price and get valid cropId and marketId
        login_resp = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"username": "admin", "password": "adminpassword"},
            timeout=TIMEOUT
        )
        assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}"
        token = login_resp.json().get("token")
        assert token, "JWT token missing in login response"
        headers_auth = {"Authorization": f"Bearer {token}"}

        # Step 2: Create new price entry to get valid cropId and marketId
        price_data = {
            "cropId": "testCrop",
            "marketId": "testMarket",
            "pricePerKg": 3500,
            "notes": "test price for fetching latest prices"
        }

        post_resp = requests.post(
            f"{BASE_URL}/api/prices",
            json=price_data,
            headers=headers_auth,
            timeout=TIMEOUT
        )
        assert post_resp.status_code == 201, f"Price creation failed with status {post_resp.status_code}"
        created_price = post_resp.json()
        # Extract IDs used for filter
        crop_id = created_price.get("cropId", price_data["cropId"])
        market_id = created_price.get("marketId", price_data["marketId"])

        # Step 3: Test fetch latest prices filtered by valid marketId and cropId
        params = {"marketId": market_id, "cropId": crop_id}
        get_resp = requests.get(
            f"{BASE_URL}/api/prices/market",
            params=params,
            timeout=TIMEOUT
        )
        assert get_resp.status_code == 200, f"GET prices/market with valid IDs failed with status {get_resp.status_code}"
        prices = get_resp.json()
        assert isinstance(prices, list), "Response is not a list"
        assert any(p.get("marketId") == market_id and p.get("cropId") == crop_id for p in prices), "No price matched requested marketId and cropId"

        # Step 4: Test GET with invalid marketId format, expect 400 Bad Request
        invalid_params = {"marketId": "invalid-id-format"}
        invalid_resp = requests.get(
            f"{BASE_URL}/api/prices/market",
            params=invalid_params,
            timeout=TIMEOUT
        )
        assert invalid_resp.status_code == 400, f"GET with invalid marketId did not return 400, returned {invalid_resp.status_code}"

    finally:
        # Clean up: delete the created price resource if possible
        price_id = created_price.get("_id") or created_price.get("id")
        if price_id and headers_auth:
            try:
                requests.delete(
                    f"{BASE_URL}/api/prices/{price_id}",
                    headers=headers_auth,
                    timeout=TIMEOUT
                )
            except Exception:
                pass  # best effort cleanup

test_get_api_prices_market_fetch_latest_prices()
