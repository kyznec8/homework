const kanban = document.querySelector(".kanban");

let columnsData = [
  {
    id: 0,
    title: "To do",
    items: [],
  },
  {
    id: 1,
    title: "Doing",
    items: [],
  },
  {
    id: 2,
    title: "Done",
    items: [],
  },
];

function createForm() {
  const form = document.createElement("form");
  form.classList.add("form");
  form.innerHTML = `
    <input placeholder="Add a new task" type="text" class="form__input" />
    <button class="form__button">Add</button>
  `;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = form.querySelector(".form__input").value.trim();
    if (value) {
      addItem(columnsData[0].items.length, 0, value);
      renderColumns();
    }
    form.querySelector(".form__input").value = "";
  });
  return form;
}

function addItem(index, columnId, value) {
  columnsData[columnId].items.splice(index, 0, value);
}

function removeItem(index, columnId) {
  columnsData[columnId].items.splice(index, 1);
}

function createColumn(columnData) {
  const column = document.createElement("div");
  column.classList.add("column");
  column.dataset.id = columnData.id;
  column.innerHTML = `
    <div class="column__title">${columnData.title}</div>
    <div class="column__content">
      <div class="column__drop" data-id="0"></div>
    </div>
  `;
  if (columnData.items.length) {
    columnData.items.forEach((itemData, index) => {
      column
        .querySelector(".column__content")
        .append(createItem(itemData, index, columnData.id));
      column.querySelector(".column__content").append(createDrop(index));
    });
  }
  return column;
}

function createItem(itemData, index, columnId) {
  const item = document.createElement("div");
  item.classList.add("column__item");
  item.draggable = true;
  item.dataset.id = index;
  item.innerHTML = `
    <div class="column__text">
      ${itemData}
    </div>
    <div class="column__icon">
      &times;
    </div>
  `;
  item.querySelector(".column__icon").addEventListener("click", () => {
    removeItem(index, columnId);
    renderColumns();
  });
  return item;
}

function createDrop(index) {
  const drop = document.createElement("div");
  drop.classList.add("column__drop");
  drop.dataset.id = index + 1;
  return drop;
}

function renderColumns() {
  if (!!document.querySelector(".columns")) {
    document.querySelector(".columns").remove();
  }

  const columns = document.createElement("div");
  columns.classList.add("columns");
  columnsData.forEach((columnData) => {
    columns.append(createColumn(columnData));
  });

  let selectedItemIndex = "";
  let selectedItemColumnId = "";

  columns.addEventListener("dragenter", (event) => {
    if (event.target.classList.contains("column__drop")) {
      event.target.classList.add("column__drop_hovered");
    }
  });

  columns.addEventListener("dragleave", (event) => {
    if (event.target.classList.contains("column__drop")) {
      event.target.classList.remove("column__drop_hovered");
    }
  });

  columns.addEventListener("dragstart", (event) => {
    if (event.target.classList.contains("column__item")) {
      event.dataTransfer.setData(
        "text/plain",
        event.target.querySelector(".column__text").textContent.trim()
      );
      selectedItemIndex = event.target.dataset.id;
      selectedItemColumnId =
        event.target.parentElement.parentElement.dataset.id;
    }
  });

  columns.addEventListener("dragover", (event) => {
    event.preventDefault();
  });

  columns.addEventListener("drop", (event) => {
    event.preventDefault();
    const target = event.target;
    if (target.classList.contains("column__drop")) {
      const data = event.dataTransfer.getData("text/plain");
      const columnId = event.target.parentElement.parentElement.dataset.id;
      removeItem(selectedItemIndex, selectedItemColumnId);
      addItem(target.dataset.id, columnId, data);
      renderColumns();
    }
  });

  kanban.append(columns);
  saveData(columnsData);
}

function saveData(data) {
  localStorage.setItem("columnsData", JSON.stringify(data));
}

if (localStorage.getItem("columnsData")) {
  columnsData = JSON.parse(localStorage.getItem("columnsData"));
}
kanban.append(createForm());
renderColumns();
