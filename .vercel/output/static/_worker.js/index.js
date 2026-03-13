import('node:buffer').then(({Buffer}) => {
    globalThis.Buffer = Buffer;
})
    .catch(() => null);

const __ALSes_PROMISE__ = import('node:async_hooks').then(({AsyncLocalStorage}) => {
    globalThis.AsyncLocalStorage = AsyncLocalStorage;

    const envAsyncLocalStorage = new AsyncLocalStorage();
    const requestContextAsyncLocalStorage = new AsyncLocalStorage();

    globalThis.process = {
        env: new Proxy(
            {},
            {
                ownKeys: () => Reflect.ownKeys(envAsyncLocalStorage.getStore()),
                getOwnPropertyDescriptor: (_, ...args) =>
                    Reflect.getOwnPropertyDescriptor(envAsyncLocalStorage.getStore(), ...args),
                get: (_, property) => Reflect.get(envAsyncLocalStorage.getStore(), property),
                set: (_, property, value) => Reflect.set(envAsyncLocalStorage.getStore(), property, value),
            }),
    };

    globalThis[Symbol.for('__cloudflare-request-context__')] = new Proxy(
        {},
        {
            ownKeys: () => Reflect.ownKeys(requestContextAsyncLocalStorage.getStore()),
            getOwnPropertyDescriptor: (_, ...args) =>
                Reflect.getOwnPropertyDescriptor(requestContextAsyncLocalStorage.getStore(), ...args),
            get: (_, property) => Reflect.get(requestContextAsyncLocalStorage.getStore(), property),
            set: (_, property, value) => Reflect.set(requestContextAsyncLocalStorage.getStore(), property, value),
        }
    );

    return {envAsyncLocalStorage, requestContextAsyncLocalStorage};
})
    .catch(() => null);

