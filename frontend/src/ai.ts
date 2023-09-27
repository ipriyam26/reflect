import fetchTasks from "./api";
import { showLoading } from "./store";
import { createNewVersion } from "./version";
import { injectUIContent } from "./utils";

export default async function ask(
  selectedNode: HTMLElement | null,
  query: string
) {
  let selectedHTML = selectedNode === null ? "" : selectedNode.outerHTML;
  // if (!selectedNode) {
  showLoading.set(true);
  // }
  const tasks = await fetchTasks(query, selectedHTML);

  tasks.forEach((task) => {
    injectUIContent(task);
  });
  // if (!selectedNode) {
  showLoading.set(false);
  // }
  await createNewVersion();
}
