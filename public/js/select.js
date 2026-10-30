// Keep the select as the value source for existing filter handlers.
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".controls select").forEach(select => {
    const wrapper = document.createElement("div");
    wrapper.className = "custom-select";
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "select-trigger";
    trigger.setAttribute("aria-expanded", "false");
    const menu = document.createElement("div");
    menu.className = "select-menu";
    menu.id = `${select.id}-options`;
    menu.hidden = true;
    trigger.setAttribute("aria-controls", menu.id);
    select.before(wrapper);
    wrapper.append(select, trigger, menu);
    select.hidden = true;
    const sync = () => {
      trigger.textContent = select.selectedOptions[0].textContent + " ▾";
      menu.querySelectorAll("button").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.value === select.value)));
    };
    const close = () => { menu.hidden = true; trigger.setAttribute("aria-expanded", "false"); };
    for (const option of select.options) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = option.textContent;
      button.dataset.value = option.value;
      button.addEventListener("click", () => {
        select.value = option.value;
        sync(); close(); trigger.focus();
        select.dispatchEvent(new Event("change", { bubbles: true }));
      });
      menu.append(button);
    }
    trigger.addEventListener("click", () => {
      menu.hidden = !menu.hidden;
      trigger.setAttribute("aria-expanded", String(!menu.hidden));
      if (!menu.hidden) menu.querySelector('[aria-pressed="true"]').focus();
    });
    wrapper.addEventListener("keydown", event => {
      if (event.key === "Escape") { close(); trigger.focus(); }
      if (!menu.hidden && ["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
        event.preventDefault();
        const options = [...menu.children];
        let index = options.indexOf(document.activeElement);
        index = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length;
        options[index].focus();
      }
    });
    wrapper.addEventListener("focusout", event => { if (!wrapper.contains(event.relatedTarget)) close(); });
    document.addEventListener("click", event => { if (!wrapper.contains(event.target)) close(); });
    sync();
  });
});
