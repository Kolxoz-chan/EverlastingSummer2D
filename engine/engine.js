/* Game class */
class Game
{
	/* Arrays */
	static entities = [];
	static widgets = [];
	static tasks = [];

	/* Dicts */
	static widgets_named = {};
	static entities_named = {};
	static memory = {};

	/* Objsect */
	static current_entity = null
	static offscreen = null
	static context = null;
	static canvas = null;
	static block = null;
	static gui = null

	/* Game state */
	static state = NULL;

	/* Settings */
	static settings =
	{
		"resizable" : false,
		"fps" : 60,
		"default_cursor" : "auto",
		"size" : new Vector2(640, 480),
		"style" : ""
	}

	/* Public methods */
	static init(id)
	{
		window.onerror = function(message, url, line, col) 
		{
		  alert(`${message}\n${url}, ${line}:${col}`);
		};

		/* Init canvas*/
		Game.canvas = document.createElement("canvas");
		Game.context = Game.canvas.getContext("2d");
		Game.gui = document.createElement("div");

		Game.canvas.offscreen = document.createElement("canvas");
		Game.offscreen = Game.canvas.offscreen.getContext("2d");
		Game.gui.style.position = "absolute";
		Game.gui.style.width = "100%"
		Game.gui.style.height = "100%"

		Game.block = document.getElementById(id);
		Game.block.oncontextmenu = function(){return false}
		Game.block.appendChild(Game.gui);
		Game.block.appendChild(Game.canvas);
	}

	static resetSettings()
	{
		Game.setSize(Game.settings.size)
		Game.canvas.style = Game.settings.style
		Game.canvas.style.cursor = Game.settings.default_cursor
	}

	static setEventHandlers(arr)
	{
		for(var i in arr)
		{
			document.body.addEventListener(arr[i], Input.handleEvent);
		}
	}

	static setFullScreen(value)
	{
		if(value)
		{
			Game.canvas.requestFullscreen();
			if(Game.settings.resizable)
			{
				Game.setSize(Game.getMaxSize())
			}
		}
		else document.requestFullscreen();
	}

	static isFullScreen()
	{
		return document.fullscreenElement != null;
	}

	static addEntity(obj)
	{
		this.current_entity = obj
		if(obj.name) Game.entities_named[obj.name] = obj;
		Game.entities.push(obj);
		obj.reset();
		obj.init();

		return obj;
	}

	static addTask(func)
	{
		this.tasks.push(func)
	}

	static resetCursor()
	{
		Game.setCursor(Game.default_cursor)
	}

	static resetOffscreen(size)
	{
		Game.canvas.offscreen.width = size.x
		Game.canvas.offscreen.height = size.y
	}

	static setCursor(name)
	{
		Game.canvas.style.cursor = name
	}

	static setSize(size)
	{
		Game.canvas.width = size.x;
		Game.canvas.height = size.y;
		Camera.setSize(size)
	}

	static getObject(name)
	{
		if(Game.entities_named[name]) return Game.entities_named[name];
		else console.log("WARNING. There is no object named '" + name + "'")
	}

	static getMaxSize()
	{
		return new Vector2(window.screen.width, window.screen.height)
	}

	static addWidget(widget)
	{
		this.widgets.push(widget)
		this.widgets_named[widget.name] = widget
		Game.gui.appendChild(widget.getWidget())
	}

	static start()
	{
		if(Game.state != GAME_START)
		{
			Game.state = GAME_START;
			requestAnimationFrame(Game.loop);
		}
	}

	static stop()
	{
		Game.state = GAME_STOP;
	}

	static loop()
	{
		try
		{
			if(Game.state == GAME_START)
			{
				Time.update()
				Input.update()

				// Update tasks
				if(Game.tasks.length > 0)
				{
					for(let i in Game.tasks)
					{
						Game.tasks[i]();
					}
					Game.tasks = []
				}

				Game.update()
				Camera.update()

				requestAnimationFrame(Game.loop);
			}
		}
		catch(error)
		{
			alert(error.stack)
		}
	}

