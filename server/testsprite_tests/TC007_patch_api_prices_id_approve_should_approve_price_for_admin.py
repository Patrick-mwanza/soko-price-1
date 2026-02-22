import requests
import uuid

base_url = "http://localhost:5000"
timeout = 30

admin_email = "admin@sokoprice.co.ke"
admin_password = "Admin@123456"

def test_patch_api_prices_id_approve_should_approve_price_for_admin():
    # Login as admin to get token
    login_url = f"{base_url}/api/auth/login"
    login_payload = {
        "email": admin_email,
        "password": admin_password
    }
    try:
        login_resp = requests.post(login_url, json=login_payload, timeout=timeout)
        assert login_resp.status_code == 200, f"Admin login failed with status {login_resp.status_code}"
        login_data = login_resp.json()
        admin_token = login_data.get("token")
        assert admin_token, "Admin token missing in login response"
    except Exception as e:
        raise AssertionError(f"Admin login request failed: {e}")

    headers_auth = {
        "Authorization": f"Bearer {admin_token}"
    }

    # Need to create a new price (pending) to approve
    # For that, fetch a crop and market to use valid IDs
    try:
        crops_resp = requests.get(f"{base_url}/api/crops", timeout=timeout)
        assert crops_resp.status_code == 200
        crops = crops_resp.json()
        assert isinstance(crops, list) and len(crops) > 0, "No crops found"
        crop_id = crops[0].get("id") or crops[0].get("_id")
        assert crop_id, "Crop ID not found"

        markets_resp = requests.get(f"{base_url}/api/markets", timeout=timeout)
        assert markets_resp.status_code == 200
        markets = markets_resp.json()
        assert isinstance(markets, list) and len(markets) > 0, "No markets found"
        market_id = markets[0].get("id") or markets[0].get("_id")
        assert market_id, "Market ID not found"
    except Exception as e:
        raise AssertionError(f"Failed to fetch crops or markets: {e}")

    # Create a new price report (pending)
    price_data = {
        "cropId": crop_id,
        "marketId": market_id,
        "price": 1234.56,
        "sourceId": str(uuid.uuid4()),
        "notes": "Test price for approval"
    }

    price_id = None
    try:
        create_price_resp = requests.post(f"{base_url}/api/prices", json=price_data, timeout=timeout)
        assert create_price_resp.status_code == 201, f"Failed to create price, status: {create_price_resp.status_code}"
        created_price = create_price_resp.json()
        price_id = created_price.get("id") or created_price.get("_id")
        assert price_id, "Created price ID missing"
    except Exception as e:
        raise AssertionError(f"Failed to create price for approval test: {e}")

    # Try-finally to ensure cleanup (delete the created price)
    try:
        # Approve the price
        approve_url = f"{base_url}/api/prices/{price_id}/approve"
        approve_resp = requests.patch(approve_url, headers=headers_auth, timeout=timeout)
        assert approve_resp.status_code == 200, f"Approve failed with status {approve_resp.status_code}"
        approved_price = approve_resp.json()

        # Validate that the returned price is approved
        assert approved_price.get("id") == price_id or approved_price.get("_id") == price_id
        assert approved_price.get("approved") is True or approved_price.get("status") == "approved", "Price not marked approved"
    finally:
        # Cleanup: reject/delete the created price if still pending or remove from system to avoid pollution
        if price_id is not None:
            reject_url = f"{base_url}/api/prices/{price_id}/reject"
            try:
                requests.patch(reject_url, headers=headers_auth, timeout=timeout)
            except Exception:
                # best effort, ignore cleanup errors
                pass

test_patch_api_prices_id_approve_should_approve_price_for_admin()
