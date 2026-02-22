import requests
from requests.exceptions import RequestException
import json

BASE_URL = "http://localhost:5000"
TIMEOUT = 30

def test_get_api_analytics_dashboard_retrieve_statistics():
    url = f"{BASE_URL}/api/analytics/dashboard"
    
    # Test success case: GET /api/analytics/dashboard returns 200 with dashboard stats object
    try:
        response = requests.get(url, timeout=TIMEOUT)
    except RequestException as e:
        assert False, f"Request to {url} failed: {e}"
    
    # Validate success response
    assert response.status_code == 200, f"Expected 200 OK, got {response.status_code}"
    try:
        data = response.json()
    except json.JSONDecodeError:
        assert False, "Response is not valid JSON"

    # Validate the presence of expected keys in dashboard stats object (high-level)
    expected_keys = ["totalReports", "activeMarkets", "trendingCrops", "recentApprovals"]
    for key in expected_keys:
        assert key in data, f"Response JSON missing expected key: '{key}'"

    # Test error handling when database is unreachable:
    # Here we simulate by making a request that should trigger a 500 error.
    # Since we can't simulate DB failure directly, we try to catch a 500 response
    # by making the same request and checking for status code 500.
    # In a real environment, mocking would be used, but here we will do the check.

    # Because we cannot forcibly cause DB error, we only validate that if 500 received,
    # it contains correct error message.
    try:
        error_response = requests.get(url, timeout=TIMEOUT)
    except RequestException as e:
        assert False, f"Request for error simulation failed: {e}"

    if error_response.status_code == 500:
        try:
            err_data = error_response.json()
        except json.JSONDecodeError:
            assert False, "500 error response is not valid JSON"
        assert "Failed to retrieve analytics data" in err_data.get("message", ""), \
            "500 error message incorrect or missing"
    else:
        # If no 500 error, this is acceptable in normal test runs,
        # but we still confirm no unexpected error code.
        assert error_response.status_code in (200, 500), \
            f"Unexpected status code received: {error_response.status_code}"

test_get_api_analytics_dashboard_retrieve_statistics()
