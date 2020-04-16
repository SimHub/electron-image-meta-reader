/* Inspired by :
 * A PEN BY Kyle Wetton
 */
const fancyHeading = document.getElementsByClassName("fancy")[0];
// const letters = fancyHeading.textContent.split("");
const lt="META-READER";
const letters = lt.split("");

var exports = (module.exports = {});

let content = letters.map((val, i) => {
	let delay = Math.floor(Math.random() * 1000 + 1);
	return '<span style="animation-delay: ' + delay + 'ms">' + val + "</span>";
});

exports.txtEffect = {
	show: function() {
		fancyHeading.innerHTML = "";
		fancyHeading.style.display = "block";
		for (var i = 0; i < content.length; i++) {
			fancyHeading.innerHTML += content[i];
		}
	},
	hide: function() {
		fancyHeading.innerHTML = " ";
		fancyHeading.style.display = "none";
	}
};
