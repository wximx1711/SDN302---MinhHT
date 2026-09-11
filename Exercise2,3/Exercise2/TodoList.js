import { TodoItem } from "./TodoItem.js";

export class TodoList {
  constructor() {
    this.todos = [];
    this.nextId = 1;
  }

  addTodo(title) {
    const todo = new TodoItem(this.nextId++, title);
    this.todos.push(todo);
    console.log(`\n Đã thêm: "${title}" (ID: ${todo.id})`);
  }

  showTodos() {
    console.log("\n====== DANH SÁCH CÔNG VIỆC ======");
    if (this.todos.length === 0) {
      console.log("(Trống)");
      return;
    }
    this.todos.forEach((todo) => console.log(todo.toString()));
  }

  markCompleted(id) {
    const todo = this.todos.find((t) => t.id === Number(id));
    if (!todo) {
      console.log(`\n Không tìm thấy công việc với ID: ${id}`);
      return;
    }
    todo.toggleComplete();
    console.log(`\n Đã cập nhật trạng thái cho ID #${id}: ${todo.isCompleted ? "Hoàn thành" : "Chưa hoàn thành"}`);
  }
}
