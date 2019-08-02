import markdownit from "markdown-it";
import Prism from "prismjs";
// import hljs from "highlight.js";
import emoji from "markdown-it-emoji";
import math from "markdown-it-math";
import katex from "katex";
import twemoji from "twemoji";

// Old code that was used for highlightJS

// let md = markdownit({
//   highlight: (str, lang) => {
//     if (lang && hljs.getLanguage(lang)) {
//       try {
//         return (
//           '<pre class="hljs"><code>' +
//           hljs.highlight(lang, str, true).value +
//           "</code></pre>"
//         );
//       } catch (__) {}
//     }
//     return (
//       '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + "</code></pre>"
//     );
//   }
// });

export let md: markdownit = markdownit({
  html: true,
  highlight: (str, lang) => {
   if (lang) {
        const langObject = Prism.languages[lang];
        try {
          return (
            `<pre class="language-${lang}"><code>` +
            Prism.highlight(str, langObject, lang) +
            "</code></pre>"
        );
      } catch (__) {
        // TODO
      }
    }
   return `<pre class="language-"><code>` + md.utils.escapeHtml(str) + "</code></pre>";
  }
});
md.use(math, {
  inlineOpen: "$",
  inlineClose: "$",
  blockOpen: "$$",
  blockClose: "$$",
  inlineRenderer: (str: string) => {
    let output = "";
    try {
      output = katex.renderToString(str.trim());
    } catch (err) {
      output = err.message;
    }
    return output;
  },
  blockRenderer: (str: string) => {
    let output = "";
    try {
      output = katex.renderToString(str.trim(), { displayMode: true });
    } catch (err) {
      output = err.message;
    }
    return output;
  }
});
md.use(emoji);
md.renderer.rules.emoji = (token, idx) => twemoji.parse(token[idx].content);
