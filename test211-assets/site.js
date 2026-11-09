const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#site-nav");
const compactLayout = window.matchMedia("(max-width: 760px)");

function setMenu(open) {
  navigation.classList.toggle("is-open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
}

menuToggle.addEventListener("click", () => {
  setMenu(menuToggle.getAttribute("aria-expanded") === "false");
});

navigation.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!link || !compactLayout.matches) return;

  setMenu(false);
  const destination = document.getElementById(link.hash.slice(1));
  if (destination) {
    destination.setAttribute("tabindex", "-1");
    destination.focus({ preventScroll: true });
  }
});

document.querySelector(".site-header").addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navigation.classList.contains("is-open")) {
    setMenu(false);
    menuToggle.focus();
  }
});

const deskTabs = document.querySelector(".desk-tabs");
function updateDeskOrientation() {
  deskTabs.setAttribute("aria-orientation", compactLayout.matches ? "horizontal" : "vertical");
  setMenu(false);
}

compactLayout.addEventListener("change", updateDeskOrientation);
updateDeskOrientation();

for (const group of document.querySelectorAll("[data-tabs]")) {
  const tablist = group.querySelector('[role="tablist"]');
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];

  function selectTab(nextTab) {
    for (const tab of tabs) {
      const selected = tab === nextTab;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      document.getElementById(tab.getAttribute("aria-controls")).hidden = !selected;
    }
  }

  tablist.addEventListener("click", (event) => {
    const tab = event.target.closest('[role="tab"]');
    if (tab) selectTab(tab);
  });

  tablist.addEventListener("keydown", (event) => {
    const index = tabs.indexOf(event.target);
    if (index === -1) return;

    const vertical = tablist.getAttribute("aria-orientation") === "vertical";
    const previous = vertical ? "ArrowUp" : "ArrowLeft";
    const next = vertical ? "ArrowDown" : "ArrowRight";
    let targetIndex;

    switch (event.key) {
      case previous:
        targetIndex = (index - 1 + tabs.length) % tabs.length;
        break;
      case next:
        targetIndex = (index + 1) % tabs.length;
        break;
      case "Home":
        targetIndex = 0;
        break;
      case "End":
        targetIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    selectTab(tabs[targetIndex]);
    tabs[targetIndex].focus();
  });
}
