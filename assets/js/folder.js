document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".folder").forEach(function (folder) {
    function resetMagnet() {
      folder.querySelectorAll(".paper").forEach(function (p) {
        p.style.setProperty("--magnet-x", "0px");
        p.style.setProperty("--magnet-y", "0px");
      });
    }

    function stopFloating() {
      folder.querySelectorAll(".floatable").forEach(function (icon) {
        icon.classList.remove("floaty");
      });
    }

    // 展开图标各自独立漂浮：等每一个 .expand-item 自己的位移 transition
    // 真正结束（transitionend）之后，再给它内部的 .floatable 挂上浮动动画，
    // 而不是用一个固定的毫秒数去猜"展开应该差不多结束了"，避免衔接时的跳变。
    // My Portfolio 拆成了三个独立热区，每个热区自己的 .floatable 都要挂上，
    // 但用的是同一个 stagger 延迟，所以三者还是同步浮动、看起来像一个整体
    function floatWhenSettled() {
      var staggers = [0, 150, 300];
      folder.querySelectorAll(".expand-item").forEach(function (item, i) {
        var icons = item.querySelectorAll(".floatable");
        if (!icons.length) return;

        function onEnd(e) {
          if (e.target !== item || e.propertyName !== "transform") return;
          item.removeEventListener("transitionend", onEnd);
          if (!folder.classList.contains("open")) return;
          window.setTimeout(function () {
            if (!folder.classList.contains("open")) return;
            icons.forEach(function (icon) { icon.classList.add("floaty"); });
          }, staggers[i] || 0);
        }
        item.addEventListener("transitionend", onEnd);
      });
    }

    function toggle() {
      var isOpen = folder.classList.toggle("open");
      folder.setAttribute("aria-expanded", isOpen ? "true" : "false");
      if (isOpen) {
        floatWhenSettled();
      } else {
        stopFloating();
        resetMagnet();
      }
    }

    // 首页这个文件夹默认就是展开状态（HTML 里直接带了 open class），
    // 图标一开始就摆在最终展开的位置上，不会有位移过渡，所以等不到
    // transitionend——直接立刻挂上浮动动画，用同一套 stagger 延迟
    if (folder.classList.contains("open")) {
      var staggers = [0, 150, 300];
      folder.querySelectorAll(".expand-item").forEach(function (item, i) {
        window.setTimeout(function () {
          item.querySelectorAll(".floatable").forEach(function (icon) {
            icon.classList.add("floaty");
          });
        }, staggers[i] || 0);
      });
    }

    folder.addEventListener("click", toggle);
    folder.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });

    folder.querySelectorAll(".paper").forEach(function (paper) {
      paper.addEventListener("mousemove", function (e) {
        if (!folder.classList.contains("open")) return;
        var rect = paper.getBoundingClientRect();
        var centerX = rect.left + rect.width / 2;
        var centerY = rect.top + rect.height / 2;
        var offsetX = (e.clientX - centerX) * 0.15;
        var offsetY = (e.clientY - centerY) * 0.15;
        paper.style.setProperty("--magnet-x", offsetX + "px");
        paper.style.setProperty("--magnet-y", offsetY + "px");
      });
      paper.addEventListener("mouseleave", function () {
        paper.style.setProperty("--magnet-x", "0px");
        paper.style.setProperty("--magnet-y", "0px");
      });
    });
  });
});
