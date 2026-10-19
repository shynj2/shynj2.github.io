/* Broken-glass shards: a few faint pieces behind each section (and the footer).
   They fade in when the section scrolls into view and drift slightly as you scroll. */
(function () {
	var body = document.body, ns = "http://www.w3.org/2000/svg";
	var hosts = [].slice.call(document.querySelectorAll("#app section, #app footer"));
	if (!hosts.length) return;

	var seed = 11;
	function rnd() { seed = seed * 16807 % 2147483647; return seed / 2147483647; }

	var PAL = [["#ff2e88", "#19f3e6"], ["#19f3e6", "#ff2e88"], ["#ffc857", "#ff2e88"], ["#19f3e6", "#ffc857"]];

	/* one irregular, sharp glass piece as an SVG */
	function shard(id, pal) {
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
			'<stop offset="0" stop-color="' + pal[0] + '" stop-opacity=".34"/>' +
			'<stop offset="1" stop-color="' + pal[1] + '" stop-opacity=".07"/></linearGradient></defs>' +
			'<polygon points="' + P(pts) + '" fill="url(#' + id + ')" stroke="' + pal[0] + '" stroke-width="1.1" stroke-linejoin="round"/>' +
			'<polygon points="' + P(facet) + '" fill="#fff" fill-opacity=".07"/>' +
			'<path d="M50 50L' + c[0].toFixed(1) + " " + c[1].toFixed(1) + '" stroke="#fff" stroke-opacity=".45" stroke-width=".6" fill="none"/>';
		return svg;
	}

	var items = [];
	hosts.forEach(function (h, hi) {
		var cs = getComputedStyle(h);
		if (cs.position === "static") h.style.position = "relative";
		h.style.isolation = "isolate";
		var box = document.createElement("div");
		box.className = "shards";
		box.setAttribute("aria-hidden", "true");
		for (var k = 0; k < 2; k++) {
			var side = (hi + k) % 2 ? "right" : "left";
			var el = document.createElement("div");
			el.className = "shard";
			el.style.setProperty("--sz", (90 + rnd() * 80).toFixed(0));
			el.style.setProperty("--o", (.5 + rnd() * .3).toFixed(2));
			el.style[side] = (rnd() * 5).toFixed(1) + "%";
			el.style.top = (k ? 58 + rnd() * 26 : 6 + rnd() * 30).toFixed(0) + "%";
			el.appendChild(shard("sg" + hi + k, PAL[(hi * 2 + k) % PAL.length]));
			box.appendChild(el);
			items.push({ el: el, host: h, rot: (rnd() - .5) * 120, sp: (k ? -1 : 1) * (.07 + rnd() * .1) });
		}
		h.appendChild(box);
	});

	/* reveal: when a host enters the viewport */
	if ("IntersectionObserver" in window) {
		var io = new IntersectionObserver(function (es) {
			es.forEach(function (e) {
				if (e.isIntersecting) { e.target.classList.add("glass-in"); }
			});
		}, { threshold: .1 });
		hosts.forEach(function (h) { io.observe(h); });
	} else {
		hosts.forEach(function (h) { h.classList.add("glass-in"); });
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
	window.addEventListener("resize", upd);
	var fx = document.getElementById("fx");
	if (fx) fx.addEventListener("click", function () { setTimeout(upd, 0); });
	upd();
})();
