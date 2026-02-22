import requests

BASE_URL = "http://localhost:5000"
REGISTER_URL = f"{BASE_URL}/api/auth/register"
LOGIN_URL = f"{BASE_URL}/api/auth/login"
ME_URL = f"{BASE_URL}/api/auth/me"

def test_get_api_auth_me_should_return_authenticated_user_profile():
    # Prepare user data for registration
    user_data = {
        "name": "Test User TC003",
        "email": "testuser_tc003@example.com",
        "password": "TestPassword123!"
    }

    # Register the user
    register_resp = requests.post(REGISTER_URL, json=user_data, timeout=30)
    try:
        assert register_resp.status_code in (200, 201), f"Expected 201 Created but got {register_resp.status_code}"
        register_json = register_resp.json()
        assert "token" in register_json, "Token missing in register response"
        assert "user" in register_json, "User missing in register response"
        assert all(k in register_json["user"] for k in ("id", "name", "email", "role", "language")), "Missing user fields in register response"
    except AssertionError as e:
        raise e

    # Login to get a fresh token (in case token from register is different)
    login_data = {
        "email": user_data["email"],
        "password": user_data["password"]
    }
    login_resp = requests.post(LOGIN_URL, json=login_data, timeout=30)
    try:
        assert login_resp.status_code == 200, f"Expected 200 OK on login but got {login_resp.status_code}"
        login_json = login_resp.json()
        assert "token" in login_json, "Token missing in login response"
        assert "user" in login_json, "User missing in login response"
        token = login_json["token"]
        user = login_json["user"]
        assert all(k in user for k in ("id", "name", "email", "role", "language")), "Missing user fields in login response"
    except AssertionError as e:
        raise e

    # Use the token to call /api/auth/me
    headers = {
        "Authorization": f"Bearer {token}"
    }
    me_resp = requests.get(ME_URL, headers=headers, timeout=30)
    try:
        assert me_resp.status_code == 200, f"Expected 200 OK but got {me_resp.status_code}"
        me_json = me_resp.json()
        assert "user" in me_json, "User object missing in /api/auth/me response"
        user_profile = me_json["user"]
        # Validate required fields in user profile
        required_fields = ["id", "name", "email", "role", "language", "phoneNumber"]
        for field in required_fields:
            assert field in user_profile, f"Field '{field}' missing in user profile"
        # Validate that user profile matches the registered user details for id, name, email, role, language
        assert user_profile["id"] == user["id"], "User ID mismatch in profile"
        assert user_profile["name"] == user["name"], "User name mismatch in profile"
        assert user_profile["email"] == user["email"], "User email mismatch in profile"
        assert user_profile["role"] == user["role"], "User role mismatch in profile"
        assert user_profile["language"] == user["language"], "User language mismatch in profile"
    except AssertionError as e:
        raise e

test_get_api_auth_me_should_return_authenticated_user_profile()
