import "./stylesheets/main.css";

// Small helpers you might want to keep
import "./helpers/context_menu.js";
import "./helpers/external_links.js";

// ----------------------------------------------------------------------------
// Everything below is just to show you how it works. You can delete all of it.
// ----------------------------------------------------------------------------

import { remote } from "electron";
import jetpack from "fs-jetpack";
import env from "env";
import * as $ from "../node_modules/jquery/dist/jquery";
import feather from "./feather";

const app = remote.app;
const dialog = remote.dialog;
const fs = require("fs");
const exifParser = require("exif-parser");
var ExifImage = require("exif").ExifImage;
const https = require("https");
const http = require("http");
var request = require("request").defaults({ encoding: null });
const pL = require("./pLoader.js");
const tEfx = require("./txtEffect.js");
const gdT = require("./gradientTransition.js");
const appDir = jetpack.cwd(app.getAppPath());

// Holy crap! This is browser window with HTML and stuff, but I can read
// files from disk like it's node.js! Welcome to Electron world :)
const manifest = appDir.read("package.json", "json");

const osMap = {
  win32: "Windows",
  darwin: "macOS",
  linux: "Linux",
};

const ref = $("#refresh");

//let dtOutput = [];

tEfx.txtEffect.show(); //show text effect

// pL.pLoader.show(); //LOADER

const $progressBar = $("#pgr");
const mC = document.querySelector("#mainContainer");
let fileNames = {};
let attr = {};
const fancyH1 = document.querySelector("h1.fancy");
const fancyTitle = $("#fancyTitle");
const stickyTableHeader = $("#stickyTableHeader");
const tBody = $("#tBody_id");
const histogramButton = $("#histogramButton");

const fileFilterOption = {
  filters: [
    {
      name: "Images",
      extensions: [
        "JPEG-LS",
        "ANI",
        "ANIM",
        "APNG",
        "ART",
        "BMP",
        "BPG",
        "BSAVE",
        "CAL",
        "CIN",
        "CPC",
        "CPT",
        "DDS",
        "DPX",
        "ECW",
        "EXR",
        "FITS",
        "FLIC",
        "FLIF",
        "FPX",
        "GIF",
        "HDRi",
        "HEVC",
        "ICER",
        "ICNS",
        "ICO",
        "CUR",
        "ICS",
        "ILBM",
        "JBIG",
        "JBIG2",
        "JNG",
        "JPEG",
        "JPEG",
        "2000",
        "JPEG",
        "XR",
        "JPEG",
        "XT",
        "JPEG-HDR",
        "JPEG",
        "JPG",
        "XL",
        "KRA",
        "MNG",
        "MIFF",
        "NRRD",
        "PAM",
        "PBM",
        "PGM",
        "PPM",
        "PNM",
        "PCX",
        "PGF",
        "PICtor",
        "PNG",
        "PSD",
        "PSB",
        "PSP",
        "QTVR",
        "RAS",
        "RGBE",
        "Logluv",
        "TIFF",
        "SGI",
        "TGA",
        "TIFF",
        "TIFF",
        "EP",
        "TIFF",
        "UFP",
        "WBMP",
        "WebP",
        "XBM",
        "XCF",
        "XPM",
        "XWD",
        "CIFF",
        "DNG",
        "RAF",
      ],
    },
  ],
};

// pL.pLoader.show();

// console.log(fancyTitle);
//###HIstogram######///
// histogramButton.on("click", function() {
// console.log("AHHHH");
// var x = [];
// for (var i = 0; i < 500; i++) {
// x[i] = Math.random();
// }
// var trace = {
// x: x,
// type: "histogram"
// };
// var data = [trace];
// console.log(data);
// Plotly.newPlot("histogram", data, {}, { showSendToCloud: true });
// });
//##############//////

ref.on("click", function (e) {
  // console.log("clicked: ", e.target);
  tBody.html("");
  tEfx.txtEffect.show();
  fancyH1.style.opacity = 1;
});

