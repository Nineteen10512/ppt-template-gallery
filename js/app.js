/* ===== PPT Template Gallery — app.js ===== */
(function () {
  "use strict";

  var allTemplates = [];
  var currentFilter = "all";
  var currentSearch = "";

  /* ----- Scene label map ----- */
  var SCENE_LABELS = {
    academic: "学术",
    business: "商务",
    teaching: "教学",
    general: "通用"
  };

  /* ----- Init ----- */
  document.addEventListener("DOMContentLoaded", function () {
    loadRegistry();
    bindEvents();
  });

  /* ----- Load data ----- */
  function loadRegistry() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "registry.json", true);
    xhr.responseType = "json";
    xhr.onload = function () {
      if (xhr.status === 200 || xhr.status === 0) {
        var data = xhr.response;
        if (typeof data === "string") data = JSON.parse(data);
        allTemplates = data.templates || [];
        renderGallery();
      } else {
        showError("加载 registry.json 失败 (HTTP " + xhr.status + ")");
      }
    };
    xhr.onerror = function () {
      // file:// fallback: try reading as text
      var xhr2 = new XMLHttpRequest();
      xhr2.open("GET", "registry.json", true);
      xhr2.onload = function () {
        if (xhr2.responseText) {
          try {
            var data = JSON.parse(xhr2.responseText);
            allTemplates = data.templates || [];
            renderGallery();
          } catch (e) {
            showError("解析 registry.json 失败: " + e.message);
          }
        } else {
          showError("无法加载 registry.json，请确保通过 HTTP 服务或 GitHub Pages 打开。");
        }
      };
      xhr2.send();
    };
    xhr.send();
  }

  /* ----- Bind events ----- */
  function bindEvents() {
    // Search
    var searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.addEventListener("input", debounce(function () {
        currentSearch = searchInput.value.trim().toLowerCase();
        renderGallery();
      }, 200));
    }

    // Filter buttons
    var filterBtns = document.querySelectorAll(".filter-btn");
    filterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterBtns.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        currentFilter = btn.getAttribute("data-scene") || "all";
        renderGallery();
      });
    });

    // Modal close
    var overlay = document.getElementById("modalOverlay");
    if (overlay) {
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) closeModal();
      });
    }
    var closeBtn = document.getElementById("modalClose");
    if (closeBtn) {
      closeBtn.addEventListener("click", closeModal);
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeModal();
    });
  }

  /* ----- Filter & search ----- */
  function getFilteredTemplates() {
    return allTemplates.filter(function (t) {
      var matchScene = currentFilter === "all" || t.scene === currentFilter;
      var matchSearch = !currentSearch ||
        t.display_name.toLowerCase().indexOf(currentSearch) !== -1 ||
        t.description.toLowerCase().indexOf(currentSearch) !== -1 ||
        t.name.toLowerCase().indexOf(currentSearch) !== -1;
      return matchScene && matchSearch;
    });
  }

  /* ----- Render gallery ----- */
  function renderGallery() {
    var gallery = document.getElementById("gallery");
    var countEl = document.getElementById("templateCount");
    if (!gallery) return;

    var filtered = getFilteredTemplates();
    if (countEl) countEl.textContent = "显示 " + filtered.length + " / " + allTemplates.length + " 个模板";

    if (filtered.length === 0) {
      gallery.innerHTML = '<div class="empty-state"><div class="icon">&#128270;</div><p>没有找到匹配的模板</p></div>';
      return;
    }

    gallery.innerHTML = filtered.map(function (t) {
      var scoreClass = t.template_score >= 90 ? "high" : "mid";
      var sceneLabel = SCENE_LABELS[t.scene] || t.scene;
      var imgHtml = "";
      // Try loading preview image, fallback to placeholder
      imgHtml = '<img src="' + escapeHtml(t.preview_url) + '" alt="' + escapeHtml(t.display_name) + '" ' +
        'onerror="this.parentNode.innerHTML=\'<div class=placeholder-icon>&#127911;</div>\'" ' +
        'loading="lazy">';

      return (
        '<div class="card" data-name="' + escapeHtml(t.name) + '">' +
          '<div class="card-preview">' + imgHtml + '</div>' +
          '<div class="card-body">' +
            '<div class="card-top">' +
              '<span class="card-name">' + escapeHtml(t.display_name) + '</span>' +
              '<span class="scene-tag ' + t.scene + '">' + sceneLabel + '</span>' +
            '</div>' +
            '<p class="card-desc">' + escapeHtml(t.description) + '</p>' +
            '<div class="card-footer">' +
              '<span class="score-badge ' + scoreClass + '">&#9733; ' + t.template_score + '</span>' +
              '<span class="license-tag">' + escapeHtml(t.license_id) + '</span>' +
            '</div>' +
          '</div>' +
        '</div>'
      );
    }).join("");

    // Bind card clicks
    gallery.querySelectorAll(".card").forEach(function (card) {
      card.addEventListener("click", function () {
        var name = card.getAttribute("data-name");
        openModal(name);
      });
    });
  }

  /* ----- Modal ----- */
  function openModal(name) {
    var t = allTemplates.find(function (x) { return x.name === name; });
    if (!t) return;

    var overlay = document.getElementById("modalOverlay");
    var modalTitle = document.getElementById("modalTitle");
    var modalBody = document.getElementById("modalBody");

    if (modalTitle) modalTitle.textContent = t.display_name;

    if (modalBody) {
      var sceneLabel = SCENE_LABELS[t.scene] || t.scene;
      var scoreClass = t.template_score >= 90 ? "high" : "mid";

      var html = '<p class="modal-desc">' + escapeHtml(t.description) + '</p>';

      html += '<div class="meta-grid">';
      html += metaItem("模板名", t.name);
      html += metaItem("场景", '<span class="scene-tag ' + t.scene + '">' + sceneLabel + '</span>');
      html += metaItem("基础主题", t.base_theme);
      html += metaItem("风格变体", t.style_variant);
      html += metaItem("布局蓝图", t.layout_blueprint);
      html += metaItem("封面样式", t.cover_style);
      html += metaItem("默认切换", t.default_transition);
      html += metaItem("评分", '<span class="score-badge ' + scoreClass + '">&#9733; ' + t.template_score + '</span>');
      html += metaItem("许可证", t.license_id);
      html += '</div>';

      // Source refs
      if (t.source_refs && t.source_refs.length > 0) {
        html += '<div class="source-section"><h4>开源来源</h4>';
        t.source_refs.forEach(function (s) {
          html += '<div class="source-item">' +
            '<a href="' + escapeHtml(s.url) + '" target="_blank" rel="noopener">' + escapeHtml(s.name) + '</a>' +
            '<span class="source-stars">&#9733; ' + s.stars + '</span>' +
          '</div>';
        });
        html += '</div>';
      }

      // Copy button
      html += '<button class="copy-btn" id="copyBtn" data-name="' + escapeHtml(t.name) + '">' +
        '&#128203; 复制模板名</button>';

      modalBody.innerHTML = html;

      // Bind copy button
      var copyBtn = document.getElementById("copyBtn");
      if (copyBtn) {
        copyBtn.addEventListener("click", function () {
          var templateName = copyBtn.getAttribute("data-name");
          copyToClipboard(templateName);
          copyBtn.innerHTML = "&#10003; 已复制";
          copyBtn.classList.add("copied");
          setTimeout(function () {
            copyBtn.innerHTML = "&#128203; 复制模板名";
            copyBtn.classList.remove("copied");
          }, 1500);
        });
      }
    }

    if (overlay) {
      overlay.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  }

  function closeModal() {
    var overlay = document.getElementById("modalOverlay");
    if (overlay) {
      overlay.classList.remove("active");
      document.body.style.overflow = "";
    }
  }

  /* ----- Helpers ----- */
  function metaItem(label, value) {
    return '<div class="meta-item"><span class="meta-label">' + escapeHtml(label) + '</span>' +
      '<span class="meta-value">' + value + '</span></div>';
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(function () {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) { /* ignore */ }
    document.body.removeChild(ta);
  }

  function debounce(fn, ms) {
    var timer;
    return function () {
      var ctx = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () { fn.apply(ctx, args); }, ms);
    };
  }

  function showError(msg) {
    var gallery = document.getElementById("gallery");
    if (gallery) {
      gallery.innerHTML = '<div class="empty-state"><div class="icon">&#9888;</div><p>' + escapeHtml(msg) + '</p></div>';
    }
  }
})();
