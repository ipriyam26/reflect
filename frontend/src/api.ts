import type { APIResponse, Task } from "./types";
import { sandboxContent, showLoading, history } from "./store";
import { get } from "svelte/store";

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

export default async function fetchTasks(
  query: string,
  content: string = ""
): Promise<Task[]> {
  const requestData = {
    html: content,
    query: query,
    history: get(history),
  };
  let apiResponse;
  if (content === "") {
    apiResponse = await firstCall(requestData);
  } else {
    apiResponse = await fixShit(requestData);
  }
  console.log(apiResponse.status);
  if (apiResponse.status !== 200) {
    console.error("Error in response from server");
    return [];
  }
  const responseData: APIResponse = await apiResponse.json();
  console.log(responseData);
  const completeTask: Task[] = responseData.actions.map((action) => {
    return {
      type: action.type,
      id: action.id,
      nodes: action.html,
    };
  });

  history.set(responseData.history);

  return completeTask;
}
