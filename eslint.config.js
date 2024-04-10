import freaktechnikConfigNode from "@freaktechnik/eslint-config-node";

export default [
    ...freaktechnikConfigNode,
    {
        files: [ "**/*.js" ],
        rules: {
            "unicorn/import-index": [
                "warn",
                {
                    "ignoreImports": true,
                },
            ],
        },
    },
];
