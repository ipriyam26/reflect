<script lang="ts">
  import { html } from "@codemirror/lang-html";

  import { EditorState } from "@codemirror/state";
  import { EditorView } from "@codemirror/view";
  import beautify from "js-beautify";
  import { oneDark } from "@codemirror/theme-one-dark";
  import { basicSetup } from "codemirror";
  import { createEventDispatcher, onMount } from "svelte";

  let editor: EditorView;
  export let sandboxHTML: string;
  interface CopyFunctionDetail {
    copyToClipboard: () => void;
  }

  const dispatch = createEventDispatcher<{
    copyFunctionReady: CopyFunctionDetail;
  }>();
  function showToast(message: string) {
    const toastElement = document.createElement("div");
    toastElement.textContent = message;
    toastElement.className = "toast";
    document.body.appendChild(toastElement);

    setTimeout(() => {
      toastElement.remove();
    }, 3000);
  }

  function copyToClipboard() {
    const editorContent = editor.state.doc.toString();
    navigator.clipboard.writeText(editorContent).then(
      () => {},
      (err) => {
        console.log("Failed to copy text: ", err);
      }
    );
  }
  onMount(async () => {
    dispatch("copyFunctionReady", { copyToClipboard });

    const beautifyOptions = {
      indent_size: 2,
      indent_char: " ",
      indent_with_tabs: false,
      preserve_newlines: true,
      max_preserve_newlines: 10,
    };
    let initialContent = beautify.html(
      `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
  ${sandboxHTML.replaceAll("<!--<Element>-->", "")}
</body>
</html>`,
      beautifyOptions
    );

    editor = new EditorView({
      state: EditorState.create({
        doc: initialContent,
        extensions: [basicSetup, html(), oneDark],
      }),
      parent: document.getElementById("editor") as HTMLElement,
    });
  });
</script>

<div id="editor" />

<style>
  #editor {
    overflow-y: auto;

    /* height: 80vh; */
    border: 1px solid #ccc;
    text-align: left; /* Add this line */
  }
  .toast {
    position: fixed;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #333;
    color: #fff;
    padding: 10px;
    border-radius: 5px;
    z-index: 1000;
  }
</style>
