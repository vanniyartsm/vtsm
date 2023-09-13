/**
 * Created by senthil on 14/04/17.
 */
var $ = jQuery.noConflict();
$.fn.inlineStyle = function(e) {
    return this.prop("style")[$.camelCase(e)]
}, $.fn.doOnce = function(e) {
    return this.length && e.apply(this), this
},
    function() {
        for (var e = 0, t = ["ms", "moz", "webkit", "o"], a = 0; a < t.length && !window.requestAnimationFrame; ++a) window.requestAnimationFrame = window[t[a] + "RequestAnimationFrame"], window.cancelAnimationFrame = window[t[a] + "CancelAnimationFrame"] || window[t[a] + "CancelRequestAnimationFrame"];
        window.requestAnimationFrame || (window.requestAnimationFrame = function(t, a) {
            var i = (new Date).getTime(),
                s = Math.max(0, 16 - (i - e)),
                n = window.setTimeout(function() {
                    t(i + s)
                }, s);
            return e = i + s, n
        }), window.cancelAnimationFrame || (window.cancelAnimationFrame = function(e) {
            clearTimeout(e)
        })
    }();
var requesting = !1,
    SEMICOLON = SEMICOLON || {};
! function(e) {
    "use strict";
    SEMICOLON.initialize = {
        init: function() {

        },
    }, SEMICOLON.header = {
        init: function() {
            SEMICOLON.header.overlayMenu(), SEMICOLON.header.stickyMenu(), SEMICOLON.header.stickyPageMenu(), SEMICOLON.header.sideHeader(), SEMICOLON.header.sidePanel(), SEMICOLON.header.onePageScroll(), SEMICOLON.header.onepageScroller(), SEMICOLON.header.logo(), SEMICOLON.header.topsearch(), SEMICOLON.header.topcart()
        },

        overlayMenu: function() {
            if (a.hasClass("overlay-menu")) {
                var i = e("#primary-menu").children("ul").children("li"),
                    s = i.outerHeight(),
                    n = i.length * s,
                    o = (t.height() - n) / 2;
                e("#primary-menu").children("ul").children("li:first-child").css({
                    "margin-top": o + "px"
                })
            }
        },
        stickyMenu: function(i) {
            t.scrollTop() > i ? a.hasClass("device-lg") || a.hasClass("device-md") ? (e("body:not(.side-header) #header:not(.no-sticky)").addClass("sticky-header"), n.hasClass("force-not-dark") || n.removeClass("not-dark"), SEMICOLON.header.stickyMenuClass()) : (a.hasClass("device-xs") || a.hasClass("device-xxs") || a.hasClass("device-sm")) && a.hasClass("sticky-responsive-menu") && (e("#header:not(.no-sticky)").addClass("responsive-sticky-header"), SEMICOLON.header.stickyMenuClass()) : SEMICOLON.header.removeStickyness()
        },
        stickyPageMenu: function(i) {
            t.scrollTop() > i ? a.hasClass("device-lg") || a.hasClass("device-md") ? e("#page-menu:not(.dots-menu,.no-sticky)").addClass("sticky-page-menu") : (a.hasClass("device-xs") || a.hasClass("device-xxs") || a.hasClass("device-sm")) && a.hasClass("sticky-responsive-pagemenu") && e("#page-menu:not(.dots-menu,.no-sticky)").addClass("sticky-page-menu") : e("#page-menu:not(.dots-menu,.no-sticky)").removeClass("sticky-page-menu")
        },
        removeStickyness: function() {
            s.hasClass("sticky-header") && (e("body:not(.side-header) #header:not(.no-sticky)").removeClass("sticky-header"), s.removeClass().addClass(d), n.removeClass().addClass(c), n.hasClass("force-not-dark") || n.removeClass("not-dark"), SEMICOLON.slider.swiperSliderMenu(), SEMICOLON.slider.revolutionSliderMenu()), s.hasClass("responsive-sticky-header") && e("body.sticky-responsive-menu #header").removeClass("responsive-sticky-header"), (a.hasClass("device-xs") || a.hasClass("device-xxs") || a.hasClass("device-sm")) && "undefined" == typeof h && (s.removeClass().addClass(d), n.removeClass().addClass(c), n.hasClass("force-not-dark") || n.removeClass("not-dark"))
        },
        sideHeader: function() {
            /*e("#header-trigger").click(function() {
                return e("body.open-header").toggleClass("side-header-open"), !1
            })*/
        },
        sidePanel: function() {
            e(document).on('click', '.side-panel-trigger', (function() {
                return a.toggleClass("side-panel-open"), a.hasClass("device-touch") && a.hasClass("side-push-panel") && a.toggleClass("ohidden"), !1
            }))
        },
        onePageScroll: function() {
            /*if (x.length > 0) {
                var t = x.attr("data-speed"),
                    i = x.attr("data-offset"),
                    s = x.attr("data-easing");
                t || (t = 1e3), s || (s = "easeOutQuad"), x.find("a[data-href]").click(function() {
                    var n = e(this),
                        o = n.attr("data-href"),
                        r = n.attr("data-speed"),
                        d = n.attr("data-offset"),
                        c = n.attr("data-easing");
                    if (e(o).length > 0) {
                        if (i) var u = i;
                        else var u = SEMICOLON.initialize.topScrollOffset();
                        r || (r = t), d || (d = u), c || (c = s), x.hasClass("no-offset") && (d = 0), N = Number(d), x.find("li").removeClass("current"), x.find('a[data-href="' + o + '"]').parent("li").addClass("current"), (768 > l || a.hasClass("overlay-menu")) && (e("#primary-menu").find("ul.mobile-primary-menu").length > 0 ? e("#primary-menu > ul.mobile-primary-menu, #primary-menu > div > ul.mobile-primary-menu").toggleClass("show", !1) : e("#primary-menu > ul, #primary-menu > div > ul").toggleClass("show", !1), w.toggleClass("pagemenu-active", !1), a.toggleClass("primary-menu-open", !1)), e("html,body").stop(!0).animate({
                            scrollTop: e(o).offset().top - Number(d)
                        }, Number(r), c), N = Number(d)
                    }
                    return !1
                })
            }*/
        },
        onepageScroller: function() {
            x.find("li").removeClass("current"), x.find('a[data-href="#' + SEMICOLON.header.onePageCurrentSection() + '"]').parent("li").addClass("current")
        },
        onePageCurrentSection: function() {
            var i = "home",
                s = n.outerHeight();
            return a.hasClass("side-header") && (s = 0), U.each(function(a) {
                var n = e(this).offset().top,
                    o = t.scrollTop(),
                    r = s + N;
                o + r >= n && o < n + e(this).height() && e(this).attr("id") != i && (i = e(this).attr("id"))
            }), i
        },
        logo: function() {
            !s.hasClass("dark") && !a.hasClass("dark") || n.hasClass("not-dark") ? (p && f.find("img").attr("src", p), g && m.find("img").attr("src", g)) : (v && f.find("img").attr("src", v), C && m.find("img").attr("src", C)), s.hasClass("sticky-header") && (O && f.find("img").attr("src", O), b && m.find("img").attr("src", b)), (a.hasClass("device-xs") || a.hasClass("device-xxs")) && (y && f.find("img").attr("src", y), S && m.find("img").attr("src", S))
        },
        stickyMenuClass: function() {
            if (u) var e = u.split(/ +/);
            else var e = "";
            var t = e.length;
            if (t > 0) {
                var a = 0;
                for (a = 0; t > a; a++) "not-dark" == e[a] ? (s.removeClass("dark"), n.addClass("not-dark")) : "dark" == e[a] ? (n.removeClass("not-dark force-not-dark"), s.hasClass(e[a]) || s.addClass(e[a])) : s.hasClass(e[a]) || s.addClass(e[a])
            }
        },
        responsiveMenuClass: function() {
            if (a.hasClass("device-xs") || a.hasClass("device-xxs") || a.hasClass("device-sm")) {
                if (h) var e = h.split(/ +/);
                else var e = "";
                var t = e.length;
                if (t > 0) {
                    var i = 0;
                    for (i = 0; t > i; i++) "not-dark" == e[i] ? (s.removeClass("dark"), n.addClass("not-dark")) : "dark" == e[i] ? (n.removeClass("not-dark force-not-dark"), s.hasClass(e[i]) || s.addClass(e[i])) : s.hasClass(e[i]) || s.addClass(e[i])
                }
                SEMICOLON.header.logo()
            }
        },
        topsocial: function() {
            B.length > 0 && (a.hasClass("device-md") || a.hasClass("device-lg") ? (B.show(), B.find("a").css({
                width: 40
            }), B.find(".ts-text").each(function() {
                var t = e(this).clone().css({
                        visibility: "hidden",
                        display: "inline-block",
                        "font-size": "13px",
                        "font-weight": "bold"
                    }).appendTo(a),
                    i = t.innerWidth() + 52;
                e(this).parent("a").attr("data-hover-width", i), t.remove()
            }), B.find("a").hover(function() {
                e(this).find(".ts-text").length > 0 && e(this).css({
                    width: e(this).attr("data-hover-width")
                })
            }, function() {
                e(this).css({
                    width: 40
                })
            })) : (B.show(), B.find("a").css({
                width: 40
            }), B.find("a").each(function() {
                var t = e(this).find(".ts-text").text();
                e(this).attr("title", t)
            }), B.find("a").hover(function() {
                e(this).css({
                    width: 40
                })
            }, function() {
                e(this).css({
                    width: 40
                })
            }), a.hasClass("device-xxs") && (B.hide(), B.slice(0, 8).show())))
        },
        topsearch: function() {
            e(document.body).on("click", '.body-overlay', function(t) {
                e(t.target).closest("#top-search").length || a.toggleClass("top-search-open", !1), e(t.target).closest("#top-cart").length || A.toggleClass("top-cart-open", !1), e(t.target).closest("#page-menu").length || w.toggleClass("pagemenu-active", !1), e(t.target).closest("#side-panel").length || a.toggleClass("side-panel-open", !1), e(t.target).closest("#primary-menu.mobile-menu-off-canvas > ul").length || e("#primary-menu.mobile-menu-off-canvas > ul").toggleClass("show", !1), e(t.target).closest("#primary-menu.mobile-menu-off-canvas > div > ul").length || e("#primary-menu.mobile-menu-off-canvas > div > ul").toggleClass("show", !1)
            }), e("#top-search-trigger").click(function(t) {
                a.toggleClass("top-search-open"), A.toggleClass("top-cart-open", !1), e("#primary-menu > ul, #primary-menu > div > ul").toggleClass("show", !1), w.toggleClass("pagemenu-active", !1), a.hasClass("top-search-open") && _.find("input").focus(), t.stopPropagation(), t.preventDefault()
            })
        },
        topcart: function() {
            /*e("#top-cart-trigger").click(function(e) {
                w.toggleClass("pagemenu-active", !1), A.toggleClass("top-cart-open"), e.stopPropagation(), e.preventDefault()
            })*/
        }
    }, SEMICOLON.slider = {
        init: function() {

        }
    }, SEMICOLON.portfolio = {
        init: function() {

        },

    }, SEMICOLON.widget = {
        init: function() {

        }
    }, SEMICOLON.documentOnResize = {
        init: function() {

        }
    }, SEMICOLON.documentOnReady = {
        init: function() {
            SEMICOLON.initialize.init(), SEMICOLON.header.init(), k.length > 0 && SEMICOLON.slider.init(), I.length > 0 && SEMICOLON.portfolio.init(), SEMICOLON.widget.init()
        }
    }, SEMICOLON.documentOnLoad = {
        init: function() {

        }
    };
    var t = e(window),
        a = e("body"),
        i = e("#wrapper"),
        s = e("#header"),
        n = e("#header-wrap"),
        o = e("#content"),
        r = e("#footer"),
        l = t.width(),
        d = s.attr("class"),
        c = n.attr("class"),
        u = s.attr("data-sticky-class"),
        h = s.attr("data-responsive-class"),
        f = e("#logo").find(".standard-logo"),
        m = (f.find("img").outerWidth(), e("#logo").find(".retina-logo")),
        p = f.find("img").attr("src"),
        g = m.find("img").attr("src"),
        v = f.attr("data-dark-logo"),
        C = m.attr("data-dark-logo"),
        O = f.attr("data-sticky-logo"),
        b = m.attr("data-sticky-logo"),
        y = f.attr("data-mobile-logo"),
        S = m.attr("data-mobile-logo"),
        w = e("#page-menu"),
        x = e(".one-page-menu"),
        N = 0,
        I = e(".portfolio"),
        M = (e(".shop"), e(".grid-container")),
        k = e("#slider"),
        E = e(".slider-parallax"),
        L = "",
        T = e("#page-title"),
        z = e(".portfolio-ajax").find(".portfolio-item"),
        P = e("#portfolio-ajax-wrap"),
        j = e("#portfolio-ajax-container"),
        D = e("#portfolio-ajax-loader"),
        F = e(".portfolio-filter,.custom-filter"),
        H = "",
        _ = e("#top-search"),
        A = e("#top-cart"),
        R = e(".vertical-middle"),
        B = e("#top-social").find("li"),
        q = e(".si-sticky"),
        Y = e(".dots-menu"),
        W = e("#gotoTop"),
        V = e(".full-screen"),
        Q = e(".common-height"),
        $ = e(".testimonials-grid"),
        U = e(".page-section"),
        G = e(".owl-carousel"),
        J = e(".parallax"),
        X = e(".page-title-parallax"),
        K = e(".portfolio-parallax").find(".portfolio-image"),
        Z = e(".text-rotater"),
        ee = e("#cookie-notification");
    e(document).ready(SEMICOLON.documentOnReady.init)
}(jQuery);