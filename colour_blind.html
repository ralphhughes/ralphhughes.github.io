<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html> 
	<head>
	<meta http-equiv="Content-type" content="text/html;charset=UTF-8" />
	<meta name="author" content="Ralph Hughes"/>
	<title>Colour Blindness Test Images</title>
	<style type="text/css">
		body, html {
			height: 100%;
			margin: 0px 0px 0px 0px;
		}
		.tblContainer {
			width: 100%;
			height: 100%;
			text-align: center;
			vertical-align: middle;
			margin: 0px 0px 0px 0px;
		}
		.smallText {
			font-size: 70%;
			font-style: italic;
		}
		#scoreBox {
			display: block;
			width: 50px;
			height: 30px;
			position: fixed;
			right: 5px;
			bottom: 5px;
		}
	</style>
	<script type="text/javascript">
		// Globals
		var baseImageUrl = "http://www.colour-blindness.com/CBTests/ishihara/Plate";
		var numCorrect;
		var numFailed;
		var answers = new Array();
		       
		function keyPressed(o, e) {
			if (e.keyCode === 13) {
				var numberEntered=o.value;
				//alert(getIndexFromImage());
				if (numberEntered === answers[getIndexFromImage()]) {
					numCorrect++;
					updateScore();
					clearTextBox();
					jumpToRandomPlate();
				} else {
					numFailed++;
					updateScore();
					alert('Nope.');
				}
				return false;
			}
		}
		function updateScore() {
			var obj = document.getElementById('scoreBox');
			obj.innerHTML =  + Math.round((numCorrect / (numCorrect + numFailed)) * 100) + '%';
		}
		function jumpToRandomPlate() {
			// Generate a random image number, unless it's the same as the current image number in
			// which case choose a different one
			var oldIndex = getIndexFromImage();
			var newIndex = getRandomInt(1,17);
			while (oldIndex === newIndex) {
				newIndex = getRandomInt(1,17);
			}
			var imgObj = document.getElementById('plateImage');
			imgObj.src = baseImageUrl + newIndex + '.gif';
		}
		function highlightTextBox() {
			var txtObj = document.getElementById('plateInput');
			txtObj.focus();
		}
		function clearTextBox() {
			var txtObj = document.getElementById('plateInput');
			txtObj.value = '';
		}
		function populateAnswers() {
			answers['1'] = '12';
			answers['2'] = '8';
			answers['3'] = '29';
			answers['4'] = '5';
			answers['5'] = '3';
			answers['6'] = '15';
			answers['7'] = '74';
			answers['8'] = '6';
			answers['9'] = '45';
			answers['10'] = '5';
			answers['11'] = '7';
			answers['12'] = '16';
			answers['13'] = '73';
			answers['14'] = '';
			answers['15'] = '';
			answers['16'] = '26';
			answers['17'] = '42';		       
		}
		function getIndexFromImage() {
			// Get the full path + filename of currently displayed image
			var str = document.getElementById('plateImage').src;
			       
			// Strip off path to leave filename part of URL
			str = str.substring(str.lastIndexOf("/"));
			       
			// Use regex to strip out everything that ain't a number, then convert to int in base 10
			var ans = parseInt(str.replace(/[^\d.]/g, ""), 10);
			return ans;
		}
		function getRandomInt (min, max) {
			/*  Returns a random integer between min and max
				Using Math.round() will give you a non-uniform distribution! */
			return Math.floor(Math.random() * (max - min + 1)) + min;
		}
		function swapToAnswerImage(obj) {
			obj.src = baseImageUrl  + getIndexFromImage() + 'A.gif';
		}
		function swapToQuestionImage(obj) {
			obj.src = baseImageUrl  + getIndexFromImage() + '.gif';
		}
		function start() {
			numCorrect = 0;
			numFailed = 0;
			populateAnswers();
			clearTextBox();
			jumpToRandomPlate();
			highlightTextBox();
		}
	</script>
</head>
<body onload="start()">
	<table class="tblContainer">
		<tr>
			<td>
				<img id="plateImage" alt="Test Image" onmouseover="swapToAnswerImage(this)" onmouseout="swapToQuestionImage(this)"
					src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs%3D"/><br/>
				Type in the number you see and press enter:&nbsp;
				<input id="plateInput" type="text" style="width: 30px;" onkeypress="return keyPressed(this, event);"/><br/>
				<span class="smallText">(If you don't see a number leave box empty and press enter)</span>
			</td>
		</tr>
	</table>
	<div id="scoreBox">0%</div>
</body>
</html>