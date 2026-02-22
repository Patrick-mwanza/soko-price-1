import requests

BASE_URL = "http://localhost:5000"
TIMEOUT = 30

ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "AdminPass123!"

def test_patch_api_prices_id_approve_price():
    # Step 1: Login as admin to get JWT token
    login_url = f"{BASE_URL}/api/auth/login"
    login_payload = {
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    }
    try:
        login_resp = requests.post(login_url, json=login_payload, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Admin login failed: {login_resp.text}"
        login_data = login_resp.json()
        token = login_data.get("token")
        assert token, "JWT token missing in login response"
    except Exception as e:
        raise AssertionError(f"Error during admin login: {e}")

    headers_auth = {
        "Authorization": f"Bearer {token}"
    }

    # Step 2: As resource ID is not provided, create a new pending price resource
    # To create a price we need cropId, marketId, sourceId, price, notes
    # So fetch cropId, marketId, sourceId first

    try:
        # Get crops to obtain a valid cropId
        crops_resp = requests.get(f"{BASE_URL}/api/crops", timeout=TIMEOUT)
        assert crops_resp.status_code == 200, f"Failed to get crops: {crops_resp.text}"
        crops = crops_resp.json()
        assert isinstance(crops, list) and len(crops) > 0, "No crops found"
        crop_id = crops[0].get("id") or crops[0].get("_id")
        assert crop_id, "Crop id missing"

        # Get markets to obtain a valid marketId
        markets_resp = requests.get(f"{BASE_URL}/api/markets", timeout=TIMEOUT)
        assert markets_resp.status_code == 200, f"Failed to get markets: {markets_resp.text}"
        markets = markets_resp.json()
        assert isinstance(markets, list) and len(markets) > 0, "No markets found"
        market_id = markets[0].get("id") or markets[0].get("_id")
        assert market_id, "Market id missing"

        # The sourceId is not explicitly indicated where to get, but based on the domain likely source is submitting user or system
        # Let's try to use "sourceId" from admin user id since it's not used elsewhere for creation, fallback to user id from login
        source_id = login_data.get("user", {}).get("id")
        assert source_id, "Source ID missing (using admin user id)"

        # Create a new pending price
        price_submission_url = f"{BASE_URL}/api/prices"
        price_payload = {
            "cropId": crop_id,
            "marketId": market_id,
            "price": 1234.56,
            "sourceId": source_id,
            "notes": "Test price for approval patch"
        }
        price_resp = requests.post(price_submission_url, json=price_payload, timeout=TIMEOUT)
        assert price_resp.status_code == 201, f"Failed to create price: {price_resp.text}"
        price_data = price_resp.json()
        price_id = price_data.get("id") or price_data.get("_id")
        assert price_id, "Price ID missing in creation response"
        assert price_data.get("status") == "pending", "Price status not pending after creation"

        # Step 3: PATCH /api/prices/:id/approve with Authorization header
        approve_url = f"{BASE_URL}/api/prices/{price_id}/approve"
        approve_resp = requests.patch(approve_url, headers=headers_auth, timeout=TIMEOUT)
        assert approve_resp.status_code == 200, f"Approve patch failed: {approve_resp.text}"
        approve_data = approve_resp.json()

        # Validate the updated Price object has status approved
        assert approve_data.get("id") == price_id or approve_data.get("_id") == price_id, "Price ID mismatch in approve response"
        assert approve_data.get("status") == "approved", f"Price status expected 'approved' got '{approve_data.get('status')}'"

    finally:
        # Cleanup: Reject and remove the created price resource to not leave test data
        if 'price_id' in locals():
            reject_url = f"{BASE_URL}/api/prices/{price_id}/reject"
            try:
                requests.patch(reject_url, headers=headers_auth, timeout=TIMEOUT)
            except Exception:
                pass

test_patch_api_prices_id_approve_price()
