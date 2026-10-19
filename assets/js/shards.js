/* Broken-glass shards behind the page.
   Mobile (<= 700px): a couple of faint pieces behind each section, as before.
   Desktop: many more pieces, spread across the FULL width of the screen, placed
   in the side gutters next to the content so they are actually visible. */
(function () {
	var body = document.body, ns = "http://www.w3.org/2000/svg";
	var app = document.getElementById("app");
	if (!app) return;
	var mq = window.matchMedia("(min-width:701px)");

	var seed = 11;
	function rnd() { seed = seed * 16807 % 2147483647; return seed / 2147483647; }

	var PAL = [["#ff2e88", "#19f3e6"], ["#19f3e6", "#ff2e88"], ["#ffc857", "#ff2e88"], ["#19f3e6", "#ffc857"]];
	var uid = 0;

	/* one irregular, sharp glass piece as an SVG */
	function shard(pal, strong) {
		var id = "sg" + (uid++);
		var n = 4 + (rnd() * 2 | 0), pts = [], i, a, r, base = rnd() * 6.28, stretch = .55 + rnd() * .35;
		for (i = 0; i < n; i++) {
			a = base + (i + (rnd() * .5 - .25)) / n * 6.2832;
			r = 30 + rnd() * 20;
			pts.push([50 + Math.cos(a) * r, 50 + Math.sin(a) * r * stretch]);
		}
		var P = function (arr) { return arr.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" "); };
		var c = pts[0], facet = [[50, 50], pts[1], pts[2]];
		var svg = document.createElementNS(ns, "svg");
		svg.setAttribute("viewBox", "0 0 100 100");
		svg.setAttribute("aria-hidden", "true");
		svg.innerHTML =
			'<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1">' +
			'<stop offset="0" stop-color="' + pal[0] + '" stop-opacity="' + (strong ? ".46" : ".34") + '"/>' +
			'<stop offset="1" stop-color="' + pal[1] + '" stop-opacity="' + (strong ? ".12" : ".07") + '"/></linearGradient></defs>' +
			'<polygon points="' + P(pts) + '" fill="url(#' + id + ')" stroke="' + pal[0] + '" stroke-width="' + (strong ? "1.4" : "1.1") + '" stroke-linejoin="round"/>' +
			'<polygon points="' + P(facet) + '" fill="#fff" fill-opacity=".08"/>' +
			'<path d="M50 50L' + c[0].toFixed(1) + " " + c[1].toFixed(1) + '" stroke="#fff" stroke-opacity=".45" stroke-width=".6" fill="none"/>';
		return svg;
	}

	var items = [], hosts = [], io = null;

	function clear() {
		if (io) { io.disconnect(); io = null; }
		[].forEach.call(app.querySelectorAll(".shards"), function (b) { b.parentNode.removeChild(b); });
		items = []; hosts = []; uid = 0; seed = 11;
	}

	function build() {
		clear();
		var wide = mq.matches;
		hosts = [].slice.call(app.querySelectorAll(wide ? ".hero, section, footer" : "section, footer"));
		if (!hosts.length) return;

		var vw = document.documentElement.clientWidth;
		var colW = Math.min(980, vw) - 40;          /* the content column */
		var gut = Math.max(0, (vw - colW) / 2);     /* free space on each side */

		hosts.forEach(function (h, hi) {
			var cs = getComputedStyle(h);
			if (cs.position === "static") h.style.position = "relative";
			h.style.isolation = "isolate";
			var box = document.createElement("div");
			box.className = "shards" + (wide ? " wide" : "");
			box.setAttribute("aria-hidden", "true");

			var count = 2;
			if (wide) count = Math.max(3, Math.min(8, Math.round(h.offsetHeight / 210)));

			for (var k = 0; k < count; k++) {
				var el = document.createElement("div");
				el.className = "shard";
				var right = (hi + k) % 2 === 1, sz, topPct;

				if (wide) {
					sz = 100 + rnd() * 140;
					/* spread evenly down the section with a little jitter */
					topPct = ((k + .1 + rnd() * .6) / count) * 100;
					/* x position inside the side gutter (a little may tuck behind the content) */
					var lo = -sz * .15, hi2 = Math.max(gut - sz * .85, lo);
					var off = lo + rnd() * (hi2 - lo);
					el.style[right ? "right" : "left"] = (off / vw * 100).toFixed(2) + "%";
					el.style.setProperty("--o", (.7 + rnd() * .3).toFixed(2));
				} else {
					sz = 90 + rnd() * 80;
					topPct = k ? 58 + rnd() * 26 : 6 + rnd() * 30;
					el.style[right ? "right" : "left"] = (rnd() * 5).toFixed(1) + "%";
					el.style.setProperty("--o", (.5 + rnd() * .3).toFixed(2));
				}
				el.style.setProperty("--sz", sz.toFixed(0));
				el.style.top = topPct.toFixed(0) + "%";
				el.appendChild(shard(PAL[(hi * 2 + k) % PAL.length], wide));
				box.appendChild(el);
				items.push({ el: el, host: h, rot: (rnd() - .5) * 120, sp: ((k % 2) ? -1 : 1) * (.07 + rnd() * .1) });
			}
			h.appendChild(box);
		});

		/* reveal: when a host enters the viewport */
		if ("IntersectionObserver" in window) {
			io = new IntersectionObserver(function (es) {
				es.forEach(function (e) {
					if (e.isIntersecting) { e.target.classList.add("glass-in"); }
				});
			}, { threshold: .1 });
			hosts.forEach(function (h) { io.observe(h); });
		} else {
			hosts.forEach(function (h) { h.classList.add("glass-in"); });
		}
		upd();
	}

	/* parallax drift */
	var tk = 0;
	function upd() {
		var calm = body.classList.contains("calm"), vh = innerHeight;
		items.forEach(function (it) {
			var r = it.host.getBoundingClientRect();
			if (r.bottom < -300 || r.top > vh + 300) return;
			var m = calm ? 0 : (r.top + r.height / 2 - vh / 2);
			it.el.style.transform = "translate3d(0," + (m * it.sp).toFixed(1) + "px,0) rotate(" + (it.rot + m * .02).toFixed(1) + "deg)";
		});
	}
	window.addEventListener("scroll", function () {
		if (!tk) { tk = 1; requestAnimationFrame(function () { tk = 0; upd(); }); }
	}, { passive: true });

	/* rebuild when the window is resized (desktop gutters change) or the breakpoint flips */
	var rt = 0, lastW = document.documentElement.clientWidth, lastWide = mq.matches;
	window.addEventListener("resize", function () {
		upd();
		clearTimeout(rt);
		rt = setTimeout(function () {
			var w = document.documentElement.clientWidth;
			if (mq.matches !== lastWide || (mq.matches && Math.abs(w - lastW) > 40)) {
				lastW = w; lastWide = mq.matches; build();
			}
		}, 200);
	});
	var fx = document.getElementById("fx");
	if (fx) fx.addEventListener("click", function () { setTimeout(upd, 0); });

	build();
	/* sections can change height after fonts/images load; re-measure once */
	window.addEventListener("load", function () { if (mq.matches) build(); });
})();
