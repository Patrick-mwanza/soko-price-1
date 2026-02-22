import requests

BASE_URL = "http://localhost:5000"
LOGIN_PATH = "/api/auth/login"
TIMEOUT = 30

def test_post_api_auth_login_user_authentication():
    url = BASE_URL + LOGIN_PATH
    headers = {
        "Content-Type": "application/json"
    }
    # Use valid credentials from known limitations or environment
    payload = {
        "email": "buyer@sokoprice.co.ke",
        "password": "Buyer@123456"
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"HTTP request failed: {e}"

    assert response.status_code == 200, f"Expected status code 200 but got {response.status_code}"
    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"
    
    assert "token" in data and isinstance(data["token"], str) and data["token"], "Missing or invalid token in response"
    assert "user" in data and isinstance(data["user"], dict), "Missing or invalid user object in response"
    user = data["user"]
    assert "id" in user and user["id"], "User id missing or empty"
    assert "name" in user and isinstance(user["name"], str) and user["name"], "User name missing or empty"
    assert "email" in user and user["email"] == payload["email"], "User email missing or does not match"
    assert "role" in user and isinstance(user["role"], str) and user["role"], "User role missing or empty"
    assert "language" in user and isinstance(user["language"], str), "User language missing or invalid"

test_post_api_auth_login_user_authentication()