import requests
import uuid

BASE_URL = "http://localhost:5000"
TIMEOUT = 30

# Admin credentials must be seeded before running this test
ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "adminpassword"

def test_patch_api_prices_id_reject_price():
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
        assert token, "No token received in login response"

        headers_auth = {"Authorization": f"Bearer {token}"}

        # Step 2: Get cropId and marketId to create a new pending price
        crops_resp = requests.get(f"{BASE_URL}/api/crops", timeout=TIMEOUT)
        assert crops_resp.status_code == 200, f"Failed to get crops: {crops_resp.text}"
        crops_list = crops_resp.json()
        assert isinstance(crops_list, list) and len(crops_list) > 0, "Crops list is empty"
        crop_id = crops_list[0].get("id") or crops_list[0].get("_id") or crops_list[0].get("id")

        markets_resp = requests.get(f"{BASE_URL}/api/markets", timeout=TIMEOUT)
        assert markets_resp.status_code == 200, f"Failed to get markets: {markets_resp.text}"
        markets_list = markets_resp.json()
        assert isinstance(markets_list, list) and len(markets_list) > 0, "Markets list is empty"
        market_id = markets_list[0].get("id") or markets_list[0].get("_id") or markets_list[0].get("id")

        # Step 3: Submit a new price (status: pending)
        price_post_url = f"{BASE_URL}/api/prices"
        new_price_payload = {
            "cropId": crop_id,
            "marketId": market_id,
            "price": 1000,
            "sourceId": str(uuid.uuid4()),
            "notes": "Test price for rejection"
        }
        post_resp = requests.post(price_post_url, json=new_price_payload, timeout=TIMEOUT)
        assert post_resp.status_code == 201, f"Price creation failed: {post_resp.text}"
        price_obj = post_resp.json()
        price_id = price_obj.get("id") or price_obj.get("_id")
        assert price_id, "Created price ID missing"

        # Step 4: Reject the price using PATCH /api/prices/:id/reject with Authorization header
        reject_url = f"{BASE_URL}/api/prices/{price_id}/reject"
        reject_resp = requests.patch(reject_url, headers=headers_auth, timeout=TIMEOUT)
        assert reject_resp.status_code == 200, f"Price rejection failed: {reject_resp.text}"
        reject_data = reject_resp.json()
        assert (
            isinstance(reject_data, dict)
            and "message" in reject_data
            and "Price rejected and removed" in reject_data["message"]
        ), f"Unexpected rejection message: {reject_data}"

        # Step 5: Confirm the price is removed by trying to get it or listing pending prices
        # We attempt to get from /api/prices?approved=false or pending check
        list_resp = requests.get(f"{BASE_URL}/api/prices?approved=false", headers=headers_auth, timeout=TIMEOUT)
        assert list_resp.status_code == 200, f"Failed to list prices after rejection: {list_resp.text}"
        prices_list = list_resp.json().get("prices") or list_resp.json()
        assert all(p.get("id") != price_id and p.get("_id") != price_id for p in prices_list), "Rejected price still present in pending list"

    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_patch_api_prices_id_reject_price()
