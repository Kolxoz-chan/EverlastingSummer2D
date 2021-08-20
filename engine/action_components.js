/* Trigger component */
class TriggerComonent extends ComponentBase
{
	//action = null;

	init()
	{
		this.join("ColiderComponent")
	}

	update()
	{
		let colider = this.joined["ColiderComponent"];
		for(let i in colider.objects)
		{
			if(this.action) this.action(colider.objects[i])
		}
	}
}

/* Timer component */
class TimerComponent extends ComponentBase
{
	enabled = true;
	time = 60.0
	//action = null;
	//tic = null;

	getTime()
	{
		return this.time;
	}

	update()
	{
		if(this.time <= 0.0)
		{
			this.enabled = false;
			if(this.action) this.action()
		}
		else
		{
			this.time -= Time.delta_time;
			if(this.tic) this.tic();
		}
	}
}

/* Attribute Change Event */
class AttributeEventComponent extends ComponentBase
{
	attribute = null
	value = null
	// action = null

	init()
	{
		if(this.attribute) this.value = this.join(this.attribute).getValue()
	}

	update()
	{
		let attribute = this.joined[this.attribute]
		let new_value = attribute.getValue();
		if(this.value != new_value && this.action) this.action(this.value, new_value)
		this.value = new_value;
	}
}

/* Attribute Change Event */
class DeadEventComponent extends ComponentBase
{
	is_alife = false;
	// revival_action = null
	// dead_action = null

	init()
	{
		this.is_alife = this.join("LifeComponent").isGreaterZero();
	}

	update()
	{
		let life = this.joined["LifeComponent"]
		if(!life.isGreaterZero() && this.is_alife)
		{
			this.is_alife = false
			if(this.dead_action) this.dead_action()
		}
		else if(life.isGreaterZero() && !this.is_alife)
		{
			this.is_alife = true
			if(this.revival_action) this.revival_action()
		}
	}
}

/* Radius Scanner */
class RadiusScannerComponent extends ComponentBase
{
	radius = 50;
	container = null;
	// onRegister = null

	init()
	{
		this.join("TransformComponent")
	}

	update()
	{
		var container = this.owner.parent;
		for(var i in container.childs)
		{
			var obj = container.childs[i];
			var A = this.joined["TransformComponent"].getCenter()
			var B = obj.getComponent("TransformComponent").getCenter()
			var distance = A.getDistance(B)

			if(obj != this.owner && distance <= this.radius && this.onRegister)
			{
				//console.log(this.onRegister)
				this.onRegister(obj);
			}
		}
	}
}
