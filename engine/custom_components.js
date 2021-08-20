/* BackgroundColorComponent */
class BackgroundColorComponent extends ComponentBase
{
	background = null

	update()
	{
		if(this.background)
		{
			let size = Camera.getSize();
			
			if(this.background.constructor.name == "Gradient") Game.context.fillStyle = this.background.get(Camera.getSize());
			else Game.context.fillStyle = this.background;
			Game.context.fillRect(0, 0, size.x, size.y);
		}
	}
}

/* BackgroundColorComponent */
class ParalaxComponent extends ComponentBase
{
	static AXIS_X = 1 << 0;
	static AXIS_Y = 1 << 1;
	
	position = new Vector2(0.0, 0.0)
	coef = new Vector2(1.0, 1.0)
	repeating = 0
	image = null

	update()
	{
		if(this.image)
		{
			let pos = Camera.getPosition();
			let size = Camera.getSize();
			let img = Resources.getTexture(this.image)
			pos = new Vector2((size.x - img.width) * this.position.x - pos.x * this.coef.x, (size.y - img.height) * this.position.y - pos.y * this.coef.y)
			
			Game.context.drawImage(img, pos.x, pos.y, img.width, img.height);
		}
	}
}

/* Path Moving Component */
class PathMovingComponent extends ComponentBase
{
	path = [];
	speed = 50;
	current_point = 0;
	waiting = 0.0
	timer = 0.0

	init()
	{
		this.join("TransformComponent")
		this.timer = this.waiting
	}

	update()
	{
		let transform_component = this.joined["TransformComponent"]
		if(this.path.length)
		{
			let pos = transform_component.getPosition();
			let point = this.path[this.current_point];

			transform_component.move_to(point, this.speed * Time.delta_time)

			if(point.equals(pos))
			{
				this.timer -= Time.delta_time;
				if(this.timer <= 0)
				{
					this.timer = this.waiting
					this.current_point++;
				}
			}
			if(this.current_point >= this.path.length) this.current_point = 0;
		}
	}
}

/* Path Moving Component */
class BrownianMovingComponent extends ComponentBase
{
	speed = 50;

	init()
	{
		this.join("TransformComponent")
	}

	update()
	{
		let transform_component = this.joined["TransformComponent"]
		let vec = Vector2.random();
		transform_component.move(vec.mul(Time.delta_time * this.speed))
	}
}

/* Watcher Component */
class WatcherComponent extends ComponentBase
{
	target = null;

	init()
	{
		this.join("TransformComponent")
	}

	update()
	{
		if(this.target)
		{
			let obj = Game.getObject(this.target)
			let self_component = this.joined["TransformComponent"]
			let target_component = obj.getComponent("TransformComponent")
			self_component.rotate_at(target_component.getCenter())
		}
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

/* Round Moving Component */
class RoundMovingComponent extends ComponentBase
{
	speed = 50;
	axis = new Vector2(0, 0);

	init()
	{
		this.join("TransformComponent")
	}

	update()
	{
		let transform_component = this.joined["TransformComponent"]
		transform_component.move_around(this.axis, this.speed * Time.delta_time)
	}
}

class PursuerComponent extends ComponentBase
{
	speed = 50;
	target = null;
	min_radius = 0;
	middle_radius = 0;
	max_radius = 100;

	init()
	{
		this.join("TransformComponent")
	}

	update()
	{
		if(this.target)
		{
			let obj = Game.getObject(this.target)
			let target_transform = obj.getComponent("TransformComponent")

			if(target_transform)
			{
				let transform_component = this.joined["TransformComponent"];

				let self_pos = transform_component.getPosition();
				let target_pos = target_transform.getPosition();

				let speed = Time.delta_time * this.speed;
				let distance = self_pos.getDistance(target_pos)

				if(distance < this.min_radius) transform_component.move_to(target_pos, -speed)
				else if(distance < this.middle_radius) return;
				else if(distance < this.max_radius) transform_component.move_to(target_pos, speed)
			}
		}
	}
}

/* Respawn component */
class RespawnComponent extends ComponentBase
{
	time = 5.0;
	timer = undefined;
	position = undefined;

	init()
	{
		let transform = this.join("TransformComponent")
		this.join("LifeComponent")
		if(!this.position) this.position = transform.getPosition();
	}

	update()
	{
		let life = this.joined["LifeComponent"];
		if(life.isZero())
		{
			if(!this.timer) this.timer = this.time
			this.timer -= Time.delta_time;
			if(this.timer <= 0.0)
			{
				this.joined["TransformComponent"].setPosition(this.position.x, this.position.y);
				life.resetMax();
				this.timer = this.time;
			}
		}
	}
}


/* Hiding after death component */
class SpawnerComponent extends TimerComponent
{
	time = 1.0
	settings = {}
	max_time = undefined;
	container = undefined;
	prefab = undefined;

	init()
	{
		this.join("TransformComponent");
		if(this.max_time == undefined) this.max_time = this.time
	}

	action()
	{
		this.enabled = true;
		this.time = this.max_time;
		let layer = Game.getObject(this.container)
		let prefab = Resources.getPrefab(this.prefab)
		layer.addChild(prefab.getEntity(
		{
			...this.settings,
			"TransformComponent" : {"position" : this.joined["TransformComponent"].getPosition()},
		}))
	}
}

/* Hiding after death component */
class DissolveComponent extends TimerComponent
{
	max_time = undefined;

	init()
	{
		this.max_time = this.time
		this.join("DrawableComponent")
	}

	tic()
	{
		this.joined["DrawableComponent"].setOpacity(this.time / this.max_time)
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

/* Temporary component */
class LifeTimeComponent extends TimerComponent
{
	time = 5.0

	action()
	{
		this.owner.parent.deleteChild(this.owner)
	}
}

/* Score Indicator Spawner */
class ScoreIndicatorSpawnerComponent extends AttributeEventComponent
{
	container = null
	prefab = null

	action(old_value, new_value)
	{
		let value = new_value - old_value
		let layer = Game.current_level.getLayer(this.container)
		let prefab = Resources.getPrefab(this.prefab)
		layer.addObject(prefab.getEntity(
		{
		"TransformComponent" : {"position" : Input.getLocalMouse()},
		"TextComponent" : {"text" : String(value), "fill_color" : value > 0 ? new Color(0, 255, 0) : new Color(255, 0, 0)}
		}))
	}
}

/* Dead Disabler Component */
class DeadDisablerComponent extends DeadEventComponent
{
	reversable = true
	enablers = []
	disablers = []

	revival_action()
	{
		if(this.reversable)
		{
			for(let i in this.enablers)
			{
				let component = this.owner.getComponent(this.enablers[i])
				if(component) component.setEnabled(false);
			}
			for(let i in this.disablers)
			{
				let component = this.owner.getComponent(this.disablers[i])
				if(component) component.setEnabled(true);
			}
		}
	}

	dead_action()
	{
		for(let i in this.enablers)
		{
			let component = this.owner.getComponent(this.enablers[i])
			if(component) component.setEnabled(true);
		}
		for(let i in this.disablers)
		{
			let component = this.owner.getComponent(this.disablers[i])
			if(component) component.setEnabled(false);
		}
	}
}