import requests
BASE_URL = "http://localhost:5000"
TIMEOUT = 30

ADMIN_EMAIL = "admin@sokoprice.co.ke"
ADMIN_PASSWORD = "Admin@123456"

def test_patch_api_prices_id_reject_should_reject_and_remove_price_for_admin():
    # Authenticate as admin to get JWT token
    login_url = f"{BASE_URL}/api/auth/login"
    login_payload = {
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    }
    try:
        login_response = requests.post(login_url, json=login_payload, timeout=TIMEOUT)
        assert login_response.status_code == 200, f"Admin login failed: {login_response.text}"
        token = login_response.json().get("token")
        assert token, "No token received on admin login"
    except Exception as e:
        raise AssertionError(f"Admin authentication failed: {e}")

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # Prepare to create a new pending price resource to test rejection
    # Need to get valid cropId and marketId for submission
    try:
        # Get list of crops
        crops_resp = requests.get(f"{BASE_URL}/api/crops", timeout=TIMEOUT)
        assert crops_resp.status_code == 200, f"Failed to get crops: {crops_resp.text}"
        crops = crops_resp.json()
        assert isinstance(crops, list) and len(crops) > 0, "No crops available to use"
        crop_id = crops[0].get("id") or crops[0].get("_id")
        assert crop_id, "Crop ID not found"

        # Get list of markets
        markets_resp = requests.get(f"{BASE_URL}/api/markets", timeout=TIMEOUT)
        assert markets_resp.status_code == 200, f"Failed to get markets: {markets_resp.text}"
        markets = markets_resp.json()
        assert isinstance(markets, list) and len(markets) > 0, "No markets available to use"
        market_id = markets[0].get("id") or markets[0].get("_id")
        assert market_id, "Market ID not found"

        # Submit a new price (pending state)
        price_submission_url = f"{BASE_URL}/api/prices"
        new_price_payload = {
            "cropId": crop_id,
            "marketId": market_id,
            "price": 1234.56,
            "sourceId": "507f1f77bcf86cd799439011",  # valid ObjectId format string
            "notes": "Test price for rejection"
        }
        submit_resp = requests.post(price_submission_url, json=new_price_payload, timeout=TIMEOUT)
        assert submit_resp.status_code == 201, f"Failed to submit price: {submit_resp.text}"
        created_price = submit_resp.json()
        price_id = created_price.get("id") or created_price.get("_id")
        assert price_id, "Created price ID missing"
    except Exception as e:
        raise AssertionError(f"Setup failed: {e}")

    # Now attempt to reject the created price using PATCH /api/prices/:id/reject with admin token
    reject_url = f"{BASE_URL}/api/prices/{price_id}/reject"
    try:
        reject_resp = requests.patch(reject_url, headers=headers, timeout=TIMEOUT)
        assert reject_resp.status_code == 200, f"Reject request failed: {reject_resp.text}"
        resp_json = reject_resp.json()
        expected_message = "Price rejected and removed"
        assert resp_json.get("message") == expected_message, f"Unexpected reject message: {resp_json}"

        # Verify that the price was removed by checking GET /api/prices with filter for this price id (should not be found)
        prices_list_resp = requests.get(f"{BASE_URL}/api/prices", timeout=TIMEOUT)
        assert prices_list_resp.status_code == 200, f"Failed to list prices: {prices_list_resp.text}"
        prices = prices_list_resp.json().get("prices", [])
        # The rejected price should no longer exist
        price_ids = [p.get("id") or p.get("_id") for p in prices]
        assert price_id not in price_ids, "Rejected price still exists in price list"
    finally:
        # Try to clean up: if price still exists, delete it forcibly (no direct DELETE endpoint specified, skipping)
        pass

test_patch_api_prices_id_reject_should_reject_and_remove_price_for_admin()
