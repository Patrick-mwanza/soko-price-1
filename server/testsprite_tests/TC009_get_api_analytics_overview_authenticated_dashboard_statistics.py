import requests

BASE_URL = "http://localhost:5000"
ADMIN_EMAIL = "admin@sokoprice.co.ke"
ADMIN_PASSWORD = "Admin@123456"
TIMEOUT = 30


def test_get_api_analytics_overview_authenticated_dashboard_statistics():
    # Log in as admin to get JWT token
    login_url = f"{BASE_URL}/api/auth/login"
    login_payload = {
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    }

    try:
        login_response = requests.post(login_url, json=login_payload, timeout=TIMEOUT)
        login_response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Admin login request failed: {e}"

    login_data = login_response.json()
    assert "token" in login_data, "No token in login response"
    token = login_data["token"]
    assert isinstance(token, str) and token, "Invalid token value"

    # Get analytics overview with authorization
    analytics_url = f"{BASE_URL}/api/analytics/overview"
    headers = {
        "Authorization": f"Bearer {token}"
    }

    try:
        analytics_response = requests.get(analytics_url, headers=headers, timeout=TIMEOUT)
        analytics_response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Analytics overview request failed: {e}"

    assert analytics_response.status_code == 200, f"Expected 200 OK, got {analytics_response.status_code}"

    overview = analytics_response.json()
    expected_keys = [
        "totalUsers",
        "activeMarkets",
        "pricesToday",
        "pendingApprovals",
        "totalCrops",
        "totalSources"
    ]

    for key in expected_keys:
        assert key in overview, f"Missing key in response: {key}"
        # Values should be int or float (depending on backend)
        assert isinstance(overview[key], (int, float)), f"Key {key} should be number, got {type(overview[key])}"


test_get_api_analytics_overview_authenticated_dashboard_statistics()
