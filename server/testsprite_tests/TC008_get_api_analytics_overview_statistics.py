import requests

BASE_URL = "http://localhost:5000"
LOGIN_ENDPOINT = "/api/auth/login"
ANALYTICS_OVERVIEW_ENDPOINT = "/api/analytics/overview"
TIMEOUT = 30

def test_get_api_analytics_overview_statistics():
    # Admin or buyer user credentials - replace with valid seeded credentials
    user_credentials = {
        "email": "admin@example.com",
        "password": "adminpassword"
    }

    try:
        # Step 1: Authenticate user and obtain JWT token
        login_resp = requests.post(
            BASE_URL + LOGIN_ENDPOINT,
            json=user_credentials,
            timeout=TIMEOUT
        )
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        login_data = login_resp.json()
        token = login_data.get("token")
        assert token, "No token received on login"
        user = login_data.get("user")
        assert user and user.get("role") in ["admin", "buyer"], "User role must be admin or buyer"

        # Step 2: Use token to get analytics overview statistics
        headers = {
            "Authorization": f"Bearer {token}"
        }
        analytics_resp = requests.get(
            BASE_URL + ANALYTICS_OVERVIEW_ENDPOINT,
            headers=headers,
            timeout=TIMEOUT
        )
        assert analytics_resp.status_code == 200, f"Analytics overview request failed: {analytics_resp.text}"
        overview = analytics_resp.json()

        # Validate expected keys in response
        expected_keys = {"totalUsers", "activeMarkets", "pricesToday", "pendingApprovals", "totalCrops", "totalSources"}
        assert expected_keys.issubset(overview.keys()), f"Missing keys in response: {expected_keys - overview.keys()}"

        # Validate values types (optional but useful)
        assert isinstance(overview["totalUsers"], int), "totalUsers is not int"
        assert isinstance(overview["activeMarkets"], int), "activeMarkets is not int"
        assert isinstance(overview["pricesToday"], int), "pricesToday is not int"
        assert isinstance(overview["pendingApprovals"], int), "pendingApprovals is not int"
        assert isinstance(overview["totalCrops"], int), "totalCrops is not int"
        assert isinstance(overview["totalSources"], int), "totalSources is not int"

    except requests.RequestException as e:
        assert False, f"RequestException occurred: {str(e)}"

test_get_api_analytics_overview_statistics()
