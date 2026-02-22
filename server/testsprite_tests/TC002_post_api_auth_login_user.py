import requests

def test_post_api_auth_login_user():
    base_url = "http://localhost:5000"
    url = f"{base_url}/api/auth/login"
    payload = {
        "email": "testuser@example.com",
        "password": "TestPassword123!"
    }
    headers = {
        "Content-Type": "application/json"
    }
    timeout = 30
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=timeout)
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        data = response.json()
        assert "token" in data and isinstance(data["token"], str) and len(data["token"]) > 0, "JWT token missing or invalid"
        assert "user" in data, "Response missing 'user' field"
        user = data["user"]
        assert all(k in user for k in ("id", "name", "email", "role", "language")), "User object missing required fields"
        assert user["email"] == payload["email"], "Returned user email does not match login email"
    except requests.RequestException as e:
        assert False, f"Request to {url} failed with exception: {e}"

test_post_api_auth_login_user()
