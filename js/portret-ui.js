var portret_ui = portret_ui || {};
portret_ui.api_server = "http://127.0.0.1:8081";

portret_ui.data = {
    collections: false,
    selectedShow: false,
    showActive: false,
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
                    if (response.status == 200 && response.data.hasOwnProperty("pics")) {
                        // create new data object for the show as a clone of the settings object
                        var showData = JSON.parse(JSON.stringify(portret_ui.data.settings));
                        showData.showDuration = showData.showDuration * 1000;
                        showData.animDuration = showData.animDuration * 1000;
                        showData.collection = response.data;
                        portret_ui.data.showActive = true;
                        portret.startShow(showData);
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
