/* Transform component*/
class TransformComponent extends ComponentBase
{
	position_type = VALUE_ABSOLUTE;
	size_type = VALUE_ABSOLUTE;

	position = new Vector2(0, 0);
	velocity = new Vector2(0, 0);
	size = new Vector2(0, 0);
	axis = new Vector2(0.5, 0.5);
	angle = 0.0;

	update()
	{
		this.position = this.position.add(this.velocity);
		this.velocity = new Vector2(0, 0);
	}

	setPosition(x, y)
	{
		this.position = new Vector2(x, y);
	}

	setPositionType(type)
	{
		this.position_type = type
	}

	setSize(vector)
	{
		this.size = vector;
	}

	setSizeType(type)
	{
		this.size_type = type
	}

	setAngle(a)
	{
		this.angle = a;
	}

	setAxis(x, y)
	{
		this.axis = new Vector2(x, y);
	}

	getRealPosition()
	{
		return this.position
	}

	getPosition()
	{
		let pos = this.getRealPosition();
		let vec = new Vector2(0, 0)

		if(this.owner.parent)
		{
			if(this.owner.parent.hasComponent("TransformComponent"))
			{
				vec = this.owner.parent.getComponent("TransformComponent").getPosition()
			}
		}

		if(this.position_type == VALUE_TILE)
		{
			pos = pos.mulVec(this.getSize())
		}

		return pos.add(vec);
	}

	getCenter()
	{
		let pos = this.getPosition();
		return new Vector2(pos.x + this.size.x/2, pos.y+this.size.y/2)
	}

	getSize()
	{
		return this.size;
	}

	getAngle()
	{
		return this.angle;
	}

	getAxis()
	{
		return this.axis;
	}

	move(vector)
	{
		this.velocity = this.velocity.add(vector);
	}

	move_to(point, speed)
	{
		let len = this.position.getDistance(point);
		if(len > 0)
		{
			let vector = this.position.getVectorTo(point)
			if(len <= speed) this.move(point.sub(this.position));
			else this.move(vector.mul(speed));
		}
	}

	move_around(axis, angle)
	{
		angle = Math.PI / 180 * angle;

		let point = new Vector2()
		point.x = (this.position.x - axis.x) * Math.cos(angle) - (this.position.y - axis.y) * Math.sin(angle) + axis.x;
		point.y = (this.position.x - axis.x) * Math.sin(angle) + (this.position.y - axis.y) * Math.cos(angle) + axis.y;

		this.move(point.sub(this.position))
	}

	scale(vec)
	{
		this.size.x *= vec.x;
		this.size.y *= vec.y;
	}

	grow(vec)
	{
		this.size.x += vec.x;
		this.size.y += vec.y;
	}

	rotate(a)
	{
		this.angle += a;
	}

	rotate_at(point)
	{
		let center = this.getCenter()
		let angle = center.getDirection(point)
		this.setAngle(angle)
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

/* Camera component */
class CameraComponent extends ComponentBase
{
	init()
	{
		this.join("TransformComponent")
	}

	update()
	{
		let transform_component = this.joined["TransformComponent"]
		Camera.setCenter(transform_component.getCenter())
	}
}

/* Gravity component */
class GravityComponent extends ComponentBase
{
	vector = new Vector2(0, 0)

	init()
	{
		this.join("TransformComponent")
	}

	update()
	{
		this.joined["TransformComponent"].move(this.vector.mul(Time.delta_time))
	}
}

