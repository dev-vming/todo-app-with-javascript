// 주요 관전 포인트
// 1. 어떻게 구현사항이 구조화 되는가?
// 2. DOM API 대신 data-bind 개념으로 개발하는 방식 이해하기
// 3. Model과 View 그리고 ViewModel의 의미 파악하기

// class ViewModel{
//   constructor() {
//     // Model

//   }

//   할일추가(viewModel, event){
//     if (event.key === "Enter") {
//       alert("!@")
//     }
//   }
// };

// 1. 할 일 목록 생성 - 사용자가 새로운 할 일을 입력할 수 있게 하는 기능

// ko.applyBindings(new ViewModel());

const todoList = document.getElementById("todo-list");

function createTodo(todoData) {
  const { title, completed } = todoData;
  const $li = $(`<li class="todo ${completed ? "completed" : ""}">
    <input type="checkbox" ${completed ? "checked" : ""}/>
            <span class="title">${title}</span>
            <input class="todo-edit-input" type="text"/>
            <button class="del">X</button>
    </li>`);
  $(todoList).append($li);
}

function setActiveButton(buttonId) {
  $(".filter-buttons button").removeClass("active");
  $(`#${buttonId}`).addClass("active");
}

// 1. 할 일 등록, 2. 할 일 목록 표시 - 엔터 키를 눌렀을 때, 할 일이 목록으로 표시되는 기능
$("#todo-input").on("keydown", (event) => {
  if (event.isComposing) return;
  if (event.key === "Enter") {
    const title = $(event.target).val();
    const todoData = { title, completed: false };
    createTodo(todoData);
    $(event.target).val("");
    updateRemainingTodos();
    saveTodos();
  }
});

// 3. 할 일 완료 - 할 일의 완료 상태를 표시 및 변경할 수 있는 기능
$(todoList).on("click", "input[type=checkbox]", (event) => {
  const $todo = $(event.target).closest(".todo").toggleClass("completed");
  const $checkbox = $todo.find("input[type='checkbox']");
  $checkbox.attr("checked", $todo.hasClass("completed"));
  updateRemainingTodos();
  saveTodos();
});

// 4. 할 일 개수 표시 - 전체 및 남아있는 할 일의 개수를 표시하는 기능
function updateRemainingTodos() {
  const num_remaining_todos = $(".todo:not(.completed)").length;
  $("#remaining-count").text(num_remaining_todos);
}

// 5. 할 일 삭제 - 목록에서 특정 할 일을 삭제하는 기능
$(todoList).on("click", "button.del", (event) => {
  $(event.currentTarget).closest(".todo").remove();
  updateRemainingTodos();
  saveTodos();
});

// 6.할 일 수정 - 이미 입력된 할 일의 내용을 수정하는 기능
$(todoList).on("dblclick", "span.title", (event) => {
  const $title = $(event.currentTarget);
  const $todo = $title.closest(".todo").addClass("editing");
  const $input = $todo.find("input.todo-edit-input").val($title.text()).focus();
});

$(todoList).on("keydown", "input.todo-edit-input", (event) => {
  if (event.isComposing) return;
  if (event.key === "Enter") {
    const $input = $(event.currentTarget);
    const $todo = $input.closest(".todo");
    const $title = $todo.find("span.title");
    $title.text($input.val());
    $todo.removeClass("editing");
    saveTodos();
  }
});

$(todoList).on("blur", "input.todo-edit-input", (event) => {
  $(event.currentTarget).closest(".todo").removeClass("editing");
});

// 7. 할 일 필터링 - 완료된 할 일과 진행 중인 할 일을 구분하여 볼 수 있는 필터 기능

$("#btn-show-all").click(() => {
  $(todoList).attr("data-filter", "all");
  setActiveButton("btn-show-all");
});
$("#btn-show-active").click(() => {
  $(todoList).attr("data-filter", "active");
  setActiveButton("btn-show-active");
});
$("#btn-show-completed").click(() => {
  $(todoList).attr("data-filter", "completed");
  setActiveButton("btn-show-completed");
});

// 8. 할 일 일괄 완료 처리 - 모든 할 일을 한 번에 완료 처리할 수 있는 기능
$("#btn-toggle-all").click(() => {
  const isAllChecked = [...$(todoList).find(".todo")].every((todo) =>
    $(todo).hasClass("completed")
  );
  $(todoList)
    .find(".todo")
    .each((index, todo) => {
      if (isAllChecked) {
        $(todo).removeClass("completed");
        $(todo).find("input[type='checkbox']").attr("checked", false);
      } else {
        $(todo).addClass("completed");
        $(todo).find("input[type='checkbox']").attr("checked", true);
      }
      updateRemainingTodos();
      saveTodos();
    });
});

// 9. 할 일 일괄 삭제 - 완료된 할 일만을 선택적으로 일괄 삭제하는 기능
$("#btn-clear-completed").click(() => {
  $(todoList)
    .find(".todo.completed")
    .each((index, todo) => $(todo).remove());
  updateRemainingTodos();
  saveTodos();
});

// 10. 지속성 - 데이터를 지속적으로 저장하며, 웹 페이지 새로고침 후에도 할 일 목록을 유지하는 기능
function saveTodos() {
  // 직렬화
  const savedTodos = [...$(todoList).find(".todo")].map((todo) => {
    const title = $(todo).find("span.title").text();
    const completed = $(todo).hasClass("completed");

    return { title, completed };
  });
  localStorage.setItem("todos", JSON.stringify(savedTodos));
}

const savedTodos = JSON.parse(localStorage.getItem("todos") || "[]");

// 역직렬화
savedTodos.forEach((todoData) => {
  createTodo(todoData);
});

updateRemainingTodos();
