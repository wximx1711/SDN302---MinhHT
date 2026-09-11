import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { TodoList } from "./TodoList.js";

const rl = readline.createInterface({ input, output });
const todoList = new TodoList();

function printMenu() {
  console.log("\n=========== MENU ===========");
  console.log("1. Xem danh sách công việc");
  console.log("2. Thêm công việc mới");
  console.log("3. Đánh dấu hoàn thành / bỏ hoàn thành");
  console.log("4. Thoát");
  console.log("============================");
}

async function main() {
  let isRunning = true;

  while (isRunning) {
    printMenu();
    const choice = (await rl.question("Chọn chức năng (1-4): ")).trim();

    switch (choice) {
      case "1":
        todoList.showTodos();
        break;

      case "2": {
        const title = (await rl.question("Nhập tên công việc: ")).trim();
        if (title) {
          todoList.addTodo(title);
        } else {
          console.log("\n Tên công việc không được để trống!");
        }
        break;
      }

      case "3": {
        todoList.showTodos();
        const id = (await rl.question("Nhập ID công việc cần đánh dấu: ")).trim();
        todoList.markCompleted(id);
        break;
      }

      case "4":
        console.log("\n Tạm biệt!");
        isRunning = false;
        rl.close();
        break;

      default:
        console.log("\n Lựa chọn không hợp lệ, vui lòng thử lại!");
        break;
    }
  }
}

main();
