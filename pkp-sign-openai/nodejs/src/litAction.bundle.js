var xu = Object.create;
var zo = Object.defineProperty;
var vu = Object.getOwnPropertyDescriptor;
var ku = Object.getOwnPropertyNames;
var Bu = Object.getPrototypeOf,
  Su = Object.prototype.hasOwnProperty;
var Pa = ((r) =>
  typeof require < "u"
    ? require
    : typeof Proxy < "u"
    ? new Proxy(r, { get: (t, e) => (typeof require < "u" ? require : t)[e] })
    : r)(function (r) {
  if (typeof require < "u") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + r + '" is not supported');
});
var sr = (r, t) => () => (r && (t = r((r = 0))), t);
var We = (r, t) => () => (t || r((t = { exports: {} }).exports, t), t.exports),
  Ca = (r, t) => {
    for (var e in t) zo(r, e, { get: t[e], enumerable: !0 });
  },
  Ua = (r, t, e, n) => {
    if ((t && typeof t == "object") || typeof t == "function")
      for (let o of ku(t))
        !Su.call(r, o) &&
          o !== e &&
          zo(r, o, {
            get: () => t[o],
            enumerable: !(n = vu(t, o)) || n.enumerable,
          });
    return r;
  };
var br = (r, t, e) => (
    (e = r != null ? xu(Bu(r)) : {}),
    Ua(
      t || !r || !r.__esModule
        ? zo(e, "default", { value: r, enumerable: !0 })
        : e,
      r
    )
  ),
  Oa = (r) => Ua(zo({}, "__esModule", { value: !0 }), r);
var Fa = We((Fo) => {
  "use strict";
  Fo.byteLength = _u;
  Fo.toByteArray = Iu;
  Fo.fromByteArray = Mu;
  var Mr = [],
    wr = [],
    Eu = typeof Uint8Array < "u" ? Uint8Array : Array,
    es = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  for (bn = 0, Na = es.length; bn < Na; ++bn)
    (Mr[bn] = es[bn]), (wr[es.charCodeAt(bn)] = bn);
  var bn, Na;
  wr[45] = 62;
  wr[95] = 63;
  function za(r) {
    var t = r.length;
    if (t % 4 > 0)
      throw new Error("Invalid string. Length must be a multiple of 4");
    var e = r.indexOf("=");
    e === -1 && (e = t);
    var n = e === t ? 0 : 4 - (e % 4);
    return [e, n];
  }
  function _u(r) {
    var t = za(r),
      e = t[0],
      n = t[1];
    return ((e + n) * 3) / 4 - n;
  }
  function Au(r, t, e) {
    return ((t + e) * 3) / 4 - e;
  }
  function Iu(r) {
    var t,
      e = za(r),
      n = e[0],
      o = e[1],
      i = new Eu(Au(r, n, o)),
      s = 0,
      d = o > 0 ? n - 4 : n,
      p;
    for (p = 0; p < d; p += 4)
      (t =
        (wr[r.charCodeAt(p)] << 18) |
        (wr[r.charCodeAt(p + 1)] << 12) |
        (wr[r.charCodeAt(p + 2)] << 6) |
        wr[r.charCodeAt(p + 3)]),
        (i[s++] = (t >> 16) & 255),
        (i[s++] = (t >> 8) & 255),
        (i[s++] = t & 255);
    return (
      o === 2 &&
        ((t = (wr[r.charCodeAt(p)] << 2) | (wr[r.charCodeAt(p + 1)] >> 4)),
        (i[s++] = t & 255)),
      o === 1 &&
        ((t =
          (wr[r.charCodeAt(p)] << 10) |
          (wr[r.charCodeAt(p + 1)] << 4) |
          (wr[r.charCodeAt(p + 2)] >> 2)),
        (i[s++] = (t >> 8) & 255),
        (i[s++] = t & 255)),
      i
    );
  }
  function Lu(r) {
    return (
      Mr[(r >> 18) & 63] + Mr[(r >> 12) & 63] + Mr[(r >> 6) & 63] + Mr[r & 63]
    );
  }
  function Ru(r, t, e) {
    for (var n, o = [], i = t; i < e; i += 3)
      (n =
        ((r[i] << 16) & 16711680) +
        ((r[i + 1] << 8) & 65280) +
        (r[i + 2] & 255)),
        o.push(Lu(n));
    return o.join("");
  }
  function Mu(r) {
    for (
      var t, e = r.length, n = e % 3, o = [], i = 16383, s = 0, d = e - n;
      s < d;
      s += i
    )
      o.push(Ru(r, s, s + i > d ? d : s + i));
    return (
      n === 1
        ? ((t = r[e - 1]), o.push(Mr[t >> 2] + Mr[(t << 4) & 63] + "=="))
        : n === 2 &&
          ((t = (r[e - 2] << 8) + r[e - 1]),
          o.push(Mr[t >> 10] + Mr[(t >> 4) & 63] + Mr[(t << 2) & 63] + "=")),
      o.join("")
    );
  }
});
var Ka = We((rs) => {
  rs.read = function (r, t, e, n, o) {
    var i,
      s,
      d = o * 8 - n - 1,
      p = (1 << d) - 1,
      S = p >> 1,
      k = -7,
      _ = e ? o - 1 : 0,
      P = e ? -1 : 1,
      M = r[t + _];
    for (
      _ += P, i = M & ((1 << -k) - 1), M >>= -k, k += d;
      k > 0;
      i = i * 256 + r[t + _], _ += P, k -= 8
    );
    for (
      s = i & ((1 << -k) - 1), i >>= -k, k += n;
      k > 0;
      s = s * 256 + r[t + _], _ += P, k -= 8
    );
    if (i === 0) i = 1 - S;
    else {
      if (i === p) return s ? NaN : (M ? -1 : 1) * (1 / 0);
      (s = s + Math.pow(2, n)), (i = i - S);
    }
    return (M ? -1 : 1) * s * Math.pow(2, i - n);
  };
  rs.write = function (r, t, e, n, o, i) {
    var s,
      d,
      p,
      S = i * 8 - o - 1,
      k = (1 << S) - 1,
      _ = k >> 1,
      P = o === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0,
      M = n ? 0 : i - 1,
      X = n ? 1 : -1,
      U = t < 0 || (t === 0 && 1 / t < 0) ? 1 : 0;
    for (
      t = Math.abs(t),
        isNaN(t) || t === 1 / 0
          ? ((d = isNaN(t) ? 1 : 0), (s = k))
          : ((s = Math.floor(Math.log(t) / Math.LN2)),
            t * (p = Math.pow(2, -s)) < 1 && (s--, (p *= 2)),
            s + _ >= 1 ? (t += P / p) : (t += P * Math.pow(2, 1 - _)),
            t * p >= 2 && (s++, (p /= 2)),
            s + _ >= k
              ? ((d = 0), (s = k))
              : s + _ >= 1
              ? ((d = (t * p - 1) * Math.pow(2, o)), (s = s + _))
              : ((d = t * Math.pow(2, _ - 1) * Math.pow(2, o)), (s = 0)));
      o >= 8;
      r[e + M] = d & 255, M += X, d /= 256, o -= 8
    );
    for (
      s = (s << o) | d, S += o;
      S > 0;
      r[e + M] = s & 255, M += X, s /= 256, S -= 8
    );
    r[e + M - X] |= U * 128;
  };
});
var Fn = We((zn) => {
  "use strict";
  var ns = Fa(),
    On = Ka(),
    qa =
      typeof Symbol == "function" && typeof Symbol.for == "function"
        ? Symbol.for("nodejs.util.inspect.custom")
        : null;
  zn.Buffer = W;
  zn.SlowBuffer = Nu;
  zn.INSPECT_MAX_BYTES = 50;
  var Ko = 2147483647;
  zn.kMaxLength = Ko;
  W.TYPED_ARRAY_SUPPORT = Tu();
  !W.TYPED_ARRAY_SUPPORT &&
    typeof console < "u" &&
    typeof console.error == "function" &&
    console.error(
      "This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."
    );
  function Tu() {
    try {
      let r = new Uint8Array(1),
        t = {
          foo: function () {
            return 42;
          },
        };
      return (
        Object.setPrototypeOf(t, Uint8Array.prototype),
        Object.setPrototypeOf(r, t),
        r.foo() === 42
      );
    } catch {
      return !1;
    }
  }
  Object.defineProperty(W.prototype, "parent", {
    enumerable: !0,
    get: function () {
      if (W.isBuffer(this)) return this.buffer;
    },
  });
  Object.defineProperty(W.prototype, "offset", {
    enumerable: !0,
    get: function () {
      if (W.isBuffer(this)) return this.byteOffset;
    },
  });
  function Fr(r) {
    if (r > Ko)
      throw new RangeError(
        'The value "' + r + '" is invalid for option "size"'
      );
    let t = new Uint8Array(r);
    return Object.setPrototypeOf(t, W.prototype), t;
  }
  function W(r, t, e) {
    if (typeof r == "number") {
      if (typeof t == "string")
        throw new TypeError(
          'The "string" argument must be of type string. Received type number'
        );
      return as(r);
    }
    return $a(r, t, e);
  }
  W.poolSize = 8192;
  function $a(r, t, e) {
    if (typeof r == "string") return Cu(r, t);
    if (ArrayBuffer.isView(r)) return Uu(r);
    if (r == null)
      throw new TypeError(
        "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " +
          typeof r
      );
    if (
      Tr(r, ArrayBuffer) ||
      (r && Tr(r.buffer, ArrayBuffer)) ||
      (typeof SharedArrayBuffer < "u" &&
        (Tr(r, SharedArrayBuffer) || (r && Tr(r.buffer, SharedArrayBuffer))))
    )
      return is(r, t, e);
    if (typeof r == "number")
      throw new TypeError(
        'The "value" argument must not be of type number. Received type number'
      );
    let n = r.valueOf && r.valueOf();
    if (n != null && n !== r) return W.from(n, t, e);
    let o = Ou(r);
    if (o) return o;
    if (
      typeof Symbol < "u" &&
      Symbol.toPrimitive != null &&
      typeof r[Symbol.toPrimitive] == "function"
    )
      return W.from(r[Symbol.toPrimitive]("string"), t, e);
    throw new TypeError(
      "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " +
        typeof r
    );
  }
  W.from = function (r, t, e) {
    return $a(r, t, e);
  };
  Object.setPrototypeOf(W.prototype, Uint8Array.prototype);
  Object.setPrototypeOf(W, Uint8Array);
  function Va(r) {
    if (typeof r != "number")
      throw new TypeError('"size" argument must be of type number');
    if (r < 0)
      throw new RangeError(
        'The value "' + r + '" is invalid for option "size"'
      );
  }
  function Pu(r, t, e) {
    return (
      Va(r),
      r <= 0
        ? Fr(r)
        : t !== void 0
        ? typeof e == "string"
          ? Fr(r).fill(t, e)
          : Fr(r).fill(t)
        : Fr(r)
    );
  }
  W.alloc = function (r, t, e) {
    return Pu(r, t, e);
  };
  function as(r) {
    return Va(r), Fr(r < 0 ? 0 : cs(r) | 0);
  }
  W.allocUnsafe = function (r) {
    return as(r);
  };
  W.allocUnsafeSlow = function (r) {
    return as(r);
  };
  function Cu(r, t) {
    if (((typeof t != "string" || t === "") && (t = "utf8"), !W.isEncoding(t)))
      throw new TypeError("Unknown encoding: " + t);
    let e = ja(r, t) | 0,
      n = Fr(e),
      o = n.write(r, t);
    return o !== e && (n = n.slice(0, o)), n;
  }
  function os(r) {
    let t = r.length < 0 ? 0 : cs(r.length) | 0,
      e = Fr(t);
    for (let n = 0; n < t; n += 1) e[n] = r[n] & 255;
    return e;
  }
  function Uu(r) {
    if (Tr(r, Uint8Array)) {
      let t = new Uint8Array(r);
      return is(t.buffer, t.byteOffset, t.byteLength);
    }
    return os(r);
  }
  function is(r, t, e) {
    if (t < 0 || r.byteLength < t)
      throw new RangeError('"offset" is outside of buffer bounds');
    if (r.byteLength < t + (e || 0))
      throw new RangeError('"length" is outside of buffer bounds');
    let n;
    return (
      t === void 0 && e === void 0
        ? (n = new Uint8Array(r))
        : e === void 0
        ? (n = new Uint8Array(r, t))
        : (n = new Uint8Array(r, t, e)),
      Object.setPrototypeOf(n, W.prototype),
      n
    );
  }
  function Ou(r) {
    if (W.isBuffer(r)) {
      let t = cs(r.length) | 0,
        e = Fr(t);
      return e.length === 0 || r.copy(e, 0, 0, t), e;
    }
    if (r.length !== void 0)
      return typeof r.length != "number" || us(r.length) ? Fr(0) : os(r);
    if (r.type === "Buffer" && Array.isArray(r.data)) return os(r.data);
  }
  function cs(r) {
    if (r >= Ko)
      throw new RangeError(
        "Attempt to allocate Buffer larger than maximum size: 0x" +
          Ko.toString(16) +
          " bytes"
      );
    return r | 0;
  }
  function Nu(r) {
    return +r != r && (r = 0), W.alloc(+r);
  }
  W.isBuffer = function (t) {
    return t != null && t._isBuffer === !0 && t !== W.prototype;
  };
  W.compare = function (t, e) {
    if (
      (Tr(t, Uint8Array) && (t = W.from(t, t.offset, t.byteLength)),
      Tr(e, Uint8Array) && (e = W.from(e, e.offset, e.byteLength)),
      !W.isBuffer(t) || !W.isBuffer(e))
    )
      throw new TypeError(
        'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
      );
    if (t === e) return 0;
    let n = t.length,
      o = e.length;
    for (let i = 0, s = Math.min(n, o); i < s; ++i)
      if (t[i] !== e[i]) {
        (n = t[i]), (o = e[i]);
        break;
      }
    return n < o ? -1 : o < n ? 1 : 0;
  };
  W.isEncoding = function (t) {
    switch (String(t).toLowerCase()) {
      case "hex":
      case "utf8":
      case "utf-8":
      case "ascii":
      case "latin1":
      case "binary":
      case "base64":
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return !0;
      default:
        return !1;
    }
  };
  W.concat = function (t, e) {
    if (!Array.isArray(t))
      throw new TypeError('"list" argument must be an Array of Buffers');
    if (t.length === 0) return W.alloc(0);
    let n;
    if (e === void 0) for (e = 0, n = 0; n < t.length; ++n) e += t[n].length;
    let o = W.allocUnsafe(e),
      i = 0;
    for (n = 0; n < t.length; ++n) {
      let s = t[n];
      if (Tr(s, Uint8Array))
        i + s.length > o.length
          ? (W.isBuffer(s) || (s = W.from(s)), s.copy(o, i))
          : Uint8Array.prototype.set.call(o, s, i);
      else if (W.isBuffer(s)) s.copy(o, i);
      else throw new TypeError('"list" argument must be an Array of Buffers');
      i += s.length;
    }
    return o;
  };
  function ja(r, t) {
    if (W.isBuffer(r)) return r.length;
    if (ArrayBuffer.isView(r) || Tr(r, ArrayBuffer)) return r.byteLength;
    if (typeof r != "string")
      throw new TypeError(
        'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' +
          typeof r
      );
    let e = r.length,
      n = arguments.length > 2 && arguments[2] === !0;
    if (!n && e === 0) return 0;
    let o = !1;
    for (;;)
      switch (t) {
        case "ascii":
        case "latin1":
        case "binary":
          return e;
        case "utf8":
        case "utf-8":
          return ss(r).length;
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return e * 2;
        case "hex":
          return e >>> 1;
        case "base64":
          return rc(r).length;
        default:
          if (o) return n ? -1 : ss(r).length;
          (t = ("" + t).toLowerCase()), (o = !0);
      }
  }
  W.byteLength = ja;
  function zu(r, t, e) {
    let n = !1;
    if (
      ((t === void 0 || t < 0) && (t = 0),
      t > this.length ||
        ((e === void 0 || e > this.length) && (e = this.length), e <= 0) ||
        ((e >>>= 0), (t >>>= 0), e <= t))
    )
      return "";
    for (r || (r = "utf8"); ; )
      switch (r) {
        case "hex":
          return Gu(this, t, e);
        case "utf8":
        case "utf-8":
          return Ya(this, t, e);
        case "ascii":
          return Vu(this, t, e);
        case "latin1":
        case "binary":
          return ju(this, t, e);
        case "base64":
          return Hu(this, t, e);
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return Yu(this, t, e);
        default:
          if (n) throw new TypeError("Unknown encoding: " + r);
          (r = (r + "").toLowerCase()), (n = !0);
      }
  }
  W.prototype._isBuffer = !0;
  function wn(r, t, e) {
    let n = r[t];
    (r[t] = r[e]), (r[e] = n);
  }
  W.prototype.swap16 = function () {
    let t = this.length;
    if (t % 2 !== 0)
      throw new RangeError("Buffer size must be a multiple of 16-bits");
    for (let e = 0; e < t; e += 2) wn(this, e, e + 1);
    return this;
  };
  W.prototype.swap32 = function () {
    let t = this.length;
    if (t % 4 !== 0)
      throw new RangeError("Buffer size must be a multiple of 32-bits");
    for (let e = 0; e < t; e += 4) wn(this, e, e + 3), wn(this, e + 1, e + 2);
    return this;
  };
  W.prototype.swap64 = function () {
    let t = this.length;
    if (t % 8 !== 0)
      throw new RangeError("Buffer size must be a multiple of 64-bits");
    for (let e = 0; e < t; e += 8)
      wn(this, e, e + 7),
        wn(this, e + 1, e + 6),
        wn(this, e + 2, e + 5),
        wn(this, e + 3, e + 4);
    return this;
  };
  W.prototype.toString = function () {
    let t = this.length;
    return t === 0
      ? ""
      : arguments.length === 0
      ? Ya(this, 0, t)
      : zu.apply(this, arguments);
  };
  W.prototype.toLocaleString = W.prototype.toString;
  W.prototype.equals = function (t) {
    if (!W.isBuffer(t)) throw new TypeError("Argument must be a Buffer");
    return this === t ? !0 : W.compare(this, t) === 0;
  };
  W.prototype.inspect = function () {
    let t = "",
      e = zn.INSPECT_MAX_BYTES;
    return (
      (t = this.toString("hex", 0, e)
        .replace(/(.{2})/g, "$1 ")
        .trim()),
      this.length > e && (t += " ... "),
      "<Buffer " + t + ">"
    );
  };
  qa && (W.prototype[qa] = W.prototype.inspect);
  W.prototype.compare = function (t, e, n, o, i) {
    if (
      (Tr(t, Uint8Array) && (t = W.from(t, t.offset, t.byteLength)),
      !W.isBuffer(t))
    )
      throw new TypeError(
        'The "target" argument must be one of type Buffer or Uint8Array. Received type ' +
          typeof t
      );
    if (
      (e === void 0 && (e = 0),
      n === void 0 && (n = t ? t.length : 0),
      o === void 0 && (o = 0),
      i === void 0 && (i = this.length),
      e < 0 || n > t.length || o < 0 || i > this.length)
    )
      throw new RangeError("out of range index");
    if (o >= i && e >= n) return 0;
    if (o >= i) return -1;
    if (e >= n) return 1;
    if (((e >>>= 0), (n >>>= 0), (o >>>= 0), (i >>>= 0), this === t)) return 0;
    let s = i - o,
      d = n - e,
      p = Math.min(s, d),
      S = this.slice(o, i),
      k = t.slice(e, n);
    for (let _ = 0; _ < p; ++_)
      if (S[_] !== k[_]) {
        (s = S[_]), (d = k[_]);
        break;
      }
    return s < d ? -1 : d < s ? 1 : 0;
  };
  function Ga(r, t, e, n, o) {
    if (r.length === 0) return -1;
    if (
      (typeof e == "string"
        ? ((n = e), (e = 0))
        : e > 2147483647
        ? (e = 2147483647)
        : e < -2147483648 && (e = -2147483648),
      (e = +e),
      us(e) && (e = o ? 0 : r.length - 1),
      e < 0 && (e = r.length + e),
      e >= r.length)
    ) {
      if (o) return -1;
      e = r.length - 1;
    } else if (e < 0)
      if (o) e = 0;
      else return -1;
    if ((typeof t == "string" && (t = W.from(t, n)), W.isBuffer(t)))
      return t.length === 0 ? -1 : Da(r, t, e, n, o);
    if (typeof t == "number")
      return (
        (t = t & 255),
        typeof Uint8Array.prototype.indexOf == "function"
          ? o
            ? Uint8Array.prototype.indexOf.call(r, t, e)
            : Uint8Array.prototype.lastIndexOf.call(r, t, e)
          : Da(r, [t], e, n, o)
      );
    throw new TypeError("val must be string, number or Buffer");
  }
  function Da(r, t, e, n, o) {
    let i = 1,
      s = r.length,
      d = t.length;
    if (
      n !== void 0 &&
      ((n = String(n).toLowerCase()),
      n === "ucs2" || n === "ucs-2" || n === "utf16le" || n === "utf-16le")
    ) {
      if (r.length < 2 || t.length < 2) return -1;
      (i = 2), (s /= 2), (d /= 2), (e /= 2);
    }
    function p(k, _) {
      return i === 1 ? k[_] : k.readUInt16BE(_ * i);
    }
    let S;
    if (o) {
      let k = -1;
      for (S = e; S < s; S++)
        if (p(r, S) === p(t, k === -1 ? 0 : S - k)) {
          if ((k === -1 && (k = S), S - k + 1 === d)) return k * i;
        } else k !== -1 && (S -= S - k), (k = -1);
    } else
      for (e + d > s && (e = s - d), S = e; S >= 0; S--) {
        let k = !0;
        for (let _ = 0; _ < d; _++)
          if (p(r, S + _) !== p(t, _)) {
            k = !1;
            break;
          }
        if (k) return S;
      }
    return -1;
  }
  W.prototype.includes = function (t, e, n) {
    return this.indexOf(t, e, n) !== -1;
  };
  W.prototype.indexOf = function (t, e, n) {
    return Ga(this, t, e, n, !0);
  };
  W.prototype.lastIndexOf = function (t, e, n) {
    return Ga(this, t, e, n, !1);
  };
  function Fu(r, t, e, n) {
    e = Number(e) || 0;
    let o = r.length - e;
    n ? ((n = Number(n)), n > o && (n = o)) : (n = o);
    let i = t.length;
    n > i / 2 && (n = i / 2);
    let s;
    for (s = 0; s < n; ++s) {
      let d = parseInt(t.substr(s * 2, 2), 16);
      if (us(d)) return s;
      r[e + s] = d;
    }
    return s;
  }
  function Ku(r, t, e, n) {
    return qo(ss(t, r.length - e), r, e, n);
  }
  function qu(r, t, e, n) {
    return qo(Qu(t), r, e, n);
  }
  function Du(r, t, e, n) {
    return qo(rc(t), r, e, n);
  }
  function Wu(r, t, e, n) {
    return qo(th(t, r.length - e), r, e, n);
  }
  W.prototype.write = function (t, e, n, o) {
    if (e === void 0) (o = "utf8"), (n = this.length), (e = 0);
    else if (n === void 0 && typeof e == "string")
      (o = e), (n = this.length), (e = 0);
    else if (isFinite(e))
      (e = e >>> 0),
        isFinite(n)
          ? ((n = n >>> 0), o === void 0 && (o = "utf8"))
          : ((o = n), (n = void 0));
    else
      throw new Error(
        "Buffer.write(string, encoding, offset[, length]) is no longer supported"
      );
    let i = this.length - e;
    if (
      ((n === void 0 || n > i) && (n = i),
      (t.length > 0 && (n < 0 || e < 0)) || e > this.length)
    )
      throw new RangeError("Attempt to write outside buffer bounds");
    o || (o = "utf8");
    let s = !1;
    for (;;)
      switch (o) {
        case "hex":
          return Fu(this, t, e, n);
        case "utf8":
        case "utf-8":
          return Ku(this, t, e, n);
        case "ascii":
        case "latin1":
        case "binary":
          return qu(this, t, e, n);
        case "base64":
          return Du(this, t, e, n);
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return Wu(this, t, e, n);
        default:
          if (s) throw new TypeError("Unknown encoding: " + o);
          (o = ("" + o).toLowerCase()), (s = !0);
      }
  };
  W.prototype.toJSON = function () {
    return {
      type: "Buffer",
      data: Array.prototype.slice.call(this._arr || this, 0),
    };
  };
  function Hu(r, t, e) {
    return t === 0 && e === r.length
      ? ns.fromByteArray(r)
      : ns.fromByteArray(r.slice(t, e));
  }
  function Ya(r, t, e) {
    e = Math.min(r.length, e);
    let n = [],
      o = t;
    for (; o < e; ) {
      let i = r[o],
        s = null,
        d = i > 239 ? 4 : i > 223 ? 3 : i > 191 ? 2 : 1;
      if (o + d <= e) {
        let p, S, k, _;
        switch (d) {
          case 1:
            i < 128 && (s = i);
            break;
          case 2:
            (p = r[o + 1]),
              (p & 192) === 128 &&
                ((_ = ((i & 31) << 6) | (p & 63)), _ > 127 && (s = _));
            break;
          case 3:
            (p = r[o + 1]),
              (S = r[o + 2]),
              (p & 192) === 128 &&
                (S & 192) === 128 &&
                ((_ = ((i & 15) << 12) | ((p & 63) << 6) | (S & 63)),
                _ > 2047 && (_ < 55296 || _ > 57343) && (s = _));
            break;
          case 4:
            (p = r[o + 1]),
              (S = r[o + 2]),
              (k = r[o + 3]),
              (p & 192) === 128 &&
                (S & 192) === 128 &&
                (k & 192) === 128 &&
                ((_ =
                  ((i & 15) << 18) |
                  ((p & 63) << 12) |
                  ((S & 63) << 6) |
                  (k & 63)),
                _ > 65535 && _ < 1114112 && (s = _));
        }
      }
      s === null
        ? ((s = 65533), (d = 1))
        : s > 65535 &&
          ((s -= 65536),
          n.push(((s >>> 10) & 1023) | 55296),
          (s = 56320 | (s & 1023))),
        n.push(s),
        (o += d);
    }
    return $u(n);
  }
  var Wa = 4096;
  function $u(r) {
    let t = r.length;
    if (t <= Wa) return String.fromCharCode.apply(String, r);
    let e = "",
      n = 0;
    for (; n < t; )
      e += String.fromCharCode.apply(String, r.slice(n, (n += Wa)));
    return e;
  }
  function Vu(r, t, e) {
    let n = "";
    e = Math.min(r.length, e);
    for (let o = t; o < e; ++o) n += String.fromCharCode(r[o] & 127);
    return n;
  }
  function ju(r, t, e) {
    let n = "";
    e = Math.min(r.length, e);
    for (let o = t; o < e; ++o) n += String.fromCharCode(r[o]);
    return n;
  }
  function Gu(r, t, e) {
    let n = r.length;
    (!t || t < 0) && (t = 0), (!e || e < 0 || e > n) && (e = n);
    let o = "";
    for (let i = t; i < e; ++i) o += eh[r[i]];
    return o;
  }
  function Yu(r, t, e) {
    let n = r.slice(t, e),
      o = "";
    for (let i = 0; i < n.length - 1; i += 2)
      o += String.fromCharCode(n[i] + n[i + 1] * 256);
    return o;
  }
  W.prototype.slice = function (t, e) {
    let n = this.length;
    (t = ~~t),
      (e = e === void 0 ? n : ~~e),
      t < 0 ? ((t += n), t < 0 && (t = 0)) : t > n && (t = n),
      e < 0 ? ((e += n), e < 0 && (e = 0)) : e > n && (e = n),
      e < t && (e = t);
    let o = this.subarray(t, e);
    return Object.setPrototypeOf(o, W.prototype), o;
  };
  function Ve(r, t, e) {
    if (r % 1 !== 0 || r < 0) throw new RangeError("offset is not uint");
    if (r + t > e)
      throw new RangeError("Trying to access beyond buffer length");
  }
  W.prototype.readUintLE = W.prototype.readUIntLE = function (t, e, n) {
    (t = t >>> 0), (e = e >>> 0), n || Ve(t, e, this.length);
    let o = this[t],
      i = 1,
      s = 0;
    for (; ++s < e && (i *= 256); ) o += this[t + s] * i;
    return o;
  };
  W.prototype.readUintBE = W.prototype.readUIntBE = function (t, e, n) {
    (t = t >>> 0), (e = e >>> 0), n || Ve(t, e, this.length);
    let o = this[t + --e],
      i = 1;
    for (; e > 0 && (i *= 256); ) o += this[t + --e] * i;
    return o;
  };
  W.prototype.readUint8 = W.prototype.readUInt8 = function (t, e) {
    return (t = t >>> 0), e || Ve(t, 1, this.length), this[t];
  };
  W.prototype.readUint16LE = W.prototype.readUInt16LE = function (t, e) {
    return (
      (t = t >>> 0), e || Ve(t, 2, this.length), this[t] | (this[t + 1] << 8)
    );
  };
  W.prototype.readUint16BE = W.prototype.readUInt16BE = function (t, e) {
    return (
      (t = t >>> 0), e || Ve(t, 2, this.length), (this[t] << 8) | this[t + 1]
    );
  };
  W.prototype.readUint32LE = W.prototype.readUInt32LE = function (t, e) {
    return (
      (t = t >>> 0),
      e || Ve(t, 4, this.length),
      (this[t] | (this[t + 1] << 8) | (this[t + 2] << 16)) +
        this[t + 3] * 16777216
    );
  };
  W.prototype.readUint32BE = W.prototype.readUInt32BE = function (t, e) {
    return (
      (t = t >>> 0),
      e || Ve(t, 4, this.length),
      this[t] * 16777216 +
        ((this[t + 1] << 16) | (this[t + 2] << 8) | this[t + 3])
    );
  };
  W.prototype.readBigUInt64LE = Xr(function (t) {
    (t = t >>> 0), Nn(t, "offset");
    let e = this[t],
      n = this[t + 7];
    (e === void 0 || n === void 0) && so(t, this.length - 8);
    let o = e + this[++t] * 2 ** 8 + this[++t] * 2 ** 16 + this[++t] * 2 ** 24,
      i = this[++t] + this[++t] * 2 ** 8 + this[++t] * 2 ** 16 + n * 2 ** 24;
    return BigInt(o) + (BigInt(i) << BigInt(32));
  });
  W.prototype.readBigUInt64BE = Xr(function (t) {
    (t = t >>> 0), Nn(t, "offset");
    let e = this[t],
      n = this[t + 7];
    (e === void 0 || n === void 0) && so(t, this.length - 8);
    let o = e * 2 ** 24 + this[++t] * 2 ** 16 + this[++t] * 2 ** 8 + this[++t],
      i = this[++t] * 2 ** 24 + this[++t] * 2 ** 16 + this[++t] * 2 ** 8 + n;
    return (BigInt(o) << BigInt(32)) + BigInt(i);
  });
  W.prototype.readIntLE = function (t, e, n) {
    (t = t >>> 0), (e = e >>> 0), n || Ve(t, e, this.length);
    let o = this[t],
      i = 1,
      s = 0;
    for (; ++s < e && (i *= 256); ) o += this[t + s] * i;
    return (i *= 128), o >= i && (o -= Math.pow(2, 8 * e)), o;
  };
  W.prototype.readIntBE = function (t, e, n) {
    (t = t >>> 0), (e = e >>> 0), n || Ve(t, e, this.length);
    let o = e,
      i = 1,
      s = this[t + --o];
    for (; o > 0 && (i *= 256); ) s += this[t + --o] * i;
    return (i *= 128), s >= i && (s -= Math.pow(2, 8 * e)), s;
  };
  W.prototype.readInt8 = function (t, e) {
    return (
      (t = t >>> 0),
      e || Ve(t, 1, this.length),
      this[t] & 128 ? (255 - this[t] + 1) * -1 : this[t]
    );
  };
  W.prototype.readInt16LE = function (t, e) {
    (t = t >>> 0), e || Ve(t, 2, this.length);
    let n = this[t] | (this[t + 1] << 8);
    return n & 32768 ? n | 4294901760 : n;
  };
  W.prototype.readInt16BE = function (t, e) {
    (t = t >>> 0), e || Ve(t, 2, this.length);
    let n = this[t + 1] | (this[t] << 8);
    return n & 32768 ? n | 4294901760 : n;
  };
  W.prototype.readInt32LE = function (t, e) {
    return (
      (t = t >>> 0),
      e || Ve(t, 4, this.length),
      this[t] | (this[t + 1] << 8) | (this[t + 2] << 16) | (this[t + 3] << 24)
    );
  };
  W.prototype.readInt32BE = function (t, e) {
    return (
      (t = t >>> 0),
      e || Ve(t, 4, this.length),
      (this[t] << 24) | (this[t + 1] << 16) | (this[t + 2] << 8) | this[t + 3]
    );
  };
  W.prototype.readBigInt64LE = Xr(function (t) {
    (t = t >>> 0), Nn(t, "offset");
    let e = this[t],
      n = this[t + 7];
    (e === void 0 || n === void 0) && so(t, this.length - 8);
    let o =
      this[t + 4] + this[t + 5] * 2 ** 8 + this[t + 6] * 2 ** 16 + (n << 24);
    return (
      (BigInt(o) << BigInt(32)) +
      BigInt(e + this[++t] * 2 ** 8 + this[++t] * 2 ** 16 + this[++t] * 2 ** 24)
    );
  });
  W.prototype.readBigInt64BE = Xr(function (t) {
    (t = t >>> 0), Nn(t, "offset");
    let e = this[t],
      n = this[t + 7];
    (e === void 0 || n === void 0) && so(t, this.length - 8);
    let o = (e << 24) + this[++t] * 2 ** 16 + this[++t] * 2 ** 8 + this[++t];
    return (
      (BigInt(o) << BigInt(32)) +
      BigInt(this[++t] * 2 ** 24 + this[++t] * 2 ** 16 + this[++t] * 2 ** 8 + n)
    );
  });
  W.prototype.readFloatLE = function (t, e) {
    return (
      (t = t >>> 0), e || Ve(t, 4, this.length), On.read(this, t, !0, 23, 4)
    );
  };
  W.prototype.readFloatBE = function (t, e) {
    return (
      (t = t >>> 0), e || Ve(t, 4, this.length), On.read(this, t, !1, 23, 4)
    );
  };
  W.prototype.readDoubleLE = function (t, e) {
    return (
      (t = t >>> 0), e || Ve(t, 8, this.length), On.read(this, t, !0, 52, 8)
    );
  };
  W.prototype.readDoubleBE = function (t, e) {
    return (
      (t = t >>> 0), e || Ve(t, 8, this.length), On.read(this, t, !1, 52, 8)
    );
  };
  function hr(r, t, e, n, o, i) {
    if (!W.isBuffer(r))
      throw new TypeError('"buffer" argument must be a Buffer instance');
    if (t > o || t < i)
      throw new RangeError('"value" argument is out of bounds');
    if (e + n > r.length) throw new RangeError("Index out of range");
  }
  W.prototype.writeUintLE = W.prototype.writeUIntLE = function (t, e, n, o) {
    if (((t = +t), (e = e >>> 0), (n = n >>> 0), !o)) {
      let d = Math.pow(2, 8 * n) - 1;
      hr(this, t, e, n, d, 0);
    }
    let i = 1,
      s = 0;
    for (this[e] = t & 255; ++s < n && (i *= 256); )
      this[e + s] = (t / i) & 255;
    return e + n;
  };
  W.prototype.writeUintBE = W.prototype.writeUIntBE = function (t, e, n, o) {
    if (((t = +t), (e = e >>> 0), (n = n >>> 0), !o)) {
      let d = Math.pow(2, 8 * n) - 1;
      hr(this, t, e, n, d, 0);
    }
    let i = n - 1,
      s = 1;
    for (this[e + i] = t & 255; --i >= 0 && (s *= 256); )
      this[e + i] = (t / s) & 255;
    return e + n;
  };
  W.prototype.writeUint8 = W.prototype.writeUInt8 = function (t, e, n) {
    return (
      (t = +t),
      (e = e >>> 0),
      n || hr(this, t, e, 1, 255, 0),
      (this[e] = t & 255),
      e + 1
    );
  };
  W.prototype.writeUint16LE = W.prototype.writeUInt16LE = function (t, e, n) {
    return (
      (t = +t),
      (e = e >>> 0),
      n || hr(this, t, e, 2, 65535, 0),
      (this[e] = t & 255),
      (this[e + 1] = t >>> 8),
      e + 2
    );
  };
  W.prototype.writeUint16BE = W.prototype.writeUInt16BE = function (t, e, n) {
    return (
      (t = +t),
      (e = e >>> 0),
      n || hr(this, t, e, 2, 65535, 0),
      (this[e] = t >>> 8),
      (this[e + 1] = t & 255),
      e + 2
    );
  };
  W.prototype.writeUint32LE = W.prototype.writeUInt32LE = function (t, e, n) {
    return (
      (t = +t),
      (e = e >>> 0),
      n || hr(this, t, e, 4, 4294967295, 0),
      (this[e + 3] = t >>> 24),
      (this[e + 2] = t >>> 16),
      (this[e + 1] = t >>> 8),
      (this[e] = t & 255),
      e + 4
    );
  };
  W.prototype.writeUint32BE = W.prototype.writeUInt32BE = function (t, e, n) {
    return (
      (t = +t),
      (e = e >>> 0),
      n || hr(this, t, e, 4, 4294967295, 0),
      (this[e] = t >>> 24),
      (this[e + 1] = t >>> 16),
      (this[e + 2] = t >>> 8),
      (this[e + 3] = t & 255),
      e + 4
    );
  };
  function Za(r, t, e, n, o) {
    ec(t, n, o, r, e, 7);
    let i = Number(t & BigInt(4294967295));
    (r[e++] = i),
      (i = i >> 8),
      (r[e++] = i),
      (i = i >> 8),
      (r[e++] = i),
      (i = i >> 8),
      (r[e++] = i);
    let s = Number((t >> BigInt(32)) & BigInt(4294967295));
    return (
      (r[e++] = s),
      (s = s >> 8),
      (r[e++] = s),
      (s = s >> 8),
      (r[e++] = s),
      (s = s >> 8),
      (r[e++] = s),
      e
    );
  }
  function Xa(r, t, e, n, o) {
    ec(t, n, o, r, e, 7);
    let i = Number(t & BigInt(4294967295));
    (r[e + 7] = i),
      (i = i >> 8),
      (r[e + 6] = i),
      (i = i >> 8),
      (r[e + 5] = i),
      (i = i >> 8),
      (r[e + 4] = i);
    let s = Number((t >> BigInt(32)) & BigInt(4294967295));
    return (
      (r[e + 3] = s),
      (s = s >> 8),
      (r[e + 2] = s),
      (s = s >> 8),
      (r[e + 1] = s),
      (s = s >> 8),
      (r[e] = s),
      e + 8
    );
  }
  W.prototype.writeBigUInt64LE = Xr(function (t, e = 0) {
    return Za(this, t, e, BigInt(0), BigInt("0xffffffffffffffff"));
  });
  W.prototype.writeBigUInt64BE = Xr(function (t, e = 0) {
    return Xa(this, t, e, BigInt(0), BigInt("0xffffffffffffffff"));
  });
  W.prototype.writeIntLE = function (t, e, n, o) {
    if (((t = +t), (e = e >>> 0), !o)) {
      let p = Math.pow(2, 8 * n - 1);
      hr(this, t, e, n, p - 1, -p);
    }
    let i = 0,
      s = 1,
      d = 0;
    for (this[e] = t & 255; ++i < n && (s *= 256); )
      t < 0 && d === 0 && this[e + i - 1] !== 0 && (d = 1),
        (this[e + i] = (((t / s) >> 0) - d) & 255);
    return e + n;
  };
  W.prototype.writeIntBE = function (t, e, n, o) {
    if (((t = +t), (e = e >>> 0), !o)) {
      let p = Math.pow(2, 8 * n - 1);
      hr(this, t, e, n, p - 1, -p);
    }
    let i = n - 1,
      s = 1,
      d = 0;
    for (this[e + i] = t & 255; --i >= 0 && (s *= 256); )
      t < 0 && d === 0 && this[e + i + 1] !== 0 && (d = 1),
        (this[e + i] = (((t / s) >> 0) - d) & 255);
    return e + n;
  };
  W.prototype.writeInt8 = function (t, e, n) {
    return (
      (t = +t),
      (e = e >>> 0),
      n || hr(this, t, e, 1, 127, -128),
      t < 0 && (t = 255 + t + 1),
      (this[e] = t & 255),
      e + 1
    );
  };
  W.prototype.writeInt16LE = function (t, e, n) {
    return (
      (t = +t),
      (e = e >>> 0),
      n || hr(this, t, e, 2, 32767, -32768),
      (this[e] = t & 255),
      (this[e + 1] = t >>> 8),
      e + 2
    );
  };
  W.prototype.writeInt16BE = function (t, e, n) {
    return (
      (t = +t),
      (e = e >>> 0),
      n || hr(this, t, e, 2, 32767, -32768),
      (this[e] = t >>> 8),
      (this[e + 1] = t & 255),
      e + 2
    );
  };
  W.prototype.writeInt32LE = function (t, e, n) {
    return (
      (t = +t),
      (e = e >>> 0),
      n || hr(this, t, e, 4, 2147483647, -2147483648),
      (this[e] = t & 255),
      (this[e + 1] = t >>> 8),
      (this[e + 2] = t >>> 16),
      (this[e + 3] = t >>> 24),
      e + 4
    );
  };
  W.prototype.writeInt32BE = function (t, e, n) {
    return (
      (t = +t),
      (e = e >>> 0),
      n || hr(this, t, e, 4, 2147483647, -2147483648),
      t < 0 && (t = 4294967295 + t + 1),
      (this[e] = t >>> 24),
      (this[e + 1] = t >>> 16),
      (this[e + 2] = t >>> 8),
      (this[e + 3] = t & 255),
      e + 4
    );
  };
  W.prototype.writeBigInt64LE = Xr(function (t, e = 0) {
    return Za(
      this,
      t,
      e,
      -BigInt("0x8000000000000000"),
      BigInt("0x7fffffffffffffff")
    );
  });
  W.prototype.writeBigInt64BE = Xr(function (t, e = 0) {
    return Xa(
      this,
      t,
      e,
      -BigInt("0x8000000000000000"),
      BigInt("0x7fffffffffffffff")
    );
  });
  function Ja(r, t, e, n, o, i) {
    if (e + n > r.length) throw new RangeError("Index out of range");
    if (e < 0) throw new RangeError("Index out of range");
  }
  function Qa(r, t, e, n, o) {
    return (
      (t = +t),
      (e = e >>> 0),
      o || Ja(r, t, e, 4, 34028234663852886e22, -34028234663852886e22),
      On.write(r, t, e, n, 23, 4),
      e + 4
    );
  }
  W.prototype.writeFloatLE = function (t, e, n) {
    return Qa(this, t, e, !0, n);
  };
  W.prototype.writeFloatBE = function (t, e, n) {
    return Qa(this, t, e, !1, n);
  };
  function tc(r, t, e, n, o) {
    return (
      (t = +t),
      (e = e >>> 0),
      o || Ja(r, t, e, 8, 17976931348623157e292, -17976931348623157e292),
      On.write(r, t, e, n, 52, 8),
      e + 8
    );
  }
  W.prototype.writeDoubleLE = function (t, e, n) {
    return tc(this, t, e, !0, n);
  };
  W.prototype.writeDoubleBE = function (t, e, n) {
    return tc(this, t, e, !1, n);
  };
  W.prototype.copy = function (t, e, n, o) {
    if (!W.isBuffer(t)) throw new TypeError("argument should be a Buffer");
    if (
      (n || (n = 0),
      !o && o !== 0 && (o = this.length),
      e >= t.length && (e = t.length),
      e || (e = 0),
      o > 0 && o < n && (o = n),
      o === n || t.length === 0 || this.length === 0)
    )
      return 0;
    if (e < 0) throw new RangeError("targetStart out of bounds");
    if (n < 0 || n >= this.length) throw new RangeError("Index out of range");
    if (o < 0) throw new RangeError("sourceEnd out of bounds");
    o > this.length && (o = this.length),
      t.length - e < o - n && (o = t.length - e + n);
    let i = o - n;
    return (
      this === t && typeof Uint8Array.prototype.copyWithin == "function"
        ? this.copyWithin(e, n, o)
        : Uint8Array.prototype.set.call(t, this.subarray(n, o), e),
      i
    );
  };
  W.prototype.fill = function (t, e, n, o) {
    if (typeof t == "string") {
      if (
        (typeof e == "string"
          ? ((o = e), (e = 0), (n = this.length))
          : typeof n == "string" && ((o = n), (n = this.length)),
        o !== void 0 && typeof o != "string")
      )
        throw new TypeError("encoding must be a string");
      if (typeof o == "string" && !W.isEncoding(o))
        throw new TypeError("Unknown encoding: " + o);
      if (t.length === 1) {
        let s = t.charCodeAt(0);
        ((o === "utf8" && s < 128) || o === "latin1") && (t = s);
      }
    } else
      typeof t == "number"
        ? (t = t & 255)
        : typeof t == "boolean" && (t = Number(t));
    if (e < 0 || this.length < e || this.length < n)
      throw new RangeError("Out of range index");
    if (n <= e) return this;
    (e = e >>> 0), (n = n === void 0 ? this.length : n >>> 0), t || (t = 0);
    let i;
    if (typeof t == "number") for (i = e; i < n; ++i) this[i] = t;
    else {
      let s = W.isBuffer(t) ? t : W.from(t, o),
        d = s.length;
      if (d === 0)
        throw new TypeError(
          'The value "' + t + '" is invalid for argument "value"'
        );
      for (i = 0; i < n - e; ++i) this[i + e] = s[i % d];
    }
    return this;
  };
  var Un = {};
  function fs(r, t, e) {
    Un[r] = class extends e {
      constructor() {
        super(),
          Object.defineProperty(this, "message", {
            value: t.apply(this, arguments),
            writable: !0,
            configurable: !0,
          }),
          (this.name = `${this.name} [${r}]`),
          this.stack,
          delete this.name;
      }
      get code() {
        return r;
      }
      set code(o) {
        Object.defineProperty(this, "code", {
          configurable: !0,
          enumerable: !0,
          value: o,
          writable: !0,
        });
      }
      toString() {
        return `${this.name} [${r}]: ${this.message}`;
      }
    };
  }
  fs(
    "ERR_BUFFER_OUT_OF_BOUNDS",
    function (r) {
      return r
        ? `${r} is outside of buffer bounds`
        : "Attempt to access memory outside buffer bounds";
    },
    RangeError
  );
  fs(
    "ERR_INVALID_ARG_TYPE",
    function (r, t) {
      return `The "${r}" argument must be of type number. Received type ${typeof t}`;
    },
    TypeError
  );
  fs(
    "ERR_OUT_OF_RANGE",
    function (r, t, e) {
      let n = `The value of "${r}" is out of range.`,
        o = e;
      return (
        Number.isInteger(e) && Math.abs(e) > 2 ** 32
          ? (o = Ha(String(e)))
          : typeof e == "bigint" &&
            ((o = String(e)),
            (e > BigInt(2) ** BigInt(32) || e < -(BigInt(2) ** BigInt(32))) &&
              (o = Ha(o)),
            (o += "n")),
        (n += ` It must be ${t}. Received ${o}`),
        n
      );
    },
    RangeError
  );
  function Ha(r) {
    let t = "",
      e = r.length,
      n = r[0] === "-" ? 1 : 0;
    for (; e >= n + 4; e -= 3) t = `_${r.slice(e - 3, e)}${t}`;
    return `${r.slice(0, e)}${t}`;
  }
  function Zu(r, t, e) {
    Nn(t, "offset"),
      (r[t] === void 0 || r[t + e] === void 0) && so(t, r.length - (e + 1));
  }
  function ec(r, t, e, n, o, i) {
    if (r > e || r < t) {
      let s = typeof t == "bigint" ? "n" : "",
        d;
      throw (
        (i > 3
          ? t === 0 || t === BigInt(0)
            ? (d = `>= 0${s} and < 2${s} ** ${(i + 1) * 8}${s}`)
            : (d = `>= -(2${s} ** ${(i + 1) * 8 - 1}${s}) and < 2 ** ${
                (i + 1) * 8 - 1
              }${s}`)
          : (d = `>= ${t}${s} and <= ${e}${s}`),
        new Un.ERR_OUT_OF_RANGE("value", d, r))
      );
    }
    Zu(n, o, i);
  }
  function Nn(r, t) {
    if (typeof r != "number") throw new Un.ERR_INVALID_ARG_TYPE(t, "number", r);
  }
  function so(r, t, e) {
    throw Math.floor(r) !== r
      ? (Nn(r, e), new Un.ERR_OUT_OF_RANGE(e || "offset", "an integer", r))
      : t < 0
      ? new Un.ERR_BUFFER_OUT_OF_BOUNDS()
      : new Un.ERR_OUT_OF_RANGE(
          e || "offset",
          `>= ${e ? 1 : 0} and <= ${t}`,
          r
        );
  }
  var Xu = /[^+/0-9A-Za-z-_]/g;
  function Ju(r) {
    if (((r = r.split("=")[0]), (r = r.trim().replace(Xu, "")), r.length < 2))
      return "";
    for (; r.length % 4 !== 0; ) r = r + "=";
    return r;
  }
  function ss(r, t) {
    t = t || 1 / 0;
    let e,
      n = r.length,
      o = null,
      i = [];
    for (let s = 0; s < n; ++s) {
      if (((e = r.charCodeAt(s)), e > 55295 && e < 57344)) {
        if (!o) {
          if (e > 56319) {
            (t -= 3) > -1 && i.push(239, 191, 189);
            continue;
          } else if (s + 1 === n) {
            (t -= 3) > -1 && i.push(239, 191, 189);
            continue;
          }
          o = e;
          continue;
        }
        if (e < 56320) {
          (t -= 3) > -1 && i.push(239, 191, 189), (o = e);
          continue;
        }
        e = (((o - 55296) << 10) | (e - 56320)) + 65536;
      } else o && (t -= 3) > -1 && i.push(239, 191, 189);
      if (((o = null), e < 128)) {
        if ((t -= 1) < 0) break;
        i.push(e);
      } else if (e < 2048) {
        if ((t -= 2) < 0) break;
        i.push((e >> 6) | 192, (e & 63) | 128);
      } else if (e < 65536) {
        if ((t -= 3) < 0) break;
        i.push((e >> 12) | 224, ((e >> 6) & 63) | 128, (e & 63) | 128);
      } else if (e < 1114112) {
        if ((t -= 4) < 0) break;
        i.push(
          (e >> 18) | 240,
          ((e >> 12) & 63) | 128,
          ((e >> 6) & 63) | 128,
          (e & 63) | 128
        );
      } else throw new Error("Invalid code point");
    }
    return i;
  }
  function Qu(r) {
    let t = [];
    for (let e = 0; e < r.length; ++e) t.push(r.charCodeAt(e) & 255);
    return t;
  }
  function th(r, t) {
    let e,
      n,
      o,
      i = [];
    for (let s = 0; s < r.length && !((t -= 2) < 0); ++s)
      (e = r.charCodeAt(s)), (n = e >> 8), (o = e % 256), i.push(o), i.push(n);
    return i;
  }
  function rc(r) {
    return ns.toByteArray(Ju(r));
  }
  function qo(r, t, e, n) {
    let o;
    for (o = 0; o < n && !(o + e >= t.length || o >= r.length); ++o)
      t[o + e] = r[o];
    return o;
  }
  function Tr(r, t) {
    return (
      r instanceof t ||
      (r != null &&
        r.constructor != null &&
        r.constructor.name != null &&
        r.constructor.name === t.name)
    );
  }
  function us(r) {
    return r !== r;
  }
  var eh = (function () {
    let r = "0123456789abcdef",
      t = new Array(256);
    for (let e = 0; e < 16; ++e) {
      let n = e * 16;
      for (let o = 0; o < 16; ++o) t[n + o] = r[e] + r[o];
    }
    return t;
  })();
  function Xr(r) {
    return typeof BigInt > "u" ? rh : r;
  }
  function rh() {
    throw new Error("BigInt not supported");
  }
});
var kc = We(() => {});
var Is = We((Bc, As) => {
  (function (r, t) {
    "use strict";
    function e(E, a) {
      if (!E) throw new Error(a || "Assertion failed");
    }
    function n(E, a) {
      E.super_ = a;
      var u = function () {};
      (u.prototype = a.prototype),
        (E.prototype = new u()),
        (E.prototype.constructor = E);
    }
    function o(E, a, u) {
      if (o.isBN(E)) return E;
      (this.negative = 0),
        (this.words = null),
        (this.length = 0),
        (this.red = null),
        E !== null &&
          ((a === "le" || a === "be") && ((u = a), (a = 10)),
          this._init(E || 0, a || 10, u || "be"));
    }
    typeof r == "object" ? (r.exports = o) : (t.BN = o),
      (o.BN = o),
      (o.wordSize = 26);
    var i;
    try {
      typeof window < "u" && typeof window.Buffer < "u"
        ? (i = window.Buffer)
        : (i = kc().Buffer);
    } catch {}
    (o.isBN = function (a) {
      return a instanceof o
        ? !0
        : a !== null &&
            typeof a == "object" &&
            a.constructor.wordSize === o.wordSize &&
            Array.isArray(a.words);
    }),
      (o.max = function (a, u) {
        return a.cmp(u) > 0 ? a : u;
      }),
      (o.min = function (a, u) {
        return a.cmp(u) < 0 ? a : u;
      }),
      (o.prototype._init = function (a, u, l) {
        if (typeof a == "number") return this._initNumber(a, u, l);
        if (typeof a == "object") return this._initArray(a, u, l);
        u === "hex" && (u = 16),
          e(u === (u | 0) && u >= 2 && u <= 36),
          (a = a.toString().replace(/\s+/g, ""));
        var y = 0;
        a[0] === "-" && (y++, (this.negative = 1)),
          y < a.length &&
            (u === 16
              ? this._parseHex(a, y, l)
              : (this._parseBase(a, u, y),
                l === "le" && this._initArray(this.toArray(), u, l)));
      }),
      (o.prototype._initNumber = function (a, u, l) {
        a < 0 && ((this.negative = 1), (a = -a)),
          a < 67108864
            ? ((this.words = [a & 67108863]), (this.length = 1))
            : a < 4503599627370496
            ? ((this.words = [a & 67108863, (a / 67108864) & 67108863]),
              (this.length = 2))
            : (e(a < 9007199254740992),
              (this.words = [a & 67108863, (a / 67108864) & 67108863, 1]),
              (this.length = 3)),
          l === "le" && this._initArray(this.toArray(), u, l);
      }),
      (o.prototype._initArray = function (a, u, l) {
        if ((e(typeof a.length == "number"), a.length <= 0))
          return (this.words = [0]), (this.length = 1), this;
        (this.length = Math.ceil(a.length / 3)),
          (this.words = new Array(this.length));
        for (var y = 0; y < this.length; y++) this.words[y] = 0;
        var b,
          B,
          I = 0;
        if (l === "be")
          for (y = a.length - 1, b = 0; y >= 0; y -= 3)
            (B = a[y] | (a[y - 1] << 8) | (a[y - 2] << 16)),
              (this.words[b] |= (B << I) & 67108863),
              (this.words[b + 1] = (B >>> (26 - I)) & 67108863),
              (I += 24),
              I >= 26 && ((I -= 26), b++);
        else if (l === "le")
          for (y = 0, b = 0; y < a.length; y += 3)
            (B = a[y] | (a[y + 1] << 8) | (a[y + 2] << 16)),
              (this.words[b] |= (B << I) & 67108863),
              (this.words[b + 1] = (B >>> (26 - I)) & 67108863),
              (I += 24),
              I >= 26 && ((I -= 26), b++);
        return this._strip();
      });
    function s(E, a) {
      var u = E.charCodeAt(a);
      if (u >= 48 && u <= 57) return u - 48;
      if (u >= 65 && u <= 70) return u - 55;
      if (u >= 97 && u <= 102) return u - 87;
      e(!1, "Invalid character in " + E);
    }
    function d(E, a, u) {
      var l = s(E, u);
      return u - 1 >= a && (l |= s(E, u - 1) << 4), l;
    }
    o.prototype._parseHex = function (a, u, l) {
      (this.length = Math.ceil((a.length - u) / 6)),
        (this.words = new Array(this.length));
      for (var y = 0; y < this.length; y++) this.words[y] = 0;
      var b = 0,
        B = 0,
        I;
      if (l === "be")
        for (y = a.length - 1; y >= u; y -= 2)
          (I = d(a, u, y) << b),
            (this.words[B] |= I & 67108863),
            b >= 18
              ? ((b -= 18), (B += 1), (this.words[B] |= I >>> 26))
              : (b += 8);
      else {
        var x = a.length - u;
        for (y = x % 2 === 0 ? u + 1 : u; y < a.length; y += 2)
          (I = d(a, u, y) << b),
            (this.words[B] |= I & 67108863),
            b >= 18
              ? ((b -= 18), (B += 1), (this.words[B] |= I >>> 26))
              : (b += 8);
      }
      this._strip();
    };
    function p(E, a, u, l) {
      for (var y = 0, b = 0, B = Math.min(E.length, u), I = a; I < B; I++) {
        var x = E.charCodeAt(I) - 48;
        (y *= l),
          x >= 49 ? (b = x - 49 + 10) : x >= 17 ? (b = x - 17 + 10) : (b = x),
          e(x >= 0 && b < l, "Invalid character"),
          (y += b);
      }
      return y;
    }
    (o.prototype._parseBase = function (a, u, l) {
      (this.words = [0]), (this.length = 1);
      for (var y = 0, b = 1; b <= 67108863; b *= u) y++;
      y--, (b = (b / u) | 0);
      for (
        var B = a.length - l,
          I = B % y,
          x = Math.min(B, B - I) + l,
          f = 0,
          v = l;
        v < x;
        v += y
      )
        (f = p(a, v, v + y, u)),
          this.imuln(b),
          this.words[0] + f < 67108864 ? (this.words[0] += f) : this._iaddn(f);
      if (I !== 0) {
        var q = 1;
        for (f = p(a, v, a.length, u), v = 0; v < I; v++) q *= u;
        this.imuln(q),
          this.words[0] + f < 67108864 ? (this.words[0] += f) : this._iaddn(f);
      }
      this._strip();
    }),
      (o.prototype.copy = function (a) {
        a.words = new Array(this.length);
        for (var u = 0; u < this.length; u++) a.words[u] = this.words[u];
        (a.length = this.length),
          (a.negative = this.negative),
          (a.red = this.red);
      });
    function S(E, a) {
      (E.words = a.words),
        (E.length = a.length),
        (E.negative = a.negative),
        (E.red = a.red);
    }
    if (
      ((o.prototype._move = function (a) {
        S(a, this);
      }),
      (o.prototype.clone = function () {
        var a = new o(null);
        return this.copy(a), a;
      }),
      (o.prototype._expand = function (a) {
        for (; this.length < a; ) this.words[this.length++] = 0;
        return this;
      }),
      (o.prototype._strip = function () {
        for (; this.length > 1 && this.words[this.length - 1] === 0; )
          this.length--;
        return this._normSign();
      }),
      (o.prototype._normSign = function () {
        return (
          this.length === 1 && this.words[0] === 0 && (this.negative = 0), this
        );
      }),
      typeof Symbol < "u" && typeof Symbol.for == "function")
    )
      try {
        o.prototype[Symbol.for("nodejs.util.inspect.custom")] = k;
      } catch {
        o.prototype.inspect = k;
      }
    else o.prototype.inspect = k;
    function k() {
      return (this.red ? "<BN-R: " : "<BN: ") + this.toString(16) + ">";
    }
    var _ = [
        "",
        "0",
        "00",
        "000",
        "0000",
        "00000",
        "000000",
        "0000000",
        "00000000",
        "000000000",
        "0000000000",
        "00000000000",
        "000000000000",
        "0000000000000",
        "00000000000000",
        "000000000000000",
        "0000000000000000",
        "00000000000000000",
        "000000000000000000",
        "0000000000000000000",
        "00000000000000000000",
        "000000000000000000000",
        "0000000000000000000000",
        "00000000000000000000000",
        "000000000000000000000000",
        "0000000000000000000000000",
      ],
      P = [
        0, 0, 25, 16, 12, 11, 10, 9, 8, 8, 7, 7, 7, 7, 6, 6, 6, 6, 6, 6, 6, 5,
        5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
      ],
      M = [
        0, 0, 33554432, 43046721, 16777216, 48828125, 60466176, 40353607,
        16777216, 43046721, 1e7, 19487171, 35831808, 62748517, 7529536,
        11390625, 16777216, 24137569, 34012224, 47045881, 64e6, 4084101,
        5153632, 6436343, 7962624, 9765625, 11881376, 14348907, 17210368,
        20511149, 243e5, 28629151, 33554432, 39135393, 45435424, 52521875,
        60466176,
      ];
    (o.prototype.toString = function (a, u) {
      (a = a || 10), (u = u | 0 || 1);
      var l;
      if (a === 16 || a === "hex") {
        l = "";
        for (var y = 0, b = 0, B = 0; B < this.length; B++) {
          var I = this.words[B],
            x = (((I << y) | b) & 16777215).toString(16);
          (b = (I >>> (24 - y)) & 16777215),
            (y += 2),
            y >= 26 && ((y -= 26), B--),
            b !== 0 || B !== this.length - 1
              ? (l = _[6 - x.length] + x + l)
              : (l = x + l);
        }
        for (b !== 0 && (l = b.toString(16) + l); l.length % u !== 0; )
          l = "0" + l;
        return this.negative !== 0 && (l = "-" + l), l;
      }
      if (a === (a | 0) && a >= 2 && a <= 36) {
        var f = P[a],
          v = M[a];
        l = "";
        var q = this.clone();
        for (q.negative = 0; !q.isZero(); ) {
          var Z = q.modrn(v).toString(a);
          (q = q.idivn(v)),
            q.isZero() ? (l = Z + l) : (l = _[f - Z.length] + Z + l);
        }
        for (this.isZero() && (l = "0" + l); l.length % u !== 0; ) l = "0" + l;
        return this.negative !== 0 && (l = "-" + l), l;
      }
      e(!1, "Base should be between 2 and 36");
    }),
      (o.prototype.toNumber = function () {
        var a = this.words[0];
        return (
          this.length === 2
            ? (a += this.words[1] * 67108864)
            : this.length === 3 && this.words[2] === 1
            ? (a += 4503599627370496 + this.words[1] * 67108864)
            : this.length > 2 &&
              e(!1, "Number can only safely store up to 53 bits"),
          this.negative !== 0 ? -a : a
        );
      }),
      (o.prototype.toJSON = function () {
        return this.toString(16, 2);
      }),
      i &&
        (o.prototype.toBuffer = function (a, u) {
          return this.toArrayLike(i, a, u);
        }),
      (o.prototype.toArray = function (a, u) {
        return this.toArrayLike(Array, a, u);
      });
    var X = function (a, u) {
      return a.allocUnsafe ? a.allocUnsafe(u) : new a(u);
    };
    (o.prototype.toArrayLike = function (a, u, l) {
      this._strip();
      var y = this.byteLength(),
        b = l || Math.max(1, y);
      e(y <= b, "byte array longer than desired length"),
        e(b > 0, "Requested array length <= 0");
      var B = X(a, b),
        I = u === "le" ? "LE" : "BE";
      return this["_toArrayLike" + I](B, y), B;
    }),
      (o.prototype._toArrayLikeLE = function (a, u) {
        for (var l = 0, y = 0, b = 0, B = 0; b < this.length; b++) {
          var I = (this.words[b] << B) | y;
          (a[l++] = I & 255),
            l < a.length && (a[l++] = (I >> 8) & 255),
            l < a.length && (a[l++] = (I >> 16) & 255),
            B === 6
              ? (l < a.length && (a[l++] = (I >> 24) & 255), (y = 0), (B = 0))
              : ((y = I >>> 24), (B += 2));
        }
        if (l < a.length) for (a[l++] = y; l < a.length; ) a[l++] = 0;
      }),
      (o.prototype._toArrayLikeBE = function (a, u) {
        for (var l = a.length - 1, y = 0, b = 0, B = 0; b < this.length; b++) {
          var I = (this.words[b] << B) | y;
          (a[l--] = I & 255),
            l >= 0 && (a[l--] = (I >> 8) & 255),
            l >= 0 && (a[l--] = (I >> 16) & 255),
            B === 6
              ? (l >= 0 && (a[l--] = (I >> 24) & 255), (y = 0), (B = 0))
              : ((y = I >>> 24), (B += 2));
        }
        if (l >= 0) for (a[l--] = y; l >= 0; ) a[l--] = 0;
      }),
      Math.clz32
        ? (o.prototype._countBits = function (a) {
            return 32 - Math.clz32(a);
          })
        : (o.prototype._countBits = function (a) {
            var u = a,
              l = 0;
            return (
              u >= 4096 && ((l += 13), (u >>>= 13)),
              u >= 64 && ((l += 7), (u >>>= 7)),
              u >= 8 && ((l += 4), (u >>>= 4)),
              u >= 2 && ((l += 2), (u >>>= 2)),
              l + u
            );
          }),
      (o.prototype._zeroBits = function (a) {
        if (a === 0) return 26;
        var u = a,
          l = 0;
        return (
          u & 8191 || ((l += 13), (u >>>= 13)),
          u & 127 || ((l += 7), (u >>>= 7)),
          u & 15 || ((l += 4), (u >>>= 4)),
          u & 3 || ((l += 2), (u >>>= 2)),
          u & 1 || l++,
          l
        );
      }),
      (o.prototype.bitLength = function () {
        var a = this.words[this.length - 1],
          u = this._countBits(a);
        return (this.length - 1) * 26 + u;
      });
    function U(E) {
      for (var a = new Array(E.bitLength()), u = 0; u < a.length; u++) {
        var l = (u / 26) | 0,
          y = u % 26;
        a[u] = (E.words[l] >>> y) & 1;
      }
      return a;
    }
    (o.prototype.zeroBits = function () {
      if (this.isZero()) return 0;
      for (var a = 0, u = 0; u < this.length; u++) {
        var l = this._zeroBits(this.words[u]);
        if (((a += l), l !== 26)) break;
      }
      return a;
    }),
      (o.prototype.byteLength = function () {
        return Math.ceil(this.bitLength() / 8);
      }),
      (o.prototype.toTwos = function (a) {
        return this.negative !== 0
          ? this.abs().inotn(a).iaddn(1)
          : this.clone();
      }),
      (o.prototype.fromTwos = function (a) {
        return this.testn(a - 1) ? this.notn(a).iaddn(1).ineg() : this.clone();
      }),
      (o.prototype.isNeg = function () {
        return this.negative !== 0;
      }),
      (o.prototype.neg = function () {
        return this.clone().ineg();
      }),
      (o.prototype.ineg = function () {
        return this.isZero() || (this.negative ^= 1), this;
      }),
      (o.prototype.iuor = function (a) {
        for (; this.length < a.length; ) this.words[this.length++] = 0;
        for (var u = 0; u < a.length; u++)
          this.words[u] = this.words[u] | a.words[u];
        return this._strip();
      }),
      (o.prototype.ior = function (a) {
        return e((this.negative | a.negative) === 0), this.iuor(a);
      }),
      (o.prototype.or = function (a) {
        return this.length > a.length
          ? this.clone().ior(a)
          : a.clone().ior(this);
      }),
      (o.prototype.uor = function (a) {
        return this.length > a.length
          ? this.clone().iuor(a)
          : a.clone().iuor(this);
      }),
      (o.prototype.iuand = function (a) {
        var u;
        this.length > a.length ? (u = a) : (u = this);
        for (var l = 0; l < u.length; l++)
          this.words[l] = this.words[l] & a.words[l];
        return (this.length = u.length), this._strip();
      }),
      (o.prototype.iand = function (a) {
        return e((this.negative | a.negative) === 0), this.iuand(a);
      }),
      (o.prototype.and = function (a) {
        return this.length > a.length
          ? this.clone().iand(a)
          : a.clone().iand(this);
      }),
      (o.prototype.uand = function (a) {
        return this.length > a.length
          ? this.clone().iuand(a)
          : a.clone().iuand(this);
      }),
      (o.prototype.iuxor = function (a) {
        var u, l;
        this.length > a.length ? ((u = this), (l = a)) : ((u = a), (l = this));
        for (var y = 0; y < l.length; y++)
          this.words[y] = u.words[y] ^ l.words[y];
        if (this !== u) for (; y < u.length; y++) this.words[y] = u.words[y];
        return (this.length = u.length), this._strip();
      }),
      (o.prototype.ixor = function (a) {
        return e((this.negative | a.negative) === 0), this.iuxor(a);
      }),
      (o.prototype.xor = function (a) {
        return this.length > a.length
          ? this.clone().ixor(a)
          : a.clone().ixor(this);
      }),
      (o.prototype.uxor = function (a) {
        return this.length > a.length
          ? this.clone().iuxor(a)
          : a.clone().iuxor(this);
      }),
      (o.prototype.inotn = function (a) {
        e(typeof a == "number" && a >= 0);
        var u = Math.ceil(a / 26) | 0,
          l = a % 26;
        this._expand(u), l > 0 && u--;
        for (var y = 0; y < u; y++) this.words[y] = ~this.words[y] & 67108863;
        return (
          l > 0 && (this.words[y] = ~this.words[y] & (67108863 >> (26 - l))),
          this._strip()
        );
      }),
      (o.prototype.notn = function (a) {
        return this.clone().inotn(a);
      }),
      (o.prototype.setn = function (a, u) {
        e(typeof a == "number" && a >= 0);
        var l = (a / 26) | 0,
          y = a % 26;
        return (
          this._expand(l + 1),
          u
            ? (this.words[l] = this.words[l] | (1 << y))
            : (this.words[l] = this.words[l] & ~(1 << y)),
          this._strip()
        );
      }),
      (o.prototype.iadd = function (a) {
        var u;
        if (this.negative !== 0 && a.negative === 0)
          return (
            (this.negative = 0),
            (u = this.isub(a)),
            (this.negative ^= 1),
            this._normSign()
          );
        if (this.negative === 0 && a.negative !== 0)
          return (
            (a.negative = 0),
            (u = this.isub(a)),
            (a.negative = 1),
            u._normSign()
          );
        var l, y;
        this.length > a.length ? ((l = this), (y = a)) : ((l = a), (y = this));
        for (var b = 0, B = 0; B < y.length; B++)
          (u = (l.words[B] | 0) + (y.words[B] | 0) + b),
            (this.words[B] = u & 67108863),
            (b = u >>> 26);
        for (; b !== 0 && B < l.length; B++)
          (u = (l.words[B] | 0) + b),
            (this.words[B] = u & 67108863),
            (b = u >>> 26);
        if (((this.length = l.length), b !== 0))
          (this.words[this.length] = b), this.length++;
        else if (l !== this)
          for (; B < l.length; B++) this.words[B] = l.words[B];
        return this;
      }),
      (o.prototype.add = function (a) {
        var u;
        return a.negative !== 0 && this.negative === 0
          ? ((a.negative = 0), (u = this.sub(a)), (a.negative ^= 1), u)
          : a.negative === 0 && this.negative !== 0
          ? ((this.negative = 0), (u = a.sub(this)), (this.negative = 1), u)
          : this.length > a.length
          ? this.clone().iadd(a)
          : a.clone().iadd(this);
      }),
      (o.prototype.isub = function (a) {
        if (a.negative !== 0) {
          a.negative = 0;
          var u = this.iadd(a);
          return (a.negative = 1), u._normSign();
        } else if (this.negative !== 0)
          return (
            (this.negative = 0),
            this.iadd(a),
            (this.negative = 1),
            this._normSign()
          );
        var l = this.cmp(a);
        if (l === 0)
          return (
            (this.negative = 0), (this.length = 1), (this.words[0] = 0), this
          );
        var y, b;
        l > 0 ? ((y = this), (b = a)) : ((y = a), (b = this));
        for (var B = 0, I = 0; I < b.length; I++)
          (u = (y.words[I] | 0) - (b.words[I] | 0) + B),
            (B = u >> 26),
            (this.words[I] = u & 67108863);
        for (; B !== 0 && I < y.length; I++)
          (u = (y.words[I] | 0) + B),
            (B = u >> 26),
            (this.words[I] = u & 67108863);
        if (B === 0 && I < y.length && y !== this)
          for (; I < y.length; I++) this.words[I] = y.words[I];
        return (
          (this.length = Math.max(this.length, I)),
          y !== this && (this.negative = 1),
          this._strip()
        );
      }),
      (o.prototype.sub = function (a) {
        return this.clone().isub(a);
      });
    function T(E, a, u) {
      u.negative = a.negative ^ E.negative;
      var l = (E.length + a.length) | 0;
      (u.length = l), (l = (l - 1) | 0);
      var y = E.words[0] | 0,
        b = a.words[0] | 0,
        B = y * b,
        I = B & 67108863,
        x = (B / 67108864) | 0;
      u.words[0] = I;
      for (var f = 1; f < l; f++) {
        for (
          var v = x >>> 26,
            q = x & 67108863,
            Z = Math.min(f, a.length - 1),
            nt = Math.max(0, f - E.length + 1);
          nt <= Z;
          nt++
        ) {
          var mt = (f - nt) | 0;
          (y = E.words[mt] | 0),
            (b = a.words[nt] | 0),
            (B = y * b + q),
            (v += (B / 67108864) | 0),
            (q = B & 67108863);
        }
        (u.words[f] = q | 0), (x = v | 0);
      }
      return x !== 0 ? (u.words[f] = x | 0) : u.length--, u._strip();
    }
    var H = function (a, u, l) {
      var y = a.words,
        b = u.words,
        B = l.words,
        I = 0,
        x,
        f,
        v,
        q = y[0] | 0,
        Z = q & 8191,
        nt = q >>> 13,
        mt = y[1] | 0,
        vt = mt & 8191,
        Rt = mt >>> 13,
        fe = y[2] | 0,
        Et = fe & 8191,
        Ot = fe >>> 13,
        ur = y[3] | 0,
        ne = ur & 8191,
        oe = ur >>> 13,
        gn = y[4] | 0,
        ke = gn & 8191,
        te = gn >>> 13,
        Nr = y[5] | 0,
        ge = Nr & 8191,
        ue = Nr >>> 13,
        Lr = y[6] | 0,
        ie = Lr & 8191,
        he = Lr >>> 13,
        Rr = y[7] | 0,
        le = Rr & 8191,
        de = Rr >>> 13,
        mn = y[8] | 0,
        Ee = mn & 8191,
        me = mn >>> 13,
        Yr = y[9] | 0,
        Be = Yr & 8191,
        be = Yr >>> 13,
        zr = b[0] | 0,
        we = zr & 8191,
        Se = zr >>> 13,
        Zr = b[1] | 0,
        xe = Zr & 8191,
        _e = Zr >>> 13,
        io = b[2] | 0,
        Ce = io & 8191,
        Ue = io >>> 13,
        mr = b[3] | 0,
        se = mr & 8191,
        pe = mr >>> 13,
        Cn = b[4] | 0,
        Ae = Cn & 8191,
        Te = Cn >>> 13,
        No = b[5] | 0,
        Ht = No & 8191,
        Pe = No >>> 13,
        h = b[6] | 0,
        m = h & 8191,
        g = h >>> 13,
        c = b[7] | 0,
        w = c & 8191,
        R = c >>> 13,
        C = b[8] | 0,
        K = C & 8191,
        j = C >>> 13,
        gt = b[9] | 0,
        et = gt & 8191,
        kt = gt >>> 13;
      (l.negative = a.negative ^ u.negative),
        (l.length = 19),
        (x = Math.imul(Z, we)),
        (f = Math.imul(Z, Se)),
        (f = (f + Math.imul(nt, we)) | 0),
        (v = Math.imul(nt, Se));
      var ft = (((I + x) | 0) + ((f & 8191) << 13)) | 0;
      (I = (((v + (f >>> 13)) | 0) + (ft >>> 26)) | 0),
        (ft &= 67108863),
        (x = Math.imul(vt, we)),
        (f = Math.imul(vt, Se)),
        (f = (f + Math.imul(Rt, we)) | 0),
        (v = Math.imul(Rt, Se)),
        (x = (x + Math.imul(Z, xe)) | 0),
        (f = (f + Math.imul(Z, _e)) | 0),
        (f = (f + Math.imul(nt, xe)) | 0),
        (v = (v + Math.imul(nt, _e)) | 0);
      var _t = (((I + x) | 0) + ((f & 8191) << 13)) | 0;
      (I = (((v + (f >>> 13)) | 0) + (_t >>> 26)) | 0),
        (_t &= 67108863),
        (x = Math.imul(Et, we)),
        (f = Math.imul(Et, Se)),
        (f = (f + Math.imul(Ot, we)) | 0),
        (v = Math.imul(Ot, Se)),
        (x = (x + Math.imul(vt, xe)) | 0),
        (f = (f + Math.imul(vt, _e)) | 0),
        (f = (f + Math.imul(Rt, xe)) | 0),
        (v = (v + Math.imul(Rt, _e)) | 0),
        (x = (x + Math.imul(Z, Ce)) | 0),
        (f = (f + Math.imul(Z, Ue)) | 0),
        (f = (f + Math.imul(nt, Ce)) | 0),
        (v = (v + Math.imul(nt, Ue)) | 0);
      var At = (((I + x) | 0) + ((f & 8191) << 13)) | 0;
      (I = (((v + (f >>> 13)) | 0) + (At >>> 26)) | 0),
        (At &= 67108863),
        (x = Math.imul(ne, we)),
        (f = Math.imul(ne, Se)),
        (f = (f + Math.imul(oe, we)) | 0),
        (v = Math.imul(oe, Se)),
        (x = (x + Math.imul(Et, xe)) | 0),
        (f = (f + Math.imul(Et, _e)) | 0),
        (f = (f + Math.imul(Ot, xe)) | 0),
        (v = (v + Math.imul(Ot, _e)) | 0),
        (x = (x + Math.imul(vt, Ce)) | 0),
        (f = (f + Math.imul(vt, Ue)) | 0),
        (f = (f + Math.imul(Rt, Ce)) | 0),
        (v = (v + Math.imul(Rt, Ue)) | 0),
        (x = (x + Math.imul(Z, se)) | 0),
        (f = (f + Math.imul(Z, pe)) | 0),
        (f = (f + Math.imul(nt, se)) | 0),
        (v = (v + Math.imul(nt, pe)) | 0);
      var Ut = (((I + x) | 0) + ((f & 8191) << 13)) | 0;
      (I = (((v + (f >>> 13)) | 0) + (Ut >>> 26)) | 0),
        (Ut &= 67108863),
        (x = Math.imul(ke, we)),
        (f = Math.imul(ke, Se)),
        (f = (f + Math.imul(te, we)) | 0),
        (v = Math.imul(te, Se)),
        (x = (x + Math.imul(ne, xe)) | 0),
        (f = (f + Math.imul(ne, _e)) | 0),
        (f = (f + Math.imul(oe, xe)) | 0),
        (v = (v + Math.imul(oe, _e)) | 0),
        (x = (x + Math.imul(Et, Ce)) | 0),
        (f = (f + Math.imul(Et, Ue)) | 0),
        (f = (f + Math.imul(Ot, Ce)) | 0),
        (v = (v + Math.imul(Ot, Ue)) | 0),
        (x = (x + Math.imul(vt, se)) | 0),
        (f = (f + Math.imul(vt, pe)) | 0),
        (f = (f + Math.imul(Rt, se)) | 0),
        (v = (v + Math.imul(Rt, pe)) | 0),
        (x = (x + Math.imul(Z, Ae)) | 0),
        (f = (f + Math.imul(Z, Te)) | 0),
        (f = (f + Math.imul(nt, Ae)) | 0),
        (v = (v + Math.imul(nt, Te)) | 0);
      var Pt = (((I + x) | 0) + ((f & 8191) << 13)) | 0;
      (I = (((v + (f >>> 13)) | 0) + (Pt >>> 26)) | 0),
        (Pt &= 67108863),
        (x = Math.imul(ge, we)),
        (f = Math.imul(ge, Se)),
        (f = (f + Math.imul(ue, we)) | 0),
        (v = Math.imul(ue, Se)),
        (x = (x + Math.imul(ke, xe)) | 0),
        (f = (f + Math.imul(ke, _e)) | 0),
        (f = (f + Math.imul(te, xe)) | 0),
        (v = (v + Math.imul(te, _e)) | 0),
        (x = (x + Math.imul(ne, Ce)) | 0),
        (f = (f + Math.imul(ne, Ue)) | 0),
        (f = (f + Math.imul(oe, Ce)) | 0),
        (v = (v + Math.imul(oe, Ue)) | 0),
        (x = (x + Math.imul(Et, se)) | 0),
        (f = (f + Math.imul(Et, pe)) | 0),
        (f = (f + Math.imul(Ot, se)) | 0),
        (v = (v + Math.imul(Ot, pe)) | 0),
        (x = (x + Math.imul(vt, Ae)) | 0),
        (f = (f + Math.imul(vt, Te)) | 0),
        (f = (f + Math.imul(Rt, Ae)) | 0),
        (v = (v + Math.imul(Rt, Te)) | 0),
        (x = (x + Math.imul(Z, Ht)) | 0),
        (f = (f + Math.imul(Z, Pe)) | 0),
        (f = (f + Math.imul(nt, Ht)) | 0),
        (v = (v + Math.imul(nt, Pe)) | 0);
      var It = (((I + x) | 0) + ((f & 8191) << 13)) | 0;
      (I = (((v + (f >>> 13)) | 0) + (It >>> 26)) | 0),
        (It &= 67108863),
        (x = Math.imul(ie, we)),
        (f = Math.imul(ie, Se)),
        (f = (f + Math.imul(he, we)) | 0),
        (v = Math.imul(he, Se)),
        (x = (x + Math.imul(ge, xe)) | 0),
        (f = (f + Math.imul(ge, _e)) | 0),
        (f = (f + Math.imul(ue, xe)) | 0),
        (v = (v + Math.imul(ue, _e)) | 0),
        (x = (x + Math.imul(ke, Ce)) | 0),
        (f = (f + Math.imul(ke, Ue)) | 0),
        (f = (f + Math.imul(te, Ce)) | 0),
        (v = (v + Math.imul(te, Ue)) | 0),
        (x = (x + Math.imul(ne, se)) | 0),
        (f = (f + Math.imul(ne, pe)) | 0),
        (f = (f + Math.imul(oe, se)) | 0),
        (v = (v + Math.imul(oe, pe)) | 0),
        (x = (x + Math.imul(Et, Ae)) | 0),
        (f = (f + Math.imul(Et, Te)) | 0),
        (f = (f + Math.imul(Ot, Ae)) | 0),
        (v = (v + Math.imul(Ot, Te)) | 0),
        (x = (x + Math.imul(vt, Ht)) | 0),
        (f = (f + Math.imul(vt, Pe)) | 0),
        (f = (f + Math.imul(Rt, Ht)) | 0),
        (v = (v + Math.imul(Rt, Pe)) | 0),
        (x = (x + Math.imul(Z, m)) | 0),
        (f = (f + Math.imul(Z, g)) | 0),
        (f = (f + Math.imul(nt, m)) | 0),
        (v = (v + Math.imul(nt, g)) | 0);
      var Mt = (((I + x) | 0) + ((f & 8191) << 13)) | 0;
      (I = (((v + (f >>> 13)) | 0) + (Mt >>> 26)) | 0),
        (Mt &= 67108863),
        (x = Math.imul(le, we)),
        (f = Math.imul(le, Se)),
        (f = (f + Math.imul(de, we)) | 0),
        (v = Math.imul(de, Se)),
        (x = (x + Math.imul(ie, xe)) | 0),
        (f = (f + Math.imul(ie, _e)) | 0),
        (f = (f + Math.imul(he, xe)) | 0),
        (v = (v + Math.imul(he, _e)) | 0),
        (x = (x + Math.imul(ge, Ce)) | 0),
        (f = (f + Math.imul(ge, Ue)) | 0),
        (f = (f + Math.imul(ue, Ce)) | 0),
        (v = (v + Math.imul(ue, Ue)) | 0),
        (x = (x + Math.imul(ke, se)) | 0),
        (f = (f + Math.imul(ke, pe)) | 0),
        (f = (f + Math.imul(te, se)) | 0),
        (v = (v + Math.imul(te, pe)) | 0),
        (x = (x + Math.imul(ne, Ae)) | 0),
        (f = (f + Math.imul(ne, Te)) | 0),
        (f = (f + Math.imul(oe, Ae)) | 0),
        (v = (v + Math.imul(oe, Te)) | 0),
        (x = (x + Math.imul(Et, Ht)) | 0),
        (f = (f + Math.imul(Et, Pe)) | 0),
        (f = (f + Math.imul(Ot, Ht)) | 0),
        (v = (v + Math.imul(Ot, Pe)) | 0),
        (x = (x + Math.imul(vt, m)) | 0),
        (f = (f + Math.imul(vt, g)) | 0),
        (f = (f + Math.imul(Rt, m)) | 0),
        (v = (v + Math.imul(Rt, g)) | 0),
        (x = (x + Math.imul(Z, w)) | 0),
        (f = (f + Math.imul(Z, R)) | 0),
        (f = (f + Math.imul(nt, w)) | 0),
        (v = (v + Math.imul(nt, R)) | 0);
      var Lt = (((I + x) | 0) + ((f & 8191) << 13)) | 0;
      (I = (((v + (f >>> 13)) | 0) + (Lt >>> 26)) | 0),
        (Lt &= 67108863),
        (x = Math.imul(Ee, we)),
        (f = Math.imul(Ee, Se)),
        (f = (f + Math.imul(me, we)) | 0),
        (v = Math.imul(me, Se)),
        (x = (x + Math.imul(le, xe)) | 0),
        (f = (f + Math.imul(le, _e)) | 0),
        (f = (f + Math.imul(de, xe)) | 0),
        (v = (v + Math.imul(de, _e)) | 0),
        (x = (x + Math.imul(ie, Ce)) | 0),
        (f = (f + Math.imul(ie, Ue)) | 0),
        (f = (f + Math.imul(he, Ce)) | 0),
        (v = (v + Math.imul(he, Ue)) | 0),
        (x = (x + Math.imul(ge, se)) | 0),
        (f = (f + Math.imul(ge, pe)) | 0),
        (f = (f + Math.imul(ue, se)) | 0),
        (v = (v + Math.imul(ue, pe)) | 0),
        (x = (x + Math.imul(ke, Ae)) | 0),
        (f = (f + Math.imul(ke, Te)) | 0),
        (f = (f + Math.imul(te, Ae)) | 0),
        (v = (v + Math.imul(te, Te)) | 0),
        (x = (x + Math.imul(ne, Ht)) | 0),
        (f = (f + Math.imul(ne, Pe)) | 0),
        (f = (f + Math.imul(oe, Ht)) | 0),
        (v = (v + Math.imul(oe, Pe)) | 0),
        (x = (x + Math.imul(Et, m)) | 0),
        (f = (f + Math.imul(Et, g)) | 0),
        (f = (f + Math.imul(Ot, m)) | 0),
        (v = (v + Math.imul(Ot, g)) | 0),
        (x = (x + Math.imul(vt, w)) | 0),
        (f = (f + Math.imul(vt, R)) | 0),
        (f = (f + Math.imul(Rt, w)) | 0),
        (v = (v + Math.imul(Rt, R)) | 0),
        (x = (x + Math.imul(Z, K)) | 0),
        (f = (f + Math.imul(Z, j)) | 0),
        (f = (f + Math.imul(nt, K)) | 0),
        (v = (v + Math.imul(nt, j)) | 0);
      var ht = (((I + x) | 0) + ((f & 8191) << 13)) | 0;
      (I = (((v + (f >>> 13)) | 0) + (ht >>> 26)) | 0),
        (ht &= 67108863),
        (x = Math.imul(Be, we)),
        (f = Math.imul(Be, Se)),
        (f = (f + Math.imul(be, we)) | 0),
        (v = Math.imul(be, Se)),
        (x = (x + Math.imul(Ee, xe)) | 0),
        (f = (f + Math.imul(Ee, _e)) | 0),
        (f = (f + Math.imul(me, xe)) | 0),
        (v = (v + Math.imul(me, _e)) | 0),
        (x = (x + Math.imul(le, Ce)) | 0),
        (f = (f + Math.imul(le, Ue)) | 0),
        (f = (f + Math.imul(de, Ce)) | 0),
        (v = (v + Math.imul(de, Ue)) | 0),
        (x = (x + Math.imul(ie, se)) | 0),
        (f = (f + Math.imul(ie, pe)) | 0),
        (f = (f + Math.imul(he, se)) | 0),
        (v = (v + Math.imul(he, pe)) | 0),
        (x = (x + Math.imul(ge, Ae)) | 0),
        (f = (f + Math.imul(ge, Te)) | 0),
        (f = (f + Math.imul(ue, Ae)) | 0),
        (v = (v + Math.imul(ue, Te)) | 0),
        (x = (x + Math.imul(ke, Ht)) | 0),
        (f = (f + Math.imul(ke, Pe)) | 0),
        (f = (f + Math.imul(te, Ht)) | 0),
        (v = (v + Math.imul(te, Pe)) | 0),
        (x = (x + Math.imul(ne, m)) | 0),
        (f = (f + Math.imul(ne, g)) | 0),
        (f = (f + Math.imul(oe, m)) | 0),
        (v = (v + Math.imul(oe, g)) | 0),
        (x = (x + Math.imul(Et, w)) | 0),
        (f = (f + Math.imul(Et, R)) | 0),
        (f = (f + Math.imul(Ot, w)) | 0),
        (v = (v + Math.imul(Ot, R)) | 0),
        (x = (x + Math.imul(vt, K)) | 0),
        (f = (f + Math.imul(vt, j)) | 0),
        (f = (f + Math.imul(Rt, K)) | 0),
        (v = (v + Math.imul(Rt, j)) | 0),
        (x = (x + Math.imul(Z, et)) | 0),
        (f = (f + Math.imul(Z, kt)) | 0),
        (f = (f + Math.imul(nt, et)) | 0),
        (v = (v + Math.imul(nt, kt)) | 0);
      var bt = (((I + x) | 0) + ((f & 8191) << 13)) | 0;
      (I = (((v + (f >>> 13)) | 0) + (bt >>> 26)) | 0),
        (bt &= 67108863),
        (x = Math.imul(Be, xe)),
        (f = Math.imul(Be, _e)),
        (f = (f + Math.imul(be, xe)) | 0),
        (v = Math.imul(be, _e)),
        (x = (x + Math.imul(Ee, Ce)) | 0),
        (f = (f + Math.imul(Ee, Ue)) | 0),
        (f = (f + Math.imul(me, Ce)) | 0),
        (v = (v + Math.imul(me, Ue)) | 0),
        (x = (x + Math.imul(le, se)) | 0),
        (f = (f + Math.imul(le, pe)) | 0),
        (f = (f + Math.imul(de, se)) | 0),
        (v = (v + Math.imul(de, pe)) | 0),
        (x = (x + Math.imul(ie, Ae)) | 0),
        (f = (f + Math.imul(ie, Te)) | 0),
        (f = (f + Math.imul(he, Ae)) | 0),
        (v = (v + Math.imul(he, Te)) | 0),
        (x = (x + Math.imul(ge, Ht)) | 0),
        (f = (f + Math.imul(ge, Pe)) | 0),
        (f = (f + Math.imul(ue, Ht)) | 0),
        (v = (v + Math.imul(ue, Pe)) | 0),
        (x = (x + Math.imul(ke, m)) | 0),
        (f = (f + Math.imul(ke, g)) | 0),
        (f = (f + Math.imul(te, m)) | 0),
        (v = (v + Math.imul(te, g)) | 0),
        (x = (x + Math.imul(ne, w)) | 0),
        (f = (f + Math.imul(ne, R)) | 0),
        (f = (f + Math.imul(oe, w)) | 0),
        (v = (v + Math.imul(oe, R)) | 0),
        (x = (x + Math.imul(Et, K)) | 0),
        (f = (f + Math.imul(Et, j)) | 0),
        (f = (f + Math.imul(Ot, K)) | 0),
        (v = (v + Math.imul(Ot, j)) | 0),
        (x = (x + Math.imul(vt, et)) | 0),
        (f = (f + Math.imul(vt, kt)) | 0),
        (f = (f + Math.imul(Rt, et)) | 0),
        (v = (v + Math.imul(Rt, kt)) | 0);
      var ct = (((I + x) | 0) + ((f & 8191) << 13)) | 0;
      (I = (((v + (f >>> 13)) | 0) + (ct >>> 26)) | 0),
        (ct &= 67108863),
        (x = Math.imul(Be, Ce)),
        (f = Math.imul(Be, Ue)),
        (f = (f + Math.imul(be, Ce)) | 0),
        (v = Math.imul(be, Ue)),
        (x = (x + Math.imul(Ee, se)) | 0),
        (f = (f + Math.imul(Ee, pe)) | 0),
        (f = (f + Math.imul(me, se)) | 0),
        (v = (v + Math.imul(me, pe)) | 0),
        (x = (x + Math.imul(le, Ae)) | 0),
        (f = (f + Math.imul(le, Te)) | 0),
        (f = (f + Math.imul(de, Ae)) | 0),
        (v = (v + Math.imul(de, Te)) | 0),
        (x = (x + Math.imul(ie, Ht)) | 0),
        (f = (f + Math.imul(ie, Pe)) | 0),
        (f = (f + Math.imul(he, Ht)) | 0),
        (v = (v + Math.imul(he, Pe)) | 0),
        (x = (x + Math.imul(ge, m)) | 0),
        (f = (f + Math.imul(ge, g)) | 0),
        (f = (f + Math.imul(ue, m)) | 0),
        (v = (v + Math.imul(ue, g)) | 0),
        (x = (x + Math.imul(ke, w)) | 0),
        (f = (f + Math.imul(ke, R)) | 0),
        (f = (f + Math.imul(te, w)) | 0),
        (v = (v + Math.imul(te, R)) | 0),
        (x = (x + Math.imul(ne, K)) | 0),
        (f = (f + Math.imul(ne, j)) | 0),
        (f = (f + Math.imul(oe, K)) | 0),
        (v = (v + Math.imul(oe, j)) | 0),
        (x = (x + Math.imul(Et, et)) | 0),
        (f = (f + Math.imul(Et, kt)) | 0),
        (f = (f + Math.imul(Ot, et)) | 0),
        (v = (v + Math.imul(Ot, kt)) | 0);
      var pt = (((I + x) | 0) + ((f & 8191) << 13)) | 0;
      (I = (((v + (f >>> 13)) | 0) + (pt >>> 26)) | 0),
        (pt &= 67108863),
        (x = Math.imul(Be, se)),
        (f = Math.imul(Be, pe)),
        (f = (f + Math.imul(be, se)) | 0),
        (v = Math.imul(be, pe)),
        (x = (x + Math.imul(Ee, Ae)) | 0),
        (f = (f + Math.imul(Ee, Te)) | 0),
        (f = (f + Math.imul(me, Ae)) | 0),
        (v = (v + Math.imul(me, Te)) | 0),
        (x = (x + Math.imul(le, Ht)) | 0),
        (f = (f + Math.imul(le, Pe)) | 0),
        (f = (f + Math.imul(de, Ht)) | 0),
        (v = (v + Math.imul(de, Pe)) | 0),
        (x = (x + Math.imul(ie, m)) | 0),
        (f = (f + Math.imul(ie, g)) | 0),
        (f = (f + Math.imul(he, m)) | 0),
        (v = (v + Math.imul(he, g)) | 0),
        (x = (x + Math.imul(ge, w)) | 0),
        (f = (f + Math.imul(ge, R)) | 0),
        (f = (f + Math.imul(ue, w)) | 0),
        (v = (v + Math.imul(ue, R)) | 0),
        (x = (x + Math.imul(ke, K)) | 0),
        (f = (f + Math.imul(ke, j)) | 0),
        (f = (f + Math.imul(te, K)) | 0),
        (v = (v + Math.imul(te, j)) | 0),
        (x = (x + Math.imul(ne, et)) | 0),
        (f = (f + Math.imul(ne, kt)) | 0),
        (f = (f + Math.imul(oe, et)) | 0),
        (v = (v + Math.imul(oe, kt)) | 0);
      var yt = (((I + x) | 0) + ((f & 8191) << 13)) | 0;
      (I = (((v + (f >>> 13)) | 0) + (yt >>> 26)) | 0),
        (yt &= 67108863),
        (x = Math.imul(Be, Ae)),
        (f = Math.imul(Be, Te)),
        (f = (f + Math.imul(be, Ae)) | 0),
        (v = Math.imul(be, Te)),
        (x = (x + Math.imul(Ee, Ht)) | 0),
        (f = (f + Math.imul(Ee, Pe)) | 0),
        (f = (f + Math.imul(me, Ht)) | 0),
        (v = (v + Math.imul(me, Pe)) | 0),
        (x = (x + Math.imul(le, m)) | 0),
        (f = (f + Math.imul(le, g)) | 0),
        (f = (f + Math.imul(de, m)) | 0),
        (v = (v + Math.imul(de, g)) | 0),
        (x = (x + Math.imul(ie, w)) | 0),
        (f = (f + Math.imul(ie, R)) | 0),
        (f = (f + Math.imul(he, w)) | 0),
        (v = (v + Math.imul(he, R)) | 0),
        (x = (x + Math.imul(ge, K)) | 0),
        (f = (f + Math.imul(ge, j)) | 0),
        (f = (f + Math.imul(ue, K)) | 0),
        (v = (v + Math.imul(ue, j)) | 0),
        (x = (x + Math.imul(ke, et)) | 0),
        (f = (f + Math.imul(ke, kt)) | 0),
        (f = (f + Math.imul(te, et)) | 0),
        (v = (v + Math.imul(te, kt)) | 0);
      var st = (((I + x) | 0) + ((f & 8191) << 13)) | 0;
      (I = (((v + (f >>> 13)) | 0) + (st >>> 26)) | 0),
        (st &= 67108863),
        (x = Math.imul(Be, Ht)),
        (f = Math.imul(Be, Pe)),
        (f = (f + Math.imul(be, Ht)) | 0),
        (v = Math.imul(be, Pe)),
        (x = (x + Math.imul(Ee, m)) | 0),
        (f = (f + Math.imul(Ee, g)) | 0),
        (f = (f + Math.imul(me, m)) | 0),
        (v = (v + Math.imul(me, g)) | 0),
        (x = (x + Math.imul(le, w)) | 0),
        (f = (f + Math.imul(le, R)) | 0),
        (f = (f + Math.imul(de, w)) | 0),
        (v = (v + Math.imul(de, R)) | 0),
        (x = (x + Math.imul(ie, K)) | 0),
        (f = (f + Math.imul(ie, j)) | 0),
        (f = (f + Math.imul(he, K)) | 0),
        (v = (v + Math.imul(he, j)) | 0),
        (x = (x + Math.imul(ge, et)) | 0),
        (f = (f + Math.imul(ge, kt)) | 0),
        (f = (f + Math.imul(ue, et)) | 0),
        (v = (v + Math.imul(ue, kt)) | 0);
      var z = (((I + x) | 0) + ((f & 8191) << 13)) | 0;
      (I = (((v + (f >>> 13)) | 0) + (z >>> 26)) | 0),
        (z &= 67108863),
        (x = Math.imul(Be, m)),
        (f = Math.imul(Be, g)),
        (f = (f + Math.imul(be, m)) | 0),
        (v = Math.imul(be, g)),
        (x = (x + Math.imul(Ee, w)) | 0),
        (f = (f + Math.imul(Ee, R)) | 0),
        (f = (f + Math.imul(me, w)) | 0),
        (v = (v + Math.imul(me, R)) | 0),
        (x = (x + Math.imul(le, K)) | 0),
        (f = (f + Math.imul(le, j)) | 0),
        (f = (f + Math.imul(de, K)) | 0),
        (v = (v + Math.imul(de, j)) | 0),
        (x = (x + Math.imul(ie, et)) | 0),
        (f = (f + Math.imul(ie, kt)) | 0),
        (f = (f + Math.imul(he, et)) | 0),
        (v = (v + Math.imul(he, kt)) | 0);
      var F = (((I + x) | 0) + ((f & 8191) << 13)) | 0;
      (I = (((v + (f >>> 13)) | 0) + (F >>> 26)) | 0),
        (F &= 67108863),
        (x = Math.imul(Be, w)),
        (f = Math.imul(Be, R)),
        (f = (f + Math.imul(be, w)) | 0),
        (v = Math.imul(be, R)),
        (x = (x + Math.imul(Ee, K)) | 0),
        (f = (f + Math.imul(Ee, j)) | 0),
        (f = (f + Math.imul(me, K)) | 0),
        (v = (v + Math.imul(me, j)) | 0),
        (x = (x + Math.imul(le, et)) | 0),
        (f = (f + Math.imul(le, kt)) | 0),
        (f = (f + Math.imul(de, et)) | 0),
        (v = (v + Math.imul(de, kt)) | 0);
      var G = (((I + x) | 0) + ((f & 8191) << 13)) | 0;
      (I = (((v + (f >>> 13)) | 0) + (G >>> 26)) | 0),
        (G &= 67108863),
        (x = Math.imul(Be, K)),
        (f = Math.imul(Be, j)),
        (f = (f + Math.imul(be, K)) | 0),
        (v = Math.imul(be, j)),
        (x = (x + Math.imul(Ee, et)) | 0),
        (f = (f + Math.imul(Ee, kt)) | 0),
        (f = (f + Math.imul(me, et)) | 0),
        (v = (v + Math.imul(me, kt)) | 0);
      var $ = (((I + x) | 0) + ((f & 8191) << 13)) | 0;
      (I = (((v + (f >>> 13)) | 0) + ($ >>> 26)) | 0),
        ($ &= 67108863),
        (x = Math.imul(Be, et)),
        (f = Math.imul(Be, kt)),
        (f = (f + Math.imul(be, et)) | 0),
        (v = Math.imul(be, kt));
      var V = (((I + x) | 0) + ((f & 8191) << 13)) | 0;
      return (
        (I = (((v + (f >>> 13)) | 0) + (V >>> 26)) | 0),
        (V &= 67108863),
        (B[0] = ft),
        (B[1] = _t),
        (B[2] = At),
        (B[3] = Ut),
        (B[4] = Pt),
        (B[5] = It),
        (B[6] = Mt),
        (B[7] = Lt),
        (B[8] = ht),
        (B[9] = bt),
        (B[10] = ct),
        (B[11] = pt),
        (B[12] = yt),
        (B[13] = st),
        (B[14] = z),
        (B[15] = F),
        (B[16] = G),
        (B[17] = $),
        (B[18] = V),
        I !== 0 && ((B[19] = I), l.length++),
        l
      );
    };
    Math.imul || (H = T);
    function J(E, a, u) {
      (u.negative = a.negative ^ E.negative), (u.length = E.length + a.length);
      for (var l = 0, y = 0, b = 0; b < u.length - 1; b++) {
        var B = y;
        y = 0;
        for (
          var I = l & 67108863,
            x = Math.min(b, a.length - 1),
            f = Math.max(0, b - E.length + 1);
          f <= x;
          f++
        ) {
          var v = b - f,
            q = E.words[v] | 0,
            Z = a.words[f] | 0,
            nt = q * Z,
            mt = nt & 67108863;
          (B = (B + ((nt / 67108864) | 0)) | 0),
            (mt = (mt + I) | 0),
            (I = mt & 67108863),
            (B = (B + (mt >>> 26)) | 0),
            (y += B >>> 26),
            (B &= 67108863);
        }
        (u.words[b] = I), (l = B), (B = y);
      }
      return l !== 0 ? (u.words[b] = l) : u.length--, u._strip();
    }
    function D(E, a, u) {
      return J(E, a, u);
    }
    o.prototype.mulTo = function (a, u) {
      var l,
        y = this.length + a.length;
      return (
        this.length === 10 && a.length === 10
          ? (l = H(this, a, u))
          : y < 63
          ? (l = T(this, a, u))
          : y < 1024
          ? (l = J(this, a, u))
          : (l = D(this, a, u)),
        l
      );
    };
    function Q(E, a) {
      (this.x = E), (this.y = a);
    }
    (Q.prototype.makeRBT = function (a) {
      for (
        var u = new Array(a), l = o.prototype._countBits(a) - 1, y = 0;
        y < a;
        y++
      )
        u[y] = this.revBin(y, l, a);
      return u;
    }),
      (Q.prototype.revBin = function (a, u, l) {
        if (a === 0 || a === l - 1) return a;
        for (var y = 0, b = 0; b < u; b++)
          (y |= (a & 1) << (u - b - 1)), (a >>= 1);
        return y;
      }),
      (Q.prototype.permute = function (a, u, l, y, b, B) {
        for (var I = 0; I < B; I++) (y[I] = u[a[I]]), (b[I] = l[a[I]]);
      }),
      (Q.prototype.transform = function (a, u, l, y, b, B) {
        this.permute(B, a, u, l, y, b);
        for (var I = 1; I < b; I <<= 1)
          for (
            var x = I << 1,
              f = Math.cos((2 * Math.PI) / x),
              v = Math.sin((2 * Math.PI) / x),
              q = 0;
            q < b;
            q += x
          )
            for (var Z = f, nt = v, mt = 0; mt < I; mt++) {
              var vt = l[q + mt],
                Rt = y[q + mt],
                fe = l[q + mt + I],
                Et = y[q + mt + I],
                Ot = Z * fe - nt * Et;
              (Et = Z * Et + nt * fe),
                (fe = Ot),
                (l[q + mt] = vt + fe),
                (y[q + mt] = Rt + Et),
                (l[q + mt + I] = vt - fe),
                (y[q + mt + I] = Rt - Et),
                mt !== x &&
                  ((Ot = f * Z - v * nt), (nt = f * nt + v * Z), (Z = Ot));
            }
      }),
      (Q.prototype.guessLen13b = function (a, u) {
        var l = Math.max(u, a) | 1,
          y = l & 1,
          b = 0;
        for (l = (l / 2) | 0; l; l = l >>> 1) b++;
        return 1 << (b + 1 + y);
      }),
      (Q.prototype.conjugate = function (a, u, l) {
        if (!(l <= 1))
          for (var y = 0; y < l / 2; y++) {
            var b = a[y];
            (a[y] = a[l - y - 1]),
              (a[l - y - 1] = b),
              (b = u[y]),
              (u[y] = -u[l - y - 1]),
              (u[l - y - 1] = -b);
          }
      }),
      (Q.prototype.normalize13b = function (a, u) {
        for (var l = 0, y = 0; y < u / 2; y++) {
          var b =
            Math.round(a[2 * y + 1] / u) * 8192 + Math.round(a[2 * y] / u) + l;
          (a[y] = b & 67108863),
            b < 67108864 ? (l = 0) : (l = (b / 67108864) | 0);
        }
        return a;
      }),
      (Q.prototype.convert13b = function (a, u, l, y) {
        for (var b = 0, B = 0; B < u; B++)
          (b = b + (a[B] | 0)),
            (l[2 * B] = b & 8191),
            (b = b >>> 13),
            (l[2 * B + 1] = b & 8191),
            (b = b >>> 13);
        for (B = 2 * u; B < y; ++B) l[B] = 0;
        e(b === 0), e((b & -8192) === 0);
      }),
      (Q.prototype.stub = function (a) {
        for (var u = new Array(a), l = 0; l < a; l++) u[l] = 0;
        return u;
      }),
      (Q.prototype.mulp = function (a, u, l) {
        var y = 2 * this.guessLen13b(a.length, u.length),
          b = this.makeRBT(y),
          B = this.stub(y),
          I = new Array(y),
          x = new Array(y),
          f = new Array(y),
          v = new Array(y),
          q = new Array(y),
          Z = new Array(y),
          nt = l.words;
        (nt.length = y),
          this.convert13b(a.words, a.length, I, y),
          this.convert13b(u.words, u.length, v, y),
          this.transform(I, B, x, f, y, b),
          this.transform(v, B, q, Z, y, b);
        for (var mt = 0; mt < y; mt++) {
          var vt = x[mt] * q[mt] - f[mt] * Z[mt];
          (f[mt] = x[mt] * Z[mt] + f[mt] * q[mt]), (x[mt] = vt);
        }
        return (
          this.conjugate(x, f, y),
          this.transform(x, f, nt, B, y, b),
          this.conjugate(nt, B, y),
          this.normalize13b(nt, y),
          (l.negative = a.negative ^ u.negative),
          (l.length = a.length + u.length),
          l._strip()
        );
      }),
      (o.prototype.mul = function (a) {
        var u = new o(null);
        return (u.words = new Array(this.length + a.length)), this.mulTo(a, u);
      }),
      (o.prototype.mulf = function (a) {
        var u = new o(null);
        return (u.words = new Array(this.length + a.length)), D(this, a, u);
      }),
      (o.prototype.imul = function (a) {
        return this.clone().mulTo(a, this);
      }),
      (o.prototype.imuln = function (a) {
        var u = a < 0;
        u && (a = -a), e(typeof a == "number"), e(a < 67108864);
        for (var l = 0, y = 0; y < this.length; y++) {
          var b = (this.words[y] | 0) * a,
            B = (b & 67108863) + (l & 67108863);
          (l >>= 26),
            (l += (b / 67108864) | 0),
            (l += B >>> 26),
            (this.words[y] = B & 67108863);
        }
        return (
          l !== 0 && ((this.words[y] = l), this.length++),
          u ? this.ineg() : this
        );
      }),
      (o.prototype.muln = function (a) {
        return this.clone().imuln(a);
      }),
      (o.prototype.sqr = function () {
        return this.mul(this);
      }),
      (o.prototype.isqr = function () {
        return this.imul(this.clone());
      }),
      (o.prototype.pow = function (a) {
        var u = U(a);
        if (u.length === 0) return new o(1);
        for (var l = this, y = 0; y < u.length && u[y] === 0; y++, l = l.sqr());
        if (++y < u.length)
          for (var b = l.sqr(); y < u.length; y++, b = b.sqr())
            u[y] !== 0 && (l = l.mul(b));
        return l;
      }),
      (o.prototype.iushln = function (a) {
        e(typeof a == "number" && a >= 0);
        var u = a % 26,
          l = (a - u) / 26,
          y = (67108863 >>> (26 - u)) << (26 - u),
          b;
        if (u !== 0) {
          var B = 0;
          for (b = 0; b < this.length; b++) {
            var I = this.words[b] & y,
              x = ((this.words[b] | 0) - I) << u;
            (this.words[b] = x | B), (B = I >>> (26 - u));
          }
          B && ((this.words[b] = B), this.length++);
        }
        if (l !== 0) {
          for (b = this.length - 1; b >= 0; b--)
            this.words[b + l] = this.words[b];
          for (b = 0; b < l; b++) this.words[b] = 0;
          this.length += l;
        }
        return this._strip();
      }),
      (o.prototype.ishln = function (a) {
        return e(this.negative === 0), this.iushln(a);
      }),
      (o.prototype.iushrn = function (a, u, l) {
        e(typeof a == "number" && a >= 0);
        var y;
        u ? (y = (u - (u % 26)) / 26) : (y = 0);
        var b = a % 26,
          B = Math.min((a - b) / 26, this.length),
          I = 67108863 ^ ((67108863 >>> b) << b),
          x = l;
        if (((y -= B), (y = Math.max(0, y)), x)) {
          for (var f = 0; f < B; f++) x.words[f] = this.words[f];
          x.length = B;
        }
        if (B !== 0)
          if (this.length > B)
            for (this.length -= B, f = 0; f < this.length; f++)
              this.words[f] = this.words[f + B];
          else (this.words[0] = 0), (this.length = 1);
        var v = 0;
        for (f = this.length - 1; f >= 0 && (v !== 0 || f >= y); f--) {
          var q = this.words[f] | 0;
          (this.words[f] = (v << (26 - b)) | (q >>> b)), (v = q & I);
        }
        return (
          x && v !== 0 && (x.words[x.length++] = v),
          this.length === 0 && ((this.words[0] = 0), (this.length = 1)),
          this._strip()
        );
      }),
      (o.prototype.ishrn = function (a, u, l) {
        return e(this.negative === 0), this.iushrn(a, u, l);
      }),
      (o.prototype.shln = function (a) {
        return this.clone().ishln(a);
      }),
      (o.prototype.ushln = function (a) {
        return this.clone().iushln(a);
      }),
      (o.prototype.shrn = function (a) {
        return this.clone().ishrn(a);
      }),
      (o.prototype.ushrn = function (a) {
        return this.clone().iushrn(a);
      }),
      (o.prototype.testn = function (a) {
        e(typeof a == "number" && a >= 0);
        var u = a % 26,
          l = (a - u) / 26,
          y = 1 << u;
        if (this.length <= l) return !1;
        var b = this.words[l];
        return !!(b & y);
      }),
      (o.prototype.imaskn = function (a) {
        e(typeof a == "number" && a >= 0);
        var u = a % 26,
          l = (a - u) / 26;
        if (
          (e(this.negative === 0, "imaskn works only with positive numbers"),
          this.length <= l)
        )
          return this;
        if (
          (u !== 0 && l++, (this.length = Math.min(l, this.length)), u !== 0)
        ) {
          var y = 67108863 ^ ((67108863 >>> u) << u);
          this.words[this.length - 1] &= y;
        }
        return this._strip();
      }),
      (o.prototype.maskn = function (a) {
        return this.clone().imaskn(a);
      }),
      (o.prototype.iaddn = function (a) {
        return (
          e(typeof a == "number"),
          e(a < 67108864),
          a < 0
            ? this.isubn(-a)
            : this.negative !== 0
            ? this.length === 1 && (this.words[0] | 0) <= a
              ? ((this.words[0] = a - (this.words[0] | 0)),
                (this.negative = 0),
                this)
              : ((this.negative = 0), this.isubn(a), (this.negative = 1), this)
            : this._iaddn(a)
        );
      }),
      (o.prototype._iaddn = function (a) {
        this.words[0] += a;
        for (var u = 0; u < this.length && this.words[u] >= 67108864; u++)
          (this.words[u] -= 67108864),
            u === this.length - 1
              ? (this.words[u + 1] = 1)
              : this.words[u + 1]++;
        return (this.length = Math.max(this.length, u + 1)), this;
      }),
      (o.prototype.isubn = function (a) {
        if ((e(typeof a == "number"), e(a < 67108864), a < 0))
          return this.iaddn(-a);
        if (this.negative !== 0)
          return (this.negative = 0), this.iaddn(a), (this.negative = 1), this;
        if (((this.words[0] -= a), this.length === 1 && this.words[0] < 0))
          (this.words[0] = -this.words[0]), (this.negative = 1);
        else
          for (var u = 0; u < this.length && this.words[u] < 0; u++)
            (this.words[u] += 67108864), (this.words[u + 1] -= 1);
        return this._strip();
      }),
      (o.prototype.addn = function (a) {
        return this.clone().iaddn(a);
      }),
      (o.prototype.subn = function (a) {
        return this.clone().isubn(a);
      }),
      (o.prototype.iabs = function () {
        return (this.negative = 0), this;
      }),
      (o.prototype.abs = function () {
        return this.clone().iabs();
      }),
      (o.prototype._ishlnsubmul = function (a, u, l) {
        var y = a.length + l,
          b;
        this._expand(y);
        var B,
          I = 0;
        for (b = 0; b < a.length; b++) {
          B = (this.words[b + l] | 0) + I;
          var x = (a.words[b] | 0) * u;
          (B -= x & 67108863),
            (I = (B >> 26) - ((x / 67108864) | 0)),
            (this.words[b + l] = B & 67108863);
        }
        for (; b < this.length - l; b++)
          (B = (this.words[b + l] | 0) + I),
            (I = B >> 26),
            (this.words[b + l] = B & 67108863);
        if (I === 0) return this._strip();
        for (e(I === -1), I = 0, b = 0; b < this.length; b++)
          (B = -(this.words[b] | 0) + I),
            (I = B >> 26),
            (this.words[b] = B & 67108863);
        return (this.negative = 1), this._strip();
      }),
      (o.prototype._wordDiv = function (a, u) {
        var l = this.length - a.length,
          y = this.clone(),
          b = a,
          B = b.words[b.length - 1] | 0,
          I = this._countBits(B);
        (l = 26 - I),
          l !== 0 &&
            ((b = b.ushln(l)), y.iushln(l), (B = b.words[b.length - 1] | 0));
        var x = y.length - b.length,
          f;
        if (u !== "mod") {
          (f = new o(null)),
            (f.length = x + 1),
            (f.words = new Array(f.length));
          for (var v = 0; v < f.length; v++) f.words[v] = 0;
        }
        var q = y.clone()._ishlnsubmul(b, 1, x);
        q.negative === 0 && ((y = q), f && (f.words[x] = 1));
        for (var Z = x - 1; Z >= 0; Z--) {
          var nt =
            (y.words[b.length + Z] | 0) * 67108864 +
            (y.words[b.length + Z - 1] | 0);
          for (
            nt = Math.min((nt / B) | 0, 67108863), y._ishlnsubmul(b, nt, Z);
            y.negative !== 0;

          )
            nt--,
              (y.negative = 0),
              y._ishlnsubmul(b, 1, Z),
              y.isZero() || (y.negative ^= 1);
          f && (f.words[Z] = nt);
        }
        return (
          f && f._strip(),
          y._strip(),
          u !== "div" && l !== 0 && y.iushrn(l),
          { div: f || null, mod: y }
        );
      }),
      (o.prototype.divmod = function (a, u, l) {
        if ((e(!a.isZero()), this.isZero()))
          return { div: new o(0), mod: new o(0) };
        var y, b, B;
        return this.negative !== 0 && a.negative === 0
          ? ((B = this.neg().divmod(a, u)),
            u !== "mod" && (y = B.div.neg()),
            u !== "div" &&
              ((b = B.mod.neg()), l && b.negative !== 0 && b.iadd(a)),
            { div: y, mod: b })
          : this.negative === 0 && a.negative !== 0
          ? ((B = this.divmod(a.neg(), u)),
            u !== "mod" && (y = B.div.neg()),
            { div: y, mod: B.mod })
          : this.negative & a.negative
          ? ((B = this.neg().divmod(a.neg(), u)),
            u !== "div" &&
              ((b = B.mod.neg()), l && b.negative !== 0 && b.isub(a)),
            { div: B.div, mod: b })
          : a.length > this.length || this.cmp(a) < 0
          ? { div: new o(0), mod: this }
          : a.length === 1
          ? u === "div"
            ? { div: this.divn(a.words[0]), mod: null }
            : u === "mod"
            ? { div: null, mod: new o(this.modrn(a.words[0])) }
            : { div: this.divn(a.words[0]), mod: new o(this.modrn(a.words[0])) }
          : this._wordDiv(a, u);
      }),
      (o.prototype.div = function (a) {
        return this.divmod(a, "div", !1).div;
      }),
      (o.prototype.mod = function (a) {
        return this.divmod(a, "mod", !1).mod;
      }),
      (o.prototype.umod = function (a) {
        return this.divmod(a, "mod", !0).mod;
      }),
      (o.prototype.divRound = function (a) {
        var u = this.divmod(a);
        if (u.mod.isZero()) return u.div;
        var l = u.div.negative !== 0 ? u.mod.isub(a) : u.mod,
          y = a.ushrn(1),
          b = a.andln(1),
          B = l.cmp(y);
        return B < 0 || (b === 1 && B === 0)
          ? u.div
          : u.div.negative !== 0
          ? u.div.isubn(1)
          : u.div.iaddn(1);
      }),
      (o.prototype.modrn = function (a) {
        var u = a < 0;
        u && (a = -a), e(a <= 67108863);
        for (var l = (1 << 26) % a, y = 0, b = this.length - 1; b >= 0; b--)
          y = (l * y + (this.words[b] | 0)) % a;
        return u ? -y : y;
      }),
      (o.prototype.modn = function (a) {
        return this.modrn(a);
      }),
      (o.prototype.idivn = function (a) {
        var u = a < 0;
        u && (a = -a), e(a <= 67108863);
        for (var l = 0, y = this.length - 1; y >= 0; y--) {
          var b = (this.words[y] | 0) + l * 67108864;
          (this.words[y] = (b / a) | 0), (l = b % a);
        }
        return this._strip(), u ? this.ineg() : this;
      }),
      (o.prototype.divn = function (a) {
        return this.clone().idivn(a);
      }),
      (o.prototype.egcd = function (a) {
        e(a.negative === 0), e(!a.isZero());
        var u = this,
          l = a.clone();
        u.negative !== 0 ? (u = u.umod(a)) : (u = u.clone());
        for (
          var y = new o(1), b = new o(0), B = new o(0), I = new o(1), x = 0;
          u.isEven() && l.isEven();

        )
          u.iushrn(1), l.iushrn(1), ++x;
        for (var f = l.clone(), v = u.clone(); !u.isZero(); ) {
          for (var q = 0, Z = 1; !(u.words[0] & Z) && q < 26; ++q, Z <<= 1);
          if (q > 0)
            for (u.iushrn(q); q-- > 0; )
              (y.isOdd() || b.isOdd()) && (y.iadd(f), b.isub(v)),
                y.iushrn(1),
                b.iushrn(1);
          for (
            var nt = 0, mt = 1;
            !(l.words[0] & mt) && nt < 26;
            ++nt, mt <<= 1
          );
          if (nt > 0)
            for (l.iushrn(nt); nt-- > 0; )
              (B.isOdd() || I.isOdd()) && (B.iadd(f), I.isub(v)),
                B.iushrn(1),
                I.iushrn(1);
          u.cmp(l) >= 0
            ? (u.isub(l), y.isub(B), b.isub(I))
            : (l.isub(u), B.isub(y), I.isub(b));
        }
        return { a: B, b: I, gcd: l.iushln(x) };
      }),
      (o.prototype._invmp = function (a) {
        e(a.negative === 0), e(!a.isZero());
        var u = this,
          l = a.clone();
        u.negative !== 0 ? (u = u.umod(a)) : (u = u.clone());
        for (
          var y = new o(1), b = new o(0), B = l.clone();
          u.cmpn(1) > 0 && l.cmpn(1) > 0;

        ) {
          for (var I = 0, x = 1; !(u.words[0] & x) && I < 26; ++I, x <<= 1);
          if (I > 0)
            for (u.iushrn(I); I-- > 0; ) y.isOdd() && y.iadd(B), y.iushrn(1);
          for (var f = 0, v = 1; !(l.words[0] & v) && f < 26; ++f, v <<= 1);
          if (f > 0)
            for (l.iushrn(f); f-- > 0; ) b.isOdd() && b.iadd(B), b.iushrn(1);
          u.cmp(l) >= 0 ? (u.isub(l), y.isub(b)) : (l.isub(u), b.isub(y));
        }
        var q;
        return (
          u.cmpn(1) === 0 ? (q = y) : (q = b), q.cmpn(0) < 0 && q.iadd(a), q
        );
      }),
      (o.prototype.gcd = function (a) {
        if (this.isZero()) return a.abs();
        if (a.isZero()) return this.abs();
        var u = this.clone(),
          l = a.clone();
        (u.negative = 0), (l.negative = 0);
        for (var y = 0; u.isEven() && l.isEven(); y++) u.iushrn(1), l.iushrn(1);
        do {
          for (; u.isEven(); ) u.iushrn(1);
          for (; l.isEven(); ) l.iushrn(1);
          var b = u.cmp(l);
          if (b < 0) {
            var B = u;
            (u = l), (l = B);
          } else if (b === 0 || l.cmpn(1) === 0) break;
          u.isub(l);
        } while (!0);
        return l.iushln(y);
      }),
      (o.prototype.invm = function (a) {
        return this.egcd(a).a.umod(a);
      }),
      (o.prototype.isEven = function () {
        return (this.words[0] & 1) === 0;
      }),
      (o.prototype.isOdd = function () {
        return (this.words[0] & 1) === 1;
      }),
      (o.prototype.andln = function (a) {
        return this.words[0] & a;
      }),
      (o.prototype.bincn = function (a) {
        e(typeof a == "number");
        var u = a % 26,
          l = (a - u) / 26,
          y = 1 << u;
        if (this.length <= l)
          return this._expand(l + 1), (this.words[l] |= y), this;
        for (var b = y, B = l; b !== 0 && B < this.length; B++) {
          var I = this.words[B] | 0;
          (I += b), (b = I >>> 26), (I &= 67108863), (this.words[B] = I);
        }
        return b !== 0 && ((this.words[B] = b), this.length++), this;
      }),
      (o.prototype.isZero = function () {
        return this.length === 1 && this.words[0] === 0;
      }),
      (o.prototype.cmpn = function (a) {
        var u = a < 0;
        if (this.negative !== 0 && !u) return -1;
        if (this.negative === 0 && u) return 1;
        this._strip();
        var l;
        if (this.length > 1) l = 1;
        else {
          u && (a = -a), e(a <= 67108863, "Number is too big");
          var y = this.words[0] | 0;
          l = y === a ? 0 : y < a ? -1 : 1;
        }
        return this.negative !== 0 ? -l | 0 : l;
      }),
      (o.prototype.cmp = function (a) {
        if (this.negative !== 0 && a.negative === 0) return -1;
        if (this.negative === 0 && a.negative !== 0) return 1;
        var u = this.ucmp(a);
        return this.negative !== 0 ? -u | 0 : u;
      }),
      (o.prototype.ucmp = function (a) {
        if (this.length > a.length) return 1;
        if (this.length < a.length) return -1;
        for (var u = 0, l = this.length - 1; l >= 0; l--) {
          var y = this.words[l] | 0,
            b = a.words[l] | 0;
          if (y !== b) {
            y < b ? (u = -1) : y > b && (u = 1);
            break;
          }
        }
        return u;
      }),
      (o.prototype.gtn = function (a) {
        return this.cmpn(a) === 1;
      }),
      (o.prototype.gt = function (a) {
        return this.cmp(a) === 1;
      }),
      (o.prototype.gten = function (a) {
        return this.cmpn(a) >= 0;
      }),
      (o.prototype.gte = function (a) {
        return this.cmp(a) >= 0;
      }),
      (o.prototype.ltn = function (a) {
        return this.cmpn(a) === -1;
      }),
      (o.prototype.lt = function (a) {
        return this.cmp(a) === -1;
      }),
      (o.prototype.lten = function (a) {
        return this.cmpn(a) <= 0;
      }),
      (o.prototype.lte = function (a) {
        return this.cmp(a) <= 0;
      }),
      (o.prototype.eqn = function (a) {
        return this.cmpn(a) === 0;
      }),
      (o.prototype.eq = function (a) {
        return this.cmp(a) === 0;
      }),
      (o.red = function (a) {
        return new xt(a);
      }),
      (o.prototype.toRed = function (a) {
        return (
          e(!this.red, "Already a number in reduction context"),
          e(this.negative === 0, "red works only with positives"),
          a.convertTo(this)._forceRed(a)
        );
      }),
      (o.prototype.fromRed = function () {
        return (
          e(this.red, "fromRed works only with numbers in reduction context"),
          this.red.convertFrom(this)
        );
      }),
      (o.prototype._forceRed = function (a) {
        return (this.red = a), this;
      }),
      (o.prototype.forceRed = function (a) {
        return (
          e(!this.red, "Already a number in reduction context"),
          this._forceRed(a)
        );
      }),
      (o.prototype.redAdd = function (a) {
        return (
          e(this.red, "redAdd works only with red numbers"),
          this.red.add(this, a)
        );
      }),
      (o.prototype.redIAdd = function (a) {
        return (
          e(this.red, "redIAdd works only with red numbers"),
          this.red.iadd(this, a)
        );
      }),
      (o.prototype.redSub = function (a) {
        return (
          e(this.red, "redSub works only with red numbers"),
          this.red.sub(this, a)
        );
      }),
      (o.prototype.redISub = function (a) {
        return (
          e(this.red, "redISub works only with red numbers"),
          this.red.isub(this, a)
        );
      }),
      (o.prototype.redShl = function (a) {
        return (
          e(this.red, "redShl works only with red numbers"),
          this.red.shl(this, a)
        );
      }),
      (o.prototype.redMul = function (a) {
        return (
          e(this.red, "redMul works only with red numbers"),
          this.red._verify2(this, a),
          this.red.mul(this, a)
        );
      }),
      (o.prototype.redIMul = function (a) {
        return (
          e(this.red, "redMul works only with red numbers"),
          this.red._verify2(this, a),
          this.red.imul(this, a)
        );
      }),
      (o.prototype.redSqr = function () {
        return (
          e(this.red, "redSqr works only with red numbers"),
          this.red._verify1(this),
          this.red.sqr(this)
        );
      }),
      (o.prototype.redISqr = function () {
        return (
          e(this.red, "redISqr works only with red numbers"),
          this.red._verify1(this),
          this.red.isqr(this)
        );
      }),
      (o.prototype.redSqrt = function () {
        return (
          e(this.red, "redSqrt works only with red numbers"),
          this.red._verify1(this),
          this.red.sqrt(this)
        );
      }),
      (o.prototype.redInvm = function () {
        return (
          e(this.red, "redInvm works only with red numbers"),
          this.red._verify1(this),
          this.red.invm(this)
        );
      }),
      (o.prototype.redNeg = function () {
        return (
          e(this.red, "redNeg works only with red numbers"),
          this.red._verify1(this),
          this.red.neg(this)
        );
      }),
      (o.prototype.redPow = function (a) {
        return (
          e(this.red && !a.red, "redPow(normalNum)"),
          this.red._verify1(this),
          this.red.pow(this, a)
        );
      });
    var at = { k256: null, p224: null, p192: null, p25519: null };
    function rt(E, a) {
      (this.name = E),
        (this.p = new o(a, 16)),
        (this.n = this.p.bitLength()),
        (this.k = new o(1).iushln(this.n).isub(this.p)),
        (this.tmp = this._tmp());
    }
    (rt.prototype._tmp = function () {
      var a = new o(null);
      return (a.words = new Array(Math.ceil(this.n / 13))), a;
    }),
      (rt.prototype.ireduce = function (a) {
        var u = a,
          l;
        do
          this.split(u, this.tmp),
            (u = this.imulK(u)),
            (u = u.iadd(this.tmp)),
            (l = u.bitLength());
        while (l > this.n);
        var y = l < this.n ? -1 : u.ucmp(this.p);
        return (
          y === 0
            ? ((u.words[0] = 0), (u.length = 1))
            : y > 0
            ? u.isub(this.p)
            : u.strip !== void 0
            ? u.strip()
            : u._strip(),
          u
        );
      }),
      (rt.prototype.split = function (a, u) {
        a.iushrn(this.n, 0, u);
      }),
      (rt.prototype.imulK = function (a) {
        return a.imul(this.k);
      });
    function it() {
      rt.call(
        this,
        "k256",
        "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f"
      );
    }
    n(it, rt),
      (it.prototype.split = function (a, u) {
        for (var l = 4194303, y = Math.min(a.length, 9), b = 0; b < y; b++)
          u.words[b] = a.words[b];
        if (((u.length = y), a.length <= 9)) {
          (a.words[0] = 0), (a.length = 1);
          return;
        }
        var B = a.words[9];
        for (u.words[u.length++] = B & l, b = 10; b < a.length; b++) {
          var I = a.words[b] | 0;
          (a.words[b - 10] = ((I & l) << 4) | (B >>> 22)), (B = I);
        }
        (B >>>= 22),
          (a.words[b - 10] = B),
          B === 0 && a.length > 10 ? (a.length -= 10) : (a.length -= 9);
      }),
      (it.prototype.imulK = function (a) {
        (a.words[a.length] = 0), (a.words[a.length + 1] = 0), (a.length += 2);
        for (var u = 0, l = 0; l < a.length; l++) {
          var y = a.words[l] | 0;
          (u += y * 977),
            (a.words[l] = u & 67108863),
            (u = y * 64 + ((u / 67108864) | 0));
        }
        return (
          a.words[a.length - 1] === 0 &&
            (a.length--, a.words[a.length - 1] === 0 && a.length--),
          a
        );
      });
    function ut() {
      rt.call(
        this,
        "p224",
        "ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001"
      );
    }
    n(ut, rt);
    function wt() {
      rt.call(
        this,
        "p192",
        "ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff"
      );
    }
    n(wt, rt);
    function re() {
      rt.call(
        this,
        "25519",
        "7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed"
      );
    }
    n(re, rt),
      (re.prototype.imulK = function (a) {
        for (var u = 0, l = 0; l < a.length; l++) {
          var y = (a.words[l] | 0) * 19 + u,
            b = y & 67108863;
          (y >>>= 26), (a.words[l] = b), (u = y);
        }
        return u !== 0 && (a.words[a.length++] = u), a;
      }),
      (o._prime = function (a) {
        if (at[a]) return at[a];
        var u;
        if (a === "k256") u = new it();
        else if (a === "p224") u = new ut();
        else if (a === "p192") u = new wt();
        else if (a === "p25519") u = new re();
        else throw new Error("Unknown prime " + a);
        return (at[a] = u), u;
      });
    function xt(E) {
      if (typeof E == "string") {
        var a = o._prime(E);
        (this.m = a.p), (this.prime = a);
      } else
        e(E.gtn(1), "modulus must be greater than 1"),
          (this.m = E),
          (this.prime = null);
    }
    (xt.prototype._verify1 = function (a) {
      e(a.negative === 0, "red works only with positives"),
        e(a.red, "red works only with red numbers");
    }),
      (xt.prototype._verify2 = function (a, u) {
        e((a.negative | u.negative) === 0, "red works only with positives"),
          e(a.red && a.red === u.red, "red works only with red numbers");
      }),
      (xt.prototype.imod = function (a) {
        return this.prime
          ? this.prime.ireduce(a)._forceRed(this)
          : (S(a, a.umod(this.m)._forceRed(this)), a);
      }),
      (xt.prototype.neg = function (a) {
        return a.isZero() ? a.clone() : this.m.sub(a)._forceRed(this);
      }),
      (xt.prototype.add = function (a, u) {
        this._verify2(a, u);
        var l = a.add(u);
        return l.cmp(this.m) >= 0 && l.isub(this.m), l._forceRed(this);
      }),
      (xt.prototype.iadd = function (a, u) {
        this._verify2(a, u);
        var l = a.iadd(u);
        return l.cmp(this.m) >= 0 && l.isub(this.m), l;
      }),
      (xt.prototype.sub = function (a, u) {
        this._verify2(a, u);
        var l = a.sub(u);
        return l.cmpn(0) < 0 && l.iadd(this.m), l._forceRed(this);
      }),
      (xt.prototype.isub = function (a, u) {
        this._verify2(a, u);
        var l = a.isub(u);
        return l.cmpn(0) < 0 && l.iadd(this.m), l;
      }),
      (xt.prototype.shl = function (a, u) {
        return this._verify1(a), this.imod(a.ushln(u));
      }),
      (xt.prototype.imul = function (a, u) {
        return this._verify2(a, u), this.imod(a.imul(u));
      }),
      (xt.prototype.mul = function (a, u) {
        return this._verify2(a, u), this.imod(a.mul(u));
      }),
      (xt.prototype.isqr = function (a) {
        return this.imul(a, a.clone());
      }),
      (xt.prototype.sqr = function (a) {
        return this.mul(a, a);
      }),
      (xt.prototype.sqrt = function (a) {
        if (a.isZero()) return a.clone();
        var u = this.m.andln(3);
        if ((e(u % 2 === 1), u === 3)) {
          var l = this.m.add(new o(1)).iushrn(2);
          return this.pow(a, l);
        }
        for (var y = this.m.subn(1), b = 0; !y.isZero() && y.andln(1) === 0; )
          b++, y.iushrn(1);
        e(!y.isZero());
        var B = new o(1).toRed(this),
          I = B.redNeg(),
          x = this.m.subn(1).iushrn(1),
          f = this.m.bitLength();
        for (f = new o(2 * f * f).toRed(this); this.pow(f, x).cmp(I) !== 0; )
          f.redIAdd(I);
        for (
          var v = this.pow(f, y),
            q = this.pow(a, y.addn(1).iushrn(1)),
            Z = this.pow(a, y),
            nt = b;
          Z.cmp(B) !== 0;

        ) {
          for (var mt = Z, vt = 0; mt.cmp(B) !== 0; vt++) mt = mt.redSqr();
          e(vt < nt);
          var Rt = this.pow(v, new o(1).iushln(nt - vt - 1));
          (q = q.redMul(Rt)), (v = Rt.redSqr()), (Z = Z.redMul(v)), (nt = vt);
        }
        return q;
      }),
      (xt.prototype.invm = function (a) {
        var u = a._invmp(this.m);
        return u.negative !== 0
          ? ((u.negative = 0), this.imod(u).redNeg())
          : this.imod(u);
      }),
      (xt.prototype.pow = function (a, u) {
        if (u.isZero()) return new o(1).toRed(this);
        if (u.cmpn(1) === 0) return a.clone();
        var l = 4,
          y = new Array(1 << l);
        (y[0] = new o(1).toRed(this)), (y[1] = a);
        for (var b = 2; b < y.length; b++) y[b] = this.mul(y[b - 1], a);
        var B = y[0],
          I = 0,
          x = 0,
          f = u.bitLength() % 26;
        for (f === 0 && (f = 26), b = u.length - 1; b >= 0; b--) {
          for (var v = u.words[b], q = f - 1; q >= 0; q--) {
            var Z = (v >> q) & 1;
            if ((B !== y[0] && (B = this.sqr(B)), Z === 0 && I === 0)) {
              x = 0;
              continue;
            }
            (I <<= 1),
              (I |= Z),
              x++,
              !(x !== l && (b !== 0 || q !== 0)) &&
                ((B = this.mul(B, y[I])), (x = 0), (I = 0));
          }
          f = 26;
        }
        return B;
      }),
      (xt.prototype.convertTo = function (a) {
        var u = a.umod(this.m);
        return u === a ? u.clone() : u;
      }),
      (xt.prototype.convertFrom = function (a) {
        var u = a.clone();
        return (u.red = null), u;
      }),
      (o.mont = function (a) {
        return new Ct(a);
      });
    function Ct(E) {
      xt.call(this, E),
        (this.shift = this.m.bitLength()),
        this.shift % 26 !== 0 && (this.shift += 26 - (this.shift % 26)),
        (this.r = new o(1).iushln(this.shift)),
        (this.r2 = this.imod(this.r.sqr())),
        (this.rinv = this.r._invmp(this.m)),
        (this.minv = this.rinv.mul(this.r).isubn(1).div(this.m)),
        (this.minv = this.minv.umod(this.r)),
        (this.minv = this.r.sub(this.minv));
    }
    n(Ct, xt),
      (Ct.prototype.convertTo = function (a) {
        return this.imod(a.ushln(this.shift));
      }),
      (Ct.prototype.convertFrom = function (a) {
        var u = this.imod(a.mul(this.rinv));
        return (u.red = null), u;
      }),
      (Ct.prototype.imul = function (a, u) {
        if (a.isZero() || u.isZero())
          return (a.words[0] = 0), (a.length = 1), a;
        var l = a.imul(u),
          y = l.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m),
          b = l.isub(y).iushrn(this.shift),
          B = b;
        return (
          b.cmp(this.m) >= 0
            ? (B = b.isub(this.m))
            : b.cmpn(0) < 0 && (B = b.iadd(this.m)),
          B._forceRed(this)
        );
      }),
      (Ct.prototype.mul = function (a, u) {
        if (a.isZero() || u.isZero()) return new o(0)._forceRed(this);
        var l = a.mul(u),
          y = l.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m),
          b = l.isub(y).iushrn(this.shift),
          B = b;
        return (
          b.cmp(this.m) >= 0
            ? (B = b.isub(this.m))
            : b.cmpn(0) < 0 && (B = b.iadd(this.m)),
          B._forceRed(this)
        );
      }),
      (Ct.prototype.invm = function (a) {
        var u = this.imod(a._invmp(this.m).mul(this.r2));
        return u._forceRed(this);
      });
  })(typeof As > "u" || As, Bc);
});
var Rs = We((Ls, Ec) => {
  var Jo = Fn(),
    Cr = Jo.Buffer;
  function Sc(r, t) {
    for (var e in r) t[e] = r[e];
  }
  Cr.from && Cr.alloc && Cr.allocUnsafe && Cr.allocUnsafeSlow
    ? (Ec.exports = Jo)
    : (Sc(Jo, Ls), (Ls.Buffer = An));
  function An(r, t, e) {
    return Cr(r, t, e);
  }
  An.prototype = Object.create(Cr.prototype);
  Sc(Cr, An);
  An.from = function (r, t, e) {
    if (typeof r == "number")
      throw new TypeError("Argument must not be a number");
    return Cr(r, t, e);
  };
  An.alloc = function (r, t, e) {
    if (typeof r != "number") throw new TypeError("Argument must be a number");
    var n = Cr(r);
    return (
      t !== void 0
        ? typeof e == "string"
          ? n.fill(t, e)
          : n.fill(t)
        : n.fill(0),
      n
    );
  };
  An.allocUnsafe = function (r) {
    if (typeof r != "number") throw new TypeError("Argument must be a number");
    return Cr(r);
  };
  An.allocUnsafeSlow = function (r) {
    if (typeof r != "number") throw new TypeError("Argument must be a number");
    return Jo.SlowBuffer(r);
  };
});
var Ac = We((fp, _c) => {
  "use strict";
  var Qo = Rs().Buffer;
  function sl(r) {
    if (r.length >= 255) throw new TypeError("Alphabet too long");
    for (var t = new Uint8Array(256), e = 0; e < t.length; e++) t[e] = 255;
    for (var n = 0; n < r.length; n++) {
      var o = r.charAt(n),
        i = o.charCodeAt(0);
      if (t[i] !== 255) throw new TypeError(o + " is ambiguous");
      t[i] = n;
    }
    var s = r.length,
      d = r.charAt(0),
      p = Math.log(s) / Math.log(256),
      S = Math.log(256) / Math.log(s);
    function k(M) {
      if (
        ((Array.isArray(M) || M instanceof Uint8Array) && (M = Qo.from(M)),
        !Qo.isBuffer(M))
      )
        throw new TypeError("Expected Buffer");
      if (M.length === 0) return "";
      for (var X = 0, U = 0, T = 0, H = M.length; T !== H && M[T] === 0; )
        T++, X++;
      for (var J = ((H - T) * S + 1) >>> 0, D = new Uint8Array(J); T !== H; ) {
        for (
          var Q = M[T], at = 0, rt = J - 1;
          (Q !== 0 || at < U) && rt !== -1;
          rt--, at++
        )
          (Q += (256 * D[rt]) >>> 0),
            (D[rt] = Q % s >>> 0),
            (Q = (Q / s) >>> 0);
        if (Q !== 0) throw new Error("Non-zero carry");
        (U = at), T++;
      }
      for (var it = J - U; it !== J && D[it] === 0; ) it++;
      for (var ut = d.repeat(X); it < J; ++it) ut += r.charAt(D[it]);
      return ut;
    }
    function _(M) {
      if (typeof M != "string") throw new TypeError("Expected String");
      if (M.length === 0) return Qo.alloc(0);
      for (var X = 0, U = 0, T = 0; M[X] === d; ) U++, X++;
      for (
        var H = ((M.length - X) * p + 1) >>> 0, J = new Uint8Array(H);
        X < M.length;

      ) {
        var D = t[M.charCodeAt(X)];
        if (D === 255) return;
        for (var Q = 0, at = H - 1; (D !== 0 || Q < T) && at !== -1; at--, Q++)
          (D += (s * J[at]) >>> 0),
            (J[at] = D % 256 >>> 0),
            (D = (D / 256) >>> 0);
        if (D !== 0) throw new Error("Non-zero carry");
        (T = Q), X++;
      }
      for (var rt = H - T; rt !== H && J[rt] === 0; ) rt++;
      var it = Qo.allocUnsafe(U + (H - rt));
      it.fill(0, 0, U);
      for (var ut = U; rt !== H; ) it[ut++] = J[rt++];
      return it;
    }
    function P(M) {
      var X = _(M);
      if (X) return X;
      throw new Error("Non-base" + s + " character");
    }
    return { encode: k, decodeUnsafe: _, decode: P };
  }
  _c.exports = sl;
});
var Lc = We((up, Ic) => {
  var al = Ac(),
    cl = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  Ic.exports = al(cl);
});
var Uc = We((vp, Cc) => {
  "use strict";
  var oi = Rs().Buffer;
  function pl(r) {
    if (r.length >= 255) throw new TypeError("Alphabet too long");
    for (var t = new Uint8Array(256), e = 0; e < t.length; e++) t[e] = 255;
    for (var n = 0; n < r.length; n++) {
      var o = r.charAt(n),
        i = o.charCodeAt(0);
      if (t[i] !== 255) throw new TypeError(o + " is ambiguous");
      t[i] = n;
    }
    var s = r.length,
      d = r.charAt(0),
      p = Math.log(s) / Math.log(256),
      S = Math.log(256) / Math.log(s);
    function k(M) {
      if (
        ((Array.isArray(M) || M instanceof Uint8Array) && (M = oi.from(M)),
        !oi.isBuffer(M))
      )
        throw new TypeError("Expected Buffer");
      if (M.length === 0) return "";
      for (var X = 0, U = 0, T = 0, H = M.length; T !== H && M[T] === 0; )
        T++, X++;
      for (var J = ((H - T) * S + 1) >>> 0, D = new Uint8Array(J); T !== H; ) {
        for (
          var Q = M[T], at = 0, rt = J - 1;
          (Q !== 0 || at < U) && rt !== -1;
          rt--, at++
        )
          (Q += (256 * D[rt]) >>> 0),
            (D[rt] = Q % s >>> 0),
            (Q = (Q / s) >>> 0);
        if (Q !== 0) throw new Error("Non-zero carry");
        (U = at), T++;
      }
      for (var it = J - U; it !== J && D[it] === 0; ) it++;
      for (var ut = d.repeat(X); it < J; ++it) ut += r.charAt(D[it]);
      return ut;
    }
    function _(M) {
      if (typeof M != "string") throw new TypeError("Expected String");
      if (M.length === 0) return oi.alloc(0);
      for (var X = 0, U = 0, T = 0; M[X] === d; ) U++, X++;
      for (
        var H = ((M.length - X) * p + 1) >>> 0, J = new Uint8Array(H);
        X < M.length;

      ) {
        var D = t[M.charCodeAt(X)];
        if (D === 255) return;
        for (var Q = 0, at = H - 1; (D !== 0 || Q < T) && at !== -1; at--, Q++)
          (D += (s * J[at]) >>> 0),
            (J[at] = D % 256 >>> 0),
            (D = (D / 256) >>> 0);
        if (D !== 0) throw new Error("Non-zero carry");
        (T = Q), X++;
      }
      for (var rt = H - T; rt !== H && J[rt] === 0; ) rt++;
      var it = oi.allocUnsafe(U + (H - rt));
      it.fill(0, 0, U);
      for (var ut = U; rt !== H; ) it[ut++] = J[rt++];
      return it;
    }
    function P(M) {
      var X = _(M);
      if (X) return X;
      throw new Error("Non-base" + s + " character");
    }
    return { encode: k, decodeUnsafe: _, decode: P };
  }
  Cc.exports = pl;
});
var Nc = We((kp, Oc) => {
  var yl = Uc(),
    gl = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  Oc.exports = yl(gl);
});
var zc = We((zs) => {
  "use strict";
  function Hr(r, t, e) {
    return t <= r && r <= e;
  }
  function fi(r) {
    if (r === void 0) return {};
    if (r === Object(r)) return r;
    throw TypeError("Could not convert argument to dictionary");
  }
  function ml(r) {
    for (var t = String(r), e = t.length, n = 0, o = []; n < e; ) {
      var i = t.charCodeAt(n);
      if (i < 55296 || i > 57343) o.push(i);
      else if (56320 <= i && i <= 57343) o.push(65533);
      else if (55296 <= i && i <= 56319)
        if (n === e - 1) o.push(65533);
        else {
          var s = r.charCodeAt(n + 1);
          if (56320 <= s && s <= 57343) {
            var d = i & 1023,
              p = s & 1023;
            o.push(65536 + (d << 10) + p), (n += 1);
          } else o.push(65533);
        }
      n += 1;
    }
    return o;
  }
  function bl(r) {
    for (var t = "", e = 0; e < r.length; ++e) {
      var n = r[e];
      n <= 65535
        ? (t += String.fromCharCode(n))
        : ((n -= 65536),
          (t += String.fromCharCode((n >> 10) + 55296, (n & 1023) + 56320)));
    }
    return t;
  }
  var ii = -1;
  function Ns(r) {
    this.tokens = [].slice.call(r);
  }
  Ns.prototype = {
    endOfStream: function () {
      return !this.tokens.length;
    },
    read: function () {
      return this.tokens.length ? this.tokens.shift() : ii;
    },
    prepend: function (r) {
      if (Array.isArray(r))
        for (var t = r; t.length; ) this.tokens.unshift(t.pop());
      else this.tokens.unshift(r);
    },
    push: function (r) {
      if (Array.isArray(r))
        for (var t = r; t.length; ) this.tokens.push(t.shift());
      else this.tokens.push(r);
    },
  };
  var Gn = -1;
  function Os(r, t) {
    if (r) throw TypeError("Decoder error");
    return t || 65533;
  }
  var si = "utf-8";
  function ai(r, t) {
    if (!(this instanceof ai)) return new ai(r, t);
    if (((r = r !== void 0 ? String(r).toLowerCase() : si), r !== si))
      throw new Error("Encoding not supported. Only utf-8 is supported");
    (t = fi(t)),
      (this._streaming = !1),
      (this._BOMseen = !1),
      (this._decoder = null),
      (this._fatal = !!t.fatal),
      (this._ignoreBOM = !!t.ignoreBOM),
      Object.defineProperty(this, "encoding", { value: "utf-8" }),
      Object.defineProperty(this, "fatal", { value: this._fatal }),
      Object.defineProperty(this, "ignoreBOM", { value: this._ignoreBOM });
  }
  ai.prototype = {
    decode: function (t, e) {
      var n;
      typeof t == "object" && t instanceof ArrayBuffer
        ? (n = new Uint8Array(t))
        : typeof t == "object" &&
          "buffer" in t &&
          t.buffer instanceof ArrayBuffer
        ? (n = new Uint8Array(t.buffer, t.byteOffset, t.byteLength))
        : (n = new Uint8Array(0)),
        (e = fi(e)),
        this._streaming ||
          ((this._decoder = new wl({ fatal: this._fatal })),
          (this._BOMseen = !1)),
        (this._streaming = !!e.stream);
      for (
        var o = new Ns(n), i = [], s;
        !o.endOfStream() &&
        ((s = this._decoder.handler(o, o.read())), s !== Gn);

      )
        s !== null && (Array.isArray(s) ? i.push.apply(i, s) : i.push(s));
      if (!this._streaming) {
        do {
          if (((s = this._decoder.handler(o, o.read())), s === Gn)) break;
          s !== null && (Array.isArray(s) ? i.push.apply(i, s) : i.push(s));
        } while (!o.endOfStream());
        this._decoder = null;
      }
      return (
        i.length &&
          ["utf-8"].indexOf(this.encoding) !== -1 &&
          !this._ignoreBOM &&
          !this._BOMseen &&
          (i[0] === 65279
            ? ((this._BOMseen = !0), i.shift())
            : (this._BOMseen = !0)),
        bl(i)
      );
    },
  };
  function ci(r, t) {
    if (!(this instanceof ci)) return new ci(r, t);
    if (((r = r !== void 0 ? String(r).toLowerCase() : si), r !== si))
      throw new Error("Encoding not supported. Only utf-8 is supported");
    (t = fi(t)),
      (this._streaming = !1),
      (this._encoder = null),
      (this._options = { fatal: !!t.fatal }),
      Object.defineProperty(this, "encoding", { value: "utf-8" });
  }
  ci.prototype = {
    encode: function (t, e) {
      (t = t ? String(t) : ""),
        (e = fi(e)),
        this._streaming || (this._encoder = new xl(this._options)),
        (this._streaming = !!e.stream);
      for (
        var n = [], o = new Ns(ml(t)), i;
        !o.endOfStream() &&
        ((i = this._encoder.handler(o, o.read())), i !== Gn);

      )
        Array.isArray(i) ? n.push.apply(n, i) : n.push(i);
      if (!this._streaming) {
        for (; (i = this._encoder.handler(o, o.read())), i !== Gn; )
          Array.isArray(i) ? n.push.apply(n, i) : n.push(i);
        this._encoder = null;
      }
      return new Uint8Array(n);
    },
  };
  function wl(r) {
    var t = r.fatal,
      e = 0,
      n = 0,
      o = 0,
      i = 128,
      s = 191;
    this.handler = function (d, p) {
      if (p === ii && o !== 0) return (o = 0), Os(t);
      if (p === ii) return Gn;
      if (o === 0) {
        if (Hr(p, 0, 127)) return p;
        if (Hr(p, 194, 223)) (o = 1), (e = p - 192);
        else if (Hr(p, 224, 239))
          p === 224 && (i = 160),
            p === 237 && (s = 159),
            (o = 2),
            (e = p - 224);
        else if (Hr(p, 240, 244))
          p === 240 && (i = 144),
            p === 244 && (s = 143),
            (o = 3),
            (e = p - 240);
        else return Os(t);
        return (e = e << (6 * o)), null;
      }
      if (!Hr(p, i, s))
        return (e = o = n = 0), (i = 128), (s = 191), d.prepend(p), Os(t);
      if (
        ((i = 128),
        (s = 191),
        (n += 1),
        (e += (p - 128) << (6 * (o - n))),
        n !== o)
      )
        return null;
      var S = e;
      return (e = o = n = 0), S;
    };
  }
  function xl(r) {
    var t = r.fatal;
    this.handler = function (e, n) {
      if (n === ii) return Gn;
      if (Hr(n, 0, 127)) return n;
      var o, i;
      Hr(n, 128, 2047)
        ? ((o = 1), (i = 192))
        : Hr(n, 2048, 65535)
        ? ((o = 2), (i = 224))
        : Hr(n, 65536, 1114111) && ((o = 3), (i = 240));
      for (var s = [(n >> (6 * o)) + i]; o > 0; ) {
        var d = n >> (6 * (o - 1));
        s.push(128 | (d & 63)), (o -= 1);
      }
      return s;
    };
  }
  zs.TextEncoder = ci;
  zs.TextDecoder = ai;
});
var Wc = We((ce) => {
  "use strict";
  var vl =
      (ce && ce.__createBinding) ||
      (Object.create
        ? function (r, t, e, n) {
            n === void 0 && (n = e),
              Object.defineProperty(r, n, {
                enumerable: !0,
                get: function () {
                  return t[e];
                },
              });
          }
        : function (r, t, e, n) {
            n === void 0 && (n = e), (r[n] = t[e]);
          }),
    kl =
      (ce && ce.__setModuleDefault) ||
      (Object.create
        ? function (r, t) {
            Object.defineProperty(r, "default", { enumerable: !0, value: t });
          }
        : function (r, t) {
            r.default = t;
          }),
    Ur =
      (ce && ce.__decorate) ||
      function (r, t, e, n) {
        var o = arguments.length,
          i =
            o < 3
              ? t
              : n === null
              ? (n = Object.getOwnPropertyDescriptor(t, e))
              : n,
          s;
        if (typeof Reflect == "object" && typeof Reflect.decorate == "function")
          i = Reflect.decorate(r, t, e, n);
        else
          for (var d = r.length - 1; d >= 0; d--)
            (s = r[d]) &&
              (i = (o < 3 ? s(i) : o > 3 ? s(t, e, i) : s(t, e)) || i);
        return o > 3 && i && Object.defineProperty(t, e, i), i;
      },
    Bl =
      (ce && ce.__importStar) ||
      function (r) {
        if (r && r.__esModule) return r;
        var t = {};
        if (r != null)
          for (var e in r)
            e !== "default" && Object.hasOwnProperty.call(r, e) && vl(t, r, e);
        return kl(t, r), t;
      },
    Fc =
      (ce && ce.__importDefault) ||
      function (r) {
        return r && r.__esModule ? r : { default: r };
      };
  Object.defineProperty(ce, "__esModule", { value: !0 });
  ce.deserializeUnchecked =
    ce.deserialize =
    ce.serialize =
    ce.BinaryReader =
    ce.BinaryWriter =
    ce.BorshError =
    ce.baseDecode =
    ce.baseEncode =
      void 0;
  var an = Fc(Is()),
    Kc = Fc(Nc()),
    Sl = Bl(zc()),
    El = typeof TextDecoder != "function" ? Sl.TextDecoder : TextDecoder,
    _l = new El("utf-8", { fatal: !0 });
  function Al(r) {
    return (
      typeof r == "string" && (r = Buffer.from(r, "utf8")),
      Kc.default.encode(Buffer.from(r))
    );
  }
  ce.baseEncode = Al;
  function Il(r) {
    return Buffer.from(Kc.default.decode(r));
  }
  ce.baseDecode = Il;
  var Fs = 1024,
    Ge = class extends Error {
      constructor(t) {
        super(t), (this.fieldPath = []), (this.originalMessage = t);
      }
      addToFieldPath(t) {
        this.fieldPath.splice(0, 0, t),
          (this.message =
            this.originalMessage + ": " + this.fieldPath.join("."));
      }
    };
  ce.BorshError = Ge;
  var ui = class {
    constructor() {
      (this.buf = Buffer.alloc(Fs)), (this.length = 0);
    }
    maybeResize() {
      this.buf.length < 16 + this.length &&
        (this.buf = Buffer.concat([this.buf, Buffer.alloc(Fs)]));
    }
    writeU8(t) {
      this.maybeResize(),
        this.buf.writeUInt8(t, this.length),
        (this.length += 1);
    }
    writeU16(t) {
      this.maybeResize(),
        this.buf.writeUInt16LE(t, this.length),
        (this.length += 2);
    }
    writeU32(t) {
      this.maybeResize(),
        this.buf.writeUInt32LE(t, this.length),
        (this.length += 4);
    }
    writeU64(t) {
      this.maybeResize(),
        this.writeBuffer(Buffer.from(new an.default(t).toArray("le", 8)));
    }
    writeU128(t) {
      this.maybeResize(),
        this.writeBuffer(Buffer.from(new an.default(t).toArray("le", 16)));
    }
    writeU256(t) {
      this.maybeResize(),
        this.writeBuffer(Buffer.from(new an.default(t).toArray("le", 32)));
    }
    writeU512(t) {
      this.maybeResize(),
        this.writeBuffer(Buffer.from(new an.default(t).toArray("le", 64)));
    }
    writeBuffer(t) {
      (this.buf = Buffer.concat([
        Buffer.from(this.buf.subarray(0, this.length)),
        t,
        Buffer.alloc(Fs),
      ])),
        (this.length += t.length);
    }
    writeString(t) {
      this.maybeResize();
      let e = Buffer.from(t, "utf8");
      this.writeU32(e.length), this.writeBuffer(e);
    }
    writeFixedArray(t) {
      this.writeBuffer(Buffer.from(t));
    }
    writeArray(t, e) {
      this.maybeResize(), this.writeU32(t.length);
      for (let n of t) this.maybeResize(), e(n);
    }
    toArray() {
      return this.buf.subarray(0, this.length);
    }
  };
  ce.BinaryWriter = ui;
  function Or(r, t, e) {
    let n = e.value;
    e.value = function (...o) {
      try {
        return n.apply(this, o);
      } catch (i) {
        if (i instanceof RangeError) {
          let s = i.code;
          if (["ERR_BUFFER_OUT_OF_BOUNDS", "ERR_OUT_OF_RANGE"].indexOf(s) >= 0)
            throw new Ge("Reached the end of buffer when deserializing");
        }
        throw i;
      }
    };
  }
  var ar = class {
    constructor(t) {
      (this.buf = t), (this.offset = 0);
    }
    readU8() {
      let t = this.buf.readUInt8(this.offset);
      return (this.offset += 1), t;
    }
    readU16() {
      let t = this.buf.readUInt16LE(this.offset);
      return (this.offset += 2), t;
    }
    readU32() {
      let t = this.buf.readUInt32LE(this.offset);
      return (this.offset += 4), t;
    }
    readU64() {
      let t = this.readBuffer(8);
      return new an.default(t, "le");
    }
    readU128() {
      let t = this.readBuffer(16);
      return new an.default(t, "le");
    }
    readU256() {
      let t = this.readBuffer(32);
      return new an.default(t, "le");
    }
    readU512() {
      let t = this.readBuffer(64);
      return new an.default(t, "le");
    }
    readBuffer(t) {
      if (this.offset + t > this.buf.length)
        throw new Ge(`Expected buffer length ${t} isn't within bounds`);
      let e = this.buf.slice(this.offset, this.offset + t);
      return (this.offset += t), e;
    }
    readString() {
      let t = this.readU32(),
        e = this.readBuffer(t);
      try {
        return _l.decode(e);
      } catch (n) {
        throw new Ge(`Error decoding UTF-8 string: ${n}`);
      }
    }
    readFixedArray(t) {
      return new Uint8Array(this.readBuffer(t));
    }
    readArray(t) {
      let e = this.readU32(),
        n = Array();
      for (let o = 0; o < e; ++o) n.push(t());
      return n;
    }
  };
  Ur([Or], ar.prototype, "readU8", null);
  Ur([Or], ar.prototype, "readU16", null);
  Ur([Or], ar.prototype, "readU32", null);
  Ur([Or], ar.prototype, "readU64", null);
  Ur([Or], ar.prototype, "readU128", null);
  Ur([Or], ar.prototype, "readU256", null);
  Ur([Or], ar.prototype, "readU512", null);
  Ur([Or], ar.prototype, "readString", null);
  Ur([Or], ar.prototype, "readFixedArray", null);
  Ur([Or], ar.prototype, "readArray", null);
  ce.BinaryReader = ar;
  function qc(r) {
    return r.charAt(0).toUpperCase() + r.slice(1);
  }
  function In(r, t, e, n, o) {
    try {
      if (typeof n == "string") o[`write${qc(n)}`](e);
      else if (n instanceof Array)
        if (typeof n[0] == "number") {
          if (e.length !== n[0])
            throw new Ge(
              `Expecting byte array of length ${n[0]}, but got ${e.length} bytes`
            );
          o.writeFixedArray(e);
        } else if (n.length === 2 && typeof n[1] == "number") {
          if (e.length !== n[1])
            throw new Ge(
              `Expecting byte array of length ${n[1]}, but got ${e.length} bytes`
            );
          for (let i = 0; i < n[1]; i++) In(r, null, e[i], n[0], o);
        } else
          o.writeArray(e, (i) => {
            In(r, t, i, n[0], o);
          });
      else if (n.kind !== void 0)
        switch (n.kind) {
          case "option": {
            e == null ? o.writeU8(0) : (o.writeU8(1), In(r, t, e, n.type, o));
            break;
          }
          case "map": {
            o.writeU32(e.size),
              e.forEach((i, s) => {
                In(r, t, s, n.key, o), In(r, t, i, n.value, o);
              });
            break;
          }
          default:
            throw new Ge(`FieldType ${n} unrecognized`);
        }
      else Dc(r, e, o);
    } catch (i) {
      throw (i instanceof Ge && i.addToFieldPath(t), i);
    }
  }
  function Dc(r, t, e) {
    if (typeof t.borshSerialize == "function") {
      t.borshSerialize(e);
      return;
    }
    let n = r.get(t.constructor);
    if (!n) throw new Ge(`Class ${t.constructor.name} is missing in schema`);
    if (n.kind === "struct")
      n.fields.map(([o, i]) => {
        In(r, o, t[o], i, e);
      });
    else if (n.kind === "enum") {
      let o = t[n.field];
      for (let i = 0; i < n.values.length; ++i) {
        let [s, d] = n.values[i];
        if (s === o) {
          e.writeU8(i), In(r, s, t[s], d, e);
          break;
        }
      }
    } else
      throw new Ge(
        `Unexpected schema kind: ${n.kind} for ${t.constructor.name}`
      );
  }
  function Ll(r, t, e = ui) {
    let n = new e();
    return Dc(r, t, n), n.toArray();
  }
  ce.serialize = Ll;
  function Ln(r, t, e, n) {
    try {
      if (typeof e == "string") return n[`read${qc(e)}`]();
      if (e instanceof Array) {
        if (typeof e[0] == "number") return n.readFixedArray(e[0]);
        if (typeof e[1] == "number") {
          let o = [];
          for (let i = 0; i < e[1]; i++) o.push(Ln(r, null, e[0], n));
          return o;
        } else return n.readArray(() => Ln(r, t, e[0], n));
      }
      if (e.kind === "option") return n.readU8() ? Ln(r, t, e.type, n) : void 0;
      if (e.kind === "map") {
        let o = new Map(),
          i = n.readU32();
        for (let s = 0; s < i; s++) {
          let d = Ln(r, t, e.key, n),
            p = Ln(r, t, e.value, n);
          o.set(d, p);
        }
        return o;
      }
      return Ks(r, e, n);
    } catch (o) {
      throw (o instanceof Ge && o.addToFieldPath(t), o);
    }
  }
  function Ks(r, t, e) {
    if (typeof t.borshDeserialize == "function") return t.borshDeserialize(e);
    let n = r.get(t);
    if (!n) throw new Ge(`Class ${t.name} is missing in schema`);
    if (n.kind === "struct") {
      let o = {};
      for (let [i, s] of r.get(t).fields) o[i] = Ln(r, i, s, e);
      return new t(o);
    }
    if (n.kind === "enum") {
      let o = e.readU8();
      if (o >= n.values.length)
        throw new Ge(`Enum index: ${o} is out of range`);
      let [i, s] = n.values[o],
        d = Ln(r, i, s, e);
      return new t({ [i]: d });
    }
    throw new Ge(`Unexpected schema kind: ${n.kind} for ${t.constructor.name}`);
  }
  function Rl(r, t, e, n = ar) {
    let o = new n(e),
      i = Ks(r, t, o);
    if (o.offset < e.length)
      throw new Ge(
        `Unexpected ${e.length - o.offset} bytes after deserialized data`
      );
    return i;
  }
  ce.deserialize = Rl;
  function Ml(r, t, e, n = ar) {
    let o = new n(e);
    return Ks(r, t, o);
  }
  ce.deserializeUnchecked = Ml;
});
var Hs = We((N) => {
  "use strict";
  Object.defineProperty(N, "__esModule", { value: !0 });
  N.s16 =
    N.s8 =
    N.nu64be =
    N.u48be =
    N.u40be =
    N.u32be =
    N.u24be =
    N.u16be =
    N.nu64 =
    N.u48 =
    N.u40 =
    N.u32 =
    N.u24 =
    N.u16 =
    N.u8 =
    N.offset =
    N.greedy =
    N.Constant =
    N.UTF8 =
    N.CString =
    N.Blob =
    N.Boolean =
    N.BitField =
    N.BitStructure =
    N.VariantLayout =
    N.Union =
    N.UnionLayoutDiscriminator =
    N.UnionDiscriminator =
    N.Structure =
    N.Sequence =
    N.DoubleBE =
    N.Double =
    N.FloatBE =
    N.Float =
    N.NearInt64BE =
    N.NearInt64 =
    N.NearUInt64BE =
    N.NearUInt64 =
    N.IntBE =
    N.Int =
    N.UIntBE =
    N.UInt =
    N.OffsetLayout =
    N.GreedyCount =
    N.ExternalLayout =
    N.bindConstructorLayout =
    N.nameWithProperty =
    N.Layout =
    N.uint8ArrayToBuffer =
    N.checkUint8Array =
      void 0;
  N.constant =
    N.utf8 =
    N.cstr =
    N.blob =
    N.unionLayoutDiscriminator =
    N.union =
    N.seq =
    N.bits =
    N.struct =
    N.f64be =
    N.f64 =
    N.f32be =
    N.f32 =
    N.ns64be =
    N.s48be =
    N.s40be =
    N.s32be =
    N.s24be =
    N.s16be =
    N.ns64 =
    N.s48 =
    N.s40 =
    N.s32 =
    N.s24 =
      void 0;
  var Ds = Fn();
  function Xn(r) {
    if (!(r instanceof Uint8Array))
      throw new TypeError("b must be a Uint8Array");
  }
  N.checkUint8Array = Xn;
  function Xt(r) {
    return Xn(r), Ds.Buffer.from(r.buffer, r.byteOffset, r.length);
  }
  N.uint8ArrayToBuffer = Xt;
  var Qt = class {
    constructor(t, e) {
      if (!Number.isInteger(t)) throw new TypeError("span must be an integer");
      (this.span = t), (this.property = e);
    }
    makeDestinationObject() {
      return {};
    }
    getSpan(t, e) {
      if (0 > this.span) throw new RangeError("indeterminate span");
      return this.span;
    }
    replicate(t) {
      let e = Object.create(this.constructor.prototype);
      return Object.assign(e, this), (e.property = t), e;
    }
    fromArray(t) {}
  };
  N.Layout = Qt;
  function Ws(r, t) {
    return t.property ? r + "[" + t.property + "]" : r;
  }
  N.nameWithProperty = Ws;
  function Tl(r, t) {
    if (typeof r != "function")
      throw new TypeError("Class must be constructor");
    if (Object.prototype.hasOwnProperty.call(r, "layout_"))
      throw new Error("Class is already bound to a layout");
    if (!(t && t instanceof Qt)) throw new TypeError("layout must be a Layout");
    if (Object.prototype.hasOwnProperty.call(t, "boundConstructor_"))
      throw new Error("layout is already bound to a constructor");
    (r.layout_ = t),
      (t.boundConstructor_ = r),
      (t.makeDestinationObject = () => new r()),
      Object.defineProperty(r.prototype, "encode", {
        value(e, n) {
          return t.encode(this, e, n);
        },
        writable: !0,
      }),
      Object.defineProperty(r, "decode", {
        value(e, n) {
          return t.decode(e, n);
        },
        writable: !0,
      });
  }
  N.bindConstructorLayout = Tl;
  var Qe = class extends Qt {
    isCount() {
      throw new Error("ExternalLayout is abstract");
    }
  };
  N.ExternalLayout = Qe;
  var hi = class extends Qe {
    constructor(t = 1, e) {
      if (!Number.isInteger(t) || 0 >= t)
        throw new TypeError("elementSpan must be a (positive) integer");
      super(-1, e), (this.elementSpan = t);
    }
    isCount() {
      return !0;
    }
    decode(t, e = 0) {
      Xn(t);
      let n = t.length - e;
      return Math.floor(n / this.elementSpan);
    }
    encode(t, e, n) {
      return 0;
    }
  };
  N.GreedyCount = hi;
  var lo = class extends Qe {
    constructor(t, e = 0, n) {
      if (!(t instanceof Qt)) throw new TypeError("layout must be a Layout");
      if (!Number.isInteger(e))
        throw new TypeError("offset must be integer or undefined");
      super(t.span, n || t.property), (this.layout = t), (this.offset = e);
    }
    isCount() {
      return this.layout instanceof pr || this.layout instanceof gr;
    }
    decode(t, e = 0) {
      return this.layout.decode(t, e + this.offset);
    }
    encode(t, e, n = 0) {
      return this.layout.encode(t, e, n + this.offset);
    }
  };
  N.OffsetLayout = lo;
  var pr = class extends Qt {
    constructor(t, e) {
      if ((super(t, e), 6 < this.span))
        throw new RangeError("span must not exceed 6 bytes");
    }
    decode(t, e = 0) {
      return Xt(t).readUIntLE(e, this.span);
    }
    encode(t, e, n = 0) {
      return Xt(e).writeUIntLE(t, n, this.span), this.span;
    }
  };
  N.UInt = pr;
  var gr = class extends Qt {
    constructor(t, e) {
      if ((super(t, e), 6 < this.span))
        throw new RangeError("span must not exceed 6 bytes");
    }
    decode(t, e = 0) {
      return Xt(t).readUIntBE(e, this.span);
    }
    encode(t, e, n = 0) {
      return Xt(e).writeUIntBE(t, n, this.span), this.span;
    }
  };
  N.UIntBE = gr;
  var $r = class extends Qt {
    constructor(t, e) {
      if ((super(t, e), 6 < this.span))
        throw new RangeError("span must not exceed 6 bytes");
    }
    decode(t, e = 0) {
      return Xt(t).readIntLE(e, this.span);
    }
    encode(t, e, n = 0) {
      return Xt(e).writeIntLE(t, n, this.span), this.span;
    }
  };
  N.Int = $r;
  var cn = class extends Qt {
    constructor(t, e) {
      if ((super(t, e), 6 < this.span))
        throw new RangeError("span must not exceed 6 bytes");
    }
    decode(t, e = 0) {
      return Xt(t).readIntBE(e, this.span);
    }
    encode(t, e, n = 0) {
      return Xt(e).writeIntBE(t, n, this.span), this.span;
    }
  };
  N.IntBE = cn;
  var qs = Math.pow(2, 32);
  function Ii(r) {
    let t = Math.floor(r / qs),
      e = r - t * qs;
    return { hi32: t, lo32: e };
  }
  function Li(r, t) {
    return r * qs + t;
  }
  var li = class extends Qt {
    constructor(t) {
      super(8, t);
    }
    decode(t, e = 0) {
      let n = Xt(t),
        o = n.readUInt32LE(e),
        i = n.readUInt32LE(e + 4);
      return Li(i, o);
    }
    encode(t, e, n = 0) {
      let o = Ii(t),
        i = Xt(e);
      return i.writeUInt32LE(o.lo32, n), i.writeUInt32LE(o.hi32, n + 4), 8;
    }
  };
  N.NearUInt64 = li;
  var di = class extends Qt {
    constructor(t) {
      super(8, t);
    }
    decode(t, e = 0) {
      let n = Xt(t),
        o = n.readUInt32BE(e),
        i = n.readUInt32BE(e + 4);
      return Li(o, i);
    }
    encode(t, e, n = 0) {
      let o = Ii(t),
        i = Xt(e);
      return i.writeUInt32BE(o.hi32, n), i.writeUInt32BE(o.lo32, n + 4), 8;
    }
  };
  N.NearUInt64BE = di;
  var pi = class extends Qt {
    constructor(t) {
      super(8, t);
    }
    decode(t, e = 0) {
      let n = Xt(t),
        o = n.readUInt32LE(e),
        i = n.readInt32LE(e + 4);
      return Li(i, o);
    }
    encode(t, e, n = 0) {
      let o = Ii(t),
        i = Xt(e);
      return i.writeUInt32LE(o.lo32, n), i.writeInt32LE(o.hi32, n + 4), 8;
    }
  };
  N.NearInt64 = pi;
  var yi = class extends Qt {
    constructor(t) {
      super(8, t);
    }
    decode(t, e = 0) {
      let n = Xt(t),
        o = n.readInt32BE(e),
        i = n.readUInt32BE(e + 4);
      return Li(o, i);
    }
    encode(t, e, n = 0) {
      let o = Ii(t),
        i = Xt(e);
      return i.writeInt32BE(o.hi32, n), i.writeUInt32BE(o.lo32, n + 4), 8;
    }
  };
  N.NearInt64BE = yi;
  var gi = class extends Qt {
    constructor(t) {
      super(4, t);
    }
    decode(t, e = 0) {
      return Xt(t).readFloatLE(e);
    }
    encode(t, e, n = 0) {
      return Xt(e).writeFloatLE(t, n), 4;
    }
  };
  N.Float = gi;
  var mi = class extends Qt {
    constructor(t) {
      super(4, t);
    }
    decode(t, e = 0) {
      return Xt(t).readFloatBE(e);
    }
    encode(t, e, n = 0) {
      return Xt(e).writeFloatBE(t, n), 4;
    }
  };
  N.FloatBE = mi;
  var bi = class extends Qt {
    constructor(t) {
      super(8, t);
    }
    decode(t, e = 0) {
      return Xt(t).readDoubleLE(e);
    }
    encode(t, e, n = 0) {
      return Xt(e).writeDoubleLE(t, n), 8;
    }
  };
  N.Double = bi;
  var wi = class extends Qt {
    constructor(t) {
      super(8, t);
    }
    decode(t, e = 0) {
      return Xt(t).readDoubleBE(e);
    }
    encode(t, e, n = 0) {
      return Xt(e).writeDoubleBE(t, n), 8;
    }
  };
  N.DoubleBE = wi;
  var xi = class extends Qt {
    constructor(t, e, n) {
      if (!(t instanceof Qt))
        throw new TypeError("elementLayout must be a Layout");
      if (
        !((e instanceof Qe && e.isCount()) || (Number.isInteger(e) && 0 <= e))
      )
        throw new TypeError(
          "count must be non-negative integer or an unsigned integer ExternalLayout"
        );
      let o = -1;
      !(e instanceof Qe) && 0 < t.span && (o = e * t.span),
        super(o, n),
        (this.elementLayout = t),
        (this.count = e);
    }
    getSpan(t, e = 0) {
      if (0 <= this.span) return this.span;
      let n = 0,
        o = this.count;
      if (
        (o instanceof Qe && (o = o.decode(t, e)), 0 < this.elementLayout.span)
      )
        n = o * this.elementLayout.span;
      else {
        let i = 0;
        for (; i < o; ) (n += this.elementLayout.getSpan(t, e + n)), ++i;
      }
      return n;
    }
    decode(t, e = 0) {
      let n = [],
        o = 0,
        i = this.count;
      for (i instanceof Qe && (i = i.decode(t, e)); o < i; )
        n.push(this.elementLayout.decode(t, e)),
          (e += this.elementLayout.getSpan(t, e)),
          (o += 1);
      return n;
    }
    encode(t, e, n = 0) {
      let o = this.elementLayout,
        i = t.reduce((s, d) => s + o.encode(d, e, n + s), 0);
      return this.count instanceof Qe && this.count.encode(t.length, e, n), i;
    }
  };
  N.Sequence = xi;
  var vi = class extends Qt {
    constructor(t, e, n) {
      if (!(Array.isArray(t) && t.reduce((i, s) => i && s instanceof Qt, !0)))
        throw new TypeError("fields must be array of Layout instances");
      typeof e == "boolean" && n === void 0 && ((n = e), (e = void 0));
      for (let i of t)
        if (0 > i.span && i.property === void 0)
          throw new Error(
            "fields cannot contain unnamed variable-length layout"
          );
      let o = -1;
      try {
        o = t.reduce((i, s) => i + s.getSpan(), 0);
      } catch {}
      super(o, e), (this.fields = t), (this.decodePrefixes = !!n);
    }
    getSpan(t, e = 0) {
      if (0 <= this.span) return this.span;
      let n = 0;
      try {
        n = this.fields.reduce((o, i) => {
          let s = i.getSpan(t, e);
          return (e += s), o + s;
        }, 0);
      } catch {
        throw new RangeError("indeterminate span");
      }
      return n;
    }
    decode(t, e = 0) {
      Xn(t);
      let n = this.makeDestinationObject();
      for (let o of this.fields)
        if (
          (o.property !== void 0 && (n[o.property] = o.decode(t, e)),
          (e += o.getSpan(t, e)),
          this.decodePrefixes && t.length === e)
        )
          break;
      return n;
    }
    encode(t, e, n = 0) {
      let o = n,
        i = 0,
        s = 0;
      for (let d of this.fields) {
        let p = d.span;
        if (((s = 0 < p ? p : 0), d.property !== void 0)) {
          let S = t[d.property];
          S !== void 0 &&
            ((s = d.encode(S, e, n)), 0 > p && (p = d.getSpan(e, n)));
        }
        (i = n), (n += p);
      }
      return i + s - o;
    }
    fromArray(t) {
      let e = this.makeDestinationObject();
      for (let n of this.fields)
        n.property !== void 0 && 0 < t.length && (e[n.property] = t.shift());
      return e;
    }
    layoutFor(t) {
      if (typeof t != "string") throw new TypeError("property must be string");
      for (let e of this.fields) if (e.property === t) return e;
    }
    offsetOf(t) {
      if (typeof t != "string") throw new TypeError("property must be string");
      let e = 0;
      for (let n of this.fields) {
        if (n.property === t) return e;
        0 > n.span ? (e = -1) : 0 <= e && (e += n.span);
      }
    }
  };
  N.Structure = vi;
  var po = class {
    constructor(t) {
      this.property = t;
    }
    decode(t, e) {
      throw new Error("UnionDiscriminator is abstract");
    }
    encode(t, e, n) {
      throw new Error("UnionDiscriminator is abstract");
    }
  };
  N.UnionDiscriminator = po;
  var Zn = class extends po {
    constructor(t, e) {
      if (!(t instanceof Qe && t.isCount()))
        throw new TypeError(
          "layout must be an unsigned integer ExternalLayout"
        );
      super(e || t.property || "variant"), (this.layout = t);
    }
    decode(t, e) {
      return this.layout.decode(t, e);
    }
    encode(t, e, n) {
      return this.layout.encode(t, e, n);
    }
  };
  N.UnionLayoutDiscriminator = Zn;
  var yo = class extends Qt {
    constructor(t, e, n) {
      let o;
      if (t instanceof pr || t instanceof gr) o = new Zn(new lo(t));
      else if (t instanceof Qe && t.isCount()) o = new Zn(t);
      else if (t instanceof po) o = t;
      else
        throw new TypeError(
          "discr must be a UnionDiscriminator or an unsigned integer layout"
        );
      if ((e === void 0 && (e = null), !(e === null || e instanceof Qt)))
        throw new TypeError("defaultLayout must be null or a Layout");
      if (e !== null) {
        if (0 > e.span)
          throw new Error("defaultLayout must have constant span");
        e.property === void 0 && (e = e.replicate("content"));
      }
      let i = -1;
      e &&
        ((i = e.span),
        0 <= i && (t instanceof pr || t instanceof gr) && (i += o.layout.span)),
        super(i, n),
        (this.discriminator = o),
        (this.usesPrefixDiscriminator = t instanceof pr || t instanceof gr),
        (this.defaultLayout = e),
        (this.registry = {});
      let s = this.defaultGetSourceVariant.bind(this);
      (this.getSourceVariant = function (d) {
        return s(d);
      }),
        (this.configGetSourceVariant = function (d) {
          s = d.bind(this);
        });
    }
    getSpan(t, e = 0) {
      if (0 <= this.span) return this.span;
      let n = this.getVariant(t, e);
      if (!n)
        throw new Error("unable to determine span for unrecognized variant");
      return n.getSpan(t, e);
    }
    defaultGetSourceVariant(t) {
      if (
        Object.prototype.hasOwnProperty.call(t, this.discriminator.property)
      ) {
        if (
          this.defaultLayout &&
          this.defaultLayout.property &&
          Object.prototype.hasOwnProperty.call(t, this.defaultLayout.property)
        )
          return;
        let e = this.registry[t[this.discriminator.property]];
        if (
          e &&
          (!e.layout ||
            (e.property && Object.prototype.hasOwnProperty.call(t, e.property)))
        )
          return e;
      } else
        for (let e in this.registry) {
          let n = this.registry[e];
          if (n.property && Object.prototype.hasOwnProperty.call(t, n.property))
            return n;
        }
      throw new Error("unable to infer src variant");
    }
    decode(t, e = 0) {
      let n,
        o = this.discriminator,
        i = o.decode(t, e),
        s = this.registry[i];
      if (s === void 0) {
        let d = this.defaultLayout,
          p = 0;
        this.usesPrefixDiscriminator && (p = o.layout.span),
          (n = this.makeDestinationObject()),
          (n[o.property] = i),
          (n[d.property] = d.decode(t, e + p));
      } else n = s.decode(t, e);
      return n;
    }
    encode(t, e, n = 0) {
      let o = this.getSourceVariant(t);
      if (o === void 0) {
        let i = this.discriminator,
          s = this.defaultLayout,
          d = 0;
        return (
          this.usesPrefixDiscriminator && (d = i.layout.span),
          i.encode(t[i.property], e, n),
          d + s.encode(t[s.property], e, n + d)
        );
      }
      return o.encode(t, e, n);
    }
    addVariant(t, e, n) {
      let o = new ki(this, t, e, n);
      return (this.registry[t] = o), o;
    }
    getVariant(t, e = 0) {
      let n;
      return (
        t instanceof Uint8Array
          ? (n = this.discriminator.decode(t, e))
          : (n = t),
        this.registry[n]
      );
    }
  };
  N.Union = yo;
  var ki = class extends Qt {
    constructor(t, e, n, o) {
      if (!(t instanceof yo)) throw new TypeError("union must be a Union");
      if (!Number.isInteger(e) || 0 > e)
        throw new TypeError("variant must be a (non-negative) integer");
      if ((typeof n == "string" && o === void 0 && ((o = n), (n = null)), n)) {
        if (!(n instanceof Qt)) throw new TypeError("layout must be a Layout");
        if (
          t.defaultLayout !== null &&
          0 <= n.span &&
          n.span > t.defaultLayout.span
        )
          throw new Error("variant span exceeds span of containing union");
        if (typeof o != "string")
          throw new TypeError("variant must have a String property");
      }
      let i = t.span;
      0 > t.span &&
        ((i = n ? n.span : 0),
        0 <= i &&
          t.usesPrefixDiscriminator &&
          (i += t.discriminator.layout.span)),
        super(i, o),
        (this.union = t),
        (this.variant = e),
        (this.layout = n || null);
    }
    getSpan(t, e = 0) {
      if (0 <= this.span) return this.span;
      let n = 0;
      this.union.usesPrefixDiscriminator &&
        (n = this.union.discriminator.layout.span);
      let o = 0;
      return this.layout && (o = this.layout.getSpan(t, e + n)), n + o;
    }
    decode(t, e = 0) {
      let n = this.makeDestinationObject();
      if (this !== this.union.getVariant(t, e))
        throw new Error("variant mismatch");
      let o = 0;
      return (
        this.union.usesPrefixDiscriminator &&
          (o = this.union.discriminator.layout.span),
        this.layout
          ? (n[this.property] = this.layout.decode(t, e + o))
          : this.property
          ? (n[this.property] = !0)
          : this.union.usesPrefixDiscriminator &&
            (n[this.union.discriminator.property] = this.variant),
        n
      );
    }
    encode(t, e, n = 0) {
      let o = 0;
      if (
        (this.union.usesPrefixDiscriminator &&
          (o = this.union.discriminator.layout.span),
        this.layout && !Object.prototype.hasOwnProperty.call(t, this.property))
      )
        throw new TypeError("variant lacks property " + this.property);
      this.union.discriminator.encode(this.variant, e, n);
      let i = o;
      if (
        this.layout &&
        (this.layout.encode(t[this.property], e, n + o),
        (i += this.layout.getSpan(e, n + o)),
        0 <= this.union.span && i > this.union.span)
      )
        throw new Error("encoded variant overruns containing union");
      return i;
    }
    fromArray(t) {
      if (this.layout) return this.layout.fromArray(t);
    }
  };
  N.VariantLayout = ki;
  function Yn(r) {
    return 0 > r && (r += 4294967296), r;
  }
  var go = class extends Qt {
    constructor(t, e, n) {
      if (!(t instanceof pr || t instanceof gr))
        throw new TypeError("word must be a UInt or UIntBE layout");
      if (
        (typeof e == "string" && n === void 0 && ((n = e), (e = !1)),
        4 < t.span)
      )
        throw new RangeError("word cannot exceed 32 bits");
      super(t.span, n), (this.word = t), (this.msb = !!e), (this.fields = []);
      let o = 0;
      (this._packedSetValue = function (i) {
        return (o = Yn(i)), this;
      }),
        (this._packedGetValue = function () {
          return o;
        });
    }
    decode(t, e = 0) {
      let n = this.makeDestinationObject(),
        o = this.word.decode(t, e);
      this._packedSetValue(o);
      for (let i of this.fields)
        i.property !== void 0 && (n[i.property] = i.decode(t));
      return n;
    }
    encode(t, e, n = 0) {
      let o = this.word.decode(e, n);
      this._packedSetValue(o);
      for (let i of this.fields)
        if (i.property !== void 0) {
          let s = t[i.property];
          s !== void 0 && i.encode(s);
        }
      return this.word.encode(this._packedGetValue(), e, n);
    }
    addField(t, e) {
      let n = new mo(this, t, e);
      return this.fields.push(n), n;
    }
    addBoolean(t) {
      let e = new Bi(this, t);
      return this.fields.push(e), e;
    }
    fieldFor(t) {
      if (typeof t != "string") throw new TypeError("property must be string");
      for (let e of this.fields) if (e.property === t) return e;
    }
  };
  N.BitStructure = go;
  var mo = class {
    constructor(t, e, n) {
      if (!(t instanceof go))
        throw new TypeError("container must be a BitStructure");
      if (!Number.isInteger(e) || 0 >= e)
        throw new TypeError("bits must be positive integer");
      let o = 8 * t.span,
        i = t.fields.reduce((s, d) => s + d.bits, 0);
      if (e + i > o)
        throw new Error(
          "bits too long for span remainder (" +
            (o - i) +
            " of " +
            o +
            " remain)"
        );
      (this.container = t),
        (this.bits = e),
        (this.valueMask = (1 << e) - 1),
        e === 32 && (this.valueMask = 4294967295),
        (this.start = i),
        this.container.msb && (this.start = o - i - e),
        (this.wordMask = Yn(this.valueMask << this.start)),
        (this.property = n);
    }
    decode(t, e) {
      let n = this.container._packedGetValue();
      return Yn(n & this.wordMask) >>> this.start;
    }
    encode(t) {
      if (
        typeof t != "number" ||
        !Number.isInteger(t) ||
        t !== Yn(t & this.valueMask)
      )
        throw new TypeError(
          Ws("BitField.encode", this) +
            " value must be integer not exceeding " +
            this.valueMask
        );
      let e = this.container._packedGetValue(),
        n = Yn(t << this.start);
      this.container._packedSetValue(Yn(e & ~this.wordMask) | n);
    }
  };
  N.BitField = mo;
  var Bi = class extends mo {
    constructor(t, e) {
      super(t, 1, e);
    }
    decode(t, e) {
      return !!super.decode(t, e);
    }
    encode(t) {
      typeof t == "boolean" && (t = +t), super.encode(t);
    }
  };
  N.Boolean = Bi;
  var Si = class extends Qt {
    constructor(t, e) {
      if (
        !((t instanceof Qe && t.isCount()) || (Number.isInteger(t) && 0 <= t))
      )
        throw new TypeError(
          "length must be positive integer or an unsigned integer ExternalLayout"
        );
      let n = -1;
      t instanceof Qe || (n = t), super(n, e), (this.length = t);
    }
    getSpan(t, e) {
      let n = this.span;
      return 0 > n && (n = this.length.decode(t, e)), n;
    }
    decode(t, e = 0) {
      let n = this.span;
      return 0 > n && (n = this.length.decode(t, e)), Xt(t).slice(e, e + n);
    }
    encode(t, e, n) {
      let o = this.length;
      if (
        (this.length instanceof Qe && (o = t.length),
        !(t instanceof Uint8Array && o === t.length))
      )
        throw new TypeError(
          Ws("Blob.encode", this) +
            " requires (length " +
            o +
            ") Uint8Array as src"
        );
      if (n + o > e.length)
        throw new RangeError("encoding overruns Uint8Array");
      let i = Xt(t);
      return (
        Xt(e).write(i.toString("hex"), n, o, "hex"),
        this.length instanceof Qe && this.length.encode(o, e, n),
        o
      );
    }
  };
  N.Blob = Si;
  var Ei = class extends Qt {
    constructor(t) {
      super(-1, t);
    }
    getSpan(t, e = 0) {
      Xn(t);
      let n = e;
      for (; n < t.length && t[n] !== 0; ) n += 1;
      return 1 + n - e;
    }
    decode(t, e = 0) {
      let n = this.getSpan(t, e);
      return Xt(t)
        .slice(e, e + n - 1)
        .toString("utf-8");
    }
    encode(t, e, n = 0) {
      typeof t != "string" && (t = String(t));
      let o = Ds.Buffer.from(t, "utf8"),
        i = o.length;
      if (n + i > e.length) throw new RangeError("encoding overruns Buffer");
      let s = Xt(e);
      return o.copy(s, n), (s[n + i] = 0), i + 1;
    }
  };
  N.CString = Ei;
  var _i = class extends Qt {
    constructor(t, e) {
      if (
        (typeof t == "string" && e === void 0 && ((e = t), (t = void 0)),
        t === void 0)
      )
        t = -1;
      else if (!Number.isInteger(t))
        throw new TypeError("maxSpan must be an integer");
      super(-1, e), (this.maxSpan = t);
    }
    getSpan(t, e = 0) {
      return Xn(t), t.length - e;
    }
    decode(t, e = 0) {
      let n = this.getSpan(t, e);
      if (0 <= this.maxSpan && this.maxSpan < n)
        throw new RangeError("text length exceeds maxSpan");
      return Xt(t)
        .slice(e, e + n)
        .toString("utf-8");
    }
    encode(t, e, n = 0) {
      typeof t != "string" && (t = String(t));
      let o = Ds.Buffer.from(t, "utf8"),
        i = o.length;
      if (0 <= this.maxSpan && this.maxSpan < i)
        throw new RangeError("text length exceeds maxSpan");
      if (n + i > e.length) throw new RangeError("encoding overruns Buffer");
      return o.copy(Xt(e), n), i;
    }
  };
  N.UTF8 = _i;
  var Ai = class extends Qt {
    constructor(t, e) {
      super(0, e), (this.value = t);
    }
    decode(t, e) {
      return this.value;
    }
    encode(t, e, n) {
      return 0;
    }
  };
  N.Constant = Ai;
  N.greedy = (r, t) => new hi(r, t);
  N.offset = (r, t, e) => new lo(r, t, e);
  N.u8 = (r) => new pr(1, r);
  N.u16 = (r) => new pr(2, r);
  N.u24 = (r) => new pr(3, r);
  N.u32 = (r) => new pr(4, r);
  N.u40 = (r) => new pr(5, r);
  N.u48 = (r) => new pr(6, r);
  N.nu64 = (r) => new li(r);
  N.u16be = (r) => new gr(2, r);
  N.u24be = (r) => new gr(3, r);
  N.u32be = (r) => new gr(4, r);
  N.u40be = (r) => new gr(5, r);
  N.u48be = (r) => new gr(6, r);
  N.nu64be = (r) => new di(r);
  N.s8 = (r) => new $r(1, r);
  N.s16 = (r) => new $r(2, r);
  N.s24 = (r) => new $r(3, r);
  N.s32 = (r) => new $r(4, r);
  N.s40 = (r) => new $r(5, r);
  N.s48 = (r) => new $r(6, r);
  N.ns64 = (r) => new pi(r);
  N.s16be = (r) => new cn(2, r);
  N.s24be = (r) => new cn(3, r);
  N.s32be = (r) => new cn(4, r);
  N.s40be = (r) => new cn(5, r);
  N.s48be = (r) => new cn(6, r);
  N.ns64be = (r) => new yi(r);
  N.f32 = (r) => new gi(r);
  N.f32be = (r) => new mi(r);
  N.f64 = (r) => new bi(r);
  N.f64be = (r) => new wi(r);
  N.struct = (r, t, e) => new vi(r, t, e);
  N.bits = (r, t, e) => new go(r, t, e);
  N.seq = (r, t, e) => new xi(r, t, e);
  N.union = (r, t, e) => new yo(r, t, e);
  N.unionLayoutDiscriminator = (r, t) => new Zn(r, t);
  N.blob = (r, t) => new Si(r, t);
  N.cstr = (r) => new Ei(r);
  N.utf8 = (r, t) => new _i(r, t);
  N.constant = (r, t) => new Ai(r, t);
});
var Hc = We((Jn) => {
  "use strict";
  Object.defineProperty(Jn, "__esModule", { value: !0 });
  var Ri;
  function Pl(r) {
    {
      let t = Buffer.from(r);
      t.reverse();
      let e = t.toString("hex");
      return e.length === 0 ? BigInt(0) : BigInt(`0x${e}`);
    }
    return Ri.toBigInt(r, !1);
  }
  Jn.toBigIntLE = Pl;
  function Cl(r) {
    {
      let t = r.toString("hex");
      return t.length === 0 ? BigInt(0) : BigInt(`0x${t}`);
    }
    return Ri.toBigInt(r, !0);
  }
  Jn.toBigIntBE = Cl;
  function Ul(r, t) {
    {
      let e = r.toString(16),
        n = Buffer.from(e.padStart(t * 2, "0").slice(0, t * 2), "hex");
      return n.reverse(), n;
    }
    return Ri.fromBigInt(r, Buffer.allocUnsafe(t), !1);
  }
  Jn.toBufferLE = Ul;
  function Ol(r, t) {
    {
      let e = r.toString(16);
      return Buffer.from(e.padStart(t * 2, "0").slice(0, t * 2), "hex");
    }
    return Ri.fromBigInt(r, Buffer.allocUnsafe(t), !0);
  }
  Jn.toBufferBE = Ol;
});
function xo() {
  if (
    !Ci &&
    ((Ci =
      (typeof crypto < "u" &&
        crypto.getRandomValues &&
        crypto.getRandomValues.bind(crypto)) ||
      (typeof msCrypto < "u" &&
        typeof msCrypto.getRandomValues == "function" &&
        msCrypto.getRandomValues.bind(msCrypto))),
    !Ci)
  )
    throw new Error(
      "crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported"
    );
  return Ci(Dl);
}
var Ci,
  Dl,
  Gs = sr(() => {
    Dl = new Uint8Array(16);
  });
var Yc,
  Zc = sr(() => {
    Yc =
      /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
  });
function Wl(r) {
  return typeof r == "string" && Yc.test(r);
}
var fn,
  vo = sr(() => {
    Zc();
    fn = Wl;
  });
function Hl(r) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0,
    e = (
      Ye[r[t + 0]] +
      Ye[r[t + 1]] +
      Ye[r[t + 2]] +
      Ye[r[t + 3]] +
      "-" +
      Ye[r[t + 4]] +
      Ye[r[t + 5]] +
      "-" +
      Ye[r[t + 6]] +
      Ye[r[t + 7]] +
      "-" +
      Ye[r[t + 8]] +
      Ye[r[t + 9]] +
      "-" +
      Ye[r[t + 10]] +
      Ye[r[t + 11]] +
      Ye[r[t + 12]] +
      Ye[r[t + 13]] +
      Ye[r[t + 14]] +
      Ye[r[t + 15]]
    ).toLowerCase();
  if (!fn(e)) throw TypeError("Stringified UUID is invalid");
  return e;
}
var Ye,
  Ui,
  un,
  ko = sr(() => {
    vo();
    Ye = [];
    for (Ui = 0; Ui < 256; ++Ui) Ye.push((Ui + 256).toString(16).substr(1));
    un = Hl;
  });
function $l(r, t, e) {
  var n = (t && e) || 0,
    o = t || new Array(16);
  r = r || {};
  var i = r.node || Xc,
    s = r.clockseq !== void 0 ? r.clockseq : Ys;
  if (i == null || s == null) {
    var d = r.random || (r.rng || xo)();
    i == null && (i = Xc = [d[0] | 1, d[1], d[2], d[3], d[4], d[5]]),
      s == null && (s = Ys = ((d[6] << 8) | d[7]) & 16383);
  }
  var p = r.msecs !== void 0 ? r.msecs : Date.now(),
    S = r.nsecs !== void 0 ? r.nsecs : Xs + 1,
    k = p - Zs + (S - Xs) / 1e4;
  if (
    (k < 0 && r.clockseq === void 0 && (s = (s + 1) & 16383),
    (k < 0 || p > Zs) && r.nsecs === void 0 && (S = 0),
    S >= 1e4)
  )
    throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
  (Zs = p), (Xs = S), (Ys = s), (p += 122192928e5);
  var _ = ((p & 268435455) * 1e4 + S) % 4294967296;
  (o[n++] = (_ >>> 24) & 255),
    (o[n++] = (_ >>> 16) & 255),
    (o[n++] = (_ >>> 8) & 255),
    (o[n++] = _ & 255);
  var P = ((p / 4294967296) * 1e4) & 268435455;
  (o[n++] = (P >>> 8) & 255),
    (o[n++] = P & 255),
    (o[n++] = ((P >>> 24) & 15) | 16),
    (o[n++] = (P >>> 16) & 255),
    (o[n++] = (s >>> 8) | 128),
    (o[n++] = s & 255);
  for (var M = 0; M < 6; ++M) o[n + M] = i[M];
  return t || un(o);
}
var Xc,
  Ys,
  Zs,
  Xs,
  Jc,
  Qc = sr(() => {
    Gs();
    ko();
    (Zs = 0), (Xs = 0);
    Jc = $l;
  });
function Vl(r) {
  if (!fn(r)) throw TypeError("Invalid UUID");
  var t,
    e = new Uint8Array(16);
  return (
    (e[0] = (t = parseInt(r.slice(0, 8), 16)) >>> 24),
    (e[1] = (t >>> 16) & 255),
    (e[2] = (t >>> 8) & 255),
    (e[3] = t & 255),
    (e[4] = (t = parseInt(r.slice(9, 13), 16)) >>> 8),
    (e[5] = t & 255),
    (e[6] = (t = parseInt(r.slice(14, 18), 16)) >>> 8),
    (e[7] = t & 255),
    (e[8] = (t = parseInt(r.slice(19, 23), 16)) >>> 8),
    (e[9] = t & 255),
    (e[10] = ((t = parseInt(r.slice(24, 36), 16)) / 1099511627776) & 255),
    (e[11] = (t / 4294967296) & 255),
    (e[12] = (t >>> 24) & 255),
    (e[13] = (t >>> 16) & 255),
    (e[14] = (t >>> 8) & 255),
    (e[15] = t & 255),
    e
  );
}
var Oi,
  Js = sr(() => {
    vo();
    Oi = Vl;
  });
function jl(r) {
  r = unescape(encodeURIComponent(r));
  for (var t = [], e = 0; e < r.length; ++e) t.push(r.charCodeAt(e));
  return t;
}
function Ni(r, t, e) {
  function n(o, i, s, d) {
    if (
      (typeof o == "string" && (o = jl(o)),
      typeof i == "string" && (i = Oi(i)),
      i.length !== 16)
    )
      throw TypeError(
        "Namespace must be array-like (16 iterable integer values, 0-255)"
      );
    var p = new Uint8Array(16 + o.length);
    if (
      (p.set(i),
      p.set(o, i.length),
      (p = e(p)),
      (p[6] = (p[6] & 15) | t),
      (p[8] = (p[8] & 63) | 128),
      s)
    ) {
      d = d || 0;
      for (var S = 0; S < 16; ++S) s[d + S] = p[S];
      return s;
    }
    return un(p);
  }
  try {
    n.name = r;
  } catch {}
  return (n.DNS = Gl), (n.URL = Yl), n;
}
var Gl,
  Yl,
  Qs = sr(() => {
    ko();
    Js();
    (Gl = "6ba7b810-9dad-11d1-80b4-00c04fd430c8"),
      (Yl = "6ba7b811-9dad-11d1-80b4-00c04fd430c8");
  });
function Zl(r) {
  if (typeof r == "string") {
    var t = unescape(encodeURIComponent(r));
    r = new Uint8Array(t.length);
    for (var e = 0; e < t.length; ++e) r[e] = t.charCodeAt(e);
  }
  return Xl(Jl(Ql(r), r.length * 8));
}
function Xl(r) {
  for (
    var t = [], e = r.length * 32, n = "0123456789abcdef", o = 0;
    o < e;
    o += 8
  ) {
    var i = (r[o >> 5] >>> o % 32) & 255,
      s = parseInt(n.charAt((i >>> 4) & 15) + n.charAt(i & 15), 16);
    t.push(s);
  }
  return t;
}
function tf(r) {
  return (((r + 64) >>> 9) << 4) + 14 + 1;
}
function Jl(r, t) {
  (r[t >> 5] |= 128 << t % 32), (r[tf(t) - 1] = t);
  for (
    var e = 1732584193, n = -271733879, o = -1732584194, i = 271733878, s = 0;
    s < r.length;
    s += 16
  ) {
    var d = e,
      p = n,
      S = o,
      k = i;
    (e = er(e, n, o, i, r[s], 7, -680876936)),
      (i = er(i, e, n, o, r[s + 1], 12, -389564586)),
      (o = er(o, i, e, n, r[s + 2], 17, 606105819)),
      (n = er(n, o, i, e, r[s + 3], 22, -1044525330)),
      (e = er(e, n, o, i, r[s + 4], 7, -176418897)),
      (i = er(i, e, n, o, r[s + 5], 12, 1200080426)),
      (o = er(o, i, e, n, r[s + 6], 17, -1473231341)),
      (n = er(n, o, i, e, r[s + 7], 22, -45705983)),
      (e = er(e, n, o, i, r[s + 8], 7, 1770035416)),
      (i = er(i, e, n, o, r[s + 9], 12, -1958414417)),
      (o = er(o, i, e, n, r[s + 10], 17, -42063)),
      (n = er(n, o, i, e, r[s + 11], 22, -1990404162)),
      (e = er(e, n, o, i, r[s + 12], 7, 1804603682)),
      (i = er(i, e, n, o, r[s + 13], 12, -40341101)),
      (o = er(o, i, e, n, r[s + 14], 17, -1502002290)),
      (n = er(n, o, i, e, r[s + 15], 22, 1236535329)),
      (e = rr(e, n, o, i, r[s + 1], 5, -165796510)),
      (i = rr(i, e, n, o, r[s + 6], 9, -1069501632)),
      (o = rr(o, i, e, n, r[s + 11], 14, 643717713)),
      (n = rr(n, o, i, e, r[s], 20, -373897302)),
      (e = rr(e, n, o, i, r[s + 5], 5, -701558691)),
      (i = rr(i, e, n, o, r[s + 10], 9, 38016083)),
      (o = rr(o, i, e, n, r[s + 15], 14, -660478335)),
      (n = rr(n, o, i, e, r[s + 4], 20, -405537848)),
      (e = rr(e, n, o, i, r[s + 9], 5, 568446438)),
      (i = rr(i, e, n, o, r[s + 14], 9, -1019803690)),
      (o = rr(o, i, e, n, r[s + 3], 14, -187363961)),
      (n = rr(n, o, i, e, r[s + 8], 20, 1163531501)),
      (e = rr(e, n, o, i, r[s + 13], 5, -1444681467)),
      (i = rr(i, e, n, o, r[s + 2], 9, -51403784)),
      (o = rr(o, i, e, n, r[s + 7], 14, 1735328473)),
      (n = rr(n, o, i, e, r[s + 12], 20, -1926607734)),
      (e = nr(e, n, o, i, r[s + 5], 4, -378558)),
      (i = nr(i, e, n, o, r[s + 8], 11, -2022574463)),
      (o = nr(o, i, e, n, r[s + 11], 16, 1839030562)),
      (n = nr(n, o, i, e, r[s + 14], 23, -35309556)),
      (e = nr(e, n, o, i, r[s + 1], 4, -1530992060)),
      (i = nr(i, e, n, o, r[s + 4], 11, 1272893353)),
      (o = nr(o, i, e, n, r[s + 7], 16, -155497632)),
      (n = nr(n, o, i, e, r[s + 10], 23, -1094730640)),
      (e = nr(e, n, o, i, r[s + 13], 4, 681279174)),
      (i = nr(i, e, n, o, r[s], 11, -358537222)),
      (o = nr(o, i, e, n, r[s + 3], 16, -722521979)),
      (n = nr(n, o, i, e, r[s + 6], 23, 76029189)),
      (e = nr(e, n, o, i, r[s + 9], 4, -640364487)),
      (i = nr(i, e, n, o, r[s + 12], 11, -421815835)),
      (o = nr(o, i, e, n, r[s + 15], 16, 530742520)),
      (n = nr(n, o, i, e, r[s + 2], 23, -995338651)),
      (e = or(e, n, o, i, r[s], 6, -198630844)),
      (i = or(i, e, n, o, r[s + 7], 10, 1126891415)),
      (o = or(o, i, e, n, r[s + 14], 15, -1416354905)),
      (n = or(n, o, i, e, r[s + 5], 21, -57434055)),
      (e = or(e, n, o, i, r[s + 12], 6, 1700485571)),
      (i = or(i, e, n, o, r[s + 3], 10, -1894986606)),
      (o = or(o, i, e, n, r[s + 10], 15, -1051523)),
      (n = or(n, o, i, e, r[s + 1], 21, -2054922799)),
      (e = or(e, n, o, i, r[s + 8], 6, 1873313359)),
      (i = or(i, e, n, o, r[s + 15], 10, -30611744)),
      (o = or(o, i, e, n, r[s + 6], 15, -1560198380)),
      (n = or(n, o, i, e, r[s + 13], 21, 1309151649)),
      (e = or(e, n, o, i, r[s + 4], 6, -145523070)),
      (i = or(i, e, n, o, r[s + 11], 10, -1120210379)),
      (o = or(o, i, e, n, r[s + 2], 15, 718787259)),
      (n = or(n, o, i, e, r[s + 9], 21, -343485551)),
      (e = hn(e, d)),
      (n = hn(n, p)),
      (o = hn(o, S)),
      (i = hn(i, k));
  }
  return [e, n, o, i];
}
function Ql(r) {
  if (r.length === 0) return [];
  for (var t = r.length * 8, e = new Uint32Array(tf(t)), n = 0; n < t; n += 8)
    e[n >> 5] |= (r[n / 8] & 255) << n % 32;
  return e;
}
function hn(r, t) {
  var e = (r & 65535) + (t & 65535),
    n = (r >> 16) + (t >> 16) + (e >> 16);
  return (n << 16) | (e & 65535);
}
function t0(r, t) {
  return (r << t) | (r >>> (32 - t));
}
function zi(r, t, e, n, o, i) {
  return hn(t0(hn(hn(t, r), hn(n, i)), o), e);
}
function er(r, t, e, n, o, i, s) {
  return zi((t & e) | (~t & n), r, t, o, i, s);
}
function rr(r, t, e, n, o, i, s) {
  return zi((t & n) | (e & ~n), r, t, o, i, s);
}
function nr(r, t, e, n, o, i, s) {
  return zi(t ^ e ^ n, r, t, o, i, s);
}
function or(r, t, e, n, o, i, s) {
  return zi(e ^ (t | ~n), r, t, o, i, s);
}
var ef,
  rf = sr(() => {
    ef = Zl;
  });
var e0,
  nf,
  of = sr(() => {
    Qs();
    rf();
    (e0 = Ni("v3", 48, ef)), (nf = e0);
  });
function r0(r, t, e) {
  r = r || {};
  var n = r.random || (r.rng || xo)();
  if (((n[6] = (n[6] & 15) | 64), (n[8] = (n[8] & 63) | 128), t)) {
    e = e || 0;
    for (var o = 0; o < 16; ++o) t[e + o] = n[o];
    return t;
  }
  return un(n);
}
var sf,
  af = sr(() => {
    Gs();
    ko();
    sf = r0;
  });
function n0(r, t, e, n) {
  switch (r) {
    case 0:
      return (t & e) ^ (~t & n);
    case 1:
      return t ^ e ^ n;
    case 2:
      return (t & e) ^ (t & n) ^ (e & n);
    case 3:
      return t ^ e ^ n;
  }
}
function ta(r, t) {
  return (r << t) | (r >>> (32 - t));
}
function o0(r) {
  var t = [1518500249, 1859775393, 2400959708, 3395469782],
    e = [1732584193, 4023233417, 2562383102, 271733878, 3285377520];
  if (typeof r == "string") {
    var n = unescape(encodeURIComponent(r));
    r = [];
    for (var o = 0; o < n.length; ++o) r.push(n.charCodeAt(o));
  } else Array.isArray(r) || (r = Array.prototype.slice.call(r));
  r.push(128);
  for (
    var i = r.length / 4 + 2, s = Math.ceil(i / 16), d = new Array(s), p = 0;
    p < s;
    ++p
  ) {
    for (var S = new Uint32Array(16), k = 0; k < 16; ++k)
      S[k] =
        (r[p * 64 + k * 4] << 24) |
        (r[p * 64 + k * 4 + 1] << 16) |
        (r[p * 64 + k * 4 + 2] << 8) |
        r[p * 64 + k * 4 + 3];
    d[p] = S;
  }
  (d[s - 1][14] = ((r.length - 1) * 8) / Math.pow(2, 32)),
    (d[s - 1][14] = Math.floor(d[s - 1][14])),
    (d[s - 1][15] = ((r.length - 1) * 8) & 4294967295);
  for (var _ = 0; _ < s; ++_) {
    for (var P = new Uint32Array(80), M = 0; M < 16; ++M) P[M] = d[_][M];
    for (var X = 16; X < 80; ++X)
      P[X] = ta(P[X - 3] ^ P[X - 8] ^ P[X - 14] ^ P[X - 16], 1);
    for (
      var U = e[0], T = e[1], H = e[2], J = e[3], D = e[4], Q = 0;
      Q < 80;
      ++Q
    ) {
      var at = Math.floor(Q / 20),
        rt = (ta(U, 5) + n0(at, T, H, J) + D + t[at] + P[Q]) >>> 0;
      (D = J), (J = H), (H = ta(T, 30) >>> 0), (T = U), (U = rt);
    }
    (e[0] = (e[0] + U) >>> 0),
      (e[1] = (e[1] + T) >>> 0),
      (e[2] = (e[2] + H) >>> 0),
      (e[3] = (e[3] + J) >>> 0),
      (e[4] = (e[4] + D) >>> 0);
  }
  return [
    (e[0] >> 24) & 255,
    (e[0] >> 16) & 255,
    (e[0] >> 8) & 255,
    e[0] & 255,
    (e[1] >> 24) & 255,
    (e[1] >> 16) & 255,
    (e[1] >> 8) & 255,
    e[1] & 255,
    (e[2] >> 24) & 255,
    (e[2] >> 16) & 255,
    (e[2] >> 8) & 255,
    e[2] & 255,
    (e[3] >> 24) & 255,
    (e[3] >> 16) & 255,
    (e[3] >> 8) & 255,
    e[3] & 255,
    (e[4] >> 24) & 255,
    (e[4] >> 16) & 255,
    (e[4] >> 8) & 255,
    e[4] & 255,
  ];
}
var cf,
  ff = sr(() => {
    cf = o0;
  });
var i0,
  uf,
  hf = sr(() => {
    Qs();
    ff();
    (i0 = Ni("v5", 80, cf)), (uf = i0);
  });
var lf,
  df = sr(() => {
    lf = "00000000-0000-0000-0000-000000000000";
  });
function s0(r) {
  if (!fn(r)) throw TypeError("Invalid UUID");
  return parseInt(r.substr(14, 1), 16);
}
var pf,
  yf = sr(() => {
    vo();
    pf = s0;
  });
var ea = {};
Ca(ea, {
  NIL: () => lf,
  parse: () => Oi,
  stringify: () => un,
  v1: () => Jc,
  v3: () => nf,
  v4: () => sf,
  v5: () => uf,
  validate: () => fn,
  version: () => pf,
});
var ra = sr(() => {
  Qc();
  of();
  af();
  hf();
  df();
  yf();
  vo();
  ko();
  Js();
});
var mf = We((hy, gf) => {
  "use strict";
  var a0 = (ra(), Oa(ea)).v4,
    c0 = function (r, t, e, n) {
      if (typeof r != "string") throw new TypeError(r + " must be a string");
      n = n || {};
      let o = typeof n.version == "number" ? n.version : 2;
      if (o !== 1 && o !== 2) throw new TypeError(o + " must be 1 or 2");
      let i = { method: r };
      if ((o === 2 && (i.jsonrpc = "2.0"), t)) {
        if (typeof t != "object" && !Array.isArray(t))
          throw new TypeError(t + " must be an object, array or omitted");
        i.params = t;
      }
      if (typeof e > "u") {
        let s =
          typeof n.generator == "function"
            ? n.generator
            : function () {
                return a0();
              };
        i.id = s(i, n);
      } else
        o === 2 && e === null
          ? n.notificationIdNull && (i.id = null)
          : (i.id = e);
      return i;
    };
  gf.exports = c0;
});
var wf = We((ly, bf) => {
  "use strict";
  var f0 = (ra(), Oa(ea)).v4,
    u0 = mf(),
    Bo = function (r, t) {
      if (!(this instanceof Bo)) return new Bo(r, t);
      t || (t = {}),
        (this.options = {
          reviver: typeof t.reviver < "u" ? t.reviver : null,
          replacer: typeof t.replacer < "u" ? t.replacer : null,
          generator:
            typeof t.generator < "u"
              ? t.generator
              : function () {
                  return f0();
                },
          version: typeof t.version < "u" ? t.version : 2,
          notificationIdNull:
            typeof t.notificationIdNull == "boolean"
              ? t.notificationIdNull
              : !1,
        }),
        (this.callServer = r);
    };
  bf.exports = Bo;
  Bo.prototype.request = function (r, t, e, n) {
    let o = this,
      i = null,
      s = Array.isArray(r) && typeof t == "function";
    if (this.options.version === 1 && s)
      throw new TypeError("JSON-RPC 1.0 does not support batching");
    if (s || (!s && r && typeof r == "object" && typeof t == "function"))
      (n = t), (i = r);
    else {
      typeof e == "function" && ((n = e), (e = void 0));
      let S = typeof n == "function";
      try {
        i = u0(r, t, e, {
          generator: this.options.generator,
          version: this.options.version,
          notificationIdNull: this.options.notificationIdNull,
        });
      } catch (k) {
        if (S) return n(k);
        throw k;
      }
      if (!S) return i;
    }
    let p;
    try {
      p = JSON.stringify(i, this.options.replacer);
    } catch (S) {
      return n(S);
    }
    return (
      this.callServer(p, function (S, k) {
        o._parseResponse(S, k, n);
      }),
      i
    );
  };
  Bo.prototype._parseResponse = function (r, t, e) {
    if (r) {
      e(r);
      return;
    }
    if (!t) return e();
    let n;
    try {
      n = JSON.parse(t, this.options.reviver);
    } catch (o) {
      return e(o);
    }
    if (e.length === 3)
      if (Array.isArray(n)) {
        let o = function (s) {
            return typeof s.error < "u";
          },
          i = function (s) {
            return !o(s);
          };
        return e(null, n.filter(o), n.filter(i));
      } else return e(null, n.error, n.result);
    e(null, n);
  };
});
var vf = We((dy, na) => {
  "use strict";
  var h0 = Object.prototype.hasOwnProperty,
    cr = "~";
  function So() {}
  Object.create &&
    ((So.prototype = Object.create(null)), new So().__proto__ || (cr = !1));
  function l0(r, t, e) {
    (this.fn = r), (this.context = t), (this.once = e || !1);
  }
  function xf(r, t, e, n, o) {
    if (typeof e != "function")
      throw new TypeError("The listener must be a function");
    var i = new l0(e, n || r, o),
      s = cr ? cr + t : t;
    return (
      r._events[s]
        ? r._events[s].fn
          ? (r._events[s] = [r._events[s], i])
          : r._events[s].push(i)
        : ((r._events[s] = i), r._eventsCount++),
      r
    );
  }
  function Fi(r, t) {
    --r._eventsCount === 0 ? (r._events = new So()) : delete r._events[t];
  }
  function ir() {
    (this._events = new So()), (this._eventsCount = 0);
  }
  ir.prototype.eventNames = function () {
    var t = [],
      e,
      n;
    if (this._eventsCount === 0) return t;
    for (n in (e = this._events)) h0.call(e, n) && t.push(cr ? n.slice(1) : n);
    return Object.getOwnPropertySymbols
      ? t.concat(Object.getOwnPropertySymbols(e))
      : t;
  };
  ir.prototype.listeners = function (t) {
    var e = cr ? cr + t : t,
      n = this._events[e];
    if (!n) return [];
    if (n.fn) return [n.fn];
    for (var o = 0, i = n.length, s = new Array(i); o < i; o++) s[o] = n[o].fn;
    return s;
  };
  ir.prototype.listenerCount = function (t) {
    var e = cr ? cr + t : t,
      n = this._events[e];
    return n ? (n.fn ? 1 : n.length) : 0;
  };
  ir.prototype.emit = function (t, e, n, o, i, s) {
    var d = cr ? cr + t : t;
    if (!this._events[d]) return !1;
    var p = this._events[d],
      S = arguments.length,
      k,
      _;
    if (p.fn) {
      switch ((p.once && this.removeListener(t, p.fn, void 0, !0), S)) {
        case 1:
          return p.fn.call(p.context), !0;
        case 2:
          return p.fn.call(p.context, e), !0;
        case 3:
          return p.fn.call(p.context, e, n), !0;
        case 4:
          return p.fn.call(p.context, e, n, o), !0;
        case 5:
          return p.fn.call(p.context, e, n, o, i), !0;
        case 6:
          return p.fn.call(p.context, e, n, o, i, s), !0;
      }
      for (_ = 1, k = new Array(S - 1); _ < S; _++) k[_ - 1] = arguments[_];
      p.fn.apply(p.context, k);
    } else {
      var P = p.length,
        M;
      for (_ = 0; _ < P; _++)
        switch ((p[_].once && this.removeListener(t, p[_].fn, void 0, !0), S)) {
          case 1:
            p[_].fn.call(p[_].context);
            break;
          case 2:
            p[_].fn.call(p[_].context, e);
            break;
          case 3:
            p[_].fn.call(p[_].context, e, n);
            break;
          case 4:
            p[_].fn.call(p[_].context, e, n, o);
            break;
          default:
            if (!k)
              for (M = 1, k = new Array(S - 1); M < S; M++)
                k[M - 1] = arguments[M];
            p[_].fn.apply(p[_].context, k);
        }
    }
    return !0;
  };
  ir.prototype.on = function (t, e, n) {
    return xf(this, t, e, n, !1);
  };
  ir.prototype.once = function (t, e, n) {
    return xf(this, t, e, n, !0);
  };
  ir.prototype.removeListener = function (t, e, n, o) {
    var i = cr ? cr + t : t;
    if (!this._events[i]) return this;
    if (!e) return Fi(this, i), this;
    var s = this._events[i];
    if (s.fn)
      s.fn === e && (!o || s.once) && (!n || s.context === n) && Fi(this, i);
    else {
      for (var d = 0, p = [], S = s.length; d < S; d++)
        (s[d].fn !== e || (o && !s[d].once) || (n && s[d].context !== n)) &&
          p.push(s[d]);
      p.length ? (this._events[i] = p.length === 1 ? p[0] : p) : Fi(this, i);
    }
    return this;
  };
  ir.prototype.removeAllListeners = function (t) {
    var e;
    return (
      t
        ? ((e = cr ? cr + t : t), this._events[e] && Fi(this, e))
        : ((this._events = new So()), (this._eventsCount = 0)),
      this
    );
  };
  ir.prototype.off = ir.prototype.removeListener;
  ir.prototype.addListener = ir.prototype.on;
  ir.prefixed = cr;
  ir.EventEmitter = ir;
  typeof na < "u" && (na.exports = ir);
});
var bu = We(() => {});
var wu = We((kg, ts) => {
  (function (r) {
    "use strict";
    var t = function (h) {
        var m,
          g = new Float64Array(16);
        if (h) for (m = 0; m < h.length; m++) g[m] = h[m];
        return g;
      },
      e = function () {
        throw new Error("no PRNG");
      },
      n = new Uint8Array(16),
      o = new Uint8Array(32);
    o[0] = 9;
    var i = t(),
      s = t([1]),
      d = t([56129, 1]),
      p = t([
        30883, 4953, 19914, 30187, 55467, 16705, 2637, 112, 59544, 30585, 16505,
        36039, 65139, 11119, 27886, 20995,
      ]),
      S = t([
        61785, 9906, 39828, 60374, 45398, 33411, 5274, 224, 53552, 61171, 33010,
        6542, 64743, 22239, 55772, 9222,
      ]),
      k = t([
        54554, 36645, 11616, 51542, 42930, 38181, 51040, 26924, 56412, 64982,
        57905, 49316, 21502, 52590, 14035, 8553,
      ]),
      _ = t([
        26200, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214,
        26214, 26214, 26214, 26214, 26214, 26214,
      ]),
      P = t([
        41136, 18958, 6951, 50414, 58488, 44335, 6150, 12099, 55207, 15867, 153,
        11085, 57099, 20417, 9344, 11139,
      ]);
    function M(h, m, g, c) {
      (h[m] = (g >> 24) & 255),
        (h[m + 1] = (g >> 16) & 255),
        (h[m + 2] = (g >> 8) & 255),
        (h[m + 3] = g & 255),
        (h[m + 4] = (c >> 24) & 255),
        (h[m + 5] = (c >> 16) & 255),
        (h[m + 6] = (c >> 8) & 255),
        (h[m + 7] = c & 255);
    }
    function X(h, m, g, c, w) {
      var R,
        C = 0;
      for (R = 0; R < w; R++) C |= h[m + R] ^ g[c + R];
      return (1 & ((C - 1) >>> 8)) - 1;
    }
    function U(h, m, g, c) {
      return X(h, m, g, c, 16);
    }
    function T(h, m, g, c) {
      return X(h, m, g, c, 32);
    }
    function H(h, m, g, c) {
      for (
        var w =
            (c[0] & 255) |
            ((c[1] & 255) << 8) |
            ((c[2] & 255) << 16) |
            ((c[3] & 255) << 24),
          R =
            (g[0] & 255) |
            ((g[1] & 255) << 8) |
            ((g[2] & 255) << 16) |
            ((g[3] & 255) << 24),
          C =
            (g[4] & 255) |
            ((g[5] & 255) << 8) |
            ((g[6] & 255) << 16) |
            ((g[7] & 255) << 24),
          K =
            (g[8] & 255) |
            ((g[9] & 255) << 8) |
            ((g[10] & 255) << 16) |
            ((g[11] & 255) << 24),
          j =
            (g[12] & 255) |
            ((g[13] & 255) << 8) |
            ((g[14] & 255) << 16) |
            ((g[15] & 255) << 24),
          gt =
            (c[4] & 255) |
            ((c[5] & 255) << 8) |
            ((c[6] & 255) << 16) |
            ((c[7] & 255) << 24),
          et =
            (m[0] & 255) |
            ((m[1] & 255) << 8) |
            ((m[2] & 255) << 16) |
            ((m[3] & 255) << 24),
          kt =
            (m[4] & 255) |
            ((m[5] & 255) << 8) |
            ((m[6] & 255) << 16) |
            ((m[7] & 255) << 24),
          ft =
            (m[8] & 255) |
            ((m[9] & 255) << 8) |
            ((m[10] & 255) << 16) |
            ((m[11] & 255) << 24),
          _t =
            (m[12] & 255) |
            ((m[13] & 255) << 8) |
            ((m[14] & 255) << 16) |
            ((m[15] & 255) << 24),
          At =
            (c[8] & 255) |
            ((c[9] & 255) << 8) |
            ((c[10] & 255) << 16) |
            ((c[11] & 255) << 24),
          Ut =
            (g[16] & 255) |
            ((g[17] & 255) << 8) |
            ((g[18] & 255) << 16) |
            ((g[19] & 255) << 24),
          Pt =
            (g[20] & 255) |
            ((g[21] & 255) << 8) |
            ((g[22] & 255) << 16) |
            ((g[23] & 255) << 24),
          It =
            (g[24] & 255) |
            ((g[25] & 255) << 8) |
            ((g[26] & 255) << 16) |
            ((g[27] & 255) << 24),
          Mt =
            (g[28] & 255) |
            ((g[29] & 255) << 8) |
            ((g[30] & 255) << 16) |
            ((g[31] & 255) << 24),
          Lt =
            (c[12] & 255) |
            ((c[13] & 255) << 8) |
            ((c[14] & 255) << 16) |
            ((c[15] & 255) << 24),
          ht = w,
          bt = R,
          ct = C,
          pt = K,
          yt = j,
          st = gt,
          z = et,
          F = kt,
          G = ft,
          $ = _t,
          V = At,
          tt = Ut,
          Bt = Pt,
          Nt = It,
          Ft = Mt,
          zt = Lt,
          A,
          Dt = 0;
        Dt < 20;
        Dt += 2
      )
        (A = (ht + Bt) | 0),
          (yt ^= (A << 7) | (A >>> 25)),
          (A = (yt + ht) | 0),
          (G ^= (A << 9) | (A >>> 23)),
          (A = (G + yt) | 0),
          (Bt ^= (A << 13) | (A >>> 19)),
          (A = (Bt + G) | 0),
          (ht ^= (A << 18) | (A >>> 14)),
          (A = (st + bt) | 0),
          ($ ^= (A << 7) | (A >>> 25)),
          (A = ($ + st) | 0),
          (Nt ^= (A << 9) | (A >>> 23)),
          (A = (Nt + $) | 0),
          (bt ^= (A << 13) | (A >>> 19)),
          (A = (bt + Nt) | 0),
          (st ^= (A << 18) | (A >>> 14)),
          (A = (V + z) | 0),
          (Ft ^= (A << 7) | (A >>> 25)),
          (A = (Ft + V) | 0),
          (ct ^= (A << 9) | (A >>> 23)),
          (A = (ct + Ft) | 0),
          (z ^= (A << 13) | (A >>> 19)),
          (A = (z + ct) | 0),
          (V ^= (A << 18) | (A >>> 14)),
          (A = (zt + tt) | 0),
          (pt ^= (A << 7) | (A >>> 25)),
          (A = (pt + zt) | 0),
          (F ^= (A << 9) | (A >>> 23)),
          (A = (F + pt) | 0),
          (tt ^= (A << 13) | (A >>> 19)),
          (A = (tt + F) | 0),
          (zt ^= (A << 18) | (A >>> 14)),
          (A = (ht + pt) | 0),
          (bt ^= (A << 7) | (A >>> 25)),
          (A = (bt + ht) | 0),
          (ct ^= (A << 9) | (A >>> 23)),
          (A = (ct + bt) | 0),
          (pt ^= (A << 13) | (A >>> 19)),
          (A = (pt + ct) | 0),
          (ht ^= (A << 18) | (A >>> 14)),
          (A = (st + yt) | 0),
          (z ^= (A << 7) | (A >>> 25)),
          (A = (z + st) | 0),
          (F ^= (A << 9) | (A >>> 23)),
          (A = (F + z) | 0),
          (yt ^= (A << 13) | (A >>> 19)),
          (A = (yt + F) | 0),
          (st ^= (A << 18) | (A >>> 14)),
          (A = (V + $) | 0),
          (tt ^= (A << 7) | (A >>> 25)),
          (A = (tt + V) | 0),
          (G ^= (A << 9) | (A >>> 23)),
          (A = (G + tt) | 0),
          ($ ^= (A << 13) | (A >>> 19)),
          (A = ($ + G) | 0),
          (V ^= (A << 18) | (A >>> 14)),
          (A = (zt + Ft) | 0),
          (Bt ^= (A << 7) | (A >>> 25)),
          (A = (Bt + zt) | 0),
          (Nt ^= (A << 9) | (A >>> 23)),
          (A = (Nt + Bt) | 0),
          (Ft ^= (A << 13) | (A >>> 19)),
          (A = (Ft + Nt) | 0),
          (zt ^= (A << 18) | (A >>> 14));
      (ht = (ht + w) | 0),
        (bt = (bt + R) | 0),
        (ct = (ct + C) | 0),
        (pt = (pt + K) | 0),
        (yt = (yt + j) | 0),
        (st = (st + gt) | 0),
        (z = (z + et) | 0),
        (F = (F + kt) | 0),
        (G = (G + ft) | 0),
        ($ = ($ + _t) | 0),
        (V = (V + At) | 0),
        (tt = (tt + Ut) | 0),
        (Bt = (Bt + Pt) | 0),
        (Nt = (Nt + It) | 0),
        (Ft = (Ft + Mt) | 0),
        (zt = (zt + Lt) | 0),
        (h[0] = (ht >>> 0) & 255),
        (h[1] = (ht >>> 8) & 255),
        (h[2] = (ht >>> 16) & 255),
        (h[3] = (ht >>> 24) & 255),
        (h[4] = (bt >>> 0) & 255),
        (h[5] = (bt >>> 8) & 255),
        (h[6] = (bt >>> 16) & 255),
        (h[7] = (bt >>> 24) & 255),
        (h[8] = (ct >>> 0) & 255),
        (h[9] = (ct >>> 8) & 255),
        (h[10] = (ct >>> 16) & 255),
        (h[11] = (ct >>> 24) & 255),
        (h[12] = (pt >>> 0) & 255),
        (h[13] = (pt >>> 8) & 255),
        (h[14] = (pt >>> 16) & 255),
        (h[15] = (pt >>> 24) & 255),
        (h[16] = (yt >>> 0) & 255),
        (h[17] = (yt >>> 8) & 255),
        (h[18] = (yt >>> 16) & 255),
        (h[19] = (yt >>> 24) & 255),
        (h[20] = (st >>> 0) & 255),
        (h[21] = (st >>> 8) & 255),
        (h[22] = (st >>> 16) & 255),
        (h[23] = (st >>> 24) & 255),
        (h[24] = (z >>> 0) & 255),
        (h[25] = (z >>> 8) & 255),
        (h[26] = (z >>> 16) & 255),
        (h[27] = (z >>> 24) & 255),
        (h[28] = (F >>> 0) & 255),
        (h[29] = (F >>> 8) & 255),
        (h[30] = (F >>> 16) & 255),
        (h[31] = (F >>> 24) & 255),
        (h[32] = (G >>> 0) & 255),
        (h[33] = (G >>> 8) & 255),
        (h[34] = (G >>> 16) & 255),
        (h[35] = (G >>> 24) & 255),
        (h[36] = ($ >>> 0) & 255),
        (h[37] = ($ >>> 8) & 255),
        (h[38] = ($ >>> 16) & 255),
        (h[39] = ($ >>> 24) & 255),
        (h[40] = (V >>> 0) & 255),
        (h[41] = (V >>> 8) & 255),
        (h[42] = (V >>> 16) & 255),
        (h[43] = (V >>> 24) & 255),
        (h[44] = (tt >>> 0) & 255),
        (h[45] = (tt >>> 8) & 255),
        (h[46] = (tt >>> 16) & 255),
        (h[47] = (tt >>> 24) & 255),
        (h[48] = (Bt >>> 0) & 255),
        (h[49] = (Bt >>> 8) & 255),
        (h[50] = (Bt >>> 16) & 255),
        (h[51] = (Bt >>> 24) & 255),
        (h[52] = (Nt >>> 0) & 255),
        (h[53] = (Nt >>> 8) & 255),
        (h[54] = (Nt >>> 16) & 255),
        (h[55] = (Nt >>> 24) & 255),
        (h[56] = (Ft >>> 0) & 255),
        (h[57] = (Ft >>> 8) & 255),
        (h[58] = (Ft >>> 16) & 255),
        (h[59] = (Ft >>> 24) & 255),
        (h[60] = (zt >>> 0) & 255),
        (h[61] = (zt >>> 8) & 255),
        (h[62] = (zt >>> 16) & 255),
        (h[63] = (zt >>> 24) & 255);
    }
    function J(h, m, g, c) {
      for (
        var w =
            (c[0] & 255) |
            ((c[1] & 255) << 8) |
            ((c[2] & 255) << 16) |
            ((c[3] & 255) << 24),
          R =
            (g[0] & 255) |
            ((g[1] & 255) << 8) |
            ((g[2] & 255) << 16) |
            ((g[3] & 255) << 24),
          C =
            (g[4] & 255) |
            ((g[5] & 255) << 8) |
            ((g[6] & 255) << 16) |
            ((g[7] & 255) << 24),
          K =
            (g[8] & 255) |
            ((g[9] & 255) << 8) |
            ((g[10] & 255) << 16) |
            ((g[11] & 255) << 24),
          j =
            (g[12] & 255) |
            ((g[13] & 255) << 8) |
            ((g[14] & 255) << 16) |
            ((g[15] & 255) << 24),
          gt =
            (c[4] & 255) |
            ((c[5] & 255) << 8) |
            ((c[6] & 255) << 16) |
            ((c[7] & 255) << 24),
          et =
            (m[0] & 255) |
            ((m[1] & 255) << 8) |
            ((m[2] & 255) << 16) |
            ((m[3] & 255) << 24),
          kt =
            (m[4] & 255) |
            ((m[5] & 255) << 8) |
            ((m[6] & 255) << 16) |
            ((m[7] & 255) << 24),
          ft =
            (m[8] & 255) |
            ((m[9] & 255) << 8) |
            ((m[10] & 255) << 16) |
            ((m[11] & 255) << 24),
          _t =
            (m[12] & 255) |
            ((m[13] & 255) << 8) |
            ((m[14] & 255) << 16) |
            ((m[15] & 255) << 24),
          At =
            (c[8] & 255) |
            ((c[9] & 255) << 8) |
            ((c[10] & 255) << 16) |
            ((c[11] & 255) << 24),
          Ut =
            (g[16] & 255) |
            ((g[17] & 255) << 8) |
            ((g[18] & 255) << 16) |
            ((g[19] & 255) << 24),
          Pt =
            (g[20] & 255) |
            ((g[21] & 255) << 8) |
            ((g[22] & 255) << 16) |
            ((g[23] & 255) << 24),
          It =
            (g[24] & 255) |
            ((g[25] & 255) << 8) |
            ((g[26] & 255) << 16) |
            ((g[27] & 255) << 24),
          Mt =
            (g[28] & 255) |
            ((g[29] & 255) << 8) |
            ((g[30] & 255) << 16) |
            ((g[31] & 255) << 24),
          Lt =
            (c[12] & 255) |
            ((c[13] & 255) << 8) |
            ((c[14] & 255) << 16) |
            ((c[15] & 255) << 24),
          ht = w,
          bt = R,
          ct = C,
          pt = K,
          yt = j,
          st = gt,
          z = et,
          F = kt,
          G = ft,
          $ = _t,
          V = At,
          tt = Ut,
          Bt = Pt,
          Nt = It,
          Ft = Mt,
          zt = Lt,
          A,
          Dt = 0;
        Dt < 20;
        Dt += 2
      )
        (A = (ht + Bt) | 0),
          (yt ^= (A << 7) | (A >>> 25)),
          (A = (yt + ht) | 0),
          (G ^= (A << 9) | (A >>> 23)),
          (A = (G + yt) | 0),
          (Bt ^= (A << 13) | (A >>> 19)),
          (A = (Bt + G) | 0),
          (ht ^= (A << 18) | (A >>> 14)),
          (A = (st + bt) | 0),
          ($ ^= (A << 7) | (A >>> 25)),
          (A = ($ + st) | 0),
          (Nt ^= (A << 9) | (A >>> 23)),
          (A = (Nt + $) | 0),
          (bt ^= (A << 13) | (A >>> 19)),
          (A = (bt + Nt) | 0),
          (st ^= (A << 18) | (A >>> 14)),
          (A = (V + z) | 0),
          (Ft ^= (A << 7) | (A >>> 25)),
          (A = (Ft + V) | 0),
          (ct ^= (A << 9) | (A >>> 23)),
          (A = (ct + Ft) | 0),
          (z ^= (A << 13) | (A >>> 19)),
          (A = (z + ct) | 0),
          (V ^= (A << 18) | (A >>> 14)),
          (A = (zt + tt) | 0),
          (pt ^= (A << 7) | (A >>> 25)),
          (A = (pt + zt) | 0),
          (F ^= (A << 9) | (A >>> 23)),
          (A = (F + pt) | 0),
          (tt ^= (A << 13) | (A >>> 19)),
          (A = (tt + F) | 0),
          (zt ^= (A << 18) | (A >>> 14)),
          (A = (ht + pt) | 0),
          (bt ^= (A << 7) | (A >>> 25)),
          (A = (bt + ht) | 0),
          (ct ^= (A << 9) | (A >>> 23)),
          (A = (ct + bt) | 0),
          (pt ^= (A << 13) | (A >>> 19)),
          (A = (pt + ct) | 0),
          (ht ^= (A << 18) | (A >>> 14)),
          (A = (st + yt) | 0),
          (z ^= (A << 7) | (A >>> 25)),
          (A = (z + st) | 0),
          (F ^= (A << 9) | (A >>> 23)),
          (A = (F + z) | 0),
          (yt ^= (A << 13) | (A >>> 19)),
          (A = (yt + F) | 0),
          (st ^= (A << 18) | (A >>> 14)),
          (A = (V + $) | 0),
          (tt ^= (A << 7) | (A >>> 25)),
          (A = (tt + V) | 0),
          (G ^= (A << 9) | (A >>> 23)),
          (A = (G + tt) | 0),
          ($ ^= (A << 13) | (A >>> 19)),
          (A = ($ + G) | 0),
          (V ^= (A << 18) | (A >>> 14)),
          (A = (zt + Ft) | 0),
          (Bt ^= (A << 7) | (A >>> 25)),
          (A = (Bt + zt) | 0),
          (Nt ^= (A << 9) | (A >>> 23)),
          (A = (Nt + Bt) | 0),
          (Ft ^= (A << 13) | (A >>> 19)),
          (A = (Ft + Nt) | 0),
          (zt ^= (A << 18) | (A >>> 14));
      (h[0] = (ht >>> 0) & 255),
        (h[1] = (ht >>> 8) & 255),
        (h[2] = (ht >>> 16) & 255),
        (h[3] = (ht >>> 24) & 255),
        (h[4] = (st >>> 0) & 255),
        (h[5] = (st >>> 8) & 255),
        (h[6] = (st >>> 16) & 255),
        (h[7] = (st >>> 24) & 255),
        (h[8] = (V >>> 0) & 255),
        (h[9] = (V >>> 8) & 255),
        (h[10] = (V >>> 16) & 255),
        (h[11] = (V >>> 24) & 255),
        (h[12] = (zt >>> 0) & 255),
        (h[13] = (zt >>> 8) & 255),
        (h[14] = (zt >>> 16) & 255),
        (h[15] = (zt >>> 24) & 255),
        (h[16] = (z >>> 0) & 255),
        (h[17] = (z >>> 8) & 255),
        (h[18] = (z >>> 16) & 255),
        (h[19] = (z >>> 24) & 255),
        (h[20] = (F >>> 0) & 255),
        (h[21] = (F >>> 8) & 255),
        (h[22] = (F >>> 16) & 255),
        (h[23] = (F >>> 24) & 255),
        (h[24] = (G >>> 0) & 255),
        (h[25] = (G >>> 8) & 255),
        (h[26] = (G >>> 16) & 255),
        (h[27] = (G >>> 24) & 255),
        (h[28] = ($ >>> 0) & 255),
        (h[29] = ($ >>> 8) & 255),
        (h[30] = ($ >>> 16) & 255),
        (h[31] = ($ >>> 24) & 255);
    }
    function D(h, m, g, c) {
      H(h, m, g, c);
    }
    function Q(h, m, g, c) {
      J(h, m, g, c);
    }
    var at = new Uint8Array([
      101, 120, 112, 97, 110, 100, 32, 51, 50, 45, 98, 121, 116, 101, 32, 107,
    ]);
    function rt(h, m, g, c, w, R, C) {
      var K = new Uint8Array(16),
        j = new Uint8Array(64),
        gt,
        et;
      for (et = 0; et < 16; et++) K[et] = 0;
      for (et = 0; et < 8; et++) K[et] = R[et];
      for (; w >= 64; ) {
        for (D(j, K, C, at), et = 0; et < 64; et++)
          h[m + et] = g[c + et] ^ j[et];
        for (gt = 1, et = 8; et < 16; et++)
          (gt = (gt + (K[et] & 255)) | 0), (K[et] = gt & 255), (gt >>>= 8);
        (w -= 64), (m += 64), (c += 64);
      }
      if (w > 0)
        for (D(j, K, C, at), et = 0; et < w; et++)
          h[m + et] = g[c + et] ^ j[et];
      return 0;
    }
    function it(h, m, g, c, w) {
      var R = new Uint8Array(16),
        C = new Uint8Array(64),
        K,
        j;
      for (j = 0; j < 16; j++) R[j] = 0;
      for (j = 0; j < 8; j++) R[j] = c[j];
      for (; g >= 64; ) {
        for (D(C, R, w, at), j = 0; j < 64; j++) h[m + j] = C[j];
        for (K = 1, j = 8; j < 16; j++)
          (K = (K + (R[j] & 255)) | 0), (R[j] = K & 255), (K >>>= 8);
        (g -= 64), (m += 64);
      }
      if (g > 0) for (D(C, R, w, at), j = 0; j < g; j++) h[m + j] = C[j];
      return 0;
    }
    function ut(h, m, g, c, w) {
      var R = new Uint8Array(32);
      Q(R, c, w, at);
      for (var C = new Uint8Array(8), K = 0; K < 8; K++) C[K] = c[K + 16];
      return it(h, m, g, C, R);
    }
    function wt(h, m, g, c, w, R, C) {
      var K = new Uint8Array(32);
      Q(K, R, C, at);
      for (var j = new Uint8Array(8), gt = 0; gt < 8; gt++) j[gt] = R[gt + 16];
      return rt(h, m, g, c, w, j, K);
    }
    var re = function (h) {
      (this.buffer = new Uint8Array(16)),
        (this.r = new Uint16Array(10)),
        (this.h = new Uint16Array(10)),
        (this.pad = new Uint16Array(8)),
        (this.leftover = 0),
        (this.fin = 0);
      var m, g, c, w, R, C, K, j;
      (m = (h[0] & 255) | ((h[1] & 255) << 8)),
        (this.r[0] = m & 8191),
        (g = (h[2] & 255) | ((h[3] & 255) << 8)),
        (this.r[1] = ((m >>> 13) | (g << 3)) & 8191),
        (c = (h[4] & 255) | ((h[5] & 255) << 8)),
        (this.r[2] = ((g >>> 10) | (c << 6)) & 7939),
        (w = (h[6] & 255) | ((h[7] & 255) << 8)),
        (this.r[3] = ((c >>> 7) | (w << 9)) & 8191),
        (R = (h[8] & 255) | ((h[9] & 255) << 8)),
        (this.r[4] = ((w >>> 4) | (R << 12)) & 255),
        (this.r[5] = (R >>> 1) & 8190),
        (C = (h[10] & 255) | ((h[11] & 255) << 8)),
        (this.r[6] = ((R >>> 14) | (C << 2)) & 8191),
        (K = (h[12] & 255) | ((h[13] & 255) << 8)),
        (this.r[7] = ((C >>> 11) | (K << 5)) & 8065),
        (j = (h[14] & 255) | ((h[15] & 255) << 8)),
        (this.r[8] = ((K >>> 8) | (j << 8)) & 8191),
        (this.r[9] = (j >>> 5) & 127),
        (this.pad[0] = (h[16] & 255) | ((h[17] & 255) << 8)),
        (this.pad[1] = (h[18] & 255) | ((h[19] & 255) << 8)),
        (this.pad[2] = (h[20] & 255) | ((h[21] & 255) << 8)),
        (this.pad[3] = (h[22] & 255) | ((h[23] & 255) << 8)),
        (this.pad[4] = (h[24] & 255) | ((h[25] & 255) << 8)),
        (this.pad[5] = (h[26] & 255) | ((h[27] & 255) << 8)),
        (this.pad[6] = (h[28] & 255) | ((h[29] & 255) << 8)),
        (this.pad[7] = (h[30] & 255) | ((h[31] & 255) << 8));
    };
    (re.prototype.blocks = function (h, m, g) {
      for (
        var c = this.fin ? 0 : 2048,
          w,
          R,
          C,
          K,
          j,
          gt,
          et,
          kt,
          ft,
          _t,
          At,
          Ut,
          Pt,
          It,
          Mt,
          Lt,
          ht,
          bt,
          ct,
          pt = this.h[0],
          yt = this.h[1],
          st = this.h[2],
          z = this.h[3],
          F = this.h[4],
          G = this.h[5],
          $ = this.h[6],
          V = this.h[7],
          tt = this.h[8],
          Bt = this.h[9],
          Nt = this.r[0],
          Ft = this.r[1],
          zt = this.r[2],
          A = this.r[3],
          Dt = this.r[4],
          Gt = this.r[5],
          Yt = this.r[6],
          qt = this.r[7],
          $t = this.r[8],
          Vt = this.r[9];
        g >= 16;

      )
        (w = (h[m + 0] & 255) | ((h[m + 1] & 255) << 8)),
          (pt += w & 8191),
          (R = (h[m + 2] & 255) | ((h[m + 3] & 255) << 8)),
          (yt += ((w >>> 13) | (R << 3)) & 8191),
          (C = (h[m + 4] & 255) | ((h[m + 5] & 255) << 8)),
          (st += ((R >>> 10) | (C << 6)) & 8191),
          (K = (h[m + 6] & 255) | ((h[m + 7] & 255) << 8)),
          (z += ((C >>> 7) | (K << 9)) & 8191),
          (j = (h[m + 8] & 255) | ((h[m + 9] & 255) << 8)),
          (F += ((K >>> 4) | (j << 12)) & 8191),
          (G += (j >>> 1) & 8191),
          (gt = (h[m + 10] & 255) | ((h[m + 11] & 255) << 8)),
          ($ += ((j >>> 14) | (gt << 2)) & 8191),
          (et = (h[m + 12] & 255) | ((h[m + 13] & 255) << 8)),
          (V += ((gt >>> 11) | (et << 5)) & 8191),
          (kt = (h[m + 14] & 255) | ((h[m + 15] & 255) << 8)),
          (tt += ((et >>> 8) | (kt << 8)) & 8191),
          (Bt += (kt >>> 5) | c),
          (ft = 0),
          (_t = ft),
          (_t += pt * Nt),
          (_t += yt * (5 * Vt)),
          (_t += st * (5 * $t)),
          (_t += z * (5 * qt)),
          (_t += F * (5 * Yt)),
          (ft = _t >>> 13),
          (_t &= 8191),
          (_t += G * (5 * Gt)),
          (_t += $ * (5 * Dt)),
          (_t += V * (5 * A)),
          (_t += tt * (5 * zt)),
          (_t += Bt * (5 * Ft)),
          (ft += _t >>> 13),
          (_t &= 8191),
          (At = ft),
          (At += pt * Ft),
          (At += yt * Nt),
          (At += st * (5 * Vt)),
          (At += z * (5 * $t)),
          (At += F * (5 * qt)),
          (ft = At >>> 13),
          (At &= 8191),
          (At += G * (5 * Yt)),
          (At += $ * (5 * Gt)),
          (At += V * (5 * Dt)),
          (At += tt * (5 * A)),
          (At += Bt * (5 * zt)),
          (ft += At >>> 13),
          (At &= 8191),
          (Ut = ft),
          (Ut += pt * zt),
          (Ut += yt * Ft),
          (Ut += st * Nt),
          (Ut += z * (5 * Vt)),
          (Ut += F * (5 * $t)),
          (ft = Ut >>> 13),
          (Ut &= 8191),
          (Ut += G * (5 * qt)),
          (Ut += $ * (5 * Yt)),
          (Ut += V * (5 * Gt)),
          (Ut += tt * (5 * Dt)),
          (Ut += Bt * (5 * A)),
          (ft += Ut >>> 13),
          (Ut &= 8191),
          (Pt = ft),
          (Pt += pt * A),
          (Pt += yt * zt),
          (Pt += st * Ft),
          (Pt += z * Nt),
          (Pt += F * (5 * Vt)),
          (ft = Pt >>> 13),
          (Pt &= 8191),
          (Pt += G * (5 * $t)),
          (Pt += $ * (5 * qt)),
          (Pt += V * (5 * Yt)),
          (Pt += tt * (5 * Gt)),
          (Pt += Bt * (5 * Dt)),
          (ft += Pt >>> 13),
          (Pt &= 8191),
          (It = ft),
          (It += pt * Dt),
          (It += yt * A),
          (It += st * zt),
          (It += z * Ft),
          (It += F * Nt),
          (ft = It >>> 13),
          (It &= 8191),
          (It += G * (5 * Vt)),
          (It += $ * (5 * $t)),
          (It += V * (5 * qt)),
          (It += tt * (5 * Yt)),
          (It += Bt * (5 * Gt)),
          (ft += It >>> 13),
          (It &= 8191),
          (Mt = ft),
          (Mt += pt * Gt),
          (Mt += yt * Dt),
          (Mt += st * A),
          (Mt += z * zt),
          (Mt += F * Ft),
          (ft = Mt >>> 13),
          (Mt &= 8191),
          (Mt += G * Nt),
          (Mt += $ * (5 * Vt)),
          (Mt += V * (5 * $t)),
          (Mt += tt * (5 * qt)),
          (Mt += Bt * (5 * Yt)),
          (ft += Mt >>> 13),
          (Mt &= 8191),
          (Lt = ft),
          (Lt += pt * Yt),
          (Lt += yt * Gt),
          (Lt += st * Dt),
          (Lt += z * A),
          (Lt += F * zt),
          (ft = Lt >>> 13),
          (Lt &= 8191),
          (Lt += G * Ft),
          (Lt += $ * Nt),
          (Lt += V * (5 * Vt)),
          (Lt += tt * (5 * $t)),
          (Lt += Bt * (5 * qt)),
          (ft += Lt >>> 13),
          (Lt &= 8191),
          (ht = ft),
          (ht += pt * qt),
          (ht += yt * Yt),
          (ht += st * Gt),
          (ht += z * Dt),
          (ht += F * A),
          (ft = ht >>> 13),
          (ht &= 8191),
          (ht += G * zt),
          (ht += $ * Ft),
          (ht += V * Nt),
          (ht += tt * (5 * Vt)),
          (ht += Bt * (5 * $t)),
          (ft += ht >>> 13),
          (ht &= 8191),
          (bt = ft),
          (bt += pt * $t),
          (bt += yt * qt),
          (bt += st * Yt),
          (bt += z * Gt),
          (bt += F * Dt),
          (ft = bt >>> 13),
          (bt &= 8191),
          (bt += G * A),
          (bt += $ * zt),
          (bt += V * Ft),
          (bt += tt * Nt),
          (bt += Bt * (5 * Vt)),
          (ft += bt >>> 13),
          (bt &= 8191),
          (ct = ft),
          (ct += pt * Vt),
          (ct += yt * $t),
          (ct += st * qt),
          (ct += z * Yt),
          (ct += F * Gt),
          (ft = ct >>> 13),
          (ct &= 8191),
          (ct += G * Dt),
          (ct += $ * A),
          (ct += V * zt),
          (ct += tt * Ft),
          (ct += Bt * Nt),
          (ft += ct >>> 13),
          (ct &= 8191),
          (ft = ((ft << 2) + ft) | 0),
          (ft = (ft + _t) | 0),
          (_t = ft & 8191),
          (ft = ft >>> 13),
          (At += ft),
          (pt = _t),
          (yt = At),
          (st = Ut),
          (z = Pt),
          (F = It),
          (G = Mt),
          ($ = Lt),
          (V = ht),
          (tt = bt),
          (Bt = ct),
          (m += 16),
          (g -= 16);
      (this.h[0] = pt),
        (this.h[1] = yt),
        (this.h[2] = st),
        (this.h[3] = z),
        (this.h[4] = F),
        (this.h[5] = G),
        (this.h[6] = $),
        (this.h[7] = V),
        (this.h[8] = tt),
        (this.h[9] = Bt);
    }),
      (re.prototype.finish = function (h, m) {
        var g = new Uint16Array(10),
          c,
          w,
          R,
          C;
        if (this.leftover) {
          for (C = this.leftover, this.buffer[C++] = 1; C < 16; C++)
            this.buffer[C] = 0;
          (this.fin = 1), this.blocks(this.buffer, 0, 16);
        }
        for (c = this.h[1] >>> 13, this.h[1] &= 8191, C = 2; C < 10; C++)
          (this.h[C] += c), (c = this.h[C] >>> 13), (this.h[C] &= 8191);
        for (
          this.h[0] += c * 5,
            c = this.h[0] >>> 13,
            this.h[0] &= 8191,
            this.h[1] += c,
            c = this.h[1] >>> 13,
            this.h[1] &= 8191,
            this.h[2] += c,
            g[0] = this.h[0] + 5,
            c = g[0] >>> 13,
            g[0] &= 8191,
            C = 1;
          C < 10;
          C++
        )
          (g[C] = this.h[C] + c), (c = g[C] >>> 13), (g[C] &= 8191);
        for (g[9] -= 8192, w = (c ^ 1) - 1, C = 0; C < 10; C++) g[C] &= w;
        for (w = ~w, C = 0; C < 10; C++) this.h[C] = (this.h[C] & w) | g[C];
        for (
          this.h[0] = (this.h[0] | (this.h[1] << 13)) & 65535,
            this.h[1] = ((this.h[1] >>> 3) | (this.h[2] << 10)) & 65535,
            this.h[2] = ((this.h[2] >>> 6) | (this.h[3] << 7)) & 65535,
            this.h[3] = ((this.h[3] >>> 9) | (this.h[4] << 4)) & 65535,
            this.h[4] =
              ((this.h[4] >>> 12) | (this.h[5] << 1) | (this.h[6] << 14)) &
              65535,
            this.h[5] = ((this.h[6] >>> 2) | (this.h[7] << 11)) & 65535,
            this.h[6] = ((this.h[7] >>> 5) | (this.h[8] << 8)) & 65535,
            this.h[7] = ((this.h[8] >>> 8) | (this.h[9] << 5)) & 65535,
            R = this.h[0] + this.pad[0],
            this.h[0] = R & 65535,
            C = 1;
          C < 8;
          C++
        )
          (R = (((this.h[C] + this.pad[C]) | 0) + (R >>> 16)) | 0),
            (this.h[C] = R & 65535);
        (h[m + 0] = (this.h[0] >>> 0) & 255),
          (h[m + 1] = (this.h[0] >>> 8) & 255),
          (h[m + 2] = (this.h[1] >>> 0) & 255),
          (h[m + 3] = (this.h[1] >>> 8) & 255),
          (h[m + 4] = (this.h[2] >>> 0) & 255),
          (h[m + 5] = (this.h[2] >>> 8) & 255),
          (h[m + 6] = (this.h[3] >>> 0) & 255),
          (h[m + 7] = (this.h[3] >>> 8) & 255),
          (h[m + 8] = (this.h[4] >>> 0) & 255),
          (h[m + 9] = (this.h[4] >>> 8) & 255),
          (h[m + 10] = (this.h[5] >>> 0) & 255),
          (h[m + 11] = (this.h[5] >>> 8) & 255),
          (h[m + 12] = (this.h[6] >>> 0) & 255),
          (h[m + 13] = (this.h[6] >>> 8) & 255),
          (h[m + 14] = (this.h[7] >>> 0) & 255),
          (h[m + 15] = (this.h[7] >>> 8) & 255);
      }),
      (re.prototype.update = function (h, m, g) {
        var c, w;
        if (this.leftover) {
          for (w = 16 - this.leftover, w > g && (w = g), c = 0; c < w; c++)
            this.buffer[this.leftover + c] = h[m + c];
          if (((g -= w), (m += w), (this.leftover += w), this.leftover < 16))
            return;
          this.blocks(this.buffer, 0, 16), (this.leftover = 0);
        }
        if (
          (g >= 16 &&
            ((w = g - (g % 16)), this.blocks(h, m, w), (m += w), (g -= w)),
          g)
        ) {
          for (c = 0; c < g; c++) this.buffer[this.leftover + c] = h[m + c];
          this.leftover += g;
        }
      });
    function xt(h, m, g, c, w, R) {
      var C = new re(R);
      return C.update(g, c, w), C.finish(h, m), 0;
    }
    function Ct(h, m, g, c, w, R) {
      var C = new Uint8Array(16);
      return xt(C, 0, g, c, w, R), U(h, m, C, 0);
    }
    function E(h, m, g, c, w) {
      var R;
      if (g < 32) return -1;
      for (
        wt(h, 0, m, 0, g, c, w), xt(h, 16, h, 32, g - 32, h), R = 0;
        R < 16;
        R++
      )
        h[R] = 0;
      return 0;
    }
    function a(h, m, g, c, w) {
      var R,
        C = new Uint8Array(32);
      if (g < 32 || (ut(C, 0, 32, c, w), Ct(m, 16, m, 32, g - 32, C) !== 0))
        return -1;
      for (wt(h, 0, m, 0, g, c, w), R = 0; R < 32; R++) h[R] = 0;
      return 0;
    }
    function u(h, m) {
      var g;
      for (g = 0; g < 16; g++) h[g] = m[g] | 0;
    }
    function l(h) {
      var m,
        g,
        c = 1;
      for (m = 0; m < 16; m++)
        (g = h[m] + c + 65535),
          (c = Math.floor(g / 65536)),
          (h[m] = g - c * 65536);
      h[0] += c - 1 + 37 * (c - 1);
    }
    function y(h, m, g) {
      for (var c, w = ~(g - 1), R = 0; R < 16; R++)
        (c = w & (h[R] ^ m[R])), (h[R] ^= c), (m[R] ^= c);
    }
    function b(h, m) {
      var g,
        c,
        w,
        R = t(),
        C = t();
      for (g = 0; g < 16; g++) C[g] = m[g];
      for (l(C), l(C), l(C), c = 0; c < 2; c++) {
        for (R[0] = C[0] - 65517, g = 1; g < 15; g++)
          (R[g] = C[g] - 65535 - ((R[g - 1] >> 16) & 1)), (R[g - 1] &= 65535);
        (R[15] = C[15] - 32767 - ((R[14] >> 16) & 1)),
          (w = (R[15] >> 16) & 1),
          (R[14] &= 65535),
          y(C, R, 1 - w);
      }
      for (g = 0; g < 16; g++)
        (h[2 * g] = C[g] & 255), (h[2 * g + 1] = C[g] >> 8);
    }
    function B(h, m) {
      var g = new Uint8Array(32),
        c = new Uint8Array(32);
      return b(g, h), b(c, m), T(g, 0, c, 0);
    }
    function I(h) {
      var m = new Uint8Array(32);
      return b(m, h), m[0] & 1;
    }
    function x(h, m) {
      var g;
      for (g = 0; g < 16; g++) h[g] = m[2 * g] + (m[2 * g + 1] << 8);
      h[15] &= 32767;
    }
    function f(h, m, g) {
      for (var c = 0; c < 16; c++) h[c] = m[c] + g[c];
    }
    function v(h, m, g) {
      for (var c = 0; c < 16; c++) h[c] = m[c] - g[c];
    }
    function q(h, m, g) {
      var c,
        w,
        R = 0,
        C = 0,
        K = 0,
        j = 0,
        gt = 0,
        et = 0,
        kt = 0,
        ft = 0,
        _t = 0,
        At = 0,
        Ut = 0,
        Pt = 0,
        It = 0,
        Mt = 0,
        Lt = 0,
        ht = 0,
        bt = 0,
        ct = 0,
        pt = 0,
        yt = 0,
        st = 0,
        z = 0,
        F = 0,
        G = 0,
        $ = 0,
        V = 0,
        tt = 0,
        Bt = 0,
        Nt = 0,
        Ft = 0,
        zt = 0,
        A = g[0],
        Dt = g[1],
        Gt = g[2],
        Yt = g[3],
        qt = g[4],
        $t = g[5],
        Vt = g[6],
        qe = g[7],
        ee = g[8],
        Oe = g[9],
        Ne = g[10],
        ze = g[11],
        De = g[12],
        Ze = g[13],
        Xe = g[14],
        Je = g[15];
      (c = m[0]),
        (R += c * A),
        (C += c * Dt),
        (K += c * Gt),
        (j += c * Yt),
        (gt += c * qt),
        (et += c * $t),
        (kt += c * Vt),
        (ft += c * qe),
        (_t += c * ee),
        (At += c * Oe),
        (Ut += c * Ne),
        (Pt += c * ze),
        (It += c * De),
        (Mt += c * Ze),
        (Lt += c * Xe),
        (ht += c * Je),
        (c = m[1]),
        (C += c * A),
        (K += c * Dt),
        (j += c * Gt),
        (gt += c * Yt),
        (et += c * qt),
        (kt += c * $t),
        (ft += c * Vt),
        (_t += c * qe),
        (At += c * ee),
        (Ut += c * Oe),
        (Pt += c * Ne),
        (It += c * ze),
        (Mt += c * De),
        (Lt += c * Ze),
        (ht += c * Xe),
        (bt += c * Je),
        (c = m[2]),
        (K += c * A),
        (j += c * Dt),
        (gt += c * Gt),
        (et += c * Yt),
        (kt += c * qt),
        (ft += c * $t),
        (_t += c * Vt),
        (At += c * qe),
        (Ut += c * ee),
        (Pt += c * Oe),
        (It += c * Ne),
        (Mt += c * ze),
        (Lt += c * De),
        (ht += c * Ze),
        (bt += c * Xe),
        (ct += c * Je),
        (c = m[3]),
        (j += c * A),
        (gt += c * Dt),
        (et += c * Gt),
        (kt += c * Yt),
        (ft += c * qt),
        (_t += c * $t),
        (At += c * Vt),
        (Ut += c * qe),
        (Pt += c * ee),
        (It += c * Oe),
        (Mt += c * Ne),
        (Lt += c * ze),
        (ht += c * De),
        (bt += c * Ze),
        (ct += c * Xe),
        (pt += c * Je),
        (c = m[4]),
        (gt += c * A),
        (et += c * Dt),
        (kt += c * Gt),
        (ft += c * Yt),
        (_t += c * qt),
        (At += c * $t),
        (Ut += c * Vt),
        (Pt += c * qe),
        (It += c * ee),
        (Mt += c * Oe),
        (Lt += c * Ne),
        (ht += c * ze),
        (bt += c * De),
        (ct += c * Ze),
        (pt += c * Xe),
        (yt += c * Je),
        (c = m[5]),
        (et += c * A),
        (kt += c * Dt),
        (ft += c * Gt),
        (_t += c * Yt),
        (At += c * qt),
        (Ut += c * $t),
        (Pt += c * Vt),
        (It += c * qe),
        (Mt += c * ee),
        (Lt += c * Oe),
        (ht += c * Ne),
        (bt += c * ze),
        (ct += c * De),
        (pt += c * Ze),
        (yt += c * Xe),
        (st += c * Je),
        (c = m[6]),
        (kt += c * A),
        (ft += c * Dt),
        (_t += c * Gt),
        (At += c * Yt),
        (Ut += c * qt),
        (Pt += c * $t),
        (It += c * Vt),
        (Mt += c * qe),
        (Lt += c * ee),
        (ht += c * Oe),
        (bt += c * Ne),
        (ct += c * ze),
        (pt += c * De),
        (yt += c * Ze),
        (st += c * Xe),
        (z += c * Je),
        (c = m[7]),
        (ft += c * A),
        (_t += c * Dt),
        (At += c * Gt),
        (Ut += c * Yt),
        (Pt += c * qt),
        (It += c * $t),
        (Mt += c * Vt),
        (Lt += c * qe),
        (ht += c * ee),
        (bt += c * Oe),
        (ct += c * Ne),
        (pt += c * ze),
        (yt += c * De),
        (st += c * Ze),
        (z += c * Xe),
        (F += c * Je),
        (c = m[8]),
        (_t += c * A),
        (At += c * Dt),
        (Ut += c * Gt),
        (Pt += c * Yt),
        (It += c * qt),
        (Mt += c * $t),
        (Lt += c * Vt),
        (ht += c * qe),
        (bt += c * ee),
        (ct += c * Oe),
        (pt += c * Ne),
        (yt += c * ze),
        (st += c * De),
        (z += c * Ze),
        (F += c * Xe),
        (G += c * Je),
        (c = m[9]),
        (At += c * A),
        (Ut += c * Dt),
        (Pt += c * Gt),
        (It += c * Yt),
        (Mt += c * qt),
        (Lt += c * $t),
        (ht += c * Vt),
        (bt += c * qe),
        (ct += c * ee),
        (pt += c * Oe),
        (yt += c * Ne),
        (st += c * ze),
        (z += c * De),
        (F += c * Ze),
        (G += c * Xe),
        ($ += c * Je),
        (c = m[10]),
        (Ut += c * A),
        (Pt += c * Dt),
        (It += c * Gt),
        (Mt += c * Yt),
        (Lt += c * qt),
        (ht += c * $t),
        (bt += c * Vt),
        (ct += c * qe),
        (pt += c * ee),
        (yt += c * Oe),
        (st += c * Ne),
        (z += c * ze),
        (F += c * De),
        (G += c * Ze),
        ($ += c * Xe),
        (V += c * Je),
        (c = m[11]),
        (Pt += c * A),
        (It += c * Dt),
        (Mt += c * Gt),
        (Lt += c * Yt),
        (ht += c * qt),
        (bt += c * $t),
        (ct += c * Vt),
        (pt += c * qe),
        (yt += c * ee),
        (st += c * Oe),
        (z += c * Ne),
        (F += c * ze),
        (G += c * De),
        ($ += c * Ze),
        (V += c * Xe),
        (tt += c * Je),
        (c = m[12]),
        (It += c * A),
        (Mt += c * Dt),
        (Lt += c * Gt),
        (ht += c * Yt),
        (bt += c * qt),
        (ct += c * $t),
        (pt += c * Vt),
        (yt += c * qe),
        (st += c * ee),
        (z += c * Oe),
        (F += c * Ne),
        (G += c * ze),
        ($ += c * De),
        (V += c * Ze),
        (tt += c * Xe),
        (Bt += c * Je),
        (c = m[13]),
        (Mt += c * A),
        (Lt += c * Dt),
        (ht += c * Gt),
        (bt += c * Yt),
        (ct += c * qt),
        (pt += c * $t),
        (yt += c * Vt),
        (st += c * qe),
        (z += c * ee),
        (F += c * Oe),
        (G += c * Ne),
        ($ += c * ze),
        (V += c * De),
        (tt += c * Ze),
        (Bt += c * Xe),
        (Nt += c * Je),
        (c = m[14]),
        (Lt += c * A),
        (ht += c * Dt),
        (bt += c * Gt),
        (ct += c * Yt),
        (pt += c * qt),
        (yt += c * $t),
        (st += c * Vt),
        (z += c * qe),
        (F += c * ee),
        (G += c * Oe),
        ($ += c * Ne),
        (V += c * ze),
        (tt += c * De),
        (Bt += c * Ze),
        (Nt += c * Xe),
        (Ft += c * Je),
        (c = m[15]),
        (ht += c * A),
        (bt += c * Dt),
        (ct += c * Gt),
        (pt += c * Yt),
        (yt += c * qt),
        (st += c * $t),
        (z += c * Vt),
        (F += c * qe),
        (G += c * ee),
        ($ += c * Oe),
        (V += c * Ne),
        (tt += c * ze),
        (Bt += c * De),
        (Nt += c * Ze),
        (Ft += c * Xe),
        (zt += c * Je),
        (R += 38 * bt),
        (C += 38 * ct),
        (K += 38 * pt),
        (j += 38 * yt),
        (gt += 38 * st),
        (et += 38 * z),
        (kt += 38 * F),
        (ft += 38 * G),
        (_t += 38 * $),
        (At += 38 * V),
        (Ut += 38 * tt),
        (Pt += 38 * Bt),
        (It += 38 * Nt),
        (Mt += 38 * Ft),
        (Lt += 38 * zt),
        (w = 1),
        (c = R + w + 65535),
        (w = Math.floor(c / 65536)),
        (R = c - w * 65536),
        (c = C + w + 65535),
        (w = Math.floor(c / 65536)),
        (C = c - w * 65536),
        (c = K + w + 65535),
        (w = Math.floor(c / 65536)),
        (K = c - w * 65536),
        (c = j + w + 65535),
        (w = Math.floor(c / 65536)),
        (j = c - w * 65536),
        (c = gt + w + 65535),
        (w = Math.floor(c / 65536)),
        (gt = c - w * 65536),
        (c = et + w + 65535),
        (w = Math.floor(c / 65536)),
        (et = c - w * 65536),
        (c = kt + w + 65535),
        (w = Math.floor(c / 65536)),
        (kt = c - w * 65536),
        (c = ft + w + 65535),
        (w = Math.floor(c / 65536)),
        (ft = c - w * 65536),
        (c = _t + w + 65535),
        (w = Math.floor(c / 65536)),
        (_t = c - w * 65536),
        (c = At + w + 65535),
        (w = Math.floor(c / 65536)),
        (At = c - w * 65536),
        (c = Ut + w + 65535),
        (w = Math.floor(c / 65536)),
        (Ut = c - w * 65536),
        (c = Pt + w + 65535),
        (w = Math.floor(c / 65536)),
        (Pt = c - w * 65536),
        (c = It + w + 65535),
        (w = Math.floor(c / 65536)),
        (It = c - w * 65536),
        (c = Mt + w + 65535),
        (w = Math.floor(c / 65536)),
        (Mt = c - w * 65536),
        (c = Lt + w + 65535),
        (w = Math.floor(c / 65536)),
        (Lt = c - w * 65536),
        (c = ht + w + 65535),
        (w = Math.floor(c / 65536)),
        (ht = c - w * 65536),
        (R += w - 1 + 37 * (w - 1)),
        (w = 1),
        (c = R + w + 65535),
        (w = Math.floor(c / 65536)),
        (R = c - w * 65536),
        (c = C + w + 65535),
        (w = Math.floor(c / 65536)),
        (C = c - w * 65536),
        (c = K + w + 65535),
        (w = Math.floor(c / 65536)),
        (K = c - w * 65536),
        (c = j + w + 65535),
        (w = Math.floor(c / 65536)),
        (j = c - w * 65536),
        (c = gt + w + 65535),
        (w = Math.floor(c / 65536)),
        (gt = c - w * 65536),
        (c = et + w + 65535),
        (w = Math.floor(c / 65536)),
        (et = c - w * 65536),
        (c = kt + w + 65535),
        (w = Math.floor(c / 65536)),
        (kt = c - w * 65536),
        (c = ft + w + 65535),
        (w = Math.floor(c / 65536)),
        (ft = c - w * 65536),
        (c = _t + w + 65535),
        (w = Math.floor(c / 65536)),
        (_t = c - w * 65536),
        (c = At + w + 65535),
        (w = Math.floor(c / 65536)),
        (At = c - w * 65536),
        (c = Ut + w + 65535),
        (w = Math.floor(c / 65536)),
        (Ut = c - w * 65536),
        (c = Pt + w + 65535),
        (w = Math.floor(c / 65536)),
        (Pt = c - w * 65536),
        (c = It + w + 65535),
        (w = Math.floor(c / 65536)),
        (It = c - w * 65536),
        (c = Mt + w + 65535),
        (w = Math.floor(c / 65536)),
        (Mt = c - w * 65536),
        (c = Lt + w + 65535),
        (w = Math.floor(c / 65536)),
        (Lt = c - w * 65536),
        (c = ht + w + 65535),
        (w = Math.floor(c / 65536)),
        (ht = c - w * 65536),
        (R += w - 1 + 37 * (w - 1)),
        (h[0] = R),
        (h[1] = C),
        (h[2] = K),
        (h[3] = j),
        (h[4] = gt),
        (h[5] = et),
        (h[6] = kt),
        (h[7] = ft),
        (h[8] = _t),
        (h[9] = At),
        (h[10] = Ut),
        (h[11] = Pt),
        (h[12] = It),
        (h[13] = Mt),
        (h[14] = Lt),
        (h[15] = ht);
    }
    function Z(h, m) {
      q(h, m, m);
    }
    function nt(h, m) {
      var g = t(),
        c;
      for (c = 0; c < 16; c++) g[c] = m[c];
      for (c = 253; c >= 0; c--) Z(g, g), c !== 2 && c !== 4 && q(g, g, m);
      for (c = 0; c < 16; c++) h[c] = g[c];
    }
    function mt(h, m) {
      var g = t(),
        c;
      for (c = 0; c < 16; c++) g[c] = m[c];
      for (c = 250; c >= 0; c--) Z(g, g), c !== 1 && q(g, g, m);
      for (c = 0; c < 16; c++) h[c] = g[c];
    }
    function vt(h, m, g) {
      var c = new Uint8Array(32),
        w = new Float64Array(80),
        R,
        C,
        K = t(),
        j = t(),
        gt = t(),
        et = t(),
        kt = t(),
        ft = t();
      for (C = 0; C < 31; C++) c[C] = m[C];
      for (c[31] = (m[31] & 127) | 64, c[0] &= 248, x(w, g), C = 0; C < 16; C++)
        (j[C] = w[C]), (et[C] = K[C] = gt[C] = 0);
      for (K[0] = et[0] = 1, C = 254; C >= 0; --C)
        (R = (c[C >>> 3] >>> (C & 7)) & 1),
          y(K, j, R),
          y(gt, et, R),
          f(kt, K, gt),
          v(K, K, gt),
          f(gt, j, et),
          v(j, j, et),
          Z(et, kt),
          Z(ft, K),
          q(K, gt, K),
          q(gt, j, kt),
          f(kt, K, gt),
          v(K, K, gt),
          Z(j, K),
          v(gt, et, ft),
          q(K, gt, d),
          f(K, K, et),
          q(gt, gt, K),
          q(K, et, ft),
          q(et, j, w),
          Z(j, kt),
          y(K, j, R),
          y(gt, et, R);
      for (C = 0; C < 16; C++)
        (w[C + 16] = K[C]),
          (w[C + 32] = gt[C]),
          (w[C + 48] = j[C]),
          (w[C + 64] = et[C]);
      var _t = w.subarray(32),
        At = w.subarray(16);
      return nt(_t, _t), q(At, At, _t), b(h, At), 0;
    }
    function Rt(h, m) {
      return vt(h, m, o);
    }
    function fe(h, m) {
      return e(m, 32), Rt(h, m);
    }
    function Et(h, m, g) {
      var c = new Uint8Array(32);
      return vt(c, g, m), Q(h, n, c, at);
    }
    var Ot = E,
      ur = a;
    function ne(h, m, g, c, w, R) {
      var C = new Uint8Array(32);
      return Et(C, w, R), Ot(h, m, g, c, C);
    }
    function oe(h, m, g, c, w, R) {
      var C = new Uint8Array(32);
      return Et(C, w, R), ur(h, m, g, c, C);
    }
    var gn = [
      1116352408, 3609767458, 1899447441, 602891725, 3049323471, 3964484399,
      3921009573, 2173295548, 961987163, 4081628472, 1508970993, 3053834265,
      2453635748, 2937671579, 2870763221, 3664609560, 3624381080, 2734883394,
      310598401, 1164996542, 607225278, 1323610764, 1426881987, 3590304994,
      1925078388, 4068182383, 2162078206, 991336113, 2614888103, 633803317,
      3248222580, 3479774868, 3835390401, 2666613458, 4022224774, 944711139,
      264347078, 2341262773, 604807628, 2007800933, 770255983, 1495990901,
      1249150122, 1856431235, 1555081692, 3175218132, 1996064986, 2198950837,
      2554220882, 3999719339, 2821834349, 766784016, 2952996808, 2566594879,
      3210313671, 3203337956, 3336571891, 1034457026, 3584528711, 2466948901,
      113926993, 3758326383, 338241895, 168717936, 666307205, 1188179964,
      773529912, 1546045734, 1294757372, 1522805485, 1396182291, 2643833823,
      1695183700, 2343527390, 1986661051, 1014477480, 2177026350, 1206759142,
      2456956037, 344077627, 2730485921, 1290863460, 2820302411, 3158454273,
      3259730800, 3505952657, 3345764771, 106217008, 3516065817, 3606008344,
      3600352804, 1432725776, 4094571909, 1467031594, 275423344, 851169720,
      430227734, 3100823752, 506948616, 1363258195, 659060556, 3750685593,
      883997877, 3785050280, 958139571, 3318307427, 1322822218, 3812723403,
      1537002063, 2003034995, 1747873779, 3602036899, 1955562222, 1575990012,
      2024104815, 1125592928, 2227730452, 2716904306, 2361852424, 442776044,
      2428436474, 593698344, 2756734187, 3733110249, 3204031479, 2999351573,
      3329325298, 3815920427, 3391569614, 3928383900, 3515267271, 566280711,
      3940187606, 3454069534, 4118630271, 4000239992, 116418474, 1914138554,
      174292421, 2731055270, 289380356, 3203993006, 460393269, 320620315,
      685471733, 587496836, 852142971, 1086792851, 1017036298, 365543100,
      1126000580, 2618297676, 1288033470, 3409855158, 1501505948, 4234509866,
      1607167915, 987167468, 1816402316, 1246189591,
    ];
    function ke(h, m, g, c) {
      for (
        var w = new Int32Array(16),
          R = new Int32Array(16),
          C,
          K,
          j,
          gt,
          et,
          kt,
          ft,
          _t,
          At,
          Ut,
          Pt,
          It,
          Mt,
          Lt,
          ht,
          bt,
          ct,
          pt,
          yt,
          st,
          z,
          F,
          G,
          $,
          V,
          tt,
          Bt = h[0],
          Nt = h[1],
          Ft = h[2],
          zt = h[3],
          A = h[4],
          Dt = h[5],
          Gt = h[6],
          Yt = h[7],
          qt = m[0],
          $t = m[1],
          Vt = m[2],
          qe = m[3],
          ee = m[4],
          Oe = m[5],
          Ne = m[6],
          ze = m[7],
          De = 0;
        c >= 128;

      ) {
        for (yt = 0; yt < 16; yt++)
          (st = 8 * yt + De),
            (w[yt] =
              (g[st + 0] << 24) |
              (g[st + 1] << 16) |
              (g[st + 2] << 8) |
              g[st + 3]),
            (R[yt] =
              (g[st + 4] << 24) |
              (g[st + 5] << 16) |
              (g[st + 6] << 8) |
              g[st + 7]);
        for (yt = 0; yt < 80; yt++)
          if (
            ((C = Bt),
            (K = Nt),
            (j = Ft),
            (gt = zt),
            (et = A),
            (kt = Dt),
            (ft = Gt),
            (_t = Yt),
            (At = qt),
            (Ut = $t),
            (Pt = Vt),
            (It = qe),
            (Mt = ee),
            (Lt = Oe),
            (ht = Ne),
            (bt = ze),
            (z = Yt),
            (F = ze),
            (G = F & 65535),
            ($ = F >>> 16),
            (V = z & 65535),
            (tt = z >>> 16),
            (z =
              ((A >>> 14) | (ee << 18)) ^
              ((A >>> 18) | (ee << 14)) ^
              ((ee >>> 9) | (A << 23))),
            (F =
              ((ee >>> 14) | (A << 18)) ^
              ((ee >>> 18) | (A << 14)) ^
              ((A >>> 9) | (ee << 23))),
            (G += F & 65535),
            ($ += F >>> 16),
            (V += z & 65535),
            (tt += z >>> 16),
            (z = (A & Dt) ^ (~A & Gt)),
            (F = (ee & Oe) ^ (~ee & Ne)),
            (G += F & 65535),
            ($ += F >>> 16),
            (V += z & 65535),
            (tt += z >>> 16),
            (z = gn[yt * 2]),
            (F = gn[yt * 2 + 1]),
            (G += F & 65535),
            ($ += F >>> 16),
            (V += z & 65535),
            (tt += z >>> 16),
            (z = w[yt % 16]),
            (F = R[yt % 16]),
            (G += F & 65535),
            ($ += F >>> 16),
            (V += z & 65535),
            (tt += z >>> 16),
            ($ += G >>> 16),
            (V += $ >>> 16),
            (tt += V >>> 16),
            (ct = (V & 65535) | (tt << 16)),
            (pt = (G & 65535) | ($ << 16)),
            (z = ct),
            (F = pt),
            (G = F & 65535),
            ($ = F >>> 16),
            (V = z & 65535),
            (tt = z >>> 16),
            (z =
              ((Bt >>> 28) | (qt << 4)) ^
              ((qt >>> 2) | (Bt << 30)) ^
              ((qt >>> 7) | (Bt << 25))),
            (F =
              ((qt >>> 28) | (Bt << 4)) ^
              ((Bt >>> 2) | (qt << 30)) ^
              ((Bt >>> 7) | (qt << 25))),
            (G += F & 65535),
            ($ += F >>> 16),
            (V += z & 65535),
            (tt += z >>> 16),
            (z = (Bt & Nt) ^ (Bt & Ft) ^ (Nt & Ft)),
            (F = (qt & $t) ^ (qt & Vt) ^ ($t & Vt)),
            (G += F & 65535),
            ($ += F >>> 16),
            (V += z & 65535),
            (tt += z >>> 16),
            ($ += G >>> 16),
            (V += $ >>> 16),
            (tt += V >>> 16),
            (_t = (V & 65535) | (tt << 16)),
            (bt = (G & 65535) | ($ << 16)),
            (z = gt),
            (F = It),
            (G = F & 65535),
            ($ = F >>> 16),
            (V = z & 65535),
            (tt = z >>> 16),
            (z = ct),
            (F = pt),
            (G += F & 65535),
            ($ += F >>> 16),
            (V += z & 65535),
            (tt += z >>> 16),
            ($ += G >>> 16),
            (V += $ >>> 16),
            (tt += V >>> 16),
            (gt = (V & 65535) | (tt << 16)),
            (It = (G & 65535) | ($ << 16)),
            (Nt = C),
            (Ft = K),
            (zt = j),
            (A = gt),
            (Dt = et),
            (Gt = kt),
            (Yt = ft),
            (Bt = _t),
            ($t = At),
            (Vt = Ut),
            (qe = Pt),
            (ee = It),
            (Oe = Mt),
            (Ne = Lt),
            (ze = ht),
            (qt = bt),
            yt % 16 === 15)
          )
            for (st = 0; st < 16; st++)
              (z = w[st]),
                (F = R[st]),
                (G = F & 65535),
                ($ = F >>> 16),
                (V = z & 65535),
                (tt = z >>> 16),
                (z = w[(st + 9) % 16]),
                (F = R[(st + 9) % 16]),
                (G += F & 65535),
                ($ += F >>> 16),
                (V += z & 65535),
                (tt += z >>> 16),
                (ct = w[(st + 1) % 16]),
                (pt = R[(st + 1) % 16]),
                (z =
                  ((ct >>> 1) | (pt << 31)) ^
                  ((ct >>> 8) | (pt << 24)) ^
                  (ct >>> 7)),
                (F =
                  ((pt >>> 1) | (ct << 31)) ^
                  ((pt >>> 8) | (ct << 24)) ^
                  ((pt >>> 7) | (ct << 25))),
                (G += F & 65535),
                ($ += F >>> 16),
                (V += z & 65535),
                (tt += z >>> 16),
                (ct = w[(st + 14) % 16]),
                (pt = R[(st + 14) % 16]),
                (z =
                  ((ct >>> 19) | (pt << 13)) ^
                  ((pt >>> 29) | (ct << 3)) ^
                  (ct >>> 6)),
                (F =
                  ((pt >>> 19) | (ct << 13)) ^
                  ((ct >>> 29) | (pt << 3)) ^
                  ((pt >>> 6) | (ct << 26))),
                (G += F & 65535),
                ($ += F >>> 16),
                (V += z & 65535),
                (tt += z >>> 16),
                ($ += G >>> 16),
                (V += $ >>> 16),
                (tt += V >>> 16),
                (w[st] = (V & 65535) | (tt << 16)),
                (R[st] = (G & 65535) | ($ << 16));
        (z = Bt),
          (F = qt),
          (G = F & 65535),
          ($ = F >>> 16),
          (V = z & 65535),
          (tt = z >>> 16),
          (z = h[0]),
          (F = m[0]),
          (G += F & 65535),
          ($ += F >>> 16),
          (V += z & 65535),
          (tt += z >>> 16),
          ($ += G >>> 16),
          (V += $ >>> 16),
          (tt += V >>> 16),
          (h[0] = Bt = (V & 65535) | (tt << 16)),
          (m[0] = qt = (G & 65535) | ($ << 16)),
          (z = Nt),
          (F = $t),
          (G = F & 65535),
          ($ = F >>> 16),
          (V = z & 65535),
          (tt = z >>> 16),
          (z = h[1]),
          (F = m[1]),
          (G += F & 65535),
          ($ += F >>> 16),
          (V += z & 65535),
          (tt += z >>> 16),
          ($ += G >>> 16),
          (V += $ >>> 16),
          (tt += V >>> 16),
          (h[1] = Nt = (V & 65535) | (tt << 16)),
          (m[1] = $t = (G & 65535) | ($ << 16)),
          (z = Ft),
          (F = Vt),
          (G = F & 65535),
          ($ = F >>> 16),
          (V = z & 65535),
          (tt = z >>> 16),
          (z = h[2]),
          (F = m[2]),
          (G += F & 65535),
          ($ += F >>> 16),
          (V += z & 65535),
          (tt += z >>> 16),
          ($ += G >>> 16),
          (V += $ >>> 16),
          (tt += V >>> 16),
          (h[2] = Ft = (V & 65535) | (tt << 16)),
          (m[2] = Vt = (G & 65535) | ($ << 16)),
          (z = zt),
          (F = qe),
          (G = F & 65535),
          ($ = F >>> 16),
          (V = z & 65535),
          (tt = z >>> 16),
          (z = h[3]),
          (F = m[3]),
          (G += F & 65535),
          ($ += F >>> 16),
          (V += z & 65535),
          (tt += z >>> 16),
          ($ += G >>> 16),
          (V += $ >>> 16),
          (tt += V >>> 16),
          (h[3] = zt = (V & 65535) | (tt << 16)),
          (m[3] = qe = (G & 65535) | ($ << 16)),
          (z = A),
          (F = ee),
          (G = F & 65535),
          ($ = F >>> 16),
          (V = z & 65535),
          (tt = z >>> 16),
          (z = h[4]),
          (F = m[4]),
          (G += F & 65535),
          ($ += F >>> 16),
          (V += z & 65535),
          (tt += z >>> 16),
          ($ += G >>> 16),
          (V += $ >>> 16),
          (tt += V >>> 16),
          (h[4] = A = (V & 65535) | (tt << 16)),
          (m[4] = ee = (G & 65535) | ($ << 16)),
          (z = Dt),
          (F = Oe),
          (G = F & 65535),
          ($ = F >>> 16),
          (V = z & 65535),
          (tt = z >>> 16),
          (z = h[5]),
          (F = m[5]),
          (G += F & 65535),
          ($ += F >>> 16),
          (V += z & 65535),
          (tt += z >>> 16),
          ($ += G >>> 16),
          (V += $ >>> 16),
          (tt += V >>> 16),
          (h[5] = Dt = (V & 65535) | (tt << 16)),
          (m[5] = Oe = (G & 65535) | ($ << 16)),
          (z = Gt),
          (F = Ne),
          (G = F & 65535),
          ($ = F >>> 16),
          (V = z & 65535),
          (tt = z >>> 16),
          (z = h[6]),
          (F = m[6]),
          (G += F & 65535),
          ($ += F >>> 16),
          (V += z & 65535),
          (tt += z >>> 16),
          ($ += G >>> 16),
          (V += $ >>> 16),
          (tt += V >>> 16),
          (h[6] = Gt = (V & 65535) | (tt << 16)),
          (m[6] = Ne = (G & 65535) | ($ << 16)),
          (z = Yt),
          (F = ze),
          (G = F & 65535),
          ($ = F >>> 16),
          (V = z & 65535),
          (tt = z >>> 16),
          (z = h[7]),
          (F = m[7]),
          (G += F & 65535),
          ($ += F >>> 16),
          (V += z & 65535),
          (tt += z >>> 16),
          ($ += G >>> 16),
          (V += $ >>> 16),
          (tt += V >>> 16),
          (h[7] = Yt = (V & 65535) | (tt << 16)),
          (m[7] = ze = (G & 65535) | ($ << 16)),
          (De += 128),
          (c -= 128);
      }
      return c;
    }
    function te(h, m, g) {
      var c = new Int32Array(8),
        w = new Int32Array(8),
        R = new Uint8Array(256),
        C,
        K = g;
      for (
        c[0] = 1779033703,
          c[1] = 3144134277,
          c[2] = 1013904242,
          c[3] = 2773480762,
          c[4] = 1359893119,
          c[5] = 2600822924,
          c[6] = 528734635,
          c[7] = 1541459225,
          w[0] = 4089235720,
          w[1] = 2227873595,
          w[2] = 4271175723,
          w[3] = 1595750129,
          w[4] = 2917565137,
          w[5] = 725511199,
          w[6] = 4215389547,
          w[7] = 327033209,
          ke(c, w, m, g),
          g %= 128,
          C = 0;
        C < g;
        C++
      )
        R[C] = m[K - g + C];
      for (
        R[g] = 128,
          g = 256 - 128 * (g < 112 ? 1 : 0),
          R[g - 9] = 0,
          M(R, g - 8, (K / 536870912) | 0, K << 3),
          ke(c, w, R, g),
          C = 0;
        C < 8;
        C++
      )
        M(h, 8 * C, c[C], w[C]);
      return 0;
    }
    function Nr(h, m) {
      var g = t(),
        c = t(),
        w = t(),
        R = t(),
        C = t(),
        K = t(),
        j = t(),
        gt = t(),
        et = t();
      v(g, h[1], h[0]),
        v(et, m[1], m[0]),
        q(g, g, et),
        f(c, h[0], h[1]),
        f(et, m[0], m[1]),
        q(c, c, et),
        q(w, h[3], m[3]),
        q(w, w, S),
        q(R, h[2], m[2]),
        f(R, R, R),
        v(C, c, g),
        v(K, R, w),
        f(j, R, w),
        f(gt, c, g),
        q(h[0], C, K),
        q(h[1], gt, j),
        q(h[2], j, K),
        q(h[3], C, gt);
    }
    function ge(h, m, g) {
      var c;
      for (c = 0; c < 4; c++) y(h[c], m[c], g);
    }
    function ue(h, m) {
      var g = t(),
        c = t(),
        w = t();
      nt(w, m[2]), q(g, m[0], w), q(c, m[1], w), b(h, c), (h[31] ^= I(g) << 7);
    }
    function Lr(h, m, g) {
      var c, w;
      for (u(h[0], i), u(h[1], s), u(h[2], s), u(h[3], i), w = 255; w >= 0; --w)
        (c = (g[(w / 8) | 0] >> (w & 7)) & 1),
          ge(h, m, c),
          Nr(m, h),
          Nr(h, h),
          ge(h, m, c);
    }
    function ie(h, m) {
      var g = [t(), t(), t(), t()];
      u(g[0], k), u(g[1], _), u(g[2], s), q(g[3], k, _), Lr(h, g, m);
    }
    function he(h, m, g) {
      var c = new Uint8Array(64),
        w = [t(), t(), t(), t()],
        R;
      for (
        g || e(m, 32),
          te(c, m, 32),
          c[0] &= 248,
          c[31] &= 127,
          c[31] |= 64,
          ie(w, c),
          ue(h, w),
          R = 0;
        R < 32;
        R++
      )
        m[R + 32] = h[R];
      return 0;
    }
    var Rr = new Float64Array([
      237, 211, 245, 92, 26, 99, 18, 88, 214, 156, 247, 162, 222, 249, 222, 20,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16,
    ]);
    function le(h, m) {
      var g, c, w, R;
      for (c = 63; c >= 32; --c) {
        for (g = 0, w = c - 32, R = c - 12; w < R; ++w)
          (m[w] += g - 16 * m[c] * Rr[w - (c - 32)]),
            (g = Math.floor((m[w] + 128) / 256)),
            (m[w] -= g * 256);
        (m[w] += g), (m[c] = 0);
      }
      for (g = 0, w = 0; w < 32; w++)
        (m[w] += g - (m[31] >> 4) * Rr[w]), (g = m[w] >> 8), (m[w] &= 255);
      for (w = 0; w < 32; w++) m[w] -= g * Rr[w];
      for (c = 0; c < 32; c++) (m[c + 1] += m[c] >> 8), (h[c] = m[c] & 255);
    }
    function de(h) {
      var m = new Float64Array(64),
        g;
      for (g = 0; g < 64; g++) m[g] = h[g];
      for (g = 0; g < 64; g++) h[g] = 0;
      le(h, m);
    }
    function mn(h, m, g, c) {
      var w = new Uint8Array(64),
        R = new Uint8Array(64),
        C = new Uint8Array(64),
        K,
        j,
        gt = new Float64Array(64),
        et = [t(), t(), t(), t()];
      te(w, c, 32), (w[0] &= 248), (w[31] &= 127), (w[31] |= 64);
      var kt = g + 64;
      for (K = 0; K < g; K++) h[64 + K] = m[K];
      for (K = 0; K < 32; K++) h[32 + K] = w[32 + K];
      for (
        te(C, h.subarray(32), g + 32), de(C), ie(et, C), ue(h, et), K = 32;
        K < 64;
        K++
      )
        h[K] = c[K];
      for (te(R, h, g + 64), de(R), K = 0; K < 64; K++) gt[K] = 0;
      for (K = 0; K < 32; K++) gt[K] = C[K];
      for (K = 0; K < 32; K++)
        for (j = 0; j < 32; j++) gt[K + j] += R[K] * w[j];
      return le(h.subarray(32), gt), kt;
    }
    function Ee(h, m) {
      var g = t(),
        c = t(),
        w = t(),
        R = t(),
        C = t(),
        K = t(),
        j = t();
      return (
        u(h[2], s),
        x(h[1], m),
        Z(w, h[1]),
        q(R, w, p),
        v(w, w, h[2]),
        f(R, h[2], R),
        Z(C, R),
        Z(K, C),
        q(j, K, C),
        q(g, j, w),
        q(g, g, R),
        mt(g, g),
        q(g, g, w),
        q(g, g, R),
        q(g, g, R),
        q(h[0], g, R),
        Z(c, h[0]),
        q(c, c, R),
        B(c, w) && q(h[0], h[0], P),
        Z(c, h[0]),
        q(c, c, R),
        B(c, w)
          ? -1
          : (I(h[0]) === m[31] >> 7 && v(h[0], i, h[0]), q(h[3], h[0], h[1]), 0)
      );
    }
    function me(h, m, g, c) {
      var w,
        R = new Uint8Array(32),
        C = new Uint8Array(64),
        K = [t(), t(), t(), t()],
        j = [t(), t(), t(), t()];
      if (g < 64 || Ee(j, c)) return -1;
      for (w = 0; w < g; w++) h[w] = m[w];
      for (w = 0; w < 32; w++) h[w + 32] = c[w];
      if (
        (te(C, h, g),
        de(C),
        Lr(K, j, C),
        ie(j, m.subarray(32)),
        Nr(K, j),
        ue(R, K),
        (g -= 64),
        T(m, 0, R, 0))
      ) {
        for (w = 0; w < g; w++) h[w] = 0;
        return -1;
      }
      for (w = 0; w < g; w++) h[w] = m[w + 64];
      return g;
    }
    var Yr = 32,
      Be = 24,
      be = 32,
      zr = 16,
      we = 32,
      Se = 32,
      Zr = 32,
      xe = 32,
      _e = 32,
      io = Be,
      Ce = be,
      Ue = zr,
      mr = 64,
      se = 32,
      pe = 64,
      Cn = 32,
      Ae = 64;
    r.lowlevel = {
      crypto_core_hsalsa20: Q,
      crypto_stream_xor: wt,
      crypto_stream: ut,
      crypto_stream_salsa20_xor: rt,
      crypto_stream_salsa20: it,
      crypto_onetimeauth: xt,
      crypto_onetimeauth_verify: Ct,
      crypto_verify_16: U,
      crypto_verify_32: T,
      crypto_secretbox: E,
      crypto_secretbox_open: a,
      crypto_scalarmult: vt,
      crypto_scalarmult_base: Rt,
      crypto_box_beforenm: Et,
      crypto_box_afternm: Ot,
      crypto_box: ne,
      crypto_box_open: oe,
      crypto_box_keypair: fe,
      crypto_hash: te,
      crypto_sign: mn,
      crypto_sign_keypair: he,
      crypto_sign_open: me,
      crypto_secretbox_KEYBYTES: Yr,
      crypto_secretbox_NONCEBYTES: Be,
      crypto_secretbox_ZEROBYTES: be,
      crypto_secretbox_BOXZEROBYTES: zr,
      crypto_scalarmult_BYTES: we,
      crypto_scalarmult_SCALARBYTES: Se,
      crypto_box_PUBLICKEYBYTES: Zr,
      crypto_box_SECRETKEYBYTES: xe,
      crypto_box_BEFORENMBYTES: _e,
      crypto_box_NONCEBYTES: io,
      crypto_box_ZEROBYTES: Ce,
      crypto_box_BOXZEROBYTES: Ue,
      crypto_sign_BYTES: mr,
      crypto_sign_PUBLICKEYBYTES: se,
      crypto_sign_SECRETKEYBYTES: pe,
      crypto_sign_SEEDBYTES: Cn,
      crypto_hash_BYTES: Ae,
      gf: t,
      D: p,
      L: Rr,
      pack25519: b,
      unpack25519: x,
      M: q,
      A: f,
      S: Z,
      Z: v,
      pow2523: mt,
      add: Nr,
      set25519: u,
      modL: le,
      scalarmult: Lr,
      scalarbase: ie,
    };
    function Te(h, m) {
      if (h.length !== Yr) throw new Error("bad key size");
      if (m.length !== Be) throw new Error("bad nonce size");
    }
    function No(h, m) {
      if (h.length !== Zr) throw new Error("bad public key size");
      if (m.length !== xe) throw new Error("bad secret key size");
    }
    function Ht() {
      for (var h = 0; h < arguments.length; h++)
        if (!(arguments[h] instanceof Uint8Array))
          throw new TypeError("unexpected type, use Uint8Array");
    }
    function Pe(h) {
      for (var m = 0; m < h.length; m++) h[m] = 0;
    }
    (r.randomBytes = function (h) {
      var m = new Uint8Array(h);
      return e(m, h), m;
    }),
      (r.secretbox = function (h, m, g) {
        Ht(h, m, g), Te(g, m);
        for (
          var c = new Uint8Array(be + h.length),
            w = new Uint8Array(c.length),
            R = 0;
          R < h.length;
          R++
        )
          c[R + be] = h[R];
        return E(w, c, c.length, m, g), w.subarray(zr);
      }),
      (r.secretbox.open = function (h, m, g) {
        Ht(h, m, g), Te(g, m);
        for (
          var c = new Uint8Array(zr + h.length),
            w = new Uint8Array(c.length),
            R = 0;
          R < h.length;
          R++
        )
          c[R + zr] = h[R];
        return c.length < 32 || a(w, c, c.length, m, g) !== 0
          ? null
          : w.subarray(be);
      }),
      (r.secretbox.keyLength = Yr),
      (r.secretbox.nonceLength = Be),
      (r.secretbox.overheadLength = zr),
      (r.scalarMult = function (h, m) {
        if ((Ht(h, m), h.length !== Se)) throw new Error("bad n size");
        if (m.length !== we) throw new Error("bad p size");
        var g = new Uint8Array(we);
        return vt(g, h, m), g;
      }),
      (r.scalarMult.base = function (h) {
        if ((Ht(h), h.length !== Se)) throw new Error("bad n size");
        var m = new Uint8Array(we);
        return Rt(m, h), m;
      }),
      (r.scalarMult.scalarLength = Se),
      (r.scalarMult.groupElementLength = we),
      (r.box = function (h, m, g, c) {
        var w = r.box.before(g, c);
        return r.secretbox(h, m, w);
      }),
      (r.box.before = function (h, m) {
        Ht(h, m), No(h, m);
        var g = new Uint8Array(_e);
        return Et(g, h, m), g;
      }),
      (r.box.after = r.secretbox),
      (r.box.open = function (h, m, g, c) {
        var w = r.box.before(g, c);
        return r.secretbox.open(h, m, w);
      }),
      (r.box.open.after = r.secretbox.open),
      (r.box.keyPair = function () {
        var h = new Uint8Array(Zr),
          m = new Uint8Array(xe);
        return fe(h, m), { publicKey: h, secretKey: m };
      }),
      (r.box.keyPair.fromSecretKey = function (h) {
        if ((Ht(h), h.length !== xe)) throw new Error("bad secret key size");
        var m = new Uint8Array(Zr);
        return Rt(m, h), { publicKey: m, secretKey: new Uint8Array(h) };
      }),
      (r.box.publicKeyLength = Zr),
      (r.box.secretKeyLength = xe),
      (r.box.sharedKeyLength = _e),
      (r.box.nonceLength = io),
      (r.box.overheadLength = r.secretbox.overheadLength),
      (r.sign = function (h, m) {
        if ((Ht(h, m), m.length !== pe)) throw new Error("bad secret key size");
        var g = new Uint8Array(mr + h.length);
        return mn(g, h, h.length, m), g;
      }),
      (r.sign.open = function (h, m) {
        if ((Ht(h, m), m.length !== se)) throw new Error("bad public key size");
        var g = new Uint8Array(h.length),
          c = me(g, h, h.length, m);
        if (c < 0) return null;
        for (var w = new Uint8Array(c), R = 0; R < w.length; R++) w[R] = g[R];
        return w;
      }),
      (r.sign.detached = function (h, m) {
        for (
          var g = r.sign(h, m), c = new Uint8Array(mr), w = 0;
          w < c.length;
          w++
        )
          c[w] = g[w];
        return c;
      }),
      (r.sign.detached.verify = function (h, m, g) {
        if ((Ht(h, m, g), m.length !== mr))
          throw new Error("bad signature size");
        if (g.length !== se) throw new Error("bad public key size");
        var c = new Uint8Array(mr + h.length),
          w = new Uint8Array(mr + h.length),
          R;
        for (R = 0; R < mr; R++) c[R] = m[R];
        for (R = 0; R < h.length; R++) c[R + mr] = h[R];
        return me(w, c, c.length, g) >= 0;
      }),
      (r.sign.keyPair = function () {
        var h = new Uint8Array(se),
          m = new Uint8Array(pe);
        return he(h, m), { publicKey: h, secretKey: m };
      }),
      (r.sign.keyPair.fromSecretKey = function (h) {
        if ((Ht(h), h.length !== pe)) throw new Error("bad secret key size");
        for (var m = new Uint8Array(se), g = 0; g < m.length; g++)
          m[g] = h[32 + g];
        return { publicKey: m, secretKey: new Uint8Array(h) };
      }),
      (r.sign.keyPair.fromSeed = function (h) {
        if ((Ht(h), h.length !== Cn)) throw new Error("bad seed size");
        for (
          var m = new Uint8Array(se), g = new Uint8Array(pe), c = 0;
          c < 32;
          c++
        )
          g[c] = h[c];
        return he(m, g, !0), { publicKey: m, secretKey: g };
      }),
      (r.sign.publicKeyLength = se),
      (r.sign.secretKeyLength = pe),
      (r.sign.seedLength = Cn),
      (r.sign.signatureLength = mr),
      (r.hash = function (h) {
        Ht(h);
        var m = new Uint8Array(Ae);
        return te(m, h, h.length), m;
      }),
      (r.hash.hashLength = Ae),
      (r.verify = function (h, m) {
        return (
          Ht(h, m),
          h.length === 0 || m.length === 0 || h.length !== m.length
            ? !1
            : X(h, 0, m, 0, h.length) === 0
        );
      }),
      (r.setPRNG = function (h) {
        e = h;
      }),
      (function () {
        var h = typeof self < "u" ? self.crypto || self.msCrypto : null;
        if (h && h.getRandomValues) {
          var m = 65536;
          r.setPRNG(function (g, c) {
            var w,
              R = new Uint8Array(c);
            for (w = 0; w < c; w += m)
              h.getRandomValues(R.subarray(w, w + Math.min(c - w, m)));
            for (w = 0; w < c; w++) g[w] = R[w];
            Pe(R);
          });
        } else
          typeof Pa < "u" &&
            ((h = bu()),
            h &&
              h.randomBytes &&
              r.setPRNG(function (g, c) {
                var w,
                  R = h.randomBytes(c);
                for (w = 0; w < c; w++) g[w] = R[w];
                Pe(R);
              }));
      })();
  })(
    typeof ts < "u" && ts.exports ? ts.exports : (self.nacl = self.nacl || {})
  );
});
var Ma = br(Fn(), 1);
var Tt = br(Fn());
function nc(r) {
  if (!Number.isSafeInteger(r) || r < 0)
    throw new Error(`positive integer expected, not ${r}`);
}
function nh(r) {
  return (
    r instanceof Uint8Array ||
    (r != null && typeof r == "object" && r.constructor.name === "Uint8Array")
  );
}
function Kn(r, ...t) {
  if (!nh(r)) throw new Error("Uint8Array expected");
  if (t.length > 0 && !t.includes(r.length))
    throw new Error(
      `Uint8Array expected of length ${t}, not of length=${r.length}`
    );
}
function oc(r) {
  if (typeof r != "function" || typeof r.create != "function")
    throw new Error("Hash should be wrapped by utils.wrapConstructor");
  nc(r.outputLen), nc(r.blockLen);
}
function qn(r, t = !0) {
  if (r.destroyed) throw new Error("Hash instance has been destroyed");
  if (t && r.finished) throw new Error("Hash#digest() has already been called");
}
function ic(r, t) {
  Kn(r);
  let e = t.outputLen;
  if (r.length < e)
    throw new Error(
      `digestInto() expects output buffer of length at least ${e}`
    );
}
var xn =
  typeof globalThis == "object" && "crypto" in globalThis
    ? globalThis.crypto
    : void 0;
var Do = (r) => new DataView(r.buffer, r.byteOffset, r.byteLength),
  Br = (r, t) => (r << (32 - t)) | (r >>> t);
var Cd = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68;
function sc(r) {
  if (typeof r != "string")
    throw new Error(`utf8ToBytes expected string, got ${typeof r}`);
  return new Uint8Array(new TextEncoder().encode(r));
}
function ao(r) {
  return typeof r == "string" && (r = sc(r)), Kn(r), r;
}
function hs(...r) {
  let t = 0;
  for (let n = 0; n < r.length; n++) {
    let o = r[n];
    Kn(o), (t += o.length);
  }
  let e = new Uint8Array(t);
  for (let n = 0, o = 0; n < r.length; n++) {
    let i = r[n];
    e.set(i, o), (o += i.length);
  }
  return e;
}
var Dn = class {
    clone() {
      return this._cloneInto();
    }
  },
  Ud = {}.toString;
function Wo(r) {
  let t = (n) => r().update(ao(n)).digest(),
    e = r();
  return (
    (t.outputLen = e.outputLen),
    (t.blockLen = e.blockLen),
    (t.create = () => r()),
    t
  );
}
function Ho(r = 32) {
  if (xn && typeof xn.getRandomValues == "function")
    return xn.getRandomValues(new Uint8Array(r));
  if (xn && typeof xn.randomBytes == "function") return xn.randomBytes(r);
  throw new Error("crypto.getRandomValues must be defined");
}
function oh(r, t, e, n) {
  if (typeof r.setBigUint64 == "function") return r.setBigUint64(t, e, n);
  let o = BigInt(32),
    i = BigInt(4294967295),
    s = Number((e >> o) & i),
    d = Number(e & i),
    p = n ? 4 : 0,
    S = n ? 0 : 4;
  r.setUint32(t + p, s, n), r.setUint32(t + S, d, n);
}
var ac = (r, t, e) => (r & t) ^ (~r & e),
  cc = (r, t, e) => (r & t) ^ (r & e) ^ (t & e),
  Wn = class extends Dn {
    constructor(t, e, n, o) {
      super(),
        (this.blockLen = t),
        (this.outputLen = e),
        (this.padOffset = n),
        (this.isLE = o),
        (this.finished = !1),
        (this.length = 0),
        (this.pos = 0),
        (this.destroyed = !1),
        (this.buffer = new Uint8Array(t)),
        (this.view = Do(this.buffer));
    }
    update(t) {
      qn(this);
      let { view: e, buffer: n, blockLen: o } = this;
      t = ao(t);
      let i = t.length;
      for (let s = 0; s < i; ) {
        let d = Math.min(o - this.pos, i - s);
        if (d === o) {
          let p = Do(t);
          for (; o <= i - s; s += o) this.process(p, s);
          continue;
        }
        n.set(t.subarray(s, s + d), this.pos),
          (this.pos += d),
          (s += d),
          this.pos === o && (this.process(e, 0), (this.pos = 0));
      }
      return (this.length += t.length), this.roundClean(), this;
    }
    digestInto(t) {
      qn(this), ic(t, this), (this.finished = !0);
      let { buffer: e, view: n, blockLen: o, isLE: i } = this,
        { pos: s } = this;
      (e[s++] = 128),
        this.buffer.subarray(s).fill(0),
        this.padOffset > o - s && (this.process(n, 0), (s = 0));
      for (let _ = s; _ < o; _++) e[_] = 0;
      oh(n, o - 8, BigInt(this.length * 8), i), this.process(n, 0);
      let d = Do(t),
        p = this.outputLen;
      if (p % 4) throw new Error("_sha2: outputLen should be aligned to 32bit");
      let S = p / 4,
        k = this.get();
      if (S > k.length) throw new Error("_sha2: outputLen bigger than state");
      for (let _ = 0; _ < S; _++) d.setUint32(4 * _, k[_], i);
    }
    digest() {
      let { buffer: t, outputLen: e } = this;
      this.digestInto(t);
      let n = t.slice(0, e);
      return this.destroy(), n;
    }
    _cloneInto(t) {
      t || (t = new this.constructor()), t.set(...this.get());
      let {
        blockLen: e,
        buffer: n,
        length: o,
        finished: i,
        destroyed: s,
        pos: d,
      } = this;
      return (
        (t.length = o),
        (t.pos = d),
        (t.finished = i),
        (t.destroyed = s),
        o % e && t.buffer.set(n),
        t
      );
    }
  };
var $o = BigInt(4294967295),
  ls = BigInt(32);
function fc(r, t = !1) {
  return t
    ? { h: Number(r & $o), l: Number((r >> ls) & $o) }
    : { h: Number((r >> ls) & $o) | 0, l: Number(r & $o) | 0 };
}
function ih(r, t = !1) {
  let e = new Uint32Array(r.length),
    n = new Uint32Array(r.length);
  for (let o = 0; o < r.length; o++) {
    let { h: i, l: s } = fc(r[o], t);
    [e[o], n[o]] = [i, s];
  }
  return [e, n];
}
var sh = (r, t) => (BigInt(r >>> 0) << ls) | BigInt(t >>> 0),
  ah = (r, t, e) => r >>> e,
  ch = (r, t, e) => (r << (32 - e)) | (t >>> e),
  fh = (r, t, e) => (r >>> e) | (t << (32 - e)),
  uh = (r, t, e) => (r << (32 - e)) | (t >>> e),
  hh = (r, t, e) => (r << (64 - e)) | (t >>> (e - 32)),
  lh = (r, t, e) => (r >>> (e - 32)) | (t << (64 - e)),
  dh = (r, t) => t,
  ph = (r, t) => r,
  yh = (r, t, e) => (r << e) | (t >>> (32 - e)),
  gh = (r, t, e) => (t << e) | (r >>> (32 - e)),
  mh = (r, t, e) => (t << (e - 32)) | (r >>> (64 - e)),
  bh = (r, t, e) => (r << (e - 32)) | (t >>> (64 - e));
function wh(r, t, e, n) {
  let o = (t >>> 0) + (n >>> 0);
  return { h: (r + e + ((o / 2 ** 32) | 0)) | 0, l: o | 0 };
}
var xh = (r, t, e) => (r >>> 0) + (t >>> 0) + (e >>> 0),
  vh = (r, t, e, n) => (t + e + n + ((r / 2 ** 32) | 0)) | 0,
  kh = (r, t, e, n) => (r >>> 0) + (t >>> 0) + (e >>> 0) + (n >>> 0),
  Bh = (r, t, e, n, o) => (t + e + n + o + ((r / 2 ** 32) | 0)) | 0,
  Sh = (r, t, e, n, o) =>
    (r >>> 0) + (t >>> 0) + (e >>> 0) + (n >>> 0) + (o >>> 0),
  Eh = (r, t, e, n, o, i) => (t + e + n + o + i + ((r / 2 ** 32) | 0)) | 0;
var _h = {
    fromBig: fc,
    split: ih,
    toBig: sh,
    shrSH: ah,
    shrSL: ch,
    rotrSH: fh,
    rotrSL: uh,
    rotrBH: hh,
    rotrBL: lh,
    rotr32H: dh,
    rotr32L: ph,
    rotlSH: yh,
    rotlSL: gh,
    rotlBH: mh,
    rotlBL: bh,
    add: wh,
    add3L: xh,
    add3H: vh,
    add4L: kh,
    add4H: Bh,
    add5H: Eh,
    add5L: Sh,
  },
  Kt = _h;
var [Ah, Ih] = Kt.split(
    [
      "0x428a2f98d728ae22",
      "0x7137449123ef65cd",
      "0xb5c0fbcfec4d3b2f",
      "0xe9b5dba58189dbbc",
      "0x3956c25bf348b538",
      "0x59f111f1b605d019",
      "0x923f82a4af194f9b",
      "0xab1c5ed5da6d8118",
      "0xd807aa98a3030242",
      "0x12835b0145706fbe",
      "0x243185be4ee4b28c",
      "0x550c7dc3d5ffb4e2",
      "0x72be5d74f27b896f",
      "0x80deb1fe3b1696b1",
      "0x9bdc06a725c71235",
      "0xc19bf174cf692694",
      "0xe49b69c19ef14ad2",
      "0xefbe4786384f25e3",
      "0x0fc19dc68b8cd5b5",
      "0x240ca1cc77ac9c65",
      "0x2de92c6f592b0275",
      "0x4a7484aa6ea6e483",
      "0x5cb0a9dcbd41fbd4",
      "0x76f988da831153b5",
      "0x983e5152ee66dfab",
      "0xa831c66d2db43210",
      "0xb00327c898fb213f",
      "0xbf597fc7beef0ee4",
      "0xc6e00bf33da88fc2",
      "0xd5a79147930aa725",
      "0x06ca6351e003826f",
      "0x142929670a0e6e70",
      "0x27b70a8546d22ffc",
      "0x2e1b21385c26c926",
      "0x4d2c6dfc5ac42aed",
      "0x53380d139d95b3df",
      "0x650a73548baf63de",
      "0x766a0abb3c77b2a8",
      "0x81c2c92e47edaee6",
      "0x92722c851482353b",
      "0xa2bfe8a14cf10364",
      "0xa81a664bbc423001",
      "0xc24b8b70d0f89791",
      "0xc76c51a30654be30",
      "0xd192e819d6ef5218",
      "0xd69906245565a910",
      "0xf40e35855771202a",
      "0x106aa07032bbd1b8",
      "0x19a4c116b8d2d0c8",
      "0x1e376c085141ab53",
      "0x2748774cdf8eeb99",
      "0x34b0bcb5e19b48a8",
      "0x391c0cb3c5c95a63",
      "0x4ed8aa4ae3418acb",
      "0x5b9cca4f7763e373",
      "0x682e6ff3d6b2b8a3",
      "0x748f82ee5defb2fc",
      "0x78a5636f43172f60",
      "0x84c87814a1f0ab72",
      "0x8cc702081a6439ec",
      "0x90befffa23631e28",
      "0xa4506cebde82bde9",
      "0xbef9a3f7b2c67915",
      "0xc67178f2e372532b",
      "0xca273eceea26619c",
      "0xd186b8c721c0c207",
      "0xeada7dd6cde0eb1e",
      "0xf57d4f7fee6ed178",
      "0x06f067aa72176fba",
      "0x0a637dc5a2c898a6",
      "0x113f9804bef90dae",
      "0x1b710b35131c471b",
      "0x28db77f523047d84",
      "0x32caab7b40c72493",
      "0x3c9ebe0a15c9bebc",
      "0x431d67c49c100d4c",
      "0x4cc5d4becb3e42b6",
      "0x597f299cfc657e2a",
      "0x5fcb6fab3ad6faec",
      "0x6c44198c4a475817",
    ].map((r) => BigInt(r))
  ),
  Jr = new Uint32Array(80),
  Qr = new Uint32Array(80),
  ds = class extends Wn {
    constructor() {
      super(128, 64, 16, !1),
        (this.Ah = 1779033703),
        (this.Al = -205731576),
        (this.Bh = -1150833019),
        (this.Bl = -2067093701),
        (this.Ch = 1013904242),
        (this.Cl = -23791573),
        (this.Dh = -1521486534),
        (this.Dl = 1595750129),
        (this.Eh = 1359893119),
        (this.El = -1377402159),
        (this.Fh = -1694144372),
        (this.Fl = 725511199),
        (this.Gh = 528734635),
        (this.Gl = -79577749),
        (this.Hh = 1541459225),
        (this.Hl = 327033209);
    }
    get() {
      let {
        Ah: t,
        Al: e,
        Bh: n,
        Bl: o,
        Ch: i,
        Cl: s,
        Dh: d,
        Dl: p,
        Eh: S,
        El: k,
        Fh: _,
        Fl: P,
        Gh: M,
        Gl: X,
        Hh: U,
        Hl: T,
      } = this;
      return [t, e, n, o, i, s, d, p, S, k, _, P, M, X, U, T];
    }
    set(t, e, n, o, i, s, d, p, S, k, _, P, M, X, U, T) {
      (this.Ah = t | 0),
        (this.Al = e | 0),
        (this.Bh = n | 0),
        (this.Bl = o | 0),
        (this.Ch = i | 0),
        (this.Cl = s | 0),
        (this.Dh = d | 0),
        (this.Dl = p | 0),
        (this.Eh = S | 0),
        (this.El = k | 0),
        (this.Fh = _ | 0),
        (this.Fl = P | 0),
        (this.Gh = M | 0),
        (this.Gl = X | 0),
        (this.Hh = U | 0),
        (this.Hl = T | 0);
    }
    process(t, e) {
      for (let D = 0; D < 16; D++, e += 4)
        (Jr[D] = t.getUint32(e)), (Qr[D] = t.getUint32((e += 4)));
      for (let D = 16; D < 80; D++) {
        let Q = Jr[D - 15] | 0,
          at = Qr[D - 15] | 0,
          rt = Kt.rotrSH(Q, at, 1) ^ Kt.rotrSH(Q, at, 8) ^ Kt.shrSH(Q, at, 7),
          it = Kt.rotrSL(Q, at, 1) ^ Kt.rotrSL(Q, at, 8) ^ Kt.shrSL(Q, at, 7),
          ut = Jr[D - 2] | 0,
          wt = Qr[D - 2] | 0,
          re =
            Kt.rotrSH(ut, wt, 19) ^ Kt.rotrBH(ut, wt, 61) ^ Kt.shrSH(ut, wt, 6),
          xt =
            Kt.rotrSL(ut, wt, 19) ^ Kt.rotrBL(ut, wt, 61) ^ Kt.shrSL(ut, wt, 6),
          Ct = Kt.add4L(it, xt, Qr[D - 7], Qr[D - 16]),
          E = Kt.add4H(Ct, rt, re, Jr[D - 7], Jr[D - 16]);
        (Jr[D] = E | 0), (Qr[D] = Ct | 0);
      }
      let {
        Ah: n,
        Al: o,
        Bh: i,
        Bl: s,
        Ch: d,
        Cl: p,
        Dh: S,
        Dl: k,
        Eh: _,
        El: P,
        Fh: M,
        Fl: X,
        Gh: U,
        Gl: T,
        Hh: H,
        Hl: J,
      } = this;
      for (let D = 0; D < 80; D++) {
        let Q = Kt.rotrSH(_, P, 14) ^ Kt.rotrSH(_, P, 18) ^ Kt.rotrBH(_, P, 41),
          at = Kt.rotrSL(_, P, 14) ^ Kt.rotrSL(_, P, 18) ^ Kt.rotrBL(_, P, 41),
          rt = (_ & M) ^ (~_ & U),
          it = (P & X) ^ (~P & T),
          ut = Kt.add5L(J, at, it, Ih[D], Qr[D]),
          wt = Kt.add5H(ut, H, Q, rt, Ah[D], Jr[D]),
          re = ut | 0,
          xt = Kt.rotrSH(n, o, 28) ^ Kt.rotrBH(n, o, 34) ^ Kt.rotrBH(n, o, 39),
          Ct = Kt.rotrSL(n, o, 28) ^ Kt.rotrBL(n, o, 34) ^ Kt.rotrBL(n, o, 39),
          E = (n & i) ^ (n & d) ^ (i & d),
          a = (o & s) ^ (o & p) ^ (s & p);
        (H = U | 0),
          (J = T | 0),
          (U = M | 0),
          (T = X | 0),
          (M = _ | 0),
          (X = P | 0),
          ({ h: _, l: P } = Kt.add(S | 0, k | 0, wt | 0, re | 0)),
          (S = d | 0),
          (k = p | 0),
          (d = i | 0),
          (p = s | 0),
          (i = n | 0),
          (s = o | 0);
        let u = Kt.add3L(re, Ct, a);
        (n = Kt.add3H(u, wt, xt, E)), (o = u | 0);
      }
      ({ h: n, l: o } = Kt.add(this.Ah | 0, this.Al | 0, n | 0, o | 0)),
        ({ h: i, l: s } = Kt.add(this.Bh | 0, this.Bl | 0, i | 0, s | 0)),
        ({ h: d, l: p } = Kt.add(this.Ch | 0, this.Cl | 0, d | 0, p | 0)),
        ({ h: S, l: k } = Kt.add(this.Dh | 0, this.Dl | 0, S | 0, k | 0)),
        ({ h: _, l: P } = Kt.add(this.Eh | 0, this.El | 0, _ | 0, P | 0)),
        ({ h: M, l: X } = Kt.add(this.Fh | 0, this.Fl | 0, M | 0, X | 0)),
        ({ h: U, l: T } = Kt.add(this.Gh | 0, this.Gl | 0, U | 0, T | 0)),
        ({ h: H, l: J } = Kt.add(this.Hh | 0, this.Hl | 0, H | 0, J | 0)),
        this.set(n, o, i, s, d, p, S, k, _, P, M, X, U, T, H, J);
    }
    roundClean() {
      Jr.fill(0), Qr.fill(0);
    }
    destroy() {
      this.buffer.fill(0),
        this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    }
  };
var uc = Wo(() => new ds());
var jo = {};
Ca(jo, {
  aInRange: () => lr,
  abool: () => Sr,
  abytes: () => Hn,
  bitGet: () => Ch,
  bitLen: () => bs,
  bitMask: () => fo,
  bitSet: () => Uh,
  bytesToHex: () => qr,
  bytesToNumberBE: () => Dr,
  bytesToNumberLE: () => en,
  concatBytes: () => Wr,
  createHmacDrbg: () => ws,
  ensureBytes: () => Fe,
  equalBytes: () => Th,
  hexToBytes: () => kn,
  hexToNumber: () => ms,
  inRange: () => co,
  isBytes: () => tn,
  memoized: () => Sn,
  notImplemented: () => Nh,
  numberToBytesBE: () => rn,
  numberToBytesLE: () => Bn,
  numberToHexUnpadded: () => vn,
  numberToVarBytesBE: () => Mh,
  utf8ToBytes: () => Ph,
  validateObject: () => Pr,
});
var gs = BigInt(0),
  Vo = BigInt(1),
  Lh = BigInt(2);
function tn(r) {
  return (
    r instanceof Uint8Array ||
    (r != null && typeof r == "object" && r.constructor.name === "Uint8Array")
  );
}
function Hn(r) {
  if (!tn(r)) throw new Error("Uint8Array expected");
}
function Sr(r, t) {
  if (typeof t != "boolean")
    throw new Error(`${r} must be valid boolean, got "${t}".`);
}
var Rh = Array.from({ length: 256 }, (r, t) => t.toString(16).padStart(2, "0"));
function qr(r) {
  Hn(r);
  let t = "";
  for (let e = 0; e < r.length; e++) t += Rh[r[e]];
  return t;
}
function vn(r) {
  let t = r.toString(16);
  return t.length & 1 ? `0${t}` : t;
}
function ms(r) {
  if (typeof r != "string")
    throw new Error("hex string expected, got " + typeof r);
  return BigInt(r === "" ? "0" : `0x${r}`);
}
var Kr = { _0: 48, _9: 57, _A: 65, _F: 70, _a: 97, _f: 102 };
function hc(r) {
  if (r >= Kr._0 && r <= Kr._9) return r - Kr._0;
  if (r >= Kr._A && r <= Kr._F) return r - (Kr._A - 10);
  if (r >= Kr._a && r <= Kr._f) return r - (Kr._a - 10);
}
function kn(r) {
  if (typeof r != "string")
    throw new Error("hex string expected, got " + typeof r);
  let t = r.length,
    e = t / 2;
  if (t % 2)
    throw new Error(
      "padded hex string expected, got unpadded hex of length " + t
    );
  let n = new Uint8Array(e);
  for (let o = 0, i = 0; o < e; o++, i += 2) {
    let s = hc(r.charCodeAt(i)),
      d = hc(r.charCodeAt(i + 1));
    if (s === void 0 || d === void 0) {
      let p = r[i] + r[i + 1];
      throw new Error(
        'hex string expected, got non-hex character "' + p + '" at index ' + i
      );
    }
    n[o] = s * 16 + d;
  }
  return n;
}
function Dr(r) {
  return ms(qr(r));
}
function en(r) {
  return Hn(r), ms(qr(Uint8Array.from(r).reverse()));
}
function rn(r, t) {
  return kn(r.toString(16).padStart(t * 2, "0"));
}
function Bn(r, t) {
  return rn(r, t).reverse();
}
function Mh(r) {
  return kn(vn(r));
}
function Fe(r, t, e) {
  let n;
  if (typeof t == "string")
    try {
      n = kn(t);
    } catch (i) {
      throw new Error(`${r} must be valid hex string, got "${t}". Cause: ${i}`);
    }
  else if (tn(t)) n = Uint8Array.from(t);
  else throw new Error(`${r} must be hex string or Uint8Array`);
  let o = n.length;
  if (typeof e == "number" && o !== e)
    throw new Error(`${r} expected ${e} bytes, got ${o}`);
  return n;
}
function Wr(...r) {
  let t = 0;
  for (let n = 0; n < r.length; n++) {
    let o = r[n];
    Hn(o), (t += o.length);
  }
  let e = new Uint8Array(t);
  for (let n = 0, o = 0; n < r.length; n++) {
    let i = r[n];
    e.set(i, o), (o += i.length);
  }
  return e;
}
function Th(r, t) {
  if (r.length !== t.length) return !1;
  let e = 0;
  for (let n = 0; n < r.length; n++) e |= r[n] ^ t[n];
  return e === 0;
}
function Ph(r) {
  if (typeof r != "string")
    throw new Error(`utf8ToBytes expected string, got ${typeof r}`);
  return new Uint8Array(new TextEncoder().encode(r));
}
var ps = (r) => typeof r == "bigint" && gs <= r;
function co(r, t, e) {
  return ps(r) && ps(t) && ps(e) && t <= r && r < e;
}
function lr(r, t, e, n) {
  if (!co(t, e, n))
    throw new Error(
      `expected valid ${r}: ${e} <= n < ${n}, got ${typeof t} ${t}`
    );
}
function bs(r) {
  let t;
  for (t = 0; r > gs; r >>= Vo, t += 1);
  return t;
}
function Ch(r, t) {
  return (r >> BigInt(t)) & Vo;
}
function Uh(r, t, e) {
  return r | ((e ? Vo : gs) << BigInt(t));
}
var fo = (r) => (Lh << BigInt(r - 1)) - Vo,
  ys = (r) => new Uint8Array(r),
  lc = (r) => Uint8Array.from(r);
function ws(r, t, e) {
  if (typeof r != "number" || r < 2)
    throw new Error("hashLen must be a number");
  if (typeof t != "number" || t < 2)
    throw new Error("qByteLen must be a number");
  if (typeof e != "function") throw new Error("hmacFn must be a function");
  let n = ys(r),
    o = ys(r),
    i = 0,
    s = () => {
      n.fill(1), o.fill(0), (i = 0);
    },
    d = (..._) => e(o, n, ..._),
    p = (_ = ys()) => {
      (o = d(lc([0]), _)),
        (n = d()),
        _.length !== 0 && ((o = d(lc([1]), _)), (n = d()));
    },
    S = () => {
      if (i++ >= 1e3) throw new Error("drbg: tried 1000 values");
      let _ = 0,
        P = [];
      for (; _ < t; ) {
        n = d();
        let M = n.slice();
        P.push(M), (_ += n.length);
      }
      return Wr(...P);
    };
  return (_, P) => {
    s(), p(_);
    let M;
    for (; !(M = P(S())); ) p();
    return s(), M;
  };
}
var Oh = {
  bigint: (r) => typeof r == "bigint",
  function: (r) => typeof r == "function",
  boolean: (r) => typeof r == "boolean",
  string: (r) => typeof r == "string",
  stringOrUint8Array: (r) => typeof r == "string" || tn(r),
  isSafeInteger: (r) => Number.isSafeInteger(r),
  array: (r) => Array.isArray(r),
  field: (r, t) => t.Fp.isValid(r),
  hash: (r) => typeof r == "function" && Number.isSafeInteger(r.outputLen),
};
function Pr(r, t, e = {}) {
  let n = (o, i, s) => {
    let d = Oh[i];
    if (typeof d != "function")
      throw new Error(`Invalid validator "${i}", expected function`);
    let p = r[o];
    if (!(s && p === void 0) && !d(p, r))
      throw new Error(
        `Invalid param ${String(o)}=${p} (${typeof p}), expected ${i}`
      );
  };
  for (let [o, i] of Object.entries(t)) n(o, i, !1);
  for (let [o, i] of Object.entries(e)) n(o, i, !0);
  return r;
}
var Nh = () => {
  throw new Error("not implemented");
};
function Sn(r) {
  let t = new WeakMap();
  return (e, ...n) => {
    let o = t.get(e);
    if (o !== void 0) return o;
    let i = r(e, ...n);
    return t.set(e, i), i;
  };
}
var He = BigInt(0),
  Ie = BigInt(1),
  En = BigInt(2),
  zh = BigInt(3),
  xs = BigInt(4),
  dc = BigInt(5),
  pc = BigInt(8),
  Fh = BigInt(9),
  Kh = BigInt(16);
function ae(r, t) {
  let e = r % t;
  return e >= He ? e : t + e;
}
function qh(r, t, e) {
  if (e <= He || t < He) throw new Error("Expected power/modulo > 0");
  if (e === Ie) return He;
  let n = Ie;
  for (; t > He; ) t & Ie && (n = (n * r) % e), (r = (r * r) % e), (t >>= Ie);
  return n;
}
function Le(r, t, e) {
  let n = r;
  for (; t-- > He; ) (n *= n), (n %= e);
  return n;
}
function Go(r, t) {
  if (r === He || t <= He)
    throw new Error(`invert: expected positive integers, got n=${r} mod=${t}`);
  let e = ae(r, t),
    n = t,
    o = He,
    i = Ie,
    s = Ie,
    d = He;
  for (; e !== He; ) {
    let S = n / e,
      k = n % e,
      _ = o - s * S,
      P = i - d * S;
    (n = e), (e = k), (o = s), (i = d), (s = _), (d = P);
  }
  if (n !== Ie) throw new Error("invert: does not exist");
  return ae(o, t);
}
function Dh(r) {
  let t = (r - Ie) / En,
    e,
    n,
    o;
  for (e = r - Ie, n = 0; e % En === He; e /= En, n++);
  for (o = En; o < r && qh(o, t, r) !== r - Ie; o++);
  if (n === 1) {
    let s = (r + Ie) / xs;
    return function (p, S) {
      let k = p.pow(S, s);
      if (!p.eql(p.sqr(k), S)) throw new Error("Cannot find square root");
      return k;
    };
  }
  let i = (e + Ie) / En;
  return function (d, p) {
    if (d.pow(p, t) === d.neg(d.ONE))
      throw new Error("Cannot find square root");
    let S = n,
      k = d.pow(d.mul(d.ONE, o), e),
      _ = d.pow(p, i),
      P = d.pow(p, e);
    for (; !d.eql(P, d.ONE); ) {
      if (d.eql(P, d.ZERO)) return d.ZERO;
      let M = 1;
      for (let U = d.sqr(P); M < S && !d.eql(U, d.ONE); M++) U = d.sqr(U);
      let X = d.pow(k, Ie << BigInt(S - M - 1));
      (k = d.sqr(X)), (_ = d.mul(_, X)), (P = d.mul(P, k)), (S = M);
    }
    return _;
  };
}
function Wh(r) {
  if (r % xs === zh) {
    let t = (r + Ie) / xs;
    return function (n, o) {
      let i = n.pow(o, t);
      if (!n.eql(n.sqr(i), o)) throw new Error("Cannot find square root");
      return i;
    };
  }
  if (r % pc === dc) {
    let t = (r - dc) / pc;
    return function (n, o) {
      let i = n.mul(o, En),
        s = n.pow(i, t),
        d = n.mul(o, s),
        p = n.mul(n.mul(d, En), s),
        S = n.mul(d, n.sub(p, n.ONE));
      if (!n.eql(n.sqr(S), o)) throw new Error("Cannot find square root");
      return S;
    };
  }
  return r % Kh, Dh(r);
}
var yc = (r, t) => (ae(r, t) & Ie) === Ie,
  Hh = [
    "create",
    "isValid",
    "is0",
    "neg",
    "inv",
    "sqrt",
    "sqr",
    "eql",
    "add",
    "sub",
    "mul",
    "pow",
    "div",
    "addN",
    "subN",
    "mulN",
    "sqrN",
  ];
function vs(r) {
  let t = {
      ORDER: "bigint",
      MASK: "bigint",
      BYTES: "isSafeInteger",
      BITS: "isSafeInteger",
    },
    e = Hh.reduce((n, o) => ((n[o] = "function"), n), t);
  return Pr(r, e);
}
function $h(r, t, e) {
  if (e < He) throw new Error("Expected power > 0");
  if (e === He) return r.ONE;
  if (e === Ie) return t;
  let n = r.ONE,
    o = t;
  for (; e > He; ) e & Ie && (n = r.mul(n, o)), (o = r.sqr(o)), (e >>= Ie);
  return n;
}
function Vh(r, t) {
  let e = new Array(t.length),
    n = t.reduce(
      (i, s, d) => (r.is0(s) ? i : ((e[d] = i), r.mul(i, s))),
      r.ONE
    ),
    o = r.inv(n);
  return (
    t.reduceRight(
      (i, s, d) => (r.is0(s) ? i : ((e[d] = r.mul(i, e[d])), r.mul(i, s))),
      o
    ),
    e
  );
}
function ks(r, t) {
  let e = t !== void 0 ? t : r.toString(2).length,
    n = Math.ceil(e / 8);
  return { nBitLength: e, nByteLength: n };
}
function nn(r, t, e = !1, n = {}) {
  if (r <= He) throw new Error(`Expected Field ORDER > 0, got ${r}`);
  let { nBitLength: o, nByteLength: i } = ks(r, t);
  if (i > 2048)
    throw new Error("Field lengths over 2048 bytes are not supported");
  let s = Wh(r),
    d = Object.freeze({
      ORDER: r,
      BITS: o,
      BYTES: i,
      MASK: fo(o),
      ZERO: He,
      ONE: Ie,
      create: (p) => ae(p, r),
      isValid: (p) => {
        if (typeof p != "bigint")
          throw new Error(
            `Invalid field element: expected bigint, got ${typeof p}`
          );
        return He <= p && p < r;
      },
      is0: (p) => p === He,
      isOdd: (p) => (p & Ie) === Ie,
      neg: (p) => ae(-p, r),
      eql: (p, S) => p === S,
      sqr: (p) => ae(p * p, r),
      add: (p, S) => ae(p + S, r),
      sub: (p, S) => ae(p - S, r),
      mul: (p, S) => ae(p * S, r),
      pow: (p, S) => $h(d, p, S),
      div: (p, S) => ae(p * Go(S, r), r),
      sqrN: (p) => p * p,
      addN: (p, S) => p + S,
      subN: (p, S) => p - S,
      mulN: (p, S) => p * S,
      inv: (p) => Go(p, r),
      sqrt: n.sqrt || ((p) => s(d, p)),
      invertBatch: (p) => Vh(d, p),
      cmov: (p, S, k) => (k ? S : p),
      toBytes: (p) => (e ? Bn(p, i) : rn(p, i)),
      fromBytes: (p) => {
        if (p.length !== i)
          throw new Error(`Fp.fromBytes: expected ${i}, got ${p.length}`);
        return e ? en(p) : Dr(p);
      },
    });
  return Object.freeze(d);
}
function gc(r) {
  if (typeof r != "bigint") throw new Error("field order must be bigint");
  let t = r.toString(2).length;
  return Math.ceil(t / 8);
}
function Bs(r) {
  let t = gc(r);
  return t + Math.ceil(t / 2);
}
function mc(r, t, e = !1) {
  let n = r.length,
    o = gc(t),
    i = Bs(t);
  if (n < 16 || n < i || n > 1024)
    throw new Error(`expected ${i}-1024 bytes of input, got ${n}`);
  let s = e ? Dr(r) : en(r),
    d = ae(s, t - Ie) + Ie;
  return e ? Bn(d, o) : rn(d, o);
}
var Gh = BigInt(0),
  Ss = BigInt(1),
  Es = new WeakMap(),
  bc = new WeakMap();
function Yo(r, t) {
  let e = (i, s) => {
      let d = s.negate();
      return i ? d : s;
    },
    n = (i) => {
      if (!Number.isSafeInteger(i) || i <= 0 || i > t)
        throw new Error(`Wrong window size=${i}, should be [1..${t}]`);
    },
    o = (i) => {
      n(i);
      let s = Math.ceil(t / i) + 1,
        d = 2 ** (i - 1);
      return { windows: s, windowSize: d };
    };
  return {
    constTimeNegate: e,
    unsafeLadder(i, s) {
      let d = r.ZERO,
        p = i;
      for (; s > Gh; ) s & Ss && (d = d.add(p)), (p = p.double()), (s >>= Ss);
      return d;
    },
    precomputeWindow(i, s) {
      let { windows: d, windowSize: p } = o(s),
        S = [],
        k = i,
        _ = k;
      for (let P = 0; P < d; P++) {
        (_ = k), S.push(_);
        for (let M = 1; M < p; M++) (_ = _.add(k)), S.push(_);
        k = _.double();
      }
      return S;
    },
    wNAF(i, s, d) {
      let { windows: p, windowSize: S } = o(i),
        k = r.ZERO,
        _ = r.BASE,
        P = BigInt(2 ** i - 1),
        M = 2 ** i,
        X = BigInt(i);
      for (let U = 0; U < p; U++) {
        let T = U * S,
          H = Number(d & P);
        (d >>= X), H > S && ((H -= M), (d += Ss));
        let J = T,
          D = T + Math.abs(H) - 1,
          Q = U % 2 !== 0,
          at = H < 0;
        H === 0 ? (_ = _.add(e(Q, s[J]))) : (k = k.add(e(at, s[D])));
      }
      return { p: k, f: _ };
    },
    wNAFCached(i, s, d) {
      let p = bc.get(i) || 1,
        S = Es.get(i);
      return (
        S || ((S = this.precomputeWindow(i, p)), p !== 1 && Es.set(i, d(S))),
        this.wNAF(p, S, s)
      );
    },
    setWindowSize(i, s) {
      n(s), bc.set(i, s), Es.delete(i);
    },
  };
}
function Zo(r, t, e, n) {
  if (!Array.isArray(e) || !Array.isArray(n) || n.length !== e.length)
    throw new Error("arrays of points and scalars must have equal length");
  n.forEach((k, _) => {
    if (!t.isValid(k)) throw new Error(`wrong scalar at index ${_}`);
  }),
    e.forEach((k, _) => {
      if (!(k instanceof r)) throw new Error(`wrong point at index ${_}`);
    });
  let o = bs(BigInt(e.length)),
    i = o > 12 ? o - 3 : o > 4 ? o - 2 : o ? 2 : 1,
    s = (1 << i) - 1,
    d = new Array(s + 1).fill(r.ZERO),
    p = Math.floor((t.BITS - 1) / i) * i,
    S = r.ZERO;
  for (let k = p; k >= 0; k -= i) {
    d.fill(r.ZERO);
    for (let P = 0; P < n.length; P++) {
      let M = n[P],
        X = Number((M >> BigInt(k)) & BigInt(s));
      d[X] = d[X].add(e[P]);
    }
    let _ = r.ZERO;
    for (let P = d.length - 1, M = r.ZERO; P > 0; P--)
      (M = M.add(d[P])), (_ = _.add(M));
    if (((S = S.add(_)), k !== 0)) for (let P = 0; P < i; P++) S = S.double();
  }
  return S;
}
function uo(r) {
  return (
    vs(r.Fp),
    Pr(
      r,
      { n: "bigint", h: "bigint", Gx: "field", Gy: "field" },
      { nBitLength: "isSafeInteger", nByteLength: "isSafeInteger" }
    ),
    Object.freeze({ ...ks(r.n, r.nBitLength), ...r, p: r.Fp.ORDER })
  );
}
var Er = BigInt(0),
  dr = BigInt(1),
  Xo = BigInt(2),
  Yh = BigInt(8),
  Zh = { zip215: !0 };
function Xh(r) {
  let t = uo(r);
  return (
    Pr(
      r,
      { hash: "function", a: "bigint", d: "bigint", randomBytes: "function" },
      {
        adjustScalarBytes: "function",
        domain: "function",
        uvRatio: "function",
        mapToCurve: "function",
      }
    ),
    Object.freeze({ ...t })
  );
}
function wc(r) {
  let t = Xh(r),
    { Fp: e, n, prehash: o, hash: i, randomBytes: s, nByteLength: d, h: p } = t,
    S = Xo << (BigInt(d * 8) - dr),
    k = e.create,
    _ = nn(t.n, t.nBitLength),
    P =
      t.uvRatio ||
      ((l, y) => {
        try {
          return { isValid: !0, value: e.sqrt(l * e.inv(y)) };
        } catch {
          return { isValid: !1, value: Er };
        }
      }),
    M = t.adjustScalarBytes || ((l) => l),
    X =
      t.domain ||
      ((l, y, b) => {
        if ((Sr("phflag", b), y.length || b))
          throw new Error("Contexts/pre-hash are not supported");
        return l;
      });
  function U(l, y) {
    lr("coordinate " + l, y, Er, S);
  }
  function T(l) {
    if (!(l instanceof D)) throw new Error("ExtendedPoint expected");
  }
  let H = Sn((l, y) => {
      let { ex: b, ey: B, ez: I } = l,
        x = l.is0();
      y == null && (y = x ? Yh : e.inv(I));
      let f = k(b * y),
        v = k(B * y),
        q = k(I * y);
      if (x) return { x: Er, y: dr };
      if (q !== dr) throw new Error("invZ was invalid");
      return { x: f, y: v };
    }),
    J = Sn((l) => {
      let { a: y, d: b } = t;
      if (l.is0()) throw new Error("bad point: ZERO");
      let { ex: B, ey: I, ez: x, et: f } = l,
        v = k(B * B),
        q = k(I * I),
        Z = k(x * x),
        nt = k(Z * Z),
        mt = k(v * y),
        vt = k(Z * k(mt + q)),
        Rt = k(nt + k(b * k(v * q)));
      if (vt !== Rt) throw new Error("bad point: equation left != right (1)");
      let fe = k(B * I),
        Et = k(x * f);
      if (fe !== Et) throw new Error("bad point: equation left != right (2)");
      return !0;
    });
  class D {
    constructor(y, b, B, I) {
      (this.ex = y),
        (this.ey = b),
        (this.ez = B),
        (this.et = I),
        U("x", y),
        U("y", b),
        U("z", B),
        U("t", I),
        Object.freeze(this);
    }
    get x() {
      return this.toAffine().x;
    }
    get y() {
      return this.toAffine().y;
    }
    static fromAffine(y) {
      if (y instanceof D) throw new Error("extended point not allowed");
      let { x: b, y: B } = y || {};
      return U("x", b), U("y", B), new D(b, B, dr, k(b * B));
    }
    static normalizeZ(y) {
      let b = e.invertBatch(y.map((B) => B.ez));
      return y.map((B, I) => B.toAffine(b[I])).map(D.fromAffine);
    }
    static msm(y, b) {
      return Zo(D, _, y, b);
    }
    _setWindowSize(y) {
      rt.setWindowSize(this, y);
    }
    assertValidity() {
      J(this);
    }
    equals(y) {
      T(y);
      let { ex: b, ey: B, ez: I } = this,
        { ex: x, ey: f, ez: v } = y,
        q = k(b * v),
        Z = k(x * I),
        nt = k(B * v),
        mt = k(f * I);
      return q === Z && nt === mt;
    }
    is0() {
      return this.equals(D.ZERO);
    }
    negate() {
      return new D(k(-this.ex), this.ey, this.ez, k(-this.et));
    }
    double() {
      let { a: y } = t,
        { ex: b, ey: B, ez: I } = this,
        x = k(b * b),
        f = k(B * B),
        v = k(Xo * k(I * I)),
        q = k(y * x),
        Z = b + B,
        nt = k(k(Z * Z) - x - f),
        mt = q + f,
        vt = mt - v,
        Rt = q - f,
        fe = k(nt * vt),
        Et = k(mt * Rt),
        Ot = k(nt * Rt),
        ur = k(vt * mt);
      return new D(fe, Et, ur, Ot);
    }
    add(y) {
      T(y);
      let { a: b, d: B } = t,
        { ex: I, ey: x, ez: f, et: v } = this,
        { ex: q, ey: Z, ez: nt, et: mt } = y;
      if (b === BigInt(-1)) {
        let ge = k((x - I) * (Z + q)),
          ue = k((x + I) * (Z - q)),
          Lr = k(ue - ge);
        if (Lr === Er) return this.double();
        let ie = k(f * Xo * mt),
          he = k(v * Xo * nt),
          Rr = he + ie,
          le = ue + ge,
          de = he - ie,
          mn = k(Rr * Lr),
          Ee = k(le * de),
          me = k(Rr * de),
          Yr = k(Lr * le);
        return new D(mn, Ee, Yr, me);
      }
      let vt = k(I * q),
        Rt = k(x * Z),
        fe = k(v * B * mt),
        Et = k(f * nt),
        Ot = k((I + x) * (q + Z) - vt - Rt),
        ur = Et - fe,
        ne = Et + fe,
        oe = k(Rt - b * vt),
        gn = k(Ot * ur),
        ke = k(ne * oe),
        te = k(Ot * oe),
        Nr = k(ur * ne);
      return new D(gn, ke, Nr, te);
    }
    subtract(y) {
      return this.add(y.negate());
    }
    wNAF(y) {
      return rt.wNAFCached(this, y, D.normalizeZ);
    }
    multiply(y) {
      let b = y;
      lr("scalar", b, dr, n);
      let { p: B, f: I } = this.wNAF(b);
      return D.normalizeZ([B, I])[0];
    }
    multiplyUnsafe(y) {
      let b = y;
      return (
        lr("scalar", b, Er, n),
        b === Er
          ? at
          : this.equals(at) || b === dr
          ? this
          : this.equals(Q)
          ? this.wNAF(b).p
          : rt.unsafeLadder(this, b)
      );
    }
    isSmallOrder() {
      return this.multiplyUnsafe(p).is0();
    }
    isTorsionFree() {
      return rt.unsafeLadder(this, n).is0();
    }
    toAffine(y) {
      return H(this, y);
    }
    clearCofactor() {
      let { h: y } = t;
      return y === dr ? this : this.multiplyUnsafe(y);
    }
    static fromHex(y, b = !1) {
      let { d: B, a: I } = t,
        x = e.BYTES;
      (y = Fe("pointHex", y, x)), Sr("zip215", b);
      let f = y.slice(),
        v = y[x - 1];
      f[x - 1] = v & -129;
      let q = en(f),
        Z = b ? S : e.ORDER;
      lr("pointHex.y", q, Er, Z);
      let nt = k(q * q),
        mt = k(nt - dr),
        vt = k(B * nt - I),
        { isValid: Rt, value: fe } = P(mt, vt);
      if (!Rt) throw new Error("Point.fromHex: invalid y coordinate");
      let Et = (fe & dr) === dr,
        Ot = (v & 128) !== 0;
      if (!b && fe === Er && Ot)
        throw new Error("Point.fromHex: x=0 and x_0=1");
      return Ot !== Et && (fe = k(-fe)), D.fromAffine({ x: fe, y: q });
    }
    static fromPrivateKey(y) {
      return wt(y).point;
    }
    toRawBytes() {
      let { x: y, y: b } = this.toAffine(),
        B = Bn(b, e.BYTES);
      return (B[B.length - 1] |= y & dr ? 128 : 0), B;
    }
    toHex() {
      return qr(this.toRawBytes());
    }
  }
  (D.BASE = new D(t.Gx, t.Gy, dr, k(t.Gx * t.Gy))),
    (D.ZERO = new D(Er, dr, dr, Er));
  let { BASE: Q, ZERO: at } = D,
    rt = Yo(D, d * 8);
  function it(l) {
    return ae(l, n);
  }
  function ut(l) {
    return it(en(l));
  }
  function wt(l) {
    let y = d;
    l = Fe("private key", l, y);
    let b = Fe("hashed private key", i(l), 2 * y),
      B = M(b.slice(0, y)),
      I = b.slice(y, 2 * y),
      x = ut(B),
      f = Q.multiply(x),
      v = f.toRawBytes();
    return { head: B, prefix: I, scalar: x, point: f, pointBytes: v };
  }
  function re(l) {
    return wt(l).pointBytes;
  }
  function xt(l = new Uint8Array(), ...y) {
    let b = Wr(...y);
    return ut(i(X(b, Fe("context", l), !!o)));
  }
  function Ct(l, y, b = {}) {
    (l = Fe("message", l)), o && (l = o(l));
    let { prefix: B, scalar: I, pointBytes: x } = wt(y),
      f = xt(b.context, B, l),
      v = Q.multiply(f).toRawBytes(),
      q = xt(b.context, v, x, l),
      Z = it(f + q * I);
    lr("signature.s", Z, Er, n);
    let nt = Wr(v, Bn(Z, e.BYTES));
    return Fe("result", nt, d * 2);
  }
  let E = Zh;
  function a(l, y, b, B = E) {
    let { context: I, zip215: x } = B,
      f = e.BYTES;
    (l = Fe("signature", l, 2 * f)),
      (y = Fe("message", y)),
      x !== void 0 && Sr("zip215", x),
      o && (y = o(y));
    let v = en(l.slice(f, 2 * f)),
      q,
      Z,
      nt;
    try {
      (q = D.fromHex(b, x)),
        (Z = D.fromHex(l.slice(0, f), x)),
        (nt = Q.multiplyUnsafe(v));
    } catch {
      return !1;
    }
    if (!x && q.isSmallOrder()) return !1;
    let mt = xt(I, Z.toRawBytes(), q.toRawBytes(), y);
    return Z.add(q.multiplyUnsafe(mt))
      .subtract(nt)
      .clearCofactor()
      .equals(D.ZERO);
  }
  return (
    Q._setWindowSize(8),
    {
      CURVE: t,
      getPublicKey: re,
      sign: Ct,
      verify: a,
      ExtendedPoint: D,
      utils: {
        getExtendedPublicKey: wt,
        randomPrivateKey: () => s(e.BYTES),
        precompute(l = 8, y = D.BASE) {
          return y._setWindowSize(l), y.multiply(BigInt(3)), y;
        },
      },
    }
  );
}
var _s = BigInt(
    "57896044618658097711785492504343953926634992332820282019728792003956564819949"
  ),
  xc = BigInt(
    "19681161376707505956807079304988542015446066515923890162744021073123829784752"
  ),
  op = BigInt(0),
  Jh = BigInt(1),
  vc = BigInt(2),
  ip = BigInt(3),
  Qh = BigInt(5),
  tl = BigInt(8);
function el(r) {
  let t = BigInt(10),
    e = BigInt(20),
    n = BigInt(40),
    o = BigInt(80),
    i = _s,
    d = (((r * r) % i) * r) % i,
    p = (Le(d, vc, i) * d) % i,
    S = (Le(p, Jh, i) * r) % i,
    k = (Le(S, Qh, i) * S) % i,
    _ = (Le(k, t, i) * k) % i,
    P = (Le(_, e, i) * _) % i,
    M = (Le(P, n, i) * P) % i,
    X = (Le(M, o, i) * M) % i,
    U = (Le(X, o, i) * M) % i,
    T = (Le(U, t, i) * k) % i;
  return { pow_p_5_8: (Le(T, vc, i) * r) % i, b2: d };
}
function rl(r) {
  return (r[0] &= 248), (r[31] &= 127), (r[31] |= 64), r;
}
function nl(r, t) {
  let e = _s,
    n = ae(t * t * t, e),
    o = ae(n * n * t, e),
    i = el(r * o).pow_p_5_8,
    s = ae(r * n * i, e),
    d = ae(t * s * s, e),
    p = s,
    S = ae(s * xc, e),
    k = d === r,
    _ = d === ae(-r, e),
    P = d === ae(-r * xc, e);
  return (
    k && (s = p),
    (_ || P) && (s = S),
    yc(s, e) && (s = ae(-s, e)),
    { isValid: k || _, value: s }
  );
}
var ol = nn(_s, void 0, !0),
  il = {
    a: BigInt(-1),
    d: BigInt(
      "37095705934669439343138083508754565189542113879843219016388785533085940283555"
    ),
    Fp: ol,
    n: BigInt(
      "7237005577332262213973186563042994240857116359379907606001950938285454250989"
    ),
    h: tl,
    Gx: BigInt(
      "15112221349535400772501151409588531511454012693041857206046113283949847762202"
    ),
    Gy: BigInt(
      "46316835694926478169428394003475163141307993866256225615783033603165251855960"
    ),
    hash: uc,
    randomBytes: Ho,
    adjustScalarBytes: rl,
    uvRatio: nl,
  },
  _n = wc(il);
var da = br(Is()),
  yr = br(Lc());
function Ms(r) {
  if (!Number.isSafeInteger(r) || r < 0)
    throw new Error(`positive integer expected, not ${r}`);
}
function fl(r) {
  return (
    r instanceof Uint8Array ||
    (r != null && typeof r == "object" && r.constructor.name === "Uint8Array")
  );
}
function ho(r, ...t) {
  if (!fl(r)) throw new Error("Uint8Array expected");
  if (t.length > 0 && !t.includes(r.length))
    throw new Error(
      `Uint8Array expected of length ${t}, not of length=${r.length}`
    );
}
function $n(r, t = !0) {
  if (r.destroyed) throw new Error("Hash instance has been destroyed");
  if (t && r.finished) throw new Error("Hash#digest() has already been called");
}
function ti(r, t) {
  ho(r);
  let e = t.outputLen;
  if (r.length < e)
    throw new Error(
      `digestInto() expects output buffer of length at least ${e}`
    );
}
var Rc = (r) =>
    new Uint32Array(r.buffer, r.byteOffset, Math.floor(r.byteLength / 4)),
  ei = (r) => new DataView(r.buffer, r.byteOffset, r.byteLength),
  _r = (r, t) => (r << (32 - t)) | (r >>> t);
var Ts = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68,
  ul = (r) =>
    ((r << 24) & 4278190080) |
    ((r << 8) & 16711680) |
    ((r >>> 8) & 65280) |
    ((r >>> 24) & 255);
function Ps(r) {
  for (let t = 0; t < r.length; t++) r[t] = ul(r[t]);
}
function hl(r) {
  if (typeof r != "string")
    throw new Error(`utf8ToBytes expected string, got ${typeof r}`);
  return new Uint8Array(new TextEncoder().encode(r));
}
function jn(r) {
  return typeof r == "string" && (r = hl(r)), ho(r), r;
}
var Vn = class {
    clone() {
      return this._cloneInto();
    }
  },
  dp = {}.toString;
function ri(r) {
  let t = (n) => r().update(jn(n)).digest(),
    e = r();
  return (
    (t.outputLen = e.outputLen),
    (t.blockLen = e.blockLen),
    (t.create = () => r()),
    t
  );
}
function Mc(r) {
  let t = (n, o) => r(o).update(jn(n)).digest(),
    e = r({});
  return (
    (t.outputLen = e.outputLen),
    (t.blockLen = e.blockLen),
    (t.create = (n) => r(n)),
    t
  );
}
function ll(r, t, e, n) {
  if (typeof r.setBigUint64 == "function") return r.setBigUint64(t, e, n);
  let o = BigInt(32),
    i = BigInt(4294967295),
    s = Number((e >> o) & i),
    d = Number(e & i),
    p = n ? 4 : 0,
    S = n ? 0 : 4;
  r.setUint32(t + p, s, n), r.setUint32(t + S, d, n);
}
var Tc = (r, t, e) => (r & t) ^ (~r & e),
  Pc = (r, t, e) => (r & t) ^ (r & e) ^ (t & e),
  ni = class extends Vn {
    constructor(t, e, n, o) {
      super(),
        (this.blockLen = t),
        (this.outputLen = e),
        (this.padOffset = n),
        (this.isLE = o),
        (this.finished = !1),
        (this.length = 0),
        (this.pos = 0),
        (this.destroyed = !1),
        (this.buffer = new Uint8Array(t)),
        (this.view = ei(this.buffer));
    }
    update(t) {
      $n(this);
      let { view: e, buffer: n, blockLen: o } = this;
      t = jn(t);
      let i = t.length;
      for (let s = 0; s < i; ) {
        let d = Math.min(o - this.pos, i - s);
        if (d === o) {
          let p = ei(t);
          for (; o <= i - s; s += o) this.process(p, s);
          continue;
        }
        n.set(t.subarray(s, s + d), this.pos),
          (this.pos += d),
          (s += d),
          this.pos === o && (this.process(e, 0), (this.pos = 0));
      }
      return (this.length += t.length), this.roundClean(), this;
    }
    digestInto(t) {
      $n(this), ti(t, this), (this.finished = !0);
      let { buffer: e, view: n, blockLen: o, isLE: i } = this,
        { pos: s } = this;
      (e[s++] = 128),
        this.buffer.subarray(s).fill(0),
        this.padOffset > o - s && (this.process(n, 0), (s = 0));
      for (let _ = s; _ < o; _++) e[_] = 0;
      ll(n, o - 8, BigInt(this.length * 8), i), this.process(n, 0);
      let d = ei(t),
        p = this.outputLen;
      if (p % 4) throw new Error("_sha2: outputLen should be aligned to 32bit");
      let S = p / 4,
        k = this.get();
      if (S > k.length) throw new Error("_sha2: outputLen bigger than state");
      for (let _ = 0; _ < S; _++) d.setUint32(4 * _, k[_], i);
    }
    digest() {
      let { buffer: t, outputLen: e } = this;
      this.digestInto(t);
      let n = t.slice(0, e);
      return this.destroy(), n;
    }
    _cloneInto(t) {
      t || (t = new this.constructor()), t.set(...this.get());
      let {
        blockLen: e,
        buffer: n,
        length: o,
        finished: i,
        destroyed: s,
        pos: d,
      } = this;
      return (
        (t.length = o),
        (t.pos = d),
        (t.finished = i),
        (t.destroyed = s),
        o % e && t.buffer.set(n),
        t
      );
    }
  };
var dl = new Uint32Array([
    1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993,
    2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987,
    1925078388, 2162078206, 2614888103, 3248222580, 3835390401, 4022224774,
    264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986,
    2554220882, 2821834349, 2952996808, 3210313671, 3336571891, 3584528711,
    113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291,
    1695183700, 1986661051, 2177026350, 2456956037, 2730485921, 2820302411,
    3259730800, 3345764771, 3516065817, 3600352804, 4094571909, 275423344,
    430227734, 506948616, 659060556, 883997877, 958139571, 1322822218,
    1537002063, 1747873779, 1955562222, 2024104815, 2227730452, 2361852424,
    2428436474, 2756734187, 3204031479, 3329325298,
  ]),
  on = new Uint32Array([
    1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924,
    528734635, 1541459225,
  ]),
  sn = new Uint32Array(64),
  Cs = class extends ni {
    constructor() {
      super(64, 32, 8, !1),
        (this.A = on[0] | 0),
        (this.B = on[1] | 0),
        (this.C = on[2] | 0),
        (this.D = on[3] | 0),
        (this.E = on[4] | 0),
        (this.F = on[5] | 0),
        (this.G = on[6] | 0),
        (this.H = on[7] | 0);
    }
    get() {
      let { A: t, B: e, C: n, D: o, E: i, F: s, G: d, H: p } = this;
      return [t, e, n, o, i, s, d, p];
    }
    set(t, e, n, o, i, s, d, p) {
      (this.A = t | 0),
        (this.B = e | 0),
        (this.C = n | 0),
        (this.D = o | 0),
        (this.E = i | 0),
        (this.F = s | 0),
        (this.G = d | 0),
        (this.H = p | 0);
    }
    process(t, e) {
      for (let _ = 0; _ < 16; _++, e += 4) sn[_] = t.getUint32(e, !1);
      for (let _ = 16; _ < 64; _++) {
        let P = sn[_ - 15],
          M = sn[_ - 2],
          X = _r(P, 7) ^ _r(P, 18) ^ (P >>> 3),
          U = _r(M, 17) ^ _r(M, 19) ^ (M >>> 10);
        sn[_] = (U + sn[_ - 7] + X + sn[_ - 16]) | 0;
      }
      let { A: n, B: o, C: i, D: s, E: d, F: p, G: S, H: k } = this;
      for (let _ = 0; _ < 64; _++) {
        let P = _r(d, 6) ^ _r(d, 11) ^ _r(d, 25),
          M = (k + P + Tc(d, p, S) + dl[_] + sn[_]) | 0,
          U = ((_r(n, 2) ^ _r(n, 13) ^ _r(n, 22)) + Pc(n, o, i)) | 0;
        (k = S),
          (S = p),
          (p = d),
          (d = (s + M) | 0),
          (s = i),
          (i = o),
          (o = n),
          (n = (M + U) | 0);
      }
      (n = (n + this.A) | 0),
        (o = (o + this.B) | 0),
        (i = (i + this.C) | 0),
        (s = (s + this.D) | 0),
        (d = (d + this.E) | 0),
        (p = (p + this.F) | 0),
        (S = (S + this.G) | 0),
        (k = (k + this.H) | 0),
        this.set(n, o, i, s, d, p, S, k);
    }
    roundClean() {
      sn.fill(0);
    }
    destroy() {
      this.set(0, 0, 0, 0, 0, 0, 0, 0), this.buffer.fill(0);
    }
  };
var Us = ri(() => new Cs());
var no = br(Wc()),
  L = br(Hs()),
  eu = br(Hs()),
  Oo = br(Hc());
var $s = class extends TypeError {
  constructor(t, e) {
    let n,
      { message: o, explanation: i, ...s } = t,
      { path: d } = t,
      p = d.length === 0 ? o : `At path: ${d.join(".")} -- ${o}`;
    super(i ?? p),
      i != null && (this.cause = p),
      Object.assign(this, s),
      (this.name = this.constructor.name),
      (this.failures = () => n ?? (n = [t, ...e()]));
  }
};
function Nl(r) {
  return bo(r) && typeof r[Symbol.iterator] == "function";
}
function bo(r) {
  return typeof r == "object" && r != null;
}
function Mi(r) {
  return bo(r) && !Array.isArray(r);
}
function Ar(r) {
  return typeof r == "symbol"
    ? r.toString()
    : typeof r == "string"
    ? JSON.stringify(r)
    : `${r}`;
}
function zl(r) {
  let { done: t, value: e } = r.next();
  return t ? void 0 : e;
}
function Fl(r, t, e, n) {
  if (r === !0) return;
  r === !1 ? (r = {}) : typeof r == "string" && (r = { message: r });
  let { path: o, branch: i } = t,
    { type: s } = e,
    {
      refinement: d,
      message: p = `Expected a value of type \`${s}\`${
        d ? ` with refinement \`${d}\`` : ""
      }, but received: \`${Ar(n)}\``,
    } = r;
  return {
    value: n,
    type: s,
    refinement: d,
    key: o[o.length - 1],
    path: o,
    branch: i,
    ...r,
    message: p,
  };
}
function* $c(r, t, e, n) {
  Nl(r) || (r = [r]);
  for (let o of r) {
    let i = Fl(o, t, e, n);
    i && (yield i);
  }
}
function* Vs(r, t, e = {}) {
  let { path: n = [], branch: o = [r], coerce: i = !1, mask: s = !1 } = e,
    d = { path: n, branch: o, mask: s };
  i && (r = t.coercer(r, d));
  let p = "valid";
  for (let S of t.validator(r, d))
    (S.explanation = e.message), (p = "not_valid"), yield [S, void 0];
  for (let [S, k, _] of t.entries(r, d)) {
    let P = Vs(k, _, {
      path: S === void 0 ? n : [...n, S],
      branch: S === void 0 ? o : [...o, k],
      coerce: i,
      mask: s,
      message: e.message,
    });
    for (let M of P)
      M[0]
        ? ((p = M[0].refinement != null ? "not_refined" : "not_valid"),
          yield [M[0], void 0])
        : i &&
          ((k = M[1]),
          S === void 0
            ? (r = k)
            : r instanceof Map
            ? r.set(S, k)
            : r instanceof Set
            ? r.add(k)
            : bo(r) && (k !== void 0 || S in r) && (r[S] = k));
  }
  if (p !== "not_valid")
    for (let S of t.refiner(r, d))
      (S.explanation = e.message), (p = "not_refined"), yield [S, void 0];
  p === "valid" && (yield [void 0, r]);
}
var xr = class {
  constructor(t) {
    let {
      type: e,
      schema: n,
      validator: o,
      refiner: i,
      coercer: s = (p) => p,
      entries: d = function* () {},
    } = t;
    (this.type = e),
      (this.schema = n),
      (this.entries = d),
      (this.coercer = s),
      o
        ? (this.validator = (p, S) => {
            let k = o(p, S);
            return $c(k, S, this, p);
          })
        : (this.validator = () => []),
      i
        ? (this.refiner = (p, S) => {
            let k = i(p, S);
            return $c(k, S, this, p);
          })
        : (this.refiner = () => []);
  }
  assert(t, e) {
    return Vc(t, this, e);
  }
  create(t, e) {
    return Qn(t, this, e);
  }
  is(t) {
    return jc(t, this);
  }
  mask(t, e) {
    return Kl(t, this, e);
  }
  validate(t, e = {}) {
    return wo(t, this, e);
  }
};
function Vc(r, t, e) {
  let n = wo(r, t, { message: e });
  if (n[0]) throw n[0];
}
function Qn(r, t, e) {
  let n = wo(r, t, { coerce: !0, message: e });
  if (n[0]) throw n[0];
  return n[1];
}
function Kl(r, t, e) {
  let n = wo(r, t, { coerce: !0, mask: !0, message: e });
  if (n[0]) throw n[0];
  return n[1];
}
function jc(r, t) {
  return !wo(r, t)[0];
}
function wo(r, t, e = {}) {
  let n = Vs(r, t, e),
    o = zl(n);
  return o[0]
    ? [
        new $s(o[0], function* () {
          for (let s of n) s[0] && (yield s[0]);
        }),
        void 0,
      ]
    : [void 0, o[1]];
}
function Rn(r, t) {
  return new xr({ type: r, schema: null, validator: t });
}
function Gc() {
  return Rn("any", () => !0);
}
function lt(r) {
  return new xr({
    type: "array",
    schema: r,
    *entries(t) {
      if (r && Array.isArray(t))
        for (let [e, n] of t.entries()) yield [e, n, r];
    },
    coercer(t) {
      return Array.isArray(t) ? t.slice() : t;
    },
    validator(t) {
      return (
        Array.isArray(t) || `Expected an array value, but received: ${Ar(t)}`
      );
    },
  });
}
function Ir() {
  return Rn("boolean", (r) => typeof r == "boolean");
}
function Ti(r) {
  return Rn(
    "instance",
    (t) =>
      t instanceof r ||
      `Expected a \`${r.name}\` instance, but received: ${Ar(t)}`
  );
}
function Re(r) {
  let t = Ar(r),
    e = typeof r;
  return new xr({
    type: "literal",
    schema: e === "string" || e === "number" || e === "boolean" ? r : null,
    validator(n) {
      return n === r || `Expected the literal \`${t}\`, but received: ${Ar(n)}`;
    },
  });
}
function ql() {
  return Rn("never", () => !1);
}
function dt(r) {
  return new xr({
    ...r,
    validator: (t, e) => t === null || r.validator(t, e),
    refiner: (t, e) => t === null || r.refiner(t, e),
  });
}
function O() {
  return Rn(
    "number",
    (r) =>
      (typeof r == "number" && !isNaN(r)) ||
      `Expected a number, but received: ${Ar(r)}`
  );
}
function St(r) {
  return new xr({
    ...r,
    validator: (t, e) => t === void 0 || r.validator(t, e),
    refiner: (t, e) => t === void 0 || r.refiner(t, e),
  });
}
function js(r, t) {
  return new xr({
    type: "record",
    schema: null,
    *entries(e) {
      if (bo(e))
        for (let n in e) {
          let o = e[n];
          yield [n, n, r], yield [n, o, t];
        }
    },
    validator(e) {
      return Mi(e) || `Expected an object, but received: ${Ar(e)}`;
    },
    coercer(e) {
      return Mi(e) ? { ...e } : e;
    },
  });
}
function ot() {
  return Rn(
    "string",
    (r) => typeof r == "string" || `Expected a string, but received: ${Ar(r)}`
  );
}
function Pi(r) {
  let t = ql();
  return new xr({
    type: "tuple",
    schema: null,
    *entries(e) {
      if (Array.isArray(e)) {
        let n = Math.max(r.length, e.length);
        for (let o = 0; o < n; o++) yield [o, e[o], r[o] || t];
      }
    },
    validator(e) {
      return Array.isArray(e) || `Expected an array, but received: ${Ar(e)}`;
    },
    coercer(e) {
      return Array.isArray(e) ? e.slice() : e;
    },
  });
}
function Y(r) {
  let t = Object.keys(r);
  return new xr({
    type: "type",
    schema: r,
    *entries(e) {
      if (bo(e)) for (let n of t) yield [n, e[n], r[n]];
    },
    validator(e) {
      return Mi(e) || `Expected an object, but received: ${Ar(e)}`;
    },
    coercer(e) {
      return Mi(e) ? { ...e } : e;
    },
  });
}
function tr(r) {
  let t = r.map((e) => e.type).join(" | ");
  return new xr({
    type: "union",
    schema: null,
    coercer(e, n) {
      for (let o of r) {
        let [i, s] = o.validate(e, { coerce: !0, mask: n.mask });
        if (!i) return s;
      }
      return e;
    },
    validator(e, n) {
      let o = [];
      for (let i of r) {
        let [...s] = Vs(e, i, n),
          [d] = s;
        if (d[0]) for (let [p] of s) p && o.push(p);
        else return [];
      }
      return [
        `Expected the value to satisfy a union of \`${t}\`, but received: ${Ar(
          e
        )}`,
        ...o,
      ];
    },
  });
}
function Mn() {
  return Rn("unknown", () => !0);
}
function to(r, t, e) {
  return new xr({
    ...r,
    coercer: (n, o) => (jc(n, t) ? r.coercer(e(n, o), o) : r.coercer(n, o)),
  });
}
var T0 = br(wf());
var d0 = br(Fn(), 1);
var kf = br(vf(), 1);
var Ki = BigInt(4294967295),
  Bf = BigInt(32);
function p0(r, t = !1) {
  return t
    ? { h: Number(r & Ki), l: Number((r >> Bf) & Ki) }
    : { h: Number((r >> Bf) & Ki) | 0, l: Number(r & Ki) | 0 };
}
function Sf(r, t = !1) {
  let e = new Uint32Array(r.length),
    n = new Uint32Array(r.length);
  for (let o = 0; o < r.length; o++) {
    let { h: i, l: s } = p0(r[o], t);
    [e[o], n[o]] = [i, s];
  }
  return [e, n];
}
var Ef = (r, t, e) => (r << e) | (t >>> (32 - e)),
  _f = (r, t, e) => (t << e) | (r >>> (32 - e)),
  Af = (r, t, e) => (t << (e - 32)) | (r >>> (64 - e)),
  If = (r, t, e) => (r << (e - 32)) | (t >>> (64 - e));
var Mf = [],
  Tf = [],
  Pf = [],
  y0 = BigInt(0),
  Eo = BigInt(1),
  g0 = BigInt(2),
  m0 = BigInt(7),
  b0 = BigInt(256),
  w0 = BigInt(113);
for (let r = 0, t = Eo, e = 1, n = 0; r < 24; r++) {
  ([e, n] = [n, (2 * e + 3 * n) % 5]),
    Mf.push(2 * (5 * n + e)),
    Tf.push((((r + 1) * (r + 2)) / 2) % 64);
  let o = y0;
  for (let i = 0; i < 7; i++)
    (t = ((t << Eo) ^ ((t >> m0) * w0)) % b0),
      t & g0 && (o ^= Eo << ((Eo << BigInt(i)) - Eo));
  Pf.push(o);
}
var [x0, v0] = Sf(Pf, !0),
  Lf = (r, t, e) => (e > 32 ? Af(r, t, e) : Ef(r, t, e)),
  Rf = (r, t, e) => (e > 32 ? If(r, t, e) : _f(r, t, e));
function k0(r, t = 24) {
  let e = new Uint32Array(10);
  for (let n = 24 - t; n < 24; n++) {
    for (let s = 0; s < 10; s++)
      e[s] = r[s] ^ r[s + 10] ^ r[s + 20] ^ r[s + 30] ^ r[s + 40];
    for (let s = 0; s < 10; s += 2) {
      let d = (s + 8) % 10,
        p = (s + 2) % 10,
        S = e[p],
        k = e[p + 1],
        _ = Lf(S, k, 1) ^ e[d],
        P = Rf(S, k, 1) ^ e[d + 1];
      for (let M = 0; M < 50; M += 10) (r[s + M] ^= _), (r[s + M + 1] ^= P);
    }
    let o = r[2],
      i = r[3];
    for (let s = 0; s < 24; s++) {
      let d = Tf[s],
        p = Lf(o, i, d),
        S = Rf(o, i, d),
        k = Mf[s];
      (o = r[k]), (i = r[k + 1]), (r[k] = p), (r[k + 1] = S);
    }
    for (let s = 0; s < 50; s += 10) {
      for (let d = 0; d < 10; d++) e[d] = r[s + d];
      for (let d = 0; d < 10; d++)
        r[s + d] ^= ~e[(d + 2) % 10] & e[(d + 4) % 10];
    }
    (r[0] ^= x0[n]), (r[1] ^= v0[n]);
  }
  e.fill(0);
}
var qi = class r extends Vn {
    constructor(t, e, n, o = !1, i = 24) {
      if (
        (super(),
        (this.blockLen = t),
        (this.suffix = e),
        (this.outputLen = n),
        (this.enableXOF = o),
        (this.rounds = i),
        (this.pos = 0),
        (this.posOut = 0),
        (this.finished = !1),
        (this.destroyed = !1),
        Ms(n),
        0 >= this.blockLen || this.blockLen >= 200)
      )
        throw new Error("Sha3 supports only keccak-f1600 function");
      (this.state = new Uint8Array(200)), (this.state32 = Rc(this.state));
    }
    keccak() {
      Ts || Ps(this.state32),
        k0(this.state32, this.rounds),
        Ts || Ps(this.state32),
        (this.posOut = 0),
        (this.pos = 0);
    }
    update(t) {
      $n(this);
      let { blockLen: e, state: n } = this;
      t = jn(t);
      let o = t.length;
      for (let i = 0; i < o; ) {
        let s = Math.min(e - this.pos, o - i);
        for (let d = 0; d < s; d++) n[this.pos++] ^= t[i++];
        this.pos === e && this.keccak();
      }
      return this;
    }
    finish() {
      if (this.finished) return;
      this.finished = !0;
      let { state: t, suffix: e, pos: n, blockLen: o } = this;
      (t[n] ^= e),
        e & 128 && n === o - 1 && this.keccak(),
        (t[o - 1] ^= 128),
        this.keccak();
    }
    writeInto(t) {
      $n(this, !1), ho(t), this.finish();
      let e = this.state,
        { blockLen: n } = this;
      for (let o = 0, i = t.length; o < i; ) {
        this.posOut >= n && this.keccak();
        let s = Math.min(n - this.posOut, i - o);
        t.set(e.subarray(this.posOut, this.posOut + s), o),
          (this.posOut += s),
          (o += s);
      }
      return t;
    }
    xofInto(t) {
      if (!this.enableXOF)
        throw new Error("XOF is not possible for this instance");
      return this.writeInto(t);
    }
    xof(t) {
      return Ms(t), this.xofInto(new Uint8Array(t));
    }
    digestInto(t) {
      if ((ti(t, this), this.finished))
        throw new Error("digest() was already called");
      return this.writeInto(t), this.destroy(), t;
    }
    digest() {
      return this.digestInto(new Uint8Array(this.outputLen));
    }
    destroy() {
      (this.destroyed = !0), this.state.fill(0);
    }
    _cloneInto(t) {
      let {
        blockLen: e,
        suffix: n,
        outputLen: o,
        rounds: i,
        enableXOF: s,
      } = this;
      return (
        t || (t = new r(e, n, o, s, i)),
        t.state32.set(this.state32),
        (t.pos = this.pos),
        (t.posOut = this.posOut),
        (t.finished = this.finished),
        (t.rounds = i),
        (t.suffix = n),
        (t.outputLen = o),
        (t.enableXOF = s),
        (t.destroyed = this.destroyed),
        t
      );
    }
  },
  ln = (r, t, e) => ri(() => new qi(t, r, e)),
  vy = ln(6, 144, 224 / 8),
  ky = ln(6, 136, 256 / 8),
  By = ln(6, 104, 384 / 8),
  Sy = ln(6, 72, 512 / 8),
  Ey = ln(1, 144, 224 / 8),
  oa = ln(1, 136, 256 / 8),
  _y = ln(1, 104, 384 / 8),
  Ay = ln(1, 72, 512 / 8),
  Cf = (r, t, e) =>
    Mc((n = {}) => new qi(t, r, n.dkLen === void 0 ? e : n.dkLen, !0)),
  Iy = Cf(31, 168, 128 / 8),
  Ly = Cf(31, 136, 256 / 8);
var B0 = new Uint32Array([
    1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993,
    2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987,
    1925078388, 2162078206, 2614888103, 3248222580, 3835390401, 4022224774,
    264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986,
    2554220882, 2821834349, 2952996808, 3210313671, 3336571891, 3584528711,
    113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291,
    1695183700, 1986661051, 2177026350, 2456956037, 2730485921, 2820302411,
    3259730800, 3345764771, 3516065817, 3600352804, 4094571909, 275423344,
    430227734, 506948616, 659060556, 883997877, 958139571, 1322822218,
    1537002063, 1747873779, 1955562222, 2024104815, 2227730452, 2361852424,
    2428436474, 2756734187, 3204031479, 3329325298,
  ]),
  dn = new Uint32Array([
    1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924,
    528734635, 1541459225,
  ]),
  pn = new Uint32Array(64),
  ia = class extends Wn {
    constructor() {
      super(64, 32, 8, !1),
        (this.A = dn[0] | 0),
        (this.B = dn[1] | 0),
        (this.C = dn[2] | 0),
        (this.D = dn[3] | 0),
        (this.E = dn[4] | 0),
        (this.F = dn[5] | 0),
        (this.G = dn[6] | 0),
        (this.H = dn[7] | 0);
    }
    get() {
      let { A: t, B: e, C: n, D: o, E: i, F: s, G: d, H: p } = this;
      return [t, e, n, o, i, s, d, p];
    }
    set(t, e, n, o, i, s, d, p) {
      (this.A = t | 0),
        (this.B = e | 0),
        (this.C = n | 0),
        (this.D = o | 0),
        (this.E = i | 0),
        (this.F = s | 0),
        (this.G = d | 0),
        (this.H = p | 0);
    }
    process(t, e) {
      for (let _ = 0; _ < 16; _++, e += 4) pn[_] = t.getUint32(e, !1);
      for (let _ = 16; _ < 64; _++) {
        let P = pn[_ - 15],
          M = pn[_ - 2],
          X = Br(P, 7) ^ Br(P, 18) ^ (P >>> 3),
          U = Br(M, 17) ^ Br(M, 19) ^ (M >>> 10);
        pn[_] = (U + pn[_ - 7] + X + pn[_ - 16]) | 0;
      }
      let { A: n, B: o, C: i, D: s, E: d, F: p, G: S, H: k } = this;
      for (let _ = 0; _ < 64; _++) {
        let P = Br(d, 6) ^ Br(d, 11) ^ Br(d, 25),
          M = (k + P + ac(d, p, S) + B0[_] + pn[_]) | 0,
          U = ((Br(n, 2) ^ Br(n, 13) ^ Br(n, 22)) + cc(n, o, i)) | 0;
        (k = S),
          (S = p),
          (p = d),
          (d = (s + M) | 0),
          (s = i),
          (i = o),
          (o = n),
          (n = (M + U) | 0);
      }
      (n = (n + this.A) | 0),
        (o = (o + this.B) | 0),
        (i = (i + this.C) | 0),
        (s = (s + this.D) | 0),
        (d = (d + this.E) | 0),
        (p = (p + this.F) | 0),
        (S = (S + this.G) | 0),
        (k = (k + this.H) | 0),
        this.set(n, o, i, s, d, p, S, k);
    }
    roundClean() {
      pn.fill(0);
    }
    destroy() {
      this.set(0, 0, 0, 0, 0, 0, 0, 0), this.buffer.fill(0);
    }
  };
var Uf = Wo(() => new ia());
var Di = class extends Dn {
    constructor(t, e) {
      super(), (this.finished = !1), (this.destroyed = !1), oc(t);
      let n = ao(e);
      if (((this.iHash = t.create()), typeof this.iHash.update != "function"))
        throw new Error("Expected instance of class which extends utils.Hash");
      (this.blockLen = this.iHash.blockLen),
        (this.outputLen = this.iHash.outputLen);
      let o = this.blockLen,
        i = new Uint8Array(o);
      i.set(n.length > o ? t.create().update(n).digest() : n);
      for (let s = 0; s < i.length; s++) i[s] ^= 54;
      this.iHash.update(i), (this.oHash = t.create());
      for (let s = 0; s < i.length; s++) i[s] ^= 106;
      this.oHash.update(i), i.fill(0);
    }
    update(t) {
      return qn(this), this.iHash.update(t), this;
    }
    digestInto(t) {
      qn(this),
        Kn(t, this.outputLen),
        (this.finished = !0),
        this.iHash.digestInto(t),
        this.oHash.update(t),
        this.oHash.digestInto(t),
        this.destroy();
    }
    digest() {
      let t = new Uint8Array(this.oHash.outputLen);
      return this.digestInto(t), t;
    }
    _cloneInto(t) {
      t || (t = Object.create(Object.getPrototypeOf(this), {}));
      let {
        oHash: e,
        iHash: n,
        finished: o,
        destroyed: i,
        blockLen: s,
        outputLen: d,
      } = this;
      return (
        (t = t),
        (t.finished = o),
        (t.destroyed = i),
        (t.blockLen = s),
        (t.outputLen = d),
        (t.oHash = e._cloneInto(t.oHash)),
        (t.iHash = n._cloneInto(t.iHash)),
        t
      );
    }
    destroy() {
      (this.destroyed = !0), this.oHash.destroy(), this.iHash.destroy();
    }
  },
  sa = (r, t, e) => new Di(r, t).update(e).digest();
sa.create = (r, t) => new Di(r, t);
function Of(r) {
  r.lowS !== void 0 && Sr("lowS", r.lowS),
    r.prehash !== void 0 && Sr("prehash", r.prehash);
}
function S0(r) {
  let t = uo(r);
  Pr(
    t,
    { a: "field", b: "field" },
    {
      allowedPrivateKeyLengths: "array",
      wrapPrivateKey: "boolean",
      isTorsionFree: "function",
      clearCofactor: "function",
      allowInfinityPoint: "boolean",
      fromBytes: "function",
      toBytes: "function",
    }
  );
  let { endo: e, Fp: n, a: o } = t;
  if (e) {
    if (!n.eql(o, n.ZERO))
      throw new Error(
        "Endomorphism can only be defined for Koblitz curves that have a=0"
      );
    if (
      typeof e != "object" ||
      typeof e.beta != "bigint" ||
      typeof e.splitScalar != "function"
    )
      throw new Error(
        "Expected endomorphism with beta: bigint and splitScalar: function"
      );
  }
  return Object.freeze({ ...t });
}
var { bytesToNumberBE: E0, hexToBytes: _0 } = jo,
  Vr = {
    Err: class extends Error {
      constructor(t = "") {
        super(t);
      }
    },
    _tlv: {
      encode: (r, t) => {
        let { Err: e } = Vr;
        if (r < 0 || r > 256) throw new e("tlv.encode: wrong tag");
        if (t.length & 1) throw new e("tlv.encode: unpadded data");
        let n = t.length / 2,
          o = vn(n);
        if ((o.length / 2) & 128)
          throw new e("tlv.encode: long form length too big");
        let i = n > 127 ? vn((o.length / 2) | 128) : "";
        return `${vn(r)}${i}${o}${t}`;
      },
      decode(r, t) {
        let { Err: e } = Vr,
          n = 0;
        if (r < 0 || r > 256) throw new e("tlv.encode: wrong tag");
        if (t.length < 2 || t[n++] !== r) throw new e("tlv.decode: wrong tlv");
        let o = t[n++],
          i = !!(o & 128),
          s = 0;
        if (!i) s = o;
        else {
          let p = o & 127;
          if (!p)
            throw new e("tlv.decode(long): indefinite length not supported");
          if (p > 4) throw new e("tlv.decode(long): byte length is too big");
          let S = t.subarray(n, n + p);
          if (S.length !== p)
            throw new e("tlv.decode: length bytes not complete");
          if (S[0] === 0) throw new e("tlv.decode(long): zero leftmost byte");
          for (let k of S) s = (s << 8) | k;
          if (((n += p), s < 128))
            throw new e("tlv.decode(long): not minimal encoding");
        }
        let d = t.subarray(n, n + s);
        if (d.length !== s) throw new e("tlv.decode: wrong value length");
        return { v: d, l: t.subarray(n + s) };
      },
    },
    _int: {
      encode(r) {
        let { Err: t } = Vr;
        if (r < jr) throw new t("integer: negative integers are not allowed");
        let e = vn(r);
        if ((Number.parseInt(e[0], 16) & 8 && (e = "00" + e), e.length & 1))
          throw new t("unexpected assertion");
        return e;
      },
      decode(r) {
        let { Err: t } = Vr;
        if (r[0] & 128) throw new t("Invalid signature integer: negative");
        if (r[0] === 0 && !(r[1] & 128))
          throw new t("Invalid signature integer: unnecessary leading zero");
        return E0(r);
      },
    },
    toSig(r) {
      let { Err: t, _int: e, _tlv: n } = Vr,
        o = typeof r == "string" ? _0(r) : r;
      Hn(o);
      let { v: i, l: s } = n.decode(48, o);
      if (s.length) throw new t("Invalid signature: left bytes after parsing");
      let { v: d, l: p } = n.decode(2, i),
        { v: S, l: k } = n.decode(2, p);
      if (k.length) throw new t("Invalid signature: left bytes after parsing");
      return { r: e.decode(d), s: e.decode(S) };
    },
    hexFromSig(r) {
      let { _tlv: t, _int: e } = Vr,
        n = `${t.encode(2, e.encode(r.r))}${t.encode(2, e.encode(r.s))}`;
      return t.encode(48, n);
    },
  },
  jr = BigInt(0),
  je = BigInt(1),
  Ky = BigInt(2),
  Nf = BigInt(3),
  qy = BigInt(4);
function A0(r) {
  let t = S0(r),
    { Fp: e } = t,
    n = nn(t.n, t.nBitLength),
    o =
      t.toBytes ||
      ((U, T, H) => {
        let J = T.toAffine();
        return Wr(Uint8Array.from([4]), e.toBytes(J.x), e.toBytes(J.y));
      }),
    i =
      t.fromBytes ||
      ((U) => {
        let T = U.subarray(1),
          H = e.fromBytes(T.subarray(0, e.BYTES)),
          J = e.fromBytes(T.subarray(e.BYTES, 2 * e.BYTES));
        return { x: H, y: J };
      });
  function s(U) {
    let { a: T, b: H } = t,
      J = e.sqr(U),
      D = e.mul(J, U);
    return e.add(e.add(D, e.mul(U, T)), H);
  }
  if (!e.eql(e.sqr(t.Gy), s(t.Gx)))
    throw new Error("bad generator point: equation left != right");
  function d(U) {
    return co(U, je, t.n);
  }
  function p(U) {
    let {
      allowedPrivateKeyLengths: T,
      nByteLength: H,
      wrapPrivateKey: J,
      n: D,
    } = t;
    if (T && typeof U != "bigint") {
      if ((tn(U) && (U = qr(U)), typeof U != "string" || !T.includes(U.length)))
        throw new Error("Invalid key");
      U = U.padStart(H * 2, "0");
    }
    let Q;
    try {
      Q = typeof U == "bigint" ? U : Dr(Fe("private key", U, H));
    } catch {
      throw new Error(
        `private key must be ${H} bytes, hex or bigint, not ${typeof U}`
      );
    }
    return J && (Q = ae(Q, D)), lr("private key", Q, je, D), Q;
  }
  function S(U) {
    if (!(U instanceof P)) throw new Error("ProjectivePoint expected");
  }
  let k = Sn((U, T) => {
      let { px: H, py: J, pz: D } = U;
      if (e.eql(D, e.ONE)) return { x: H, y: J };
      let Q = U.is0();
      T == null && (T = Q ? e.ONE : e.inv(D));
      let at = e.mul(H, T),
        rt = e.mul(J, T),
        it = e.mul(D, T);
      if (Q) return { x: e.ZERO, y: e.ZERO };
      if (!e.eql(it, e.ONE)) throw new Error("invZ was invalid");
      return { x: at, y: rt };
    }),
    _ = Sn((U) => {
      if (U.is0()) {
        if (t.allowInfinityPoint && !e.is0(U.py)) return;
        throw new Error("bad point: ZERO");
      }
      let { x: T, y: H } = U.toAffine();
      if (!e.isValid(T) || !e.isValid(H))
        throw new Error("bad point: x or y not FE");
      let J = e.sqr(H),
        D = s(T);
      if (!e.eql(J, D)) throw new Error("bad point: equation left != right");
      if (!U.isTorsionFree())
        throw new Error("bad point: not in prime-order subgroup");
      return !0;
    });
  class P {
    constructor(T, H, J) {
      if (
        ((this.px = T),
        (this.py = H),
        (this.pz = J),
        T == null || !e.isValid(T))
      )
        throw new Error("x required");
      if (H == null || !e.isValid(H)) throw new Error("y required");
      if (J == null || !e.isValid(J)) throw new Error("z required");
      Object.freeze(this);
    }
    static fromAffine(T) {
      let { x: H, y: J } = T || {};
      if (!T || !e.isValid(H) || !e.isValid(J))
        throw new Error("invalid affine point");
      if (T instanceof P) throw new Error("projective point not allowed");
      let D = (Q) => e.eql(Q, e.ZERO);
      return D(H) && D(J) ? P.ZERO : new P(H, J, e.ONE);
    }
    get x() {
      return this.toAffine().x;
    }
    get y() {
      return this.toAffine().y;
    }
    static normalizeZ(T) {
      let H = e.invertBatch(T.map((J) => J.pz));
      return T.map((J, D) => J.toAffine(H[D])).map(P.fromAffine);
    }
    static fromHex(T) {
      let H = P.fromAffine(i(Fe("pointHex", T)));
      return H.assertValidity(), H;
    }
    static fromPrivateKey(T) {
      return P.BASE.multiply(p(T));
    }
    static msm(T, H) {
      return Zo(P, n, T, H);
    }
    _setWindowSize(T) {
      X.setWindowSize(this, T);
    }
    assertValidity() {
      _(this);
    }
    hasEvenY() {
      let { y: T } = this.toAffine();
      if (e.isOdd) return !e.isOdd(T);
      throw new Error("Field doesn't support isOdd");
    }
    equals(T) {
      S(T);
      let { px: H, py: J, pz: D } = this,
        { px: Q, py: at, pz: rt } = T,
        it = e.eql(e.mul(H, rt), e.mul(Q, D)),
        ut = e.eql(e.mul(J, rt), e.mul(at, D));
      return it && ut;
    }
    negate() {
      return new P(this.px, e.neg(this.py), this.pz);
    }
    double() {
      let { a: T, b: H } = t,
        J = e.mul(H, Nf),
        { px: D, py: Q, pz: at } = this,
        rt = e.ZERO,
        it = e.ZERO,
        ut = e.ZERO,
        wt = e.mul(D, D),
        re = e.mul(Q, Q),
        xt = e.mul(at, at),
        Ct = e.mul(D, Q);
      return (
        (Ct = e.add(Ct, Ct)),
        (ut = e.mul(D, at)),
        (ut = e.add(ut, ut)),
        (rt = e.mul(T, ut)),
        (it = e.mul(J, xt)),
        (it = e.add(rt, it)),
        (rt = e.sub(re, it)),
        (it = e.add(re, it)),
        (it = e.mul(rt, it)),
        (rt = e.mul(Ct, rt)),
        (ut = e.mul(J, ut)),
        (xt = e.mul(T, xt)),
        (Ct = e.sub(wt, xt)),
        (Ct = e.mul(T, Ct)),
        (Ct = e.add(Ct, ut)),
        (ut = e.add(wt, wt)),
        (wt = e.add(ut, wt)),
        (wt = e.add(wt, xt)),
        (wt = e.mul(wt, Ct)),
        (it = e.add(it, wt)),
        (xt = e.mul(Q, at)),
        (xt = e.add(xt, xt)),
        (wt = e.mul(xt, Ct)),
        (rt = e.sub(rt, wt)),
        (ut = e.mul(xt, re)),
        (ut = e.add(ut, ut)),
        (ut = e.add(ut, ut)),
        new P(rt, it, ut)
      );
    }
    add(T) {
      S(T);
      let { px: H, py: J, pz: D } = this,
        { px: Q, py: at, pz: rt } = T,
        it = e.ZERO,
        ut = e.ZERO,
        wt = e.ZERO,
        re = t.a,
        xt = e.mul(t.b, Nf),
        Ct = e.mul(H, Q),
        E = e.mul(J, at),
        a = e.mul(D, rt),
        u = e.add(H, J),
        l = e.add(Q, at);
      (u = e.mul(u, l)),
        (l = e.add(Ct, E)),
        (u = e.sub(u, l)),
        (l = e.add(H, D));
      let y = e.add(Q, rt);
      return (
        (l = e.mul(l, y)),
        (y = e.add(Ct, a)),
        (l = e.sub(l, y)),
        (y = e.add(J, D)),
        (it = e.add(at, rt)),
        (y = e.mul(y, it)),
        (it = e.add(E, a)),
        (y = e.sub(y, it)),
        (wt = e.mul(re, l)),
        (it = e.mul(xt, a)),
        (wt = e.add(it, wt)),
        (it = e.sub(E, wt)),
        (wt = e.add(E, wt)),
        (ut = e.mul(it, wt)),
        (E = e.add(Ct, Ct)),
        (E = e.add(E, Ct)),
        (a = e.mul(re, a)),
        (l = e.mul(xt, l)),
        (E = e.add(E, a)),
        (a = e.sub(Ct, a)),
        (a = e.mul(re, a)),
        (l = e.add(l, a)),
        (Ct = e.mul(E, l)),
        (ut = e.add(ut, Ct)),
        (Ct = e.mul(y, l)),
        (it = e.mul(u, it)),
        (it = e.sub(it, Ct)),
        (Ct = e.mul(u, E)),
        (wt = e.mul(y, wt)),
        (wt = e.add(wt, Ct)),
        new P(it, ut, wt)
      );
    }
    subtract(T) {
      return this.add(T.negate());
    }
    is0() {
      return this.equals(P.ZERO);
    }
    wNAF(T) {
      return X.wNAFCached(this, T, P.normalizeZ);
    }
    multiplyUnsafe(T) {
      lr("scalar", T, jr, t.n);
      let H = P.ZERO;
      if (T === jr) return H;
      if (T === je) return this;
      let { endo: J } = t;
      if (!J) return X.unsafeLadder(this, T);
      let { k1neg: D, k1: Q, k2neg: at, k2: rt } = J.splitScalar(T),
        it = H,
        ut = H,
        wt = this;
      for (; Q > jr || rt > jr; )
        Q & je && (it = it.add(wt)),
          rt & je && (ut = ut.add(wt)),
          (wt = wt.double()),
          (Q >>= je),
          (rt >>= je);
      return (
        D && (it = it.negate()),
        at && (ut = ut.negate()),
        (ut = new P(e.mul(ut.px, J.beta), ut.py, ut.pz)),
        it.add(ut)
      );
    }
    multiply(T) {
      let { endo: H, n: J } = t;
      lr("scalar", T, je, J);
      let D, Q;
      if (H) {
        let { k1neg: at, k1: rt, k2neg: it, k2: ut } = H.splitScalar(T),
          { p: wt, f: re } = this.wNAF(rt),
          { p: xt, f: Ct } = this.wNAF(ut);
        (wt = X.constTimeNegate(at, wt)),
          (xt = X.constTimeNegate(it, xt)),
          (xt = new P(e.mul(xt.px, H.beta), xt.py, xt.pz)),
          (D = wt.add(xt)),
          (Q = re.add(Ct));
      } else {
        let { p: at, f: rt } = this.wNAF(T);
        (D = at), (Q = rt);
      }
      return P.normalizeZ([D, Q])[0];
    }
    multiplyAndAddUnsafe(T, H, J) {
      let D = P.BASE,
        Q = (rt, it) =>
          it === jr || it === je || !rt.equals(D)
            ? rt.multiplyUnsafe(it)
            : rt.multiply(it),
        at = Q(this, H).add(Q(T, J));
      return at.is0() ? void 0 : at;
    }
    toAffine(T) {
      return k(this, T);
    }
    isTorsionFree() {
      let { h: T, isTorsionFree: H } = t;
      if (T === je) return !0;
      if (H) return H(P, this);
      throw new Error(
        "isTorsionFree() has not been declared for the elliptic curve"
      );
    }
    clearCofactor() {
      let { h: T, clearCofactor: H } = t;
      return T === je ? this : H ? H(P, this) : this.multiplyUnsafe(t.h);
    }
    toRawBytes(T = !0) {
      return Sr("isCompressed", T), this.assertValidity(), o(P, this, T);
    }
    toHex(T = !0) {
      return Sr("isCompressed", T), qr(this.toRawBytes(T));
    }
  }
  (P.BASE = new P(t.Gx, t.Gy, e.ONE)), (P.ZERO = new P(e.ZERO, e.ONE, e.ZERO));
  let M = t.nBitLength,
    X = Yo(P, t.endo ? Math.ceil(M / 2) : M);
  return {
    CURVE: t,
    ProjectivePoint: P,
    normPrivateKeyToScalar: p,
    weierstrassEquation: s,
    isWithinCurveOrder: d,
  };
}
function I0(r) {
  let t = uo(r);
  return (
    Pr(
      t,
      { hash: "hash", hmac: "function", randomBytes: "function" },
      { bits2int: "function", bits2int_modN: "function", lowS: "boolean" }
    ),
    Object.freeze({ lowS: !0, ...t })
  );
}
function zf(r) {
  let t = I0(r),
    { Fp: e, n } = t,
    o = e.BYTES + 1,
    i = 2 * e.BYTES + 1;
  function s(a) {
    return ae(a, n);
  }
  function d(a) {
    return Go(a, n);
  }
  let {
      ProjectivePoint: p,
      normPrivateKeyToScalar: S,
      weierstrassEquation: k,
      isWithinCurveOrder: _,
    } = A0({
      ...t,
      toBytes(a, u, l) {
        let y = u.toAffine(),
          b = e.toBytes(y.x),
          B = Wr;
        return (
          Sr("isCompressed", l),
          l
            ? B(Uint8Array.from([u.hasEvenY() ? 2 : 3]), b)
            : B(Uint8Array.from([4]), b, e.toBytes(y.y))
        );
      },
      fromBytes(a) {
        let u = a.length,
          l = a[0],
          y = a.subarray(1);
        if (u === o && (l === 2 || l === 3)) {
          let b = Dr(y);
          if (!co(b, je, e.ORDER)) throw new Error("Point is not on curve");
          let B = k(b),
            I;
          try {
            I = e.sqrt(B);
          } catch (v) {
            let q = v instanceof Error ? ": " + v.message : "";
            throw new Error("Point is not on curve" + q);
          }
          let x = (I & je) === je;
          return ((l & 1) === 1) !== x && (I = e.neg(I)), { x: b, y: I };
        } else if (u === i && l === 4) {
          let b = e.fromBytes(y.subarray(0, e.BYTES)),
            B = e.fromBytes(y.subarray(e.BYTES, 2 * e.BYTES));
          return { x: b, y: B };
        } else
          throw new Error(
            `Point of length ${u} was invalid. Expected ${o} compressed bytes or ${i} uncompressed bytes`
          );
      },
    }),
    P = (a) => qr(rn(a, t.nByteLength));
  function M(a) {
    let u = n >> je;
    return a > u;
  }
  function X(a) {
    return M(a) ? s(-a) : a;
  }
  let U = (a, u, l) => Dr(a.slice(u, l));
  class T {
    constructor(u, l, y) {
      (this.r = u), (this.s = l), (this.recovery = y), this.assertValidity();
    }
    static fromCompact(u) {
      let l = t.nByteLength;
      return (
        (u = Fe("compactSignature", u, l * 2)),
        new T(U(u, 0, l), U(u, l, 2 * l))
      );
    }
    static fromDER(u) {
      let { r: l, s: y } = Vr.toSig(Fe("DER", u));
      return new T(l, y);
    }
    assertValidity() {
      lr("r", this.r, je, n), lr("s", this.s, je, n);
    }
    addRecoveryBit(u) {
      return new T(this.r, this.s, u);
    }
    recoverPublicKey(u) {
      let { r: l, s: y, recovery: b } = this,
        B = rt(Fe("msgHash", u));
      if (b == null || ![0, 1, 2, 3].includes(b))
        throw new Error("recovery id invalid");
      let I = b === 2 || b === 3 ? l + t.n : l;
      if (I >= e.ORDER) throw new Error("recovery id 2 or 3 invalid");
      let x = b & 1 ? "03" : "02",
        f = p.fromHex(x + P(I)),
        v = d(I),
        q = s(-B * v),
        Z = s(y * v),
        nt = p.BASE.multiplyAndAddUnsafe(f, q, Z);
      if (!nt) throw new Error("point at infinify");
      return nt.assertValidity(), nt;
    }
    hasHighS() {
      return M(this.s);
    }
    normalizeS() {
      return this.hasHighS() ? new T(this.r, s(-this.s), this.recovery) : this;
    }
    toDERRawBytes() {
      return kn(this.toDERHex());
    }
    toDERHex() {
      return Vr.hexFromSig({ r: this.r, s: this.s });
    }
    toCompactRawBytes() {
      return kn(this.toCompactHex());
    }
    toCompactHex() {
      return P(this.r) + P(this.s);
    }
  }
  let H = {
    isValidPrivateKey(a) {
      try {
        return S(a), !0;
      } catch {
        return !1;
      }
    },
    normPrivateKeyToScalar: S,
    randomPrivateKey: () => {
      let a = Bs(t.n);
      return mc(t.randomBytes(a), t.n);
    },
    precompute(a = 8, u = p.BASE) {
      return u._setWindowSize(a), u.multiply(BigInt(3)), u;
    },
  };
  function J(a, u = !0) {
    return p.fromPrivateKey(a).toRawBytes(u);
  }
  function D(a) {
    let u = tn(a),
      l = typeof a == "string",
      y = (u || l) && a.length;
    return u
      ? y === o || y === i
      : l
      ? y === 2 * o || y === 2 * i
      : a instanceof p;
  }
  function Q(a, u, l = !0) {
    if (D(a)) throw new Error("first arg must be private key");
    if (!D(u)) throw new Error("second arg must be public key");
    return p.fromHex(u).multiply(S(a)).toRawBytes(l);
  }
  let at =
      t.bits2int ||
      function (a) {
        let u = Dr(a),
          l = a.length * 8 - t.nBitLength;
        return l > 0 ? u >> BigInt(l) : u;
      },
    rt =
      t.bits2int_modN ||
      function (a) {
        return s(at(a));
      },
    it = fo(t.nBitLength);
  function ut(a) {
    return lr(`num < 2^${t.nBitLength}`, a, jr, it), rn(a, t.nByteLength);
  }
  function wt(a, u, l = re) {
    if (["recovered", "canonical"].some((vt) => vt in l))
      throw new Error("sign() legacy options not supported");
    let { hash: y, randomBytes: b } = t,
      { lowS: B, prehash: I, extraEntropy: x } = l;
    B == null && (B = !0),
      (a = Fe("msgHash", a)),
      Of(l),
      I && (a = Fe("prehashed msgHash", y(a)));
    let f = rt(a),
      v = S(u),
      q = [ut(v), ut(f)];
    if (x != null && x !== !1) {
      let vt = x === !0 ? b(e.BYTES) : x;
      q.push(Fe("extraEntropy", vt));
    }
    let Z = Wr(...q),
      nt = f;
    function mt(vt) {
      let Rt = at(vt);
      if (!_(Rt)) return;
      let fe = d(Rt),
        Et = p.BASE.multiply(Rt).toAffine(),
        Ot = s(Et.x);
      if (Ot === jr) return;
      let ur = s(fe * s(nt + Ot * v));
      if (ur === jr) return;
      let ne = (Et.x === Ot ? 0 : 2) | Number(Et.y & je),
        oe = ur;
      return B && M(ur) && ((oe = X(ur)), (ne ^= 1)), new T(Ot, oe, ne);
    }
    return { seed: Z, k2sig: mt };
  }
  let re = { lowS: t.lowS, prehash: !1 },
    xt = { lowS: t.lowS, prehash: !1 };
  function Ct(a, u, l = re) {
    let { seed: y, k2sig: b } = wt(a, u, l),
      B = t;
    return ws(B.hash.outputLen, B.nByteLength, B.hmac)(y, b);
  }
  p.BASE._setWindowSize(8);
  function E(a, u, l, y = xt) {
    let b = a;
    if (((u = Fe("msgHash", u)), (l = Fe("publicKey", l)), "strict" in y))
      throw new Error("options.strict was renamed to lowS");
    Of(y);
    let { lowS: B, prehash: I } = y,
      x,
      f;
    try {
      if (typeof b == "string" || tn(b))
        try {
          x = T.fromDER(b);
        } catch (Et) {
          if (!(Et instanceof Vr.Err)) throw Et;
          x = T.fromCompact(b);
        }
      else if (
        typeof b == "object" &&
        typeof b.r == "bigint" &&
        typeof b.s == "bigint"
      ) {
        let { r: Et, s: Ot } = b;
        x = new T(Et, Ot);
      } else throw new Error("PARSE");
      f = p.fromHex(l);
    } catch (Et) {
      if (Et.message === "PARSE")
        throw new Error(
          "signature must be Signature instance, Uint8Array or hex string"
        );
      return !1;
    }
    if (B && x.hasHighS()) return !1;
    I && (u = t.hash(u));
    let { r: v, s: q } = x,
      Z = rt(u),
      nt = d(q),
      mt = s(Z * nt),
      vt = s(v * nt),
      Rt = p.BASE.multiplyAndAddUnsafe(f, mt, vt)?.toAffine();
    return Rt ? s(Rt.x) === v : !1;
  }
  return {
    CURVE: t,
    getPublicKey: J,
    getSharedSecret: Q,
    sign: Ct,
    verify: E,
    ProjectivePoint: p,
    Signature: T,
    utils: H,
  };
}
function L0(r) {
  return { hash: r, hmac: (t, ...e) => sa(r, t, hs(...e)), randomBytes: Ho };
}
function Ff(r, t) {
  let e = (n) => zf({ ...r, ...L0(n) });
  return Object.freeze({ ...e(t), create: e });
}
var Df = BigInt(
    "0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f"
  ),
  Kf = BigInt(
    "0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141"
  ),
  R0 = BigInt(1),
  aa = BigInt(2),
  qf = (r, t) => (r + t / aa) / t;
function M0(r) {
  let t = Df,
    e = BigInt(3),
    n = BigInt(6),
    o = BigInt(11),
    i = BigInt(22),
    s = BigInt(23),
    d = BigInt(44),
    p = BigInt(88),
    S = (r * r * r) % t,
    k = (S * S * r) % t,
    _ = (Le(k, e, t) * k) % t,
    P = (Le(_, e, t) * k) % t,
    M = (Le(P, aa, t) * S) % t,
    X = (Le(M, o, t) * M) % t,
    U = (Le(X, i, t) * X) % t,
    T = (Le(U, d, t) * U) % t,
    H = (Le(T, p, t) * T) % t,
    J = (Le(H, d, t) * U) % t,
    D = (Le(J, e, t) * k) % t,
    Q = (Le(D, s, t) * X) % t,
    at = (Le(Q, n, t) * S) % t,
    rt = Le(at, aa, t);
  if (!ca.eql(ca.sqr(rt), r)) throw new Error("Cannot find square root");
  return rt;
}
var ca = nn(Df, void 0, void 0, { sqrt: M0 }),
  _o = Ff(
    {
      a: BigInt(0),
      b: BigInt(7),
      Fp: ca,
      n: Kf,
      Gx: BigInt(
        "55066263022277343669578718895168534326250603453777594175500187360389116729240"
      ),
      Gy: BigInt(
        "32670510020758816978083085130507043184471273380659243275938904335757337482424"
      ),
      h: BigInt(1),
      lowS: !0,
      endo: {
        beta: BigInt(
          "0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee"
        ),
        splitScalar: (r) => {
          let t = Kf,
            e = BigInt("0x3086d221a7d46bcde86c90e49284eb15"),
            n = -R0 * BigInt("0xe4437ed6010e88286f547fa90abfe4c3"),
            o = BigInt("0x114ca50f7a8e2f3f657c1108d9d44cfd8"),
            i = e,
            s = BigInt("0x100000000000000000000000000000000"),
            d = qf(i * r, t),
            p = qf(-n * r, t),
            S = ae(r - d * e - p * o, t),
            k = ae(-d * n - p * i, t),
            _ = S > s,
            P = k > s;
          if ((_ && (S = t - S), P && (k = t - k), S > s || k > s))
            throw new Error("splitScalar: Endomorphism failed, k=" + r);
          return { k1neg: _, k1: S, k2neg: P, k2: k };
        },
      },
    },
    Uf
  ),
  Zy = BigInt(0);
var Xy = _o.ProjectivePoint;
var a1 = _n.utils.randomPrivateKey,
  Wf = () => {
    let r = _n.utils.randomPrivateKey(),
      t = pa(r),
      e = new Uint8Array(64);
    return e.set(r), e.set(t, 32), { publicKey: t, secretKey: e };
  },
  pa = _n.getPublicKey;
function Hf(r) {
  try {
    return _n.ExtendedPoint.fromHex(r), !0;
  } catch {
    return !1;
  }
}
var ru = (r, t) => _n.sign(r, t.slice(0, 32)),
  P0 = _n.verify,
  Jt = (r) =>
    Tt.Buffer.isBuffer(r)
      ? r
      : r instanceof Uint8Array
      ? Tt.Buffer.from(r.buffer, r.byteOffset, r.byteLength)
      : Tt.Buffer.from(r),
  ya = class {
    constructor(t) {
      Object.assign(this, t);
    }
    encode() {
      return Tt.Buffer.from((0, no.serialize)($i, this));
    }
    static decode(t) {
      return (0, no.deserialize)($i, this, t);
    }
    static decodeUnchecked(t) {
      return (0, no.deserializeUnchecked)($i, this, t);
    }
  };
var $i = new Map(),
  nu,
  C0 = 32,
  To = 32;
function U0(r) {
  return r._bn !== void 0;
}
var $f = 1,
  Wt = class r extends ya {
    constructor(t) {
      if ((super({}), (this._bn = void 0), U0(t))) this._bn = t._bn;
      else {
        if (typeof t == "string") {
          let e = yr.default.decode(t);
          if (e.length != To) throw new Error("Invalid public key input");
          this._bn = new da.default(e);
        } else this._bn = new da.default(t);
        if (this._bn.byteLength() > To)
          throw new Error("Invalid public key input");
      }
    }
    static unique() {
      let t = new r($f);
      return ($f += 1), new r(t.toBuffer());
    }
    equals(t) {
      return this._bn.eq(t._bn);
    }
    toBase58() {
      return yr.default.encode(this.toBytes());
    }
    toJSON() {
      return this.toBase58();
    }
    toBytes() {
      let t = this.toBuffer();
      return new Uint8Array(t.buffer, t.byteOffset, t.byteLength);
    }
    toBuffer() {
      let t = this._bn.toArrayLike(Tt.Buffer);
      if (t.length === To) return t;
      let e = Tt.Buffer.alloc(32);
      return t.copy(e, 32 - t.length), e;
    }
    get [Symbol.toStringTag]() {
      return `PublicKey(${this.toString()})`;
    }
    toString() {
      return this.toBase58();
    }
    static async createWithSeed(t, e, n) {
      let o = Tt.Buffer.concat([t.toBuffer(), Tt.Buffer.from(e), n.toBuffer()]),
        i = Us(o);
      return new r(i);
    }
    static createProgramAddressSync(t, e) {
      let n = Tt.Buffer.alloc(0);
      t.forEach(function (i) {
        if (i.length > C0) throw new TypeError("Max seed length exceeded");
        n = Tt.Buffer.concat([n, Jt(i)]);
      }),
        (n = Tt.Buffer.concat([
          n,
          e.toBuffer(),
          Tt.Buffer.from("ProgramDerivedAddress"),
        ]));
      let o = Us(n);
      if (Hf(o))
        throw new Error("Invalid seeds, address must fall off the curve");
      return new r(o);
    }
    static async createProgramAddress(t, e) {
      return this.createProgramAddressSync(t, e);
    }
    static findProgramAddressSync(t, e) {
      let n = 255,
        o;
      for (; n != 0; ) {
        try {
          let i = t.concat(Tt.Buffer.from([n]));
          o = this.createProgramAddressSync(i, e);
        } catch (i) {
          if (i instanceof TypeError) throw i;
          n--;
          continue;
        }
        return [o, n];
      }
      throw new Error("Unable to find a viable program address nonce");
    }
    static async findProgramAddress(t, e) {
      return this.findProgramAddressSync(t, e);
    }
    static isOnCurve(t) {
      let e = new r(t);
      return Hf(e.toBytes());
    }
  };
nu = Wt;
Wt.default = new nu("11111111111111111111111111111111");
$i.set(Wt, { kind: "struct", fields: [["_bn", "u256"]] });
var c1 = new Wt("BPFLoader1111111111111111111111111111111111"),
  Vi = 1232,
  O0 = 127,
  ou = 64,
  ga = class extends Error {
    constructor(t) {
      super(`Signature ${t} has expired: block height exceeded.`),
        (this.signature = void 0),
        (this.signature = t);
    }
  };
Object.defineProperty(ga.prototype, "name", {
  value: "TransactionExpiredBlockheightExceededError",
});
var ma = class extends Error {
  constructor(t, e) {
    super(
      `Transaction was not confirmed in ${e.toFixed(
        2
      )} seconds. It is unknown if it succeeded or failed. Check signature ${t} using the Solana Explorer or CLI tools.`
    ),
      (this.signature = void 0),
      (this.signature = t);
  }
};
Object.defineProperty(ma.prototype, "name", {
  value: "TransactionExpiredTimeoutError",
});
var ba = class extends Error {
  constructor(t) {
    super(`Signature ${t} has expired: the nonce is no longer valid.`),
      (this.signature = void 0),
      (this.signature = t);
  }
};
Object.defineProperty(ba.prototype, "name", {
  value: "TransactionExpiredNonceInvalidError",
});
var ji = class {
    constructor(t, e) {
      (this.staticAccountKeys = void 0),
        (this.accountKeysFromLookups = void 0),
        (this.staticAccountKeys = t),
        (this.accountKeysFromLookups = e);
    }
    keySegments() {
      let t = [this.staticAccountKeys];
      return (
        this.accountKeysFromLookups &&
          (t.push(this.accountKeysFromLookups.writable),
          t.push(this.accountKeysFromLookups.readonly)),
        t
      );
    }
    get(t) {
      for (let e of this.keySegments()) {
        if (t < e.length) return e[t];
        t -= e.length;
      }
    }
    get length() {
      return this.keySegments().flat().length;
    }
    compileInstructions(t) {
      if (this.length > 256)
        throw new Error(
          "Account index overflow encountered during compilation"
        );
      let n = new Map();
      this.keySegments()
        .flat()
        .forEach((i, s) => {
          n.set(i.toBase58(), s);
        });
      let o = (i) => {
        let s = n.get(i.toBase58());
        if (s === void 0)
          throw new Error(
            "Encountered an unknown instruction account key during compilation"
          );
        return s;
      };
      return t.map((i) => ({
        programIdIndex: o(i.programId),
        accountKeyIndexes: i.keys.map((s) => o(s.pubkey)),
        data: i.data,
      }));
    }
  },
  Zt = (r = "publicKey") => L.blob(32, r);
var eo = (r = "string") => {
    let t = L.struct(
        [
          L.u32("length"),
          L.u32("lengthPadding"),
          L.blob(L.offset(L.u32(), -8), "chars"),
        ],
        r
      ),
      e = t.decode.bind(t),
      n = t.encode.bind(t),
      o = t;
    return (
      (o.decode = (i, s) => e(i, s).chars.toString()),
      (o.encode = (i, s, d) => {
        let p = { chars: Tt.Buffer.from(i, "utf8") };
        return n(p, s, d);
      }),
      (o.alloc = (i) =>
        L.u32().span + L.u32().span + Tt.Buffer.from(i, "utf8").length),
      o
    );
  },
  N0 = (r = "authorized") => L.struct([Zt("staker"), Zt("withdrawer")], r),
  z0 = (r = "lockup") =>
    L.struct([L.ns64("unixTimestamp"), L.ns64("epoch"), Zt("custodian")], r),
  F0 = (r = "voteInit") =>
    L.struct(
      [
        Zt("nodePubkey"),
        Zt("authorizedVoter"),
        Zt("authorizedWithdrawer"),
        L.u8("commission"),
      ],
      r
    ),
  K0 = (r = "voteAuthorizeWithSeedArgs") =>
    L.struct(
      [
        L.u32("voteAuthorizationType"),
        Zt("currentAuthorityDerivedKeyOwnerPubkey"),
        eo("currentAuthorityDerivedKeySeed"),
        Zt("newAuthorized"),
      ],
      r
    );
function iu(r, t) {
  let e = (o) => {
      if (o.span >= 0) return o.span;
      if (typeof o.alloc == "function") return o.alloc(t[o.property]);
      if ("count" in o && "elementLayout" in o) {
        let i = t[o.property];
        if (Array.isArray(i)) return i.length * e(o.elementLayout);
      } else if ("fields" in o) return iu({ layout: o }, t[o.property]);
      return 0;
    },
    n = 0;
  return (
    r.layout.fields.forEach((o) => {
      n += e(o);
    }),
    n
  );
}
function Lo(r) {
  let t = 0,
    e = 0;
  for (;;) {
    let n = r.shift();
    if (((t |= (n & 127) << (e * 7)), (e += 1), !(n & 128))) break;
  }
  return t;
}
function Ro(r, t) {
  let e = t;
  for (;;) {
    let n = e & 127;
    if (((e >>= 7), e == 0)) {
      r.push(n);
      break;
    } else (n |= 128), r.push(n);
  }
}
function $e(r, t) {
  if (!r) throw new Error(t || "Assertion failed");
}
var wa = class r {
    constructor(t, e) {
      (this.payer = void 0),
        (this.keyMetaMap = void 0),
        (this.payer = t),
        (this.keyMetaMap = e);
    }
    static compile(t, e) {
      let n = new Map(),
        o = (s) => {
          let d = s.toBase58(),
            p = n.get(d);
          return (
            p === void 0 &&
              ((p = { isSigner: !1, isWritable: !1, isInvoked: !1 }),
              n.set(d, p)),
            p
          );
        },
        i = o(e);
      (i.isSigner = !0), (i.isWritable = !0);
      for (let s of t) {
        o(s.programId).isInvoked = !0;
        for (let d of s.keys) {
          let p = o(d.pubkey);
          (p.isSigner ||= d.isSigner), (p.isWritable ||= d.isWritable);
        }
      }
      return new r(e, n);
    }
    getMessageComponents() {
      let t = [...this.keyMetaMap.entries()];
      $e(t.length <= 256, "Max static account keys length exceeded");
      let e = t.filter(([, p]) => p.isSigner && p.isWritable),
        n = t.filter(([, p]) => p.isSigner && !p.isWritable),
        o = t.filter(([, p]) => !p.isSigner && p.isWritable),
        i = t.filter(([, p]) => !p.isSigner && !p.isWritable),
        s = {
          numRequiredSignatures: e.length + n.length,
          numReadonlySignedAccounts: n.length,
          numReadonlyUnsignedAccounts: i.length,
        };
      {
        $e(e.length > 0, "Expected at least one writable signer key");
        let [p] = e[0];
        $e(
          p === this.payer.toBase58(),
          "Expected first writable signer key to be the fee payer"
        );
      }
      let d = [
        ...e.map(([p]) => new Wt(p)),
        ...n.map(([p]) => new Wt(p)),
        ...o.map(([p]) => new Wt(p)),
        ...i.map(([p]) => new Wt(p)),
      ];
      return [s, d];
    }
    extractTableLookup(t) {
      let [e, n] = this.drainKeysFoundInLookupTable(
          t.state.addresses,
          (s) => !s.isSigner && !s.isInvoked && s.isWritable
        ),
        [o, i] = this.drainKeysFoundInLookupTable(
          t.state.addresses,
          (s) => !s.isSigner && !s.isInvoked && !s.isWritable
        );
      if (!(e.length === 0 && o.length === 0))
        return [
          { accountKey: t.key, writableIndexes: e, readonlyIndexes: o },
          { writable: n, readonly: i },
        ];
    }
    drainKeysFoundInLookupTable(t, e) {
      let n = new Array(),
        o = new Array();
      for (let [i, s] of this.keyMetaMap.entries())
        if (e(s)) {
          let d = new Wt(i),
            p = t.findIndex((S) => S.equals(d));
          p >= 0 &&
            ($e(p < 256, "Max lookup table index exceeded"),
            n.push(p),
            o.push(d),
            this.keyMetaMap.delete(i));
        }
      return [n, o];
    }
  },
  su = "Reached end of buffer unexpectedly";
function Wi(r) {
  if (r.length === 0) throw new Error(su);
  return r.shift();
}
function Mo(r, ...t) {
  let [e] = t;
  if (t.length === 2 ? e + (t[1] ?? 0) > r.length : e >= r.length)
    throw new Error(su);
  return r.splice(...t);
}
var Gi = class r {
  constructor(t) {
    (this.header = void 0),
      (this.accountKeys = void 0),
      (this.recentBlockhash = void 0),
      (this.instructions = void 0),
      (this.indexToProgramIds = new Map()),
      (this.header = t.header),
      (this.accountKeys = t.accountKeys.map((e) => new Wt(e))),
      (this.recentBlockhash = t.recentBlockhash),
      (this.instructions = t.instructions),
      this.instructions.forEach((e) =>
        this.indexToProgramIds.set(
          e.programIdIndex,
          this.accountKeys[e.programIdIndex]
        )
      );
  }
  get version() {
    return "legacy";
  }
  get staticAccountKeys() {
    return this.accountKeys;
  }
  get compiledInstructions() {
    return this.instructions.map((t) => ({
      programIdIndex: t.programIdIndex,
      accountKeyIndexes: t.accounts,
      data: yr.default.decode(t.data),
    }));
  }
  get addressTableLookups() {
    return [];
  }
  getAccountKeys() {
    return new ji(this.staticAccountKeys);
  }
  static compile(t) {
    let e = wa.compile(t.instructions, t.payerKey),
      [n, o] = e.getMessageComponents(),
      s = new ji(o).compileInstructions(t.instructions).map((d) => ({
        programIdIndex: d.programIdIndex,
        accounts: d.accountKeyIndexes,
        data: yr.default.encode(d.data),
      }));
    return new r({
      header: n,
      accountKeys: o,
      recentBlockhash: t.recentBlockhash,
      instructions: s,
    });
  }
  isAccountSigner(t) {
    return t < this.header.numRequiredSignatures;
  }
  isAccountWritable(t) {
    let e = this.header.numRequiredSignatures;
    if (t >= this.header.numRequiredSignatures) {
      let n = t - e,
        i =
          this.accountKeys.length - e - this.header.numReadonlyUnsignedAccounts;
      return n < i;
    } else {
      let n = e - this.header.numReadonlySignedAccounts;
      return t < n;
    }
  }
  isProgramId(t) {
    return this.indexToProgramIds.has(t);
  }
  programIds() {
    return [...this.indexToProgramIds.values()];
  }
  nonProgramIds() {
    return this.accountKeys.filter((t, e) => !this.isProgramId(e));
  }
  serialize() {
    let t = this.accountKeys.length,
      e = [];
    Ro(e, t);
    let n = this.instructions.map((_) => {
        let { accounts: P, programIdIndex: M } = _,
          X = Array.from(yr.default.decode(_.data)),
          U = [];
        Ro(U, P.length);
        let T = [];
        return (
          Ro(T, X.length),
          {
            programIdIndex: M,
            keyIndicesCount: Tt.Buffer.from(U),
            keyIndices: P,
            dataLength: Tt.Buffer.from(T),
            data: X,
          }
        );
      }),
      o = [];
    Ro(o, n.length);
    let i = Tt.Buffer.alloc(Vi);
    Tt.Buffer.from(o).copy(i);
    let s = o.length;
    n.forEach((_) => {
      let M = L.struct([
        L.u8("programIdIndex"),
        L.blob(_.keyIndicesCount.length, "keyIndicesCount"),
        L.seq(L.u8("keyIndex"), _.keyIndices.length, "keyIndices"),
        L.blob(_.dataLength.length, "dataLength"),
        L.seq(L.u8("userdatum"), _.data.length, "data"),
      ]).encode(_, i, s);
      s += M;
    }),
      (i = i.slice(0, s));
    let d = L.struct([
        L.blob(1, "numRequiredSignatures"),
        L.blob(1, "numReadonlySignedAccounts"),
        L.blob(1, "numReadonlyUnsignedAccounts"),
        L.blob(e.length, "keyCount"),
        L.seq(Zt("key"), t, "keys"),
        Zt("recentBlockhash"),
      ]),
      p = {
        numRequiredSignatures: Tt.Buffer.from([
          this.header.numRequiredSignatures,
        ]),
        numReadonlySignedAccounts: Tt.Buffer.from([
          this.header.numReadonlySignedAccounts,
        ]),
        numReadonlyUnsignedAccounts: Tt.Buffer.from([
          this.header.numReadonlyUnsignedAccounts,
        ]),
        keyCount: Tt.Buffer.from(e),
        keys: this.accountKeys.map((_) => Jt(_.toBytes())),
        recentBlockhash: yr.default.decode(this.recentBlockhash),
      },
      S = Tt.Buffer.alloc(2048),
      k = d.encode(p, S);
    return i.copy(S, k), S.slice(0, k + i.length);
  }
  static from(t) {
    let e = [...t],
      n = Wi(e);
    if (n !== (n & O0))
      throw new Error(
        "Versioned messages must be deserialized with VersionedMessage.deserialize()"
      );
    let o = Wi(e),
      i = Wi(e),
      s = Lo(e),
      d = [];
    for (let P = 0; P < s; P++) {
      let M = Mo(e, 0, To);
      d.push(new Wt(Tt.Buffer.from(M)));
    }
    let p = Mo(e, 0, To),
      S = Lo(e),
      k = [];
    for (let P = 0; P < S; P++) {
      let M = Wi(e),
        X = Lo(e),
        U = Mo(e, 0, X),
        T = Lo(e),
        H = Mo(e, 0, T),
        J = yr.default.encode(Tt.Buffer.from(H));
      k.push({ programIdIndex: M, accounts: U, data: J });
    }
    let _ = {
      header: {
        numRequiredSignatures: n,
        numReadonlySignedAccounts: o,
        numReadonlyUnsignedAccounts: i,
      },
      recentBlockhash: yr.default.encode(Tt.Buffer.from(p)),
      accountKeys: d,
      instructions: k,
    };
    return new r(_);
  }
};
var q0 = Tt.Buffer.alloc(ou).fill(0),
  ye = class {
    constructor(t) {
      (this.keys = void 0),
        (this.programId = void 0),
        (this.data = Tt.Buffer.alloc(0)),
        (this.programId = t.programId),
        (this.keys = t.keys),
        t.data && (this.data = t.data);
    }
    toJSON() {
      return {
        keys: this.keys.map(({ pubkey: t, isSigner: e, isWritable: n }) => ({
          pubkey: t.toJSON(),
          isSigner: e,
          isWritable: n,
        })),
        programId: this.programId.toJSON(),
        data: [...this.data],
      };
    }
  },
  Me = class r {
    get signature() {
      return this.signatures.length > 0 ? this.signatures[0].signature : null;
    }
    constructor(t) {
      if (
        ((this.signatures = []),
        (this.feePayer = void 0),
        (this.instructions = []),
        (this.recentBlockhash = void 0),
        (this.lastValidBlockHeight = void 0),
        (this.nonceInfo = void 0),
        (this.minNonceContextSlot = void 0),
        (this._message = void 0),
        (this._json = void 0),
        !!t)
      )
        if (
          (t.feePayer && (this.feePayer = t.feePayer),
          t.signatures && (this.signatures = t.signatures),
          Object.prototype.hasOwnProperty.call(t, "nonceInfo"))
        ) {
          let { minContextSlot: e, nonceInfo: n } = t;
          (this.minNonceContextSlot = e), (this.nonceInfo = n);
        } else if (
          Object.prototype.hasOwnProperty.call(t, "lastValidBlockHeight")
        ) {
          let { blockhash: e, lastValidBlockHeight: n } = t;
          (this.recentBlockhash = e), (this.lastValidBlockHeight = n);
        } else {
          let { recentBlockhash: e, nonceInfo: n } = t;
          n && (this.nonceInfo = n), (this.recentBlockhash = e);
        }
    }
    toJSON() {
      return {
        recentBlockhash: this.recentBlockhash || null,
        feePayer: this.feePayer ? this.feePayer.toJSON() : null,
        nonceInfo: this.nonceInfo
          ? {
              nonce: this.nonceInfo.nonce,
              nonceInstruction: this.nonceInfo.nonceInstruction.toJSON(),
            }
          : null,
        instructions: this.instructions.map((t) => t.toJSON()),
        signers: this.signatures.map(({ publicKey: t }) => t.toJSON()),
      };
    }
    add(...t) {
      if (t.length === 0) throw new Error("No instructions");
      return (
        t.forEach((e) => {
          "instructions" in e
            ? (this.instructions = this.instructions.concat(e.instructions))
            : "data" in e && "programId" in e && "keys" in e
            ? this.instructions.push(e)
            : this.instructions.push(new ye(e));
        }),
        this
      );
    }
    compileMessage() {
      if (
        this._message &&
        JSON.stringify(this.toJSON()) === JSON.stringify(this._json)
      )
        return this._message;
      let t, e;
      if (
        (this.nonceInfo
          ? ((t = this.nonceInfo.nonce),
            this.instructions[0] != this.nonceInfo.nonceInstruction
              ? (e = [this.nonceInfo.nonceInstruction, ...this.instructions])
              : (e = this.instructions))
          : ((t = this.recentBlockhash), (e = this.instructions)),
        !t)
      )
        throw new Error("Transaction recentBlockhash required");
      e.length < 1 && console.warn("No instructions provided");
      let n;
      if (this.feePayer) n = this.feePayer;
      else if (this.signatures.length > 0 && this.signatures[0].publicKey)
        n = this.signatures[0].publicKey;
      else throw new Error("Transaction fee payer required");
      for (let U = 0; U < e.length; U++)
        if (e[U].programId === void 0)
          throw new Error(
            `Transaction instruction index ${U} has undefined program id`
          );
      let o = [],
        i = [];
      e.forEach((U) => {
        U.keys.forEach((H) => {
          i.push({ ...H });
        });
        let T = U.programId.toString();
        o.includes(T) || o.push(T);
      }),
        o.forEach((U) => {
          i.push({ pubkey: new Wt(U), isSigner: !1, isWritable: !1 });
        });
      let s = [];
      i.forEach((U) => {
        let T = U.pubkey.toString(),
          H = s.findIndex((J) => J.pubkey.toString() === T);
        H > -1
          ? ((s[H].isWritable = s[H].isWritable || U.isWritable),
            (s[H].isSigner = s[H].isSigner || U.isSigner))
          : s.push(U);
      }),
        s.sort(function (U, T) {
          if (U.isSigner !== T.isSigner) return U.isSigner ? -1 : 1;
          if (U.isWritable !== T.isWritable) return U.isWritable ? -1 : 1;
          let H = {
            localeMatcher: "best fit",
            usage: "sort",
            sensitivity: "variant",
            ignorePunctuation: !1,
            numeric: !1,
            caseFirst: "lower",
          };
          return U.pubkey
            .toBase58()
            .localeCompare(T.pubkey.toBase58(), "en", H);
        });
      let d = s.findIndex((U) => U.pubkey.equals(n));
      if (d > -1) {
        let [U] = s.splice(d, 1);
        (U.isSigner = !0), (U.isWritable = !0), s.unshift(U);
      } else s.unshift({ pubkey: n, isSigner: !0, isWritable: !0 });
      for (let U of this.signatures) {
        let T = s.findIndex((H) => H.pubkey.equals(U.publicKey));
        if (T > -1)
          s[T].isSigner ||
            ((s[T].isSigner = !0),
            console.warn(
              "Transaction references a signature that is unnecessary, only the fee payer and instruction signer accounts should sign a transaction. This behavior is deprecated and will throw an error in the next major version release."
            ));
        else throw new Error(`unknown signer: ${U.publicKey.toString()}`);
      }
      let p = 0,
        S = 0,
        k = 0,
        _ = [],
        P = [];
      s.forEach(({ pubkey: U, isSigner: T, isWritable: H }) => {
        T
          ? (_.push(U.toString()), (p += 1), H || (S += 1))
          : (P.push(U.toString()), H || (k += 1));
      });
      let M = _.concat(P),
        X = e.map((U) => {
          let { data: T, programId: H } = U;
          return {
            programIdIndex: M.indexOf(H.toString()),
            accounts: U.keys.map((J) => M.indexOf(J.pubkey.toString())),
            data: yr.default.encode(T),
          };
        });
      return (
        X.forEach((U) => {
          $e(U.programIdIndex >= 0), U.accounts.forEach((T) => $e(T >= 0));
        }),
        new Gi({
          header: {
            numRequiredSignatures: p,
            numReadonlySignedAccounts: S,
            numReadonlyUnsignedAccounts: k,
          },
          accountKeys: M,
          recentBlockhash: t,
          instructions: X,
        })
      );
    }
    _compile() {
      let t = this.compileMessage(),
        e = t.accountKeys.slice(0, t.header.numRequiredSignatures);
      return (
        (this.signatures.length === e.length &&
          this.signatures.every((o, i) => e[i].equals(o.publicKey))) ||
          (this.signatures = e.map((n) => ({ signature: null, publicKey: n }))),
        t
      );
    }
    serializeMessage() {
      return this._compile().serialize();
    }
    async getEstimatedFee(t) {
      return (await t.getFeeForMessage(this.compileMessage())).value;
    }
    setSigners(...t) {
      if (t.length === 0) throw new Error("No signers");
      let e = new Set();
      this.signatures = t
        .filter((n) => {
          let o = n.toString();
          return e.has(o) ? !1 : (e.add(o), !0);
        })
        .map((n) => ({ signature: null, publicKey: n }));
    }
    sign(...t) {
      if (t.length === 0) throw new Error("No signers");
      let e = new Set(),
        n = [];
      for (let i of t) {
        let s = i.publicKey.toString();
        e.has(s) || (e.add(s), n.push(i));
      }
      this.signatures = n.map((i) => ({
        signature: null,
        publicKey: i.publicKey,
      }));
      let o = this._compile();
      this._partialSign(o, ...n);
    }
    partialSign(...t) {
      if (t.length === 0) throw new Error("No signers");
      let e = new Set(),
        n = [];
      for (let i of t) {
        let s = i.publicKey.toString();
        e.has(s) || (e.add(s), n.push(i));
      }
      let o = this._compile();
      this._partialSign(o, ...n);
    }
    _partialSign(t, ...e) {
      let n = t.serialize();
      e.forEach((o) => {
        let i = ru(n, o.secretKey);
        this._addSignature(o.publicKey, Jt(i));
      });
    }
    addSignature(t, e) {
      this._compile(), this._addSignature(t, e);
    }
    _addSignature(t, e) {
      $e(e.length === 64);
      let n = this.signatures.findIndex((o) => t.equals(o.publicKey));
      if (n < 0) throw new Error(`unknown signer: ${t.toString()}`);
      this.signatures[n].signature = Tt.Buffer.from(e);
    }
    verifySignatures(t = !0) {
      return !this._getMessageSignednessErrors(this.serializeMessage(), t);
    }
    _getMessageSignednessErrors(t, e) {
      let n = {};
      for (let { signature: o, publicKey: i } of this.signatures)
        o === null
          ? e && (n.missing ||= []).push(i)
          : P0(o, t, i.toBytes()) || (n.invalid ||= []).push(i);
      return n.invalid || n.missing ? n : void 0;
    }
    serialize(t) {
      let { requireAllSignatures: e, verifySignatures: n } = Object.assign(
          { requireAllSignatures: !0, verifySignatures: !0 },
          t
        ),
        o = this.serializeMessage();
      if (n) {
        let i = this._getMessageSignednessErrors(o, e);
        if (i) {
          let s = "Signature verification failed.";
          throw (
            (i.invalid &&
              (s += `
Invalid signature for public key${
                i.invalid.length === 1 ? "" : "(s)"
              } [\`${i.invalid.map((d) => d.toBase58()).join("`, `")}\`].`),
            i.missing &&
              (s += `
Missing signature for public key${
                i.missing.length === 1 ? "" : "(s)"
              } [\`${i.missing.map((d) => d.toBase58()).join("`, `")}\`].`),
            new Error(s))
          );
        }
      }
      return this._serialize(o);
    }
    _serialize(t) {
      let { signatures: e } = this,
        n = [];
      Ro(n, e.length);
      let o = n.length + e.length * 64 + t.length,
        i = Tt.Buffer.alloc(o);
      return (
        $e(e.length < 256),
        Tt.Buffer.from(n).copy(i, 0),
        e.forEach(({ signature: s }, d) => {
          s !== null &&
            ($e(s.length === 64, "signature has invalid length"),
            Tt.Buffer.from(s).copy(i, n.length + d * 64));
        }),
        t.copy(i, n.length + e.length * 64),
        $e(i.length <= Vi, `Transaction too large: ${i.length} > ${Vi}`),
        i
      );
    }
    get keys() {
      return (
        $e(this.instructions.length === 1),
        this.instructions[0].keys.map((t) => t.pubkey)
      );
    }
    get programId() {
      return $e(this.instructions.length === 1), this.instructions[0].programId;
    }
    get data() {
      return $e(this.instructions.length === 1), this.instructions[0].data;
    }
    static from(t) {
      let e = [...t],
        n = Lo(e),
        o = [];
      for (let i = 0; i < n; i++) {
        let s = Mo(e, 0, ou);
        o.push(yr.default.encode(Tt.Buffer.from(s)));
      }
      return r.populate(Gi.from(e), o);
    }
    static populate(t, e = []) {
      let n = new r();
      return (
        (n.recentBlockhash = t.recentBlockhash),
        t.header.numRequiredSignatures > 0 && (n.feePayer = t.accountKeys[0]),
        e.forEach((o, i) => {
          let s = {
            signature: o == yr.default.encode(q0) ? null : yr.default.decode(o),
            publicKey: t.accountKeys[i],
          };
          n.signatures.push(s);
        }),
        t.instructions.forEach((o) => {
          let i = o.accounts.map((s) => {
            let d = t.accountKeys[s];
            return {
              pubkey: d,
              isSigner:
                n.signatures.some(
                  (p) => p.publicKey.toString() === d.toString()
                ) || t.isAccountSigner(s),
              isWritable: t.isAccountWritable(s),
            };
          });
          n.instructions.push(
            new ye({
              keys: i,
              programId: t.accountKeys[o.programIdIndex],
              data: yr.default.decode(o.data),
            })
          );
        }),
        (n._message = t),
        (n._json = n.toJSON()),
        n
      );
    }
  };
var D0 = 160,
  W0 = 64,
  H0 = D0 / W0,
  $0 = 1e3 / H0,
  Gr = new Wt("SysvarC1ock11111111111111111111111111111111"),
  f1 = new Wt("SysvarEpochSchedu1e111111111111111111111111"),
  u1 = new Wt("Sysvar1nstructions1111111111111111111111111"),
  fa = new Wt("SysvarRecentB1ockHashes11111111111111111111"),
  Po = new Wt("SysvarRent111111111111111111111111111111111"),
  h1 = new Wt("SysvarRewards111111111111111111111111111111"),
  l1 = new Wt("SysvarS1otHashes111111111111111111111111111"),
  d1 = new Wt("SysvarS1otHistory11111111111111111111111111"),
  ua = new Wt("SysvarStakeHistory1111111111111111111111111"),
  xa = class extends Error {
    constructor({ action: t, signature: e, transactionMessage: n, logs: o }) {
      let i = o
          ? `Logs: 
${JSON.stringify(o.slice(-10), null, 2)}. `
          : "",
        s =
          "\nCatch the `SendTransactionError` and call `getLogs()` on it for full details.",
        d;
      switch (t) {
        case "send":
          d =
            `Transaction ${e} resulted in an error. 
${n}. ` +
            i +
            s;
          break;
        case "simulate":
          d =
            `Simulation failed. 
Message: ${n}. 
` +
            i +
            s;
          break;
        default:
          d = `Unknown action '${((p) => p)(t)}'`;
      }
      super(d),
        (this.signature = void 0),
        (this.transactionMessage = void 0),
        (this.transactionLogs = void 0),
        (this.signature = e),
        (this.transactionMessage = n),
        (this.transactionLogs = o || void 0);
    }
    get transactionError() {
      return {
        message: this.transactionMessage,
        logs: Array.isArray(this.transactionLogs)
          ? this.transactionLogs
          : void 0,
      };
    }
    get logs() {
      let t = this.transactionLogs;
      if (!(t != null && typeof t == "object" && "then" in t)) return t;
    }
    async getLogs(t) {
      return (
        Array.isArray(this.transactionLogs) ||
          (this.transactionLogs = new Promise((e, n) => {
            t.getTransaction(this.signature)
              .then((o) => {
                if (o && o.meta && o.meta.logMessages) {
                  let i = o.meta.logMessages;
                  (this.transactionLogs = i), e(i);
                } else n(new Error("Log messages not found"));
              })
              .catch(n);
          })),
        await this.transactionLogs
      );
    }
  };
async function Vf(r, t, e, n) {
  let o = n && {
      skipPreflight: n.skipPreflight,
      preflightCommitment: n.preflightCommitment || n.commitment,
      maxRetries: n.maxRetries,
      minContextSlot: n.minContextSlot,
    },
    i = await r.sendTransaction(t, e, o),
    s;
  if (t.recentBlockhash != null && t.lastValidBlockHeight != null)
    s = (
      await r.confirmTransaction(
        {
          abortSignal: n?.abortSignal,
          signature: i,
          blockhash: t.recentBlockhash,
          lastValidBlockHeight: t.lastValidBlockHeight,
        },
        n && n.commitment
      )
    ).value;
  else if (t.minNonceContextSlot != null && t.nonceInfo != null) {
    let { nonceInstruction: d } = t.nonceInfo,
      p = d.keys[0].pubkey;
    s = (
      await r.confirmTransaction(
        {
          abortSignal: n?.abortSignal,
          minContextSlot: t.minNonceContextSlot,
          nonceAccountPubkey: p,
          nonceValue: t.nonceInfo.nonce,
          signature: i,
        },
        n && n.commitment
      )
    ).value;
  } else
    n?.abortSignal != null &&
      console.warn(
        "sendAndConfirmTransaction(): A transaction with a deprecated confirmation strategy was supplied along with an `abortSignal`. Only transactions having `lastValidBlockHeight` or a combination of `nonceInfo` and `minNonceContextSlot` are abortable."
      ),
      (s = (await r.confirmTransaction(i, n && n.commitment)).value);
  if (s.err)
    throw i != null
      ? new xa({
          action: "send",
          signature: i,
          transactionMessage: `Status: (${JSON.stringify(s)})`,
        })
      : new Error(`Transaction ${i} failed (${JSON.stringify(s)})`);
  return i;
}
function V0(r) {
  return new Promise((t) => setTimeout(t, r));
}
function jt(r, t) {
  let e = r.layout.span >= 0 ? r.layout.span : iu(r, t),
    n = Tt.Buffer.alloc(e),
    o = Object.assign({ instruction: r.index }, t);
  return r.layout.encode(o, n), n;
}
var j0 = L.nu64("lamportsPerSignature"),
  G0 = L.struct([
    L.u32("version"),
    L.u32("state"),
    Zt("authorizedPubkey"),
    Zt("nonce"),
    L.struct([j0], "feeCalculator"),
  ]),
  jf = G0.span;
var Y0 = (r) => {
    let t = r.decode.bind(r),
      e = r.encode.bind(r);
    return { decode: t, encode: e };
  },
  Z0 = (r) => (t) => {
    let e = (0, eu.blob)(r, t),
      { encode: n, decode: o } = Y0(e),
      i = e;
    return (
      (i.decode = (s, d) => {
        let p = o(s, d);
        return (0, Oo.toBigIntLE)(Tt.Buffer.from(p));
      }),
      (i.encode = (s, d, p) => {
        let S = (0, Oo.toBufferLE)(s, r);
        return n(S, d, p);
      }),
      i
    );
  },
  ro = Z0(8);
var vr = Object.freeze({
    Create: {
      index: 0,
      layout: L.struct([
        L.u32("instruction"),
        L.ns64("lamports"),
        L.ns64("space"),
        Zt("programId"),
      ]),
    },
    Assign: {
      index: 1,
      layout: L.struct([L.u32("instruction"), Zt("programId")]),
    },
    Transfer: {
      index: 2,
      layout: L.struct([L.u32("instruction"), ro("lamports")]),
    },
    CreateWithSeed: {
      index: 3,
      layout: L.struct([
        L.u32("instruction"),
        Zt("base"),
        eo("seed"),
        L.ns64("lamports"),
        L.ns64("space"),
        Zt("programId"),
      ]),
    },
    AdvanceNonceAccount: { index: 4, layout: L.struct([L.u32("instruction")]) },
    WithdrawNonceAccount: {
      index: 5,
      layout: L.struct([L.u32("instruction"), L.ns64("lamports")]),
    },
    InitializeNonceAccount: {
      index: 6,
      layout: L.struct([L.u32("instruction"), Zt("authorized")]),
    },
    AuthorizeNonceAccount: {
      index: 7,
      layout: L.struct([L.u32("instruction"), Zt("authorized")]),
    },
    Allocate: {
      index: 8,
      layout: L.struct([L.u32("instruction"), L.ns64("space")]),
    },
    AllocateWithSeed: {
      index: 9,
      layout: L.struct([
        L.u32("instruction"),
        Zt("base"),
        eo("seed"),
        L.ns64("space"),
        Zt("programId"),
      ]),
    },
    AssignWithSeed: {
      index: 10,
      layout: L.struct([
        L.u32("instruction"),
        Zt("base"),
        eo("seed"),
        Zt("programId"),
      ]),
    },
    TransferWithSeed: {
      index: 11,
      layout: L.struct([
        L.u32("instruction"),
        ro("lamports"),
        eo("seed"),
        Zt("programId"),
      ]),
    },
    UpgradeNonceAccount: {
      index: 12,
      layout: L.struct([L.u32("instruction")]),
    },
  }),
  fr = class r {
    constructor() {}
    static createAccount(t) {
      let e = vr.Create,
        n = jt(e, {
          lamports: t.lamports,
          space: t.space,
          programId: Jt(t.programId.toBuffer()),
        });
      return new ye({
        keys: [
          { pubkey: t.fromPubkey, isSigner: !0, isWritable: !0 },
          { pubkey: t.newAccountPubkey, isSigner: !0, isWritable: !0 },
        ],
        programId: this.programId,
        data: n,
      });
    }
    static transfer(t) {
      let e, n;
      if ("basePubkey" in t) {
        let o = vr.TransferWithSeed;
        (e = jt(o, {
          lamports: BigInt(t.lamports),
          seed: t.seed,
          programId: Jt(t.programId.toBuffer()),
        })),
          (n = [
            { pubkey: t.fromPubkey, isSigner: !1, isWritable: !0 },
            { pubkey: t.basePubkey, isSigner: !0, isWritable: !1 },
            { pubkey: t.toPubkey, isSigner: !1, isWritable: !0 },
          ]);
      } else {
        let o = vr.Transfer;
        (e = jt(o, { lamports: BigInt(t.lamports) })),
          (n = [
            { pubkey: t.fromPubkey, isSigner: !0, isWritable: !0 },
            { pubkey: t.toPubkey, isSigner: !1, isWritable: !0 },
          ]);
      }
      return new ye({ keys: n, programId: this.programId, data: e });
    }
    static assign(t) {
      let e, n;
      if ("basePubkey" in t) {
        let o = vr.AssignWithSeed;
        (e = jt(o, {
          base: Jt(t.basePubkey.toBuffer()),
          seed: t.seed,
          programId: Jt(t.programId.toBuffer()),
        })),
          (n = [
            { pubkey: t.accountPubkey, isSigner: !1, isWritable: !0 },
            { pubkey: t.basePubkey, isSigner: !0, isWritable: !1 },
          ]);
      } else {
        let o = vr.Assign;
        (e = jt(o, { programId: Jt(t.programId.toBuffer()) })),
          (n = [{ pubkey: t.accountPubkey, isSigner: !0, isWritable: !0 }]);
      }
      return new ye({ keys: n, programId: this.programId, data: e });
    }
    static createAccountWithSeed(t) {
      let e = vr.CreateWithSeed,
        n = jt(e, {
          base: Jt(t.basePubkey.toBuffer()),
          seed: t.seed,
          lamports: t.lamports,
          space: t.space,
          programId: Jt(t.programId.toBuffer()),
        }),
        o = [
          { pubkey: t.fromPubkey, isSigner: !0, isWritable: !0 },
          { pubkey: t.newAccountPubkey, isSigner: !1, isWritable: !0 },
        ];
      return (
        t.basePubkey.equals(t.fromPubkey) ||
          o.push({ pubkey: t.basePubkey, isSigner: !0, isWritable: !1 }),
        new ye({ keys: o, programId: this.programId, data: n })
      );
    }
    static createNonceAccount(t) {
      let e = new Me();
      "basePubkey" in t && "seed" in t
        ? e.add(
            r.createAccountWithSeed({
              fromPubkey: t.fromPubkey,
              newAccountPubkey: t.noncePubkey,
              basePubkey: t.basePubkey,
              seed: t.seed,
              lamports: t.lamports,
              space: jf,
              programId: this.programId,
            })
          )
        : e.add(
            r.createAccount({
              fromPubkey: t.fromPubkey,
              newAccountPubkey: t.noncePubkey,
              lamports: t.lamports,
              space: jf,
              programId: this.programId,
            })
          );
      let n = {
        noncePubkey: t.noncePubkey,
        authorizedPubkey: t.authorizedPubkey,
      };
      return e.add(this.nonceInitialize(n)), e;
    }
    static nonceInitialize(t) {
      let e = vr.InitializeNonceAccount,
        n = jt(e, { authorized: Jt(t.authorizedPubkey.toBuffer()) }),
        o = {
          keys: [
            { pubkey: t.noncePubkey, isSigner: !1, isWritable: !0 },
            { pubkey: fa, isSigner: !1, isWritable: !1 },
            { pubkey: Po, isSigner: !1, isWritable: !1 },
          ],
          programId: this.programId,
          data: n,
        };
      return new ye(o);
    }
    static nonceAdvance(t) {
      let e = vr.AdvanceNonceAccount,
        n = jt(e),
        o = {
          keys: [
            { pubkey: t.noncePubkey, isSigner: !1, isWritable: !0 },
            { pubkey: fa, isSigner: !1, isWritable: !1 },
            { pubkey: t.authorizedPubkey, isSigner: !0, isWritable: !1 },
          ],
          programId: this.programId,
          data: n,
        };
      return new ye(o);
    }
    static nonceWithdraw(t) {
      let e = vr.WithdrawNonceAccount,
        n = jt(e, { lamports: t.lamports });
      return new ye({
        keys: [
          { pubkey: t.noncePubkey, isSigner: !1, isWritable: !0 },
          { pubkey: t.toPubkey, isSigner: !1, isWritable: !0 },
          { pubkey: fa, isSigner: !1, isWritable: !1 },
          { pubkey: Po, isSigner: !1, isWritable: !1 },
          { pubkey: t.authorizedPubkey, isSigner: !0, isWritable: !1 },
        ],
        programId: this.programId,
        data: n,
      });
    }
    static nonceAuthorize(t) {
      let e = vr.AuthorizeNonceAccount,
        n = jt(e, { authorized: Jt(t.newAuthorizedPubkey.toBuffer()) });
      return new ye({
        keys: [
          { pubkey: t.noncePubkey, isSigner: !1, isWritable: !0 },
          { pubkey: t.authorizedPubkey, isSigner: !0, isWritable: !1 },
        ],
        programId: this.programId,
        data: n,
      });
    }
    static allocate(t) {
      let e, n;
      if ("basePubkey" in t) {
        let o = vr.AllocateWithSeed;
        (e = jt(o, {
          base: Jt(t.basePubkey.toBuffer()),
          seed: t.seed,
          space: t.space,
          programId: Jt(t.programId.toBuffer()),
        })),
          (n = [
            { pubkey: t.accountPubkey, isSigner: !1, isWritable: !0 },
            { pubkey: t.basePubkey, isSigner: !0, isWritable: !1 },
          ]);
      } else {
        let o = vr.Allocate;
        (e = jt(o, { space: t.space })),
          (n = [{ pubkey: t.accountPubkey, isSigner: !0, isWritable: !0 }]);
      }
      return new ye({ keys: n, programId: this.programId, data: e });
    }
  };
fr.programId = new Wt("11111111111111111111111111111111");
var X0 = Vi - 300,
  va = class r {
    constructor() {}
    static getMinNumSignatures(t) {
      return 2 * (Math.ceil(t / r.chunkSize) + 1 + 1);
    }
    static async load(t, e, n, o, i) {
      {
        let _ = await t.getMinimumBalanceForRentExemption(i.length),
          P = await t.getAccountInfo(n.publicKey, "confirmed"),
          M = null;
        if (P !== null) {
          if (P.executable)
            return (
              console.error(
                "Program load failed, account is already executable"
              ),
              !1
            );
          P.data.length !== i.length &&
            ((M = M || new Me()),
            M.add(
              fr.allocate({ accountPubkey: n.publicKey, space: i.length })
            )),
            P.owner.equals(o) ||
              ((M = M || new Me()),
              M.add(fr.assign({ accountPubkey: n.publicKey, programId: o }))),
            P.lamports < _ &&
              ((M = M || new Me()),
              M.add(
                fr.transfer({
                  fromPubkey: e.publicKey,
                  toPubkey: n.publicKey,
                  lamports: _ - P.lamports,
                })
              ));
        } else
          M = new Me().add(
            fr.createAccount({
              fromPubkey: e.publicKey,
              newAccountPubkey: n.publicKey,
              lamports: _ > 0 ? _ : 1,
              space: i.length,
              programId: o,
            })
          );
        M !== null && (await Vf(t, M, [e, n], { commitment: "confirmed" }));
      }
      let s = L.struct([
          L.u32("instruction"),
          L.u32("offset"),
          L.u32("bytesLength"),
          L.u32("bytesLengthPadding"),
          L.seq(L.u8("byte"), L.offset(L.u32(), -8), "bytes"),
        ]),
        d = r.chunkSize,
        p = 0,
        S = i,
        k = [];
      for (; S.length > 0; ) {
        let _ = S.slice(0, d),
          P = Tt.Buffer.alloc(d + 16);
        s.encode(
          {
            instruction: 0,
            offset: p,
            bytes: _,
            bytesLength: 0,
            bytesLengthPadding: 0,
          },
          P
        );
        let M = new Me().add({
          keys: [{ pubkey: n.publicKey, isSigner: !0, isWritable: !0 }],
          programId: o,
          data: P,
        });
        k.push(Vf(t, M, [e, n], { commitment: "confirmed" })),
          t._rpcEndpoint.includes("solana.com") && (await V0(1e3 / 4)),
          (p += d),
          (S = S.slice(d));
      }
      await Promise.all(k);
      {
        let _ = L.struct([L.u32("instruction")]),
          P = Tt.Buffer.alloc(_.span);
        _.encode({ instruction: 1 }, P);
        let M = new Me().add({
            keys: [
              { pubkey: n.publicKey, isSigner: !0, isWritable: !0 },
              { pubkey: Po, isSigner: !1, isWritable: !1 },
            ],
            programId: o,
            data: P,
          }),
          X = "processed",
          U = await t.sendTransaction(M, [e, n], { preflightCommitment: X }),
          { context: T, value: H } = await t.confirmTransaction(
            {
              signature: U,
              lastValidBlockHeight: M.lastValidBlockHeight,
              blockhash: M.recentBlockhash,
            },
            X
          );
        if (H.err)
          throw new Error(`Transaction ${U} failed (${JSON.stringify(H)})`);
        for (;;) {
          try {
            if ((await t.getSlot({ commitment: X })) > T.slot) break;
          } catch {}
          await new Promise((J) => setTimeout(J, Math.round($0 / 2)));
        }
      }
      return !0;
    }
  };
va.chunkSize = X0;
var p1 = new Wt("BPFLoader2111111111111111111111111111111111");
var y1 = globalThis.fetch;
var g1 = {
  index: 1,
  layout: L.struct([
    L.u32("typeIndex"),
    ro("deactivationSlot"),
    L.nu64("lastExtendedSlot"),
    L.u8("lastExtendedStartIndex"),
    L.u8(),
    L.seq(Zt(), L.offset(L.u8(), -1), "authority"),
  ]),
};
var Ke = to(Ti(Wt), ot(), (r) => new Wt(r)),
  au = Pi([ot(), Re("base64")]),
  Aa = to(Ti(Tt.Buffer), au, (r) => Tt.Buffer.from(r[0], "base64")),
  m1 = 30 * 1e3;
function cu(r) {
  return tr([
    Y({ jsonrpc: Re("2.0"), id: ot(), result: r }),
    Y({
      jsonrpc: Re("2.0"),
      id: ot(),
      error: Y({ code: Mn(), message: ot(), data: St(Gc()) }),
    }),
  ]);
}
var J0 = cu(Mn());
function ve(r) {
  return to(cu(r), J0, (t) =>
    "error" in t ? t : { ...t, result: Qn(t.result, r) }
  );
}
function kr(r) {
  return ve(Y({ context: Y({ slot: O() }), value: r }));
}
function Ji(r) {
  return Y({ context: Y({ slot: O() }), value: r });
}
var Q0 = Y({
    foundation: O(),
    foundationTerm: O(),
    initial: O(),
    taper: O(),
    terminal: O(),
  }),
  b1 = ve(
    lt(
      dt(
        Y({
          epoch: O(),
          effectiveSlot: O(),
          amount: O(),
          postBalance: O(),
          commission: St(dt(O())),
        })
      )
    )
  ),
  td = lt(Y({ slot: O(), prioritizationFee: O() })),
  ed = Y({ total: O(), validator: O(), foundation: O(), epoch: O() }),
  rd = Y({
    epoch: O(),
    slotIndex: O(),
    slotsInEpoch: O(),
    absoluteSlot: O(),
    blockHeight: St(O()),
    transactionCount: St(O()),
  }),
  nd = Y({
    slotsPerEpoch: O(),
    leaderScheduleSlotOffset: O(),
    warmup: Ir(),
    firstNormalEpoch: O(),
    firstNormalSlot: O(),
  }),
  od = js(ot(), lt(O())),
  Tn = dt(tr([Y({}), ot()])),
  id = Y({ err: Tn }),
  sd = Re("receivedSignature"),
  w1 = Y({ "solana-core": ot(), "feature-set": St(O()) }),
  ad = Y({ program: ot(), programId: Ke, parsed: Mn() }),
  cd = Y({ programId: Ke, accounts: lt(Ke), data: ot() }),
  x1 = kr(
    Y({
      err: dt(tr([Y({}), ot()])),
      logs: dt(lt(ot())),
      accounts: St(
        dt(
          lt(
            dt(
              Y({
                executable: Ir(),
                owner: ot(),
                lamports: O(),
                data: lt(ot()),
                rentEpoch: St(O()),
              })
            )
          )
        )
      ),
      unitsConsumed: St(O()),
      returnData: St(
        dt(Y({ programId: ot(), data: Pi([ot(), Re("base64")]) }))
      ),
      innerInstructions: St(
        dt(lt(Y({ index: O(), instructions: lt(tr([ad, cd])) })))
      ),
    })
  ),
  v1 = kr(
    Y({
      byIdentity: js(ot(), lt(O())),
      range: Y({ firstSlot: O(), lastSlot: O() }),
    })
  );
var k1 = ve(Q0),
  B1 = ve(ed),
  S1 = ve(td),
  E1 = ve(rd),
  _1 = ve(nd),
  A1 = ve(od),
  I1 = ve(O()),
  L1 = kr(
    Y({
      total: O(),
      circulating: O(),
      nonCirculating: O(),
      nonCirculatingAccounts: lt(Ke),
    })
  ),
  fd = Y({
    amount: ot(),
    uiAmount: dt(O()),
    decimals: O(),
    uiAmountString: St(ot()),
  }),
  R1 = kr(
    lt(
      Y({
        address: Ke,
        amount: ot(),
        uiAmount: dt(O()),
        decimals: O(),
        uiAmountString: St(ot()),
      })
    )
  ),
  M1 = kr(
    lt(
      Y({
        pubkey: Ke,
        account: Y({
          executable: Ir(),
          owner: Ke,
          lamports: O(),
          data: Aa,
          rentEpoch: O(),
        }),
      })
    )
  ),
  ka = Y({ program: ot(), parsed: Mn(), space: O() }),
  T1 = kr(
    lt(
      Y({
        pubkey: Ke,
        account: Y({
          executable: Ir(),
          owner: Ke,
          lamports: O(),
          data: ka,
          rentEpoch: O(),
        }),
      })
    )
  ),
  P1 = kr(lt(Y({ lamports: O(), address: Ke }))),
  Ia = Y({
    executable: Ir(),
    owner: Ke,
    lamports: O(),
    data: Aa,
    rentEpoch: O(),
  }),
  C1 = Y({ pubkey: Ke, account: Ia }),
  ud = to(tr([Ti(Tt.Buffer), ka]), tr([au, ka]), (r) =>
    Array.isArray(r) ? Qn(r, Aa) : r
  ),
  hd = Y({
    executable: Ir(),
    owner: Ke,
    lamports: O(),
    data: ud,
    rentEpoch: O(),
  }),
  U1 = Y({ pubkey: Ke, account: hd }),
  O1 = Y({
    state: tr([
      Re("active"),
      Re("inactive"),
      Re("activating"),
      Re("deactivating"),
    ]),
    active: O(),
    inactive: O(),
  }),
  N1 = ve(
    lt(
      Y({
        signature: ot(),
        slot: O(),
        err: Tn,
        memo: dt(ot()),
        blockTime: St(dt(O())),
      })
    )
  ),
  z1 = ve(
    lt(
      Y({
        signature: ot(),
        slot: O(),
        err: Tn,
        memo: dt(ot()),
        blockTime: St(dt(O())),
      })
    )
  ),
  F1 = Y({ subscription: O(), result: Ji(Ia) }),
  ld = Y({ pubkey: Ke, account: Ia }),
  K1 = Y({ subscription: O(), result: Ji(ld) }),
  dd = Y({ parent: O(), slot: O(), root: O() }),
  q1 = Y({ subscription: O(), result: dd }),
  pd = tr([
    Y({
      type: tr([
        Re("firstShredReceived"),
        Re("completed"),
        Re("optimisticConfirmation"),
        Re("root"),
      ]),
      slot: O(),
      timestamp: O(),
    }),
    Y({ type: Re("createdBank"), parent: O(), slot: O(), timestamp: O() }),
    Y({
      type: Re("frozen"),
      slot: O(),
      timestamp: O(),
      stats: Y({
        numTransactionEntries: O(),
        numSuccessfulTransactions: O(),
        numFailedTransactions: O(),
        maxTransactionsPerEntry: O(),
      }),
    }),
    Y({ type: Re("dead"), slot: O(), timestamp: O(), err: ot() }),
  ]),
  D1 = Y({ subscription: O(), result: pd }),
  W1 = Y({ subscription: O(), result: Ji(tr([id, sd])) }),
  H1 = Y({ subscription: O(), result: O() }),
  $1 = Y({
    pubkey: ot(),
    gossip: dt(ot()),
    tpu: dt(ot()),
    rpc: dt(ot()),
    version: dt(ot()),
  }),
  Gf = Y({
    votePubkey: ot(),
    nodePubkey: ot(),
    activatedStake: O(),
    epochVoteAccount: Ir(),
    epochCredits: lt(Pi([O(), O(), O()])),
    commission: O(),
    lastVote: O(),
    rootSlot: dt(O()),
  }),
  V1 = ve(Y({ current: lt(Gf), delinquent: lt(Gf) })),
  yd = tr([Re("processed"), Re("confirmed"), Re("finalized")]),
  gd = Y({
    slot: O(),
    confirmations: dt(O()),
    err: Tn,
    confirmationStatus: St(yd),
  }),
  j1 = kr(lt(dt(gd))),
  G1 = ve(O()),
  fu = Y({
    accountKey: Ke,
    writableIndexes: lt(O()),
    readonlyIndexes: lt(O()),
  }),
  La = Y({
    signatures: lt(ot()),
    message: Y({
      accountKeys: lt(ot()),
      header: Y({
        numRequiredSignatures: O(),
        numReadonlySignedAccounts: O(),
        numReadonlyUnsignedAccounts: O(),
      }),
      instructions: lt(
        Y({ accounts: lt(O()), data: ot(), programIdIndex: O() })
      ),
      recentBlockhash: ot(),
      addressTableLookups: St(lt(fu)),
    }),
  }),
  uu = Y({
    pubkey: Ke,
    signer: Ir(),
    writable: Ir(),
    source: St(tr([Re("transaction"), Re("lookupTable")])),
  }),
  hu = Y({ accountKeys: lt(uu), signatures: lt(ot()) }),
  lu = Y({ parsed: Mn(), program: ot(), programId: Ke }),
  du = Y({ accounts: lt(Ke), data: ot(), programId: Ke }),
  md = tr([du, lu]),
  bd = tr([
    Y({ parsed: Mn(), program: ot(), programId: ot() }),
    Y({ accounts: lt(ot()), data: ot(), programId: ot() }),
  ]),
  pu = to(md, bd, (r) => ("accounts" in r ? Qn(r, du) : Qn(r, lu))),
  yu = Y({
    signatures: lt(ot()),
    message: Y({
      accountKeys: lt(uu),
      instructions: lt(pu),
      recentBlockhash: ot(),
      addressTableLookups: St(dt(lt(fu))),
    }),
  }),
  Yi = Y({ accountIndex: O(), mint: ot(), owner: St(ot()), uiTokenAmount: fd }),
  gu = Y({ writable: lt(Ke), readonly: lt(Ke) }),
  Qi = Y({
    err: Tn,
    fee: O(),
    innerInstructions: St(
      dt(
        lt(
          Y({
            index: O(),
            instructions: lt(
              Y({ accounts: lt(O()), data: ot(), programIdIndex: O() })
            ),
          })
        )
      )
    ),
    preBalances: lt(O()),
    postBalances: lt(O()),
    logMessages: St(dt(lt(ot()))),
    preTokenBalances: St(dt(lt(Yi))),
    postTokenBalances: St(dt(lt(Yi))),
    loadedAddresses: St(gu),
    computeUnitsConsumed: St(O()),
  }),
  Ra = Y({
    err: Tn,
    fee: O(),
    innerInstructions: St(dt(lt(Y({ index: O(), instructions: lt(pu) })))),
    preBalances: lt(O()),
    postBalances: lt(O()),
    logMessages: St(dt(lt(ot()))),
    preTokenBalances: St(dt(lt(Yi))),
    postTokenBalances: St(dt(lt(Yi))),
    loadedAddresses: St(gu),
    computeUnitsConsumed: St(O()),
  }),
  oo = tr([Re(0), Re("legacy")]),
  Pn = Y({
    pubkey: ot(),
    lamports: O(),
    postBalance: dt(O()),
    rewardType: dt(ot()),
    commission: St(dt(O())),
  }),
  Y1 = ve(
    dt(
      Y({
        blockhash: ot(),
        previousBlockhash: ot(),
        parentSlot: O(),
        transactions: lt(Y({ transaction: La, meta: dt(Qi), version: St(oo) })),
        rewards: St(lt(Pn)),
        blockTime: dt(O()),
        blockHeight: dt(O()),
      })
    )
  ),
  Z1 = ve(
    dt(
      Y({
        blockhash: ot(),
        previousBlockhash: ot(),
        parentSlot: O(),
        rewards: St(lt(Pn)),
        blockTime: dt(O()),
        blockHeight: dt(O()),
      })
    )
  ),
  X1 = ve(
    dt(
      Y({
        blockhash: ot(),
        previousBlockhash: ot(),
        parentSlot: O(),
        transactions: lt(Y({ transaction: hu, meta: dt(Qi), version: St(oo) })),
        rewards: St(lt(Pn)),
        blockTime: dt(O()),
        blockHeight: dt(O()),
      })
    )
  ),
  J1 = ve(
    dt(
      Y({
        blockhash: ot(),
        previousBlockhash: ot(),
        parentSlot: O(),
        transactions: lt(Y({ transaction: yu, meta: dt(Ra), version: St(oo) })),
        rewards: St(lt(Pn)),
        blockTime: dt(O()),
        blockHeight: dt(O()),
      })
    )
  ),
  Q1 = ve(
    dt(
      Y({
        blockhash: ot(),
        previousBlockhash: ot(),
        parentSlot: O(),
        transactions: lt(Y({ transaction: hu, meta: dt(Ra), version: St(oo) })),
        rewards: St(lt(Pn)),
        blockTime: dt(O()),
        blockHeight: dt(O()),
      })
    )
  ),
  tg = ve(
    dt(
      Y({
        blockhash: ot(),
        previousBlockhash: ot(),
        parentSlot: O(),
        rewards: St(lt(Pn)),
        blockTime: dt(O()),
        blockHeight: dt(O()),
      })
    )
  ),
  eg = ve(
    dt(
      Y({
        blockhash: ot(),
        previousBlockhash: ot(),
        parentSlot: O(),
        transactions: lt(Y({ transaction: La, meta: dt(Qi) })),
        rewards: St(lt(Pn)),
        blockTime: dt(O()),
      })
    )
  ),
  rg = ve(
    dt(
      Y({
        blockhash: ot(),
        previousBlockhash: ot(),
        parentSlot: O(),
        signatures: lt(ot()),
        blockTime: dt(O()),
      })
    )
  ),
  ng = ve(
    dt(
      Y({
        slot: O(),
        meta: dt(Qi),
        blockTime: St(dt(O())),
        transaction: La,
        version: St(oo),
      })
    )
  ),
  og = ve(
    dt(
      Y({
        slot: O(),
        transaction: yu,
        meta: dt(Ra),
        blockTime: St(dt(O())),
        version: St(oo),
      })
    )
  ),
  ig = kr(
    Y({ blockhash: ot(), feeCalculator: Y({ lamportsPerSignature: O() }) })
  ),
  sg = kr(Y({ blockhash: ot(), lastValidBlockHeight: O() })),
  ag = kr(Ir()),
  wd = Y({
    slot: O(),
    numTransactions: O(),
    numSlots: O(),
    samplePeriodSecs: O(),
  }),
  cg = ve(lt(wd)),
  fg = kr(dt(Y({ feeCalculator: Y({ lamportsPerSignature: O() }) }))),
  ug = ve(ot()),
  hg = ve(ot()),
  xd = Y({ err: Tn, logs: lt(ot()), signature: ot() }),
  lg = Y({ result: Ji(xd), subscription: O() });
var Co = class r {
    constructor(t) {
      (this._keypair = void 0), (this._keypair = t ?? Wf());
    }
    static generate() {
      return new r(Wf());
    }
    static fromSecretKey(t, e) {
      if (t.byteLength !== 64) throw new Error("bad secret key size");
      let n = t.slice(32, 64);
      if (!e || !e.skipValidation) {
        let o = t.slice(0, 32),
          i = pa(o);
        for (let s = 0; s < 32; s++)
          if (n[s] !== i[s]) throw new Error("provided secretKey is invalid");
      }
      return new r({ publicKey: n, secretKey: t });
    }
    static fromSeed(t) {
      let e = pa(t),
        n = new Uint8Array(64);
      return n.set(t), n.set(e, 32), new r({ publicKey: e, secretKey: n });
    }
    get publicKey() {
      return new Wt(this._keypair.publicKey);
    }
    get secretKey() {
      return new Uint8Array(this._keypair.secretKey);
    }
  },
  Ao = Object.freeze({
    CreateLookupTable: {
      index: 0,
      layout: L.struct([
        L.u32("instruction"),
        ro("recentSlot"),
        L.u8("bumpSeed"),
      ]),
    },
    FreezeLookupTable: { index: 1, layout: L.struct([L.u32("instruction")]) },
    ExtendLookupTable: {
      index: 2,
      layout: L.struct([
        L.u32("instruction"),
        ro(),
        L.seq(Zt(), L.offset(L.u32(), -8), "addresses"),
      ]),
    },
    DeactivateLookupTable: {
      index: 3,
      layout: L.struct([L.u32("instruction")]),
    },
    CloseLookupTable: { index: 4, layout: L.struct([L.u32("instruction")]) },
  });
var Ba = class {
  constructor() {}
  static createLookupTable(t) {
    let [e, n] = Wt.findProgramAddressSync(
        [t.authority.toBuffer(), (0, Oo.toBufferLE)(BigInt(t.recentSlot), 8)],
        this.programId
      ),
      o = Ao.CreateLookupTable,
      i = jt(o, { recentSlot: BigInt(t.recentSlot), bumpSeed: n }),
      s = [
        { pubkey: e, isSigner: !1, isWritable: !0 },
        { pubkey: t.authority, isSigner: !0, isWritable: !1 },
        { pubkey: t.payer, isSigner: !0, isWritable: !0 },
        { pubkey: fr.programId, isSigner: !1, isWritable: !1 },
      ];
    return [new ye({ programId: this.programId, keys: s, data: i }), e];
  }
  static freezeLookupTable(t) {
    let e = Ao.FreezeLookupTable,
      n = jt(e),
      o = [
        { pubkey: t.lookupTable, isSigner: !1, isWritable: !0 },
        { pubkey: t.authority, isSigner: !0, isWritable: !1 },
      ];
    return new ye({ programId: this.programId, keys: o, data: n });
  }
  static extendLookupTable(t) {
    let e = Ao.ExtendLookupTable,
      n = jt(e, { addresses: t.addresses.map((i) => i.toBytes()) }),
      o = [
        { pubkey: t.lookupTable, isSigner: !1, isWritable: !0 },
        { pubkey: t.authority, isSigner: !0, isWritable: !1 },
      ];
    return (
      t.payer &&
        o.push(
          { pubkey: t.payer, isSigner: !0, isWritable: !0 },
          { pubkey: fr.programId, isSigner: !1, isWritable: !1 }
        ),
      new ye({ programId: this.programId, keys: o, data: n })
    );
  }
  static deactivateLookupTable(t) {
    let e = Ao.DeactivateLookupTable,
      n = jt(e),
      o = [
        { pubkey: t.lookupTable, isSigner: !1, isWritable: !0 },
        { pubkey: t.authority, isSigner: !0, isWritable: !1 },
      ];
    return new ye({ programId: this.programId, keys: o, data: n });
  }
  static closeLookupTable(t) {
    let e = Ao.CloseLookupTable,
      n = jt(e),
      o = [
        { pubkey: t.lookupTable, isSigner: !1, isWritable: !0 },
        { pubkey: t.authority, isSigner: !0, isWritable: !1 },
        { pubkey: t.recipient, isSigner: !1, isWritable: !0 },
      ];
    return new ye({ programId: this.programId, keys: o, data: n });
  }
};
Ba.programId = new Wt("AddressLookupTab1e1111111111111111111111111");
var Hi = Object.freeze({
    RequestUnits: {
      index: 0,
      layout: L.struct([
        L.u8("instruction"),
        L.u32("units"),
        L.u32("additionalFee"),
      ]),
    },
    RequestHeapFrame: {
      index: 1,
      layout: L.struct([L.u8("instruction"), L.u32("bytes")]),
    },
    SetComputeUnitLimit: {
      index: 2,
      layout: L.struct([L.u8("instruction"), L.u32("units")]),
    },
    SetComputeUnitPrice: {
      index: 3,
      layout: L.struct([L.u8("instruction"), ro("microLamports")]),
    },
  }),
  Sa = class {
    constructor() {}
    static requestUnits(t) {
      let e = Hi.RequestUnits,
        n = jt(e, t);
      return new ye({ keys: [], programId: this.programId, data: n });
    }
    static requestHeapFrame(t) {
      let e = Hi.RequestHeapFrame,
        n = jt(e, t);
      return new ye({ keys: [], programId: this.programId, data: n });
    }
    static setComputeUnitLimit(t) {
      let e = Hi.SetComputeUnitLimit,
        n = jt(e, t);
      return new ye({ keys: [], programId: this.programId, data: n });
    }
    static setComputeUnitPrice(t) {
      let e = Hi.SetComputeUnitPrice,
        n = jt(e, { microLamports: BigInt(t.microLamports) });
      return new ye({ keys: [], programId: this.programId, data: n });
    }
  };
Sa.programId = new Wt("ComputeBudget111111111111111111111111111111");
var Yf = 64,
  Zf = 32,
  Xf = 64,
  Jf = L.struct([
    L.u8("numSignatures"),
    L.u8("padding"),
    L.u16("signatureOffset"),
    L.u16("signatureInstructionIndex"),
    L.u16("publicKeyOffset"),
    L.u16("publicKeyInstructionIndex"),
    L.u16("messageDataOffset"),
    L.u16("messageDataSize"),
    L.u16("messageInstructionIndex"),
  ]),
  Ea = class r {
    constructor() {}
    static createInstructionWithPublicKey(t) {
      let { publicKey: e, message: n, signature: o, instructionIndex: i } = t;
      $e(
        e.length === Zf,
        `Public Key must be ${Zf} bytes but received ${e.length} bytes`
      ),
        $e(
          o.length === Xf,
          `Signature must be ${Xf} bytes but received ${o.length} bytes`
        );
      let s = Jf.span,
        d = s + e.length,
        p = d + o.length,
        S = 1,
        k = Tt.Buffer.alloc(p + n.length),
        _ = i ?? 65535;
      return (
        Jf.encode(
          {
            numSignatures: S,
            padding: 0,
            signatureOffset: d,
            signatureInstructionIndex: _,
            publicKeyOffset: s,
            publicKeyInstructionIndex: _,
            messageDataOffset: p,
            messageDataSize: n.length,
            messageInstructionIndex: _,
          },
          k
        ),
        k.fill(e, s),
        k.fill(o, d),
        k.fill(n, p),
        new ye({ keys: [], programId: r.programId, data: k })
      );
    }
    static createInstructionWithPrivateKey(t) {
      let { privateKey: e, message: n, instructionIndex: o } = t;
      $e(
        e.length === Yf,
        `Private key must be ${Yf} bytes but received ${e.length} bytes`
      );
      try {
        let i = Co.fromSecretKey(e),
          s = i.publicKey.toBytes(),
          d = ru(n, i.secretKey);
        return this.createInstructionWithPublicKey({
          publicKey: s,
          message: n,
          signature: d,
          instructionIndex: o,
        });
      } catch (i) {
        throw new Error(`Error creating instruction; ${i}`);
      }
    }
  };
Ea.programId = new Wt("Ed25519SigVerify111111111111111111111111111");
var vd = (r, t) => {
  let e = _o.sign(r, t);
  return [e.toCompactRawBytes(), e.recovery];
};
_o.utils.isValidPrivateKey;
var kd = _o.getPublicKey,
  Qf = 32,
  ha = 20,
  tu = 64,
  Bd = 11,
  la = L.struct([
    L.u8("numSignatures"),
    L.u16("signatureOffset"),
    L.u8("signatureInstructionIndex"),
    L.u16("ethAddressOffset"),
    L.u8("ethAddressInstructionIndex"),
    L.u16("messageDataOffset"),
    L.u16("messageDataSize"),
    L.u8("messageInstructionIndex"),
    L.blob(20, "ethAddress"),
    L.blob(64, "signature"),
    L.u8("recoveryId"),
  ]),
  _a = class r {
    constructor() {}
    static publicKeyToEthAddress(t) {
      $e(
        t.length === tu,
        `Public key must be ${tu} bytes but received ${t.length} bytes`
      );
      try {
        return Tt.Buffer.from(oa(Jt(t))).slice(-ha);
      } catch (e) {
        throw new Error(`Error constructing Ethereum address: ${e}`);
      }
    }
    static createInstructionWithPublicKey(t) {
      let {
        publicKey: e,
        message: n,
        signature: o,
        recoveryId: i,
        instructionIndex: s,
      } = t;
      return r.createInstructionWithEthAddress({
        ethAddress: r.publicKeyToEthAddress(e),
        message: n,
        signature: o,
        recoveryId: i,
        instructionIndex: s,
      });
    }
    static createInstructionWithEthAddress(t) {
      let {
          ethAddress: e,
          message: n,
          signature: o,
          recoveryId: i,
          instructionIndex: s = 0,
        } = t,
        d;
      typeof e == "string"
        ? e.startsWith("0x")
          ? (d = Tt.Buffer.from(e.substr(2), "hex"))
          : (d = Tt.Buffer.from(e, "hex"))
        : (d = e),
        $e(
          d.length === ha,
          `Address must be ${ha} bytes but received ${d.length} bytes`
        );
      let p = 1 + Bd,
        S = p,
        k = p + d.length,
        _ = k + o.length + 1,
        P = 1,
        M = Tt.Buffer.alloc(la.span + n.length);
      return (
        la.encode(
          {
            numSignatures: P,
            signatureOffset: k,
            signatureInstructionIndex: s,
            ethAddressOffset: S,
            ethAddressInstructionIndex: s,
            messageDataOffset: _,
            messageDataSize: n.length,
            messageInstructionIndex: s,
            signature: Jt(o),
            ethAddress: Jt(d),
            recoveryId: i,
          },
          M
        ),
        M.fill(Jt(n), la.span),
        new ye({ keys: [], programId: r.programId, data: M })
      );
    }
    static createInstructionWithPrivateKey(t) {
      let { privateKey: e, message: n, instructionIndex: o } = t;
      $e(
        e.length === Qf,
        `Private key must be ${Qf} bytes but received ${e.length} bytes`
      );
      try {
        let i = Jt(e),
          s = kd(i, !1).slice(1),
          d = Tt.Buffer.from(oa(Jt(n))),
          [p, S] = vd(d, i);
        return this.createInstructionWithPublicKey({
          publicKey: s,
          message: n,
          signature: p,
          recoveryId: S,
          instructionIndex: o,
        });
      } catch (i) {
        throw new Error(`Error creating instruction; ${i}`);
      }
    }
  };
_a.programId = new Wt("KeccakSecp256k11111111111111111111111111111");
var mu,
  Sd = new Wt("StakeConfig11111111111111111111111111111111");
var Uo = class {
  constructor(t, e, n) {
    (this.unixTimestamp = void 0),
      (this.epoch = void 0),
      (this.custodian = void 0),
      (this.unixTimestamp = t),
      (this.epoch = e),
      (this.custodian = n);
  }
};
mu = Uo;
Uo.default = new mu(0, 0, Wt.default);
var yn = Object.freeze({
    Initialize: {
      index: 0,
      layout: L.struct([L.u32("instruction"), N0(), z0()]),
    },
    Authorize: {
      index: 1,
      layout: L.struct([
        L.u32("instruction"),
        Zt("newAuthorized"),
        L.u32("stakeAuthorizationType"),
      ]),
    },
    Delegate: { index: 2, layout: L.struct([L.u32("instruction")]) },
    Split: {
      index: 3,
      layout: L.struct([L.u32("instruction"), L.ns64("lamports")]),
    },
    Withdraw: {
      index: 4,
      layout: L.struct([L.u32("instruction"), L.ns64("lamports")]),
    },
    Deactivate: { index: 5, layout: L.struct([L.u32("instruction")]) },
    Merge: { index: 7, layout: L.struct([L.u32("instruction")]) },
    AuthorizeWithSeed: {
      index: 8,
      layout: L.struct([
        L.u32("instruction"),
        Zt("newAuthorized"),
        L.u32("stakeAuthorizationType"),
        eo("authoritySeed"),
        Zt("authorityOwner"),
      ]),
    },
  }),
  dg = Object.freeze({ Staker: { index: 0 }, Withdrawer: { index: 1 } }),
  Zi = class {
    constructor() {}
    static initialize(t) {
      let { stakePubkey: e, authorized: n, lockup: o } = t,
        i = o || Uo.default,
        s = yn.Initialize,
        d = jt(s, {
          authorized: {
            staker: Jt(n.staker.toBuffer()),
            withdrawer: Jt(n.withdrawer.toBuffer()),
          },
          lockup: {
            unixTimestamp: i.unixTimestamp,
            epoch: i.epoch,
            custodian: Jt(i.custodian.toBuffer()),
          },
        }),
        p = {
          keys: [
            { pubkey: e, isSigner: !1, isWritable: !0 },
            { pubkey: Po, isSigner: !1, isWritable: !1 },
          ],
          programId: this.programId,
          data: d,
        };
      return new ye(p);
    }
    static createAccountWithSeed(t) {
      let e = new Me();
      e.add(
        fr.createAccountWithSeed({
          fromPubkey: t.fromPubkey,
          newAccountPubkey: t.stakePubkey,
          basePubkey: t.basePubkey,
          seed: t.seed,
          lamports: t.lamports,
          space: this.space,
          programId: this.programId,
        })
      );
      let { stakePubkey: n, authorized: o, lockup: i } = t;
      return e.add(
        this.initialize({ stakePubkey: n, authorized: o, lockup: i })
      );
    }
    static createAccount(t) {
      let e = new Me();
      e.add(
        fr.createAccount({
          fromPubkey: t.fromPubkey,
          newAccountPubkey: t.stakePubkey,
          lamports: t.lamports,
          space: this.space,
          programId: this.programId,
        })
      );
      let { stakePubkey: n, authorized: o, lockup: i } = t;
      return e.add(
        this.initialize({ stakePubkey: n, authorized: o, lockup: i })
      );
    }
    static delegate(t) {
      let { stakePubkey: e, authorizedPubkey: n, votePubkey: o } = t,
        i = yn.Delegate,
        s = jt(i);
      return new Me().add({
        keys: [
          { pubkey: e, isSigner: !1, isWritable: !0 },
          { pubkey: o, isSigner: !1, isWritable: !1 },
          { pubkey: Gr, isSigner: !1, isWritable: !1 },
          { pubkey: ua, isSigner: !1, isWritable: !1 },
          { pubkey: Sd, isSigner: !1, isWritable: !1 },
          { pubkey: n, isSigner: !0, isWritable: !1 },
        ],
        programId: this.programId,
        data: s,
      });
    }
    static authorize(t) {
      let {
          stakePubkey: e,
          authorizedPubkey: n,
          newAuthorizedPubkey: o,
          stakeAuthorizationType: i,
          custodianPubkey: s,
        } = t,
        d = yn.Authorize,
        p = jt(d, {
          newAuthorized: Jt(o.toBuffer()),
          stakeAuthorizationType: i.index,
        }),
        S = [
          { pubkey: e, isSigner: !1, isWritable: !0 },
          { pubkey: Gr, isSigner: !1, isWritable: !0 },
          { pubkey: n, isSigner: !0, isWritable: !1 },
        ];
      return (
        s && S.push({ pubkey: s, isSigner: !0, isWritable: !1 }),
        new Me().add({ keys: S, programId: this.programId, data: p })
      );
    }
    static authorizeWithSeed(t) {
      let {
          stakePubkey: e,
          authorityBase: n,
          authoritySeed: o,
          authorityOwner: i,
          newAuthorizedPubkey: s,
          stakeAuthorizationType: d,
          custodianPubkey: p,
        } = t,
        S = yn.AuthorizeWithSeed,
        k = jt(S, {
          newAuthorized: Jt(s.toBuffer()),
          stakeAuthorizationType: d.index,
          authoritySeed: o,
          authorityOwner: Jt(i.toBuffer()),
        }),
        _ = [
          { pubkey: e, isSigner: !1, isWritable: !0 },
          { pubkey: n, isSigner: !0, isWritable: !1 },
          { pubkey: Gr, isSigner: !1, isWritable: !1 },
        ];
      return (
        p && _.push({ pubkey: p, isSigner: !0, isWritable: !1 }),
        new Me().add({ keys: _, programId: this.programId, data: k })
      );
    }
    static splitInstruction(t) {
      let {
          stakePubkey: e,
          authorizedPubkey: n,
          splitStakePubkey: o,
          lamports: i,
        } = t,
        s = yn.Split,
        d = jt(s, { lamports: i });
      return new ye({
        keys: [
          { pubkey: e, isSigner: !1, isWritable: !0 },
          { pubkey: o, isSigner: !1, isWritable: !0 },
          { pubkey: n, isSigner: !0, isWritable: !1 },
        ],
        programId: this.programId,
        data: d,
      });
    }
    static split(t, e) {
      let n = new Me();
      return (
        n.add(
          fr.createAccount({
            fromPubkey: t.authorizedPubkey,
            newAccountPubkey: t.splitStakePubkey,
            lamports: e,
            space: this.space,
            programId: this.programId,
          })
        ),
        n.add(this.splitInstruction(t))
      );
    }
    static splitWithSeed(t, e) {
      let {
          stakePubkey: n,
          authorizedPubkey: o,
          splitStakePubkey: i,
          basePubkey: s,
          seed: d,
          lamports: p,
        } = t,
        S = new Me();
      return (
        S.add(
          fr.allocate({
            accountPubkey: i,
            basePubkey: s,
            seed: d,
            space: this.space,
            programId: this.programId,
          })
        ),
        e &&
          e > 0 &&
          S.add(
            fr.transfer({
              fromPubkey: t.authorizedPubkey,
              toPubkey: i,
              lamports: e,
            })
          ),
        S.add(
          this.splitInstruction({
            stakePubkey: n,
            authorizedPubkey: o,
            splitStakePubkey: i,
            lamports: p,
          })
        )
      );
    }
    static merge(t) {
      let { stakePubkey: e, sourceStakePubKey: n, authorizedPubkey: o } = t,
        i = yn.Merge,
        s = jt(i);
      return new Me().add({
        keys: [
          { pubkey: e, isSigner: !1, isWritable: !0 },
          { pubkey: n, isSigner: !1, isWritable: !0 },
          { pubkey: Gr, isSigner: !1, isWritable: !1 },
          { pubkey: ua, isSigner: !1, isWritable: !1 },
          { pubkey: o, isSigner: !0, isWritable: !1 },
        ],
        programId: this.programId,
        data: s,
      });
    }
    static withdraw(t) {
      let {
          stakePubkey: e,
          authorizedPubkey: n,
          toPubkey: o,
          lamports: i,
          custodianPubkey: s,
        } = t,
        d = yn.Withdraw,
        p = jt(d, { lamports: i }),
        S = [
          { pubkey: e, isSigner: !1, isWritable: !0 },
          { pubkey: o, isSigner: !1, isWritable: !0 },
          { pubkey: Gr, isSigner: !1, isWritable: !1 },
          { pubkey: ua, isSigner: !1, isWritable: !1 },
          { pubkey: n, isSigner: !0, isWritable: !1 },
        ];
      return (
        s && S.push({ pubkey: s, isSigner: !0, isWritable: !1 }),
        new Me().add({ keys: S, programId: this.programId, data: p })
      );
    }
    static deactivate(t) {
      let { stakePubkey: e, authorizedPubkey: n } = t,
        o = yn.Deactivate,
        i = jt(o);
      return new Me().add({
        keys: [
          { pubkey: e, isSigner: !1, isWritable: !0 },
          { pubkey: Gr, isSigner: !1, isWritable: !1 },
          { pubkey: n, isSigner: !0, isWritable: !1 },
        ],
        programId: this.programId,
        data: i,
      });
    }
  };
Zi.programId = new Wt("Stake11111111111111111111111111111111111111");
Zi.space = 200;
var Io = Object.freeze({
    InitializeAccount: {
      index: 0,
      layout: L.struct([L.u32("instruction"), F0()]),
    },
    Authorize: {
      index: 1,
      layout: L.struct([
        L.u32("instruction"),
        Zt("newAuthorized"),
        L.u32("voteAuthorizationType"),
      ]),
    },
    Withdraw: {
      index: 3,
      layout: L.struct([L.u32("instruction"), L.ns64("lamports")]),
    },
    UpdateValidatorIdentity: {
      index: 4,
      layout: L.struct([L.u32("instruction")]),
    },
    AuthorizeWithSeed: {
      index: 10,
      layout: L.struct([L.u32("instruction"), K0()]),
    },
  }),
  pg = Object.freeze({ Voter: { index: 0 }, Withdrawer: { index: 1 } }),
  Xi = class r {
    constructor() {}
    static initializeAccount(t) {
      let { votePubkey: e, nodePubkey: n, voteInit: o } = t,
        i = Io.InitializeAccount,
        s = jt(i, {
          voteInit: {
            nodePubkey: Jt(o.nodePubkey.toBuffer()),
            authorizedVoter: Jt(o.authorizedVoter.toBuffer()),
            authorizedWithdrawer: Jt(o.authorizedWithdrawer.toBuffer()),
            commission: o.commission,
          },
        }),
        d = {
          keys: [
            { pubkey: e, isSigner: !1, isWritable: !0 },
            { pubkey: Po, isSigner: !1, isWritable: !1 },
            { pubkey: Gr, isSigner: !1, isWritable: !1 },
            { pubkey: n, isSigner: !0, isWritable: !1 },
          ],
          programId: this.programId,
          data: s,
        };
      return new ye(d);
    }
    static createAccount(t) {
      let e = new Me();
      return (
        e.add(
          fr.createAccount({
            fromPubkey: t.fromPubkey,
            newAccountPubkey: t.votePubkey,
            lamports: t.lamports,
            space: this.space,
            programId: this.programId,
          })
        ),
        e.add(
          this.initializeAccount({
            votePubkey: t.votePubkey,
            nodePubkey: t.voteInit.nodePubkey,
            voteInit: t.voteInit,
          })
        )
      );
    }
    static authorize(t) {
      let {
          votePubkey: e,
          authorizedPubkey: n,
          newAuthorizedPubkey: o,
          voteAuthorizationType: i,
        } = t,
        s = Io.Authorize,
        d = jt(s, {
          newAuthorized: Jt(o.toBuffer()),
          voteAuthorizationType: i.index,
        }),
        p = [
          { pubkey: e, isSigner: !1, isWritable: !0 },
          { pubkey: Gr, isSigner: !1, isWritable: !1 },
          { pubkey: n, isSigner: !0, isWritable: !1 },
        ];
      return new Me().add({ keys: p, programId: this.programId, data: d });
    }
    static authorizeWithSeed(t) {
      let {
          currentAuthorityDerivedKeyBasePubkey: e,
          currentAuthorityDerivedKeyOwnerPubkey: n,
          currentAuthorityDerivedKeySeed: o,
          newAuthorizedPubkey: i,
          voteAuthorizationType: s,
          votePubkey: d,
        } = t,
        p = Io.AuthorizeWithSeed,
        S = jt(p, {
          voteAuthorizeWithSeedArgs: {
            currentAuthorityDerivedKeyOwnerPubkey: Jt(n.toBuffer()),
            currentAuthorityDerivedKeySeed: o,
            newAuthorized: Jt(i.toBuffer()),
            voteAuthorizationType: s.index,
          },
        }),
        k = [
          { pubkey: d, isSigner: !1, isWritable: !0 },
          { pubkey: Gr, isSigner: !1, isWritable: !1 },
          { pubkey: e, isSigner: !0, isWritable: !1 },
        ];
      return new Me().add({ keys: k, programId: this.programId, data: S });
    }
    static withdraw(t) {
      let {
          votePubkey: e,
          authorizedWithdrawerPubkey: n,
          lamports: o,
          toPubkey: i,
        } = t,
        s = Io.Withdraw,
        d = jt(s, { lamports: o }),
        p = [
          { pubkey: e, isSigner: !1, isWritable: !0 },
          { pubkey: i, isSigner: !1, isWritable: !0 },
          { pubkey: n, isSigner: !0, isWritable: !1 },
        ];
      return new Me().add({ keys: p, programId: this.programId, data: d });
    }
    static safeWithdraw(t, e, n) {
      if (t.lamports > e - n)
        throw new Error(
          "Withdraw will leave vote account with insufficient funds."
        );
      return r.withdraw(t);
    }
    static updateValidatorIdentity(t) {
      let { votePubkey: e, authorizedWithdrawerPubkey: n, nodePubkey: o } = t,
        i = Io.UpdateValidatorIdentity,
        s = jt(i),
        d = [
          { pubkey: e, isSigner: !1, isWritable: !0 },
          { pubkey: o, isSigner: !0, isWritable: !1 },
          { pubkey: n, isSigner: !0, isWritable: !1 },
        ];
      return new Me().add({ keys: d, programId: this.programId, data: s });
    }
  };
Xi.programId = new Wt("Vote111111111111111111111111111111111111111");
Xi.space = 3762;
var yg = new Wt("Va1idator1nfo111111111111111111111111111111"),
  gg = Y({
    name: ot(),
    website: St(ot()),
    details: St(ot()),
    iconUrl: St(ot()),
    keybaseUsername: St(ot()),
  });
var mg = new Wt("Vote111111111111111111111111111111111111111"),
  bg = L.struct([
    Zt("nodePubkey"),
    Zt("authorizedWithdrawer"),
    L.u8("commission"),
    L.nu64(),
    L.seq(
      L.struct([L.nu64("slot"), L.u32("confirmationCount")]),
      L.offset(L.u32(), -8),
      "votes"
    ),
    L.u8("rootSlotValid"),
    L.nu64("rootSlot"),
    L.nu64(),
    L.seq(
      L.struct([L.nu64("epoch"), Zt("authorizedVoter")]),
      L.offset(L.u32(), -8),
      "authorizedVoters"
    ),
    L.struct(
      [
        L.seq(
          L.struct([
            Zt("authorizedPubkey"),
            L.nu64("epochOfLastAuthorizedSwitch"),
            L.nu64("targetEpoch"),
          ]),
          32,
          "buf"
        ),
        L.nu64("idx"),
        L.u8("isEmpty"),
      ],
      "priorVoters"
    ),
    L.nu64(),
    L.seq(
      L.struct([L.nu64("epoch"), L.nu64("credits"), L.nu64("prevCredits")]),
      L.offset(L.u32(), -8),
      "epochCredits"
    ),
    L.struct([L.nu64("slot"), L.nu64("timestamp")], "lastTimestamp"),
  ]);
var Ta = br(wu(), 1);
(async () => {
  try {
    let r = await Lit.Actions.decryptAndCombine({
        accessControlConditions,
        ciphertext: apiKeyCipherText,
        dataToEncryptHash: apiKeyDataToEncryptHash,
        authSig: null,
        chain: "ethereum",
      }),
      t = await Lit.Actions.decryptAndCombine({
        accessControlConditions,
        ciphertext: solanaCipherText,
        dataToEncryptHash: solanaDataToEncryptHash,
        chain: "ethereum",
        authSig: null,
      }),
      e = "lit_";
    if (!t.startsWith(e))
      throw new Error(
        `PKey was not encrypted with salt; all wrapped keys must be prefixed with '${e}'`
      );
    let n = t.slice(e.length),
      o = await LitActions.runOnce(
        { waitForResponse: !0, name: "Lit Actions Test" },
        async () => {
          let p = [
            {
              role: "system",
              content:
                "You are an AI assistant that helps people make informed blockchain trading decisions. Only answer with a single sentence.",
            },
            { role: "user", content: `${prompt}` },
          ];
          return (
            await (
              await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${r}`,
                },
                body: JSON.stringify({ model: "gpt-4o-mini", messages: p }),
              })
            ).json()
          ).choices[0].message.content
            .replace(/\n/g, " ")
            .replace(/\*\*/g, "")
            .trim();
        }
      );
    console.log("OpenAI Response:", o);
    let i = Co.fromSecretKey(Ma.Buffer.from(n, "hex")),
      s = Ta.default.sign.detached(new TextEncoder().encode(o), i.secretKey);
    console.log("Solana Signature:", s);
    let d = Ta.default.sign.detached.verify(
      Ma.Buffer.from(o),
      s,
      i.publicKey.toBuffer()
    );
    d ||
      (console.log("Signature is not valid"),
      LitActions.setResponse({ response: "false" })),
      LitActions.setResponse({
        response: `Signed message. Is signature valid: ${d}`,
      });
  } catch (r) {
    LitActions.setResponse({ response: r.message });
  }
})();
/*! Bundled license information:

ieee754/index.js:
  (*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> *)

buffer/index.js:
  (*!
   * The buffer module from node.js, for the browser.
   *
   * @author   Feross Aboukhadijeh <https://feross.org>
   * @license  MIT
   *)

safe-buffer/index.js:
  (*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> *)

@solana/buffer-layout/lib/Layout.js:
  (**
   * Support for translating between Uint8Array instances and JavaScript
   * native types.
   *
   * {@link module:Layout~Layout|Layout} is the basis of a class
   * hierarchy that associates property names with sequences of encoded
   * bytes.
   *
   * Layouts are supported for these scalar (numeric) types:
   * * {@link module:Layout~UInt|Unsigned integers in little-endian
   *   format} with {@link module:Layout.u8|8-bit}, {@link
   *   module:Layout.u16|16-bit}, {@link module:Layout.u24|24-bit},
   *   {@link module:Layout.u32|32-bit}, {@link
   *   module:Layout.u40|40-bit}, and {@link module:Layout.u48|48-bit}
   *   representation ranges;
   * * {@link module:Layout~UIntBE|Unsigned integers in big-endian
   *   format} with {@link module:Layout.u16be|16-bit}, {@link
   *   module:Layout.u24be|24-bit}, {@link module:Layout.u32be|32-bit},
   *   {@link module:Layout.u40be|40-bit}, and {@link
   *   module:Layout.u48be|48-bit} representation ranges;
   * * {@link module:Layout~Int|Signed integers in little-endian
   *   format} with {@link module:Layout.s8|8-bit}, {@link
   *   module:Layout.s16|16-bit}, {@link module:Layout.s24|24-bit},
   *   {@link module:Layout.s32|32-bit}, {@link
   *   module:Layout.s40|40-bit}, and {@link module:Layout.s48|48-bit}
   *   representation ranges;
   * * {@link module:Layout~IntBE|Signed integers in big-endian format}
   *   with {@link module:Layout.s16be|16-bit}, {@link
   *   module:Layout.s24be|24-bit}, {@link module:Layout.s32be|32-bit},
   *   {@link module:Layout.s40be|40-bit}, and {@link
   *   module:Layout.s48be|48-bit} representation ranges;
   * * 64-bit integral values that decode to an exact (if magnitude is
   *   less than 2^53) or nearby integral Number in {@link
   *   module:Layout.nu64|unsigned little-endian}, {@link
   *   module:Layout.nu64be|unsigned big-endian}, {@link
   *   module:Layout.ns64|signed little-endian}, and {@link
   *   module:Layout.ns64be|unsigned big-endian} encodings;
   * * 32-bit floating point values with {@link
   *   module:Layout.f32|little-endian} and {@link
   *   module:Layout.f32be|big-endian} representations;
   * * 64-bit floating point values with {@link
   *   module:Layout.f64|little-endian} and {@link
   *   module:Layout.f64be|big-endian} representations;
   * * {@link module:Layout.const|Constants} that take no space in the
   *   encoded expression.
   *
   * and for these aggregate types:
   * * {@link module:Layout.seq|Sequence}s of instances of a {@link
   *   module:Layout~Layout|Layout}, with JavaScript representation as
   *   an Array and constant or data-dependent {@link
   *   module:Layout~Sequence#count|length};
   * * {@link module:Layout.struct|Structure}s that aggregate a
   *   heterogeneous sequence of {@link module:Layout~Layout|Layout}
   *   instances, with JavaScript representation as an Object;
   * * {@link module:Layout.union|Union}s that support multiple {@link
   *   module:Layout~VariantLayout|variant layouts} over a fixed
   *   (padded) or variable (not padded) span of bytes, using an
   *   unsigned integer at the start of the data or a separate {@link
   *   module:Layout.unionLayoutDiscriminator|layout element} to
   *   determine which layout to use when interpreting the buffer
   *   contents;
   * * {@link module:Layout.bits|BitStructure}s that contain a sequence
   *   of individual {@link
   *   module:Layout~BitStructure#addField|BitField}s packed into an 8,
   *   16, 24, or 32-bit unsigned integer starting at the least- or
   *   most-significant bit;
   * * {@link module:Layout.cstr|C strings} of varying length;
   * * {@link module:Layout.blob|Blobs} of fixed- or variable-{@link
   *   module:Layout~Blob#length|length} raw data.
   *
   * All {@link module:Layout~Layout|Layout} instances are immutable
   * after construction, to prevent internal state from becoming
   * inconsistent.
   *
   * @local Layout
   * @local ExternalLayout
   * @local GreedyCount
   * @local OffsetLayout
   * @local UInt
   * @local UIntBE
   * @local Int
   * @local IntBE
   * @local NearUInt64
   * @local NearUInt64BE
   * @local NearInt64
   * @local NearInt64BE
   * @local Float
   * @local FloatBE
   * @local Double
   * @local DoubleBE
   * @local Sequence
   * @local Structure
   * @local UnionDiscriminator
   * @local UnionLayoutDiscriminator
   * @local Union
   * @local VariantLayout
   * @local BitStructure
   * @local BitField
   * @local Boolean
   * @local Blob
   * @local CString
   * @local Constant
   * @local bindConstructorLayout
   * @module Layout
   * @license MIT
   * @author Peter A. Bigot
   * @see {@link https://github.com/pabigot/buffer-layout|buffer-layout on GitHub}
   *)

@noble/hashes/esm/utils.js:
  (*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/esm/abstract/utils.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/esm/abstract/modular.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/esm/abstract/curve.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/esm/abstract/edwards.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/esm/ed25519.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/hashes/esm/utils.js:
  (*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/esm/abstract/weierstrass.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/esm/_shortw_utils.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/esm/secp256k1.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)
*/
