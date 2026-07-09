from app.utils.rate_limit import limiter


def login(client, username="admin", password="admin123"):
    return client.post(
        "/api/auth/login/json",
        json={"username": username, "password": password},
    )


class TestLogin:
    def test_login_success(self, client, admin_user):
        response = login(client)
        assert response.status_code == 200
        body = response.json()
        assert body["token_type"] == "bearer"
        assert body["access_token"]
        assert body["user"]["username"] == "admin"

    def test_login_wrong_password(self, client, admin_user):
        response = login(client, password="wrongpass1")
        assert response.status_code == 401

    def test_login_unknown_user(self, client, admin_user):
        response = login(client, username="ghost")
        assert response.status_code == 401


class TestProtectedEndpoints:
    def test_me_requires_token(self, client, admin_user):
        assert client.get("/api/auth/me").status_code == 401

    def test_me_with_token(self, client, admin_user):
        token = login(client).json()["access_token"]
        response = client.get(
            "/api/auth/me", headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        assert response.json()["username"] == "admin"

    def test_chat_messages_requires_admin(self, client, admin_user):
        assert client.get("/api/chat/messages").status_code == 401

    def test_register_requires_admin(self, client, admin_user):
        response = client.post(
            "/api/auth/register",
            json={
                "username": "newuser",
                "email": "new@example.com",
                "password": "secret123",
            },
        )
        assert response.status_code == 401


class TestPublicChat:
    def test_validate_is_public(self, client):
        response = client.post(
            "/api/chat/validate", json={"text": "halo dunia"}
        )
        assert response.status_code == 200
        assert response.json()["is_clean"] is True


class TestChangePassword:
    def test_weak_password_rejected(self, client, admin_user):
        token = login(client).json()["access_token"]
        response = client.put(
            "/api/auth/change-password",
            headers={"Authorization": f"Bearer {token}"},
            json={"current_password": "admin123", "new_password": "short"},
        )
        assert response.status_code == 422

    def test_password_without_digit_rejected(self, client, admin_user):
        token = login(client).json()["access_token"]
        response = client.put(
            "/api/auth/change-password",
            headers={"Authorization": f"Bearer {token}"},
            json={"current_password": "admin123", "new_password": "onlyletters"},
        )
        assert response.status_code == 422

    def test_change_password_success(self, client, admin_user):
        token = login(client).json()["access_token"]
        response = client.put(
            "/api/auth/change-password",
            headers={"Authorization": f"Bearer {token}"},
            json={"current_password": "admin123", "new_password": "newpass123"},
        )
        assert response.status_code == 200
        # Old password no longer works, new one does.
        assert login(client).status_code == 401
        assert login(client, password="newpass123").status_code == 200


class TestRateLimit:
    def test_login_is_rate_limited(self, client, admin_user):
        limiter.enabled = True
        limiter.reset()
        try:
            # The limit is 5/minute; the 6th attempt must be rejected with 429.
            statuses = [login(client, password="wrongpass1").status_code for _ in range(6)]
        finally:
            limiter.reset()
            limiter.enabled = False

        assert statuses[:5] == [401, 401, 401, 401, 401]
        assert statuses[5] == 429

