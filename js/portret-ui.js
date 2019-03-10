var portret_ui = portret_ui || {};
portret_ui.api_server = "http://127.0.0.1:8081";

portret_ui.data = {
    collections: false,
    selectedShow: false,
    settings: {
        autoForward: false,
        showDuration: 5,
        animation: "RANDOM",
        animDuration: 2
    }
};

portret_ui.vm = new Vue({
    el: "#vm-root",
    data: portret_ui.data,
    methods: {
        selectShow: function (event) {
            portret_ui.data.selectedShow = event.target.firstChild.textContent;
        },
        startShow: function (event) {
            axios.get(portret_ui.api_server + '/collection/' + portret_ui.data.selectedShow)
                .then(function (response) {
                    if (response.status == 200) {
                        console.log(response.data);
                    } else {
                        console.log("failed to load collection '%s' - %s - %s", portret_ui.data.selectedShow, response.status, response.statusText);
                    }
                })
        }
    },
    mounted: function () {
        axios.get(portret_ui.api_server + '/collections')
            .then(function (response) {
                if (response.status == 200) {
                    portret_ui.data.collections = response.data;
                } else {
                    console.log("failed to load collections - %s - %s", response.status, response.statusText);
                }
            })
        }
});
