import requests
import uuid

BASE_URL = "http://localhost:5000"
ADMIN_EMAIL = "admin@sokoprice.co.ke"
ADMIN_PASSWORD = "Admin@123456"
TIMEOUT = 30


def test_patch_api_prices_id_reject_admin_price_rejection():
    headers = {"Content-Type": "application/json"}
    token = None
    price_id = None

    # Helper to login as admin and get JWT token
    def admin_login():
        login_url = f"{BASE_URL}/api/auth/login"
        payload = {"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        resp = requests.post(login_url, json=payload, timeout=TIMEOUT)
        assert resp.status_code == 200, f"Admin login failed: {resp.text}"
        json_resp = resp.json()
        assert "token" in json_resp, "No token found in login response"
        return json_resp["token"]

    # Helper to create a pending price to reject
    def create_pending_price():
        # Get list of crops
        crops_url = f"{BASE_URL}/api/crops"
        crops_resp = requests.get(crops_url, timeout=TIMEOUT)
        assert crops_resp.status_code == 200, f"Failed to get crops: {crops_resp.text}"
        crops = crops_resp.json()
        assert isinstance(crops, list) and len(crops) > 0, "No crops available"
        crop_id = crops[0].get("id") or crops[0].get("_id") or None
        assert crop_id, "Crop ID not found"

        # Get list of markets
        markets_url = f"{BASE_URL}/api/markets"
        markets_resp = requests.get(markets_url, timeout=TIMEOUT)
        assert markets_resp.status_code == 200, f"Failed to get markets: {markets_resp.text}"
        markets = markets_resp.json()
        assert isinstance(markets, list) and len(markets) > 0, "No markets available"
        market_id = markets[0].get("id") or markets[0].get("_id") or None
        assert market_id, "Market ID not found"

        # Create price
        price_url = f"{BASE_URL}/api/prices"
        price_payload = {
            "cropId": crop_id,
            "marketId": market_id,
            "price": 1000,
            "sourceId": str(uuid.uuid4()),
            "notes": "Test price for rejection"
        }
        price_resp = requests.post(price_url, json=price_payload, timeout=TIMEOUT)
        assert price_resp.status_code == 201, f"Failed to create price: {price_resp.text}"
        price_data = price_resp.json()
        _id = price_data.get("id") or price_data.get("_id") or None
        assert _id, "Created price ID not found"
        return _id

    # Helper to delete a price (if still exists)
    def delete_price(pid, token):
        if not pid or not token:
            return
        delete_url = f"{BASE_URL}/api/prices/{pid}/reject"
        hdrs = {"Authorization": f"Bearer {token}"}
        # Attempt DELETE via reject endpoint (some APIs might remove on reject)
        # But since this is a rejection test, we assume rejecting removes the price.
        # So if the reject succeeded in test, no delete needed.
        # But try anyway to clean up if something remains.
        try:
            resp = requests.patch(delete_url, headers=hdrs, timeout=TIMEOUT)
            # ignore response, cleanup attempt
        except Exception:
            pass

    try:
        # Login admin
        token = admin_login()
        auth_headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

        # Create a pending price to reject
        price_id = create_pending_price()

        # Reject the pending price
        reject_url = f"{BASE_URL}/api/prices/{price_id}/reject"
        reject_resp = requests.patch(reject_url, headers=auth_headers, timeout=TIMEOUT)
        assert reject_resp.status_code == 200, f"Reject request failed: {reject_resp.text}"
        reject_json = reject_resp.json()
        assert isinstance(reject_json, dict), "Reject response not a JSON object"
        assert "message" in reject_json, "No message in reject response"
        assert reject_json["message"].lower() == "price rejected and removed", \
            f"Unexpected reject message: {reject_json['message']}"

        # Confirm price is removed by attempting to get it or listing prices and ensure not found
        get_price_url = f"{BASE_URL}/api/prices/{price_id}"
        get_resp = requests.get(get_price_url, timeout=TIMEOUT)
        # Expecting 404 or similar since price should be removed
        assert get_resp.status_code in (404, 400), "Rejected price still accessible"
    finally:
        # Cleanup attempt
        if price_id and token:
            delete_price(price_id, token)


test_patch_api_prices_id_reject_admin_price_rejection()
