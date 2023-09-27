import { sandboxContent } from "./store";
import { findTarget } from "./utils";

export class Interaction {
  previousElement: HTMLElement | null = null;
  rightClickedInput: HTMLInputElement | null = null;
  ask: (selectedNode: HTMLElement, query: string) => void;
  constructor(ask: (selectedNode: HTMLElement, query: string) => void) {
    this.ask = ask;
    this.handleRightClick = this.handleRightClick.bind(this);
    this.handleLeftClick = this.handleLeftClick.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  clearPrevious() {
    if (this.previousElement) {
      this.previousElement.style.border = "";
    }

    if (this.rightClickedInput) {
      this.rightClickedInput.remove();
      this.rightClickedInput = null;
    }
  }
  handleRightClick(event: MouseEvent) {
    event.preventDefault();
    let targetElement = event.target as HTMLElement;

    //move to parent until we find a node with id
    while (!targetElement.id && targetElement.parentElement) {
      targetElement = targetElement.parentElement;
    }

    this.clearPrevious();

    if (targetElement.closest("#sandbox")) {
      targetElement.style.border = "2px solid blue";

      const inputElem = document.createElement("input") as HTMLInputElement;
      inputElem.type = "text";
      inputElem.placeholder = "Enter your query";
      inputElem.className =
        "m-5 p-2 z-50 absolute bg-gray-700 placeholder-gray-400 text-gray-200 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500";

      const leftPosition = Math.min(
        event.pageX,
        window.innerWidth - inputElem.offsetWidth
      );

      inputElem.style.left = `${leftPosition}px`;
      inputElem.style.top = `${event.pageY}px`;
      inputElem.onkeyup = (e: KeyboardEvent) => {
        if (e.key === "Enter") {
          this.clearPrevious();

          this.ask(targetElement, inputElem.value);

        }
      };
      document.body.appendChild(inputElem);
      inputElem.focus();
      this.rightClickedInput = inputElem;
      this.previousElement = targetElement;
    }
  }

  handleLeftClick() {
    this.clearPrevious();
  }

  handleKeyPress(event: KeyboardEvent) {
    if (event.key === "Escape") {
      this.clearPrevious();
    }
  }
}
