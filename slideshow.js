var duration = 2000;

var pix = [
    "pics/walter.jpg",
    "pics/163_by_e4v.jpg",
    "pics/A_Little_Quetzal_by_vgerasimov.jpg",
    "pics/Aeg_by_Tauno_Erik.jpg",
    "pics/Arboreal_ballet_by_Bob_Farrell.jpg",
    "pics/Aubergine_Sea_by_Wyatt_Kirby.jpg",
    "pics/Backyard_Mushrooms_by_Kurt_Zitzelman.jpg",
    "pics/Bay.jpg",
    "pics/Beach_by_Renato_Giordanelli.jpg",
    "pics/Begonia_by_fatpoint21.jpg",
    "pics/Below_Clouds_by_kobinho.jpg",
    "pics/Berries_by_Orb9220.jpg",
    "pics/Berries_by_Tom_Kijas.jpg",
    "pics/Bird_by_Magnus.jpg"
];

var max = pix.length - 1;
var i = -1;
var slide;

var nextPic = function () {
    if (i == max) {
        i = 0;
    } else {
        i++;
    }
    return [{"key": i, "src": pix[i]}];
};

var prevPic = function () {
    if (i == 0) {
        i = max;
    } else {
        i--;
    }
    return [{"key": i, "src": pix[i]}];
};

var key = function (d) {
    return d.key;
};

var fixImgDims = function (imgId) {

    var img, height, width;
    img = slide.select("#" + imgId);

    if (img != null) {
        var h = img.node().naturalHeight;
        var w = img.node().naturalWidth;

        var wh = window.innerHeight;
        var ww = window.innerWidth;

        if (h <= wh && w <= ww) {          // image fits
            height = h;
            width = w;
        } else {                           // scale
            var widthScale = ww / w;
            var heightScale = wh / h;
            var scale = Math.min(widthScale, heightScale);
            width = Math.round(w * scale);
            height = Math.round(h * scale);
        }

        img.attr("width", width)
           .attr("height", height)
           .attr("class", "pic");
    }
};

var createSlide = function () {
    slide = d3.select("body")
              .append("div")
              .attr("id", "slide");

    slide.selectAll("img")
       .data(nextPic(), key)
       .enter()
       .append("img")
       .attr("src", function(d) { return d.src })
       .attr("id", function(d) { return "pic_" + d.key })
       .attr("class", "pic hidden")
       .attr("onload", function (d) { fixImgDims("pic_" + d.key) });
};

var nextSlide = function () {

    //Select...
    var pics = slide.selectAll("img")
                    .data(nextPic(), key);

    // remove old pic
    pics.exit()
        .transition()
        .duration(duration)
        .attr("width", 1)
        .attr("height", 1)
        .remove();

    // add new pic
    pics.enter()
        .append("img")
        .attr("src", function(d) { return d.src })
        .attr("id", function(d) { return "pic_" + d.key })
        .attr("class", "pic")
        .attr("onload", function (d) { fixImgDims("pic_" + d.key) });
};

// On click on body:
d3.select("body").on("click", function() {
    nextSlide();
});

// On page load:
createSlide();
