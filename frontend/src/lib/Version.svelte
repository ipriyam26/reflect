<script lang="ts">
  import VersionNode, {
    versionHEAD,
    versionROOT,
    fetchOldVersion,
    transverseVersion,
  } from "../version";
  export let isActive: boolean;
  let pathToHead: VersionNode[] = [];

  versionHEAD.subscribe(($versionHEAD) => {
    pathToHead = transverseVersion($versionROOT, $versionHEAD);
    //for the last element in the path, select all the children
    if (pathToHead.length == 0) return;
    let lastNode = pathToHead[pathToHead.length - 1];
    while (lastNode.children.length != 0) {
      pathToHead.push(lastNode.children[lastNode.children.length - 1]);
      lastNode = lastNode.children[lastNode.children.length - 1];
    }
  });

  function hasPrevious(node: VersionNode, index: number) {
    if (index === 0) return false;

    return pathToHead[index - 1].children.indexOf(node) !== 0;
  }

  function hasNext(node: VersionNode, index: number) {
    if (index === pathToHead.length - 1) return false;
    if (index === 0) return false;
    return (
      pathToHead[index - 1].children.indexOf(node) !==
      pathToHead[index - 1].children.length - 1
    );
  }

  async function moveToSibling(
    currentNode: VersionNode,
    direction: "up" | "down"
  ) {
    // Find parent node from the current path
    const parent = pathToHead.find((node) =>
      node.children.includes(currentNode)
    );
    if (!parent) return; // No parent, probably the root node

    const siblings = parent.children;
    const currentIndex = siblings.indexOf(currentNode);

    let newIndex;
    if (direction === "up") {
      newIndex = Math.max(currentIndex - 1, 0);
    } else {
      newIndex = Math.min(currentIndex + 1, siblings.length - 1);
    }

    // Move to the new sibling node
    const newSibling = siblings[newIndex];
    await fetchOldVersion(newSibling);
  }
</script>

<ul
  class:hide-shit={!isActive}
  class="flex flex-nowrap overflow-x-auto space-x-4 items-center w-[80vw] list-none p-0 m-0"
>
  {#each pathToHead as versionNode, index}
    <div class="flex flex-col items-center">
      {#if hasPrevious(versionNode, index)}
        <button
          class="arrow-button"
          on:click={() => moveToSibling(versionNode, "up")}
        >
          <img height="15" width="15" src="/assets/up-arrow.svg" alt="UP" />
        </button>
      {:else}
        <div class="placeholder" />
      {/if}

      <button on:click={() => fetchOldVersion(versionNode)}>
        <img src={versionNode.thumbnail} alt="Thumbnail" class="thumbnail" />
      </button>

      {#if hasNext(versionNode, index)}
        <button
          class="arrow-button"
          on:click={() => moveToSibling(versionNode, "up")}
        >
          <img height="15" width="15" src="/assets/down-arrow.svg" alt="down" />
        </button>
      {:else}
        <div class="placeholder" />
      {/if}
    </div>
  {/each}
</ul>

<style>
  .hide-shit {
    overflow: hidden;
    max-height: 0 !important;
  }
  .thumbnail {
    width: 100px;
    height: 60px;
    border: none;
  }
  .placeholder {
    height: 15px;
  }
  /* .current-version {
    width: 120px;
    height: 80px;
    border: none;
  } */
  .arrow-button {
    background: none;
    border: none;
    padding: 0;
    margin: 0;
  }
</style>
