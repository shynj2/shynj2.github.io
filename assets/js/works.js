/* Works: clicking a project card opens a popup with a short summary of what I did there. */
(function () {
	var I = window.CS_I18N, pm = document.getElementById("pm");
	if (!I || !pm) return;
	var body = document.body, card = pm.querySelector(".pm-card"), last = null, closing = 0;

	/* Texts are keys in translations.js. Edit the lists below to change what the popup says. */
	var P = {
		1: { dom: "pooyansport.com", name: "Pooyansport.com", tags: "p1_tags", role: "role_seo_admin", date: "job2_date", b: ["mb_site", "mb_seo", "mb_admin"] },
		2: { dom: "aidbax.ir", name: "Aidbax.ir", tags: "p2_tags", role: "role_head_web", date: "job3_date", b: ["mb_lead", "mb_site", "mb_consult"] },
		3: { dom: "newabzar.com", name: "Newabzar.com", tags: "p3_tags", role: "role_web", b: ["mb_site"] },
		4: { dom: "abzaramini.com", name: "Abzaramini.com", tags: "p4_tags", role: "role_web_admin", b: ["mb_site", "mb_admin"] },
		5: { dom: "newabzar1.ir", name: "Newabzar1.ir", tags: "p5_tags", role: "role_web_admin", b: ["mb_site", "mb_admin"] },
		6: { dom: "takabzarplus.ir", name: "Takabzarplus.ir", tags: "p6_tags", role: "role_web_admin", b: ["mb_site", "mb_admin"] }
	};

	function put(id, key) {
		var el = document.getElementById(id);
		el.setAttribute("data-i18n", key);
		el.textContent = I.t(key);
	}

	function fill(p) {
		document.getElementById("pm-dom").textContent = p.dom;
		document.getElementById("pm-t").textContent = p.name;
		put("pm-tags", p.tags);
		put("pm-role", p.role);
		var d = document.getElementById("pm-date");
		if (p.date) { put("pm-date", p.date); d.hidden = false; } else { d.removeAttribute("data-i18n"); d.textContent = ""; d.hidden = true; }
		var ul = document.getElementById("pm-list");
		ul.innerHTML = "";
		p.b.forEach(function (k, i) {
			var li = document.createElement("li");
			li.setAttribute("data-i18n", k);
			li.textContent = I.t(k);
			li.style.setProperty("--i", i);
			ul.appendChild(li);
		});
		document.getElementById("pm-go").href = "https://" + p.dom;
	}

	function show() {
		clearTimeout(closing);
		pm.hidden = false;
		body.classList.add("lock");
		void pm.offsetWidth;
		pm.classList.add("open");
		card.focus({ preventScroll: true });
	}

	function open(p, from) {
		last = from;
		fill(p);
		/* same glitch burst the site uses for navigation, then the card decodes in */
		if (window.csGlitch) window.csGlitch(show); else show();
	}

	function close() {
		if (pm.hidden) return;
		pm.classList.remove("open");
		var done = function () {
			pm.hidden = true;
			body.classList.remove("lock");
			if (last && last.focus) last.focus({ preventScroll: true });
		};
		if (body.classList.contains("calm")) done(); else closing = setTimeout(done, 380);
	}

	document.addEventListener("click", function (e) {
		var c = e.target.closest(".card[data-project]");
		if (c && P[c.getAttribute("data-project")]) {
			e.preventDefault();
			open(P[c.getAttribute("data-project")], e.target.closest("a") || c);
			return;
		}
		if (!pm.hidden && e.target.closest("[data-close]")) close();
	});

	document.addEventListener("keydown", function (e) {
		if (pm.hidden) return;
		if (e.key === "Escape") { e.stopPropagation(); close(); return; }
		if (e.key === "Tab") {
			var f = [].slice.call(card.querySelectorAll("a[href],button")).filter(function (x) { return !x.hidden; });
			if (!f.length) return;
			var a = f[0], z = f[f.length - 1];
			if (e.shiftKey && (document.activeElement === a || document.activeElement === card)) { e.preventDefault(); z.focus(); }
			else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
		}
	}, true);
})();
