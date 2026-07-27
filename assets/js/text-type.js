/* TextType — 原生 JS 移植版，逻辑对应 React Bits 的 <TextType />：
   逐字打出 data-text-type 里的文字，打完停留（不循环/不删除重打），
   光标从一开始就持续闪烁（对应组件 hideCursorWhileTyping=false 的默认行为） */
document.addEventListener("DOMContentLoaded", function () {
  function typeText(el, text, opts) {
    var speed = opts.typingSpeed;
    var initialDelay = opts.initialDelay;
    var showCursor = opts.showCursor;
    var cursorChar = opts.cursorCharacter;

    var content = document.createElement("span");
    content.className = "text-type__content";
    el.appendChild(content);

    var cursor = null;
    if (showCursor) {
      cursor = document.createElement("span");
      cursor.className = "text-type__cursor blinking";
      cursor.textContent = cursorChar;
      el.appendChild(cursor);
    }

    var i = 0;
    function typeNext() {
      if (i < text.length) {
        content.textContent += text.charAt(i);
        i++;
        window.setTimeout(typeNext, speed);
      }
      // loop=false：打完就停在完整文字状态，光标继续闪烁，不做删除重打
    }
    window.setTimeout(typeNext, initialDelay);
  }

  document.querySelectorAll("[data-text-type]").forEach(function (el) {
    typeText(el, el.getAttribute("data-text-type"), {
      typingSpeed: parseInt(el.getAttribute("data-typing-speed"), 10) || 50,
      initialDelay: parseInt(el.getAttribute("data-initial-delay"), 10) || 0,
      showCursor: el.getAttribute("data-show-cursor") !== "false",
      cursorCharacter: el.getAttribute("data-cursor-char") || "|"
    });
  });
});
