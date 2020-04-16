var exports = (module.exports = {});

const loader = document.querySelector("#loader");
const msg = document.querySelector("#msg");
exports.pLoader = {
	show: function() {
		loader.style.display = "block";
		msg.style.display = "block";
	},
	hide: function() {
		loader.style.display = "none";
		msg.style.display = "none";
	}
};
