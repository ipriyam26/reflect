import { writable } from "svelte/store";
import type { CustomNode } from "./types";
// import VersionNode from "./version";
export const sandboxContent = writable<CustomNode[]>([]);
export const showLoading = writable(false);
export const history = writable("");

