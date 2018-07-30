
player = null;
duration = 0;
statsSent = false;
started = false;
firtsReady = false;
so = null;
volume_state = {value: 100, state: "normal"};



/*
window.flashlsCallback = function(eventName, args) {
	flashlsEvents[eventName].apply(null, args);
};

var flashlsEvents = {
	ready: function(messsage) {
		// on load
		if(!firtsReady) {
			play();
			firtsReady = true;
		}

		// video ended
		else {
			firtsReady = false;
			// load m3u8 again and pause video
			setTimeout(function() {
				play();
				videojs_action('pause');
			}, 500);

			// send statistics that video ended
			var end = {
				position: -1
			};

			makeAjaxCall(end);
		}
	},
	complete: function(message) {
		console.log("aaaaas");
	},
	fragmentPlaying: function(playmetrics) {

	},
	position: function(timemetrics) {
		var time = {
			time: 		timemetrics.position,
			duration: 	timemetrics.duration
		}

		if(duration === 0) {
			duration = timemetrics.duration;
		}

		videojs_time(time);

		sendStats(timemetrics);
	},
	error: function(code,url,message) {
		var errorNb = message.split("#");
		errorNb = errorNb[1];
		$j(".player-error").find("h4 span").html("#" + errorNb);
		$j(".player-container").addClass("player-container-error");
		$j("#video_player").html( $j(".player-error").html() );
		$j(".video-controls").remove();
		$j(".preview-controls").remove();
		// console.log(code);
		// console.log(url);
		// console.log(message);
	},
	state: function(newState) {

	}
}

*/

var Base64 = {
	// private property
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

	// public method for encoding
	encode : function (input) {
	    var output = "";
	    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
	    var i = 0;

	    input = Base64._utf8_encode(input);

	    while (i < input.length) {

	        chr1 = input.charCodeAt(i++);
	        chr2 = input.charCodeAt(i++);
	        chr3 = input.charCodeAt(i++);

	        enc1 = chr1 >> 2;
	        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
	        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
	        enc4 = chr3 & 63;

	        if (isNaN(chr2)) {
	            enc3 = enc4 = 64;
	        } else if (isNaN(chr3)) {
	            enc4 = 64;
	        }

	        output = output +
	        Base64._keyStr.charAt(enc1) + Base64._keyStr.charAt(enc2) +
	        Base64._keyStr.charAt(enc3) + Base64._keyStr.charAt(enc4);

	    }

	    return output;
	},
	// private method for UTF-8 encoding
	_utf8_encode : function (string) {
    string = string.replace(/\r\n/g,"\n");
	    var utftext = "";

	    for (var n = 0; n < string.length; n++) {

	        var c = string.charCodeAt(n);

	        if (c < 128) {
	            utftext += String.fromCharCode(c);
	        }
	        else if((c > 127) && (c < 2048)) {
	            utftext += String.fromCharCode((c >> 6) | 192);
	            utftext += String.fromCharCode((c & 63) | 128);
	        }
	        else {
	            utftext += String.fromCharCode((c >> 12) | 224);
	            utftext += String.fromCharCode(((c >> 6) & 63) | 128);
	            utftext += String.fromCharCode((c & 63) | 128);
	        }

	    }

	    return utftext;
	}
}

/*
function addHlsPlayer() {
	if($j("#vod-hls-player").length > 0) {
		return;
	}

	so = new SWFObject("/static/slo/microsites/voyo2014/player/hls_20151027.swf?inline=1", 'vod-hls-player', player_width, player_width * 9 / 16, "9");
	so.addParam('quality', 'autohigh');
	so.addParam('allowFullScreen', 'true');
	so.addParam('allowScriptAccess', 'always');
	so.addParam('wmode', 'transparent');
	so.addParam('bgcolor', "#000");
	so.addParam('swliveconnect', "true");
	so.addParam('pluginspage', "http://www.macromedia.com/go/getflashplayer");
	so.addParam('FlashVars', 'callback=flashlsCallback');

	so.write( player_placeholder_id );

	player = getFlashMovieObject('vod-hls-player');
}


function play()
{
	player.playerLoad(m3u8);
	player.playerPlay();
	sendEvent('volume', 1);
	videojs_state("playing");
	$j("body").find(".volume .progress .progress-bar").height("100%");
}

function getFlashMovieObject(movieName)
{
	if (window.document[movieName])
	{
		return window.document[movieName];
	}
	if (navigator.appName.indexOf("Microsoft Internet")==-1)
	{
		if (document.embeds && document.embeds[movieName])
			return document.embeds[movieName];
	}
	else // if (navigator.appName.indexOf("Microsoft Internet")!=-1)
	{
		return document.getElementById(movieName);
	}
}



function sendEvent(type, param)
{
	switch(type) {
		case 'pause':
			player.playerPause();
			videojs_state("paused");
			break;
		case 'play':
			player.playerResume();
			videojs_state("playing");
			break;
		case 'seek':
			player.playerSeek(param * duration);
			break;
		case 'volume':
			handleVolume(param);
			break;
		default:
			break;
	}
}

function action_seekThumb(position, seconds, dir) {
	var thumbNb = parseInt(seconds / 5) + 1;
	return (dir +  thumbNb + '.jpg');
}

function handleVolume(param) {
	if (typeof(param) == "undefined") {
		if (volume_state.state == "normal") {
			volume_state.state = "muted";
			param = 0;
		} else if (volume_state.state == "muted") {
			volume_state.state = "normal";
			param = volume_state.value;
		}
	} else {
		param = parseInt(param * 100);
		volume_state.value = param;
	}

	var newParam = param / 100;

	action_volume(param);
}

function action_volume(perc)
{
	player.playerVolume(perc);
	var newPerc = perc/100;
	videojs_volume({volume: newPerc});
}

*/

function sendStats(time) {
	if (parseInt(time.position, 0) % 10 === 0) {
		if(!statsSent) {
			statsSent = true;
			makeAjaxCall(time);
		}
	}
	else {
		statsSent = false;
	}
}

function makeAjaxCall(time)
{
	var seconds = parseInt(time.position, 0);
	if(seconds === 0 && !started) {
		seconds = "START";
		started = true;
	}
	else if(seconds === 0 && started) {
		if(!firtsReady) {
			started = false;
		}
		return;
	}

	if(time.position === -1) {
		seconds = "END";
	}

	var string 	= 'id=' + media_id;
	string 		+= '&file=' + file;
	string 		+= '&section_id=' + section_id;
	string 		+= '&section=p';
	string 		+= '&video_type=video'; // can be also ad
	string 		+= '&state=' + seconds;
	string 		+= '&bit=' + $j.cookie('bit') + '|User:' + $j.cookie('user');
	string 		+= '&referer=' + player_referer;
	string 		+= '&fv=' + (so ? (so.installedVer.major + ',' + so.installedVer.minor + ',' + so.installedVer.rev) : '');
	string 		+= '&event=';
	string 		+= '&ses_id=ses_id_' + generateRandomString(20);
	string 		+= '&length=' +  time.duration;

	var base = Base64.encode(string);
	var url = '/bin/player/?mod=statistics&data=' + base;
	$j.ajax({
		url: url,
		success: function(response) {

		}
	});
}

function generateRandomString(length)
{
	var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < length; i++ ) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}
