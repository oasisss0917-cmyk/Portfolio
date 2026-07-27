/* 教育背景页：地图上的城市标签 hover -> 对应信息卡片淡入/下划线展开，
   移出 -> 卡片淡出恢复空白。用普通事件监听代替 React state。 */
document.addEventListener("DOMContentLoaded", function () {
  var labels = document.querySelectorAll(".city-label");
  if (!labels.length) return;

  function clearAll() {
    document.querySelectorAll(".edu-card").forEach(function (c) {
      c.classList.remove("active");
    });
    labels.forEach(function (l) {
      l.classList.remove("hovered");
    });
  }

  labels.forEach(function (label) {
    var city = label.getAttribute("data-city");
    var card = document.querySelector('.edu-card[data-card="' + city + '"]');

    label.addEventListener("mouseenter", function () {
      clearAll();
      label.classList.add("hovered");
      if (card) card.classList.add("active");
    });

    label.addEventListener("mouseleave", function () {
      label.classList.remove("hovered");
      if (card) card.classList.remove("active");
    });

    // 触屏设备没有 hover，补一个点击切换，行为一致
    label.addEventListener("click", function (e) {
      e.preventDefault();
      var isActive = card && card.classList.contains("active");
      clearAll();
      if (!isActive) {
        label.classList.add("hovered");
        if (card) card.classList.add("active");
      }
    });
  });
});