	static update()
	{
		Game.canvas.width = Game.canvas.width;

		Game.entities.forEach(function(item)
		{
			if(item.isEnabled()) item.update()
		})
	}
}

/* Time class */
class Time
{
	static date = new Date();
	static delta_time = 0;

	static update()
	{
		let time = Time.date.getTime()
		Time.date = new Date();
		Time.delta_time = (Time.date.getTime() - time) / 1000;
	}
}

/* Camera class */
class Camera
{
	static size = new Vector2(0, 0);
	static position = new Vector2(0, 0);
	static angle = 0;
	static zoom = 1.0;
	static updated = false;
	static data = {}

	static update()
	{
		if(Camera.updated)
		{
			for(let i in Camera.data)
			{
				Camera[i] = Camera.data[i]
			}
			Camera.data = {}
			Camera.updated = false;
		}
	}

	static getCenter()
	{
		let pos = Camera.getPosition();
		let size = Camera.getSize();

		return new Vector2(pos.x + size.x / 2, pos.y + size.y / 2)
	}

	static getPosition()
	{
		return Camera.position;
	}

	static setPosition(point)
	{
		Camera.data.position = new Vector2(point.x, point.y)
		Camera.updated = true;
	}

	static setCenter(point)
	{
		let size = Camera.getSize();
		Camera.setPosition(new Vector2(point.x - size.x / 2, point.y - size.y / 2))
	}

	static setSize(vec)
	{
		Camera.data.size = vec;
	}


	static apply_transform()
	{
		if(Game.context)
		{
			let center = Camera.getCenter()
			let size = Camera.getSize();
			Game.context.translate(-center.x + size.x / 2, -center.y + size.y / 2)
		}
	}

	static getSize()
	{
		return Camera.size;
	}

	static getRect()
	{
		return new Rect(this.position.x, this.position.y, Game.canvas.width, Game.canvas.height)
	}
}

/* Resources class */
class Resources
{
	static onLoad = null

	static textures = {}
	static bitmaps = {}
	static prefabs = {}
	static sounds = {}

	static loading_counter = 0;
	static resources_dir = ""
	static textures_dir = "";
	static sounds_dir = ""
	static fonts_dir = ""
	static game_dir = ""

	static isLoaded()
	{
		return Resources.loading_counter <= 0;
	}

	static loadAll()
	{
		Resources.loadResource(Resources.textures, (src) =>
		{
			let img = new Image()
			img.src = src;
			return img;
		})
	}

	static loadModule(src)
	{
		let script = document.createElement("script")
		script.src = Resources.game_dir + src;
		document.head.appendChild(script)
	}

	static loadResource(arr, func)
	{
		for(let i in arr)
		{
			let obj = func(arr[i]);
			obj.src = arr[i]
			arr[i] = obj

			arr[i].onload = () =>
			{
				Resources.loading_counter--;
				if(Resources.isLoaded() && Resources.onLoad) Resources.onLoad()
			}

			arr[i].onerror = () =>
			{
				Resources.loading_counter--;
				console.log("ERROR. " + obj.constructor.name + " '" + i + "' is not loaded!")
				if(Resources.loading_counter <= 0 && Resources.onLoad) Resources.onLoad()
			}
		}
	}

	static loadTexture(name, src, relative=true, func = null)
	{
		Resources.loading_counter++;
		Resources.textures[name] = new Image()
		Resources.textures[name].crossOrigin="anonymous"
		if(relative) src = Resources.textures_dir + src;
		Resources.textures[name].src = src
		if(func) Resources.textures[name].onload = func;
		Resources.textures[name].onerror = function()
		{
			alert("Image " + src + " not loaded!")
		}
	}

	static loadAudio(name, src)
	{
		Resources.sounds[name] = new Audio(Resources.sounds_dir + src);
	}

