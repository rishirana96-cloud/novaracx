function selectTab(nextTab) {
  const tablist = nextTab.closest('[role="tablist"]');
  for (const tab of tablist.querySelectorAll('[role="tab"]')) {
    const selected = tab === nextTab;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
    document.getElementById(tab.getAttribute("aria-controls")).hidden = !selected;
  }
}

for (const tablist of document.querySelectorAll('#mvp-mechanism [role="tablist"]')) {
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];

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
