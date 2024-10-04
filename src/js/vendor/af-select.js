class customSelect {
    constructor(e) {
        this.selector = e.selector, this.selectAll = document.querySelectorAll(this.selector)
    }
    init() {
        this.renderTemplate(), this.clickEventOut()
    }
    reinit(e) {
        let t = e.parentNode;
        t.querySelector(".select-styled") && (t.querySelector(".select-styled").remove(), t.querySelector(".select-list").remove()), this.renderOption(t)
    }
    ajaxOption(e, t) {
        let n = new XMLHttpRequest;
        return n.open("GET", e.dataset.ajax), n.responseType = "json", n.setRequestHeader("Content-type", "application/json; charset=utf-8"), n.send(), n.onerror = function () {
            console.err("Error: afSelec ajax request failed")
        }, n.onreadystatechange = function () {
            3 == n.readyState && e.closest(".af-select").querySelector(".select-list").classList.add("select-list--load"), 4 == n.readyState && e.closest(".af-select").querySelector(".select-list").classList.remove("select-list--load")
        }, n.onload = function () {
            t(n.response)
        }, null
    }
    renderOption(i) {
        var r = this,
            s = i.querySelector("select"),
            o = s.getAttribute("placeholder"),
            a = s.getAttribute("multiple");
        const c = document.createElement("div"),
            l = (c.classList.add("select-styled"), c.innerHTML = "<span>" + o + "</span>", document.createElement("ul")),
            e = (l.classList.add("select-options"), document.createElement("div"));

        function d(e) {
            e.querySelectorAll("select > option").forEach(function (e, t) {
                const n = document.createElement("li");
                if (n.innerHTML = e.innerText, n.setAttribute("rel", e.value), a) {
                    let e = document.createElement("span");
                    e.classList.add("af-check-multiple"), n.append(e)
                }

                function i(e) {
                    if (a) {
                        let t = [];
                        return e.parentNode.querySelectorAll("option[selected]").forEach(function (e) {
                            t.push(e.innerText)
                        }), t.length ? t.join(",") : o
                    }
                    return e.innerText
                }
                0 != t || o || (c.innerHTML = "<span>" + e.innerText + "</span>"), e.getAttribute("selected") && (c.innerHTML = o ? '<span class="af-selected-placeholder" data-af-placeholder="' + o + '">' + i(e) + "</span>" : "<span>" + i(e) + "</span>", n.classList.add("active")), e.getAttribute("disabled") || (l.appendChild(n), r.clickEventListItem(n, e, t))
            })
        }
        e.classList.add("select-list"), e.appendChild(l), i.querySelector(".select-styled") || i.appendChild(c), i.querySelector(".select-options") || i.appendChild(e), s.dataset.ajax && this.ajaxOption(s, function (e) {
            s.innerHTML = "";
            let n = s.dataset.selected,
                t = s.getAttribute("placeholder");
            e.unshift({
                text: t || "-Выберите-",
                value: ""
            }), e.forEach(function (e) {
                let t = document.createElement("option");
                t.value = e.value, t.innerText = e.text, n == e.value && (t.setAttribute("selected", !0), s.removeAttribute("data-selected")), s.append(t)
            }), d(i)
        }), s.dataset.ajax || d(i), s.afSelect = new Object, s.afSelect.open = function () {
            r.openSelect(i)
        }, s.afSelect.close = function () {
            r.closeSelect()
        }, s.afSelect.update = function () {
            r.reinit(s)
        }
    }

    renderTemplate() {
        const i = this,
            r = [];
        this.selectAll.forEach(function (e, t) {
            if (!e.classList.contains("select-hidden")) {
                e.classList.add("select-hidden");
                const n = document.createElement("div");
                n.classList.add("af-select"), e.getAttribute("multiple") && n.classList.add("af-select--multiple"), n.innerHTML = e.outerHTML, e.parentNode.replaceChild(n, e), i.clickEventOpenSelect(n), r.push(n)

            }
        }), r.forEach(function (e, t) {
            i.renderOption(e)
        })
    }

    openSelect(e) {
        document.querySelectorAll("select").forEach(function (e) {
            e.afSelect && e.afSelect.close()
        }), e.querySelector("select").dataset.ajax && !e.querySelector(".select-styled").classList.contains("active") && (e.querySelector(".select-list").remove(), this.renderOption(e)), e.style.maxWidth = e.offsetWidth + "px", e.querySelector(".select-styled").classList.toggle("active"), e.querySelector(".select-options").classList.toggle("active"), e.querySelector(".select-list").classList.toggle("active"), document.querySelector("body").classList.toggle("af-select-open")
    }
    closeSelect() {
        if (!document.querySelector(".select-styled.active")) return !1;
        document.querySelector(".select-styled.active").classList.remove("active"), document.querySelector(".select-options.active").classList.remove("active"), document.querySelector(".select-list.active").classList.remove("active"), document.querySelector("body").classList.remove("af-select-open")
    }
    clickEventOut() {
        const e = this;
        document.addEventListener("click", function () {
            e.closeSelect()
        })
    }
    clickEventListItem(e, i, t) {
        const r = i.parentNode.parentNode,
            s = this,
            o = r.querySelector("select").getAttribute("placeholder"),
            a = r.querySelector("select").getAttribute("multiple"),
            c = r.querySelector(".select-styled");
        e.addEventListener("click", function (e) {
            function t(e) {
                if (a) {
                    let t = [];
                    return e.parentNode.querySelectorAll("option[selected]").forEach(function (e) {
                        t.push(e.innerText)
                    }), t.length ? t.join(",") : o
                }
                return e.innerText
            }
            e.stopPropagation(), e.preventDefault(), r.querySelector(".select-options li.active") && !a && r.querySelector(".select-options li.active").classList.remove("active"), this.classList.contains("active") ? (this.classList.remove("active"), i.removeAttribute("selected")) : (this.classList.add("active"), i.setAttribute("selected", "selected")), o ? c.innerHTML = '<span class="af-selected-placeholder" data-af-placeholder="' + o + '">' + t(i) + "</span>" : r.querySelector(".select-styled span").innerHTML = t(i), a || (r.querySelector("select").value = this.getAttribute("rel"));
            var n = new Event("change");
            r.querySelector("select").dispatchEvent(n), e.target.classList.contains("af-check-multiple") || s.closeSelect()
        })
    }
    clickEventOpenSelect(e) {
        const t = this;

        function n(e) {
            e.stopPropagation(), e.preventDefault(), t.openSelect(this)
        }
        e.removeEventListener("click", n), e.addEventListener("click", n)
    }
}