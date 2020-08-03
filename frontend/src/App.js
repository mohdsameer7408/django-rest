import React, { Component } from "react";
import "./App.css";

class App extends Component {
  state = {
    todoList: [],
    activeItem: {
      id: null,
      title: "",
      complete: false,
    },
    editing: false,
  };

  componentDidMount() {
    this.fetchTasks();
  }

  fetchTasks = () => {
    fetch("http://127.0.0.1:8000/api/task-list")
      .then((response) => response.json())
      .then((data) => this.setState({ todoList: data }));
  };

  getToken = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        // Does this cookie string begin with the name we want?
        if (cookie.substring(0, name.length + 1) === name + "=") {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  handleSubmit = (event) => {
    event.preventDefault();

    let url = `http://127.0.0.1:8000/api/task-create/`;

    if (this.state.editing) {
      url = `http://127.0.0.1:8000/api/task-update/${this.state.activeItem.id}/`;
      this.setState({ editing: false });
    }

    let csrftoken = this.getToken("csrftoken");

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      body: JSON.stringify(this.state.activeItem),
    })
      .then((response) => {
        this.fetchTasks();
        this.setState({
          activeItem: {
            id: null,
            title: "",
            complete: false,
          },
        });
      })
      .catch((error) => {
        console.log("Error: ", error);
      });
  };

  handleChange = (event) => {
    const { name, value } = event.target;
    this.setState({ activeItem: { ...this.state.activeItem, [name]: value } });
  };

  strikeUnstrike = (task) => {
    let complete = !task.complete;
    let csrftoken = this.getToken("csrftoken");
    let url = `http://127.0.0.1:8000/api/task-update/${task.id}/`;

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      body: JSON.stringify({
        title: task.title,
        complete: complete,
      }),
    }).then(() => this.fetchTasks());
  };

  startEdit = (task) => {
    this.setState({
      activeItem: task,
      editing: true,
    });
  };

  deleteItem = (task) => {
    let csrftoken = this.getToken("csrftoken");
    let url = `http://127.0.0.1:8000/api/task-delete/${task.id}/`;

    fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken,
      },
    }).then(() => {
      this.fetchTasks();
    });
  };

  render() {
    let tasks = this.state.todoList;
    let self = this;
    return (
      <div className="container">
        <div id="task-container">
          <div id="form-wrapper">
            <form onSubmit={this.handleSubmit} id="form">
              <div className="flex-wrapper">
                <div style={{ flex: 6 }}>
                  <input
                    onChange={this.handleChange}
                    className="form-control"
                    id="title"
                    value={this.state.activeItem.title}
                    type="text"
                    name="title"
                    placeholder="Add task.."
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <input
                    id="submit"
                    className="btn btn-warning"
                    type="submit"
                    name="Add"
                  />
                </div>
              </div>
            </form>
          </div>

          <div id="list-wrapper">
            {tasks.map((task, index) => {
              return (
                <div key={index} className="task-wrapper flex-wrapper">
                  <div
                    onClick={() => self.strikeUnstrike(task)}
                    style={{ flex: 7 }}
                  >
                    {!task.complete ? (
                      <span>{task.title}</span>
                    ) : (
                      <strike>{task.title}</strike>
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <button
                      onClick={() => self.startEdit(task)}
                      className="btn btn-sm btn-outline-info"
                    >
                      Edit
                    </button>
                  </div>

                  <div style={{ flex: 1 }}>
                    <button
                      onClick={() => self.deleteItem(task)}
                      className="btn btn-sm btn-outline-dark delete"
                    >
                      -
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
