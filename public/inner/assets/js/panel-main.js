$(document).ready(function() {
	var loadingBlock = '<div class="loader-wrapper" id="panel-loader-wrapper"><div class="loader-container"><div class="ball-grid-pulse loader-primary"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div> Loading...</div></div>';
	//open the modal
	$(document).on('click', '.cd-btn', function (event) {
		event.preventDefault();
		$('.cd-panel').addClass('is-visible');
		fetchData($(this), loadingBlock, '#modal-container', '#modal-title');
	});
	
	//open the slide panel
	$(document).on('click', '.slide-btn', function (event) {
		event.preventDefault();
		//$('.cd-panel').addClass('is-visible');
		fetchData($(this), loadingBlock, '#slide-container', '#slide-title');
	});

	//clode the lateral panel
	$('.cd-panel').on('click', function(event){
		if( $(event.target).is('.cd-panel') || $(event.target).is('.cd-panel-close') ) { 
			$('.cd-panel').removeClass('is-visible');
			event.preventDefault();
		}
	});
	
	$(document).on('submit', '.bb-form', function (e) {
		fetchData($(this), loadingBlock, '#modal-container', '#modal-title');
		// stop the form from submitting the normal way and refreshing the page
		e.preventDefault();
	});
	
	$(document).on('submit', '.popup-form', function (e) {
		fetchData($(this), '', '#modal-container', '#modal-title');
		// stop the form from submitting the normal way and refreshing the page
		e.preventDefault();
	});
	
	$(document).on('submit', '.page-form', function (e) {
		fetchData($(this), '', '.content-holder', '');
		// stop the form from submitting the normal way and refreshing the page
		e.preventDefault();
	});
	
	$('.login-submit').on('click', function (e) {
		var destination = $($(this).data('destination'));
		console.log("destination", destination)
		if (destination) {
			$(destination).LoadingOverlay("show");
		} else {
			$.LoadingOverlay("show");
		}
		$('#login-form').submit();
		e.preventDefault();
	});
	
	$('.login-submit-btn').on('click', function (e) {
		$.LoadingOverlay("show", {
			image       : "<svg class=\"sg-loader is-large\"><rect class=\"logo-square bottom-left\" width=\"20\" height=\"20\" /><rect class=\"logo-square bottom-middle\" width=\"20\" height=\"20\" /><rect class=\"logo-square middle\" width=\"20\" height=\"20\" /><rect class=\"logo-square top-middle\" width=\"20\" height=\"20\" /><rect class=\"logo-square top-right\" width=\"20\" height=\"20\" /><rect class=\"logo-square middle-left\" width=\"20\" height=\"20\" /><rect class=\"logo-square middle-right\" width=\"20\" height=\"20\" /></svg>",
			imageAnimation : "0ms",
			imageColor : "",
			background : "rgba(255, 255, 255, 0.9)"  
		});
	});

	function fetchData(currentObj, loadingBlock, container, titleContainer) {
		//console.info('fetchData');
		var url = currentObj.data("url");
		//console.info('url = ', url);
		var data = {};
		var formSubmit = currentObj.data("form");
        var formType = currentObj.data("formtype");
        var size = currentObj.data("size");
        var title = currentObj.data("title");
        var destination = container;
        if(loadingBlock) {
			$(destination).html('');
			//$(destination).html(loadingBlock);
			// $.LoadingOverlay("show", {
			// 	image       : "<svg class=\"sg-loader is-large\"><rect class=\"logo-square bottom-left\" width=\"20\" height=\"20\" /><rect class=\"logo-square bottom-middle\" width=\"20\" height=\"20\" /><rect class=\"logo-square middle\" width=\"20\" height=\"20\" /><rect class=\"logo-square top-middle\" width=\"20\" height=\"20\" /><rect class=\"logo-square top-right\" width=\"20\" height=\"20\" /><rect class=\"logo-square middle-left\" width=\"20\" height=\"20\" /><rect class=\"logo-square middle-right\" width=\"20\" height=\"20\" /></svg>",
			// 	imageAnimation : "0ms",
			// 	imageColor : "",
			// 	background : "rgba(255, 255, 255, 0.9)"  
			// });
		}
		
        var boardId = currentObj.data("boardid");
        var roundId = currentObj.data("roundid");
        var stageId = currentObj.data("stageid");
        var gameId = currentObj.data("gameid");
        var totalrounds = currentObj.data("totalrounds");
        var boardstart = currentObj.data("boardstart");
        var boardend = currentObj.data("boardend");

        if(size) {
        	$('.modal-dialog').addClass(size);
        }
        
        $(titleContainer).html(title);
        if (formSubmit) {
            var formElement = currentObj.closest('form');
            data = $(formElement).serialize();
        }
        var type = currentObj.data("method");
		console.info('url = ', url);
		console.info('type = ', type);
		console.info('data = ', data);
        $.ajax({
            url: url,
            data: data,
            type: type,
            error: function (err) {
				console.info(err);
            },
            success: function (data) {
            	$(destination).html(data);
            	//$(destination).LoadingOverlay("hide");
            }
		});
	}
	
	$(document.body).on('blur', '#buy-electrum', function () {
		var value = $(this).val();
		if (value > 0) {
			var usd = value * 2.5;
			var actualUSD = usd + parseFloat(usd) * 0.03;
			
			var ops = {};
			ops.value = actualUSD;
			ops.usd = usd;
			getData(ops)
			$('#buy-usd').val(usd);
			$('#usd-rate').html(usd);
		}
	});
	
	$(document.body).on('blur', '#buy-usd', function () {
		var value = $(this).val();
		
		if (value > 0) {
			var usd = value;
			var increament = parseFloat(usd) * 0.03;
			var actualUSD = parseFloat(usd) + parseFloat(increament);
			var ops = {};
			ops.value = actualUSD;
			ops.usd = usd;
			getData(ops)
			$('#buy-electrum').val(value / 2.5);
		}
	});
	
	function getData(ops) {
		$.ajax({
            url: "https://blockchain.info/tobtc?currency=USD&value=" + ops.value,
            data: '',
            processData: false,
            type: 'GET',
            error: function (err) {
                //console.info('err = ', err);
            },
            success: function (data) {
            	$('#buy-bitcoin').val(data);
            }
		});
	}
	
	function getCryptoCurrencyStatus() {
		var url = 'https://api.coinmarketcap.com/v1/ticker/?convert=USD&limit=25';
		$.ajax({
            url: url,
            processData: false,
            type: 'GET',
            dataType: 'jsonp',
            error: function (err) {
                //console.info('err = ', err);
            },
            success: function (data) {
            	return data;
            }
		});
	}

	$(document.body).on('click', '#referral-link-copy', function (e) {
		  var copyText = $("#referral-link");
		  copyText.select();
		  document.execCommand("Copy");
		  alert("Copied the text: " + copyText.val());
	});
	
	$('.page-loading').on('click', function (e) {
		var destination = $($(this).data('destination'));
		if (destination) {
			$(destination).LoadingOverlay("show");
		} else {
			$.LoadingOverlay("show");
		}
    });

	$('ul.navigation-main li.nav-item-link').click(function(e)  { 
		var options = {};
		options.image = "test";
		console.info('options = ', options);
		$('.content-holder').LoadingOverlay("show", {
			image       : "<svg class=\"sg-loader is-large\"><rect class=\"logo-square bottom-left\" width=\"20\" height=\"20\" /><rect class=\"logo-square bottom-middle\" width=\"20\" height=\"20\" /><rect class=\"logo-square middle\" width=\"20\" height=\"20\" /><rect class=\"logo-square top-middle\" width=\"20\" height=\"20\" /><rect class=\"logo-square top-right\" width=\"20\" height=\"20\" /><rect class=\"logo-square middle-left\" width=\"20\" height=\"20\" /><rect class=\"logo-square middle-right\" width=\"20\" height=\"20\" /></svg>",
			imageAnimation : "0ms",
			imageColor : "",
			background : "rgba(255, 255, 255, 0.9)"  
		});
	});
	// Side menu click method
	/*$('ul.navigation-main li.nav-item-link').click(function(e)  { 
		//console.info('content loading');
		//$('.content-holder').LoadingOverlay("show");
		//console.info('ul.navigation-main called');
		var url = $(this).data('url');
		var parent = $(this).data('parent');
		//$(this).addClass('active');
		var self = $(this);

		var navLinks = $('#main-menu-navigation').find('.nav-item-link');
		for (i = 0; i < navLinks.length; i++) {
			var li = $(navLinks[i]);
			if (li.is(".menu-left__item--active")) {
				li.removeClass('menu-left__item--active');
			}
		}
		
		var navItems = $('#main-menu-navigation').find('.nav-item');
		for (i = 0; i < navItems.length; i++) {
			var li = $(navItems[i]);
			if (li.is(".menu-left__item--active")) {
				li.removeClass('menu-left__item--active');
			}
		}
		if (url) {
			 $.ajax({
		            url: url,
		            type: 'GET',
		            processData: false,
		            error: function (err) {
		                //console.info('err = ', err);
		            },
		            success: function (data) {
		            	var currentBreakpoint = Unison.fetch.now();
		            	var sm = window.getComputedStyle(document.documentElement).getPropertyValue('--breakpoint-sm');
		            	var xs = window.getComputedStyle(document.documentElement).getPropertyValue('--breakpoint-xs');
		            	
		            	//if(currentBreakpoint.name == 'sm' || currentBreakpoint.name == 'xs') {
			            	//$.app.menu.collapse();
			            	//$.app.menu.reset();
			            	//$('.vertical-layout').addClass('menu-hide');
			            	//$.app.menu.hide();
		            	if ($('body').width() < 768) {
		            		$( ".menu-left__action--menu-toggle" ).trigger( "click" );
		            	}
		            	//}
		            	
						//$( ".menu-left__action--menu-toggle" ).trigger( "click" );
						//console.info('parent = ', parent);
		            	if (parent) {
		            		
		            		$('#' + parent).addClass('active');
		            	} else {
		            		self.addClass('active');
						}
						//console.info('content holder = ', $('.content-holder'));
		            	$('.content-holder').html(data);
		            	//$('.content-holder').LoadingOverlay("hide");
		            }
				});
		}
	});*/

	// $(document).on('click', 'nav-item', function (e) {
	// 	var url = $(this).data('url');
	// 	//console.info('panel-main nav-item url = ', url);

	// 	if (url) {
	// 		 $.ajax({
	// 	            url: url,
	// 	            type: 'GET',
	// 	            processData: false,
	// 	            type: type,
	// 	            error: function (err) {
	// 	                //console.info('err = ', err);
	// 	            },
	// 	            success: function (data) {
	// 	            	$('.content-holder').html(data);
	// 	            }
	// 			});
	// 	}
	// });
});