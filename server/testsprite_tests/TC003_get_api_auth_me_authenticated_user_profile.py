import requests

def test_get_api_auth_me_authenticated_user_profile():
    base_url = "http://localhost:5000"
    register_url = f"{base_url}/api/auth/register"
    login_url = f"{base_url}/api/auth/login"
    me_url = f"{base_url}/api/auth/me"
    timeout = 30

    # Prepare user registration data
    user_data = {
        "name": "Test User TC003",
        "email": "testuser_tc003@example.com",
        "password": "TestPass123!"
    }

    token = None

    try:
        # Register new user to obtain JWT token
        reg_resp = requests.post(register_url, json=user_data, timeout=timeout)
        assert reg_resp.status_code == 201, f"Registration failed: {reg_resp.text}"
        reg_json = reg_resp.json()
        assert "token" in reg_json, "Token missing in registration response"
        assert "user" in reg_json, "User missing in registration response"
        token = reg_json["token"]

        # Use token to get authenticated user profile
        headers = {"Authorization": f"Bearer {token}"}
        me_resp = requests.get(me_url, headers=headers, timeout=timeout)
        assert me_resp.status_code == 200, f"Failed to get user profile: {me_resp.text}"

        profile = me_resp.json()
        assert "user" in profile, "User key missing in /api/auth/me response"
        user = profile["user"]

        # Validate required fields in user profile
        expected_fields = ["id", "name", "email", "role", "language"]
        for field in expected_fields:
            assert field in user, f"Missing field '{field}' in user profile"

        # phoneNumber is optional; if present, check type
        if "phoneNumber" in user:
            assert isinstance(user["phoneNumber"], (str, type(None))), "Invalid phoneNumber type"

        # Additional basic validations
        assert isinstance(user["id"], str) and user["id"], "Invalid user id"
        assert isinstance(user["name"], str) and user["name"], "Invalid user name"
        assert isinstance(user["email"], str) and user["email"], "Invalid user email"
        assert isinstance(user["role"], str) and user["role"], "Invalid user role"
        assert isinstance(user["language"], str) and user["language"], "Invalid user language"

    finally:
        # Clean up by deleting the created user if API supports it
        # Since deletion endpoint is not defined in PRD, skip explicit deletion.
        pass

test_get_api_auth_me_authenticated_user_profile()
