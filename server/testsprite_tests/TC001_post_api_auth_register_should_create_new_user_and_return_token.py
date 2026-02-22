import requests
import uuid

BASE_URL = "http://localhost:5000"
REGISTER_ENDPOINT = "/api/auth/register"
TIMEOUT = 30

def test_post_api_auth_register_creates_new_user_and_returns_token():
    url = BASE_URL + REGISTER_ENDPOINT
    unique_email = f"testuser_{uuid.uuid4().hex[:8]}@example.com"
    payload = {
        "name": "Test User",
        "email": unique_email,
        "password": "P@ssw0rd1234"
    }
    headers = {
        "Content-Type": "application/json"
    }
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
        assert response.status_code == 201, f"Expected status code 201, got {response.status_code}"
        resp_json = response.json()
        assert "token" in resp_json and isinstance(resp_json["token"], str) and resp_json["token"], "Missing or empty token in response"
        assert "user" in resp_json and isinstance(resp_json["user"], dict), "Missing user object in response"
        user = resp_json["user"]
        assert "id" in user and user["id"], "User id missing or empty"
        assert user.get("name") == payload["name"], f"User name mismatch. Expected '{payload['name']}', got '{user.get('name')}'"
        assert user.get("email") == payload["email"], f"User email mismatch. Expected '{payload['email']}', got '{user.get('email')}'"
        # role and language may be defaults - just check existence and type
        assert "role" in user and isinstance(user["role"], str), "User role missing or not a string"
        assert "language" in user and isinstance(user["language"], str), "User language missing or not a string"
    except requests.RequestException as e:
        assert False, f"RequestException occurred: {e}"

test_post_api_auth_register_creates_new_user_and_returns_token()