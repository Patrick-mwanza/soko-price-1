import requests
import uuid

def test_post_api_auth_register_user_registration():
    base_url = "http://localhost:5000"
    url = f"{base_url}/api/auth/register"
    headers = {
        "Content-Type": "application/json"
    }
    unique_email = f"testuser_{uuid.uuid4().hex[:8]}@example.com"
    payload = {
        "name": "Test User",
        "email": unique_email,
        "password": "SecurePass123!"
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        assert response.status_code == 201, f"Expected 201, got {response.status_code}"
        data = response.json()
        # Validate presence of token and user info fields
        assert "token" in data, "Response missing 'token'"
        assert "user" in data, "Response missing 'user'"
        user = data["user"]
        # Validate user details fields
        assert "id" in user and isinstance(user["id"], str) and user["id"], "User id invalid or missing"
        assert user.get("name") == payload["name"], "User name mismatch"
        assert user.get("email") == payload["email"], "User email mismatch"
        assert "role" in user and isinstance(user["role"], str) and user["role"], "User role invalid or missing"
        assert "language" in user and isinstance(user["language"], str) and user["language"], "User language invalid or missing"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_post_api_auth_register_user_registration()
