import requests
import uuid

BASE_URL = r"http://localhost:5000/C:\Users\ADMIN\desktop\soko Yetu"
TIMEOUT = 30

def test_post_api_prices_submit_new_price_report():
    # Step 1: Get a cropId from /api/crops
    crops_resp = requests.get(f"{BASE_URL}/api/crops", timeout=TIMEOUT)
    assert crops_resp.status_code == 200, f"Expected 200 from /api/crops, got {crops_resp.status_code}"
    crops_data = crops_resp.json()
    assert isinstance(crops_data, list) or ('length' in crops_data and crops_data['length'] > 0 or len(crops_data) > 0), "No crops found"
    # accommodate response either as list or dict with array
    crops_list = crops_data if isinstance(crops_data, list) else crops_data.get('crops', [])
    assert len(crops_list) > 0, "No crops available to use"
    crop = crops_list[0]
    crop_id = crop.get('id') or crop.get('_id')
    assert crop_id, "Crop id missing"

    # Step 2: Get a marketId from /api/markets
    markets_resp = requests.get(f"{BASE_URL}/api/markets", timeout=TIMEOUT)
    assert markets_resp.status_code == 200, f"Expected 200 from /api/markets, got {markets_resp.status_code}"
    markets_data = markets_resp.json()
    markets_list = markets_data if isinstance(markets_data, list) else markets_data.get('markets', [])
    assert len(markets_list) > 0, "No markets available to use"
    market = markets_list[0]
    market_id = market.get('id') or market.get('_id')
    assert market_id, "Market id missing"

    # Prepare payload for new price report
    price_value = 1234.56
    source_id = str(uuid.uuid4())
    notes = "Test submission for TC005"

    payload = {
        "cropId": crop_id,
        "marketId": market_id,
        "price": price_value,
        "sourceId": source_id,
        "notes": notes,
    }

    created_price_id = None

    try:
        # Step 3: POST /api/prices with payload
        post_resp = requests.post(f"{BASE_URL}/api/prices", json=payload, timeout=TIMEOUT)
        assert post_resp.status_code == 201, f"Expected 201, got {post_resp.status_code}"
        price_obj = post_resp.json()

        # Validate returned object fields based on PRD
        assert isinstance(price_obj, dict), "Response should be an object"
        # Common expected fields (id, cropId, marketId, price, sourceId, notes, status, confidence)
        for field in ['id', 'cropId', 'marketId', 'price', 'sourceId', 'notes', 'status', 'confidence']:
            assert field in price_obj, f"Missing field '{field}' in response"

        # Validate field values
        assert price_obj['cropId'] == crop_id, "Returned cropId mismatch"
        assert price_obj['marketId'] == market_id, "Returned marketId mismatch"
        # price float comparison tolerance
        assert abs(float(price_obj['price']) - price_value) < 0.01, "Returned price mismatch"
        assert price_obj['sourceId'] == source_id, "Returned sourceId mismatch"
        assert price_obj['notes'] == notes, "Returned notes mismatch"
        assert price_obj['status'] == 'pending', "Expected status 'pending'"
        confidence = price_obj['confidence']
        assert isinstance(confidence, (float, int)) and 0 <= confidence <= 1, "Confidence score should be between 0 and 1"

        created_price_id = price_obj['id']

    finally:
        # Cleanup: Delete the created price if possible
        if created_price_id:
            try:
                requests.delete(f"{BASE_URL}/api/prices/{created_price_id}", timeout=TIMEOUT)
            except Exception:
                pass

test_post_api_prices_submit_new_price_report()