var ne = Object.create;
var U = Object.defineProperty;
var se = Object.getOwnPropertyDescriptor;
var oe = Object.getOwnPropertyNames;
var ae = Object.getPrototypeOf, ce = Object.prototype.hasOwnProperty;
var E = (e, t) => () => (e && (t = e(e = 0)), t);
var V = (e, t) => () => (t || e((t = {exports: {}}).exports, t), t.exports);
var ie = (e, t, n, r) => {
    if (t && typeof t == "object" || typeof t == "function") for (let o of oe(t)) !ce.call(e, o) && o !== n && U(e, o, {
        get: () => t[o],
        enumerable: !(r = se(t, o)) || r.enumerable
    });
    return e
};
var F = (e, t, n) => (n = e != null ? ne(ae(e)) : {}, ie(t || !e || !e.__esModule ? U(n, "default", {
    value: e,
    enumerable: !0
}) : n, e));
var m, u = E(() => {
    m = {collectedLocales: []}
});
var h, l = E(() => {
    h = {
        version: 3,
        routes: {
            none: [{
                src: "^(?:/((?:[^/]+?)(?:/(?:[^/]+?))*))/$",
                headers: {Location: "/$1"},
                status: 308,
                continue: !0
            }, {src: "^/_next/__private/trace$", dest: "/404", status: 404, continue: !0}, {
                src: "^/404/?$",
                status: 404,
                continue: !0,
                missing: [{type: "header", key: "x-prerender-revalidate"}]
            }, {src: "^/500$", status: 500, continue: !0}, {
                src: "^/(?<path>.+?)(?:/)?$",
                dest: "/$path.segments/$segmentPath.segment.rsc",
                has: [{type: "header", key: "rsc", value: "1"}, {
                    type: "header",
                    key: "next-router-prefetch",
                    value: "1"
                }, {type: "header", key: "next-router-segment-prefetch", value: "/(?<segmentPath>.+)"}],
                continue: !0,
                override: !0
            }, {
                src: "^/?$",
                dest: "/index.segments/$segmentPath.segment.rsc",
                has: [{type: "header", key: "rsc", value: "1"}, {
                    type: "header",
                    key: "next-router-prefetch",
                    value: "1"
                }, {type: "header", key: "next-router-segment-prefetch", value: "/(?<segmentPath>.+)"}],
                continue: !0,
                override: !0
            }, {
                src: "^/?$",
                has: [{type: "header", key: "rsc", value: "1"}],
                dest: "/index.rsc",
                headers: {vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch"},
                continue: !0,
                override: !0
            }, {
                src: "^/((?!.+\\.rsc).+?)(?:/)?$",
                has: [{type: "header", key: "rsc", value: "1"}],
                dest: "/$1.rsc",
                headers: {vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch"},
                continue: !0,
                override: !0
            }],
            filesystem: [{src: "^/index(\\.action|\\.rsc)$", dest: "/", continue: !0}, {
                src: "^/\\.prefetch\\.rsc$",
                dest: "/__index.prefetch.rsc",
                check: !0
            }, {src: "^/(.+)/\\.prefetch\\.rsc$", dest: "/$1.prefetch.rsc", check: !0}, {
                src: "^/\\.rsc$",
                dest: "/index.rsc",
                check: !0
            }, {src: "^/(.+)/\\.rsc$", dest: "/$1.rsc", check: !0}],
            miss: [{
                src: "^/_next/static/.+$",
                status: 404,
                check: !0,
                dest: "/_next/static/not-found.txt",
                headers: {"content-type": "text/plain; charset=utf-8"}
            }, {
                src: "^/(?<path>.+)(?<rscSuffix>\\.segments/.+\\.segment\\.rsc)(?:/)?$",
                dest: "/$path.rsc",
                check: !0
            }],
            rewrite: [{
                src: "^/(?<path>.+)(?<rscSuffix>\\.segments/.+\\.segment\\.rsc)(?:/)?$",
                dest: "/$path.rsc",
                check: !0,
                override: !0
            }, {
                src: "^/jokul/blog/(?<nxtPid>[^/]+?)(?<rscSuffix>\\.rsc|\\.prefetch\\.rsc|\\.segments/.+\\.segment\\.rsc)(?:/)?$",
                dest: "/jokul/blog/[id]$rscSuffix?nxtPid=$nxtPid",
                check: !0,
                override: !0
            }, {
                src: "^/jokul/blog/(?<nxtPid>[^/]+?)(?:/)?$",
                dest: "/jokul/blog/[id]?nxtPid=$nxtPid",
                check: !0,
                override: !0
            }, {
                src: "^/jokul/component/(?<nxtPid>[^/]+?)(?<rscSuffix>\\.rsc|\\.prefetch\\.rsc|\\.segments/.+\\.segment\\.rsc)(?:/)?$",
                dest: "/jokul/component/[id]$rscSuffix?nxtPid=$nxtPid",
                check: !0,
                override: !0
            }, {
                src: "^/jokul/component/(?<nxtPid>[^/]+?)(?:/)?$",
                dest: "/jokul/component/[id]?nxtPid=$nxtPid",
                check: !0,
                override: !0
            }, {
                src: "^/jokul/foundational/(?<nxtPid>[^/]+?)(?<rscSuffix>\\.rsc|\\.prefetch\\.rsc|\\.segments/.+\\.segment\\.rsc)(?:/)?$",
                dest: "/jokul/foundational/[id]$rscSuffix?nxtPid=$nxtPid",
                check: !0,
                override: !0
            }, {
                src: "^/jokul/foundational/(?<nxtPid>[^/]+?)(?:/)?$",
                dest: "/jokul/foundational/[id]?nxtPid=$nxtPid",
                check: !0,
                override: !0
            }],
            resource: [{src: "^/.*$", status: 404}],
            hit: [{
                src: "^/_next/static/(?:[^/]+/pages|pages|chunks|runtime|css|image|media|HCIltVTqyLGM0NsKaRywq)/.+$",
                headers: {"cache-control": "public,max-age=31536000,immutable"},
                continue: !0,
                important: !0
            }, {
                src: "^/index(?:/)?$",
                headers: {"x-matched-path": "/"},
                continue: !0,
                important: !0
            }, {src: "^/((?!index$).*?)(?:/)?$", headers: {"x-matched-path": "/$1"}, continue: !0, important: !0}],
            error: [{src: "^/.*$", dest: "/404", status: 404, headers: {"x-next-error-status": "404"}}, {
                src: "^/.*$",
                dest: "/500",
                status: 500,
                headers: {"x-next-error-status": "500"}
            }]
        },
        images: {
            domains: [],
            sizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840, 32, 48, 64, 96, 128, 256, 384],
            qualities: [75],
            remotePatterns: [],
            localPatterns: [{
                pathname: "^(?:(?!(?:^|\\/)\\.{1,2}(?:\\/|$))(?:(?:(?!(?:^|\\/)\\.{1,2}(?:\\/|$)).)*?)\\/?)$",
                search: ""
            }],
            minimumCacheTTL: 14400,
            formats: ["image/webp"],
            dangerouslyAllowSVG: !1,
            contentSecurityPolicy: "script-src 'none'; frame-src 'none'; sandbox;",
            contentDispositionType: "attachment"
        },
        overrides: {
            "404.html": {path: "404", contentType: "text/html; charset=utf-8"},
            "500.html": {path: "500", contentType: "text/html; charset=utf-8"},
            "404.rsc.json": {path: "404.rsc", contentType: "application/json"},
            "404.segments/_tree.segment.rsc.json": {
                path: "404.segments/_tree.segment.rsc",
                contentType: "application/json"
            },
            "500.rsc.json": {path: "500.rsc", contentType: "application/json"},
            "500.segments/_tree.segment.rsc.json": {
                path: "500.segments/_tree.segment.rsc",
                contentType: "application/json"
            },
            "_next/static/not-found.txt": {contentType: "text/plain"}
        },
        framework: {version: "16.1.6"},
        crons: []
    }
});
var x, _ = E(() => {
    x = {
        "/404.html": {type: "override", path: "/404.html", headers: {"content-type": "text/html; charset=utf-8"}},
        "/404.rsc.json": {type: "override", path: "/404.rsc.json", headers: {"content-type": "application/json"}},
        "/404.segments/_tree.segment.rsc.json": {
            type: "override",
            path: "/404.segments/_tree.segment.rsc.json",
            headers: {"content-type": "application/json"}
        },
        "/500.html": {type: "override", path: "/500.html", headers: {"content-type": "text/html; charset=utf-8"}},
        "/500.rsc.json": {type: "override", path: "/500.rsc.json", headers: {"content-type": "application/json"}},
        "/500.segments/_tree.segment.rsc.json": {
            type: "override",
            path: "/500.segments/_tree.segment.rsc.json",
            headers: {"content-type": "application/json"}
        },
        "/_next/static/HCIltVTqyLGM0NsKaRywq/_buildManifest.js": {type: "static"},
        "/_next/static/HCIltVTqyLGM0NsKaRywq/_clientMiddlewareManifest.json": {type: "static"},
        "/_next/static/HCIltVTqyLGM0NsKaRywq/_ssgManifest.js": {type: "static"},
        "/_next/static/chunks/00c7fa104044374f.css": {type: "static"},
        "/_next/static/chunks/0350b4e50096389e.js": {type: "static"},
        "/_next/static/chunks/06d7aaf6d3194e1c.css": {type: "static"},
        "/_next/static/chunks/07aac3bed32530c3.css": {type: "static"},
        "/_next/static/chunks/1185274c059454e8.css": {type: "static"},
        "/_next/static/chunks/11fe75a1468250d6.js": {type: "static"},
        "/_next/static/chunks/179420a635582a52.js": {type: "static"},
        "/_next/static/chunks/18f1e085d9423e35.js": {type: "static"},
        "/_next/static/chunks/38e21ab145f68491.js": {type: "static"},
        "/_next/static/chunks/457e00f0ce2eab23.js": {type: "static"},
        "/_next/static/chunks/5e8d73deacb43f11.js": {type: "static"},
        "/_next/static/chunks/6d54ae39e69ae589.js": {type: "static"},
        "/_next/static/chunks/7803d3809b489d6b.css": {type: "static"},
        "/_next/static/chunks/849ac5bb2db2ec82.css": {type: "static"},
        "/_next/static/chunks/888f32b101de1764.js": {type: "static"},
        "/_next/static/chunks/9a9119614a816949.js": {type: "static"},
        "/_next/static/chunks/a28e4198398feb66.js": {type: "static"},
        "/_next/static/chunks/a6dad97d9634a72d.js": {type: "static"},
        "/_next/static/chunks/a6dad97d9634a72d.js.map": {type: "static"},
        "/_next/static/chunks/ba1fcdde3a19310a.js": {type: "static"},
        "/_next/static/chunks/c6aa61d6dec07d87.js": {type: "static"},
        "/_next/static/chunks/cf5f15441aa700bb.js": {type: "static"},
        "/_next/static/chunks/d1709c6e7a6fa4c7.js": {type: "static"},
        "/_next/static/chunks/e6627b6505f1f270.css": {type: "static"},
        "/_next/static/chunks/e6bce1b7186aabb0.js": {type: "static"},
        "/_next/static/chunks/eaef8c4a2e40a406.js": {type: "static"},
        "/_next/static/chunks/eb5ad0dbb1ba4c84.css": {type: "static"},
        "/_next/static/chunks/f8298ac4c59e88f6.js": {type: "static"},
        "/_next/static/chunks/turbopack-637572b507711a03.js": {type: "static"},
        "/_next/static/not-found.txt": {type: "static"},
        "/fonts/Fremtind-Material-Symbols.woff2": {type: "static"},
        "/fonts/FremtindGrotesk-Bold-Web.woff": {type: "static"},
        "/fonts/FremtindGrotesk-Bold-Web.woff2": {type: "static"},
        "/fonts/FremtindGrotesk-BoldItalic-Web.woff": {type: "static"},
        "/fonts/FremtindGrotesk-BoldItalic-Web.woff2": {type: "static"},
        "/fonts/FremtindGrotesk-Display-Web.woff": {type: "static"},
        "/fonts/FremtindGrotesk-Display-Web.woff2": {type: "static"},
        "/fonts/FremtindGrotesk-Italic-Web.woff": {type: "static"},
        "/fonts/FremtindGrotesk-Italic-Web.woff2": {type: "static"},
        "/fonts/FremtindGrotesk-Regular-Web.woff": {type: "static"},
        "/fonts/FremtindGrotesk-Regular-Web.woff2": {type: "static"},
        "/placeholder-300x200.svg": {type: "static"},
        "/placeholder-600x400.svg": {type: "static"},
        "/placeholder-blur.svg": {type: "static"},
        "/jokul/blog/[id]": {type: "function", entrypoint: "__next-on-pages-dist__/functions/jokul/blog/[id].func.js"},
        "/jokul/blog/[id].rsc": {
            type: "function",
            entrypoint: "__next-on-pages-dist__/functions/jokul/blog/[id].func.js"
        },
        "/jokul/component/[id]": {
            type: "function",
            entrypoint: "__next-on-pages-dist__/functions/jokul/component/[id].func.js"
        },
        "/jokul/component/[id].rsc": {
            type: "function",
            entrypoint: "__next-on-pages-dist__/functions/jokul/component/[id].func.js"
        },
        "/jokul/foundational/[id]": {
            type: "function",
            entrypoint: "__next-on-pages-dist__/functions/jokul/foundational/[id].func.js"
        },
        "/jokul/foundational/[id].rsc": {
            type: "function",
            entrypoint: "__next-on-pages-dist__/functions/jokul/foundational/[id].func.js"
        },
        "/404": {type: "override", path: "/404.html", headers: {"content-type": "text/html; charset=utf-8"}},
        "/500": {type: "override", path: "/500.html", headers: {"content-type": "text/html; charset=utf-8"}},
        "/404.rsc": {type: "override", path: "/404.rsc.json", headers: {"content-type": "application/json"}},
        "/404.segments/_tree.segment.rsc": {
            type: "override",
            path: "/404.segments/_tree.segment.rsc.json",
            headers: {"content-type": "application/json"}
        },
        "/500.rsc": {type: "override", path: "/500.rsc.json", headers: {"content-type": "application/json"}},
        "/500.segments/_tree.segment.rsc": {
            type: "override",
            path: "/500.segments/_tree.segment.rsc.json",
            headers: {"content-type": "application/json"}
        },
        "/_global-error.html": {
            type: "override",
            path: "/_global-error.html",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/_global-error/layout,_N_T_/_global-error/page,_N_T_/_global-error",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch"
            }
        },
        "/_global-error": {
            type: "override",
            path: "/_global-error.html",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/_global-error/layout,_N_T_/_global-error/page,_N_T_/_global-error",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch"
            }
        },
        "/_global-error.rsc": {
            type: "override",
            path: "/_global-error.rsc",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/_global-error/layout,_N_T_/_global-error/page,_N_T_/_global-error",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
                "content-type": "text/x-component"
            }
        },
        "/_global-error.segments/__PAGE__.segment.rsc": {
            type: "override",
            path: "/_global-error.segments/__PAGE__.segment.rsc",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/_global-error/layout,_N_T_/_global-error/page,_N_T_/_global-error",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
                "content-type": "text/x-component",
                "x-nextjs-postponed": "2"
            }
        },
        "/_global-error.segments/_full.segment.rsc": {
            type: "override",
            path: "/_global-error.segments/_full.segment.rsc",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/_global-error/layout,_N_T_/_global-error/page,_N_T_/_global-error",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
                "content-type": "text/x-component",
                "x-nextjs-postponed": "2"
            }
        },
        "/_global-error.segments/_head.segment.rsc": {
            type: "override",
            path: "/_global-error.segments/_head.segment.rsc",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/_global-error/layout,_N_T_/_global-error/page,_N_T_/_global-error",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
                "content-type": "text/x-component",
                "x-nextjs-postponed": "2"
            }
        },
        "/_global-error.segments/_index.segment.rsc": {
            type: "override",
            path: "/_global-error.segments/_index.segment.rsc",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/_global-error/layout,_N_T_/_global-error/page,_N_T_/_global-error",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
                "content-type": "text/x-component",
                "x-nextjs-postponed": "2"
            }
        },
        "/_global-error.segments/_tree.segment.rsc": {
            type: "override",
            path: "/_global-error.segments/_tree.segment.rsc",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/_global-error/layout,_N_T_/_global-error/page,_N_T_/_global-error",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
                "content-type": "text/x-component",
                "x-nextjs-postponed": "2"
            }
        },
        "/_not-found.html": {
            type: "override",
            path: "/_not-found.html",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/_not-found/layout,_N_T_/_not-found/page,_N_T_/_not-found",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch"
            }
        },
        "/_not-found": {
            type: "override",
            path: "/_not-found.html",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/_not-found/layout,_N_T_/_not-found/page,_N_T_/_not-found",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch"
            }
        },
        "/_not-found.rsc": {
            type: "override",
            path: "/_not-found.rsc",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/_not-found/layout,_N_T_/_not-found/page,_N_T_/_not-found",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
                "content-type": "text/x-component"
            }
        },
        "/_not-found.segments/_full.segment.rsc": {
            type: "override",
            path: "/_not-found.segments/_full.segment.rsc",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/_not-found/layout,_N_T_/_not-found/page,_N_T_/_not-found",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
                "content-type": "text/x-component",
                "x-nextjs-postponed": "2"
            }
        },
        "/_not-found.segments/_head.segment.rsc": {
            type: "override",
            path: "/_not-found.segments/_head.segment.rsc",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/_not-found/layout,_N_T_/_not-found/page,_N_T_/_not-found",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
                "content-type": "text/x-component",
                "x-nextjs-postponed": "2"
            }
        },
        "/_not-found.segments/_index.segment.rsc": {
            type: "override",
            path: "/_not-found.segments/_index.segment.rsc",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/_not-found/layout,_N_T_/_not-found/page,_N_T_/_not-found",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
                "content-type": "text/x-component",
                "x-nextjs-postponed": "2"
            }
        },
        "/_not-found.segments/_not-found/__PAGE__.segment.rsc": {
            type: "override",
            path: "/_not-found.segments/_not-found/__PAGE__.segment.rsc",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/_not-found/layout,_N_T_/_not-found/page,_N_T_/_not-found",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
                "content-type": "text/x-component",
                "x-nextjs-postponed": "2"
            }
        },
        "/_not-found.segments/_not-found.segment.rsc": {
            type: "override",
            path: "/_not-found.segments/_not-found.segment.rsc",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/_not-found/layout,_N_T_/_not-found/page,_N_T_/_not-found",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
                "content-type": "text/x-component",
                "x-nextjs-postponed": "2"
            }
        },
        "/_not-found.segments/_tree.segment.rsc": {
            type: "override",
            path: "/_not-found.segments/_tree.segment.rsc",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/_not-found/layout,_N_T_/_not-found/page,_N_T_/_not-found",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
                "content-type": "text/x-component",
                "x-nextjs-postponed": "2"
            }
        },
        "/index.html": {
            type: "override",
            path: "/index.html",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/page,_N_T_/,_N_T_/index",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch"
            }
        },
        "/index": {
            type: "override",
            path: "/index.html",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/page,_N_T_/,_N_T_/index",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch"
            }
        },
        "/": {
            type: "override",
            path: "/index.html",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/page,_N_T_/,_N_T_/index",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch"
            }
        },
        "/index.rsc": {
            type: "override",
            path: "/index.rsc",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/page,_N_T_/,_N_T_/index",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
                "content-type": "text/x-component"
            }
        },
        "/index.segments/__PAGE__.segment.rsc": {
            type: "override",
            path: "/index.segments/__PAGE__.segment.rsc",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/page,_N_T_/,_N_T_/index",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
                "content-type": "text/x-component",
                "x-nextjs-postponed": "2"
            }
        },
        "/index.segments/_full.segment.rsc": {
            type: "override",
            path: "/index.segments/_full.segment.rsc",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/page,_N_T_/,_N_T_/index",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
                "content-type": "text/x-component",
                "x-nextjs-postponed": "2"
            }
        },
        "/index.segments/_head.segment.rsc": {
            type: "override",
            path: "/index.segments/_head.segment.rsc",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/page,_N_T_/,_N_T_/index",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
                "content-type": "text/x-component",
                "x-nextjs-postponed": "2"
            }
        },
        "/index.segments/_index.segment.rsc": {
            type: "override",
            path: "/index.segments/_index.segment.rsc",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/page,_N_T_/,_N_T_/index",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
                "content-type": "text/x-component",
                "x-nextjs-postponed": "2"
            }
        },
        "/index.segments/_tree.segment.rsc": {
            type: "override",
            path: "/index.segments/_tree.segment.rsc",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/page,_N_T_/,_N_T_/index",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
                "content-type": "text/x-component",
                "x-nextjs-postponed": "2"
            }
        },
        "/jokul/blog.html": {
            type: "override",
            path: "/jokul/blog.html",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/jokul/layout,_N_T_/jokul/blog/layout,_N_T_/jokul/blog/page,_N_T_/jokul/blog",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch"
            }
        },
        "/jokul/blog": {
            type: "override",
            path: "/jokul/blog.html",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/jokul/layout,_N_T_/jokul/blog/layout,_N_T_/jokul/blog/page,_N_T_/jokul/blog",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch"
            }
        },
        "/jokul/blog.rsc": {
            type: "override",
            path: "/jokul/blog.rsc",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/jokul/layout,_N_T_/jokul/blog/layout,_N_T_/jokul/blog/page,_N_T_/jokul/blog",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
                "content-type": "text/x-component"
            }
        },
        "/jokul/blog.segments/_full.segment.rsc": {
            type: "override",
            path: "/jokul/blog.segments/_full.segment.rsc",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/jokul/layout,_N_T_/jokul/blog/layout,_N_T_/jokul/blog/page,_N_T_/jokul/blog",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
                "content-type": "text/x-component",
                "x-nextjs-postponed": "2"
            }
        },
        "/jokul/blog.segments/_head.segment.rsc": {
            type: "override",
            path: "/jokul/blog.segments/_head.segment.rsc",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/jokul/layout,_N_T_/jokul/blog/layout,_N_T_/jokul/blog/page,_N_T_/jokul/blog",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
                "content-type": "text/x-component",
                "x-nextjs-postponed": "2"
            }
        },
        "/jokul/blog.segments/_index.segment.rsc": {
            type: "override",
            path: "/jokul/blog.segments/_index.segment.rsc",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/jokul/layout,_N_T_/jokul/blog/layout,_N_T_/jokul/blog/page,_N_T_/jokul/blog",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
                "content-type": "text/x-component",
                "x-nextjs-postponed": "2"
            }
        },
        "/jokul/blog.segments/_tree.segment.rsc": {
            type: "override",
            path: "/jokul/blog.segments/_tree.segment.rsc",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/jokul/layout,_N_T_/jokul/blog/layout,_N_T_/jokul/blog/page,_N_T_/jokul/blog",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
                "content-type": "text/x-component",
                "x-nextjs-postponed": "2"
            }
        },
        "/jokul/blog.segments/jokul/blog/__PAGE__.segment.rsc": {
            type: "override",
            path: "/jokul/blog.segments/jokul/blog/__PAGE__.segment.rsc",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/jokul/layout,_N_T_/jokul/blog/layout,_N_T_/jokul/blog/page,_N_T_/jokul/blog",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
                "content-type": "text/x-component",
                "x-nextjs-postponed": "2"
            }
        },
        "/jokul/blog.segments/jokul/blog.segment.rsc": {
            type: "override",
            path: "/jokul/blog.segments/jokul/blog.segment.rsc",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/jokul/layout,_N_T_/jokul/blog/layout,_N_T_/jokul/blog/page,_N_T_/jokul/blog",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
                "content-type": "text/x-component",
                "x-nextjs-postponed": "2"
            }
        },
        "/jokul/blog.segments/jokul.segment.rsc": {
            type: "override",
            path: "/jokul/blog.segments/jokul.segment.rsc",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/jokul/layout,_N_T_/jokul/blog/layout,_N_T_/jokul/blog/page,_N_T_/jokul/blog",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
                "content-type": "text/x-component",
                "x-nextjs-postponed": "2"
            }
        },
        "/jokul/component.html": {
            type: "override",
            path: "/jokul/component.html",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/jokul/layout,_N_T_/jokul/component/layout,_N_T_/jokul/component/page,_N_T_/jokul/component",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch"
            }
        },
        "/jokul/component": {
            type: "override",
            path: "/jokul/component.html",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/jokul/layout,_N_T_/jokul/component/layout,_N_T_/jokul/component/page,_N_T_/jokul/component",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch"
            }
        },
        "/jokul/component.rsc": {
            type: "override",
            path: "/jokul/component.rsc",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/jokul/layout,_N_T_/jokul/component/layout,_N_T_/jokul/component/page,_N_T_/jokul/component",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
                "content-type": "text/x-component"
            }
        },
        "/jokul/component.segments/_full.segment.rsc": {
            type: "override",
            path: "/jokul/component.segments/_full.segment.rsc",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/jokul/layout,_N_T_/jokul/component/layout,_N_T_/jokul/component/page,_N_T_/jokul/component",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
                "content-type": "text/x-component",
                "x-nextjs-postponed": "2"
            }
        },
        "/jokul/component.segments/_head.segment.rsc": {
            type: "override",
            path: "/jokul/component.segments/_head.segment.rsc",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/jokul/layout,_N_T_/jokul/component/layout,_N_T_/jokul/component/page,_N_T_/jokul/component",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
                "content-type": "text/x-component",
                "x-nextjs-postponed": "2"
            }
        },
        "/jokul/component.segments/_index.segment.rsc": {
            type: "override",
            path: "/jokul/component.segments/_index.segment.rsc",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/jokul/layout,_N_T_/jokul/component/layout,_N_T_/jokul/component/page,_N_T_/jokul/component",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
                "content-type": "text/x-component",
                "x-nextjs-postponed": "2"
            }
        },
        "/jokul/component.segments/_tree.segment.rsc": {
            type: "override",
            path: "/jokul/component.segments/_tree.segment.rsc",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/jokul/layout,_N_T_/jokul/component/layout,_N_T_/jokul/component/page,_N_T_/jokul/component",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
                "content-type": "text/x-component",
                "x-nextjs-postponed": "2"
            }
        },
        "/jokul/component.segments/jokul/component/__PAGE__.segment.rsc": {
            type: "override",
            path: "/jokul/component.segments/jokul/component/__PAGE__.segment.rsc",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/jokul/layout,_N_T_/jokul/component/layout,_N_T_/jokul/component/page,_N_T_/jokul/component",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
                "content-type": "text/x-component",
                "x-nextjs-postponed": "2"
            }
        },
        "/jokul/component.segments/jokul/component.segment.rsc": {
            type: "override",
            path: "/jokul/component.segments/jokul/component.segment.rsc",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/jokul/layout,_N_T_/jokul/component/layout,_N_T_/jokul/component/page,_N_T_/jokul/component",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
                "content-type": "text/x-component",
                "x-nextjs-postponed": "2"
            }
        },
        "/jokul/component.segments/jokul.segment.rsc": {
            type: "override",
            path: "/jokul/component.segments/jokul.segment.rsc",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/jokul/layout,_N_T_/jokul/component/layout,_N_T_/jokul/component/page,_N_T_/jokul/component",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
                "content-type": "text/x-component",
                "x-nextjs-postponed": "2"
            }
        },
        "/jokul/foundational.html": {
            type: "override",
            path: "/jokul/foundational.html",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/jokul/layout,_N_T_/jokul/foundational/layout,_N_T_/jokul/foundational/page,_N_T_/jokul/foundational",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch"
            }
        },
        "/jokul/foundational": {
            type: "override",
            path: "/jokul/foundational.html",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/jokul/layout,_N_T_/jokul/foundational/layout,_N_T_/jokul/foundational/page,_N_T_/jokul/foundational",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch"
            }
        },
        "/jokul/foundational.rsc": {
            type: "override",
            path: "/jokul/foundational.rsc",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/jokul/layout,_N_T_/jokul/foundational/layout,_N_T_/jokul/foundational/page,_N_T_/jokul/foundational",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
                "content-type": "text/x-component"
            }
        },
        "/jokul/foundational.segments/_full.segment.rsc": {
            type: "override",
            path: "/jokul/foundational.segments/_full.segment.rsc",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/jokul/layout,_N_T_/jokul/foundational/layout,_N_T_/jokul/foundational/page,_N_T_/jokul/foundational",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
                "content-type": "text/x-component",
                "x-nextjs-postponed": "2"
            }
        },
        "/jokul/foundational.segments/_head.segment.rsc": {
            type: "override",
            path: "/jokul/foundational.segments/_head.segment.rsc",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/jokul/layout,_N_T_/jokul/foundational/layout,_N_T_/jokul/foundational/page,_N_T_/jokul/foundational",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
                "content-type": "text/x-component",
                "x-nextjs-postponed": "2"
            }
        },
        "/jokul/foundational.segments/_index.segment.rsc": {
            type: "override",
            path: "/jokul/foundational.segments/_index.segment.rsc",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/jokul/layout,_N_T_/jokul/foundational/layout,_N_T_/jokul/foundational/page,_N_T_/jokul/foundational",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
                "content-type": "text/x-component",
                "x-nextjs-postponed": "2"
            }
        },
        "/jokul/foundational.segments/_tree.segment.rsc": {
            type: "override",
            path: "/jokul/foundational.segments/_tree.segment.rsc",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/jokul/layout,_N_T_/jokul/foundational/layout,_N_T_/jokul/foundational/page,_N_T_/jokul/foundational",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
                "content-type": "text/x-component",
                "x-nextjs-postponed": "2"
            }
        },
        "/jokul/foundational.segments/jokul/foundational/__PAGE__.segment.rsc": {
            type: "override",
            path: "/jokul/foundational.segments/jokul/foundational/__PAGE__.segment.rsc",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/jokul/layout,_N_T_/jokul/foundational/layout,_N_T_/jokul/foundational/page,_N_T_/jokul/foundational",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
                "content-type": "text/x-component",
                "x-nextjs-postponed": "2"
            }
        },
        "/jokul/foundational.segments/jokul/foundational.segment.rsc": {
            type: "override",
            path: "/jokul/foundational.segments/jokul/foundational.segment.rsc",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/jokul/layout,_N_T_/jokul/foundational/layout,_N_T_/jokul/foundational/page,_N_T_/jokul/foundational",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
                "content-type": "text/x-component",
                "x-nextjs-postponed": "2"
            }
        },
        "/jokul/foundational.segments/jokul.segment.rsc": {
            type: "override",
            path: "/jokul/foundational.segments/jokul.segment.rsc",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/jokul/layout,_N_T_/jokul/foundational/layout,_N_T_/jokul/foundational/page,_N_T_/jokul/foundational",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
                "content-type": "text/x-component",
                "x-nextjs-postponed": "2"
            }
        },
        "/jokul.html": {
            type: "override",
            path: "/jokul.html",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/jokul/layout,_N_T_/jokul/page,_N_T_/jokul",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch"
            }
        },
        "/jokul": {
            type: "override",
            path: "/jokul.html",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/jokul/layout,_N_T_/jokul/page,_N_T_/jokul",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch"
            }
        },
        "/jokul.rsc": {
            type: "override",
            path: "/jokul.rsc",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/jokul/layout,_N_T_/jokul/page,_N_T_/jokul",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
                "content-type": "text/x-component"
            }
        },
        "/jokul.segments/_full.segment.rsc": {
            type: "override",
            path: "/jokul.segments/_full.segment.rsc",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/jokul/layout,_N_T_/jokul/page,_N_T_/jokul",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
                "content-type": "text/x-component",
                "x-nextjs-postponed": "2"
            }
        },
        "/jokul.segments/_head.segment.rsc": {
            type: "override",
            path: "/jokul.segments/_head.segment.rsc",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/jokul/layout,_N_T_/jokul/page,_N_T_/jokul",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
                "content-type": "text/x-component",
                "x-nextjs-postponed": "2"
            }
        },
        "/jokul.segments/_index.segment.rsc": {
            type: "override",
            path: "/jokul.segments/_index.segment.rsc",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/jokul/layout,_N_T_/jokul/page,_N_T_/jokul",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
                "content-type": "text/x-component",
                "x-nextjs-postponed": "2"
            }
        },
        "/jokul.segments/_tree.segment.rsc": {
            type: "override",
            path: "/jokul.segments/_tree.segment.rsc",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/jokul/layout,_N_T_/jokul/page,_N_T_/jokul",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
                "content-type": "text/x-component",
                "x-nextjs-postponed": "2"
            }
        },
        "/jokul.segments/jokul/__PAGE__.segment.rsc": {
            type: "override",
            path: "/jokul.segments/jokul/__PAGE__.segment.rsc",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/jokul/layout,_N_T_/jokul/page,_N_T_/jokul",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
                "content-type": "text/x-component",
                "x-nextjs-postponed": "2"
            }
        },
        "/jokul.segments/jokul.segment.rsc": {
            type: "override",
            path: "/jokul.segments/jokul.segment.rsc",
            headers: {
                "x-nextjs-stale-time": "300",
                "x-nextjs-prerender": "1",
                "x-next-cache-tags": "_N_T_/layout,_N_T_/jokul/layout,_N_T_/jokul/page,_N_T_/jokul",
                vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
                "content-type": "text/x-component",
                "x-nextjs-postponed": "2"
            }
        }
    }
});
var $ = V((ze, q) => {
    "use strict";
    u();
    l();
    _();

    function j(e, t) {
        e = String(e || "").trim();
        let n = e, r, o = "";
        if (/^[^a-zA-Z\\\s]/.test(e)) {
            r = e[0];
            let c = e.lastIndexOf(r);
            o += e.substring(c + 1), e = e.substring(1, c)
        }
        let s = 0;
        return e = _e(e, c => {
            if (/^\(\?[P<']/.test(c)) {
                let i = /^\(\?P?[<']([^>']+)[>']/.exec(c);
                if (!i) throw new Error(`Failed to extract named captures from ${JSON.stringify(c)}`);
                let p = c.substring(i[0].length, c.length - 1);
                return t && (t[s] = i[1]), s++, `(${p})`
            }
            return c.substring(0, 3) === "(?:" || s++, c
        }), e = e.replace(/\[:([^:]+):\]/g, (c, i) => j.characterClasses[i] || c), new j.PCRE(e, o, n, o, r)
    }

    function _e(e, t) {
        let n = 0, r = 0, o = !1;
        for (let a = 0; a < e.length; a++) {
            let s = e[a];
            if (o) {
                o = !1;
                continue
            }
            switch (s) {
                case"(":
                    r === 0 && (n = a), r++;
                    break;
                case")":
                    if (r > 0 && (r--, r === 0)) {
                        let c = a + 1, i = n === 0 ? "" : e.substring(0, n), p = e.substring(c),
                            d = String(t(e.substring(n, c)));
                        e = i + d + p, a = n
                    }
                    break;
                case"\\":
                    o = !0;
                    break;
                default:
                    break
            }
        }
        return e
    }

    (function (e) {
        class t extends RegExp {
            constructor(r, o, a, s, c) {
                super(r, o), this.pcrePattern = a, this.pcreFlags = s, this.delimiter = c
            }
        }

        e.PCRE = t, e.characterClasses = {
            alnum: "[A-Za-z0-9]",
            word: "[A-Za-z0-9_]",
            alpha: "[A-Za-z]",
            blank: "[ \\t]",
            cntrl: "[\\x00-\\x1F\\x7F]",
            digit: "\\d",
            graph: "[\\x21-\\x7E]",
            lower: "[a-z]",
            print: "[\\x20-\\x7E]",
            punct: "[\\]\\[!\"#$%&'()*+,./:;<=>?@\\\\^_`{|}~-]",
            space: "\\s",
            upper: "[A-Z]",
            xdigit: "[A-Fa-f0-9]"
        }
    })(j || (j = {}));
    j.prototype = j.PCRE.prototype;
    q.exports = j
});
var Q = V(H => {
    "use strict";
    u();
    l();
    _();
    H.parse = Ne;
    H.serialize = be;
    var Te = Object.prototype.toString, S = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;

    function Ne(e, t) {
        if (typeof e != "string") throw new TypeError("argument str must be a string");
        for (var n = {}, r = t || {}, o = r.decode || ve, a = 0; a < e.length;) {
            var s = e.indexOf("=", a);
            if (s === -1) break;
            var c = e.indexOf(";", a);
            if (c === -1) c = e.length; else if (c < s) {
                a = e.lastIndexOf(";", s - 1) + 1;
                continue
            }
            var i = e.slice(a, s).trim();
            if (n[i] === void 0) {
                var p = e.slice(s + 1, c).trim();
                p.charCodeAt(0) === 34 && (p = p.slice(1, -1)), n[i] = Pe(p, o)
            }
            a = c + 1
        }
        return n
    }

    function be(e, t, n) {
        var r = n || {}, o = r.encode || we;
        if (typeof o != "function") throw new TypeError("option encode is invalid");
        if (!S.test(e)) throw new TypeError("argument name is invalid");
        var a = o(t);
        if (a && !S.test(a)) throw new TypeError("argument val is invalid");
        var s = e + "=" + a;
        if (r.maxAge != null) {
            var c = r.maxAge - 0;
            if (isNaN(c) || !isFinite(c)) throw new TypeError("option maxAge is invalid");
            s += "; Max-Age=" + Math.floor(c)
        }
        if (r.domain) {
            if (!S.test(r.domain)) throw new TypeError("option domain is invalid");
            s += "; Domain=" + r.domain
        }
        if (r.path) {
            if (!S.test(r.path)) throw new TypeError("option path is invalid");
            s += "; Path=" + r.path
        }
        if (r.expires) {
            var i = r.expires;
            if (!Re(i) || isNaN(i.valueOf())) throw new TypeError("option expires is invalid");
            s += "; Expires=" + i.toUTCString()
        }
        if (r.httpOnly && (s += "; HttpOnly"), r.secure && (s += "; Secure"), r.priority) {
            var p = typeof r.priority == "string" ? r.priority.toLowerCase() : r.priority;
            switch (p) {
                case"low":
                    s += "; Priority=Low";
                    break;
                case"medium":
                    s += "; Priority=Medium";
                    break;
                case"high":
                    s += "; Priority=High";
                    break;
                default:
                    throw new TypeError("option priority is invalid")
            }
        }
        if (r.sameSite) {
            var d = typeof r.sameSite == "string" ? r.sameSite.toLowerCase() : r.sameSite;
            switch (d) {
                case!0:
                    s += "; SameSite=Strict";
                    break;
                case"lax":
                    s += "; SameSite=Lax";
                    break;
                case"strict":
                    s += "; SameSite=Strict";
                    break;
                case"none":
                    s += "; SameSite=None";
                    break;
                default:
                    throw new TypeError("option sameSite is invalid")
            }
        }
        return s
    }

    function ve(e) {
        return e.indexOf("%") !== -1 ? decodeURIComponent(e) : e
    }

    function we(e) {
        return encodeURIComponent(e)
    }

    function Re(e) {
        return Te.call(e) === "[object Date]" || e instanceof Date
    }

    function Pe(e, t) {
        try {
            return t(e)
        } catch {
            return e
        }
    }
});
u();
l();
_();
u();
l();
_();
u();
l();
_();
var T = "INTERNAL_SUSPENSE_CACHE_HOSTNAME.local";
u();
l();
_();
u();
l();
_();
u();
l();
_();
u();
l();
_();
var D = F($());

function w(e, t, n) {
    if (t == null) return {match: null, captureGroupKeys: []};
    let r = n ? "" : "i", o = [];
    return {match: (0, D.default)(`%${e}%${r}`, o).exec(t), captureGroupKeys: o}
}

function N(e, t, n, {namedOnly: r} = {}) {
    return e.replace(/\$([a-zA-Z0-9_]+)/g, (o, a) => {
        let s = n.indexOf(a);
        return r && s === -1 ? o : (s === -1 ? t[parseInt(a, 10)] : t[s + 1]) || ""
    })
}

function I(e, {url: t, cookies: n, headers: r, routeDest: o}) {
    switch (e.type) {
        case"host":
            return {valid: t.hostname === e.value};
        case"header":
            return e.value !== void 0 ? M(e.value, r.get(e.key), o) : {valid: r.has(e.key)};
        case"cookie": {
            let a = n[e.key];
            return a && e.value !== void 0 ? M(e.value, a, o) : {valid: a !== void 0}
        }
        case"query":
            return e.value !== void 0 ? M(e.value, t.searchParams.get(e.key), o) : {valid: t.searchParams.has(e.key)}
    }
}

function M(e, t, n) {
    let {match: r, captureGroupKeys: o} = w(e, t);
    return n && r && o.length ? {valid: !!r, newRouteDest: N(n, r, o, {namedOnly: !0})} : {valid: !!r}
}

u();
l();
_();

function G(e) {
    let t = new Headers(e.headers);
    return e.cf && (t.set("x-vercel-ip-city", encodeURIComponent(e.cf.city)), t.set("x-vercel-ip-country", e.cf.country), t.set("x-vercel-ip-country-region", e.cf.regionCode), t.set("x-vercel-ip-latitude", e.cf.latitude), t.set("x-vercel-ip-longitude", e.cf.longitude)), t.set("x-vercel-sc-host", T), new Request(e, {headers: t})
}

u();
l();
_();

function f(e, t, n) {
    let r = t instanceof Headers ? t.entries() : Object.entries(t);
    for (let [o, a] of r) {
        let s = o.toLowerCase(), c = n?.match ? N(a, n.match, n.captureGroupKeys) : a;
        s === "set-cookie" ? e.append(s, c) : e.set(s, c)
    }
}

function b(e) {
    return /^https?:\/\//.test(e)
}

function y(e, t) {
    for (let [n, r] of t.entries()) {
        let o = /^nxtP(.+)$/.exec(n), a = /^nxtI(.+)$/.exec(n);
        o?.[1] ? (e.set(n, r), e.set(o[1], r)) : a?.[1] ? e.set(a[1], r.replace(/(\(\.+\))+/, "")) : (!e.has(n) || !!r && !e.getAll(n).includes(r)) && e.append(n, r)
    }
}

function A(e, t) {
    let n = new URL(t, e.url);
    return y(n.searchParams, new URL(e.url).searchParams), n.pathname = n.pathname.replace(/\/index.html$/, "/").replace(/\.html$/, ""), new Request(n, e)
}

function v(e) {
    return new Response(e.body, e)
}

function L(e) {
    return e.split(",").map(t => {
        let [n, r] = t.split(";"), o = parseFloat((r ?? "q=1").replace(/q *= */gi, ""));
        return [n.trim(), isNaN(o) ? 1 : o]
    }).sort((t, n) => n[1] - t[1]).map(([t]) => t === "*" || t === "" ? [] : t).flat()
}

u();
l();
_();

function O(e) {
    switch (e) {
        case"none":
            return "filesystem";
        case"filesystem":
            return "rewrite";
        case"rewrite":
            return "resource";
        case"resource":
            return "miss";
        default:
            return "miss"
    }
}

async function R(e, {request: t, assetsFetcher: n, ctx: r}, {path: o, searchParams: a}) {
    let s, c = new URL(t.url);
    y(c.searchParams, a);
    let i = new Request(c, t);
    try {
        switch (e?.type) {
            case"function":
            case"middleware": {
                let p = await import(e.entrypoint);
                try {
                    s = await p.default(i, r)
                } catch (d) {
                    let g = d;
                    throw g.name === "TypeError" && g.message.endsWith("default is not a function") ? new Error(`An error occurred while evaluating the target edge function (${e.entrypoint})`) : d
                }
                break
            }
            case"override": {
                s = v(await n.fetch(A(i, e.path ?? o))), e.headers && f(s.headers, e.headers);
                break
            }
            case"static": {
                s = await n.fetch(A(i, o));
                break
            }
            default:
                s = new Response("Not Found", {status: 404})
        }
    } catch (p) {
        return console.error(p), new Response("Internal Server Error", {status: 500})
    }
    return v(s)
}

function B(e, t) {
    let n = "^//?(?:", r = ")/(.*)$";
    return !e.startsWith(n) || !e.endsWith(r) ? !1 : e.slice(n.length, -r.length).split("|").every(a => t.has(a))
}

u();
l();
_();

function pe(e, {protocol: t, hostname: n, port: r, pathname: o}) {
    return !(t && e.protocol.replace(/:$/, "") !== t || !new RegExp(n).test(e.hostname) || r && !new RegExp(r).test(e.port) || o && !new RegExp(o).test(e.pathname))
}

function de(e, t) {
    if (e.method !== "GET") return;
    let {origin: n, searchParams: r} = new URL(e.url), o = r.get("url"), a = Number.parseInt(r.get("w") ?? "", 10),
        s = Number.parseInt(r.get("q") ?? "75", 10);
    if (!o || Number.isNaN(a) || Number.isNaN(s) || !t?.sizes?.includes(a) || s < 0 || s > 100) return;
    let c = new URL(o, n);
    if (c.pathname.endsWith(".svg") && !t?.dangerouslyAllowSVG) return;
    let i = o.startsWith("//"), p = o.startsWith("/") && !i;
    if (!p && !t?.domains?.includes(c.hostname) && !t?.remotePatterns?.find(k => pe(c, k))) return;
    let d = e.headers.get("Accept") ?? "", g = t?.formats?.find(k => d.includes(k))?.replace("image/", "");
    return {isRelative: p, imageUrl: c, options: {width: a, quality: s, format: g}}
}

function he(e, t, n) {
    let r = new Headers;
    if (n?.contentSecurityPolicy && r.set("Content-Security-Policy", n.contentSecurityPolicy), n?.contentDispositionType) {
        let a = t.pathname.split("/").pop(),
            s = a ? `${n.contentDispositionType}; filename="${a}"` : n.contentDispositionType;
        r.set("Content-Disposition", s)
    }
    e.headers.has("Cache-Control") || r.set("Cache-Control", `public, max-age=${n?.minimumCacheTTL ?? 60}`);
    let o = v(e);
    return f(o.headers, r), o
}

async function W(e, {buildOutput: t, assetsFetcher: n, imagesConfig: r}) {
    let o = de(e, r);
    if (!o) return new Response("Invalid image resizing request", {status: 400});
    let {isRelative: a, imageUrl: s} = o, i = await (a && s.pathname in t ? n.fetch.bind(n) : fetch)(s);
    return he(i, s, r)
}

u();
l();
_();
u();
l();
_();
u();
l();
_();

async function P(e) {
    return import(e)
}

var xe = "x-vercel-cache-tags", me = "x-next-cache-soft-tags", ge = Symbol.for("__cloudflare-request-context__");

async function J(e) {
    let t = `https://${T}/v1/suspense-cache/`;
    if (!e.url.startsWith(t)) return null;
    try {
        let n = new URL(e.url), r = await fe();
        if (n.pathname === "/v1/suspense-cache/revalidate") {
            let a = n.searchParams.get("tags")?.split(",") ?? [];
            for (let s of a) await r.revalidateTag(s);
            return new Response(null, {status: 200})
        }
        let o = n.pathname.replace("/v1/suspense-cache/", "");
        if (!o.length) return new Response("Invalid cache key", {status: 400});
        switch (e.method) {
            case"GET": {
                let a = z(e, me), s = await r.get(o, {softTags: a});
                return s ? new Response(JSON.stringify(s.value), {
                    status: 200,
                    headers: {
                        "Content-Type": "application/json",
                        "x-vercel-cache-state": "fresh",
                        age: `${(Date.now() - (s.lastModified ?? Date.now())) / 1e3}`
                    }
                }) : new Response(null, {status: 404})
            }
            case"POST": {
                let a = globalThis[ge], s = async () => {
                    let c = await e.json();
                    c.data.tags === void 0 && (c.tags ??= z(e, xe) ?? []), await r.set(o, c)
                };
                return a ? a.ctx.waitUntil(s()) : await s(), new Response(null, {status: 200})
            }
            default:
                return new Response(null, {status: 405})
        }
    } catch (n) {
        return console.error(n), new Response("Error handling cache request", {status: 500})
    }
}

async function fe() {
    return process.env.__NEXT_ON_PAGES__KV_SUSPENSE_CACHE ? K("kv") : K("cache-api")
}

async function K(e) {
    let t = `./__next-on-pages-dist__/cache/${e}.js`, n = await P(t);
    return new n.default
}

function z(e, t) {
    return e.headers.get(t)?.split(",")?.filter(Boolean)
}

function X() {
    globalThis[Z] || (ye(), globalThis[Z] = !0)
}

function ye() {
    let e = globalThis.fetch;
    globalThis.fetch = async (...t) => {
        let n = new Request(...t), r = await je(n);
        return r || (r = await J(n), r) ? r : (ke(n), e(n))
    }
}

async function je(e) {
    if (e.url.startsWith("blob:")) try {
        let n = `./__next-on-pages-dist__/assets/${new URL(e.url).pathname}.bin`, r = (await P(n)).default, o = {
            async arrayBuffer() {
                return r
            }, get body() {
                return new ReadableStream({
                    start(a) {
                        let s = Buffer.from(r);
                        a.enqueue(s), a.close()
                    }
                })
            }, async text() {
                return Buffer.from(r).toString()
            }, async json() {
                let a = Buffer.from(r);
                return JSON.stringify(a.toString())
            }, async blob() {
                return new Blob(r)
            }
        };
        return o.clone = () => ({...o}), o
    } catch {
    }
    return null
}

function ke(e) {
    e.headers.has("user-agent") || e.headers.set("user-agent", "Next.js Middleware")
}

var Z = Symbol.for("next-on-pages fetch patch");
u();
l();
_();
var Y = F(Q());
var C = class {
    constructor(t, n, r, o, a) {
        this.routes = t;
        this.output = n;
        this.reqCtx = r;
        this.url = new URL(r.request.url), this.cookies = (0, Y.parse)(r.request.headers.get("cookie") || ""), this.path = this.url.pathname || "/", this.headers = {
            normal: new Headers,
            important: new Headers
        }, this.searchParams = new URLSearchParams, y(this.searchParams, this.url.searchParams), this.checkPhaseCounter = 0, this.middlewareInvoked = [], this.wildcardMatch = a?.find(s => s.domain === this.url.hostname), this.locales = new Set(o.collectedLocales)
    }

    url;
    cookies;
    wildcardMatch;
    path;
    status;
    headers;
    searchParams;
    body;
    checkPhaseCounter;
    middlewareInvoked;
    locales;

    checkRouteMatch(t, {checkStatus: n, checkIntercept: r}) {
        let o = w(t.src, this.path, t.caseSensitive);
        if (!o.match || t.methods && !t.methods.map(s => s.toUpperCase()).includes(this.reqCtx.request.method.toUpperCase())) return;
        let a = {url: this.url, cookies: this.cookies, headers: this.reqCtx.request.headers, routeDest: t.dest};
        if (!t.has?.find(s => {
            let c = I(s, a);
            return c.newRouteDest && (a.routeDest = c.newRouteDest), !c.valid
        }) && !t.missing?.find(s => I(s, a).valid) && !(n && t.status !== this.status)) {
            if (r && t.dest) {
                let s = /\/(\(\.+\))+/, c = s.test(t.dest), i = s.test(this.path);
                if (c && !i) return
            }
            return {routeMatch: o, routeDest: a.routeDest}
        }
    }

    processMiddlewareResp(t) {
        let n = "x-middleware-override-headers", r = t.headers.get(n);
        if (r) {
            let i = new Set(r.split(",").map(p => p.trim()));
            for (let p of i.keys()) {
                let d = `x-middleware-request-${p}`, g = t.headers.get(d);
                this.reqCtx.request.headers.get(p) !== g && (g ? this.reqCtx.request.headers.set(p, g) : this.reqCtx.request.headers.delete(p)), t.headers.delete(d)
            }
            t.headers.delete(n)
        }
        let o = "x-middleware-rewrite", a = t.headers.get(o);
        if (a) {
            let i = new URL(a, this.url), p = this.url.hostname !== i.hostname;
            this.path = p ? `${i}` : i.pathname, y(this.searchParams, i.searchParams), t.headers.delete(o)
        }
        let s = "x-middleware-next";
        t.headers.get(s) ? t.headers.delete(s) : !a && !t.headers.has("location") ? (this.body = t.body, this.status = t.status) : t.headers.has("location") && t.status >= 300 && t.status < 400 && (this.status = t.status), f(this.reqCtx.request.headers, t.headers), f(this.headers.normal, t.headers), this.headers.middlewareLocation = t.headers.get("location")
    }

    async runRouteMiddleware(t) {
        if (!t) return !0;
        let n = t && this.output[t];
        if (!n || n.type !== "middleware") return this.status = 500, !1;
        let r = await R(n, this.reqCtx, {
            path: this.path,
            searchParams: this.searchParams,
            headers: this.headers,
            status: this.status
        });
        return this.middlewareInvoked.push(t), r.status === 500 ? (this.status = r.status, !1) : (this.processMiddlewareResp(r), !0)
    }

    applyRouteOverrides(t) {
        !t.override || (this.status = void 0, this.headers.normal = new Headers, this.headers.important = new Headers)
    }

    applyRouteHeaders(t, n, r) {
        !t.headers || (f(this.headers.normal, t.headers, {
            match: n,
            captureGroupKeys: r
        }), t.important && f(this.headers.important, t.headers, {match: n, captureGroupKeys: r}))
    }

    applyRouteStatus(t) {
        !t.status || (this.status = t.status)
    }

    applyRouteDest(t, n, r) {
        if (!t.dest) return this.path;
        let o = this.path, a = t.dest;
        this.wildcardMatch && /\$wildcard/.test(a) && (a = a.replace(/\$wildcard/g, this.wildcardMatch.value)), this.path = N(a, n, r);
        let s = /\/index\.rsc$/i.test(this.path), c = /^\/(?:index)?$/i.test(o),
            i = /^\/__index\.prefetch\.rsc$/i.test(o);
        s && !c && !i && (this.path = o);
        let p = /\.rsc$/i.test(this.path), d = /\.prefetch\.rsc$/i.test(this.path), g = this.path in this.output;
        p && !d && !g && (this.path = this.path.replace(/\.rsc/i, ""));
        let k = new URL(this.path, this.url);
        return y(this.searchParams, k.searchParams), b(this.path) || (this.path = k.pathname), o
    }

    applyLocaleRedirects(t) {
        if (!t.locale?.redirect || !/^\^(.)*$/.test(t.src) && t.src !== this.path || this.headers.normal.has("location")) return;
        let {locale: {redirect: r, cookie: o}} = t, a = o && this.cookies[o], s = L(a ?? ""),
            c = L(this.reqCtx.request.headers.get("accept-language") ?? ""),
            d = [...s, ...c].map(g => r[g]).filter(Boolean)[0];
        if (d) {
            !this.path.startsWith(d) && (this.headers.normal.set("location", d), this.status = 307);
            return
        }
    }

    getLocaleFriendlyRoute(t, n) {
        return !this.locales || n !== "miss" ? t : B(t.src, this.locales) ? {
            ...t,
            src: t.src.replace(/\/\(\.\*\)\$$/, "(?:/(.*))?$")
        } : t
    }

    async checkRoute(t, n) {
        let r = this.getLocaleFriendlyRoute(n, t), {
                routeMatch: o,
                routeDest: a
            } = this.checkRouteMatch(r, {checkStatus: t === "error", checkIntercept: t === "rewrite"}) ?? {},
            s = {...r, dest: a};
        if (!o?.match || s.middlewarePath && this.middlewareInvoked.includes(s.middlewarePath)) return "skip";
        let {match: c, captureGroupKeys: i} = o;
        if (this.applyRouteOverrides(s), this.applyLocaleRedirects(s), !await this.runRouteMiddleware(s.middlewarePath)) return "error";
        if (this.body !== void 0 || this.headers.middlewareLocation) return "done";
        this.applyRouteHeaders(s, c, i), this.applyRouteStatus(s);
        let d = this.applyRouteDest(s, c, i);
        if (s.check && !b(this.path)) if (d === this.path) {
            if (t !== "miss") return this.checkPhase(O(t));
            this.status = 404
        } else if (t === "miss") {
            if (!(this.path in this.output) && !(this.path.replace(/\/$/, "") in this.output)) return this.checkPhase("filesystem");
            this.status === 404 && (this.status = void 0)
        } else return this.checkPhase("none");
        return !s.continue || s.status && s.status >= 300 && s.status <= 399 ? "done" : "next"
    }

    async checkPhase(t) {
        if (this.checkPhaseCounter++ >= 50) return console.error(`Routing encountered an infinite loop while checking ${this.url.pathname}`), this.status = 500, "error";
        this.middlewareInvoked = [];
        let n = !0;
        for (let a of this.routes[t]) {
            let s = await this.checkRoute(t, a);
            if (s === "error") return "error";
            if (s === "done") {
                n = !1;
                break
            }
        }
        if (t === "hit" || b(this.path) || this.headers.normal.has("location") || !!this.body) return "done";
        if (t === "none") for (let a of this.locales) {
            let s = new RegExp(`/${a}(/.*)`), i = this.path.match(s)?.[1];
            if (i && i in this.output) {
                this.path = i;
                break
            }
        }
        let r = this.path in this.output;
        if (!r && this.path.endsWith("/")) {
            let a = this.path.replace(/\/$/, "");
            r = a in this.output, r && (this.path = a)
        }
        if (t === "miss" && !r) {
            let a = !this.status || this.status < 400;
            this.status = a ? 404 : this.status
        }
        let o = "miss";
        return r || t === "miss" || t === "error" ? o = "hit" : n && (o = O(t)), this.checkPhase(o)
    }

    async run(t = "none") {
        this.checkPhaseCounter = 0;
        let n = await this.checkPhase(t);
        return this.headers.normal.has("location") && (!this.status || this.status < 300 || this.status >= 400) && (this.status = 307), n
    }
};

async function ee(e, t, n, r) {
    let o = new C(t.routes, n, e, r, t.wildcard), a = await te(o);
    return Se(e, a, n)
}

async function te(e, t = "none", n = !1) {
    return await e.run(t) === "error" || !n && e.status && e.status >= 400 ? te(e, "error", !0) : {
        path: e.path,
        status: e.status,
        headers: e.headers,
        searchParams: e.searchParams,
        body: e.body
    }
}

async function Se(e, {path: t = "/404", status: n, headers: r, searchParams: o, body: a}, s) {
    let c = r.normal.get("location");
    if (c) {
        if (c !== r.middlewareLocation) {
            let d = [...o.keys()].length ? `?${o.toString()}` : "";
            r.normal.set("location", `${c ?? "/"}${d}`)
        }
        return new Response(null, {status: n, headers: r.normal})
    }
    let i;
    if (a !== void 0) i = new Response(a, {status: n}); else if (b(t)) {
        let d = new URL(t);
        y(d.searchParams, o), i = await fetch(d, e.request)
    } else i = await R(s[t], e, {path: t, status: n, headers: r, searchParams: o});
    let p = r.normal;
    return f(p, i.headers), f(p, r.important), i = new Response(i.body, {...i, status: n || i.status, headers: p}), i
}

u();
l();
_();

function re() {
    globalThis.__nextOnPagesRoutesIsolation ??= {_map: new Map, getProxyFor: Ce}
}

function Ce(e) {
    let t = globalThis.__nextOnPagesRoutesIsolation._map.get(e);
    if (t) return t;
    let n = Ee();
    return globalThis.__nextOnPagesRoutesIsolation._map.set(e, n), n
}

function Ee() {
    let e = new Map;
    return new Proxy(globalThis, {
        get: (t, n) => e.has(n) ? e.get(n) : Reflect.get(globalThis, n),
        set: (t, n, r) => Me.has(n) ? Reflect.set(globalThis, n, r) : (e.set(n, r), !0)
    })
}

var Me = new Set(["_nextOriginalFetch", "fetch", "__incrementalCache"]);
var Ie = Object.defineProperty, Ae = (...e) => {
    let t = e[0], n = e[1], r = "__import_unsupported";
    if (!(n === r && typeof t == "object" && t !== null && r in t)) return Ie(...e)
};
globalThis.Object.defineProperty = Ae;
globalThis.AbortController = class extends AbortController {
    constructor() {
        try {
            super()
        } catch (t) {
            if (t instanceof Error && t.message.includes("Disallowed operation called within global scope")) return {
                signal: {
                    aborted: !1,
                    reason: null,
                    onabort: () => {
                    },
                    throwIfAborted: () => {
                    }
                }, abort() {
                }
            };
            throw t
        }
    }
};
var vr = {
    async fetch(e, t, n) {
        re(), X();
        let r = await __ALSes_PROMISE__;
        if (!r) {
            let s = new URL(e.url),
                c = await t.ASSETS.fetch(`${s.protocol}//${s.host}/cdn-cgi/errors/no-nodejs_compat.html`),
                i = c.ok ? c.body : "Error: Could not access built-in Node.js modules. Please make sure that your Cloudflare Pages project has the 'nodejs_compat' compatibility flag set.";
            return new Response(i, {status: 503})
        }
        let {envAsyncLocalStorage: o, requestContextAsyncLocalStorage: a} = r;
        return o.run({...t, NODE_ENV: "production", SUSPENSE_CACHE_URL: T}, async () => a.run({
            env: t,
            ctx: n,
            cf: e.cf
        }, async () => {
            if (new URL(e.url).pathname.startsWith("/_next/image")) return W(e, {
                buildOutput: x,
                assetsFetcher: t.ASSETS,
                imagesConfig: h.images
            });
            let c = G(e);
            return ee({request: c, ctx: n, assetsFetcher: t.ASSETS}, h, x, m)
        }))
    }
};
export {vr as default};
/*!
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */
