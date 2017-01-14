var glide = glide || {};

/******************************************************************************
 *** Slideshow Param Defaults ***
 *****************************************************************************/
glide.param = {};
glide.param.showDuration = 5000;
glide.param.animDuration = 2000;
glide.param.autoForward = true;

/******************************************************************************
 *** Internal Vars ***
 *****************************************************************************/
glide.picsJson = "pics.json";   // pic catalog path
glide.intervalId = null;

/******************************************************************************
 *** Functions ***
 *****************************************************************************/
glide.nextPic = function () {
    if (glide.i == glide.max) {
        glide.i = 0;
    } else {
        glide.i++;
    }
    return [{"key": glide.i, "src": glide.dataset.pics[glide.i]}];
};

glide.prevPic = function () {
    if (glide.i == 0) {
        glide.i = glide.max;
    } else {
        glide.i--;
    }
    return [{"key": glide.i, "src": glide.dataset.pics[glide.i]}];
};

glide.key = function (d) {
    return d.key;
};

glide.calcImgPosAndDims = function (img) {

    var height, width, x, y;

    if (img != null) {  // new image
        glide.naturalHeight = img.naturalHeight;
        glide.naturalWidth = img.naturalWidth;
    }

    var wh = window.innerHeight;
    var ww = window.innerWidth;

    if (glide.naturalHeight <= wh && glide.naturalWidth <= ww) {  // image fits
        height = glide.naturalHeight;
        width = glide.naturalWidth;
    } else {    // scale
        var widthScale = ww / glide.naturalWidth;
        var heightScale = wh / glide.naturalHeight;
        var scale = Math.min(widthScale, heightScale);
        width = Math.round(glide.naturalWidth * scale);
        height = Math.round(glide.naturalHeight * scale);
    }

    x = (ww - width) / 2;
    y = (wh - height) / 2;

    return { "width": width,
             "height": height,
             "x": x,
             "y": y };
};

glide.loadPic = function (nextPicSpec, pics) {
    var img = new Image();
    img.onload = function () {
        var posAndDims = glide.calcImgPosAndDims(img);
        pics.enter()
           .append("image")
           .attr("xlink:href", function(d) { return d.src })
           .attr("id", function(d) { return "pic_" + d.key })
           .transition()
           .duration(glide.param.animDuration)
           .attr("width", posAndDims.width)
           .attr("height", posAndDims.height)
           .attr("x", posAndDims.x)
           .attr("y", posAndDims.y);
    };
    img.src = nextPicSpec[0].src;
}

glide.setupCanvas = function () {
    glide.svg = d3.select("body")
                  .append("svg")
                  .attr("width", window.innerWidth)
                  .attr("height", window.innerHeight)
                  .attr("id", "canvas");
};

glide.nextSlide = function () {
    // get pic...
    var nextPicSpec = glide.nextPic();

    // show slide...
    glide.showSlide(nextPicSpec);
};

glide.prevSlide = function () {
    // get pic...
    var nextPicSpec = glide.prevPic();

    // show slide...
    glide.showSlide(nextPicSpec);
};

glide.showSlide = function (nextPicSpec) {

    // select pics
    var pics = glide.svg.selectAll("image")
                        .data(nextPicSpec, glide.key);

    // remove old pic (if exists)
    pics.exit()
        .transition()
        .duration(glide.param.animDuration)
        .attr("x", window.innerWidth + 10)
        .remove();

    // load new pic
    glide.loadPic(nextPicSpec, pics);
};

glide.startShow = function (data) {
    glide.dataset = data;
    glide.max = glide.dataset.pics.length - 1;
    glide.i = -1;
    glide.setupCanvas();
    glide.nextSlide();
    if (glide.param.autoForward) {
        glide.intervalId = setInterval(glide.nextSlide, glide.param.showDuration);
    }
}

glide.stopShow = function () {
    if (glide.intervalId != null) {
        clearInterval(glide.intervalId);
    }
}


/******************************************************************************
 *** Event Handler ***
 *****************************************************************************/
 // On click on body:
d3.select("body").on("click", function(e) {
    glide.nextSlide();
});

// On key press:
document.onkeypress = function (e) {
    e = e || window.event;
    switch (e.key) {
    case " ":   // Space
        glide.nextSlide();
      break;
    case "Backspace":
      glide.prevSlide();
      break;
    case "ArrowDown":
      glide.prevSlide();
      break;
    case "ArrowUp":
      glide.nextSlide();
      break;
    case "ArrowLeft":
      glide.prevSlide();
      break;
    case "ArrowRight":
      glide.nextSlide();
      break;
    case "Enter":
      glide.nextSlide();
      break;
    case "Escape":
      glide.stopShow();
      break;
    default:
      return;
  }
};

// On window resize:
window.onresize = function(e) {

    // resize canvas
    glide.svg.attr("width", window.innerWidth)
             .attr("height", window.innerHeight);

    // resize pic
    var posAndDims = glide.calcImgPosAndDims();
    glide.svg.selectAll("image")
           .attr("width", posAndDims.width)
           .attr("height", posAndDims.height)
           .attr("x", posAndDims.x)
           .attr("y", posAndDims.y);
};

// On page load:
d3.json(glide.picsJson, function(data) {
    glide.startShow(data);
});
