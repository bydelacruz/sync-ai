def test_create_task(client):
    task = {"title": "get milk", "description": "stop by store for milk after work"}
    response = client.post("/tasks", json=task)

    assert response.status_code == 200
    assert response.json()["title"] == "get milk"


def test_read_tasks(client):
    response = client.get("/tasks")

    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_read_task(client, test_task):
    task_id = test_task["id"]
    res = client.get(f"/tasks/{task_id}")

    assert res.status_code == 200
    assert res.json()["title"] == "groceries"


def test_mark_complete(client, test_task):
    task_id = test_task["id"]
    res = client.put(f"/tasks/{task_id}/complete")

    assert res.status_code == 200
    assert res.json()["status"] == "completed"


def test_delete_task(client, test_task):
    task_id = test_task["id"]
    client.delete(f"/tasks/{task_id}")

    res = client.get(f"/tasks/{task_id}")

    assert res.status_code == 404


def test_filter_tasks(client):
    task1 = {"title": "get milk", "description": "stop by store for milk after work"}
    task2 = {
        "title": "get coffee",
        "description": "stop by store for coffee after work",
    }

    client.post("/tasks", json=task1)
    task2_res = client.post("/tasks", json=task2)
    task2_id = task2_res.json()["id"]

    client.put(f"/tasks/{task2_id}/complete")

    res = client.get("/tasks?status=completed")

    assert len(res.json()) == 1
    assert res.json()[0]["title"] == "get coffee"


# --------User tests----------


def test_create_user(client):
    user = {"username": "benny", "password": "password123"}

    res = client.post("/users", json=user)

    assert res.status_code == 200
    assert res.json()["username"] == "benny"
    assert "hashed_password" not in res.json()


def test_user_login(client):
    user = {"username": "benny", "password": "password123"}
    res = client.post("/users", json=user)
    assert res.status_code == 200

    token = client.post("/users/login", json=user)

    assert token.status_code == 200
    assert "access_token" in token.json()
    assert "token_type" in token.json()
    assert isinstance(token.json()["access_token"], str)
    assert isinstance(token.json()["token_type"], str)
    assert token.json()["token_type"] == "bearer"
