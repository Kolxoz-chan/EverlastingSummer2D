/* Base colider component*/
class ColiderComponent extends ComponentBase
{
	name = "ColiderComponent"
	objects = []
	coliding = false;

	isIntersects(colider)
	{
		let A = this.getRect()
		let B = colider.getRect()
		let C = A.getCommon(B)

		if(!C.isNullSize())
		{
			for(let y = C.y; y < C.y + C.h; y++)
			{
				for(let x = C.x; x < C.x + C.w; x++)
				{
					let point = new Vector2(x, y)
					if(this.isContained(point) && colider.isContained(point)) return true;
				}
			}
		}
		return false;
	}

	update()
	{
		if(this.coliding)
		{
			this.objects = [];
			let container = this.owner.parent
			for(let i in container.childs)
			{
				if(container.childs[i].hasComponent("ColiderComponent") && this.owner !== container.childs[i])
				{
					let colider = container.childs[i].getComponent("ColiderComponent")
					if(colider.isEnabled())
					{
						if(this.isIntersects(colider))
						{
							this.objects.push(container.childs[i])
						}
					}
				}
			}
		}
	}
}

/* Rect colider component*/
class RectColiderComponent extends ColiderComponent
{
	offset = new Rect(0, 0, 0, 0)

	init()
	{
		this.join("TransformComponent")
	}

	getRect()
	{
		return this.joined["TransformComponent"].getRect().addRect(this.offset)
	}

	isContained(point)
	{
		let rect = this.getRect()
		return rect.isConteined(point)
	}
}


/* Circle colider component*/
class CircleColiderComponent extends ColiderComponent
{
	radius = undefined
	offset = new Vector2(0, 0)

	init()
	{
		let size = this.join("TransformComponent").getSize()
		if(!this.radius) this.radius = Math.max(size.x, size.y) / 2;
	}

	getRect()
	{
		let transform_component = this.joined["TransformComponent"];
		let center = transform_component.getCenter();

		let diameter = this.radius * 2;
		return new Rect(center.x - this.radius, center.y - this.radius, diameter, diameter);
	}

	isContained(point)
	{
		let transform_component = this.joined["TransformComponent"];
		let center = transform_component.getCenter();
		return point.getDistance(center) <= this.radius;
	}
}
