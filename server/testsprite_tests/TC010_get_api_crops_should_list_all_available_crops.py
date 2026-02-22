import requests

def test_get_api_crops_should_list_all_available_crops():
    base_url = "http://localhost:5000"
    endpoint = "/api/crops"
    url = base_url + endpoint
    headers = {
        "Accept": "application/json"
    }
    try:
        response = requests.get(url, headers=headers, timeout=30)
        assert response.status_code == 200, f"Expected status code 200 but got {response.status_code}"
        crops = response.json()
        assert isinstance(crops, list), f"Expected response to be a list but got {type(crops)}"
        for crop in crops:
            assert isinstance(crop, dict), "Each crop entry should be a dict"
            # The crop object structure is not detailed, so we check for at least one key
            assert crop, "Crop object should not be empty"
    except requests.RequestException as e:
        assert False, f"Request to get crops failed: {e}"

test_get_api_crops_should_list_all_available_crops()