/* Editorial Design 杂志翻页：St.PageFlip（page-flip 库的原生 JS 版，
   react-pageflip 背后同一个引擎，这里不依赖 React/构建工具）*/
document.addEventListener("DOMContentLoaded", function () {
  var stage = document.getElementById("magazineStage");
  var coverStage = document.querySelector(".magazine-cover-stage");
  var cover = document.getElementById("magazineCover");
  var wrap = document.getElementById("magazineFlipWrap");
  var indicator = document.getElementById("magazinePageIndicator");
  var el = document.getElementById("magazineFlip");
  var counter = document.getElementById("magazineCurrentPage");
  if (!stage || !cover || !wrap || !el || !window.St) return;

  var pageFlip = null;

  /* 封面和书本是叠在同一个 stage 里的（都是 position:absolute），
     stage 本身的高度撑不起来，要按封面实际渲染的高度手动设置，
     否则 stage 会塌成 0 高度——加载时和窗口尺寸变化时都要重算 */
  function syncStageHeight() {
    if (pageFlip) return; // 书打开之后交给下面单独的高度逻辑
    stage.style.height = coverStage.offsetHeight + "px";
  }
  syncStageHeight();
  window.addEventListener("resize", syncStageHeight);

  /* 点击封面：封面缩小+淡出，书本同时放大+淡入，一次干净的交叉淡化
     过渡（不再模拟"翻页"物理效果——封面和内页原始比例不一样，硬做
     仿真翻页在切换瞬间会露出裁切范围对不上的破绽，比简单过渡更别扭）。
     St.PageFlip 提前在点击的同时后台初始化好，避免书本还没准备好
     导致淡入过程中出现空白 */
  function openBook() {
    window.removeEventListener("resize", syncStageHeight);
    cover.classList.add("is-leaving");
    cover.setAttribute("aria-hidden", "true");

    wrap.hidden = false;
    if (indicator) indicator.hidden = false;
    initFlipbook();

    // 强制触发一次同步重排，让浏览器先"看到"淡入前的初始状态，
    // 过渡才会真正生效（这里不用 requestAnimationFrame——之前实测过，
    // St.PageFlip 初始化时的同步操作会导致排队的 rAF 回调不按预期触发）
    void wrap.offsetWidth;
    wrap.classList.add("is-visible");

    cover.addEventListener(
      "transitionend",
      function () {
        coverStage.hidden = true;
        // stage 的高度改成跟着书本走（书本也是响应式的，窗口变化时要跟着重算）
        syncStageToBook();
        window.addEventListener("resize", syncStageToBook);
      },
      { once: true }
    );
  }

  function syncStageToBook() {
    stage.style.height = wrap.offsetHeight + "px";
  }

  function initFlipbook() {
    if (pageFlip) return;

    /* 素材是真正的单页（595×842），交给库自带的响应式逻辑：容器较宽时
       两页并排成跨页，容器窄于 minWidth*2 时自动切成单页（手机上不会
       溢出）。封面已经独立到 St.PageFlip 外面了，这里面只有20张内容
       单页，showCover 必须是 false——第1、2页本来就是同一个跨页拆出来
       的左右两半，需要从一开始就并排展示成第一个跨页 */
    pageFlip = new St.PageFlip(el, {
      width: 272,
      height: 385,
      size: "stretch",
      minWidth: 204,
      maxWidth: 340,
      minHeight: 288,
      maxHeight: 481,
      maxShadowOpacity: 0.5,
      showCover: false,
      mobileScrollSupport: true,
    });

    pageFlip.loadFromHTML(el.querySelectorAll(".page"));

    var totalEl = document.getElementById("magazineTotalPages");
    if (totalEl) totalEl.textContent = pageFlip.getPageCount();

    pageFlip.on("flip", function (e) {
      if (counter) counter.textContent = e.data + 1;
    });

    /* 中缝装订线只在"跨页并排"模式下有意义，单页模式（窄屏自动切换）
       没有中缝——根据当前 orientation 切换 .is-spread class 来控制 */
    function syncGutter() {
      wrap.classList.toggle("is-spread", pageFlip.getOrientation() === "landscape");
    }
    pageFlip.on("init", syncGutter);
    pageFlip.on("changeOrientation", syncGutter);
  }

  cover.addEventListener("click", openBook);
  cover.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openBook();
    }
  });
});
