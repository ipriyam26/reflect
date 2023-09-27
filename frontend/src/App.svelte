<script lang="ts">
  import Version from "./lib/Version.svelte";
  import ask from "./ai";
  import SandboxContainer from "./lib/SandboxContainer.svelte";
  let isActive = false;

  async function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      isActive = true;
      await ask(null, (event.target as HTMLInputElement).value);
      (event.target as HTMLInputElement).value = "";
    }
  }

  let showCode = false;
</script>

<main>
  <div class="flex flex-col items-center justify-center min-h-screen">
    {#if !isActive}
    <img src="/assets/reflect.svg" alt="reflect" />

    <h3 class="font-serif text-xl">
      Generate Awesome looking Web UI, in minutes with just a query!!! Try it
      now
    </h3>
    {/if}
    <SandboxContainer {isActive} {showCode} />
    <Version {isActive} />
    <input
      type="text"
      id="queryField"
      on:keydown={handleKeyDown}
      class="m-5 p-2 w-4/5 bg-gray-700 placeholder-gray-400 text-gray-200 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
      placeholder="Enter your query"
    />
  </div>
</main>
