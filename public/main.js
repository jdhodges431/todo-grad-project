var app = angular.module("app", ["ngMaterial"]);

app.controller("TodoListController", ["$http", function($http) {

    var error = document.getElementById("error");

    var todoListCtrl = this;
    todoListCtrl.todos = {};
    todoListCtrl.newTodo = {};
    todoListCtrl.currentHover = -1;
    todoListCtrl.selectedFilter = -1;
    todoListCtrl.activeTasks = -1;
    todoListCtrl.completedTasks = -1;

    this.setClear = function(id) {
        console.log("Set Clear");
        todoListCtrl.currentHover = id;
    };

    this.clearCheck = function(id) {
        console.log("Clear check");
        return todoListCtrl.currentHover === id;
    };

    this.refreshTodoList = function() {
        console.log("Refresh");
        $http.get("/api/todo").success(function (data) {
            todoListCtrl.todos = data;

            if (todoListCtrl.activeTasks === -1 && todoListCtrl.completedTasks === -1)
                todoListCtrl.activeCount();
        }).error(function(status, statusText) {
            error.textContent = "Failed to get list. Server returned " + statusText + " - " + status;
        });
    };

    this.addTodo = function(todo) {
        console.log("Add");
        $http.post("api/todo", todo).success(function(data) {
            todoListCtrl.activeTasks++;
            todoListCtrl.refreshTodoList();
            todoListCtrl.newTodo = {};
        }).error(function(status, statusText) {
            error.textContent = "Failed to create item. Server returned " + statusText + " - " + status;
        });
    };

    this.completeTodo = function(todo) {
        console.log("Complete");

        $http.put("api/todo/" + todo.id, {isComplete: !todo.isComplete}).success(function(data) {
            if (todo.isComplete) {
                todoListCtrl.activeTasks--;
                todoListCtrl.completedTasks++;
            } else {
                todoListCtrl.activeTasks++;
                todoListCtrl.completedTasks--;
            }
        }).error(function(status, statusText) {
            error.textContent = "Failed to update item. Server returned " + statusText + " - " + status;
        });
    };

    this.deleteTodo = function(todo) {
        console.log("Delete");
        $http.delete("api/todo/" + todo.id).success(function(data) {
            if (todo.isComplete) {
                todoListCtrl.completedTasks--;
            } else {
                todoListCtrl.activeTasks--;
            }

            todoListCtrl.todos = todoListCtrl.todos.filter(function(otherTodo) {
                return otherTodo !== todo;
            });
        }).error(function(status, statusText) {
            error.textContent = "Failed to delete item. Server returned " + statusText + " - " + status;
        });
    };

    this.clearCompleted = function() {
        console.log("Clear completed");
        [].forEach.call(todoListCtrl.todos, function(todo) {
            if (todo.isComplete) {
                $http.delete("api/todo/" + todo.id).success(function(data) {
                    todoListCtrl.completedTasks--;
                    todoListCtrl.todos = todoListCtrl.todos.filter(function(otherTodo) {
                        return otherTodo !== todo;
                    });
                }).error(function(status, statusText) {
                    error.textContent = "Failed to delete item. Server returned " + statusText + " - " + status;
                });
            }
        });
    };

    this.activeCount = function() {
        console.log("Active count");
        todoListCtrl.activeTasks = 0;
        todoListCtrl.completedTasks = 0;

        [].forEach.call(todoListCtrl.todos, function(todo) {
            if (todo.isComplete)
                todoListCtrl.completedTasks++;
            else
                todoListCtrl.activeTasks++;
        });
    };

    this.applyFilter = function(todo) {
        console.log("Apply filter");
        return (todoListCtrl.selectedFilter===1 && todo.isComplete) || (todoListCtrl.selectedFilter===2 && !todo.isComplete);
    };

    this.refreshTodoList();

}]);

