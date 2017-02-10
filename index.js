"use strict";

const fs = require("fs");

const Canvas = require("canvas");

function trim(text) {
    return text.replace(/^[\s\u3000]+/, "")
        .replace(/[\s\u3000]+$/, "");
}

function render(text, style, options) {
    const trimmed = trim(text);

    style        = style || {};
    style.margin = style.margin || {};
    const font            = style.font || "_serif";
    const color           = style.color || "#000000";
    const backgroundColor = style.backgroundColor || "#FFFFFF";
    const marginTop       = style.margin.top    || 0;
    const marginBottom    = style.margin.bottom || 0;
    const marginLeft      = style.margin.left   || 0;
    const marginRight     = style.margin.right  || 0;

    options = options || {};
    const compressionLevel = options.compressionLevel || 0;

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
