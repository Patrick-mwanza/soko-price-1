import requests

base_url = "http://localhost:5000"

ADMIN_EMAIL = "admin@sokoprice.co.ke"
ADMIN_PASSWORD = "Admin@123456"
TIMEOUT = 30

def get_jwt_token(email: str, password: str) -> str:
    url = f"{base_url}/api/auth/login"
    payload = {"email": email, "password": password}
    response = requests.post(url, json=payload, timeout=TIMEOUT)
    response.raise_for_status()
    data = response.json()
    token = data.get("token")
    assert token, "Token missing in login response"
    return token

def test_get_api_analytics_overview_should_return_dashboard_statistics_for_authenticated_user():
    token = None
    try:
        # Authenticate and get JWT token
        token = get_jwt_token(ADMIN_EMAIL, ADMIN_PASSWORD)

        headers = {
            "Authorization": f"Bearer {token}"
        }
        url = f"{base_url}/api/analytics/overview"
        response = requests.get(url, headers=headers, timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected status 200 but got {response.status_code}"

        data = response.json()
        expected_keys = [
            "totalUsers",
            "activeMarkets",
            "pricesToday",
            "pendingApprovals",
            "totalCrops",
            "totalSources"
        ]
        for key in expected_keys:
            assert key in data, f"Response JSON missing key: {key}"
            # Values for counts should be integers >= 0
            value = data[key]
            assert isinstance(value, int), f"{key} expected to be int but got {type(value)}"
            assert value >= 0, f"{key} expected to be >= 0 but got {value}"

    except requests.exceptions.RequestException as e:
        assert False, f"Request failed: {e}"

test_get_api_analytics_overview_should_return_dashboard_statistics_for_authenticated_user()