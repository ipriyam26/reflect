import { get, writable } from "svelte/store";
import type { CustomNode } from "./types";

import { captureThumbnail, cloneStoreContent } from "./utils";
import { sandboxContent } from "./store";
export default class VersionNode {
  thumbnail: string;
  structure: CustomNode[];
  children: VersionNode[];

  constructor(thumbnail: string, structure: CustomNode[]) {
    this.thumbnail = thumbnail;
    this.structure = structure;
    this.children = [];
  }

  addVersion(thumbnail: string, structure: CustomNode[]): VersionNode {
    const child = new VersionNode(thumbnail, structure);

    this.children.push(child);
    return child;
  }
}

export const versionROOT = writable<VersionNode | null>(null);
export const versionHEAD = writable<VersionNode | null>(null);

export async function initializeVersion() {
  const thumbnail = await captureThumbnail(document.getElementById("sandbox")!);
  const rootNode = new VersionNode(
    thumbnail,
    cloneStoreContent(sandboxContent)
  );
  versionROOT.set(rootNode);
  versionHEAD.set(rootNode);
}

export function transverseVersion(
  root: VersionNode | null,
  head: VersionNode | null
): VersionNode[] {
  let path: VersionNode[] = [];

  if (!root || !head) {
    return path;
  }
  function dfs(currentNode: VersionNode, currentPath: VersionNode[]): boolean {
    if (currentNode === head) {
      currentPath.push(currentNode);
      path = currentPath;
      return true;
    }

    for (const child of currentNode.children) {
      const newPath = currentPath.slice();
      newPath.push(currentNode);
      if (dfs(child, newPath)) {
        return true;
      }
    }

    return false;
  }

  dfs(root, []);

  return path;
}
export async function fetchOldVersion(node: VersionNode) {
  sandboxContent.set(node.structure);
  versionHEAD.set(node);
}

export async function createNewVersion() {
  let isLoading: HTMLElement | null = document.getElementById("loading");
  let sandbox: HTMLElement = document.getElementById("sandbox")!;
  console.log("sandbox");
  console.log(sandbox);
  while (isLoading != null) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("loading");
    sandbox = document.getElementById("sandbox")!;
    isLoading = sandbox.querySelector("#loading");
  }
  const currentHead = get(versionHEAD);
  if (!currentHead) {
    initializeVersion();
  } else {
    const thumbnail = await captureThumbnail(sandbox);
    const structure = cloneStoreContent(sandboxContent);
    const newNode = currentHead.addVersion(thumbnail, structure);

    versionHEAD.set(newNode);
  }
}


