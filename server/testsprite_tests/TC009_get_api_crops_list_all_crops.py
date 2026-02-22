import requests

def test_get_api_crops_list_all_crops():
    base_url = "http://localhost:5000"
    url = f"{base_url}/api/crops"
    headers = {
        "Accept": "application/json"
    }
    try:
        response = requests.get(url, headers=headers, timeout=30)
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        crops = response.json()
        assert isinstance(crops, list), f"Expected response to be a list, got {type(crops)}"
        for crop in crops:
            assert isinstance(crop, dict), f"Each crop should be a dict, got {type(crop)}"
            assert "_id" in crop, "Crop missing '_id'"
            assert "name" in crop, "Crop missing 'name'"
            assert "code" in crop, "Crop missing 'code'"
            assert "units" in crop, "Crop missing 'units'"
            assert isinstance(crop["_id"], (int, str)), "'_id' should be str or int"
            assert isinstance(crop["name"], str), "'name' should be str"
            assert isinstance(crop["code"], str), "'code' should be str"
            assert isinstance(crop["units"], str), "'units' should be str"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_get_api_crops_list_all_crops()
