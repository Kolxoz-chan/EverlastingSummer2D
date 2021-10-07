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

class TriggerReactorComponent extends ComponentBase
{
	indicator = null;
	key = "KeyE"

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

				if(trigger.action && (trigger.auto || Input.isKeyClicked(this.key)))
				{
					trigger.action(this.owner)
				}
			}
		}
	}
}

class ItemTriggerComponent extends TriggerComponent
{
	hint = "Взять (E)"
	auto = false

	init()
	{
		this.join("TransformComponent")
	}

	action(obj)
	{
		if(obj.hasComponent("ArrayPropertiesComponent"))
		{
			let arr = obj.getComponent("ArrayPropertiesComponent");
			arr.add("inventory", this.owner)
			this.owner.parent.deleteChild(this.owner)
			InventoryWidget.updateInventory()
		}
	}
}

class DialogueTriggerComponent extends TriggerComponent
{
	hint = "Поговорить (E)"
	auto = false
	dialogue = null

	init()
	{
		this.join("TransformComponent")
	}

	action(obj)
	{
		if(this.dialogue)
		{
			if(DialogueMenu.dialogue)
			{
				let arr = DialogueMenu.dialogue.callNext()
				if(arr.length <= 1) DialogueMenu.call(arr[0])
			}
			else
			{
				DialogueMenu.call(this.dialogue)
			}
		}
	}
}

class DoorTriggerComponent extends TriggerComponent
{
	hint = "Зайти (E)"
	auto = false
	level = null

	init()
	{
		this.join("TransformComponent")
	}

	action(obj)
	{
		if(this.level)
		{
			Game.addTask(() => 
			{
				let lvl = Game.entities_named[this.level]
				if(lvl)
				{
					if(Game.current_entity) Game.current_entity.setEnabled(false);
					Game.current_entity = lvl;
					Game.current_entity.setEnabled(true);
				}
				else
				{
					if(Game.current_entity) Game.current_entity.setEnabled(false);
					TiledLoader.loadLevel(this.level)
				}
			})
		}
	}
}
