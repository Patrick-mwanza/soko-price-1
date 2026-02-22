import requests

def test_get_api_crops_list_available_crops():
    base_url = "http://localhost:5000"
    url = f"{base_url}/api/crops"
    headers = {
        "Accept": "application/json"
    }
    try:
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Request to GET /api/crops failed: {e}"

    assert response.status_code == 200, f"Expected status code 200 but got {response.status_code}"
    try:
        crops = response.json()
    except ValueError:
        assert False, "Response body is not valid JSON"

    assert isinstance(crops, list), f"Expected response body to be a list but got {type(crops)}"
    for crop in crops:
        assert isinstance(crop, dict), f"Each crop should be an object/dict but got {type(crop)}"


test_get_api_crops_list_available_crops()
