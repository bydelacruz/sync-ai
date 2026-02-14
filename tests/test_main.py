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


def test_update_task_description_regenerates_ai(
    client, test_task, token, mock_ai_summary, mock_ai_embedding
):
    """
    Test that updating a description triggers the AI summary and embedding regeneration.
    We request 'mock_ai_summary' and 'mock_ai_embedding' to assert they were called.
    """
    task_id = test_task["id"]
    new_description = "Walk the dog in the park"

    update = {
        "description": new_description,
    }

    # 1. Perform the Update
    res = client.put(
        f"/tasks/{task_id}", json=update, headers={"Authorization": f"Bearer {token}"}
    )

    data = res.json()

    # 2. Basic Assertions
    assert res.status_code == 200
    assert data["description"] == new_description

    # 3. Check that the Mocked AI Summary was used
    # (The value "Mocked AI Summary" comes from conftest.py)
    assert data["summary"] == "Mocked AI Summary"

    # 4. Verify the AI functions were actually triggered
    mock_ai_summary.assert_called_once()
    mock_ai_embedding.assert_called()


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


def test_update_task(client, test_task, token):
    task_id = test_task["id"]

    update = {
        "title": "groceries updated",
    }

    res = client.put(
        f"/tasks/{task_id}", json=update, headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    assert res.json()["title"] == "groceries updated"


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


def test_search_privacy(client, test_task, attacker_token):
    task = test_task

    res = client.post(
        "/search",
        json={"search_term": "i am hungry"},
        headers={"Authorization": f"Bearer {attacker_token}"},
    )

    assert res.status_code == 200
    assert res.json() == []


def test_search(client, test_task, token):
    task = test_task

    res = client.post(
        "/search",
        json={"search_term": "milk"},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert res.status_code == 200
    data = res.json()
    assert len(data) > 0
    assert data[0]["title"] == "groceries"


# --------User tests----------


def test_create_user(client):
    user = {"username": "benny", "password": "password123"}

    res = client.post("/users", json=user)

    assert res.status_code == 200
    assert res.json()["username"] == "benny"
    assert "hashed_password" not in res.json()


def test_create_existing_user(client):
    user = {"username": "benny", "password": "password123"}

    # create user for first time
    res1 = client.post("/users", json=user)
    assert res1.status_code == 200

    # try to create the same user again (should fail)
    res2 = client.post("/users", json=user)

    # verify we get a 400 error
    assert res2.status_code == 400
    assert res2.json()["detail"] == "Username already registered"


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
