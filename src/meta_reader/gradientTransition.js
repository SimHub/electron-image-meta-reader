/*Inspired by:
 * Gradient Transition on Mousemove
 * A PEN BY Katia Shatoba
 */

var exports = (module.exports = {});

const colours = [
  ["#f8b195", "#f0a390", "#e7958c", "#dc8889", "#d17c87", "#c4748b"],
  ["#b46d8e", "#a36790", "#886594", "#6b6391", "#4f608a", "#355c7d"],
];
function hex2rgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return (
    "rgb(" +
    parseInt(result[1], 16) +
    "," +
    parseInt(result[2], 16) +
    "," +
    parseInt(result[3], 16) +
    ")"
  );
}
function rgb2hex(rgb) {
  rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);

  function hex(x) {
    return ("0" + parseInt(x).toString(16)).slice(-2);
  }
  return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}
function rgbArray(rgb) {
  return rgb.split("(")[1].split(")")[0].split(",");
}
// finds transition colour based on mouse position
function transitionColour(from, to, width, x) {
  var m = x / width;
  var r, g, b;

  r = Math.ceil(from[0] * m + to[0] * (1 - m));
  g = Math.ceil(from[1] * m + to[1] * (1 - m));
  b = Math.ceil(from[2] * m + to[2] * (1 - m));

  return rgb2hex("rgb(" + r + ", " + g + ", " + b + ")");
}

function hex(v) {
  let hex = v.toString(16);
  if (v < 16) {
    hex = "0" + hex;
  }
  return hex;
}
exports.gradientTransition = function (element, e) {
  let xPos = e.pageX,
    width = element.innerWidth(),
    // convert hex to rgb
    topLeft = hex2rgb(colours[0][0]),
    topRight = hex2rgb(colours[1][0]),
    bottomLeft = hex2rgb(colours[0][1]),
    bottomRight = hex2rgb(colours[1][1]);

  // console.log(xPos, width);

  // get transition colour
  let bottomTransition = transitionColour(
    rgbArray(bottomRight),
    rgbArray(bottomLeft),
    width,
    xPos
  );
  let topTransition = transitionColour(
    rgbArray(topRight),
    rgbArray(topLeft),
    width,
    xPos
  );

  element.css({
    background:
      "radial-gradient(" + topTransition + ", " + bottomTransition + ")",
  });
};
