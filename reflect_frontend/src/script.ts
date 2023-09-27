import ask from "./ai";

interface EnhancedElement extends HTMLElement {
  value?: string;
}

const getDOMElement = (id: string): EnhancedElement | null => {
  const element = document.getElementById(id);
  if (!element) {
    console.error(`Element with id ${id} not found`);
    return null;
  }
  return element as EnhancedElement;
};

const sandboxContainer = getDOMElement("sandboxContainer");
const queryField = getDOMElement("queryField");
const sandbox = getDOMElement("sandbox");

let selectedElement: EnhancedElement | null = null;
let rightClickedInput: HTMLInputElement | null = null;

const resetRightClickedInput = (): void => {
  if (rightClickedInput) {
    rightClickedInput.remove();
    rightClickedInput = null;
  }
};

const resetSelectedElementBorder = (): void => {
  selectedElement?.classList.remove("border-highlight");
};

queryField?.addEventListener("keydown", (event: KeyboardEvent) => {
  if (event.key === "Enter" && sandboxContainer) {
    sandboxContainer.classList.remove("inactive-sandbox");
    sandboxContainer.classList.add("active-sandbox");
    if (sandbox && queryField.value) {
      ask("", queryField.value);
    }
    queryField!.value = "";
  } else if (event.key === "Escape") {
    resetRightClickedInput();
    resetSelectedElementBorder();
  }
});
console.log(sandbox);
sandbox?.addEventListener("contextmenu", function (event: MouseEvent) {
  console.log("Right clicked");
  event.preventDefault();
  console.log("Right clicked");
  if (!(event.target instanceof HTMLElement)) return;

  resetSelectedElementBorder();
  resetRightClickedInput();
  selectedElement = event.target as EnhancedElement;
  console.log(selectedElement);

  selectedElement.classList.add("border-highlight");
  const inputElem = document.createElement("input") as HTMLInputElement;

  inputElem.type = "text";
  inputElem.placeholder = "Enter your query";
  inputElem.className =
    "m-5 p-2 z-50 absolute bg-gray-700 placeholder-gray-400 text-gray-200 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500";

  const leftPosition = Math.min(
    event.pageX,
    this.offsetWidth + this.offsetLeft - inputElem.offsetWidth
  );

  inputElem.style.left = `${leftPosition}px`;
  inputElem.style.top = `${event.pageY}px`;

  this.appendChild(inputElem);
  rightClickedInput = inputElem;
  inputElem.focus();

  inputElem.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      (e.currentTarget as HTMLElement)?.remove();

      resetSelectedElementBorder();
      if (selectedElement) {
        ask(selectedElement || "", inputElem.value);
      }
      rightClickedInput = null;
    }
  });
});

document.addEventListener("click", () => {
  resetRightClickedInput();
  resetSelectedElementBorder();
});