	static loadFont(name, src)
	{
		let font = document.createElement("style")
		font.innerHTML = "@font-face { font-family: " + name + "; src: url(" + Resources.fonts_dir + src + ");}"
		document.head.appendChild(font)
	}

	static loadByURL(url, type = "text", func = function() {})
	{
		var xhr = new XMLHttpRequest(url);
	    xhr.open('GET', url, true);
	    xhr.responseType = type
	    xhr.onload = function()
	    {
	        func(xhr.response)
	    }
	    xhr.onerror = function()
	    {
	    	alert("Resource " + url + " not loaded!")
	    }
	    xhr.send();
	}

	static addPrefab(asset)
	{
		Resources.prefabs[asset.name] = asset;
		return asset;
	}

	static addTexture(name, obj)
	{
		Resources.textures[name] = obj;
	}

	static getTexture(name)
	{
		return Resources.textures[name];
	}

	static getAudio(name)
	{
		return Resources.sounds[name];
	}

	static getPrefab(name)
	{
		return Resources.prefabs[name];
	}
}

/* Input handler class */
class Input
{
	static mouse_pos = new Vector2(0, 0);
	static mouse_pressed = {};
	static keyboard_pressed = {};
	static mouse_clicked_cur = {};
	static keyboard_clicked_cur = {};

	static update()
	{
		for(let key in Input.mouse_pressed)
		{
			if(Input.mouse_pressed[key] == false) delete Input.mouse_clicked_cur[key]
			else if(Input.mouse_clicked_cur[key] == undefined) Input.mouse_clicked_cur[key] = true
			else Input.mouse_clicked_cur[key] = false;
		}
		for(let key in Input.keyboard_pressed)
		{
			if(Input.keyboard_pressed[key] == false) delete Input.keyboard_clicked_cur[key]
			else if(Input.keyboard_clicked_cur[key] == undefined) Input.keyboard_clicked_cur[key] = true
			else Input.keyboard_clicked_cur[key] = false;
		}
	}

	static handleEvent(event)
	{
		//console.log(event.type)
		if(event.type == "mousemove")
		{
			Input.mouse_pos = new Vector2(event.clientX-Game.canvas.offsetLeft,event.clientY-Game.canvas.offsetTop);
		}
		else if(event.type == "keydown")
		{
			Input.keyboard_pressed[event.code] = true;
		}
		else if(event.type == "keyup")
		{
			Input.keyboard_pressed[event.code] = false;
		}
		else if(event.type == "mousedown")
		{
			Input.mouse_pressed[event.button] = true;
		}
		else if(event.type == "mouseup")
		{
			Input.mouse_pressed[event.button] = false;
		}
		//console.log(Input.mouse_pressed)
	}

	static getGlobalMouse()
	{
		let point = Camera.getPosition()
		return new Vector2(Input.mouse_pos.x + point.x, Input.mouse_pos.y + point.y);
	}

	static getLocalMouse()
	{
		return new Vector2(Input.mouse_pos.x, Input.mouse_pos.y);
	}

	static isMousePressed(button)
	{
		return Input.mouse_clicked_cur[button] != undefined;
	}

	static isMouseClicked(button)
	{
		return Input.mouse_clicked_cur[button] == true;
	}

	static isKeyPressed(button)
	{
		return Input.keyboard_clicked_cur[button] != undefined;
	}

	static isKeyClicked(button)
	{
		return Input.keyboard_clicked_cur[button] == true;
	}

	static isKeysPressed(arr, and=false)
	{
		let result = false;
		if(arr.length > 0)
		{
			result = Input.isKeyPressed(arr[0]);

			for(let i = 1; i<arr.length; i++)
			{
				if(and) result = Input.isKeyPressed(arr[i]) && result;
				else result = Input.isKeyPressed(arr[i]) || result;
			}
		}
		return result;
	}
}
