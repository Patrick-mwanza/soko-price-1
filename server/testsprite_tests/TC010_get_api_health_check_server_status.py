import requests

def test_get_api_health_check_server_status():
    base_url = "http://localhost:5000"
    url = f"{base_url}/api/health"
    headers = {
        "Accept": "application/json"
    }
    try:
        response = requests.get(url, headers=headers, timeout=30)
        assert response.status_code == 200, f"Expected status code 200 but got {response.status_code}"
        data = response.json()
        assert isinstance(data, dict), "Response is not a JSON object"
        # Check expected keys in the response
        expected_keys = {"status", "service", "version", "timestamp"}
        assert expected_keys.issubset(data.keys()), f"Response JSON missing keys: {expected_keys - data.keys()}"
        # Validate values
        assert data["status"] == "ok", f"Expected status 'ok' but got {data['status']}"
        assert isinstance(data["service"], str) and len(data["service"]) > 0, "Invalid or empty service name"
        assert isinstance(data["version"], str) and len(data["version"]) > 0, "Invalid or empty version"
        assert isinstance(data["timestamp"], (str, int, float)) and data["timestamp"], "Invalid or empty timestamp"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_get_api_health_check_server_status()
