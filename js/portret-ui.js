var portret_ui = portret_ui || {};

portret_ui.data = {
    name: "",
    autoForward: false,
    showDuration: 5,
    animation: "RANDOM",
    animDuration: 2
};

portret_ui.vm = new Vue({
    el: "#vm-root",
    data: portret_ui.data
});
