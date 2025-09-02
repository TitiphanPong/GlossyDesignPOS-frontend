(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([
  typeof document === 'object' ? document.currentScript : undefined,
  {
    '[project]/src/lib/api.ts [app-client] (ecmascript)': (__turbopack_context__) => {
      'use strict';

      var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
      {
        __turbopack_context__.s({
          API_BASE: () => API_BASE,
          api: () => api,
        });
        var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ =
          /*#__PURE__*/ __turbopack_context__.i(
            '[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)'
          );
        const API_BASE = ('TURBOPACK compile-time value', 'http://localhost:3001');
        async function api(path, init) {
          const res = await fetch(''.concat(API_BASE).concat(path), init);
          if (!res.ok) throw new Error(await res.text());
          return res.json();
        }
        if (
          typeof globalThis.$RefreshHelpers$ === 'object' &&
          globalThis.$RefreshHelpers !== null
        ) {
          __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
        }
      }
    },
    '[project]/src/app/pos/page.tsx [app-client] (ecmascript)': (__turbopack_context__) => {
      'use strict';

      var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
      {
        __turbopack_context__.s({
          default: () => PosPage,
        });
        var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ =
          __turbopack_context__.i(
            '[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)'
          );
        var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ =
          __turbopack_context__.i(
            '[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)'
          );
        var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ =
          __turbopack_context__.i('[project]/src/lib/api.ts [app-client] (ecmascript)');
        var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ =
          __turbopack_context__.i(
            '[project]/node_modules/next/navigation.js [app-client] (ecmascript)'
          );
        var _s = __turbopack_context__.k.signature();
        ('use client');
        function PosPage() {
          _s();
          const [pages, setPages] = (0,
          __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__[
            'useState'
          ])(1);
          const [qty, setQty] = (0,
          __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__[
            'useState'
          ])(1);
          const [grayscale, setGrayscale] = (0,
          __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__[
            'useState'
          ])(false);
          const router = (0,
          __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__[
            'useRouter'
          ])();
          const [subtotal, setSubtotal] = (0,
          __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__[
            'useState'
          ])(null);
          const calc = async () => {
            const data = await (0,
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__[
              'api'
            ])('/pricing/evaluate', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                pages,
                duplex: false,
                grayscale,
                qty,
              }),
            });
            setSubtotal(data.subtotal);
          };
          const goPay = async () => {
            const amount = subtotal || 0;
            const orderId = 'ORD-' + Date.now();
            router.push('/pay?ref='.concat(orderId, '&amount=').concat(amount));
          };
          return /*#__PURE__*/ (0,
          __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__[
            'jsxDEV'
          ])(
            'div',
            {
              className: 'max-w-xl mx-auto p-6 space-y-4',
              children: [
                /*#__PURE__*/ (0,
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__[
                  'jsxDEV'
                ])(
                  'h1',
                  {
                    className: 'text-2xl font-semibold',
                    children: 'POS — ตัวอย่างคำนวณราคา',
                  },
                  void 0,
                  false,
                  {
                    fileName: '[project]/src/app/pos/page.tsx',
                    lineNumber: 34,
                    columnNumber: 7,
                  },
                  this
                ),
                /*#__PURE__*/ (0,
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__[
                  'jsxDEV'
                ])(
                  'label',
                  {
                    className: 'block',
                    children: [
                      'จำนวนหน้า: ',
                      /*#__PURE__*/ (0,
                      __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__[
                        'jsxDEV'
                      ])(
                        'input',
                        {
                          type: 'number',
                          min: 1,
                          value: pages,
                          onChange: (e) => setPages(+e.target.value),
                          className: 'border px-2 py-1 ml-2 w-24',
                        },
                        void 0,
                        false,
                        {
                          fileName: '[project]/src/app/pos/page.tsx',
                          lineNumber: 35,
                          columnNumber: 43,
                        },
                        this
                      ),
                    ],
                  },
                  void 0,
                  true,
                  {
                    fileName: '[project]/src/app/pos/page.tsx',
                    lineNumber: 35,
                    columnNumber: 7,
                  },
                  this
                ),
                /*#__PURE__*/ (0,
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__[
                  'jsxDEV'
                ])(
                  'label',
                  {
                    className: 'block',
                    children: [
                      'จำนวนชุด: ',
                      /*#__PURE__*/ (0,
                      __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__[
                        'jsxDEV'
                      ])(
                        'input',
                        {
                          type: 'number',
                          min: 1,
                          value: qty,
                          onChange: (e) => setQty(+e.target.value),
                          className: 'border px-2 py-1 ml-2 w-24',
                        },
                        void 0,
                        false,
                        {
                          fileName: '[project]/src/app/pos/page.tsx',
                          lineNumber: 36,
                          columnNumber: 42,
                        },
                        this
                      ),
                    ],
                  },
                  void 0,
                  true,
                  {
                    fileName: '[project]/src/app/pos/page.tsx',
                    lineNumber: 36,
                    columnNumber: 7,
                  },
                  this
                ),
                /*#__PURE__*/ (0,
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__[
                  'jsxDEV'
                ])(
                  'label',
                  {
                    className: 'flex items-center gap-2',
                    children: [
                      /*#__PURE__*/ (0,
                      __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__[
                        'jsxDEV'
                      ])(
                        'input',
                        {
                          type: 'checkbox',
                          checked: grayscale,
                          onChange: (e) => setGrayscale(e.target.checked),
                        },
                        void 0,
                        false,
                        {
                          fileName: '[project]/src/app/pos/page.tsx',
                          lineNumber: 37,
                          columnNumber: 50,
                        },
                        this
                      ),
                      ' ขาวดำ',
                    ],
                  },
                  void 0,
                  true,
                  {
                    fileName: '[project]/src/app/pos/page.tsx',
                    lineNumber: 37,
                    columnNumber: 7,
                  },
                  this
                ),
                /*#__PURE__*/ (0,
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__[
                  'jsxDEV'
                ])(
                  'div',
                  {
                    className: 'flex gap-3',
                    children: [
                      /*#__PURE__*/ (0,
                      __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__[
                        'jsxDEV'
                      ])(
                        'button',
                        {
                          onClick: calc,
                          className: 'px-4 py-2 rounded bg-black text-white',
                          children: 'คำนวณ',
                        },
                        void 0,
                        false,
                        {
                          fileName: '[project]/src/app/pos/page.tsx',
                          lineNumber: 40,
                          columnNumber: 9,
                        },
                        this
                      ),
                      subtotal !== null &&
                        /*#__PURE__*/ (0,
                        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__[
                          'jsxDEV'
                        ])(
                          'div',
                          {
                            className: 'px-3 py-2 border rounded',
                            children: ['ยอดชำระ: ', subtotal.toFixed(2), ' THB'],
                          },
                          void 0,
                          true,
                          {
                            fileName: '[project]/src/app/pos/page.tsx',
                            lineNumber: 41,
                            columnNumber: 31,
                          },
                          this
                        ),
                    ],
                  },
                  void 0,
                  true,
                  {
                    fileName: '[project]/src/app/pos/page.tsx',
                    lineNumber: 39,
                    columnNumber: 7,
                  },
                  this
                ),
                /*#__PURE__*/ (0,
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__[
                  'jsxDEV'
                ])(
                  'button',
                  {
                    disabled: !subtotal,
                    onClick: goPay,
                    className: 'px-4 py-2 rounded bg-emerald-600 text-white disabled:opacity-50',
                    children: 'ไปหน้าชำระเงิน',
                  },
                  void 0,
                  false,
                  {
                    fileName: '[project]/src/app/pos/page.tsx',
                    lineNumber: 44,
                    columnNumber: 7,
                  },
                  this
                ),
              ],
            },
            void 0,
            true,
            {
              fileName: '[project]/src/app/pos/page.tsx',
              lineNumber: 33,
              columnNumber: 5,
            },
            this
          );
        }
        _s(PosPage, 'BH4hvMieMDSTJqKhOta0HhNJMXk=', false, function () {
          return [
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__[
              'useRouter'
            ],
          ];
        });
        _c = PosPage;
        var _c;
        __turbopack_context__.k.register(_c, 'PosPage');
        if (
          typeof globalThis.$RefreshHelpers$ === 'object' &&
          globalThis.$RefreshHelpers !== null
        ) {
          __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
        }
      }
    },
    '[project]/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)':
      (__turbopack_context__) => {
        'use strict';

        var { m: module, e: exports } = __turbopack_context__;
        {
          /**
           * @license React
           * react-jsx-dev-runtime.development.js
           *
           * Copyright (c) Meta Platforms, Inc. and affiliates.
           *
           * This source code is licensed under the MIT license found in the
           * LICENSE file in the root directory of this source tree.
           */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ =
            /*#__PURE__*/ __turbopack_context__.i(
              '[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)'
            );
          ('use strict');
          'production' !== ('TURBOPACK compile-time value', 'development') &&
            (function () {
              function getComponentNameFromType(type) {
                if (null == type) return null;
                if ('function' === typeof type)
                  return type.$$typeof === REACT_CLIENT_REFERENCE
                    ? null
                    : type.displayName || type.name || null;
                if ('string' === typeof type) return type;
                switch (type) {
                  case REACT_FRAGMENT_TYPE:
                    return 'Fragment';
                  case REACT_PROFILER_TYPE:
                    return 'Profiler';
                  case REACT_STRICT_MODE_TYPE:
                    return 'StrictMode';
                  case REACT_SUSPENSE_TYPE:
                    return 'Suspense';
                  case REACT_SUSPENSE_LIST_TYPE:
                    return 'SuspenseList';
                  case REACT_ACTIVITY_TYPE:
                    return 'Activity';
                }
                if ('object' === typeof type)
                  switch (
                    ('number' === typeof type.tag &&
                      console.error(
                        'Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue.'
                      ),
                    type.$$typeof)
                  ) {
                    case REACT_PORTAL_TYPE:
                      return 'Portal';
                    case REACT_CONTEXT_TYPE:
                      return type.displayName || 'Context';
                    case REACT_CONSUMER_TYPE:
                      return (type._context.displayName || 'Context') + '.Consumer';
                    case REACT_FORWARD_REF_TYPE:
                      var innerType = type.render;
                      type = type.displayName;
                      type ||
                        ((type = innerType.displayName || innerType.name || ''),
                        (type = '' !== type ? 'ForwardRef(' + type + ')' : 'ForwardRef'));
                      return type;
                    case REACT_MEMO_TYPE:
                      return (
                        (innerType = type.displayName || null),
                        null !== innerType
                          ? innerType
                          : getComponentNameFromType(type.type) || 'Memo'
                      );
                    case REACT_LAZY_TYPE:
                      innerType = type._payload;
                      type = type._init;
                      try {
                        return getComponentNameFromType(type(innerType));
                      } catch (x) {}
                  }
                return null;
              }
              function testStringCoercion(value) {
                return '' + value;
              }
              function checkKeyStringCoercion(value) {
                try {
                  testStringCoercion(value);
                  var JSCompiler_inline_result = !1;
                } catch (e) {
                  JSCompiler_inline_result = !0;
                }
                if (JSCompiler_inline_result) {
                  JSCompiler_inline_result = console;
                  var JSCompiler_temp_const = JSCompiler_inline_result.error;
                  var JSCompiler_inline_result$jscomp$0 =
                    ('function' === typeof Symbol &&
                      Symbol.toStringTag &&
                      value[Symbol.toStringTag]) ||
                    value.constructor.name ||
                    'Object';
                  JSCompiler_temp_const.call(
                    JSCompiler_inline_result,
                    'The provided key is an unsupported type %s. This value must be coerced to a string before using it here.',
                    JSCompiler_inline_result$jscomp$0
                  );
                  return testStringCoercion(value);
                }
              }
              function getTaskName(type) {
                if (type === REACT_FRAGMENT_TYPE) return '<>';
                if ('object' === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE)
                  return '<...>';
                try {
                  var name = getComponentNameFromType(type);
                  return name ? '<' + name + '>' : '<...>';
                } catch (x) {
                  return '<...>';
                }
              }
              function getOwner() {
                var dispatcher = ReactSharedInternals.A;
                return null === dispatcher ? null : dispatcher.getOwner();
              }
              function UnknownOwner() {
                return Error('react-stack-top-frame');
              }
              function hasValidKey(config) {
                if (hasOwnProperty.call(config, 'key')) {
                  var getter = Object.getOwnPropertyDescriptor(config, 'key').get;
                  if (getter && getter.isReactWarning) return !1;
                }
                return void 0 !== config.key;
              }
              function defineKeyPropWarningGetter(props, displayName) {
                function warnAboutAccessingKey() {
                  specialPropKeyWarningShown ||
                    ((specialPropKeyWarningShown = !0),
                    console.error(
                      '%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)',
                      displayName
                    ));
                }
                warnAboutAccessingKey.isReactWarning = !0;
                Object.defineProperty(props, 'key', {
                  get: warnAboutAccessingKey,
                  configurable: !0,
                });
              }
              function elementRefGetterWithDeprecationWarning() {
                var componentName = getComponentNameFromType(this.type);
                didWarnAboutElementRef[componentName] ||
                  ((didWarnAboutElementRef[componentName] = !0),
                  console.error(
                    'Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release.'
                  ));
                componentName = this.props.ref;
                return void 0 !== componentName ? componentName : null;
              }
              function ReactElement(type, key, self, source, owner, props, debugStack, debugTask) {
                self = props.ref;
                type = {
                  $$typeof: REACT_ELEMENT_TYPE,
                  type: type,
                  key: key,
                  props: props,
                  _owner: owner,
                };
                null !== (void 0 !== self ? self : null)
                  ? Object.defineProperty(type, 'ref', {
                      enumerable: !1,
                      get: elementRefGetterWithDeprecationWarning,
                    })
                  : Object.defineProperty(type, 'ref', {
                      enumerable: !1,
                      value: null,
                    });
                type._store = {};
                Object.defineProperty(type._store, 'validated', {
                  configurable: !1,
                  enumerable: !1,
                  writable: !0,
                  value: 0,
                });
                Object.defineProperty(type, '_debugInfo', {
                  configurable: !1,
                  enumerable: !1,
                  writable: !0,
                  value: null,
                });
                Object.defineProperty(type, '_debugStack', {
                  configurable: !1,
                  enumerable: !1,
                  writable: !0,
                  value: debugStack,
                });
                Object.defineProperty(type, '_debugTask', {
                  configurable: !1,
                  enumerable: !1,
                  writable: !0,
                  value: debugTask,
                });
                Object.freeze && (Object.freeze(type.props), Object.freeze(type));
                return type;
              }
              function jsxDEVImpl(
                type,
                config,
                maybeKey,
                isStaticChildren,
                source,
                self,
                debugStack,
                debugTask
              ) {
                var children = config.children;
                if (void 0 !== children)
                  if (isStaticChildren)
                    if (isArrayImpl(children)) {
                      for (
                        isStaticChildren = 0;
                        isStaticChildren < children.length;
                        isStaticChildren++
                      )
                        validateChildKeys(children[isStaticChildren]);
                      Object.freeze && Object.freeze(children);
                    } else
                      console.error(
                        'React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.'
                      );
                  else validateChildKeys(children);
                if (hasOwnProperty.call(config, 'key')) {
                  children = getComponentNameFromType(type);
                  var keys = Object.keys(config).filter(function (k) {
                    return 'key' !== k;
                  });
                  isStaticChildren =
                    0 < keys.length
                      ? '{key: someKey, ' + keys.join(': ..., ') + ': ...}'
                      : '{key: someKey}';
                  didWarnAboutKeySpread[children + isStaticChildren] ||
                    ((keys = 0 < keys.length ? '{' + keys.join(': ..., ') + ': ...}' : '{}'),
                    console.error(
                      'A props object containing a "key" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />',
                      isStaticChildren,
                      children,
                      keys,
                      children
                    ),
                    (didWarnAboutKeySpread[children + isStaticChildren] = !0));
                }
                children = null;
                void 0 !== maybeKey &&
                  (checkKeyStringCoercion(maybeKey), (children = '' + maybeKey));
                hasValidKey(config) &&
                  (checkKeyStringCoercion(config.key), (children = '' + config.key));
                if ('key' in config) {
                  maybeKey = {};
                  for (var propName in config)
                    'key' !== propName && (maybeKey[propName] = config[propName]);
                } else maybeKey = config;
                children &&
                  defineKeyPropWarningGetter(
                    maybeKey,
                    'function' === typeof type ? type.displayName || type.name || 'Unknown' : type
                  );
                return ReactElement(
                  type,
                  children,
                  self,
                  source,
                  getOwner(),
                  maybeKey,
                  debugStack,
                  debugTask
                );
              }
              function validateChildKeys(node) {
                'object' === typeof node &&
                  null !== node &&
                  node.$$typeof === REACT_ELEMENT_TYPE &&
                  node._store &&
                  (node._store.validated = 1);
              }
              var React = __turbopack_context__.r(
                  '[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)'
                ),
                REACT_ELEMENT_TYPE = Symbol.for('react.transitional.element'),
                REACT_PORTAL_TYPE = Symbol.for('react.portal'),
                REACT_FRAGMENT_TYPE = Symbol.for('react.fragment'),
                REACT_STRICT_MODE_TYPE = Symbol.for('react.strict_mode'),
                REACT_PROFILER_TYPE = Symbol.for('react.profiler'),
                REACT_CONSUMER_TYPE = Symbol.for('react.consumer'),
                REACT_CONTEXT_TYPE = Symbol.for('react.context'),
                REACT_FORWARD_REF_TYPE = Symbol.for('react.forward_ref'),
                REACT_SUSPENSE_TYPE = Symbol.for('react.suspense'),
                REACT_SUSPENSE_LIST_TYPE = Symbol.for('react.suspense_list'),
                REACT_MEMO_TYPE = Symbol.for('react.memo'),
                REACT_LAZY_TYPE = Symbol.for('react.lazy'),
                REACT_ACTIVITY_TYPE = Symbol.for('react.activity'),
                REACT_CLIENT_REFERENCE = Symbol.for('react.client.reference'),
                ReactSharedInternals =
                  React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
                hasOwnProperty = Object.prototype.hasOwnProperty,
                isArrayImpl = Array.isArray,
                createTask = console.createTask
                  ? console.createTask
                  : function () {
                      return null;
                    };
              React = {
                react_stack_bottom_frame: function (callStackForError) {
                  return callStackForError();
                },
              };
              var specialPropKeyWarningShown;
              var didWarnAboutElementRef = {};
              var unknownOwnerDebugStack = React.react_stack_bottom_frame.bind(
                React,
                UnknownOwner
              )();
              var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
              var didWarnAboutKeySpread = {};
              exports.Fragment = REACT_FRAGMENT_TYPE;
              exports.jsxDEV = function (type, config, maybeKey, isStaticChildren, source, self) {
                var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
                return jsxDEVImpl(
                  type,
                  config,
                  maybeKey,
                  isStaticChildren,
                  source,
                  self,
                  trackActualOwner ? Error('react-stack-top-frame') : unknownOwnerDebugStack,
                  trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask
                );
              };
            })();
        }
      },
    '[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)':
      (__turbopack_context__) => {
        'use strict';

        var { m: module, e: exports } = __turbopack_context__;
        {
          var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ =
            /*#__PURE__*/ __turbopack_context__.i(
              '[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)'
            );
          ('use strict');
          if (('TURBOPACK compile-time falsy', 0));
          else {
            //TURBOPACK unreachable
            module.exports = __turbopack_context__.r(
              '[project]/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)'
            );
          }
        }
      },
    '[project]/node_modules/next/navigation.js [app-client] (ecmascript)': (
      __turbopack_context__
    ) => {
      var { m: module, e: exports } = __turbopack_context__;
      {
        module.exports = __turbopack_context__.r(
          '[project]/node_modules/next/dist/client/components/navigation.js [app-client] (ecmascript)'
        );
      }
    },
  },
]);

//# sourceMappingURL=_d489bc22._.js.map
