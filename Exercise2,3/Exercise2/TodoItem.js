export class TodoItem {
  constructor(id, title) {
    this.id = id;
    this.title = title;
    this.isCompleted = false;
  }

  toggleComplete() {
    this.isCompleted = !this.isCompleted;
  }

  toString() {
    const status = this.isCompleted ? "[X]" : "[ ]";
    return `${status} #${this.id}: ${this.title}`;
  }
}
