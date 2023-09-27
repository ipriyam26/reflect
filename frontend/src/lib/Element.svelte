<script lang="ts">
  import type { CustomNode, ElementNode, TextNode } from "../types";

  export let node: CustomNode;
  let isElementNode: boolean = "tag" in node;
  let currentNode: ElementNode | null = isElementNode
    ? (node as ElementNode)
    : null;
  let textNode: TextNode | null = !isElementNode ? (node as TextNode) : null;
</script>

{#if isElementNode && currentNode}
  <svelte:element this={currentNode.tag} {...currentNode.attributes}>
    {#if currentNode.children && currentNode.children.length}
      {#each currentNode.children as child}
        <svelte:self node={child} />
      {/each}
    {/if}
  </svelte:element>
{:else if !isElementNode && textNode}
  {textNode.content}
{/if}
