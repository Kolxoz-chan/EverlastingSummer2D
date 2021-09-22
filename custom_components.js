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

/* Temporary component */
class LifeTimeComponent extends TimerComponent
{
	time = 5.0

	action()
	{
		this.owner.parent.deleteChild(this.owner)
	}
}

class PlayerControlComponent extends ComponentBase
{
	controls = {};
	acceleration = 2.0
	running = false

	init()
	{
		this.join("TransformComponent")

		this.addControl("Run", ["ShiftLeft", "ShiftRight"]);
		this.addControl("GoAhead", ["KeyW", "ArrowUp"]);
		this.addControl("GoBack", ["KeyS", "ArrowDown"]);
		this.addControl("GoLeft", ["KeyA", "ArrowLeft"]);
		this.addControl("GoRight", ["KeyD", "ArrowRight"]);
	}

	addControl(action, buttons)
	{
		this.controls[action] = buttons;
	}

	update()
	{
		let transform_component = this.joined["TransformComponent"]
		let speed = Time.delta_time * 120;

		/* Acceleration */
		if(Input.isKeysPressed(this.controls["Run"]))
		{
			this.running = true;
			speed *= this.acceleration;
		}
		else this.running = false;

		/* Moving */
		if(Input.isKeysPressed(this.controls["GoAhead"])) transform_component.move(new Vector2(0, -speed));
		if(Input.isKeysPressed(this.controls["GoBack"])) transform_component.move(new Vector2(0, speed));
		if(Input.isKeysPressed(this.controls["GoLeft"])) transform_component.move(new Vector2(-speed, 0));
		if(Input.isKeysPressed(this.controls["GoRight"])) transform_component.move(new Vector2(speed, 0));
		//if(Input.isKeysPressed(["KeyQ"])) Game.setFullScreen(true);
	}
}

/* Solid Component */
class SolidComponent extends ComponentBase
{
	offset = new Rect(0, 0, 0, 0)

	init()
	{
		this.join("TransformComponent")
		this.join("ColiderComponent")
	}

	getRect()
	{
		return this.joined["ColiderComponent"].getRect().addRect(this.offset);
	}

	update()
	{
		let objects = this.joined["ColiderComponent"].objects
		for(let i in objects)
		{
			let obj = objects[i]
			if(!obj.hasComponent("SolidComponent")) continue;

			let rect_a = this.getRect()
			let rect_b = obj.getComponent("SolidComponent").getRect()
			let rect_c = rect_a.getCommon(rect_b)

			if(!rect_c.isNullSize())
			{
				let transform =  this.joined["TransformComponent"]
				let size = rect_c.getSize();

				if(transform.velocity.x != 0 && transform.velocity.y != 0)
				{
					if(transform.velocity.x < 0 && transform.velocity.y < 0)
					{
						if(size.y > size.x) transform.move(new Vector2(size.x + 1, 0))
						else transform.move(new Vector2(0, size.y + 1))
					}
					else if(transform.velocity.x > 0 && transform.velocity.y < 0)
					{
						if(size.y > size.x) transform.move(new Vector2(-size.x - 1, 0))
						else transform.move(new Vector2(0, size.y + 1))
					}

					else if(transform.velocity.x > 0 && transform.velocity.y > 0)
					{
						if(size.y > size.x) transform.move(new Vector2(-size.x - 1, 0))
						else transform.move(new Vector2(0, -size.y - 1))
					}

					else if(transform.velocity.x < 0 && transform.velocity.y > 0)
					{
						if(size.y > size.x) transform.move(new Vector2(size.x + 1, 0))
						else transform.move(new Vector2(0, -size.y - 1))
					}
				}
				else
				{
					if(size.y > 0 && transform.velocity.y < 0)
					{
						transform.move(new Vector2(0, size.y + 1))
					}

					else if(size.y > 0 && transform.velocity.y > 0)
					{
						transform.move(new Vector2(0, -size.y - 1))
					}

					else if(size.x > 0 && transform.velocity.x < 0)
					{
						transform.move(new Vector2(size.x + 1, 0))
					}

					else if(size.x > 0 && transform.velocity.x > 0)
					{
						transform.move(new Vector2(-size.x - 1, 0))
					}
				}
			}
		}
	}
}

class TriggerReactorComponent extends ComponentBase
{
	indicator = null;

	init()
	{
		this.join("ColiderComponent")
	}

	update()
	{
		let objects = this.joined["ColiderComponent"].objects

		for(let i in objects)
		{
			if(objects[i].hasComponent("TriggerComponent"))
			{
				let trigger = objects[i].getComponent("TriggerComponent")
				if(this.indicator)
				{
					let obj = Game.entities_named[this.indicator];
					if(obj)
					{
						if(obj.hasComponent("DrawableComponent"))
						{
							let component = obj.getComponent("DrawableComponent")
							if(trigger.hint) component.text = trigger.hint
							component.redraw();
						}
					}
				}

				let actor = objects[i].getComponent("TriggerComponent")
				if(actor.action) actor.action(this)
			}
		}
	}
}

class SortingComponent extends ComponentBase
{
	init()
	{
		this.join("TransformComponent")
	}

	update()
	{
		let a, b;
		let rect_a = this.owner.hasComponent("ColiderComponent") ? this.owner.getComponent("ColiderComponent").getRect() : this.joined["TransformComponent"].getRect();
		let objects = this.owner.parent.childs;
		let index = objects.indexOf(this.owner)

		for(let i in objects)
		{
			let obj = objects[i]
			let rect_b = obj.hasComponent("ColiderComponent") ? obj.getComponent("ColiderComponent").getRect() : obj.getComponent("TransformComponent").getRect();
			if((rect_a.bottom() < rect_b.bottom() && index > i) || (rect_a.bottom() > rect_b.bottom() && index < i))
			{
				this.owner.parent.swap(i, index);
			}
		}
	}
}

class ItemTriggerComponent extends TriggerComponent
{
	hint = "Взять?"
	auto = false

	init()
	{
		this.join("TransformComponent")
	}

	action()
	{
		if(Input.isKeyClicked("KeyE") || this.auto)
		{
			this.owner.parent.deleteChild(this.owner)
		}
	}
}

class FadeDistanceComponent extends ComponentBase
{
	object = null;
	distance = 100;
	offset = 100

	init()
	{
		this.join("TransformComponent")
		this.join("DrawableComponent")
	}

	update()
	{
		if(this.object)
		{
			let obj = Game.entities_named[this.object]

			let rect_a = obj.getComponent("TransformComponent").getRect()
			let rect_b = this.joined["TransformComponent"].getRect()

			let opacity = (this.distance + (rect_a.bottom() - rect_b.bottom()  - this.offset)) / this.distance;
			if(opacity >= 0) console.log(opacity)
			this.joined["DrawableComponent"].opacity = opacity
		}
	}
}
/*
class OverlapFadeComponent extends ComponentBase
{
	object = null;

	init()
	{
		this.join("TransformComponent")
		this.join("DrawableComponent")
	}

	update()
	{
		if(this.object)
		{
			let obj = Game.entities_named[this.object]

			let rect_a = obj.getComponent("TransformComponent").getRect()
			let rect_b = this.joined["TransformComponent"].getRect()

			this.joined["DrawableComponent"].opacity = (this.distance + (rect_a.bottom() - rect_b.bottom()) - this.offset) / this.distance;
		}
	}
}*/