/// OPEN FILE //
fancyTitle.on("click", loadImg);
histogramButton.on("click", loadImg);

function loadImg(e) {
  e.preventDefault();
  dialog.showOpenDialog(fileFilterOption, (fileNames) => {
    if (fileNames === undefined) {
      // console.log("No file selected");
      return;
    }
    tBody.html(""); //empty view on drop
    tEfx.txtEffect.hide(); // TEXT EFFECT
    // console.log(fileNames[0]);
    readImgFile(fileNames[0]);
  });
}

function dropFile(dropElement) {
  dropElement.scroll(function () {
    //FadeIn/out Table header
    let top = $(this).scrollTop();
    // console.log("scrolling");
    // console.log(top);
    stickyTableHeader.addClass("fadeInColor1");
    clearTimeout($.data(this, "scrollCheck"));
    $.data(
      this,
      "scrollCheck",
      setTimeout(function () {
        // console.log("stopped");
        if (top <= 0) {
          stickyTableHeader.removeClass("fadeInColor1");
        }
      }, 250)
    );
  });

  dropElement.on("dragover", function (event) {
    let self = $(this);
    event.preventDefault();
    event.stopPropagation();
    attr.id = $(this).attr("id");
    // checkAttr(attr, $(this), "dragover");
    fancyH1.style.opacity = 0.1;

    gdT.gradientTransition(self, event);
  });

  dropElement.on("dragleave", function (event) {
    event.preventDefault();
    event.stopPropagation();
    // checkAttr(attr, $(this), "dragleave");
    fancyH1.style.opacity = 1;
  });
  dropElement.on("drop", function (event) {
    event.stopPropagation(); // Stops parent elements from receiving event.
    event.preventDefault();
    // console.log(event);
    if (event.type === "drop") {
      let imgUrl;
      let imgInfo = {};
      let isImage = false;
      tBody.html(""); //empty view on drop
      pL.pLoader.show(); //LOADER
      tEfx.txtEffect.hide(); // TEXT EFFECT
      /*
       * if source is from url
       */

      if (event.originalEvent.dataTransfer.getData("text/uri-list")) {
        // console.log("remote");
        imgUrl = event.originalEvent.dataTransfer.getData("text/uri-list");
        let spImgUrl = imgUrl.split(":");
        if (spImgUrl[0] == "https") {
          https.get(imgUrl, (response) => {
            resp(imgUrl, response);
          });
        }
        if (spImgUrl[0] == "http") {
          http.get(imgUrl, (response) => {
            resp(imgUrl, response);
          });
        }
      } else {
        // console.log("Folder");
        try {
          fileNames.path = event.originalEvent.dataTransfer.files[0].path;
          readImgFile(fileNames.path);
        } catch (err) {
          // alert(String);
          pL.pLoader.hide(); //LOADER
          $progressBar.attr("max", 0);
          $progressBar.val(0);
          tBody.append(
            `<tr><td class="error"><i data-feather="alert-triangle"></i> Cannot read property 'path'</td></tr>`
          );
        }
      }
    } /// WRITE ON SCREEN
    // checkAttr(attr, $(this), "drop");
  });

  window.addEventListener(
    "dragover",
    function (e) {
      e = e || event;
      e.preventDefault();
      // console.log(e.target);
      if (e.target) {
        // console.log("NOOPP!!!");
        window.addEventListener(
          "drop",
          function (e) {
            e = e || event;
            e.preventDefault();
          },
          false
        );
      }
    },
    false
  );
}

