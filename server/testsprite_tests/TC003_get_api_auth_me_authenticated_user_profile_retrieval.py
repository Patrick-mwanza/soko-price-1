import requests

BASE_URL = "http://localhost:5000"

ADMIN_EMAIL = "admin@sokoprice.co.ke"
ADMIN_PASSWORD = "Admin@123456"

def test_get_api_auth_me_authenticated_user_profile_retrieval():
    session = requests.Session()
    try:
        # Login to get JWT token
        login_url = f"{BASE_URL}/api/auth/login"
        login_payload = {
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        }
        login_resp = session.post(login_url, json=login_payload, timeout=30)
        assert login_resp.status_code == 200, f"Login failed: {login_resp.status_code} {login_resp.text}"
        login_data = login_resp.json()
        assert "token" in login_data and "user" in login_data, "Login response missing token or user"
        token = login_data["token"]
        user_info = login_data["user"]
        # Prepare Authorization header
        headers = {
            "Authorization": f"Bearer {token}"
        }
        # Get authenticated user profile
        me_url = f"{BASE_URL}/api/auth/me"
        me_resp = session.get(me_url, headers=headers, timeout=30)
        assert me_resp.status_code == 200, f"Fetching user profile failed: {me_resp.status_code} {me_resp.text}"
        me_data = me_resp.json()
        assert "user" in me_data, "Response missing 'user' key"
        user = me_data["user"]
        # Check required user details
        expected_fields = ["id", "name", "email", "role", "language", "phoneNumber"]
        for field in expected_fields:
            assert field in user, f"User profile missing field '{field}'"
        # role should be non-empty string
        assert isinstance(user["role"], str) and user["role"], "User role is empty or invalid"
        # phoneNumber should be a string, possibly empty or valid phone format
        assert isinstance(user["phoneNumber"], str), "User phoneNumber is not a string"
    finally:
        session.close()

test_get_api_auth_me_authenticated_user_profile_retrieval()
