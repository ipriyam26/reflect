<script lang="ts">
  import { sandboxContent } from "../store";
  import CodeEditor from "./CodeEditor.svelte";
  import Sandbox from "./Sandbox.svelte";
  import { fade } from "svelte/transition";

  export let isActive: boolean;
  export let showCode = false;
  let sandboxId: string;
  let copyToClipboard: () => void;

  function handleCopyFunctionReady(
    event: CustomEvent<{ copyToClipboard: () => void }>
  ) {
    copyToClipboard = event.detail.copyToClipboard;
  }
  sandboxContent.subscribe(($sandboxContent) => {
    sandboxId = Math.random().toString(36).substring(7);
  });
  let sandboxHTML = "";

  function updateHTMLCode() {
    const sandboxElement = document.getElementById("sandbox");
    if (sandboxElement) {
      sandboxHTML = sandboxElement.innerHTML;
    }
  }
</script>

<div class="flex">
  <div
    id="sandboxContainer"
    class:active-sandbox={isActive}
    class:inactive-sandbox={!isActive}
    class="transition-all duration-500 ml-8 border mb-4 border-gray-600 bg-white"
  >
    {#if showCode}
      <div in:fade={{ duration: 500 }}>
        <CodeEditor
          {sandboxHTML}
          on:copyFunctionReady={handleCopyFunctionReady}
        />
      </div>
    {:else}
      <div in:fade={{ duration: 500 }}>
        <Sandbox {sandboxId} />
      </div>
    {/if}
  </div>

  <div
    class="mt-4 space-y-4"
    class:active-button={isActive}
    class:inactive-button={!isActive}
  >
    <button
      class="bg-gray-600 text-white border p-2 border-white rounded"
      on:click={copyToClipboard}
    >
      <img
        width="25"
        height="25"
        src="/assets/clipboard.svg"
        alt="clipboard"
      /></button
    >
    <button
      class="bg-gray-600 text-white border-white p-2 rounded"
      on:click={() => {
        showCode = !showCode;
        updateHTMLCode();
      }}
    >
      {#if showCode}
        <img
          width="25"
          height="25"
          src="/assets/code.svg"
          alt="source-code"
        />
      {:else}
        <span>
          <img
            width="25"
            height="25"
            src="/assets/design.svg"
            alt="web-design"
          />
        </span>
      {/if}
    </button>
  </div>
</div>

<style>
  .active-sandbox {
    opacity: 1;
    /* transform: scale(0.9); */
    max-height: 80vh !important;
    max-width: 80vw !important;
    overflow: auto;
  }
  .inactive-sandbox {
    opacity: 0;
    max-height: 0 !important;
    overflow: hidden;
  }

  #sandboxContainer {
    border-radius: 0.75rem !important;
    height: 80vh;
    width: 80vw;
    /* overflow: hidden; */
  }
  .active-button {
    opacity: 1;
  }
  .inactive-button {
    opacity: 0;
    overflow: hidden;
  }
</style>
