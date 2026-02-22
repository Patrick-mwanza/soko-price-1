import requests

BASE_URL = "http://localhost:5000"
TIMEOUT = 30

def test_get_api_prices_list_crop_market_prices():
    """
    Test listing of crop market prices with optional filters cropId, marketId, and approved
    to receive 200 status with paginated price data.
    """
    try:
        # First, fetch list of crops to get a valid cropId filter option
        crops_resp = requests.get(f"{BASE_URL}/api/crops", timeout=TIMEOUT)
        assert crops_resp.status_code == 200, f"Expected 200 for crops list but got {crops_resp.status_code}"
        crops = crops_resp.json()
        crop_id = crops[0]['id'] if crops and 'id' in crops[0] else (crops[0]['_id'] if crops and '_id' in crops[0] else None)

        # Fetch list of markets to get a valid marketId filter option
        markets_resp = requests.get(f"{BASE_URL}/api/markets", timeout=TIMEOUT)
        assert markets_resp.status_code == 200, f"Expected 200 for markets list but got {markets_resp.status_code}"
        markets = markets_resp.json()
        market_id = markets[0]['id'] if markets and 'id' in markets[0] else (markets[0]['_id'] if markets and '_id' in markets[0] else None)

        # Build query params with optional filters
        params = {}
        if crop_id:
            params['cropId'] = crop_id
        if market_id:
            params['marketId'] = market_id
        params['approved'] = 'true'

        # Make GET request to /api/prices with filters
        response = requests.get(f"{BASE_URL}/api/prices", params=params, timeout=TIMEOUT)
        
        assert response.status_code == 200, f"Expected 200 but got {response.status_code}"
        
        data = response.json()
        
        # Validate response schema contains required keys
        assert isinstance(data, dict), "Response is not a JSON object"
        assert 'prices' in data, "'prices' key missing in response"
        assert 'total' in data, "'total' key missing in response"
        assert 'page' in data, "'page' key missing in response"
        assert 'pages' in data, "'pages' key missing in response"
        assert isinstance(data['prices'], list), "'prices' should be a list"
        
        # Optionally more detailed validation of prices objects can be done here
        for price in data['prices']:
            assert 'id' in price or '_id' in price, "Price object missing id"
            assert 'cropId' in price, "Price object missing cropId"
            assert 'marketId' in price, "Price object missing marketId"
            assert 'price' in price, "Price object missing price"
            assert 'approved' in price, "Price object missing approved status"

    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_get_api_prices_list_crop_market_prices()
