! function(modules) {
    var installedModules = {};

    function __webpack_require__(moduleId) {
        if (installedModules[moduleId]) return installedModules[moduleId].exports;
        var module = installedModules[moduleId] = {
            i: moduleId,
            l: !1,
            exports: {}
        };
        return modules[moduleId].call(module.exports, module, module.exports, __webpack_require__), module.l = !0, module.exports
    }
    __webpack_require__.m = modules, __webpack_require__.c = installedModules, __webpack_require__.d = function(exports, name, getter) {
        __webpack_require__.o(exports, name) || Object.defineProperty(exports, name, {
            enumerable: !0,
            get: getter
        })
    }, __webpack_require__.r = function(exports) {
        "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(exports, Symbol.toStringTag, {
            value: "Module"
        }), Object.defineProperty(exports, "__esModule", {
            value: !0
        })
    }, __webpack_require__.t = function(value, mode) {
        if (1 & mode && (value = __webpack_require__(value)), 8 & mode) return value;
        if (4 & mode && "object" == typeof value && value && value.__esModule) return value;
        var ns = Object.create(null);
        if (__webpack_require__.r(ns), Object.defineProperty(ns, "default", {
                enumerable: !0,
                value: value
            }), 2 & mode && "string" != typeof value)
            for (var key in value) __webpack_require__.d(ns, key, function(key) {
                return value[key]
            }.bind(null, key));
        return ns
    }, __webpack_require__.n = function(module) {
        var getter = module && module.__esModule ? function getDefault() {
            return module.default
        } : function getModuleExports() {
            return module
        };
        return __webpack_require__.d(getter, "a", getter), getter
    }, __webpack_require__.o = function(object, property) {
        return Object.prototype.hasOwnProperty.call(object, property)
    }, __webpack_require__.p = "", __webpack_require__(__webpack_require__.s = 75)
}([function(module, exports) {
    var g;
    g = function() {
        return this
    }();
    try {
        g = g || new Function("return this")()
    } catch (e) {
        "object" == typeof window && (g = window)
    }
    module.exports = g
}, function(module, exports, __webpack_require__) {
    var nativeCreate = __webpack_require__(9)(Object, "create");
    module.exports = nativeCreate
}, function(module, exports, __webpack_require__) {
    var eq = __webpack_require__(40);
    module.exports = function assocIndexOf(array, key) {
        for (var length = array.length; length--;)
            if (eq(array[length][0], key)) return length;
        return -1
    }
}, function(module, exports, __webpack_require__) {
    var isKeyable = __webpack_require__(46);
    module.exports = function getMapData(map, key) {
        var data = map.__data__;
        return isKeyable(key) ? data["string" == typeof key ? "string" : "hash"] : data.map
    }
}, function(module, exports) {
    var isArray = Array.isArray;
    module.exports = isArray
}, function(module, exports, __webpack_require__) {
    var baseGetTag = __webpack_require__(8),
        isObjectLike = __webpack_require__(19),
        symbolTag = "[object Symbol]";
    module.exports = function isSymbol(value) {
        return "symbol" == typeof value || isObjectLike(value) && baseGetTag(value) == symbolTag
    }
}, function(module, exports, __webpack_require__) {
    var Symbol = __webpack_require__(7).Symbol;
    module.exports = Symbol
}, function(module, exports, __webpack_require__) {
    var freeGlobal = __webpack_require__(16),
        freeSelf = "object" == typeof self && self && self.Object === Object && self,
        root = freeGlobal || freeSelf || Function("return this")();
    module.exports = root
}, function(module, exports, __webpack_require__) {
    var Symbol = __webpack_require__(6),
        getRawTag = __webpack_require__(17),
        objectToString = __webpack_require__(18),
        nullTag = "[object Null]",
        undefinedTag = "[object Undefined]",
        symToStringTag = Symbol ? Symbol.toStringTag : void 0;
    module.exports = function baseGetTag(value) {
        return null == value ? void 0 === value ? undefinedTag : nullTag : symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value)
    }
}, function(module, exports, __webpack_require__) {
    var baseIsNative = __webpack_require__(27),
        getValue = __webpack_require__(32);
    module.exports = function getNative(object, key) {
        var value = getValue(object, key);
        return baseIsNative(value) ? value : void 0
    }
}, function(module, exports) {
    module.exports = function isObject(value) {
        var type = typeof value;
        return null != value && ("object" == type || "function" == type)
    }
}, function(module, exports, __webpack_require__) {
    (function(global) {
        module.exports = global.jQuery = __webpack_require__(57)
    }).call(this, __webpack_require__(0))
}, function(module, exports, __webpack_require__) {
    var baseGet = __webpack_require__(13);
    module.exports = function get(object, path, defaultValue) {
        var result = null == object ? void 0 : baseGet(object, path);
        return void 0 === result ? defaultValue : result
    }
}, function(module, exports, __webpack_require__) {
    var castPath = __webpack_require__(14),
        toKey = __webpack_require__(53);
    module.exports = function baseGet(object, path) {
        for (var index = 0, length = (path = castPath(path, object)).length; null != object && index < length;) object = object[toKey(path[index++])];
        return index && index == length ? object : void 0
    }
}, function(module, exports, __webpack_require__) {
    var isArray = __webpack_require__(4),
        isKey = __webpack_require__(15),
        stringToPath = __webpack_require__(20),
        toString = __webpack_require__(50);
    module.exports = function castPath(value, object) {
        return isArray(value) ? value : isKey(value, object) ? [value] : stringToPath(toString(value))
    }
}, function(module, exports, __webpack_require__) {
    var isArray = __webpack_require__(4),
        isSymbol = __webpack_require__(5),
        reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
        reIsPlainProp = /^\w*$/;
    module.exports = function isKey(value, object) {
        if (isArray(value)) return !1;
        var type = typeof value;
        return !("number" != type && "symbol" != type && "boolean" != type && null != value && !isSymbol(value)) || reIsPlainProp.test(value) || !reIsDeepProp.test(value) || null != object && value in Object(object)
    }
}, function(module, exports, __webpack_require__) {
    (function(global) {
        var freeGlobal = "object" == typeof global && global && global.Object === Object && global;
        module.exports = freeGlobal
    }).call(this, __webpack_require__(0))
}, function(module, exports, __webpack_require__) {
    var Symbol = __webpack_require__(6),
        objectProto = Object.prototype,
        hasOwnProperty = objectProto.hasOwnProperty,
        nativeObjectToString = objectProto.toString,
        symToStringTag = Symbol ? Symbol.toStringTag : void 0;
    module.exports = function getRawTag(value) {
        var isOwn = hasOwnProperty.call(value, symToStringTag),
            tag = value[symToStringTag];
        try {
            value[symToStringTag] = void 0;
            var unmasked = !0
        } catch (e) {}
        var result = nativeObjectToString.call(value);
        return unmasked && (isOwn ? value[symToStringTag] = tag : delete value[symToStringTag]), result
    }
}, function(module, exports) {
    var nativeObjectToString = Object.prototype.toString;
    module.exports = function objectToString(value) {
        return nativeObjectToString.call(value)
    }
}, function(module, exports) {
    module.exports = function isObjectLike(value) {
        return null != value && "object" == typeof value
    }
}, function(module, exports, __webpack_require__) {
    var memoizeCapped = __webpack_require__(21),
        rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,
        reEscapeChar = /\\(\\)?/g,
        stringToPath = memoizeCapped(function(string) {
            var result = [];
            return 46 === string.charCodeAt(0) && result.push(""), string.replace(rePropName, function(match, number, quote, subString) {
                result.push(quote ? subString.replace(reEscapeChar, "$1") : number || match)
            }), result
        });
    module.exports = stringToPath
}, function(module, exports, __webpack_require__) {
    var memoize = __webpack_require__(22),
        MAX_MEMOIZE_SIZE = 500;
    module.exports = function memoizeCapped(func) {
        var result = memoize(func, function(key) {
                return cache.size === MAX_MEMOIZE_SIZE && cache.clear(), key
            }),
            cache = result.cache;
        return result
    }
}, function(module, exports, __webpack_require__) {
    var MapCache = __webpack_require__(23),
        FUNC_ERROR_TEXT = "Expected a function";

    function memoize(func, resolver) {
        if ("function" != typeof func || null != resolver && "function" != typeof resolver) throw new TypeError(FUNC_ERROR_TEXT);
        var memoized = function() {
            var args = arguments,
                key = resolver ? resolver.apply(this, args) : args[0],
                cache = memoized.cache;
            if (cache.has(key)) return cache.get(key);
            var result = func.apply(this, args);
            return memoized.cache = cache.set(key, result) || cache, result
        };
        return memoized.cache = new(memoize.Cache || MapCache), memoized
    }
    memoize.Cache = MapCache, module.exports = memoize
}, function(module, exports, __webpack_require__) {
    var mapCacheClear = __webpack_require__(24),
        mapCacheDelete = __webpack_require__(45),
        mapCacheGet = __webpack_require__(47),
        mapCacheHas = __webpack_require__(48),
        mapCacheSet = __webpack_require__(49);

    function MapCache(entries) {
        var index = -1,
            length = null == entries ? 0 : entries.length;
        for (this.clear(); ++index < length;) {
            var entry = entries[index];
            this.set(entry[0], entry[1])
        }
    }
    MapCache.prototype.clear = mapCacheClear, MapCache.prototype.delete = mapCacheDelete, MapCache.prototype.get = mapCacheGet, MapCache.prototype.has = mapCacheHas, MapCache.prototype.set = mapCacheSet, module.exports = MapCache
}, function(module, exports, __webpack_require__) {
    var Hash = __webpack_require__(25),
        ListCache = __webpack_require__(37),
        Map = __webpack_require__(44);
    module.exports = function mapCacheClear() {
        this.size = 0, this.__data__ = {
            hash: new Hash,
            map: new(Map || ListCache),
            string: new Hash
        }
    }
}, function(module, exports, __webpack_require__) {
    var hashClear = __webpack_require__(26),
        hashDelete = __webpack_require__(33),
        hashGet = __webpack_require__(34),
        hashHas = __webpack_require__(35),
        hashSet = __webpack_require__(36);

    function Hash(entries) {
        var index = -1,
            length = null == entries ? 0 : entries.length;
        for (this.clear(); ++index < length;) {
            var entry = entries[index];
            this.set(entry[0], entry[1])
        }
    }
    Hash.prototype.clear = hashClear, Hash.prototype.delete = hashDelete, Hash.prototype.get = hashGet, Hash.prototype.has = hashHas, Hash.prototype.set = hashSet, module.exports = Hash
}, function(module, exports, __webpack_require__) {
    var nativeCreate = __webpack_require__(1);
    module.exports = function hashClear() {
        this.__data__ = nativeCreate ? nativeCreate(null) : {}, this.size = 0
    }
}, function(module, exports, __webpack_require__) {
    var isFunction = __webpack_require__(28),
        isMasked = __webpack_require__(29),
        isObject = __webpack_require__(10),
        toSource = __webpack_require__(31),
        reIsHostCtor = /^\[object .+?Constructor\]$/,
        funcProto = Function.prototype,
        objectProto = Object.prototype,
        funcToString = funcProto.toString,
        hasOwnProperty = objectProto.hasOwnProperty,
        reIsNative = RegExp("^" + funcToString.call(hasOwnProperty).replace(/[\\^$.*+?()[\]{}|]/g, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$");
    module.exports = function baseIsNative(value) {
        return !(!isObject(value) || isMasked(value)) && (isFunction(value) ? reIsNative : reIsHostCtor).test(toSource(value))
    }
}, function(module, exports, __webpack_require__) {
    var baseGetTag = __webpack_require__(8),
        isObject = __webpack_require__(10),
        asyncTag = "[object AsyncFunction]",
        funcTag = "[object Function]",
        genTag = "[object GeneratorFunction]",
        proxyTag = "[object Proxy]";
    module.exports = function isFunction(value) {
        if (!isObject(value)) return !1;
        var tag = baseGetTag(value);
        return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag
    }
}, function(module, exports, __webpack_require__) {
    var uid, coreJsData = __webpack_require__(30),
        maskSrcKey = (uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "")) ? "Symbol(src)_1." + uid : "";
    module.exports = function isMasked(func) {
        return !!maskSrcKey && maskSrcKey in func
    }
}, function(module, exports, __webpack_require__) {
    var coreJsData = __webpack_require__(7)["__core-js_shared__"];
    module.exports = coreJsData
}, function(module, exports) {
    var funcToString = Function.prototype.toString;
    module.exports = function toSource(func) {
        if (null != func) {
            try {
                return funcToString.call(func)
            } catch (e) {}
            try {
                return func + ""
            } catch (e) {}
        }
        return ""
    }
}, function(module, exports) {
    module.exports = function getValue(object, key) {
        return null == object ? void 0 : object[key]
    }
}, function(module, exports) {
    module.exports = function hashDelete(key) {
        var result = this.has(key) && delete this.__data__[key];
        return this.size -= result ? 1 : 0, result
    }
}, function(module, exports, __webpack_require__) {
    var nativeCreate = __webpack_require__(1),
        HASH_UNDEFINED = "__lodash_hash_undefined__",
        hasOwnProperty = Object.prototype.hasOwnProperty;
    module.exports = function hashGet(key) {
        var data = this.__data__;
        if (nativeCreate) {
            var result = data[key];
            return result === HASH_UNDEFINED ? void 0 : result
        }
        return hasOwnProperty.call(data, key) ? data[key] : void 0
    }
}, function(module, exports, __webpack_require__) {
    var nativeCreate = __webpack_require__(1),
        hasOwnProperty = Object.prototype.hasOwnProperty;
    module.exports = function hashHas(key) {
        var data = this.__data__;
        return nativeCreate ? void 0 !== data[key] : hasOwnProperty.call(data, key)
    }
}, function(module, exports, __webpack_require__) {
    var nativeCreate = __webpack_require__(1),
        HASH_UNDEFINED = "__lodash_hash_undefined__";
    module.exports = function hashSet(key, value) {
        var data = this.__data__;
        return this.size += this.has(key) ? 0 : 1, data[key] = nativeCreate && void 0 === value ? HASH_UNDEFINED : value, this
    }
}, function(module, exports, __webpack_require__) {
    var listCacheClear = __webpack_require__(38),
        listCacheDelete = __webpack_require__(39),
        listCacheGet = __webpack_require__(41),
        listCacheHas = __webpack_require__(42),
        listCacheSet = __webpack_require__(43);

    function ListCache(entries) {
        var index = -1,
            length = null == entries ? 0 : entries.length;
        for (this.clear(); ++index < length;) {
            var entry = entries[index];
            this.set(entry[0], entry[1])
        }
    }
    ListCache.prototype.clear = listCacheClear, ListCache.prototype.delete = listCacheDelete, ListCache.prototype.get = listCacheGet, ListCache.prototype.has = listCacheHas, ListCache.prototype.set = listCacheSet, module.exports = ListCache
}, function(module, exports) {
    module.exports = function listCacheClear() {
        this.__data__ = [], this.size = 0
    }
}, function(module, exports, __webpack_require__) {
    var assocIndexOf = __webpack_require__(2),
        splice = Array.prototype.splice;
    module.exports = function listCacheDelete(key) {
        var data = this.__data__,
            index = assocIndexOf(data, key);
        return !(index < 0 || (index == data.length - 1 ? data.pop() : splice.call(data, index, 1), --this.size, 0))
    }
}, function(module, exports) {
    module.exports = function eq(value, other) {
        return value === other || value != value && other != other
    }
}, function(module, exports, __webpack_require__) {
    var assocIndexOf = __webpack_require__(2);
    module.exports = function listCacheGet(key) {
        var data = this.__data__,
            index = assocIndexOf(data, key);
        return index < 0 ? void 0 : data[index][1]
    }
}, function(module, exports, __webpack_require__) {
    var assocIndexOf = __webpack_require__(2);
    module.exports = function listCacheHas(key) {
        return assocIndexOf(this.__data__, key) > -1
    }
}, function(module, exports, __webpack_require__) {
    var assocIndexOf = __webpack_require__(2);
    module.exports = function listCacheSet(key, value) {
        var data = this.__data__,
            index = assocIndexOf(data, key);
        return index < 0 ? (++this.size, data.push([key, value])) : data[index][1] = value, this
    }
}, function(module, exports, __webpack_require__) {
    var Map = __webpack_require__(9)(__webpack_require__(7), "Map");
    module.exports = Map
}, function(module, exports, __webpack_require__) {
    var getMapData = __webpack_require__(3);
    module.exports = function mapCacheDelete(key) {
        var result = getMapData(this, key).delete(key);
        return this.size -= result ? 1 : 0, result
    }
}, function(module, exports) {
    module.exports = function isKeyable(value) {
        var type = typeof value;
        return "string" == type || "number" == type || "symbol" == type || "boolean" == type ? "__proto__" !== value : null === value
    }
}, function(module, exports, __webpack_require__) {
    var getMapData = __webpack_require__(3);
    module.exports = function mapCacheGet(key) {
        return getMapData(this, key).get(key)
    }
}, function(module, exports, __webpack_require__) {
    var getMapData = __webpack_require__(3);
    module.exports = function mapCacheHas(key) {
        return getMapData(this, key).has(key)
    }
}, function(module, exports, __webpack_require__) {
    var getMapData = __webpack_require__(3);
    module.exports = function mapCacheSet(key, value) {
        var data = getMapData(this, key),
            size = data.size;
        return data.set(key, value), this.size += data.size == size ? 0 : 1, this
    }
}, function(module, exports, __webpack_require__) {
    var baseToString = __webpack_require__(51);
    module.exports = function toString(value) {
        return null == value ? "" : baseToString(value)
    }
}, function(module, exports, __webpack_require__) {
    var Symbol = __webpack_require__(6),
        arrayMap = __webpack_require__(52),
        isArray = __webpack_require__(4),
        isSymbol = __webpack_require__(5),
        INFINITY = 1 / 0,
        symbolProto = Symbol ? Symbol.prototype : void 0,
        symbolToString = symbolProto ? symbolProto.toString : void 0;
    module.exports = function baseToString(value) {
        if ("string" == typeof value) return value;
        if (isArray(value)) return arrayMap(value, baseToString) + "";
        if (isSymbol(value)) return symbolToString ? symbolToString.call(value) : "";
        var result = value + "";
        return "0" == result && 1 / value == -INFINITY ? "-0" : result
    }
}, function(module, exports) {
    module.exports = function arrayMap(array, iteratee) {
        for (var index = -1, length = null == array ? 0 : array.length, result = Array(length); ++index < length;) result[index] = iteratee(array[index], index, array);
        return result
    }
}, function(module, exports, __webpack_require__) {
    var isSymbol = __webpack_require__(5),
        INFINITY = 1 / 0;
    module.exports = function toKey(value) {
        if ("string" == typeof value || isSymbol(value)) return value;
        var result = value + "";
        return "0" == result && 1 / value == -INFINITY ? "-0" : result
    }
}, function(module, exports, __webpack_require__) {
    (function(global) {
        module.exports = global.AOS = __webpack_require__(55)
    }).call(this, __webpack_require__(0))
}, function(module, exports, __webpack_require__) {
    module.exports = function(e) {
        function t(o) {
            if (n[o]) return n[o].exports;
            var i = n[o] = {
                exports: {},
                id: o,
                loaded: !1
            };
            return e[o].call(i.exports, i, i.exports, t), i.loaded = !0, i.exports
        }
        var n = {};
        return t.m = e, t.c = n, t.p = "dist/", t(0)
    }([function(e, t, n) {
        "use strict";

        function o(e) {
            return e && e.__esModule ? e : {
                default: e
            }
        }
        var i = Object.assign || function(e) {
                for (var t = 1; t < arguments.length; t++) {
                    var n = arguments[t];
                    for (var o in n) Object.prototype.hasOwnProperty.call(n, o) && (e[o] = n[o])
                }
                return e
            },
            r = n(1),
            a = (o(r), n(6)),
            u = o(a),
            c = n(7),
            s = o(c),
            f = n(8),
            d = o(f),
            l = n(9),
            p = o(l),
            m = n(10),
            b = o(m),
            v = n(11),
            y = o(v),
            g = n(14),
            h = o(g),
            w = [],
            k = !1,
            x = {
                offset: 120,
                delay: 0,
                easing: "ease",
                duration: 400,
                disable: !1,
                once: !1,
                startEvent: "DOMContentLoaded",
                throttleDelay: 99,
                debounceDelay: 50,
                disableMutationObserver: !1
            },
            j = function() {
                var e = arguments.length > 0 && void 0 !== arguments[0] && arguments[0];
                if (e && (k = !0), k) return w = (0, y.default)(w, x), (0, b.default)(w, x.once), w
            },
            O = function() {
                w = (0, h.default)(), j()
            };
        e.exports = {
            init: function(e) {
                x = i(x, e), w = (0, h.default)();
                var t = document.all && !window.atob;
                return function(e) {
                    return !0 === e || "mobile" === e && p.default.mobile() || "phone" === e && p.default.phone() || "tablet" === e && p.default.tablet() || "function" == typeof e && !0 === e()
                }(x.disable) || t ? void w.forEach(function(e, t) {
                    e.node.removeAttribute("data-aos"), e.node.removeAttribute("data-aos-easing"), e.node.removeAttribute("data-aos-duration"), e.node.removeAttribute("data-aos-delay")
                }) : (x.disableMutationObserver || d.default.isSupported() || (console.info('\n      aos: MutationObserver is not supported on this browser,\n      code mutations observing has been disabled.\n      You may have to call "refreshHard()" by yourself.\n    '), x.disableMutationObserver = !0), document.querySelector("body").setAttribute("data-aos-easing", x.easing), document.querySelector("body").setAttribute("data-aos-duration", x.duration), document.querySelector("body").setAttribute("data-aos-delay", x.delay), "DOMContentLoaded" === x.startEvent && ["complete", "interactive"].indexOf(document.readyState) > -1 ? j(!0) : "load" === x.startEvent ? window.addEventListener(x.startEvent, function() {
                    j(!0)
                }) : document.addEventListener(x.startEvent, function() {
                    j(!0)
                }), window.addEventListener("resize", (0, s.default)(j, x.debounceDelay, !0)), window.addEventListener("orientationchange", (0, s.default)(j, x.debounceDelay, !0)), window.addEventListener("scroll", (0, u.default)(function() {
                    (0, b.default)(w, x.once)
                }, x.throttleDelay)), x.disableMutationObserver || d.default.ready("[data-aos]", O), w)
            },
            refresh: j,
            refreshHard: O
        }
    }, function(e, t) {}, , , , , function(e, t) {
        (function(t) {
            "use strict";

            function n(e, t, n) {
                function o(t) {
                    var n = b,
                        o = v;
                    return b = v = void 0, k = t, g = e.apply(o, n)
                }

                function c(e) {
                    var n = e - w,
                        o = e - k;
                    return void 0 === w || n >= t || n < 0 || S && o >= y
                }

                function f() {
                    var e = O();
                    return c(e) ? d(e) : void(h = setTimeout(f, function a(e) {
                        var o = e - k,
                            i = t - (e - w);
                        return S ? j(i, y - o) : i
                    }(e)))
                }

                function d(e) {
                    return h = void 0, _ && b ? o(e) : (b = v = void 0, g)
                }

                function m() {
                    var e = O(),
                        n = c(e);
                    if (b = arguments, v = this, w = e, n) {
                        if (void 0 === h) return function r(e) {
                            return k = e, h = setTimeout(f, t), M ? o(e) : g
                        }(w);
                        if (S) return h = setTimeout(f, t), o(w)
                    }
                    return void 0 === h && (h = setTimeout(f, t)), g
                }
                var b, v, y, g, h, w, k = 0,
                    M = !1,
                    S = !1,
                    _ = !0;
                if ("function" != typeof e) throw new TypeError(s);
                return t = u(t) || 0, i(n) && (M = !!n.leading, y = (S = "maxWait" in n) ? x(u(n.maxWait) || 0, t) : y, _ = "trailing" in n ? !!n.trailing : _), m.cancel = function l() {
                    void 0 !== h && clearTimeout(h), k = 0, b = w = v = h = void 0
                }, m.flush = function p() {
                    return void 0 === h ? g : d(O())
                }, m
            }

            function i(e) {
                var t = void 0 === e ? "undefined" : c(e);
                return !!e && ("object" == t || "function" == t)
            }

            function a(e) {
                return "symbol" == (void 0 === e ? "undefined" : c(e)) || function r(e) {
                    return !!e && "object" == (void 0 === e ? "undefined" : c(e))
                }(e) && k.call(e) == d
            }

            function u(e) {
                if ("number" == typeof e) return e;
                if (a(e)) return f;
                if (i(e)) {
                    var t = "function" == typeof e.valueOf ? e.valueOf() : e;
                    e = i(t) ? t + "" : t
                }
                if ("string" != typeof e) return 0 === e ? e : +e;
                e = e.replace(l, "");
                var n = m.test(e);
                return n || b.test(e) ? v(e.slice(2), n ? 2 : 8) : p.test(e) ? f : +e
            }
            var c = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
                    return typeof e
                } : function(e) {
                    return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
                },
                s = "Expected a function",
                f = NaN,
                d = "[object Symbol]",
                l = /^\s+|\s+$/g,
                p = /^[-+]0x[0-9a-f]+$/i,
                m = /^0b[01]+$/i,
                b = /^0o[0-7]+$/i,
                v = parseInt,
                y = "object" == (void 0 === t ? "undefined" : c(t)) && t && t.Object === Object && t,
                g = "object" == ("undefined" == typeof self ? "undefined" : c(self)) && self && self.Object === Object && self,
                h = y || g || Function("return this")(),
                w = Object.prototype,
                k = w.toString,
                x = Math.max,
                j = Math.min,
                O = function() {
                    return h.Date.now()
                };
            e.exports = function o(e, t, o) {
                var r = !0,
                    a = !0;
                if ("function" != typeof e) throw new TypeError(s);
                return i(o) && (r = "leading" in o ? !!o.leading : r, a = "trailing" in o ? !!o.trailing : a), n(e, t, {
                    leading: r,
                    maxWait: t,
                    trailing: a
                })
            }
        }).call(t, function() {
            return this
        }())
    }, function(e, t) {
        (function(t) {
            "use strict";

            function o(e) {
                var t = void 0 === e ? "undefined" : u(e);
                return !!e && ("object" == t || "function" == t)
            }

            function r(e) {
                return "symbol" == (void 0 === e ? "undefined" : u(e)) || function i(e) {
                    return !!e && "object" == (void 0 === e ? "undefined" : u(e))
                }(e) && w.call(e) == f
            }

            function a(e) {
                if ("number" == typeof e) return e;
                if (r(e)) return s;
                if (o(e)) {
                    var t = "function" == typeof e.valueOf ? e.valueOf() : e;
                    e = o(t) ? t + "" : t
                }
                if ("string" != typeof e) return 0 === e ? e : +e;
                e = e.replace(d, "");
                var n = p.test(e);
                return n || m.test(e) ? b(e.slice(2), n ? 2 : 8) : l.test(e) ? s : +e
            }
            var u = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
                    return typeof e
                } : function(e) {
                    return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
                },
                c = "Expected a function",
                s = NaN,
                f = "[object Symbol]",
                d = /^\s+|\s+$/g,
                l = /^[-+]0x[0-9a-f]+$/i,
                p = /^0b[01]+$/i,
                m = /^0o[0-7]+$/i,
                b = parseInt,
                v = "object" == (void 0 === t ? "undefined" : u(t)) && t && t.Object === Object && t,
                y = "object" == ("undefined" == typeof self ? "undefined" : u(self)) && self && self.Object === Object && self,
                g = v || y || Function("return this")(),
                h = Object.prototype,
                w = h.toString,
                k = Math.max,
                x = Math.min,
                j = function() {
                    return g.Date.now()
                };
            e.exports = function n(e, t, n) {
                function i(t) {
                    var n = b,
                        o = v;
                    return b = v = void 0, O = t, g = e.apply(o, n)
                }

                function s(e) {
                    var n = e - w,
                        o = e - O;
                    return void 0 === w || n >= t || n < 0 || S && o >= y
                }

                function f() {
                    var e = j();
                    return s(e) ? d(e) : void(h = setTimeout(f, function u(e) {
                        var o = e - O,
                            i = t - (e - w);
                        return S ? x(i, y - o) : i
                    }(e)))
                }

                function d(e) {
                    return h = void 0, _ && b ? i(e) : (b = v = void 0, g)
                }

                function m() {
                    var e = j(),
                        n = s(e);
                    if (b = arguments, v = this, w = e, n) {
                        if (void 0 === h) return function r(e) {
                            return O = e, h = setTimeout(f, t), M ? i(e) : g
                        }(w);
                        if (S) return h = setTimeout(f, t), i(w)
                    }
                    return void 0 === h && (h = setTimeout(f, t)), g
                }
                var b, v, y, g, h, w, O = 0,
                    M = !1,
                    S = !1,
                    _ = !0;
                if ("function" != typeof e) throw new TypeError(c);
                return t = a(t) || 0, o(n) && (M = !!n.leading, y = (S = "maxWait" in n) ? k(a(n.maxWait) || 0, t) : y, _ = "trailing" in n ? !!n.trailing : _), m.cancel = function l() {
                    void 0 !== h && clearTimeout(h), O = 0, b = w = v = h = void 0
                }, m.flush = function p() {
                    return void 0 === h ? g : d(j())
                }, m
            }
        }).call(t, function() {
            return this
        }())
    }, function(e, t) {
        "use strict";

        function o() {
            return window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver
        }

        function a(e) {
            e && e.forEach(function(e) {
                var t = Array.prototype.slice.call(e.addedNodes),
                    o = Array.prototype.slice.call(e.removedNodes),
                    i = t.concat(o);
                if (function n(e) {
                        var t = void 0,
                            o = void 0;
                        for (t = 0; t < e.length; t += 1) {
                            if ((o = e[t]).dataset && o.dataset.aos) return !0;
                            if (o.children && n(o.children)) return !0
                        }
                        return !1
                    }(i)) return u()
            })
        }
        Object.defineProperty(t, "__esModule", {
            value: !0
        });
        var u = function() {};
        t.default = {
            isSupported: function i() {
                return !!o()
            },
            ready: function r(e, t) {
                var n = window.document,
                    r = new(o())(a);
                u = t, r.observe(n.documentElement, {
                    childList: !0,
                    subtree: !0,
                    removedNodes: !0
                })
            }
        }
    }, function(e, t) {
        "use strict";

        function o() {
            return navigator.userAgent || navigator.vendor || window.opera || ""
        }
        Object.defineProperty(t, "__esModule", {
            value: !0
        });
        var i = function() {
                function e(e, t) {
                    for (var n = 0; n < t.length; n++) {
                        var o = t[n];
                        o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, o.key, o)
                    }
                }
                return function(t, n, o) {
                    return n && e(t.prototype, n), o && e(t, o), t
                }
            }(),
            r = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i,
            a = /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i,
            u = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i,
            c = /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i,
            s = function() {
                function e() {
                    ! function n(e, t) {
                        if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
                    }(this, e)
                }
                return i(e, [{
                    key: "phone",
                    value: function() {
                        var e = o();
                        return !(!r.test(e) && !a.test(e.substr(0, 4)))
                    }
                }, {
                    key: "mobile",
                    value: function() {
                        var e = o();
                        return !(!u.test(e) && !c.test(e.substr(0, 4)))
                    }
                }, {
                    key: "tablet",
                    value: function() {
                        return this.mobile() && !this.phone()
                    }
                }]), e
            }();
        t.default = new s
    }, function(e, t) {
        "use strict";
        Object.defineProperty(t, "__esModule", {
            value: !0
        }), t.default = function(e, t) {
            var o = window.pageYOffset,
                i = window.innerHeight;
            e.forEach(function(e, r) {
                ! function(e, t, n) {
                    var o = e.node.getAttribute("data-aos-once");
                    t > e.position ? e.node.classList.add("aos-animate") : void 0 !== o && ("false" === o || !n && "true" !== o) && e.node.classList.remove("aos-animate")
                }(e, i + o, t)
            })
        }
    }, function(e, t, n) {
        "use strict";
        Object.defineProperty(t, "__esModule", {
            value: !0
        });
        var i = n(12),
            r = function o(e) {
                return e && e.__esModule ? e : {
                    default: e
                }
            }(i);
        t.default = function(e, t) {
            return e.forEach(function(e, n) {
                e.node.classList.add("aos-init"), e.position = (0, r.default)(e.node, t.offset)
            }), e
        }
    }, function(e, t, n) {
        "use strict";
        Object.defineProperty(t, "__esModule", {
            value: !0
        });
        var i = n(13),
            r = function o(e) {
                return e && e.__esModule ? e : {
                    default: e
                }
            }(i);
        t.default = function(e, t) {
            var n = 0,
                o = 0,
                i = window.innerHeight,
                a = {
                    offset: e.getAttribute("data-aos-offset"),
                    anchor: e.getAttribute("data-aos-anchor"),
                    anchorPlacement: e.getAttribute("data-aos-anchor-placement")
                };
            switch (a.offset && !isNaN(a.offset) && (o = parseInt(a.offset)), a.anchor && document.querySelectorAll(a.anchor) && (e = document.querySelectorAll(a.anchor)[0]), n = (0, r.default)(e).top, a.anchorPlacement) {
                case "top-bottom":
                    break;
                case "center-bottom":
                    n += e.offsetHeight / 2;
                    break;
                case "bottom-bottom":
                    n += e.offsetHeight;
                    break;
                case "top-center":
                    n += i / 2;
                    break;
                case "bottom-center":
                    n += i / 2 + e.offsetHeight;
                    break;
                case "center-center":
                    n += i / 2 + e.offsetHeight / 2;
                    break;
                case "top-top":
                    n += i;
                    break;
                case "bottom-top":
                    n += e.offsetHeight + i;
                    break;
                case "center-top":
                    n += e.offsetHeight / 2 + i
            }
            return a.anchorPlacement || a.offset || isNaN(t) || (o = t), n + o
        }
    }, function(e, t) {
        "use strict";
        Object.defineProperty(t, "__esModule", {
            value: !0
        }), t.default = function(e) {
            for (var t = 0, n = 0; e && !isNaN(e.offsetLeft) && !isNaN(e.offsetTop);) t += e.offsetLeft - ("BODY" != e.tagName ? e.scrollLeft : 0), n += e.offsetTop - ("BODY" != e.tagName ? e.scrollTop : 0), e = e.offsetParent;
            return {
                top: n,
                left: t
            }
        }
    }, function(e, t) {
        "use strict";
        Object.defineProperty(t, "__esModule", {
            value: !0
        }), t.default = function(e) {
            return e = e || document.querySelectorAll("[data-aos]"), Array.prototype.map.call(e, function(e) {
                return {
                    node: e
                }
            })
        }
    }])
}, function(module, exports, __webpack_require__) {
    var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;
    ! function(i) {
        "use strict";
        __WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], void 0 === (__WEBPACK_AMD_DEFINE_RESULT__ = "function" == typeof(__WEBPACK_AMD_DEFINE_FACTORY__ = function(i) {
            var e = window.Slick || {};
            (e = function() {
                var e = 0;
                return function(t, o) {
                    var s, n = this;
                    n.defaults = {
                        accessibility: !0,
                        adaptiveHeight: !1,
                        appendArrows: i(t),
                        appendDots: i(t),
                        arrows: !0,
                        asNavFor: null,
                        prevArrow: '<button class="slick-prev" aria-label="Previous" type="button">Previous</button>',
                        nextArrow: '<button class="slick-next" aria-label="Next" type="button">Next</button>',
                        autoplay: !1,
                        autoplaySpeed: 3e3,
                        centerMode: !1,
                        centerPadding: "50px",
                        cssEase: "ease",
                        customPaging: function(e, t) {
                            return i('<button type="button" />').text(t + 1)
                        },
                        dots: !1,
                        dotsClass: "slick-dots",
                        draggable: !0,
                        easing: "linear",
                        edgeFriction: .35,
                        fade: !1,
                        focusOnSelect: !1,
                        focusOnChange: !1,
                        infinite: !0,
                        initialSlide: 0,
                        lazyLoad: "ondemand",
                        mobileFirst: !1,
                        pauseOnHover: !0,
                        pauseOnFocus: !0,
                        pauseOnDotsHover: !1,
                        respondTo: "window",
                        responsive: null,
                        rows: 1,
                        rtl: !1,
                        slide: "",
                        slidesPerRow: 1,
                        slidesToShow: 1,
                        slidesToScroll: 1,
                        speed: 500,
                        swipe: !0,
                        swipeToSlide: !1,
                        touchMove: !0,
                        touchThreshold: 5,
                        useCSS: !0,
                        useTransform: !0,
                        variableWidth: !1,
                        vertical: !1,
                        verticalSwiping: !1,
                        waitForAnimate: !0,
                        zIndex: 1e3
                    }, n.initials = {
                        animating: !1,
                        dragging: !1,
                        autoPlayTimer: null,
                        currentDirection: 0,
                        currentLeft: null,
                        currentSlide: 0,
                        direction: 1,
                        $dots: null,
                        listWidth: null,
                        listHeight: null,
                        loadIndex: 0,
                        $nextArrow: null,
                        $prevArrow: null,
                        scrolling: !1,
                        slideCount: null,
                        slideWidth: null,
                        $slideTrack: null,
                        $slides: null,
                        sliding: !1,
                        slideOffset: 0,
                        swipeLeft: null,
                        swiping: !1,
                        $list: null,
                        touchObject: {},
                        transformsEnabled: !1,
                        unslicked: !1
                    }, i.extend(n, n.initials), n.activeBreakpoint = null, n.animType = null, n.animProp = null, n.breakpoints = [], n.breakpointSettings = [], n.cssTransitions = !1, n.focussed = !1, n.interrupted = !1, n.hidden = "hidden", n.paused = !0, n.positionProp = null, n.respondTo = null, n.rowCount = 1, n.shouldClick = !0, n.$slider = i(t), n.$slidesCache = null, n.transformType = null, n.transitionType = null, n.visibilityChange = "visibilitychange", n.windowWidth = 0, n.windowTimer = null, s = i(t).data("slick") || {}, n.options = i.extend({}, n.defaults, o, s), n.currentSlide = n.options.initialSlide, n.originalSettings = n.options, void 0 !== document.mozHidden ? (n.hidden = "mozHidden", n.visibilityChange = "mozvisibilitychange") : void 0 !== document.webkitHidden && (n.hidden = "webkitHidden", n.visibilityChange = "webkitvisibilitychange"), n.autoPlay = i.proxy(n.autoPlay, n), n.autoPlayClear = i.proxy(n.autoPlayClear, n), n.autoPlayIterator = i.proxy(n.autoPlayIterator, n), n.changeSlide = i.proxy(n.changeSlide, n), n.clickHandler = i.proxy(n.clickHandler, n), n.selectHandler = i.proxy(n.selectHandler, n), n.setPosition = i.proxy(n.setPosition, n), n.swipeHandler = i.proxy(n.swipeHandler, n), n.dragHandler = i.proxy(n.dragHandler, n), n.keyHandler = i.proxy(n.keyHandler, n), n.instanceUid = e++, n.htmlExpr = /^(?:\s*(<[\w\W]+>)[^>]*)$/, n.registerBreakpoints(), n.init(!0)
                }
            }()).prototype.activateADA = function() {
                this.$slideTrack.find(".slick-active").attr({
                    "aria-hidden": "false"
                }).find("a, input, button, select").attr({
                    tabindex: "0"
                })
            }, e.prototype.addSlide = e.prototype.slickAdd = function(e, t, o) {
                var s = this;
                if ("boolean" == typeof t) o = t, t = null;
                else if (t < 0 || t >= s.slideCount) return !1;
                s.unload(), "number" == typeof t ? 0 === t && 0 === s.$slides.length ? i(e).appendTo(s.$slideTrack) : o ? i(e).insertBefore(s.$slides.eq(t)) : i(e).insertAfter(s.$slides.eq(t)) : !0 === o ? i(e).prependTo(s.$slideTrack) : i(e).appendTo(s.$slideTrack), s.$slides = s.$slideTrack.children(this.options.slide), s.$slideTrack.children(this.options.slide).detach(), s.$slideTrack.append(s.$slides), s.$slides.each(function(e, t) {
                    i(t).attr("data-slick-index", e)
                }), s.$slidesCache = s.$slides, s.reinit()
            }, e.prototype.animateHeight = function() {
                var i = this;
                if (1 === i.options.slidesToShow && !0 === i.options.adaptiveHeight && !1 === i.options.vertical) {
                    var e = i.$slides.eq(i.currentSlide).outerHeight(!0);
                    i.$list.animate({
                        height: e
                    }, i.options.speed)
                }
            }, e.prototype.animateSlide = function(e, t) {
                var o = {},
                    s = this;
                s.animateHeight(), !0 === s.options.rtl && !1 === s.options.vertical && (e = -e), !1 === s.transformsEnabled ? !1 === s.options.vertical ? s.$slideTrack.animate({
                    left: e
                }, s.options.speed, s.options.easing, t) : s.$slideTrack.animate({
                    top: e
                }, s.options.speed, s.options.easing, t) : !1 === s.cssTransitions ? (!0 === s.options.rtl && (s.currentLeft = -s.currentLeft), i({
                    animStart: s.currentLeft
                }).animate({
                    animStart: e
                }, {
                    duration: s.options.speed,
                    easing: s.options.easing,
                    step: function(i) {
                        i = Math.ceil(i), !1 === s.options.vertical ? (o[s.animType] = "translate(" + i + "px, 0px)", s.$slideTrack.css(o)) : (o[s.animType] = "translate(0px," + i + "px)", s.$slideTrack.css(o))
                    },
                    complete: function() {
                        t && t.call()
                    }
                })) : (s.applyTransition(), e = Math.ceil(e), !1 === s.options.vertical ? o[s.animType] = "translate3d(" + e + "px, 0px, 0px)" : o[s.animType] = "translate3d(0px," + e + "px, 0px)", s.$slideTrack.css(o), t && setTimeout(function() {
                    s.disableTransition(), t.call()
                }, s.options.speed))
            }, e.prototype.getNavTarget = function() {
                var t = this.options.asNavFor;
                return t && null !== t && (t = i(t).not(this.$slider)), t
            }, e.prototype.asNavFor = function(e) {
                var t = this.getNavTarget();
                null !== t && "object" == typeof t && t.each(function() {
                    var t = i(this).slick("getSlick");
                    t.unslicked || t.slideHandler(e, !0)
                })
            }, e.prototype.applyTransition = function(i) {
                var e = this,
                    t = {};
                !1 === e.options.fade ? t[e.transitionType] = e.transformType + " " + e.options.speed + "ms " + e.options.cssEase : t[e.transitionType] = "opacity " + e.options.speed + "ms " + e.options.cssEase, !1 === e.options.fade ? e.$slideTrack.css(t) : e.$slides.eq(i).css(t)
            }, e.prototype.autoPlay = function() {
                var i = this;
                i.autoPlayClear(), i.slideCount > i.options.slidesToShow && (i.autoPlayTimer = setInterval(i.autoPlayIterator, i.options.autoplaySpeed))
            }, e.prototype.autoPlayClear = function() {
                this.autoPlayTimer && clearInterval(this.autoPlayTimer)
            }, e.prototype.autoPlayIterator = function() {
                var i = this,
                    e = i.currentSlide + i.options.slidesToScroll;
                i.paused || i.interrupted || i.focussed || (!1 === i.options.infinite && (1 === i.direction && i.currentSlide + 1 === i.slideCount - 1 ? i.direction = 0 : 0 === i.direction && (e = i.currentSlide - i.options.slidesToScroll, i.currentSlide - 1 == 0 && (i.direction = 1))), i.slideHandler(e))
            }, e.prototype.buildArrows = function() {
                var e = this;
                !0 === e.options.arrows && (e.$prevArrow = i(e.options.prevArrow).addClass("slick-arrow"), e.$nextArrow = i(e.options.nextArrow).addClass("slick-arrow"), e.slideCount > e.options.slidesToShow ? (e.$prevArrow.removeClass("slick-hidden").removeAttr("aria-hidden tabindex"), e.$nextArrow.removeClass("slick-hidden").removeAttr("aria-hidden tabindex"), e.htmlExpr.test(e.options.prevArrow) && e.$prevArrow.prependTo(e.options.appendArrows), e.htmlExpr.test(e.options.nextArrow) && e.$nextArrow.appendTo(e.options.appendArrows), !0 !== e.options.infinite && e.$prevArrow.addClass("slick-disabled").attr("aria-disabled", "true")) : e.$prevArrow.add(e.$nextArrow).addClass("slick-hidden").attr({
                    "aria-disabled": "true",
                    tabindex: "-1"
                }))
            }, e.prototype.buildDots = function() {
                var e, t, o = this;
                if (!0 === o.options.dots) {
                    for (o.$slider.addClass("slick-dotted"), t = i("<ul />").addClass(o.options.dotsClass), e = 0; e <= o.getDotCount(); e += 1) t.append(i("<li />").append(o.options.customPaging.call(this, o, e)));
                    o.$dots = t.appendTo(o.options.appendDots), o.$dots.find("li").first().addClass("slick-active")
                }
            }, e.prototype.buildOut = function() {
                var e = this;
                e.$slides = e.$slider.children(e.options.slide + ":not(.slick-cloned)").addClass("slick-slide"), e.slideCount = e.$slides.length, e.$slides.each(function(e, t) {
                    i(t).attr("data-slick-index", e).data("originalStyling", i(t).attr("style") || "")
                }), e.$slider.addClass("slick-slider"), e.$slideTrack = 0 === e.slideCount ? i('<div class="slick-track"/>').appendTo(e.$slider) : e.$slides.wrapAll('<div class="slick-track"/>').parent(), e.$list = e.$slideTrack.wrap('<div class="slick-list"/>').parent(), e.$slideTrack.css("opacity", 0), !0 !== e.options.centerMode && !0 !== e.options.swipeToSlide || (e.options.slidesToScroll = 1), i("img[data-lazy]", e.$slider).not("[src]").addClass("slick-loading"), e.setupInfinite(), e.buildArrows(), e.buildDots(), e.updateDots(), e.setSlideClasses("number" == typeof e.currentSlide ? e.currentSlide : 0), !0 === e.options.draggable && e.$list.addClass("draggable")
            }, e.prototype.buildRows = function() {
                var i, e, t, o, s, n, r, l = this;
                if (o = document.createDocumentFragment(), n = l.$slider.children(), l.options.rows > 1) {
                    for (r = l.options.slidesPerRow * l.options.rows, s = Math.ceil(n.length / r), i = 0; i < s; i++) {
                        var d = document.createElement("div");
                        for (e = 0; e < l.options.rows; e++) {
                            var a = document.createElement("div");
                            for (t = 0; t < l.options.slidesPerRow; t++) {
                                var c = i * r + (e * l.options.slidesPerRow + t);
                                n.get(c) && a.appendChild(n.get(c))
                            }
                            d.appendChild(a)
                        }
                        o.appendChild(d)
                    }
                    l.$slider.empty().append(o), l.$slider.children().children().children().css({
                        width: 100 / l.options.slidesPerRow + "%",
                        display: "inline-block"
                    })
                }
            }, e.prototype.checkResponsive = function(e, t) {
                var o, s, n, r = this,
                    l = !1,
                    d = r.$slider.width(),
                    a = window.innerWidth || i(window).width();
                if ("window" === r.respondTo ? n = a : "slider" === r.respondTo ? n = d : "min" === r.respondTo && (n = Math.min(a, d)), r.options.responsive && r.options.responsive.length && null !== r.options.responsive) {
                    for (o in s = null, r.breakpoints) r.breakpoints.hasOwnProperty(o) && (!1 === r.originalSettings.mobileFirst ? n < r.breakpoints[o] && (s = r.breakpoints[o]) : n > r.breakpoints[o] && (s = r.breakpoints[o]));
                    null !== s ? null !== r.activeBreakpoint ? (s !== r.activeBreakpoint || t) && (r.activeBreakpoint = s, "unslick" === r.breakpointSettings[s] ? r.unslick(s) : (r.options = i.extend({}, r.originalSettings, r.breakpointSettings[s]), !0 === e && (r.currentSlide = r.options.initialSlide), r.refresh(e)), l = s) : (r.activeBreakpoint = s, "unslick" === r.breakpointSettings[s] ? r.unslick(s) : (r.options = i.extend({}, r.originalSettings, r.breakpointSettings[s]), !0 === e && (r.currentSlide = r.options.initialSlide), r.refresh(e)), l = s) : null !== r.activeBreakpoint && (r.activeBreakpoint = null, r.options = r.originalSettings, !0 === e && (r.currentSlide = r.options.initialSlide), r.refresh(e), l = s), e || !1 === l || r.$slider.trigger("breakpoint", [r, l])
                }
            }, e.prototype.changeSlide = function(e, t) {
                var o, s, n, r = this,
                    l = i(e.currentTarget);
                switch (l.is("a") && e.preventDefault(), l.is("li") || (l = l.closest("li")), n = r.slideCount % r.options.slidesToScroll != 0, o = n ? 0 : (r.slideCount - r.currentSlide) % r.options.slidesToScroll, e.data.message) {
                    case "previous":
                        s = 0 === o ? r.options.slidesToScroll : r.options.slidesToShow - o, r.slideCount > r.options.slidesToShow && r.slideHandler(r.currentSlide - s, !1, t);
                        break;
                    case "next":
                        s = 0 === o ? r.options.slidesToScroll : o, r.slideCount > r.options.slidesToShow && r.slideHandler(r.currentSlide + s, !1, t);
                        break;
                    case "index":
                        var d = 0 === e.data.index ? 0 : e.data.index || l.index() * r.options.slidesToScroll;
                        r.slideHandler(r.checkNavigable(d), !1, t), l.children().trigger("focus");
                        break;
                    default:
                        return
                }
            }, e.prototype.checkNavigable = function(i) {
                var e, t;
                if (e = this.getNavigableIndexes(), t = 0, i > e[e.length - 1]) i = e[e.length - 1];
                else
                    for (var o in e) {
                        if (i < e[o]) {
                            i = t;
                            break
                        }
                        t = e[o]
                    }
                return i
            }, e.prototype.cleanUpEvents = function() {
                var e = this;
                e.options.dots && null !== e.$dots && (i("li", e.$dots).off("click.slick", e.changeSlide).off("mouseenter.slick", i.proxy(e.interrupt, e, !0)).off("mouseleave.slick", i.proxy(e.interrupt, e, !1)), !0 === e.options.accessibility && e.$dots.off("keydown.slick", e.keyHandler)), e.$slider.off("focus.slick blur.slick"), !0 === e.options.arrows && e.slideCount > e.options.slidesToShow && (e.$prevArrow && e.$prevArrow.off("click.slick", e.changeSlide), e.$nextArrow && e.$nextArrow.off("click.slick", e.changeSlide), !0 === e.options.accessibility && (e.$prevArrow && e.$prevArrow.off("keydown.slick", e.keyHandler), e.$nextArrow && e.$nextArrow.off("keydown.slick", e.keyHandler))), e.$list.off("touchstart.slick mousedown.slick", e.swipeHandler), e.$list.off("touchmove.slick mousemove.slick", e.swipeHandler), e.$list.off("touchend.slick mouseup.slick", e.swipeHandler), e.$list.off("touchcancel.slick mouseleave.slick", e.swipeHandler), e.$list.off("click.slick", e.clickHandler), i(document).off(e.visibilityChange, e.visibility), e.cleanUpSlideEvents(), !0 === e.options.accessibility && e.$list.off("keydown.slick", e.keyHandler), !0 === e.options.focusOnSelect && i(e.$slideTrack).children().off("click.slick", e.selectHandler), i(window).off("orientationchange.slick.slick-" + e.instanceUid, e.orientationChange), i(window).off("resize.slick.slick-" + e.instanceUid, e.resize), i("[draggable!=true]", e.$slideTrack).off("dragstart", e.preventDefault), i(window).off("load.slick.slick-" + e.instanceUid, e.setPosition)
            }, e.prototype.cleanUpSlideEvents = function() {
                var e = this;
                e.$list.off("mouseenter.slick", i.proxy(e.interrupt, e, !0)), e.$list.off("mouseleave.slick", i.proxy(e.interrupt, e, !1))
            }, e.prototype.cleanUpRows = function() {
                var i, e = this;
                e.options.rows > 1 && ((i = e.$slides.children().children()).removeAttr("style"), e.$slider.empty().append(i))
            }, e.prototype.clickHandler = function(i) {
                !1 === this.shouldClick && (i.stopImmediatePropagation(), i.stopPropagation(), i.preventDefault())
            }, e.prototype.destroy = function(e) {
                var t = this;
                t.autoPlayClear(), t.touchObject = {}, t.cleanUpEvents(), i(".slick-cloned", t.$slider).detach(), t.$dots && t.$dots.remove(), t.$prevArrow && t.$prevArrow.length && (t.$prevArrow.removeClass("slick-disabled slick-arrow slick-hidden").removeAttr("aria-hidden aria-disabled tabindex").css("display", ""), t.htmlExpr.test(t.options.prevArrow) && t.$prevArrow.remove()), t.$nextArrow && t.$nextArrow.length && (t.$nextArrow.removeClass("slick-disabled slick-arrow slick-hidden").removeAttr("aria-hidden aria-disabled tabindex").css("display", ""), t.htmlExpr.test(t.options.nextArrow) && t.$nextArrow.remove()), t.$slides && (t.$slides.removeClass("slick-slide slick-active slick-center slick-visible slick-current").removeAttr("aria-hidden").removeAttr("data-slick-index").each(function() {
                    i(this).attr("style", i(this).data("originalStyling"))
                }), t.$slideTrack.children(this.options.slide).detach(), t.$slideTrack.detach(), t.$list.detach(), t.$slider.append(t.$slides)), t.cleanUpRows(), t.$slider.removeClass("slick-slider"), t.$slider.removeClass("slick-initialized"), t.$slider.removeClass("slick-dotted"), t.unslicked = !0, e || t.$slider.trigger("destroy", [t])
            }, e.prototype.disableTransition = function(i) {
                var e = this,
                    t = {};
                t[e.transitionType] = "", !1 === e.options.fade ? e.$slideTrack.css(t) : e.$slides.eq(i).css(t)
            }, e.prototype.fadeSlide = function(i, e) {
                var t = this;
                !1 === t.cssTransitions ? (t.$slides.eq(i).css({
                    zIndex: t.options.zIndex
                }), t.$slides.eq(i).animate({
                    opacity: 1
                }, t.options.speed, t.options.easing, e)) : (t.applyTransition(i), t.$slides.eq(i).css({
                    opacity: 1,
                    zIndex: t.options.zIndex
                }), e && setTimeout(function() {
                    t.disableTransition(i), e.call()
                }, t.options.speed))
            }, e.prototype.fadeSlideOut = function(i) {
                var e = this;
                !1 === e.cssTransitions ? e.$slides.eq(i).animate({
                    opacity: 0,
                    zIndex: e.options.zIndex - 2
                }, e.options.speed, e.options.easing) : (e.applyTransition(i), e.$slides.eq(i).css({
                    opacity: 0,
                    zIndex: e.options.zIndex - 2
                }))
            }, e.prototype.filterSlides = e.prototype.slickFilter = function(i) {
                var e = this;
                null !== i && (e.$slidesCache = e.$slides, e.unload(), e.$slideTrack.children(this.options.slide).detach(), e.$slidesCache.filter(i).appendTo(e.$slideTrack), e.reinit())
            }, e.prototype.focusHandler = function() {
                var e = this;
                e.$slider.off("focus.slick blur.slick").on("focus.slick blur.slick", "*", function(t) {
                    t.stopImmediatePropagation();
                    var o = i(this);
                    setTimeout(function() {
                        e.options.pauseOnFocus && (e.focussed = o.is(":focus"), e.autoPlay())
                    }, 0)
                })
            }, e.prototype.getCurrent = e.prototype.slickCurrentSlide = function() {
                return this.currentSlide
            }, e.prototype.getDotCount = function() {
                var i = this,
                    e = 0,
                    t = 0,
                    o = 0;
                if (!0 === i.options.infinite)
                    if (i.slideCount <= i.options.slidesToShow) ++o;
                    else
                        for (; e < i.slideCount;) ++o, e = t + i.options.slidesToScroll, t += i.options.slidesToScroll <= i.options.slidesToShow ? i.options.slidesToScroll : i.options.slidesToShow;
                else if (!0 === i.options.centerMode) o = i.slideCount;
                else if (i.options.asNavFor)
                    for (; e < i.slideCount;) ++o, e = t + i.options.slidesToScroll, t += i.options.slidesToScroll <= i.options.slidesToShow ? i.options.slidesToScroll : i.options.slidesToShow;
                else o = 1 + Math.ceil((i.slideCount - i.options.slidesToShow) / i.options.slidesToScroll);
                return o - 1
            }, e.prototype.getLeft = function(i) {
                var e, t, o, s, n = this,
                    r = 0;
                return n.slideOffset = 0, t = n.$slides.first().outerHeight(!0), !0 === n.options.infinite ? (n.slideCount > n.options.slidesToShow && (n.slideOffset = n.slideWidth * n.options.slidesToShow * -1, s = -1, !0 === n.options.vertical && !0 === n.options.centerMode && (2 === n.options.slidesToShow ? s = -1.5 : 1 === n.options.slidesToShow && (s = -2)), r = t * n.options.slidesToShow * s), n.slideCount % n.options.slidesToScroll != 0 && i + n.options.slidesToScroll > n.slideCount && n.slideCount > n.options.slidesToShow && (i > n.slideCount ? (n.slideOffset = (n.options.slidesToShow - (i - n.slideCount)) * n.slideWidth * -1, r = (n.options.slidesToShow - (i - n.slideCount)) * t * -1) : (n.slideOffset = n.slideCount % n.options.slidesToScroll * n.slideWidth * -1, r = n.slideCount % n.options.slidesToScroll * t * -1))) : i + n.options.slidesToShow > n.slideCount && (n.slideOffset = (i + n.options.slidesToShow - n.slideCount) * n.slideWidth, r = (i + n.options.slidesToShow - n.slideCount) * t), n.slideCount <= n.options.slidesToShow && (n.slideOffset = 0, r = 0), !0 === n.options.centerMode && n.slideCount <= n.options.slidesToShow ? n.slideOffset = n.slideWidth * Math.floor(n.options.slidesToShow) / 2 - n.slideWidth * n.slideCount / 2 : !0 === n.options.centerMode && !0 === n.options.infinite ? n.slideOffset += n.slideWidth * Math.floor(n.options.slidesToShow / 2) - n.slideWidth : !0 === n.options.centerMode && (n.slideOffset = 0, n.slideOffset += n.slideWidth * Math.floor(n.options.slidesToShow / 2)), e = !1 === n.options.vertical ? i * n.slideWidth * -1 + n.slideOffset : i * t * -1 + r, !0 === n.options.variableWidth && (o = n.slideCount <= n.options.slidesToShow || !1 === n.options.infinite ? n.$slideTrack.children(".slick-slide").eq(i) : n.$slideTrack.children(".slick-slide").eq(i + n.options.slidesToShow), e = !0 === n.options.rtl ? o[0] ? -1 * (n.$slideTrack.width() - o[0].offsetLeft - o.width()) : 0 : o[0] ? -1 * o[0].offsetLeft : 0, !0 === n.options.centerMode && (o = n.slideCount <= n.options.slidesToShow || !1 === n.options.infinite ? n.$slideTrack.children(".slick-slide").eq(i) : n.$slideTrack.children(".slick-slide").eq(i + n.options.slidesToShow + 1), e = !0 === n.options.rtl ? o[0] ? -1 * (n.$slideTrack.width() - o[0].offsetLeft - o.width()) : 0 : o[0] ? -1 * o[0].offsetLeft : 0, e += (n.$list.width() - o.outerWidth()) / 2)), e
            }, e.prototype.getOption = e.prototype.slickGetOption = function(i) {
                return this.options[i]
            }, e.prototype.getNavigableIndexes = function() {
                var i, e = this,
                    t = 0,
                    o = 0,
                    s = [];
                for (!1 === e.options.infinite ? i = e.slideCount : (t = -1 * e.options.slidesToScroll, o = -1 * e.options.slidesToScroll, i = 2 * e.slideCount); t < i;) s.push(t), t = o + e.options.slidesToScroll, o += e.options.slidesToScroll <= e.options.slidesToShow ? e.options.slidesToScroll : e.options.slidesToShow;
                return s
            }, e.prototype.getSlick = function() {
                return this
            }, e.prototype.getSlideCount = function() {
                var e, t, o = this;
                return t = !0 === o.options.centerMode ? o.slideWidth * Math.floor(o.options.slidesToShow / 2) : 0, !0 === o.options.swipeToSlide ? (o.$slideTrack.find(".slick-slide").each(function(s, n) {
                    if (n.offsetLeft - t + i(n).outerWidth() / 2 > -1 * o.swipeLeft) return e = n, !1
                }), Math.abs(i(e).attr("data-slick-index") - o.currentSlide) || 1) : o.options.slidesToScroll
            }, e.prototype.goTo = e.prototype.slickGoTo = function(i, e) {
                this.changeSlide({
                    data: {
                        message: "index",
                        index: parseInt(i)
                    }
                }, e)
            }, e.prototype.init = function(e) {
                var t = this;
                i(t.$slider).hasClass("slick-initialized") || (i(t.$slider).addClass("slick-initialized"), t.buildRows(), t.buildOut(), t.setProps(), t.startLoad(), t.loadSlider(), t.initializeEvents(), t.updateArrows(), t.updateDots(), t.checkResponsive(!0), t.focusHandler()), e && t.$slider.trigger("init", [t]), !0 === t.options.accessibility && t.initADA(), t.options.autoplay && (t.paused = !1, t.autoPlay())
            }, e.prototype.initADA = function() {
                var e = this,
                    t = Math.ceil(e.slideCount / e.options.slidesToShow),
                    o = e.getNavigableIndexes().filter(function(i) {
                        return i >= 0 && i < e.slideCount
                    });
                e.$slides.add(e.$slideTrack.find(".slick-cloned")).attr({
                    "aria-hidden": "true",
                    tabindex: "-1"
                }).find("a, input, button, select").attr({
                    tabindex: "-1"
                }), null !== e.$dots && (e.$slides.not(e.$slideTrack.find(".slick-cloned")).each(function(t) {
                    var s = o.indexOf(t);
                    i(this).attr({
                        role: "tabpanel",
                        id: "slick-slide" + e.instanceUid + t,
                        tabindex: -1
                    }), -1 !== s && i(this).attr({
                        "aria-describedby": "slick-slide-control" + e.instanceUid + s
                    })
                }), e.$dots.attr("role", "tablist").find("li").each(function(s) {
                    var n = o[s];
                    i(this).attr({
                        role: "presentation"
                    }), i(this).find("button").first().attr({
                        role: "tab",
                        id: "slick-slide-control" + e.instanceUid + s,
                        "aria-controls": "slick-slide" + e.instanceUid + n,
                        "aria-label": s + 1 + " of " + t,
                        "aria-selected": null,
                        tabindex: "-1"
                    })
                }).eq(e.currentSlide).find("button").attr({
                    "aria-selected": "true",
                    tabindex: "0"
                }).end());
                for (var s = e.currentSlide, n = s + e.options.slidesToShow; s < n; s++) e.$slides.eq(s).attr("tabindex", 0);
                e.activateADA()
            }, e.prototype.initArrowEvents = function() {
                var i = this;
                !0 === i.options.arrows && i.slideCount > i.options.slidesToShow && (i.$prevArrow.off("click.slick").on("click.slick", {
                    message: "previous"
                }, i.changeSlide), i.$nextArrow.off("click.slick").on("click.slick", {
                    message: "next"
                }, i.changeSlide), !0 === i.options.accessibility && (i.$prevArrow.on("keydown.slick", i.keyHandler), i.$nextArrow.on("keydown.slick", i.keyHandler)))
            }, e.prototype.initDotEvents = function() {
                var e = this;
                !0 === e.options.dots && (i("li", e.$dots).on("click.slick", {
                    message: "index"
                }, e.changeSlide), !0 === e.options.accessibility && e.$dots.on("keydown.slick", e.keyHandler)), !0 === e.options.dots && !0 === e.options.pauseOnDotsHover && i("li", e.$dots).on("mouseenter.slick", i.proxy(e.interrupt, e, !0)).on("mouseleave.slick", i.proxy(e.interrupt, e, !1))
            }, e.prototype.initSlideEvents = function() {
                var e = this;
                e.options.pauseOnHover && (e.$list.on("mouseenter.slick", i.proxy(e.interrupt, e, !0)), e.$list.on("mouseleave.slick", i.proxy(e.interrupt, e, !1)))
            }, e.prototype.initializeEvents = function() {
                var e = this;
                e.initArrowEvents(), e.initDotEvents(), e.initSlideEvents(), e.$list.on("touchstart.slick mousedown.slick", {
                    action: "start"
                }, e.swipeHandler), e.$list.on("touchmove.slick mousemove.slick", {
                    action: "move"
                }, e.swipeHandler), e.$list.on("touchend.slick mouseup.slick", {
                    action: "end"
                }, e.swipeHandler), e.$list.on("touchcancel.slick mouseleave.slick", {
                    action: "end"
                }, e.swipeHandler), e.$list.on("click.slick", e.clickHandler), i(document).on(e.visibilityChange, i.proxy(e.visibility, e)), !0 === e.options.accessibility && e.$list.on("keydown.slick", e.keyHandler), !0 === e.options.focusOnSelect && i(e.$slideTrack).children().on("click.slick", e.selectHandler), i(window).on("orientationchange.slick.slick-" + e.instanceUid, i.proxy(e.orientationChange, e)), i(window).on("resize.slick.slick-" + e.instanceUid, i.proxy(e.resize, e)), i("[draggable!=true]", e.$slideTrack).on("dragstart", e.preventDefault), i(window).on("load.slick.slick-" + e.instanceUid, e.setPosition), i(e.setPosition)
            }, e.prototype.initUI = function() {
                var i = this;
                !0 === i.options.arrows && i.slideCount > i.options.slidesToShow && (i.$prevArrow.show(), i.$nextArrow.show()), !0 === i.options.dots && i.slideCount > i.options.slidesToShow && i.$dots.show()
            }, e.prototype.keyHandler = function(i) {
                var e = this;
                i.target.tagName.match("TEXTAREA|INPUT|SELECT") || (37 === i.keyCode && !0 === e.options.accessibility ? e.changeSlide({
                    data: {
                        message: !0 === e.options.rtl ? "next" : "previous"
                    }
                }) : 39 === i.keyCode && !0 === e.options.accessibility && e.changeSlide({
                    data: {
                        message: !0 === e.options.rtl ? "previous" : "next"
                    }
                }))
            }, e.prototype.lazyLoad = function() {
                function e(e) {
                    i("img[data-lazy]", e).each(function() {
                        var e = i(this),
                            t = i(this).attr("data-lazy"),
                            o = i(this).attr("data-srcset"),
                            s = i(this).attr("data-sizes") || n.$slider.attr("data-sizes"),
                            r = document.createElement("img");
                        r.onload = function() {
                            e.animate({
                                opacity: 0
                            }, 100, function() {
                                o && (e.attr("srcset", o), s && e.attr("sizes", s)), e.attr("src", t).animate({
                                    opacity: 1
                                }, 200, function() {
                                    e.removeAttr("data-lazy data-srcset data-sizes").removeClass("slick-loading")
                                }), n.$slider.trigger("lazyLoaded", [n, e, t])
                            })
                        }, r.onerror = function() {
                            e.removeAttr("data-lazy").removeClass("slick-loading").addClass("slick-lazyload-error"), n.$slider.trigger("lazyLoadError", [n, e, t])
                        }, r.src = t
                    })
                }
                var t, o, s, n = this;
                if (!0 === n.options.centerMode ? !0 === n.options.infinite ? s = (o = n.currentSlide + (n.options.slidesToShow / 2 + 1)) + n.options.slidesToShow + 2 : (o = Math.max(0, n.currentSlide - (n.options.slidesToShow / 2 + 1)), s = n.options.slidesToShow / 2 + 1 + 2 + n.currentSlide) : (o = n.options.infinite ? n.options.slidesToShow + n.currentSlide : n.currentSlide, s = Math.ceil(o + n.options.slidesToShow), !0 === n.options.fade && (o > 0 && o--, s <= n.slideCount && s++)), t = n.$slider.find(".slick-slide").slice(o, s), "anticipated" === n.options.lazyLoad)
                    for (var r = o - 1, l = s, d = n.$slider.find(".slick-slide"), a = 0; a < n.options.slidesToScroll; a++) r < 0 && (r = n.slideCount - 1), t = (t = t.add(d.eq(r))).add(d.eq(l)), r--, l++;
                e(t), n.slideCount <= n.options.slidesToShow ? e(n.$slider.find(".slick-slide")) : n.currentSlide >= n.slideCount - n.options.slidesToShow ? e(n.$slider.find(".slick-cloned").slice(0, n.options.slidesToShow)) : 0 === n.currentSlide && e(n.$slider.find(".slick-cloned").slice(-1 * n.options.slidesToShow))
            }, e.prototype.loadSlider = function() {
                var i = this;
                i.setPosition(), i.$slideTrack.css({
                    opacity: 1
                }), i.$slider.removeClass("slick-loading"), i.initUI(), "progressive" === i.options.lazyLoad && i.progressiveLazyLoad()
            }, e.prototype.next = e.prototype.slickNext = function() {
                this.changeSlide({
                    data: {
                        message: "next"
                    }
                })
            }, e.prototype.orientationChange = function() {
                this.checkResponsive(), this.setPosition()
            }, e.prototype.pause = e.prototype.slickPause = function() {
                this.autoPlayClear(), this.paused = !0
            }, e.prototype.play = e.prototype.slickPlay = function() {
                var i = this;
                i.autoPlay(), i.options.autoplay = !0, i.paused = !1, i.focussed = !1, i.interrupted = !1
            }, e.prototype.postSlide = function(e) {
                var t = this;
                t.unslicked || (t.$slider.trigger("afterChange", [t, e]), t.animating = !1, t.slideCount > t.options.slidesToShow && t.setPosition(), t.swipeLeft = null, t.options.autoplay && t.autoPlay(), !0 === t.options.accessibility && (t.initADA(), t.options.focusOnChange && i(t.$slides.get(t.currentSlide)).attr("tabindex", 0).focus()))
            }, e.prototype.prev = e.prototype.slickPrev = function() {
                this.changeSlide({
                    data: {
                        message: "previous"
                    }
                })
            }, e.prototype.preventDefault = function(i) {
                i.preventDefault()
            }, e.prototype.progressiveLazyLoad = function(e) {
                e = e || 1;
                var t, o, s, n, r, l = this,
                    d = i("img[data-lazy]", l.$slider);
                d.length ? (t = d.first(), o = t.attr("data-lazy"), s = t.attr("data-srcset"), n = t.attr("data-sizes") || l.$slider.attr("data-sizes"), (r = document.createElement("img")).onload = function() {
                    s && (t.attr("srcset", s), n && t.attr("sizes", n)), t.attr("src", o).removeAttr("data-lazy data-srcset data-sizes").removeClass("slick-loading"), !0 === l.options.adaptiveHeight && l.setPosition(), l.$slider.trigger("lazyLoaded", [l, t, o]), l.progressiveLazyLoad()
                }, r.onerror = function() {
                    e < 3 ? setTimeout(function() {
                        l.progressiveLazyLoad(e + 1)
                    }, 500) : (t.removeAttr("data-lazy").removeClass("slick-loading").addClass("slick-lazyload-error"), l.$slider.trigger("lazyLoadError", [l, t, o]), l.progressiveLazyLoad())
                }, r.src = o) : l.$slider.trigger("allImagesLoaded", [l])
            }, e.prototype.refresh = function(e) {
                var t, o, s = this;
                o = s.slideCount - s.options.slidesToShow, !s.options.infinite && s.currentSlide > o && (s.currentSlide = o), s.slideCount <= s.options.slidesToShow && (s.currentSlide = 0), t = s.currentSlide, s.destroy(!0), i.extend(s, s.initials, {
                    currentSlide: t
                }), s.init(), e || s.changeSlide({
                    data: {
                        message: "index",
                        index: t
                    }
                }, !1)
            }, e.prototype.registerBreakpoints = function() {
                var e, t, o, s = this,
                    n = s.options.responsive || null;
                if ("array" === i.type(n) && n.length) {
                    for (e in s.respondTo = s.options.respondTo || "window", n)
                        if (o = s.breakpoints.length - 1, n.hasOwnProperty(e)) {
                            for (t = n[e].breakpoint; o >= 0;) s.breakpoints[o] && s.breakpoints[o] === t && s.breakpoints.splice(o, 1), o--;
                            s.breakpoints.push(t), s.breakpointSettings[t] = n[e].settings
                        } s.breakpoints.sort(function(i, e) {
                        return s.options.mobileFirst ? i - e : e - i
                    })
                }
            }, e.prototype.reinit = function() {
                var e = this;
                e.$slides = e.$slideTrack.children(e.options.slide).addClass("slick-slide"), e.slideCount = e.$slides.length, e.currentSlide >= e.slideCount && 0 !== e.currentSlide && (e.currentSlide = e.currentSlide - e.options.slidesToScroll), e.slideCount <= e.options.slidesToShow && (e.currentSlide = 0), e.registerBreakpoints(), e.setProps(), e.setupInfinite(), e.buildArrows(), e.updateArrows(), e.initArrowEvents(), e.buildDots(), e.updateDots(), e.initDotEvents(), e.cleanUpSlideEvents(), e.initSlideEvents(), e.checkResponsive(!1, !0), !0 === e.options.focusOnSelect && i(e.$slideTrack).children().on("click.slick", e.selectHandler), e.setSlideClasses("number" == typeof e.currentSlide ? e.currentSlide : 0), e.setPosition(), e.focusHandler(), e.paused = !e.options.autoplay, e.autoPlay(), e.$slider.trigger("reInit", [e])
            }, e.prototype.resize = function() {
                var e = this;
                i(window).width() !== e.windowWidth && (clearTimeout(e.windowDelay), e.windowDelay = window.setTimeout(function() {
                    e.windowWidth = i(window).width(), e.checkResponsive(), e.unslicked || e.setPosition()
                }, 50))
            }, e.prototype.removeSlide = e.prototype.slickRemove = function(i, e, t) {
                var o = this;
                if (i = "boolean" == typeof i ? !0 === (e = i) ? 0 : o.slideCount - 1 : !0 === e ? --i : i, o.slideCount < 1 || i < 0 || i > o.slideCount - 1) return !1;
                o.unload(), !0 === t ? o.$slideTrack.children().remove() : o.$slideTrack.children(this.options.slide).eq(i).remove(), o.$slides = o.$slideTrack.children(this.options.slide), o.$slideTrack.children(this.options.slide).detach(), o.$slideTrack.append(o.$slides), o.$slidesCache = o.$slides, o.reinit()
            }, e.prototype.setCSS = function(i) {
                var e, t, o = this,
                    s = {};
                !0 === o.options.rtl && (i = -i), e = "left" == o.positionProp ? Math.ceil(i) + "px" : "0px", t = "top" == o.positionProp ? Math.ceil(i) + "px" : "0px", s[o.positionProp] = i, !1 === o.transformsEnabled ? o.$slideTrack.css(s) : (s = {}, !1 === o.cssTransitions ? (s[o.animType] = "translate(" + e + ", " + t + ")", o.$slideTrack.css(s)) : (s[o.animType] = "translate3d(" + e + ", " + t + ", 0px)", o.$slideTrack.css(s)))
            }, e.prototype.setDimensions = function() {
                var i = this;
                !1 === i.options.vertical ? !0 === i.options.centerMode && i.$list.css({
                    padding: "0px " + i.options.centerPadding
                }) : (i.$list.height(i.$slides.first().outerHeight(!0) * i.options.slidesToShow), !0 === i.options.centerMode && i.$list.css({
                    padding: i.options.centerPadding + " 0px"
                })), i.listWidth = i.$list.width(), i.listHeight = i.$list.height(), !1 === i.options.vertical && !1 === i.options.variableWidth ? (i.slideWidth = Math.ceil(i.listWidth / i.options.slidesToShow), i.$slideTrack.width(Math.ceil(i.slideWidth * i.$slideTrack.children(".slick-slide").length))) : !0 === i.options.variableWidth ? i.$slideTrack.width(5e3 * i.slideCount) : (i.slideWidth = Math.ceil(i.listWidth), i.$slideTrack.height(Math.ceil(i.$slides.first().outerHeight(!0) * i.$slideTrack.children(".slick-slide").length)));
                var e = i.$slides.first().outerWidth(!0) - i.$slides.first().width();
                !1 === i.options.variableWidth && i.$slideTrack.children(".slick-slide").width(i.slideWidth - e)
            }, e.prototype.setFade = function() {
                var e, t = this;
                t.$slides.each(function(o, s) {
                    e = t.slideWidth * o * -1, !0 === t.options.rtl ? i(s).css({
                        position: "relative",
                        right: e,
                        top: 0,
                        zIndex: t.options.zIndex - 2,
                        opacity: 0
                    }) : i(s).css({
                        position: "relative",
                        left: e,
                        top: 0,
                        zIndex: t.options.zIndex - 2,
                        opacity: 0
                    })
                }), t.$slides.eq(t.currentSlide).css({
                    zIndex: t.options.zIndex - 1,
                    opacity: 1
                })
            }, e.prototype.setHeight = function() {
                var i = this;
                if (1 === i.options.slidesToShow && !0 === i.options.adaptiveHeight && !1 === i.options.vertical) {
                    var e = i.$slides.eq(i.currentSlide).outerHeight(!0);
                    i.$list.css("height", e)
                }
            }, e.prototype.setOption = e.prototype.slickSetOption = function() {
                var e, t, o, s, n, r = this,
                    l = !1;
                if ("object" === i.type(arguments[0]) ? (o = arguments[0], l = arguments[1], n = "multiple") : "string" === i.type(arguments[0]) && (o = arguments[0], s = arguments[1], l = arguments[2], "responsive" === arguments[0] && "array" === i.type(arguments[1]) ? n = "responsive" : void 0 !== arguments[1] && (n = "single")), "single" === n) r.options[o] = s;
                else if ("multiple" === n) i.each(o, function(i, e) {
                    r.options[i] = e
                });
                else if ("responsive" === n)
                    for (t in s)
                        if ("array" !== i.type(r.options.responsive)) r.options.responsive = [s[t]];
                        else {
                            for (e = r.options.responsive.length - 1; e >= 0;) r.options.responsive[e].breakpoint === s[t].breakpoint && r.options.responsive.splice(e, 1), e--;
                            r.options.responsive.push(s[t])
                        } l && (r.unload(), r.reinit())
            }, e.prototype.setPosition = function() {
                var i = this;
                i.setDimensions(), i.setHeight(), !1 === i.options.fade ? i.setCSS(i.getLeft(i.currentSlide)) : i.setFade(), i.$slider.trigger("setPosition", [i])
            }, e.prototype.setProps = function() {
                var i = this,
                    e = document.body.style;
                i.positionProp = !0 === i.options.vertical ? "top" : "left", "top" === i.positionProp ? i.$slider.addClass("slick-vertical") : i.$slider.removeClass("slick-vertical"), void 0 === e.WebkitTransition && void 0 === e.MozTransition && void 0 === e.msTransition || !0 === i.options.useCSS && (i.cssTransitions = !0), i.options.fade && ("number" == typeof i.options.zIndex ? i.options.zIndex < 3 && (i.options.zIndex = 3) : i.options.zIndex = i.defaults.zIndex), void 0 !== e.OTransform && (i.animType = "OTransform", i.transformType = "-o-transform", i.transitionType = "OTransition", void 0 === e.perspectiveProperty && void 0 === e.webkitPerspective && (i.animType = !1)), void 0 !== e.MozTransform && (i.animType = "MozTransform", i.transformType = "-moz-transform", i.transitionType = "MozTransition", void 0 === e.perspectiveProperty && void 0 === e.MozPerspective && (i.animType = !1)), void 0 !== e.webkitTransform && (i.animType = "webkitTransform", i.transformType = "-webkit-transform", i.transitionType = "webkitTransition", void 0 === e.perspectiveProperty && void 0 === e.webkitPerspective && (i.animType = !1)), void 0 !== e.msTransform && (i.animType = "msTransform", i.transformType = "-ms-transform", i.transitionType = "msTransition", void 0 === e.msTransform && (i.animType = !1)), void 0 !== e.transform && !1 !== i.animType && (i.animType = "transform", i.transformType = "transform", i.transitionType = "transition"), i.transformsEnabled = i.options.useTransform && null !== i.animType && !1 !== i.animType
            }, e.prototype.setSlideClasses = function(i) {
                var e, t, o, s, n = this;
                if (t = n.$slider.find(".slick-slide").removeClass("slick-active slick-center slick-current").attr("aria-hidden", "true"), n.$slides.eq(i).addClass("slick-current"), !0 === n.options.centerMode) {
                    var r = n.options.slidesToShow % 2 == 0 ? 1 : 0;
                    e = Math.floor(n.options.slidesToShow / 2), !0 === n.options.infinite && (i >= e && i <= n.slideCount - 1 - e ? n.$slides.slice(i - e + r, i + e + 1).addClass("slick-active").attr("aria-hidden", "false") : (o = n.options.slidesToShow + i, t.slice(o - e + 1 + r, o + e + 2).addClass("slick-active").attr("aria-hidden", "false")), 0 === i ? t.eq(t.length - 1 - n.options.slidesToShow).addClass("slick-center") : i === n.slideCount - 1 && t.eq(n.options.slidesToShow).addClass("slick-center")), n.$slides.eq(i).addClass("slick-center")
                } else i >= 0 && i <= n.slideCount - n.options.slidesToShow ? n.$slides.slice(i, i + n.options.slidesToShow).addClass("slick-active").attr("aria-hidden", "false") : t.length <= n.options.slidesToShow ? t.addClass("slick-active").attr("aria-hidden", "false") : (s = n.slideCount % n.options.slidesToShow, o = !0 === n.options.infinite ? n.options.slidesToShow + i : i, n.options.slidesToShow == n.options.slidesToScroll && n.slideCount - i < n.options.slidesToShow ? t.slice(o - (n.options.slidesToShow - s), o + s).addClass("slick-active").attr("aria-hidden", "false") : t.slice(o, o + n.options.slidesToShow).addClass("slick-active").attr("aria-hidden", "false"));
                "ondemand" !== n.options.lazyLoad && "anticipated" !== n.options.lazyLoad || n.lazyLoad()
            }, e.prototype.setupInfinite = function() {
                var e, t, o, s = this;
                if (!0 === s.options.fade && (s.options.centerMode = !1), !0 === s.options.infinite && !1 === s.options.fade && (t = null, s.slideCount > s.options.slidesToShow)) {
                    for (o = !0 === s.options.centerMode ? s.options.slidesToShow + 1 : s.options.slidesToShow, e = s.slideCount; e > s.slideCount - o; e -= 1) t = e - 1, i(s.$slides[t]).clone(!0).attr("id", "").attr("data-slick-index", t - s.slideCount).prependTo(s.$slideTrack).addClass("slick-cloned");
                    for (e = 0; e < o + s.slideCount; e += 1) t = e, i(s.$slides[t]).clone(!0).attr("id", "").attr("data-slick-index", t + s.slideCount).appendTo(s.$slideTrack).addClass("slick-cloned");
                    s.$slideTrack.find(".slick-cloned").find("[id]").each(function() {
                        i(this).attr("id", "")
                    })
                }
            }, e.prototype.interrupt = function(i) {
                i || this.autoPlay(), this.interrupted = i
            }, e.prototype.selectHandler = function(e) {
                var t = this,
                    o = i(e.target).is(".slick-slide") ? i(e.target) : i(e.target).parents(".slick-slide"),
                    s = parseInt(o.attr("data-slick-index"));
                s || (s = 0), t.slideCount <= t.options.slidesToShow ? t.slideHandler(s, !1, !0) : t.slideHandler(s)
            }, e.prototype.slideHandler = function(i, e, t) {
                var o, s, n, r, l, d = null,
                    a = this;
                if (e = e || !1, !(!0 === a.animating && !0 === a.options.waitForAnimate || !0 === a.options.fade && a.currentSlide === i))
                    if (!1 === e && a.asNavFor(i), o = i, d = a.getLeft(o), r = a.getLeft(a.currentSlide), a.currentLeft = null === a.swipeLeft ? r : a.swipeLeft, !1 === a.options.infinite && !1 === a.options.centerMode && (i < 0 || i > a.getDotCount() * a.options.slidesToScroll)) !1 === a.options.fade && (o = a.currentSlide, !0 !== t ? a.animateSlide(r, function() {
                        a.postSlide(o)
                    }) : a.postSlide(o));
                    else if (!1 === a.options.infinite && !0 === a.options.centerMode && (i < 0 || i > a.slideCount - a.options.slidesToScroll)) !1 === a.options.fade && (o = a.currentSlide, !0 !== t ? a.animateSlide(r, function() {
                    a.postSlide(o)
                }) : a.postSlide(o));
                else {
                    if (a.options.autoplay && clearInterval(a.autoPlayTimer), s = o < 0 ? a.slideCount % a.options.slidesToScroll != 0 ? a.slideCount - a.slideCount % a.options.slidesToScroll : a.slideCount + o : o >= a.slideCount ? a.slideCount % a.options.slidesToScroll != 0 ? 0 : o - a.slideCount : o, a.animating = !0, a.$slider.trigger("beforeChange", [a, a.currentSlide, s]), n = a.currentSlide, a.currentSlide = s, a.setSlideClasses(a.currentSlide), a.options.asNavFor && (l = (l = a.getNavTarget()).slick("getSlick")).slideCount <= l.options.slidesToShow && l.setSlideClasses(a.currentSlide), a.updateDots(), a.updateArrows(), !0 === a.options.fade) return !0 !== t ? (a.fadeSlideOut(n), a.fadeSlide(s, function() {
                        a.postSlide(s)
                    })) : a.postSlide(s), void a.animateHeight();
                    !0 !== t ? a.animateSlide(d, function() {
                        a.postSlide(s)
                    }) : a.postSlide(s)
                }
            }, e.prototype.startLoad = function() {
                var i = this;
                !0 === i.options.arrows && i.slideCount > i.options.slidesToShow && (i.$prevArrow.hide(), i.$nextArrow.hide()), !0 === i.options.dots && i.slideCount > i.options.slidesToShow && i.$dots.hide(), i.$slider.addClass("slick-loading")
            }, e.prototype.swipeDirection = function() {
                var i, e, t, o, s = this;
                return i = s.touchObject.startX - s.touchObject.curX, e = s.touchObject.startY - s.touchObject.curY, t = Math.atan2(e, i), (o = Math.round(180 * t / Math.PI)) < 0 && (o = 360 - Math.abs(o)), o <= 45 && o >= 0 ? !1 === s.options.rtl ? "left" : "right" : o <= 360 && o >= 315 ? !1 === s.options.rtl ? "left" : "right" : o >= 135 && o <= 225 ? !1 === s.options.rtl ? "right" : "left" : !0 === s.options.verticalSwiping ? o >= 35 && o <= 135 ? "down" : "up" : "vertical"
            }, e.prototype.swipeEnd = function(i) {
                var e, t, o = this;
                if (o.dragging = !1, o.swiping = !1, o.scrolling) return o.scrolling = !1, !1;
                if (o.interrupted = !1, o.shouldClick = !(o.touchObject.swipeLength > 10), void 0 === o.touchObject.curX) return !1;
                if (!0 === o.touchObject.edgeHit && o.$slider.trigger("edge", [o, o.swipeDirection()]), o.touchObject.swipeLength >= o.touchObject.minSwipe) {
                    switch (t = o.swipeDirection()) {
                        case "left":
                        case "down":
                            e = o.options.swipeToSlide ? o.checkNavigable(o.currentSlide + o.getSlideCount()) : o.currentSlide + o.getSlideCount(), o.currentDirection = 0;
                            break;
                        case "right":
                        case "up":
                            e = o.options.swipeToSlide ? o.checkNavigable(o.currentSlide - o.getSlideCount()) : o.currentSlide - o.getSlideCount(), o.currentDirection = 1
                    }
                    "vertical" != t && (o.slideHandler(e), o.touchObject = {}, o.$slider.trigger("swipe", [o, t]))
                } else o.touchObject.startX !== o.touchObject.curX && (o.slideHandler(o.currentSlide), o.touchObject = {})
            }, e.prototype.swipeHandler = function(i) {
                var e = this;
                if (!(!1 === e.options.swipe || "ontouchend" in document && !1 === e.options.swipe || !1 === e.options.draggable && -1 !== i.type.indexOf("mouse"))) switch (e.touchObject.fingerCount = i.originalEvent && void 0 !== i.originalEvent.touches ? i.originalEvent.touches.length : 1, e.touchObject.minSwipe = e.listWidth / e.options.touchThreshold, !0 === e.options.verticalSwiping && (e.touchObject.minSwipe = e.listHeight / e.options.touchThreshold), i.data.action) {
                    case "start":
                        e.swipeStart(i);
                        break;
                    case "move":
                        e.swipeMove(i);
                        break;
                    case "end":
                        e.swipeEnd(i)
                }
            }, e.prototype.swipeMove = function(i) {
                var e, t, o, s, n, r, l = this;
                return n = void 0 !== i.originalEvent ? i.originalEvent.touches : null, !(!l.dragging || l.scrolling || n && 1 !== n.length) && (e = l.getLeft(l.currentSlide), l.touchObject.curX = void 0 !== n ? n[0].pageX : i.clientX, l.touchObject.curY = void 0 !== n ? n[0].pageY : i.clientY, l.touchObject.swipeLength = Math.round(Math.sqrt(Math.pow(l.touchObject.curX - l.touchObject.startX, 2))), r = Math.round(Math.sqrt(Math.pow(l.touchObject.curY - l.touchObject.startY, 2))), !l.options.verticalSwiping && !l.swiping && r > 4 ? (l.scrolling = !0, !1) : (!0 === l.options.verticalSwiping && (l.touchObject.swipeLength = r), t = l.swipeDirection(), void 0 !== i.originalEvent && l.touchObject.swipeLength > 4 && (l.swiping = !0, i.preventDefault()), s = (!1 === l.options.rtl ? 1 : -1) * (l.touchObject.curX > l.touchObject.startX ? 1 : -1), !0 === l.options.verticalSwiping && (s = l.touchObject.curY > l.touchObject.startY ? 1 : -1), o = l.touchObject.swipeLength, l.touchObject.edgeHit = !1, !1 === l.options.infinite && (0 === l.currentSlide && "right" === t || l.currentSlide >= l.getDotCount() && "left" === t) && (o = l.touchObject.swipeLength * l.options.edgeFriction, l.touchObject.edgeHit = !0), !1 === l.options.vertical ? l.swipeLeft = e + o * s : l.swipeLeft = e + o * (l.$list.height() / l.listWidth) * s, !0 === l.options.verticalSwiping && (l.swipeLeft = e + o * s), !0 !== l.options.fade && !1 !== l.options.touchMove && (!0 === l.animating ? (l.swipeLeft = null, !1) : void l.setCSS(l.swipeLeft))))
            }, e.prototype.swipeStart = function(i) {
                var e, t = this;
                if (t.interrupted = !0, 1 !== t.touchObject.fingerCount || t.slideCount <= t.options.slidesToShow) return t.touchObject = {}, !1;
                void 0 !== i.originalEvent && void 0 !== i.originalEvent.touches && (e = i.originalEvent.touches[0]), t.touchObject.startX = t.touchObject.curX = void 0 !== e ? e.pageX : i.clientX, t.touchObject.startY = t.touchObject.curY = void 0 !== e ? e.pageY : i.clientY, t.dragging = !0
            }, e.prototype.unfilterSlides = e.prototype.slickUnfilter = function() {
                var i = this;
                null !== i.$slidesCache && (i.unload(), i.$slideTrack.children(this.options.slide).detach(), i.$slidesCache.appendTo(i.$slideTrack), i.reinit())
            }, e.prototype.unload = function() {
                var e = this;
                i(".slick-cloned", e.$slider).remove(), e.$dots && e.$dots.remove(), e.$prevArrow && e.htmlExpr.test(e.options.prevArrow) && e.$prevArrow.remove(), e.$nextArrow && e.htmlExpr.test(e.options.nextArrow) && e.$nextArrow.remove(), e.$slides.removeClass("slick-slide slick-active slick-visible slick-current").attr("aria-hidden", "true").css("width", "")
            }, e.prototype.unslick = function(i) {
                var e = this;
                e.$slider.trigger("unslick", [e, i]), e.destroy()
            }, e.prototype.updateArrows = function() {
                var i = this;
                Math.floor(i.options.slidesToShow / 2), !0 === i.options.arrows && i.slideCount > i.options.slidesToShow && !i.options.infinite && (i.$prevArrow.removeClass("slick-disabled").attr("aria-disabled", "false"), i.$nextArrow.removeClass("slick-disabled").attr("aria-disabled", "false"), 0 === i.currentSlide ? (i.$prevArrow.addClass("slick-disabled").attr("aria-disabled", "true"), i.$nextArrow.removeClass("slick-disabled").attr("aria-disabled", "false")) : i.currentSlide >= i.slideCount - i.options.slidesToShow && !1 === i.options.centerMode ? (i.$nextArrow.addClass("slick-disabled").attr("aria-disabled", "true"), i.$prevArrow.removeClass("slick-disabled").attr("aria-disabled", "false")) : i.currentSlide >= i.slideCount - 1 && !0 === i.options.centerMode && (i.$nextArrow.addClass("slick-disabled").attr("aria-disabled", "true"), i.$prevArrow.removeClass("slick-disabled").attr("aria-disabled", "false")))
            }, e.prototype.updateDots = function() {
                var i = this;
                null !== i.$dots && (i.$dots.find("li").removeClass("slick-active").end(), i.$dots.find("li").eq(Math.floor(i.currentSlide / i.options.slidesToScroll)).addClass("slick-active"))
            }, e.prototype.visibility = function() {
                var i = this;
                i.options.autoplay && (document[i.hidden] ? i.interrupted = !0 : i.interrupted = !1)
            }, i.fn.slick = function() {
                var i, t, o = this,
                    s = arguments[0],
                    n = Array.prototype.slice.call(arguments, 1),
                    r = o.length;
                for (i = 0; i < r; i++)
                    if ("object" == typeof s || void 0 === s ? o[i].slick = new e(o[i], s) : t = o[i].slick[s].apply(o[i].slick, n), void 0 !== t) return t;
                return o
            }
        }) ? __WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__) : __WEBPACK_AMD_DEFINE_FACTORY__) || (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)
    }()
}, function(module, exports, __webpack_require__) {
    (function(global) {
        module.exports = global.$ = __webpack_require__(58)
    }).call(this, __webpack_require__(0))
}, function(module, exports, __webpack_require__) {
    var __WEBPACK_AMD_DEFINE_RESULT__;
    /*!
     * jQuery JavaScript Library v3.5.1
     * https://jquery.com/
     *
     * Includes Sizzle.js
     * https://sizzlejs.com/
     *
     * Copyright JS Foundation and other contributors
     * Released under the MIT license
     * https://jquery.org/license
     *
     * Date: 2020-05-04T22:49Z
     */
    /*!
     * jQuery JavaScript Library v3.5.1
     * https://jquery.com/
     *
     * Includes Sizzle.js
     * https://sizzlejs.com/
     *
     * Copyright JS Foundation and other contributors
     * Released under the MIT license
     * https://jquery.org/license
     *
     * Date: 2020-05-04T22:49Z
     */
    ! function(global, factory) {
        "use strict";
        "object" == typeof module.exports ? module.exports = global.document ? factory(global, !0) : function(w) {
            if (!w.document) throw new Error("jQuery requires a window with a document");
            return factory(w)
        } : factory(global)
    }("undefined" != typeof window ? window : this, function(window, noGlobal) {
        "use strict";
        var arr = [],
            getProto = Object.getPrototypeOf,
            slice = arr.slice,
            flat = arr.flat ? function(array) {
                return arr.flat.call(array)
            } : function(array) {
                return arr.concat.apply([], array)
            },
            push = arr.push,
            indexOf = arr.indexOf,
            class2type = {},
            toString = class2type.toString,
            hasOwn = class2type.hasOwnProperty,
            fnToString = hasOwn.toString,
            ObjectFunctionString = fnToString.call(Object),
            support = {},
            isFunction = function isFunction(obj) {
                return "function" == typeof obj && "number" != typeof obj.nodeType
            },
            isWindow = function isWindow(obj) {
                return null != obj && obj === obj.window
            },
            document = window.document,
            preservedScriptAttributes = {
                type: !0,
                src: !0,
                nonce: !0,
                noModule: !0
            };

        function DOMEval(code, node, doc) {
            var i, val, script = (doc = doc || document).createElement("script");
            if (script.text = code, node)
                for (i in preservedScriptAttributes)(val = node[i] || node.getAttribute && node.getAttribute(i)) && script.setAttribute(i, val);
            doc.head.appendChild(script).parentNode.removeChild(script)
        }

        function toType(obj) {
            return null == obj ? obj + "" : "object" == typeof obj || "function" == typeof obj ? class2type[toString.call(obj)] || "object" : typeof obj
        }
        var jQuery = function(selector, context) {
            return new jQuery.fn.init(selector, context)
        };

        function isArrayLike(obj) {
            var length = !!obj && "length" in obj && obj.length,
                type = toType(obj);
            return !isFunction(obj) && !isWindow(obj) && ("array" === type || 0 === length || "number" == typeof length && length > 0 && length - 1 in obj)
        }
        jQuery.fn = jQuery.prototype = {
            jquery: "3.5.1",
            constructor: jQuery,
            length: 0,
            toArray: function() {
                return slice.call(this)
            },
            get: function(num) {
                return null == num ? slice.call(this) : num < 0 ? this[num + this.length] : this[num]
            },
            pushStack: function(elems) {
                var ret = jQuery.merge(this.constructor(), elems);
                return ret.prevObject = this, ret
            },
            each: function(callback) {
                return jQuery.each(this, callback)
            },
            map: function(callback) {
                return this.pushStack(jQuery.map(this, function(elem, i) {
                    return callback.call(elem, i, elem)
                }))
            },
            slice: function() {
                return this.pushStack(slice.apply(this, arguments))
            },
            first: function() {
                return this.eq(0)
            },
            last: function() {
                return this.eq(-1)
            },
            even: function() {
                return this.pushStack(jQuery.grep(this, function(_elem, i) {
                    return (i + 1) % 2
                }))
            },
            odd: function() {
                return this.pushStack(jQuery.grep(this, function(_elem, i) {
                    return i % 2
                }))
            },
            eq: function(i) {
                var len = this.length,
                    j = +i + (i < 0 ? len : 0);
                return this.pushStack(j >= 0 && j < len ? [this[j]] : [])
            },
            end: function() {
                return this.prevObject || this.constructor()
            },
            push: push,
            sort: arr.sort,
            splice: arr.splice
        }, jQuery.extend = jQuery.fn.extend = function() {
            var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {},
                i = 1,
                length = arguments.length,
                deep = !1;
            for ("boolean" == typeof target && (deep = target, target = arguments[i] || {}, i++), "object" == typeof target || isFunction(target) || (target = {}), i === length && (target = this, i--); i < length; i++)
                if (null != (options = arguments[i]))
                    for (name in options) copy = options[name], "__proto__" !== name && target !== copy && (deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = Array.isArray(copy))) ? (src = target[name], clone = copyIsArray && !Array.isArray(src) ? [] : copyIsArray || jQuery.isPlainObject(src) ? src : {}, copyIsArray = !1, target[name] = jQuery.extend(deep, clone, copy)) : void 0 !== copy && (target[name] = copy));
            return target
        }, jQuery.extend({
            expando: "jQuery" + ("3.5.1" + Math.random()).replace(/\D/g, ""),
            isReady: !0,
            error: function(msg) {
                throw new Error(msg)
            },
            noop: function() {},
            isPlainObject: function(obj) {
                var proto, Ctor;
                return !(!obj || "[object Object]" !== toString.call(obj)) && (!(proto = getProto(obj)) || "function" == typeof(Ctor = hasOwn.call(proto, "constructor") && proto.constructor) && fnToString.call(Ctor) === ObjectFunctionString)
            },
            isEmptyObject: function(obj) {
                var name;
                for (name in obj) return !1;
                return !0
            },
            globalEval: function(code, options, doc) {
                DOMEval(code, {
                    nonce: options && options.nonce
                }, doc)
            },
            each: function(obj, callback) {
                var length, i = 0;
                if (isArrayLike(obj))
                    for (length = obj.length; i < length && !1 !== callback.call(obj[i], i, obj[i]); i++);
                else
                    for (i in obj)
                        if (!1 === callback.call(obj[i], i, obj[i])) break;
                return obj
            },
            makeArray: function(arr, results) {
                var ret = results || [];
                return null != arr && (isArrayLike(Object(arr)) ? jQuery.merge(ret, "string" == typeof arr ? [arr] : arr) : push.call(ret, arr)), ret
            },
            inArray: function(elem, arr, i) {
                return null == arr ? -1 : indexOf.call(arr, elem, i)
            },
            merge: function(first, second) {
                for (var len = +second.length, j = 0, i = first.length; j < len; j++) first[i++] = second[j];
                return first.length = i, first
            },
            grep: function(elems, callback, invert) {
                for (var matches = [], i = 0, length = elems.length, callbackExpect = !invert; i < length; i++) !callback(elems[i], i) !== callbackExpect && matches.push(elems[i]);
                return matches
            },
            map: function(elems, callback, arg) {
                var length, value, i = 0,
                    ret = [];
                if (isArrayLike(elems))
                    for (length = elems.length; i < length; i++) null != (value = callback(elems[i], i, arg)) && ret.push(value);
                else
                    for (i in elems) null != (value = callback(elems[i], i, arg)) && ret.push(value);
                return flat(ret)
            },
            guid: 1,
            support: support
        }), "function" == typeof Symbol && (jQuery.fn[Symbol.iterator] = arr[Symbol.iterator]), jQuery.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "), function(_i, name) {
            class2type["[object " + name + "]"] = name.toLowerCase()
        });
        var Sizzle =
            /*!
             * Sizzle CSS Selector Engine v2.3.5
             * https://sizzlejs.com/
             *
             * Copyright JS Foundation and other contributors
             * Released under the MIT license
             * https://js.foundation/
             *
             * Date: 2020-03-14
             */
            function(window) {
                var i, support, Expr, getText, isXML, tokenize, compile, select, outermostContext, sortInput, hasDuplicate, setDocument, document, docElem, documentIsHTML, rbuggyQSA, rbuggyMatches, matches, contains, expando = "sizzle" + 1 * new Date,
                    preferredDoc = window.document,
                    dirruns = 0,
                    done = 0,
                    classCache = createCache(),
                    tokenCache = createCache(),
                    compilerCache = createCache(),
                    nonnativeSelectorCache = createCache(),
                    sortOrder = function(a, b) {
                        return a === b && (hasDuplicate = !0), 0
                    },
                    hasOwn = {}.hasOwnProperty,
                    arr = [],
                    pop = arr.pop,
                    pushNative = arr.push,
                    push = arr.push,
                    slice = arr.slice,
                    indexOf = function(list, elem) {
                        for (var i = 0, len = list.length; i < len; i++)
                            if (list[i] === elem) return i;
                        return -1
                    },
                    booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",
                    whitespace = "[\\x20\\t\\r\\n\\f]",
                    identifier = "(?:\\\\[\\da-fA-F]{1,6}" + whitespace + "?|\\\\[^\\r\\n\\f]|[\\w-]|[^\0-\\x7f])+",
                    attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace + "*([*^$|!~]?=)" + whitespace + "*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace + "*\\]",
                    pseudos = ":(" + identifier + ")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|.*)\\)|)",
                    rwhitespace = new RegExp(whitespace + "+", "g"),
                    rtrim = new RegExp("^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g"),
                    rcomma = new RegExp("^" + whitespace + "*," + whitespace + "*"),
                    rcombinators = new RegExp("^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*"),
                    rdescend = new RegExp(whitespace + "|>"),
                    rpseudo = new RegExp(pseudos),
                    ridentifier = new RegExp("^" + identifier + "$"),
                    matchExpr = {
                        ID: new RegExp("^#(" + identifier + ")"),
                        CLASS: new RegExp("^\\.(" + identifier + ")"),
                        TAG: new RegExp("^(" + identifier + "|[*])"),
                        ATTR: new RegExp("^" + attributes),
                        PSEUDO: new RegExp("^" + pseudos),
                        CHILD: new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace + "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace + "*(\\d+)|))" + whitespace + "*\\)|)", "i"),
                        bool: new RegExp("^(?:" + booleans + ")$", "i"),
                        needsContext: new RegExp("^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i")
                    },
                    rhtml = /HTML$/i,
                    rinputs = /^(?:input|select|textarea|button)$/i,
                    rheader = /^h\d$/i,
                    rnative = /^[^{]+\{\s*\[native \w/,
                    rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,
                    rsibling = /[+~]/,
                    runescape = new RegExp("\\\\[\\da-fA-F]{1,6}" + whitespace + "?|\\\\([^\\r\\n\\f])", "g"),
                    funescape = function(escape, nonHex) {
                        var high = "0x" + escape.slice(1) - 65536;
                        return nonHex || (high < 0 ? String.fromCharCode(high + 65536) : String.fromCharCode(high >> 10 | 55296, 1023 & high | 56320))
                    },
                    rcssescape = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g,
                    fcssescape = function(ch, asCodePoint) {
                        return asCodePoint ? "\0" === ch ? "�" : ch.slice(0, -1) + "\\" + ch.charCodeAt(ch.length - 1).toString(16) + " " : "\\" + ch
                    },
                    unloadHandler = function() {
                        setDocument()
                    },
                    inDisabledFieldset = addCombinator(function(elem) {
                        return !0 === elem.disabled && "fieldset" === elem.nodeName.toLowerCase()
                    }, {
                        dir: "parentNode",
                        next: "legend"
                    });
                try {
                    push.apply(arr = slice.call(preferredDoc.childNodes), preferredDoc.childNodes), arr[preferredDoc.childNodes.length].nodeType
                } catch (e) {
                    push = {
                        apply: arr.length ? function(target, els) {
                            pushNative.apply(target, slice.call(els))
                        } : function(target, els) {
                            for (var j = target.length, i = 0; target[j++] = els[i++];);
                            target.length = j - 1
                        }
                    }
                }

                function Sizzle(selector, context, results, seed) {
                    var m, i, elem, nid, match, groups, newSelector, newContext = context && context.ownerDocument,
                        nodeType = context ? context.nodeType : 9;
                    if (results = results || [], "string" != typeof selector || !selector || 1 !== nodeType && 9 !== nodeType && 11 !== nodeType) return results;
                    if (!seed && (setDocument(context), context = context || document, documentIsHTML)) {
                        if (11 !== nodeType && (match = rquickExpr.exec(selector)))
                            if (m = match[1]) {
                                if (9 === nodeType) {
                                    if (!(elem = context.getElementById(m))) return results;
                                    if (elem.id === m) return results.push(elem), results
                                } else if (newContext && (elem = newContext.getElementById(m)) && contains(context, elem) && elem.id === m) return results.push(elem), results
                            } else {
                                if (match[2]) return push.apply(results, context.getElementsByTagName(selector)), results;
                                if ((m = match[3]) && support.getElementsByClassName && context.getElementsByClassName) return push.apply(results, context.getElementsByClassName(m)), results
                            } if (support.qsa && !nonnativeSelectorCache[selector + " "] && (!rbuggyQSA || !rbuggyQSA.test(selector)) && (1 !== nodeType || "object" !== context.nodeName.toLowerCase())) {
                            if (newSelector = selector, newContext = context, 1 === nodeType && (rdescend.test(selector) || rcombinators.test(selector))) {
                                for ((newContext = rsibling.test(selector) && testContext(context.parentNode) || context) === context && support.scope || ((nid = context.getAttribute("id")) ? nid = nid.replace(rcssescape, fcssescape) : context.setAttribute("id", nid = expando)), i = (groups = tokenize(selector)).length; i--;) groups[i] = (nid ? "#" + nid : ":scope") + " " + toSelector(groups[i]);
                                newSelector = groups.join(",")
                            }
                            try {
                                return push.apply(results, newContext.querySelectorAll(newSelector)), results
                            } catch (qsaError) {
                                nonnativeSelectorCache(selector, !0)
                            } finally {
                                nid === expando && context.removeAttribute("id")
                            }
                        }
                    }
                    return select(selector.replace(rtrim, "$1"), context, results, seed)
                }

                function createCache() {
                    var keys = [];
                    return function cache(key, value) {
                        return keys.push(key + " ") > Expr.cacheLength && delete cache[keys.shift()], cache[key + " "] = value
                    }
                }

                function markFunction(fn) {
                    return fn[expando] = !0, fn
                }

                function assert(fn) {
                    var el = document.createElement("fieldset");
                    try {
                        return !!fn(el)
                    } catch (e) {
                        return !1
                    } finally {
                        el.parentNode && el.parentNode.removeChild(el), el = null
                    }
                }

                function addHandle(attrs, handler) {
                    for (var arr = attrs.split("|"), i = arr.length; i--;) Expr.attrHandle[arr[i]] = handler
                }

                function siblingCheck(a, b) {
                    var cur = b && a,
                        diff = cur && 1 === a.nodeType && 1 === b.nodeType && a.sourceIndex - b.sourceIndex;
                    if (diff) return diff;
                    if (cur)
                        for (; cur = cur.nextSibling;)
                            if (cur === b) return -1;
                    return a ? 1 : -1
                }

                function createInputPseudo(type) {
                    return function(elem) {
                        return "input" === elem.nodeName.toLowerCase() && elem.type === type
                    }
                }

                function createButtonPseudo(type) {
                    return function(elem) {
                        var name = elem.nodeName.toLowerCase();
                        return ("input" === name || "button" === name) && elem.type === type
                    }
                }

                function createDisabledPseudo(disabled) {
                    return function(elem) {
                        return "form" in elem ? elem.parentNode && !1 === elem.disabled ? "label" in elem ? "label" in elem.parentNode ? elem.parentNode.disabled === disabled : elem.disabled === disabled : elem.isDisabled === disabled || elem.isDisabled !== !disabled && inDisabledFieldset(elem) === disabled : elem.disabled === disabled : "label" in elem && elem.disabled === disabled
                    }
                }

                function createPositionalPseudo(fn) {
                    return markFunction(function(argument) {
                        return argument = +argument, markFunction(function(seed, matches) {
                            for (var j, matchIndexes = fn([], seed.length, argument), i = matchIndexes.length; i--;) seed[j = matchIndexes[i]] && (seed[j] = !(matches[j] = seed[j]))
                        })
                    })
                }

                function testContext(context) {
                    return context && void 0 !== context.getElementsByTagName && context
                }
                for (i in support = Sizzle.support = {}, isXML = Sizzle.isXML = function(elem) {
                        var namespace = elem.namespaceURI,
                            docElem = (elem.ownerDocument || elem).documentElement;
                        return !rhtml.test(namespace || docElem && docElem.nodeName || "HTML")
                    }, setDocument = Sizzle.setDocument = function(node) {
                        var hasCompare, subWindow, doc = node ? node.ownerDocument || node : preferredDoc;
                        return doc != document && 9 === doc.nodeType && doc.documentElement ? (docElem = (document = doc).documentElement, documentIsHTML = !isXML(document), preferredDoc != document && (subWindow = document.defaultView) && subWindow.top !== subWindow && (subWindow.addEventListener ? subWindow.addEventListener("unload", unloadHandler, !1) : subWindow.attachEvent && subWindow.attachEvent("onunload", unloadHandler)), support.scope = assert(function(el) {
                            return docElem.appendChild(el).appendChild(document.createElement("div")), void 0 !== el.querySelectorAll && !el.querySelectorAll(":scope fieldset div").length
                        }), support.attributes = assert(function(el) {
                            return el.className = "i", !el.getAttribute("className")
                        }), support.getElementsByTagName = assert(function(el) {
                            return el.appendChild(document.createComment("")), !el.getElementsByTagName("*").length
                        }), support.getElementsByClassName = rnative.test(document.getElementsByClassName), support.getById = assert(function(el) {
                            return docElem.appendChild(el).id = expando, !document.getElementsByName || !document.getElementsByName(expando).length
                        }), support.getById ? (Expr.filter.ID = function(id) {
                            var attrId = id.replace(runescape, funescape);
                            return function(elem) {
                                return elem.getAttribute("id") === attrId
                            }
                        }, Expr.find.ID = function(id, context) {
                            if (void 0 !== context.getElementById && documentIsHTML) {
                                var elem = context.getElementById(id);
                                return elem ? [elem] : []
                            }
                        }) : (Expr.filter.ID = function(id) {
                            var attrId = id.replace(runescape, funescape);
                            return function(elem) {
                                var node = void 0 !== elem.getAttributeNode && elem.getAttributeNode("id");
                                return node && node.value === attrId
                            }
                        }, Expr.find.ID = function(id, context) {
                            if (void 0 !== context.getElementById && documentIsHTML) {
                                var node, i, elems, elem = context.getElementById(id);
                                if (elem) {
                                    if ((node = elem.getAttributeNode("id")) && node.value === id) return [elem];
                                    for (elems = context.getElementsByName(id), i = 0; elem = elems[i++];)
                                        if ((node = elem.getAttributeNode("id")) && node.value === id) return [elem]
                                }
                                return []
                            }
                        }), Expr.find.TAG = support.getElementsByTagName ? function(tag, context) {
                            return void 0 !== context.getElementsByTagName ? context.getElementsByTagName(tag) : support.qsa ? context.querySelectorAll(tag) : void 0
                        } : function(tag, context) {
                            var elem, tmp = [],
                                i = 0,
                                results = context.getElementsByTagName(tag);
                            if ("*" === tag) {
                                for (; elem = results[i++];) 1 === elem.nodeType && tmp.push(elem);
                                return tmp
                            }
                            return results
                        }, Expr.find.CLASS = support.getElementsByClassName && function(className, context) {
                            if (void 0 !== context.getElementsByClassName && documentIsHTML) return context.getElementsByClassName(className)
                        }, rbuggyMatches = [], rbuggyQSA = [], (support.qsa = rnative.test(document.querySelectorAll)) && (assert(function(el) {
                            var input;
                            docElem.appendChild(el).innerHTML = "<a id='" + expando + "'></a><select id='" + expando + "-\r\\' msallowcapture=''><option selected=''></option></select>", el.querySelectorAll("[msallowcapture^='']").length && rbuggyQSA.push("[*^$]=" + whitespace + "*(?:''|\"\")"), el.querySelectorAll("[selected]").length || rbuggyQSA.push("\\[" + whitespace + "*(?:value|" + booleans + ")"), el.querySelectorAll("[id~=" + expando + "-]").length || rbuggyQSA.push("~="), (input = document.createElement("input")).setAttribute("name", ""), el.appendChild(input), el.querySelectorAll("[name='']").length || rbuggyQSA.push("\\[" + whitespace + "*name" + whitespace + "*=" + whitespace + "*(?:''|\"\")"), el.querySelectorAll(":checked").length || rbuggyQSA.push(":checked"), el.querySelectorAll("a#" + expando + "+*").length || rbuggyQSA.push(".#.+[+~]"), el.querySelectorAll("\\\f"), rbuggyQSA.push("[\\r\\n\\f]")
                        }), assert(function(el) {
                            el.innerHTML = "<a href='' disabled='disabled'></a><select disabled='disabled'><option/></select>";
                            var input = document.createElement("input");
                            input.setAttribute("type", "hidden"), el.appendChild(input).setAttribute("name", "D"), el.querySelectorAll("[name=d]").length && rbuggyQSA.push("name" + whitespace + "*[*^$|!~]?="), 2 !== el.querySelectorAll(":enabled").length && rbuggyQSA.push(":enabled", ":disabled"), docElem.appendChild(el).disabled = !0, 2 !== el.querySelectorAll(":disabled").length && rbuggyQSA.push(":enabled", ":disabled"), el.querySelectorAll("*,:x"), rbuggyQSA.push(",.*:")
                        })), (support.matchesSelector = rnative.test(matches = docElem.matches || docElem.webkitMatchesSelector || docElem.mozMatchesSelector || docElem.oMatchesSelector || docElem.msMatchesSelector)) && assert(function(el) {
                            support.disconnectedMatch = matches.call(el, "*"), matches.call(el, "[s!='']:x"), rbuggyMatches.push("!=", pseudos)
                        }), rbuggyQSA = rbuggyQSA.length && new RegExp(rbuggyQSA.join("|")), rbuggyMatches = rbuggyMatches.length && new RegExp(rbuggyMatches.join("|")), hasCompare = rnative.test(docElem.compareDocumentPosition), contains = hasCompare || rnative.test(docElem.contains) ? function(a, b) {
                            var adown = 9 === a.nodeType ? a.documentElement : a,
                                bup = b && b.parentNode;
                            return a === bup || !(!bup || 1 !== bup.nodeType || !(adown.contains ? adown.contains(bup) : a.compareDocumentPosition && 16 & a.compareDocumentPosition(bup)))
                        } : function(a, b) {
                            if (b)
                                for (; b = b.parentNode;)
                                    if (b === a) return !0;
                            return !1
                        }, sortOrder = hasCompare ? function(a, b) {
                            if (a === b) return hasDuplicate = !0, 0;
                            var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
                            return compare || (1 & (compare = (a.ownerDocument || a) == (b.ownerDocument || b) ? a.compareDocumentPosition(b) : 1) || !support.sortDetached && b.compareDocumentPosition(a) === compare ? a == document || a.ownerDocument == preferredDoc && contains(preferredDoc, a) ? -1 : b == document || b.ownerDocument == preferredDoc && contains(preferredDoc, b) ? 1 : sortInput ? indexOf(sortInput, a) - indexOf(sortInput, b) : 0 : 4 & compare ? -1 : 1)
                        } : function(a, b) {
                            if (a === b) return hasDuplicate = !0, 0;
                            var cur, i = 0,
                                aup = a.parentNode,
                                bup = b.parentNode,
                                ap = [a],
                                bp = [b];
                            if (!aup || !bup) return a == document ? -1 : b == document ? 1 : aup ? -1 : bup ? 1 : sortInput ? indexOf(sortInput, a) - indexOf(sortInput, b) : 0;
                            if (aup === bup) return siblingCheck(a, b);
                            for (cur = a; cur = cur.parentNode;) ap.unshift(cur);
                            for (cur = b; cur = cur.parentNode;) bp.unshift(cur);
                            for (; ap[i] === bp[i];) i++;
                            return i ? siblingCheck(ap[i], bp[i]) : ap[i] == preferredDoc ? -1 : bp[i] == preferredDoc ? 1 : 0
                        }, document) : document
                    }, Sizzle.matches = function(expr, elements) {
                        return Sizzle(expr, null, null, elements)
                    }, Sizzle.matchesSelector = function(elem, expr) {
                        if (setDocument(elem), support.matchesSelector && documentIsHTML && !nonnativeSelectorCache[expr + " "] && (!rbuggyMatches || !rbuggyMatches.test(expr)) && (!rbuggyQSA || !rbuggyQSA.test(expr))) try {
                            var ret = matches.call(elem, expr);
                            if (ret || support.disconnectedMatch || elem.document && 11 !== elem.document.nodeType) return ret
                        } catch (e) {
                            nonnativeSelectorCache(expr, !0)
                        }
                        return Sizzle(expr, document, null, [elem]).length > 0
                    }, Sizzle.contains = function(context, elem) {
                        return (context.ownerDocument || context) != document && setDocument(context), contains(context, elem)
                    }, Sizzle.attr = function(elem, name) {
                        (elem.ownerDocument || elem) != document && setDocument(elem);
                        var fn = Expr.attrHandle[name.toLowerCase()],
                            val = fn && hasOwn.call(Expr.attrHandle, name.toLowerCase()) ? fn(elem, name, !documentIsHTML) : void 0;
                        return void 0 !== val ? val : support.attributes || !documentIsHTML ? elem.getAttribute(name) : (val = elem.getAttributeNode(name)) && val.specified ? val.value : null
                    }, Sizzle.escape = function(sel) {
                        return (sel + "").replace(rcssescape, fcssescape)
                    }, Sizzle.error = function(msg) {
                        throw new Error("Syntax error, unrecognized expression: " + msg)
                    }, Sizzle.uniqueSort = function(results) {
                        var elem, duplicates = [],
                            j = 0,
                            i = 0;
                        if (hasDuplicate = !support.detectDuplicates, sortInput = !support.sortStable && results.slice(0), results.sort(sortOrder), hasDuplicate) {
                            for (; elem = results[i++];) elem === results[i] && (j = duplicates.push(i));
                            for (; j--;) results.splice(duplicates[j], 1)
                        }
                        return sortInput = null, results
                    }, getText = Sizzle.getText = function(elem) {
                        var node, ret = "",
                            i = 0,
                            nodeType = elem.nodeType;
                        if (nodeType) {
                            if (1 === nodeType || 9 === nodeType || 11 === nodeType) {
                                if ("string" == typeof elem.textContent) return elem.textContent;
                                for (elem = elem.firstChild; elem; elem = elem.nextSibling) ret += getText(elem)
                            } else if (3 === nodeType || 4 === nodeType) return elem.nodeValue
                        } else
                            for (; node = elem[i++];) ret += getText(node);
                        return ret
                    }, (Expr = Sizzle.selectors = {
                        cacheLength: 50,
                        createPseudo: markFunction,
                        match: matchExpr,
                        attrHandle: {},
                        find: {},
                        relative: {
                            ">": {
                                dir: "parentNode",
                                first: !0
                            },
                            " ": {
                                dir: "parentNode"
                            },
                            "+": {
                                dir: "previousSibling",
                                first: !0
                            },
                            "~": {
                                dir: "previousSibling"
                            }
                        },
                        preFilter: {
                            ATTR: function(match) {
                                return match[1] = match[1].replace(runescape, funescape), match[3] = (match[3] || match[4] || match[5] || "").replace(runescape, funescape), "~=" === match[2] && (match[3] = " " + match[3] + " "), match.slice(0, 4)
                            },
                            CHILD: function(match) {
                                return match[1] = match[1].toLowerCase(), "nth" === match[1].slice(0, 3) ? (match[3] || Sizzle.error(match[0]), match[4] = +(match[4] ? match[5] + (match[6] || 1) : 2 * ("even" === match[3] || "odd" === match[3])), match[5] = +(match[7] + match[8] || "odd" === match[3])) : match[3] && Sizzle.error(match[0]), match
                            },
                            PSEUDO: function(match) {
                                var excess, unquoted = !match[6] && match[2];
                                return matchExpr.CHILD.test(match[0]) ? null : (match[3] ? match[2] = match[4] || match[5] || "" : unquoted && rpseudo.test(unquoted) && (excess = tokenize(unquoted, !0)) && (excess = unquoted.indexOf(")", unquoted.length - excess) - unquoted.length) && (match[0] = match[0].slice(0, excess), match[2] = unquoted.slice(0, excess)), match.slice(0, 3))
                            }
                        },
                        filter: {
                            TAG: function(nodeNameSelector) {
                                var nodeName = nodeNameSelector.replace(runescape, funescape).toLowerCase();
                                return "*" === nodeNameSelector ? function() {
                                    return !0
                                } : function(elem) {
                                    return elem.nodeName && elem.nodeName.toLowerCase() === nodeName
                                }
                            },
                            CLASS: function(className) {
                                var pattern = classCache[className + " "];
                                return pattern || (pattern = new RegExp("(^|" + whitespace + ")" + className + "(" + whitespace + "|$)")) && classCache(className, function(elem) {
                                    return pattern.test("string" == typeof elem.className && elem.className || void 0 !== elem.getAttribute && elem.getAttribute("class") || "")
                                })
                            },
                            ATTR: function(name, operator, check) {
                                return function(elem) {
                                    var result = Sizzle.attr(elem, name);
                                    return null == result ? "!=" === operator : !operator || (result += "", "=" === operator ? result === check : "!=" === operator ? result !== check : "^=" === operator ? check && 0 === result.indexOf(check) : "*=" === operator ? check && result.indexOf(check) > -1 : "$=" === operator ? check && result.slice(-check.length) === check : "~=" === operator ? (" " + result.replace(rwhitespace, " ") + " ").indexOf(check) > -1 : "|=" === operator && (result === check || result.slice(0, check.length + 1) === check + "-"))
                                }
                            },
                            CHILD: function(type, what, _argument, first, last) {
                                var simple = "nth" !== type.slice(0, 3),
                                    forward = "last" !== type.slice(-4),
                                    ofType = "of-type" === what;
                                return 1 === first && 0 === last ? function(elem) {
                                    return !!elem.parentNode
                                } : function(elem, _context, xml) {
                                    var cache, uniqueCache, outerCache, node, nodeIndex, start, dir = simple !== forward ? "nextSibling" : "previousSibling",
                                        parent = elem.parentNode,
                                        name = ofType && elem.nodeName.toLowerCase(),
                                        useCache = !xml && !ofType,
                                        diff = !1;
                                    if (parent) {
                                        if (simple) {
                                            for (; dir;) {
                                                for (node = elem; node = node[dir];)
                                                    if (ofType ? node.nodeName.toLowerCase() === name : 1 === node.nodeType) return !1;
                                                start = dir = "only" === type && !start && "nextSibling"
                                            }
                                            return !0
                                        }
                                        if (start = [forward ? parent.firstChild : parent.lastChild], forward && useCache) {
                                            for (diff = (nodeIndex = (cache = (uniqueCache = (outerCache = (node = parent)[expando] || (node[expando] = {}))[node.uniqueID] || (outerCache[node.uniqueID] = {}))[type] || [])[0] === dirruns && cache[1]) && cache[2], node = nodeIndex && parent.childNodes[nodeIndex]; node = ++nodeIndex && node && node[dir] || (diff = nodeIndex = 0) || start.pop();)
                                                if (1 === node.nodeType && ++diff && node === elem) {
                                                    uniqueCache[type] = [dirruns, nodeIndex, diff];
                                                    break
                                                }
                                        } else if (useCache && (diff = nodeIndex = (cache = (uniqueCache = (outerCache = (node = elem)[expando] || (node[expando] = {}))[node.uniqueID] || (outerCache[node.uniqueID] = {}))[type] || [])[0] === dirruns && cache[1]), !1 === diff)
                                            for (;
                                                (node = ++nodeIndex && node && node[dir] || (diff = nodeIndex = 0) || start.pop()) && ((ofType ? node.nodeName.toLowerCase() !== name : 1 !== node.nodeType) || !++diff || (useCache && ((uniqueCache = (outerCache = node[expando] || (node[expando] = {}))[node.uniqueID] || (outerCache[node.uniqueID] = {}))[type] = [dirruns, diff]), node !== elem)););
                                        return (diff -= last) === first || diff % first == 0 && diff / first >= 0
                                    }
                                }
                            },
                            PSEUDO: function(pseudo, argument) {
                                var args, fn = Expr.pseudos[pseudo] || Expr.setFilters[pseudo.toLowerCase()] || Sizzle.error("unsupported pseudo: " + pseudo);
                                return fn[expando] ? fn(argument) : fn.length > 1 ? (args = [pseudo, pseudo, "", argument], Expr.setFilters.hasOwnProperty(pseudo.toLowerCase()) ? markFunction(function(seed, matches) {
                                    for (var idx, matched = fn(seed, argument), i = matched.length; i--;) seed[idx = indexOf(seed, matched[i])] = !(matches[idx] = matched[i])
                                }) : function(elem) {
                                    return fn(elem, 0, args)
                                }) : fn
                            }
                        },
                        pseudos: {
                            not: markFunction(function(selector) {
                                var input = [],
                                    results = [],
                                    matcher = compile(selector.replace(rtrim, "$1"));
                                return matcher[expando] ? markFunction(function(seed, matches, _context, xml) {
                                    for (var elem, unmatched = matcher(seed, null, xml, []), i = seed.length; i--;)(elem = unmatched[i]) && (seed[i] = !(matches[i] = elem))
                                }) : function(elem, _context, xml) {
                                    return input[0] = elem, matcher(input, null, xml, results), input[0] = null, !results.pop()
                                }
                            }),
                            has: markFunction(function(selector) {
                                return function(elem) {
                                    return Sizzle(selector, elem).length > 0
                                }
                            }),
                            contains: markFunction(function(text) {
                                return text = text.replace(runescape, funescape),
                                    function(elem) {
                                        return (elem.textContent || getText(elem)).indexOf(text) > -1
                                    }
                            }),
                            lang: markFunction(function(lang) {
                                return ridentifier.test(lang || "") || Sizzle.error("unsupported lang: " + lang), lang = lang.replace(runescape, funescape).toLowerCase(),
                                    function(elem) {
                                        var elemLang;
                                        do {
                                            if (elemLang = documentIsHTML ? elem.lang : elem.getAttribute("xml:lang") || elem.getAttribute("lang")) return (elemLang = elemLang.toLowerCase()) === lang || 0 === elemLang.indexOf(lang + "-")
                                        } while ((elem = elem.parentNode) && 1 === elem.nodeType);
                                        return !1
                                    }
                            }),
                            target: function(elem) {
                                var hash = window.location && window.location.hash;
                                return hash && hash.slice(1) === elem.id
                            },
                            root: function(elem) {
                                return elem === docElem
                            },
                            focus: function(elem) {
                                return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex)
                            },
                            enabled: createDisabledPseudo(!1),
                            disabled: createDisabledPseudo(!0),
                            checked: function(elem) {
                                var nodeName = elem.nodeName.toLowerCase();
                                return "input" === nodeName && !!elem.checked || "option" === nodeName && !!elem.selected
                            },
                            selected: function(elem) {
                                return elem.parentNode && elem.parentNode.selectedIndex, !0 === elem.selected
                            },
                            empty: function(elem) {
                                for (elem = elem.firstChild; elem; elem = elem.nextSibling)
                                    if (elem.nodeType < 6) return !1;
                                return !0
                            },
                            parent: function(elem) {
                                return !Expr.pseudos.empty(elem)
                            },
                            header: function(elem) {
                                return rheader.test(elem.nodeName)
                            },
                            input: function(elem) {
                                return rinputs.test(elem.nodeName)
                            },
                            button: function(elem) {
                                var name = elem.nodeName.toLowerCase();
                                return "input" === name && "button" === elem.type || "button" === name
                            },
                            text: function(elem) {
                                var attr;
                                return "input" === elem.nodeName.toLowerCase() && "text" === elem.type && (null == (attr = elem.getAttribute("type")) || "text" === attr.toLowerCase())
                            },
                            first: createPositionalPseudo(function() {
                                return [0]
                            }),
                            last: createPositionalPseudo(function(_matchIndexes, length) {
                                return [length - 1]
                            }),
                            eq: createPositionalPseudo(function(_matchIndexes, length, argument) {
                                return [argument < 0 ? argument + length : argument]
                            }),
                            even: createPositionalPseudo(function(matchIndexes, length) {
                                for (var i = 0; i < length; i += 2) matchIndexes.push(i);
                                return matchIndexes
                            }),
                            odd: createPositionalPseudo(function(matchIndexes, length) {
                                for (var i = 1; i < length; i += 2) matchIndexes.push(i);
                                return matchIndexes
                            }),
                            lt: createPositionalPseudo(function(matchIndexes, length, argument) {
                                for (var i = argument < 0 ? argument + length : argument > length ? length : argument; --i >= 0;) matchIndexes.push(i);
                                return matchIndexes
                            }),
                            gt: createPositionalPseudo(function(matchIndexes, length, argument) {
                                for (var i = argument < 0 ? argument + length : argument; ++i < length;) matchIndexes.push(i);
                                return matchIndexes
                            })
                        }
                    }).pseudos.nth = Expr.pseudos.eq, {
                        radio: !0,
                        checkbox: !0,
                        file: !0,
                        password: !0,
                        image: !0
                    }) Expr.pseudos[i] = createInputPseudo(i);
                for (i in {
                        submit: !0,
                        reset: !0
                    }) Expr.pseudos[i] = createButtonPseudo(i);

                function setFilters() {}

                function toSelector(tokens) {
                    for (var i = 0, len = tokens.length, selector = ""; i < len; i++) selector += tokens[i].value;
                    return selector
                }

                function addCombinator(matcher, combinator, base) {
                    var dir = combinator.dir,
                        skip = combinator.next,
                        key = skip || dir,
                        checkNonElements = base && "parentNode" === key,
                        doneName = done++;
                    return combinator.first ? function(elem, context, xml) {
                        for (; elem = elem[dir];)
                            if (1 === elem.nodeType || checkNonElements) return matcher(elem, context, xml);
                        return !1
                    } : function(elem, context, xml) {
                        var oldCache, uniqueCache, outerCache, newCache = [dirruns, doneName];
                        if (xml) {
                            for (; elem = elem[dir];)
                                if ((1 === elem.nodeType || checkNonElements) && matcher(elem, context, xml)) return !0
                        } else
                            for (; elem = elem[dir];)
                                if (1 === elem.nodeType || checkNonElements)
                                    if (uniqueCache = (outerCache = elem[expando] || (elem[expando] = {}))[elem.uniqueID] || (outerCache[elem.uniqueID] = {}), skip && skip === elem.nodeName.toLowerCase()) elem = elem[dir] || elem;
                                    else {
                                        if ((oldCache = uniqueCache[key]) && oldCache[0] === dirruns && oldCache[1] === doneName) return newCache[2] = oldCache[2];
                                        if (uniqueCache[key] = newCache, newCache[2] = matcher(elem, context, xml)) return !0
                                    } return !1
                    }
                }

                function elementMatcher(matchers) {
                    return matchers.length > 1 ? function(elem, context, xml) {
                        for (var i = matchers.length; i--;)
                            if (!matchers[i](elem, context, xml)) return !1;
                        return !0
                    } : matchers[0]
                }

                function condense(unmatched, map, filter, context, xml) {
                    for (var elem, newUnmatched = [], i = 0, len = unmatched.length, mapped = null != map; i < len; i++)(elem = unmatched[i]) && (filter && !filter(elem, context, xml) || (newUnmatched.push(elem), mapped && map.push(i)));
                    return newUnmatched
                }

                function setMatcher(preFilter, selector, matcher, postFilter, postFinder, postSelector) {
                    return postFilter && !postFilter[expando] && (postFilter = setMatcher(postFilter)), postFinder && !postFinder[expando] && (postFinder = setMatcher(postFinder, postSelector)), markFunction(function(seed, results, context, xml) {
                        var temp, i, elem, preMap = [],
                            postMap = [],
                            preexisting = results.length,
                            elems = seed || function multipleContexts(selector, contexts, results) {
                                for (var i = 0, len = contexts.length; i < len; i++) Sizzle(selector, contexts[i], results);
                                return results
                            }(selector || "*", context.nodeType ? [context] : context, []),
                            matcherIn = !preFilter || !seed && selector ? elems : condense(elems, preMap, preFilter, context, xml),
                            matcherOut = matcher ? postFinder || (seed ? preFilter : preexisting || postFilter) ? [] : results : matcherIn;
                        if (matcher && matcher(matcherIn, matcherOut, context, xml), postFilter)
                            for (temp = condense(matcherOut, postMap), postFilter(temp, [], context, xml), i = temp.length; i--;)(elem = temp[i]) && (matcherOut[postMap[i]] = !(matcherIn[postMap[i]] = elem));
                        if (seed) {
                            if (postFinder || preFilter) {
                                if (postFinder) {
                                    for (temp = [], i = matcherOut.length; i--;)(elem = matcherOut[i]) && temp.push(matcherIn[i] = elem);
                                    postFinder(null, matcherOut = [], temp, xml)
                                }
                                for (i = matcherOut.length; i--;)(elem = matcherOut[i]) && (temp = postFinder ? indexOf(seed, elem) : preMap[i]) > -1 && (seed[temp] = !(results[temp] = elem))
                            }
                        } else matcherOut = condense(matcherOut === results ? matcherOut.splice(preexisting, matcherOut.length) : matcherOut), postFinder ? postFinder(null, results, matcherOut, xml) : push.apply(results, matcherOut)
                    })
                }

                function matcherFromTokens(tokens) {
                    for (var checkContext, matcher, j, len = tokens.length, leadingRelative = Expr.relative[tokens[0].type], implicitRelative = leadingRelative || Expr.relative[" "], i = leadingRelative ? 1 : 0, matchContext = addCombinator(function(elem) {
                            return elem === checkContext
                        }, implicitRelative, !0), matchAnyContext = addCombinator(function(elem) {
                            return indexOf(checkContext, elem) > -1
                        }, implicitRelative, !0), matchers = [function(elem, context, xml) {
                            var ret = !leadingRelative && (xml || context !== outermostContext) || ((checkContext = context).nodeType ? matchContext(elem, context, xml) : matchAnyContext(elem, context, xml));
                            return checkContext = null, ret
                        }]; i < len; i++)
                        if (matcher = Expr.relative[tokens[i].type]) matchers = [addCombinator(elementMatcher(matchers), matcher)];
                        else {
                            if ((matcher = Expr.filter[tokens[i].type].apply(null, tokens[i].matches))[expando]) {
                                for (j = ++i; j < len && !Expr.relative[tokens[j].type]; j++);
                                return setMatcher(i > 1 && elementMatcher(matchers), i > 1 && toSelector(tokens.slice(0, i - 1).concat({
                                    value: " " === tokens[i - 2].type ? "*" : ""
                                })).replace(rtrim, "$1"), matcher, i < j && matcherFromTokens(tokens.slice(i, j)), j < len && matcherFromTokens(tokens = tokens.slice(j)), j < len && toSelector(tokens))
                            }
                            matchers.push(matcher)
                        } return elementMatcher(matchers)
                }
                return setFilters.prototype = Expr.filters = Expr.pseudos, Expr.setFilters = new setFilters, tokenize = Sizzle.tokenize = function(selector, parseOnly) {
                    var matched, match, tokens, type, soFar, groups, preFilters, cached = tokenCache[selector + " "];
                    if (cached) return parseOnly ? 0 : cached.slice(0);
                    for (soFar = selector, groups = [], preFilters = Expr.preFilter; soFar;) {
                        for (type in matched && !(match = rcomma.exec(soFar)) || (match && (soFar = soFar.slice(match[0].length) || soFar), groups.push(tokens = [])), matched = !1, (match = rcombinators.exec(soFar)) && (matched = match.shift(), tokens.push({
                                value: matched,
                                type: match[0].replace(rtrim, " ")
                            }), soFar = soFar.slice(matched.length)), Expr.filter) !(match = matchExpr[type].exec(soFar)) || preFilters[type] && !(match = preFilters[type](match)) || (matched = match.shift(), tokens.push({
                            value: matched,
                            type: type,
                            matches: match
                        }), soFar = soFar.slice(matched.length));
                        if (!matched) break
                    }
                    return parseOnly ? soFar.length : soFar ? Sizzle.error(selector) : tokenCache(selector, groups).slice(0)
                }, compile = Sizzle.compile = function(selector, match) {
                    var i, setMatchers = [],
                        elementMatchers = [],
                        cached = compilerCache[selector + " "];
                    if (!cached) {
                        for (match || (match = tokenize(selector)), i = match.length; i--;)(cached = matcherFromTokens(match[i]))[expando] ? setMatchers.push(cached) : elementMatchers.push(cached);
                        (cached = compilerCache(selector, function matcherFromGroupMatchers(elementMatchers, setMatchers) {
                            var bySet = setMatchers.length > 0,
                                byElement = elementMatchers.length > 0,
                                superMatcher = function(seed, context, xml, results, outermost) {
                                    var elem, j, matcher, matchedCount = 0,
                                        i = "0",
                                        unmatched = seed && [],
                                        setMatched = [],
                                        contextBackup = outermostContext,
                                        elems = seed || byElement && Expr.find.TAG("*", outermost),
                                        dirrunsUnique = dirruns += null == contextBackup ? 1 : Math.random() || .1,
                                        len = elems.length;
                                    for (outermost && (outermostContext = context == document || context || outermost); i !== len && null != (elem = elems[i]); i++) {
                                        if (byElement && elem) {
                                            for (j = 0, context || elem.ownerDocument == document || (setDocument(elem), xml = !documentIsHTML); matcher = elementMatchers[j++];)
                                                if (matcher(elem, context || document, xml)) {
                                                    results.push(elem);
                                                    break
                                                } outermost && (dirruns = dirrunsUnique)
                                        }
                                        bySet && ((elem = !matcher && elem) && matchedCount--, seed && unmatched.push(elem))
                                    }
                                    if (matchedCount += i, bySet && i !== matchedCount) {
                                        for (j = 0; matcher = setMatchers[j++];) matcher(unmatched, setMatched, context, xml);
                                        if (seed) {
                                            if (matchedCount > 0)
                                                for (; i--;) unmatched[i] || setMatched[i] || (setMatched[i] = pop.call(results));
                                            setMatched = condense(setMatched)
                                        }
                                        push.apply(results, setMatched), outermost && !seed && setMatched.length > 0 && matchedCount + setMatchers.length > 1 && Sizzle.uniqueSort(results)
                                    }
                                    return outermost && (dirruns = dirrunsUnique, outermostContext = contextBackup), unmatched
                                };
                            return bySet ? markFunction(superMatcher) : superMatcher
                        }(elementMatchers, setMatchers))).selector = selector
                    }
                    return cached
                }, select = Sizzle.select = function(selector, context, results, seed) {
                    var i, tokens, token, type, find, compiled = "function" == typeof selector && selector,
                        match = !seed && tokenize(selector = compiled.selector || selector);
                    if (results = results || [], 1 === match.length) {
                        if ((tokens = match[0] = match[0].slice(0)).length > 2 && "ID" === (token = tokens[0]).type && 9 === context.nodeType && documentIsHTML && Expr.relative[tokens[1].type]) {
                            if (!(context = (Expr.find.ID(token.matches[0].replace(runescape, funescape), context) || [])[0])) return results;
                            compiled && (context = context.parentNode), selector = selector.slice(tokens.shift().value.length)
                        }
                        for (i = matchExpr.needsContext.test(selector) ? 0 : tokens.length; i-- && (token = tokens[i], !Expr.relative[type = token.type]);)
                            if ((find = Expr.find[type]) && (seed = find(token.matches[0].replace(runescape, funescape), rsibling.test(tokens[0].type) && testContext(context.parentNode) || context))) {
                                if (tokens.splice(i, 1), !(selector = seed.length && toSelector(tokens))) return push.apply(results, seed), results;
                                break
                            }
                    }
                    return (compiled || compile(selector, match))(seed, context, !documentIsHTML, results, !context || rsibling.test(selector) && testContext(context.parentNode) || context), results
                }, support.sortStable = expando.split("").sort(sortOrder).join("") === expando, support.detectDuplicates = !!hasDuplicate, setDocument(), support.sortDetached = assert(function(el) {
                    return 1 & el.compareDocumentPosition(document.createElement("fieldset"))
                }), assert(function(el) {
                    return el.innerHTML = "<a href='#'></a>", "#" === el.firstChild.getAttribute("href")
                }) || addHandle("type|href|height|width", function(elem, name, isXML) {
                    if (!isXML) return elem.getAttribute(name, "type" === name.toLowerCase() ? 1 : 2)
                }), support.attributes && assert(function(el) {
                    return el.innerHTML = "<input/>", el.firstChild.setAttribute("value", ""), "" === el.firstChild.getAttribute("value")
                }) || addHandle("value", function(elem, _name, isXML) {
                    if (!isXML && "input" === elem.nodeName.toLowerCase()) return elem.defaultValue
                }), assert(function(el) {
                    return null == el.getAttribute("disabled")
                }) || addHandle(booleans, function(elem, name, isXML) {
                    var val;
                    if (!isXML) return !0 === elem[name] ? name.toLowerCase() : (val = elem.getAttributeNode(name)) && val.specified ? val.value : null
                }), Sizzle
            }(window);
        jQuery.find = Sizzle, jQuery.expr = Sizzle.selectors, jQuery.expr[":"] = jQuery.expr.pseudos, jQuery.uniqueSort = jQuery.unique = Sizzle.uniqueSort, jQuery.text = Sizzle.getText, jQuery.isXMLDoc = Sizzle.isXML, jQuery.contains = Sizzle.contains, jQuery.escapeSelector = Sizzle.escape;
        var dir = function(elem, dir, until) {
                for (var matched = [], truncate = void 0 !== until;
                    (elem = elem[dir]) && 9 !== elem.nodeType;)
                    if (1 === elem.nodeType) {
                        if (truncate && jQuery(elem).is(until)) break;
                        matched.push(elem)
                    } return matched
            },
            siblings = function(n, elem) {
                for (var matched = []; n; n = n.nextSibling) 1 === n.nodeType && n !== elem && matched.push(n);
                return matched
            },
            rneedsContext = jQuery.expr.match.needsContext;

        function nodeName(elem, name) {
            return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase()
        }
        var rsingleTag = /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i;

        function winnow(elements, qualifier, not) {
            return isFunction(qualifier) ? jQuery.grep(elements, function(elem, i) {
                return !!qualifier.call(elem, i, elem) !== not
            }) : qualifier.nodeType ? jQuery.grep(elements, function(elem) {
                return elem === qualifier !== not
            }) : "string" != typeof qualifier ? jQuery.grep(elements, function(elem) {
                return indexOf.call(qualifier, elem) > -1 !== not
            }) : jQuery.filter(qualifier, elements, not)
        }
        jQuery.filter = function(expr, elems, not) {
            var elem = elems[0];
            return not && (expr = ":not(" + expr + ")"), 1 === elems.length && 1 === elem.nodeType ? jQuery.find.matchesSelector(elem, expr) ? [elem] : [] : jQuery.find.matches(expr, jQuery.grep(elems, function(elem) {
                return 1 === elem.nodeType
            }))
        }, jQuery.fn.extend({
            find: function(selector) {
                var i, ret, len = this.length,
                    self = this;
                if ("string" != typeof selector) return this.pushStack(jQuery(selector).filter(function() {
                    for (i = 0; i < len; i++)
                        if (jQuery.contains(self[i], this)) return !0
                }));
                for (ret = this.pushStack([]), i = 0; i < len; i++) jQuery.find(selector, self[i], ret);
                return len > 1 ? jQuery.uniqueSort(ret) : ret
            },
            filter: function(selector) {
                return this.pushStack(winnow(this, selector || [], !1))
            },
            not: function(selector) {
                return this.pushStack(winnow(this, selector || [], !0))
            },
            is: function(selector) {
                return !!winnow(this, "string" == typeof selector && rneedsContext.test(selector) ? jQuery(selector) : selector || [], !1).length
            }
        });
        var rootjQuery, rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/;
        (jQuery.fn.init = function(selector, context, root) {
            var match, elem;
            if (!selector) return this;
            if (root = root || rootjQuery, "string" == typeof selector) {
                if (!(match = "<" === selector[0] && ">" === selector[selector.length - 1] && selector.length >= 3 ? [null, selector, null] : rquickExpr.exec(selector)) || !match[1] && context) return !context || context.jquery ? (context || root).find(selector) : this.constructor(context).find(selector);
                if (match[1]) {
                    if (context = context instanceof jQuery ? context[0] : context, jQuery.merge(this, jQuery.parseHTML(match[1], context && context.nodeType ? context.ownerDocument || context : document, !0)), rsingleTag.test(match[1]) && jQuery.isPlainObject(context))
                        for (match in context) isFunction(this[match]) ? this[match](context[match]) : this.attr(match, context[match]);
                    return this
                }
                return (elem = document.getElementById(match[2])) && (this[0] = elem, this.length = 1), this
            }
            return selector.nodeType ? (this[0] = selector, this.length = 1, this) : isFunction(selector) ? void 0 !== root.ready ? root.ready(selector) : selector(jQuery) : jQuery.makeArray(selector, this)
        }).prototype = jQuery.fn, rootjQuery = jQuery(document);
        var rparentsprev = /^(?:parents|prev(?:Until|All))/,
            guaranteedUnique = {
                children: !0,
                contents: !0,
                next: !0,
                prev: !0
            };

        function sibling(cur, dir) {
            for (;
                (cur = cur[dir]) && 1 !== cur.nodeType;);
            return cur
        }
        jQuery.fn.extend({
            has: function(target) {
                var targets = jQuery(target, this),
                    l = targets.length;
                return this.filter(function() {
                    for (var i = 0; i < l; i++)
                        if (jQuery.contains(this, targets[i])) return !0
                })
            },
            closest: function(selectors, context) {
                var cur, i = 0,
                    l = this.length,
                    matched = [],
                    targets = "string" != typeof selectors && jQuery(selectors);
                if (!rneedsContext.test(selectors))
                    for (; i < l; i++)
                        for (cur = this[i]; cur && cur !== context; cur = cur.parentNode)
                            if (cur.nodeType < 11 && (targets ? targets.index(cur) > -1 : 1 === cur.nodeType && jQuery.find.matchesSelector(cur, selectors))) {
                                matched.push(cur);
                                break
                            } return this.pushStack(matched.length > 1 ? jQuery.uniqueSort(matched) : matched)
            },
            index: function(elem) {
                return elem ? "string" == typeof elem ? indexOf.call(jQuery(elem), this[0]) : indexOf.call(this, elem.jquery ? elem[0] : elem) : this[0] && this[0].parentNode ? this.first().prevAll().length : -1
            },
            add: function(selector, context) {
                return this.pushStack(jQuery.uniqueSort(jQuery.merge(this.get(), jQuery(selector, context))))
            },
            addBack: function(selector) {
                return this.add(null == selector ? this.prevObject : this.prevObject.filter(selector))
            }
        }), jQuery.each({
            parent: function(elem) {
                var parent = elem.parentNode;
                return parent && 11 !== parent.nodeType ? parent : null
            },
            parents: function(elem) {
                return dir(elem, "parentNode")
            },
            parentsUntil: function(elem, _i, until) {
                return dir(elem, "parentNode", until)
            },
            next: function(elem) {
                return sibling(elem, "nextSibling")
            },
            prev: function(elem) {
                return sibling(elem, "previousSibling")
            },
            nextAll: function(elem) {
                return dir(elem, "nextSibling")
            },
            prevAll: function(elem) {
                return dir(elem, "previousSibling")
            },
            nextUntil: function(elem, _i, until) {
                return dir(elem, "nextSibling", until)
            },
            prevUntil: function(elem, _i, until) {
                return dir(elem, "previousSibling", until)
            },
            siblings: function(elem) {
                return siblings((elem.parentNode || {}).firstChild, elem)
            },
            children: function(elem) {
                return siblings(elem.firstChild)
            },
            contents: function(elem) {
                return null != elem.contentDocument && getProto(elem.contentDocument) ? elem.contentDocument : (nodeName(elem, "template") && (elem = elem.content || elem), jQuery.merge([], elem.childNodes))
            }
        }, function(name, fn) {
            jQuery.fn[name] = function(until, selector) {
                var matched = jQuery.map(this, fn, until);
                return "Until" !== name.slice(-5) && (selector = until), selector && "string" == typeof selector && (matched = jQuery.filter(selector, matched)), this.length > 1 && (guaranteedUnique[name] || jQuery.uniqueSort(matched), rparentsprev.test(name) && matched.reverse()), this.pushStack(matched)
            }
        });
        var rnothtmlwhite = /[^\x20\t\r\n\f]+/g;

        function Identity(v) {
            return v
        }

        function Thrower(ex) {
            throw ex
        }

        function adoptValue(value, resolve, reject, noValue) {
            var method;
            try {
                value && isFunction(method = value.promise) ? method.call(value).done(resolve).fail(reject) : value && isFunction(method = value.then) ? method.call(value, resolve, reject) : resolve.apply(void 0, [value].slice(noValue))
            } catch (value) {
                reject.apply(void 0, [value])
            }
        }
        jQuery.Callbacks = function(options) {
            options = "string" == typeof options ? function createOptions(options) {
                var object = {};
                return jQuery.each(options.match(rnothtmlwhite) || [], function(_, flag) {
                    object[flag] = !0
                }), object
            }(options) : jQuery.extend({}, options);
            var firing, memory, fired, locked, list = [],
                queue = [],
                firingIndex = -1,
                fire = function() {
                    for (locked = locked || options.once, fired = firing = !0; queue.length; firingIndex = -1)
                        for (memory = queue.shift(); ++firingIndex < list.length;) !1 === list[firingIndex].apply(memory[0], memory[1]) && options.stopOnFalse && (firingIndex = list.length, memory = !1);
                    options.memory || (memory = !1), firing = !1, locked && (list = memory ? [] : "")
                },
                self = {
                    add: function() {
                        return list && (memory && !firing && (firingIndex = list.length - 1, queue.push(memory)), function add(args) {
                            jQuery.each(args, function(_, arg) {
                                isFunction(arg) ? options.unique && self.has(arg) || list.push(arg) : arg && arg.length && "string" !== toType(arg) && add(arg)
                            })
                        }(arguments), memory && !firing && fire()), this
                    },
                    remove: function() {
                        return jQuery.each(arguments, function(_, arg) {
                            for (var index;
                                (index = jQuery.inArray(arg, list, index)) > -1;) list.splice(index, 1), index <= firingIndex && firingIndex--
                        }), this
                    },
                    has: function(fn) {
                        return fn ? jQuery.inArray(fn, list) > -1 : list.length > 0
                    },
                    empty: function() {
                        return list && (list = []), this
                    },
                    disable: function() {
                        return locked = queue = [], list = memory = "", this
                    },
                    disabled: function() {
                        return !list
                    },
                    lock: function() {
                        return locked = queue = [], memory || firing || (list = memory = ""), this
                    },
                    locked: function() {
                        return !!locked
                    },
                    fireWith: function(context, args) {
                        return locked || (args = [context, (args = args || []).slice ? args.slice() : args], queue.push(args), firing || fire()), this
                    },
                    fire: function() {
                        return self.fireWith(this, arguments), this
                    },
                    fired: function() {
                        return !!fired
                    }
                };
            return self
        }, jQuery.extend({
            Deferred: function(func) {
                var tuples = [
                        ["notify", "progress", jQuery.Callbacks("memory"), jQuery.Callbacks("memory"), 2],
                        ["resolve", "done", jQuery.Callbacks("once memory"), jQuery.Callbacks("once memory"), 0, "resolved"],
                        ["reject", "fail", jQuery.Callbacks("once memory"), jQuery.Callbacks("once memory"), 1, "rejected"]
                    ],
                    state = "pending",
                    promise = {
                        state: function() {
                            return state
                        },
                        always: function() {
                            return deferred.done(arguments).fail(arguments), this
                        },
                        catch: function(fn) {
                            return promise.then(null, fn)
                        },
                        pipe: function() {
                            var fns = arguments;
                            return jQuery.Deferred(function(newDefer) {
                                jQuery.each(tuples, function(_i, tuple) {
                                    var fn = isFunction(fns[tuple[4]]) && fns[tuple[4]];
                                    deferred[tuple[1]](function() {
                                        var returned = fn && fn.apply(this, arguments);
                                        returned && isFunction(returned.promise) ? returned.promise().progress(newDefer.notify).done(newDefer.resolve).fail(newDefer.reject) : newDefer[tuple[0] + "With"](this, fn ? [returned] : arguments)
                                    })
                                }), fns = null
                            }).promise()
                        },
                        then: function(onFulfilled, onRejected, onProgress) {
                            var maxDepth = 0;

                            function resolve(depth, deferred, handler, special) {
                                return function() {
                                    var that = this,
                                        args = arguments,
                                        mightThrow = function() {
                                            var returned, then;
                                            if (!(depth < maxDepth)) {
                                                if ((returned = handler.apply(that, args)) === deferred.promise()) throw new TypeError("Thenable self-resolution");
                                                then = returned && ("object" == typeof returned || "function" == typeof returned) && returned.then, isFunction(then) ? special ? then.call(returned, resolve(maxDepth, deferred, Identity, special), resolve(maxDepth, deferred, Thrower, special)) : (maxDepth++, then.call(returned, resolve(maxDepth, deferred, Identity, special), resolve(maxDepth, deferred, Thrower, special), resolve(maxDepth, deferred, Identity, deferred.notifyWith))) : (handler !== Identity && (that = void 0, args = [returned]), (special || deferred.resolveWith)(that, args))
                                            }
                                        },
                                        process = special ? mightThrow : function() {
                                            try {
                                                mightThrow()
                                            } catch (e) {
                                                jQuery.Deferred.exceptionHook && jQuery.Deferred.exceptionHook(e, process.stackTrace), depth + 1 >= maxDepth && (handler !== Thrower && (that = void 0, args = [e]), deferred.rejectWith(that, args))
                                            }
                                        };
                                    depth ? process() : (jQuery.Deferred.getStackHook && (process.stackTrace = jQuery.Deferred.getStackHook()), window.setTimeout(process))
                                }
                            }
                            return jQuery.Deferred(function(newDefer) {
                                tuples[0][3].add(resolve(0, newDefer, isFunction(onProgress) ? onProgress : Identity, newDefer.notifyWith)), tuples[1][3].add(resolve(0, newDefer, isFunction(onFulfilled) ? onFulfilled : Identity)), tuples[2][3].add(resolve(0, newDefer, isFunction(onRejected) ? onRejected : Thrower))
                            }).promise()
                        },
                        promise: function(obj) {
                            return null != obj ? jQuery.extend(obj, promise) : promise
                        }
                    },
                    deferred = {};
                return jQuery.each(tuples, function(i, tuple) {
                    var list = tuple[2],
                        stateString = tuple[5];
                    promise[tuple[1]] = list.add, stateString && list.add(function() {
                        state = stateString
                    }, tuples[3 - i][2].disable, tuples[3 - i][3].disable, tuples[0][2].lock, tuples[0][3].lock), list.add(tuple[3].fire), deferred[tuple[0]] = function() {
                        return deferred[tuple[0] + "With"](this === deferred ? void 0 : this, arguments), this
                    }, deferred[tuple[0] + "With"] = list.fireWith
                }), promise.promise(deferred), func && func.call(deferred, deferred), deferred
            },
            when: function(singleValue) {
                var remaining = arguments.length,
                    i = remaining,
                    resolveContexts = Array(i),
                    resolveValues = slice.call(arguments),
                    master = jQuery.Deferred(),
                    updateFunc = function(i) {
                        return function(value) {
                            resolveContexts[i] = this, resolveValues[i] = arguments.length > 1 ? slice.call(arguments) : value, --remaining || master.resolveWith(resolveContexts, resolveValues)
                        }
                    };
                if (remaining <= 1 && (adoptValue(singleValue, master.done(updateFunc(i)).resolve, master.reject, !remaining), "pending" === master.state() || isFunction(resolveValues[i] && resolveValues[i].then))) return master.then();
                for (; i--;) adoptValue(resolveValues[i], updateFunc(i), master.reject);
                return master.promise()
            }
        });
        var rerrorNames = /^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;
        jQuery.Deferred.exceptionHook = function(error, stack) {
            window.console && window.console.warn && error && rerrorNames.test(error.name) && window.console.warn("jQuery.Deferred exception: " + error.message, error.stack, stack)
        }, jQuery.readyException = function(error) {
            window.setTimeout(function() {
                throw error
            })
        };
        var readyList = jQuery.Deferred();

        function completed() {
            document.removeEventListener("DOMContentLoaded", completed), window.removeEventListener("load", completed), jQuery.ready()
        }
        jQuery.fn.ready = function(fn) {
            return readyList.then(fn).catch(function(error) {
                jQuery.readyException(error)
            }), this
        }, jQuery.extend({
            isReady: !1,
            readyWait: 1,
            ready: function(wait) {
                (!0 === wait ? --jQuery.readyWait : jQuery.isReady) || (jQuery.isReady = !0, !0 !== wait && --jQuery.readyWait > 0 || readyList.resolveWith(document, [jQuery]))
            }
        }), jQuery.ready.then = readyList.then, "complete" === document.readyState || "loading" !== document.readyState && !document.documentElement.doScroll ? window.setTimeout(jQuery.ready) : (document.addEventListener("DOMContentLoaded", completed), window.addEventListener("load", completed));
        var access = function(elems, fn, key, value, chainable, emptyGet, raw) {
                var i = 0,
                    len = elems.length,
                    bulk = null == key;
                if ("object" === toType(key))
                    for (i in chainable = !0, key) access(elems, fn, i, key[i], !0, emptyGet, raw);
                else if (void 0 !== value && (chainable = !0, isFunction(value) || (raw = !0), bulk && (raw ? (fn.call(elems, value), fn = null) : (bulk = fn, fn = function(elem, _key, value) {
                        return bulk.call(jQuery(elem), value)
                    })), fn))
                    for (; i < len; i++) fn(elems[i], key, raw ? value : value.call(elems[i], i, fn(elems[i], key)));
                return chainable ? elems : bulk ? fn.call(elems) : len ? fn(elems[0], key) : emptyGet
            },
            rmsPrefix = /^-ms-/,
            rdashAlpha = /-([a-z])/g;

        function fcamelCase(_all, letter) {
            return letter.toUpperCase()
        }

        function camelCase(string) {
            return string.replace(rmsPrefix, "ms-").replace(rdashAlpha, fcamelCase)
        }
        var acceptData = function(owner) {
            return 1 === owner.nodeType || 9 === owner.nodeType || !+owner.nodeType
        };

        function Data() {
            this.expando = jQuery.expando + Data.uid++
        }
        Data.uid = 1, Data.prototype = {
            cache: function(owner) {
                var value = owner[this.expando];
                return value || (value = {}, acceptData(owner) && (owner.nodeType ? owner[this.expando] = value : Object.defineProperty(owner, this.expando, {
                    value: value,
                    configurable: !0
                }))), value
            },
            set: function(owner, data, value) {
                var prop, cache = this.cache(owner);
                if ("string" == typeof data) cache[camelCase(data)] = value;
                else
                    for (prop in data) cache[camelCase(prop)] = data[prop];
                return cache
            },
            get: function(owner, key) {
                return void 0 === key ? this.cache(owner) : owner[this.expando] && owner[this.expando][camelCase(key)]
            },
            access: function(owner, key, value) {
                return void 0 === key || key && "string" == typeof key && void 0 === value ? this.get(owner, key) : (this.set(owner, key, value), void 0 !== value ? value : key)
            },
            remove: function(owner, key) {
                var i, cache = owner[this.expando];
                if (void 0 !== cache) {
                    if (void 0 !== key) {
                        i = (key = Array.isArray(key) ? key.map(camelCase) : (key = camelCase(key)) in cache ? [key] : key.match(rnothtmlwhite) || []).length;
                        for (; i--;) delete cache[key[i]]
                    }(void 0 === key || jQuery.isEmptyObject(cache)) && (owner.nodeType ? owner[this.expando] = void 0 : delete owner[this.expando])
                }
            },
            hasData: function(owner) {
                var cache = owner[this.expando];
                return void 0 !== cache && !jQuery.isEmptyObject(cache)
            }
        };
        var dataPriv = new Data,
            dataUser = new Data,
            rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
            rmultiDash = /[A-Z]/g;

        function dataAttr(elem, key, data) {
            var name;
            if (void 0 === data && 1 === elem.nodeType)
                if (name = "data-" + key.replace(rmultiDash, "-$&").toLowerCase(), "string" == typeof(data = elem.getAttribute(name))) {
                    try {
                        data = function getData(data) {
                            return "true" === data || "false" !== data && ("null" === data ? null : data === +data + "" ? +data : rbrace.test(data) ? JSON.parse(data) : data)
                        }(data)
                    } catch (e) {}
                    dataUser.set(elem, key, data)
                } else data = void 0;
            return data
        }
        jQuery.extend({
            hasData: function(elem) {
                return dataUser.hasData(elem) || dataPriv.hasData(elem)
            },
            data: function(elem, name, data) {
                return dataUser.access(elem, name, data)
            },
            removeData: function(elem, name) {
                dataUser.remove(elem, name)
            },
            _data: function(elem, name, data) {
                return dataPriv.access(elem, name, data)
            },
            _removeData: function(elem, name) {
                dataPriv.remove(elem, name)
            }
        }), jQuery.fn.extend({
            data: function(key, value) {
                var i, name, data, elem = this[0],
                    attrs = elem && elem.attributes;
                if (void 0 === key) {
                    if (this.length && (data = dataUser.get(elem), 1 === elem.nodeType && !dataPriv.get(elem, "hasDataAttrs"))) {
                        for (i = attrs.length; i--;) attrs[i] && 0 === (name = attrs[i].name).indexOf("data-") && (name = camelCase(name.slice(5)), dataAttr(elem, name, data[name]));
                        dataPriv.set(elem, "hasDataAttrs", !0)
                    }
                    return data
                }
                return "object" == typeof key ? this.each(function() {
                    dataUser.set(this, key)
                }) : access(this, function(value) {
                    var data;
                    if (elem && void 0 === value) return void 0 !== (data = dataUser.get(elem, key)) ? data : void 0 !== (data = dataAttr(elem, key)) ? data : void 0;
                    this.each(function() {
                        dataUser.set(this, key, value)
                    })
                }, null, value, arguments.length > 1, null, !0)
            },
            removeData: function(key) {
                return this.each(function() {
                    dataUser.remove(this, key)
                })
            }
        }), jQuery.extend({
            queue: function(elem, type, data) {
                var queue;
                if (elem) return type = (type || "fx") + "queue", queue = dataPriv.get(elem, type), data && (!queue || Array.isArray(data) ? queue = dataPriv.access(elem, type, jQuery.makeArray(data)) : queue.push(data)), queue || []
            },
            dequeue: function(elem, type) {
                type = type || "fx";
                var queue = jQuery.queue(elem, type),
                    startLength = queue.length,
                    fn = queue.shift(),
                    hooks = jQuery._queueHooks(elem, type);
                "inprogress" === fn && (fn = queue.shift(), startLength--), fn && ("fx" === type && queue.unshift("inprogress"), delete hooks.stop, fn.call(elem, function() {
                    jQuery.dequeue(elem, type)
                }, hooks)), !startLength && hooks && hooks.empty.fire()
            },
            _queueHooks: function(elem, type) {
                var key = type + "queueHooks";
                return dataPriv.get(elem, key) || dataPriv.access(elem, key, {
                    empty: jQuery.Callbacks("once memory").add(function() {
                        dataPriv.remove(elem, [type + "queue", key])
                    })
                })
            }
        }), jQuery.fn.extend({
            queue: function(type, data) {
                var setter = 2;
                return "string" != typeof type && (data = type, type = "fx", setter--), arguments.length < setter ? jQuery.queue(this[0], type) : void 0 === data ? this : this.each(function() {
                    var queue = jQuery.queue(this, type, data);
                    jQuery._queueHooks(this, type), "fx" === type && "inprogress" !== queue[0] && jQuery.dequeue(this, type)
                })
            },
            dequeue: function(type) {
                return this.each(function() {
                    jQuery.dequeue(this, type)
                })
            },
            clearQueue: function(type) {
                return this.queue(type || "fx", [])
            },
            promise: function(type, obj) {
                var tmp, count = 1,
                    defer = jQuery.Deferred(),
                    elements = this,
                    i = this.length,
                    resolve = function() {
                        --count || defer.resolveWith(elements, [elements])
                    };
                for ("string" != typeof type && (obj = type, type = void 0), type = type || "fx"; i--;)(tmp = dataPriv.get(elements[i], type + "queueHooks")) && tmp.empty && (count++, tmp.empty.add(resolve));
                return resolve(), defer.promise(obj)
            }
        });
        var pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,
            rcssNum = new RegExp("^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i"),
            cssExpand = ["Top", "Right", "Bottom", "Left"],
            documentElement = document.documentElement,
            isAttached = function(elem) {
                return jQuery.contains(elem.ownerDocument, elem)
            },
            composed = {
                composed: !0
            };
        documentElement.getRootNode && (isAttached = function(elem) {
            return jQuery.contains(elem.ownerDocument, elem) || elem.getRootNode(composed) === elem.ownerDocument
        });
        var isHiddenWithinTree = function(elem, el) {
            return "none" === (elem = el || elem).style.display || "" === elem.style.display && isAttached(elem) && "none" === jQuery.css(elem, "display")
        };

        function adjustCSS(elem, prop, valueParts, tween) {
            var adjusted, scale, maxIterations = 20,
                currentValue = tween ? function() {
                    return tween.cur()
                } : function() {
                    return jQuery.css(elem, prop, "")
                },
                initial = currentValue(),
                unit = valueParts && valueParts[3] || (jQuery.cssNumber[prop] ? "" : "px"),
                initialInUnit = elem.nodeType && (jQuery.cssNumber[prop] || "px" !== unit && +initial) && rcssNum.exec(jQuery.css(elem, prop));
            if (initialInUnit && initialInUnit[3] !== unit) {
                for (initial /= 2, unit = unit || initialInUnit[3], initialInUnit = +initial || 1; maxIterations--;) jQuery.style(elem, prop, initialInUnit + unit), (1 - scale) * (1 - (scale = currentValue() / initial || .5)) <= 0 && (maxIterations = 0), initialInUnit /= scale;
                initialInUnit *= 2, jQuery.style(elem, prop, initialInUnit + unit), valueParts = valueParts || []
            }
            return valueParts && (initialInUnit = +initialInUnit || +initial || 0, adjusted = valueParts[1] ? initialInUnit + (valueParts[1] + 1) * valueParts[2] : +valueParts[2], tween && (tween.unit = unit, tween.start = initialInUnit, tween.end = adjusted)), adjusted
        }
        var defaultDisplayMap = {};

        function getDefaultDisplay(elem) {
            var temp, doc = elem.ownerDocument,
                nodeName = elem.nodeName,
                display = defaultDisplayMap[nodeName];
            return display || (temp = doc.body.appendChild(doc.createElement(nodeName)), display = jQuery.css(temp, "display"), temp.parentNode.removeChild(temp), "none" === display && (display = "block"), defaultDisplayMap[nodeName] = display, display)
        }

        function showHide(elements, show) {
            for (var display, elem, values = [], index = 0, length = elements.length; index < length; index++)(elem = elements[index]).style && (display = elem.style.display, show ? ("none" === display && (values[index] = dataPriv.get(elem, "display") || null, values[index] || (elem.style.display = "")), "" === elem.style.display && isHiddenWithinTree(elem) && (values[index] = getDefaultDisplay(elem))) : "none" !== display && (values[index] = "none", dataPriv.set(elem, "display", display)));
            for (index = 0; index < length; index++) null != values[index] && (elements[index].style.display = values[index]);
            return elements
        }
        jQuery.fn.extend({
            show: function() {
                return showHide(this, !0)
            },
            hide: function() {
                return showHide(this)
            },
            toggle: function(state) {
                return "boolean" == typeof state ? state ? this.show() : this.hide() : this.each(function() {
                    isHiddenWithinTree(this) ? jQuery(this).show() : jQuery(this).hide()
                })
            }
        });
        var div, input, rcheckableType = /^(?:checkbox|radio)$/i,
            rtagName = /<([a-z][^\/\0>\x20\t\r\n\f]*)/i,
            rscriptType = /^$|^module$|\/(?:java|ecma)script/i;
        div = document.createDocumentFragment().appendChild(document.createElement("div")), (input = document.createElement("input")).setAttribute("type", "radio"), input.setAttribute("checked", "checked"), input.setAttribute("name", "t"), div.appendChild(input), support.checkClone = div.cloneNode(!0).cloneNode(!0).lastChild.checked, div.innerHTML = "<textarea>x</textarea>", support.noCloneChecked = !!div.cloneNode(!0).lastChild.defaultValue, div.innerHTML = "<option></option>", support.option = !!div.lastChild;
        var wrapMap = {
            thead: [1, "<table>", "</table>"],
            col: [2, "<table><colgroup>", "</colgroup></table>"],
            tr: [2, "<table><tbody>", "</tbody></table>"],
            td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
            _default: [0, "", ""]
        };

        function getAll(context, tag) {
            var ret;
            return ret = void 0 !== context.getElementsByTagName ? context.getElementsByTagName(tag || "*") : void 0 !== context.querySelectorAll ? context.querySelectorAll(tag || "*") : [], void 0 === tag || tag && nodeName(context, tag) ? jQuery.merge([context], ret) : ret
        }

        function setGlobalEval(elems, refElements) {
            for (var i = 0, l = elems.length; i < l; i++) dataPriv.set(elems[i], "globalEval", !refElements || dataPriv.get(refElements[i], "globalEval"))
        }
        wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead, wrapMap.th = wrapMap.td, support.option || (wrapMap.optgroup = wrapMap.option = [1, "<select multiple='multiple'>", "</select>"]);
        var rhtml = /<|&#?\w+;/;

        function buildFragment(elems, context, scripts, selection, ignored) {
            for (var elem, tmp, tag, wrap, attached, j, fragment = context.createDocumentFragment(), nodes = [], i = 0, l = elems.length; i < l; i++)
                if ((elem = elems[i]) || 0 === elem)
                    if ("object" === toType(elem)) jQuery.merge(nodes, elem.nodeType ? [elem] : elem);
                    else if (rhtml.test(elem)) {
                for (tmp = tmp || fragment.appendChild(context.createElement("div")), tag = (rtagName.exec(elem) || ["", ""])[1].toLowerCase(), wrap = wrapMap[tag] || wrapMap._default, tmp.innerHTML = wrap[1] + jQuery.htmlPrefilter(elem) + wrap[2], j = wrap[0]; j--;) tmp = tmp.lastChild;
                jQuery.merge(nodes, tmp.childNodes), (tmp = fragment.firstChild).textContent = ""
            } else nodes.push(context.createTextNode(elem));
            for (fragment.textContent = "", i = 0; elem = nodes[i++];)
                if (selection && jQuery.inArray(elem, selection) > -1) ignored && ignored.push(elem);
                else if (attached = isAttached(elem), tmp = getAll(fragment.appendChild(elem), "script"), attached && setGlobalEval(tmp), scripts)
                for (j = 0; elem = tmp[j++];) rscriptType.test(elem.type || "") && scripts.push(elem);
            return fragment
        }
        var rkeyEvent = /^key/,
            rmouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,
            rtypenamespace = /^([^.]*)(?:\.(.+)|)/;

        function returnTrue() {
            return !0
        }

        function returnFalse() {
            return !1
        }

        function expectSync(elem, type) {
            return elem === function safeActiveElement() {
                try {
                    return document.activeElement
                } catch (err) {}
            }() == ("focus" === type)
        }

        function on(elem, types, selector, data, fn, one) {
            var origFn, type;
            if ("object" == typeof types) {
                for (type in "string" != typeof selector && (data = data || selector, selector = void 0), types) on(elem, type, selector, data, types[type], one);
                return elem
            }
            if (null == data && null == fn ? (fn = selector, data = selector = void 0) : null == fn && ("string" == typeof selector ? (fn = data, data = void 0) : (fn = data, data = selector, selector = void 0)), !1 === fn) fn = returnFalse;
            else if (!fn) return elem;
            return 1 === one && (origFn = fn, (fn = function(event) {
                return jQuery().off(event), origFn.apply(this, arguments)
            }).guid = origFn.guid || (origFn.guid = jQuery.guid++)), elem.each(function() {
                jQuery.event.add(this, types, fn, data, selector)
            })
        }

        function leverageNative(el, type, expectSync) {
            expectSync ? (dataPriv.set(el, type, !1), jQuery.event.add(el, type, {
                namespace: !1,
                handler: function(event) {
                    var notAsync, result, saved = dataPriv.get(this, type);
                    if (1 & event.isTrigger && this[type]) {
                        if (saved.length)(jQuery.event.special[type] || {}).delegateType && event.stopPropagation();
                        else if (saved = slice.call(arguments), dataPriv.set(this, type, saved), notAsync = expectSync(this, type), this[type](), saved !== (result = dataPriv.get(this, type)) || notAsync ? dataPriv.set(this, type, !1) : result = {}, saved !== result) return event.stopImmediatePropagation(), event.preventDefault(), result.value
                    } else saved.length && (dataPriv.set(this, type, {
                        value: jQuery.event.trigger(jQuery.extend(saved[0], jQuery.Event.prototype), saved.slice(1), this)
                    }), event.stopImmediatePropagation())
                }
            })) : void 0 === dataPriv.get(el, type) && jQuery.event.add(el, type, returnTrue)
        }
        jQuery.event = {
            global: {},
            add: function(elem, types, handler, data, selector) {
                var handleObjIn, eventHandle, tmp, events, t, handleObj, special, handlers, type, namespaces, origType, elemData = dataPriv.get(elem);
                if (acceptData(elem))
                    for (handler.handler && (handler = (handleObjIn = handler).handler, selector = handleObjIn.selector), selector && jQuery.find.matchesSelector(documentElement, selector), handler.guid || (handler.guid = jQuery.guid++), (events = elemData.events) || (events = elemData.events = Object.create(null)), (eventHandle = elemData.handle) || (eventHandle = elemData.handle = function(e) {
                            return void 0 !== jQuery && jQuery.event.triggered !== e.type ? jQuery.event.dispatch.apply(elem, arguments) : void 0
                        }), t = (types = (types || "").match(rnothtmlwhite) || [""]).length; t--;) type = origType = (tmp = rtypenamespace.exec(types[t]) || [])[1], namespaces = (tmp[2] || "").split(".").sort(), type && (special = jQuery.event.special[type] || {}, type = (selector ? special.delegateType : special.bindType) || type, special = jQuery.event.special[type] || {}, handleObj = jQuery.extend({
                        type: type,
                        origType: origType,
                        data: data,
                        handler: handler,
                        guid: handler.guid,
                        selector: selector,
                        needsContext: selector && jQuery.expr.match.needsContext.test(selector),
                        namespace: namespaces.join(".")
                    }, handleObjIn), (handlers = events[type]) || ((handlers = events[type] = []).delegateCount = 0, special.setup && !1 !== special.setup.call(elem, data, namespaces, eventHandle) || elem.addEventListener && elem.addEventListener(type, eventHandle)), special.add && (special.add.call(elem, handleObj), handleObj.handler.guid || (handleObj.handler.guid = handler.guid)), selector ? handlers.splice(handlers.delegateCount++, 0, handleObj) : handlers.push(handleObj), jQuery.event.global[type] = !0)
            },
            remove: function(elem, types, handler, selector, mappedTypes) {
                var j, origCount, tmp, events, t, handleObj, special, handlers, type, namespaces, origType, elemData = dataPriv.hasData(elem) && dataPriv.get(elem);
                if (elemData && (events = elemData.events)) {
                    for (t = (types = (types || "").match(rnothtmlwhite) || [""]).length; t--;)
                        if (type = origType = (tmp = rtypenamespace.exec(types[t]) || [])[1], namespaces = (tmp[2] || "").split(".").sort(), type) {
                            for (special = jQuery.event.special[type] || {}, handlers = events[type = (selector ? special.delegateType : special.bindType) || type] || [], tmp = tmp[2] && new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)"), origCount = j = handlers.length; j--;) handleObj = handlers[j], !mappedTypes && origType !== handleObj.origType || handler && handler.guid !== handleObj.guid || tmp && !tmp.test(handleObj.namespace) || selector && selector !== handleObj.selector && ("**" !== selector || !handleObj.selector) || (handlers.splice(j, 1), handleObj.selector && handlers.delegateCount--, special.remove && special.remove.call(elem, handleObj));
                            origCount && !handlers.length && (special.teardown && !1 !== special.teardown.call(elem, namespaces, elemData.handle) || jQuery.removeEvent(elem, type, elemData.handle), delete events[type])
                        } else
                            for (type in events) jQuery.event.remove(elem, type + types[t], handler, selector, !0);
                    jQuery.isEmptyObject(events) && dataPriv.remove(elem, "handle events")
                }
            },
            dispatch: function(nativeEvent) {
                var i, j, ret, matched, handleObj, handlerQueue, args = new Array(arguments.length),
                    event = jQuery.event.fix(nativeEvent),
                    handlers = (dataPriv.get(this, "events") || Object.create(null))[event.type] || [],
                    special = jQuery.event.special[event.type] || {};
                for (args[0] = event, i = 1; i < arguments.length; i++) args[i] = arguments[i];
                if (event.delegateTarget = this, !special.preDispatch || !1 !== special.preDispatch.call(this, event)) {
                    for (handlerQueue = jQuery.event.handlers.call(this, event, handlers), i = 0;
                        (matched = handlerQueue[i++]) && !event.isPropagationStopped();)
                        for (event.currentTarget = matched.elem, j = 0;
                            (handleObj = matched.handlers[j++]) && !event.isImmediatePropagationStopped();) event.rnamespace && !1 !== handleObj.namespace && !event.rnamespace.test(handleObj.namespace) || (event.handleObj = handleObj, event.data = handleObj.data, void 0 !== (ret = ((jQuery.event.special[handleObj.origType] || {}).handle || handleObj.handler).apply(matched.elem, args)) && !1 === (event.result = ret) && (event.preventDefault(), event.stopPropagation()));
                    return special.postDispatch && special.postDispatch.call(this, event), event.result
                }
            },
            handlers: function(event, handlers) {
                var i, handleObj, sel, matchedHandlers, matchedSelectors, handlerQueue = [],
                    delegateCount = handlers.delegateCount,
                    cur = event.target;
                if (delegateCount && cur.nodeType && !("click" === event.type && event.button >= 1))
                    for (; cur !== this; cur = cur.parentNode || this)
                        if (1 === cur.nodeType && ("click" !== event.type || !0 !== cur.disabled)) {
                            for (matchedHandlers = [], matchedSelectors = {}, i = 0; i < delegateCount; i++) void 0 === matchedSelectors[sel = (handleObj = handlers[i]).selector + " "] && (matchedSelectors[sel] = handleObj.needsContext ? jQuery(sel, this).index(cur) > -1 : jQuery.find(sel, this, null, [cur]).length), matchedSelectors[sel] && matchedHandlers.push(handleObj);
                            matchedHandlers.length && handlerQueue.push({
                                elem: cur,
                                handlers: matchedHandlers
                            })
                        } return cur = this, delegateCount < handlers.length && handlerQueue.push({
                    elem: cur,
                    handlers: handlers.slice(delegateCount)
                }), handlerQueue
            },
            addProp: function(name, hook) {
                Object.defineProperty(jQuery.Event.prototype, name, {
                    enumerable: !0,
                    configurable: !0,
                    get: isFunction(hook) ? function() {
                        if (this.originalEvent) return hook(this.originalEvent)
                    } : function() {
                        if (this.originalEvent) return this.originalEvent[name]
                    },
                    set: function(value) {
                        Object.defineProperty(this, name, {
                            enumerable: !0,
                            configurable: !0,
                            writable: !0,
                            value: value
                        })
                    }
                })
            },
            fix: function(originalEvent) {
                return originalEvent[jQuery.expando] ? originalEvent : new jQuery.Event(originalEvent)
            },
            special: {
                load: {
                    noBubble: !0
                },
                click: {
                    setup: function(data) {
                        var el = this || data;
                        return rcheckableType.test(el.type) && el.click && nodeName(el, "input") && leverageNative(el, "click", returnTrue), !1
                    },
                    trigger: function(data) {
                        var el = this || data;
                        return rcheckableType.test(el.type) && el.click && nodeName(el, "input") && leverageNative(el, "click"), !0
                    },
                    _default: function(event) {
                        var target = event.target;
                        return rcheckableType.test(target.type) && target.click && nodeName(target, "input") && dataPriv.get(target, "click") || nodeName(target, "a")
                    }
                },
                beforeunload: {
                    postDispatch: function(event) {
                        void 0 !== event.result && event.originalEvent && (event.originalEvent.returnValue = event.result)
                    }
                }
            }
        }, jQuery.removeEvent = function(elem, type, handle) {
            elem.removeEventListener && elem.removeEventListener(type, handle)
        }, jQuery.Event = function(src, props) {
            if (!(this instanceof jQuery.Event)) return new jQuery.Event(src, props);
            src && src.type ? (this.originalEvent = src, this.type = src.type, this.isDefaultPrevented = src.defaultPrevented || void 0 === src.defaultPrevented && !1 === src.returnValue ? returnTrue : returnFalse, this.target = src.target && 3 === src.target.nodeType ? src.target.parentNode : src.target, this.currentTarget = src.currentTarget, this.relatedTarget = src.relatedTarget) : this.type = src, props && jQuery.extend(this, props), this.timeStamp = src && src.timeStamp || Date.now(), this[jQuery.expando] = !0
        }, jQuery.Event.prototype = {
            constructor: jQuery.Event,
            isDefaultPrevented: returnFalse,
            isPropagationStopped: returnFalse,
            isImmediatePropagationStopped: returnFalse,
            isSimulated: !1,
            preventDefault: function() {
                var e = this.originalEvent;
                this.isDefaultPrevented = returnTrue, e && !this.isSimulated && e.preventDefault()
            },
            stopPropagation: function() {
                var e = this.originalEvent;
                this.isPropagationStopped = returnTrue, e && !this.isSimulated && e.stopPropagation()
            },
            stopImmediatePropagation: function() {
                var e = this.originalEvent;
                this.isImmediatePropagationStopped = returnTrue, e && !this.isSimulated && e.stopImmediatePropagation(), this.stopPropagation()
            }
        }, jQuery.each({
            altKey: !0,
            bubbles: !0,
            cancelable: !0,
            changedTouches: !0,
            ctrlKey: !0,
            detail: !0,
            eventPhase: !0,
            metaKey: !0,
            pageX: !0,
            pageY: !0,
            shiftKey: !0,
            view: !0,
            char: !0,
            code: !0,
            charCode: !0,
            key: !0,
            keyCode: !0,
            button: !0,
            buttons: !0,
            clientX: !0,
            clientY: !0,
            offsetX: !0,
            offsetY: !0,
            pointerId: !0,
            pointerType: !0,
            screenX: !0,
            screenY: !0,
            targetTouches: !0,
            toElement: !0,
            touches: !0,
            which: function(event) {
                var button = event.button;
                return null == event.which && rkeyEvent.test(event.type) ? null != event.charCode ? event.charCode : event.keyCode : !event.which && void 0 !== button && rmouseEvent.test(event.type) ? 1 & button ? 1 : 2 & button ? 3 : 4 & button ? 2 : 0 : event.which
            }
        }, jQuery.event.addProp), jQuery.each({
            focus: "focusin",
            blur: "focusout"
        }, function(type, delegateType) {
            jQuery.event.special[type] = {
                setup: function() {
                    return leverageNative(this, type, expectSync), !1
                },
                trigger: function() {
                    return leverageNative(this, type), !0
                },
                delegateType: delegateType
            }
        }), jQuery.each({
            mouseenter: "mouseover",
            mouseleave: "mouseout",
            pointerenter: "pointerover",
            pointerleave: "pointerout"
        }, function(orig, fix) {
            jQuery.event.special[orig] = {
                delegateType: fix,
                bindType: fix,
                handle: function(event) {
                    var ret, target = this,
                        related = event.relatedTarget,
                        handleObj = event.handleObj;
                    return related && (related === target || jQuery.contains(target, related)) || (event.type = handleObj.origType, ret = handleObj.handler.apply(this, arguments), event.type = fix), ret
                }
            }
        }), jQuery.fn.extend({
            on: function(types, selector, data, fn) {
                return on(this, types, selector, data, fn)
            },
            one: function(types, selector, data, fn) {
                return on(this, types, selector, data, fn, 1)
            },
            off: function(types, selector, fn) {
                var handleObj, type;
                if (types && types.preventDefault && types.handleObj) return handleObj = types.handleObj, jQuery(types.delegateTarget).off(handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType, handleObj.selector, handleObj.handler), this;
                if ("object" == typeof types) {
                    for (type in types) this.off(type, selector, types[type]);
                    return this
                }
                return !1 !== selector && "function" != typeof selector || (fn = selector, selector = void 0), !1 === fn && (fn = returnFalse), this.each(function() {
                    jQuery.event.remove(this, types, fn, selector)
                })
            }
        });
        var rnoInnerhtml = /<script|<style|<link/i,
            rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
            rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;

        function manipulationTarget(elem, content) {
            return nodeName(elem, "table") && nodeName(11 !== content.nodeType ? content : content.firstChild, "tr") && jQuery(elem).children("tbody")[0] || elem
        }

        function disableScript(elem) {
            return elem.type = (null !== elem.getAttribute("type")) + "/" + elem.type, elem
        }

        function restoreScript(elem) {
            return "true/" === (elem.type || "").slice(0, 5) ? elem.type = elem.type.slice(5) : elem.removeAttribute("type"), elem
        }

        function cloneCopyEvent(src, dest) {
            var i, l, type, udataOld, udataCur, events;
            if (1 === dest.nodeType) {
                if (dataPriv.hasData(src) && (events = dataPriv.get(src).events))
                    for (type in dataPriv.remove(dest, "handle events"), events)
                        for (i = 0, l = events[type].length; i < l; i++) jQuery.event.add(dest, type, events[type][i]);
                dataUser.hasData(src) && (udataOld = dataUser.access(src), udataCur = jQuery.extend({}, udataOld), dataUser.set(dest, udataCur))
            }
        }

        function fixInput(src, dest) {
            var nodeName = dest.nodeName.toLowerCase();
            "input" === nodeName && rcheckableType.test(src.type) ? dest.checked = src.checked : "input" !== nodeName && "textarea" !== nodeName || (dest.defaultValue = src.defaultValue)
        }

        function domManip(collection, args, callback, ignored) {
            args = flat(args);
            var fragment, first, scripts, hasScripts, node, doc, i = 0,
                l = collection.length,
                iNoClone = l - 1,
                value = args[0],
                valueIsFunction = isFunction(value);
            if (valueIsFunction || l > 1 && "string" == typeof value && !support.checkClone && rchecked.test(value)) return collection.each(function(index) {
                var self = collection.eq(index);
                valueIsFunction && (args[0] = value.call(this, index, self.html())), domManip(self, args, callback, ignored)
            });
            if (l && (first = (fragment = buildFragment(args, collection[0].ownerDocument, !1, collection, ignored)).firstChild, 1 === fragment.childNodes.length && (fragment = first), first || ignored)) {
                for (hasScripts = (scripts = jQuery.map(getAll(fragment, "script"), disableScript)).length; i < l; i++) node = fragment, i !== iNoClone && (node = jQuery.clone(node, !0, !0), hasScripts && jQuery.merge(scripts, getAll(node, "script"))), callback.call(collection[i], node, i);
                if (hasScripts)
                    for (doc = scripts[scripts.length - 1].ownerDocument, jQuery.map(scripts, restoreScript), i = 0; i < hasScripts; i++) node = scripts[i], rscriptType.test(node.type || "") && !dataPriv.access(node, "globalEval") && jQuery.contains(doc, node) && (node.src && "module" !== (node.type || "").toLowerCase() ? jQuery._evalUrl && !node.noModule && jQuery._evalUrl(node.src, {
                        nonce: node.nonce || node.getAttribute("nonce")
                    }, doc) : DOMEval(node.textContent.replace(rcleanScript, ""), node, doc))
            }
            return collection
        }

        function remove(elem, selector, keepData) {
            for (var node, nodes = selector ? jQuery.filter(selector, elem) : elem, i = 0; null != (node = nodes[i]); i++) keepData || 1 !== node.nodeType || jQuery.cleanData(getAll(node)), node.parentNode && (keepData && isAttached(node) && setGlobalEval(getAll(node, "script")), node.parentNode.removeChild(node));
            return elem
        }
        jQuery.extend({
            htmlPrefilter: function(html) {
                return html
            },
            clone: function(elem, dataAndEvents, deepDataAndEvents) {
                var i, l, srcElements, destElements, clone = elem.cloneNode(!0),
                    inPage = isAttached(elem);
                if (!(support.noCloneChecked || 1 !== elem.nodeType && 11 !== elem.nodeType || jQuery.isXMLDoc(elem)))
                    for (destElements = getAll(clone), i = 0, l = (srcElements = getAll(elem)).length; i < l; i++) fixInput(srcElements[i], destElements[i]);
                if (dataAndEvents)
                    if (deepDataAndEvents)
                        for (srcElements = srcElements || getAll(elem), destElements = destElements || getAll(clone), i = 0, l = srcElements.length; i < l; i++) cloneCopyEvent(srcElements[i], destElements[i]);
                    else cloneCopyEvent(elem, clone);
                return (destElements = getAll(clone, "script")).length > 0 && setGlobalEval(destElements, !inPage && getAll(elem, "script")), clone
            },
            cleanData: function(elems) {
                for (var data, elem, type, special = jQuery.event.special, i = 0; void 0 !== (elem = elems[i]); i++)
                    if (acceptData(elem)) {
                        if (data = elem[dataPriv.expando]) {
                            if (data.events)
                                for (type in data.events) special[type] ? jQuery.event.remove(elem, type) : jQuery.removeEvent(elem, type, data.handle);
                            elem[dataPriv.expando] = void 0
                        }
                        elem[dataUser.expando] && (elem[dataUser.expando] = void 0)
                    }
            }
        }), jQuery.fn.extend({
            detach: function(selector) {
                return remove(this, selector, !0)
            },
            remove: function(selector) {
                return remove(this, selector)
            },
            text: function(value) {
                return access(this, function(value) {
                    return void 0 === value ? jQuery.text(this) : this.empty().each(function() {
                        1 !== this.nodeType && 11 !== this.nodeType && 9 !== this.nodeType || (this.textContent = value)
                    })
                }, null, value, arguments.length)
            },
            append: function() {
                return domManip(this, arguments, function(elem) {
                    1 !== this.nodeType && 11 !== this.nodeType && 9 !== this.nodeType || manipulationTarget(this, elem).appendChild(elem)
                })
            },
            prepend: function() {
                return domManip(this, arguments, function(elem) {
                    if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) {
                        var target = manipulationTarget(this, elem);
                        target.insertBefore(elem, target.firstChild)
                    }
                })
            },
            before: function() {
                return domManip(this, arguments, function(elem) {
                    this.parentNode && this.parentNode.insertBefore(elem, this)
                })
            },
            after: function() {
                return domManip(this, arguments, function(elem) {
                    this.parentNode && this.parentNode.insertBefore(elem, this.nextSibling)
                })
            },
            empty: function() {
                for (var elem, i = 0; null != (elem = this[i]); i++) 1 === elem.nodeType && (jQuery.cleanData(getAll(elem, !1)), elem.textContent = "");
                return this
            },
            clone: function(dataAndEvents, deepDataAndEvents) {
                return dataAndEvents = null != dataAndEvents && dataAndEvents, deepDataAndEvents = null == deepDataAndEvents ? dataAndEvents : deepDataAndEvents, this.map(function() {
                    return jQuery.clone(this, dataAndEvents, deepDataAndEvents)
                })
            },
            html: function(value) {
                return access(this, function(value) {
                    var elem = this[0] || {},
                        i = 0,
                        l = this.length;
                    if (void 0 === value && 1 === elem.nodeType) return elem.innerHTML;
                    if ("string" == typeof value && !rnoInnerhtml.test(value) && !wrapMap[(rtagName.exec(value) || ["", ""])[1].toLowerCase()]) {
                        value = jQuery.htmlPrefilter(value);
                        try {
                            for (; i < l; i++) 1 === (elem = this[i] || {}).nodeType && (jQuery.cleanData(getAll(elem, !1)), elem.innerHTML = value);
                            elem = 0
                        } catch (e) {}
                    }
                    elem && this.empty().append(value)
                }, null, value, arguments.length)
            },
            replaceWith: function() {
                var ignored = [];
                return domManip(this, arguments, function(elem) {
                    var parent = this.parentNode;
                    jQuery.inArray(this, ignored) < 0 && (jQuery.cleanData(getAll(this)), parent && parent.replaceChild(elem, this))
                }, ignored)
            }
        }), jQuery.each({
            appendTo: "append",
            prependTo: "prepend",
            insertBefore: "before",
            insertAfter: "after",
            replaceAll: "replaceWith"
        }, function(name, original) {
            jQuery.fn[name] = function(selector) {
                for (var elems, ret = [], insert = jQuery(selector), last = insert.length - 1, i = 0; i <= last; i++) elems = i === last ? this : this.clone(!0), jQuery(insert[i])[original](elems), push.apply(ret, elems.get());
                return this.pushStack(ret)
            }
        });
        var rnumnonpx = new RegExp("^(" + pnum + ")(?!px)[a-z%]+$", "i"),
            getStyles = function(elem) {
                var view = elem.ownerDocument.defaultView;
                return view && view.opener || (view = window), view.getComputedStyle(elem)
            },
            swap = function(elem, options, callback) {
                var ret, name, old = {};
                for (name in options) old[name] = elem.style[name], elem.style[name] = options[name];
                for (name in ret = callback.call(elem), options) elem.style[name] = old[name];
                return ret
            },
            rboxStyle = new RegExp(cssExpand.join("|"), "i");

        function curCSS(elem, name, computed) {
            var width, minWidth, maxWidth, ret, style = elem.style;
            return (computed = computed || getStyles(elem)) && ("" !== (ret = computed.getPropertyValue(name) || computed[name]) || isAttached(elem) || (ret = jQuery.style(elem, name)), !support.pixelBoxStyles() && rnumnonpx.test(ret) && rboxStyle.test(name) && (width = style.width, minWidth = style.minWidth, maxWidth = style.maxWidth, style.minWidth = style.maxWidth = style.width = ret, ret = computed.width, style.width = width, style.minWidth = minWidth, style.maxWidth = maxWidth)), void 0 !== ret ? ret + "" : ret
        }

        function addGetHookIf(conditionFn, hookFn) {
            return {
                get: function() {
                    if (!conditionFn()) return (this.get = hookFn).apply(this, arguments);
                    delete this.get
                }
            }
        }! function() {
            function computeStyleTests() {
                if (div) {
                    container.style.cssText = "position:absolute;left:-11111px;width:60px;margin-top:1px;padding:0;border:0", div.style.cssText = "position:relative;display:block;box-sizing:border-box;overflow:scroll;margin:auto;border:1px;padding:1px;width:60%;top:1%", documentElement.appendChild(container).appendChild(div);
                    var divStyle = window.getComputedStyle(div);
                    pixelPositionVal = "1%" !== divStyle.top, reliableMarginLeftVal = 12 === roundPixelMeasures(divStyle.marginLeft), div.style.right = "60%", pixelBoxStylesVal = 36 === roundPixelMeasures(divStyle.right), boxSizingReliableVal = 36 === roundPixelMeasures(divStyle.width), div.style.position = "absolute", scrollboxSizeVal = 12 === roundPixelMeasures(div.offsetWidth / 3), documentElement.removeChild(container), div = null
                }
            }

            function roundPixelMeasures(measure) {
                return Math.round(parseFloat(measure))
            }
            var pixelPositionVal, boxSizingReliableVal, scrollboxSizeVal, pixelBoxStylesVal, reliableTrDimensionsVal, reliableMarginLeftVal, container = document.createElement("div"),
                div = document.createElement("div");
            div.style && (div.style.backgroundClip = "content-box", div.cloneNode(!0).style.backgroundClip = "", support.clearCloneStyle = "content-box" === div.style.backgroundClip, jQuery.extend(support, {
                boxSizingReliable: function() {
                    return computeStyleTests(), boxSizingReliableVal
                },
                pixelBoxStyles: function() {
                    return computeStyleTests(), pixelBoxStylesVal
                },
                pixelPosition: function() {
                    return computeStyleTests(), pixelPositionVal
                },
                reliableMarginLeft: function() {
                    return computeStyleTests(), reliableMarginLeftVal
                },
                scrollboxSize: function() {
                    return computeStyleTests(), scrollboxSizeVal
                },
                reliableTrDimensions: function() {
                    var table, tr, trChild, trStyle;
                    return null == reliableTrDimensionsVal && (table = document.createElement("table"), tr = document.createElement("tr"), trChild = document.createElement("div"), table.style.cssText = "position:absolute;left:-11111px", tr.style.height = "1px", trChild.style.height = "9px", documentElement.appendChild(table).appendChild(tr).appendChild(trChild), trStyle = window.getComputedStyle(tr), reliableTrDimensionsVal = parseInt(trStyle.height) > 3, documentElement.removeChild(table)), reliableTrDimensionsVal
                }
            }))
        }();
        var cssPrefixes = ["Webkit", "Moz", "ms"],
            emptyStyle = document.createElement("div").style,
            vendorProps = {};

        function finalPropName(name) {
            var final = jQuery.cssProps[name] || vendorProps[name];
            return final || (name in emptyStyle ? name : vendorProps[name] = function vendorPropName(name) {
                for (var capName = name[0].toUpperCase() + name.slice(1), i = cssPrefixes.length; i--;)
                    if ((name = cssPrefixes[i] + capName) in emptyStyle) return name
            }(name) || name)
        }
        var rdisplayswap = /^(none|table(?!-c[ea]).+)/,
            rcustomProp = /^--/,
            cssShow = {
                position: "absolute",
                visibility: "hidden",
                display: "block"
            },
            cssNormalTransform = {
                letterSpacing: "0",
                fontWeight: "400"
            };

        function setPositiveNumber(_elem, value, subtract) {
            var matches = rcssNum.exec(value);
            return matches ? Math.max(0, matches[2] - (subtract || 0)) + (matches[3] || "px") : value
        }

        function boxModelAdjustment(elem, dimension, box, isBorderBox, styles, computedVal) {
            var i = "width" === dimension ? 1 : 0,
                extra = 0,
                delta = 0;
            if (box === (isBorderBox ? "border" : "content")) return 0;
            for (; i < 4; i += 2) "margin" === box && (delta += jQuery.css(elem, box + cssExpand[i], !0, styles)), isBorderBox ? ("content" === box && (delta -= jQuery.css(elem, "padding" + cssExpand[i], !0, styles)), "margin" !== box && (delta -= jQuery.css(elem, "border" + cssExpand[i] + "Width", !0, styles))) : (delta += jQuery.css(elem, "padding" + cssExpand[i], !0, styles), "padding" !== box ? delta += jQuery.css(elem, "border" + cssExpand[i] + "Width", !0, styles) : extra += jQuery.css(elem, "border" + cssExpand[i] + "Width", !0, styles));
            return !isBorderBox && computedVal >= 0 && (delta += Math.max(0, Math.ceil(elem["offset" + dimension[0].toUpperCase() + dimension.slice(1)] - computedVal - delta - extra - .5)) || 0), delta
        }

        function getWidthOrHeight(elem, dimension, extra) {
            var styles = getStyles(elem),
                isBorderBox = (!support.boxSizingReliable() || extra) && "border-box" === jQuery.css(elem, "boxSizing", !1, styles),
                valueIsBorderBox = isBorderBox,
                val = curCSS(elem, dimension, styles),
                offsetProp = "offset" + dimension[0].toUpperCase() + dimension.slice(1);
            if (rnumnonpx.test(val)) {
                if (!extra) return val;
                val = "auto"
            }
            return (!support.boxSizingReliable() && isBorderBox || !support.reliableTrDimensions() && nodeName(elem, "tr") || "auto" === val || !parseFloat(val) && "inline" === jQuery.css(elem, "display", !1, styles)) && elem.getClientRects().length && (isBorderBox = "border-box" === jQuery.css(elem, "boxSizing", !1, styles), (valueIsBorderBox = offsetProp in elem) && (val = elem[offsetProp])), (val = parseFloat(val) || 0) + boxModelAdjustment(elem, dimension, extra || (isBorderBox ? "border" : "content"), valueIsBorderBox, styles, val) + "px"
        }

        function Tween(elem, options, prop, end, easing) {
            return new Tween.prototype.init(elem, options, prop, end, easing)
        }
        jQuery.extend({
            cssHooks: {
                opacity: {
                    get: function(elem, computed) {
                        if (computed) {
                            var ret = curCSS(elem, "opacity");
                            return "" === ret ? "1" : ret
                        }
                    }
                }
            },
            cssNumber: {
                animationIterationCount: !0,
                columnCount: !0,
                fillOpacity: !0,
                flexGrow: !0,
                flexShrink: !0,
                fontWeight: !0,
                gridArea: !0,
                gridColumn: !0,
                gridColumnEnd: !0,
                gridColumnStart: !0,
                gridRow: !0,
                gridRowEnd: !0,
                gridRowStart: !0,
                lineHeight: !0,
                opacity: !0,
                order: !0,
                orphans: !0,
                widows: !0,
                zIndex: !0,
                zoom: !0
            },
            cssProps: {},
            style: function(elem, name, value, extra) {
                if (elem && 3 !== elem.nodeType && 8 !== elem.nodeType && elem.style) {
                    var ret, type, hooks, origName = camelCase(name),
                        isCustomProp = rcustomProp.test(name),
                        style = elem.style;
                    if (isCustomProp || (name = finalPropName(origName)), hooks = jQuery.cssHooks[name] || jQuery.cssHooks[origName], void 0 === value) return hooks && "get" in hooks && void 0 !== (ret = hooks.get(elem, !1, extra)) ? ret : style[name];
                    "string" === (type = typeof value) && (ret = rcssNum.exec(value)) && ret[1] && (value = adjustCSS(elem, name, ret), type = "number"), null != value && value == value && ("number" !== type || isCustomProp || (value += ret && ret[3] || (jQuery.cssNumber[origName] ? "" : "px")), support.clearCloneStyle || "" !== value || 0 !== name.indexOf("background") || (style[name] = "inherit"), hooks && "set" in hooks && void 0 === (value = hooks.set(elem, value, extra)) || (isCustomProp ? style.setProperty(name, value) : style[name] = value))
                }
            },
            css: function(elem, name, extra, styles) {
                var val, num, hooks, origName = camelCase(name);
                return rcustomProp.test(name) || (name = finalPropName(origName)), (hooks = jQuery.cssHooks[name] || jQuery.cssHooks[origName]) && "get" in hooks && (val = hooks.get(elem, !0, extra)), void 0 === val && (val = curCSS(elem, name, styles)), "normal" === val && name in cssNormalTransform && (val = cssNormalTransform[name]), "" === extra || extra ? (num = parseFloat(val), !0 === extra || isFinite(num) ? num || 0 : val) : val
            }
        }), jQuery.each(["height", "width"], function(_i, dimension) {
            jQuery.cssHooks[dimension] = {
                get: function(elem, computed, extra) {
                    if (computed) return !rdisplayswap.test(jQuery.css(elem, "display")) || elem.getClientRects().length && elem.getBoundingClientRect().width ? getWidthOrHeight(elem, dimension, extra) : swap(elem, cssShow, function() {
                        return getWidthOrHeight(elem, dimension, extra)
                    })
                },
                set: function(elem, value, extra) {
                    var matches, styles = getStyles(elem),
                        scrollboxSizeBuggy = !support.scrollboxSize() && "absolute" === styles.position,
                        isBorderBox = (scrollboxSizeBuggy || extra) && "border-box" === jQuery.css(elem, "boxSizing", !1, styles),
                        subtract = extra ? boxModelAdjustment(elem, dimension, extra, isBorderBox, styles) : 0;
                    return isBorderBox && scrollboxSizeBuggy && (subtract -= Math.ceil(elem["offset" + dimension[0].toUpperCase() + dimension.slice(1)] - parseFloat(styles[dimension]) - boxModelAdjustment(elem, dimension, "border", !1, styles) - .5)), subtract && (matches = rcssNum.exec(value)) && "px" !== (matches[3] || "px") && (elem.style[dimension] = value, value = jQuery.css(elem, dimension)), setPositiveNumber(0, value, subtract)
                }
            }
        }), jQuery.cssHooks.marginLeft = addGetHookIf(support.reliableMarginLeft, function(elem, computed) {
            if (computed) return (parseFloat(curCSS(elem, "marginLeft")) || elem.getBoundingClientRect().left - swap(elem, {
                marginLeft: 0
            }, function() {
                return elem.getBoundingClientRect().left
            })) + "px"
        }), jQuery.each({
            margin: "",
            padding: "",
            border: "Width"
        }, function(prefix, suffix) {
            jQuery.cssHooks[prefix + suffix] = {
                expand: function(value) {
                    for (var i = 0, expanded = {}, parts = "string" == typeof value ? value.split(" ") : [value]; i < 4; i++) expanded[prefix + cssExpand[i] + suffix] = parts[i] || parts[i - 2] || parts[0];
                    return expanded
                }
            }, "margin" !== prefix && (jQuery.cssHooks[prefix + suffix].set = setPositiveNumber)
        }), jQuery.fn.extend({
            css: function(name, value) {
                return access(this, function(elem, name, value) {
                    var styles, len, map = {},
                        i = 0;
                    if (Array.isArray(name)) {
                        for (styles = getStyles(elem), len = name.length; i < len; i++) map[name[i]] = jQuery.css(elem, name[i], !1, styles);
                        return map
                    }
                    return void 0 !== value ? jQuery.style(elem, name, value) : jQuery.css(elem, name)
                }, name, value, arguments.length > 1)
            }
        }), jQuery.Tween = Tween, Tween.prototype = {
            constructor: Tween,
            init: function(elem, options, prop, end, easing, unit) {
                this.elem = elem, this.prop = prop, this.easing = easing || jQuery.easing._default, this.options = options, this.start = this.now = this.cur(), this.end = end, this.unit = unit || (jQuery.cssNumber[prop] ? "" : "px")
            },
            cur: function() {
                var hooks = Tween.propHooks[this.prop];
                return hooks && hooks.get ? hooks.get(this) : Tween.propHooks._default.get(this)
            },
            run: function(percent) {
                var eased, hooks = Tween.propHooks[this.prop];
                return this.options.duration ? this.pos = eased = jQuery.easing[this.easing](percent, this.options.duration * percent, 0, 1, this.options.duration) : this.pos = eased = percent, this.now = (this.end - this.start) * eased + this.start, this.options.step && this.options.step.call(this.elem, this.now, this), hooks && hooks.set ? hooks.set(this) : Tween.propHooks._default.set(this), this
            }
        }, Tween.prototype.init.prototype = Tween.prototype, Tween.propHooks = {
            _default: {
                get: function(tween) {
                    var result;
                    return 1 !== tween.elem.nodeType || null != tween.elem[tween.prop] && null == tween.elem.style[tween.prop] ? tween.elem[tween.prop] : (result = jQuery.css(tween.elem, tween.prop, "")) && "auto" !== result ? result : 0
                },
                set: function(tween) {
                    jQuery.fx.step[tween.prop] ? jQuery.fx.step[tween.prop](tween) : 1 !== tween.elem.nodeType || !jQuery.cssHooks[tween.prop] && null == tween.elem.style[finalPropName(tween.prop)] ? tween.elem[tween.prop] = tween.now : jQuery.style(tween.elem, tween.prop, tween.now + tween.unit)
                }
            }
        }, Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
            set: function(tween) {
                tween.elem.nodeType && tween.elem.parentNode && (tween.elem[tween.prop] = tween.now)
            }
        }, jQuery.easing = {
            linear: function(p) {
                return p
            },
            swing: function(p) {
                return .5 - Math.cos(p * Math.PI) / 2
            },
            _default: "swing"
        }, jQuery.fx = Tween.prototype.init, jQuery.fx.step = {};
        var fxNow, inProgress, rfxtypes = /^(?:toggle|show|hide)$/,
            rrun = /queueHooks$/;

        function schedule() {
            inProgress && (!1 === document.hidden && window.requestAnimationFrame ? window.requestAnimationFrame(schedule) : window.setTimeout(schedule, jQuery.fx.interval), jQuery.fx.tick())
        }

        function createFxNow() {
            return window.setTimeout(function() {
                fxNow = void 0
            }), fxNow = Date.now()
        }

        function genFx(type, includeWidth) {
            var which, i = 0,
                attrs = {
                    height: type
                };
            for (includeWidth = includeWidth ? 1 : 0; i < 4; i += 2 - includeWidth) attrs["margin" + (which = cssExpand[i])] = attrs["padding" + which] = type;
            return includeWidth && (attrs.opacity = attrs.width = type), attrs
        }

        function createTween(value, prop, animation) {
            for (var tween, collection = (Animation.tweeners[prop] || []).concat(Animation.tweeners["*"]), index = 0, length = collection.length; index < length; index++)
                if (tween = collection[index].call(animation, prop, value)) return tween
        }

        function Animation(elem, properties, options) {
            var result, stopped, index = 0,
                length = Animation.prefilters.length,
                deferred = jQuery.Deferred().always(function() {
                    delete tick.elem
                }),
                tick = function() {
                    if (stopped) return !1;
                    for (var currentTime = fxNow || createFxNow(), remaining = Math.max(0, animation.startTime + animation.duration - currentTime), percent = 1 - (remaining / animation.duration || 0), index = 0, length = animation.tweens.length; index < length; index++) animation.tweens[index].run(percent);
                    return deferred.notifyWith(elem, [animation, percent, remaining]), percent < 1 && length ? remaining : (length || deferred.notifyWith(elem, [animation, 1, 0]), deferred.resolveWith(elem, [animation]), !1)
                },
                animation = deferred.promise({
                    elem: elem,
                    props: jQuery.extend({}, properties),
                    opts: jQuery.extend(!0, {
                        specialEasing: {},
                        easing: jQuery.easing._default
                    }, options),
                    originalProperties: properties,
                    originalOptions: options,
                    startTime: fxNow || createFxNow(),
                    duration: options.duration,
                    tweens: [],
                    createTween: function(prop, end) {
                        var tween = jQuery.Tween(elem, animation.opts, prop, end, animation.opts.specialEasing[prop] || animation.opts.easing);
                        return animation.tweens.push(tween), tween
                    },
                    stop: function(gotoEnd) {
                        var index = 0,
                            length = gotoEnd ? animation.tweens.length : 0;
                        if (stopped) return this;
                        for (stopped = !0; index < length; index++) animation.tweens[index].run(1);
                        return gotoEnd ? (deferred.notifyWith(elem, [animation, 1, 0]), deferred.resolveWith(elem, [animation, gotoEnd])) : deferred.rejectWith(elem, [animation, gotoEnd]), this
                    }
                }),
                props = animation.props;
            for (! function propFilter(props, specialEasing) {
                    var index, name, easing, value, hooks;
                    for (index in props)
                        if (easing = specialEasing[name = camelCase(index)], value = props[index], Array.isArray(value) && (easing = value[1], value = props[index] = value[0]), index !== name && (props[name] = value, delete props[index]), (hooks = jQuery.cssHooks[name]) && "expand" in hooks)
                            for (index in value = hooks.expand(value), delete props[name], value) index in props || (props[index] = value[index], specialEasing[index] = easing);
                        else specialEasing[name] = easing
                }(props, animation.opts.specialEasing); index < length; index++)
                if (result = Animation.prefilters[index].call(animation, elem, props, animation.opts)) return isFunction(result.stop) && (jQuery._queueHooks(animation.elem, animation.opts.queue).stop = result.stop.bind(result)), result;
            return jQuery.map(props, createTween, animation), isFunction(animation.opts.start) && animation.opts.start.call(elem, animation), animation.progress(animation.opts.progress).done(animation.opts.done, animation.opts.complete).fail(animation.opts.fail).always(animation.opts.always), jQuery.fx.timer(jQuery.extend(tick, {
                elem: elem,
                anim: animation,
                queue: animation.opts.queue
            })), animation
        }
        jQuery.Animation = jQuery.extend(Animation, {
                tweeners: {
                    "*": [function(prop, value) {
                        var tween = this.createTween(prop, value);
                        return adjustCSS(tween.elem, prop, rcssNum.exec(value), tween), tween
                    }]
                },
                tweener: function(props, callback) {
                    isFunction(props) ? (callback = props, props = ["*"]) : props = props.match(rnothtmlwhite);
                    for (var prop, index = 0, length = props.length; index < length; index++) prop = props[index], Animation.tweeners[prop] = Animation.tweeners[prop] || [], Animation.tweeners[prop].unshift(callback)
                },
                prefilters: [function defaultPrefilter(elem, props, opts) {
                    var prop, value, toggle, hooks, oldfire, propTween, restoreDisplay, display, isBox = "width" in props || "height" in props,
                        anim = this,
                        orig = {},
                        style = elem.style,
                        hidden = elem.nodeType && isHiddenWithinTree(elem),
                        dataShow = dataPriv.get(elem, "fxshow");
                    for (prop in opts.queue || (null == (hooks = jQuery._queueHooks(elem, "fx")).unqueued && (hooks.unqueued = 0, oldfire = hooks.empty.fire, hooks.empty.fire = function() {
                            hooks.unqueued || oldfire()
                        }), hooks.unqueued++, anim.always(function() {
                            anim.always(function() {
                                hooks.unqueued--, jQuery.queue(elem, "fx").length || hooks.empty.fire()
                            })
                        })), props)
                        if (value = props[prop], rfxtypes.test(value)) {
                            if (delete props[prop], toggle = toggle || "toggle" === value, value === (hidden ? "hide" : "show")) {
                                if ("show" !== value || !dataShow || void 0 === dataShow[prop]) continue;
                                hidden = !0
                            }
                            orig[prop] = dataShow && dataShow[prop] || jQuery.style(elem, prop)
                        } if ((propTween = !jQuery.isEmptyObject(props)) || !jQuery.isEmptyObject(orig))
                        for (prop in isBox && 1 === elem.nodeType && (opts.overflow = [style.overflow, style.overflowX, style.overflowY], null == (restoreDisplay = dataShow && dataShow.display) && (restoreDisplay = dataPriv.get(elem, "display")), "none" === (display = jQuery.css(elem, "display")) && (restoreDisplay ? display = restoreDisplay : (showHide([elem], !0), restoreDisplay = elem.style.display || restoreDisplay, display = jQuery.css(elem, "display"), showHide([elem]))), ("inline" === display || "inline-block" === display && null != restoreDisplay) && "none" === jQuery.css(elem, "float") && (propTween || (anim.done(function() {
                                style.display = restoreDisplay
                            }), null == restoreDisplay && (display = style.display, restoreDisplay = "none" === display ? "" : display)), style.display = "inline-block")), opts.overflow && (style.overflow = "hidden", anim.always(function() {
                                style.overflow = opts.overflow[0], style.overflowX = opts.overflow[1], style.overflowY = opts.overflow[2]
                            })), propTween = !1, orig) propTween || (dataShow ? "hidden" in dataShow && (hidden = dataShow.hidden) : dataShow = dataPriv.access(elem, "fxshow", {
                            display: restoreDisplay
                        }), toggle && (dataShow.hidden = !hidden), hidden && showHide([elem], !0), anim.done(function() {
                            for (prop in hidden || showHide([elem]), dataPriv.remove(elem, "fxshow"), orig) jQuery.style(elem, prop, orig[prop])
                        })), propTween = createTween(hidden ? dataShow[prop] : 0, prop, anim), prop in dataShow || (dataShow[prop] = propTween.start, hidden && (propTween.end = propTween.start, propTween.start = 0))
                }],
                prefilter: function(callback, prepend) {
                    prepend ? Animation.prefilters.unshift(callback) : Animation.prefilters.push(callback)
                }
            }), jQuery.speed = function(speed, easing, fn) {
                var opt = speed && "object" == typeof speed ? jQuery.extend({}, speed) : {
                    complete: fn || !fn && easing || isFunction(speed) && speed,
                    duration: speed,
                    easing: fn && easing || easing && !isFunction(easing) && easing
                };
                return jQuery.fx.off ? opt.duration = 0 : "number" != typeof opt.duration && (opt.duration in jQuery.fx.speeds ? opt.duration = jQuery.fx.speeds[opt.duration] : opt.duration = jQuery.fx.speeds._default), null != opt.queue && !0 !== opt.queue || (opt.queue = "fx"), opt.old = opt.complete, opt.complete = function() {
                    isFunction(opt.old) && opt.old.call(this), opt.queue && jQuery.dequeue(this, opt.queue)
                }, opt
            }, jQuery.fn.extend({
                fadeTo: function(speed, to, easing, callback) {
                    return this.filter(isHiddenWithinTree).css("opacity", 0).show().end().animate({
                        opacity: to
                    }, speed, easing, callback)
                },
                animate: function(prop, speed, easing, callback) {
                    var empty = jQuery.isEmptyObject(prop),
                        optall = jQuery.speed(speed, easing, callback),
                        doAnimation = function() {
                            var anim = Animation(this, jQuery.extend({}, prop), optall);
                            (empty || dataPriv.get(this, "finish")) && anim.stop(!0)
                        };
                    return doAnimation.finish = doAnimation, empty || !1 === optall.queue ? this.each(doAnimation) : this.queue(optall.queue, doAnimation)
                },
                stop: function(type, clearQueue, gotoEnd) {
                    var stopQueue = function(hooks) {
                        var stop = hooks.stop;
                        delete hooks.stop, stop(gotoEnd)
                    };
                    return "string" != typeof type && (gotoEnd = clearQueue, clearQueue = type, type = void 0), clearQueue && this.queue(type || "fx", []), this.each(function() {
                        var dequeue = !0,
                            index = null != type && type + "queueHooks",
                            timers = jQuery.timers,
                            data = dataPriv.get(this);
                        if (index) data[index] && data[index].stop && stopQueue(data[index]);
                        else
                            for (index in data) data[index] && data[index].stop && rrun.test(index) && stopQueue(data[index]);
                        for (index = timers.length; index--;) timers[index].elem !== this || null != type && timers[index].queue !== type || (timers[index].anim.stop(gotoEnd), dequeue = !1, timers.splice(index, 1));
                        !dequeue && gotoEnd || jQuery.dequeue(this, type)
                    })
                },
                finish: function(type) {
                    return !1 !== type && (type = type || "fx"), this.each(function() {
                        var index, data = dataPriv.get(this),
                            queue = data[type + "queue"],
                            hooks = data[type + "queueHooks"],
                            timers = jQuery.timers,
                            length = queue ? queue.length : 0;
                        for (data.finish = !0, jQuery.queue(this, type, []), hooks && hooks.stop && hooks.stop.call(this, !0), index = timers.length; index--;) timers[index].elem === this && timers[index].queue === type && (timers[index].anim.stop(!0), timers.splice(index, 1));
                        for (index = 0; index < length; index++) queue[index] && queue[index].finish && queue[index].finish.call(this);
                        delete data.finish
                    })
                }
            }), jQuery.each(["toggle", "show", "hide"], function(_i, name) {
                var cssFn = jQuery.fn[name];
                jQuery.fn[name] = function(speed, easing, callback) {
                    return null == speed || "boolean" == typeof speed ? cssFn.apply(this, arguments) : this.animate(genFx(name, !0), speed, easing, callback)
                }
            }), jQuery.each({
                slideDown: genFx("show"),
                slideUp: genFx("hide"),
                slideToggle: genFx("toggle"),
                fadeIn: {
                    opacity: "show"
                },
                fadeOut: {
                    opacity: "hide"
                },
                fadeToggle: {
                    opacity: "toggle"
                }
            }, function(name, props) {
                jQuery.fn[name] = function(speed, easing, callback) {
                    return this.animate(props, speed, easing, callback)
                }
            }), jQuery.timers = [], jQuery.fx.tick = function() {
                var timer, i = 0,
                    timers = jQuery.timers;
                for (fxNow = Date.now(); i < timers.length; i++)(timer = timers[i])() || timers[i] !== timer || timers.splice(i--, 1);
                timers.length || jQuery.fx.stop(), fxNow = void 0
            }, jQuery.fx.timer = function(timer) {
                jQuery.timers.push(timer), jQuery.fx.start()
            }, jQuery.fx.interval = 13, jQuery.fx.start = function() {
                inProgress || (inProgress = !0, schedule())
            }, jQuery.fx.stop = function() {
                inProgress = null
            }, jQuery.fx.speeds = {
                slow: 600,
                fast: 200,
                _default: 400
            }, jQuery.fn.delay = function(time, type) {
                return time = jQuery.fx && jQuery.fx.speeds[time] || time, type = type || "fx", this.queue(type, function(next, hooks) {
                    var timeout = window.setTimeout(next, time);
                    hooks.stop = function() {
                        window.clearTimeout(timeout)
                    }
                })
            },
            function() {
                var input = document.createElement("input"),
                    opt = document.createElement("select").appendChild(document.createElement("option"));
                input.type = "checkbox", support.checkOn = "" !== input.value, support.optSelected = opt.selected, (input = document.createElement("input")).value = "t", input.type = "radio", support.radioValue = "t" === input.value
            }();
        var boolHook, attrHandle = jQuery.expr.attrHandle;
        jQuery.fn.extend({
            attr: function(name, value) {
                return access(this, jQuery.attr, name, value, arguments.length > 1)
            },
            removeAttr: function(name) {
                return this.each(function() {
                    jQuery.removeAttr(this, name)
                })
            }
        }), jQuery.extend({
            attr: function(elem, name, value) {
                var ret, hooks, nType = elem.nodeType;
                if (3 !== nType && 8 !== nType && 2 !== nType) return void 0 === elem.getAttribute ? jQuery.prop(elem, name, value) : (1 === nType && jQuery.isXMLDoc(elem) || (hooks = jQuery.attrHooks[name.toLowerCase()] || (jQuery.expr.match.bool.test(name) ? boolHook : void 0)), void 0 !== value ? null === value ? void jQuery.removeAttr(elem, name) : hooks && "set" in hooks && void 0 !== (ret = hooks.set(elem, value, name)) ? ret : (elem.setAttribute(name, value + ""), value) : hooks && "get" in hooks && null !== (ret = hooks.get(elem, name)) ? ret : null == (ret = jQuery.find.attr(elem, name)) ? void 0 : ret)
            },
            attrHooks: {
                type: {
                    set: function(elem, value) {
                        if (!support.radioValue && "radio" === value && nodeName(elem, "input")) {
                            var val = elem.value;
                            return elem.setAttribute("type", value), val && (elem.value = val), value
                        }
                    }
                }
            },
            removeAttr: function(elem, value) {
                var name, i = 0,
                    attrNames = value && value.match(rnothtmlwhite);
                if (attrNames && 1 === elem.nodeType)
                    for (; name = attrNames[i++];) elem.removeAttribute(name)
            }
        }), boolHook = {
            set: function(elem, value, name) {
                return !1 === value ? jQuery.removeAttr(elem, name) : elem.setAttribute(name, name), name
            }
        }, jQuery.each(jQuery.expr.match.bool.source.match(/\w+/g), function(_i, name) {
            var getter = attrHandle[name] || jQuery.find.attr;
            attrHandle[name] = function(elem, name, isXML) {
                var ret, handle, lowercaseName = name.toLowerCase();
                return isXML || (handle = attrHandle[lowercaseName], attrHandle[lowercaseName] = ret, ret = null != getter(elem, name, isXML) ? lowercaseName : null, attrHandle[lowercaseName] = handle), ret
            }
        });
        var rfocusable = /^(?:input|select|textarea|button)$/i,
            rclickable = /^(?:a|area)$/i;

        function stripAndCollapse(value) {
            return (value.match(rnothtmlwhite) || []).join(" ")
        }

        function getClass(elem) {
            return elem.getAttribute && elem.getAttribute("class") || ""
        }

        function classesToArray(value) {
            return Array.isArray(value) ? value : "string" == typeof value && value.match(rnothtmlwhite) || []
        }
        jQuery.fn.extend({
            prop: function(name, value) {
                return access(this, jQuery.prop, name, value, arguments.length > 1)
            },
            removeProp: function(name) {
                return this.each(function() {
                    delete this[jQuery.propFix[name] || name]
                })
            }
        }), jQuery.extend({
            prop: function(elem, name, value) {
                var ret, hooks, nType = elem.nodeType;
                if (3 !== nType && 8 !== nType && 2 !== nType) return 1 === nType && jQuery.isXMLDoc(elem) || (name = jQuery.propFix[name] || name, hooks = jQuery.propHooks[name]), void 0 !== value ? hooks && "set" in hooks && void 0 !== (ret = hooks.set(elem, value, name)) ? ret : elem[name] = value : hooks && "get" in hooks && null !== (ret = hooks.get(elem, name)) ? ret : elem[name]
            },
            propHooks: {
                tabIndex: {
                    get: function(elem) {
                        var tabindex = jQuery.find.attr(elem, "tabindex");
                        return tabindex ? parseInt(tabindex, 10) : rfocusable.test(elem.nodeName) || rclickable.test(elem.nodeName) && elem.href ? 0 : -1
                    }
                }
            },
            propFix: {
                for: "htmlFor",
                class: "className"
            }
        }), support.optSelected || (jQuery.propHooks.selected = {
            get: function(elem) {
                var parent = elem.parentNode;
                return parent && parent.parentNode && parent.parentNode.selectedIndex, null
            },
            set: function(elem) {
                var parent = elem.parentNode;
                parent && (parent.selectedIndex, parent.parentNode && parent.parentNode.selectedIndex)
            }
        }), jQuery.each(["tabIndex", "readOnly", "maxLength", "cellSpacing", "cellPadding", "rowSpan", "colSpan", "useMap", "frameBorder", "contentEditable"], function() {
            jQuery.propFix[this.toLowerCase()] = this
        }), jQuery.fn.extend({
            addClass: function(value) {
                var classes, elem, cur, curValue, clazz, j, finalValue, i = 0;
                if (isFunction(value)) return this.each(function(j) {
                    jQuery(this).addClass(value.call(this, j, getClass(this)))
                });
                if ((classes = classesToArray(value)).length)
                    for (; elem = this[i++];)
                        if (curValue = getClass(elem), cur = 1 === elem.nodeType && " " + stripAndCollapse(curValue) + " ") {
                            for (j = 0; clazz = classes[j++];) cur.indexOf(" " + clazz + " ") < 0 && (cur += clazz + " ");
                            curValue !== (finalValue = stripAndCollapse(cur)) && elem.setAttribute("class", finalValue)
                        } return this
            },
            removeClass: function(value) {
                var classes, elem, cur, curValue, clazz, j, finalValue, i = 0;
                if (isFunction(value)) return this.each(function(j) {
                    jQuery(this).removeClass(value.call(this, j, getClass(this)))
                });
                if (!arguments.length) return this.attr("class", "");
                if ((classes = classesToArray(value)).length)
                    for (; elem = this[i++];)
                        if (curValue = getClass(elem), cur = 1 === elem.nodeType && " " + stripAndCollapse(curValue) + " ") {
                            for (j = 0; clazz = classes[j++];)
                                for (; cur.indexOf(" " + clazz + " ") > -1;) cur = cur.replace(" " + clazz + " ", " ");
                            curValue !== (finalValue = stripAndCollapse(cur)) && elem.setAttribute("class", finalValue)
                        } return this
            },
            toggleClass: function(value, stateVal) {
                var type = typeof value,
                    isValidValue = "string" === type || Array.isArray(value);
                return "boolean" == typeof stateVal && isValidValue ? stateVal ? this.addClass(value) : this.removeClass(value) : isFunction(value) ? this.each(function(i) {
                    jQuery(this).toggleClass(value.call(this, i, getClass(this), stateVal), stateVal)
                }) : this.each(function() {
                    var className, i, self, classNames;
                    if (isValidValue)
                        for (i = 0, self = jQuery(this), classNames = classesToArray(value); className = classNames[i++];) self.hasClass(className) ? self.removeClass(className) : self.addClass(className);
                    else void 0 !== value && "boolean" !== type || ((className = getClass(this)) && dataPriv.set(this, "__className__", className), this.setAttribute && this.setAttribute("class", className || !1 === value ? "" : dataPriv.get(this, "__className__") || ""))
                })
            },
            hasClass: function(selector) {
                var className, elem, i = 0;
                for (className = " " + selector + " "; elem = this[i++];)
                    if (1 === elem.nodeType && (" " + stripAndCollapse(getClass(elem)) + " ").indexOf(className) > -1) return !0;
                return !1
            }
        });
        var rreturn = /\r/g;
        jQuery.fn.extend({
            val: function(value) {
                var hooks, ret, valueIsFunction, elem = this[0];
                return arguments.length ? (valueIsFunction = isFunction(value), this.each(function(i) {
                    var val;
                    1 === this.nodeType && (null == (val = valueIsFunction ? value.call(this, i, jQuery(this).val()) : value) ? val = "" : "number" == typeof val ? val += "" : Array.isArray(val) && (val = jQuery.map(val, function(value) {
                        return null == value ? "" : value + ""
                    })), (hooks = jQuery.valHooks[this.type] || jQuery.valHooks[this.nodeName.toLowerCase()]) && "set" in hooks && void 0 !== hooks.set(this, val, "value") || (this.value = val))
                })) : elem ? (hooks = jQuery.valHooks[elem.type] || jQuery.valHooks[elem.nodeName.toLowerCase()]) && "get" in hooks && void 0 !== (ret = hooks.get(elem, "value")) ? ret : "string" == typeof(ret = elem.value) ? ret.replace(rreturn, "") : null == ret ? "" : ret : void 0
            }
        }), jQuery.extend({
            valHooks: {
                option: {
                    get: function(elem) {
                        var val = jQuery.find.attr(elem, "value");
                        return null != val ? val : stripAndCollapse(jQuery.text(elem))
                    }
                },
                select: {
                    get: function(elem) {
                        var value, option, i, options = elem.options,
                            index = elem.selectedIndex,
                            one = "select-one" === elem.type,
                            values = one ? null : [],
                            max = one ? index + 1 : options.length;
                        for (i = index < 0 ? max : one ? index : 0; i < max; i++)
                            if (((option = options[i]).selected || i === index) && !option.disabled && (!option.parentNode.disabled || !nodeName(option.parentNode, "optgroup"))) {
                                if (value = jQuery(option).val(), one) return value;
                                values.push(value)
                            } return values
                    },
                    set: function(elem, value) {
                        for (var optionSet, option, options = elem.options, values = jQuery.makeArray(value), i = options.length; i--;)((option = options[i]).selected = jQuery.inArray(jQuery.valHooks.option.get(option), values) > -1) && (optionSet = !0);
                        return optionSet || (elem.selectedIndex = -1), values
                    }
                }
            }
        }), jQuery.each(["radio", "checkbox"], function() {
            jQuery.valHooks[this] = {
                set: function(elem, value) {
                    if (Array.isArray(value)) return elem.checked = jQuery.inArray(jQuery(elem).val(), value) > -1
                }
            }, support.checkOn || (jQuery.valHooks[this].get = function(elem) {
                return null === elem.getAttribute("value") ? "on" : elem.value
            })
        }), support.focusin = "onfocusin" in window;
        var rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
            stopPropagationCallback = function(e) {
                e.stopPropagation()
            };
        jQuery.extend(jQuery.event, {
            trigger: function(event, data, elem, onlyHandlers) {
                var i, cur, tmp, bubbleType, ontype, handle, special, lastElement, eventPath = [elem || document],
                    type = hasOwn.call(event, "type") ? event.type : event,
                    namespaces = hasOwn.call(event, "namespace") ? event.namespace.split(".") : [];
                if (cur = lastElement = tmp = elem = elem || document, 3 !== elem.nodeType && 8 !== elem.nodeType && !rfocusMorph.test(type + jQuery.event.triggered) && (type.indexOf(".") > -1 && (namespaces = type.split("."), type = namespaces.shift(), namespaces.sort()), ontype = type.indexOf(":") < 0 && "on" + type, (event = event[jQuery.expando] ? event : new jQuery.Event(type, "object" == typeof event && event)).isTrigger = onlyHandlers ? 2 : 3, event.namespace = namespaces.join("."), event.rnamespace = event.namespace ? new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)") : null, event.result = void 0, event.target || (event.target = elem), data = null == data ? [event] : jQuery.makeArray(data, [event]), special = jQuery.event.special[type] || {}, onlyHandlers || !special.trigger || !1 !== special.trigger.apply(elem, data))) {
                    if (!onlyHandlers && !special.noBubble && !isWindow(elem)) {
                        for (bubbleType = special.delegateType || type, rfocusMorph.test(bubbleType + type) || (cur = cur.parentNode); cur; cur = cur.parentNode) eventPath.push(cur), tmp = cur;
                        tmp === (elem.ownerDocument || document) && eventPath.push(tmp.defaultView || tmp.parentWindow || window)
                    }
                    for (i = 0;
                        (cur = eventPath[i++]) && !event.isPropagationStopped();) lastElement = cur, event.type = i > 1 ? bubbleType : special.bindType || type, (handle = (dataPriv.get(cur, "events") || Object.create(null))[event.type] && dataPriv.get(cur, "handle")) && handle.apply(cur, data), (handle = ontype && cur[ontype]) && handle.apply && acceptData(cur) && (event.result = handle.apply(cur, data), !1 === event.result && event.preventDefault());
                    return event.type = type, onlyHandlers || event.isDefaultPrevented() || special._default && !1 !== special._default.apply(eventPath.pop(), data) || !acceptData(elem) || ontype && isFunction(elem[type]) && !isWindow(elem) && ((tmp = elem[ontype]) && (elem[ontype] = null), jQuery.event.triggered = type, event.isPropagationStopped() && lastElement.addEventListener(type, stopPropagationCallback), elem[type](), event.isPropagationStopped() && lastElement.removeEventListener(type, stopPropagationCallback), jQuery.event.triggered = void 0, tmp && (elem[ontype] = tmp)), event.result
                }
            },
            simulate: function(type, elem, event) {
                var e = jQuery.extend(new jQuery.Event, event, {
                    type: type,
                    isSimulated: !0
                });
                jQuery.event.trigger(e, null, elem)
            }
        }), jQuery.fn.extend({
            trigger: function(type, data) {
                return this.each(function() {
                    jQuery.event.trigger(type, data, this)
                })
            },
            triggerHandler: function(type, data) {
                var elem = this[0];
                if (elem) return jQuery.event.trigger(type, data, elem, !0)
            }
        }), support.focusin || jQuery.each({
            focus: "focusin",
            blur: "focusout"
        }, function(orig, fix) {
            var handler = function(event) {
                jQuery.event.simulate(fix, event.target, jQuery.event.fix(event))
            };
            jQuery.event.special[fix] = {
                setup: function() {
                    var doc = this.ownerDocument || this.document || this,
                        attaches = dataPriv.access(doc, fix);
                    attaches || doc.addEventListener(orig, handler, !0), dataPriv.access(doc, fix, (attaches || 0) + 1)
                },
                teardown: function() {
                    var doc = this.ownerDocument || this.document || this,
                        attaches = dataPriv.access(doc, fix) - 1;
                    attaches ? dataPriv.access(doc, fix, attaches) : (doc.removeEventListener(orig, handler, !0), dataPriv.remove(doc, fix))
                }
            }
        });
        var location = window.location,
            nonce = {
                guid: Date.now()
            },
            rquery = /\?/;
        jQuery.parseXML = function(data) {
            var xml;
            if (!data || "string" != typeof data) return null;
            try {
                xml = (new window.DOMParser).parseFromString(data, "text/xml")
            } catch (e) {
                xml = void 0
            }
            return xml && !xml.getElementsByTagName("parsererror").length || jQuery.error("Invalid XML: " + data), xml
        };
        var rbracket = /\[\]$/,
            rCRLF = /\r?\n/g,
            rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
            rsubmittable = /^(?:input|select|textarea|keygen)/i;

        function buildParams(prefix, obj, traditional, add) {
            var name;
            if (Array.isArray(obj)) jQuery.each(obj, function(i, v) {
                traditional || rbracket.test(prefix) ? add(prefix, v) : buildParams(prefix + "[" + ("object" == typeof v && null != v ? i : "") + "]", v, traditional, add)
            });
            else if (traditional || "object" !== toType(obj)) add(prefix, obj);
            else
                for (name in obj) buildParams(prefix + "[" + name + "]", obj[name], traditional, add)
        }
        jQuery.param = function(a, traditional) {
            var prefix, s = [],
                add = function(key, valueOrFunction) {
                    var value = isFunction(valueOrFunction) ? valueOrFunction() : valueOrFunction;
                    s[s.length] = encodeURIComponent(key) + "=" + encodeURIComponent(null == value ? "" : value)
                };
            if (null == a) return "";
            if (Array.isArray(a) || a.jquery && !jQuery.isPlainObject(a)) jQuery.each(a, function() {
                add(this.name, this.value)
            });
            else
                for (prefix in a) buildParams(prefix, a[prefix], traditional, add);
            return s.join("&")
        }, jQuery.fn.extend({
            serialize: function() {
                return jQuery.param(this.serializeArray())
            },
            serializeArray: function() {
                return this.map(function() {
                    var elements = jQuery.prop(this, "elements");
                    return elements ? jQuery.makeArray(elements) : this
                }).filter(function() {
                    var type = this.type;
                    return this.name && !jQuery(this).is(":disabled") && rsubmittable.test(this.nodeName) && !rsubmitterTypes.test(type) && (this.checked || !rcheckableType.test(type))
                }).map(function(_i, elem) {
                    var val = jQuery(this).val();
                    return null == val ? null : Array.isArray(val) ? jQuery.map(val, function(val) {
                        return {
                            name: elem.name,
                            value: val.replace(rCRLF, "\r\n")
                        }
                    }) : {
                        name: elem.name,
                        value: val.replace(rCRLF, "\r\n")
                    }
                }).get()
            }
        });
        var r20 = /%20/g,
            rhash = /#.*$/,
            rantiCache = /([?&])_=[^&]*/,
            rheaders = /^(.*?):[ \t]*([^\r\n]*)$/gm,
            rnoContent = /^(?:GET|HEAD)$/,
            rprotocol = /^\/\//,
            prefilters = {},
            transports = {},
            allTypes = "*/".concat("*"),
            originAnchor = document.createElement("a");

        function addToPrefiltersOrTransports(structure) {
            return function(dataTypeExpression, func) {
                "string" != typeof dataTypeExpression && (func = dataTypeExpression, dataTypeExpression = "*");
                var dataType, i = 0,
                    dataTypes = dataTypeExpression.toLowerCase().match(rnothtmlwhite) || [];
                if (isFunction(func))
                    for (; dataType = dataTypes[i++];) "+" === dataType[0] ? (dataType = dataType.slice(1) || "*", (structure[dataType] = structure[dataType] || []).unshift(func)) : (structure[dataType] = structure[dataType] || []).push(func)
            }
        }

        function inspectPrefiltersOrTransports(structure, options, originalOptions, jqXHR) {
            var inspected = {},
                seekingTransport = structure === transports;

            function inspect(dataType) {
                var selected;
                return inspected[dataType] = !0, jQuery.each(structure[dataType] || [], function(_, prefilterOrFactory) {
                    var dataTypeOrTransport = prefilterOrFactory(options, originalOptions, jqXHR);
                    return "string" != typeof dataTypeOrTransport || seekingTransport || inspected[dataTypeOrTransport] ? seekingTransport ? !(selected = dataTypeOrTransport) : void 0 : (options.dataTypes.unshift(dataTypeOrTransport), inspect(dataTypeOrTransport), !1)
                }), selected
            }
            return inspect(options.dataTypes[0]) || !inspected["*"] && inspect("*")
        }

        function ajaxExtend(target, src) {
            var key, deep, flatOptions = jQuery.ajaxSettings.flatOptions || {};
            for (key in src) void 0 !== src[key] && ((flatOptions[key] ? target : deep || (deep = {}))[key] = src[key]);
            return deep && jQuery.extend(!0, target, deep), target
        }
        originAnchor.href = location.href, jQuery.extend({
            active: 0,
            lastModified: {},
            etag: {},
            ajaxSettings: {
                url: location.href,
                type: "GET",
                isLocal: /^(?:about|app|app-storage|.+-extension|file|res|widget):$/.test(location.protocol),
                global: !0,
                processData: !0,
                async: !0,
                contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                accepts: {
                    "*": allTypes,
                    text: "text/plain",
                    html: "text/html",
                    xml: "application/xml, text/xml",
                    json: "application/json, text/javascript"
                },
                contents: {
                    xml: /\bxml\b/,
                    html: /\bhtml/,
                    json: /\bjson\b/
                },
                responseFields: {
                    xml: "responseXML",
                    text: "responseText",
                    json: "responseJSON"
                },
                converters: {
                    "* text": String,
                    "text html": !0,
                    "text json": JSON.parse,
                    "text xml": jQuery.parseXML
                },
                flatOptions: {
                    url: !0,
                    context: !0
                }
            },
            ajaxSetup: function(target, settings) {
                return settings ? ajaxExtend(ajaxExtend(target, jQuery.ajaxSettings), settings) : ajaxExtend(jQuery.ajaxSettings, target)
            },
            ajaxPrefilter: addToPrefiltersOrTransports(prefilters),
            ajaxTransport: addToPrefiltersOrTransports(transports),
            ajax: function(url, options) {
                "object" == typeof url && (options = url, url = void 0), options = options || {};
                var transport, cacheURL, responseHeadersString, responseHeaders, timeoutTimer, urlAnchor, completed, fireGlobals, i, uncached, s = jQuery.ajaxSetup({}, options),
                    callbackContext = s.context || s,
                    globalEventContext = s.context && (callbackContext.nodeType || callbackContext.jquery) ? jQuery(callbackContext) : jQuery.event,
                    deferred = jQuery.Deferred(),
                    completeDeferred = jQuery.Callbacks("once memory"),
                    statusCode = s.statusCode || {},
                    requestHeaders = {},
                    requestHeadersNames = {},
                    strAbort = "canceled",
                    jqXHR = {
                        readyState: 0,
                        getResponseHeader: function(key) {
                            var match;
                            if (completed) {
                                if (!responseHeaders)
                                    for (responseHeaders = {}; match = rheaders.exec(responseHeadersString);) responseHeaders[match[1].toLowerCase() + " "] = (responseHeaders[match[1].toLowerCase() + " "] || []).concat(match[2]);
                                match = responseHeaders[key.toLowerCase() + " "]
                            }
                            return null == match ? null : match.join(", ")
                        },
                        getAllResponseHeaders: function() {
                            return completed ? responseHeadersString : null
                        },
                        setRequestHeader: function(name, value) {
                            return null == completed && (name = requestHeadersNames[name.toLowerCase()] = requestHeadersNames[name.toLowerCase()] || name, requestHeaders[name] = value), this
                        },
                        overrideMimeType: function(type) {
                            return null == completed && (s.mimeType = type), this
                        },
                        statusCode: function(map) {
                            var code;
                            if (map)
                                if (completed) jqXHR.always(map[jqXHR.status]);
                                else
                                    for (code in map) statusCode[code] = [statusCode[code], map[code]];
                            return this
                        },
                        abort: function(statusText) {
                            var finalText = statusText || strAbort;
                            return transport && transport.abort(finalText), done(0, finalText), this
                        }
                    };
                if (deferred.promise(jqXHR), s.url = ((url || s.url || location.href) + "").replace(rprotocol, location.protocol + "//"), s.type = options.method || options.type || s.method || s.type, s.dataTypes = (s.dataType || "*").toLowerCase().match(rnothtmlwhite) || [""], null == s.crossDomain) {
                    urlAnchor = document.createElement("a");
                    try {
                        urlAnchor.href = s.url, urlAnchor.href = urlAnchor.href, s.crossDomain = originAnchor.protocol + "//" + originAnchor.host != urlAnchor.protocol + "//" + urlAnchor.host
                    } catch (e) {
                        s.crossDomain = !0
                    }
                }
                if (s.data && s.processData && "string" != typeof s.data && (s.data = jQuery.param(s.data, s.traditional)), inspectPrefiltersOrTransports(prefilters, s, options, jqXHR), completed) return jqXHR;
                for (i in (fireGlobals = jQuery.event && s.global) && 0 == jQuery.active++ && jQuery.event.trigger("ajaxStart"), s.type = s.type.toUpperCase(), s.hasContent = !rnoContent.test(s.type), cacheURL = s.url.replace(rhash, ""), s.hasContent ? s.data && s.processData && 0 === (s.contentType || "").indexOf("application/x-www-form-urlencoded") && (s.data = s.data.replace(r20, "+")) : (uncached = s.url.slice(cacheURL.length), s.data && (s.processData || "string" == typeof s.data) && (cacheURL += (rquery.test(cacheURL) ? "&" : "?") + s.data, delete s.data), !1 === s.cache && (cacheURL = cacheURL.replace(rantiCache, "$1"), uncached = (rquery.test(cacheURL) ? "&" : "?") + "_=" + nonce.guid++ + uncached), s.url = cacheURL + uncached), s.ifModified && (jQuery.lastModified[cacheURL] && jqXHR.setRequestHeader("If-Modified-Since", jQuery.lastModified[cacheURL]), jQuery.etag[cacheURL] && jqXHR.setRequestHeader("If-None-Match", jQuery.etag[cacheURL])), (s.data && s.hasContent && !1 !== s.contentType || options.contentType) && jqXHR.setRequestHeader("Content-Type", s.contentType), jqXHR.setRequestHeader("Accept", s.dataTypes[0] && s.accepts[s.dataTypes[0]] ? s.accepts[s.dataTypes[0]] + ("*" !== s.dataTypes[0] ? ", " + allTypes + "; q=0.01" : "") : s.accepts["*"]), s.headers) jqXHR.setRequestHeader(i, s.headers[i]);
                if (s.beforeSend && (!1 === s.beforeSend.call(callbackContext, jqXHR, s) || completed)) return jqXHR.abort();
                if (strAbort = "abort", completeDeferred.add(s.complete), jqXHR.done(s.success), jqXHR.fail(s.error), transport = inspectPrefiltersOrTransports(transports, s, options, jqXHR)) {
                    if (jqXHR.readyState = 1, fireGlobals && globalEventContext.trigger("ajaxSend", [jqXHR, s]), completed) return jqXHR;
                    s.async && s.timeout > 0 && (timeoutTimer = window.setTimeout(function() {
                        jqXHR.abort("timeout")
                    }, s.timeout));
                    try {
                        completed = !1, transport.send(requestHeaders, done)
                    } catch (e) {
                        if (completed) throw e;
                        done(-1, e)
                    }
                } else done(-1, "No Transport");

                function done(status, nativeStatusText, responses, headers) {
                    var isSuccess, success, error, response, modified, statusText = nativeStatusText;
                    completed || (completed = !0, timeoutTimer && window.clearTimeout(timeoutTimer), transport = void 0, responseHeadersString = headers || "", jqXHR.readyState = status > 0 ? 4 : 0, isSuccess = status >= 200 && status < 300 || 304 === status, responses && (response = function ajaxHandleResponses(s, jqXHR, responses) {
                        for (var ct, type, finalDataType, firstDataType, contents = s.contents, dataTypes = s.dataTypes;
                            "*" === dataTypes[0];) dataTypes.shift(), void 0 === ct && (ct = s.mimeType || jqXHR.getResponseHeader("Content-Type"));
                        if (ct)
                            for (type in contents)
                                if (contents[type] && contents[type].test(ct)) {
                                    dataTypes.unshift(type);
                                    break
                                } if (dataTypes[0] in responses) finalDataType = dataTypes[0];
                        else {
                            for (type in responses) {
                                if (!dataTypes[0] || s.converters[type + " " + dataTypes[0]]) {
                                    finalDataType = type;
                                    break
                                }
                                firstDataType || (firstDataType = type)
                            }
                            finalDataType = finalDataType || firstDataType
                        }
                        if (finalDataType) return finalDataType !== dataTypes[0] && dataTypes.unshift(finalDataType), responses[finalDataType]
                    }(s, jqXHR, responses)), !isSuccess && jQuery.inArray("script", s.dataTypes) > -1 && (s.converters["text script"] = function() {}), response = function ajaxConvert(s, response, jqXHR, isSuccess) {
                        var conv2, current, conv, tmp, prev, converters = {},
                            dataTypes = s.dataTypes.slice();
                        if (dataTypes[1])
                            for (conv in s.converters) converters[conv.toLowerCase()] = s.converters[conv];
                        for (current = dataTypes.shift(); current;)
                            if (s.responseFields[current] && (jqXHR[s.responseFields[current]] = response), !prev && isSuccess && s.dataFilter && (response = s.dataFilter(response, s.dataType)), prev = current, current = dataTypes.shift())
                                if ("*" === current) current = prev;
                                else if ("*" !== prev && prev !== current) {
                            if (!(conv = converters[prev + " " + current] || converters["* " + current]))
                                for (conv2 in converters)
                                    if ((tmp = conv2.split(" "))[1] === current && (conv = converters[prev + " " + tmp[0]] || converters["* " + tmp[0]])) {
                                        !0 === conv ? conv = converters[conv2] : !0 !== converters[conv2] && (current = tmp[0], dataTypes.unshift(tmp[1]));
                                        break
                                    } if (!0 !== conv)
                                if (conv && s.throws) response = conv(response);
                                else try {
                                    response = conv(response)
                                } catch (e) {
                                    return {
                                        state: "parsererror",
                                        error: conv ? e : "No conversion from " + prev + " to " + current
                                    }
                                }
                        }
                        return {
                            state: "success",
                            data: response
                        }
                    }(s, response, jqXHR, isSuccess), isSuccess ? (s.ifModified && ((modified = jqXHR.getResponseHeader("Last-Modified")) && (jQuery.lastModified[cacheURL] = modified), (modified = jqXHR.getResponseHeader("etag")) && (jQuery.etag[cacheURL] = modified)), 204 === status || "HEAD" === s.type ? statusText = "nocontent" : 304 === status ? statusText = "notmodified" : (statusText = response.state, success = response.data, isSuccess = !(error = response.error))) : (error = statusText, !status && statusText || (statusText = "error", status < 0 && (status = 0))), jqXHR.status = status, jqXHR.statusText = (nativeStatusText || statusText) + "", isSuccess ? deferred.resolveWith(callbackContext, [success, statusText, jqXHR]) : deferred.rejectWith(callbackContext, [jqXHR, statusText, error]), jqXHR.statusCode(statusCode), statusCode = void 0, fireGlobals && globalEventContext.trigger(isSuccess ? "ajaxSuccess" : "ajaxError", [jqXHR, s, isSuccess ? success : error]), completeDeferred.fireWith(callbackContext, [jqXHR, statusText]), fireGlobals && (globalEventContext.trigger("ajaxComplete", [jqXHR, s]), --jQuery.active || jQuery.event.trigger("ajaxStop")))
                }
                return jqXHR
            },
            getJSON: function(url, data, callback) {
                return jQuery.get(url, data, callback, "json")
            },
            getScript: function(url, callback) {
                return jQuery.get(url, void 0, callback, "script")
            }
        }), jQuery.each(["get", "post"], function(_i, method) {
            jQuery[method] = function(url, data, callback, type) {
                return isFunction(data) && (type = type || callback, callback = data, data = void 0), jQuery.ajax(jQuery.extend({
                    url: url,
                    type: method,
                    dataType: type,
                    data: data,
                    success: callback
                }, jQuery.isPlainObject(url) && url))
            }
        }), jQuery.ajaxPrefilter(function(s) {
            var i;
            for (i in s.headers) "content-type" === i.toLowerCase() && (s.contentType = s.headers[i] || "")
        }), jQuery._evalUrl = function(url, options, doc) {
            return jQuery.ajax({
                url: url,
                type: "GET",
                dataType: "script",
                cache: !0,
                async: !1,
                global: !1,
                converters: {
                    "text script": function() {}
                },
                dataFilter: function(response) {
                    jQuery.globalEval(response, options, doc)
                }
            })
        }, jQuery.fn.extend({
            wrapAll: function(html) {
                var wrap;
                return this[0] && (isFunction(html) && (html = html.call(this[0])), wrap = jQuery(html, this[0].ownerDocument).eq(0).clone(!0), this[0].parentNode && wrap.insertBefore(this[0]), wrap.map(function() {
                    for (var elem = this; elem.firstElementChild;) elem = elem.firstElementChild;
                    return elem
                }).append(this)), this
            },
            wrapInner: function(html) {
                return isFunction(html) ? this.each(function(i) {
                    jQuery(this).wrapInner(html.call(this, i))
                }) : this.each(function() {
                    var self = jQuery(this),
                        contents = self.contents();
                    contents.length ? contents.wrapAll(html) : self.append(html)
                })
            },
            wrap: function(html) {
                var htmlIsFunction = isFunction(html);
                return this.each(function(i) {
                    jQuery(this).wrapAll(htmlIsFunction ? html.call(this, i) : html)
                })
            },
            unwrap: function(selector) {
                return this.parent(selector).not("body").each(function() {
                    jQuery(this).replaceWith(this.childNodes)
                }), this
            }
        }), jQuery.expr.pseudos.hidden = function(elem) {
            return !jQuery.expr.pseudos.visible(elem)
        }, jQuery.expr.pseudos.visible = function(elem) {
            return !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length)
        }, jQuery.ajaxSettings.xhr = function() {
            try {
                return new window.XMLHttpRequest
            } catch (e) {}
        };
        var xhrSuccessStatus = {
                0: 200,
                1223: 204
            },
            xhrSupported = jQuery.ajaxSettings.xhr();
        support.cors = !!xhrSupported && "withCredentials" in xhrSupported, support.ajax = xhrSupported = !!xhrSupported, jQuery.ajaxTransport(function(options) {
            var callback, errorCallback;
            if (support.cors || xhrSupported && !options.crossDomain) return {
                send: function(headers, complete) {
                    var i, xhr = options.xhr();
                    if (xhr.open(options.type, options.url, options.async, options.username, options.password), options.xhrFields)
                        for (i in options.xhrFields) xhr[i] = options.xhrFields[i];
                    for (i in options.mimeType && xhr.overrideMimeType && xhr.overrideMimeType(options.mimeType), options.crossDomain || headers["X-Requested-With"] || (headers["X-Requested-With"] = "XMLHttpRequest"), headers) xhr.setRequestHeader(i, headers[i]);
                    callback = function(type) {
                        return function() {
                            callback && (callback = errorCallback = xhr.onload = xhr.onerror = xhr.onabort = xhr.ontimeout = xhr.onreadystatechange = null, "abort" === type ? xhr.abort() : "error" === type ? "number" != typeof xhr.status ? complete(0, "error") : complete(xhr.status, xhr.statusText) : complete(xhrSuccessStatus[xhr.status] || xhr.status, xhr.statusText, "text" !== (xhr.responseType || "text") || "string" != typeof xhr.responseText ? {
                                binary: xhr.response
                            } : {
                                text: xhr.responseText
                            }, xhr.getAllResponseHeaders()))
                        }
                    }, xhr.onload = callback(), errorCallback = xhr.onerror = xhr.ontimeout = callback("error"), void 0 !== xhr.onabort ? xhr.onabort = errorCallback : xhr.onreadystatechange = function() {
                        4 === xhr.readyState && window.setTimeout(function() {
                            callback && errorCallback()
                        })
                    }, callback = callback("abort");
                    try {
                        xhr.send(options.hasContent && options.data || null)
                    } catch (e) {
                        if (callback) throw e
                    }
                },
                abort: function() {
                    callback && callback()
                }
            }
        }), jQuery.ajaxPrefilter(function(s) {
            s.crossDomain && (s.contents.script = !1)
        }), jQuery.ajaxSetup({
            accepts: {
                script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
            },
            contents: {
                script: /\b(?:java|ecma)script\b/
            },
            converters: {
                "text script": function(text) {
                    return jQuery.globalEval(text), text
                }
            }
        }), jQuery.ajaxPrefilter("script", function(s) {
            void 0 === s.cache && (s.cache = !1), s.crossDomain && (s.type = "GET")
        }), jQuery.ajaxTransport("script", function(s) {
            var script, callback;
            if (s.crossDomain || s.scriptAttrs) return {
                send: function(_, complete) {
                    script = jQuery("<script>").attr(s.scriptAttrs || {}).prop({
                        charset: s.scriptCharset,
                        src: s.url
                    }).on("load error", callback = function(evt) {
                        script.remove(), callback = null, evt && complete("error" === evt.type ? 404 : 200, evt.type)
                    }), document.head.appendChild(script[0])
                },
                abort: function() {
                    callback && callback()
                }
            }
        });
        var body, oldCallbacks = [],
            rjsonp = /(=)\?(?=&|$)|\?\?/;
        jQuery.ajaxSetup({
            jsonp: "callback",
            jsonpCallback: function() {
                var callback = oldCallbacks.pop() || jQuery.expando + "_" + nonce.guid++;
                return this[callback] = !0, callback
            }
        }), jQuery.ajaxPrefilter("json jsonp", function(s, originalSettings, jqXHR) {
            var callbackName, overwritten, responseContainer, jsonProp = !1 !== s.jsonp && (rjsonp.test(s.url) ? "url" : "string" == typeof s.data && 0 === (s.contentType || "").indexOf("application/x-www-form-urlencoded") && rjsonp.test(s.data) && "data");
            if (jsonProp || "jsonp" === s.dataTypes[0]) return callbackName = s.jsonpCallback = isFunction(s.jsonpCallback) ? s.jsonpCallback() : s.jsonpCallback, jsonProp ? s[jsonProp] = s[jsonProp].replace(rjsonp, "$1" + callbackName) : !1 !== s.jsonp && (s.url += (rquery.test(s.url) ? "&" : "?") + s.jsonp + "=" + callbackName), s.converters["script json"] = function() {
                return responseContainer || jQuery.error(callbackName + " was not called"), responseContainer[0]
            }, s.dataTypes[0] = "json", overwritten = window[callbackName], window[callbackName] = function() {
                responseContainer = arguments
            }, jqXHR.always(function() {
                void 0 === overwritten ? jQuery(window).removeProp(callbackName) : window[callbackName] = overwritten, s[callbackName] && (s.jsonpCallback = originalSettings.jsonpCallback, oldCallbacks.push(callbackName)), responseContainer && isFunction(overwritten) && overwritten(responseContainer[0]), responseContainer = overwritten = void 0
            }), "script"
        }), support.createHTMLDocument = ((body = document.implementation.createHTMLDocument("").body).innerHTML = "<form></form><form></form>", 2 === body.childNodes.length), jQuery.parseHTML = function(data, context, keepScripts) {
            return "string" != typeof data ? [] : ("boolean" == typeof context && (keepScripts = context, context = !1), context || (support.createHTMLDocument ? ((base = (context = document.implementation.createHTMLDocument("")).createElement("base")).href = document.location.href, context.head.appendChild(base)) : context = document), scripts = !keepScripts && [], (parsed = rsingleTag.exec(data)) ? [context.createElement(parsed[1])] : (parsed = buildFragment([data], context, scripts), scripts && scripts.length && jQuery(scripts).remove(), jQuery.merge([], parsed.childNodes)));
            var base, parsed, scripts
        }, jQuery.fn.load = function(url, params, callback) {
            var selector, type, response, self = this,
                off = url.indexOf(" ");
            return off > -1 && (selector = stripAndCollapse(url.slice(off)), url = url.slice(0, off)), isFunction(params) ? (callback = params, params = void 0) : params && "object" == typeof params && (type = "POST"), self.length > 0 && jQuery.ajax({
                url: url,
                type: type || "GET",
                dataType: "html",
                data: params
            }).done(function(responseText) {
                response = arguments, self.html(selector ? jQuery("<div>").append(jQuery.parseHTML(responseText)).find(selector) : responseText)
            }).always(callback && function(jqXHR, status) {
                self.each(function() {
                    callback.apply(this, response || [jqXHR.responseText, status, jqXHR])
                })
            }), this
        }, jQuery.expr.pseudos.animated = function(elem) {
            return jQuery.grep(jQuery.timers, function(fn) {
                return elem === fn.elem
            }).length
        }, jQuery.offset = {
            setOffset: function(elem, options, i) {
                var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, position = jQuery.css(elem, "position"),
                    curElem = jQuery(elem),
                    props = {};
                "static" === position && (elem.style.position = "relative"), curOffset = curElem.offset(), curCSSTop = jQuery.css(elem, "top"), curCSSLeft = jQuery.css(elem, "left"), ("absolute" === position || "fixed" === position) && (curCSSTop + curCSSLeft).indexOf("auto") > -1 ? (curTop = (curPosition = curElem.position()).top, curLeft = curPosition.left) : (curTop = parseFloat(curCSSTop) || 0, curLeft = parseFloat(curCSSLeft) || 0), isFunction(options) && (options = options.call(elem, i, jQuery.extend({}, curOffset))), null != options.top && (props.top = options.top - curOffset.top + curTop), null != options.left && (props.left = options.left - curOffset.left + curLeft), "using" in options ? options.using.call(elem, props) : ("number" == typeof props.top && (props.top += "px"), "number" == typeof props.left && (props.left += "px"), curElem.css(props))
            }
        }, jQuery.fn.extend({
            offset: function(options) {
                if (arguments.length) return void 0 === options ? this : this.each(function(i) {
                    jQuery.offset.setOffset(this, options, i)
                });
                var rect, win, elem = this[0];
                return elem ? elem.getClientRects().length ? (rect = elem.getBoundingClientRect(), win = elem.ownerDocument.defaultView, {
                    top: rect.top + win.pageYOffset,
                    left: rect.left + win.pageXOffset
                }) : {
                    top: 0,
                    left: 0
                } : void 0
            },
            position: function() {
                if (this[0]) {
                    var offsetParent, offset, doc, elem = this[0],
                        parentOffset = {
                            top: 0,
                            left: 0
                        };
                    if ("fixed" === jQuery.css(elem, "position")) offset = elem.getBoundingClientRect();
                    else {
                        for (offset = this.offset(), doc = elem.ownerDocument, offsetParent = elem.offsetParent || doc.documentElement; offsetParent && (offsetParent === doc.body || offsetParent === doc.documentElement) && "static" === jQuery.css(offsetParent, "position");) offsetParent = offsetParent.parentNode;
                        offsetParent && offsetParent !== elem && 1 === offsetParent.nodeType && ((parentOffset = jQuery(offsetParent).offset()).top += jQuery.css(offsetParent, "borderTopWidth", !0), parentOffset.left += jQuery.css(offsetParent, "borderLeftWidth", !0))
                    }
                    return {
                        top: offset.top - parentOffset.top - jQuery.css(elem, "marginTop", !0),
                        left: offset.left - parentOffset.left - jQuery.css(elem, "marginLeft", !0)
                    }
                }
            },
            offsetParent: function() {
                return this.map(function() {
                    for (var offsetParent = this.offsetParent; offsetParent && "static" === jQuery.css(offsetParent, "position");) offsetParent = offsetParent.offsetParent;
                    return offsetParent || documentElement
                })
            }
        }), jQuery.each({
            scrollLeft: "pageXOffset",
            scrollTop: "pageYOffset"
        }, function(method, prop) {
            var top = "pageYOffset" === prop;
            jQuery.fn[method] = function(val) {
                return access(this, function(elem, method, val) {
                    var win;
                    if (isWindow(elem) ? win = elem : 9 === elem.nodeType && (win = elem.defaultView), void 0 === val) return win ? win[prop] : elem[method];
                    win ? win.scrollTo(top ? win.pageXOffset : val, top ? val : win.pageYOffset) : elem[method] = val
                }, method, val, arguments.length)
            }
        }), jQuery.each(["top", "left"], function(_i, prop) {
            jQuery.cssHooks[prop] = addGetHookIf(support.pixelPosition, function(elem, computed) {
                if (computed) return computed = curCSS(elem, prop), rnumnonpx.test(computed) ? jQuery(elem).position()[prop] + "px" : computed
            })
        }), jQuery.each({
            Height: "height",
            Width: "width"
        }, function(name, type) {
            jQuery.each({
                padding: "inner" + name,
                content: type,
                "": "outer" + name
            }, function(defaultExtra, funcName) {
                jQuery.fn[funcName] = function(margin, value) {
                    var chainable = arguments.length && (defaultExtra || "boolean" != typeof margin),
                        extra = defaultExtra || (!0 === margin || !0 === value ? "margin" : "border");
                    return access(this, function(elem, type, value) {
                        var doc;
                        return isWindow(elem) ? 0 === funcName.indexOf("outer") ? elem["inner" + name] : elem.document.documentElement["client" + name] : 9 === elem.nodeType ? (doc = elem.documentElement, Math.max(elem.body["scroll" + name], doc["scroll" + name], elem.body["offset" + name], doc["offset" + name], doc["client" + name])) : void 0 === value ? jQuery.css(elem, type, extra) : jQuery.style(elem, type, value, extra)
                    }, type, chainable ? margin : void 0, chainable)
                }
            })
        }), jQuery.each(["ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend"], function(_i, type) {
            jQuery.fn[type] = function(fn) {
                return this.on(type, fn)
            }
        }), jQuery.fn.extend({
            bind: function(types, data, fn) {
                return this.on(types, null, data, fn)
            },
            unbind: function(types, fn) {
                return this.off(types, null, fn)
            },
            delegate: function(selector, types, data, fn) {
                return this.on(types, selector, data, fn)
            },
            undelegate: function(selector, types, fn) {
                return 1 === arguments.length ? this.off(selector, "**") : this.off(types, selector || "**", fn)
            },
            hover: function(fnOver, fnOut) {
                return this.mouseenter(fnOver).mouseleave(fnOut || fnOver)
            }
        }), jQuery.each("blur focus focusin focusout resize scroll click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup contextmenu".split(" "), function(_i, name) {
            jQuery.fn[name] = function(data, fn) {
                return arguments.length > 0 ? this.on(name, null, data, fn) : this.trigger(name)
            }
        });
        var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
        jQuery.proxy = function(fn, context) {
            var tmp, args, proxy;
            if ("string" == typeof context && (tmp = fn[context], context = fn, fn = tmp), isFunction(fn)) return args = slice.call(arguments, 2), (proxy = function() {
                return fn.apply(context || this, args.concat(slice.call(arguments)))
            }).guid = fn.guid = fn.guid || jQuery.guid++, proxy
        }, jQuery.holdReady = function(hold) {
            hold ? jQuery.readyWait++ : jQuery.ready(!0)
        }, jQuery.isArray = Array.isArray, jQuery.parseJSON = JSON.parse, jQuery.nodeName = nodeName, jQuery.isFunction = isFunction, jQuery.isWindow = isWindow, jQuery.camelCase = camelCase, jQuery.type = toType, jQuery.now = Date.now, jQuery.isNumeric = function(obj) {
            var type = jQuery.type(obj);
            return ("number" === type || "string" === type) && !isNaN(obj - parseFloat(obj))
        }, jQuery.trim = function(text) {
            return null == text ? "" : (text + "").replace(rtrim, "")
        }, void 0 === (__WEBPACK_AMD_DEFINE_RESULT__ = function() {
            return jQuery
        }.apply(exports, [])) || (module.exports = __WEBPACK_AMD_DEFINE_RESULT__);
        var _jQuery = window.jQuery,
            _$ = window.$;
        return jQuery.noConflict = function(deep) {
            return window.$ === jQuery && (window.$ = _$), deep && window.jQuery === jQuery && (window.jQuery = _jQuery), jQuery
        }, void 0 === noGlobal && (window.jQuery = window.$ = jQuery), jQuery
    })
}, function(module, exports, __webpack_require__) {
    (function(global) {
        module.exports = global.fancybox = __webpack_require__(60)
    }).call(this, __webpack_require__(0))
}, function(module, exports) {
    ! function(window, document, $, undefined) {
        "use strict";
        if (window.console = window.console || {
                info: function(stuff) {}
            }, $)
            if ($.fn.fancybox) console.info("fancyBox already initialized");
            else {
                var div, $pressed, defaults = {
                        closeExisting: !1,
                        loop: !1,
                        gutter: 50,
                        keyboard: !0,
                        preventCaptionOverlap: !0,
                        arrows: !0,
                        infobar: !0,
                        smallBtn: "auto",
                        toolbar: "auto",
                        buttons: ["zoom", "slideShow", "thumbs", "close"],
                        idleTime: 3,
                        protect: !1,
                        modal: !1,
                        image: {
                            preload: !1
                        },
                        ajax: {
                            settings: {
                                data: {
                                    fancybox: !0
                                }
                            }
                        },
                        iframe: {
                            tpl: '<iframe id="fancybox-frame{rnd}" name="fancybox-frame{rnd}" class="fancybox-iframe" allowfullscreen="allowfullscreen" allow="autoplay; fullscreen" src=""></iframe>',
                            preload: !0,
                            css: {},
                            attr: {
                                scrolling: "auto"
                            }
                        },
                        video: {
                            tpl: '<video class="fancybox-video" controls controlsList="nodownload" poster="{{poster}}"><source src="{{src}}" type="{{format}}" />Sorry, your browser doesn\'t support embedded videos, <a href="{{src}}">download</a> and watch with your favorite video player!</video>',
                            format: "",
                            autoStart: !0
                        },
                        defaultType: "image",
                        animationEffect: "zoom",
                        animationDuration: 366,
                        zoomOpacity: "auto",
                        transitionEffect: "fade",
                        transitionDuration: 366,
                        slideClass: "",
                        baseClass: "",
                        baseTpl: '<div class="fancybox-container" role="dialog" tabindex="-1"><div class="fancybox-bg"></div><div class="fancybox-inner"><div class="fancybox-infobar"><span data-fancybox-index></span>&nbsp;/&nbsp;<span data-fancybox-count></span></div><div class="fancybox-toolbar">{{buttons}}</div><div class="fancybox-navigation">{{arrows}}</div><div class="fancybox-stage"></div><div class="fancybox-caption"><div class="fancybox-caption__body"></div></div></div></div>',
                        spinnerTpl: '<div class="fancybox-loading"></div>',
                        errorTpl: '<div class="fancybox-error"><p>{{ERROR}}</p></div>',
                        btnTpl: {
                            download: '<a download data-fancybox-download class="fancybox-button fancybox-button--download" title="{{DOWNLOAD}}" href="javascript:;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M18.62 17.09V19H5.38v-1.91zm-2.97-6.96L17 11.45l-5 4.87-5-4.87 1.36-1.32 2.68 2.64V5h1.92v7.77z"/></svg></a>',
                            zoom: '<button data-fancybox-zoom class="fancybox-button fancybox-button--zoom" title="{{ZOOM}}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M18.7 17.3l-3-3a5.9 5.9 0 0 0-.6-7.6 5.9 5.9 0 0 0-8.4 0 5.9 5.9 0 0 0 0 8.4 5.9 5.9 0 0 0 7.7.7l3 3a1 1 0 0 0 1.3 0c.4-.5.4-1 0-1.5zM8.1 13.8a4 4 0 0 1 0-5.7 4 4 0 0 1 5.7 0 4 4 0 0 1 0 5.7 4 4 0 0 1-5.7 0z"/></svg></button>',
                            close: '<button data-fancybox-close class="fancybox-button fancybox-button--close" title="{{CLOSE}}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 10.6L6.6 5.2 5.2 6.6l5.4 5.4-5.4 5.4 1.4 1.4 5.4-5.4 5.4 5.4 1.4-1.4-5.4-5.4 5.4-5.4-1.4-1.4-5.4 5.4z"/></svg></button>',
                            arrowLeft: '<button data-fancybox-prev class="fancybox-button fancybox-button--arrow_left" title="{{PREV}}"><div><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M11.28 15.7l-1.34 1.37L5 12l4.94-5.07 1.34 1.38-2.68 2.72H19v1.94H8.6z"/></svg></div></button>',
                            arrowRight: '<button data-fancybox-next class="fancybox-button fancybox-button--arrow_right" title="{{NEXT}}"><div><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15.4 12.97l-2.68 2.72 1.34 1.38L19 12l-4.94-5.07-1.34 1.38 2.68 2.72H5v1.94z"/></svg></div></button>',
                            smallBtn: '<button type="button" data-fancybox-close class="fancybox-button fancybox-close-small" title="{{CLOSE}}"><svg xmlns="http://www.w3.org/2000/svg" version="1" viewBox="0 0 24 24"><path d="M13 12l5-5-1-1-5 5-5-5-1 1 5 5-5 5 1 1 5-5 5 5 1-1z"/></svg></button>'
                        },
                        parentEl: "body",
                        hideScrollbar: !0,
                        autoFocus: !0,
                        backFocus: !0,
                        trapFocus: !0,
                        fullScreen: {
                            autoStart: !1
                        },
                        touch: {
                            vertical: !0,
                            momentum: !0
                        },
                        hash: null,
                        media: {},
                        slideShow: {
                            autoStart: !1,
                            speed: 3e3
                        },
                        thumbs: {
                            autoStart: !1,
                            hideOnClose: !0,
                            parentEl: ".fancybox-container",
                            axis: "y"
                        },
                        wheel: "auto",
                        onInit: $.noop,
                        beforeLoad: $.noop,
                        afterLoad: $.noop,
                        beforeShow: $.noop,
                        afterShow: $.noop,
                        beforeClose: $.noop,
                        afterClose: $.noop,
                        onActivate: $.noop,
                        onDeactivate: $.noop,
                        clickContent: function(current, event) {
                            return "image" === current.type && "zoom"
                        },
                        clickSlide: "close",
                        clickOutside: "close",
                        dblclickContent: !1,
                        dblclickSlide: !1,
                        dblclickOutside: !1,
                        mobile: {
                            preventCaptionOverlap: !1,
                            idleTime: !1,
                            clickContent: function(current, event) {
                                return "image" === current.type && "toggleControls"
                            },
                            clickSlide: function(current, event) {
                                return "image" === current.type ? "toggleControls" : "close"
                            },
                            dblclickContent: function(current, event) {
                                return "image" === current.type && "zoom"
                            },
                            dblclickSlide: function(current, event) {
                                return "image" === current.type && "zoom"
                            }
                        },
                        lang: "en",
                        i18n: {
                            en: {
                                CLOSE: "Close",
                                NEXT: "Next",
                                PREV: "Previous",
                                ERROR: "The requested content cannot be loaded. <br/> Please try again later.",
                                PLAY_START: "Start slideshow",
                                PLAY_STOP: "Pause slideshow",
                                FULL_SCREEN: "Full screen",
                                THUMBS: "Thumbnails",
                                DOWNLOAD: "Download",
                                SHARE: "Share",
                                ZOOM: "Zoom"
                            },
                            de: {
                                CLOSE: "Schlie&szlig;en",
                                NEXT: "Weiter",
                                PREV: "Zur&uuml;ck",
                                ERROR: "Die angeforderten Daten konnten nicht geladen werden. <br/> Bitte versuchen Sie es sp&auml;ter nochmal.",
                                PLAY_START: "Diaschau starten",
                                PLAY_STOP: "Diaschau beenden",
                                FULL_SCREEN: "Vollbild",
                                THUMBS: "Vorschaubilder",
                                DOWNLOAD: "Herunterladen",
                                SHARE: "Teilen",
                                ZOOM: "Vergr&ouml;&szlig;ern"
                            }
                        }
                    },
                    $W = $(window),
                    $D = $(document),
                    called = 0,
                    requestAFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || function(callback) {
                        return window.setTimeout(callback, 1e3 / 60)
                    },
                    cancelAFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.oCancelAnimationFrame || function(id) {
                        window.clearTimeout(id)
                    },
                    transitionEnd = function() {
                        var t, el = document.createElement("fakeelement"),
                            transitions = {
                                transition: "transitionend",
                                OTransition: "oTransitionEnd",
                                MozTransition: "transitionend",
                                WebkitTransition: "webkitTransitionEnd"
                            };
                        for (t in transitions)
                            if (void 0 !== el.style[t]) return transitions[t];
                        return "transitionend"
                    }(),
                    forceRedraw = function($el) {
                        return $el && $el.length && $el[0].offsetHeight
                    },
                    mergeOpts = function(opts1, opts2) {
                        var rez = $.extend(!0, {}, opts1, opts2);
                        return $.each(opts2, function(key, value) {
                            $.isArray(value) && (rez[key] = value)
                        }), rez
                    },
                    FancyBox = function(content, opts, index) {
                        this.opts = mergeOpts({
                            index: index
                        }, $.fancybox.defaults), $.isPlainObject(opts) && (this.opts = mergeOpts(this.opts, opts)), $.fancybox.isMobile && (this.opts = mergeOpts(this.opts, this.opts.mobile)), this.id = this.opts.id || ++called, this.currIndex = parseInt(this.opts.index, 10) || 0, this.prevIndex = null, this.prevPos = null, this.currPos = 0, this.firstRun = !0, this.group = [], this.slides = {}, this.addContent(content), this.group.length && this.init()
                    };
                $.extend(FancyBox.prototype, {
                    init: function() {
                        var $container, buttonStr, self = this,
                            firstItemOpts = self.group[self.currIndex].opts;
                        firstItemOpts.closeExisting && $.fancybox.close(!0), $("body").addClass("fancybox-active"), !$.fancybox.getInstance() && !1 !== firstItemOpts.hideScrollbar && !$.fancybox.isMobile && document.body.scrollHeight > window.innerHeight && ($("head").append('<style id="fancybox-style-noscroll" type="text/css">.compensate-for-scrollbar{margin-right:' + (window.innerWidth - document.documentElement.clientWidth) + "px;}</style>"), $("body").addClass("compensate-for-scrollbar")), buttonStr = "", $.each(firstItemOpts.buttons, function(index, value) {
                            buttonStr += firstItemOpts.btnTpl[value] || ""
                        }), $container = $(self.translate(self, firstItemOpts.baseTpl.replace("{{buttons}}", buttonStr).replace("{{arrows}}", firstItemOpts.btnTpl.arrowLeft + firstItemOpts.btnTpl.arrowRight))).attr("id", "fancybox-container-" + self.id).addClass(firstItemOpts.baseClass).data("FancyBox", self).appendTo(firstItemOpts.parentEl), self.$refs = {
                            container: $container
                        }, ["bg", "inner", "infobar", "toolbar", "stage", "caption", "navigation"].forEach(function(item) {
                            self.$refs[item] = $container.find(".fancybox-" + item)
                        }), self.trigger("onInit"), self.activate(), self.jumpTo(self.currIndex)
                    },
                    translate: function(obj, str) {
                        var arr = obj.opts.i18n[obj.opts.lang] || obj.opts.i18n.en;
                        return str.replace(/\{\{(\w+)\}\}/g, function(match, n) {
                            return void 0 === arr[n] ? match : arr[n]
                        })
                    },
                    addContent: function(content) {
                        var thumbs, self = this,
                            items = $.makeArray(content);
                        $.each(items, function(i, item) {
                            var $item, type, found, src, srcParts, obj = {},
                                opts = {};
                            $.isPlainObject(item) ? (obj = item, opts = item.opts || item) : "object" === $.type(item) && $(item).length ? (opts = ($item = $(item)).data() || {}, (opts = $.extend(!0, {}, opts, opts.options)).$orig = $item, obj.src = self.opts.src || opts.src || $item.attr("href"), obj.type || obj.src || (obj.type = "inline", obj.src = item)) : obj = {
                                type: "html",
                                src: item + ""
                            }, obj.opts = $.extend(!0, {}, self.opts, opts), $.isArray(opts.buttons) && (obj.opts.buttons = opts.buttons), $.fancybox.isMobile && obj.opts.mobile && (obj.opts = mergeOpts(obj.opts, obj.opts.mobile)), type = obj.type || obj.opts.type, src = obj.src || "", !type && src && ((found = src.match(/\.(mp4|mov|ogv|webm)((\?|#).*)?$/i)) ? (type = "video", obj.opts.video.format || (obj.opts.video.format = "video/" + ("ogv" === found[1] ? "ogg" : found[1]))) : src.match(/(^data:image\/[a-z0-9+\/=]*,)|(\.(jp(e|g|eg)|gif|png|bmp|webp|svg|ico)((\?|#).*)?$)/i) ? type = "image" : src.match(/\.(pdf)((\?|#).*)?$/i) ? (type = "iframe", obj = $.extend(!0, obj, {
                                contentType: "pdf",
                                opts: {
                                    iframe: {
                                        preload: !1
                                    }
                                }
                            })) : "#" === src.charAt(0) && (type = "inline")), type ? obj.type = type : self.trigger("objectNeedsType", obj), obj.contentType || (obj.contentType = $.inArray(obj.type, ["html", "inline", "ajax"]) > -1 ? "html" : obj.type), obj.index = self.group.length, "auto" == obj.opts.smallBtn && (obj.opts.smallBtn = $.inArray(obj.type, ["html", "inline", "ajax"]) > -1), "auto" === obj.opts.toolbar && (obj.opts.toolbar = !obj.opts.smallBtn), obj.$thumb = obj.opts.$thumb || null, obj.opts.$trigger && obj.index === self.opts.index && (obj.$thumb = obj.opts.$trigger.find("img:first"), obj.$thumb.length && (obj.opts.$orig = obj.opts.$trigger)), obj.$thumb && obj.$thumb.length || !obj.opts.$orig || (obj.$thumb = obj.opts.$orig.find("img:first")), obj.$thumb && !obj.$thumb.length && (obj.$thumb = null), obj.thumb = obj.opts.thumb || (obj.$thumb ? obj.$thumb[0].src : null), "function" === $.type(obj.opts.caption) && (obj.opts.caption = obj.opts.caption.apply(item, [self, obj])), "function" === $.type(self.opts.caption) && (obj.opts.caption = self.opts.caption.apply(item, [self, obj])), obj.opts.caption instanceof $ || (obj.opts.caption = void 0 === obj.opts.caption ? "" : obj.opts.caption + ""), "ajax" === obj.type && (srcParts = src.split(/\s+/, 2)).length > 1 && (obj.src = srcParts.shift(), obj.opts.filter = srcParts.shift()), obj.opts.modal && (obj.opts = $.extend(!0, obj.opts, {
                                trapFocus: !0,
                                infobar: 0,
                                toolbar: 0,
                                smallBtn: 0,
                                keyboard: 0,
                                slideShow: 0,
                                fullScreen: 0,
                                thumbs: 0,
                                touch: 0,
                                clickContent: !1,
                                clickSlide: !1,
                                clickOutside: !1,
                                dblclickContent: !1,
                                dblclickSlide: !1,
                                dblclickOutside: !1
                            })), self.group.push(obj)
                        }), Object.keys(self.slides).length && (self.updateControls(), (thumbs = self.Thumbs) && thumbs.isActive && (thumbs.create(), thumbs.focus()))
                    },
                    addEvents: function() {
                        var self = this;
                        self.removeEvents(), self.$refs.container.on("click.fb-close", "[data-fancybox-close]", function(e) {
                            e.stopPropagation(), e.preventDefault(), self.close(e)
                        }).on("touchstart.fb-prev click.fb-prev", "[data-fancybox-prev]", function(e) {
                            e.stopPropagation(), e.preventDefault(), self.previous()
                        }).on("touchstart.fb-next click.fb-next", "[data-fancybox-next]", function(e) {
                            e.stopPropagation(), e.preventDefault(), self.next()
                        }).on("click.fb", "[data-fancybox-zoom]", function(e) {
                            self[self.isScaledDown() ? "scaleToActual" : "scaleToFit"]()
                        }), $W.on("orientationchange.fb resize.fb", function(e) {
                            e && e.originalEvent && "resize" === e.originalEvent.type ? (self.requestId && cancelAFrame(self.requestId), self.requestId = requestAFrame(function() {
                                self.update(e)
                            })) : (self.current && "iframe" === self.current.type && self.$refs.stage.hide(), setTimeout(function() {
                                self.$refs.stage.show(), self.update(e)
                            }, $.fancybox.isMobile ? 600 : 250))
                        }), $D.on("keydown.fb", function(e) {
                            var current = ($.fancybox ? $.fancybox.getInstance() : null).current,
                                keycode = e.keyCode || e.which;
                            if (9 != keycode) {
                                if (!(!current.opts.keyboard || e.ctrlKey || e.altKey || e.shiftKey || $(e.target).is("input,textarea,video,audio,select"))) return 8 === keycode || 27 === keycode ? (e.preventDefault(), void self.close(e)) : 37 === keycode || 38 === keycode ? (e.preventDefault(), void self.previous()) : 39 === keycode || 40 === keycode ? (e.preventDefault(), void self.next()) : void self.trigger("afterKeydown", e, keycode)
                            } else current.opts.trapFocus && self.focus(e)
                        }), self.group[self.currIndex].opts.idleTime && (self.idleSecondsCounter = 0, $D.on("mousemove.fb-idle mouseleave.fb-idle mousedown.fb-idle touchstart.fb-idle touchmove.fb-idle scroll.fb-idle keydown.fb-idle", function(e) {
                            self.idleSecondsCounter = 0, self.isIdle && self.showControls(), self.isIdle = !1
                        }), self.idleInterval = window.setInterval(function() {
                            self.idleSecondsCounter++, self.idleSecondsCounter >= self.group[self.currIndex].opts.idleTime && !self.isDragging && (self.isIdle = !0, self.idleSecondsCounter = 0, self.hideControls())
                        }, 1e3))
                    },
                    removeEvents: function() {
                        $W.off("orientationchange.fb resize.fb"), $D.off("keydown.fb .fb-idle"), this.$refs.container.off(".fb-close .fb-prev .fb-next"), this.idleInterval && (window.clearInterval(this.idleInterval), this.idleInterval = null)
                    },
                    previous: function(duration) {
                        return this.jumpTo(this.currPos - 1, duration)
                    },
                    next: function(duration) {
                        return this.jumpTo(this.currPos + 1, duration)
                    },
                    jumpTo: function(pos, duration) {
                        var firstRun, isMoved, loop, current, previous, slidePos, stagePos, prop, diff, self = this,
                            groupLen = self.group.length;
                        if (!(self.isDragging || self.isClosing || self.isAnimating && self.firstRun)) {
                            if (pos = parseInt(pos, 10), !(loop = self.current ? self.current.opts.loop : self.opts.loop) && (pos < 0 || pos >= groupLen)) return !1;
                            if (firstRun = self.firstRun = !Object.keys(self.slides).length, previous = self.current, self.prevIndex = self.currIndex, self.prevPos = self.currPos, current = self.createSlide(pos), groupLen > 1 && ((loop || current.index < groupLen - 1) && self.createSlide(pos + 1), (loop || current.index > 0) && self.createSlide(pos - 1)), self.current = current, self.currIndex = current.index, self.currPos = current.pos, self.trigger("beforeShow", firstRun), self.updateControls(), current.forcedDuration = void 0, $.isNumeric(duration) ? current.forcedDuration = duration : duration = current.opts[firstRun ? "animationDuration" : "transitionDuration"], duration = parseInt(duration, 10), isMoved = self.isMoved(current), current.$slide.addClass("fancybox-slide--current"), firstRun) return current.opts.animationEffect && duration && self.$refs.container.css("transition-duration", duration + "ms"), self.$refs.container.addClass("fancybox-is-open").trigger("focus"), self.loadSlide(current), void self.preload("image");
                            slidePos = $.fancybox.getTranslate(previous.$slide), stagePos = $.fancybox.getTranslate(self.$refs.stage), $.each(self.slides, function(index, slide) {
                                $.fancybox.stop(slide.$slide, !0)
                            }), previous.pos !== current.pos && (previous.isComplete = !1), previous.$slide.removeClass("fancybox-slide--complete fancybox-slide--current"), isMoved ? (diff = slidePos.left - (previous.pos * slidePos.width + previous.pos * previous.opts.gutter), $.each(self.slides, function(index, slide) {
                                slide.$slide.removeClass("fancybox-animated").removeClass(function(index, className) {
                                    return (className.match(/(^|\s)fancybox-fx-\S+/g) || []).join(" ")
                                });
                                var leftPos = slide.pos * slidePos.width + slide.pos * slide.opts.gutter;
                                $.fancybox.setTranslate(slide.$slide, {
                                    top: 0,
                                    left: leftPos - stagePos.left + diff
                                }), slide.pos !== current.pos && slide.$slide.addClass("fancybox-slide--" + (slide.pos > current.pos ? "next" : "previous")), forceRedraw(slide.$slide), $.fancybox.animate(slide.$slide, {
                                    top: 0,
                                    left: (slide.pos - current.pos) * slidePos.width + (slide.pos - current.pos) * slide.opts.gutter
                                }, duration, function() {
                                    slide.$slide.css({
                                        transform: "",
                                        opacity: ""
                                    }).removeClass("fancybox-slide--next fancybox-slide--previous"), slide.pos === self.currPos && self.complete()
                                })
                            })) : duration && current.opts.transitionEffect && (prop = "fancybox-animated fancybox-fx-" + current.opts.transitionEffect, previous.$slide.addClass("fancybox-slide--" + (previous.pos > current.pos ? "next" : "previous")), $.fancybox.animate(previous.$slide, prop, duration, function() {
                                previous.$slide.removeClass(prop).removeClass("fancybox-slide--next fancybox-slide--previous")
                            }, !1)), current.isLoaded ? self.revealContent(current) : self.loadSlide(current), self.preload("image")
                        }
                    },
                    createSlide: function(pos) {
                        var $slide, index;
                        return index = (index = pos % this.group.length) < 0 ? this.group.length + index : index, !this.slides[pos] && this.group[index] && ($slide = $('<div class="fancybox-slide"></div>').appendTo(this.$refs.stage), this.slides[pos] = $.extend(!0, {}, this.group[index], {
                            pos: pos,
                            $slide: $slide,
                            isLoaded: !1
                        }), this.updateSlide(this.slides[pos])), this.slides[pos]
                    },
                    scaleToActual: function(x, y, duration) {
                        var imgPos, posX, posY, scaleX, scaleY, self = this,
                            current = self.current,
                            $content = current.$content,
                            canvasWidth = $.fancybox.getTranslate(current.$slide).width,
                            canvasHeight = $.fancybox.getTranslate(current.$slide).height,
                            newImgWidth = current.width,
                            newImgHeight = current.height;
                        self.isAnimating || self.isMoved() || !$content || "image" != current.type || !current.isLoaded || current.hasError || (self.isAnimating = !0, $.fancybox.stop($content), x = void 0 === x ? .5 * canvasWidth : x, y = void 0 === y ? .5 * canvasHeight : y, (imgPos = $.fancybox.getTranslate($content)).top -= $.fancybox.getTranslate(current.$slide).top, imgPos.left -= $.fancybox.getTranslate(current.$slide).left, scaleX = newImgWidth / imgPos.width, scaleY = newImgHeight / imgPos.height, posX = .5 * canvasWidth - .5 * newImgWidth, posY = .5 * canvasHeight - .5 * newImgHeight, newImgWidth > canvasWidth && ((posX = imgPos.left * scaleX - (x * scaleX - x)) > 0 && (posX = 0), posX < canvasWidth - newImgWidth && (posX = canvasWidth - newImgWidth)), newImgHeight > canvasHeight && ((posY = imgPos.top * scaleY - (y * scaleY - y)) > 0 && (posY = 0), posY < canvasHeight - newImgHeight && (posY = canvasHeight - newImgHeight)), self.updateCursor(newImgWidth, newImgHeight), $.fancybox.animate($content, {
                            top: posY,
                            left: posX,
                            scaleX: scaleX,
                            scaleY: scaleY
                        }, duration || 366, function() {
                            self.isAnimating = !1
                        }), self.SlideShow && self.SlideShow.isActive && self.SlideShow.stop())
                    },
                    scaleToFit: function(duration) {
                        var end, self = this,
                            current = self.current,
                            $content = current.$content;
                        self.isAnimating || self.isMoved() || !$content || "image" != current.type || !current.isLoaded || current.hasError || (self.isAnimating = !0, $.fancybox.stop($content), end = self.getFitPos(current), self.updateCursor(end.width, end.height), $.fancybox.animate($content, {
                            top: end.top,
                            left: end.left,
                            scaleX: end.width / $content.width(),
                            scaleY: end.height / $content.height()
                        }, duration || 366, function() {
                            self.isAnimating = !1
                        }))
                    },
                    getFitPos: function(slide) {
                        var maxWidth, maxHeight, minRatio, aspectRatio, $content = slide.$content,
                            $slide = slide.$slide,
                            width = slide.width || slide.opts.width,
                            height = slide.height || slide.opts.height,
                            rez = {};
                        return !!(slide.isLoaded && $content && $content.length) && (maxWidth = $.fancybox.getTranslate(this.$refs.stage).width, maxHeight = $.fancybox.getTranslate(this.$refs.stage).height, maxWidth -= parseFloat($slide.css("paddingLeft")) + parseFloat($slide.css("paddingRight")) + parseFloat($content.css("marginLeft")) + parseFloat($content.css("marginRight")), maxHeight -= parseFloat($slide.css("paddingTop")) + parseFloat($slide.css("paddingBottom")) + parseFloat($content.css("marginTop")) + parseFloat($content.css("marginBottom")), width && height || (width = maxWidth, height = maxHeight), (width *= minRatio = Math.min(1, maxWidth / width, maxHeight / height)) > maxWidth - .5 && (width = maxWidth), (height *= minRatio) > maxHeight - .5 && (height = maxHeight), "image" === slide.type ? (rez.top = Math.floor(.5 * (maxHeight - height)) + parseFloat($slide.css("paddingTop")), rez.left = Math.floor(.5 * (maxWidth - width)) + parseFloat($slide.css("paddingLeft"))) : "video" === slide.contentType && (height > width / (aspectRatio = slide.opts.width && slide.opts.height ? width / height : slide.opts.ratio || 16 / 9) ? height = width / aspectRatio : width > height * aspectRatio && (width = height * aspectRatio)), rez.width = width, rez.height = height, rez)
                    },
                    update: function(e) {
                        var self = this;
                        $.each(self.slides, function(key, slide) {
                            self.updateSlide(slide, e)
                        })
                    },
                    updateSlide: function(slide, e) {
                        var $content = slide && slide.$content,
                            width = slide.width || slide.opts.width,
                            height = slide.height || slide.opts.height,
                            $slide = slide.$slide;
                        this.adjustCaption(slide), $content && (width || height || "video" === slide.contentType) && !slide.hasError && ($.fancybox.stop($content), $.fancybox.setTranslate($content, this.getFitPos(slide)), slide.pos === this.currPos && (this.isAnimating = !1, this.updateCursor())), this.adjustLayout(slide), $slide.length && ($slide.trigger("refresh"), slide.pos === this.currPos && this.$refs.toolbar.add(this.$refs.navigation.find(".fancybox-button--arrow_right")).toggleClass("compensate-for-scrollbar", $slide.get(0).scrollHeight > $slide.get(0).clientHeight)), this.trigger("onUpdate", slide, e)
                    },
                    centerSlide: function(duration) {
                        var self = this,
                            current = self.current,
                            $slide = current.$slide;
                        !self.isClosing && current && ($slide.siblings().css({
                            transform: "",
                            opacity: ""
                        }), $slide.parent().children().removeClass("fancybox-slide--previous fancybox-slide--next"), $.fancybox.animate($slide, {
                            top: 0,
                            left: 0,
                            opacity: 1
                        }, void 0 === duration ? 0 : duration, function() {
                            $slide.css({
                                transform: "",
                                opacity: ""
                            }), current.isComplete || self.complete()
                        }, !1))
                    },
                    isMoved: function(slide) {
                        var slidePos, stagePos, current = slide || this.current;
                        return !!current && (stagePos = $.fancybox.getTranslate(this.$refs.stage), slidePos = $.fancybox.getTranslate(current.$slide), !current.$slide.hasClass("fancybox-animated") && (Math.abs(slidePos.top - stagePos.top) > .5 || Math.abs(slidePos.left - stagePos.left) > .5))
                    },
                    updateCursor: function(nextWidth, nextHeight) {
                        var canPan, isZoomable, current = this.current,
                            $container = this.$refs.container;
                        current && !this.isClosing && this.Guestures && ($container.removeClass("fancybox-is-zoomable fancybox-can-zoomIn fancybox-can-zoomOut fancybox-can-swipe fancybox-can-pan"), isZoomable = !!(canPan = this.canPan(nextWidth, nextHeight)) || this.isZoomable(), $container.toggleClass("fancybox-is-zoomable", isZoomable), $("[data-fancybox-zoom]").prop("disabled", !isZoomable), canPan ? $container.addClass("fancybox-can-pan") : isZoomable && ("zoom" === current.opts.clickContent || $.isFunction(current.opts.clickContent) && "zoom" == current.opts.clickContent(current)) ? $container.addClass("fancybox-can-zoomIn") : current.opts.touch && (current.opts.touch.vertical || this.group.length > 1) && "video" !== current.contentType && $container.addClass("fancybox-can-swipe"))
                    },
                    isZoomable: function() {
                        var fitPos, current = this.current;
                        if (current && !this.isClosing && "image" === current.type && !current.hasError) {
                            if (!current.isLoaded) return !0;
                            if ((fitPos = this.getFitPos(current)) && (current.width > fitPos.width || current.height > fitPos.height)) return !0
                        }
                        return !1
                    },
                    isScaledDown: function(nextWidth, nextHeight) {
                        var rez = !1,
                            current = this.current,
                            $content = current.$content;
                        return void 0 !== nextWidth && void 0 !== nextHeight ? rez = nextWidth < current.width && nextHeight < current.height : $content && (rez = (rez = $.fancybox.getTranslate($content)).width < current.width && rez.height < current.height), rez
                    },
                    canPan: function(nextWidth, nextHeight) {
                        var current = this.current,
                            pos = null,
                            rez = !1;
                        return "image" === current.type && (current.isComplete || nextWidth && nextHeight) && !current.hasError && (rez = this.getFitPos(current), void 0 !== nextWidth && void 0 !== nextHeight ? pos = {
                            width: nextWidth,
                            height: nextHeight
                        } : current.isComplete && (pos = $.fancybox.getTranslate(current.$content)), pos && rez && (rez = Math.abs(pos.width - rez.width) > 1.5 || Math.abs(pos.height - rez.height) > 1.5)), rez
                    },
                    loadSlide: function(slide) {
                        var type, $slide, ajaxLoad, self = this;
                        if (!slide.isLoading && !slide.isLoaded) {
                            if (slide.isLoading = !0, !1 === self.trigger("beforeLoad", slide)) return slide.isLoading = !1, !1;
                            switch (type = slide.type, ($slide = slide.$slide).off("refresh").trigger("onReset").addClass(slide.opts.slideClass), type) {
                                case "image":
                                    self.setImage(slide);
                                    break;
                                case "iframe":
                                    self.setIframe(slide);
                                    break;
                                case "html":
                                    self.setContent(slide, slide.src || slide.content);
                                    break;
                                case "video":
                                    self.setContent(slide, slide.opts.video.tpl.replace(/\{\{src\}\}/gi, slide.src).replace("{{format}}", slide.opts.videoFormat || slide.opts.video.format || "").replace("{{poster}}", slide.thumb || ""));
                                    break;
                                case "inline":
                                    $(slide.src).length ? self.setContent(slide, $(slide.src)) : self.setError(slide);
                                    break;
                                case "ajax":
                                    self.showLoading(slide), ajaxLoad = $.ajax($.extend({}, slide.opts.ajax.settings, {
                                        url: slide.src,
                                        success: function(data, textStatus) {
                                            "success" === textStatus && self.setContent(slide, data)
                                        },
                                        error: function(jqXHR, textStatus) {
                                            jqXHR && "abort" !== textStatus && self.setError(slide)
                                        }
                                    })), $slide.one("onReset", function() {
                                        ajaxLoad.abort()
                                    });
                                    break;
                                default:
                                    self.setError(slide)
                            }
                            return !0
                        }
                    },
                    setImage: function(slide) {
                        var ghost, self = this;
                        setTimeout(function() {
                            var $img = slide.$image;
                            self.isClosing || !slide.isLoading || $img && $img.length && $img[0].complete || slide.hasError || self.showLoading(slide)
                        }, 50), self.checkSrcset(slide), slide.$content = $('<div class="fancybox-content"></div>').addClass("fancybox-is-hidden").appendTo(slide.$slide.addClass("fancybox-slide--image")), !1 !== slide.opts.preload && slide.opts.width && slide.opts.height && slide.thumb && (slide.width = slide.opts.width, slide.height = slide.opts.height, (ghost = document.createElement("img")).onerror = function() {
                            $(this).remove(), slide.$ghost = null
                        }, ghost.onload = function() {
                            self.afterLoad(slide)
                        }, slide.$ghost = $(ghost).addClass("fancybox-image").appendTo(slide.$content).attr("src", slide.thumb)), self.setBigImage(slide)
                    },
                    checkSrcset: function(slide) {
                        var found, temp, pxRatio, windowWidth, srcset = slide.opts.srcset || slide.opts.image.srcset;
                        if (srcset) {
                            pxRatio = window.devicePixelRatio || 1, windowWidth = window.innerWidth * pxRatio, (temp = srcset.split(",").map(function(el) {
                                var ret = {};
                                return el.trim().split(/\s+/).forEach(function(el, i) {
                                    var value = parseInt(el.substring(0, el.length - 1), 10);
                                    if (0 === i) return ret.url = el;
                                    value && (ret.value = value, ret.postfix = el[el.length - 1])
                                }), ret
                            })).sort(function(a, b) {
                                return a.value - b.value
                            });
                            for (var j = 0; j < temp.length; j++) {
                                var el = temp[j];
                                if ("w" === el.postfix && el.value >= windowWidth || "x" === el.postfix && el.value >= pxRatio) {
                                    found = el;
                                    break
                                }
                            }!found && temp.length && (found = temp[temp.length - 1]), found && (slide.src = found.url, slide.width && slide.height && "w" == found.postfix && (slide.height = slide.width / slide.height * found.value, slide.width = found.value), slide.opts.srcset = srcset)
                        }
                    },
                    setBigImage: function(slide) {
                        var self = this,
                            img = document.createElement("img"),
                            $img = $(img);
                        slide.$image = $img.one("error", function() {
                            self.setError(slide)
                        }).one("load", function() {
                            var sizes;
                            slide.$ghost || (self.resolveImageSlideSize(slide, this.naturalWidth, this.naturalHeight), self.afterLoad(slide)), self.isClosing || (slide.opts.srcset && ((sizes = slide.opts.sizes) && "auto" !== sizes || (sizes = (slide.width / slide.height > 1 && $W.width() / $W.height() > 1 ? "100" : Math.round(slide.width / slide.height * 100)) + "vw"), $img.attr("sizes", sizes).attr("srcset", slide.opts.srcset)), slide.$ghost && setTimeout(function() {
                                slide.$ghost && !self.isClosing && slide.$ghost.hide()
                            }, Math.min(300, Math.max(1e3, slide.height / 1600))), self.hideLoading(slide))
                        }).addClass("fancybox-image").attr("src", slide.src).appendTo(slide.$content), (img.complete || "complete" == img.readyState) && $img.naturalWidth && $img.naturalHeight ? $img.trigger("load") : img.error && $img.trigger("error")
                    },
                    resolveImageSlideSize: function(slide, imgWidth, imgHeight) {
                        var maxWidth = parseInt(slide.opts.width, 10),
                            maxHeight = parseInt(slide.opts.height, 10);
                        slide.width = imgWidth, slide.height = imgHeight, maxWidth > 0 && (slide.width = maxWidth, slide.height = Math.floor(maxWidth * imgHeight / imgWidth)), maxHeight > 0 && (slide.width = Math.floor(maxHeight * imgWidth / imgHeight), slide.height = maxHeight)
                    },
                    setIframe: function(slide) {
                        var $iframe, self = this,
                            opts = slide.opts.iframe,
                            $slide = slide.$slide;
                        slide.$content = $('<div class="fancybox-content' + (opts.preload ? " fancybox-is-hidden" : "") + '"></div>').css(opts.css).appendTo($slide), $slide.addClass("fancybox-slide--" + slide.contentType), slide.$iframe = $iframe = $(opts.tpl.replace(/\{rnd\}/g, (new Date).getTime())).attr(opts.attr).appendTo(slide.$content), opts.preload ? (self.showLoading(slide), $iframe.on("load.fb error.fb", function(e) {
                            this.isReady = 1, slide.$slide.trigger("refresh"), self.afterLoad(slide)
                        }), $slide.on("refresh.fb", function() {
                            var $body, $content = slide.$content,
                                frameWidth = opts.css.width,
                                frameHeight = opts.css.height;
                            if (1 === $iframe[0].isReady) {
                                try {
                                    $body = $iframe.contents().find("body")
                                } catch (ignore) {}
                                $body && $body.length && $body.children().length && ($slide.css("overflow", "visible"), $content.css({
                                    width: "100%",
                                    "max-width": "100%",
                                    height: "9999px"
                                }), void 0 === frameWidth && (frameWidth = Math.ceil(Math.max($body[0].clientWidth, $body.outerWidth(!0)))), $content.css("width", frameWidth || "").css("max-width", ""), void 0 === frameHeight && (frameHeight = Math.ceil(Math.max($body[0].clientHeight, $body.outerHeight(!0)))), $content.css("height", frameHeight || ""), $slide.css("overflow", "auto")), $content.removeClass("fancybox-is-hidden")
                            }
                        })) : self.afterLoad(slide), $iframe.attr("src", slide.src), $slide.one("onReset", function() {
                            try {
                                $(this).find("iframe").hide().unbind().attr("src", "//about:blank")
                            } catch (ignore) {}
                            $(this).off("refresh.fb").empty(), slide.isLoaded = !1, slide.isRevealed = !1
                        })
                    },
                    setContent: function(slide, content) {
                        var obj;
                        this.isClosing || (this.hideLoading(slide), slide.$content && $.fancybox.stop(slide.$content), slide.$slide.empty(), (obj = content) && obj.hasOwnProperty && obj instanceof $ && content.parent().length ? ((content.hasClass("fancybox-content") || content.parent().hasClass("fancybox-content")) && content.parents(".fancybox-slide").trigger("onReset"), slide.$placeholder = $("<div>").hide().insertAfter(content), content.css("display", "inline-block")) : slide.hasError || ("string" === $.type(content) && (content = $("<div>").append($.trim(content)).contents()), slide.opts.filter && (content = $("<div>").html(content).find(slide.opts.filter))), slide.$slide.one("onReset", function() {
                            $(this).find("video,audio").trigger("pause"), slide.$placeholder && (slide.$placeholder.after(content.removeClass("fancybox-content").hide()).remove(), slide.$placeholder = null), slide.$smallBtn && (slide.$smallBtn.remove(), slide.$smallBtn = null), slide.hasError || ($(this).empty(), slide.isLoaded = !1, slide.isRevealed = !1)
                        }), $(content).appendTo(slide.$slide), $(content).is("video,audio") && ($(content).addClass("fancybox-video"), $(content).wrap("<div></div>"), slide.contentType = "video", slide.opts.width = slide.opts.width || $(content).attr("width"), slide.opts.height = slide.opts.height || $(content).attr("height")), slide.$content = slide.$slide.children().filter("div,form,main,video,audio,article,.fancybox-content").first(), slide.$content.siblings().hide(), slide.$content.length || (slide.$content = slide.$slide.wrapInner("<div></div>").children().first()), slide.$content.addClass("fancybox-content"), slide.$slide.addClass("fancybox-slide--" + slide.contentType), this.afterLoad(slide))
                    },
                    setError: function(slide) {
                        slide.hasError = !0, slide.$slide.trigger("onReset").removeClass("fancybox-slide--" + slide.contentType).addClass("fancybox-slide--error"), slide.contentType = "html", this.setContent(slide, this.translate(slide, slide.opts.errorTpl)), slide.pos === this.currPos && (this.isAnimating = !1)
                    },
                    showLoading: function(slide) {
                        (slide = slide || this.current) && !slide.$spinner && (slide.$spinner = $(this.translate(this, this.opts.spinnerTpl)).appendTo(slide.$slide).hide().fadeIn("fast"))
                    },
                    hideLoading: function(slide) {
                        (slide = slide || this.current) && slide.$spinner && (slide.$spinner.stop().remove(), delete slide.$spinner)
                    },
                    afterLoad: function(slide) {
                        this.isClosing || (slide.isLoading = !1, slide.isLoaded = !0, this.trigger("afterLoad", slide), this.hideLoading(slide), !slide.opts.smallBtn || slide.$smallBtn && slide.$smallBtn.length || (slide.$smallBtn = $(this.translate(slide, slide.opts.btnTpl.smallBtn)).appendTo(slide.$content)), slide.opts.protect && slide.$content && !slide.hasError && (slide.$content.on("contextmenu.fb", function(e) {
                            return 2 == e.button && e.preventDefault(), !0
                        }), "image" === slide.type && $('<div class="fancybox-spaceball"></div>').appendTo(slide.$content)), this.adjustCaption(slide), this.adjustLayout(slide), slide.pos === this.currPos && this.updateCursor(), this.revealContent(slide))
                    },
                    adjustCaption: function(slide) {
                        var $clone, current = slide || this.current,
                            caption = current.opts.caption,
                            preventOverlap = current.opts.preventCaptionOverlap,
                            $caption = this.$refs.caption,
                            captionH = !1;
                        $caption.toggleClass("fancybox-caption--separate", preventOverlap), preventOverlap && caption && caption.length && (current.pos !== this.currPos ? (($clone = $caption.clone().appendTo($caption.parent())).children().eq(0).empty().html(caption), captionH = $clone.outerHeight(!0), $clone.empty().remove()) : this.$caption && (captionH = this.$caption.outerHeight(!0)), current.$slide.css("padding-bottom", captionH || ""))
                    },
                    adjustLayout: function(slide) {
                        var scrollHeight, marginBottom, inlinePadding, actualPadding, current = slide || this.current;
                        current.isLoaded && !0 !== current.opts.disableLayoutFix && (current.$content.css("margin-bottom", ""), current.$content.outerHeight() > current.$slide.height() + .5 && (inlinePadding = current.$slide[0].style["padding-bottom"], actualPadding = current.$slide.css("padding-bottom"), parseFloat(actualPadding) > 0 && (scrollHeight = current.$slide[0].scrollHeight, current.$slide.css("padding-bottom", 0), Math.abs(scrollHeight - current.$slide[0].scrollHeight) < 1 && (marginBottom = actualPadding), current.$slide.css("padding-bottom", inlinePadding))), current.$content.css("margin-bottom", marginBottom))
                    },
                    revealContent: function(slide) {
                        var effect, effectClassName, duration, opacity, self = this,
                            $slide = slide.$slide,
                            end = !1,
                            start = !1,
                            isMoved = self.isMoved(slide),
                            isRevealed = slide.isRevealed;
                        return slide.isRevealed = !0, effect = slide.opts[self.firstRun ? "animationEffect" : "transitionEffect"], duration = slide.opts[self.firstRun ? "animationDuration" : "transitionDuration"], duration = parseInt(void 0 === slide.forcedDuration ? duration : slide.forcedDuration, 10), !isMoved && slide.pos === self.currPos && duration || (effect = !1), "zoom" === effect && (slide.pos === self.currPos && duration && "image" === slide.type && !slide.hasError && (start = self.getThumbPos(slide)) ? end = self.getFitPos(slide) : effect = "fade"), "zoom" === effect ? (self.isAnimating = !0, end.scaleX = end.width / start.width, end.scaleY = end.height / start.height, "auto" == (opacity = slide.opts.zoomOpacity) && (opacity = Math.abs(slide.width / slide.height - start.width / start.height) > .1), opacity && (start.opacity = .1, end.opacity = 1), $.fancybox.setTranslate(slide.$content.removeClass("fancybox-is-hidden"), start), forceRedraw(slide.$content), void $.fancybox.animate(slide.$content, end, duration, function() {
                            self.isAnimating = !1, self.complete()
                        })) : (self.updateSlide(slide), effect ? ($.fancybox.stop($slide), effectClassName = "fancybox-slide--" + (slide.pos >= self.prevPos ? "next" : "previous") + " fancybox-animated fancybox-fx-" + effect, $slide.addClass(effectClassName).removeClass("fancybox-slide--current"), slide.$content.removeClass("fancybox-is-hidden"), forceRedraw($slide), "image" !== slide.type && slide.$content.hide().show(0), void $.fancybox.animate($slide, "fancybox-slide--current", duration, function() {
                            $slide.removeClass(effectClassName).css({
                                transform: "",
                                opacity: ""
                            }), slide.pos === self.currPos && self.complete()
                        }, !0)) : (slide.$content.removeClass("fancybox-is-hidden"), isRevealed || !isMoved || "image" !== slide.type || slide.hasError || slide.$content.hide().fadeIn("fast"), void(slide.pos === self.currPos && self.complete())))
                    },
                    getThumbPos: function(slide) {
                        var rez, thumbPos, btw, brw, bbw, blw, $thumb = slide.$thumb;
                        return !(!$thumb || ! function(elem) {
                            var elemCenter, rez;
                            return !(!elem || elem.ownerDocument !== document) && ($(".fancybox-container").css("pointer-events", "none"), elemCenter = {
                                x: elem.getBoundingClientRect().left + elem.offsetWidth / 2,
                                y: elem.getBoundingClientRect().top + elem.offsetHeight / 2
                            }, rez = document.elementFromPoint(elemCenter.x, elemCenter.y) === elem, $(".fancybox-container").css("pointer-events", ""), rez)
                        }($thumb[0])) && (thumbPos = $.fancybox.getTranslate($thumb), btw = parseFloat($thumb.css("border-top-width") || 0), brw = parseFloat($thumb.css("border-right-width") || 0), bbw = parseFloat($thumb.css("border-bottom-width") || 0), blw = parseFloat($thumb.css("border-left-width") || 0), rez = {
                            top: thumbPos.top + btw,
                            left: thumbPos.left + blw,
                            width: thumbPos.width - brw - blw,
                            height: thumbPos.height - btw - bbw,
                            scaleX: 1,
                            scaleY: 1
                        }, thumbPos.width > 0 && thumbPos.height > 0 && rez)
                    },
                    complete: function() {
                        var $el, self = this,
                            current = self.current,
                            slides = {};
                        !self.isMoved() && current.isLoaded && (current.isComplete || (current.isComplete = !0, current.$slide.siblings().trigger("onReset"), self.preload("inline"), forceRedraw(current.$slide), current.$slide.addClass("fancybox-slide--complete"), $.each(self.slides, function(key, slide) {
                            slide.pos >= self.currPos - 1 && slide.pos <= self.currPos + 1 ? slides[slide.pos] = slide : slide && ($.fancybox.stop(slide.$slide), slide.$slide.off().remove())
                        }), self.slides = slides), self.isAnimating = !1, self.updateCursor(), self.trigger("afterShow"), current.opts.video.autoStart && current.$slide.find("video,audio").filter(":visible:first").trigger("play").one("ended", function() {
                            Document.exitFullscreen ? Document.exitFullscreen() : this.webkitExitFullscreen && this.webkitExitFullscreen(), self.next()
                        }), current.opts.autoFocus && "html" === current.contentType && (($el = current.$content.find("input[autofocus]:enabled:visible:first")).length ? $el.trigger("focus") : self.focus(null, !0)), current.$slide.scrollTop(0).scrollLeft(0))
                    },
                    preload: function(type) {
                        var prev, next;
                        this.group.length < 2 || (next = this.slides[this.currPos + 1], (prev = this.slides[this.currPos - 1]) && prev.type === type && this.loadSlide(prev), next && next.type === type && this.loadSlide(next))
                    },
                    focus: function(e, firstRun) {
                        var focusableItems, focusedItemIndex, focusableStr = ["a[href]", "area[href]", 'input:not([disabled]):not([type="hidden"]):not([aria-hidden])', "select:not([disabled]):not([aria-hidden])", "textarea:not([disabled]):not([aria-hidden])", "button:not([disabled]):not([aria-hidden])", "iframe", "object", "embed", "video", "audio", "[contenteditable]", '[tabindex]:not([tabindex^="-"])'].join(",");
                        this.isClosing || ((focusableItems = (focusableItems = !e && this.current && this.current.isComplete ? this.current.$slide.find("*:visible" + (firstRun ? ":not(.fancybox-close-small)" : "")) : this.$refs.container.find("*:visible")).filter(focusableStr).filter(function() {
                            return "hidden" !== $(this).css("visibility") && !$(this).hasClass("disabled")
                        })).length ? (focusedItemIndex = focusableItems.index(document.activeElement), e && e.shiftKey ? (focusedItemIndex < 0 || 0 == focusedItemIndex) && (e.preventDefault(), focusableItems.eq(focusableItems.length - 1).trigger("focus")) : (focusedItemIndex < 0 || focusedItemIndex == focusableItems.length - 1) && (e && e.preventDefault(), focusableItems.eq(0).trigger("focus"))) : this.$refs.container.trigger("focus"))
                    },
                    activate: function() {
                        var self = this;
                        $(".fancybox-container").each(function() {
                            var instance = $(this).data("FancyBox");
                            instance && instance.id !== self.id && !instance.isClosing && (instance.trigger("onDeactivate"), instance.removeEvents(), instance.isVisible = !1)
                        }), self.isVisible = !0, (self.current || self.isIdle) && (self.update(), self.updateControls()), self.trigger("onActivate"), self.addEvents()
                    },
                    close: function(e, d) {
                        var effect, duration, $content, domRect, opacity, start, end, self = this,
                            current = self.current,
                            done = function() {
                                self.cleanUp(e)
                            };
                        return !self.isClosing && (self.isClosing = !0, !1 === self.trigger("beforeClose", e) ? (self.isClosing = !1, requestAFrame(function() {
                            self.update()
                        }), !1) : (self.removeEvents(), $content = current.$content, effect = current.opts.animationEffect, duration = $.isNumeric(d) ? d : effect ? current.opts.animationDuration : 0, current.$slide.removeClass("fancybox-slide--complete fancybox-slide--next fancybox-slide--previous fancybox-animated"), !0 !== e ? $.fancybox.stop(current.$slide) : effect = !1, current.$slide.siblings().trigger("onReset").remove(), duration && self.$refs.container.removeClass("fancybox-is-open").addClass("fancybox-is-closing").css("transition-duration", duration + "ms"), self.hideLoading(current), self.hideControls(!0), self.updateCursor(), "zoom" !== effect || $content && duration && "image" === current.type && !self.isMoved() && !current.hasError && (end = self.getThumbPos(current)) || (effect = "fade"), "zoom" === effect ? ($.fancybox.stop($content), start = {
                            top: (domRect = $.fancybox.getTranslate($content)).top,
                            left: domRect.left,
                            scaleX: domRect.width / end.width,
                            scaleY: domRect.height / end.height,
                            width: end.width,
                            height: end.height
                        }, "auto" == (opacity = current.opts.zoomOpacity) && (opacity = Math.abs(current.width / current.height - end.width / end.height) > .1), opacity && (end.opacity = 0), $.fancybox.setTranslate($content, start), forceRedraw($content), $.fancybox.animate($content, end, duration, done), !0) : (effect && duration ? $.fancybox.animate(current.$slide.addClass("fancybox-slide--previous").removeClass("fancybox-slide--current"), "fancybox-animated fancybox-fx-" + effect, duration, done) : !0 === e ? setTimeout(done, duration) : done(), !0)))
                    },
                    cleanUp: function(e) {
                        var instance, x, y, $focus = this.current.opts.$orig;
                        this.current.$slide.trigger("onReset"), this.$refs.container.empty().remove(), this.trigger("afterClose", e), this.current.opts.backFocus && ($focus && $focus.length && $focus.is(":visible") || ($focus = this.$trigger), $focus && $focus.length && (x = window.scrollX, y = window.scrollY, $focus.trigger("focus"), $("html, body").scrollTop(y).scrollLeft(x))), this.current = null, (instance = $.fancybox.getInstance()) ? instance.activate() : ($("body").removeClass("fancybox-active compensate-for-scrollbar"), $("#fancybox-style-noscroll").remove())
                    },
                    trigger: function(name, slide) {
                        var rez, args = Array.prototype.slice.call(arguments, 1),
                            self = this,
                            obj = slide && slide.opts ? slide : self.current;
                        if (obj ? args.unshift(obj) : obj = self, args.unshift(self), $.isFunction(obj.opts[name]) && (rez = obj.opts[name].apply(obj, args)), !1 === rez) return rez;
                        "afterClose" !== name && self.$refs ? self.$refs.container.trigger(name + ".fb", args) : $D.trigger(name + ".fb", args)
                    },
                    updateControls: function() {
                        var current = this.current,
                            index = current.index,
                            $container = this.$refs.container,
                            $caption = this.$refs.caption,
                            caption = current.opts.caption;
                        current.$slide.trigger("refresh"), caption && caption.length ? (this.$caption = $caption, $caption.children().eq(0).html(caption)) : this.$caption = null, this.hasHiddenControls || this.isIdle || this.showControls(), $container.find("[data-fancybox-count]").html(this.group.length), $container.find("[data-fancybox-index]").html(index + 1), $container.find("[data-fancybox-prev]").prop("disabled", !current.opts.loop && index <= 0), $container.find("[data-fancybox-next]").prop("disabled", !current.opts.loop && index >= this.group.length - 1), "image" === current.type ? $container.find("[data-fancybox-zoom]").show().end().find("[data-fancybox-download]").attr("href", current.opts.image.src || current.src).show() : current.opts.toolbar && $container.find("[data-fancybox-download],[data-fancybox-zoom]").hide(), $(document.activeElement).is(":hidden,[disabled]") && this.$refs.container.trigger("focus")
                    },
                    hideControls: function(andCaption) {
                        var arr = ["infobar", "toolbar", "nav"];
                        !andCaption && this.current.opts.preventCaptionOverlap || arr.push("caption"), this.$refs.container.removeClass(arr.map(function(i) {
                            return "fancybox-show-" + i
                        }).join(" ")), this.hasHiddenControls = !0
                    },
                    showControls: function() {
                        var opts = this.current ? this.current.opts : this.opts,
                            $container = this.$refs.container;
                        this.hasHiddenControls = !1, this.idleSecondsCounter = 0, $container.toggleClass("fancybox-show-toolbar", !(!opts.toolbar || !opts.buttons)).toggleClass("fancybox-show-infobar", !!(opts.infobar && this.group.length > 1)).toggleClass("fancybox-show-caption", !!this.$caption).toggleClass("fancybox-show-nav", !!(opts.arrows && this.group.length > 1)).toggleClass("fancybox-is-modal", !!opts.modal)
                    },
                    toggleControls: function() {
                        this.hasHiddenControls ? this.showControls() : this.hideControls()
                    }
                }), $.fancybox = {
                    version: "3.5.7",
                    defaults: defaults,
                    getInstance: function(command) {
                        var instance = $('.fancybox-container:not(".fancybox-is-closing"):last').data("FancyBox"),
                            args = Array.prototype.slice.call(arguments, 1);
                        return instance instanceof FancyBox && ("string" === $.type(command) ? instance[command].apply(instance, args) : "function" === $.type(command) && command.apply(instance, args), instance)
                    },
                    open: function(items, opts, index) {
                        return new FancyBox(items, opts, index)
                    },
                    close: function(all) {
                        var instance = this.getInstance();
                        instance && (instance.close(), !0 === all && this.close(all))
                    },
                    destroy: function() {
                        this.close(!0), $D.add("body").off("click.fb-start", "**")
                    },
                    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
                    use3d: (div = document.createElement("div"), window.getComputedStyle && window.getComputedStyle(div) && window.getComputedStyle(div).getPropertyValue("transform") && !(document.documentMode && document.documentMode < 11)),
                    getTranslate: function($el) {
                        var domRect;
                        return !(!$el || !$el.length) && {
                            top: (domRect = $el[0].getBoundingClientRect()).top || 0,
                            left: domRect.left || 0,
                            width: domRect.width,
                            height: domRect.height,
                            opacity: parseFloat($el.css("opacity"))
                        }
                    },
                    setTranslate: function($el, props) {
                        var str = "",
                            css = {};
                        if ($el && props) return void 0 === props.left && void 0 === props.top || (str = (void 0 === props.left ? $el.position().left : props.left) + "px, " + (void 0 === props.top ? $el.position().top : props.top) + "px", str = this.use3d ? "translate3d(" + str + ", 0px)" : "translate(" + str + ")"), void 0 !== props.scaleX && void 0 !== props.scaleY ? str += " scale(" + props.scaleX + ", " + props.scaleY + ")" : void 0 !== props.scaleX && (str += " scaleX(" + props.scaleX + ")"), str.length && (css.transform = str), void 0 !== props.opacity && (css.opacity = props.opacity), void 0 !== props.width && (css.width = props.width), void 0 !== props.height && (css.height = props.height), $el.css(css)
                    },
                    animate: function($el, to, duration, callback, leaveAnimationName) {
                        var from, self = this;
                        $.isFunction(duration) && (callback = duration, duration = null), self.stop($el), from = self.getTranslate($el), $el.on(transitionEnd, function(e) {
                            (!e || !e.originalEvent || $el.is(e.originalEvent.target) && "z-index" != e.originalEvent.propertyName) && (self.stop($el), $.isNumeric(duration) && $el.css("transition-duration", ""), $.isPlainObject(to) ? void 0 !== to.scaleX && void 0 !== to.scaleY && self.setTranslate($el, {
                                top: to.top,
                                left: to.left,
                                width: from.width * to.scaleX,
                                height: from.height * to.scaleY,
                                scaleX: 1,
                                scaleY: 1
                            }) : !0 !== leaveAnimationName && $el.removeClass(to), $.isFunction(callback) && callback(e))
                        }), $.isNumeric(duration) && $el.css("transition-duration", duration + "ms"), $.isPlainObject(to) ? (void 0 !== to.scaleX && void 0 !== to.scaleY && (delete to.width, delete to.height, $el.parent().hasClass("fancybox-slide--image") && $el.parent().addClass("fancybox-is-scaling")), $.fancybox.setTranslate($el, to)) : $el.addClass(to), $el.data("timer", setTimeout(function() {
                            $el.trigger(transitionEnd)
                        }, duration + 33))
                    },
                    stop: function($el, callCallback) {
                        $el && $el.length && (clearTimeout($el.data("timer")), callCallback && $el.trigger(transitionEnd), $el.off(transitionEnd).css("transition-duration", ""), $el.parent().removeClass("fancybox-is-scaling"))
                    }
                }, $.fn.fancybox = function(options) {
                    var selector;
                    return (selector = (options = options || {}).selector || !1) ? $("body").off("click.fb-start", selector).on("click.fb-start", selector, {
                        options: options
                    }, _run) : this.off("click.fb-start").on("click.fb-start", {
                        items: this,
                        options: options
                    }, _run), this
                }, $D.on("click.fb-start", "[data-fancybox]", _run), $D.on("click.fb-start", "[data-fancybox-trigger]", function(e) {
                    $('[data-fancybox="' + $(this).attr("data-fancybox-trigger") + '"]').eq($(this).attr("data-fancybox-index") || 0).trigger("click.fb-start", {
                        $trigger: $(this)
                    })
                }), $pressed = null, $D.on("mousedown mouseup focus blur", ".fancybox-button", function(e) {
                    switch (e.type) {
                        case "mousedown":
                            $pressed = $(this);
                            break;
                        case "mouseup":
                            $pressed = null;
                            break;
                        case "focusin":
                            $(".fancybox-button").removeClass("fancybox-focus"), $(this).is($pressed) || $(this).is("[disabled]") || $(this).addClass("fancybox-focus");
                            break;
                        case "focusout":
                            $(".fancybox-button").removeClass("fancybox-focus")
                    }
                })
            }
        function _run(e, opts) {
            var $target, value, instance, items = [],
                index = 0;
            e && e.isDefaultPrevented() || (e.preventDefault(), opts = opts || {}, e && e.data && (opts = mergeOpts(e.data.options, opts)), $target = opts.$target || $(e.currentTarget).trigger("blur"), (instance = $.fancybox.getInstance()) && instance.$trigger && instance.$trigger.is($target) || (items = opts.selector ? $(opts.selector) : (value = $target.attr("data-fancybox") || "") ? (items = e.data ? e.data.items : []).length ? items.filter('[data-fancybox="' + value + '"]') : $('[data-fancybox="' + value + '"]') : [$target], (index = $(items).index($target)) < 0 && (index = 0), (instance = $.fancybox.open(items, opts, index)).$trigger = $target))
        }
    }(window, document, jQuery),
    function($) {
        "use strict";
        var defaults = {
                youtube: {
                    matcher: /(youtube\.com|youtu\.be|youtube\-nocookie\.com)\/(watch\?(.*&)?v=|v\/|u\/|embed\/?)?(videoseries\?list=(.*)|[\w-]{11}|\?listType=(.*)&list=(.*))(.*)/i,
                    params: {
                        autoplay: 1,
                        autohide: 1,
                        fs: 1,
                        rel: 0,
                        hd: 1,
                        wmode: "transparent",
                        enablejsapi: 1,
                        html5: 1
                    },
                    paramPlace: 8,
                    type: "iframe",
                    url: "https://www.youtube-nocookie.com/embed/$4",
                    thumb: "https://img.youtube.com/vi/$4/hqdefault.jpg"
                },
                vimeo: {
                    matcher: /^.+vimeo.com\/(.*\/)?([\d]+)(.*)?/,
                    params: {
                        autoplay: 1,
                        hd: 1,
                        show_title: 1,
                        show_byline: 1,
                        show_portrait: 0,
                        fullscreen: 1
                    },
                    paramPlace: 3,
                    type: "iframe",
                    url: "//player.vimeo.com/video/$2"
                },
                instagram: {
                    matcher: /(instagr\.am|instagram\.com)\/p\/([a-zA-Z0-9_\-]+)\/?/i,
                    type: "image",
                    url: "//$1/p/$2/media/?size=l"
                },
                gmap_place: {
                    matcher: /(maps\.)?google\.([a-z]{2,3}(\.[a-z]{2})?)\/(((maps\/(place\/(.*)\/)?\@(.*),(\d+.?\d+?)z))|(\?ll=))(.*)?/i,
                    type: "iframe",
                    url: function(rez) {
                        return "//maps.google." + rez[2] + "/?ll=" + (rez[9] ? rez[9] + "&z=" + Math.floor(rez[10]) + (rez[12] ? rez[12].replace(/^\//, "&") : "") : rez[12] + "").replace(/\?/, "&") + "&output=" + (rez[12] && rez[12].indexOf("layer=c") > 0 ? "svembed" : "embed")
                    }
                },
                gmap_search: {
                    matcher: /(maps\.)?google\.([a-z]{2,3}(\.[a-z]{2})?)\/(maps\/search\/)(.*)/i,
                    type: "iframe",
                    url: function(rez) {
                        return "//maps.google." + rez[2] + "/maps?q=" + rez[5].replace("query=", "q=").replace("api=1", "") + "&output=embed"
                    }
                }
            },
            format = function(url, rez, params) {
                if (url) return params = params || "", "object" === $.type(params) && (params = $.param(params, !0)), $.each(rez, function(key, value) {
                    url = url.replace("$" + key, value || "")
                }), params.length && (url += (url.indexOf("?") > 0 ? "&" : "?") + params), url
            };
        $(document).on("objectNeedsType.fb", function(e, instance, item) {
            var media, thumb, rez, params, urlParams, paramObj, provider, url = item.src || "",
                type = !1;
            media = $.extend(!0, {}, defaults, item.opts.media), $.each(media, function(providerName, providerOpts) {
                if (rez = url.match(providerOpts.matcher)) {
                    if (type = providerOpts.type, provider = providerName, paramObj = {}, providerOpts.paramPlace && rez[providerOpts.paramPlace]) {
                        "?" == (urlParams = rez[providerOpts.paramPlace])[0] && (urlParams = urlParams.substring(1)), urlParams = urlParams.split("&");
                        for (var m = 0; m < urlParams.length; ++m) {
                            var p = urlParams[m].split("=", 2);
                            2 == p.length && (paramObj[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " ")))
                        }
                    }
                    return params = $.extend(!0, {}, providerOpts.params, item.opts[providerName], paramObj), url = "function" === $.type(providerOpts.url) ? providerOpts.url.call(this, rez, params, item) : format(providerOpts.url, rez, params), thumb = "function" === $.type(providerOpts.thumb) ? providerOpts.thumb.call(this, rez, params, item) : format(providerOpts.thumb, rez), "youtube" === providerName ? url = url.replace(/&t=((\d+)m)?(\d+)s/, function(match, p1, m, s) {
                        return "&start=" + ((m ? 60 * parseInt(m, 10) : 0) + parseInt(s, 10))
                    }) : "vimeo" === providerName && (url = url.replace("&%23", "#")), !1
                }
            }), type ? (item.opts.thumb || item.opts.$thumb && item.opts.$thumb.length || (item.opts.thumb = thumb), "iframe" === type && (item.opts = $.extend(!0, item.opts, {
                iframe: {
                    preload: !1,
                    attr: {
                        scrolling: "no"
                    }
                }
            })), $.extend(item, {
                type: type,
                src: url,
                origSrc: item.src,
                contentSource: provider,
                contentType: "image" === type ? "image" : "gmap_place" == provider || "gmap_search" == provider ? "map" : "video"
            })) : url && (item.type = item.opts.defaultType)
        });
        var VideoAPILoader = {
            youtube: {
                src: "https://www.youtube.com/iframe_api",
                class: "YT",
                loading: !1,
                loaded: !1
            },
            vimeo: {
                src: "https://player.vimeo.com/api/player.js",
                class: "Vimeo",
                loading: !1,
                loaded: !1
            },
            load: function(vendor) {
                var script, _this = this;
                this[vendor].loaded ? setTimeout(function() {
                    _this.done(vendor)
                }) : this[vendor].loading || (this[vendor].loading = !0, (script = document.createElement("script")).type = "text/javascript", script.src = this[vendor].src, "youtube" === vendor ? window.onYouTubeIframeAPIReady = function() {
                    _this[vendor].loaded = !0, _this.done(vendor)
                } : script.onload = function() {
                    _this[vendor].loaded = !0, _this.done(vendor)
                }, document.body.appendChild(script))
            },
            done: function(vendor) {
                var instance, $el;
                "youtube" === vendor && delete window.onYouTubeIframeAPIReady, (instance = $.fancybox.getInstance()) && ($el = instance.current.$content.find("iframe"), "youtube" === vendor && void 0 !== YT && YT ? new YT.Player($el.attr("id"), {
                    events: {
                        onStateChange: function(e) {
                            0 == e.data && instance.next()
                        }
                    }
                }) : "vimeo" === vendor && void 0 !== Vimeo && Vimeo && new Vimeo.Player($el).on("ended", function() {
                    instance.next()
                }))
            }
        };
        $(document).on({
            "afterShow.fb": function(e, instance, current) {
                instance.group.length > 1 && ("youtube" === current.contentSource || "vimeo" === current.contentSource) && VideoAPILoader.load(current.contentSource)
            }
        })
    }(jQuery),
    function(window, document, $) {
        "use strict";
        var requestAFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || function(callback) {
                return window.setTimeout(callback, 1e3 / 60)
            },
            cancelAFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.oCancelAnimationFrame || function(id) {
                window.clearTimeout(id)
            },
            getPointerXY = function(e) {
                var result = [];
                for (var key in e = (e = e.originalEvent || e || window.e).touches && e.touches.length ? e.touches : e.changedTouches && e.changedTouches.length ? e.changedTouches : [e]) e[key].pageX ? result.push({
                    x: e[key].pageX,
                    y: e[key].pageY
                }) : e[key].clientX && result.push({
                    x: e[key].clientX,
                    y: e[key].clientY
                });
                return result
            },
            distance = function(point2, point1, what) {
                return point1 && point2 ? "x" === what ? point2.x - point1.x : "y" === what ? point2.y - point1.y : Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)) : 0
            },
            isClickable = function($el) {
                if ($el.is('a,area,button,[role="button"],input,label,select,summary,textarea,video,audio,iframe') || $.isFunction($el.get(0).onclick) || $el.data("selectable")) return !0;
                for (var i = 0, atts = $el[0].attributes, n = atts.length; i < n; i++)
                    if ("data-fancybox-" === atts[i].nodeName.substr(0, 14)) return !0;
                return !1
            },
            isScrollable = function($el) {
                for (var el, overflowY, overflowX, vertical, horizontal, rez = !1; el = $el.get(0), overflowY = void 0, overflowX = void 0, vertical = void 0, horizontal = void 0, overflowY = window.getComputedStyle(el)["overflow-y"], overflowX = window.getComputedStyle(el)["overflow-x"], vertical = ("scroll" === overflowY || "auto" === overflowY) && el.scrollHeight > el.clientHeight, horizontal = ("scroll" === overflowX || "auto" === overflowX) && el.scrollWidth > el.clientWidth, !(rez = vertical || horizontal) && ($el = $el.parent()).length && !$el.hasClass("fancybox-stage") && !$el.is("body"););
                return rez
            },
            Guestures = function(instance) {
                this.instance = instance, this.$bg = instance.$refs.bg, this.$stage = instance.$refs.stage, this.$container = instance.$refs.container, this.destroy(), this.$container.on("touchstart.fb.touch mousedown.fb.touch", $.proxy(this, "ontouchstart"))
            };
        Guestures.prototype.destroy = function() {
            this.$container.off(".fb.touch"), $(document).off(".fb.touch"), this.requestId && (cancelAFrame(this.requestId), this.requestId = null), this.tapped && (clearTimeout(this.tapped), this.tapped = null)
        }, Guestures.prototype.ontouchstart = function(e) {
            var $target = $(e.target),
                instance = this.instance,
                current = instance.current,
                $slide = current.$slide,
                $content = current.$content,
                isTouchDevice = "touchstart" == e.type;
            if (isTouchDevice && this.$container.off("mousedown.fb.touch"), (!e.originalEvent || 2 != e.originalEvent.button) && $slide.length && $target.length && !isClickable($target) && !isClickable($target.parent()) && ($target.is("img") || !(e.originalEvent.clientX > $target[0].clientWidth + $target.offset().left))) {
                if (!current || instance.isAnimating || current.$slide.hasClass("fancybox-animated")) return e.stopPropagation(), void e.preventDefault();
                this.realPoints = this.startPoints = getPointerXY(e), this.startPoints.length && (current.touch && e.stopPropagation(), this.startEvent = e, this.canTap = !0, this.$target = $target, this.$content = $content, this.opts = current.opts.touch, this.isPanning = !1, this.isSwiping = !1, this.isZooming = !1, this.isScrolling = !1, this.canPan = instance.canPan(), this.startTime = (new Date).getTime(), this.distanceX = this.distanceY = this.distance = 0, this.canvasWidth = Math.round($slide[0].clientWidth), this.canvasHeight = Math.round($slide[0].clientHeight), this.contentLastPos = null, this.contentStartPos = $.fancybox.getTranslate(this.$content) || {
                    top: 0,
                    left: 0
                }, this.sliderStartPos = $.fancybox.getTranslate($slide), this.stagePos = $.fancybox.getTranslate(instance.$refs.stage), this.sliderStartPos.top -= this.stagePos.top, this.sliderStartPos.left -= this.stagePos.left, this.contentStartPos.top -= this.stagePos.top, this.contentStartPos.left -= this.stagePos.left, $(document).off(".fb.touch").on(isTouchDevice ? "touchend.fb.touch touchcancel.fb.touch" : "mouseup.fb.touch mouseleave.fb.touch", $.proxy(this, "ontouchend")).on(isTouchDevice ? "touchmove.fb.touch" : "mousemove.fb.touch", $.proxy(this, "ontouchmove")), $.fancybox.isMobile && document.addEventListener("scroll", this.onscroll, !0), ((this.opts || this.canPan) && ($target.is(this.$stage) || this.$stage.find($target).length) || ($target.is(".fancybox-image") && e.preventDefault(), $.fancybox.isMobile && $target.parents(".fancybox-caption").length)) && (this.isScrollable = isScrollable($target) || isScrollable($target.parent()), $.fancybox.isMobile && this.isScrollable || e.preventDefault(), (1 === this.startPoints.length || current.hasError) && (this.canPan ? ($.fancybox.stop(this.$content), this.isPanning = !0) : this.isSwiping = !0, this.$container.addClass("fancybox-is-grabbing")), 2 === this.startPoints.length && "image" === current.type && (current.isLoaded || current.$ghost) && (this.canTap = !1, this.isSwiping = !1, this.isPanning = !1, this.isZooming = !0, $.fancybox.stop(this.$content), this.centerPointStartX = .5 * (this.startPoints[0].x + this.startPoints[1].x) - $(window).scrollLeft(), this.centerPointStartY = .5 * (this.startPoints[0].y + this.startPoints[1].y) - $(window).scrollTop(), this.percentageOfImageAtPinchPointX = (this.centerPointStartX - this.contentStartPos.left) / this.contentStartPos.width, this.percentageOfImageAtPinchPointY = (this.centerPointStartY - this.contentStartPos.top) / this.contentStartPos.height, this.startDistanceBetweenFingers = distance(this.startPoints[0], this.startPoints[1]))))
            }
        }, Guestures.prototype.onscroll = function(e) {
            this.isScrolling = !0, document.removeEventListener("scroll", this.onscroll, !0)
        }, Guestures.prototype.ontouchmove = function(e) {
            void 0 === e.originalEvent.buttons || 0 !== e.originalEvent.buttons ? this.isScrolling ? this.canTap = !1 : (this.newPoints = getPointerXY(e), (this.opts || this.canPan) && this.newPoints.length && this.newPoints.length && (this.isSwiping && !0 === this.isSwiping || e.preventDefault(), this.distanceX = distance(this.newPoints[0], this.startPoints[0], "x"), this.distanceY = distance(this.newPoints[0], this.startPoints[0], "y"), this.distance = distance(this.newPoints[0], this.startPoints[0]), this.distance > 0 && (this.isSwiping ? this.onSwipe(e) : this.isPanning ? this.onPan() : this.isZooming && this.onZoom()))) : this.ontouchend(e)
        }, Guestures.prototype.onSwipe = function(e) {
            var angle, self = this,
                instance = self.instance,
                swiping = self.isSwiping,
                left = self.sliderStartPos.left || 0;
            if (!0 !== swiping) "x" == swiping && (self.distanceX > 0 && (self.instance.group.length < 2 || 0 === self.instance.current.index && !self.instance.current.opts.loop) ? left += Math.pow(self.distanceX, .8) : self.distanceX < 0 && (self.instance.group.length < 2 || self.instance.current.index === self.instance.group.length - 1 && !self.instance.current.opts.loop) ? left -= Math.pow(-self.distanceX, .8) : left += self.distanceX), self.sliderLastPos = {
                top: "x" == swiping ? 0 : self.sliderStartPos.top + self.distanceY,
                left: left
            }, self.requestId && (cancelAFrame(self.requestId), self.requestId = null), self.requestId = requestAFrame(function() {
                self.sliderLastPos && ($.each(self.instance.slides, function(index, slide) {
                    var pos = slide.pos - self.instance.currPos;
                    $.fancybox.setTranslate(slide.$slide, {
                        top: self.sliderLastPos.top,
                        left: self.sliderLastPos.left + pos * self.canvasWidth + pos * slide.opts.gutter
                    })
                }), self.$container.addClass("fancybox-is-sliding"))
            });
            else if (Math.abs(self.distance) > 10) {
                if (self.canTap = !1, instance.group.length < 2 && self.opts.vertical ? self.isSwiping = "y" : instance.isDragging || !1 === self.opts.vertical || "auto" === self.opts.vertical && $(window).width() > 800 ? self.isSwiping = "x" : (angle = Math.abs(180 * Math.atan2(self.distanceY, self.distanceX) / Math.PI), self.isSwiping = angle > 45 && angle < 135 ? "y" : "x"), "y" === self.isSwiping && $.fancybox.isMobile && self.isScrollable) return void(self.isScrolling = !0);
                instance.isDragging = self.isSwiping, self.startPoints = self.newPoints, $.each(instance.slides, function(index, slide) {
                    var slidePos, stagePos;
                    $.fancybox.stop(slide.$slide), slidePos = $.fancybox.getTranslate(slide.$slide), stagePos = $.fancybox.getTranslate(instance.$refs.stage), slide.$slide.css({
                        transform: "",
                        opacity: "",
                        "transition-duration": ""
                    }).removeClass("fancybox-animated").removeClass(function(index, className) {
                        return (className.match(/(^|\s)fancybox-fx-\S+/g) || []).join(" ")
                    }), slide.pos === instance.current.pos && (self.sliderStartPos.top = slidePos.top - stagePos.top, self.sliderStartPos.left = slidePos.left - stagePos.left), $.fancybox.setTranslate(slide.$slide, {
                        top: slidePos.top - stagePos.top,
                        left: slidePos.left - stagePos.left
                    })
                }), instance.SlideShow && instance.SlideShow.isActive && instance.SlideShow.stop()
            }
        }, Guestures.prototype.onPan = function() {
            var self = this;
            distance(self.newPoints[0], self.realPoints[0]) < ($.fancybox.isMobile ? 10 : 5) ? self.startPoints = self.newPoints : (self.canTap = !1, self.contentLastPos = self.limitMovement(), self.requestId && cancelAFrame(self.requestId), self.requestId = requestAFrame(function() {
                $.fancybox.setTranslate(self.$content, self.contentLastPos)
            }))
        }, Guestures.prototype.limitMovement = function() {
            var minTranslateX, minTranslateY, maxTranslateX, maxTranslateY, newOffsetX, newOffsetY, canvasWidth = this.canvasWidth,
                canvasHeight = this.canvasHeight,
                distanceX = this.distanceX,
                distanceY = this.distanceY,
                contentStartPos = this.contentStartPos,
                currentOffsetX = contentStartPos.left,
                currentOffsetY = contentStartPos.top,
                currentWidth = contentStartPos.width,
                currentHeight = contentStartPos.height;
            return newOffsetX = currentWidth > canvasWidth ? currentOffsetX + distanceX : currentOffsetX, newOffsetY = currentOffsetY + distanceY, minTranslateX = Math.max(0, .5 * canvasWidth - .5 * currentWidth), minTranslateY = Math.max(0, .5 * canvasHeight - .5 * currentHeight), maxTranslateX = Math.min(canvasWidth - currentWidth, .5 * canvasWidth - .5 * currentWidth), maxTranslateY = Math.min(canvasHeight - currentHeight, .5 * canvasHeight - .5 * currentHeight), distanceX > 0 && newOffsetX > minTranslateX && (newOffsetX = minTranslateX - 1 + Math.pow(-minTranslateX + currentOffsetX + distanceX, .8) || 0), distanceX < 0 && newOffsetX < maxTranslateX && (newOffsetX = maxTranslateX + 1 - Math.pow(maxTranslateX - currentOffsetX - distanceX, .8) || 0), distanceY > 0 && newOffsetY > minTranslateY && (newOffsetY = minTranslateY - 1 + Math.pow(-minTranslateY + currentOffsetY + distanceY, .8) || 0), distanceY < 0 && newOffsetY < maxTranslateY && (newOffsetY = maxTranslateY + 1 - Math.pow(maxTranslateY - currentOffsetY - distanceY, .8) || 0), {
                top: newOffsetY,
                left: newOffsetX
            }
        }, Guestures.prototype.limitPosition = function(newOffsetX, newOffsetY, newWidth, newHeight) {
            var canvasWidth = this.canvasWidth,
                canvasHeight = this.canvasHeight;
            return newOffsetX = newWidth > canvasWidth ? (newOffsetX = newOffsetX > 0 ? 0 : newOffsetX) < canvasWidth - newWidth ? canvasWidth - newWidth : newOffsetX : Math.max(0, canvasWidth / 2 - newWidth / 2), {
                top: newOffsetY = newHeight > canvasHeight ? (newOffsetY = newOffsetY > 0 ? 0 : newOffsetY) < canvasHeight - newHeight ? canvasHeight - newHeight : newOffsetY : Math.max(0, canvasHeight / 2 - newHeight / 2),
                left: newOffsetX
            }
        }, Guestures.prototype.onZoom = function() {
            var self = this,
                contentStartPos = self.contentStartPos,
                currentWidth = contentStartPos.width,
                currentHeight = contentStartPos.height,
                currentOffsetX = contentStartPos.left,
                currentOffsetY = contentStartPos.top,
                pinchRatio = distance(self.newPoints[0], self.newPoints[1]) / self.startDistanceBetweenFingers,
                newWidth = Math.floor(currentWidth * pinchRatio),
                newHeight = Math.floor(currentHeight * pinchRatio),
                translateFromZoomingX = (currentWidth - newWidth) * self.percentageOfImageAtPinchPointX,
                translateFromZoomingY = (currentHeight - newHeight) * self.percentageOfImageAtPinchPointY,
                centerPointEndX = (self.newPoints[0].x + self.newPoints[1].x) / 2 - $(window).scrollLeft(),
                centerPointEndY = (self.newPoints[0].y + self.newPoints[1].y) / 2 - $(window).scrollTop(),
                translateFromTranslatingX = centerPointEndX - self.centerPointStartX,
                newPos = {
                    top: currentOffsetY + (translateFromZoomingY + (centerPointEndY - self.centerPointStartY)),
                    left: currentOffsetX + (translateFromZoomingX + translateFromTranslatingX),
                    scaleX: pinchRatio,
                    scaleY: pinchRatio
                };
            self.canTap = !1, self.newWidth = newWidth, self.newHeight = newHeight, self.contentLastPos = newPos, self.requestId && cancelAFrame(self.requestId), self.requestId = requestAFrame(function() {
                $.fancybox.setTranslate(self.$content, self.contentLastPos)
            })
        }, Guestures.prototype.ontouchend = function(e) {
            var swiping = this.isSwiping,
                panning = this.isPanning,
                zooming = this.isZooming,
                scrolling = this.isScrolling;
            if (this.endPoints = getPointerXY(e), this.dMs = Math.max((new Date).getTime() - this.startTime, 1), this.$container.removeClass("fancybox-is-grabbing"), $(document).off(".fb.touch"), document.removeEventListener("scroll", this.onscroll, !0), this.requestId && (cancelAFrame(this.requestId), this.requestId = null), this.isSwiping = !1, this.isPanning = !1, this.isZooming = !1, this.isScrolling = !1, this.instance.isDragging = !1, this.canTap) return this.onTap(e);
            this.speed = 100, this.velocityX = this.distanceX / this.dMs * .5, this.velocityY = this.distanceY / this.dMs * .5, panning ? this.endPanning() : zooming ? this.endZooming() : this.endSwiping(swiping, scrolling)
        }, Guestures.prototype.endSwiping = function(swiping, scrolling) {
            var ret = !1,
                len = this.instance.group.length,
                distanceX = Math.abs(this.distanceX),
                canAdvance = "x" == swiping && len > 1 && (this.dMs > 130 && distanceX > 10 || distanceX > 50);
            this.sliderLastPos = null, "y" == swiping && !scrolling && Math.abs(this.distanceY) > 50 ? ($.fancybox.animate(this.instance.current.$slide, {
                top: this.sliderStartPos.top + this.distanceY + 150 * this.velocityY,
                opacity: 0
            }, 200), ret = this.instance.close(!0, 250)) : canAdvance && this.distanceX > 0 ? ret = this.instance.previous(300) : canAdvance && this.distanceX < 0 && (ret = this.instance.next(300)), !1 !== ret || "x" != swiping && "y" != swiping || this.instance.centerSlide(200), this.$container.removeClass("fancybox-is-sliding")
        }, Guestures.prototype.endPanning = function() {
            var newOffsetX, newOffsetY, newPos;
            this.contentLastPos && (!1 === this.opts.momentum || this.dMs > 350 ? (newOffsetX = this.contentLastPos.left, newOffsetY = this.contentLastPos.top) : (newOffsetX = this.contentLastPos.left + 500 * this.velocityX, newOffsetY = this.contentLastPos.top + 500 * this.velocityY), (newPos = this.limitPosition(newOffsetX, newOffsetY, this.contentStartPos.width, this.contentStartPos.height)).width = this.contentStartPos.width, newPos.height = this.contentStartPos.height, $.fancybox.animate(this.$content, newPos, 366))
        }, Guestures.prototype.endZooming = function() {
            var newOffsetX, newOffsetY, newPos, reset, current = this.instance.current,
                newWidth = this.newWidth,
                newHeight = this.newHeight;
            this.contentLastPos && (newOffsetX = this.contentLastPos.left, reset = {
                top: newOffsetY = this.contentLastPos.top,
                left: newOffsetX,
                width: newWidth,
                height: newHeight,
                scaleX: 1,
                scaleY: 1
            }, $.fancybox.setTranslate(this.$content, reset), newWidth < this.canvasWidth && newHeight < this.canvasHeight ? this.instance.scaleToFit(150) : newWidth > current.width || newHeight > current.height ? this.instance.scaleToActual(this.centerPointStartX, this.centerPointStartY, 150) : (newPos = this.limitPosition(newOffsetX, newOffsetY, newWidth, newHeight), $.fancybox.animate(this.$content, newPos, 150)))
        }, Guestures.prototype.onTap = function(e) {
            var where, self = this,
                $target = $(e.target),
                instance = self.instance,
                current = instance.current,
                endPoints = e && getPointerXY(e) || self.startPoints,
                tapX = endPoints[0] ? endPoints[0].x - $(window).scrollLeft() - self.stagePos.left : 0,
                tapY = endPoints[0] ? endPoints[0].y - $(window).scrollTop() - self.stagePos.top : 0,
                process = function(prefix) {
                    var action = current.opts[prefix];
                    if ($.isFunction(action) && (action = action.apply(instance, [current, e])), action) switch (action) {
                        case "close":
                            instance.close(self.startEvent);
                            break;
                        case "toggleControls":
                            instance.toggleControls();
                            break;
                        case "next":
                            instance.next();
                            break;
                        case "nextOrClose":
                            instance.group.length > 1 ? instance.next() : instance.close(self.startEvent);
                            break;
                        case "zoom":
                            "image" == current.type && (current.isLoaded || current.$ghost) && (instance.canPan() ? instance.scaleToFit() : instance.isScaledDown() ? instance.scaleToActual(tapX, tapY) : instance.group.length < 2 && instance.close(self.startEvent))
                    }
                };
            if ((!e.originalEvent || 2 != e.originalEvent.button) && ($target.is("img") || !(tapX > $target[0].clientWidth + $target.offset().left))) {
                if ($target.is(".fancybox-bg,.fancybox-inner,.fancybox-outer,.fancybox-container")) where = "Outside";
                else if ($target.is(".fancybox-slide")) where = "Slide";
                else {
                    if (!instance.current.$content || !instance.current.$content.find($target).addBack().filter($target).length) return;
                    where = "Content"
                }
                if (self.tapped) {
                    if (clearTimeout(self.tapped), self.tapped = null, Math.abs(tapX - self.tapX) > 50 || Math.abs(tapY - self.tapY) > 50) return this;
                    process("dblclick" + where)
                } else self.tapX = tapX, self.tapY = tapY, current.opts["dblclick" + where] && current.opts["dblclick" + where] !== current.opts["click" + where] ? self.tapped = setTimeout(function() {
                    self.tapped = null, instance.isAnimating || process("click" + where)
                }, 500) : process("click" + where);
                return this
            }
        }, $(document).on("onActivate.fb", function(e, instance) {
            instance && !instance.Guestures && (instance.Guestures = new Guestures(instance))
        }).on("beforeClose.fb", function(e, instance) {
            instance && instance.Guestures && instance.Guestures.destroy()
        })
    }(window, document, jQuery),
    function(document, $) {
        "use strict";
        $.extend(!0, $.fancybox.defaults, {
            btnTpl: {
                slideShow: '<button data-fancybox-play class="fancybox-button fancybox-button--play" title="{{PLAY_START}}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6.5 5.4v13.2l11-6.6z"/></svg><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M8.33 5.75h2.2v12.5h-2.2V5.75zm5.15 0h2.2v12.5h-2.2V5.75z"/></svg></button>'
            },
            slideShow: {
                autoStart: !1,
                speed: 3e3,
                progress: !0
            }
        });
        var SlideShow = function(instance) {
            this.instance = instance, this.init()
        };
        $.extend(SlideShow.prototype, {
            timer: null,
            isActive: !1,
            $button: null,
            init: function() {
                var self = this,
                    instance = self.instance,
                    opts = instance.group[instance.currIndex].opts.slideShow;
                self.$button = instance.$refs.toolbar.find("[data-fancybox-play]").on("click", function() {
                    self.toggle()
                }), instance.group.length < 2 || !opts ? self.$button.hide() : opts.progress && (self.$progress = $('<div class="fancybox-progress"></div>').appendTo(instance.$refs.inner))
            },
            set: function(force) {
                var instance = this.instance,
                    current = instance.current;
                current && (!0 === force || current.opts.loop || instance.currIndex < instance.group.length - 1) ? this.isActive && "video" !== current.contentType && (this.$progress && $.fancybox.animate(this.$progress.show(), {
                    scaleX: 1
                }, current.opts.slideShow.speed), this.timer = setTimeout(function() {
                    instance.current.opts.loop || instance.current.index != instance.group.length - 1 ? instance.next() : instance.jumpTo(0)
                }, current.opts.slideShow.speed)) : (this.stop(), instance.idleSecondsCounter = 0, instance.showControls())
            },
            clear: function() {
                clearTimeout(this.timer), this.timer = null, this.$progress && this.$progress.removeAttr("style").hide()
            },
            start: function() {
                var current = this.instance.current;
                current && (this.$button.attr("title", (current.opts.i18n[current.opts.lang] || current.opts.i18n.en).PLAY_STOP).removeClass("fancybox-button--play").addClass("fancybox-button--pause"), this.isActive = !0, current.isComplete && this.set(!0), this.instance.trigger("onSlideShowChange", !0))
            },
            stop: function() {
                var current = this.instance.current;
                this.clear(), this.$button.attr("title", (current.opts.i18n[current.opts.lang] || current.opts.i18n.en).PLAY_START).removeClass("fancybox-button--pause").addClass("fancybox-button--play"), this.isActive = !1, this.instance.trigger("onSlideShowChange", !1), this.$progress && this.$progress.removeAttr("style").hide()
            },
            toggle: function() {
                this.isActive ? this.stop() : this.start()
            }
        }), $(document).on({
            "onInit.fb": function(e, instance) {
                instance && !instance.SlideShow && (instance.SlideShow = new SlideShow(instance))
            },
            "beforeShow.fb": function(e, instance, current, firstRun) {
                var SlideShow = instance && instance.SlideShow;
                firstRun ? SlideShow && current.opts.slideShow.autoStart && SlideShow.start() : SlideShow && SlideShow.isActive && SlideShow.clear()
            },
            "afterShow.fb": function(e, instance, current) {
                var SlideShow = instance && instance.SlideShow;
                SlideShow && SlideShow.isActive && SlideShow.set()
            },
            "afterKeydown.fb": function(e, instance, current, keypress, keycode) {
                var SlideShow = instance && instance.SlideShow;
                !SlideShow || !current.opts.slideShow || 80 !== keycode && 32 !== keycode || $(document.activeElement).is("button,a,input") || (keypress.preventDefault(), SlideShow.toggle())
            },
            "beforeClose.fb onDeactivate.fb": function(e, instance) {
                var SlideShow = instance && instance.SlideShow;
                SlideShow && SlideShow.stop()
            }
        }), $(document).on("visibilitychange", function() {
            var instance = $.fancybox.getInstance(),
                SlideShow = instance && instance.SlideShow;
            SlideShow && SlideShow.isActive && (document.hidden ? SlideShow.clear() : SlideShow.set())
        })
    }(document, jQuery),
    function(document, $) {
        "use strict";
        var fn = function() {
            for (var fnMap = [
                    ["requestFullscreen", "exitFullscreen", "fullscreenElement", "fullscreenEnabled", "fullscreenchange", "fullscreenerror"],
                    ["webkitRequestFullscreen", "webkitExitFullscreen", "webkitFullscreenElement", "webkitFullscreenEnabled", "webkitfullscreenchange", "webkitfullscreenerror"],
                    ["webkitRequestFullScreen", "webkitCancelFullScreen", "webkitCurrentFullScreenElement", "webkitCancelFullScreen", "webkitfullscreenchange", "webkitfullscreenerror"],
                    ["mozRequestFullScreen", "mozCancelFullScreen", "mozFullScreenElement", "mozFullScreenEnabled", "mozfullscreenchange", "mozfullscreenerror"],
                    ["msRequestFullscreen", "msExitFullscreen", "msFullscreenElement", "msFullscreenEnabled", "MSFullscreenChange", "MSFullscreenError"]
                ], ret = {}, i = 0; i < fnMap.length; i++) {
                var val = fnMap[i];
                if (val && val[1] in document) {
                    for (var j = 0; j < val.length; j++) ret[fnMap[0][j]] = val[j];
                    return ret
                }
            }
            return !1
        }();
        if (fn) {
            var FullScreen = {
                request: function(elem) {
                    (elem = elem || document.documentElement)[fn.requestFullscreen](elem.ALLOW_KEYBOARD_INPUT)
                },
                exit: function() {
                    document[fn.exitFullscreen]()
                },
                toggle: function(elem) {
                    elem = elem || document.documentElement, this.isFullscreen() ? this.exit() : this.request(elem)
                },
                isFullscreen: function() {
                    return Boolean(document[fn.fullscreenElement])
                },
                enabled: function() {
                    return Boolean(document[fn.fullscreenEnabled])
                }
            };
            $.extend(!0, $.fancybox.defaults, {
                btnTpl: {
                    fullScreen: '<button data-fancybox-fullscreen class="fancybox-button fancybox-button--fsenter" title="{{FULL_SCREEN}}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5zm3-8H5v2h5V5H8zm6 11h2v-3h3v-2h-5zm2-11V5h-2v5h5V8z"/></svg></button>'
                },
                fullScreen: {
                    autoStart: !1
                }
            }), $(document).on(fn.fullscreenchange, function() {
                var isFullscreen = FullScreen.isFullscreen(),
                    instance = $.fancybox.getInstance();
                instance && (instance.current && "image" === instance.current.type && instance.isAnimating && (instance.isAnimating = !1, instance.update(!0, !0, 0), instance.isComplete || instance.complete()), instance.trigger("onFullscreenChange", isFullscreen), instance.$refs.container.toggleClass("fancybox-is-fullscreen", isFullscreen), instance.$refs.toolbar.find("[data-fancybox-fullscreen]").toggleClass("fancybox-button--fsenter", !isFullscreen).toggleClass("fancybox-button--fsexit", isFullscreen))
            })
        }
        $(document).on({
            "onInit.fb": function(e, instance) {
                fn ? instance && instance.group[instance.currIndex].opts.fullScreen ? (instance.$refs.container.on("click.fb-fullscreen", "[data-fancybox-fullscreen]", function(e) {
                    e.stopPropagation(), e.preventDefault(), FullScreen.toggle()
                }), instance.opts.fullScreen && !0 === instance.opts.fullScreen.autoStart && FullScreen.request(), instance.FullScreen = FullScreen) : instance && instance.$refs.toolbar.find("[data-fancybox-fullscreen]").hide() : instance.$refs.toolbar.find("[data-fancybox-fullscreen]").remove()
            },
            "afterKeydown.fb": function(e, instance, current, keypress, keycode) {
                instance && instance.FullScreen && 70 === keycode && (keypress.preventDefault(), instance.FullScreen.toggle())
            },
            "beforeClose.fb": function(e, instance) {
                instance && instance.FullScreen && instance.$refs.container.hasClass("fancybox-is-fullscreen") && FullScreen.exit()
            }
        })
    }(document, jQuery),
    function(document, $) {
        "use strict";
        var CLASS = "fancybox-thumbs";
        $.fancybox.defaults = $.extend(!0, {
            btnTpl: {
                thumbs: '<button data-fancybox-thumbs class="fancybox-button fancybox-button--thumbs" title="{{THUMBS}}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M14.59 14.59h3.76v3.76h-3.76v-3.76zm-4.47 0h3.76v3.76h-3.76v-3.76zm-4.47 0h3.76v3.76H5.65v-3.76zm8.94-4.47h3.76v3.76h-3.76v-3.76zm-4.47 0h3.76v3.76h-3.76v-3.76zm-4.47 0h3.76v3.76H5.65v-3.76zm8.94-4.47h3.76v3.76h-3.76V5.65zm-4.47 0h3.76v3.76h-3.76V5.65zm-4.47 0h3.76v3.76H5.65V5.65z"/></svg></button>'
            },
            thumbs: {
                autoStart: !1,
                hideOnClose: !0,
                parentEl: ".fancybox-container",
                axis: "y"
            }
        }, $.fancybox.defaults);
        var FancyThumbs = function(instance) {
            this.init(instance)
        };
        $.extend(FancyThumbs.prototype, {
            $button: null,
            $grid: null,
            $list: null,
            isVisible: !1,
            isActive: !1,
            init: function(instance) {
                var self = this,
                    group = instance.group,
                    enabled = 0;
                self.instance = instance, self.opts = group[instance.currIndex].opts.thumbs, instance.Thumbs = self, self.$button = instance.$refs.toolbar.find("[data-fancybox-thumbs]");
                for (var i = 0, len = group.length; i < len && (group[i].thumb && enabled++, !(enabled > 1)); i++);
                enabled > 1 && self.opts ? (self.$button.removeAttr("style").on("click", function() {
                    self.toggle()
                }), self.isActive = !0) : self.$button.hide()
            },
            create: function() {
                var src, instance = this.instance,
                    parentEl = this.opts.parentEl,
                    list = [];
                this.$grid || (this.$grid = $('<div class="' + CLASS + " " + CLASS + "-" + this.opts.axis + '"></div>').appendTo(instance.$refs.container.find(parentEl).addBack().filter(parentEl)), this.$grid.on("click", "a", function() {
                    instance.jumpTo($(this).attr("data-index"))
                })), this.$list || (this.$list = $('<div class="' + CLASS + '__list">').appendTo(this.$grid)), $.each(instance.group, function(i, item) {
                    (src = item.thumb) || "image" !== item.type || (src = item.src), list.push('<a href="javascript:;" tabindex="0" data-index="' + i + '"' + (src && src.length ? ' style="background-image:url(' + src + ')"' : 'class="fancybox-thumbs-missing"') + "></a>")
                }), this.$list[0].innerHTML = list.join(""), "x" === this.opts.axis && this.$list.width(parseInt(this.$grid.css("padding-right"), 10) + instance.group.length * this.$list.children().eq(0).outerWidth(!0))
            },
            focus: function(duration) {
                var thumb, thumbPos, $list = this.$list,
                    $grid = this.$grid;
                this.instance.current && (thumbPos = (thumb = $list.children().removeClass("fancybox-thumbs-active").filter('[data-index="' + this.instance.current.index + '"]').addClass("fancybox-thumbs-active")).position(), "y" === this.opts.axis && (thumbPos.top < 0 || thumbPos.top > $list.height() - thumb.outerHeight()) ? $list.stop().animate({
                    scrollTop: $list.scrollTop() + thumbPos.top
                }, duration) : "x" === this.opts.axis && (thumbPos.left < $grid.scrollLeft() || thumbPos.left > $grid.scrollLeft() + ($grid.width() - thumb.outerWidth())) && $list.parent().stop().animate({
                    scrollLeft: thumbPos.left
                }, duration))
            },
            update: function() {
                this.instance.$refs.container.toggleClass("fancybox-show-thumbs", this.isVisible), this.isVisible ? (this.$grid || this.create(), this.instance.trigger("onThumbsShow"), this.focus(0)) : this.$grid && this.instance.trigger("onThumbsHide"), this.instance.update()
            },
            hide: function() {
                this.isVisible = !1, this.update()
            },
            show: function() {
                this.isVisible = !0, this.update()
            },
            toggle: function() {
                this.isVisible = !this.isVisible, this.update()
            }
        }), $(document).on({
            "onInit.fb": function(e, instance) {
                var Thumbs;
                instance && !instance.Thumbs && (Thumbs = new FancyThumbs(instance)).isActive && !0 === Thumbs.opts.autoStart && Thumbs.show()
            },
            "beforeShow.fb": function(e, instance, item, firstRun) {
                var Thumbs = instance && instance.Thumbs;
                Thumbs && Thumbs.isVisible && Thumbs.focus(firstRun ? 0 : 250)
            },
            "afterKeydown.fb": function(e, instance, current, keypress, keycode) {
                var Thumbs = instance && instance.Thumbs;
                Thumbs && Thumbs.isActive && 71 === keycode && (keypress.preventDefault(), Thumbs.toggle())
            },
            "beforeClose.fb": function(e, instance) {
                var Thumbs = instance && instance.Thumbs;
                Thumbs && Thumbs.isVisible && !1 !== Thumbs.opts.hideOnClose && Thumbs.$grid.hide()
            }
        })
    }(document, jQuery),
    function(document, $) {
        "use strict";
        $.extend(!0, $.fancybox.defaults, {
            btnTpl: {
                share: '<button data-fancybox-share class="fancybox-button fancybox-button--share" title="{{SHARE}}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M2.55 19c1.4-8.4 9.1-9.8 11.9-9.8V5l7 7-7 6.3v-3.5c-2.8 0-10.5 2.1-11.9 4.2z"/></svg></button>'
            },
            share: {
                url: function(instance, item) {
                    return !instance.currentHash && "inline" !== item.type && "html" !== item.type && (item.origSrc || item.src) || window.location
                },
                tpl: '<div class="fancybox-share"><h1>{{SHARE}}</h1><p><a class="fancybox-share__button fancybox-share__button--fb" href="https://www.facebook.com/sharer/sharer.php?u={{url}}"><svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="m287 456v-299c0-21 6-35 35-35h38v-63c-7-1-29-3-55-3-54 0-91 33-91 94v306m143-254h-205v72h196" /></svg><span>Facebook</span></a><a class="fancybox-share__button fancybox-share__button--tw" href="https://twitter.com/intent/tweet?url={{url}}&text={{descr}}"><svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="m456 133c-14 7-31 11-47 13 17-10 30-27 37-46-15 10-34 16-52 20-61-62-157-7-141 75-68-3-129-35-169-85-22 37-11 86 26 109-13 0-26-4-37-9 0 39 28 72 65 80-12 3-25 4-37 2 10 33 41 57 77 57-42 30-77 38-122 34 170 111 378-32 359-208 16-11 30-25 41-42z" /></svg><span>Twitter</span></a><a class="fancybox-share__button fancybox-share__button--pt" href="https://www.pinterest.com/pin/create/button/?url={{url}}&description={{descr}}&media={{media}}"><svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="m265 56c-109 0-164 78-164 144 0 39 15 74 47 87 5 2 10 0 12-5l4-19c2-6 1-8-3-13-9-11-15-25-15-45 0-58 43-110 113-110 62 0 96 38 96 88 0 67-30 122-73 122-24 0-42-19-36-44 6-29 20-60 20-81 0-19-10-35-31-35-25 0-44 26-44 60 0 21 7 36 7 36l-30 125c-8 37-1 83 0 87 0 3 4 4 5 2 2-3 32-39 42-75l16-64c8 16 31 29 56 29 74 0 124-67 124-157 0-69-58-132-146-132z" fill="#fff"/></svg><span>Pinterest</span></a></p><p><input class="fancybox-share__input" type="text" value="{{url_raw}}" onclick="select()" /></p></div>'
            }
        }), $(document).on("click", "[data-fancybox-share]", function() {
            var url, tpl, instance = $.fancybox.getInstance(),
                current = instance.current || null;
            current && ("function" === $.type(current.opts.share.url) && (url = current.opts.share.url.apply(current, [instance, current])), tpl = current.opts.share.tpl.replace(/\{\{media\}\}/g, "image" === current.type ? encodeURIComponent(current.src) : "").replace(/\{\{url\}\}/g, encodeURIComponent(url)).replace(/\{\{url_raw\}\}/g, function escapeHtml(string) {
                var entityMap = {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#39;",
                    "/": "&#x2F;",
                    "`": "&#x60;",
                    "=": "&#x3D;"
                };
                return String(string).replace(/[&<>"'`=\/]/g, function(s) {
                    return entityMap[s]
                })
            }(url)).replace(/\{\{descr\}\}/g, instance.$caption ? encodeURIComponent(instance.$caption.text()) : ""), $.fancybox.open({
                src: instance.translate(instance, tpl),
                type: "html",
                opts: {
                    touch: !1,
                    animationEffect: !1,
                    afterLoad: function(shareInstance, shareCurrent) {
                        instance.$refs.container.one("beforeClose.fb", function() {
                            shareInstance.close(null, 0)
                        }), shareCurrent.$content.find(".fancybox-share__button").click(function() {
                            return window.open(this.href, "Share", "width=550, height=450"), !1
                        })
                    },
                    mobile: {
                        autoFocus: !1
                    }
                }
            }))
        })
    }(document, jQuery),
    function(window, document, $) {
        "use strict";

        function parseUrl() {
            var hash = window.location.hash.substr(1),
                rez = hash.split("-"),
                index = rez.length > 1 && /^\+?\d+$/.test(rez[rez.length - 1]) && parseInt(rez.pop(-1), 10) || 1;
            return {
                hash: hash,
                index: index < 1 ? 1 : index,
                gallery: rez.join("-")
            }
        }

        function triggerFromUrl(url) {
            "" !== url.gallery && $("[data-fancybox='" + $.escapeSelector(url.gallery) + "']").eq(url.index - 1).focus().trigger("click.fb-start")
        }

        function getGalleryID(instance) {
            var opts, ret;
            return !!instance && ("" !== (ret = (opts = instance.current ? instance.current.opts : instance.opts).hash || (opts.$orig ? opts.$orig.data("fancybox") || opts.$orig.data("fancybox-trigger") : "")) && ret)
        }
        $.escapeSelector || ($.escapeSelector = function(sel) {
            return (sel + "").replace(/([\0-\x1f\x7f]|^-?\d)|^-$|[^\x80-\uFFFF\w-]/g, function(ch, asCodePoint) {
                return asCodePoint ? "\0" === ch ? "�" : ch.slice(0, -1) + "\\" + ch.charCodeAt(ch.length - 1).toString(16) + " " : "\\" + ch
            })
        }), $(function() {
            !1 !== $.fancybox.defaults.hash && ($(document).on({
                "onInit.fb": function(e, instance) {
                    var url, gallery;
                    !1 !== instance.group[instance.currIndex].opts.hash && (url = parseUrl(), (gallery = getGalleryID(instance)) && url.gallery && gallery == url.gallery && (instance.currIndex = url.index - 1))
                },
                "beforeShow.fb": function(e, instance, current, firstRun) {
                    var gallery;
                    current && !1 !== current.opts.hash && (gallery = getGalleryID(instance)) && (instance.currentHash = gallery + (instance.group.length > 1 ? "-" + (current.index + 1) : ""), window.location.hash !== "#" + instance.currentHash && (firstRun && !instance.origHash && (instance.origHash = window.location.hash), instance.hashTimer && clearTimeout(instance.hashTimer), instance.hashTimer = setTimeout(function() {
                        "replaceState" in window.history ? (window.history[firstRun ? "pushState" : "replaceState"]({}, document.title, window.location.pathname + window.location.search + "#" + instance.currentHash), firstRun && (instance.hasCreatedHistory = !0)) : window.location.hash = instance.currentHash, instance.hashTimer = null
                    }, 300)))
                },
                "beforeClose.fb": function(e, instance, current) {
                    current && !1 !== current.opts.hash && (clearTimeout(instance.hashTimer), instance.currentHash && instance.hasCreatedHistory ? window.history.back() : instance.currentHash && ("replaceState" in window.history ? window.history.replaceState({}, document.title, window.location.pathname + window.location.search + (instance.origHash || "")) : window.location.hash = instance.origHash), instance.currentHash = null)
                }
            }), $(window).on("hashchange.fb", function() {
                var url = parseUrl(),
                    fb = null;
                $.each($(".fancybox-container").get().reverse(), function(index, value) {
                    var tmp = $(value).data("FancyBox");
                    if (tmp && tmp.currentHash) return fb = tmp, !1
                }), fb ? fb.currentHash === url.gallery + "-" + url.index || 1 === url.index && fb.currentHash == url.gallery || (fb.currentHash = null, fb.close()) : "" !== url.gallery && triggerFromUrl(url)
            }), setTimeout(function() {
                $.fancybox.getInstance() || triggerFromUrl(parseUrl())
            }, 50))
        })
    }(window, document, jQuery),
    function(document, $) {
        "use strict";
        var prevTime = (new Date).getTime();
        $(document).on({
            "onInit.fb": function(e, instance, current) {
                instance.$refs.stage.on("mousewheel DOMMouseScroll wheel MozMousePixelScroll", function(e) {
                    var current = instance.current,
                        currTime = (new Date).getTime();
                    instance.group.length < 2 || !1 === current.opts.wheel || "auto" === current.opts.wheel && "image" !== current.type || (e.preventDefault(), e.stopPropagation(), current.$slide.hasClass("fancybox-animated") || (e = e.originalEvent || e, currTime - prevTime < 250 || (prevTime = currTime, instance[(-e.deltaY || -e.deltaX || e.wheelDelta || -e.detail) < 0 ? "next" : "previous"]())))
                })
            }
        })
    }(document, jQuery)
}, function(module, exports, __webpack_require__) {
    (function(global) {
        module.exports = global.LazyLoad = __webpack_require__(62)
    }).call(this, __webpack_require__(0))
}, function(module, exports, __webpack_require__) {
    var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__, factory;

    function _extends() {
        return (_extends = Object.assign || function(target) {
            for (var i = 1; i < arguments.length; i++) {
                var source = arguments[i];
                for (var key in source) Object.prototype.hasOwnProperty.call(source, key) && (target[key] = source[key])
            }
            return target
        }).apply(this, arguments)
    }

    function _typeof(obj) {
        return (_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function _typeof(obj) {
            return typeof obj
        } : function _typeof(obj) {
            return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj
        })(obj)
    }
    factory = function() {
        "use strict";
        var runningOnBrowser = "undefined" != typeof window,
            isBot = runningOnBrowser && !("onscroll" in window) || "undefined" != typeof navigator && /(gle|ing|ro)bot|crawl|spider/i.test(navigator.userAgent),
            supportsIntersectionObserver = runningOnBrowser && "IntersectionObserver" in window,
            supportsClassList = runningOnBrowser && "classList" in document.createElement("p"),
            defaultSettings = {
                elements_selector: "img",
                container: isBot || runningOnBrowser ? document : null,
                threshold: 300,
                thresholds: null,
                data_src: "src",
                data_srcset: "srcset",
                data_sizes: "sizes",
                data_bg: "bg",
                class_loading: "loading",
                class_loaded: "loaded",
                class_error: "error",
                load_delay: 0,
                auto_unobserve: !0,
                callback_enter: null,
                callback_exit: null,
                callback_reveal: null,
                callback_loaded: null,
                callback_error: null,
                callback_finish: null
            },
            getData = function getData(element, attribute) {
                return element.getAttribute("data-" + attribute)
            },
            setData = function setData(element, attribute, value) {
                var attrName = "data-" + attribute;
                null !== value ? element.setAttribute(attrName, value) : element.removeAttribute(attrName)
            },
            getWasProcessedData = function getWasProcessedData(element) {
                return "true" === getData(element, "was-processed")
            },
            setTimeoutData = function setTimeoutData(element, value) {
                return setData(element, "ll-timeout", value)
            },
            getTimeoutData = function getTimeoutData(element) {
                return getData(element, "ll-timeout")
            },
            createInstance = function createInstance(classObj, options) {
                var event, instance = new classObj(options);
                try {
                    event = new CustomEvent("LazyLoad::Initialized", {
                        detail: {
                            instance: instance
                        }
                    })
                } catch (err) {
                    (event = document.createEvent("CustomEvent")).initCustomEvent("LazyLoad::Initialized", !1, !1, {
                        instance: instance
                    })
                }
                window.dispatchEvent(event)
            },
            callbackIfSet = function callbackIfSet(callback, argument) {
                callback && callback(argument)
            },
            updateLoadingCount = function updateLoadingCount(instance, plusMinus) {
                instance._loadingCount += plusMinus, 0 === instance._elements.length && 0 === instance._loadingCount && callbackIfSet(instance._settings.callback_finish)
            },
            getSourceTags = function getSourceTags(parentTag) {
                for (var childTag, sourceTags = [], i = 0; childTag = parentTag.children[i]; i += 1) "SOURCE" === childTag.tagName && sourceTags.push(childTag);
                return sourceTags
            },
            setAttributeIfValue = function setAttributeIfValue(element, attrName, value) {
                value && element.setAttribute(attrName, value)
            },
            setImageAttributes = function setImageAttributes(element, settings) {
                setAttributeIfValue(element, "sizes", getData(element, settings.data_sizes)), setAttributeIfValue(element, "srcset", getData(element, settings.data_srcset)), setAttributeIfValue(element, "src", getData(element, settings.data_src))
            },
            setSourcesFunctions = {
                IMG: function setSourcesImg(element, settings) {
                    var parent = element.parentNode;
                    parent && "PICTURE" === parent.tagName && getSourceTags(parent).forEach(function(sourceTag) {
                        setImageAttributes(sourceTag, settings)
                    });
                    setImageAttributes(element, settings)
                },
                IFRAME: function setSourcesIframe(element, settings) {
                    setAttributeIfValue(element, "src", getData(element, settings.data_src))
                },
                VIDEO: function setSourcesVideo(element, settings) {
                    getSourceTags(element).forEach(function(sourceTag) {
                        setAttributeIfValue(sourceTag, "src", getData(sourceTag, settings.data_src))
                    }), setAttributeIfValue(element, "src", getData(element, settings.data_src)), element.load()
                }
            },
            setSources = function setSources(element, instance) {
                var settings = instance._settings,
                    tagName = element.tagName,
                    setSourcesFunction = setSourcesFunctions[tagName];
                if (setSourcesFunction) return setSourcesFunction(element, settings), updateLoadingCount(instance, 1), void(instance._elements = function purgeOneElement(elements, elementToPurge) {
                    return elements.filter(function(element) {
                        return element !== elementToPurge
                    })
                }(instance._elements, element));
                ! function setSourcesBgImage(element, settings) {
                    var srcDataValue = getData(element, settings.data_src),
                        bgDataValue = getData(element, settings.data_bg);
                    srcDataValue && (element.style.backgroundImage = 'url("'.concat(srcDataValue, '")')), bgDataValue && (element.style.backgroundImage = bgDataValue)
                }(element, settings)
            },
            addClass = function addClass(element, className) {
                supportsClassList ? element.classList.add(className) : element.className += (element.className ? " " : "") + className
            },
            addEventListener = function addEventListener(element, eventName, handler) {
                element.addEventListener(eventName, handler)
            },
            removeEventListener = function removeEventListener(element, eventName, handler) {
                element.removeEventListener(eventName, handler)
            },
            removeEventListeners = function removeEventListeners(element, loadHandler, errorHandler) {
                removeEventListener(element, "load", loadHandler), removeEventListener(element, "loadeddata", loadHandler), removeEventListener(element, "error", errorHandler)
            },
            eventHandler = function eventHandler(event, success, instance) {
                var settings = instance._settings,
                    className = success ? settings.class_loaded : settings.class_error,
                    callback = success ? settings.callback_loaded : settings.callback_error,
                    element = event.target;
                ! function removeClass(element, className) {
                    supportsClassList ? element.classList.remove(className) : element.className = element.className.replace(new RegExp("(^|\\s+)" + className + "(\\s+|$)"), " ").replace(/^\s+/, "").replace(/\s+$/, "")
                }(element, settings.class_loading), addClass(element, className), callbackIfSet(callback, element), updateLoadingCount(instance, -1)
            },
            addOneShotEventListeners = function addOneShotEventListeners(element, instance) {
                var loadHandler = function loadHandler(event) {
                        eventHandler(event, !0, instance), removeEventListeners(element, loadHandler, errorHandler)
                    },
                    errorHandler = function errorHandler(event) {
                        eventHandler(event, !1, instance), removeEventListeners(element, loadHandler, errorHandler)
                    };
                ! function addEventListeners(element, loadHandler, errorHandler) {
                    addEventListener(element, "load", loadHandler), addEventListener(element, "loadeddata", loadHandler), addEventListener(element, "error", errorHandler)
                }(element, loadHandler, errorHandler)
            },
            managedTags = ["IMG", "IFRAME", "VIDEO"],
            revealAndUnobserve = function revealAndUnobserve(element, instance) {
                var observer = instance._observer;
                revealElement(element, instance), observer && instance._settings.auto_unobserve && observer.unobserve(element)
            },
            cancelDelayLoad = function cancelDelayLoad(element) {
                var timeoutId = getTimeoutData(element);
                timeoutId && (clearTimeout(timeoutId), setTimeoutData(element, null))
            },
            delayLoad = function delayLoad(element, instance) {
                var loadDelay = instance._settings.load_delay,
                    timeoutId = getTimeoutData(element);
                timeoutId || (timeoutId = setTimeout(function() {
                    revealAndUnobserve(element, instance), cancelDelayLoad(element)
                }, loadDelay), setTimeoutData(element, timeoutId))
            },
            revealElement = function revealElement(element, instance, force) {
                var settings = instance._settings;
                !force && getWasProcessedData(element) || (managedTags.indexOf(element.tagName) > -1 && (addOneShotEventListeners(element, instance), addClass(element, settings.class_loading)), setSources(element, instance), function setWasProcessedData(element) {
                    setData(element, "was-processed", "true")
                }(element), callbackIfSet(settings.callback_reveal, element), callbackIfSet(settings.callback_set, element))
            },
            setObserver = function setObserver(instance) {
                return !!supportsIntersectionObserver && (instance._observer = new IntersectionObserver(function(entries) {
                    entries.forEach(function(entry) {
                        return function isIntersecting(entry) {
                            return entry.isIntersecting || entry.intersectionRatio > 0
                        }(entry) ? function onEnter(element, instance) {
                            var settings = instance._settings;
                            callbackIfSet(settings.callback_enter, element), settings.load_delay ? delayLoad(element, instance) : revealAndUnobserve(element, instance)
                        }(entry.target, instance) : function onExit(element, instance) {
                            var settings = instance._settings;
                            callbackIfSet(settings.callback_exit, element), settings.load_delay && cancelDelayLoad(element)
                        }(entry.target, instance)
                    })
                }, function getObserverSettings(settings) {
                    return {
                        root: settings.container === document ? null : settings.container,
                        rootMargin: settings.thresholds || settings.threshold + "px"
                    }
                }(instance._settings)), !0)
            },
            LazyLoad = function LazyLoad(customSettings, elements) {
                this._settings = function getInstanceSettings(customSettings) {
                    return _extends({}, defaultSettings, customSettings)
                }(customSettings), this._loadingCount = 0, setObserver(this), this.update(elements)
            };
        return LazyLoad.prototype = {
            update: function update(elements) {
                var _this = this,
                    settings = this._settings,
                    _elements = elements || settings.container.querySelectorAll(settings.elements_selector);
                this._elements = function purgeProcessedElements(elements) {
                    return elements.filter(function(element) {
                        return !getWasProcessedData(element)
                    })
                }(Array.prototype.slice.call(_elements)), !isBot && this._observer ? this._elements.forEach(function(element) {
                    _this._observer.observe(element)
                }) : this.loadAll()
            },
            destroy: function destroy() {
                var _this2 = this;
                this._observer && (this._elements.forEach(function(element) {
                    _this2._observer.unobserve(element)
                }), this._observer = null), this._elements = null, this._settings = null
            },
            load: function load(element, force) {
                revealElement(element, this, force)
            },
            loadAll: function loadAll() {
                var _this3 = this;
                this._elements.forEach(function(element) {
                    revealAndUnobserve(element, _this3)
                })
            }
        }, runningOnBrowser && function autoInitialize(classObj, options) {
            if (options)
                if (options.length)
                    for (var optionsItem, i = 0; optionsItem = options[i]; i += 1) createInstance(classObj, optionsItem);
                else createInstance(classObj, options)
        }(LazyLoad, window.lazyLoadOptions), LazyLoad
    }, "object" === _typeof(exports) && void 0 !== module ? module.exports = factory() : void 0 === (__WEBPACK_AMD_DEFINE_RESULT__ = "function" == typeof(__WEBPACK_AMD_DEFINE_FACTORY__ = factory) ? __WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module) : __WEBPACK_AMD_DEFINE_FACTORY__) || (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)
}, function(module, exports, __webpack_require__) {
    (function(global) {
        module.exports = global.GoogleMapsLoader = __webpack_require__(64)
    }).call(this, __webpack_require__(0))
}, function(module, exports, __webpack_require__) {
    var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;
    ! function(root, factory) {
        if (null === (typeof window !== "undefined" ? window : null)) throw new Error("Google-maps package can be used only in browser");
        void 0 === (__WEBPACK_AMD_DEFINE_RESULT__ = "function" == typeof(__WEBPACK_AMD_DEFINE_FACTORY__ = function() {
            "use strict";
            var script = null,
                google = null,
                loading = !1,
                callbacks = [],
                onLoadEvents = [],
                originalCreateLoaderMethod = null,
                GoogleMapsLoader = {
                    URL: "https://maps.googleapis.com/maps/api/js",
                    KEY: null,
                    LIBRARIES: [],
                    CLIENT: null,
                    CHANNEL: null,
                    LANGUAGE: null,
                    REGION: null
                };
            GoogleMapsLoader.VERSION = "3.31", GoogleMapsLoader.WINDOW_CALLBACK_NAME = "__google_maps_api_provider_initializator__", GoogleMapsLoader._googleMockApiObject = {}, GoogleMapsLoader.load = function(fn) {
                null === google ? !0 === loading ? fn && callbacks.push(fn) : (loading = !0, window[GoogleMapsLoader.WINDOW_CALLBACK_NAME] = function() {
                    ready(fn)
                }, GoogleMapsLoader.createLoader()) : fn && fn(google)
            }, GoogleMapsLoader.createLoader = function() {
                (script = document.createElement("script")).type = "text/javascript", script.src = GoogleMapsLoader.createUrl(), document.body.appendChild(script)
            }, GoogleMapsLoader.isLoaded = function() {
                return null !== google
            }, GoogleMapsLoader.createUrl = function() {
                var url = GoogleMapsLoader.URL;
                return url += "?callback=" + GoogleMapsLoader.WINDOW_CALLBACK_NAME, GoogleMapsLoader.KEY && (url += "&key=" + GoogleMapsLoader.KEY), GoogleMapsLoader.LIBRARIES.length > 0 && (url += "&libraries=" + GoogleMapsLoader.LIBRARIES.join(",")), GoogleMapsLoader.CLIENT && (url += "&client=" + GoogleMapsLoader.CLIENT), GoogleMapsLoader.CHANNEL && (url += "&channel=" + GoogleMapsLoader.CHANNEL), GoogleMapsLoader.LANGUAGE && (url += "&language=" + GoogleMapsLoader.LANGUAGE), GoogleMapsLoader.REGION && (url += "&region=" + GoogleMapsLoader.REGION), GoogleMapsLoader.VERSION && (url += "&v=" + GoogleMapsLoader.VERSION), url
            }, GoogleMapsLoader.release = function(fn) {
                var release = function() {
                    GoogleMapsLoader.KEY = null, GoogleMapsLoader.LIBRARIES = [], GoogleMapsLoader.CLIENT = null, GoogleMapsLoader.CHANNEL = null, GoogleMapsLoader.LANGUAGE = null, GoogleMapsLoader.REGION = null, GoogleMapsLoader.VERSION = "3.31", google = null, loading = !1, callbacks = [], onLoadEvents = [], void 0 !== window.google && delete window.google, void 0 !== window[GoogleMapsLoader.WINDOW_CALLBACK_NAME] && delete window[GoogleMapsLoader.WINDOW_CALLBACK_NAME], null !== originalCreateLoaderMethod && (GoogleMapsLoader.createLoader = originalCreateLoaderMethod, originalCreateLoaderMethod = null), null !== script && (script.parentElement.removeChild(script), script = null), fn && fn()
                };
                loading ? GoogleMapsLoader.load(function() {
                    release()
                }) : release()
            }, GoogleMapsLoader.onLoad = function(fn) {
                onLoadEvents.push(fn)
            }, GoogleMapsLoader.makeMock = function() {
                originalCreateLoaderMethod = GoogleMapsLoader.createLoader, GoogleMapsLoader.createLoader = function() {
                    window.google = GoogleMapsLoader._googleMockApiObject, window[GoogleMapsLoader.WINDOW_CALLBACK_NAME]()
                }
            };
            var ready = function(fn) {
                var i;
                for (loading = !1, null === google && (google = window.google), i = 0; i < onLoadEvents.length; i++) onLoadEvents[i](google);
                for (fn && fn(google), i = 0; i < callbacks.length; i++) callbacks[i](google);
                callbacks = []
            };
            return GoogleMapsLoader
        }) ? __WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module) : __WEBPACK_AMD_DEFINE_FACTORY__) || (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)
    }()
}, function(module, exports) {
    var a, b;
    b = {},
        function(a, b) {
            function d() {
                this._delay = 0, this._endDelay = 0, this._fill = "none", this._iterationStart = 0, this._iterations = 1, this._duration = 0, this._playbackRate = 1, this._direction = "normal", this._easing = "linear", this._easingFunction = x
            }

            function e() {
                return a.isDeprecated("Invalid timing inputs", "2016-03-02", "TypeError exceptions will be thrown instead.", !0)
            }

            function f(b, c, e) {
                var f = new d;
                return c && (f.fill = "both", f.duration = "auto"), "number" != typeof b || isNaN(b) ? void 0 !== b && Object.getOwnPropertyNames(b).forEach(function(c) {
                    if ("auto" != b[c]) {
                        if (("number" == typeof f[c] || "duration" == c) && ("number" != typeof b[c] || isNaN(b[c]))) return;
                        if ("fill" == c && -1 == v.indexOf(b[c])) return;
                        if ("direction" == c && -1 == w.indexOf(b[c])) return;
                        if ("playbackRate" == c && 1 !== b[c] && a.isDeprecated("AnimationEffectTiming.playbackRate", "2014-11-28", "Use Animation.playbackRate instead.")) return;
                        f[c] = b[c]
                    }
                }) : f.duration = b, f
            }

            function i(a, b, c, d) {
                return a < 0 || a > 1 || c < 0 || c > 1 ? x : function(e) {
                    function f(a, b, c) {
                        return 3 * a * (1 - c) * (1 - c) * c + 3 * b * (1 - c) * c * c + c * c * c
                    }
                    if (e <= 0) {
                        var g = 0;
                        return a > 0 ? g = b / a : !b && c > 0 && (g = d / c), g * e
                    }
                    if (e >= 1) {
                        var h = 0;
                        return c < 1 ? h = (d - 1) / (c - 1) : 1 == c && a < 1 && (h = (b - 1) / (a - 1)), 1 + h * (e - 1)
                    }
                    for (var i = 0, j = 1; i < j;) {
                        var k = (i + j) / 2,
                            l = f(a, c, k);
                        if (Math.abs(e - l) < 1e-5) return f(b, d, k);
                        l < e ? i = k : j = k
                    }
                    return f(b, d, k)
                }
            }

            function j(a, b) {
                return function(c) {
                    if (c >= 1) return 1;
                    var d = 1 / a;
                    return (c += b * d) - c % d
                }
            }

            function k(a) {
                C || (C = document.createElement("div").style), C.animationTimingFunction = "", C.animationTimingFunction = a;
                var b = C.animationTimingFunction;
                if ("" == b && e()) throw new TypeError(a + " is not a valid value for easing");
                return b
            }

            function l(a) {
                if ("linear" == a) return x;
                var b = E.exec(a);
                if (b) return i.apply(this, b.slice(1).map(Number));
                var c = F.exec(a);
                if (c) return j(Number(c[1]), A);
                var d = G.exec(a);
                return d ? j(Number(d[1]), {
                    start: y,
                    middle: z,
                    end: A
                } [d[2]]) : B[a] || x
            }

            function o(a, b, c) {
                if (null == b) return H;
                var d = c.delay + a + c.endDelay;
                return b < Math.min(c.delay, d) ? I : b >= Math.min(c.delay + a, d) ? J : K
            }
            var v = "backwards|forwards|both|none".split("|"),
                w = "reverse|alternate|alternate-reverse".split("|"),
                x = function(a) {
                    return a
                };
            d.prototype = {
                _setMember: function(b, c) {
                    this["_" + b] = c, this._effect && (this._effect._timingInput[b] = c, this._effect._timing = a.normalizeTimingInput(this._effect._timingInput), this._effect.activeDuration = a.calculateActiveDuration(this._effect._timing), this._effect._animation && this._effect._animation._rebuildUnderlyingAnimation())
                },
                get playbackRate() {
                    return this._playbackRate
                },
                set delay(a) {
                    this._setMember("delay", a)
                },
                get delay() {
                    return this._delay
                },
                set endDelay(a) {
                    this._setMember("endDelay", a)
                },
                get endDelay() {
                    return this._endDelay
                },
                set fill(a) {
                    this._setMember("fill", a)
                },
                get fill() {
                    return this._fill
                },
                set iterationStart(a) {
                    if ((isNaN(a) || a < 0) && e()) throw new TypeError("iterationStart must be a non-negative number, received: " + a);
                    this._setMember("iterationStart", a)
                },
                get iterationStart() {
                    return this._iterationStart
                },
                set duration(a) {
                    if ("auto" != a && (isNaN(a) || a < 0) && e()) throw new TypeError("duration must be non-negative or auto, received: " + a);
                    this._setMember("duration", a)
                },
                get duration() {
                    return this._duration
                },
                set direction(a) {
                    this._setMember("direction", a)
                },
                get direction() {
                    return this._direction
                },
                set easing(a) {
                    this._easingFunction = l(k(a)), this._setMember("easing", a)
                },
                get easing() {
                    return this._easing
                },
                set iterations(a) {
                    if ((isNaN(a) || a < 0) && e()) throw new TypeError("iterations must be non-negative, received: " + a);
                    this._setMember("iterations", a)
                },
                get iterations() {
                    return this._iterations
                }
            };
            var y = 1,
                z = .5,
                A = 0,
                B = {
                    ease: i(.25, .1, .25, 1),
                    "ease-in": i(.42, 0, 1, 1),
                    "ease-out": i(0, 0, .58, 1),
                    "ease-in-out": i(.42, 0, .58, 1),
                    "step-start": j(1, y),
                    "step-middle": j(1, z),
                    "step-end": j(1, A)
                },
                C = null,
                D = "\\s*(-?\\d+\\.?\\d*|-?\\.\\d+)\\s*",
                E = new RegExp("cubic-bezier\\(" + D + "," + D + "," + D + "," + D + "\\)"),
                F = /steps\(\s*(\d+)\s*\)/,
                G = /steps\(\s*(\d+)\s*,\s*(start|middle|end)\s*\)/,
                H = 0,
                I = 1,
                J = 2,
                K = 3;
            a.cloneTimingInput = function c(a) {
                if ("number" == typeof a) return a;
                var b = {};
                for (var c in a) b[c] = a[c];
                return b
            }, a.makeTiming = f, a.numericTimingToObject = function g(a) {
                return "number" == typeof a && (a = isNaN(a) ? {
                    duration: 0
                } : {
                    duration: a
                }), a
            }, a.normalizeTimingInput = function h(b, c) {
                return f(b = a.numericTimingToObject(b), c)
            }, a.calculateActiveDuration = function m(a) {
                return Math.abs(function n(a) {
                    return 0 === a.duration || 0 === a.iterations ? 0 : a.duration * a.iterations
                }(a) / a.playbackRate)
            }, a.calculateIterationProgress = function u(a, b, c) {
                var d = o(a, b, c),
                    e = function p(a, b, c, d, e) {
                        switch (d) {
                            case I:
                                return "backwards" == b || "both" == b ? 0 : null;
                            case K:
                                return c - e;
                            case J:
                                return "forwards" == b || "both" == b ? a : null;
                            case H:
                                return null
                        }
                    }(a, c.fill, b, d, c.delay);
                if (null === e) return null;
                var f = function q(a, b, c, d, e) {
                        var f = e;
                        return 0 === a ? b !== I && (f += c) : f += d / a, f
                    }(c.duration, d, c.iterations, e, c.iterationStart),
                    g = function r(a, b, c, d, e, f) {
                        var g = a === 1 / 0 ? b % 1 : a % 1;
                        return 0 !== g || c !== J || 0 === d || 0 === e && 0 !== f || (g = 1), g
                    }(f, c.iterationStart, d, c.iterations, e, c.duration),
                    h = function s(a, b, c, d) {
                        return a === J && b === 1 / 0 ? 1 / 0 : 1 === c ? Math.floor(d) - 1 : Math.floor(d)
                    }(d, c.iterations, g, f),
                    i = function t(a, b, c) {
                        var d = a;
                        if ("normal" !== a && "reverse" !== a) {
                            var e = b;
                            "alternate-reverse" === a && (e += 1), d = "normal", e !== 1 / 0 && e % 2 != 0 && (d = "reverse")
                        }
                        return "normal" === d ? c : 1 - c
                    }(c.direction, h, g);
                return c._easingFunction(i)
            }, a.calculatePhase = o, a.normalizeEasing = k, a.parseEasingFunction = l
        }(a = {}),
        function(a, b) {
            function c(a, b) {
                return a in k && k[a][b] || b
            }

            function e(a, b, e) {
                if (! function d(a) {
                        return "display" === a || 0 === a.lastIndexOf("animation", 0) || 0 === a.lastIndexOf("transition", 0)
                    }(a)) {
                    var f = h[a];
                    if (f)
                        for (var g in i.style[a] = b, f) {
                            var j = f[g],
                                k = i.style[j];
                            e[j] = c(j, k)
                        } else e[a] = c(a, b)
                }
            }

            function f(a) {
                var b = [];
                for (var c in a)
                    if (!(c in ["easing", "offset", "composite"])) {
                        var d = a[c];
                        Array.isArray(d) || (d = [d]);
                        for (var e, f = d.length, g = 0; g < f; g++)(e = {}).offset = "offset" in a ? a.offset : 1 == f ? 1 : g / (f - 1), "easing" in a && (e.easing = a.easing), "composite" in a && (e.composite = a.composite), e[c] = d[g], b.push(e)
                    } return b.sort(function(a, b) {
                    return a.offset - b.offset
                }), b
            }
            var h = {
                    background: ["backgroundImage", "backgroundPosition", "backgroundSize", "backgroundRepeat", "backgroundAttachment", "backgroundOrigin", "backgroundClip", "backgroundColor"],
                    border: ["borderTopColor", "borderTopStyle", "borderTopWidth", "borderRightColor", "borderRightStyle", "borderRightWidth", "borderBottomColor", "borderBottomStyle", "borderBottomWidth", "borderLeftColor", "borderLeftStyle", "borderLeftWidth"],
                    borderBottom: ["borderBottomWidth", "borderBottomStyle", "borderBottomColor"],
                    borderColor: ["borderTopColor", "borderRightColor", "borderBottomColor", "borderLeftColor"],
                    borderLeft: ["borderLeftWidth", "borderLeftStyle", "borderLeftColor"],
                    borderRadius: ["borderTopLeftRadius", "borderTopRightRadius", "borderBottomRightRadius", "borderBottomLeftRadius"],
                    borderRight: ["borderRightWidth", "borderRightStyle", "borderRightColor"],
                    borderTop: ["borderTopWidth", "borderTopStyle", "borderTopColor"],
                    borderWidth: ["borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth"],
                    flex: ["flexGrow", "flexShrink", "flexBasis"],
                    font: ["fontFamily", "fontSize", "fontStyle", "fontVariant", "fontWeight", "lineHeight"],
                    margin: ["marginTop", "marginRight", "marginBottom", "marginLeft"],
                    outline: ["outlineColor", "outlineStyle", "outlineWidth"],
                    padding: ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"]
                },
                i = document.createElementNS("http://www.w3.org/1999/xhtml", "div"),
                j = {
                    thin: "1px",
                    medium: "3px",
                    thick: "5px"
                },
                k = {
                    borderBottomWidth: j,
                    borderLeftWidth: j,
                    borderRightWidth: j,
                    borderTopWidth: j,
                    fontSize: {
                        "xx-small": "60%",
                        "x-small": "75%",
                        small: "89%",
                        medium: "100%",
                        large: "120%",
                        "x-large": "150%",
                        "xx-large": "200%"
                    },
                    fontWeight: {
                        normal: "400",
                        bold: "700"
                    },
                    outlineWidth: j,
                    textShadow: {
                        none: "0px 0px 0px transparent"
                    },
                    boxShadow: {
                        none: "0px 0px 0px 0px transparent"
                    }
                };
            a.convertToArrayForm = f, a.normalizeKeyframes = function g(b) {
                if (null == b) return [];
                window.Symbol && Symbol.iterator && Array.prototype.from && b[Symbol.iterator] && (b = Array.from(b)), Array.isArray(b) || (b = f(b));
                for (var d = b.map(function(b) {
                        var c = {};
                        for (var d in b) {
                            var f = b[d];
                            if ("offset" == d) {
                                if (null != f) {
                                    if (f = Number(f), !isFinite(f)) throw new TypeError("Keyframe offsets must be numbers.");
                                    if (f < 0 || f > 1) throw new TypeError("Keyframe offsets must be between 0 and 1.")
                                }
                            } else if ("composite" == d) {
                                if ("add" == f || "accumulate" == f) throw {
                                    type: DOMException.NOT_SUPPORTED_ERR,
                                    name: "NotSupportedError",
                                    message: "add compositing is not supported"
                                };
                                if ("replace" != f) throw new TypeError("Invalid composite mode " + f + ".")
                            } else f = "easing" == d ? a.normalizeEasing(f) : "" + f;
                            e(d, f, c)
                        }
                        return null == c.offset && (c.offset = null), null == c.easing && (c.easing = "linear"), c
                    }), g = !0, h = -1 / 0, i = 0; i < d.length; i++) {
                    var j = d[i].offset;
                    if (null != j) {
                        if (j < h) throw new TypeError("Keyframes are not loosely sorted by offset. Sort or specify offsets.");
                        h = j
                    } else g = !1
                }
                return d = d.filter(function(a) {
                    return a.offset >= 0 && a.offset <= 1
                }), g || function c() {
                    var a = d.length;
                    null == d[a - 1].offset && (d[a - 1].offset = 1), a > 1 && null == d[0].offset && (d[0].offset = 0);
                    for (var b = 0, c = d[0].offset, e = 1; e < a; e++) {
                        var f = d[e].offset;
                        if (null != f) {
                            for (var g = 1; g < e - b; g++) d[b + g].offset = c + (f - c) * g / (e - b);
                            b = e, c = f
                        }
                    }
                }(), d
            }
        }(a),
        function(a) {
            var b = {};
            a.isDeprecated = function(a, c, d, e) {
                var f = e ? "are" : "is",
                    g = new Date,
                    h = new Date(c);
                return h.setMonth(h.getMonth() + 3), !(g < h && (a in b || console.warn("Web Animations: " + a + " " + f + " deprecated and will stop working on " + h.toDateString() + ". " + d), b[a] = !0, 1))
            }, a.deprecated = function(b, c, d, e) {
                var f = e ? "are" : "is";
                if (a.isDeprecated(b, c, d, e)) throw new Error(b + " " + f + " no longer supported. " + d)
            }
        }(a),
        function() {
            if (document.documentElement.animate) {
                var c = document.documentElement.animate([], 0),
                    d = !0;
                if (c && (d = !1, "play|currentTime|pause|reverse|playbackRate|cancel|finish|startTime|playState".split("|").forEach(function(a) {
                        void 0 === c[a] && (d = !0)
                    })), !d) return
            }! function(a, b, c) {
                b.convertEffectInput = function(c) {
                    var g = function d(a) {
                            for (var b = {}, c = 0; c < a.length; c++)
                                for (var d in a[c])
                                    if ("offset" != d && "easing" != d && "composite" != d) {
                                        var e = {
                                            offset: a[c].offset,
                                            easing: a[c].easing,
                                            value: a[c][d]
                                        };
                                        b[d] = b[d] || [], b[d].push(e)
                                    } for (var f in b) {
                                var g = b[f];
                                if (0 != g[0].offset || 1 != g[g.length - 1].offset) throw {
                                    type: DOMException.NOT_SUPPORTED_ERR,
                                    name: "NotSupportedError",
                                    message: "Partial keyframes are not supported"
                                }
                            }
                            return b
                        }(a.normalizeKeyframes(c)),
                        h = function e(c) {
                            var d = [];
                            for (var e in c)
                                for (var f = c[e], g = 0; g < f.length - 1; g++) {
                                    var h = g,
                                        i = g + 1,
                                        j = f[h].offset,
                                        k = f[i].offset,
                                        l = j,
                                        m = k;
                                    0 == g && (l = -1 / 0, 0 == k && (i = h)), g == f.length - 2 && (m = 1 / 0, 1 == j && (h = i)), d.push({
                                        applyFrom: l,
                                        applyTo: m,
                                        startOffset: f[h].offset,
                                        endOffset: f[i].offset,
                                        easingFunction: a.parseEasingFunction(f[h].easing),
                                        property: e,
                                        interpolation: b.propertyInterpolation(e, f[h].value, f[i].value)
                                    })
                                }
                            return d.sort(function(a, b) {
                                return a.startOffset - b.startOffset
                            }), d
                        }(g);
                    return function(a, c) {
                        if (null != c) h.filter(function(a) {
                            return c >= a.applyFrom && c < a.applyTo
                        }).forEach(function(d) {
                            var e = c - d.startOffset,
                                f = d.endOffset - d.startOffset,
                                g = 0 == f ? 0 : d.easingFunction(e / f);
                            b.apply(a, d.property, d.interpolation(g))
                        });
                        else
                            for (var d in g) "offset" != d && "easing" != d && "composite" != d && b.clear(a, d)
                    }
                }
            }(a, b),
            function(a, b, c) {
                function d(a) {
                    return a.replace(/-(.)/g, function(a, b) {
                        return b.toUpperCase()
                    })
                }

                function e(a, b, c) {
                    h[c] = h[c] || [], h[c].push([a, b])
                }
                var h = {};
                b.addPropertiesHandler = function f(a, b, c) {
                    for (var f = 0; f < c.length; f++) e(a, b, d(c[f]))
                };
                var i = {
                    backgroundColor: "transparent",
                    backgroundPosition: "0% 0%",
                    borderBottomColor: "currentColor",
                    borderBottomLeftRadius: "0px",
                    borderBottomRightRadius: "0px",
                    borderBottomWidth: "3px",
                    borderLeftColor: "currentColor",
                    borderLeftWidth: "3px",
                    borderRightColor: "currentColor",
                    borderRightWidth: "3px",
                    borderSpacing: "2px",
                    borderTopColor: "currentColor",
                    borderTopLeftRadius: "0px",
                    borderTopRightRadius: "0px",
                    borderTopWidth: "3px",
                    bottom: "auto",
                    clip: "rect(0px, 0px, 0px, 0px)",
                    color: "black",
                    fontSize: "100%",
                    fontWeight: "400",
                    height: "auto",
                    left: "auto",
                    letterSpacing: "normal",
                    lineHeight: "120%",
                    marginBottom: "0px",
                    marginLeft: "0px",
                    marginRight: "0px",
                    marginTop: "0px",
                    maxHeight: "none",
                    maxWidth: "none",
                    minHeight: "0px",
                    minWidth: "0px",
                    opacity: "1.0",
                    outlineColor: "invert",
                    outlineOffset: "0px",
                    outlineWidth: "3px",
                    paddingBottom: "0px",
                    paddingLeft: "0px",
                    paddingRight: "0px",
                    paddingTop: "0px",
                    right: "auto",
                    strokeDasharray: "none",
                    strokeDashoffset: "0px",
                    textIndent: "0px",
                    textShadow: "0px 0px 0px transparent",
                    top: "auto",
                    transform: "",
                    verticalAlign: "0px",
                    visibility: "visible",
                    width: "auto",
                    wordSpacing: "normal",
                    zIndex: "auto"
                };
                b.propertyInterpolation = function g(c, e, f) {
                    var g = c;
                    /-/.test(c) && !a.isDeprecated("Hyphenated property names", "2016-03-22", "Use camelCase instead.", !0) && (g = d(c)), "initial" != e && "initial" != f || ("initial" == e && (e = i[g]), "initial" == f && (f = i[g]));
                    for (var j = e == f ? [] : h[g], k = 0; j && k < j.length; k++) {
                        var l = j[k][0](e),
                            m = j[k][0](f);
                        if (void 0 !== l && void 0 !== m) {
                            var n = j[k][1](l, m);
                            if (n) {
                                var o = b.Interpolation.apply(null, n);
                                return function(a) {
                                    return 0 == a ? e : 1 == a ? f : o(a)
                                }
                            }
                        }
                    }
                    return b.Interpolation(!1, !0, function(a) {
                        return a ? f : e
                    })
                }
            }(a, b),
            function(a, b, c) {
                b.KeyframeEffect = function(c, e, f, g) {
                    var h, i = function d(b) {
                            var c = a.calculateActiveDuration(b),
                                d = function(d) {
                                    return a.calculateIterationProgress(c, d, b)
                                };
                            return d._totalDuration = b.delay + c + b.endDelay, d
                        }(a.normalizeTimingInput(f)),
                        j = b.convertEffectInput(e),
                        k = function() {
                            j(c, h)
                        };
                    return k._update = function(a) {
                        return null !== (h = i(a))
                    }, k._clear = function() {
                        j(c, null)
                    }, k._hasSameTarget = function(a) {
                        return c === a
                    }, k._target = c, k._totalDuration = i._totalDuration, k._id = g, k
                }
            }(a, b),
            function(a, b) {
                function d(a, b, c) {
                    c.enumerable = !0, c.configurable = !0, Object.defineProperty(a, b, c)
                }

                function e(a) {
                    this._element = a, this._surrogateStyle = document.createElementNS("http://www.w3.org/1999/xhtml", "div").style, this._style = a.style, this._length = 0, this._isAnimatedProperty = {}, this._updateSvgTransformAttr = function c(a, b) {
                        return !(!b.namespaceURI || -1 == b.namespaceURI.indexOf("/svg")) && (g in a || (a[g] = /Trident|MSIE|IEMobile|Edge|Android 4/i.test(a.navigator.userAgent)), a[g])
                    }(window, a), this._savedTransformAttr = null;
                    for (var b = 0; b < this._style.length; b++) {
                        var d = this._style[b];
                        this._surrogateStyle[d] = this._style[d]
                    }
                    this._updateIndices()
                }

                function f(a) {
                    if (!a._webAnimationsPatchedStyle) {
                        var b = new e(a);
                        try {
                            d(a, "style", {
                                get: function() {
                                    return b
                                }
                            })
                        } catch (b) {
                            a.style._set = function(b, c) {
                                a.style[b] = c
                            }, a.style._clear = function(b) {
                                a.style[b] = ""
                            }
                        }
                        a._webAnimationsPatchedStyle = a.style
                    }
                }
                var g = "_webAnimationsUpdateSvgTransformAttr",
                    h = {
                        cssText: 1,
                        length: 1,
                        parentRule: 1
                    },
                    i = {
                        getPropertyCSSValue: 1,
                        getPropertyPriority: 1,
                        getPropertyValue: 1,
                        item: 1,
                        removeProperty: 1,
                        setProperty: 1
                    },
                    j = {
                        removeProperty: 1,
                        setProperty: 1
                    };
                for (var k in e.prototype = {
                        get cssText() {
                            return this._surrogateStyle.cssText
                        },
                        set cssText(a) {
                            for (var b = {}, c = 0; c < this._surrogateStyle.length; c++) b[this._surrogateStyle[c]] = !0;
                            for (this._surrogateStyle.cssText = a, this._updateIndices(), c = 0; c < this._surrogateStyle.length; c++) b[this._surrogateStyle[c]] = !0;
                            for (var d in b) this._isAnimatedProperty[d] || this._style.setProperty(d, this._surrogateStyle.getPropertyValue(d))
                        },
                        get length() {
                            return this._surrogateStyle.length
                        },
                        get parentRule() {
                            return this._style.parentRule
                        },
                        _updateIndices: function() {
                            for (; this._length < this._surrogateStyle.length;) Object.defineProperty(this, this._length, {
                                configurable: !0,
                                enumerable: !1,
                                get: function(a) {
                                    return function() {
                                        return this._surrogateStyle[a]
                                    }
                                }(this._length)
                            }), this._length++;
                            for (; this._length > this._surrogateStyle.length;) this._length--, Object.defineProperty(this, this._length, {
                                configurable: !0,
                                enumerable: !1,
                                value: void 0
                            })
                        },
                        _set: function(b, c) {
                            this._style[b] = c, this._isAnimatedProperty[b] = !0, this._updateSvgTransformAttr && "transform" == a.unprefixedPropertyName(b) && (null == this._savedTransformAttr && (this._savedTransformAttr = this._element.getAttribute("transform")), this._element.setAttribute("transform", a.transformToSvgMatrix(c)))
                        },
                        _clear: function(b) {
                            this._style[b] = this._surrogateStyle[b], this._updateSvgTransformAttr && "transform" == a.unprefixedPropertyName(b) && (this._savedTransformAttr ? this._element.setAttribute("transform", this._savedTransformAttr) : this._element.removeAttribute("transform"), this._savedTransformAttr = null), delete this._isAnimatedProperty[b]
                        }
                    }, i) e.prototype[k] = function(a, b) {
                    return function() {
                        var c = this._surrogateStyle[a].apply(this._surrogateStyle, arguments);
                        return b && (this._isAnimatedProperty[arguments[0]] || this._style[a].apply(this._style, arguments), this._updateIndices()), c
                    }
                }(k, k in j);
                for (var l in document.documentElement.style) l in h || l in i || function(a) {
                    d(e.prototype, a, {
                        get: function() {
                            return this._surrogateStyle[a]
                        },
                        set: function(b) {
                            this._surrogateStyle[a] = b, this._updateIndices(), this._isAnimatedProperty[a] || (this._style[a] = b)
                        }
                    })
                }(l);
                a.apply = function(b, c, d) {
                    f(b), b.style._set(a.propertyName(c), d)
                }, a.clear = function(b, c) {
                    b._webAnimationsPatchedStyle && b.style._clear(a.propertyName(c))
                }
            }(b),
            function(a) {
                window.Element.prototype.animate = function(b, c) {
                    var d = "";
                    return c && c.id && (d = c.id), a.timeline._play(a.KeyframeEffect(this, b, c, d))
                }
            }(b),
            function(a, b) {
                a.Interpolation = function(a, b, d) {
                    return function(e) {
                        return d(function c(a, b, d) {
                            if ("number" == typeof a && "number" == typeof b) return a * (1 - d) + b * d;
                            if ("boolean" == typeof a && "boolean" == typeof b) return d < .5 ? a : b;
                            if (a.length == b.length) {
                                for (var e = [], f = 0; f < a.length; f++) e.push(c(a[f], b[f], d));
                                return e
                            }
                            throw "Mismatched interpolation arguments " + a + ":" + b
                        }(a, b, e))
                    }
                }
            }(b),
            function(a, b) {
                var e = function() {
                    function a(a, b) {
                        for (var c = [
                                [0, 0, 0, 0],
                                [0, 0, 0, 0],
                                [0, 0, 0, 0],
                                [0, 0, 0, 0]
                            ], d = 0; d < 4; d++)
                            for (var e = 0; e < 4; e++)
                                for (var f = 0; f < 4; f++) c[d][e] += b[d][f] * a[f][e];
                        return c
                    }
                    return function c(c, d, e, f, g) {
                        for (var h = [
                                [1, 0, 0, 0],
                                [0, 1, 0, 0],
                                [0, 0, 1, 0],
                                [0, 0, 0, 1]
                            ], i = 0; i < 4; i++) h[i][3] = g[i];
                        for (i = 0; i < 3; i++)
                            for (var j = 0; j < 3; j++) h[3][i] += c[j] * h[j][i];
                        var k = f[0],
                            l = f[1],
                            m = f[2],
                            n = f[3],
                            o = [
                                [1, 0, 0, 0],
                                [0, 1, 0, 0],
                                [0, 0, 1, 0],
                                [0, 0, 0, 1]
                            ];
                        o[0][0] = 1 - 2 * (l * l + m * m), o[0][1] = 2 * (k * l - m * n), o[0][2] = 2 * (k * m + l * n), o[1][0] = 2 * (k * l + m * n), o[1][1] = 1 - 2 * (k * k + m * m), o[1][2] = 2 * (l * m - k * n), o[2][0] = 2 * (k * m - l * n), o[2][1] = 2 * (l * m + k * n), o[2][2] = 1 - 2 * (k * k + l * l), h = a(h, o);
                        var p = [
                            [1, 0, 0, 0],
                            [0, 1, 0, 0],
                            [0, 0, 1, 0],
                            [0, 0, 0, 1]
                        ];
                        for (e[2] && (p[2][1] = e[2], h = a(h, p)), e[1] && (p[2][1] = 0, p[2][0] = e[0], h = a(h, p)), e[0] && (p[2][0] = 0, p[1][0] = e[0], h = a(h, p)), i = 0; i < 3; i++)
                            for (j = 0; j < 3; j++) h[i][j] *= d[i];
                        return function b(a) {
                            return 0 == a[0][2] && 0 == a[0][3] && 0 == a[1][2] && 0 == a[1][3] && 0 == a[2][0] && 0 == a[2][1] && 1 == a[2][2] && 0 == a[2][3] && 0 == a[3][2] && 1 == a[3][3]
                        }(h) ? [h[0][0], h[0][1], h[1][0], h[1][1], h[3][0], h[3][1]] : h[0].concat(h[1], h[2], h[3])
                    }
                }();
                a.composeMatrix = e, a.quat = function d(b, d, e) {
                    var f = a.dot(b, d),
                        g = [];
                    if (1 === (f = function c(a, b, c) {
                            return Math.max(Math.min(a, c), b)
                        }(f, -1, 1))) g = b;
                    else
                        for (var h = Math.acos(f), i = 1 * Math.sin(e * h) / Math.sqrt(1 - f * f), j = 0; j < 4; j++) g.push(b[j] * (Math.cos(e * h) - f * i) + d[j] * i);
                    return g
                }
            }(b),
            function(a, b, c) {
                a.sequenceNumber = 0;
                var d = function(a, b, c) {
                    this.target = a, this.currentTime = b, this.timelineTime = c, this.type = "finish", this.bubbles = !1, this.cancelable = !1, this.currentTarget = a, this.defaultPrevented = !1, this.eventPhase = Event.AT_TARGET, this.timeStamp = Date.now()
                };
                b.Animation = function(b) {
                    this.id = "", b && b._id && (this.id = b._id), this._sequenceNumber = a.sequenceNumber++, this._currentTime = 0, this._startTime = null, this._paused = !1, this._playbackRate = 1, this._inTimeline = !0, this._finishedFlag = !0, this.onfinish = null, this._finishHandlers = [], this._effect = b, this._inEffect = this._effect._update(0), this._idle = !0, this._currentTimePending = !1
                }, b.Animation.prototype = {
                    _ensureAlive: function() {
                        this.playbackRate < 0 && 0 === this.currentTime ? this._inEffect = this._effect._update(-1) : this._inEffect = this._effect._update(this.currentTime), this._inTimeline || !this._inEffect && this._finishedFlag || (this._inTimeline = !0, b.timeline._animations.push(this))
                    },
                    _tickCurrentTime: function(a, b) {
                        a != this._currentTime && (this._currentTime = a, this._isFinished && !b && (this._currentTime = this._playbackRate > 0 ? this._totalDuration : 0), this._ensureAlive())
                    },
                    get currentTime() {
                        return this._idle || this._currentTimePending ? null : this._currentTime
                    },
                    set currentTime(a) {
                        a = +a, isNaN(a) || (b.restart(), this._paused || null == this._startTime || (this._startTime = this._timeline.currentTime - a / this._playbackRate), this._currentTimePending = !1, this._currentTime != a && (this._idle && (this._idle = !1, this._paused = !0), this._tickCurrentTime(a, !0), b.applyDirtiedAnimation(this)))
                    },
                    get startTime() {
                        return this._startTime
                    },
                    set startTime(a) {
                        a = +a, isNaN(a) || this._paused || this._idle || (this._startTime = a, this._tickCurrentTime((this._timeline.currentTime - this._startTime) * this.playbackRate), b.applyDirtiedAnimation(this))
                    },
                    get playbackRate() {
                        return this._playbackRate
                    },
                    set playbackRate(a) {
                        if (a != this._playbackRate) {
                            var c = this.currentTime;
                            this._playbackRate = a, this._startTime = null, "paused" != this.playState && "idle" != this.playState && (this._finishedFlag = !1, this._idle = !1, this._ensureAlive(), b.applyDirtiedAnimation(this)), null != c && (this.currentTime = c)
                        }
                    },
                    get _isFinished() {
                        return !this._idle && (this._playbackRate > 0 && this._currentTime >= this._totalDuration || this._playbackRate < 0 && this._currentTime <= 0)
                    },
                    get _totalDuration() {
                        return this._effect._totalDuration
                    },
                    get playState() {
                        return this._idle ? "idle" : null == this._startTime && !this._paused && 0 != this.playbackRate || this._currentTimePending ? "pending" : this._paused ? "paused" : this._isFinished ? "finished" : "running"
                    },
                    _rewind: function() {
                        if (this._playbackRate >= 0) this._currentTime = 0;
                        else {
                            if (!(this._totalDuration < 1 / 0)) throw new DOMException("Unable to rewind negative playback rate animation with infinite duration", "InvalidStateError");
                            this._currentTime = this._totalDuration
                        }
                    },
                    play: function() {
                        this._paused = !1, (this._isFinished || this._idle) && (this._rewind(), this._startTime = null), this._finishedFlag = !1, this._idle = !1, this._ensureAlive(), b.applyDirtiedAnimation(this)
                    },
                    pause: function() {
                        this._isFinished || this._paused || this._idle ? this._idle && (this._rewind(), this._idle = !1) : this._currentTimePending = !0, this._startTime = null, this._paused = !0
                    },
                    finish: function() {
                        this._idle || (this.currentTime = this._playbackRate > 0 ? this._totalDuration : 0, this._startTime = this._totalDuration - this.currentTime, this._currentTimePending = !1, b.applyDirtiedAnimation(this))
                    },
                    cancel: function() {
                        this._inEffect && (this._inEffect = !1, this._idle = !0, this._paused = !1, this._finishedFlag = !0, this._currentTime = 0, this._startTime = null, this._effect._update(null), b.applyDirtiedAnimation(this))
                    },
                    reverse: function() {
                        this.playbackRate *= -1, this.play()
                    },
                    addEventListener: function(a, b) {
                        "function" == typeof b && "finish" == a && this._finishHandlers.push(b)
                    },
                    removeEventListener: function(a, b) {
                        if ("finish" == a) {
                            var c = this._finishHandlers.indexOf(b);
                            c >= 0 && this._finishHandlers.splice(c, 1)
                        }
                    },
                    _fireEvents: function(a) {
                        if (this._isFinished) {
                            if (!this._finishedFlag) {
                                var b = new d(this, this._currentTime, a),
                                    c = this._finishHandlers.concat(this.onfinish ? [this.onfinish] : []);
                                setTimeout(function() {
                                    c.forEach(function(a) {
                                        a.call(b.target, b)
                                    })
                                }, 0), this._finishedFlag = !0
                            }
                        } else this._finishedFlag = !1
                    },
                    _tick: function(a, b) {
                        this._idle || this._paused || (null == this._startTime ? b && (this.startTime = a - this._currentTime / this.playbackRate) : this._isFinished || this._tickCurrentTime((a - this._startTime) * this.playbackRate)), b && (this._currentTimePending = !1, this._fireEvents(a))
                    },
                    get _needsTick() {
                        return this.playState in {
                            pending: 1,
                            running: 1
                        } || !this._finishedFlag
                    },
                    _targetAnimations: function() {
                        var a = this._effect._target;
                        return a._activeAnimations || (a._activeAnimations = []), a._activeAnimations
                    },
                    _markTarget: function() {
                        var a = this._targetAnimations(); - 1 === a.indexOf(this) && a.push(this)
                    },
                    _unmarkTarget: function() {
                        var a = this._targetAnimations(),
                            b = a.indexOf(this); - 1 !== b && a.splice(b, 1)
                    }
                }
            }(a, b),
            function(a, b, c) {
                function d(a) {
                    var b = j;
                    j = [], a < q.currentTime && (a = q.currentTime), q._animations.sort(e), q._animations = h(a, !0, q._animations)[0], b.forEach(function(b) {
                        b[1](a)
                    }), g()
                }

                function e(a, b) {
                    return a._sequenceNumber - b._sequenceNumber
                }

                function f() {
                    this._animations = [], this.currentTime = window.performance && performance.now ? performance.now() : 0
                }

                function g() {
                    o.forEach(function(a) {
                        a()
                    }), o.length = 0
                }

                function h(a, c, d) {
                    p = !0, n = !1, b.timeline.currentTime = a, m = !1;
                    var e = [],
                        f = [],
                        g = [],
                        h = [];
                    return d.forEach(function(b) {
                        b._tick(a, c), b._inEffect ? (f.push(b._effect), b._markTarget()) : (e.push(b._effect), b._unmarkTarget()), b._needsTick && (m = !0);
                        var d = b._inEffect || b._needsTick;
                        b._inTimeline = d, d ? g.push(b) : h.push(b)
                    }), o.push.apply(o, e), o.push.apply(o, f), m && requestAnimationFrame(function() {}), p = !1, [g, h]
                }
                var i = window.requestAnimationFrame,
                    j = [],
                    k = 0;
                window.requestAnimationFrame = function(a) {
                    var b = k++;
                    return 0 == j.length && i(d), j.push([b, a]), b
                }, window.cancelAnimationFrame = function(a) {
                    j.forEach(function(b) {
                        b[0] == a && (b[1] = function() {})
                    })
                }, f.prototype = {
                    _play: function(c) {
                        c._timing = a.normalizeTimingInput(c.timing);
                        var d = new b.Animation(c);
                        return d._idle = !1, d._timeline = this, this._animations.push(d), b.restart(), b.applyDirtiedAnimation(d), d
                    }
                };
                var m = !1,
                    n = !1;
                b.restart = function() {
                    return m || (m = !0, requestAnimationFrame(function() {}), n = !0), n
                }, b.applyDirtiedAnimation = function(a) {
                    if (!p) {
                        a._markTarget();
                        var c = a._targetAnimations();
                        c.sort(e), h(b.timeline.currentTime, !1, c.slice())[1].forEach(function(a) {
                            var b = q._animations.indexOf(a); - 1 !== b && q._animations.splice(b, 1)
                        }), g()
                    }
                };
                var o = [],
                    p = !1,
                    q = new f;
                b.timeline = q
            }(a, b),
            function(a, b) {
                function c(a, b) {
                    for (var c = 0, d = 0; d < a.length; d++) c += a[d] * b[d];
                    return c
                }

                function d(a, b) {
                    return [a[0] * b[0] + a[4] * b[1] + a[8] * b[2] + a[12] * b[3], a[1] * b[0] + a[5] * b[1] + a[9] * b[2] + a[13] * b[3], a[2] * b[0] + a[6] * b[1] + a[10] * b[2] + a[14] * b[3], a[3] * b[0] + a[7] * b[1] + a[11] * b[2] + a[15] * b[3], a[0] * b[4] + a[4] * b[5] + a[8] * b[6] + a[12] * b[7], a[1] * b[4] + a[5] * b[5] + a[9] * b[6] + a[13] * b[7], a[2] * b[4] + a[6] * b[5] + a[10] * b[6] + a[14] * b[7], a[3] * b[4] + a[7] * b[5] + a[11] * b[6] + a[15] * b[7], a[0] * b[8] + a[4] * b[9] + a[8] * b[10] + a[12] * b[11], a[1] * b[8] + a[5] * b[9] + a[9] * b[10] + a[13] * b[11], a[2] * b[8] + a[6] * b[9] + a[10] * b[10] + a[14] * b[11], a[3] * b[8] + a[7] * b[9] + a[11] * b[10] + a[15] * b[11], a[0] * b[12] + a[4] * b[13] + a[8] * b[14] + a[12] * b[15], a[1] * b[12] + a[5] * b[13] + a[9] * b[14] + a[13] * b[15], a[2] * b[12] + a[6] * b[13] + a[10] * b[14] + a[14] * b[15], a[3] * b[12] + a[7] * b[13] + a[11] * b[14] + a[15] * b[15]]
                }

                function e(a) {
                    var b = a.rad || 0;
                    return ((a.deg || 0) / 360 + (a.grad || 0) / 400 + (a.turn || 0)) * (2 * Math.PI) + b
                }

                function f(a) {
                    switch (a.t) {
                        case "rotatex":
                            var b = e(a.d[0]);
                            return [1, 0, 0, 0, 0, Math.cos(b), Math.sin(b), 0, 0, -Math.sin(b), Math.cos(b), 0, 0, 0, 0, 1];
                        case "rotatey":
                            return b = e(a.d[0]), [Math.cos(b), 0, -Math.sin(b), 0, 0, 1, 0, 0, Math.sin(b), 0, Math.cos(b), 0, 0, 0, 0, 1];
                        case "rotate":
                        case "rotatez":
                            return b = e(a.d[0]), [Math.cos(b), Math.sin(b), 0, 0, -Math.sin(b), Math.cos(b), 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
                        case "rotate3d":
                            var c = a.d[0],
                                d = a.d[1],
                                f = a.d[2],
                                g = (b = e(a.d[3]), c * c + d * d + f * f);
                            if (0 === g) c = 1, d = 0, f = 0;
                            else if (1 !== g) {
                                var h = Math.sqrt(g);
                                c /= h, d /= h, f /= h
                            }
                            var i = Math.sin(b / 2),
                                j = i * Math.cos(b / 2),
                                k = i * i;
                            return [1 - 2 * (d * d + f * f) * k, 2 * (c * d * k + f * j), 2 * (c * f * k - d * j), 0, 2 * (c * d * k - f * j), 1 - 2 * (c * c + f * f) * k, 2 * (d * f * k + c * j), 0, 2 * (c * f * k + d * j), 2 * (d * f * k - c * j), 1 - 2 * (c * c + d * d) * k, 0, 0, 0, 0, 1];
                        case "scale":
                            return [a.d[0], 0, 0, 0, 0, a.d[1], 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
                        case "scalex":
                            return [a.d[0], 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
                        case "scaley":
                            return [1, 0, 0, 0, 0, a.d[0], 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
                        case "scalez":
                            return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, a.d[0], 0, 0, 0, 0, 1];
                        case "scale3d":
                            return [a.d[0], 0, 0, 0, 0, a.d[1], 0, 0, 0, 0, a.d[2], 0, 0, 0, 0, 1];
                        case "skew":
                            var l = e(a.d[0]),
                                m = e(a.d[1]);
                            return [1, Math.tan(m), 0, 0, Math.tan(l), 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
                        case "skewx":
                            return b = e(a.d[0]), [1, 0, 0, 0, Math.tan(b), 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
                        case "skewy":
                            return b = e(a.d[0]), [1, Math.tan(b), 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
                        case "translate":
                            return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, c = a.d[0].px || 0, d = a.d[1].px || 0, 0, 1];
                        case "translatex":
                            return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, c = a.d[0].px || 0, 0, 0, 1];
                        case "translatey":
                            return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, d = a.d[0].px || 0, 0, 1];
                        case "translatez":
                            return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, f = a.d[0].px || 0, 1];
                        case "translate3d":
                            return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, c = a.d[0].px || 0, d = a.d[1].px || 0, f = a.d[2].px || 0, 1];
                        case "perspective":
                            return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, a.d[0].px ? -1 / a.d[0].px : 0, 0, 0, 0, 1];
                        case "matrix":
                            return [a.d[0], a.d[1], 0, 0, a.d[2], a.d[3], 0, 0, 0, 0, 1, 0, a.d[4], a.d[5], 0, 1];
                        case "matrix3d":
                            return a.d
                    }
                }

                function g(a) {
                    return 0 === a.length ? [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] : a.map(f).reduce(d)
                }
                var i = function() {
                    function a(a) {
                        return a[0][0] * a[1][1] * a[2][2] + a[1][0] * a[2][1] * a[0][2] + a[2][0] * a[0][1] * a[1][2] - a[0][2] * a[1][1] * a[2][0] - a[1][2] * a[2][1] * a[0][0] - a[2][2] * a[0][1] * a[1][0]
                    }

                    function f(a) {
                        var b = g(a);
                        return [a[0] / b, a[1] / b, a[2] / b]
                    }

                    function g(a) {
                        return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2])
                    }

                    function h(a, b, c, d) {
                        return [c * a[0] + d * b[0], c * a[1] + d * b[1], c * a[2] + d * b[2]]
                    }
                    return function j(j) {
                        var k = [j.slice(0, 4), j.slice(4, 8), j.slice(8, 12), j.slice(12, 16)];
                        if (1 !== k[3][3]) return null;
                        for (var l = [], m = 0; m < 4; m++) l.push(k[m].slice());
                        for (m = 0; m < 3; m++) l[m][3] = 0;
                        if (0 === a(l)) return null;
                        var n, o = [];
                        k[0][3] || k[1][3] || k[2][3] ? (o.push(k[0][3]), o.push(k[1][3]), o.push(k[2][3]), o.push(k[3][3]), n = function e(a, b) {
                            for (var c = [], d = 0; d < 4; d++) {
                                for (var e = 0, f = 0; f < 4; f++) e += a[f] * b[f][d];
                                c.push(e)
                            }
                            return c
                        }(o, function d(a) {
                            return [
                                [a[0][0], a[1][0], a[2][0], a[3][0]],
                                [a[0][1], a[1][1], a[2][1], a[3][1]],
                                [a[0][2], a[1][2], a[2][2], a[3][2]],
                                [a[0][3], a[1][3], a[2][3], a[3][3]]
                            ]
                        }(function b(b) {
                            for (var c = 1 / a(b), d = b[0][0], e = b[0][1], f = b[0][2], g = b[1][0], h = b[1][1], i = b[1][2], j = b[2][0], k = b[2][1], l = b[2][2], m = [
                                    [(h * l - i * k) * c, (f * k - e * l) * c, (e * i - f * h) * c, 0],
                                    [(i * j - g * l) * c, (d * l - f * j) * c, (f * g - d * i) * c, 0],
                                    [(g * k - h * j) * c, (j * e - d * k) * c, (d * h - e * g) * c, 0]
                                ], n = [], o = 0; o < 3; o++) {
                                for (var p = 0, q = 0; q < 3; q++) p += b[3][q] * m[q][o];
                                n.push(p)
                            }
                            return n.push(1), m.push(n), m
                        }(l)))) : n = [0, 0, 0, 1];
                        var p = k[3].slice(0, 3),
                            q = [];
                        q.push(k[0].slice(0, 3));
                        var r = [];
                        r.push(g(q[0])), q[0] = f(q[0]);
                        var s = [];
                        q.push(k[1].slice(0, 3)), s.push(c(q[0], q[1])), q[1] = h(q[1], q[0], 1, -s[0]), r.push(g(q[1])), q[1] = f(q[1]), s[0] /= r[1], q.push(k[2].slice(0, 3)), s.push(c(q[0], q[2])), q[2] = h(q[2], q[0], 1, -s[1]), s.push(c(q[1], q[2])), q[2] = h(q[2], q[1], 1, -s[2]), r.push(g(q[2])), q[2] = f(q[2]), s[1] /= r[2], s[2] /= r[2];
                        var t = function i(a, b) {
                            return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
                        }(q[1], q[2]);
                        if (c(q[0], t) < 0)
                            for (m = 0; m < 3; m++) r[m] *= -1, q[m][0] *= -1, q[m][1] *= -1, q[m][2] *= -1;
                        var u, v, w = q[0][0] + q[1][1] + q[2][2] + 1;
                        return w > 1e-4 ? (u = .5 / Math.sqrt(w), v = [(q[2][1] - q[1][2]) * u, (q[0][2] - q[2][0]) * u, (q[1][0] - q[0][1]) * u, .25 / u]) : q[0][0] > q[1][1] && q[0][0] > q[2][2] ? v = [.25 * (u = 2 * Math.sqrt(1 + q[0][0] - q[1][1] - q[2][2])), (q[0][1] + q[1][0]) / u, (q[0][2] + q[2][0]) / u, (q[2][1] - q[1][2]) / u] : q[1][1] > q[2][2] ? (u = 2 * Math.sqrt(1 + q[1][1] - q[0][0] - q[2][2]), v = [(q[0][1] + q[1][0]) / u, .25 * u, (q[1][2] + q[2][1]) / u, (q[0][2] - q[2][0]) / u]) : (u = 2 * Math.sqrt(1 + q[2][2] - q[0][0] - q[1][1]), v = [(q[0][2] + q[2][0]) / u, (q[1][2] + q[2][1]) / u, .25 * u, (q[1][0] - q[0][1]) / u]), [p, r, s, v, n]
                    }
                }();
                a.dot = c, a.makeMatrixDecomposition = function h(a) {
                    return [i(g(a))]
                }, a.transformListToMatrix = g
            }(b),
            function(a) {
                function b(a, b) {
                    var c = a.exec(b);
                    if (c) return [c = a.ignoreCase ? c[0].toLowerCase() : c[0], b.substr(c.length)]
                }

                function c(a, b) {
                    var c = a(b = b.replace(/^\s*/, ""));
                    if (c) return [c[0], c[1].replace(/^\s*/, "")]
                }

                function j(a, b, c, d, e) {
                    for (var g = [], h = [], i = [], j = function f(a, b) {
                            for (var c = a, d = b; c && d;) c > d ? c %= d : d %= c;
                            return a * b / (c + d)
                        }(d.length, e.length), k = 0; k < j; k++) {
                        var l = b(d[k % d.length], e[k % e.length]);
                        if (!l) return;
                        g.push(l[0]), h.push(l[1]), i.push(l[2])
                    }
                    return [g, h, function(b) {
                        var d = b.map(function(a, b) {
                            return i[b](a)
                        }).join(c);
                        return a ? a(d) : d
                    }]
                }
                a.consumeToken = b, a.consumeTrimmed = c, a.consumeRepeated = function d(a, d, e) {
                    a = c.bind(null, a);
                    for (var f = [];;) {
                        var g = a(e);
                        if (!g) return [f, e];
                        if (f.push(g[0]), !(g = b(d, e = g[1])) || "" == g[1]) return [f, e];
                        e = g[1]
                    }
                }, a.consumeParenthesised = function e(a, b) {
                    for (var c = 0, d = 0; d < b.length && (!/\s|,/.test(b[d]) || 0 != c); d++)
                        if ("(" == b[d]) c++;
                        else if (")" == b[d] && (0 == --c && d++, c <= 0)) break;
                    var e = a(b.substr(0, d));
                    return null == e ? void 0 : [e, b.substr(d)]
                }, a.ignore = function g(a) {
                    return function(b) {
                        var c = a(b);
                        return c && (c[0] = void 0), c
                    }
                }, a.optional = function h(a, b) {
                    return function(c) {
                        return a(c) || [b, c]
                    }
                }, a.consumeList = function i(b, c) {
                    for (var d = [], e = 0; e < b.length; e++) {
                        var f = a.consumeTrimmed(b[e], c);
                        if (!f || "" == f[0]) return;
                        void 0 !== f[0] && d.push(f[0]), c = f[1]
                    }
                    if ("" == c) return d
                }, a.mergeNestedRepeated = j.bind(null, null), a.mergeWrappedNestedRepeated = j, a.mergeList = function k(a, b, c) {
                    for (var d = [], e = [], f = [], g = 0, h = 0; h < c.length; h++)
                        if ("function" == typeof c[h]) {
                            var i = c[h](a[g], b[g++]);
                            d.push(i[0]), e.push(i[1]), f.push(i[2])
                        } else ! function(a) {
                            d.push(!1), e.push(!1), f.push(function() {
                                return c[a]
                            })
                        }(h);
                    return [d, e, function(a) {
                        for (var b = "", c = 0; c < a.length; c++) b += f[c](a[c]);
                        return b
                    }]
                }
            }(b),
            function(a) {
                function b(b) {
                    var d = {
                            inset: !1,
                            lengths: [],
                            color: null
                        },
                        e = a.consumeRepeated(function c(b) {
                            var c = a.consumeToken(/^inset/i, b);
                            return c ? (d.inset = !0, c) : (c = a.consumeLengthOrPercent(b)) ? (d.lengths.push(c[0]), c) : (c = a.consumeColor(b)) ? (d.color = c[0], c) : void 0
                        }, /^/, b);
                    if (e && e[0].length) return [d, e[1]]
                }
                var f = function e(b, c, d, e) {
                    function f(a) {
                        return {
                            inset: a,
                            color: [0, 0, 0, 0],
                            lengths: [{
                                px: 0
                            }, {
                                px: 0
                            }, {
                                px: 0
                            }, {
                                px: 0
                            }]
                        }
                    }
                    for (var g = [], h = [], i = 0; i < d.length || i < e.length; i++) {
                        var j = d[i] || f(e[i].inset),
                            k = e[i] || f(d[i].inset);
                        g.push(j), h.push(k)
                    }
                    return a.mergeNestedRepeated(b, c, g, h)
                }.bind(null, function d(b, c) {
                    for (; b.lengths.length < Math.max(b.lengths.length, c.lengths.length);) b.lengths.push({
                        px: 0
                    });
                    for (; c.lengths.length < Math.max(b.lengths.length, c.lengths.length);) c.lengths.push({
                        px: 0
                    });
                    if (b.inset == c.inset && !!b.color == !!c.color) {
                        for (var d, e = [], f = [
                                [], 0
                            ], g = [
                                [], 0
                            ], h = 0; h < b.lengths.length; h++) {
                            var i = a.mergeDimensions(b.lengths[h], c.lengths[h], 2 == h);
                            f[0].push(i[0]), g[0].push(i[1]), e.push(i[2])
                        }
                        if (b.color && c.color) {
                            var j = a.mergeColors(b.color, c.color);
                            f[1] = j[0], g[1] = j[1], d = j[2]
                        }
                        return [f, g, function(a) {
                            for (var c = b.inset ? "inset " : " ", f = 0; f < e.length; f++) c += e[f](a[0][f]) + " ";
                            return d && (c += d(a[1])), c
                        }]
                    }
                }, ", ");
                a.addPropertiesHandler(function c(c) {
                    var d = a.consumeRepeated(b, /^,/, c);
                    if (d && "" == d[1]) return d[0]
                }, f, ["box-shadow", "text-shadow"])
            }(b),
            function(a, b) {
                function c(a) {
                    return a.toFixed(3).replace(/0+$/, "").replace(/\.$/, "")
                }

                function d(a, b, c) {
                    return Math.min(b, Math.max(a, c))
                }

                function e(a) {
                    if (/^\s*[-+]?(\d*\.)?\d+\s*$/.test(a)) return Number(a)
                }

                function i(a, b) {
                    return function(e, f) {
                        return [e, f, function(e) {
                            return c(d(a, b, e))
                        }]
                    }
                }

                function j(a) {
                    var b = a.trim().split(/\s*[\s,]\s*/);
                    if (0 !== b.length) {
                        for (var c = [], d = 0; d < b.length; d++) {
                            var f = e(b[d]);
                            if (void 0 === f) return;
                            c.push(f)
                        }
                        return c
                    }
                }
                a.clamp = d, a.addPropertiesHandler(j, function k(a, b) {
                    if (a.length == b.length) return [a, b, function(a) {
                        return a.map(c).join(" ")
                    }]
                }, ["stroke-dasharray"]), a.addPropertiesHandler(e, i(0, 1 / 0), ["border-image-width", "line-height"]), a.addPropertiesHandler(e, i(0, 1), ["opacity", "shape-image-threshold"]), a.addPropertiesHandler(e, function g(a, b) {
                    if (0 != a) return i(0, 1 / 0)(a, b)
                }, ["flex-grow", "flex-shrink"]), a.addPropertiesHandler(e, function h(a, b) {
                    return [a, b, function(a) {
                        return Math.round(d(1, 1 / 0, a))
                    }]
                }, ["orphans", "widows"]), a.addPropertiesHandler(e, function l(a, b) {
                    return [a, b, Math.round]
                }, ["z-index"]), a.parseNumber = e, a.parseNumberList = j, a.mergeNumbers = function f(a, b) {
                    return [a, b, c]
                }, a.numberToString = c
            }(b),
            function(a, b) {
                a.addPropertiesHandler(String, function c(a, b) {
                    if ("visible" == a || "visible" == b) return [0, 1, function(c) {
                        return c <= 0 ? a : c >= 1 ? b : "visible"
                    }]
                }, ["visibility"])
            }(b),
            function(a, b) {
                function c(a) {
                    a = a.trim(), f.fillStyle = "#000", f.fillStyle = a;
                    var b = f.fillStyle;
                    if (f.fillStyle = "#fff", f.fillStyle = a, b == f.fillStyle) {
                        f.fillRect(0, 0, 1, 1);
                        var c = f.getImageData(0, 0, 1, 1).data;
                        f.clearRect(0, 0, 1, 1);
                        var d = c[3] / 255;
                        return [c[0] * d, c[1] * d, c[2] * d, d]
                    }
                }

                function d(b, c) {
                    return [b, c, function(b) {
                        function c(a) {
                            return Math.max(0, Math.min(255, a))
                        }
                        if (b[3])
                            for (var d = 0; d < 3; d++) b[d] = Math.round(c(b[d] / b[3]));
                        return b[3] = a.numberToString(a.clamp(0, 1, b[3])), "rgba(" + b.join(",") + ")"
                    }]
                }
                var e = document.createElementNS("http://www.w3.org/1999/xhtml", "canvas");
                e.width = e.height = 1;
                var f = e.getContext("2d");
                a.addPropertiesHandler(c, d, ["background-color", "border-bottom-color", "border-left-color", "border-right-color", "border-top-color", "color", "fill", "flood-color", "lighting-color", "outline-color", "stop-color", "stroke", "text-decoration-color"]), a.consumeColor = a.consumeParenthesised.bind(null, c), a.mergeColors = d
            }(b),
            function(a, b) {
                function c(a) {
                    function b() {
                        var b = h.exec(a);
                        g = b ? b[0] : void 0
                    }

                    function d() {
                        if ("(" !== g) return function c() {
                            var a = Number(g);
                            return b(), a
                        }();
                        b();
                        var a = f();
                        return ")" !== g ? NaN : (b(), a)
                    }

                    function e() {
                        for (var a = d();
                            "*" === g || "/" === g;) {
                            var c = g;
                            b();
                            var e = d();
                            "*" === c ? a *= e : a /= e
                        }
                        return a
                    }

                    function f() {
                        for (var a = e();
                            "+" === g || "-" === g;) {
                            var c = g;
                            b();
                            var d = e();
                            "+" === c ? a += d : a -= d
                        }
                        return a
                    }
                    var g, h = /([\+\-\w\.]+|[\(\)\*\/])/g;
                    return b(), f()
                }

                function d(a, b) {
                    if ("0" == (b = b.trim().toLowerCase()) && "px".search(a) >= 0) return {
                        px: 0
                    };
                    if (/^[^(]*$|^calc/.test(b)) {
                        b = b.replace(/calc\(/g, "(");
                        var d = {};
                        b = b.replace(a, function(a) {
                            return d[a] = null, "U" + a
                        });
                        for (var e = "U(" + a.source + ")", f = b.replace(/[-+]?(\d*\.)?\d+([Ee][-+]?\d+)?/g, "N").replace(new RegExp("N" + e, "g"), "D").replace(/\s[+-]\s/g, "O").replace(/\s/g, ""), g = [/N\*(D)/g, /(N|D)[*\/]N/g, /(N|D)O\1/g, /\((N|D)\)/g], h = 0; h < g.length;) g[h].test(f) ? (f = f.replace(g[h], "$1"), h = 0) : h++;
                        if ("D" == f) {
                            for (var i in d) {
                                var j = c(b.replace(new RegExp("U" + i, "g"), "").replace(new RegExp(e, "g"), "*0"));
                                if (!isFinite(j)) return;
                                d[i] = j
                            }
                            return d
                        }
                    }
                }

                function e(a, b) {
                    return f(a, b, !0)
                }

                function f(b, c, d) {
                    var e, f = [];
                    for (e in b) f.push(e);
                    for (e in c) f.indexOf(e) < 0 && f.push(e);
                    return b = f.map(function(a) {
                        return b[a] || 0
                    }), c = f.map(function(a) {
                        return c[a] || 0
                    }), [b, c, function(b) {
                        var c = b.map(function(c, e) {
                            return 1 == b.length && d && (c = Math.max(c, 0)), a.numberToString(c) + f[e]
                        }).join(" + ");
                        return b.length > 1 ? "calc(" + c + ")" : c
                    }]
                }
                var g = "px|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc",
                    h = d.bind(null, new RegExp(g, "g")),
                    i = d.bind(null, new RegExp(g + "|%", "g")),
                    j = d.bind(null, /deg|rad|grad|turn/g);
                a.parseLength = h, a.parseLengthOrPercent = i, a.consumeLengthOrPercent = a.consumeParenthesised.bind(null, i), a.parseAngle = j, a.mergeDimensions = f;
                var k = a.consumeParenthesised.bind(null, h),
                    l = a.consumeRepeated.bind(void 0, k, /^/),
                    m = a.consumeRepeated.bind(void 0, l, /^,/);
                a.consumeSizePairList = m;
                var o = a.mergeNestedRepeated.bind(void 0, e, " "),
                    p = a.mergeNestedRepeated.bind(void 0, o, ",");
                a.mergeNonNegativeSizePair = o, a.addPropertiesHandler(function(a) {
                    var b = m(a);
                    if (b && "" == b[1]) return b[0]
                }, p, ["background-size"]), a.addPropertiesHandler(i, e, ["border-bottom-width", "border-image-width", "border-left-width", "border-right-width", "border-top-width", "flex-basis", "font-size", "height", "line-height", "max-height", "max-width", "outline-width", "width"]), a.addPropertiesHandler(i, f, ["border-bottom-left-radius", "border-bottom-right-radius", "border-top-left-radius", "border-top-right-radius", "bottom", "left", "letter-spacing", "margin-bottom", "margin-left", "margin-right", "margin-top", "min-height", "min-width", "outline-offset", "padding-bottom", "padding-left", "padding-right", "padding-top", "perspective", "right", "shape-margin", "stroke-dashoffset", "text-indent", "top", "vertical-align", "word-spacing"])
            }(b),
            function(a, b) {
                function c(b) {
                    return a.consumeLengthOrPercent(b) || a.consumeToken(/^auto/, b)
                }

                function d(b) {
                    var d = a.consumeList([a.ignore(a.consumeToken.bind(null, /^rect/)), a.ignore(a.consumeToken.bind(null, /^\(/)), a.consumeRepeated.bind(null, c, /^,/), a.ignore(a.consumeToken.bind(null, /^\)/))], b);
                    if (d && 4 == d[0].length) return d[0]
                }
                var g = a.mergeWrappedNestedRepeated.bind(null, function f(a) {
                    return "rect(" + a + ")"
                }, function e(b, c) {
                    return "auto" == b || "auto" == c ? [!0, !1, function(d) {
                        var e = d ? b : c;
                        if ("auto" == e) return "auto";
                        var f = a.mergeDimensions(e, e);
                        return f[2](f[0])
                    }] : a.mergeDimensions(b, c)
                }, ", ");
                a.parseBox = d, a.mergeBoxes = g, a.addPropertiesHandler(d, g, ["clip"])
            }(b),
            function(a, b) {
                function c(a) {
                    return function(b) {
                        var c = 0;
                        return a.map(function(a) {
                            return a === k ? b[c++] : a
                        })
                    }
                }

                function d(a) {
                    return a
                }

                function e(b) {
                    if ("none" == (b = b.toLowerCase().trim())) return [];
                    for (var c, d = /\s*(\w+)\(([^)]*)\)/g, e = [], f = 0; c = d.exec(b);) {
                        if (c.index != f) return;
                        f = c.index + c[0].length;
                        var g = c[1],
                            h = n[g];
                        if (!h) return;
                        var i = c[2].split(","),
                            j = h[0];
                        if (j.length < i.length) return;
                        for (var k = [], o = 0; o < j.length; o++) {
                            var p, q = i[o],
                                r = j[o];
                            if (void 0 === (p = q ? {
                                    A: function(b) {
                                        return "0" == b.trim() ? m : a.parseAngle(b)
                                    },
                                    N: a.parseNumber,
                                    T: a.parseLengthOrPercent,
                                    L: a.parseLength
                                } [r.toUpperCase()](q) : {
                                    a: m,
                                    n: k[0],
                                    t: l
                                } [r])) return;
                            k.push(p)
                        }
                        if (e.push({
                                t: g,
                                d: k
                            }), d.lastIndex == b.length) return e
                    }
                }

                function f(a) {
                    return a.toFixed(6).replace(".000000", "")
                }

                function g(b, c) {
                    if (b.decompositionPair !== c) {
                        b.decompositionPair = c;
                        var d = a.makeMatrixDecomposition(b)
                    }
                    if (c.decompositionPair !== b) {
                        c.decompositionPair = b;
                        var e = a.makeMatrixDecomposition(c)
                    }
                    return null == d[0] || null == e[0] ? [
                        [!1],
                        [!0],
                        function(a) {
                            return a ? c[0].d : b[0].d
                        }
                    ] : (d[0].push(0), e[0].push(1), [d, e, function(b) {
                        var c = a.quat(d[0][3], e[0][3], b[5]);
                        return a.composeMatrix(b[0], b[1], b[2], c, b[4]).map(f).join(",")
                    }])
                }

                function h(a) {
                    return a.replace(/[xy]/, "")
                }

                function i(a) {
                    return a.replace(/(x|y|z|3d)?$/, "3d")
                }
                var k = null,
                    l = {
                        px: 0
                    },
                    m = {
                        deg: 0
                    },
                    n = {
                        matrix: ["NNNNNN", [k, k, 0, 0, k, k, 0, 0, 0, 0, 1, 0, k, k, 0, 1], d],
                        matrix3d: ["NNNNNNNNNNNNNNNN", d],
                        rotate: ["A"],
                        rotatex: ["A"],
                        rotatey: ["A"],
                        rotatez: ["A"],
                        rotate3d: ["NNNA"],
                        perspective: ["L"],
                        scale: ["Nn", c([k, k, 1]), d],
                        scalex: ["N", c([k, 1, 1]), c([k, 1])],
                        scaley: ["N", c([1, k, 1]), c([1, k])],
                        scalez: ["N", c([1, 1, k])],
                        scale3d: ["NNN", d],
                        skew: ["Aa", null, d],
                        skewx: ["A", null, c([k, m])],
                        skewy: ["A", null, c([m, k])],
                        translate: ["Tt", c([k, k, l]), d],
                        translatex: ["T", c([k, l, l]), c([k, l])],
                        translatey: ["T", c([l, k, l]), c([l, k])],
                        translatez: ["L", c([l, l, k])],
                        translate3d: ["TTL", d]
                    };
                a.addPropertiesHandler(e, function j(b, c) {
                    var d = a.makeMatrixDecomposition && !0,
                        e = !1;
                    if (!b.length || !c.length) {
                        b.length || (e = !0, b = c, c = []);
                        for (var f = 0; f < b.length; f++) {
                            var j = b[f].t,
                                k = b[f].d,
                                l = "scale" == j.substr(0, 5) ? 1 : 0;
                            c.push({
                                t: j,
                                d: k.map(function(a) {
                                    if ("number" == typeof a) return l;
                                    var b = {};
                                    for (var c in a) b[c] = l;
                                    return b
                                })
                            })
                        }
                    }
                    var m = function(a, b) {
                            return "perspective" == a && "perspective" == b || ("matrix" == a || "matrix3d" == a) && ("matrix" == b || "matrix3d" == b)
                        },
                        o = [],
                        p = [],
                        q = [];
                    if (b.length != c.length) {
                        if (!d) return;
                        o = [(r = g(b, c))[0]], p = [r[1]], q = [
                            ["matrix", [r[2]]]
                        ]
                    } else
                        for (f = 0; f < b.length; f++) {
                            var s = b[f].t,
                                t = c[f].t,
                                u = b[f].d,
                                v = c[f].d,
                                w = n[s],
                                x = n[t];
                            if (m(s, t)) {
                                if (!d) return;
                                var r = g([b[f]], [c[f]]);
                                o.push(r[0]), p.push(r[1]), q.push(["matrix", [r[2]]])
                            } else {
                                if (s == t) j = s;
                                else if (w[2] && x[2] && h(s) == h(t)) j = h(s), u = w[2](u), v = x[2](v);
                                else {
                                    if (!w[1] || !x[1] || i(s) != i(t)) {
                                        if (!d) return;
                                        o = [(r = g(b, c))[0]], p = [r[1]], q = [
                                            ["matrix", [r[2]]]
                                        ];
                                        break
                                    }
                                    j = i(s), u = w[1](u), v = x[1](v)
                                }
                                for (var y = [], z = [], A = [], B = 0; B < u.length; B++) r = ("number" == typeof u[B] ? a.mergeNumbers : a.mergeDimensions)(u[B], v[B]), y[B] = r[0], z[B] = r[1], A.push(r[2]);
                                o.push(y), p.push(z), q.push([j, A])
                            }
                        }
                    if (e) {
                        var D = o;
                        o = p, p = D
                    }
                    return [o, p, function(a) {
                        return a.map(function(a, b) {
                            var c = a.map(function(a, c) {
                                return q[b][1][c](a)
                            }).join(",");
                            return "matrix" == q[b][0] && 16 == c.split(",").length && (q[b][0] = "matrix3d"), q[b][0] + "(" + c + ")"
                        }).join(" ")
                    }]
                }, ["transform"]), a.transformToSvgMatrix = function(b) {
                    var c = a.transformListToMatrix(e(b));
                    return "matrix(" + f(c[0]) + " " + f(c[1]) + " " + f(c[4]) + " " + f(c[5]) + " " + f(c[12]) + " " + f(c[13]) + ")"
                }
            }(b),
            function(a) {
                function c(b) {
                    return b = 100 * Math.round(b / 100), 400 === (b = a.clamp(100, 900, b)) ? "normal" : 700 === b ? "bold" : String(b)
                }
                a.addPropertiesHandler(function b(a) {
                    var b = Number(a);
                    if (!(isNaN(b) || b < 100 || b > 900 || b % 100 != 0)) return b
                }, function d(a, b) {
                    return [a, b, c]
                }, ["font-weight"])
            }(b),
            function(a) {
                function b(a) {
                    var b = {};
                    for (var c in a) b[c] = -a[c];
                    return b
                }

                function c(b) {
                    return a.consumeToken(/^(left|center|right|top|bottom)\b/i, b) || a.consumeLengthOrPercent(b)
                }

                function d(b, d) {
                    var e = a.consumeRepeated(c, /^/, d);
                    if (e && "" == e[1]) {
                        var f = e[0];
                        if (f[0] = f[0] || "center", f[1] = f[1] || "center", 3 == b && (f[2] = f[2] || {
                                px: 0
                            }), f.length == b) {
                            if (/top|bottom/.test(f[0]) || /left|right/.test(f[1])) {
                                var h = f[0];
                                f[0] = f[1], f[1] = h
                            }
                            if (/left|right|center|Object/.test(f[0]) && /top|bottom|center|Object/.test(f[1])) return f.map(function(a) {
                                return "object" == typeof a ? a : g[a]
                            })
                        }
                    }
                }

                function e(d) {
                    var e = a.consumeRepeated(c, /^/, d);
                    if (e) {
                        for (var f = e[0], h = [{
                                "%": 50
                            }, {
                                "%": 50
                            }], i = 0, j = !1, k = 0; k < f.length; k++) {
                            var l = f[k];
                            "string" == typeof l ? (j = /bottom|right/.test(l), h[i = {
                                left: 0,
                                right: 0,
                                center: i,
                                top: 1,
                                bottom: 1
                            } [l]] = g[l], "center" == l && i++) : (j && ((l = b(l))["%"] = (l["%"] || 0) + 100), h[i] = l, i++, j = !1)
                        }
                        return [h, e[1]]
                    }
                }
                var g = {
                        left: {
                            "%": 0
                        },
                        center: {
                            "%": 50
                        },
                        right: {
                            "%": 100
                        },
                        top: {
                            "%": 0
                        },
                        bottom: {
                            "%": 100
                        }
                    },
                    h = a.mergeNestedRepeated.bind(null, a.mergeDimensions, " ");
                a.addPropertiesHandler(d.bind(null, 3), h, ["transform-origin"]), a.addPropertiesHandler(d.bind(null, 2), h, ["perspective-origin"]), a.consumePosition = e, a.mergeOffsetList = h;
                var i = a.mergeNestedRepeated.bind(null, h, ", ");
                a.addPropertiesHandler(function f(b) {
                    var c = a.consumeRepeated(e, /^,/, b);
                    if (c && "" == c[1]) return c[0]
                }, i, ["background-position", "object-position"])
            }(b),
            function(a) {
                var d = a.consumeParenthesised.bind(null, a.parseLengthOrPercent),
                    e = a.consumeRepeated.bind(void 0, d, /^/),
                    f = a.mergeNestedRepeated.bind(void 0, a.mergeDimensions, " "),
                    g = a.mergeNestedRepeated.bind(void 0, f, ",");
                a.addPropertiesHandler(function b(b) {
                    var c = a.consumeToken(/^circle/, b);
                    if (c && c[0]) return ["circle"].concat(a.consumeList([a.ignore(a.consumeToken.bind(void 0, /^\(/)), d, a.ignore(a.consumeToken.bind(void 0, /^at/)), a.consumePosition, a.ignore(a.consumeToken.bind(void 0, /^\)/))], c[1]));
                    var f = a.consumeToken(/^ellipse/, b);
                    if (f && f[0]) return ["ellipse"].concat(a.consumeList([a.ignore(a.consumeToken.bind(void 0, /^\(/)), e, a.ignore(a.consumeToken.bind(void 0, /^at/)), a.consumePosition, a.ignore(a.consumeToken.bind(void 0, /^\)/))], f[1]));
                    var g = a.consumeToken(/^polygon/, b);
                    return g && g[0] ? ["polygon"].concat(a.consumeList([a.ignore(a.consumeToken.bind(void 0, /^\(/)), a.optional(a.consumeToken.bind(void 0, /^nonzero\s*,|^evenodd\s*,/), "nonzero,"), a.consumeSizePairList, a.ignore(a.consumeToken.bind(void 0, /^\)/))], g[1])) : void 0
                }, function c(b, c) {
                    if (b[0] === c[0]) return "circle" == b[0] ? a.mergeList(b.slice(1), c.slice(1), ["circle(", a.mergeDimensions, " at ", a.mergeOffsetList, ")"]) : "ellipse" == b[0] ? a.mergeList(b.slice(1), c.slice(1), ["ellipse(", a.mergeNonNegativeSizePair, " at ", a.mergeOffsetList, ")"]) : "polygon" == b[0] && b[1] == c[1] ? a.mergeList(b.slice(2), c.slice(2), ["polygon(", b[1], g, ")"]) : void 0
                }, ["shape-outside"])
            }(b),
            function(a, b) {
                function c(a, b) {
                    b.concat([a]).forEach(function(b) {
                        b in document.documentElement.style && (d[a] = b), e[b] = a
                    })
                }
                var d = {},
                    e = {};
                c("transform", ["webkitTransform", "msTransform"]), c("transformOrigin", ["webkitTransformOrigin"]), c("perspective", ["webkitPerspective"]), c("perspectiveOrigin", ["webkitPerspectiveOrigin"]), a.propertyName = function(a) {
                    return d[a] || a
                }, a.unprefixedPropertyName = function(a) {
                    return e[a] || a
                }
            }(b)
        }(),
        function() {
            if (void 0 === document.createElement("div").animate([]).oncancel) {
                if (window.performance && performance.now) var a = function() {
                    return performance.now()
                };
                else a = function() {
                    return Date.now()
                };
                var b = function(a, b, c) {
                        this.target = a, this.currentTime = b, this.timelineTime = c, this.type = "cancel", this.bubbles = !1, this.cancelable = !1, this.currentTarget = a, this.defaultPrevented = !1, this.eventPhase = Event.AT_TARGET, this.timeStamp = Date.now()
                    },
                    c = window.Element.prototype.animate;
                window.Element.prototype.animate = function(d, e) {
                    var f = c.call(this, d, e);
                    f._cancelHandlers = [], f.oncancel = null;
                    var g = f.cancel;
                    f.cancel = function() {
                        g.call(this);
                        var c = new b(this, null, a()),
                            d = this._cancelHandlers.concat(this.oncancel ? [this.oncancel] : []);
                        setTimeout(function() {
                            d.forEach(function(a) {
                                a.call(c.target, c)
                            })
                        }, 0)
                    };
                    var h = f.addEventListener;
                    f.addEventListener = function(a, b) {
                        "function" == typeof b && "cancel" == a ? this._cancelHandlers.push(b) : h.call(this, a, b)
                    };
                    var i = f.removeEventListener;
                    return f.removeEventListener = function(a, b) {
                        if ("cancel" == a) {
                            var c = this._cancelHandlers.indexOf(b);
                            c >= 0 && this._cancelHandlers.splice(c, 1)
                        } else i.call(this, a, b)
                    }, f
                }
            }
        }(),
        function(a) {
            var b = document.documentElement,
                c = null,
                d = !1;
            try {
                var f = "0" == getComputedStyle(b).getPropertyValue("opacity") ? "1" : "0";
                (c = b.animate({
                    opacity: [f, f]
                }, {
                    duration: 1
                })).currentTime = 0, d = getComputedStyle(b).getPropertyValue("opacity") == f
            } catch (a) {} finally {
                c && c.cancel()
            }
            if (!d) {
                var g = window.Element.prototype.animate;
                window.Element.prototype.animate = function(b, c) {
                    return window.Symbol && Symbol.iterator && Array.prototype.from && b[Symbol.iterator] && (b = Array.from(b)), Array.isArray(b) || null === b || (b = a.convertToArrayForm(b)), g.call(this, b, c)
                }
            }
        }(a)
}, function(module, exports, __webpack_require__) {
    (function(global) {
        module.exports = global.Muuri = __webpack_require__(67)
    }).call(this, __webpack_require__(0))
}, function(module, exports, __webpack_require__) {
    /**
     * Muuri v0.7.1
     * https://github.com/haltu/muuri
     * Copyright (c) 2015-present, Haltu Oy
     * Released under the MIT license
     * https://github.com/haltu/muuri/blob/master/LICENSE.md
     * @license MIT
     *
     * Muuri Packer
     * Copyright (c) 2016-present, Niklas Rämö <inramo@gmail.com>
     * @license MIT
     *
     * Muuri Ticker / Muuri Emitter / Muuri Queue
     * Copyright (c) 2018-present, Niklas Rämö <inramo@gmail.com>
     * @license MIT
     */
    ! function(global, factory) {
        var Hammer;
        try {
            Hammer = __webpack_require__(! function webpackMissingModule() {
                var e = new Error("Cannot find module 'hammerjs'");
                throw e.code = "MODULE_NOT_FOUND", e
            }())
        } catch (e) {}
        module.exports = function(Hammer) {
            "use strict";
            var namespace = "Muuri",
                gridInstances = {},
                eventLayoutEnd = "layoutEnd";

            function Emitter() {
                this._events = {}, this._queue = [], this._counter = 0, this._isDestroyed = !1
            }
            Emitter.prototype.on = function(event, listener) {
                if (this._isDestroyed) return this;
                var listeners = this._events[event];
                return listeners || (listeners = this._events[event] = []), listeners.push(listener), this
            }, Emitter.prototype.once = function(event, listener) {
                if (this._isDestroyed) return this;
                var callback = function() {
                    this.off(event, callback), listener.apply(null, arguments)
                }.bind(this);
                return this.on(event, callback)
            }, Emitter.prototype.off = function(event, listener) {
                if (this._isDestroyed) return this;
                var listeners = this._events[event];
                if (!listeners || !listeners.length) return this;
                if (!listener) return listeners.length = 0, this;
                for (var i = listeners.length; i--;) listener === listeners[i] && listeners.splice(i, 1);
                return this
            }, Emitter.prototype.emit = function(event, arg1, arg2, arg3) {
                if (this._isDestroyed) return this;
                var listeners = this._events[event];
                if (!listeners || !listeners.length) return this;
                var i, queue = this._queue,
                    qLength = queue.length,
                    aLength = arguments.length - 1;
                for (i = 0; i < listeners.length; i++) queue.push(listeners[i]);
                for (++this._counter, i = qLength, qLength = queue.length; i < qLength; i++)
                    if (0 === aLength ? queue[i]() : 1 === aLength ? queue[i](arg1) : 2 === aLength ? queue[i](arg1, arg2) : queue[i](arg1, arg2, arg3), this._isDestroyed) return this;
                return --this._counter, this._counter || (queue.length = 0), this
            }, Emitter.prototype.destroy = function() {
                if (this._isDestroyed) return this;
                var event, events = this._events;
                for (event in this._isDestroyed = !0, this._queue.length = this._counter = 0, events) events[event] && (events[event].length = 0, events[event] = void 0);
                return this
            };
            var isTransformSupported = !1,
                transformStyle = "transform",
                transformProp = "transform";
            ["", "Webkit", "Moz", "O", "ms"].forEach(function(prefix) {
                if (!isTransformSupported) {
                    var propName = prefix ? prefix + "Transform" : "transform";
                    void 0 !== document.documentElement.style[propName] && (prefix = prefix.toLowerCase(), transformStyle = prefix ? "-" + prefix + "-transform" : "transform", transformProp = propName, isTransformSupported = !0)
                }
            });
            var stylesCache = "function" == typeof WeakMap ? new WeakMap : null;

            function getStyle(element, style) {
                var styles = stylesCache && stylesCache.get(element);
                return styles || (styles = window.getComputedStyle(element, null), stylesCache && stylesCache.set(element, styles)), styles.getPropertyValue("transform" === style ? transformStyle : style)
            }
            var styleNameRegEx = /([A-Z])/g;

            function getStyleName(string) {
                return string.replace(styleNameRegEx, "-$1").toLowerCase()
            }

            function setStyles(element, styles) {
                for (var prop in styles) element.style["transform" === prop ? transformProp : prop] = styles[prop]
            }

            function ItemAnimate(element) {
                this._element = element, this._animation = null, this._callback = null, this._props = [], this._values = [], this._keyframes = [], this._options = {}, this._isDestroyed = !1, this._onFinish = this._onFinish.bind(this)
            }
            ItemAnimate.prototype.start = function(propsFrom, propsTo, options) {
                if (!this._isDestroyed) {
                    var animation = this._animation,
                        currentProps = this._props,
                        currentValues = this._values,
                        opts = options || 0,
                        cancelAnimation = !1;
                    if (animation) {
                        var propIndex, propCount = 0;
                        for (var propName in propsTo)
                            if (++propCount, -1 === (propIndex = currentProps.indexOf(propName)) || propsTo[propName] !== currentValues[propIndex]) {
                                cancelAnimation = !0;
                                break
                            } cancelAnimation || propCount === currentProps.length || (cancelAnimation = !0)
                    }
                    if (cancelAnimation && animation.cancel(), this._callback = "function" == typeof opts.onFinish ? opts.onFinish : null, !animation || cancelAnimation) {
                        for (propName in currentProps.length = currentValues.length = 0, propsTo) currentProps.push(propName), currentValues.push(propsTo[propName]);
                        var animKeyframes = this._keyframes;
                        animKeyframes[0] = propsFrom, animKeyframes[1] = propsTo;
                        var animOptions = this._options;
                        animOptions.duration = opts.duration || 300, animOptions.easing = opts.easing || "ease";
                        var element = this._element;
                        (animation = element.animate(animKeyframes, animOptions)).onfinish = this._onFinish, this._animation = animation, setStyles(element, propsTo)
                    }
                }
            }, ItemAnimate.prototype.stop = function(styles) {
                if (!this._isDestroyed && this._animation) {
                    var propName, propValue, i, element = this._element,
                        currentProps = this._props,
                        currentValues = this._values;
                    if (styles) setStyles(element, styles);
                    else
                        for (i = 0; i < currentProps.length; i++) propName = currentProps[i], propValue = getStyle(element, getStyleName(propName)), element.style["transform" === propName ? transformProp : propName] = propValue;
                    this._animation.cancel(), this._animation = this._callback = null, currentProps.length = currentValues.length = 0
                }
            }, ItemAnimate.prototype.isAnimating = function() {
                return !!this._animation
            }, ItemAnimate.prototype.destroy = function() {
                this._isDestroyed || (this.stop(), this._element = this._options = this._keyframes = null, this._isDestroyed = !0)
            }, ItemAnimate.prototype._onFinish = function() {
                var callback = this._callback;
                this._animation = this._callback = null, this._props.length = this._values.length = 0, callback && callback()
            };
            var raf = (window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || function rafFallback(cb) {
                return window.setTimeout(cb, 16)
            }).bind(window);

            function Ticker() {
                this._nextTick = null, this._queue = [], this._reads = {}, this._writes = {}, this._batch = [], this._batchReads = {}, this._batchWrites = {}, this._flush = this._flush.bind(this)
            }
            Ticker.prototype.add = function(id, readCallback, writeCallback, isImportant) {
                var currentIndex = this._queue.indexOf(id);
                currentIndex > -1 && (this._queue[currentIndex] = void 0), isImportant ? this._queue.unshift(id) : this._queue.push(id), this._reads[id] = readCallback, this._writes[id] = writeCallback, this._nextTick || (this._nextTick = raf(this._flush))
            }, Ticker.prototype.cancel = function(id) {
                var currentIndex = this._queue.indexOf(id);
                currentIndex > -1 && (this._queue[currentIndex] = void 0, this._reads[id] = void 0, this._writes[id] = void 0)
            }, Ticker.prototype._flush = function() {
                var id, i, queue = this._queue,
                    reads = this._reads,
                    writes = this._writes,
                    batch = this._batch,
                    batchReads = this._batchReads,
                    batchWrites = this._batchWrites,
                    length = queue.length;
                for (this._nextTick = null, i = 0; i < length; i++)(id = queue[i]) && (batch.push(id), batchReads[id] = reads[id], reads[id] = void 0, batchWrites[id] = writes[id], writes[id] = void 0);
                for (queue.length = 0, i = 0; i < length; i++) id = batch[i], batchReads[id] && (batchReads[id](), batchReads[id] = void 0);
                for (i = 0; i < length; i++) id = batch[i], batchWrites[id] && (batchWrites[id](), batchWrites[id] = void 0);
                batch.length = 0, !this._nextTick && queue.length && (this._nextTick = raf(this._flush))
            };
            var ticker = new Ticker,
                layoutTick = "layout",
                visibilityTick = "visibility",
                moveTick = "move",
                scrollTick = "scroll";

            function cancelLayoutTick(itemId) {
                return ticker.cancel(itemId + layoutTick)
            }

            function cancelVisibilityTick(itemId) {
                return ticker.cancel(itemId + visibilityTick)
            }

            function cancelMoveTick(itemId) {
                return ticker.cancel(itemId + moveTick)
            }

            function cancelScrollTick(itemId) {
                return ticker.cancel(itemId + scrollTick)
            }
            var proto = Element.prototype,
                matches = proto.matches || proto.matchesSelector || proto.webkitMatchesSelector || proto.mozMatchesSelector || proto.msMatchesSelector || proto.oMatchesSelector;

            function elementMatches(el, selector) {
                return matches.call(el, selector)
            }
            var addClass = "classList" in Element.prototype ? function addClassModern(element, className) {
                element.classList.add(className)
            } : function addClassLegacy(element, className) {
                elementMatches(element, "." + className) || (element.className += " " + className)
            };

            function normalizeArrayIndex(array, index, isMigration) {
                var length = array.length,
                    maxIndex = Math.max(0, isMigration ? length : length - 1);
                return index > maxIndex ? maxIndex : index < 0 ? Math.max(maxIndex + index + 1, 0) : index
            }

            function arrayMove(array, fromIndex, toIndex) {
                if (!(array.length < 2)) {
                    var from = normalizeArrayIndex(array, fromIndex),
                        to = normalizeArrayIndex(array, toIndex);
                    from !== to && array.splice(to, 0, array.splice(from, 1)[0])
                }
            }

            function arraySwap(array, index, withIndex) {
                if (!(array.length < 2)) {
                    var temp, indexA = normalizeArrayIndex(array, index),
                        indexB = normalizeArrayIndex(array, withIndex);
                    indexA !== indexB && (temp = array[indexA], array[indexA] = array[indexB], array[indexB] = temp)
                }
            }
            var actionCancel = "cancel",
                actionFinish = "finish";

            function debounce(fn, wait) {
                var timeout;
                return wait > 0 ? function(action) {
                    void 0 !== timeout && (timeout = window.clearTimeout(timeout), action === actionFinish && fn()), action !== actionCancel && action !== actionFinish && (timeout = window.setTimeout(function() {
                        timeout = void 0, fn()
                    }, wait))
                } : function(action) {
                    action !== actionCancel && fn()
                }
            }

            function isTransformed(element) {
                var transform = getStyle(element, "transform");
                if (!transform || "none" === transform) return !1;
                var display = getStyle(element, "display");
                return "inline" !== display && "none" !== display
            }

            function getContainingBlock(element, includeSelf) {
                for (var ret = (includeSelf ? element : element.parentElement) || document; ret && ret !== document && "static" === getStyle(ret, "position") && !isTransformed(ret);) ret = ret.parentElement || document;
                return ret
            }

            function getStyleAsFloat(el, style) {
                return parseFloat(getStyle(el, style)) || 0
            }
            var offsetA = {},
                offsetB = {},
                offsetDiff = {};

            function getOffset(element, offsetData) {
                var rect, ret = offsetData || {};
                return ret.left = 0, ret.top = 0, element === document ? ret : (ret.left = window.pageXOffset || 0, ret.top = window.pageYOffset || 0, element.self === window.self ? ret : (rect = element.getBoundingClientRect(), ret.left += rect.left, ret.top += rect.top, ret.left += getStyleAsFloat(element, "border-left-width"), ret.top += getStyleAsFloat(element, "border-top-width"), ret))
            }

            function getOffsetDiff(elemA, elemB, compareContainingBlocks) {
                return offsetDiff.left = 0, offsetDiff.top = 0, elemA === elemB ? offsetDiff : compareContainingBlocks && (elemA = getContainingBlock(elemA, !0), elemB = getContainingBlock(elemB, !0), elemA === elemB) ? offsetDiff : (getOffset(elemA, offsetA), getOffset(elemB, offsetB), offsetDiff.left = offsetB.left - offsetA.left, offsetDiff.top = offsetB.top - offsetA.top, offsetDiff)
            }
            var translateData = {};

            function getTranslate(element) {
                translateData.x = 0, translateData.y = 0;
                var transform = getStyle(element, "transform");
                if (!transform) return translateData;
                var matrixData = transform.replace("matrix(", "").split(",");
                return translateData.x = parseFloat(matrixData[4]) || 0, translateData.y = parseFloat(matrixData[5]) || 0, translateData
            }

            function getTranslateString(x, y) {
                return "translateX(" + x + "px) translateY(" + y + "px)"
            }
            var tempArray = [];

            function arrayInsert(array, items, index) {
                var startIndex = "number" == typeof index ? index : -1;
                startIndex < 0 && (startIndex = array.length - startIndex + 1), array.splice.apply(array, tempArray.concat(startIndex, 0, items)), tempArray.length = 0
            }
            var objectType = "[object Object]",
                toString = Object.prototype.toString;

            function isPlainObject(val) {
                return "object" == typeof val && toString.call(val) === objectType
            }
            var removeClass = "classList" in Element.prototype ? function removeClassModern(element, className) {
                    element.classList.remove(className)
                } : function removeClassLegacy(element, className) {
                    elementMatches(element, "." + className) && (element.className = (" " + element.className + " ").replace(" " + className + " ", " ").trim())
                },
                hasTransformLeak = checkTransformLeak(),
                startPredicateInactive = 0,
                startPredicatePending = 1,
                startPredicateResolved = 2,
                startPredicateRejected = 3;

            function ItemDrag(item) {
                if (!Hammer) throw new Error("[" + namespace + "] required dependency Hammer is not defined.");
                null === hasTransformLeak && (hasTransformLeak = checkTransformLeak());
                var hammer, startPredicateResult, drag = this,
                    element = item._element,
                    grid = item.getGrid(),
                    settings = grid._settings,
                    startPredicate = "function" == typeof settings.dragStartPredicate ? settings.dragStartPredicate : ItemDrag.defaultStartPredicate,
                    startPredicateState = startPredicateInactive;
                this._item = item, this._gridId = grid._id, this._hammer = hammer = new Hammer.Manager(element), this._isDestroyed = !1, this._isMigrating = !1, this._reset(), this._onScroll = this._onScroll.bind(this), this._prepareMove = this._prepareMove.bind(this), this._applyMove = this._applyMove.bind(this), this._prepareScroll = this._prepareScroll.bind(this), this._applyScroll = this._applyScroll.bind(this), this._checkOverlap = this._checkOverlap.bind(this), this._forceResolveStartPredicate = function(event) {
                    this._isDestroyed || startPredicateState !== startPredicatePending || (startPredicateState = startPredicateResolved, this._onStart(event))
                }, this._checkOverlapDebounce = debounce(this._checkOverlap, settings.dragSortInterval), hammer.add(new Hammer.Pan({
                    event: "drag",
                    pointers: 1,
                    threshold: 0,
                    direction: Hammer.DIRECTION_ALL
                })), hammer.add(new Hammer.Press({
                    event: "draginit",
                    pointers: 1,
                    threshold: 1e3,
                    time: 0
                })), isPlainObject(settings.dragHammerSettings) && hammer.set(settings.dragHammerSettings), hammer.on("draginit dragstart dragmove", function(e) {
                    startPredicateState === startPredicateInactive && (startPredicateState = startPredicatePending), startPredicateState === startPredicatePending ? !0 === (startPredicateResult = startPredicate(drag._item, e)) ? (startPredicateState = startPredicateResolved, drag._onStart(e)) : !1 === startPredicateResult && (startPredicateState = startPredicateRejected) : startPredicateState === startPredicateResolved && drag._isActive && drag._onMove(e)
                }).on("dragend dragcancel draginitup", function(e) {
                    var isResolved = startPredicateState === startPredicateResolved;
                    startPredicate(drag._item, e), startPredicateState = startPredicateInactive, isResolved && drag._isActive && drag._onEnd(e)
                }), element.addEventListener("dragstart", preventDefault, !1)
            }

            function preventDefault(e) {
                e.preventDefault && e.preventDefault()
            }

            function getRectOverlapScore(a, b) {
                if (a.left + a.width <= b.left || b.left + b.width <= a.left || a.top + a.height <= b.top || b.top + b.height <= a.top) return 0;
                var width = Math.min(a.left + a.width, b.left + b.width) - Math.max(a.left, b.left),
                    height = Math.min(a.top + a.height, b.top + b.height) - Math.max(a.top, b.top),
                    maxWidth = Math.min(a.width, b.width),
                    maxHeight = Math.min(a.height, b.height);
                return width * height / (maxWidth * maxHeight) * 100
            }

            function getScrollParents(element, data) {
                var ret = data || [],
                    parent = element.parentNode;
                if (hasTransformLeak) {
                    if ("fixed" === getStyle(element, "position")) return ret;
                    for (; parent && parent !== document && parent !== document.documentElement;) isScrollable(parent) && ret.push(parent), parent = "fixed" === getStyle(parent, "position") ? null : parent.parentNode;
                    return null !== parent && ret.push(window), ret
                }
                for (; parent && parent !== document;) "fixed" !== getStyle(element, "position") || isTransformed(parent) ? (isScrollable(parent) && ret.push(parent), element = parent, parent = parent.parentNode) : parent = parent.parentNode;
                return ret[ret.length - 1] === document.documentElement ? ret[ret.length - 1] = window : ret.push(window), ret
            }

            function isScrollable(element) {
                var overflow = getStyle(element, "overflow");
                return "auto" === overflow || "scroll" === overflow || ("auto" === (overflow = getStyle(element, "overflow-x")) || "scroll" === overflow || ("auto" === (overflow = getStyle(element, "overflow-y")) || "scroll" === overflow))
            }

            function checkTransformLeak() {
                if (!isTransformSupported) return !0;
                if (!document.body) return null;
                var elems = [0, 1].map(function(elem, isInner) {
                        return (elem = document.createElement("div")).style.position = isInner ? "fixed" : "absolute", elem.style.display = "block", elem.style.visibility = "hidden", elem.style.left = isInner ? "0px" : "1px", elem.style[transformProp] = "none", elem
                    }),
                    outer = document.body.appendChild(elems[0]),
                    inner = outer.appendChild(elems[1]),
                    left = inner.getBoundingClientRect().left;
                outer.style[transformProp] = "scale(1)";
                var ret = left === inner.getBoundingClientRect().left;
                return document.body.removeChild(outer), ret
            }

            function Queue() {
                this._queue = [], this._isDestroyed = !1
            }

            function ItemLayout(item) {
                this._item = item, this._isActive = !1, this._isDestroyed = !1, this._isInterrupted = !1, this._currentStyles = {}, this._targetStyles = {}, this._currentLeft = 0, this._currentTop = 0, this._offsetLeft = 0, this._offsetTop = 0, this._skipNextAnimation = !1, this._animateOptions = {
                    onFinish: this._finish.bind(this)
                }, this._queue = new Queue, this._setupAnimation = this._setupAnimation.bind(this), this._startAnimation = this._startAnimation.bind(this)
            }
            ItemDrag.defaultStartPredicate = function(item, event, options) {
                var drag = item._drag,
                    predicate = drag._startPredicateData || drag._setupStartPredicate(options);
                if (!event.isFinal) return !(!predicate.handleElement && (predicate.handleElement = drag._getStartPredicateHandle(event), !predicate.handleElement)) && (predicate.delay && (predicate.event = event, predicate.delayTimer || (predicate.delayTimer = window.setTimeout(function() {
                    predicate.delay = 0, drag._resolveStartPredicate(predicate.event) && (drag._forceResolveStartPredicate(predicate.event), drag._resetStartPredicate())
                }, predicate.delay))), drag._resolveStartPredicate(event));
                drag._finishStartPredicate(event)
            }, ItemDrag.defaultSortPredicate = (itemRect = {}, targetRect = {}, returnData = {}, rootGridArray = [], function(item, options) {
                var drag = item._drag,
                    rootGrid = drag._getGrid(),
                    sortThreshold = options && "number" == typeof options.threshold ? options.threshold : 50,
                    sortAction = options && "swap" === options.action ? "swap" : "move";
                itemRect.width = item._width, itemRect.height = item._height, itemRect.left = drag._elementClientX, itemRect.top = drag._elementClientY;
                var grid = function getTargetGrid(item, rootGrid, threshold) {
                    var gridScore, grids, grid, i, target = null,
                        dragSort = rootGrid._settings.dragSort,
                        bestScore = -1;
                    if (!0 === dragSort ? (rootGridArray[0] = rootGrid, grids = rootGridArray) : grids = dragSort.call(rootGrid, item), !Array.isArray(grids)) return target;
                    for (i = 0; i < grids.length; i++)(grid = grids[i])._isDestroyed || (grid._updateBoundingRect(), targetRect.width = grid._width, targetRect.height = grid._height, targetRect.left = grid._left, targetRect.top = grid._top, (gridScore = getRectOverlapScore(itemRect, targetRect)) > threshold && gridScore > bestScore && (bestScore = gridScore, target = grid));
                    return rootGridArray.length = 0, target
                }(item, rootGrid, sortThreshold);
                if (!grid) return !1;
                var matchIndex, hasValidTargets, target, score, i, gridOffsetLeft = 0,
                    gridOffsetTop = 0,
                    matchScore = -1;
                for (grid === rootGrid ? (itemRect.left = drag._gridX + item._marginLeft, itemRect.top = drag._gridY + item._marginTop) : (grid._updateBorders(1, 0, 1, 0), gridOffsetLeft = grid._left + grid._borderLeft, gridOffsetTop = grid._top + grid._borderTop), i = 0; i < grid._items.length; i++)(target = grid._items[i])._isActive && target !== item && (hasValidTargets = !0, targetRect.width = target._width, targetRect.height = target._height, targetRect.left = target._left + target._marginLeft + gridOffsetLeft, targetRect.top = target._top + target._marginTop + gridOffsetTop, (score = getRectOverlapScore(itemRect, targetRect)) > matchScore && (matchIndex = i, matchScore = score));
                return matchScore < sortThreshold && item.getGrid() !== grid && (matchIndex = hasValidTargets ? -1 : 0, matchScore = 1 / 0), matchScore >= sortThreshold && (returnData.grid = grid, returnData.index = matchIndex, returnData.action = sortAction, returnData)
            }), ItemDrag.prototype.stop = function() {
                var item = this._item,
                    element = item._element,
                    grid = this._getGrid();
                return this._isActive ? this._isMigrating ? (this._finishMigration(), this) : (cancelMoveTick(item._id), cancelScrollTick(item._id), this._unbindScrollListeners(), this._checkOverlapDebounce("cancel"), element.parentNode !== grid._element && (grid._element.appendChild(element), element.style[transformProp] = getTranslateString(this._gridX, this._gridY)), removeClass(element, grid._settings.itemDraggingClass), this._reset(), this) : this
            }, ItemDrag.prototype.destroy = function() {
                return this._isDestroyed ? this : (this.stop(), this._hammer.destroy(), this._item._element.removeEventListener("dragstart", preventDefault, !1), this._isDestroyed = !0, this)
            }, ItemDrag.prototype._getGrid = function() {
                return gridInstances[this._gridId] || null
            }, ItemDrag.prototype._reset = function() {
                this._isActive = !1, this._container = null, this._containingBlock = null, this._lastEvent = null, this._lastScrollEvent = null, this._scrollers = [], this._left = 0, this._top = 0, this._gridX = 0, this._gridY = 0, this._elementClientX = 0, this._elementClientY = 0, this._containerDiffX = 0, this._containerDiffY = 0
            }, ItemDrag.prototype._bindScrollListeners = function() {
                var containerScrollers, i, gridContainer = this._getGrid()._element,
                    dragContainer = this._container,
                    scrollers = this._scrollers;
                if (scrollers.length = 0, getScrollParents(this._item._element, scrollers), dragContainer !== gridContainer)
                    for (getScrollParents(gridContainer, containerScrollers = []), containerScrollers.push(gridContainer), i = 0; i < containerScrollers.length; i++) scrollers.indexOf(containerScrollers[i]) < 0 && scrollers.push(containerScrollers[i]);
                for (i = 0; i < scrollers.length; i++) scrollers[i].addEventListener("scroll", this._onScroll)
            }, ItemDrag.prototype._unbindScrollListeners = function() {
                var i, scrollers = this._scrollers;
                for (i = 0; i < scrollers.length; i++) scrollers[i].removeEventListener("scroll", this._onScroll);
                scrollers.length = 0
            }, ItemDrag.prototype._setupStartPredicate = function(options) {
                var config = options || this._getGrid()._settings.dragStartPredicate || 0;
                return this._startPredicateData = {
                    distance: Math.abs(config.distance) || 0,
                    delay: Math.max(config.delay, 0) || 0,
                    handle: "string" == typeof config.handle && config.handle
                }
            }, ItemDrag.prototype._getStartPredicateHandle = function(event) {
                var predicate = this._startPredicateData,
                    element = this._item._element,
                    handleElement = element;
                if (!predicate.handle) return handleElement;
                for (handleElement = (event.changedPointers[0] || 0).target; handleElement && !elementMatches(handleElement, predicate.handle);) handleElement = handleElement !== element ? handleElement.parentElement : null;
                return handleElement || null
            }, ItemDrag.prototype._resolveStartPredicate = function(event) {
                var handleRect, handleLeft, handleTop, handleWidth, handleHeight, predicate = this._startPredicateData,
                    pointer = event.changedPointers[0],
                    pageX = pointer && pointer.pageX || 0,
                    pageY = pointer && pointer.pageY || 0;
                if (!(event.distance < predicate.distance || predicate.delay)) return handleRect = predicate.handleElement.getBoundingClientRect(), handleLeft = handleRect.left + (window.pageXOffset || 0), handleTop = handleRect.top + (window.pageYOffset || 0), handleWidth = handleRect.width, handleHeight = handleRect.height, this._resetStartPredicate(), handleWidth && handleHeight && pageX >= handleLeft && pageX < handleLeft + handleWidth && pageY >= handleTop && pageY < handleTop + handleHeight
            }, ItemDrag.prototype._finishStartPredicate = function(event) {
                var element = this._item._element;
                this._resetStartPredicate(),
                    function isClick(event) {
                        return Math.abs(event.deltaX) < 2 && Math.abs(event.deltaY) < 2 && event.deltaTime < 200
                    }(event) && function openAnchorHref(element) {
                        if ("a" !== element.tagName.toLowerCase()) return;
                        var href = element.getAttribute("href");
                        if (!href) return;
                        var target = element.getAttribute("target");
                        target && "_self" !== target ? window.open(href, target) : window.location.href = href
                    }(element)
            }, ItemDrag.prototype._resetStartPredicate = function() {
                var predicate = this._startPredicateData;
                predicate && (predicate.delayTimer && (predicate.delayTimer = window.clearTimeout(predicate.delayTimer)), this._startPredicateData = null)
            }, ItemDrag.prototype._checkOverlap = function() {
                if (this._isActive) {
                    var result, currentGrid, currentIndex, targetGrid, targetIndex, sortAction, isMigration, item = this._item,
                        settings = this._getGrid()._settings;
                    (result = "function" == typeof settings.dragSortPredicate ? settings.dragSortPredicate(item, this._lastEvent) : ItemDrag.defaultSortPredicate(item, settings.dragSortPredicate)) && "number" == typeof result.index && (currentGrid = item.getGrid(), targetGrid = result.grid || currentGrid, isMigration = currentGrid !== targetGrid, currentIndex = currentGrid._items.indexOf(item), targetIndex = normalizeArrayIndex(targetGrid._items, result.index, isMigration), sortAction = "swap" === result.action ? "swap" : "move", isMigration ? (currentGrid._hasListeners("beforeSend") && currentGrid._emit("beforeSend", {
                        item: item,
                        fromGrid: currentGrid,
                        fromIndex: currentIndex,
                        toGrid: targetGrid,
                        toIndex: targetIndex
                    }), targetGrid._hasListeners("beforeReceive") && targetGrid._emit("beforeReceive", {
                        item: item,
                        fromGrid: currentGrid,
                        fromIndex: currentIndex,
                        toGrid: targetGrid,
                        toIndex: targetIndex
                    }), item._gridId = targetGrid._id, this._isMigrating = item._gridId !== this._gridId, currentGrid._items.splice(currentIndex, 1), arrayInsert(targetGrid._items, item, targetIndex), item._sortData = null, currentGrid._hasListeners("send") && currentGrid._emit("send", {
                        item: item,
                        fromGrid: currentGrid,
                        fromIndex: currentIndex,
                        toGrid: targetGrid,
                        toIndex: targetIndex
                    }), targetGrid._hasListeners("receive") && targetGrid._emit("receive", {
                        item: item,
                        fromGrid: currentGrid,
                        fromIndex: currentIndex,
                        toGrid: targetGrid,
                        toIndex: targetIndex
                    }), currentGrid.layout(), targetGrid.layout()) : currentIndex !== targetIndex && (("swap" === sortAction ? arraySwap : arrayMove)(currentGrid._items, currentIndex, targetIndex), currentGrid._hasListeners("move") && currentGrid._emit("move", {
                        item: item,
                        fromIndex: currentIndex,
                        toIndex: targetIndex,
                        action: sortAction
                    }), currentGrid.layout()))
                }
            }, ItemDrag.prototype._finishMigration = function() {
                var translate, offsetDiff, item = this._item,
                    release = item._release,
                    element = item._element,
                    isActive = item._isActive,
                    targetGrid = item.getGrid(),
                    targetGridElement = targetGrid._element,
                    targetSettings = targetGrid._settings,
                    targetContainer = targetSettings.dragContainer || targetGridElement,
                    currentSettings = this._getGrid()._settings,
                    currentContainer = element.parentNode;
                this._isMigrating = !1, this.destroy(), removeClass(element, currentSettings.itemClass), removeClass(element, currentSettings.itemVisibleClass), removeClass(element, currentSettings.itemHiddenClass), addClass(element, targetSettings.itemClass), addClass(element, isActive ? targetSettings.itemVisibleClass : targetSettings.itemHiddenClass), targetContainer !== currentContainer && (targetContainer.appendChild(element), offsetDiff = getOffsetDiff(currentContainer, targetContainer, !0), (translate = getTranslate(element)).x -= offsetDiff.left, translate.y -= offsetDiff.top), item._refreshDimensions(), item._refreshSortData(), offsetDiff = getOffsetDiff(targetContainer, targetGridElement, !0), release._containerDiffX = offsetDiff.left, release._containerDiffY = offsetDiff.top, item._drag = targetSettings.dragEnabled ? new ItemDrag(item) : null, targetContainer !== currentContainer && (element.style[transformProp] = getTranslateString(translate.x, translate.y)), item._child.removeAttribute("style"), setStyles(item._child, isActive ? targetSettings.visibleStyles : targetSettings.hiddenStyles), release.start()
            }, ItemDrag.prototype._onStart = function(event) {
                var item = this._item;
                if (item._isActive) {
                    var offsetDiff, element = item._element,
                        grid = this._getGrid(),
                        settings = grid._settings,
                        release = item._release,
                        migrate = item._migrate,
                        gridContainer = grid._element,
                        dragContainer = settings.dragContainer || gridContainer,
                        containingBlock = getContainingBlock(dragContainer, !0),
                        translate = getTranslate(element),
                        currentLeft = translate.x,
                        currentTop = translate.y,
                        elementRect = element.getBoundingClientRect(),
                        hasDragContainer = dragContainer !== gridContainer;
                    hasDragContainer && (offsetDiff = getOffsetDiff(containingBlock, gridContainer)), item.isPositioning() && item._layout.stop(!0, {
                        transform: getTranslateString(currentLeft, currentTop)
                    }), migrate._isActive && (currentLeft -= migrate._containerDiffX, currentTop -= migrate._containerDiffY, migrate.stop(!0, {
                        transform: getTranslateString(currentLeft, currentTop)
                    })), item.isReleasing() && release._reset(), this._isActive = !0, this._lastEvent = event, this._container = dragContainer, this._containingBlock = containingBlock, this._elementClientX = elementRect.left, this._elementClientY = elementRect.top, this._left = this._gridX = currentLeft, this._top = this._gridY = currentTop, grid._emit("dragInit", item, event), hasDragContainer && (this._containerDiffX = offsetDiff.left, this._containerDiffY = offsetDiff.top, element.parentNode === dragContainer ? (this._gridX = currentLeft - this._containerDiffX, this._gridY = currentTop - this._containerDiffY) : (this._left = currentLeft + this._containerDiffX, this._top = currentTop + this._containerDiffY, dragContainer.appendChild(element), element.style[transformProp] = getTranslateString(this._left, this._top))), addClass(element, settings.itemDraggingClass), this._bindScrollListeners(), grid._emit("dragStart", item, event)
                }
            }, ItemDrag.prototype._onMove = function(event) {
                var item = this._item;
                if (item._isActive) {
                    var settings = this._getGrid()._settings,
                        axis = settings.dragAxis,
                        xDiff = event.deltaX - this._lastEvent.deltaX,
                        yDiff = event.deltaY - this._lastEvent.deltaY;
                    this._lastEvent = event, "y" !== axis && (this._left += xDiff, this._gridX += xDiff, this._elementClientX += xDiff), "x" !== axis && (this._top += yDiff, this._gridY += yDiff, this._elementClientY += yDiff),
                        function addMoveTick(itemId, readCallback, writeCallback) {
                            return ticker.add(itemId + moveTick, readCallback, writeCallback, !0)
                        }(item._id, this._prepareMove, this._applyMove)
                } else this.stop()
            }, ItemDrag.prototype._prepareMove = function() {
                this._item._isActive && this._getGrid()._settings.dragSort && this._checkOverlapDebounce()
            }, ItemDrag.prototype._applyMove = function() {
                var item = this._item;
                item._isActive && (item._element.style[transformProp] = getTranslateString(this._left, this._top), this._getGrid()._emit("dragMove", item, this._lastEvent))
            }, ItemDrag.prototype._onScroll = function(event) {
                var item = this._item;
                item._isActive ? (this._lastScrollEvent = event, function addScrollTick(itemId, readCallback, writeCallback) {
                    return ticker.add(itemId + scrollTick, readCallback, writeCallback, !0)
                }(item._id, this._prepareScroll, this._applyScroll)) : this.stop()
            }, ItemDrag.prototype._prepareScroll = function() {
                var item = this._item;
                if (item._isActive) {
                    var offsetDiff, element = item._element,
                        grid = this._getGrid(),
                        settings = grid._settings,
                        axis = settings.dragAxis,
                        gridContainer = grid._element,
                        rect = element.getBoundingClientRect(),
                        xDiff = this._elementClientX - rect.left,
                        yDiff = this._elementClientY - rect.top;
                    this._container !== gridContainer && (offsetDiff = getOffsetDiff(this._containingBlock, gridContainer), this._containerDiffX = offsetDiff.left, this._containerDiffY = offsetDiff.top), "y" !== axis && (this._left += xDiff, this._gridX = this._left - this._containerDiffX), "x" !== axis && (this._top += yDiff, this._gridY = this._top - this._containerDiffY), settings.dragSort && this._checkOverlapDebounce()
                }
            }, ItemDrag.prototype._applyScroll = function() {
                var item = this._item;
                item._isActive && (item._element.style[transformProp] = getTranslateString(this._left, this._top), this._getGrid()._emit("dragScroll", item, this._lastScrollEvent))
            }, ItemDrag.prototype._onEnd = function(event) {
                var item = this._item,
                    element = item._element,
                    grid = this._getGrid(),
                    settings = grid._settings,
                    release = item._release;
                item._isActive ? (cancelMoveTick(item._id), cancelScrollTick(item._id), settings.dragSort && this._checkOverlapDebounce("finish"), this._unbindScrollListeners(), release._containerDiffX = this._containerDiffX, release._containerDiffY = this._containerDiffY, this._reset(), removeClass(element, settings.itemDraggingClass), grid._emit("dragEnd", item, event), this._isMigrating ? this._finishMigration() : release.start()) : this.stop()
            }, Queue.prototype.add = function(callback) {
                return this._isDestroyed ? this : (this._queue.push(callback), this)
            }, Queue.prototype.flush = function(arg1, arg2) {
                if (this._isDestroyed) return this;
                var i, queue = this._queue,
                    length = queue.length;
                if (!length) return this;
                var singleCallback = 1 === length,
                    snapshot = singleCallback ? queue[0] : queue.slice(0);
                if (queue.length = 0, singleCallback) return snapshot(arg1, arg2), this;
                for (i = 0; i < length && (snapshot[i](arg1, arg2), !this._isDestroyed); i++);
                return this
            }, Queue.prototype.destroy = function() {
                return this._isDestroyed ? this : (this._isDestroyed = !0, this._queue.length = 0, this)
            }, ItemLayout.prototype.start = function(instant, onFinish) {
                if (!this._isDestroyed) {
                    var isAnimating, item = this._item,
                        element = item._element,
                        release = item._release,
                        gridSettings = item.getGrid()._settings,
                        isPositioning = this._isActive,
                        isJustReleased = release._isActive && !1 === release._isPositioningStarted,
                        animDuration = isJustReleased ? gridSettings.dragReleaseDuration : gridSettings.layoutDuration,
                        animEasing = isJustReleased ? gridSettings.dragReleaseEasing : gridSettings.layoutEasing,
                        animEnabled = !instant && !this._skipNextAnimation && animDuration > 0;
                    return isPositioning && this._queue.flush(!0, item), isJustReleased && (release._isPositioningStarted = !0), "function" == typeof onFinish && this._queue.add(onFinish), animEnabled ? (this._isActive = !0, this._animateOptions.easing = animEasing, this._animateOptions.duration = animDuration, this._isInterrupted = isPositioning, function addLayoutTick(itemId, readCallback, writeCallback) {
                        return ticker.add(itemId + layoutTick, readCallback, writeCallback)
                    }(item._id, this._setupAnimation, this._startAnimation), this) : (this._updateOffsets(), this._updateTargetStyles(), isPositioning && cancelLayoutTick(item._id), isAnimating = item._animate.isAnimating(), this.stop(!1, this._targetStyles), !isAnimating && setStyles(element, this._targetStyles), this._skipNextAnimation = !1, this._finish())
                }
            }, ItemLayout.prototype.stop = function(processCallbackQueue, targetStyles) {
                if (this._isDestroyed || !this._isActive) return this;
                var item = this._item;
                return cancelLayoutTick(item._id), item._animate.stop(targetStyles), removeClass(item._element, item.getGrid()._settings.itemPositioningClass), this._isActive = !1, processCallbackQueue && this._queue.flush(!0, item), this
            }, ItemLayout.prototype.destroy = function() {
                return this._isDestroyed ? this : (this.stop(!0, {}), this._queue.destroy(), this._item = this._currentStyles = this._targetStyles = this._animateOptions = null, this._isDestroyed = !0, this)
            }, ItemLayout.prototype._updateOffsets = function() {
                if (!this._isDestroyed) {
                    var item = this._item,
                        migrate = item._migrate,
                        release = item._release;
                    this._offsetLeft = release._isActive ? release._containerDiffX : migrate._isActive ? migrate._containerDiffX : 0, this._offsetTop = release._isActive ? release._containerDiffY : migrate._isActive ? migrate._containerDiffY : 0
                }
            }, ItemLayout.prototype._updateTargetStyles = function() {
                if (!this._isDestroyed) {
                    var item = this._item;
                    this._targetStyles.transform = getTranslateString(item._left + this._offsetLeft, item._top + this._offsetTop)
                }
            }, ItemLayout.prototype._finish = function() {
                if (!this._isDestroyed) {
                    var item = this._item,
                        migrate = item._migrate,
                        release = item._release;
                    this._isActive && (this._isActive = !1, removeClass(item._element, item.getGrid()._settings.itemPositioningClass)), release._isActive && release.stop(), migrate._isActive && migrate.stop(), this._queue.flush(!1, item)
                }
            }, ItemLayout.prototype._setupAnimation = function() {
                var element = this._item._element,
                    translate = getTranslate(element);
                this._currentLeft = translate.x, this._currentTop = translate.y
            }, ItemLayout.prototype._startAnimation = function() {
                var item = this._item,
                    element = item._element,
                    grid = item.getGrid(),
                    settings = grid._settings;
                if (this._updateOffsets(), this._updateTargetStyles(), item._left === this._currentLeft - this._offsetLeft && item._top === this._currentTop - this._offsetTop) return this._isInterrupted && this.stop(!1, this._targetStyles), this._isActive = !1, void this._finish();
                !this._isInterrupted && addClass(element, settings.itemPositioningClass), this._currentStyles.transform = getTranslateString(this._currentLeft, this._currentTop), item._animate.start(this._currentStyles, this._targetStyles, this._animateOptions)
            };
            var itemRect, targetRect, returnData, rootGridArray;
            var tempStyles = {};

            function ItemMigrate(item) {
                this._item = item, this._isActive = !1, this._isDestroyed = !1, this._container = !1, this._containerDiffX = 0, this._containerDiffY = 0
            }
            ItemMigrate.prototype.start = function(targetGrid, position, container) {
                if (this._isDestroyed) return this;
                var targetIndex, targetItem, currentContainer, offsetDiff, containerDiff, translate, translateX, translateY, item = this._item,
                    element = item._element,
                    isVisible = item.isVisible(),
                    grid = item.getGrid(),
                    settings = grid._settings,
                    targetSettings = targetGrid._settings,
                    targetElement = targetGrid._element,
                    targetItems = targetGrid._items,
                    currentIndex = grid._items.indexOf(item),
                    targetContainer = container || document.body;
                if ("number" == typeof position) targetIndex = normalizeArrayIndex(targetItems, position, !0);
                else {
                    if (!(targetItem = targetGrid._getItem(position))) return this;
                    targetIndex = targetItems.indexOf(targetItem)
                }
                return (item.isPositioning() || this._isActive || item.isReleasing()) && (translate = getTranslate(element), translateX = translate.x, translateY = translate.y), item.isPositioning() && item._layout.stop(!0, {
                    transform: getTranslateString(translateX, translateY)
                }), this._isActive && (translateX -= this._containerDiffX, translateY -= this._containerDiffY, this.stop(!0, {
                    transform: getTranslateString(translateX, translateY)
                })), item.isReleasing() && (translateX -= item._release._containerDiffX, translateY -= item._release._containerDiffY, item._release.stop(!0, {
                    transform: getTranslateString(translateX, translateY)
                })), item._visibility._stopAnimation(), item._drag && item._drag.destroy(), item._visibility._queue.flush(!0, item), grid._hasListeners("beforeSend") && grid._emit("beforeSend", {
                    item: item,
                    fromGrid: grid,
                    fromIndex: currentIndex,
                    toGrid: targetGrid,
                    toIndex: targetIndex
                }), targetGrid._hasListeners("beforeReceive") && targetGrid._emit("beforeReceive", {
                    item: item,
                    fromGrid: grid,
                    fromIndex: currentIndex,
                    toGrid: targetGrid,
                    toIndex: targetIndex
                }), removeClass(element, settings.itemClass), removeClass(element, settings.itemVisibleClass), removeClass(element, settings.itemHiddenClass), addClass(element, targetSettings.itemClass), addClass(element, isVisible ? targetSettings.itemVisibleClass : targetSettings.itemHiddenClass), grid._items.splice(currentIndex, 1), arrayInsert(targetItems, item, targetIndex), item._gridId = targetGrid._id, currentContainer = element.parentNode, targetContainer !== currentContainer && (targetContainer.appendChild(element), offsetDiff = getOffsetDiff(targetContainer, currentContainer, !0), translate || (translate = getTranslate(element), translateX = translate.x, translateY = translate.y), element.style[transformProp] = getTranslateString(translateX + offsetDiff.left, translateY + offsetDiff.top)), item._child.removeAttribute("style"), setStyles(item._child, isVisible ? targetSettings.visibleStyles : targetSettings.hiddenStyles), element.style.display = isVisible ? "block" : "hidden", containerDiff = getOffsetDiff(targetContainer, targetElement, !0), item._refreshDimensions(), item._refreshSortData(), item._drag = targetSettings.dragEnabled ? new ItemDrag(item) : null, this._isActive = !0, this._container = targetContainer, this._containerDiffX = containerDiff.left, this._containerDiffY = containerDiff.top, grid._hasListeners("send") && grid._emit("send", {
                    item: item,
                    fromGrid: grid,
                    fromIndex: currentIndex,
                    toGrid: targetGrid,
                    toIndex: targetIndex
                }), targetGrid._hasListeners("receive") && targetGrid._emit("receive", {
                    item: item,
                    fromGrid: grid,
                    fromIndex: currentIndex,
                    toGrid: targetGrid,
                    toIndex: targetIndex
                }), this
            }, ItemMigrate.prototype.stop = function(abort, currentStyles) {
                if (this._isDestroyed || !this._isActive) return this;
                var translate, item = this._item,
                    element = item._element,
                    grid = item.getGrid(),
                    gridElement = grid._element;
                return this._container !== gridElement && (currentStyles || (abort ? (translate = getTranslate(element), tempStyles.transform = getTranslateString(translate.x - this._containerDiffX, translate.y - this._containerDiffY)) : tempStyles.transform = getTranslateString(item._left, item._top), currentStyles = tempStyles), gridElement.appendChild(element), setStyles(element, currentStyles)), this._isActive = !1, this._container = null, this._containerDiffX = 0, this._containerDiffY = 0, this
            }, ItemMigrate.prototype.destroy = function() {
                return this._isDestroyed ? this : (this.stop(!0), this._item = null, this._isDestroyed = !0, this)
            };
            var tempStyles$1 = {};

            function ItemRelease(item) {
                this._item = item, this._isActive = !1, this._isDestroyed = !1, this._isPositioningStarted = !1, this._containerDiffX = 0, this._containerDiffY = 0
            }

            function ItemVisibility(item) {
                var isActive = item._isActive,
                    element = item._element,
                    settings = item.getGrid()._settings;
                this._item = item, this._isDestroyed = !1, this._isHidden = !isActive, this._isHiding = !1, this._isShowing = !1, this._queue = new Queue, this._finishShow = this._finishShow.bind(this), this._finishHide = this._finishHide.bind(this), element.style.display = isActive ? "block" : "none", addClass(element, isActive ? settings.itemVisibleClass : settings.itemHiddenClass), setStyles(item._child, isActive ? settings.visibleStyles : settings.hiddenStyles)
            }
            ItemRelease.prototype.start = function() {
                if (this._isDestroyed || this._isActive) return this;
                var item = this._item,
                    grid = item.getGrid();
                return this._isActive = !0, addClass(item._element, grid._settings.itemReleasingClass), grid._emit("dragReleaseStart", item), item._layout.start(!1), this
            }, ItemRelease.prototype.stop = function(abort, currentStyles) {
                if (this._isDestroyed || !this._isActive) return this;
                var translate, item = this._item,
                    element = item._element,
                    grid = item.getGrid(),
                    container = grid._element;
                return this._reset(), element.parentNode !== container && (currentStyles || (abort ? (translate = getTranslate(element), tempStyles$1.transform = getTranslateString(translate.x - this._containerDiffX, translate.y - this._containerDiffY)) : tempStyles$1.transform = getTranslateString(item._left, item._top), currentStyles = tempStyles$1), container.appendChild(element), setStyles(element, currentStyles)), abort || grid._emit("dragReleaseEnd", item), this
            }, ItemRelease.prototype.destroy = function() {
                return this._isDestroyed ? this : (this.stop(!0), this._item = null, this._isDestroyed = !0, this)
            }, ItemRelease.prototype._reset = function() {
                if (!this._isDestroyed) {
                    var item = this._item;
                    this._isActive = !1, this._isPositioningStarted = !1, this._containerDiffX = 0, this._containerDiffY = 0, removeClass(item._element, item.getGrid()._settings.itemReleasingClass)
                }
            }, ItemVisibility.prototype.show = function(instant, onFinish) {
                if (this._isDestroyed) return this;
                var item = this._item,
                    element = item._element,
                    queue = this._queue,
                    callback = "function" == typeof onFinish ? onFinish : null,
                    grid = item.getGrid(),
                    settings = grid._settings;
                return this._isShowing || this._isHidden ? this._isShowing && !instant ? (callback && queue.add(callback), this) : (this._isShowing || (queue.flush(!0, item), removeClass(element, settings.itemHiddenClass), addClass(element, settings.itemVisibleClass), this._isHiding || (element.style.display = "block")), callback && queue.add(callback), item._isActive = this._isShowing = !0, this._isHiding = this._isHidden = !1, this._startAnimation(!0, instant, this._finishShow), this) : (callback && callback(!1, item), this)
            }, ItemVisibility.prototype.hide = function(instant, onFinish) {
                if (this._isDestroyed) return this;
                var item = this._item,
                    element = item._element,
                    queue = this._queue,
                    callback = "function" == typeof onFinish ? onFinish : null,
                    grid = item.getGrid(),
                    settings = grid._settings;
                return !this._isHiding && this._isHidden ? (callback && callback(!1, item), this) : this._isHiding && !instant ? (callback && queue.add(callback), this) : (this._isHiding || (queue.flush(!0, item), addClass(element, settings.itemHiddenClass), removeClass(element, settings.itemVisibleClass)), callback && queue.add(callback), this._isHidden = this._isHiding = !0, item._isActive = this._isShowing = !1, this._startAnimation(!1, instant, this._finishHide), this)
            }, ItemVisibility.prototype.destroy = function() {
                if (this._isDestroyed) return this;
                var item = this._item,
                    element = item._element,
                    grid = item.getGrid(),
                    queue = this._queue,
                    settings = grid._settings;
                return this._stopAnimation({}), queue.flush(!0, item).destroy(), removeClass(element, settings.itemVisibleClass), removeClass(element, settings.itemHiddenClass), this._item = null, this._isHiding = this._isShowing = !1, this._isDestroyed = this._isHidden = !0, this
            }, ItemVisibility.prototype._startAnimation = function(toVisible, instant, onFinish) {
                if (!this._isDestroyed) {
                    var currentStyles, item = this._item,
                        settings = item.getGrid()._settings,
                        targetStyles = toVisible ? settings.visibleStyles : settings.hiddenStyles,
                        duration = parseInt(toVisible ? settings.showDuration : settings.hideDuration) || 0,
                        easing = (toVisible ? settings.showEasing : settings.hideEasing) || "ease",
                        isInstant = instant || duration <= 0;
                    if (targetStyles) {
                        if (cancelVisibilityTick(item._id), isInstant) return item._animateChild.isAnimating() ? item._animateChild.stop(targetStyles) : setStyles(item._child, targetStyles), void(onFinish && onFinish());
                        ! function addVisibilityTick(itemId, readCallback, writeCallback) {
                            return ticker.add(itemId + visibilityTick, readCallback, writeCallback)
                        }(item._id, function() {
                            currentStyles = function getCurrentStyles(element, styles) {
                                var current = {};
                                for (var prop in styles) current[prop] = getStyle(element, getStyleName(prop));
                                return current
                            }(item._child, targetStyles)
                        }, function() {
                            item._animateChild.start(currentStyles, targetStyles, {
                                duration: duration,
                                easing: easing,
                                onFinish: onFinish
                            })
                        })
                    } else onFinish && onFinish()
                }
            }, ItemVisibility.prototype._stopAnimation = function(targetStyles) {
                if (!this._isDestroyed) {
                    var item = this._item;
                    cancelVisibilityTick(item._id), item._animateChild.stop(targetStyles)
                }
            }, ItemVisibility.prototype._finishShow = function() {
                this._isHidden || (this._isShowing = !1, this._queue.flush(!1, this._item))
            };
            var finishStyles = {};
            ItemVisibility.prototype._finishHide = function() {
                if (this._isHidden) {
                    var item = this._item;
                    this._isHiding = !1, finishStyles.transform = getTranslateString(0, 0), item._layout.stop(!0, finishStyles), item._element.style.display = "none", this._queue.flush(!1, item)
                }
            };
            var id = 0;

            function createUid() {
                return ++id
            }

            function Item(grid, element, isActive) {
                var settings = grid._settings;
                this._id = createUid(), this._gridId = grid._id, this._isDestroyed = !1, this._left = 0, this._top = 0, this._element = element, this._child = element.children[0], element.parentNode !== grid._element && grid._element.appendChild(element), addClass(element, settings.itemClass), "boolean" != typeof isActive && (isActive = "none" !== getStyle(element, "display")), this._isActive = isActive, element.style.left = "0", element.style.top = "0", element.style[transformProp] = getTranslateString(0, 0), this._animate = new ItemAnimate(element), this._animateChild = new ItemAnimate(this._child), this._visibility = new ItemVisibility(this), this._layout = new ItemLayout(this), this._migrate = new ItemMigrate(this), this._release = new ItemRelease(this), this._drag = settings.dragEnabled ? new ItemDrag(this) : null, this._refreshDimensions(), this._refreshSortData()
            }

            function Packer() {
                this._slots = [], this._slotSizes = [], this._freeSlots = [], this._newSlots = [], this._rectItem = {}, this._rectStore = [], this._rectId = 0, this._layout = {
                    slots: null,
                    setWidth: !1,
                    setHeight: !1,
                    width: !1,
                    height: !1
                }, this._sortRectsLeftTop = this._sortRectsLeftTop.bind(this), this._sortRectsTopLeft = this._sortRectsTopLeft.bind(this)
            }
            Item.prototype.getGrid = function() {
                return gridInstances[this._gridId]
            }, Item.prototype.getElement = function() {
                return this._element
            }, Item.prototype.getWidth = function() {
                return this._width
            }, Item.prototype.getHeight = function() {
                return this._height
            }, Item.prototype.getMargin = function() {
                return {
                    left: this._marginLeft,
                    right: this._marginRight,
                    top: this._marginTop,
                    bottom: this._marginBottom
                }
            }, Item.prototype.getPosition = function() {
                return {
                    left: this._left,
                    top: this._top
                }
            }, Item.prototype.isActive = function() {
                return this._isActive
            }, Item.prototype.isVisible = function() {
                return !!this._visibility && !this._visibility._isHidden
            }, Item.prototype.isShowing = function() {
                return !(!this._visibility || !this._visibility._isShowing)
            }, Item.prototype.isHiding = function() {
                return !(!this._visibility || !this._visibility._isHiding)
            }, Item.prototype.isPositioning = function() {
                return !(!this._layout || !this._layout._isActive)
            }, Item.prototype.isDragging = function() {
                return !(!this._drag || !this._drag._isActive)
            }, Item.prototype.isReleasing = function() {
                return !(!this._release || !this._release._isActive)
            }, Item.prototype.isDestroyed = function() {
                return this._isDestroyed
            }, Item.prototype._refreshDimensions = function() {
                if (!this._isDestroyed && !this._visibility._isHidden) {
                    var element = this._element,
                        rect = element.getBoundingClientRect();
                    this._width = rect.width, this._height = rect.height, this._marginLeft = Math.max(0, getStyleAsFloat(element, "margin-left")), this._marginRight = Math.max(0, getStyleAsFloat(element, "margin-right")), this._marginTop = Math.max(0, getStyleAsFloat(element, "margin-top")), this._marginBottom = Math.max(0, getStyleAsFloat(element, "margin-bottom"))
                }
            }, Item.prototype._refreshSortData = function() {
                if (!this._isDestroyed) {
                    var prop, data = this._sortData = {},
                        getters = this.getGrid()._settings.sortData;
                    for (prop in getters) data[prop] = getters[prop](this, this._element)
                }
            }, Item.prototype._destroy = function(removeElement) {
                if (!this._isDestroyed) {
                    var element = this._element,
                        grid = this.getGrid(),
                        settings = grid._settings,
                        index = grid._items.indexOf(this);
                    this._release.destroy(), this._migrate.destroy(), this._layout.destroy(), this._visibility.destroy(), this._animate.destroy(), this._animateChild.destroy(), this._drag && this._drag.destroy(), element.removeAttribute("style"), this._child.removeAttribute("style"), removeClass(element, settings.itemClass), index > -1 && grid._items.splice(index, 1), removeElement && element.parentNode.removeChild(element), this._isActive = !1, this._isDestroyed = !0
                }
            }, Packer.prototype.getLayout = function(items, width, height, slots, options) {
                var i, layout = this._layout,
                    fillGaps = !(!options || !options.fillGaps),
                    isHorizontal = !(!options || !options.horizontal),
                    alignRight = !(!options || !options.alignRight),
                    alignBottom = !(!options || !options.alignBottom),
                    rounding = !(!options || !options.rounding),
                    slotSizes = this._slotSizes;
                if (layout.slots = slots || this._slots, layout.width = isHorizontal ? 0 : rounding ? Math.round(width) : width, layout.height = isHorizontal ? rounding ? Math.round(height) : height : 0, layout.setWidth = isHorizontal, layout.setHeight = !isHorizontal, layout.slots.length = 0, slotSizes.length = 0, !items.length) return layout;
                for (i = 0; i < items.length; i++) this._addSlot(items[i], isHorizontal, fillGaps, rounding, alignRight || alignBottom);
                if (alignRight)
                    for (i = 0; i < layout.slots.length; i += 2) layout.slots[i] = layout.width - (layout.slots[i] + slotSizes[i]);
                if (alignBottom)
                    for (i = 1; i < layout.slots.length; i += 2) layout.slots[i] = layout.height - (layout.slots[i] + slotSizes[i]);
                return slotSizes.length = 0, this._freeSlots.length = 0, this._newSlots.length = 0, this._rectId = 0, layout
            }, Packer.prototype._addSlot = (itemSlot = {}, function(item, isHorizontal, fillGaps, rounding, trackSize) {
                var rect, rectId, potentialSlots, ignoreCurrentSlots, i, ii, layout = this._layout,
                    freeSlots = this._freeSlots,
                    newSlots = this._newSlots;
                for (newSlots.length = 0, itemSlot.left = null, itemSlot.top = null, itemSlot.width = item._width + item._marginLeft + item._marginRight, itemSlot.height = item._height + item._marginTop + item._marginBottom, rounding && (itemSlot.width = Math.round(itemSlot.width), itemSlot.height = Math.round(itemSlot.height)), i = 0; i < freeSlots.length; i++)
                    if ((rectId = freeSlots[i]) && (rect = this._getRect(rectId), itemSlot.width <= rect.width + .001 && itemSlot.height <= rect.height + .001)) {
                        itemSlot.left = rect.left, itemSlot.top = rect.top;
                        break
                    } for (null === itemSlot.left && (itemSlot.left = isHorizontal ? layout.width : 0, itemSlot.top = isHorizontal ? 0 : layout.height, fillGaps || (ignoreCurrentSlots = !0)), !isHorizontal && itemSlot.top + itemSlot.height > layout.height && (itemSlot.left > 0 && newSlots.push(this._addRect(0, layout.height, itemSlot.left, 1 / 0)), itemSlot.left + itemSlot.width < layout.width && newSlots.push(this._addRect(itemSlot.left + itemSlot.width, layout.height, layout.width - itemSlot.left - itemSlot.width, 1 / 0)), layout.height = itemSlot.top + itemSlot.height), isHorizontal && itemSlot.left + itemSlot.width > layout.width && (itemSlot.top > 0 && newSlots.push(this._addRect(layout.width, 0, 1 / 0, itemSlot.top)), itemSlot.top + itemSlot.height < layout.height && newSlots.push(this._addRect(layout.width, itemSlot.top + itemSlot.height, 1 / 0, layout.height - itemSlot.top - itemSlot.height)), layout.width = itemSlot.left + itemSlot.width), i = fillGaps ? 0 : ignoreCurrentSlots ? freeSlots.length : i; i < freeSlots.length; i++)
                    if (rectId = freeSlots[i])
                        for (rect = this._getRect(rectId), potentialSlots = this._splitRect(rect, itemSlot), ii = 0; ii < potentialSlots.length; ii++) rectId = potentialSlots[ii], (rect = this._getRect(rectId)).width > .49 && rect.height > .49 && (!isHorizontal && rect.top < layout.height || isHorizontal && rect.left < layout.width) && newSlots.push(rectId);
                newSlots.length && this._purgeRects(newSlots).sort(isHorizontal ? this._sortRectsLeftTop : this._sortRectsTopLeft), isHorizontal ? layout.width = Math.max(layout.width, itemSlot.left + itemSlot.width) : layout.height = Math.max(layout.height, itemSlot.top + itemSlot.height), layout.slots.push(itemSlot.left, itemSlot.top), trackSize && this._slotSizes.push(itemSlot.width, itemSlot.height), this._freeSlots = newSlots, this._newSlots = freeSlots
            }), Packer.prototype._addRect = function(left, top, width, height) {
                var rectId = ++this._rectId,
                    rectStore = this._rectStore;
                return rectStore[rectId] = left || 0, rectStore[++this._rectId] = top || 0, rectStore[++this._rectId] = width || 0, rectStore[++this._rectId] = height || 0, rectId
            }, Packer.prototype._getRect = function(id, target) {
                var rectItem = target || this._rectItem,
                    rectStore = this._rectStore;
                return rectItem.left = rectStore[id] || 0, rectItem.top = rectStore[++id] || 0, rectItem.width = rectStore[++id] || 0, rectItem.height = rectStore[++id] || 0, rectItem
            }, Packer.prototype._splitRect = (results = [], function(rect, hole) {
                return results.length = 0, this._doRectsOverlap(rect, hole) ? (rect.left < hole.left && results.push(this._addRect(rect.left, rect.top, hole.left - rect.left, rect.height)), rect.left + rect.width > hole.left + hole.width && results.push(this._addRect(hole.left + hole.width, rect.top, rect.left + rect.width - (hole.left + hole.width), rect.height)), rect.top < hole.top && results.push(this._addRect(rect.left, rect.top, rect.width, hole.top - rect.top)), rect.top + rect.height > hole.top + hole.height && results.push(this._addRect(rect.left, hole.top + hole.height, rect.width, rect.top + rect.height - (hole.top + hole.height))), results) : (results.push(this._addRect(rect.left, rect.top, rect.width, rect.height)), results)
            }), Packer.prototype._doRectsOverlap = function(a, b) {
                return !(a.left + a.width <= b.left || b.left + b.width <= a.left || a.top + a.height <= b.top || b.top + b.height <= a.top)
            }, Packer.prototype._isRectWithinRect = function(a, b) {
                return a.left >= b.left && a.top >= b.top && a.left + a.width <= b.left + b.width && a.top + a.height <= b.top + b.height
            }, Packer.prototype._purgeRects = (rectA = {}, rectB = {}, function(rectIds) {
                for (var ii, i = rectIds.length; i--;)
                    if (ii = rectIds.length, rectIds[i])
                        for (this._getRect(rectIds[i], rectA); ii--;)
                            if (rectIds[ii] && i !== ii && this._isRectWithinRect(rectA, this._getRect(rectIds[ii], rectB))) {
                                rectIds[i] = 0;
                                break
                            } return rectIds
            }), Packer.prototype._sortRectsTopLeft = function() {
                var rectA = {},
                    rectB = {};
                return function(aId, bId) {
                    return this._getRect(aId, rectA), this._getRect(bId, rectB), rectA.top < rectB.top ? -1 : rectA.top > rectB.top ? 1 : rectA.left < rectB.left ? -1 : rectA.left > rectB.left ? 1 : 0
                }
            }(), Packer.prototype._sortRectsLeftTop = function() {
                var rectA = {},
                    rectB = {};
                return function(aId, bId) {
                    return this._getRect(aId, rectA), this._getRect(bId, rectB), rectA.left < rectB.left ? -1 : rectA.left > rectB.left ? 1 : rectA.top < rectB.top ? -1 : rectA.top > rectB.top ? 1 : 0
                }
            }();
            var rectA, rectB;
            var results;
            var itemSlot;
            var htmlCollectionType = "[object HTMLCollection]",
                nodeListType = "[object NodeList]";

            function isNodeList(val) {
                var type = Object.prototype.toString.call(val);
                return type === htmlCollectionType || type === nodeListType
            }

            function toArray(target) {
                return isNodeList(target) ? Array.prototype.slice.call(target) : Array.prototype.concat(target)
            }
            var packer = new Packer,
                noop = function() {};

            function Grid(element, options) {
                var settings, items, layoutOnResize, inst = this;
                if (element = this._element = "string" == typeof element ? document.querySelector(element) : element, !document.body.contains(element)) throw new Error("Container element must be an existing DOM element");
                "function" != typeof(settings = this._settings = function mergeSettings(defaultSettings, userSettings) {
                    var ret = mergeObjects({}, defaultSettings);
                    userSettings && (ret = mergeObjects(ret, userSettings));
                    return ret.visibleStyles = (userSettings || 0).visibleStyles || (defaultSettings || 0).visibleStyles, ret.hiddenStyles = (userSettings || 0).hiddenStyles || (defaultSettings || 0).hiddenStyles, ret
                }(Grid.defaultOptions, options)).dragSort && (settings.dragSort = !!settings.dragSort), this._id = createUid(), gridInstances[this._id] = inst, this._isDestroyed = !1, this._layout = {
                    id: 0,
                    items: [],
                    slots: [],
                    setWidth: !1,
                    setHeight: !1,
                    width: 0,
                    height: 0
                }, this._emitter = new Emitter, addClass(element, settings.containerClass), this._items = [], "string" == typeof(items = settings.items) ? toArray(element.children).forEach(function(itemElement) {
                    ("*" === items || elementMatches(itemElement, items)) && inst._items.push(new Item(inst, itemElement))
                }) : (Array.isArray(items) || isNodeList(items)) && (this._items = toArray(items).map(function(itemElement) {
                    return new Item(inst, itemElement)
                })), "number" != typeof(layoutOnResize = settings.layoutOnResize) && (layoutOnResize = !0 === layoutOnResize ? 0 : -1), layoutOnResize >= 0 && window.addEventListener("resize", inst._resizeHandler = debounce(function() {
                    inst.refreshItems().layout()
                }, layoutOnResize)), settings.layoutOnInit && this.layout(!0)
            }

            function mergeObjects(target, source) {
                var isSourceObject, propName, i, sourceKeys = Object.keys(source),
                    length = sourceKeys.length;
                for (i = 0; i < length; i++) propName = sourceKeys[i], isSourceObject = isPlainObject(source[propName]), isPlainObject(target[propName]) && isSourceObject ? target[propName] = mergeObjects(mergeObjects({}, target[propName]), source[propName]) : isSourceObject ? target[propName] = mergeObjects({}, source[propName]) : Array.isArray(source[propName]) ? target[propName] = source[propName].slice(0) : target[propName] = source[propName];
                return target
            }
            return Grid.Item = Item, Grid.ItemLayout = ItemLayout, Grid.ItemVisibility = ItemVisibility, Grid.ItemRelease = ItemRelease, Grid.ItemMigrate = ItemMigrate, Grid.ItemAnimate = ItemAnimate, Grid.ItemDrag = ItemDrag, Grid.Emitter = Emitter, Grid.defaultOptions = {
                items: "*",
                showDuration: 300,
                showEasing: "ease",
                hideDuration: 300,
                hideEasing: "ease",
                visibleStyles: {
                    opacity: "1",
                    transform: "scale(1)"
                },
                hiddenStyles: {
                    opacity: "0",
                    transform: "scale(0.5)"
                },
                layout: {
                    fillGaps: !1,
                    horizontal: !1,
                    alignRight: !1,
                    alignBottom: !1,
                    rounding: !0
                },
                layoutOnResize: 100,
                layoutOnInit: !0,
                layoutDuration: 300,
                layoutEasing: "ease",
                sortData: null,
                dragEnabled: !1,
                dragContainer: null,
                dragStartPredicate: {
                    distance: 0,
                    delay: 0,
                    handle: !1
                },
                dragAxis: null,
                dragSort: !0,
                dragSortInterval: 100,
                dragSortPredicate: {
                    threshold: 50,
                    action: "move"
                },
                dragReleaseDuration: 300,
                dragReleaseEasing: "ease",
                dragHammerSettings: {
                    touchAction: "none"
                },
                containerClass: "muuri",
                itemClass: "muuri-item",
                itemVisibleClass: "muuri-item-shown",
                itemHiddenClass: "muuri-item-hidden",
                itemPositioningClass: "muuri-item-positioning",
                itemDraggingClass: "muuri-item-dragging",
                itemReleasingClass: "muuri-item-releasing"
            }, Grid.prototype.on = function(event, listener) {
                return this._emitter.on(event, listener), this
            }, Grid.prototype.once = function(event, listener) {
                return this._emitter.once(event, listener), this
            }, Grid.prototype.off = function(event, listener) {
                return this._emitter.off(event, listener), this
            }, Grid.prototype.getElement = function() {
                return this._element
            }, Grid.prototype.getItems = function(targets) {
                if (this._isDestroyed || !targets && 0 !== targets) return this._items.slice(0);
                var item, i, ret = [],
                    targetItems = toArray(targets);
                for (i = 0; i < targetItems.length; i++)(item = this._getItem(targetItems[i])) && ret.push(item);
                return ret
            }, Grid.prototype.refreshItems = function(items) {
                if (this._isDestroyed) return this;
                var i, targets = this.getItems(items);
                for (i = 0; i < targets.length; i++) targets[i]._refreshDimensions();
                return this
            }, Grid.prototype.refreshSortData = function(items) {
                if (this._isDestroyed) return this;
                var i, targetItems = this.getItems(items);
                for (i = 0; i < targetItems.length; i++) targetItems[i]._refreshSortData();
                return this
            }, Grid.prototype.synchronize = function() {
                if (this._isDestroyed) return this;
                var fragment, element, i, container = this._element,
                    items = this._items;
                if (items.length) {
                    for (i = 0; i < items.length; i++)(element = items[i]._element).parentNode === container && (fragment = fragment || document.createDocumentFragment()).appendChild(element);
                    fragment && container.appendChild(fragment)
                }
                return this._emit("synchronize"), this
            }, Grid.prototype.layout = function(instant, onFinish) {
                if (this._isDestroyed) return this;
                var isBorderBox, item, i, inst = this,
                    element = this._element,
                    layout = this._updateLayout(),
                    layoutId = layout.id,
                    itemsLength = layout.items.length,
                    counter = itemsLength,
                    callback = "function" == typeof instant ? instant : onFinish,
                    isCallbackFunction = "function" == typeof callback,
                    callbackItems = isCallbackFunction ? layout.items.slice(0) : null;

                function tryFinish() {
                    if (!(--counter > 0)) {
                        var hasLayoutChanged = inst._layout.id !== layoutId;
                        isCallbackFunction && callback(hasLayoutChanged, callbackItems), !hasLayoutChanged && inst._hasListeners(eventLayoutEnd) && inst._emit(eventLayoutEnd, layout.items.slice(0))
                    }
                }
                if ((layout.setHeight && "number" == typeof layout.height || layout.setWidth && "number" == typeof layout.width) && (isBorderBox = "border-box" === getStyle(element, "box-sizing")), layout.setHeight && ("number" == typeof layout.height ? element.style.height = (isBorderBox ? layout.height + this._borderTop + this._borderBottom : layout.height) + "px" : element.style.height = layout.height), layout.setWidth && ("number" == typeof layout.width ? element.style.width = (isBorderBox ? layout.width + this._borderLeft + this._borderRight : layout.width) + "px" : element.style.width = layout.width), this._hasListeners("layoutStart") && this._emit("layoutStart", layout.items.slice(0)), !itemsLength) return tryFinish(), this;
                for (i = 0; i < itemsLength; i++)(item = layout.items[i]) && (item._left = layout.slots[2 * i], item._top = layout.slots[2 * i + 1], item.isDragging() ? tryFinish() : item._layout.start(!0 === instant, tryFinish));
                return this
            }, Grid.prototype.add = function(elements, options) {
                if (this._isDestroyed || !elements) return [];
                var newItems = toArray(elements);
                if (!newItems.length) return newItems;
                var item, i, opts = options || 0,
                    layout = opts.layout ? opts.layout : void 0 === opts.layout,
                    items = this._items,
                    needsLayout = !1;
                for (i = 0; i < newItems.length; i++) item = new Item(this, newItems[i], opts.isActive), newItems[i] = item, item._isActive && (needsLayout = !0, item._layout._skipNextAnimation = !0);
                return arrayInsert(items, newItems, opts.index), this._hasListeners("add") && this._emit("add", newItems.slice(0)), needsLayout && layout && this.layout("instant" === layout, "function" == typeof layout ? layout : void 0), newItems
            }, Grid.prototype.remove = function(items, options) {
                if (this._isDestroyed) return this;
                var item, i, opts = options || 0,
                    layout = opts.layout ? opts.layout : void 0 === opts.layout,
                    needsLayout = !1,
                    allItems = this.getItems(),
                    targetItems = this.getItems(items),
                    indices = [];
                for (i = 0; i < targetItems.length; i++) item = targetItems[i], indices.push(allItems.indexOf(item)), item._isActive && (needsLayout = !0), item._destroy(opts.removeElements);
                return this._hasListeners("remove") && this._emit("remove", targetItems.slice(0), indices), needsLayout && layout && this.layout("instant" === layout, "function" == typeof layout ? layout : void 0), targetItems
            }, Grid.prototype.show = function(items, options) {
                return this._isDestroyed ? this : (this._setItemsVisibility(items, !0, options), this)
            }, Grid.prototype.hide = function(items, options) {
                return this._isDestroyed ? this : (this._setItemsVisibility(items, !1, options), this)
            }, Grid.prototype.filter = function(predicate, options) {
                if (this._isDestroyed || !this._items.length) return this;
                var item, i, itemsToShow = [],
                    itemsToHide = [],
                    isPredicateString = "string" == typeof predicate,
                    isPredicateFn = "function" == typeof predicate,
                    opts = options || 0,
                    isInstant = !0 === opts.instant,
                    layout = opts.layout ? opts.layout : void 0 === opts.layout,
                    onFinish = "function" == typeof opts.onFinish ? opts.onFinish : null,
                    tryFinishCounter = -1,
                    tryFinish = noop;
                if (onFinish && (tryFinish = function() {
                        ++tryFinishCounter && onFinish(itemsToShow.slice(0), itemsToHide.slice(0))
                    }), isPredicateFn || isPredicateString)
                    for (i = 0; i < this._items.length; i++) item = this._items[i], (isPredicateFn ? predicate(item) : elementMatches(item._element, predicate)) ? itemsToShow.push(item) : itemsToHide.push(item);
                return itemsToShow.length ? this.show(itemsToShow, {
                    instant: isInstant,
                    onFinish: tryFinish,
                    layout: !1
                }) : tryFinish(), itemsToHide.length ? this.hide(itemsToHide, {
                    instant: isInstant,
                    onFinish: tryFinish,
                    layout: !1
                }) : tryFinish(), (itemsToShow.length || itemsToHide.length) && (this._hasListeners("filter") && this._emit("filter", itemsToShow.slice(0), itemsToHide.slice(0)), layout && this.layout("instant" === layout, "function" == typeof layout ? layout : void 0)), this
            }, Grid.prototype.sort = function() {
                var sortComparer, isDescending, origItems, indexMap;

                function getIndexMap(items) {
                    for (var ret = {}, i = 0; i < items.length; i++) ret[items[i]._id] = i;
                    return ret
                }

                function compareIndices(itemA, itemB) {
                    var indexA = indexMap[itemA._id],
                        indexB = indexMap[itemB._id];
                    return isDescending ? indexB - indexA : indexA - indexB
                }

                function defaultComparer(a, b) {
                    for (var criteriaName, criteriaOrder, valA, valB, result = 0, i = 0; i < sortComparer.length; i++)
                        if (criteriaName = sortComparer[i][0], criteriaOrder = sortComparer[i][1], valA = (a._sortData ? a : a._refreshSortData())._sortData[criteriaName], valB = (b._sortData ? b : b._refreshSortData())._sortData[criteriaName], result = "desc" === criteriaOrder || !criteriaOrder && isDescending ? valB < valA ? -1 : valB > valA ? 1 : 0 : valA < valB ? -1 : valA > valB ? 1 : 0) return result;
                    return result || (indexMap || (indexMap = getIndexMap(origItems)), result = compareIndices(a, b)), result
                }

                function customComparer(a, b) {
                    var result = sortComparer(a, b);
                    return isDescending && result && (result = -result), result || (indexMap || (indexMap = getIndexMap(origItems)), compareIndices(a, b))
                }
                return function(comparer, options) {
                    if (this._isDestroyed || this._items.length < 2) return this;
                    var i, items = this._items,
                        opts = options || 0,
                        layout = opts.layout ? opts.layout : void 0 === opts.layout;
                    if (sortComparer = comparer, isDescending = !!opts.descending, origItems = items.slice(0), indexMap = null, "function" == typeof sortComparer) items.sort(customComparer);
                    else if ("string" == typeof sortComparer) sortComparer = function parseCriteria(data) {
                        return data.trim().split(" ").map(function(val) {
                            return val.split(":")
                        })
                    }(comparer), items.sort(defaultComparer);
                    else {
                        if (!Array.isArray(sortComparer)) return this;
                        if (sortComparer.length !== items.length) throw new Error("[" + namespace + "] sort reference items do not match with grid items.");
                        for (i = 0; i < items.length; i++) {
                            if (sortComparer.indexOf(items[i]) < 0) throw new Error("[" + namespace + "] sort reference items do not match with grid items.");
                            items[i] = sortComparer[i]
                        }
                        isDescending && items.reverse()
                    }
                    return this._hasListeners("sort") && this._emit("sort", items.slice(0), origItems), layout && this.layout("instant" === layout, "function" == typeof layout ? layout : void 0), this
                }
            }(), Grid.prototype.move = function(item, position, options) {
                if (this._isDestroyed || this._items.length < 2) return this;
                var fromIndex, toIndex, items = this._items,
                    opts = options || 0,
                    layout = opts.layout ? opts.layout : void 0 === opts.layout,
                    isSwap = "swap" === opts.action,
                    action = isSwap ? "swap" : "move",
                    fromItem = this._getItem(item),
                    toItem = this._getItem(position);
                return fromItem && toItem && fromItem !== toItem && (fromIndex = items.indexOf(fromItem), toIndex = items.indexOf(toItem), isSwap ? arraySwap(items, fromIndex, toIndex) : arrayMove(items, fromIndex, toIndex), this._hasListeners("move") && this._emit("move", {
                    item: fromItem,
                    fromIndex: fromIndex,
                    toIndex: toIndex,
                    action: action
                }), layout && this.layout("instant" === layout, "function" == typeof layout ? layout : void 0)), this
            }, Grid.prototype.send = function(item, grid, position, options) {
                if (this._isDestroyed || grid._isDestroyed || this === grid) return this;
                if (!(item = this._getItem(item))) return this;
                var opts = options || 0,
                    container = opts.appendTo || document.body,
                    layoutSender = opts.layoutSender ? opts.layoutSender : void 0 === opts.layoutSender,
                    layoutReceiver = opts.layoutReceiver ? opts.layoutReceiver : void 0 === opts.layoutReceiver;
                return item._migrate.start(grid, position, container), item._migrate._isActive && item._isActive && (layoutSender && this.layout("instant" === layoutSender, "function" == typeof layoutSender ? layoutSender : void 0), layoutReceiver && grid.layout("instant" === layoutReceiver, "function" == typeof layoutReceiver ? layoutReceiver : void 0)), this
            }, Grid.prototype.destroy = function(removeElements) {
                if (this._isDestroyed) return this;
                var i, container = this._element,
                    items = this._items.slice(0);
                for (this._resizeHandler && window.removeEventListener("resize", this._resizeHandler), i = 0; i < items.length; i++) items[i]._destroy(removeElements);
                return removeClass(container, this._settings.containerClass), container.style.height = "", container.style.width = "", this._emit("destroy"), this._emitter.destroy(), gridInstances[this._id] = void 0, this._isDestroyed = !0, this
            }, Grid.prototype._getItem = function(target) {
                if (this._isDestroyed || !target && 0 !== target) return null;
                if ("number" == typeof target) return this._items[target > -1 ? target : this._items.length + target] || null;
                if (target instanceof Item) return target._gridId === this._id ? target : null;
                for (var i = 0; i < this._items.length; i++)
                    if (this._items[i]._element === target) return this._items[i];
                return null
            }, Grid.prototype._updateLayout = function() {
                var width, height, newLayout, i, layout = this._layout,
                    settings = this._settings.layout;
                for (++layout.id, layout.items.length = 0, i = 0; i < this._items.length; i++) this._items[i]._isActive && layout.items.push(this._items[i]);
                return this._refreshDimensions(), width = this._width - this._borderLeft - this._borderRight, height = this._height - this._borderTop - this._borderBottom, newLayout = "function" == typeof settings ? settings(layout.items, width, height) : packer.getLayout(layout.items, width, height, layout.slots, settings), layout.slots = newLayout.slots, layout.setWidth = Boolean(newLayout.setWidth), layout.setHeight = Boolean(newLayout.setHeight), layout.width = newLayout.width, layout.height = newLayout.height, layout
            }, Grid.prototype._emit = function() {
                this._isDestroyed || this._emitter.emit.apply(this._emitter, arguments)
            }, Grid.prototype._hasListeners = function(event) {
                var listeners = this._emitter._events[event];
                return !(!listeners || !listeners.length)
            }, Grid.prototype._updateBoundingRect = function() {
                var rect = this._element.getBoundingClientRect();
                this._width = rect.width, this._height = rect.height, this._left = rect.left, this._top = rect.top
            }, Grid.prototype._updateBorders = function(left, right, top, bottom) {
                var element = this._element;
                left && (this._borderLeft = getStyleAsFloat(element, "border-left-width")), right && (this._borderRight = getStyleAsFloat(element, "border-right-width")), top && (this._borderTop = getStyleAsFloat(element, "border-top-width")), bottom && (this._borderBottom = getStyleAsFloat(element, "border-bottom-width"))
            }, Grid.prototype._refreshDimensions = function() {
                this._updateBoundingRect(), this._updateBorders(1, 1, 1, 1)
            }, Grid.prototype._setItemsVisibility = function(items, toVisible, options) {
                var item, i, grid = this,
                    targetItems = this.getItems(items),
                    opts = options || 0,
                    isInstant = !0 === opts.instant,
                    callback = opts.onFinish,
                    layout = opts.layout ? opts.layout : void 0 === opts.layout,
                    counter = targetItems.length,
                    startEvent = toVisible ? "showStart" : "hideStart",
                    endEvent = toVisible ? "showEnd" : "hideEnd",
                    method = toVisible ? "show" : "hide",
                    needsLayout = !1,
                    completedItems = [],
                    hiddenItems = [];
                if (counter) {
                    for (this._hasListeners(startEvent) && this._emit(startEvent, targetItems.slice(0)), i = 0; i < targetItems.length; i++) item = targetItems[i], (toVisible && !item._isActive || !toVisible && item._isActive) && (needsLayout = !0), toVisible && !item._isActive && (item._layout._skipNextAnimation = !0), toVisible && item._visibility._isHidden && hiddenItems.push(item), item._visibility[method](isInstant, function(interrupted, item) {
                        interrupted || completedItems.push(item), --counter < 1 && ("function" == typeof callback && callback(completedItems.slice(0)), grid._hasListeners(endEvent) && grid._emit(endEvent, completedItems.slice(0)))
                    });
                    hiddenItems.length && this.refreshItems(hiddenItems), needsLayout && layout && this.layout("instant" === layout, "function" == typeof layout ? layout : void 0)
                } else "function" == typeof callback && callback(targetItems)
            }, Grid
        }(Hammer)
    }()
}, function(module, exports) {
    ! function() {
        function e(e) {
            return e && e.__esModule ? e.default : e
        }

        function t(e) {
            if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return e
        }

        function i(e, t) {
            if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
        }

        function n(e, t) {
            for (var i = 0; i < t.length; i++) {
                var n = t[i];
                n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(e, n.key, n)
            }
        }

        function r(e, t, i) {
            return t && n(e.prototype, t), i && n(e, i), e
        }

        function a(e) {
            return (a = Object.setPrototypeOf ? Object.getPrototypeOf : function(e) {
                return e.__proto__ || Object.getPrototypeOf(e)
            })(e)
        }

        function o(e, t) {
            return (o = Object.setPrototypeOf || function(e, t) {
                return e.__proto__ = t, e
            })(e, t)
        }

        function l(e, t) {
            if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function");
            e.prototype = Object.create(t && t.prototype, {
                constructor: {
                    value: e,
                    writable: !0,
                    configurable: !0
                }
            }), t && o(e, t)
        }

        function s(e, i) {
            return !i || "object" != ((n = i) && n.constructor === Symbol ? "symbol" : typeof n) && "function" != typeof i ? t(e) : i;
            var n
        }
        var u;

        function c(e) {
            return Array.isArray(e) || "[object Object]" == {}.toString.call(e)
        }

        function d(e) {
            return !e || "object" != typeof e && "function" != typeof e
        }
        u = function e() {
            var t = [].slice.call(arguments),
                i = !1;
            "boolean" == typeof t[0] && (i = t.shift());
            var n = t[0];
            if (d(n)) throw new Error("extendee must be an object");
            for (var r = t.slice(1), a = r.length, o = 0; o < a; o++) {
                var l = r[o];
                for (var s in l)
                    if (Object.prototype.hasOwnProperty.call(l, s)) {
                        var u = l[s];
                        if (i && c(u)) {
                            var h = Array.isArray(u) ? [] : {};
                            n[s] = e(!0, Object.prototype.hasOwnProperty.call(n, s) && !d(n[s]) ? n[s] : h, u)
                        } else n[s] = u
                    }
            }
            return n
        };
        var h = function() {
                "use strict";

                function e() {
                    i(this, e)
                }
                return r(e, [{
                    key: "on",
                    value: function(e, t) {
                        return this._callbacks = this._callbacks || {}, this._callbacks[e] || (this._callbacks[e] = []), this._callbacks[e].push(t), this
                    }
                }, {
                    key: "emit",
                    value: function(e) {
                        for (var t = arguments.length, i = new Array(t > 1 ? t - 1 : 0), n = 1; n < t; n++) i[n - 1] = arguments[n];
                        this._callbacks = this._callbacks || {};
                        var r = this._callbacks[e],
                            a = !0,
                            o = !1,
                            l = void 0;
                        if (r) try {
                            for (var s, u = r[Symbol.iterator](); !(a = (s = u.next()).done); a = !0) {
                                var c = s.value;
                                c.apply(this, i)
                            }
                        } catch (e) {
                            o = !0, l = e
                        } finally {
                            try {
                                a || null == u.return || u.return()
                            } finally {
                                if (o) throw l
                            }
                        }
                        return this.element && this.element.dispatchEvent(this.makeEvent("dropzone:" + e, {
                            args: i
                        })), this
                    }
                }, {
                    key: "makeEvent",
                    value: function(e, t) {
                        var i = {
                            bubbles: !0,
                            cancelable: !0,
                            detail: t
                        };
                        if ("function" == typeof window.CustomEvent) return new CustomEvent(e, i);
                        var n = document.createEvent("CustomEvent");
                        return n.initCustomEvent(e, i.bubbles, i.cancelable, i.detail), n
                    }
                }, {
                    key: "off",
                    value: function(e, t) {
                        if (!this._callbacks || 0 === arguments.length) return this._callbacks = {}, this;
                        var i = this._callbacks[e];
                        if (!i) return this;
                        if (1 === arguments.length) return delete this._callbacks[e], this;
                        for (var n = 0; n < i.length; n++) {
                            var r = i[n];
                            if (r === t) {
                                i.splice(n, 1);
                                break
                            }
                        }
                        return this
                    }
                }]), e
            }(),
            p = {
                url: null,
                method: "post",
                withCredentials: !1,
                timeout: null,
                parallelUploads: 2,
                uploadMultiple: !1,
                chunking: !1,
                forceChunking: !1,
                chunkSize: 2097152,
                parallelChunkUploads: !1,
                retryChunks: !1,
                retryChunksLimit: 3,
                maxFilesize: 256,
                paramName: "file",
                createImageThumbnails: !0,
                maxThumbnailFilesize: 10,
                thumbnailWidth: 120,
                thumbnailHeight: 120,
                thumbnailMethod: "crop",
                resizeWidth: null,
                resizeHeight: null,
                resizeMimeType: null,
                resizeQuality: .8,
                resizeMethod: "contain",
                filesizeBase: 1e3,
                maxFiles: null,
                headers: null,
                defaultHeaders: !0,
                clickable: !0,
                ignoreHiddenFiles: !0,
                acceptedFiles: null,
                acceptedMimeTypes: null,
                autoProcessQueue: !0,
                autoQueue: !0,
                addRemoveLinks: !1,
                previewsContainer: null,
                disablePreviews: !1,
                hiddenInputContainer: "body",
                capture: null,
                renameFilename: null,
                renameFile: null,
                forceFallback: !1,
                dictDefaultMessage: "Drop files here to upload",
                dictFallbackMessage: "Your browser does not support drag'n'drop file uploads.",
                dictFallbackText: "Please use the fallback form below to upload your files like in the olden days.",
                dictFileTooBig: "File is too big ({{filesize}}MiB). Max filesize: {{maxFilesize}}MiB.",
                dictInvalidFileType: "You can't upload files of this type.",
                dictResponseError: "Server responded with {{statusCode}} code.",
                dictCancelUpload: "Cancel upload",
                dictUploadCanceled: "Upload canceled.",
                dictCancelUploadConfirmation: "Are you sure you want to cancel this upload?",
                dictRemoveFile: "Remove file",
                dictRemoveFileConfirmation: null,
                dictMaxFilesExceeded: "You can not upload any more files.",
                dictFileSizeUnits: {
                    tb: "TB",
                    gb: "GB",
                    mb: "MB",
                    kb: "KB",
                    b: "b"
                },
                init: function() {},
                params: function(e, t, i) {
                    if (i) return {
                        dzuuid: i.file.upload.uuid,
                        dzchunkindex: i.index,
                        dztotalfilesize: i.file.size,
                        dzchunksize: this.options.chunkSize,
                        dztotalchunkcount: i.file.upload.totalChunkCount,
                        dzchunkbyteoffset: i.index * this.options.chunkSize
                    }
                },
                accept: function(e, t) {
                    return t()
                },
                chunksUploaded: function(e, t) {
                    t()
                },
                binaryBody: !1,
                fallback: function() {
                    var e;
                    this.element.className = "".concat(this.element.className, " dz-browser-not-supported");
                    var t = !0,
                        i = !1,
                        n = void 0;
                    try {
                        for (var r, a = this.element.getElementsByTagName("div")[Symbol.iterator](); !(t = (r = a.next()).done); t = !0) {
                            var o = r.value;
                            if (/(^| )dz-message($| )/.test(o.className)) {
                                e = o, o.className = "dz-message";
                                break
                            }
                        }
                    } catch (e) {
                        i = !0, n = e
                    } finally {
                        try {
                            t || null == a.return || a.return()
                        } finally {
                            if (i) throw n
                        }
                    }
                    e || (e = f.createElement('<div class="dz-message"><span></span></div>'), this.element.appendChild(e));
                    var l = e.getElementsByTagName("span")[0];
                    return l && (null != l.textContent ? l.textContent = this.options.dictFallbackMessage : null != l.innerText && (l.innerText = this.options.dictFallbackMessage)), this.element.appendChild(this.getFallbackForm())
                },
                resize: function(e, t, i, n) {
                    var r = {
                            srcX: 0,
                            srcY: 0,
                            srcWidth: e.width,
                            srcHeight: e.height
                        },
                        a = e.width / e.height;
                    null == t && null == i ? (t = r.srcWidth, i = r.srcHeight) : null == t ? t = i * a : null == i && (i = t / a);
                    var o = (t = Math.min(t, r.srcWidth)) / (i = Math.min(i, r.srcHeight));
                    if (r.srcWidth > t || r.srcHeight > i)
                        if ("crop" === n) a > o ? (r.srcHeight = e.height, r.srcWidth = r.srcHeight * o) : (r.srcWidth = e.width, r.srcHeight = r.srcWidth / o);
                        else {
                            if ("contain" !== n) throw new Error("Unknown resizeMethod '".concat(n, "'"));
                            a > o ? i = t / a : t = i * a
                        } return r.srcX = (e.width - r.srcWidth) / 2, r.srcY = (e.height - r.srcHeight) / 2, r.trgWidth = t, r.trgHeight = i, r
                },
                transformFile: function(e, t) {
                    return (this.options.resizeWidth || this.options.resizeHeight) && e.type.match(/image.*/) ? this.resizeImage(e, this.options.resizeWidth, this.options.resizeHeight, this.options.resizeMethod, t) : t(e)
                },
                previewTemplate: e('<div class="dz-file-preview dz-preview"> <div class="dz-image"><img data-dz-thumbnail=""></div> <div class="dz-details"> <div class="dz-size"><span data-dz-size=""></span></div> <div class="dz-filename"><span data-dz-name=""></span></div> </div> <div class="dz-progress"> <span class="dz-upload" data-dz-uploadprogress=""></span> </div> <div class="dz-error-message"><span data-dz-errormessage=""></span></div> <div class="dz-success-mark"> <svg width="54" height="54" fill="#fff"><path d="m10.207 29.793 4.086-4.086a1 1 0 0 1 1.414 0l5.586 5.586a1 1 0 0 0 1.414 0l15.586-15.586a1 1 0 0 1 1.414 0l4.086 4.086a1 1 0 0 1 0 1.414L22.707 42.293a1 1 0 0 1-1.414 0L10.207 31.207a1 1 0 0 1 0-1.414Z"/></svg> </div> <div class="dz-error-mark"> <svg width="54" height="54" fill="#fff"><path d="m26.293 20.293-7.086-7.086a1 1 0 0 0-1.414 0l-4.586 4.586a1 1 0 0 0 0 1.414l7.086 7.086a1 1 0 0 1 0 1.414l-7.086 7.086a1 1 0 0 0 0 1.414l4.586 4.586a1 1 0 0 0 1.414 0l7.086-7.086a1 1 0 0 1 1.414 0l7.086 7.086a1 1 0 0 0 1.414 0l4.586-4.586a1 1 0 0 0 0-1.414l-7.086-7.086a1 1 0 0 1 0-1.414l7.086-7.086a1 1 0 0 0 0-1.414l-4.586-4.586a1 1 0 0 0-1.414 0l-7.086 7.086a1 1 0 0 1-1.414 0Z"/></svg> </div> </div>'),
                drop: function(e) {
                    return this.element.classList.remove("dz-drag-hover")
                },
                dragstart: function(e) {},
                dragend: function(e) {
                    return this.element.classList.remove("dz-drag-hover")
                },
                dragenter: function(e) {
                    return this.element.classList.add("dz-drag-hover")
                },
                dragover: function(e) {
                    return this.element.classList.add("dz-drag-hover")
                },
                dragleave: function(e) {
                    return this.element.classList.remove("dz-drag-hover")
                },
                paste: function(e) {},
                reset: function() {
                    return this.element.classList.remove("dz-started")
                },
                addedfile: function(e) {
                    if (this.element === this.previewsContainer && this.element.classList.add("dz-started"), this.previewsContainer && !this.options.disablePreviews) {
                        var t = this;
                        e.previewElement = f.createElement(this.options.previewTemplate.trim()), e.previewTemplate = e.previewElement, this.previewsContainer.appendChild(e.previewElement);
                        var i = !0,
                            n = !1,
                            r = void 0;
                        try {
                            for (var a, o = e.previewElement.querySelectorAll("[data-dz-name]")[Symbol.iterator](); !(i = (a = o.next()).done); i = !0) {
                                var l = a.value;
                                l.textContent = e.name
                            }
                        } catch (e) {
                            n = !0, r = e
                        } finally {
                            try {
                                i || null == o.return || o.return()
                            } finally {
                                if (n) throw r
                            }
                        }
                        var s = !0,
                            u = !1,
                            c = void 0;
                        try {
                            for (var d, h = e.previewElement.querySelectorAll("[data-dz-size]")[Symbol.iterator](); !(s = (d = h.next()).done); s = !0)(l = d.value).innerHTML = this.filesize(e.size)
                        } catch (e) {
                            u = !0, c = e
                        } finally {
                            try {
                                s || null == h.return || h.return()
                            } finally {
                                if (u) throw c
                            }
                        }
                        this.options.addRemoveLinks && (e._removeLink = f.createElement('<a class="dz-remove" href="javascript:undefined;" data-dz-remove>'.concat(this.options.dictRemoveFile, "</a>")), e.previewElement.appendChild(e._removeLink));
                        var p = function(i) {
                                var n = t;
                                if (i.preventDefault(), i.stopPropagation(), e.status === f.UPLOADING) return f.confirm(t.options.dictCancelUploadConfirmation, function() {
                                    return n.removeFile(e)
                                });
                                var r = t;
                                return t.options.dictRemoveFileConfirmation ? f.confirm(t.options.dictRemoveFileConfirmation, function() {
                                    return r.removeFile(e)
                                }) : t.removeFile(e)
                            },
                            m = !0,
                            v = !1,
                            y = void 0;
                        try {
                            for (var g, b = e.previewElement.querySelectorAll("[data-dz-remove]")[Symbol.iterator](); !(m = (g = b.next()).done); m = !0) g.value.addEventListener("click", p)
                        } catch (e) {
                            v = !0, y = e
                        } finally {
                            try {
                                m || null == b.return || b.return()
                            } finally {
                                if (v) throw y
                            }
                        }
                    }
                },
                removedfile: function(e) {
                    return null != e.previewElement && null != e.previewElement.parentNode && e.previewElement.parentNode.removeChild(e.previewElement), this._updateMaxFilesReachedClass()
                },
                thumbnail: function(e, t) {
                    if (e.previewElement) {
                        e.previewElement.classList.remove("dz-file-preview");
                        var i = !0,
                            n = !1,
                            r = void 0;
                        try {
                            for (var a, o = e.previewElement.querySelectorAll("[data-dz-thumbnail]")[Symbol.iterator](); !(i = (a = o.next()).done); i = !0) {
                                var l = a.value;
                                l.alt = e.name, l.src = t
                            }
                        } catch (e) {
                            n = !0, r = e
                        } finally {
                            try {
                                i || null == o.return || o.return()
                            } finally {
                                if (n) throw r
                            }
                        }
                        return setTimeout(function() {
                            return e.previewElement.classList.add("dz-image-preview")
                        }, 1)
                    }
                },
                error: function(e, t) {
                    if (e.previewElement) {
                        e.previewElement.classList.add("dz-error"), "string" != typeof t && t.error && (t = t.error);
                        var i = !0,
                            n = !1,
                            r = void 0;
                        try {
                            for (var a, o = e.previewElement.querySelectorAll("[data-dz-errormessage]")[Symbol.iterator](); !(i = (a = o.next()).done); i = !0) a.value.textContent = t
                        } catch (e) {
                            n = !0, r = e
                        } finally {
                            try {
                                i || null == o.return || o.return()
                            } finally {
                                if (n) throw r
                            }
                        }
                    }
                },
                errormultiple: function() {},
                processing: function(e) {
                    if (e.previewElement && (e.previewElement.classList.add("dz-processing"), e._removeLink)) return e._removeLink.innerHTML = this.options.dictCancelUpload
                },
                processingmultiple: function() {},
                uploadprogress: function(e, t, i) {
                    var n = !0,
                        r = !1,
                        a = void 0;
                    if (e.previewElement) try {
                        for (var o, l = e.previewElement.querySelectorAll("[data-dz-uploadprogress]")[Symbol.iterator](); !(n = (o = l.next()).done); n = !0) {
                            var s = o.value;
                            "PROGRESS" === s.nodeName ? s.value = t : s.style.width = "".concat(t, "%")
                        }
                    } catch (e) {
                        r = !0, a = e
                    } finally {
                        try {
                            n || null == l.return || l.return()
                        } finally {
                            if (r) throw a
                        }
                    }
                },
                totaluploadprogress: function() {},
                sending: function() {},
                sendingmultiple: function() {},
                success: function(e) {
                    if (e.previewElement) return e.previewElement.classList.add("dz-success")
                },
                successmultiple: function() {},
                canceled: function(e) {
                    return this.emit("error", e, this.options.dictUploadCanceled)
                },
                canceledmultiple: function() {},
                complete: function(e) {
                    if (e._removeLink && (e._removeLink.innerHTML = this.options.dictRemoveFile), e.previewElement) return e.previewElement.classList.add("dz-complete")
                },
                completemultiple: function() {},
                maxfilesexceeded: function() {},
                maxfilesreached: function() {},
                queuecomplete: function() {},
                addedfiles: function() {}
            },
            f = function(n) {
                "use strict";

                function o(n, r) {
                    var l, c, d, h;
                    if (i(this, o), (l = s(this, (c = o, a(c)).call(this))).element = n, l.clickableElements = [], l.listeners = [], l.files = [], "string" == typeof l.element && (l.element = document.querySelector(l.element)), !l.element || null == l.element.nodeType) throw new Error("Invalid dropzone element.");
                    if (l.element.dropzone) throw new Error("Dropzone already attached.");
                    o.instances.push(t(l)), l.element.dropzone = t(l);
                    var f = null != (h = o.optionsForElement(l.element)) ? h : {};
                    if (l.options = e(u)(!0, {}, p, f, null != r ? r : {}), l.options.previewTemplate = l.options.previewTemplate.replace(/\n*/g, ""), l.options.forceFallback || !o.isBrowserSupported()) return s(l, l.options.fallback.call(t(l)));
                    if (null == l.options.url && (l.options.url = l.element.getAttribute("action")), !l.options.url) throw new Error("No URL provided.");
                    if (l.options.acceptedFiles && l.options.acceptedMimeTypes) throw new Error("You can't provide both 'acceptedFiles' and 'acceptedMimeTypes'. 'acceptedMimeTypes' is deprecated.");
                    if (l.options.uploadMultiple && l.options.chunking) throw new Error("You cannot set both: uploadMultiple and chunking.");
                    if (l.options.binaryBody && l.options.uploadMultiple) throw new Error("You cannot set both: binaryBody and uploadMultiple.");
                    return l.options.acceptedMimeTypes && (l.options.acceptedFiles = l.options.acceptedMimeTypes, delete l.options.acceptedMimeTypes), null != l.options.renameFilename && (l.options.renameFile = function(e) {
                        return l.options.renameFilename.call(t(l), e.name, e)
                    }), "string" == typeof l.options.method && (l.options.method = l.options.method.toUpperCase()), (d = l.getExistingFallback()) && d.parentNode && d.parentNode.removeChild(d), !1 !== l.options.previewsContainer && (l.options.previewsContainer ? l.previewsContainer = o.getElement(l.options.previewsContainer, "previewsContainer") : l.previewsContainer = l.element), l.options.clickable && (!0 === l.options.clickable ? l.clickableElements = [l.element] : l.clickableElements = o.getElements(l.options.clickable, "clickable")), l.init(), l
                }
                return l(o, h), r(o, [{
                    key: "getAcceptedFiles",
                    value: function() {
                        return this.files.filter(function(e) {
                            return e.accepted
                        }).map(function(e) {
                            return e
                        })
                    }
                }, {
                    key: "getRejectedFiles",
                    value: function() {
                        return this.files.filter(function(e) {
                            return !e.accepted
                        }).map(function(e) {
                            return e
                        })
                    }
                }, {
                    key: "getFilesWithStatus",
                    value: function(e) {
                        return this.files.filter(function(t) {
                            return t.status === e
                        }).map(function(e) {
                            return e
                        })
                    }
                }, {
                    key: "getQueuedFiles",
                    value: function() {
                        return this.getFilesWithStatus(o.QUEUED)
                    }
                }, {
                    key: "getUploadingFiles",
                    value: function() {
                        return this.getFilesWithStatus(o.UPLOADING)
                    }
                }, {
                    key: "getAddedFiles",
                    value: function() {
                        return this.getFilesWithStatus(o.ADDED)
                    }
                }, {
                    key: "getActiveFiles",
                    value: function() {
                        return this.files.filter(function(e) {
                            return e.status === o.UPLOADING || e.status === o.QUEUED
                        }).map(function(e) {
                            return e
                        })
                    }
                }, {
                    key: "init",
                    value: function() {
                        var e = this,
                            t = this,
                            i = this,
                            n = this,
                            r = this,
                            a = this,
                            l = this,
                            s = this,
                            u = this,
                            c = this,
                            d = this;
                        if ("form" === this.element.tagName && this.element.setAttribute("enctype", "multipart/form-data"), this.element.classList.contains("dropzone") && !this.element.querySelector(".dz-message") && this.element.appendChild(o.createElement('<div class="dz-default dz-message"><button class="dz-button" type="button">'.concat(this.options.dictDefaultMessage, "</button></div>"))), this.clickableElements.length) {
                            var h = this,
                                p = function() {
                                    var e = h;
                                    h.hiddenFileInput && h.hiddenFileInput.parentNode.removeChild(h.hiddenFileInput), h.hiddenFileInput = document.createElement("input"), h.hiddenFileInput.setAttribute("type", "file"), (null === h.options.maxFiles || h.options.maxFiles > 1) && h.hiddenFileInput.setAttribute("multiple", "multiple"), h.hiddenFileInput.className = "dz-hidden-input", null !== h.options.acceptedFiles && h.hiddenFileInput.setAttribute("accept", h.options.acceptedFiles), null !== h.options.capture && h.hiddenFileInput.setAttribute("capture", h.options.capture), h.hiddenFileInput.setAttribute("tabindex", "-1"), h.hiddenFileInput.style.visibility = "hidden", h.hiddenFileInput.style.position = "absolute", h.hiddenFileInput.style.top = "0", h.hiddenFileInput.style.left = "0", h.hiddenFileInput.style.height = "0", h.hiddenFileInput.style.width = "0", o.getElement(h.options.hiddenInputContainer, "hiddenInputContainer").appendChild(h.hiddenFileInput), h.hiddenFileInput.addEventListener("change", function() {
                                        var t = e.hiddenFileInput.files,
                                            i = !0,
                                            n = !1,
                                            r = void 0;
                                        if (t.length) try {
                                            for (var a, o = t[Symbol.iterator](); !(i = (a = o.next()).done); i = !0) {
                                                var l = a.value;
                                                e.addFile(l)
                                            }
                                        } catch (e) {
                                            n = !0, r = e
                                        } finally {
                                            try {
                                                i || null == o.return || o.return()
                                            } finally {
                                                if (n) throw r
                                            }
                                        }
                                        e.emit("addedfiles", t), p()
                                    })
                                };
                            p()
                        }
                        this.URL = null !== window.URL ? window.URL : window.webkitURL;
                        var f = !0,
                            m = !1,
                            v = void 0;
                        try {
                            for (var y, g = this.events[Symbol.iterator](); !(f = (y = g.next()).done); f = !0) {
                                var b = y.value;
                                this.on(b, this.options[b])
                            }
                        } catch (e) {
                            m = !0, v = e
                        } finally {
                            try {
                                f || null == g.return || g.return()
                            } finally {
                                if (m) throw v
                            }
                        }
                        this.on("uploadprogress", function() {
                            return e.updateTotalUploadProgress()
                        }), this.on("removedfile", function() {
                            return t.updateTotalUploadProgress()
                        }), this.on("canceled", function(e) {
                            return i.emit("complete", e)
                        }), this.on("complete", function(e) {
                            var t = n;
                            if (0 === n.getAddedFiles().length && 0 === n.getUploadingFiles().length && 0 === n.getQueuedFiles().length) return setTimeout(function() {
                                return t.emit("queuecomplete")
                            }, 0)
                        });
                        var k = function(e) {
                            if (function(e) {
                                    if (e.dataTransfer.types)
                                        for (var t = 0; t < e.dataTransfer.types.length; t++)
                                            if ("Files" === e.dataTransfer.types[t]) return !0;
                                    return !1
                                }(e)) return e.stopPropagation(), e.preventDefault ? e.preventDefault() : e.returnValue = !1
                        };
                        return this.listeners = [{
                            element: this.element,
                            events: {
                                dragstart: function(e) {
                                    return r.emit("dragstart", e)
                                },
                                dragenter: function(e) {
                                    return k(e), a.emit("dragenter", e)
                                },
                                dragover: function(e) {
                                    var t;
                                    try {
                                        t = e.dataTransfer.effectAllowed
                                    } catch (e) {}
                                    return e.dataTransfer.dropEffect = "move" === t || "linkMove" === t ? "move" : "copy", k(e), l.emit("dragover", e)
                                },
                                dragleave: function(e) {
                                    return s.emit("dragleave", e)
                                },
                                drop: function(e) {
                                    return k(e), u.drop(e)
                                },
                                dragend: function(e) {
                                    return c.emit("dragend", e)
                                }
                            }
                        }], this.clickableElements.forEach(function(e) {
                            var t = d;
                            return d.listeners.push({
                                element: e,
                                events: {
                                    click: function(i) {
                                        return (e !== t.element || i.target === t.element || o.elementInside(i.target, t.element.querySelector(".dz-message"))) && t.hiddenFileInput.click(), !0
                                    }
                                }
                            })
                        }), this.enable(), this.options.init.call(this)
                    }
                }, {
                    key: "destroy",
                    value: function() {
                        return this.disable(), this.removeAllFiles(!0), (null != this.hiddenFileInput ? this.hiddenFileInput.parentNode : void 0) && (this.hiddenFileInput.parentNode.removeChild(this.hiddenFileInput), this.hiddenFileInput = null), delete this.element.dropzone, o.instances.splice(o.instances.indexOf(this), 1)
                    }
                }, {
                    key: "updateTotalUploadProgress",
                    value: function() {
                        var e, t = 0,
                            i = 0;
                        if (this.getActiveFiles().length) {
                            var n = !0,
                                r = !1,
                                a = void 0;
                            try {
                                for (var o, l = this.getActiveFiles()[Symbol.iterator](); !(n = (o = l.next()).done); n = !0) {
                                    var s = o.value;
                                    t += s.upload.bytesSent, i += s.upload.total
                                }
                            } catch (e) {
                                r = !0, a = e
                            } finally {
                                try {
                                    n || null == l.return || l.return()
                                } finally {
                                    if (r) throw a
                                }
                            }
                            e = 100 * t / i
                        } else e = 100;
                        return this.emit("totaluploadprogress", e, i, t)
                    }
                }, {
                    key: "_getParamName",
                    value: function(e) {
                        return "function" == typeof this.options.paramName ? this.options.paramName(e) : "".concat(this.options.paramName).concat(this.options.uploadMultiple ? "[".concat(e, "]") : "")
                    }
                }, {
                    key: "_renameFile",
                    value: function(e) {
                        return "function" != typeof this.options.renameFile ? e.name : this.options.renameFile(e)
                    }
                }, {
                    key: "getFallbackForm",
                    value: function() {
                        var e, t;
                        if (e = this.getExistingFallback()) return e;
                        var i = '<div class="dz-fallback">';
                        this.options.dictFallbackText && (i += "<p>".concat(this.options.dictFallbackText, "</p>")), i += '<input type="file" name="'.concat(this._getParamName(0), '" ').concat(this.options.uploadMultiple ? 'multiple="multiple"' : void 0, ' /><input type="submit" value="Upload!"></div>');
                        var n = o.createElement(i);
                        return "FORM" !== this.element.tagName ? (t = o.createElement('<form action="'.concat(this.options.url, '" enctype="multipart/form-data" method="').concat(this.options.method, '"></form>'))).appendChild(n) : (this.element.setAttribute("enctype", "multipart/form-data"), this.element.setAttribute("method", this.options.method)), null != t ? t : n
                    }
                }, {
                    key: "getExistingFallback",
                    value: function() {
                        var e = function(e) {
                                var t = !0,
                                    i = !1,
                                    n = void 0;
                                try {
                                    for (var r, a = e[Symbol.iterator](); !(t = (r = a.next()).done); t = !0) {
                                        var o = r.value;
                                        if (/(^| )fallback($| )/.test(o.className)) return o
                                    }
                                } catch (e) {
                                    i = !0, n = e
                                } finally {
                                    try {
                                        t || null == a.return || a.return()
                                    } finally {
                                        if (i) throw n
                                    }
                                }
                            },
                            t = !0,
                            i = !1,
                            n = void 0;
                        try {
                            for (var r, a = ["div", "form"][Symbol.iterator](); !(t = (r = a.next()).done); t = !0) {
                                var o, l = r.value;
                                if (o = e(this.element.getElementsByTagName(l))) return o
                            }
                        } catch (e) {
                            i = !0, n = e
                        } finally {
                            try {
                                t || null == a.return || a.return()
                            } finally {
                                if (i) throw n
                            }
                        }
                    }
                }, {
                    key: "setupEventListeners",
                    value: function() {
                        return this.listeners.map(function(e) {
                            return function() {
                                var t = [];
                                for (var i in e.events) {
                                    var n = e.events[i];
                                    t.push(e.element.addEventListener(i, n, !1))
                                }
                                return t
                            }()
                        })
                    }
                }, {
                    key: "removeEventListeners",
                    value: function() {
                        return this.listeners.map(function(e) {
                            return function() {
                                var t = [];
                                for (var i in e.events) {
                                    var n = e.events[i];
                                    t.push(e.element.removeEventListener(i, n, !1))
                                }
                                return t
                            }()
                        })
                    }
                }, {
                    key: "disable",
                    value: function() {
                        var e = this;
                        return this.clickableElements.forEach(function(e) {
                            return e.classList.remove("dz-clickable")
                        }), this.removeEventListeners(), this.disabled = !0, this.files.map(function(t) {
                            return e.cancelUpload(t)
                        })
                    }
                }, {
                    key: "enable",
                    value: function() {
                        return delete this.disabled, this.clickableElements.forEach(function(e) {
                            return e.classList.add("dz-clickable")
                        }), this.setupEventListeners()
                    }
                }, {
                    key: "filesize",
                    value: function(e) {
                        var t = 0,
                            i = "b";
                        if (e > 0) {
                            for (var n = ["tb", "gb", "mb", "kb", "b"], r = 0; r < n.length; r++) {
                                var a = n[r];
                                if (e >= Math.pow(this.options.filesizeBase, 4 - r) / 10) {
                                    t = e / Math.pow(this.options.filesizeBase, 4 - r), i = a;
                                    break
                                }
                            }
                            t = Math.round(10 * t) / 10
                        }
                        return "<strong>".concat(t, "</strong> ").concat(this.options.dictFileSizeUnits[i])
                    }
                }, {
                    key: "_updateMaxFilesReachedClass",
                    value: function() {
                        return null != this.options.maxFiles && this.getAcceptedFiles().length >= this.options.maxFiles ? (this.getAcceptedFiles().length === this.options.maxFiles && this.emit("maxfilesreached", this.files), this.element.classList.add("dz-max-files-reached")) : this.element.classList.remove("dz-max-files-reached")
                    }
                }, {
                    key: "drop",
                    value: function(e) {
                        if (e.dataTransfer) {
                            this.emit("drop", e);
                            for (var t = [], i = 0; i < e.dataTransfer.files.length; i++) t[i] = e.dataTransfer.files[i];
                            if (t.length) {
                                var n = e.dataTransfer.items;
                                n && n.length && null != n[0].webkitGetAsEntry ? this._addFilesFromItems(n) : this.handleFiles(t)
                            }
                            this.emit("addedfiles", t)
                        }
                    }
                }, {
                    key: "paste",
                    value: function(e) {
                        if (null != (null != (t = null != e ? e.clipboardData : void 0) ? function(e) {
                                return e.items
                            }(t) : void 0)) {
                            var t;
                            this.emit("paste", e);
                            var n = e.clipboardData.items;
                            return n.length ? this._addFilesFromItems(n) : void 0
                        }
                    }
                }, {
                    key: "handleFiles",
                    value: function(e) {
                        var t = !0,
                            i = !1,
                            n = void 0;
                        try {
                            for (var r, a = e[Symbol.iterator](); !(t = (r = a.next()).done); t = !0) {
                                var o = r.value;
                                this.addFile(o)
                            }
                        } catch (e) {
                            i = !0, n = e
                        } finally {
                            try {
                                t || null == a.return || a.return()
                            } finally {
                                if (i) throw n
                            }
                        }
                    }
                }, {
                    key: "_addFilesFromItems",
                    value: function(e) {
                        var t = this;
                        return function() {
                            var i = [],
                                n = !0,
                                r = !1,
                                a = void 0;
                            try {
                                for (var o, l = e[Symbol.iterator](); !(n = (o = l.next()).done); n = !0) {
                                    var s, u = o.value;
                                    null != u.webkitGetAsEntry && (s = u.webkitGetAsEntry()) ? s.isFile ? i.push(t.addFile(u.getAsFile())) : s.isDirectory ? i.push(t._addFilesFromDirectory(s, s.name)) : i.push(void 0) : null == u.getAsFile || null != u.kind && "file" !== u.kind ? i.push(void 0) : i.push(t.addFile(u.getAsFile()))
                                }
                            } catch (e) {
                                r = !0, a = e
                            } finally {
                                try {
                                    n || null == l.return || l.return()
                                } finally {
                                    if (r) throw a
                                }
                            }
                            return i
                        }()
                    }
                }, {
                    key: "_addFilesFromDirectory",
                    value: function(e, t) {
                        var i = this,
                            n = e.createReader(),
                            r = function(e) {
                                return "log", n = function(t) {
                                    return t.log(e)
                                }, null != (t = console) && "function" == typeof t.log ? n(t) : void 0;
                                var t, n
                            },
                            a = function() {
                                var e = i;
                                return n.readEntries(function(i) {
                                    if (i.length > 0) {
                                        var n = !0,
                                            r = !1,
                                            o = void 0;
                                        try {
                                            for (var l, s = i[Symbol.iterator](); !(n = (l = s.next()).done); n = !0) {
                                                var u = l.value,
                                                    c = e;
                                                u.isFile ? u.file(function(e) {
                                                    if (!c.options.ignoreHiddenFiles || "." !== e.name.substring(0, 1)) return e.fullPath = "".concat(t, "/").concat(e.name), c.addFile(e)
                                                }) : u.isDirectory && e._addFilesFromDirectory(u, "".concat(t, "/").concat(u.name))
                                            }
                                        } catch (e) {
                                            r = !0, o = e
                                        } finally {
                                            try {
                                                n || null == s.return || s.return()
                                            } finally {
                                                if (r) throw o
                                            }
                                        }
                                        a()
                                    }
                                    return null
                                }, r)
                            };
                        return a()
                    }
                }, {
                    key: "accept",
                    value: function(e, t) {
                        this.options.maxFilesize && e.size > 1048576 * this.options.maxFilesize ? t(this.options.dictFileTooBig.replace("{{filesize}}", Math.round(e.size / 1024 / 10.24) / 100).replace("{{maxFilesize}}", this.options.maxFilesize)) : o.isValidFile(e, this.options.acceptedFiles) ? null != this.options.maxFiles && this.getAcceptedFiles().length >= this.options.maxFiles ? (t(this.options.dictMaxFilesExceeded.replace("{{maxFiles}}", this.options.maxFiles)), this.emit("maxfilesexceeded", e)) : this.options.accept.call(this, e, t) : t(this.options.dictInvalidFileType)
                    }
                }, {
                    key: "addFile",
                    value: function(e) {
                        var t = this;
                        e.upload = {
                            uuid: o.uuidv4(),
                            progress: 0,
                            total: e.size,
                            bytesSent: 0,
                            filename: this._renameFile(e)
                        }, this.files.push(e), e.status = o.ADDED, this.emit("addedfile", e), this._enqueueThumbnail(e), this.accept(e, function(i) {
                            i ? (e.accepted = !1, t._errorProcessing([e], i)) : (e.accepted = !0, t.options.autoQueue && t.enqueueFile(e)), t._updateMaxFilesReachedClass()
                        })
                    }
                }, {
                    key: "enqueueFiles",
                    value: function(e) {
                        var t = !0,
                            i = !1,
                            n = void 0;
                        try {
                            for (var r, a = e[Symbol.iterator](); !(t = (r = a.next()).done); t = !0) {
                                var o = r.value;
                                this.enqueueFile(o)
                            }
                        } catch (e) {
                            i = !0, n = e
                        } finally {
                            try {
                                t || null == a.return || a.return()
                            } finally {
                                if (i) throw n
                            }
                        }
                        return null
                    }
                }, {
                    key: "enqueueFile",
                    value: function(e) {
                        if (e.status !== o.ADDED || !0 !== e.accepted) throw new Error("This file can't be queued because it has already been processed or was rejected.");
                        var t = this;
                        if (e.status = o.QUEUED, this.options.autoProcessQueue) return setTimeout(function() {
                            return t.processQueue()
                        }, 0)
                    }
                }, {
                    key: "_enqueueThumbnail",
                    value: function(e) {
                        if (this.options.createImageThumbnails && e.type.match(/image.*/) && e.size <= 1048576 * this.options.maxThumbnailFilesize) {
                            var t = this;
                            return this._thumbnailQueue.push(e), setTimeout(function() {
                                return t._processThumbnailQueue()
                            }, 0)
                        }
                    }
                }, {
                    key: "_processThumbnailQueue",
                    value: function() {
                        var e = this;
                        if (!this._processingThumbnail && 0 !== this._thumbnailQueue.length) {
                            this._processingThumbnail = !0;
                            var t = this._thumbnailQueue.shift();
                            return this.createThumbnail(t, this.options.thumbnailWidth, this.options.thumbnailHeight, this.options.thumbnailMethod, !0, function(i) {
                                return e.emit("thumbnail", t, i), e._processingThumbnail = !1, e._processThumbnailQueue()
                            })
                        }
                    }
                }, {
                    key: "removeFile",
                    value: function(e) {
                        if (e.status === o.UPLOADING && this.cancelUpload(e), this.files = m(this.files, e), this.emit("removedfile", e), 0 === this.files.length) return this.emit("reset")
                    }
                }, {
                    key: "removeAllFiles",
                    value: function(e) {
                        null == e && (e = !1);
                        var t = !0,
                            i = !1,
                            n = void 0;
                        try {
                            for (var r, a = this.files.slice()[Symbol.iterator](); !(t = (r = a.next()).done); t = !0) {
                                var l = r.value;
                                (l.status !== o.UPLOADING || e) && this.removeFile(l)
                            }
                        } catch (e) {
                            i = !0, n = e
                        } finally {
                            try {
                                t || null == a.return || a.return()
                            } finally {
                                if (i) throw n
                            }
                        }
                        return null
                    }
                }, {
                    key: "resizeImage",
                    value: function(e, t, i, n, r) {
                        var a = this;
                        return this.createThumbnail(e, t, i, n, !0, function(t, i) {
                            if (null == i) return r(e);
                            var n = a.options.resizeMimeType;
                            null == n && (n = e.type);
                            var l = i.toDataURL(n, a.options.resizeQuality);
                            return "image/jpeg" !== n && "image/jpg" !== n || (l = g.restore(e.dataURL, l)), r(o.dataURItoBlob(l))
                        })
                    }
                }, {
                    key: "createThumbnail",
                    value: function(e, t, i, n, r, a) {
                        var o = this,
                            l = new FileReader;
                        l.onload = function() {
                            e.dataURL = l.result, "image/svg+xml" !== e.type ? o.createThumbnailFromUrl(e, t, i, n, r, a) : null != a && a(l.result)
                        }, l.readAsDataURL(e)
                    }
                }, {
                    key: "displayExistingFile",
                    value: function(e, t, i, n, r) {
                        var a = void 0 === r || r;
                        if (this.emit("addedfile", e), this.emit("complete", e), a) {
                            var o = this;
                            e.dataURL = t, this.createThumbnailFromUrl(e, this.options.thumbnailWidth, this.options.thumbnailHeight, this.options.thumbnailMethod, this.options.fixOrientation, function(t) {
                                o.emit("thumbnail", e, t), i && i()
                            }, n)
                        } else this.emit("thumbnail", e, t), i && i()
                    }
                }, {
                    key: "createThumbnailFromUrl",
                    value: function(e, t, i, n, r, a, o) {
                        var l = this,
                            s = document.createElement("img");
                        return o && (s.crossOrigin = o), r = "from-image" != getComputedStyle(document.body).imageOrientation && r, s.onload = function() {
                            var o = l,
                                u = function(e) {
                                    return e(1)
                                };
                            return "undefined" != typeof EXIF && null !== EXIF && r && (u = function(e) {
                                return EXIF.getData(s, function() {
                                    return e(EXIF.getTag(this, "Orientation"))
                                })
                            }), u(function(r) {
                                e.width = s.width, e.height = s.height;
                                var l = o.options.resize.call(o, e, t, i, n),
                                    u = document.createElement("canvas"),
                                    c = u.getContext("2d");
                                switch (u.width = l.trgWidth, u.height = l.trgHeight, r > 4 && (u.width = l.trgHeight, u.height = l.trgWidth), r) {
                                    case 2:
                                        c.translate(u.width, 0), c.scale(-1, 1);
                                        break;
                                    case 3:
                                        c.translate(u.width, u.height), c.rotate(Math.PI);
                                        break;
                                    case 4:
                                        c.translate(0, u.height), c.scale(1, -1);
                                        break;
                                    case 5:
                                        c.rotate(.5 * Math.PI), c.scale(1, -1);
                                        break;
                                    case 6:
                                        c.rotate(.5 * Math.PI), c.translate(0, -u.width);
                                        break;
                                    case 7:
                                        c.rotate(.5 * Math.PI), c.translate(u.height, -u.width), c.scale(-1, 1);
                                        break;
                                    case 8:
                                        c.rotate(-.5 * Math.PI), c.translate(-u.height, 0)
                                }
                                y(c, s, null != l.srcX ? l.srcX : 0, null != l.srcY ? l.srcY : 0, l.srcWidth, l.srcHeight, null != l.trgX ? l.trgX : 0, null != l.trgY ? l.trgY : 0, l.trgWidth, l.trgHeight);
                                var d = u.toDataURL("image/png");
                                if (null != a) return a(d, u)
                            })
                        }, null != a && (s.onerror = a), s.src = e.dataURL
                    }
                }, {
                    key: "processQueue",
                    value: function() {
                        var e = this.options.parallelUploads,
                            t = this.getUploadingFiles().length,
                            i = t;
                        if (!(t >= e)) {
                            var n = this.getQueuedFiles();
                            if (n.length > 0) {
                                if (this.options.uploadMultiple) return this.processFiles(n.slice(0, e - t));
                                for (; i < e;) {
                                    if (!n.length) return;
                                    this.processFile(n.shift()), i++
                                }
                            }
                        }
                    }
                }, {
                    key: "processFile",
                    value: function(e) {
                        return this.processFiles([e])
                    }
                }, {
                    key: "processFiles",
                    value: function(e) {
                        var t = !0,
                            i = !1,
                            n = void 0;
                        try {
                            for (var r, a = e[Symbol.iterator](); !(t = (r = a.next()).done); t = !0) {
                                var l = r.value;
                                l.processing = !0, l.status = o.UPLOADING, this.emit("processing", l)
                            }
                        } catch (e) {
                            i = !0, n = e
                        } finally {
                            try {
                                t || null == a.return || a.return()
                            } finally {
                                if (i) throw n
                            }
                        }
                        return this.options.uploadMultiple && this.emit("processingmultiple", e), this.uploadFiles(e)
                    }
                }, {
                    key: "_getFilesWithXhr",
                    value: function(e) {
                        return this.files.filter(function(t) {
                            return t.xhr === e
                        }).map(function(e) {
                            return e
                        })
                    }
                }, {
                    key: "cancelUpload",
                    value: function(e) {
                        if (e.status === o.UPLOADING) {
                            var t = this._getFilesWithXhr(e.xhr),
                                i = !0,
                                n = !1,
                                r = void 0;
                            try {
                                for (var a, l = t[Symbol.iterator](); !(i = (a = l.next()).done); i = !0)(p = a.value).status = o.CANCELED
                            } catch (e) {
                                n = !0, r = e
                            } finally {
                                try {
                                    i || null == l.return || l.return()
                                } finally {
                                    if (n) throw r
                                }
                            }
                            void 0 !== e.xhr && e.xhr.abort();
                            var s = !0,
                                u = !1,
                                c = void 0;
                            try {
                                for (var d, h = t[Symbol.iterator](); !(s = (d = h.next()).done); s = !0) {
                                    var p = d.value;
                                    this.emit("canceled", p)
                                }
                            } catch (e) {
                                u = !0, c = e
                            } finally {
                                try {
                                    s || null == h.return || h.return()
                                } finally {
                                    if (u) throw c
                                }
                            }
                            this.options.uploadMultiple && this.emit("canceledmultiple", t)
                        } else e.status !== o.ADDED && e.status !== o.QUEUED || (e.status = o.CANCELED, this.emit("canceled", e), this.options.uploadMultiple && this.emit("canceledmultiple", [e]));
                        if (this.options.autoProcessQueue) return this.processQueue()
                    }
                }, {
                    key: "resolveOption",
                    value: function(e) {
                        for (var t = arguments.length, i = new Array(t > 1 ? t - 1 : 0), n = 1; n < t; n++) i[n - 1] = arguments[n];
                        return "function" == typeof e ? e.apply(this, i) : e
                    }
                }, {
                    key: "uploadFile",
                    value: function(e) {
                        return this.uploadFiles([e])
                    }
                }, {
                    key: "uploadFiles",
                    value: function(e) {
                        var t = this;
                        this._transformFiles(e, function(i) {
                            if (t.options.chunking) {
                                var n = i[0];
                                e[0].upload.chunked = t.options.chunking && (t.options.forceChunking || n.size > t.options.chunkSize), e[0].upload.totalChunkCount = Math.ceil(n.size / t.options.chunkSize)
                            }
                            if (e[0].upload.chunked) {
                                var r = t,
                                    a = t,
                                    l = e[0];
                                n = i[0], l.upload.chunks = [];
                                var s = function() {
                                    for (var t = 0; void 0 !== l.upload.chunks[t];) t++;
                                    if (!(t >= l.upload.totalChunkCount)) {
                                        var i = t * r.options.chunkSize,
                                            a = Math.min(i + r.options.chunkSize, n.size),
                                            s = {
                                                name: r._getParamName(0),
                                                data: n.webkitSlice ? n.webkitSlice(i, a) : n.slice(i, a),
                                                filename: l.upload.filename,
                                                chunkIndex: t
                                            };
                                        l.upload.chunks[t] = {
                                            file: l,
                                            index: t,
                                            dataBlock: s,
                                            status: o.UPLOADING,
                                            progress: 0,
                                            retries: 0
                                        }, r._uploadData(e, [s])
                                    }
                                };
                                if (l.upload.finishedChunkUpload = function(t, i) {
                                        var n = a,
                                            r = !0;
                                        t.status = o.SUCCESS, t.dataBlock = null, t.response = t.xhr.responseText, t.responseHeaders = t.xhr.getAllResponseHeaders(), t.xhr = null;
                                        for (var u = 0; u < l.upload.totalChunkCount; u++) {
                                            if (void 0 === l.upload.chunks[u]) return s();
                                            l.upload.chunks[u].status !== o.SUCCESS && (r = !1)
                                        }
                                        r && a.options.chunksUploaded(l, function() {
                                            n._finished(e, i, null)
                                        })
                                    }, t.options.parallelChunkUploads)
                                    for (var u = 0; u < l.upload.totalChunkCount; u++) s();
                                else s()
                            } else {
                                var c = [];
                                for (u = 0; u < e.length; u++) c[u] = {
                                    name: t._getParamName(u),
                                    data: i[u],
                                    filename: e[u].upload.filename
                                };
                                t._uploadData(e, c)
                            }
                        })
                    }
                }, {
                    key: "_getChunk",
                    value: function(e, t) {
                        for (var i = 0; i < e.upload.totalChunkCount; i++)
                            if (void 0 !== e.upload.chunks[i] && e.upload.chunks[i].xhr === t) return e.upload.chunks[i]
                    }
                }, {
                    key: "_uploadData",
                    value: function(t, i) {
                        var n = this,
                            r = this,
                            a = this,
                            o = this,
                            l = new XMLHttpRequest,
                            s = !0,
                            c = !1,
                            d = void 0;
                        try {
                            for (var h = t[Symbol.iterator](); !(s = (x = h.next()).done); s = !0)(g = x.value).xhr = l
                        } catch (e) {
                            c = !0, d = e
                        } finally {
                            try {
                                s || null == h.return || h.return()
                            } finally {
                                if (c) throw d
                            }
                        }
                        t[0].upload.chunked && (t[0].upload.chunks[i[0].chunkIndex].xhr = l);
                        var p = this.resolveOption(this.options.method, t, i),
                            f = this.resolveOption(this.options.url, t, i);
                        l.open(p, f, !0), this.resolveOption(this.options.timeout, t) && (l.timeout = this.resolveOption(this.options.timeout, t)), l.withCredentials = !!this.options.withCredentials, l.onload = function(e) {
                            n._finishedUploading(t, l, e)
                        }, l.ontimeout = function() {
                            r._handleUploadError(t, l, "Request timedout after ".concat(r.options.timeout / 1e3, " seconds"))
                        }, l.onerror = function() {
                            a._handleUploadError(t, l)
                        }, (null != l.upload ? l.upload : l).onprogress = function(e) {
                            return o._updateFilesUploadProgress(t, l, e)
                        };
                        var m = this.options.defaultHeaders ? {
                            Accept: "application/json",
                            "Cache-Control": "no-cache",
                            "X-Requested-With": "XMLHttpRequest"
                        } : {};
                        for (var v in this.options.binaryBody && (m["Content-Type"] = t[0].type), this.options.headers && e(u)(m, this.options.headers), m) {
                            var y = m[v];
                            y && l.setRequestHeader(v, y)
                        }
                        if (this.options.binaryBody) {
                            s = !0, c = !1, d = void 0;
                            try {
                                for (h = t[Symbol.iterator](); !(s = (x = h.next()).done); s = !0) {
                                    var g = x.value;
                                    this.emit("sending", g, l)
                                }
                            } catch (e) {
                                c = !0, d = e
                            } finally {
                                try {
                                    s || null == h.return || h.return()
                                } finally {
                                    if (c) throw d
                                }
                            }
                            this.options.uploadMultiple && this.emit("sendingmultiple", t, l), this.submitRequest(l, null, t)
                        } else {
                            var b = new FormData;
                            if (this.options.params) {
                                var k = this.options.params;
                                for (var w in "function" == typeof k && (k = k.call(this, t, l, t[0].upload.chunked ? this._getChunk(t[0], l) : null)), k) {
                                    var F = k[w];
                                    if (Array.isArray(F))
                                        for (var E = 0; E < F.length; E++) b.append(w, F[E]);
                                    else b.append(w, F)
                                }
                            }
                            s = !0, c = !1, d = void 0;
                            try {
                                var x;
                                for (h = t[Symbol.iterator](); !(s = (x = h.next()).done); s = !0) g = x.value, this.emit("sending", g, l, b)
                            } catch (e) {
                                c = !0, d = e
                            } finally {
                                try {
                                    s || null == h.return || h.return()
                                } finally {
                                    if (c) throw d
                                }
                            }
                            for (this.options.uploadMultiple && this.emit("sendingmultiple", t, l, b), this._addFormElementData(b), E = 0; E < i.length; E++) {
                                var z = i[E];
                                b.append(z.name, z.data, z.filename)
                            }
                            this.submitRequest(l, b, t)
                        }
                    }
                }, {
                    key: "_transformFiles",
                    value: function(e, t) {
                        for (var i = this, n = function(n) {
                                i.options.transformFile.call(i, e[n], function(i) {
                                    r[n] = i, ++a === e.length && t(r)
                                })
                            }, r = [], a = 0, o = 0; o < e.length; o++) n(o)
                    }
                }, {
                    key: "_addFormElementData",
                    value: function(e) {
                        var t = !0,
                            i = !1,
                            n = void 0;
                        if ("FORM" === this.element.tagName) try {
                            for (var r = this.element.querySelectorAll("input, textarea, select, button")[Symbol.iterator](); !(t = (s = r.next()).done); t = !0) {
                                var a = s.value,
                                    o = a.getAttribute("name"),
                                    l = a.getAttribute("type");
                                if (l && (l = l.toLowerCase()), null != o)
                                    if ("SELECT" === a.tagName && a.hasAttribute("multiple")) {
                                        t = !0, i = !1, n = void 0;
                                        try {
                                            var s;
                                            for (r = a.options[Symbol.iterator](); !(t = (s = r.next()).done); t = !0) {
                                                var u = s.value;
                                                u.selected && e.append(o, u.value)
                                            }
                                        } catch (e) {
                                            i = !0, n = e
                                        } finally {
                                            try {
                                                t || null == r.return || r.return()
                                            } finally {
                                                if (i) throw n
                                            }
                                        }
                                    } else(!l || "checkbox" !== l && "radio" !== l || a.checked) && e.append(o, a.value)
                            }
                        } catch (e) {
                            i = !0, n = e
                        } finally {
                            try {
                                t || null == r.return || r.return()
                            } finally {
                                if (i) throw n
                            }
                        }
                    }
                }, {
                    key: "_updateFilesUploadProgress",
                    value: function(e, t, i) {
                        var n = !0,
                            r = !1,
                            a = void 0;
                        if (e[0].upload.chunked) {
                            c = e[0];
                            var o = this._getChunk(c, t);
                            i ? (o.progress = 100 * i.loaded / i.total, o.total = i.total, o.bytesSent = i.loaded) : (o.progress = 100, o.bytesSent = o.total), c.upload.progress = 0, c.upload.total = 0, c.upload.bytesSent = 0;
                            for (var l = 0; l < c.upload.totalChunkCount; l++) c.upload.chunks[l] && void 0 !== c.upload.chunks[l].progress && (c.upload.progress += c.upload.chunks[l].progress, c.upload.total += c.upload.chunks[l].total, c.upload.bytesSent += c.upload.chunks[l].bytesSent);
                            c.upload.progress = c.upload.progress / c.upload.totalChunkCount, this.emit("uploadprogress", c, c.upload.progress, c.upload.bytesSent)
                        } else try {
                            for (var s, u = e[Symbol.iterator](); !(n = (s = u.next()).done); n = !0) {
                                var c;
                                (c = s.value).upload.total && c.upload.bytesSent && c.upload.bytesSent == c.upload.total || (i ? (c.upload.progress = 100 * i.loaded / i.total, c.upload.total = i.total, c.upload.bytesSent = i.loaded) : (c.upload.progress = 100, c.upload.bytesSent = c.upload.total), this.emit("uploadprogress", c, c.upload.progress, c.upload.bytesSent))
                            }
                        } catch (e) {
                            r = !0, a = e
                        } finally {
                            try {
                                n || null == u.return || u.return()
                            } finally {
                                if (r) throw a
                            }
                        }
                    }
                }, {
                    key: "_finishedUploading",
                    value: function(e, t, i) {
                        var n;
                        if (e[0].status !== o.CANCELED && 4 === t.readyState) {
                            if ("arraybuffer" !== t.responseType && "blob" !== t.responseType && (n = t.responseText, t.getResponseHeader("content-type") && ~t.getResponseHeader("content-type").indexOf("application/json"))) try {
                                n = JSON.parse(n)
                            } catch (e) {
                                i = e, n = "Invalid JSON response from server."
                            }
                            this._updateFilesUploadProgress(e, t), 200 <= t.status && t.status < 300 ? e[0].upload.chunked ? e[0].upload.finishedChunkUpload(this._getChunk(e[0], t), n) : this._finished(e, n, i) : this._handleUploadError(e, t, n)
                        }
                    }
                }, {
                    key: "_handleUploadError",
                    value: function(e, t, i) {
                        if (e[0].status !== o.CANCELED) {
                            if (e[0].upload.chunked && this.options.retryChunks) {
                                var n = this._getChunk(e[0], t);
                                if (n.retries++ < this.options.retryChunksLimit) return void this._uploadData(e, [n.dataBlock]);
                                console.warn("Retried this chunk too often. Giving up.")
                            }
                            this._errorProcessing(e, i || this.options.dictResponseError.replace("{{statusCode}}", t.status), t)
                        }
                    }
                }, {
                    key: "submitRequest",
                    value: function(e, t, i) {
                        if (1 == e.readyState)
                            if (this.options.binaryBody)
                                if (i[0].upload.chunked) {
                                    var n = this._getChunk(i[0], e);
                                    e.send(n.dataBlock.data)
                                } else e.send(i[0]);
                        else e.send(t);
                        else console.warn("Cannot send this request because the XMLHttpRequest.readyState is not OPENED.")
                    }
                }, {
                    key: "_finished",
                    value: function(e, t, i) {
                        var n = !0,
                            r = !1,
                            a = void 0;
                        try {
                            for (var l, s = e[Symbol.iterator](); !(n = (l = s.next()).done); n = !0) {
                                var u = l.value;
                                u.status = o.SUCCESS, this.emit("success", u, t, i), this.emit("complete", u)
                            }
                        } catch (e) {
                            r = !0, a = e
                        } finally {
                            try {
                                n || null == s.return || s.return()
                            } finally {
                                if (r) throw a
                            }
                        }
                        if (this.options.uploadMultiple && (this.emit("successmultiple", e, t, i), this.emit("completemultiple", e)), this.options.autoProcessQueue) return this.processQueue()
                    }
                }, {
                    key: "_errorProcessing",
                    value: function(e, t, i) {
                        var n = !0,
                            r = !1,
                            a = void 0;
                        try {
                            for (var l, s = e[Symbol.iterator](); !(n = (l = s.next()).done); n = !0) {
                                var u = l.value;
                                u.status = o.ERROR, this.emit("error", u, t, i), this.emit("complete", u)
                            }
                        } catch (e) {
                            r = !0, a = e
                        } finally {
                            try {
                                n || null == s.return || s.return()
                            } finally {
                                if (r) throw a
                            }
                        }
                        if (this.options.uploadMultiple && (this.emit("errormultiple", e, t, i), this.emit("completemultiple", e)), this.options.autoProcessQueue) return this.processQueue()
                    }
                }], [{
                    key: "initClass",
                    value: function() {
                        this.prototype.Emitter = h, this.prototype.events = ["drop", "dragstart", "dragend", "dragenter", "dragover", "dragleave", "addedfile", "addedfiles", "removedfile", "thumbnail", "error", "errormultiple", "processing", "processingmultiple", "uploadprogress", "totaluploadprogress", "sending", "sendingmultiple", "success", "successmultiple", "canceled", "canceledmultiple", "complete", "completemultiple", "reset", "maxfilesexceeded", "maxfilesreached", "queuecomplete"], this.prototype._thumbnailQueue = [], this.prototype._processingThumbnail = !1
                    }
                }, {
                    key: "uuidv4",
                    value: function() {
                        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(e) {
                            var t = 16 * Math.random() | 0;
                            return ("x" === e ? t : 3 & t | 8).toString(16)
                        })
                    }
                }]), o
            }();
        f.initClass(), f.options = {}, f.optionsForElement = function(e) {
            return e.getAttribute("id") ? f.options[v(e.getAttribute("id"))] : void 0
        }, f.instances = [], f.forElement = function(e) {
            if ("string" == typeof e && (e = document.querySelector(e)), null == (null != e ? e.dropzone : void 0)) throw new Error("No Dropzone found for given element. This is probably because you're trying to access it before Dropzone had the time to initialize. Use the `init` option to setup any additional observers on your Dropzone.");
            return e.dropzone
        }, f.discover = function() {
            var e;
            if (document.querySelectorAll) e = document.querySelectorAll(".dropzone");
            else {
                e = [];
                var t = function(t) {
                    return function() {
                        var i = [],
                            n = !0,
                            r = !1,
                            a = void 0;
                        try {
                            for (var o, l = t[Symbol.iterator](); !(n = (o = l.next()).done); n = !0) {
                                var s = o.value;
                                /(^| )dropzone($| )/.test(s.className) ? i.push(e.push(s)) : i.push(void 0)
                            }
                        } catch (e) {
                            r = !0, a = e
                        } finally {
                            try {
                                n || null == l.return || l.return()
                            } finally {
                                if (r) throw a
                            }
                        }
                        return i
                    }()
                };
                t(document.getElementsByTagName("div")), t(document.getElementsByTagName("form"))
            }
            return function() {
                var t = [],
                    i = !0,
                    n = !1,
                    r = void 0;
                try {
                    for (var a, o = e[Symbol.iterator](); !(i = (a = o.next()).done); i = !0) {
                        var l = a.value;
                        !1 !== f.optionsForElement(l) ? t.push(new f(l)) : t.push(void 0)
                    }
                } catch (e) {
                    n = !0, r = e
                } finally {
                    try {
                        i || null == o.return || o.return()
                    } finally {
                        if (n) throw r
                    }
                }
                return t
            }()
        }, f.blockedBrowsers = [/opera.*(Macintosh|Windows Phone).*version\/12/i], f.isBrowserSupported = function() {
            var e = !0;
            if (window.File && window.FileReader && window.FileList && window.Blob && window.FormData && document.querySelector)
                if ("classList" in document.createElement("a")) {
                    void 0 !== f.blacklistedBrowsers && (f.blockedBrowsers = f.blacklistedBrowsers);
                    var t = !0,
                        i = !1,
                        n = void 0;
                    try {
                        for (var r, a = f.blockedBrowsers[Symbol.iterator](); !(t = (r = a.next()).done); t = !0) r.value.test(navigator.userAgent) && (e = !1)
                    } catch (e) {
                        i = !0, n = e
                    } finally {
                        try {
                            t || null == a.return || a.return()
                        } finally {
                            if (i) throw n
                        }
                    }
                } else e = !1;
            else e = !1;
            return e
        }, f.dataURItoBlob = function(e) {
            for (var t = atob(e.split(",")[1]), i = e.split(",")[0].split(":")[1].split(";")[0], n = new ArrayBuffer(t.length), r = new Uint8Array(n), a = 0, o = t.length, l = 0 <= o; l ? a <= o : a >= o; l ? a++ : a--) r[a] = t.charCodeAt(a);
            return new Blob([n], {
                type: i
            })
        };
        var m = function(e, t) {
                return e.filter(function(e) {
                    return e !== t
                }).map(function(e) {
                    return e
                })
            },
            v = function(e) {
                return e.replace(/[\-_](\w)/g, function(e) {
                    return e.charAt(1).toUpperCase()
                })
            };
        f.createElement = function(e) {
            var t = document.createElement("div");
            return t.innerHTML = e, t.childNodes[0]
        }, f.elementInside = function(e, t) {
            if (e === t) return !0;
            for (; e = e.parentNode;)
                if (e === t) return !0;
            return !1
        }, f.getElement = function(e, t) {
            var i;
            if ("string" == typeof e ? i = document.querySelector(e) : null != e.nodeType && (i = e), null == i) throw new Error("Invalid `".concat(t, "` option provided. Please provide a CSS selector or a plain HTML element."));
            return i
        }, f.getElements = function(e, t) {
            var i, n;
            if (e instanceof Array) {
                n = [];
                try {
                    var r = !0,
                        a = !1,
                        o = void 0;
                    try {
                        for (var l = e[Symbol.iterator](); !(r = (s = l.next()).done); r = !0) i = s.value, n.push(this.getElement(i, t))
                    } catch (e) {
                        a = !0, o = e
                    } finally {
                        try {
                            r || null == l.return || l.return()
                        } finally {
                            if (a) throw o
                        }
                    }
                } catch (e) {
                    n = null
                }
            } else if ("string" == typeof e) {
                n = [], r = !0, a = !1, o = void 0;
                try {
                    var s;
                    for (l = document.querySelectorAll(e)[Symbol.iterator](); !(r = (s = l.next()).done); r = !0) i = s.value, n.push(i)
                } catch (e) {
                    a = !0, o = e
                } finally {
                    try {
                        r || null == l.return || l.return()
                    } finally {
                        if (a) throw o
                    }
                }
            } else null != e.nodeType && (n = [e]);
            if (null == n || !n.length) throw new Error("Invalid `".concat(t, "` option provided. Please provide a CSS selector, a plain HTML element or a list of those."));
            return n
        }, f.confirm = function(e, t, i) {
            return window.confirm(e) ? t() : null != i ? i() : void 0
        }, f.isValidFile = function(e, t) {
            if (!t) return !0;
            t = t.split(",");
            var i = e.type,
                n = i.replace(/\/.*$/, ""),
                r = !0,
                a = !1,
                o = void 0;
            try {
                for (var l, s = t[Symbol.iterator](); !(r = (l = s.next()).done); r = !0) {
                    var u = l.value;
                    if ("." === (u = u.trim()).charAt(0)) {
                        if (-1 !== e.name.toLowerCase().indexOf(u.toLowerCase(), e.name.length - u.length)) return !0
                    } else if (/\/\*$/.test(u)) {
                        if (n === u.replace(/\/.*$/, "")) return !0
                    } else if (i === u) return !0
                }
            } catch (e) {
                a = !0, o = e
            } finally {
                try {
                    r || null == s.return || s.return()
                } finally {
                    if (a) throw o
                }
            }
            return !1
        }, "undefined" != typeof jQuery && null !== jQuery && (jQuery.fn.dropzone = function(e) {
            return this.each(function() {
                return new f(this, e)
            })
        }), f.ADDED = "added", f.QUEUED = "queued", f.ACCEPTED = f.QUEUED, f.UPLOADING = "uploading", f.PROCESSING = f.UPLOADING, f.CANCELED = "canceled", f.ERROR = "error", f.SUCCESS = "success";
        var y = function(e, t, i, n, r, a, o, l, s, u) {
                var c = function(e) {
                    e.naturalWidth;
                    var t = e.naturalHeight,
                        i = document.createElement("canvas");
                    i.width = 1, i.height = t;
                    var n = i.getContext("2d");
                    n.drawImage(e, 0, 0);
                    for (var r = n.getImageData(1, 0, 1, t).data, a = 0, o = t, l = t; l > a;) 0 === r[4 * (l - 1) + 3] ? o = l : a = l, l = o + a >> 1;
                    var s = l / t;
                    return 0 === s ? 1 : s
                }(t);
                return e.drawImage(t, i, n, r, a, o, l, s, u / c)
            },
            g = function() {
                "use strict";

                function e() {
                    i(this, e)
                }
                return r(e, null, [{
                    key: "initClass",
                    value: function() {
                        this.KEY_STR = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
                    }
                }, {
                    key: "encode64",
                    value: function(e) {
                        for (var t = "", i = void 0, n = void 0, r = "", a = void 0, o = void 0, l = void 0, s = "", u = 0; a = (i = e[u++]) >> 2, o = (3 & i) << 4 | (n = e[u++]) >> 4, l = (15 & n) << 2 | (r = e[u++]) >> 6, s = 63 & r, isNaN(n) ? l = s = 64 : isNaN(r) && (s = 64), t = t + this.KEY_STR.charAt(a) + this.KEY_STR.charAt(o) + this.KEY_STR.charAt(l) + this.KEY_STR.charAt(s), i = n = r = "", a = o = l = s = "", u < e.length;);
                        return t
                    }
                }, {
                    key: "restore",
                    value: function(e, t) {
                        if (!e.match("data:image/jpeg;base64,")) return t;
                        var i = this.decode64(e.replace("data:image/jpeg;base64,", "")),
                            n = this.slice2Segments(i),
                            r = this.exifManipulation(t, n);
                        return "data:image/jpeg;base64,".concat(this.encode64(r))
                    }
                }, {
                    key: "exifManipulation",
                    value: function(e, t) {
                        var i = this.getExifArray(t),
                            n = this.insertExif(e, i);
                        return new Uint8Array(n)
                    }
                }, {
                    key: "getExifArray",
                    value: function(e) {
                        for (var t = void 0, i = 0; i < e.length;) {
                            if (255 === (t = e[i])[0] & 225 === t[1]) return t;
                            i++
                        }
                        return []
                    }
                }, {
                    key: "insertExif",
                    value: function(e, t) {
                        var i = e.replace("data:image/jpeg;base64,", ""),
                            n = this.decode64(i),
                            r = n.indexOf(255, 3),
                            a = n.slice(0, r),
                            o = n.slice(r),
                            l = a;
                        return (l = l.concat(t)).concat(o)
                    }
                }, {
                    key: "slice2Segments",
                    value: function(e) {
                        for (var t = 0, i = []; !(255 === e[t] & 218 === e[t + 1]);) {
                            if (255 === e[t] & 216 === e[t + 1]) t += 2;
                            else {
                                var n = t + (256 * e[t + 2] + e[t + 3]) + 2,
                                    r = e.slice(t, n);
                                i.push(r), t = n
                            }
                            if (t > e.length) break
                        }
                        return i
                    }
                }, {
                    key: "decode64",
                    value: function(e) {
                        var t = void 0,
                            i = void 0,
                            n = "",
                            r = void 0,
                            a = void 0,
                            o = "",
                            l = 0,
                            s = [];
                        for (/[^A-Za-z0-9\+\/\=]/g.exec(e) && console.warn("There were invalid base64 characters in the input text.\nValid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\nExpect errors in decoding."), e = e.replace(/[^A-Za-z0-9\+\/\=]/g, ""); t = this.KEY_STR.indexOf(e.charAt(l++)) << 2 | (r = this.KEY_STR.indexOf(e.charAt(l++))) >> 4, i = (15 & r) << 4 | (a = this.KEY_STR.indexOf(e.charAt(l++))) >> 2, n = (3 & a) << 6 | (o = this.KEY_STR.indexOf(e.charAt(l++))), s.push(t), 64 !== a && s.push(i), 64 !== o && s.push(n), t = i = n = "", r = a = o = "", l < e.length;);
                        return s
                    }
                }]), e
            }();
        g.initClass(), window.Dropzone = f
    }()
}, function(module, exports, __webpack_require__) {}, function(module, exports, __webpack_require__) {}, function(module, exports, __webpack_require__) {}, function(module, exports, __webpack_require__) {}, function(module, exports, __webpack_require__) {}, function(module, exports, __webpack_require__) {
    var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;
    /*!
     * jQuery Templates Plugin 1.0.0pre
     * http://github.com/jquery/jquery-tmpl
     * Requires jQuery 1.4.2
     *
     * Copyright 2011, Software Freedom Conservancy, Inc.
     * Dual licensed under the MIT or GPL Version 2 licenses.
     * http://jquery.org/license
     */
    __WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], void 0 === (__WEBPACK_AMD_DEFINE_RESULT__ = "function" == typeof(__WEBPACK_AMD_DEFINE_FACTORY__ = function(jQuery) {
        var appendToTmplItems, oldManip = jQuery.fn.domManip,
            tmplItmAtt = "_tmplitem",
            htmlExpr = /^[^<]*(<[\w\W]+>)[^>]*$|\{\{\! /,
            newTmplItems = {},
            wrappedItems = {},
            topTmplItem = {
                key: 0,
                data: {}
            },
            itemKey = 0,
            cloneIndex = 0,
            stack = [];

        function newTmplItem(options, parentItem, fn, data) {
            var newItem = {
                data: data || 0 === data || !1 === data ? data : parentItem ? parentItem.data : {},
                _wrap: parentItem ? parentItem._wrap : null,
                tmpl: null,
                parent: parentItem || null,
                nodes: [],
                calls: tiCalls,
                nest: tiNest,
                wrap: tiWrap,
                html: tiHtml,
                update: tiUpdate
            };
            return options && jQuery.extend(newItem, options, {
                nodes: [],
                parent: parentItem
            }), fn && (newItem.tmpl = fn, newItem._ctnt = newItem._ctnt || newItem.tmpl(jQuery, newItem), newItem.key = ++itemKey, (stack.length ? wrappedItems : newTmplItems)[itemKey] = newItem), newItem
        }

        function build(tmplItem, nested, content) {
            var frag, ret = content ? jQuery.map(content, function(item) {
                return "string" == typeof item ? tmplItem.key ? item.replace(/(<\w+)(?=[\s>])(?![^>]*_tmplitem)([^>]*)/g, "$1 " + tmplItmAtt + '="' + tmplItem.key + '" $2') : item : build(item, tmplItem, item._ctnt)
            }) : tmplItem;
            return nested ? ret : ((ret = ret.join("")).replace(/^\s*([^<\s][^<]*)?(<[\w\W]+>)([^>]*[^>\s])?\s*$/, function(all, before, middle, after) {
                storeTmplItems(frag = jQuery(middle).get()), before && (frag = unencode(before).concat(frag)), after && (frag = frag.concat(unencode(after)))
            }), frag || unencode(ret))
        }

        function unencode(text) {
            var el = document.createElement("div");
            return el.innerHTML = text, jQuery.makeArray(el.childNodes)
        }

        function buildTmplFn(markup) {
            return new Function("jQuery", "$item", "var $=jQuery,call,__=[],$data=$item.data;with($data){__.push('" + jQuery.trim(markup).replace(/([\\'])/g, "\\$1").replace(/[\r\t\n]/g, " ").replace(/\$\{([^\}]*)\}/g, "{{= $1}}").replace(/\{\{(\/?)(\w+|.)(?:\(((?:[^\}]|\}(?!\}))*?)?\))?(?:\s+(.*?)?)?(\(((?:[^\}]|\}(?!\}))*?)\))?\s*\}\}/g, function(all, slash, type, fnargs, target, parens, args) {
                var def, expr, exprAutoFnDetect, tag = jQuery.tmpl.tag[type];
                if (!tag) throw "Unknown template tag: " + type;
                return def = tag._default || [], parens && !/\w$/.test(target) && (target += parens, parens = ""), target ? (target = unescape(target), args = args ? "," + unescape(args) + ")" : parens ? ")" : "", expr = parens ? target.indexOf(".") > -1 ? target + unescape(parens) : "(" + target + ").call($item" + args : target, exprAutoFnDetect = parens ? expr : "(typeof(" + target + ")==='function'?(" + target + ").call($item):(" + target + "))") : exprAutoFnDetect = expr = def.$1 || "null", fnargs = unescape(fnargs), "');" + tag[slash ? "close" : "open"].split("$notnull_1").join(target ? "typeof(" + target + ")!=='undefined' && (" + target + ")!=null" : "true").split("$1a").join(exprAutoFnDetect).split("$1").join(expr).split("$2").join(fnargs || def.$2 || "") + "__.push('"
            }) + "');}return __;")
        }

        function updateWrapped(options, wrapped) {
            options._wrap = build(options, !0, jQuery.isArray(wrapped) ? wrapped : [htmlExpr.test(wrapped) ? wrapped : jQuery(wrapped).html()]).join("")
        }

        function unescape(args) {
            return args ? args.replace(/\\'/g, "'").replace(/\\\\/g, "\\") : null
        }

        function storeTmplItems(content) {
            var elem, elems, i, l, m, keySuffix = "_" + cloneIndex,
                newClonedItems = {};
            for (i = 0, l = content.length; i < l; i++)
                if (1 === (elem = content[i]).nodeType) {
                    for (elems = elem.getElementsByTagName("*"), m = elems.length - 1; m >= 0; m--) processItemKey(elems[m]);
                    processItemKey(elem)
                }
            function processItemKey(el) {
                var pntKey, pntItem, tmplItem, key, pntNode = el;
                if (key = el.getAttribute(tmplItmAtt)) {
                    for (; pntNode.parentNode && 1 === (pntNode = pntNode.parentNode).nodeType && !(pntKey = pntNode.getAttribute(tmplItmAtt)););
                    pntKey !== key && (pntNode = pntNode.parentNode ? 11 === pntNode.nodeType ? 0 : pntNode.getAttribute(tmplItmAtt) || 0 : 0, (tmplItem = newTmplItems[key]) || ((tmplItem = newTmplItem(tmplItem = wrappedItems[key], newTmplItems[pntNode] || wrappedItems[pntNode])).key = ++itemKey, newTmplItems[itemKey] = tmplItem), cloneIndex && cloneTmplItem(key)), el.removeAttribute(tmplItmAtt)
                } else cloneIndex && (tmplItem = jQuery.data(el, "tmplItem")) && (cloneTmplItem(tmplItem.key), newTmplItems[tmplItem.key] = tmplItem, pntNode = (pntNode = jQuery.data(el.parentNode, "tmplItem")) ? pntNode.key : 0);
                if (tmplItem) {
                    for (pntItem = tmplItem; pntItem && pntItem.key != pntNode;) pntItem.nodes.push(el), pntItem = pntItem.parent;
                    delete tmplItem._ctnt, delete tmplItem._wrap, jQuery.data(el, "tmplItem", tmplItem)
                }

                function cloneTmplItem(key) {
                    tmplItem = newClonedItems[key += keySuffix] = newClonedItems[key] || newTmplItem(tmplItem, newTmplItems[tmplItem.parent.key + keySuffix] || tmplItem.parent)
                }
            }
        }

        function tiCalls(content, tmpl, data, options) {
            if (!content) return stack.pop();
            stack.push({
                _: content,
                tmpl: tmpl,
                item: this,
                data: data,
                options: options
            })
        }

        function tiNest(tmpl, data, options) {
            return jQuery.tmpl(jQuery.template(tmpl), data, options, this)
        }

        function tiWrap(call, wrapped) {
            var options = call.options || {};
            return options.wrapped = wrapped, jQuery.tmpl(jQuery.template(call.tmpl), call.data, options, call.item)
        }

        function tiHtml(filter, textOnly) {
            var wrapped = this._wrap;
            return jQuery.map(jQuery(jQuery.isArray(wrapped) ? wrapped.join("") : wrapped).filter(filter || "*"), function(e) {
                return textOnly ? e.innerText || e.textContent : e.outerHTML || function outerHtml(elem) {
                    var div = document.createElement("div");
                    return div.appendChild(elem.cloneNode(!0)), div.innerHTML
                }(e)
            })
        }

        function tiUpdate() {
            var coll = this.nodes;
            jQuery.tmpl(null, null, null, this).insertBefore(coll[0]), jQuery(coll).remove()
        }
        jQuery.each({
            appendTo: "append",
            prependTo: "prepend",
            insertBefore: "before",
            insertAfter: "after",
            replaceAll: "replaceWith"
        }, function(name, original) {
            jQuery.fn[name] = function(selector) {
                var elems, i, l, tmplItems, ret = [],
                    insert = jQuery(selector),
                    parent = 1 === this.length && this[0].parentNode;
                if (appendToTmplItems = newTmplItems || {}, parent && 11 === parent.nodeType && 1 === parent.childNodes.length && 1 === insert.length) insert[original](this[0]), ret = this;
                else {
                    for (i = 0, l = insert.length; i < l; i++) cloneIndex = i, elems = (i > 0 ? this.clone(!0) : this).get(), jQuery(insert[i])[original](elems), ret = ret.concat(elems);
                    cloneIndex = 0, ret = this.pushStack(ret, name, insert.selector)
                }
                return tmplItems = appendToTmplItems, appendToTmplItems = null, jQuery.tmpl.complete(tmplItems), ret
            }
        }), jQuery.fn.extend({
            tmpl: function tmpl(data, options, parentItem) {
                return jQuery.tmpl(this[0], data, options, parentItem)
            },
            tmplItem: function tmplItem() {
                return jQuery.tmplItem(this[0])
            },
            template: function template(name) {
                return jQuery.template(name, this[0])
            },
            domManip: function domManip(args, table, callback, options) {
                if (args[0] && jQuery.isArray(args[0])) {
                    for (var tmplItem, dmArgs = jQuery.makeArray(arguments), elems = args[0], elemsLength = elems.length, i = 0; i < elemsLength && !(tmplItem = jQuery.data(elems[i++], "tmplItem")););
                    tmplItem && cloneIndex && (dmArgs[2] = function(fragClone) {
                        jQuery.tmpl.afterManip(this, fragClone, callback)
                    }), oldManip.apply(this, dmArgs)
                } else oldManip.apply(this, arguments);
                return cloneIndex = 0, appendToTmplItems || jQuery.tmpl.complete(newTmplItems), this
            }
        }), jQuery.extend({
            tmpl: function tmpl(_tmpl, data, options, parentItem) {
                var ret, topLevel = !parentItem;
                if (topLevel) parentItem = topTmplItem, _tmpl = jQuery.template[_tmpl] || jQuery.template(null, _tmpl), wrappedItems = {};
                else if (!_tmpl) return _tmpl = parentItem.tmpl, newTmplItems[parentItem.key] = parentItem, parentItem.nodes = [], parentItem.wrapped && updateWrapped(parentItem, parentItem.wrapped), jQuery(build(parentItem, null, parentItem.tmpl(jQuery, parentItem)));
                return _tmpl ? ("function" == typeof data && (data = data.call(parentItem || {})), options && options.wrapped && updateWrapped(options, options.wrapped), ret = jQuery.isArray(data) ? jQuery.map(data, function(dataItem) {
                    return dataItem ? newTmplItem(options, parentItem, _tmpl, dataItem) : null
                }) : [newTmplItem(options, parentItem, _tmpl, data)], topLevel ? jQuery(build(parentItem, null, ret)) : ret) : []
            },
            tmplItem: function tmplItem(elem) {
                var tmplItem;
                for (elem instanceof jQuery && (elem = elem[0]); elem && 1 === elem.nodeType && !(tmplItem = jQuery.data(elem, "tmplItem")) && (elem = elem.parentNode););
                return tmplItem || topTmplItem
            },
            template: function template(name, tmpl) {
                return tmpl ? ("string" == typeof tmpl ? tmpl = buildTmplFn(tmpl) : tmpl instanceof jQuery && (tmpl = tmpl[0] || {}), tmpl.nodeType && (tmpl = jQuery.data(tmpl, "tmpl") || jQuery.data(tmpl, "tmpl", buildTmplFn(tmpl.innerHTML))), "string" == typeof name ? jQuery.template[name] = tmpl : tmpl) : name ? "string" != typeof name ? jQuery.template(null, name) : jQuery.template[name] || jQuery.template(null, htmlExpr.test(name) ? name : jQuery(name)) : null
            },
            encode: function encode(text) {
                return ("" + text).split("<").join("&lt;").split(">").join("&gt;").split('"').join("&#34;").split("'").join("&#39;")
            }
        }), jQuery.extend(jQuery.tmpl, {
            tag: {
                tmpl: {
                    _default: {
                        $2: "null"
                    },
                    open: "if($notnull_1){__=__.concat($item.nest($1,$2));}"
                },
                wrap: {
                    _default: {
                        $2: "null"
                    },
                    open: "$item.calls(__,$1,$2);__=[];",
                    close: "call=$item.calls();__=call._.concat($item.wrap(call,__));"
                },
                each: {
                    _default: {
                        $2: "$index, $value"
                    },
                    open: "if($notnull_1){$.each($1a,function($2){with(this){",
                    close: "}});}"
                },
                if: {
                    open: "if(($notnull_1) && $1a){",
                    close: "}"
                },
                else: {
                    _default: {
                        $1: "true"
                    },
                    open: "}else if(($notnull_1) && $1a){"
                },
                html: {
                    open: "if($notnull_1){__.push($1a);}"
                },
                "=": {
                    _default: {
                        $1: "$data"
                    },
                    open: "if($notnull_1){__.push($.encode($1a));}"
                },
                "!": {
                    open: ""
                }
            },
            complete: function complete(items) {
                newTmplItems = {}
            },
            afterManip: function afterManip(elem, fragClone, callback) {
                var content = 11 === fragClone.nodeType ? jQuery.makeArray(fragClone.childNodes) : 1 === fragClone.nodeType ? [fragClone] : [];
                callback.call(elem, fragClone), storeTmplItems(content), cloneIndex++
            }
        })
    }) ? __WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__) : __WEBPACK_AMD_DEFINE_FACTORY__) || (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__);
    var get = __webpack_require__(12),
        get_default = __webpack_require__.n(get),
        buildSuccessMessageNode = (__webpack_require__(54), __webpack_require__(56), __webpack_require__(59), __webpack_require__(61), __webpack_require__(63), __webpack_require__(65), __webpack_require__(66), __webpack_require__(68), __webpack_require__(69), __webpack_require__(70), __webpack_require__(71), __webpack_require__(72), __webpack_require__(73), function buildSuccessMessageNode(text) {
            return '<div class="form-done-booking">\n    <div class="sb-subtitle sb-text-image__content-subtitle">'.concat(text, '</div>\n    <div class="sb-paragraph sb-text-image__content-paragraph">A confirmation email has been sent to your email address.</div>\n  </div>')
        });

    function getResponseElementValue(formEl) {
        return formEl.querySelector(".g-recaptcha-response").value || ""
    }

    function getErrorElement(formEl) {
        return formEl.querySelector(".grecaptcha-error")
    }
    var reCaptcha2 = {
        isValid: function recaptcha_es6_isValid(formEl) {
            return 0 !== getResponseElementValue(formEl).length
        },
        getResponseElementValue: getResponseElementValue,
        clearError: function clearError(formEl) {
            getErrorElement(formEl).style.display = "none"
        },
        highlightError: function highlightError(formEl) {
            getErrorElement(formEl).style.display = "block"
        }
    };

    function addReCaptchaTokenInput(token, formEl) {
        var reCaptchaTokenInput = Object.assign(document.createElement("input"), {
            type: "hidden",
            name: "google_recaptcha_token",
            value: token
        });
        formEl.appendChild(reCaptchaTokenInput)
    }
    var CONTACT_DATA_FIELDS = {
            name: ["name", "displayName"],
            email: ["from_email", "email", "E-mail Address", "E-mail 2 Address", "E-mail 3 Address", "Alternate Email 1", "Alternate Email 2", "E-mail 1 - Value", "E-mail 2 - Value", "E-mail 3 - Value", "email-address-1"],
            phone: ["from_phone", "phone", "Mobile Phone", "Home Phone", "Home Phone 2", "Primary Phone", "Business Phone", "Business Phone 2", "Phone 1 - Value", "Phone 2 - Value", "Phone 3 - Value", "Other Phone"]
        },
        schedulingUtils = {
            getRescheduleAppointmentUuidFromQueryParams: function getRescheduleAppointmentUuidFromQueryParams() {
                return new URLSearchParams(window.location.search).get("reschedule_appointment_uuid")
            },
            isRescheduleForm: function isRescheduleForm(semanticTagBluePrint) {
                return semanticTagBluePrint === this.RESCHEDULE_FORM_SEMANTIC_TAG
            }
        };

    function _typeof(obj) {
        return (_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function _typeof(obj) {
            return typeof obj
        } : function _typeof(obj) {
            return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj
        })(obj)
    }

    function _slicedToArray(arr, i) {
        return function _arrayWithHoles(arr) {
            if (Array.isArray(arr)) return arr
        }(arr) || function _iterableToArrayLimit(arr, i) {
            var _arr = [],
                _n = !0,
                _d = !1,
                _e = void 0;
            try {
                for (var _s, _i = arr[Symbol.iterator](); !(_n = (_s = _i.next()).done) && (_arr.push(_s.value), !i || _arr.length !== i); _n = !0);
            } catch (err) {
                _d = !0, _e = err
            } finally {
                try {
                    _n || null == _i.return || _i.return()
                } finally {
                    if (_d) throw _e
                }
            }
            return _arr
        }(arr, i) || function _nonIterableRest() {
            throw new TypeError("Invalid attempt to destructure non-iterable instance")
        }()
    }
    Object.defineProperty(schedulingUtils, "RESCHEDULE_FORM_SEMANTIC_TAG", {
            value: "reschedule-page-form",
            writable: !1,
            enumerable: !0,
            configurable: !1
        }), Object.defineProperty(schedulingUtils, "SEMANTIC_TAG_ATTRIBUTE", {
            value: "data-semantic-tag-blueprint",
            writable: !1,
            enumerable: !0,
            configurable: !1
        }),
        function() {
            var PRODUCT_HOST = "undefined" == typeof __PRODUCT_URL__ ? "https://b12.io" : __PRODUCT_URL__,
                CONTACT_FORM_SUBMISSION_URL = "".concat(PRODUCT_HOST, "/contact/send/");

            function setFormSubmissionMessage(messageNode, formNode) {
                var formSuccessMessageChildNodes = messageNode.childNodes,
                    formSuccessMessageFirstChildNode = _slicedToArray(formSuccessMessageChildNodes, 1)[0];
                if (1 === formSuccessMessageChildNodes.length && formSuccessMessageFirstChildNode.nodeType === Node.TEXT_NODE) {
                    var successMessageNode = formSuccessMessageFirstChildNode.textContent;
                    formNode.insertAdjacentHTML("afterend", buildSuccessMessageNode(successMessageNode))
                } else messageNode.style.display = "block"
            }

            function attachDropzoneFiles(formEl, formData) {
                var countAttachedFiles = 0,
                    dropzoneElements = formEl.getElementsByClassName("dropzone");
                if (dropzoneElements.length > 0)
                    for (var index in dropzoneElements) {
                        var currentDropzone = dropzoneElements.item(index).dropzone,
                            acceptedFiles = currentDropzone.getAcceptedFiles();
                        for (var i in countAttachedFiles += acceptedFiles.length, formData.has(currentDropzone._getParamName()) && formData.delete(currentDropzone._getParamName()), acceptedFiles) formData.append(currentDropzone._getParamName(), acceptedFiles[i])
                    }
                return countAttachedFiles
            }
            var setupForm = function setupForm(formEl) {
                if (window.hasOwnProperty("b12") && window.b12.nextSteps.prefillFormFields(formEl), 0 === formEl.id.indexOf("UL_FORM_")) {
                    formEl.method = "POST", formEl.action = CONTACT_FORM_SUBMISSION_URL;
                    var formUUID = formEl.id.slice("UL_FORM_".length),
                        formUUIDInput = document.createElement("input");
                    formUUIDInput.type = "hidden", formUUIDInput.name = "form_id", formUUIDInput.value = formUUID;
                    var nextPage = formEl.getAttribute("data-redirect");
                    nextPage || (nextPage = window.location.href, window.location.hash.length && (nextPage = nextPage.slice(0, -window.location.hash.length)), nextPage += "#success_" + formEl.id);
                    var nextPageInput = document.createElement("input");
                    nextPageInput.type = "hidden", nextPageInput.name = "next_page", nextPageInput.value = nextPage;
                    var honeypot = document.createElement("input");
                    if (honeypot.type = "text", honeypot.style.display = "none", honeypot.name = "sweet_auth_token", honeypot.setAttribute("aria-hidden", "true"), honeypot.setAttribute("aria-label", "Auth token"), formEl.appendChild(formUUIDInput), formEl.appendChild(nextPageInput), formEl.appendChild(honeypot), schedulingUtils.isRescheduleForm(formEl.getAttribute(schedulingUtils.SEMANTIC_TAG_ATTRIBUTE))) {
                        var rescheduleAppointmentUuid = document.createElement("input");
                        rescheduleAppointmentUuid.type = "hidden", rescheduleAppointmentUuid.name = "reschedule_appointment_uuid", rescheduleAppointmentUuid.value = schedulingUtils.getRescheduleAppointmentUuidFromQueryParams(), formEl.appendChild(rescheduleAppointmentUuid)
                    }
                }
                if ("ajax" === formEl.getAttribute("data-send-type")) {
                    var formAJAXInput = document.createElement("input");
                    formAJAXInput.type = "hidden", formAJAXInput.name = "ajax", formAJAXInput.value = "true", formEl.appendChild(formAJAXInput);
                    var url = $(formEl).attr("action"),
                        formParentElement = formEl.parentElement,
                        formSuccessMessageElement = formParentElement.querySelector(".b12-form-done"),
                        formErrorMessageElement = formParentElement.querySelector(".b12-form-error"),
                        reCaptchaVersion = parseInt(formEl.dataset.recaptchaVersion || 1);
                    $(formEl).submit(function(e) {
                        if ((e.preventDefault(), function validateCheckboxes(formEl) {
                                for (var elements = formEl.querySelectorAll(".form__group--checkbox"), isValid = !0, i = 0; i < elements.length; i++) {
                                    var hasCheckedBoxes = elements[i].querySelectorAll("input[type=checkbox]:checked").length > 0;
                                    if (elements[i].dataset.isRequired) {
                                        var errorElement = elements[i].querySelector(".form__checkbox-error");
                                        hasCheckedBoxes ? errorElement.style.display = "none" : (errorElement.style.display = "block", isValid = !1)
                                    } else {
                                        var defaultInput = elements[i].querySelector(".form__input--checkbox-default");
                                        defaultInput && (defaultInput.disabled = hasCheckedBoxes)
                                    }
                                }
                                return isValid
                            }(formEl)) && (function validateBookingField(formEl) {
                                var isValid = !0,
                                    inlineAppointmentWrapper = formEl.querySelector(".sb-bookings-appointment--inline"),
                                    bookingInput = formEl.querySelector(".js-booking-placeholder"),
                                    bookingError = formEl.querySelector(".appointment-calendar__selected-date-error"),
                                    isBookingFieldRequired = bookingInput && bookingInput.hasAttribute("required");
                                if (bookingError && isBookingFieldRequired)
                                    if (bookingInput.value) bookingError.style.display = "none";
                                    else {
                                        bookingError.style.display = "inline-block";
                                        var appointmentFieldRect = inlineAppointmentWrapper.getBoundingClientRect();
                                        window.scrollTo({
                                            top: appointmentFieldRect.top + window.pageYOffset - 150,
                                            behavior: "smooth"
                                        }), isValid = !1
                                    } return isValid
                            }(formEl) && function validateDropZoneFields(formEl) {
                                var dropZoneElements = formEl.getElementsByClassName("dropzone"),
                                    allDropZoneValidationResults = [];
                                for (var index in dropZoneElements)
                                    if ("object" == _typeof(dropZoneElements[index])) {
                                        var isValid = !0,
                                            currentDropZone = Dropzone.forElement("#" + dropZoneElements.item(index).getAttribute("id")),
                                            closestFormGroup = currentDropZone.element.closest("div.form__group"),
                                            isRequired = closestFormGroup.classList.contains("form__group--required"),
                                            currentCustomErrorContainer = closestFormGroup.querySelector(".custom-dropzone-errors"),
                                            currentFiles = currentDropZone.files;
                                        for (var i in currentFiles)
                                            if (!(isValid = "error" !== currentFiles[i].status)) break;
                                        isRequired && 0 === currentDropZone.getAcceptedFiles().length && isValid && (isValid = !1, currentCustomErrorContainer.innerHTML = "Please upload a file", currentCustomErrorContainer.style.display = "block"), allDropZoneValidationResults.push(isValid)
                                    } return !allDropZoneValidationResults.some(function(element) {
                                    return !1 === element
                                })
                            }(formEl)))
                            if (0 !== reCaptchaVersion || (reCaptcha2.clearError(formEl), reCaptcha2.isValid(formEl))) {
                                var formBtn = $(formEl).find('button[type="submit"]');
                                void 0 !== formBtn && formBtn.addClass("is-loading");
                                var formData = new FormData(formEl),
                                    dropzoneElements = formEl.getElementsByClassName("dropzone");
                                0 === dropzoneElements.length ? formData = $(formEl).serialize() : attachDropzoneFiles(formEl, formData);
                                var formSubmissionAjaxData = {
                                    type: "POST",
                                    headers: {
                                        "X-API-VERSION": 2
                                    },
                                    url: url,
                                    data: formData,
                                    processData: !1,
                                    contentType: !1,
                                    cache: !1,
                                    success: function success(response) {
                                        if (response && response.redirect) window.location.href = response.redirect;
                                        else if (formErrorMessageElement.style.display = "none", formSuccessMessageElement) formEl.style.display = "none", setFormSubmissionMessage(formSuccessMessageElement, formEl);
                                        else if (response && response.success_message) {
                                            var redirect_url = new URL(window.location.href);
                                            new URLSearchParams(redirect_url.search).forEach(function(value, key) {
                                                key.startsWith("prefill") && redirect_url.searchParams.delete(key)
                                            }), redirect_url.searchParams.set("success_message", response.success_message), window.location.href = redirect_url.href
                                        }
                                    },
                                    error: function error(data) {
                                        formErrorMessageElement.style.display = "block"
                                    },
                                    complete: function complete() {
                                        formBtn.removeClass("is-loading")
                                    }
                                };
                                0 === reCaptchaVersion ? (addReCaptchaTokenInput(reCaptcha2.getResponseElementValue(formEl), formEl), submitForm()) : "undefined" != typeof grecaptcha ? grecaptcha.ready(function() {
                                    grecaptcha.execute("6Ld1R8kUAAAAAGEYGyd1RXFcdSGY03uF4y_yN40A", {}).then(function(token) {
                                        addReCaptchaTokenInput(token, formEl), submitForm()
                                    })
                                }) : (console.info("grecaptcha undefined"), submitForm())
                            } else reCaptcha2.highlightError(formEl);

                        function submitForm() {
                            var formData = new FormData(formEl);
                            0 === dropzoneElements.length ? (formData = $(formEl).serialize(), delete formSubmissionAjaxData.processData, delete formSubmissionAjaxData.cache, delete formSubmissionAjaxData.contentType) : 0 === attachDropzoneFiles(formEl, formData) && (formData = $(formEl).serialize(), delete formSubmissionAjaxData.processData, delete formSubmissionAjaxData.cache, delete formSubmissionAjaxData.contentType), formSubmissionAjaxData.data = formData, $.ajax(formSubmissionAjaxData)
                        }
                    })
                }
            };
            document.addEventListener("DOMContentLoaded", function() {
                ! function handleSuccess() {
                    for (var formDoneEls = document.getElementsByClassName("b12-form-done"), formErrorEls = document.getElementsByClassName("b12-form-error"), i = 0; i < formDoneEls.length; i++) formDoneEls[i].style.display = "none";
                    for (var y = 0; y < formErrorEls.length; y++) formErrorEls[y].style.display = "none";
                    if (window.location.hash && 0 === window.location.hash.indexOf("#success_UL_FORM_")) {
                        var formID = window.location.hash.slice("#success_".length),
                            form = document.getElementById(formID);
                        form.style.display = "none";
                        var successMessage = form.parentNode.querySelector(".b12-form-done");
                        setFormSubmissionMessage(successMessage, form), setTimeout(function() {
                            successMessage.scrollIntoView(), window.scrollY - (document.height - window.innerHeight) < 0 && window.scrollBy(0, -150)
                        }, 0)
                    }
                }();
                for (var allForms = document.getElementsByTagName("form"), i = 0; i < allForms.length; i++) setupForm(allForms[i])
            })
        }();
    __webpack_require__(74);

    function _defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    var cookieManager = {
            create: function create(name, value, days) {
                var expires = "";
                if (days) {
                    var date = new Date;
                    date.setTime(date.getTime() + 24 * days * 60 * 60 * 1e3), expires = "; expires=" + date.toGMTString()
                }
                document.cookie = name + "=" + value + expires + "; path=/"
            },
            get: function get(name) {
                for (var nameEQ = name + "=", ca = document.cookie.split(";"), i = 0; i < ca.length; i++) {
                    var c = ca[i];
                    if (0 === (c = c.trimLeft()).indexOf(nameEQ)) return c.substring(nameEQ.length, c.length)
                }
                return null
            },
            erase: function erase(name) {
                this.create(name, "", -1)
            }
        },
        popup = {
            popupContainerSelector: "#sb-popup",
            shown: !1,
            delay: 2,
            cookieExp: 10,
            checkCookie: function checkCookie() {
                return this.cookieExp <= 0 ? (cookieManager.erase("sbep_shown"), !1) : "true" === cookieManager.get("sbep_shown")
            },
            createCookie: function createCookie() {
                cookieManager.create("sbep_shown", "true", this.cookieExp)
            },
            showPopup: function showPopup() {
                var isPublished = !(arguments.length > 0 && void 0 !== arguments[0]) || arguments[0];
                isPublished && this.shown || !$(this.popupContainerSelector).find("section").length || (this.setBackgroundImage(), $(this.popupContainerSelector).addClass("is-visible"), setTimeout(function() {
                    $(popup.popupContainerSelector).addClass("in")
                }, 300), document.body.style.overflow = "hidden", this.shown = !0)
            },
            updatePopupContent: function updatePopupContent() {
                this.setBackgroundImage()
            },
            setBackgroundImage: function setBackgroundImage() {
                var $modalBody = $(this.popupContainerSelector).find(".sb-popup__body");
                $(this.popupContainerSelector).find(".sb-background").appendTo($modalBody), lazyLoadImages.update()
            },
            hidePopup: function hidePopup(persistOnRefresh) {
                $(this.popupContainerSelector).removeClass("is-visible in"), document.body.style.overflow = "auto", persistOnRefresh || this.createCookie()
            },
            setEventHandlers: function setEventHandlers(persistOnRefresh) {
                $(document).on("mouseout", function(event) {
                    var from = (event = event || window.event).relatedTarget || event.toElement;
                    from && "HTML" !== from.nodeName || popup.showPopup()
                }), $(this.popupContainerSelector).find(".sb-popup__close").on("click", function() {
                    popup.hidePopup(persistOnRefresh)
                }), $(document).keyup(function(e) {
                    "Escape" === e.key && popup.hidePopup(persistOnRefresh)
                })
            },
            init: function init() {
                var persistOnRefresh = $(popup.popupContainerSelector).find(".sb-popup").data("persist");
                !persistOnRefresh && this.checkCookie() || setTimeout(function() {
                    popup.setEventHandlers(persistOnRefresh)
                }, 1e3 * popup.delay)
            }
        },
        lightboxModal_html_es6_lightboxModalHtml = function lightboxModalHtml(uuid) {
            return '\n    <div class="fancybox-container" role="dialog" tabindex="-1">\n      <div class="fancybox-bg"></div>\n      <div class="fancybox-inner">\n        <div class="quick-view-content">\n          <div class="quick-view-carousel">\n            <div class="fancybox-stage"></div>\n          </div>\n          <aside class="quick-view-aside">\n            <div class="fancybox-caption-wrap">\n              <div class="fancybox-caption" data-sb-uuid="'.concat(uuid, '"><div class="fancybox-caption__body" data-selectable="true"></div></div>\n            </div>\n          </aside>\n          <nav class="fancybox-controls">\n            <button data-fancybox-prev class="fancybox-button fancybox-button--arrow_left" title="Previous" tabindex="0"><div>').concat(arrowLeft, '</div></button>\n            <div class="fancybox-infobar__body">\n              <span data-fancybox-index></span>&nbsp;/&nbsp;<span data-fancybox-count></span>\n            </div>\n            <button data-fancybox-next class="fancybox-button fancybox-button--arrow_right" title="Next" tabindex="0"><div>').concat(arrowRight, '</div></button>\n          </nav>\n          <button data-fancybox-close class="quick-view-close" tabindex="0"></button>\n        </div>\n      </div>\n    </div>\n  ')
        },
        lightbox = {
            run: function run(_ref) {
                var className = _ref.className,
                    classForVideo = _ref.classForVideo,
                    sectionClasses = _ref.sectionClasses,
                    isInSlider = _ref.isInSlider,
                    _ref$youTubeThumbReso = _ref.youTubeThumbResolution,
                    youTubeThumbResolution = void 0 === _ref$youTubeThumbReso ? "hqdefault" : _ref$youTubeThumbReso,
                    $links = isInSlider ? $(".slick-slide:not(.slick-cloned) ".concat(className)) : $(className),
                    $videoLinks = classForVideo ? $(classForVideo) : null,
                    lightboxClasses = sectionClasses.filter(function(className) {
                        return className.match(/option-lightbox-[\w-_]+/g)
                    }),
                    thumbsPositionClass = sectionClasses.includes("option-lightbox-thumbs-x"),
                    configurationOptions = {
                        baseClass: lightboxClasses ? lightboxClasses.join(" ") : "",
                        thumbs: {
                            axis: thumbsPositionClass ? "x" : "y"
                        },
                        transitionEffect: "slide",
                        closeExisting: !0,
                        loop: !0,
                        btnTpl: {
                            arrowLeft: '<button data-fancybox-prev class="fancybox-button fancybox-button--arrow_left" title="{{PREV}}"><div>'.concat(arrowLeft, "</div></button>"),
                            arrowRight: '<button data-fancybox-next class="fancybox-button fancybox-button--arrow_right" title="{{NEXT}}"><div>'.concat(arrowRight, "</div></button>")
                        },
                        beforeClose: function beforeClose(e, instance) {
                            "undefined" != typeof removeFancyboxInstanceHash && removeFancyboxInstanceHash && (instance.opts.hash = !1)
                        }
                    };
                $links.on("click", function(e) {
                    e.preventDefault(), $.fancybox.open($links, configurationOptions, $links.index($(this)))
                }), $videoLinks && $videoLinks.length > 0 && lightbox.getThumbnailsForVideos($videoLinks, youTubeThumbResolution), isInSlider && lightbox.addEventListenerForSlider(className, $links)
            },
            runModal: function runModal(_ref2) {
                var className = _ref2.className,
                    classForTriggers = _ref2.classForTriggers,
                    sectionClasses = _ref2.sectionClasses,
                    isInSlider = _ref2.isInSlider,
                    uuid = _ref2.uuid,
                    $links = isInSlider ? $(".slick-slide:not(.slick-cloned) ".concat(className)) : $(className),
                    $triggers = classForTriggers ? $(classForTriggers) : null,
                    lightboxClasses = sectionClasses.filter(function(className) {
                        return className.match(/option-modal-[\w-_]+|option-lightbox-[\w-_]+|option-playbutton-inverse/g)
                    }),
                    optionalClasses = lightboxClasses ? lightboxClasses.join(" ") : "";
                $links.on("click", function() {
                    var isText = $(this).data("text") ? "has-no-image" : "";
                    return $.fancybox.open($links, {
                        baseClass: "quick-view-container ".concat(optionalClasses, " ").concat(isText),
                        thumbs: !1,
                        idleTime: !1,
                        preventCaptionOverlap: !1,
                        clickSlide: !1,
                        closeExisting: !0,
                        loop: !0,
                        baseTpl: lightboxModal_html_es6_lightboxModalHtml(uuid),
                        beforeShow: function beforeShow(instance, slide) {
                            var slideOpts = slide.opts.$orig,
                                instanceContainer = instance.$refs.container[0];
                            slideOpts.length > 0 && $(slideOpts[0]).data("text") ? $(instanceContainer).addClass("has-no-image") : $(instanceContainer).removeClass("has-no-image"), instance.update()
                        },
                        beforeClose: function beforeClose(e, instance) {
                            "undefined" != typeof removeFancyboxInstanceHash && removeFancyboxInstanceHash && (instance.opts.hash = !1)
                        }
                    }, $links.index(this)), !1
                }), $triggers && $triggers.length > 0 && $triggers.on("click", function(e) {
                    e.preventDefault(), $(this).closest(".items-grid__item").find(".items-grid__item-image a").trigger("click")
                }), isInSlider && lightbox.addEventListenerForSlider(className, $links), $("body").on("click", ".quick-view-content", function(e) {
                    e.stopImmediatePropagation()
                })
            },
            addEventListenerForSlider: function addEventListenerForSlider(className, $links) {
                $(document).on("click", ".slick-cloned ".concat(className), function(e) {
                    e.preventDefault();
                    var slickIndex = $(e.currentTarget).closest(".slick-cloned").attr("data-slick-index");
                    $links.eq((slickIndex || 0) % $links.length).trigger("click")
                })
            },
            getThumbnailsForVideos: function getThumbnailsForVideos($videoLinks, youTubeThumbResolution) {
                $videoLinks.each(function() {
                    var $this = $(this),
                        videoUrl = $this.attr("href") || $this.parent().attr("href"),
                        hasPreview = $this.data("preview") || $this.parent().data("preview"),
                        parsedUrl = lightbox.parseVideoId(videoUrl);
                    hasPreview || ("youtube" === parsedUrl.type ? lightbox.addThumbnailForVideo($this, "https://img.youtube.com/vi/".concat(parsedUrl.id, "/").concat(youTubeThumbResolution, ".jpg")) : "vimeo" === parsedUrl.type && $.ajax({
                        async: !1,
                        type: "GET",
                        url: "https://vimeo.com/api/v2/video/" + parsedUrl.id + ".json",
                        success: function success(data) {
                            lightbox.addThumbnailForVideo($this, data[0].thumbnail_large)
                        }
                    }))
                })
            },
            addThumbnailForVideo: function addThumbnailForVideo($element, url) {
                $element.css("backgroundImage", "url(".concat(url, ")")).attr("data-bg", "url(".concat(url, ")")).attr("data-thumb", url).find("img").attr("src", url)
            },
            parseVideoId: function parseVideoId(url) {
                url.match(/(http:\/\/|https:\/\/|)(player.|www.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com))\/(video\/|embed\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(\&\S+)?/);
                var type = null;
                return RegExp.$3.indexOf("youtu") > -1 ? type = "youtube" : RegExp.$3.indexOf("vimeo") > -1 && (type = "vimeo"), {
                    type: type,
                    id: RegExp.$6
                }
            }
        };

    function ownKeys(object, enumerableOnly) {
        var keys = Object.keys(object);
        if (Object.getOwnPropertySymbols) {
            var symbols = Object.getOwnPropertySymbols(object);
            enumerableOnly && (symbols = symbols.filter(function(sym) {
                return Object.getOwnPropertyDescriptor(object, sym).enumerable
            })), keys.push.apply(keys, symbols)
        }
        return keys
    }

    function _defineProperty(obj, key, value) {
        return key in obj ? Object.defineProperty(obj, key, {
            value: value,
            enumerable: !0,
            configurable: !0,
            writable: !0
        }) : obj[key] = value, obj
    }
    var b12 = {
        popup: popup,
        banner: banner,
        lightbox: lightbox,
        dropzone: {
            run: function run(_ref) {
                var configurationOptions = _ref.configurationOptions;
                configurationOptions.allow_multiple_upload && (configurationOptions.maxFiles = null);
                var dropZone = new Dropzone(configurationOptions.uuid, function _objectSpread(target) {
                    for (var i = 1; i < arguments.length; i++) {
                        var source = null != arguments[i] ? arguments[i] : {};
                        i % 2 ? ownKeys(source, !0).forEach(function(key) {
                            _defineProperty(target, key, source[key])
                        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(source).forEach(function(key) {
                            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key))
                        })
                    }
                    return target
                }({
                    addRemoveLinks: !0,
                    previewTemplate: '\n  <div class="dz-preview dz-file-preview">\n    <div class="dz-details">\n      <div class="dz-details__data">\n        <div class="dz-filename"><span data-dz-name></span></div>\n        <div class="dz-size" data-dz-size></div>\n      </div>\n      <div class="dz-error-message"><span data-dz-errormessage></span></div>\n    </div>\n  </div>\n',
                    url: "/fake",
                    dictFileTooBig: "File is too big ({{filesize}}MB). Max file size: {{maxFilesize}}MB.",
                    acceptedFiles: "image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.template,application/vnd.ms-excel"
                }, configurationOptions, {
                    init: function init() {
                        var currentDropZone = this;
                        currentDropZone.element.closest("div.form__group").querySelector(".form__label").onclick = function() {
                            (null === currentDropZone.options.maxFiles || currentDropZone.getAcceptedFiles().length < currentDropZone.options.maxFiles) && currentDropZone.element.click()
                        }
                    }
                }));
                dropZone.on("addedfile", function(file) {
                    file.previewElement.closest("div.dropzone-container").querySelector(".custom-dropzone-errors").style.display = "none"
                }), dropZone.on("error", function(file, message) {
                    if (file.previewElement) {
                        file.previewElement.classList.add("dz-error");
                        var _iteratorNormalCompletion = !0,
                            _didIteratorError = !1,
                            _iteratorError = void 0;
                        try {
                            for (var _step, _iterator = file.previewElement.querySelectorAll("[data-dz-errormessage]")[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = !0) {
                                _step.value.textContent = message
                            }
                        } catch (err) {
                            _didIteratorError = !0, _iteratorError = err
                        } finally {
                            try {
                                _iteratorNormalCompletion || null == _iterator.return || _iterator.return()
                            } finally {
                                if (_didIteratorError) throw _iteratorError
                            }
                        }
                    }
                }), dropZone.on("maxfilesexceeded", function(file) {
                    dropZone.removeFile(file)
                })
            }
        },
        MobileSwipeNotification: function() {
            function MobileSwipeNotification(element) {
                ! function _classCallCheck(instance, Constructor) {
                    if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function")
                }(this, MobileSwipeNotification), this.element = element, this.html = '\n      <div class="sb-swipe-notification">\n        <svg width="50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 490.651 490.651"><path fill="#fff" d="M437.328 42.651h-128c-5.888 0-10.667 4.779-10.667 10.667s4.779 10.667 10.667 10.667h128c5.888 0 10.667-4.779 10.667-10.667s-4.779-10.667-10.667-10.667z"/><path fill="#fff" d="M444.88 45.787L402.213 3.12c-4.16-4.16-10.923-4.16-15.083 0s-4.16 10.923 0 15.083l35.115 35.115-35.136 35.136c-4.16 4.16-4.16 10.923 0 15.083a10.716 10.716 0 0015.104 0L444.88 60.87c4.16-4.161 4.16-10.923 0-15.083zM159.995 42.651h-128c-5.888 0-10.667 4.779-10.667 10.667s4.779 10.667 10.667 10.667h128c5.888 0 10.667-4.779 10.667-10.667s-4.779-10.667-10.667-10.667z"/><path fill="#fff" d="M47.077 53.317l35.115-35.115c4.16-4.16 4.16-10.923 0-15.083s-10.923-4.16-15.083 0L24.443 45.787c-4.16 4.16-4.16 10.923 0 15.083l42.667 42.667a10.716 10.716 0 007.552 3.115c2.731 0 5.461-1.045 7.531-3.136 4.16-4.16 4.16-10.923 0-15.083L47.077 53.317zM426.661 213.317a42.524 42.524 0 00-23.723 7.211c-5.845-16.597-21.696-28.544-40.277-28.544a42.524 42.524 0 00-23.723 7.211c-5.845-16.597-21.696-28.544-40.277-28.544a42.321 42.321 0 00-21.333 5.739v-69.739c0-23.531-19.136-42.667-42.667-42.667-23.531 0-42.667 19.136-42.667 42.667v181.333l-37.077-27.797c-21.973-16.491-53.248-14.293-72.725 5.163-12.48 12.48-12.48 32.768 0 45.248l151.915 151.936c18.133 18.133 42.261 28.117 67.904 28.117h49.984c64.683 0 117.333-52.629 117.333-117.333V255.984c0-23.531-19.136-42.667-42.667-42.667zm21.334 160c0 52.928-43.072 96-96 96h-49.984c-19.968 0-38.72-7.765-52.821-21.867L97.275 295.515c-4.16-4.16-4.16-10.923 0-15.083 6.613-6.592 15.445-9.984 24.32-9.984 7.211 0 14.464 2.24 20.544 6.805l54.123 40.597a10.704 10.704 0 0011.179 1.003 10.684 10.684 0 005.888-9.536V106.651c0-11.755 9.557-21.333 21.333-21.333s21.333 9.579 21.333 21.333v160c0 5.888 4.779 10.667 10.667 10.667s10.667-4.779 10.667-10.667v-53.333c0-11.755 9.557-21.333 21.333-21.333s21.333 9.579 21.333 21.333v53.333c0 5.888 4.779 10.667 10.667 10.667s10.667-4.779 10.667-10.667v-32c0-11.755 9.557-21.333 21.333-21.333s21.333 9.579 21.333 21.333v32c0 5.888 4.779 10.667 10.667 10.667s10.667-4.779 10.667-10.667v-10.667c0-11.755 9.557-21.333 21.333-21.333s21.333 9.579 21.333 21.333v117.333z"/></svg>\n      </div>\n    '
            }
            return function _createClass(Constructor, protoProps, staticProps) {
                return protoProps && _defineProperties(Constructor.prototype, protoProps), staticProps && _defineProperties(Constructor, staticProps), Constructor
            }(MobileSwipeNotification, [{
                key: "isInView",
                value: function isInView(el) {
                    if (el) {
                        var box = el.getBoundingClientRect();
                        return box.top + box.height / 2 < window.innerHeight && box.bottom >= 0
                    }
                    this.destroy(el)
                }
            }, {
                key: "isInViewHandler",
                value: function isInViewHandler() {
                    var _this = this,
                        el = document.getElementById(this.element);
                    if (this.isInView(el)) {
                        var swipeNotifElement = el.querySelector(".sb-swipe-notification");
                        swipeNotifElement && (swipeNotifElement.style.opacity = 1, setTimeout(function() {
                            swipeNotifElement.style.opacity = 0, setTimeout(function() {
                                return _this.destroy(el)
                            }, 180)
                        }, 1300))
                    }
                }
            }, {
                key: "init",
                value: function init() {
                    var _this2 = this;
                    ! function matchMedia(query, callback, usePolyfill) {
                        var host = {};
                        if (window && window.matchMedia && !usePolyfill) {
                            var res = window.matchMedia(query);
                            callback.apply(host, [res.matches, res.media]), res.addListener(function(changed) {
                                callback.apply(host, [changed.matches, changed.media])
                            })
                        }
                    }("(max-width: 767px)", function(match) {
                        var sliderWrapper = document.getElementById(_this2.element);
                        sliderWrapper && (match ? (sliderWrapper.insertAdjacentHTML("afterbegin", _this2.html), document.addEventListener("scroll", _this2.isInViewHandler.bind(_this2))) : _this2.destroy(sliderWrapper))
                    })
                }
            }, {
                key: "destroy",
                value: function destroy(el) {
                    if (el) {
                        var swipeNotifElement = el.querySelector(".sb-swipe-notification");
                        swipeNotifElement && swipeNotifElement.remove()
                    }
                    document.removeEventListener("scroll", this.isInViewHandler.bind(this))
                }
            }]), MobileSwipeNotification
        }(),
        nextSteps: {
            getUrlParams: function getUrlParams() {
                return new URLSearchParams(window.location.search)
            },
            getFormPrefills: function getFormPrefills() {
                var urlParams = this.getUrlParams();
                return {
                    name: urlParams.get("".concat("prefill", "_name")),
                    email: urlParams.get("".concat("prefill", "_email")),
                    phone: urlParams.get("".concat("prefill", "_phone"))
                }
            },
            prefillField: function prefillField(input, fieldName, fieldValue) {
                var nameAttribute = input.getAttribute("name");
                fieldValue && CONTACT_DATA_FIELDS[fieldName].includes(nameAttribute) && (input.value = fieldValue)
            },
            prefillFormFields: function prefillFormFields(formElement) {
                var _this = this,
                    _this$parseUrlParams$ = this.parseUrlParams().formPrefills,
                    name = _this$parseUrlParams$.name,
                    phone = _this$parseUrlParams$.phone,
                    email = _this$parseUrlParams$.email,
                    inputs = formElement.querySelectorAll("input");
                inputs.length && inputs.forEach(function(input) {
                    _this.prefillField(input, "name", name), _this.prefillField(input, "email", email), _this.prefillField(input, "phone", phone)
                })
            },
            parseUrlParams: function parseUrlParams() {
                return {
                    toastMessage: this.getUrlParams().get("success_message"),
                    formPrefills: this.getFormPrefills()
                }
            }
        },
        toastNotification: {
            getToastElement: function getToastElement() {
                return document.querySelector(".toast-notification")
            },
            getCloseButtonElement: function getCloseButtonElement() {
                return document.querySelector(".toast-notification__dismiss")
            },
            show: function show(message) {
                var _this = this;
                message.length && (this.hide(), document.body.insertAdjacentHTML("beforeend", function toastNotificationTemplate(message) {
                    return '\n    <div class="toast-notification">\n      <div class="toast-notification__body">\n        <div class="toast-notification__icon">'.concat('<svg width="9" height="7" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.8 1.4 7.4 0l-4 4-2-2L0 3.4l3.4 3.4 5.4-5.4Z" fill="#fff"/></svg>', '</div>\n        <div class="toast-notification__content">\n          ').concat(message, '\n        </div>\n        <button class="toast-notification__dismiss" type="button" name="dismiss_toast">\n          ').concat('<svg width="14" height="14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.7.3c-.4-.4-1-.4-1.4 0L7 5.6 1.7.3C1.3-.1.7-.1.3.3c-.4.4-.4 1 0 1.4L5.6 7 .3 12.3c-.4.4-.4 1 0 1.4.2.2.4.3.7.3.3 0 .5-.1.7-.3L7 8.4l5.3 5.3c.2.2.5.3.7.3.2 0 .5-.1.7-.3.4-.4.4-1 0-1.4L8.4 7l5.3-5.3c.4-.4.4-1 0-1.4Z" fill="#fff"/></svg>', "\n        </button>\n      </div>\n    </div>\n  ")
                }(message)), setTimeout(function() {
                    _this.getToastElement().classList.add("is-visible")
                }, 300), this.getCloseButtonElement().addEventListener("click", this.hide.bind(this)))
            },
            hide: function hide() {
                var toast = this.getToastElement();
                toast && (toast.classList.remove("is-visible"), setTimeout(function() {
                    toast.remove()
                }, 150))
            }
        },
        schedulingUtils: schedulingUtils,
        deferredRun: function deferredRun(name, args) {
            var command = get_default()(b12, name);
            name && "function" == typeof command && command(args)
        }
    };
    window.b12 = b12
}]);