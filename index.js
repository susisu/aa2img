"use strict";

const fs = require("fs");

const Canvas = require("canvas");

function trim(text) {
    return text.replace(/^([ \u3000]*\n)+/, "")
        .replace(/([ \u3000]*\n)+$/, "");
}

function render(text, style, options) {
    const trimmed = trim(text);

    const st     = style || {};
    const margin = st.margin || 0;
    const font            = st.font || "_serif";
    const color           = st.color || "#000000";
    const backgroundColor = st.backgroundColor || "#FFFFFF";
    const marginTop       = typeof margin === "object" ? margin.top    || 0 : margin;
    const marginBottom    = typeof margin === "object" ? margin.bottom || 0 : margin;
    const marginLeft      = typeof margin === "object" ? margin.left   || 0 : margin;
    const marginRight     = typeof margin === "object" ? margin.right  || 0 : margin;

    const op = options || {};
    const compressionLevel = op.compressionLevel || 0;

    const canvas = new Canvas(0, 0);
    const ctx    = canvas.getContext("2d");

    ctx.textBaseline = "top";

    ctx.font = font;

    const tm      = ctx.measureText(trimmed);
    const width   = tm.actualBoundingBoxRight   - tm.actualBoundingBoxLeft   + marginLeft + marginRight;
    const height  = tm.actualBoundingBoxDescent - tm.actualBoundingBoxAscent + marginTop  + marginBottom;
    canvas.width  = width;
    canvas.height = height;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = color;
    ctx.fillText(trimmed, marginLeft, marginTop);

    return new Promise((resolve, reject) => {
        canvas.toBuffer(
            (err, buf) => {
                if (err) {
                    reject(err);
                }
                resolve(buf);
            },
            compressionLevel,
            canvas.PNG_FILTER_NONE
        );
    });
}

function renderToFile(filename, text, style, options) {
    return render(text, style, options)
        .then(buf =>
            new Promise((resolve, reject) => {
                fs.writeFile(filename, buf, err => {
                    if (err) {
                        reject(err);
                    }
                    resolve();
                });
            })
        );
}

module.exports = {
    render,
    renderToFile
};
