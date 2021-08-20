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