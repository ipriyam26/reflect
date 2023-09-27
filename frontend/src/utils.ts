import { get, type Writable } from "svelte/store";
import type { CustomNode, ElementNode, Task } from "./types";
import { sandboxContent } from "./store";
import html2canvas from "html2canvas";

export function cloneStoreContent<T>(store: Writable<T>): T {
  return JSON.parse(JSON.stringify(get(store)));
}
function parseHTML(html: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  return doc.body;
}
function extractStructure(element: ChildNode): CustomNode | null {
  if (element.nodeType === window.Node.TEXT_NODE) {
    const content = element.textContent ? element.textContent.trim() : "";
    if (content) {
      return {
        content: content,
      };
    } else {
      return null;
    }
  }

  const node: ElementNode = {
    tag: (element as HTMLElement).tagName,
    attributes: {},
    children: [],
  };

  // Add a guard clause to check for undefined attributes
  if ((element as HTMLElement).attributes) {
    Array.from((element as HTMLElement).attributes).forEach((attr) => {
      node.attributes[attr.name] = attr.value;
    });
  }

  for (let child of element.childNodes) {
    const childNode = extractStructure(child);
    if (childNode) {
      node.children.push(childNode);
    }
  }

  return node.children.length > 0 || Object.keys(node.attributes).length > 0
    ? node
    : null;
}

function convertHTMLToStructure(html: string): CustomNode[] {
  const parsedDOM = parseHTML(html);
  const nodes: CustomNode[] = [];

  // Loop over all children of the body (i.e., all root elements of the HTML)
  parsedDOM.childNodes.forEach((child) => {
    const node = extractStructure(child as ChildNode);
    if (node) {
      nodes.push(node);
    }
  });

  return nodes;
}

export function isElementNode(node: CustomNode): node is ElementNode {
  return "tag" in node;
}

function findParent(content: CustomNode[], id: string): ElementNode | null {
  for (const item of content) {
    if (isElementNode(item)) {
      if (
        item.children.some(
          (child) => isElementNode(child) && child.attributes.id === id
        )
      ) {
        return item;
      }
      const found = findParent(item.children, id);
      if (found) return found;
    }
  }
  return null;
}

export const findTarget = (
  content: CustomNode[],
  id: string
): ElementNode | null => {
  for (const item of content) {
    if (isElementNode(item) && item.attributes.id === id) {
      return item;
    }
    if (isElementNode(item)) {
      const found = findTarget(item.children, id);
      if (found) return found;
    }
  }
  return null;
};

function findIndexByAttribute(
  children: CustomNode[],
  target: ElementNode
): number {
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (isElementNode(child)) {
      if (child.attributes.id === target.attributes.id) {
        return i;
      }
    }
  }
  return -1;
}

function manipulateContent(
  currentContent: CustomNode[],
  task: Task,
  target: ElementNode,
  newContent: CustomNode[]
) {
  const clonedContent = JSON.parse(JSON.stringify(currentContent));

  const parent = findParent(clonedContent, task.id);
  console.log("parent");
  console.log(parent);
  console.log("target");
  console.log(target);
  if (!parent || !parent.children) return currentContent;
  const index = findIndexByAttribute(parent.children, target);
  console.log("index");
  console.log(index);
  console.log(task.type);
  switch (task.type) {
    case "A":
      parent.children.splice(index, 0, ...newContent);
      break;
    case "B":
      parent.children.splice(index + 1, 0, ...newContent);
      break;

    case "R":
      parent.children.splice(index, 1, ...newContent);
      break;
    case "D":
      parent.children.splice(index, 1);
      break;
  }
  console.log("clonedContent");
  console.log(clonedContent);
  return clonedContent;
}

export function injectUIContent(task: Task): void {
  console.log(task);
  const newContent = convertHTMLToStructure(task.nodes);
  console.log("newContent");
  console.log(newContent);
  if (task.type === "N") {
    sandboxContent.set(newContent);
    return;
  }

  const target = findTarget(get(sandboxContent), task.id);
  if (!target) {
    console.error(`Element with ID ${task.id} not found.`);
    return;
  }

  sandboxContent.update((currentContent) => {
    return manipulateContent(currentContent, task, target, newContent);
  });
}

export async function captureThumbnail(element: HTMLElement) {
  const canvas = await html2canvas(element, {
    logging: true,
    allowTaint: false,
    useCORS: true,
    scale: 0.2,
    scrollY: 0,
    windowWidth: document.documentElement.offsetWidth,
    windowHeight: document.documentElement.offsetHeight,
  });
  return canvas.toDataURL();
}
