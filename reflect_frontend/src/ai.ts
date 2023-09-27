// Define the type for configContent
interface Task {
  type: "A" | "B" | "N" | "R" | "D" | "E";
  id: string;
  nodes: ChildNode[];
}

interface Action {
  type: "A" | "B" | "N" | "R" | "D";
  id: string;
  html: string;
}
interface APIResponse {
  actions: Action[];
  history: string;
}

let selectedElement: HTMLElement = document.getElementById(
  "sandbox"
) as HTMLElement;
let oldContent: string = selectedElement.innerHTML || "";

let history: string = "";
type FetchFunction = (requestData: {
  html: string;
  query: string;
  history: string;
}) => Promise<Response>;

function loading() {
  return `
      <div style="display: flex; justify-content: center; align-items: center; height: 100%; width: 100%;">
          <div style="max-width: 32px; max-height: 32px; width: 10vw; height: 10vw; border-radius: 50%; border-top: 2px solid gray; border-bottom: 2px solid gray; animation: spin 1s linear infinite;"></div>
      </div>
  
      <style>
          @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
          }
      </style>
      `;
}

async function parse(
  query: string,
  content: string = "",
  apiCaller: FetchFunction = fixShit
): Promise<Task[]> {
  const requestData = {
    html: content || "",
    query: query,
    history: history,
  };
  // console.log(JSON.stringify(requestData));
  const apiResponse = await apiCaller(requestData);
  console.log(apiResponse);
  if (apiResponse.status !== 200) {
    console.error("Error in response from server");
    return [];
  }
  const responseData: APIResponse = await apiResponse.json();
  console.log(responseData);
  const parser = new DOMParser();
  const completeTask: Task[] = responseData.actions.map((action) => {
    const parsedDocument = parser.parseFromString(action.html, "text/html");
    const nodes = Array.from(parsedDocument.body.childNodes);
    return {
      type: action.type,
      id: action.id,
      nodes: nodes,
    };
  });

  history = responseData.history;

  return completeTask;
}

export default async function ask(
  selectedNode: HTMLElement | string,
  query: string
): Promise<void> {
  if (selectedNode === "") {
    selectedElement = document.getElementById("sandbox") as HTMLElement;
    oldContent = selectedElement.innerHTML;
    selectedElement.innerHTML = loading();
  } else {
    selectedElement = selectedNode as HTMLElement;

    const placeholder = document.createElement("div");
    placeholder.innerHTML = loading();
    selectedElement.replaceWith(placeholder);

    oldContent = selectedElement.outerHTML;
    selectedElement = placeholder;
  }
  console.log("Selected Element");
  console.log(selectedElement);

  const tasks = await parse(
    query,
    selectedNode === "" ? "" : oldContent,
    selectedNode === "" ? firstCall : fixShit
  );
  console.log(tasks);

  if (tasks.length === 0) {
    if (selectedElement?.id !== "sandbox") {
      const placeholder = document.createElement("div");
      placeholder.innerHTML = oldContent;
      selectedElement.replaceWith(placeholder);
      selectedElement = placeholder;
    } else {
      selectedElement.innerHTML = oldContent;
    }
    return;
  }
  // injectUIContent(nodes, configContent);
  tasks.forEach((task) => {
    injectUIContent(task);
  });
}

async function firstCall(requestData: {
  html: string;
  query: string;
  history: string;
}) {
  const reply = await fetch("http://127.0.0.1:8000/first_response", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  });
  return reply;
}

async function fixShit(requestData: {
  html: string;
  query: string;
  history: string;
}) {
  return await fetch("http://127.0.0.1:8000/fix_shit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  });
}

function injectUIContent(task: Task): void {
  if (selectedElement?.id !== "sandbox") {
    const placeholder = document.createElement("div");
    placeholder.innerHTML = oldContent;
    selectedElement.replaceWith(placeholder);
    selectedElement = placeholder;
  } else {
    selectedElement.innerHTML = oldContent;
  }

  let targetElement: HTMLElement | null;
  const sandbox = document.getElementById("sandbox");
  if (task.type === "N") {
    targetElement = sandbox;
  } else {
    targetElement = sandbox?.querySelector(`#${task.id}`) as HTMLElement;
  }

  console.log("Target Element");
  console.log(targetElement);

  if (!targetElement) {
    console.error(`Element with ID ${task.id} not found.`);
    return;
  }
  switch (task.type) {
    case "A":
      task.nodes.forEach((node) => {
        targetElement?.parentElement?.insertBefore(node, targetElement);
      });
      break;
    case "B":
      task.nodes.forEach((node) => {
        if (targetElement?.nextSibling) {
          targetElement.parentElement?.insertBefore(
            node,
            targetElement.nextSibling
          );
        } else {
          targetElement?.parentElement?.appendChild(node);
        }
      });
      break;
    case "N":
      targetElement.innerHTML = "";
      task.nodes.forEach((node) => {
        targetElement?.appendChild(node);
      });
      break;
    case "R":
      task.nodes.forEach((node) => {
        if (targetElement?.nextSibling) {
          targetElement.parentElement?.insertBefore(
            node,
            targetElement.nextSibling
          );
        } else {
          targetElement?.parentElement?.appendChild(node);
        }
      });

      targetElement.remove();
      break;
    case "D":
      targetElement.remove();
      break;
    default:
      console.error(`Unexpected type value: ${task.type}`);
  }
}
