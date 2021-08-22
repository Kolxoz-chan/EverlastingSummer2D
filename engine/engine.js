/* Game class */
class Game
{

	/* Arrays */
	static entities = [];
	static widgets = [];

	/* Dicts */
	static widgets_named = {};
	static entities_named = {};

	/* Objsect */
	static context = null;
	static canvas = null;
	static block = null;

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
		/* Init canvas*/
		Game.canvas = document.createElement("canvas");
		Game.context = Game.canvas.getContext("2d");
		Game.block = document.getElementById(id);
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
			if(Game.sittings.resizable)
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
		if(obj.name) Game.entities_named[obj.name] = obj;
		Game.entities.push(obj);
		obj.reset();
		obj.init();
	}

	static resetCursor()
	{
		Game.setCursor(Game.default_cursor)
	}

	static setCursor(name)
	{
		Game.canvas.style.cursor = name
	}

	static setSize(size)
	{
		Game.canvas.width = size.x;
		Game.canvas.height = size.y;
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
	}

	static start()
	{
		if(Game.state != GAME_START)
		{
			Game.state = GAME_START;
			setTimeout(() => {Game.loop()}, 1000 / Game.settings.fps);
		}
	}

	static stop()
	{
		Game.state = GAME_STOP;
	}

	static pause()
	{
		Game.state = GAME_PAUSE;
	}

	static loop()
	{
		if(Game.state == GAME_START)
		{
			Time.update()
			Input.update()
			Game.update()

			setTimeout(() => {Game.loop()}, 1000 / Game.settings.fps);
		}
	}

	static update()
	{
		Game.context.clearRect(0, 0, Game.canvas.width, Game.canvas.height);

		for(let i in Game.entities)
		{
			if(Game.entities[i].isEnabled()) Game.entities[i].update()
		}

		for(let i in Game.widgets)
		{
			if(Game.widgets[i].isEnabled()) Game.widgets[i].update()
		}
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
	static position = new Vector2(0, 0);
	static angle = 0;
	static zoom = 1.0

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
		Camera.position = point;
	}

	static setCenter(point)
	{
		let size = Camera.getSize();
		Camera.setPosition(new Vector2(point.x - size.x / 2, point.y - size.y / 2))
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
		return new Vector2(Game.canvas.width, Game.canvas.height)
	}
}

/* Resources class */
class Resources
{
	static onLoad = null

	static textures = {}
	static prefabs = {}
	static sounds = {}

	static loading_counter = 0;
	static textures_dir = "";
	static sounds_dir = ""

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

	static loadTexture(name, src, relative=true)
	{
		Resources.loading_counter++;
		Resources.textures[name] = new Image()
		if(relative) src = Resources.textures_dir + src;
		Resources.textures[name].src = src
	}

	static loadAudio(name, src)
	{
		Resources.sounds[name] = new Audio(Resources.sounds_dir + src);
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
	    xhr.send();
	}

	static addPrefab(asset)
	{
		Resources.prefabs[asset.name] = asset;
		return asset;
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
