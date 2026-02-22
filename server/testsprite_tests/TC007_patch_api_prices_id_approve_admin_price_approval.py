import requests
import uuid

BASE_URL = "http://localhost:5000"
ADMIN_EMAIL = "admin@sokoprice.co.ke"
ADMIN_PASSWORD = "Admin@123456"
TIMEOUT = 30

def test_patch_api_prices_id_approve_admin_price_approval():
    session = requests.Session()
    try:
        # 1. Login as admin to get JWT token
        login_resp = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            timeout=TIMEOUT
        )
        assert login_resp.status_code == 200, f"Admin login failed: {login_resp.text}"
        login_data = login_resp.json()
        token = login_data.get("token")
        assert token, "No token received from admin login"

        headers_auth = {"Authorization": f"Bearer {token}"}

        # 2. Get list of crops to get valid cropId for price submission
        crops_resp = session.get(f"{BASE_URL}/api/crops", timeout=TIMEOUT)
        assert crops_resp.status_code == 200, f"Failed to get crops: {crops_resp.text}"
        crops = crops_resp.json()
        assert isinstance(crops, list) and len(crops) > 0, "No crops available"
        crop_id = crops[0]["id"] if "id" in crops[0] else crops[0].get("_id")
        assert crop_id, "Invalid crop object - no id"

        # 3. Get list of markets to get valid marketId for price submission
        markets_resp = session.get(f"{BASE_URL}/api/markets", timeout=TIMEOUT)
        assert markets_resp.status_code == 200, f"Failed to get markets: {markets_resp.text}"
        markets = markets_resp.json()
        assert isinstance(markets, list) and len(markets) > 0, "No markets available"
        market_id = markets[0]["id"] if "id" in markets[0] else markets[0].get("_id")
        assert market_id, "Invalid market object - no id"

        # 4. Create a new price report (status should be pending)
        price_submission = {
            "cropId": crop_id,
            "marketId": market_id,
            "price": 1234,           # sample price
            "sourceId": str(uuid.uuid4()),
            "notes": "Test price submission for approval"
        }
        post_price_resp = session.post(
            f"{BASE_URL}/api/prices",
            json=price_submission,
            timeout=TIMEOUT
        )
        assert post_price_resp.status_code == 201, f"Failed to create price: {post_price_resp.text}"
        price_data = post_price_resp.json()
        price_id = price_data.get("id") or price_data.get("_id")
        assert price_id, "Created price has no id"
        status_before = price_data.get("status")
        assert status_before == "pending", f"Price status expected 'pending', got '{status_before}'"

        # 5. Approve the price using PATCH /api/prices/:id/approve with admin token
        patch_resp = session.patch(
            f"{BASE_URL}/api/prices/{price_id}/approve",
            headers=headers_auth,
            timeout=TIMEOUT
        )
        assert patch_resp.status_code == 200, f"Approve request failed: {patch_resp.text}"
        approved_price = patch_resp.json()
        assert (approved_price.get("id") == price_id or approved_price.get("_id") == price_id), "Price ID mismatch after approval"
        status_after = approved_price.get("status")
        assert status_after == "approved", f"Price status expected 'approved', got '{status_after}'"

    finally:
        # Cleanup: Delete the created price if still exists & if API supports deletion (not in PRD)
        # Since no DELETE endpoint described, try reject as a cleanup if still pending or approved
        # Login steps already done, reuse headers_auth and session
        if 'price_id' in locals():
            try:
                session.patch(
                    f"{BASE_URL}/api/prices/{price_id}/reject",
                    headers=headers_auth,
                    timeout=TIMEOUT
                )
            except Exception:
                pass

test_patch_api_prices_id_approve_admin_price_approval()
