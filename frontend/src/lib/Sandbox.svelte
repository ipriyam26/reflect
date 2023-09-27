<script lang="ts">
  import Element from "./Element.svelte";
  import { Interaction } from "../interaction";
  import { sandboxContent, showLoading } from "../store.js";
  import ask from "../ai";

  let interaction = new Interaction(ask);

  export let sandboxId: string;
</script>

<svelte:body
  on:click={interaction.handleLeftClick}
  on:keydown={interaction.handleKeyPress}
/>

<div
  id="sandbox"
  class="h-full overflow-y-auto"
  on:contextmenu={interaction.handleRightClick}
  role="region"
>
  {#if !$showLoading}
    {#each $sandboxContent as node, index}
      {#key sandboxId}
        <Element {node} />
      {/key}
    {/each}
  {:else}
    <div class="flex justify-center items-center h-full" id="loading">
      <div
        class="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"
      />
    </div>
  {/if}
</div>
