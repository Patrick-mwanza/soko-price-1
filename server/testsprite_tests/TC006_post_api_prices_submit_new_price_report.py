import requests

BASE_URL = "http://localhost:5000"
TIMEOUT = 30

def test_post_api_prices_submit_new_price_report():
    # Step 1: Retrieve available crops to get a valid cropId
    crops_resp = requests.get(f"{BASE_URL}/api/crops", timeout=TIMEOUT)
    assert crops_resp.status_code == 200, f"Failed to get crops: {crops_resp.text}"
    crops = crops_resp.json()
    assert isinstance(crops, list) and len(crops) > 0, "No crops available to use."
    crop_id = crops[0].get('id') or crops[0].get('_id')
    assert crop_id, "cropId not found in crop data."
    
    # Step 2: Retrieve available markets to get a valid marketId
    markets_resp = requests.get(f"{BASE_URL}/api/markets", timeout=TIMEOUT)
    assert markets_resp.status_code == 200, f"Failed to get markets: {markets_resp.text}"
    markets = markets_resp.json()
    assert isinstance(markets, list) and len(markets) > 0, "No markets available to use."
    market_id = markets[0].get('id') or markets[0].get('_id')
    assert market_id, "marketId not found in market data."

    # Prepare payload for price submission
    payload = {
        "cropId": crop_id,
        "marketId": market_id,
        "price": 3500,
        "sourceId": "test-source-id-123",
        "notes": "Test price submission from automated test"
    }
    
    price_obj = {}
    # Submit the new price report
    post_resp = requests.post(f"{BASE_URL}/api/prices", json=payload, timeout=TIMEOUT)
    try:
        assert post_resp.status_code == 201, f"Expected 201 Created, got {post_resp.status_code}: {post_resp.text}"
        price_obj = post_resp.json()
        assert isinstance(price_obj, dict), "Response is not a JSON object."
        # Validate returned Price object fields
        keys_expected = {"id", "_id", "cropId", "marketId", "price", "sourceId", "notes", "status"}
        assert any(k in price_obj for k in keys_expected), "Price object missing expected keys."
        # Check that returned fields match input where applicable
        assert str(price_obj.get("cropId")) == str(crop_id), f"cropId mismatch. Expected {crop_id}, got {price_obj.get('cropId')}"
        assert str(price_obj.get("marketId")) == str(market_id), f"marketId mismatch. Expected {market_id}, got {price_obj.get('marketId')}"
        assert price_obj.get("price") == 3500, "price value mismatch."
        assert price_obj.get("sourceId") == payload["sourceId"], "sourceId mismatch."
        assert price_obj.get("notes") == payload["notes"], "notes mismatch."
        # Status should be 'pending'
        status = price_obj.get("status")
        assert status == "pending", f"Expected status 'pending', got '{status}'."
    finally:
        # Cleanup: try to delete the created price object if id available
        price_id = price_obj.get("id") or price_obj.get("_id")
        if price_id:
            try:
                del_resp = requests.delete(f"{BASE_URL}/api/prices/{price_id}", timeout=TIMEOUT)
                # Deletion may return 200 or 204 or 404 if not found
                assert del_resp.status_code in (200, 204, 404), f"Failed to delete created price: {del_resp.status_code}"
            except Exception:
                pass

test_post_api_prices_submit_new_price_report()
