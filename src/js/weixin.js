App = {
	init: function(){
		App.gui = require('nw.gui');
		App.win = App.gui.Window.get();		
		App.Tray.init();
		App.Frame.init();
		App.Notify.init();
	},
	load: function(){
		weixin.frameElement.onload = function(){
			App.Frame.done();
			weixin.onbeforeunload = null;
			App.src = weixin.location.origin;
			console.log('weixin loaded on ' + App.src);			
			$(App.notify.window.message).click(App.show);
			$(App.notify.window.pass).click(App.Notify.close);
			$(weixin.chat_chatmsglist).add(App.notify.window.message).on('click', 'a', function(){
				App.gui.Shell.openExternal(this.href);
				return false;
			});		
			var trigger = weixin.WebMM.triggerEvent;
			weixin.WebMM.triggerEvent = function(type, data, range){
				trigger(type, data, range);
				switch(type){
					case 'messageAdded':
						App.Notify.show(data);
						break;
					case 'windowFocus':
						App.Notify.stop();
						App.isBlurred = false;
						break;
					case 'windowBlur':
						App.isBlurred = true;
						break;			
				}
			};			
		};		
		weixin.frameElement.src = App.src;
	},
	show: function(){
		App.Notify.click();
		App.notify.close();
		App.Tray.stop();
		App.win.setAlwaysOnTop(true);
		App.win.show();
		App.isHidden = false;
		App.win.setAlwaysOnTop(false);
	},
	hide: function(){
		App.win.hide();
		App.isHidden = true;
	},
	src: 'https://wx.qq.com',
	name: '微信桌面版',
	isBlurred: true
}
App.Notify = {
	init: function(){
		App.notify = App.gui.Window.open('notify.html', {						
			'width': 380,
			'height': 300,
			'show': false,
			'frame': false,
			'toolbar': false,
			'resizable': false,
			'always-on-top': true,
			'show_in_taskbar': false,
			'icon': 'images/favicon.png'		
		});
		App.notify.on('close', function(){
    		this.hide();	
		});
	},
	show: function(message){
		console.log(message);
		if(!message.isSend && message.MsgType!=10000 && !weixin.WebMM.model("contact").getContact(message.FromUserName).isMuted()){			
			if(App.isHidden){
				App.Notify.from = message.FromUserName;
				App.Tray.notify(message.FromUserName, App.src + message.avatar);			
				if(App.Notify.enabled){
					clearTimeout(App.Notify.close);									
					$(App.notify.window.from).html(message.avatarTitle);
					$(App.notify.window.message).html(weixin.jQuery.tmpl('chat_chatmsglist', [message]).replace(/(on[a-z]+=")/g, '$1opener.weixin.').replace(/(src|href)="(?!http)/g, '$1="' + App.src));					
					App.notify.height = $(App.notify.window.document).find('.chatItem').outerHeight(true) + (message.MsgType == 3 ? 140 : 100);
					App.notify.moveTo(screen.availWidth - App.notify.width, screen.availHeight - App.notify.height);
					App.notify.title = message.avatarTitle;
					App.notify.setAlwaysOnTop(true);
					App.notify.show();
					App.Notify.close = setTimeout(function(){
						App.notify.close();
					}, 10000);
				}
			}else if(App.isBlurred){
				App.Notify.play(message.avatarTitle + '(' + weixin.WebMM.model("message").getUnreadMsgsCount(message.FromUserName) + ')');
			}
		}
	},
	click: function(){
		if(App.Notify.from){
			$(weixin.document).find('#conversationContainer > [username="'+ App.Notify.from +'"]').click();
			App.Notify.from = false;
		}
	},
	play: function(from){
		var start = 0;
		App.Notify.stop();
		App.Notify.player = setInterval(function(){
			if(start == from.length){
				start = 0;
				App.win.title = '　';
			}else{
				App.win.title = from.substr(start++);
			}
		}, 350);
	},
	stop: function(){
		clearInterval(App.Notify.player);
		App.win.title = App.name;
	},
	close: function(){
		App.notify.close();
	},
	enabled: localStorage.notify != "disabled"
}
App.Frame = {
	init: function() {
		App.win.on('maximize', function(){
			$('#maximize').hide();
			$('#unmaximize').css('display', 'inline-block');
		});
		App.win.on('unmaximize', function(){
			$('#unmaximize').hide();
			$('#maximize').show();
		});
		$('#minimize').click(function(){			
			App.win.minimize();
		});		
		$('#maximize').click(function(){
			App.win.maximize();
		});		
		$('#unmaximize').hover(function(){
			this.style.backgroundPosition = '0 -144px';
		}, function(){
			this.style.backgroundPosition = '0 -48px';
		}).mousedown(function(){
			this.style.backgroundPosition = '0 -240px';
		}).mouseup(function(){
			this.style.backgroundPosition = '0 -48px';
		}).click(function(){
			App.win.unmaximize();
		});
		$('#close').hover(function(){
			this.style.backgroundPosition = '0 -96px';
		}, function(){
			this.style.backgroundPosition = '0 0';
		}).mousedown(function(){
			this.style.backgroundPosition = '0 -192px';
		}).mouseup(function(){
			this.style.backgroundPosition = '0 0';
		}).click(function(){
			App.hide();
		});
		App.Frame.checker = setInterval(function(){
			if($(weixin.document).find('#loginQrCode').height() > 100){
				App.Frame.done();
			}
		}, 500);
	},
	done: function(){
		if(chrome.style.background != 'none'){
			chrome.style.background = 'none';
			clearInterval(App.Frame.checker);			
			$(weixin).keydown(function(event){
				console.log(event.which);
				if(event.altKey){
					switch(event.which){
						case 81:
							$('#close').click();
							break;
						case 69:
							$('#minimize').click();
							break;
						case 65:
							$('#maximize').click();
							break;
						case 83:
							$('#unmaximize').click();
							break;
					}
					
				}
			});
			$('a.icon_faq', weixin.document).click(function(){
				App.gui.Shell.openExternal(this.href);
				return false;
			});
			$('#loading').fadeOut('slow', function(){
				$(this).remove();
			});
		}
	}
}
App.Tray = {
	init: function(){
		App.tray = new App.gui.Tray({'title': App.name, 'icon': App.Tray.icon});
		App.tray.on('click', function(){			
			App.show();
		});		
		var menu = new App.gui.Menu();
		menu.append(new App.gui.MenuItem({'type': 'checkbox', 'label': '消息弹出', 'checked':  App.Notify.enabled, 'click': function(){
			App.Notify.enabled = this.checked;
			localStorage.notify = this.checked ? "enabled" : "disabled";
		}})); 
		menu.append(new App.gui.MenuItem({'label': '退　出', 'click': function(){
			App.gui.App.quit();
		}}));		
		App.tray.menu = menu;		
	},
	notify: function(from, avatar){		
		var icon = App.Tray.avatars[from];
		if(icon){
			App.Tray.play(icon);
		}else{
			var img = document.createElement('img');
			img.onload = function(){
				icon = 'avatars/' + from + '.png';
				var canvas = document.createElement('canvas');
				var ctx = canvas.getContext("2d");
				canvas.width = 16;
				canvas.height = 16;		
				var oc = document.createElement('canvas'),
				octx = oc.getContext('2d');
				oc.width = img.width * 0.5;
				oc.height = img.height * 0.5;
				octx.drawImage(img, 0, 0, oc.width, oc.height);
				octx.drawImage(oc, 0, 0, oc.width * 0.5, oc.height * 0.5);
				ctx.drawImage(oc, 0, 0, oc.width * 0.5, oc.height * 0.5, 0, 0, canvas.width, canvas.height);		
				require('fs').writeFile(icon, canvas.toDataURL('image/png', 1).replace(/^data:image\/png;base64,/, ''), 'base64', function() {
					App.Tray.avatars[from] = icon;
					App.Tray.play(icon);
				});
			};
			img.src = avatar;
		}
	},
	play: function(icon){
		App.Tray.stop();
		App.tray.icon = App.Tray.blank;
		App.Tray.player = setInterval(function(){
			App.tray.icon = App.tray.icon == App.Tray.blank ? icon : App.Tray.blank;
		}, 500);
	},
	stop: function(){
		clearInterval(App.Tray.player);
		App.tray.icon = App.Tray.icon;
	},
	icon: 'images/favicon.png',	
	blank: 'images/blank.png',
	avatars: {}
}
App.init();