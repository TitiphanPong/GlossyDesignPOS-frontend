(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([
  typeof document === 'object' ? document.currentScript : undefined,
  {
    '[project]/src/app/home/page.tsx [app-client] (ecmascript)': (__turbopack_context__) => {
      'use strict';

      var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
      {
        __turbopack_context__.s({
          default: () => Page,
        });
        var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ =
          __turbopack_context__.i(
            '[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)'
          );
        var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__ =
          __turbopack_context__.i(
            '[project]/node_modules/@mui/material/esm/Box/Box.js [app-client] (ecmascript) <export default as Box>'
          );
        ('use client');
        function Page() {
          return /*#__PURE__*/ (0,
          __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__[
            'jsxDEV'
          ])(
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__[
              'Box'
            ],
            {
              children: 'SSS',
            },
            void 0,
            false,
            {
              fileName: '[project]/src/app/home/page.tsx',
              lineNumber: 8,
              columnNumber: 5,
            },
            this
          );
        }
        _c = Page;
        var _c;
        __turbopack_context__.k.register(_c, 'Page');
        if (
          typeof globalThis.$RefreshHelpers$ === 'object' &&
          globalThis.$RefreshHelpers !== null
        ) {
          __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
        }
      }
    },
    '[project]/node_modules/@mui/system/esm/createBox/createBox.js [app-client] (ecmascript)': (
      __turbopack_context__
    ) => {
      'use strict';

      __turbopack_context__.s({
        default: () => createBox,
      });
      var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ =
        __turbopack_context__.i(
          '[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)'
        );
      var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ =
        __turbopack_context__.i(
          '[project]/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)'
        );
      var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$styled$2d$engine$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ =
        __turbopack_context__.i(
          '[project]/node_modules/@mui/styled-engine/esm/index.js [app-client] (ecmascript) <locals>'
        );
      var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$system$2f$esm$2f$styleFunctionSx$2f$styleFunctionSx$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ =
        __turbopack_context__.i(
          '[project]/node_modules/@mui/system/esm/styleFunctionSx/styleFunctionSx.js [app-client] (ecmascript)'
        );
      var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$system$2f$esm$2f$styleFunctionSx$2f$extendSxProp$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__extendSxProp$3e$__ =
        __turbopack_context__.i(
          '[project]/node_modules/@mui/system/esm/styleFunctionSx/extendSxProp.js [app-client] (ecmascript) <export default as extendSxProp>'
        );
      var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$system$2f$esm$2f$useTheme$2f$useTheme$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ =
        __turbopack_context__.i(
          '[project]/node_modules/@mui/system/esm/useTheme/useTheme.js [app-client] (ecmascript)'
        );
      var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ =
        __turbopack_context__.i(
          '[project]/node_modules/next/dist/compiled/react/jsx-runtime.js [app-client] (ecmascript)'
        );
      ('use client');
      function createBox() {
        let options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
        const {
          themeId,
          defaultTheme,
          defaultClassName = 'MuiBox-root',
          generateClassName,
        } = options;
        const BoxRoot = (0,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$styled$2d$engine$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__[
          'default'
        ])('div', {
          shouldForwardProp: (prop) => prop !== 'theme' && prop !== 'sx' && prop !== 'as',
        })(
          __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$system$2f$esm$2f$styleFunctionSx$2f$styleFunctionSx$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__[
            'default'
          ]
        );
        const Box =
          /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__[
            'forwardRef'
          ](function Box(inProps, ref) {
            const theme = (0,
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$system$2f$esm$2f$useTheme$2f$useTheme$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__[
              'default'
            ])(defaultTheme);
            const {
              className,
              component = 'div',
              ...other
            } = (0,
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$system$2f$esm$2f$styleFunctionSx$2f$extendSxProp$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__extendSxProp$3e$__[
              'extendSxProp'
            ])(inProps);
            return /*#__PURE__*/ (0,
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__[
              'jsx'
            ])(BoxRoot, {
              as: component,
              ref: ref,
              className: (0,
              __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__[
                'default'
              ])(
                className,
                generateClassName ? generateClassName(defaultClassName) : defaultClassName
              ),
              theme: themeId ? theme[themeId] || theme : theme,
              ...other,
            });
          });
        return Box;
      }
    },
    '[project]/node_modules/@mui/system/esm/createBox/createBox.js [app-client] (ecmascript) <export default as createBox>':
      (__turbopack_context__) => {
        'use strict';

        __turbopack_context__.s({
          createBox: () =>
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$system$2f$esm$2f$createBox$2f$createBox$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__[
              'default'
            ],
        });
        var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$system$2f$esm$2f$createBox$2f$createBox$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ =
          __turbopack_context__.i(
            '[project]/node_modules/@mui/system/esm/createBox/createBox.js [app-client] (ecmascript)'
          );
      },
    '[project]/node_modules/@mui/utils/esm/ClassNameGenerator/ClassNameGenerator.js [app-client] (ecmascript) <export default as unstable_ClassNameGenerator>':
      (__turbopack_context__) => {
        'use strict';

        __turbopack_context__.s({
          unstable_ClassNameGenerator: () =>
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$utils$2f$esm$2f$ClassNameGenerator$2f$ClassNameGenerator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__[
              'default'
            ],
        });
        var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$utils$2f$esm$2f$ClassNameGenerator$2f$ClassNameGenerator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ =
          __turbopack_context__.i(
            '[project]/node_modules/@mui/utils/esm/ClassNameGenerator/ClassNameGenerator.js [app-client] (ecmascript)'
          );
      },
    '[project]/node_modules/@mui/utils/esm/generateUtilityClasses/generateUtilityClasses.js [app-client] (ecmascript)':
      (__turbopack_context__) => {
        'use strict';

        __turbopack_context__.s({
          default: () => generateUtilityClasses,
        });
        var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$utils$2f$esm$2f$generateUtilityClass$2f$generateUtilityClass$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ =
          __turbopack_context__.i(
            '[project]/node_modules/@mui/utils/esm/generateUtilityClass/generateUtilityClass.js [app-client] (ecmascript)'
          );
        function generateUtilityClasses(componentName, slots) {
          let globalStatePrefix =
            arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 'Mui';
          const result = {};
          slots.forEach((slot) => {
            result[slot] = (0,
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$utils$2f$esm$2f$generateUtilityClass$2f$generateUtilityClass$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__[
              'default'
            ])(componentName, slot, globalStatePrefix);
          });
          return result;
        }
      },
    '[project]/node_modules/@mui/material/esm/Box/boxClasses.js [app-client] (ecmascript)': (
      __turbopack_context__
    ) => {
      'use strict';

      __turbopack_context__.s({
        default: () => __TURBOPACK__default__export__,
      });
      var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$utils$2f$esm$2f$generateUtilityClasses$2f$generateUtilityClasses$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ =
        __turbopack_context__.i(
          '[project]/node_modules/@mui/utils/esm/generateUtilityClasses/generateUtilityClasses.js [app-client] (ecmascript)'
        );
      const boxClasses = (0,
      __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$utils$2f$esm$2f$generateUtilityClasses$2f$generateUtilityClasses$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__[
        'default'
      ])('MuiBox', ['root']);
      const __TURBOPACK__default__export__ = boxClasses;
    },
    '[project]/node_modules/@mui/material/esm/Box/Box.js [app-client] (ecmascript)': (
      __turbopack_context__
    ) => {
      'use strict';

      __turbopack_context__.s({
        default: () => __TURBOPACK__default__export__,
      });
      var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ =
        /*#__PURE__*/ __turbopack_context__.i(
          '[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)'
        );
      var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$system$2f$esm$2f$createBox$2f$createBox$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__createBox$3e$__ =
        __turbopack_context__.i(
          '[project]/node_modules/@mui/system/esm/createBox/createBox.js [app-client] (ecmascript) <export default as createBox>'
        );
      var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ =
        __turbopack_context__.i(
          '[project]/node_modules/prop-types/index.js [app-client] (ecmascript)'
        );
      var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$utils$2f$esm$2f$ClassNameGenerator$2f$ClassNameGenerator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__unstable_ClassNameGenerator$3e$__ =
        __turbopack_context__.i(
          '[project]/node_modules/@mui/utils/esm/ClassNameGenerator/ClassNameGenerator.js [app-client] (ecmascript) <export default as unstable_ClassNameGenerator>'
        );
      var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$styles$2f$createTheme$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__createTheme$3e$__ =
        __turbopack_context__.i(
          '[project]/node_modules/@mui/material/esm/styles/createTheme.js [app-client] (ecmascript) <export default as createTheme>'
        );
      var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$styles$2f$identifier$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ =
        __turbopack_context__.i(
          '[project]/node_modules/@mui/material/esm/styles/identifier.js [app-client] (ecmascript)'
        );
      var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$boxClasses$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ =
        __turbopack_context__.i(
          '[project]/node_modules/@mui/material/esm/Box/boxClasses.js [app-client] (ecmascript)'
        );
      ('use client');
      const defaultTheme = (0,
      __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$styles$2f$createTheme$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__createTheme$3e$__[
        'createTheme'
      ])();
      const Box = (0,
      __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$system$2f$esm$2f$createBox$2f$createBox$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__createBox$3e$__[
        'createBox'
      ])({
        themeId:
          __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$styles$2f$identifier$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__[
            'default'
          ],
        defaultTheme,
        defaultClassName:
          __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$boxClasses$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__[
            'default'
          ].root,
        generateClassName:
          __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$utils$2f$esm$2f$ClassNameGenerator$2f$ClassNameGenerator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__unstable_ClassNameGenerator$3e$__[
            'unstable_ClassNameGenerator'
          ].generate,
      });
      ('TURBOPACK compile-time truthy', 1)
        ? (Box.propTypes = {
            // ┌────────────────────────────── Warning ──────────────────────────────┐
            // │ These PropTypes are generated from the TypeScript type definitions. │
            // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
            // └─────────────────────────────────────────────────────────────────────┘
            /**
             * @ignore
             */ children:
              __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__[
                'default'
              ].node,
            /**
             * The component used for the root node.
             * Either a string to use a HTML element or a component.
             */ component:
              __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__[
                'default'
              ].elementType,
            /**
             * The system prop that allows defining system overrides as well as additional CSS styles.
             */ sx: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__[
              'default'
            ].oneOfType([
              __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__[
                'default'
              ].arrayOf(
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__[
                  'default'
                ].oneOfType([
                  __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__[
                    'default'
                  ].func,
                  __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__[
                    'default'
                  ].object,
                  __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__[
                    'default'
                  ].bool,
                ])
              ),
              __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__[
                'default'
              ].func,
              __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$prop$2d$types$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__[
                'default'
              ].object,
            ]),
          })
        : 'TURBOPACK unreachable';
      const __TURBOPACK__default__export__ = Box;
    },
    '[project]/node_modules/@mui/material/esm/Box/Box.js [app-client] (ecmascript) <export default as Box>':
      (__turbopack_context__) => {
        'use strict';

        __turbopack_context__.s({
          Box: () =>
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__[
              'default'
            ],
        });
        var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ =
          __turbopack_context__.i(
            '[project]/node_modules/@mui/material/esm/Box/Box.js [app-client] (ecmascript)'
          );
      },
  },
]);

//# sourceMappingURL=_efe65f46._.js.map
