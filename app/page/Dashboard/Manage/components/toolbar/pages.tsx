import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { useCallback, useEffect, useState } from "react";
import { $wrapNodes } from "@lexical/selection";
import {
  $createParagraphNode,
  $getRoot,
  $createTextNode,
} from "lexical";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";
import {
  $createHeadingNode,
  $createQuoteNode,
  HeadingTagType,
} from "@lexical/rich-text";

const LowPriority = 1;

const ToolbarPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
    }
  }, []);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateToolbar();
        return false;
      },
      LowPriority
    );
  }, [editor, updateToolbar]);

  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $wrapNodes(selection, () => $createParagraphNode());
      }
    });
  };

  const formatHeading = (headingSize: HeadingTagType) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $wrapNodes(selection, () => $createHeadingNode(headingSize));
      }
    });
  };

  const formatBulletList = () => {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  };

  const formatNumberedList = () => {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
  };

  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $wrapNodes(selection, () => $createQuoteNode());
      }
    });
  };

  const buttonClass = "p-2 mx-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700";
  const activeButtonClass = "p-2 mx-1 rounded bg-gray-200 dark:bg-gray-700";

  return (
    <div className="flex items-center border-b p-2 gap-1 flex-wrap dark:border-gray-700">
      <button
        type="button"
        className={buttonClass}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
        aria-label="Format Bold"
      >
        <span className={isBold ? "font-bold" : ""}>B</span>
      </button>
      <button
        type="button"
        className={buttonClass}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
        aria-label="Format Italics"
      >
        <span className={isItalic ? "italic" : ""}>I</span>
      </button>
      <button
        type="button"
        className={buttonClass}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
        aria-label="Format Underline"
      >
        <span className={isUnderline ? "underline" : ""}>U</span>
      </button>
      <span className="mx-1 text-gray-300 dark:text-gray-600">|</span>
      <button
        type="button"
        className={buttonClass}
        onClick={formatParagraph}
        aria-label="Paragraph"
      >
        P
      </button>
      <button
        type="button"
        className={buttonClass}
        onClick={() => formatHeading("h1")}
        aria-label="Heading 1"
      >
        H1
      </button>
      <button
        type="button"
        className={buttonClass}
        onClick={() => formatHeading("h2")}
        aria-label="Heading 2"
      >
        H2
      </button>
      <span className="mx-1 text-gray-300 dark:text-gray-600">|</span>
      <button
        type="button"
        className={buttonClass}
        onClick={formatBulletList}
        aria-label="Bullet List"
      >
        • List
      </button>
      <button
        type="button"
        className={buttonClass}
        onClick={formatNumberedList}
        aria-label="Numbered List"
      >
        1. List
      </button>
      <button
        type="button"
        className={buttonClass}
        onClick={formatQuote}
        aria-label="Quote"
      >
        "Quote"
      </button>
    </div>
  );
};

export default ToolbarPlugin;