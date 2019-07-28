import markdownit from 'markdown-it';
import prism from 'markdown-it-prism';
import emoji from 'markdown-it-emoji';
import math from 'markdown-it-math';
import katex from 'katex';

export let md = markdownit()
md.use(prism, {
    
});
md.use(math, {
    inlineOpen: '$',
    inlineClose: '$',
    blockOpen: '$$',
    blockClose: '$$',
    inlineRenderer: (str: string) => {
        let output = '';
        try {
            output = katex.renderToString(str.trim())
        } catch (err) {
            output = err.message;
        }
        return output;
    },
    blockRenderer: (str: string) => {
        let output = '';
        try {
            output = katex.renderToString(str.trim(), { displayMode: true })
        } catch (err) {
            output = err.message;
        }
        return output;
    }
})
md.use(emoji)