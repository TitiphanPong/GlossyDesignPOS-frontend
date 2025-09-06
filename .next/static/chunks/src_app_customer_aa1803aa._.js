(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/src/app/customer/components/checkoutfail.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>__TURBOPACK__default__export__
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_tagged_template_literal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_tagged_template_literal.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$components$2f$dist$2f$styled$2d$components$2e$browser$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-components/dist/styled-components.browser.esm.js [app-client] (ecmascript)");
;
function _templateObject() {
    const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_tagged_template_literal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])([
        "\n  .container {\n    background-color: #e0f7fa; /* Light teal background */\n    display: flex;\n    width: 250px;\n    height: 75px;\n    position: relative;\n    border-radius: 5px;\n    transition:\n      transform 0.3s ease-in-out,\n      box-shadow 0.3s ease-in-out;\n    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);\n  }\n\n  .container:hover {\n    transform: scale(1.03);\n    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);\n  }\n\n  .container:hover .left-side {\n    width: 100%;\n  }\n\n  .left-side {\n    background: linear-gradient(135deg, #26a69a, #4dd0e1); /* Teal gradient */\n    width: 85px;\n    height: 75px;\n    border-radius: 4px 0 0 4px;\n    position: relative;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    cursor: pointer;\n    transition: width 0.3s ease-in-out;\n    flex-shrink: 0;\n    overflow: hidden;\n  }\n\n  .right-side {\n    width: calc(100% - 85px);\n    display: flex;\n    align-items: center;\n    overflow: hidden;\n    cursor: pointer;\n    justify-content: space-between;\n    white-space: nowrap;\n    position: relative;\n    transition: background-color 0.3s ease-in-out;\n  }\n\n  .right-side:hover {\n    background-color: #b2ebf2; /* Lighter teal hover */\n  }\n\n  .right-side::before {\n    content: '';\n    position: absolute;\n    width: 0;\n    height: 0;\n    background: rgba(255, 255, 255, 0.3);\n    border-radius: 50%;\n    top: 50%;\n    left: 50%;\n    transform: translate(-50%, -50%);\n    pointer-events: none;\n    transition:\n      width 0.4s ease-out,\n      height 0.4s ease-out;\n  }\n\n  .right-side:hover::before {\n    width: 200px;\n    height: 200px;\n    opacity: 0;\n  } /* Ripple effect on hover */\n\n  .arrow {\n    width: 14px;\n    height: 14px;\n    margin-right: 12px;\n    transition: transform 0.3s ease-in-out;\n  }\n\n  .right-side:hover .arrow {\n    transform: translateX(5px);\n  } /* Arrow slides right on hover */\n\n  .new {\n    font-size: 15px;\n    font-family: 'Inter', sans-serif;\n    margin-left: 12px;\n    color: #1a3c34;\n    transition: color 0.3s ease-in-out;\n  }\n\n  .right-side:hover .new {\n    color: #00695c; /* Darker teal on hover */\n  }\n\n  .card {\n    width: 48px;\n    height: 30px;\n    background-color: #80deea; /* Light teal */\n    border-radius: 4px;\n    position: absolute;\n    display: flex;\n    z-index: 10;\n    flex-direction: column;\n    align-items: center;\n    box-shadow: 5px 5px 5px -2px rgba(38, 166, 154, 0.4);\n  }\n\n  .card-line {\n    width: 42px;\n    height: 8px;\n    background-color: #b2ebf2; /* Lighter teal */\n    border-radius: 1px;\n    margin-top: 4px;\n  }\n\n  @media only screen and (max-width: 480px) {\n    .container {\n      transform: scale(0.6);\n    }\n\n    .container:hover {\n      transform: scale(0.63);\n    }\n\n    .new {\n      font-size: 13px;\n    }\n  }\n\n  .buttons {\n    width: 5px;\n    height: 5px;\n    background-color: #00796b; /* Dark teal */\n    box-shadow:\n      0 -6px 0 0 #004d40,\n      0 6px 0 0 #26a69a;\n    border-radius: 50%;\n    margin-top: 3px;\n    transform: rotate(90deg);\n    margin: 6px 0 0 -18px;\n  }\n\n  .container:hover .card {\n    animation: slide-top 0.9s cubic-bezier(0.68, -0.55, 0.265, 1.55) both;\n  }\n\n  .container:hover .post {\n    animation: slide-post 0.7s cubic-bezier(0.23, 1, 0.32, 1) both;\n  }\n\n  @keyframes slide-top {\n    0% {\n      transform: translateY(0);\n    }\n    50% {\n      transform: translateY(-45px) rotate(90deg);\n    }\n    60% {\n      transform: translateY(-45px) rotate(90deg);\n    }\n    100% {\n      transform: translateY(-5px) rotate(90deg);\n    }\n  }\n\n  .post {\n    width: 42px;\n    height: 50px;\n    background-color: #f5f5f5;\n    position: absolute;\n    z-index: 11;\n    bottom: 6px;\n    top: 75px;\n    border-radius: 4px;\n    overflow: hidden;\n  }\n\n  .post-line {\n    width: 32px;\n    height: 5px;\n    background-color: #555;\n    position: absolute;\n    border-radius: 0 0 2px 2px;\n    right: 5px;\n    top: 5px;\n  }\n\n  .post-line:before {\n    content: '';\n    position: absolute;\n    width: 32px;\n    height: 5px;\n    background-color: #777;\n    top: -5px;\n  }\n\n  .screen {\n    width: 32px;\n    height: 15px;\n    background-color: #ffffff;\n    position: absolute;\n    top: 14px;\n    right: 5px;\n    border-radius: 2px;\n  }\n\n  .numbers {\n    width: 7px;\n    height: 7px;\n    background-color: #888;\n    box-shadow:\n      0 -11px 0 0 #888,\n      0 11px 0 0 #888;\n    border-radius: 1px;\n    position: absolute;\n    transform: rotate(90deg);\n    left: 17px;\n    top: 34px;\n  }\n\n  .numbers-line2 {\n    width: 7px;\n    height: 7px;\n    background-color: #aaa;\n    box-shadow:\n      0 -11px 0 0 #aaa,\n      0 11px 0 0 #aaa;\n    border-radius: 1px;\n    position: absolute;\n    transform: rotate(90deg);\n    left: 17px;\n    top: 45px;\n  }\n\n  @keyframes slide-post {\n    50% {\n      transform: translateY(0);\n    }\n    100% {\n      transform: translateY(-45px);\n    }\n  }\n\n  .icon {\n    position: absolute;\n    font-size: 11px;\n    font-family: 'Inter', sans-serif;\n    width: 100%;\n    left: 0;\n    top: 0;\n    color: #d32f2f; /* Red for alert */\n    text-align: center;\n    animation: bounce 2s infinite;\n  }\n\n  .container:hover .icon {\n    animation:\n      fade-in-fwd 0.3s 0.7s backwards,\n      bounce 2s infinite;\n  }\n\n  @keyframes fade-in-fwd {\n    0% {\n      opacity: 0;\n      transform: translateY(-3px);\n    }\n    100% {\n      opacity: 1;\n      transform: translateY(0);\n    }\n  }\n\n  @keyframes bounce {\n    0%,\n    100% {\n      transform: translateY(0);\n    }\n    50% {\n      transform: translateY(-2px);\n    }\n  }\n"
    ]);
    _templateObject = function() {
        return data;
    };
    return data;
}
;
;
const CheckOutFail = ()=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StyledWrapper, {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "container",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "left-side",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "card",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "card-line"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/customer/components/checkoutfail.tsx",
                                    lineNumber: 10,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "buttons"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/customer/components/checkoutfail.tsx",
                                    lineNumber: 11,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/customer/components/checkoutfail.tsx",
                            lineNumber: 9,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "post",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "post-line"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/customer/components/checkoutfail.tsx",
                                    lineNumber: 14,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "screen",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "icon",
                                        children: "!"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/customer/components/checkoutfail.tsx",
                                        lineNumber: 16,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/customer/components/checkoutfail.tsx",
                                    lineNumber: 15,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "numbers"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/customer/components/checkoutfail.tsx",
                                    lineNumber: 18,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "numbers-line2"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/customer/components/checkoutfail.tsx",
                                    lineNumber: 19,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/customer/components/checkoutfail.tsx",
                            lineNumber: 13,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/customer/components/checkoutfail.tsx",
                    lineNumber: 8,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "right-side",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "new",
                            children: "New Alert"
                        }, void 0, false, {
                            fileName: "[project]/src/app/customer/components/checkoutfail.tsx",
                            lineNumber: 23,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            className: "arrow",
                            xmlns: "http://www.w3.org/2000/svg",
                            width: 512,
                            height: 512,
                            viewBox: "0 0 451.846 451.847",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                d: "M345.441 248.292L151.154 442.573c-12.359 12.365-32.397 12.365-44.75 0-12.354-12.354-12.354-32.391 0-44.744L278.318 225.92 106.409 54.017c-12.354-12.359-12.354-32.394 0-44.748 12.354-12.359 32.391-12.359 44.75 0l194.287 194.284c6.177 6.18 9.262 14.271 9.262 22.366 0 8.099-3.091 16.196-9.267 22.373z",
                                className: "active-path",
                                fill: "#e0f7fa"
                            }, void 0, false, {
                                fileName: "[project]/src/app/customer/components/checkoutfail.tsx",
                                lineNumber: 30,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        }, void 0, false, {
                            fileName: "[project]/src/app/customer/components/checkoutfail.tsx",
                            lineNumber: 24,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/customer/components/checkoutfail.tsx",
                    lineNumber: 22,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/customer/components/checkoutfail.tsx",
            lineNumber: 7,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/src/app/customer/components/checkoutfail.tsx",
        lineNumber: 6,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_c = CheckOutFail;
const StyledWrapper = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$components$2f$dist$2f$styled$2d$components$2e$browser$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].div(_templateObject());
_c1 = StyledWrapper;
const __TURBOPACK__default__export__ = CheckOutFail;
var _c, _c1;
__turbopack_context__.k.register(_c, "CheckOutFail");
__turbopack_context__.k.register(_c1, "StyledWrapper");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/customer/page.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>CustomerScreen
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Box/Box.js [app-client] (ecmascript) <export default as Box>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Typography/Typography.js [app-client] (ecmascript) <export default as Typography>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Card$2f$Card$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Card/Card.js [app-client] (ecmascript) <export default as Card>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$CardContent$2f$CardContent$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CardContent$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/CardContent/CardContent.js [app-client] (ecmascript) <export default as CardContent>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Divider$2f$Divider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Divider$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Divider/Divider.js [app-client] (ecmascript) <export default as Divider>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$List$2f$List$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__List$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/List/List.js [app-client] (ecmascript) <export default as List>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$ListItem$2f$ListItem$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ListItem$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/ListItem/ListItem.js [app-client] (ecmascript) <export default as ListItem>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$ListItemText$2f$ListItemText$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ListItemText$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/ListItemText/ListItemText.js [app-client] (ecmascript) <export default as ListItemText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$qrcode$2e$react$2f$lib$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/qrcode.react/lib/esm/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$promptpay$2d$qr$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/promptpay-qr/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$swiper$2f$swiper$2d$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/swiper/swiper-react.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$swiper$2f$modules$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/swiper/modules/index.mjs [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$swiper$2f$modules$2f$autoplay$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Autoplay$3e$__ = __turbopack_context__.i("[project]/node_modules/swiper/modules/autoplay.mjs [app-client] (ecmascript) <export default as Autoplay>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$customer$2f$components$2f$checkoutfail$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/customer/components/checkoutfail.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
;
function CustomerScreen() {
    var _order_cart;
    _s();
    const [order, setOrder] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const promptpayId = ("TURBOPACK compile-time value", "0625624598") || '0625624598';
    // โหลดจาก localStorage + subscribe event
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CustomerScreen.useEffect": ()=>{
            const handleStorage = {
                "CustomerScreen.useEffect.handleStorage": ()=>{
                    const str = localStorage.getItem('pendingOrder');
                    if (str) {
                        setOrder(JSON.parse(str));
                    } else {
                        setOrder(null);
                    }
                }
            }["CustomerScreen.useEffect.handleStorage"];
            handleStorage();
            window.addEventListener('storage', handleStorage);
            const interval = setInterval(handleStorage, 500);
            return ({
                "CustomerScreen.useEffect": ()=>{
                    window.removeEventListener('storage', handleStorage);
                    clearInterval(interval);
                }
            })["CustomerScreen.useEffect"];
        }
    }["CustomerScreen.useEffect"], []);
    // 👉 ลบ order ออกหลังจากจ่ายเสร็จ 5 วิ
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CustomerScreen.useEffect": ()=>{
            if ((order === null || order === void 0 ? void 0 : order.status) === 'paid') {
                const timer = setTimeout({
                    "CustomerScreen.useEffect.timer": ()=>{
                        localStorage.removeItem('pendingOrder');
                        setOrder(null);
                    }
                }["CustomerScreen.useEffect.timer"], 5000);
                return ({
                    "CustomerScreen.useEffect": ()=>clearTimeout(timer)
                })["CustomerScreen.useEffect"];
            }
        }
    }["CustomerScreen.useEffect"], [
        order
    ]);
    // 👉 State 1: Banner
    if (!order) {
        const banners = [
            {
                title: 'Heat Transfer เสื้อ',
                img: '/banners/Banner1.jpg'
            },
            {
                title: 'Heat Transfer สีสด',
                img: '/banners/Banner2.jpg'
            },
            {
                title: 'สติ๊กเกอร์ งานด่วน',
                img: '/banners/Banner3.jpg'
            },
            {
                title: 'โปสเตอร์ ป้าย โฆษณา',
                img: '/banners/Banner4.jpg'
            },
            {
                title: 'แบบเขียนแบบ ออกแบบพิมพ์',
                img: '/banners/Banner5.jpg'
            },
            {
                title: 'งานพิมพ์คุณภาพสูง',
                img: '/banners/Banner6.jpg'
            },
            {
                title: 'Glossy Design โปรโมชัน',
                img: '/banners/Banner7.jpg'
            },
            {
                title: 'งานสติ๊กเกอร์ครบวงจร',
                img: '/banners/Banner8.jpg'
            },
            {
                title: 'บริการออกแบบฟรี',
                img: '/banners/Banner9.jpg'
            },
            {
                title: 'งานสติ๊กเกอร์สินค้า',
                img: '/banners/Banner10.jpg'
            },
            {
                title: 'สติ๊กเกอร์ราคาพิเศษ',
                img: '/banners/Banner11.jpg'
            },
            {
                title: 'งานด่วนรอรับได้',
                img: '/banners/Banner12.jpg'
            },
            {
                title: 'สติ๊กเกอร์พรีเมียม',
                img: '/banners/Banner13.jpg'
            },
            {
                title: 'พิมพ์เสื้อสีสดใส',
                img: '/banners/Banner14.jpg'
            }
        ];
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
            sx: {
                width: '100%',
                height: '100vh',
                bgcolor: '#000'
            },
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$swiper$2f$swiper$2d$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Swiper"], {
                modules: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$swiper$2f$modules$2f$autoplay$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Autoplay$3e$__["Autoplay"]
                ],
                autoplay: {
                    delay: 5000
                },
                loop: true,
                style: {
                    width: '100%',
                    height: '100%'
                },
                children: banners.map((item, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$swiper$2f$swiper$2d$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SwiperSlide"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                            sx: {
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                background: "url(".concat(item.img, ") center/cover no-repeat"),
                                color: '#fff',
                                textShadow: '0 2px 6px rgba(0,0,0,0.7)'
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                variant: "h3",
                                fontWeight: "bold",
                                children: item.title
                            }, void 0, false, {
                                fileName: "[project]/src/app/customer/page.tsx",
                                lineNumber: 110,
                                columnNumber: 17
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/customer/page.tsx",
                            lineNumber: 98,
                            columnNumber: 15
                        }, this)
                    }, idx, false, {
                        fileName: "[project]/src/app/customer/page.tsx",
                        lineNumber: 97,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/app/customer/page.tsx",
                lineNumber: 90,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/customer/page.tsx",
            lineNumber: 89,
            columnNumber: 7
        }, this);
    }
    var _order_grandTotal;
    const total = Math.max((_order_grandTotal = order.grandTotal) !== null && _order_grandTotal !== void 0 ? _order_grandTotal : order.total, 0);
    // 👉 State 3: Paid
    if (order.status === 'paid') {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
            sx: {
                width: '100%',
                height: '100vh',
                bgcolor: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                color: '#fff'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$customer$2f$components$2f$checkoutfail$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                    fileName: "[project]/src/app/customer/page.tsx",
                    lineNumber: 138,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: {
                        scale: 0.5,
                        opacity: 0
                    },
                    animate: {
                        scale: 1.2,
                        opacity: 1
                    },
                    transition: {
                        duration: 0.6
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                        variant: "h3",
                        color: "success.main",
                        fontWeight: "bold",
                        children: "✅ ชำระเงินเรียบร้อย"
                    }, void 0, false, {
                        fileName: "[project]/src/app/customer/page.tsx",
                        lineNumber: 144,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/customer/page.tsx",
                    lineNumber: 139,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                    variant: "h6",
                    mt: 2,
                    children: "ขอบคุณที่ใช้บริการ Glossy Design"
                }, void 0, false, {
                    fileName: "[project]/src/app/customer/page.tsx",
                    lineNumber: 148,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                    variant: "body2",
                    color: "text.secondary",
                    mt: 1,
                    children: "หน้าจอจะกลับไปโฆษณาภายใน 5 วินาที..."
                }, void 0, false, {
                    fileName: "[project]/src/app/customer/page.tsx",
                    lineNumber: 151,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/customer/page.tsx",
            lineNumber: 126,
            columnNumber: 7
        }, this);
    }
    // 👉 State 2: Pending
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
        sx: {
            maxWidth: 700,
            mx: 'auto',
            p: 4
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                variant: "h4",
                fontWeight: "bold",
                gutterBottom: true,
                children: [
                    "🧾 ใบสั่งซื้อ #",
                    order.orderId
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/customer/page.tsx",
                lineNumber: 161,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Card$2f$Card$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
                sx: {
                    mb: 3
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$CardContent$2f$CardContent$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CardContent$3e$__["CardContent"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                            variant: "subtitle1",
                            children: [
                                "ลูกค้า: ",
                                order.customerName || '-'
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/customer/page.tsx",
                            lineNumber: 166,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                            variant: "subtitle2",
                            color: "text.secondary",
                            children: [
                                "บริษัท: ",
                                order.companyName || '-'
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/customer/page.tsx",
                            lineNumber: 169,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Divider$2f$Divider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Divider$3e$__["Divider"], {
                            sx: {
                                my: 2
                            }
                        }, void 0, false, {
                            fileName: "[project]/src/app/customer/page.tsx",
                            lineNumber: 172,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$List$2f$List$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__List$3e$__["List"], {
                            children: (_order_cart = order.cart) === null || _order_cart === void 0 ? void 0 : _order_cart.map((item, idx)=>{
                                var _item_extra;
                                var _item_extra_qty;
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$ListItem$2f$ListItem$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ListItem$3e$__["ListItem"], {
                                    disableGutters: true,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$ListItemText$2f$ListItemText$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ListItemText$3e$__["ListItemText"], {
                                        primary: "".concat(item.name, " x").concat((_item_extra_qty = (_item_extra = item.extra) === null || _item_extra === void 0 ? void 0 : _item_extra.qty) !== null && _item_extra_qty !== void 0 ? _item_extra_qty : 1),
                                        secondary: "฿".concat(item.totalPrice.toLocaleString('th-TH'))
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/customer/page.tsx",
                                        lineNumber: 176,
                                        columnNumber: 17
                                    }, this)
                                }, idx, false, {
                                    fileName: "[project]/src/app/customer/page.tsx",
                                    lineNumber: 175,
                                    columnNumber: 15
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/src/app/customer/page.tsx",
                            lineNumber: 173,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Divider$2f$Divider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Divider$3e$__["Divider"], {
                            sx: {
                                my: 2
                            }
                        }, void 0, false, {
                            fileName: "[project]/src/app/customer/page.tsx",
                            lineNumber: 183,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                            variant: "h5",
                            textAlign: "right",
                            children: [
                                "รวมสุทธิ: ฿",
                                total.toLocaleString('th-TH')
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/customer/page.tsx",
                            lineNumber: 184,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/customer/page.tsx",
                    lineNumber: 165,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/customer/page.tsx",
                lineNumber: 164,
                columnNumber: 7
            }, this),
            order.payment === 'promptpay' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                textAlign: "center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                        variant: "h6",
                        gutterBottom: true,
                        children: "📱 สแกนเพื่อชำระเงิน"
                    }, void 0, false, {
                        fileName: "[project]/src/app/customer/page.tsx",
                        lineNumber: 192,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$qrcode$2e$react$2f$lib$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["QRCodeCanvas"], {
                        value: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$promptpay$2d$qr$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(promptpayId, {
                            amount: total
                        }),
                        size: 240,
                        includeMargin: true
                    }, void 0, false, {
                        fileName: "[project]/src/app/customer/page.tsx",
                        lineNumber: 195,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/customer/page.tsx",
                lineNumber: 191,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                variant: "h5",
                textAlign: "center",
                color: "success.main",
                children: "💵 ชำระด้วยเงินสด"
            }, void 0, false, {
                fileName: "[project]/src/app/customer/page.tsx",
                lineNumber: 202,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/customer/page.tsx",
        lineNumber: 160,
        columnNumber: 5
    }, this);
}
_s(CustomerScreen, "EDdhmalKExBOaAMOyDbTSJTbq2Q=");
_c = CustomerScreen;
var _c;
__turbopack_context__.k.register(_c, "CustomerScreen");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=src_app_customer_aa1803aa._.js.map