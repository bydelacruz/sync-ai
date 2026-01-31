def test_create_task(client, token):
    task = {"title": "get milk", "description": "stop by store for milk after work"}
    response = client.post(
        "/tasks", json=task, headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200
    assert response.json()["title"] == "get milk"


def test_read_tasks(client, token):
    response = client.get("/tasks", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_read_task(client, test_task, token):
    task_id = test_task["id"]
    res = client.get(f"/tasks/{task_id}", headers={"Authorization": f"Bearer {token}"})

    assert res.status_code == 200
    assert res.json()["title"] == "groceries"


def test_read_tasks_unauthorized(client):
    response = client.get("/tasks")

    assert response.status_code == 401


def test_read_task_unauthorized(client, test_task):
    task_id = test_task["id"]
    res = client.get(f"/tasks/{task_id}")

    assert res.status_code == 401


def test_read_own_tasks(client, test_task, attacker_token):
    # i need to create a task to make sure
    # that there is a task under another user
    tasks = test_task
    assert len(tasks) > 0

    token = attacker_token
    res = client.get("/tasks/", headers={"Authorization": f"Bearer {token}"})

    assert res.json() == []


def test_read_others_task(client, test_task, attacker_token):
    task_id = test_task["id"]

    token = attacker_token
    res = client.get(f"/tasks/{task_id}", headers={"Authorization": f"Bearer {token}"})

    assert res.status_code == 404


def test_mark_complete(client, test_task, token):
    task_id = test_task["id"]
    res = client.put(
        f"/tasks/{task_id}/complete", headers={"Authorization": f"Bearer {token}"}
    )

    assert res.status_code == 200
    assert res.json()["status"] == "completed"


def test_delete_task(client, test_task, token):
    task_id = test_task["id"]
    client.delete(f"/tasks/{task_id}", headers={"Authorization": f"Bearer {token}"})

    res = client.get(f"/tasks/{task_id}", headers={"Authorization": f"Bearer {token}"})

    assert res.status_code == 404


def test_delete_other_user_task(client, test_task, attacker_token):
    task_id = test_task["id"]

    token = attacker_token
    res = client.delete(
        f"/tasks/{task_id}", headers={"Authorization": f"Bearer {token}"}
    )

    assert res.status_code == 404


def test_filter_tasks(client, token):
    task1 = {"title": "get milk", "description": "stop by store for milk after work"}
    task2 = {
        "title": "get coffee",
        "description": "stop by store for coffee after work",
    }

    client.post("/tasks", json=task1, headers={"Authorization": f"Bearer {token}"})
    task2_res = client.post(
        "/tasks", json=task2, headers={"Authorization": f"Bearer {token}"}
    )
    task2_id = task2_res.json()["id"]

    client.put(
        f"/tasks/{task2_id}/complete", headers={"Authorization": f"Bearer {token}"}
    )

    res = client.get(
        "/tasks?status=completed", headers={"Authorization": f"Bearer {token}"}
    )

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
