def test_create_task(client):
    task = {"title": "get milk", "description": "stop by store for milk after work"}
    response = client.post("/tasks", json=task)

    assert response.status_code == 200
    assert response.json()["title"] == "get milk"


def test_read_tasks(client):
    response = client.get("/tasks")

    assert response.status_code == 200
    assert isinstance(response.json(), list)
