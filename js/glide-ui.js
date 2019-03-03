var glide_ui = glide_ui || {};

glide_ui.data = {
    name: "",
    autoForward: false,
    showDuration: 5,
    animation: "RANDOM",
    animDuration: 2
};

glide_ui.vm = new Vue({
    el: "#vm-root",
    data: glide_ui.data
});
