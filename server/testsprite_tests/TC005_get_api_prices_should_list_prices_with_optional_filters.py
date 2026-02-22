import requests

BASE_URL = "http://localhost:5000"
TIMEOUT = 30

def test_get_api_prices_should_list_prices_with_optional_filters():
    # Endpoint for prices listing
    url = f"{BASE_URL}/api/prices"
    # 1. Test without query parameters
    try:
        response = requests.get(url, timeout=TIMEOUT)
        response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Request failed without query params: {e}"
    data = response.json()
    assert isinstance(data, dict), "Response should be a JSON object"
    assert "prices" in data, "Response missing 'prices'"
    assert "total" in data, "Response missing 'total'"
    assert "page" in data, "Response missing 'page'"
    assert "pages" in data, "Response missing 'pages'"
    assert isinstance(data["prices"], list), "'prices' should be a list"
    assert isinstance(data["total"], int), "'total' should be int"
    assert isinstance(data["page"], int), "'page' should be int"
    assert isinstance(data["pages"], int), "'pages' should be int"

    # If no prices exist, skip filtered tests as no validation possible
    if data["total"] == 0:
        return

    # Extract cropId, marketId, approved flag from first price entry if available
    first_price = data["prices"][0]
    crop_id = first_price.get("cropId")
    market_id = first_price.get("marketId")
    approved = first_price.get("approved")

    # approved may not be boolean; check key presence and type
    if not isinstance(approved, bool):
        approved = None

    # 2. Test with cropId filter if available
    if crop_id:
        params = {"cropId": crop_id}
        try:
            response = requests.get(url, params=params, timeout=TIMEOUT)
            response.raise_for_status()
        except requests.RequestException as e:
            assert False, f"Request failed with cropId filter: {e}"
        data_crop = response.json()
        assert isinstance(data_crop, dict), "Response with cropId should be a dict"
        assert "prices" in data_crop
        assert isinstance(data_crop["prices"], list)
        for price in data_crop["prices"]:
            p_crop_id = price.get("cropId")
            assert p_crop_id == crop_id, f"Price cropId {p_crop_id} does not match filter {crop_id}"

    # 3. Test with marketId filter if available
    if market_id:
        params = {"marketId": market_id}
        try:
            response = requests.get(url, params=params, timeout=TIMEOUT)
            response.raise_for_status()
        except requests.RequestException as e:
            assert False, f"Request failed with marketId filter: {e}"
        data_market = response.json()
        assert isinstance(data_market, dict), "Response with marketId should be a dict"
        assert "prices" in data_market
        assert isinstance(data_market["prices"], list)
        for price in data_market["prices"]:
            p_market_id = price.get("marketId")
            assert p_market_id == market_id, f"Price marketId {p_market_id} does not match filter {market_id}"

    # 4. Test with approved filter if available and a boolean
    if isinstance(approved, bool):
        params = {"approved": str(approved).lower()}
        try:
            response = requests.get(url, params=params, timeout=TIMEOUT)
            response.raise_for_status()
        except requests.RequestException as e:
            assert False, f"Request failed with approved filter: {e}"
        data_approved = response.json()
        assert isinstance(data_approved, dict)
        assert "prices" in data_approved
        assert isinstance(data_approved["prices"], list)
        for price in data_approved["prices"]:
            p_approved = price.get("approved")
            if p_approved is not None:
                assert p_approved == approved, f"Price approved {p_approved} does not match filter {approved}"

test_get_api_prices_should_list_prices_with_optional_filters()