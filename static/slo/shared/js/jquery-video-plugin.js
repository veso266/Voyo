(function($) {

	$.videoPlugin = function(element, options)
	{	
		var $this = this;
		$this.options = options;
		$this.element = element;
		/**
		 * Initialize plugin
		 */
		$this.init = function (element, options)
		{
			// save options in varables
			var elementId = options.elementId;
			
			var playLiveBtn = options.playLiveBtn;
			var playBtn = options.playBtn;
			var pauseBtn = options.pauseBtn;
			var fullScreenBtn = options.fullScreenBtn;
			var normalScreenBtn = options.normalScreenBtn;
			var volumeBtn = options.volumeBtn;
			var shareBtn = options.shareBtn;
			var rateBtn = options.rateBtn;
			var qualityBtn = options.qualityBtn;
			var playhead = options.playhead;
			var tag = options.tag;

			$this.options.lastVideoWatchNotify = null;
			$this.options.itemWathedBeacon = false;
			$this.options.browser = $this.checkIE();

			if($this.options.browser && $this.options.browser < 11) {
				fullScreenBtn.hide();
			}

    			// show mouse on mousemove
			$("body").mousemove(function (e) {
				//calculate distance
				var x = $this.options.mouseX - e.pageX;
				var y = $this.options.mouseY - e.pageY;

				var distance = Math.sqrt(x*x + y*y); 


				if(distance > 5) {
					$this.mouseMove();
				}

				$this.options.mouseX = e.pageX;
				$this.options.mouseY = e.pageY;
			});

			var progressBarClick = options.progressBarClick;

			// On play live button click start video playing / function call
			playLiveBtn.on("click", function(e) {
				e.preventDefault();
				$this.playLive();
			});

			// On play button click start video playing / function call
			playBtn.on("click", function(e) {
				e.preventDefault();
				$this.play();
			});

			// On pause button click pause video playing / function call
			pauseBtn.on("click", function(e) {
				e.preventDefault();
				$this.pause();
			});

			// full button click event call function
			fullScreenBtn.on("click", function(e) {
				e.preventDefault();
				$this.fullScreenToggle(e, "player-full-screen");
			});

			// normal button click event call function
			normalScreenBtn.on("click", function(e) {
				e.preventDefault();
				$this.fullScreenToggle(e, "player-full-screen");
			});

			// space is clicked
			$("body").on("keypress", function(e) {
				if(
					$(e.target).hasClass("answer") || 
					$(e.target).hasClass("ui-autocomplete-input") ||
					($(e.target).prop("id") == "web_comment_form")
				) {
					return true;
				}

				if(e.which == 32) {
					// if we are playing voyo tream we don't want play or pause on player
					if($j(".timeshift-player-frame").hasClass("playing-voyo")) {
						return;
					}

					e.preventDefault();
					if($this.options.state == "playing") {
						$this.pause();
					}
					else {
						$this.play();
					}
				}
			});

			// play or pause element 
			element.on("mousedown", ".player, .video-player-overlay", function(e) {		
				// if we are playing voyo tream we don't want play or pause on player		
				if($j(e.target).closest(".timeshift-player-frame").hasClass("playing-voyo")) {
					return;
				}

				if($this.options.browser && $this.options.browser < 11) {

				}
				else {
					e.preventDefault();
				
					if($this.options.state == "playing") {
						$this.pause();
					}
					else {
						$this.play();
					}
				}
			});

			element.on("mouseover", ".player", function(e) {
				var embed = element.find("embed").focus();
				sendEvent("mouse_move", "");
			});

			element.on("mouseout", ".player", function(e) {
				element.focus();
			});

			// POPOVERS 
			// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// Popover for volume			
			volumeBtn.popover({
				trigger: 	'hover',
				'placement': 	'top',
				'html': 	true,
				"template": 	'<div class="popover popover-volume" id="popover-volume" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>',
				'content': 	function() {
					return $this.options.volumePopoverContent.html();
				},
				delay: 		{
					show: 	50,
					hide: 	400
				}
			}).on("show.bs.popover", function(e) {
				$this.element.find("." + options.popoverClass).not(this).popover("hide");
			});
		

			// Popover for share
			shareBtn.popover({
				trigger: 	'hover',
				'placement': 	'top',
				'html': 	true,
				"template": 	'<div class="popover popover-share" id="popover-share" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>',
				'content': 	function() {
					return $this.options.sharePopoverContent.html();
				},
				delay: 	{
					show: 	50,
					hide: 	400
				}
			}).on("show.bs.popover", function() {
				$this.element.find("." + options.popoverClass).not(this).popover("hide");
			});

			// Popover for RATE
			rateBtn.popover({
				trigger: 	'hover',
				'placement': 	'top',
				'html': 	true,
				"template": 	'<div class="popover popover-rate" id="popover-rate" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>',
				'content': 	function() {
					return $this.element.find("#rate-content").html();
				},
				delay: 	{
					show: 	50,
					hide: 	400
				}
			}).on("show.bs.popover", function() {
				$this.element.find("." + options.popoverClass).not(this).popover("hide");
			}).on("hide.bs.popover", function() {
				$this.renderRate($this.element.find("#video-rate").data("avg"));
			});

			// Popover for quality
			qualityBtn.popover({
				trigger: 	'hover',
				'placement': 	'top',
				'html': 	true,
				"template": 	'<div class="popover popover-quality" id="popover-quality" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>',
				'content': 	function() {
					return $this.options.qualityPopoverContent.html();
				},
				delay: 	{
					show: 	50,
					hide: 	400
				}
			}).on("show.bs.popover", function() {
				$this.element.find("." + options.popoverClass).not(this).popover("hide");
			});

			// VOLUME AND SEEK
			// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// on mousemove on seeking and volume change
			element.on("mousemove", function(e) {
				e.preventDefault();
				if($this.options.isVolumeDraging) {
					$this.volumeBarClick(e, element.find("." + $this.options.volumePopoverDynamicClass + " #" + $this.options.volumeBarClickId));
				}
				else if($this.options.isSeekDraging) {
					$this.seekDragging(e, playhead);
				}
			});
			// on mouse up seeking and volume
			element.on("mouseup", function(e) {
				e.preventDefault();
				$this.options.isVolumeDraging = false;
				
				if($this.options.isSeekDraging) {
					$this.options.isSeekDraging = false;

					var position = $this.seekDraggingCalculate(e, playhead);
					$this.options.seekPosition = position * 100;
					sendEvent("seek", position);
				}
			});

			// volume on mouse down event
			element.on("mousedown", "." + $this.options.volumePopoverDynamicClass + " #" + $this.options.volumeBarClickId, function(e) {
				e.preventDefault();
				$this.options.isVolumeDraging = true;
				$this.volumeBarClick(e, $(this));
			});

			// volume on click event // mute sound
			volumeBtn.on("click", function(e) {
				e.preventDefault();
				$this.toggleVolumeMute(true, $this.options.volume);
			});


			progressBarClick.on("click", function(e) {
				e.preventDefault();
				$this.seek(e);
			});
			
			playhead.on("mousedown", function(e) {
				e.preventDefault();
				$this.options.isSeekDraging = true;
			});


			// THUMBNAILS
			// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// create thumbnails
			if($this.options.showThumbnails) {
				$.each([playhead, progressBarClick], function(index, value) {

					value.on("mouseleave", function() {
						$this.options.progressThumb.hide();
					});	

					value.on("mousemove", function(e) {
						$this.seekThumbnails(e, $(this));
					});	
				});
			}

			// QUALITY
			// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			element.on("click", "#" +  this.options.qualityContentId + " a.list-group-item", function(e) {
				e.preventDefault();
				var quality = $(this).data("quality");

				sendEvent("quality", quality);
			});

			// RATE
			// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			element.on("click.rate", "." +  this.options.rateStars , function(e) {
				e.preventDefault();
				var nb = $(this).data("nb");
				var itemId = $(this).data("id");

				$this.sendRate(nb, itemId);
			});

			element.on("mouseover", "." +  this.options.rateStars , function(e) {
				e.preventDefault();
				var nb = $(this).data("nb");				
				$this.renderRate(nb);
			});

			element.on("mouseout", "." +  this.options.rateStars , function(e) {
				e.preventDefault();
				$this.renderRate($this.element.find("#video-rate").data("avg"));
			});

			// video tags
			$this.renderVideoTags(options.videoTags, tag);
		
			// FULL SCREEN EVENT LISTENERS
			// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			document.addEventListener("fullscreenchange", $this.fullScreenChangeHandler);
			document.addEventListener("webkitfullscreenchange", $this.fullScreenChangeHandler);
			document.addEventListener("mozfullscreenchange", $this.fullScreenChangeHandler);
			document.addEventListener("MSFullscreenChange", $this.fullScreenChangeHandler);
			document.addEventListener("oFullscreenChange", $this.fullScreenChangeHandler);
		}

		// SCREEN RESIZE FUNCTIONS
		// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		/**
		 * FUNCTION handle screen resize change
		 * 
		 * @return void
		 */
		$this.fullScreenChangeHandler = function() {
			var isFull;
			// check if full screen and ADD or REMOVE full-screen class
			if (
				document.fullscreenElement ||
				document.webkitFullscreenElement ||
				document.mozFullScreenElement ||
				document.msFullscreenElement ||
				document.oFullscreenElement

			) {
				$this.element.addClass("full-screen");
				isFull = true;
			}
			else {
				$this.element.removeClass("full-screen");
				isFull = false;
			}

			// call resize buttons function to show the right resize button
			$this.resizeButtons(isFull);

			// save is full screen in options
			$this.options.isFullScreen = isFull;

			// hide all popovers
			$this.element.find("." + options.popoverClass).popover("hide");
		}

		/**
		 * FUNCTION TOGGLE FULLSCREEN
		 *
		 * @param evt (mouse event)
		 * @param elementId (string)
		 * @return void
		 */
		$this.fullScreenToggle = function(evt, elementId) {
			// save the element in variable
			var divObj = document.getElementById(elementId);

			// toggle full screen 
			// it depends on browser
			// change fullScreen variable
			if (divObj.requestFullscreen) {
				if (document.fullScreenElement) {
					document.cancelFullScreen();					
				}
				else {
					divObj.requestFullscreen();
				}
			}
			else if (divObj.msRequestFullscreen) {
				if (document.msFullscreenElement) {
					document.msExitFullscreen();
				} 
				else {
					divObj.msRequestFullscreen();
				}
			}
			else if (divObj.mozRequestFullScreen) {
				if (document.mozFullScreenElement) {
					document.mozCancelFullScreen();
				}
				else {
					divObj.mozRequestFullScreen();
				}
			}
			else if (divObj.webkitRequestFullscreen) {
				if (document.webkitFullscreenElement) {
					document.webkitCancelFullScreen();
				}
				else {
					divObj.webkitRequestFullscreen();
				}
			}
			else if (divObj.oRequestFullscreen) {
				if (document.oFullscreenElement) {
					document.oCancelFullScreen();
				}
				else {
					divObj.oRequestFullscreen();
				}
			}

			//  stop bubbling so we don't get bounce back
			if(evt) {
				evt.stopPropagation();
			}
		}

		/**
		 * FUNCTION hide and show the screen resize buttons
		 * 
		 * @param isFull (bool)
		 * @return void
		 */
		$this.resizeButtons = function(isFull) {
			if(isFull) {
				$this.options.fullScreenBtn.hide();
				$this.options.normalScreenBtn.show();
				if(this.options.browser && $this.options.browser < 11) {

				}
				else {
					$this.element.find(".video-player-overlay").show();
				}
			}
			else {
				$this.options.fullScreenBtn.show();
				$this.options.normalScreenBtn.hide();
				if($this.element.hasClass('vod-player')) {
					$this.element.find(".video-player-overlay").hide();
				}

				if(!$this.element.find(".video-controls").is(":visible")) {
					$this.element.find(".video-controls").show();
				}	
			}
		}


		// THUMBNAILS FUNCTIONS
		// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		/**
		 * FUNCTION SEEK THUMBNAILS
		 * 
		 * @param evt (mouse event)
		 * @param el (jQuery element)
		 * @return void
		 */
		$this.seekThumbnails = function(evt, el) {
			var image = new Image();
			$this.options.progressThumb.show();

			// find position and convert it in seconds
			var position = $this.seekDraggingCalculate(evt, el);
			var seconds = position * $this.options.videoDuration;

			// calculate thumb number
			if($this.options.isTimeShift) {
				$this.options.progressThumb.find(".thumb-time").html($this.secondsToString(seconds));				
/*
				var thumbSrc; // = action_seekThumb(position, seconds);
				if($this.options.thumbnailsDir != "") {
					thumbSrc = action_seekThumb(position, seconds, $this.options.thumbnailsDir);
				}
				else {
					thumbSrc = action_seekThumb(position, seconds);
				}

				image.src = thumbSrc;
			
				image.onload = function() {
					// fill out data in thumb (image and time)
					$this.options.progressThumb.find(".thumb-image").html('<img width="160" height="90" src="' + thumbSrc + '" />');
					$this.options.progressThumb.find(".thumb-time").html($this.secondsToString(seconds));				
				}
*/
			}
			else {
				$this.options.progressThumb.find(".thumb-time").html($this.secondsToString(seconds));
/*
				var thumbNb = parseInt(seconds / 5) + 1;
				image.src = $this.options.thumbnailsDir +  thumbNb + '.jpg';

				image.onload = function() {
					
					// fill out data in thumb (image and time)
					$this.options.progressThumb.find(".thumb-image").html('<img src="' + $this.options.thumbnailsDir +  thumbNb + '.jpg' + '" />');
				}
*/

			}
			// thumb width and positiion in px
			var progressThumbWidth = $this.options.progressThumb.width();
			var positionInPx = $this.options.progressBarClick.width() * position;

			// not to show thumbs div over the progress bar
			if(positionInPx - 10 < progressThumbWidth / 2 || positionInPx + 10 > $this.options.progressBarClick.width() - (progressThumbWidth / 2)) {
				// most left position
				if(positionInPx - 10 < progressThumbWidth / 2) {
					$this.options.progressThumb.css("left", progressThumbWidth / 2 + 10 + "px");
				}
				// most rigth position
				else {
					$this.options.progressThumb.css("left", $this.options.progressBarClick.width() - (progressThumbWidth / 2) - 10 + "px");	
				}
			}
			// folow the mouse
			else {
				$this.options.progressThumb.css("left", position * 100 + "%");
			}


		}

		// SEEK FUNCTIONS
		// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		/**
		 * FUNCTION FOR CALCULATE DRAGGING POSITION ON SEEKING
		 * 
		 * @param evt (mouse event)
		 * @param el (jQuery element)
		 * @return Float
		 */
		$this.seekDraggingCalculate = function(evt, el) {
			// calculate variables (offset and element width) 
			var offset = evt.pageX - parseInt(el.parent().offset().left);
			var elementWidth = $this.options.progressBarClick.width();

			// calculate postion and return it
			var position = offset / elementWidth;	
			return position;		
		}

		/**
		 * FUNCTION DRAGGING PLAYHEAD
		 * 
		 * @param evt (mouse event)
		 * @param el (jQuery element)
		 * @return void
		 */
		$this.seekDragging = function(evt, el) {
			// get the position
			var position = $this.seekDraggingCalculate(evt, el) * 100;

			// set elements postion in percent
			el.css({
				left: position + "%"
			});

			// progress bar position is the same as the playheads
			$this.options.progressBar.width(position + "%");
			$this.options.seekPosition = position;
		}

		/**
		 * FUNCTION SEEK ON CLICK ON PROGRESS BAR
		 * 
		 * @param evt (mouse event)
		 * @param position (percentages in float)
		 * @return void
		 */
		$this.seek = function(evt, position) {
			// if click is on playhead do nothing
			if($(evt.target).hasClass("playhead")) {
		 		return;
		 	}

		 	// calculate click offset, element width and progress position
		 	var clickOffset = evt.pageX - $(evt.target).offset().left;
		 	var elementWidth = $this.options.progressBarClick.width();
		 	var progress = clickOffset / elementWidth;

		 	// position is defined
		 	if(typeof(position) !== "undefined" && position){
		 		progress = position;
		 	}
		 	
		 	// if everthing is OK
		 	if(typeof(progress) != "undefined" && progress != "NaN") {
		 		$this.moveSeek(progress * 100);
		 		$this.options.seekPosition = progress * 100;
		 		sendEvent("seek", progress);
		 	}	
		}
		

		/**
		 * FUNCTION MOVE SEEK POSTION
		 * 
		 * @param position (int)
		 * @return void
		 */
		$this.moveSeek = function(position) {
			$this.options.progressBar.width(position + "%");
			$this.options.playhead.css("left", position + "%");
		}

		/**
		 * FUNCTION RENDERS VIDEO TAGS
		 * 
		 * @param tags (json)
		 * @param $tagTemplate (jquery object)
		 * @return void
		 */
		$this.renderVideoTags = function(tags, $tagTemplate) {
			if(!tags.length)
				return false;
			
			var $tag = $tagTemplate.clone();
			var $parent = $tagTemplate.parent();
			$tagTemplate.remove();

			$j.each(tags, function(i, el){
				var currentTimePercent = el.from / el.duration * 100;
				if (currentTimePercent > 100)
					currentTimePercent = 100;
				
				var $tempTag = $tag.clone();
				$tempTag.show().prependTo($parent).css("left", currentTimePercent+"%");
				$tempTag.on("click", function(e){
					e.preventDefault();
					$this.seek(e, currentTimePercent/100);
				});
				// Popover for tags			
				$tempTag.popover({
					trigger: 	'hover',
					'placement': 	'top',
					'html': 	true,
					"template": 	'<div class="popover popover-tag" id="popover-tag" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>',
					'content': 	function() {
						return el.label;
					},
					delay: 		{
						show: 	50,
						hide: 	400
					}
				}).on("show.bs.popover", function(e) {
					$this.element.find("." + options.popoverClass).not(this).popover("hide");
				});
			});

		}


		// VOLUME FUNCTIONS
		// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		/**
		 * FUNCTION FOR CLICK ON VOLUME BAR
		 * 
		 * @param evt (mouse event)
		 * @param el (jQuery element)
		 * @return void
		 */
		$this.volumeBarClick = function(evt, el) {			
			// calculate offset, get element height and calculate the volume
			var clickOffset;

			try {
				if(
					typeof(el) !== "undefined" &&
					typeof(el.offset()) !== "undefined" &&
					typeof(el.offset().top) !== "undefined"
				) {
			 		clickOffset = (evt.pageY - el.offset().top);
			 		$this.options.clickOffset = clickOffset;
				}
				else {
					clickOffset = $this.options.clickOffset;
				}
			}
			catch(exeption){
				clickOffset = $this.options.clickOffset;
			}

		 	var elementHeight = el.height();			
			var volume = (elementHeight -  clickOffset) / elementHeight;

			// check for min and max
			if(volume > 1) {
				volume = 1;
			}
			if(volume < 0) {
				volume = 0;
			}

			// cal function for changing volume
			this.toggleVolumeMute(false, volume);
		}

		/**
		 * FUNCTION FOR SETTING VOLUME
		 * 
		 * @param volume (int)
		 * @return void
		 */
		$this.volume = function(volume) {
			// send volume to player
			sendEvent("volume", volume);

			// calculate percent and set the volume bar height
			var elementHeight = $this.element.find("#" + $this.options.volumeBarClickId).height();
			var volumePercent = volume * 100;

			$this.element.find("#" + $this.options.volumeBarId).height(volumePercent + "%");
			$this.element.find(".popups #" + $this.options.volumeBarId).height(volumePercent + "%");
		}

		/**
		 * FUNCTION TOGGLE VOLUME butttons
		 * 
		 * @param state (strinn)
		 * @return void
		 */
		$this.toggleVolumeButtons = function(state) {
		 	if(state == "mute") {
		 		$this.options.volumeBtn.find("span").addClass($this.options.volumeMuteClass);
		 		$this.options.volumeBtn.find("span").removeClass($this.options.volumeUpClass);
		 		$this.options.volumeBtn.find("label").html($this.options.volumeMuteText);
		 	}
		 	else {
		 		$this.options.volumeBtn.find("span").removeClass($this.options.volumeMuteClass);
		 		$this.options.volumeBtn.find("span").addClass($this.options.volumeUpClass);
		 		$this.options.volumeBtn.find("label").html($this.options.volumeText);
		 	}
		 }

		/**
		 * FUNCTION TOGGLE VOLUME AND VOLUME MUTE BUTTONS
		 * 
		 * @param isClick (bool)
		 * @param volume (int)
		 * @return void
		 */
		$this.toggleVolumeMute = function(isClick, volume) {
			// if volume is bigger than 0
			if(volume > 0) {
				// set current volume for later
				$this.options.currentVolume = volume;
				// is is on click we set volume on 0 and show and hide the right buttons
				if(isClick) {
					$this.options.volume = 0;
					volume = 0;
					$this.toggleVolumeButtons("mute");
				}
				// is not on click we show and hide the right buttons
				else {
					$this.toggleVolumeButtons("volume");
				}

			}
			// is not muted
			else {
				// on click button set the right volume
				if(isClick) {
					// set volume to the previous set value
					volume = $this.options.currentVolume;
					// if is muted set the volume on 0.5
					if($this.options.currentVolume < 0.05) {
						volume = 0.5;
					}

					$this.options.volume = volume;
					// show and hide the buttons
					$this.toggleVolumeButtons("volume");
				}
				else {
					// show and hide the buttons
					$this.toggleVolumeButtons("mute");
				}

			}

			// call function for setting volume
			$this.volume(volume);
		}

		// VIDEO CONTROL FUNCTIONS
		// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
		$this.playLive = function() {
			$this.moveSeek(100);				
			$this.options.seekPosition = 100;
			$this.options.isLive = true;

			sendEvent("playlive");
		}

		/**
		 * FUNCTION sends the play action to player
		 * 
		 * @return void
		 */
		$this.play = function() {
			$this.options.isLive = false;


			// if video ended on start playing set timeline to 0
			if($this.options.state == "stopped") {
				$this.moveSeek(0);				
				$this.options.seekPosition = 0;
			}

			sendEvent("play");
		}

		$this.mouseMove = function() {
			if (!$this.options.fadeInBuffer) {
				if ($this.options.timer) {
					clearTimeout($this.options.timer);
					$this.options.timer = 0;
				}

				$('html').css({
					cursor: ''
				});

				if(!$this.element.find(".video-controls").is(":visible")) {
					$this.element.find(".video-controls").show();
				}
				sendEvent("mouve_move", "");
				
			}
			else {
				this.options.fadeInBuffer = false;
			}

			if($this.options.state == "playing" || $this.options.state == "live-paused") {
				$this.options.timer = setTimeout(function () {
					$('html').css({
						cursor: 'none'
					});
					
					if($this.element.hasClass("full-screen")) {
						$this.element.find(".video-controls").hide();

					}
					
					$this.options.fadeInBuffer = true;
				}, 5000)
			}
		}
		videojs_action = function(action, param)
		{
			switch (action) {
				case "play":
					$this.play();
					break;
				case "pause":
					$this.pause();
					break;
				case "moveSeek":
					$this.moveSeek(param);
					break;
			}
		}
		
		/**
		 * FUNCTION sends the pause action to player
		 * 
		 * @return void
		 */
		$this.pause = function() {
			sendEvent("pause");
		}

		/**
		 * FUNCTION renders rating stars
		 * 
		 * @param nb (int) 
		 * @return void
		 */
		$this.renderRate = function(nb) {
			$j("." + this.options.rateStars).removeClass("el-icon-star");
			$j("." + this.options.rateStars).addClass("el-icon-star-empty");

			for(var i= 1; i <= 5; i++){
				if(i <= parseInt(nb)){
					$("." + this.options.rateStars + "[data-nb='"+i+"']").removeClass("el-icon-star-empty");
					$("." + this.options.rateStars + "[data-nb='"+i+"']").addClass("el-icon-star");
				}
			}
		}

		/**
		 * FUNCTION insert rate
		 * 
		 * @param nb (int) 
		 * @return void
		 */
		$this.sendRate = function(nb, item_id) {
			$j.ajax({
				url : '/lbin/ajax_voyo_media_vote.php',
				data : ({ 
					'item_id' : item_id,
					'what_vote' : nb,
					'entity_type' : "media"
				}),
				type : 'POST',
				success: function(data) {		
					if(data == "already_voted") {
						$this.element.find("#rate-note-already").show();
						$this.element.off("click.rate");
						/*setTimeout(function(){
							$this.element.find("#rate-note-already").hide();
						}, 2000);*/
					}else if(data == "NO VALID VISITOR"){

					}else if(data) {
						$this.renderRate(parseInt(data));
						$this.element.find("#video-rate").attr("data-avg", parseInt(data));
					}
				}
			});
		}

		// HELPERS
		// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
		/**
		 * FUNCTION sends the pause action to player
		 * 
		 * @param second (int) 
		 * @return string
		 */
		$this.secondsToString = function(seconds) {
			// calculate hours, minutes and seconds
			var hours = parseInt( seconds / 3600 ) % 24;
			var minutes = parseInt( seconds / 60 ) % 60;
			var seconds = parseInt(seconds % 60);
			
			// of hours is 0 don't show hours
			if(hours == 0) {
				hours = "";
			}
			else {
				hours = (hours < 10  ? "0" + hours : hours) + ":";
			}

			// create result and return it
			var result = hours + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds);
			return result
		}



		// POPOVERS
		// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
		// FIX for popovers, so we can go over popover with mouse
		// http://stackoverflow.com/questions/23632998/bootstrap-3-popover-gets-hidden-behind-the-element-which-overflow-is-hidden
		var originalLeave = $.fn.popover.Constructor.prototype.leave;
		$.fn.popover.Constructor.prototype.leave = function(obj){
			// hack for volume volume
			if ($(obj.currentTarget).siblings(".popover-volume:visible").length && $this.options.isClick) {
				return;
			}

			var self = obj instanceof this.constructor ?
				obj : $(obj.currentTarget)[this.type](this.getDelegateOptions()).data('bs.' + this.type)
			var container, timeout;
			
			
			originalLeave.call(this, obj);

			if(obj.currentTarget) {
				
				container = $(obj.currentTarget).siblings('.popover');
				timeout = self.timeout;
				container.one('mousedown', function() {
					$this.options.isClick = true;
				});
				container.one('mouseenter', function(){	
					//We entered the actual popover â call off the dogs
					clearTimeout(timeout);
					//Let's monitor popover content instead
					container.one('mouseleave', function(){
						if(!$this.options.isClick) {
							$.fn.popover.Constructor.prototype.leave.call(self, self);
						}
					});
				});
				$("body").one("mouseup", function(e) {
					$this.options.isClick = false;
					if(
						$(e.target).hasClass("popover-content") || 
						$(e.target).hasClass("progress-click") ||
						$(e.target).hasClass("progress") ||
						$(e.target).hasClass("popover") ||
						$(e.target).is("a") ||
						$(e.target).parent().is("a")
					) {
						return;
					}
					else {
						$.fn.popover.Constructor.prototype.leave.call(self, self);
					}
				});
			}
		};

		// FIX for popovers, if we enter the same button when is visible we do nothing
		// http://stackoverflow.com/questions/7703878/how-can-i-hold-twitter-bootstrap-popover-open-until-my-mouse-moves-into-it
		// var originalEnter = $.fn.popover.Constructor.prototype.enter;
		// $.fn.popover.Constructor.prototype.enter = function(obj) {
		// 	if (!$(obj.currentTarget).siblings(".popover-" + obj.currentTarget.id + ":visible").length) {
		// 		var self = (obj instanceof this.constructor ? obj : $(obj.currentTarget)[this.type](this.getDelegateOptions()).data("bs." + this.type));
		// 		clearTimeout(self.timeout);
		// 		originalEnter.call(this, obj);
		// 	}			
		// };

		// FUNCTIONs CALLED FROM FLASH PLAYER
		// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
		/**
		 * function for current time of video
		 * 
		 * @param time (Object) 
		 * @return void
		 */
		videojs_time = function(time) {
			// if is in dragging mode do nothing
			if(!$this.options.isSeekDraging) {
				// set video duration in variable
				$this.options.videoDuration = time.duration;
				
				// calculate current time of video in percent
				var currentTimePercent = time.time / time.duration * 100;
				if (currentTimePercent > 100)
					currentTimePercent = 100;
				
				// current time string
				var timeString = $this.secondsToString(time.time);
				$this.options.timePassed.html(timeString);	

				// duration time string
				var durationString = $this.secondsToString(time.duration);
				$this.options.duration.html(durationString);			
				
				// if is dragging we don't want animation of progress bar and playhead
				if(
					currentTimePercent + 1 > $this.options.seekPosition  || 
					currentTimePercent - 1 < $this.options.seekPosition
				) {				
					$this.moveSeek(currentTimePercent);				
					$this.options.seekPosition = currentTimePercent;
				}

				// notify web service, that user is watching this movie
				if ($visitor.bookmarks()) {
					$this.notifyVideoWatch(time.time, currentTimePercent);
				}
			}
		}

		/**
		 * Every minute send a becon to web service
		 */
		$this.notifyVideoWatch = function(seconds, percent) {

			seconds = parseInt(seconds);
			percent = parseInt(percent);

			if (!$this.shouldSendVideoWatch(seconds, percent)) {
				return;
			}

			$this.options.lastVideoWatchNotify = seconds;

			if (percent > 90) {
				// this is flag so that we send 'wathed' ajax post only once
				$this.options.itemWathedBeacon = true;

				$this.setVideoWatched(seconds, percent, $this.removeVideoWatching);
				return;
			}

			$this.setVideoWatching(seconds, percent, $this.removeVideoWatched);
			return;
		}

		$this.shouldSendVideoWatch = function(seconds, percent) {
			if (!$this.options.mediaId)
				return false;

			// do not log for the first 10 percents
			if ((percent <= 10) || (seconds <= 30))
				return false;
			
			// do not log multiple times at the same second
			if ($this.options.lastVideoWatchNotify === seconds)
				return false;

			// if video is over 90%, log that it's watched full
			if ((percent > 90) && (!$this.options.itemWathedBeacon))
				return true;

			// log only every minute
			if (seconds % 60 > 0)
				return false;

			return true;
		}

		$this.getVideoWatchedData = function(category, seconds, percent) {
			var data = {
				category: category,
				item: {
					_id: $this.options.mediaId,
					media_id: $this.options.mediaId,
					title: $this.options.title,
					thumbnail: $this.options.thumbnail,
					url: document.location.href,
					seconds: seconds, 
					percent: percent
				}
			};

			return data;
		}

		$this.setVideoWatched = function(seconds, percent, callback) {
			var data = $this.getVideoWatchedData('Ĺ˝e pogledano', seconds, percent);
			$visitor.bookmarks().itemAdd(data, callback);
		}

		$this.setVideoWatching = function(seconds, percent, callback) {
			var data = $this.getVideoWatchedData('Glej naprej', seconds, percent);
			$visitor.bookmarks().itemAdd(data, callback);
		}

		$this.removeVideoWatching = function() {
			var data = {category: 'Glej naprej', itemId: $this.options.mediaId};
			$visitor.bookmarks().itemRemove(data);
		}

		$this.removeVideoWatched = function() {
			var data = {category: 'Ĺ˝e pogledano', itemId: $this.options.mediaId};
			$visitor.bookmarks().itemRemove(data);
		}

		/**
		 * function for video state shows or hides play and pause buttons
		 * 
		 * @param time (String) 
		 * @return void
		 */
		videojs_state = function(state) {
			$this.options.state = state;

			if(state == "playing") {
				$this.options.pauseBtn.show();
				$this.options.playBtn.hide();
			}
			else if(state == "stopped" && $this.options.isFullScreen && (!$this.options.browser || ($this.options.browser && $this.options.browser > 10)) ) {
				//alert("tst");
				$this.fullScreenToggle(false, $this.options.elementId);
				$this.options.pauseBtn.hide();
				$this.options.playBtn.show();
			}
			else {
				$this.options.pauseBtn.hide();
				$this.options.playBtn.show();
			}
		}

		/**
		 * function for volume
		 * 
		 * @param volume (Object) 
		 * @return void
		 */
		videojs_volume = function(volume) {
			$this.options.volume = volume.volume;
		}

		/**
		 * function for video quality
		 * 
		 * @param quality (int) 
		 * @return void
		 */
		videojs_quality = function(quality) {
			var qualityString;

			switch(quality) {
				case 0:
					qualityString = "low";
					break;
				case 1:
					qualityString = "high";
					break;
				case 2:
					qualityString = "hd";
					break;
				case -1:
					qualityString = "auto";
					break;
				default:
					qualityString = "low";
			}

			$this.element.find("#" + $this.options.qualityContentId + " a").removeClass("active");
			$this.element.find("#" + $this.options.qualityContentId + " a." + qualityString).addClass("active");
		}

		/**
		 * function checking broser
		 *
		 * @return object
		 */
		$this.checkIE = function() {
			var myNav = navigator.userAgent.toLowerCase();

			return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
		}

		// INITIALIZE PLUGIN
		// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
		$this.init(element, options);
	}

	var self = this;
	self.defaults = {
		volume 			: 0, 
		seekPosition		: 0
	};
	self.options = {};
	
	var methods = {
		init: function(options) {
			var settings = $.extend({
				elementId 		: $(this).attr("id"),

				playLiveBtn      	: $(this).find(".play-live"),
				playBtn      		: $(this).find(".play"),
				pauseBtn     		: $(this).find(".pause"),
				fullScreenBtn		: $(this).find("#full-screen"),
				normalScreenBtn		: $(this).find("#normal-screen"),
				shareBtn 		: $(this).find("#share"),
				rateBtn 		: $(this).find("#rate"),
				qualityBtn 		: $(this).find("#quality"),
				volumeBtn		: $(this).find("#volume"),

				progressBarClick	: $(this).find(".video-progress .progress-click"),
				progressBar		: $(this).find(".video-progress .progress-bar"),
				playhead 		: $(this).find(".video-progress .playhead"),
				timePassed		: $(this).find(".video-progress .time"),
				duration		: $(this).find(".video-progress .duration"),
				tag 			: $(this).find(".video-progress .tag"),

				volumePopoverContent	: $(this).find(".popups #volume-content"),
				sharePopoverContent	: $(this).find(".popups #share-content"),
				ratePopoverContent	: $(this).find(".popups #rate-content"),
				qualityPopoverContent	: $(this).find(".popups #quality-content"),
				popoverClass		: "popover-btn",

				volumePopoverDynamicId 	: "popover-volume",
				volumePopoverDynamicClass: "popover-volume",
				sharePopoverDynamicId 	: "popover-share",
				qualityPopoverDynamicId	: "popover-quality",

				volumeBarClickId	: "progress-click",
				volumeBarId 		: "progress-bar",
				volumeUpClass		: "glyphicon-volume-up",
				volumeMuteClass		: "glyphicon-volume-off",
				volumeText		: "Glasnost",
				volumeMuteText 		: "Tiho",

				qualityContentId 	: "video-quality",
				rateStars			: "rate-stars",

				showThumbnails		: false,
				thumbnailsDir		: "",
				progressThumb		: $(this).find(".progress-thumb"),
				videoTags			: [],

				timer 			: false,
				fadeInBuffer		: false,

				isFullScreen		: false,

				isLive			: false,
				isTimeShift		: false,
				mediaId			: null,
				thumbnail		: null,
				title			: null

			}, options);

			settings = $.extend(self.options, self.defaults, settings);

			return this.each(function() 
			{
				var videoPlugin = new $.videoPlugin($(this), settings);
			});
		},
		update: function(options) {			
			// self.options = $.extend(self.options, options);

			// videoPlugin.toggleVolumeMute();
		}
	}

	$.fn.videoPlugin = function(method, options) 
	{
		// Method calling logic
		if ( methods[method] ) {
			return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.tooltip' );
		}    
	};

}(jQuery));