function resp(imgUrl, response) {
  let newImgName;
  response.on("readable", () => {
    request.get(imgUrl, function (err, res, body) {
      showProgressBar(body.length);
      exif(body); // exif
    });
  });
}
function exif(body) {
  //////// EXIF-IMAGE PARSER////////////////
  // let base64 = body.toString("base64");
  // console.log(base64);
  //var parser = require('exif-parser').create(buffer);
  try {
    mC.classList.remove("mainContainerDragAndDrop"); //Remove background / mainContainer
    new ExifImage({ image: body }, function (error, exifData) {
      if (error) {
        tBody.append(
          `<tr><td class="error"><i data-feather="alert-triangle"></i> ${error.message}</td></tr>`
        );
        console.log("Error: " + error.message);
        pL.pLoader.hide(); //LOADER
        $progressBar.attr("max", 0);
        $progressBar.val(0);
        // $progressBar.val("");
        // $progressBar.attr("max", "");
      } else {
        pL.pLoader.hide(); //LOADER
        $progressBar.attr("max", 0);
        $progressBar.val(0);
        // $progressBar.val("");
        // $progressBar.attr("max", "");
        iter(exifData);
      }
    });
    //////////// EXIF-PARSER /////////////
    const parser = exifParser.create(body);
    const result = parser.parse();
    const resultJson = JSON.stringify(result, null, 2);
    pL.pLoader.hide(); //LOADER
    $progressBar.attr("max", 0);
    $progressBar.val(0);
    fancyH1.style.opacity = 0; /// TEXT EFFECT HIDE
    iter(result);
    ///////////////////////////////
  } catch (err) {
    pL.pLoader.hide(); //LOADER
    $progressBar.attr("max", 0);
    $progressBar.val(0);
    console.log("catch: " + err);
  }
}
function readImgFile(filePath) {
  let _filter = fileFilterOption.filters[0].extensions;
  let imgExt = getFileExtension(filePath);
  if (_filter.includes(imgExt.toUpperCase())) {
    // validate extention ///
    // console.log("VALID EXTANSION");
    const buf = fs.readFileSync(filePath);
    showProgressBar(filePath);
    exif(buf);
  } else {
    let String =
      '- wrong! - \n [ ".' +
      imgExt +
      '" ] - is a wrong extensions \n \n - required! - \n [ .png, .jpg ...] ';
    String.replace(/\n|\r/g, "");
    // alert(String);
    tBody.append(
      `<tr><td class="error"><i data-feather="alert-triangle"></i> ${String}</td></tr>`
    );
    pL.pLoader.hide();
    $progressBar.val(0);
    $progressBar.attr("max", 0);
    return;
  }
}
function checkAttr(attr, self, event) {
  let hash = {
    mainContainer: {
      dragover: function () {
        // self.addClass("mainContainerDragAndDrop");
      },
      dragleave: function () {
        // self.removeClass("mainContainerDragAndDrop");
        // self.addClass("mainContainerDragAndDrop");
      },
      drop: function () {
        // self.removeClass("mainContainerDragAndDrop");
      },
    },
  };
  attr.id = self.attr("id"); //jquery
  try {
    hash[attr.id][event]();
  } catch (err) {
    // console.log(err.message);
  }
}
function getFileExtension(filename) {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
}
function iter(o) {
  $.each(o, function (i, v) {
    let g = JSON.stringify(v);
    let b = g.replace(",", "<br>");
    $.each(v, function (k, d) {
      if (typeof d !== "function") {
        // console.log(k + ": " + d);
        let _f = `<tr><td><span class="">${k}</span> : <span class="">${d}<span></td></tr>`;
        tBody.append(_f);
      }
    });
  });
}
function showProgressBar(file) {
  let fileSize = null;
  if (typeof file === "string") {
    let stats = fs.statSync(file);
    let fileSizeInBytes = stats["size"];
    fileSize = (fileSizeInBytes / 10000).toFixed(0);
    // fileSize = fileSizeInBytes;
  } else {
    fileSize = Math.floor(file / 10000);
  }
  // console.log(fileSize);
  $progressBar.val(1);
  $progressBar.attr("max", fileSize);
  for (let i = 2; i < fileSize; i += 1) {
    // debugger;
    $progressBar.val(i);
  }
}
// INIT
feather.replace();
dropFile($("#mainContainer"));
