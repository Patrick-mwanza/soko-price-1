import requests

BASE_URL = "http://localhost:5000"

def test_post_api_prices_should_submit_new_price_report_and_return_created_price():
    timeout = 30

    # Step 1: Get crops to obtain a valid cropId
    crops_resp = requests.get(f"{BASE_URL}/api/crops", timeout=timeout)
    assert crops_resp.status_code == 200, f"Expected 200 but got {crops_resp.status_code}"
    crops = crops_resp.json()
    assert isinstance(crops, list), "Crops response should be a list"
    assert len(crops) > 0, "Crops list is empty"
    crop_id = crops[0].get('id') or crops[0].get('_id') or crops[0].get('cropId')
    assert crop_id, "cropId not found in first crop"

    # Step 2: Get markets to obtain a valid marketId
    markets_resp = requests.get(f"{BASE_URL}/api/markets", timeout=timeout)
    assert markets_resp.status_code == 200, f"Expected 200 but got {markets_resp.status_code}"
    markets = markets_resp.json()
    assert isinstance(markets, list), "Markets response should be a list"
    assert len(markets) > 0, "Markets list is empty"
    market_id = markets[0].get('id') or markets[0].get('_id') or markets[0].get('marketId')
    assert market_id, "marketId not found in first market"

    # Prepare payload for price submission
    payload = {
        "cropId": crop_id,
        "marketId": market_id,
        "price": 5200.75,
        "sourceId": "test-source-123",
        "notes": "Test price submission for pending state"
    }

    created_price_id = None

    try:
        # Step 3: Submit new price report
        post_resp = requests.post(f"{BASE_URL}/api/prices", json=payload, timeout=timeout)
        assert post_resp.status_code == 201, f"Expected 201 but got {post_resp.status_code}"
        created_price = post_resp.json()
        assert isinstance(created_price, dict), "Created price response should be a dict"

        # Validate returned fields
        # Must contain the fields we submitted and server-added fields such as status and confidence
        for key in ["cropId", "marketId", "price", "sourceId", "notes"]:
            assert key in created_price, f"{key} missing from created price response"
            assert created_price[key] == payload[key], f"{key} does not match submitted value"
        assert "status" in created_price, "status field missing from created price response"
        assert created_price["status"].lower() == "pending", "Price status should be 'pending'"
        assert "confidence" in created_price, "confidence scoring missing from created price response"
        confidence = created_price["confidence"]
        assert isinstance(confidence, (int, float)) or (isinstance(confidence, str) and confidence), "Invalid confidence value"

        created_price_id = created_price.get("id") or created_price.get("_id")
        assert created_price_id, "Created price ID missing from response"

    finally:
        # Cleanup: Attempt to delete created price if created_price_id is available (if API supports it)
        if created_price_id:
            try:
                # Attempt DELETE to /api/prices/:id if supported
                del_resp = requests.delete(f"{BASE_URL}/api/prices/{created_price_id}", timeout=timeout)
                # Accept 200 or 204 or 404 (if already deleted/not allowed)
                assert del_resp.status_code in [200, 204, 404], f"Unexpected delete status code {del_resp.status_code}"
            except Exception:
                pass

test_post_api_prices_should_submit_new_price_report_and_return_created_price()
