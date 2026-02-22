import requests
import uuid

BASE_URL = "http://localhost:5000"
REGISTER_ENDPOINT = "/api/auth/register"
TIMEOUT = 30

def test_post_api_auth_register_new_user():
    # Generate unique email to avoid conflict with existing users
    unique_email = f"testuser_{uuid.uuid4().hex[:8]}@example.com"
    payload = {
        "name": "Test User",
        "email": unique_email,
        "password": "SecurePass123!"
    }
    headers = {
        "Content-Type": "application/json"
    }
    url = BASE_URL + REGISTER_ENDPOINT

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    assert response.status_code == 201, f"Expected 201, got {response.status_code}"
    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    assert "token" in data, "Response JSON missing 'token'"
    assert "user" in data, "Response JSON missing 'user'"

    user = data["user"]
    # Validate user fields presence and types
    assert isinstance(user.get("id"), (str, int)), "'id' missing or invalid type"
    assert isinstance(user.get("name"), str), "'name' missing or not string"
    assert user["name"] == payload["name"], "Returned name does not match"
    assert user.get("email") == payload["email"], "Returned email does not match"
    assert isinstance(user.get("role"), str), "'role' missing or not string"
    assert isinstance(user.get("language"), str), "'language' missing or not string"

test_post_api_auth_register_new_user()