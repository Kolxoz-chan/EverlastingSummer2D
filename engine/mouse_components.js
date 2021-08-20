class MouseComponent extends ComponentBase
{
	key = 0
	global_cursor = true;
	is_pressed = false
	position = new Vector2(0, 0)
	
	//onClick
	//onMove
	//onPress
	//onRelease
	
	getCursore()
	{
		return this.global_cursor ? Input.getGlobalMouse() : Input.getLocalMouse();
	}

	isPressed()
	{
		return this.is_pressed;
	}
	
	update()
	{
		let last_position = Object.copy(this.position)
		this.position = this.getCursore()
		
		// On move
		if(!last_position.equals(this.position) && this.onMove) 
		{
			this.onMove(last_position, this.position)
		}
		
		// On click
		if(Input.isMouseClicked(this.key))
		{
			if(this.onClick) this.onClick(this.position)
		}
	
		// On press
		if(Input.isMousePressed(this.key))
		{
			this.is_pressed = true
			if(this.onPress) this.onPress(this.position)
		}
	
		// On release
		else if(this.is_pressed)
		{
			this.is_pressed = false
			if(this.onRelease) this.onRelease(this.position)
		}
	}
}

/* Clickable component */
class ClickableComponent extends MouseComponent
{	
	//action = null

	init()
	{
		this.join("ColiderComponent")
	}
	
	onClick(position)
	{
		let colider = this.joined["ColiderComponent"];
		if(colider)
		{
			if(this.action && colider.isEnabled())
			{	
				if(colider.isContained(position)) this.action();
			}
		}
	}
}

/* MouseSelectComponent */
class MouseSelectComponent extends MouseComponent
{	
	selector = SELECTOR_ALL
	container = null
	// action = null
	// miss = null

	onClick(position)
	{
		if(this.container)
		{
			let layer = Game.current_level.getLayer(this.container)
			if(layer.isEnabled())
			{
				let obj = null;
				let is_miss = true;
				
				for(let i=0; i<layer.entities.length; i++)
				{
					let colider = null;
					obj = colider.objects[i]
					
					if(obj.hasComponent("ColiderComponent"))
					{
						colider = obj.getComponent("ColiderComponent");
						if(colider.isContained(position))
						{
							is_miss = false
							if(this.selector != SELECTOR_LAST) this.action(obj);
							if(this.selector == SELECTOR_FIRST) break;
						}
					}
					else obj = null;
				}
				if(this.selector == SELECTOR_LAST && obj) this.action(obj);
				if(this.miss && is_miss) this.miss()
			}
		}
	}
}

/* MouseCreateComponent */
class MouseCreateComponent extends MouseComponent
{	
	container = null
	prefab = null
	data = {}

	onClick(position)
	{
		if(this.container && this.prefab)
		{
			let layer = Game.current_level.getLayer(this.container)
			let prefab = Resources.getPrefab(this.prefab)
			layer.addObject(prefab.getEntity(prefab, this.data))
		}
	}
}

/* Damage clickable component */
class AttributeChangeClickComponent extends MouseSelectComponent
{	
	value = 1;
	attribute = null;
	
	action(obj)
	{
		if(this.attribute)
		{
			if(obj.hasComponent(this.attribute)) 
			{
				let life = obj.getComponent(this.attribute);
				if(life)
				{
					if(!life.isZero()) life.addValue(this.value);
				}
			}
		}
	}
}

/* Damage clickable component */
class AttributeMoveClickComponent extends MouseSelectComponent
{	
	default_value = 0
	object_attribute = null
	subject_attribute = null

	init()
	{
		this.join("ScoreComponent")
	}
	
	action(obj)
	{	
		let value = obj.getComponent("ScoreComponent").getValue();
		this.joined[this.subject_attribute].addValue(value)
	}
	
	miss()
	{
		let score = this.joined[this.subject_attribute];
		score.addValue(this.default_value)
	}
}

/* Damage clickable component */
class SoundClickComponent extends MouseSelectComponent
{	
	default_sound = null;

	action(obj)
	{	
		if(this.default_sound)
		{
			let audio = Resources.getAudio(this.default_sound)
			audio.currentTime=0;
			audio.play();
		}
	
		if(obj.hasComponent("SoundComponent"))
		{
			obj.getComponent("SoundComponent").play();
		}
	}
	
	miss()
	{
		if(this.miss_sound)
		{
			let audio = Resources.getAudio(this.default_sound)
			audio.currentTime=0;
			audio.play();
		}
	}
}

/* Cursore camera component */
class CursoreWatcherComponent extends ComponentBase
{
	init()
	{
		this.join("TransformComponent")
	}

	update()
	{
		let transform = this.joined["TransformComponent"];
		let offset = transform ? transform.getPosition() : new Vector2(0, 0);
		Camera.setCenter(Input.getLocalMouse().add(offset))
	}
}

/* Mouse Watcher Component */
class MouseWatcherComponent extends ComponentBase
{
	init()
	{
		this.join("TransformComponent")
	}

	update()
	{
		let self_component = this.joined["TransformComponent"]
		self_component.rotate_at(Input.getGlobalMouse())
	}
}