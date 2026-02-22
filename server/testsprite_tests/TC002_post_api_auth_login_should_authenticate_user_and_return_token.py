import requests

def test_post_api_auth_login_should_authenticate_user_and_return_token():
    base_url = "http://localhost:5000"
    login_endpoint = f"{base_url}/api/auth/login"
    
    # Use known valid credentials (admin user as suggested in known limitations)
    payload = {
        "email": "admin@sokoprice.co.ke",
        "password": "Admin@123456"
    }
    headers = {
        "Content-Type": "application/json"
    }
    try:
        response = requests.post(login_endpoint, json=payload, headers=headers, timeout=30)
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    assert response.status_code == 200, f"Expected status 200 but got {response.status_code}"
    
    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    assert "token" in data, "Response JSON missing 'token'"
    assert "user" in data, "Response JSON missing 'user'"
    user = data["user"]
    assert isinstance(user, dict), "'user' should be a dictionary"

    # Verify user details keys
    required_user_keys = {"id", "name", "email", "role", "language"}
    missing_keys = required_user_keys - user.keys()
    assert not missing_keys, f"User object missing keys: {missing_keys}"

    # Verify token format is a non-empty string
    token = data["token"]
    assert isinstance(token, str) and token.strip() != "", "Token is empty or not a string"

test_post_api_auth_login_should_authenticate_user_and_return_token()
