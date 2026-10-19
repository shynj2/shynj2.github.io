/* Language switching: Persian <-> English, RTL/LTR, with a glitch + decode animation. */
(function () {
	var T = window.CS_T, KEY = "cs_lang", GL = "█▓▒░#%&@$*+=<>/|{}[]0123456789ABCDEF";
	var cur = document.documentElement.lang === "fa" ? "fa" : "en";
	var body = document.body, btn = document.getElementById("lang"), locked = false;

	function t(k) { return (T[cur] && T[cur][k]) || T.en[k] || k; }
	function calm() { return body.classList.contains("calm"); }
	function save() { try { localStorage.setItem(KEY, cur); } catch (e) {} }

	function setDir() {
		var h = document.documentElement;
		h.lang = cur;
		h.dir = cur === "fa" ? "rtl" : "ltr";
	}

	function applyMeta() {
		document.title = t("title");
		var m = document.querySelector('meta[name="description"]');
		if (m) m.setAttribute("content", t("desc"));
		var og = document.querySelector('meta[property="og:title"]');
		if (og) og.setAttribute("content", t("title"));
		document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
			el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph")));
		});
	}

	function applyText() {
		document.querySelectorAll("[data-i18n]").forEach(function (el) {
			el.textContent = t(el.getAttribute("data-i18n"));
		});
	}

	/* Every text starts as noise and resolves into the new language. */
	function decode(dur) {
		var tasks = [], start = performance.now();
		document.querySelectorAll("[data-i18n]").forEach(function (el) {
			tasks.push({ el: el, to: t(el.getAttribute("data-i18n")), d: Math.random() * 0.3 });
		});
		(function step(now) {
			var p = Math.min(1, (now - start) / dur);
			tasks.forEach(function (k) {
				var lp = Math.min(1, Math.max(0, (p - k.d) / (1 - k.d))), n = k.to.length, r = Math.floor(lp * n), out = k.to.slice(0, r), i, c;
				if (lp < 1) {
					for (i = r; i < n; i++) {
						c = k.to.charAt(i);
						out += /\s/.test(c) ? c : GL.charAt((Math.random() * GL.length) | 0);
					}
				}
				k.el.textContent = out;
			});
			if (p < 1) requestAnimationFrame(step);
			else applyText();
		})(start);
	}

	function switchTo(next) {
		cur = next;
		setDir();
		save();
		applyMeta();
		if (calm()) applyText(); else decode(850);
	}

	window.CS_I18N = { t: t, lang: function () { return cur; } };

	/* initial render (no animation) */
	setDir();
	applyMeta();
	applyText();

	if (btn) btn.addEventListener("click", function () {
		if (locked) return;
		locked = true;
		if (window.csTypingStop) window.csTypingStop();
		var next = cur === "fa" ? "en" : "fa", go = function () { switchTo(next); };
		if (window.csGlitch) window.csGlitch(go); else go();
		setTimeout(function () { locked = false; }, calm() ? 50 : 1300);
	});
})();
