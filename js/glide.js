var glide = glide || {};

/******************************************************************************
 *** Slideshow Param Defaults ***
 *****************************************************************************/
glide.param = {};
glide.param.name = "Slideshow";
glide.param.showDuration = 5000;
glide.param.animDuration = 2000;
glide.param.autoForward = true;
glide.param.bgColor = "#1e2426";
glide.param.animation = "NONE";
glide.param.picsJsonURI = "pics.json";   // pic catalog URI

/******************************************************************************
 *** Internal Vars ***
 *****************************************************************************/
glide.showTimeoutId = null;
glide.lastAnimation = null;
glide.animIntervalId = null;
glide.cancelAnimation = null;
glide.animations = {};

/******************************************************************************
 *** Helper Functions ***
 *****************************************************************************/
glide.isScalar = function (obj) {
    return (/string|number|boolean/).test(typeof obj);
};

glide.randSplice = function(array) {
    var i = Math.floor(Math.random() * array.length);
    var removed = array.splice(i, 1);
    return removed;
};

glide.randKey = function(obj) {
    var keys = Object.keys(obj);
    var i = Math.floor(Math.random() * keys.length);
    return keys[i];
};

/******************************************************************************
 *** Glide Functions ***
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
    if (glide.i === 0) {
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

    if (img !== null) {  // new image
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

glide.updateParams = function () {
    Object.keys(glide.param).forEach(function(key, index) {
        if (glide.dataset.hasOwnProperty(key)) {
            var val = glide.dataset[key];
            if (glide.isScalar(val)) {
                console.log("Using custom slideshow param '" + key + "' : " + val);
                glide.param[key] = val;
            } else {
                console.log("Ignoring invalid slideshow param '" + key + "'.");
            }
        }
    });
};

glide.getRandAnimation = function () {
    var anim = glide.lastAnimation;
    while (anim == glide.lastAnimation) {
        anim = glide.randKey(glide.animations);
    }
    glide.lastAnimation = anim;
    return anim;
};

glide.setupCanvas = function () {
    d3.select("title")
      .text(glide.param.name);

    glide.svg = d3.select("body")
                  .attr("style", "background-color: " + glide.param.bgColor)
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

    // cancel old timeout
    if (glide.param.autoForward
        && glide.showTimeoutId !== null) {
        clearTimeout(glide.showTimeoutId);
    }

    // cancel old animation
    if (glide.cancelAnimation !== null) {
        glide.cancelAnimation();
    }

    // select all image objects
    var pics = glide.svg.selectAll("image")
                        .data(nextPicSpec, glide.key);

    // show next pic using random or selected animation
    if (glide.param.animation == "RANDOM") {
        var anim = glide.getRandAnimation();
        glide.animations[anim](nextPicSpec, pics);
    } else if (glide.animations.hasOwnProperty(glide.param.animation)) {
        glide.animations[glide.param.animation](nextPicSpec, pics);
    } else {    // no animation
        glide.aniNone(nextPicSpec, pics);
    }
};

glide.picId = function (d) { return "pic_" + d.key; };

glide.picSrc = function (d) { return d.src; };

glide.triggerNextSlide = function (millis) {
    if (glide.param.autoForward) {
        glide.showTimeoutId = setTimeout(glide.nextSlide, millis);
    }
};

glide.aniNotImplemented = function (nextPicSpec, pics) {
    console.log("This animation is not yet implemented!");
    glide.aniNone(nextPicSpec, pics);
};

glide.aniNone = function (nextPicSpec, pics) {
    // (1) remove old pic (if exists)
    pics.exit()
        .remove();

    // (2) load new pic
    var img = new Image();
    img.onload = function () {
        var posAndDims = glide.calcImgPosAndDims(img);
        pics.enter()
           .append("image")
           .attr("xlink:href", glide.picSrc)
           .attr("id", glide.picId)
           .attr("width", posAndDims.width)
           .attr("height", posAndDims.height)
           .attr("x", posAndDims.x)
           .attr("y", posAndDims.y);

        glide.triggerNextSlide(glide.param.showDuration);
    };
    img.src = nextPicSpec[0].src;
};

glide.aniZoomIn = function (nextPicSpec, pics) {
    // (1) remove old pic (if exists)
    pics.exit()
        .remove();

    // (2) load new pic
    var img = new Image();
    img.onload = function () {
        var posAndDims = glide.calcImgPosAndDims(img);
        pics.enter()
           .append("image")
           .attr("xlink:href", glide.picSrc)
           .attr("id", glide.picId)
           .attr("width", 1)
           .attr("height", 1)
           .attr("x", window.innerWidth / 2)
           .attr("y", window.innerHeight / 2)
           .transition()
           .duration(glide.param.animDuration)
           .attr("width", posAndDims.width)
           .attr("height", posAndDims.height)
           .attr("x", posAndDims.x)
           .attr("y", posAndDims.y);

        glide.triggerNextSlide(glide.param.animDuration
            + glide.param.showDuration);
    };
    img.src = nextPicSpec[0].src;
};

glide.aniSlideRight = function (nextPicSpec, pics) {
    // (1) remove old pic (if exists)
    pics.exit()
        .transition()
        .duration(glide.param.animDuration)
        .attr("x", window.innerWidth)
        .remove();

    // (2) load new pic
    var img = new Image();
    img.onload = function () {
        var posAndDims = glide.calcImgPosAndDims(img);
        pics.enter()
            .append("image")
            .attr("xlink:href", glide.picSrc)
            .attr("id", glide.picId)
            .attr("width", posAndDims.width)
            .attr("height", posAndDims.height)
            .attr("x", 0 - posAndDims.width)
            .attr("y", posAndDims.y)
            .transition()
            .duration(glide.param.animDuration)
            .attr("x", posAndDims.x);

            glide.triggerNextSlide(glide.param.animDuration
                + glide.param.showDuration);
    };
    img.src = nextPicSpec[0].src;
};

glide.aniSlideTop = function (nextPicSpec, pics) {
    // (1) remove old pic (if exists)
    pics.exit()
        .transition()
        .duration(glide.param.animDuration)
        .attr("y", window.innerHeight)
        .remove();

    // (2) load new pic
    var img = new Image();
    img.onload = function () {
        var posAndDims = glide.calcImgPosAndDims(img);
        pics.enter()
            .append("image")
            .attr("xlink:href", glide.picSrc)
            .attr("id", glide.picId)
            .attr("width", posAndDims.width)
            .attr("height", posAndDims.height)
            .attr("x", posAndDims.x)
            .attr("y", 0 - posAndDims.height)
            .transition()
            .duration(glide.param.animDuration)
            .attr("y", posAndDims.y);

        glide.triggerNextSlide(glide.param.animDuration
            + glide.param.showDuration);
    };
    img.src = nextPicSpec[0].src;
};

glide.getSquareDims = function (picPosAndDims) {

    var squaresPerRow = 8;
    var positions = [];
    var sqWidth, numSqWide, numSqHigh, planeWidth, planeHeight;

    if (picPosAndDims.width > picPosAndDims.height) {
        // fill complete width with squares
        sqWidth = Math.ceil(picPosAndDims.width / squaresPerRow);
        numSqWide = squaresPerRow;
        numSqHigh = Math.ceil(picPosAndDims.height / sqWidth);
    } else {
        // fill complete height with squares
        sqWidth = Math.ceil(picPosAndDims.height / squaresPerRow);
        numSqHigh = squaresPerRow;
        numSqWide = Math.ceil(picPosAndDims.width / sqWidth);
    }

    planeWidth = sqWidth * numSqWide;
    planeHeight = sqWidth * numSqHigh;

    // calculate positions
    var startX = picPosAndDims.x - ((planeWidth - picPosAndDims.width) / 2);
    var startY = picPosAndDims.y - ((planeHeight - picPosAndDims.height) / 2);
    var count = 0;
    var xPos = startX;
    var yPos = startY;
    for (var i=1; i <= numSqHigh; i++) {
        for (var j=1; j <= numSqWide; j++) {
            count++;
            positions.push({ key: count, x: xPos, y: yPos });
            xPos += sqWidth;
        }
        yPos += sqWidth;
        xPos = startX;
    }

    return {
        width: sqWidth,
        squares: positions
    };
};

glide.aniMemory = function (nextPicSpec, pics) {
    // (1) remove old pic (if exists)
    pics.exit()
        .remove();

    // (2) load new pic
    var img = new Image();
    img.onload = function () {
        var posAndDims = glide.calcImgPosAndDims(img);
        pics.enter()
           .append("image")
           .attr("xlink:href", glide.picSrc)
           .attr("id", glide.picId)
           .attr("width", posAndDims.width)
           .attr("height", posAndDims.height)
           .attr("x", posAndDims.x)
           .attr("y", posAndDims.y);

       // (3) immediately draw squares
       var squareDims = glide.getSquareDims(posAndDims);
       var squareData = squareDims.squares;
       var squareShowTime = 100;
       var animDuration = squareData.length * squareShowTime;
       glide.svg.selectAll("rect")
                .data(squareData, glide.key)
                .enter()
                .append("rect")
                .attr("width", squareDims.width)
                .attr("height", squareDims.width)
                .attr("x", function (d) { return d.x; })
                .attr("y", function (d) { return d.y; })
                .attr("id", function (d) { return "sq_" + d.key; })
                .attr("stroke", glide.param.bgColor)
                .attr("fill", glide.param.bgColor);

       // (4) define animation stopper
       glide.cancelAnimation = function () {
           if (glide.animIntervalId !== null) {
               clearInterval(glide.animIntervalId);
               glide.animIntervalId = null;

               glide.svg.selectAll("rect")
                        .data([], glide.key)
                        .exit()
                        .remove();

               glide.cancelAnimation = null;
           }
       };

       // (5) start animation: remove squares (one by one)
       glide.animIntervalId = setInterval(function () {
               if ( squareData.length > 0 ) {
                   glide.randSplice(squareData);
                   glide.svg.selectAll("rect")
                         .data(squareData, glide.key)
                         .exit()
                         .remove();
               } else {
                   clearInterval(glide.animIntervalId);
                   glide.animIntervalId = null;
                   glide.cancelAnimation = null;
               }
       },
       squareShowTime);

       glide.triggerNextSlide(animDuration + glide.param.showDuration);
    };
    img.src = nextPicSpec[0].src;
};

glide.registerAnimations = function () {
    glide.animations.ZOOM_IN = glide.aniZoomIn;
    glide.animations.SLIDE_RIGHT = glide.aniSlideRight;
    glide.animations.SLIDE_TOP = glide.aniSlideTop;
    glide.animations.MEMORY = glide.aniMemory;
};

glide.startShow = function (data) {
    glide.dataset = data;
    glide.max = glide.dataset.pics.length - 1;
    glide.i = -1;
    glide.updateParams();
    glide.registerAnimations();
    glide.setupCanvas();
    glide.nextSlide();
};

glide.stopShow = function () {
    if (glide.showTimeoutId !== null) {
        clearTimeout(glide.showTimeoutId);
        glide.showTimeoutId = null;
    }
};

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
d3.json(glide.param.picsJsonURI, function(data) {
    glide.startShow(data);
});
