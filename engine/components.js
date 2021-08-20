/* --------------------------------- Components  -------------------------------------- */
class ComponentBase
{
	name = ""
	enabled = true;
	joined = {};
	default = {};

	init()
	{
		/* Abstract method */
	}

	update()
	{
		/* Abstract method */
	}

	reset()
	{
		let arr = Object.copy(this.default)
		for(let i in arr) this[i] = arr[i]
	}

	join(name)
	{
		this.joined[name] = this.owner.getComponent(name)
		return this.joined[name];
	}

	setName(value)
	{
		this.name = value
	}

	isEnabled()
	{
		return this.enabled;
	}

	setEnabled(value)
	{
		this.enabled = value
	}

	setOwner(owner)
	{
		this.owner = owner
	}

	isEnabled()
	{
		return this.enabled
	}

	setData(data)
	{
		for(var name in data)
		{
			this[name] = data[name]
		}
	}
}

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

/* Properties Component */
class PropertiesComponent extends ComponentBase
{
	properties = {}

	setValue(name, value)
	{
		this.properties[name] = value;
	}

	getValue(name)
	{
		return this.properties[name];
	}
}

/* Number Properties component*/
class NumberPropertiesComponent extends PropertiesComponent
{
	properties = {}

	addValue(value)
	{
		this.setValue(this.properties[name].value + value);
	}

	setValue(name, value)
	{
		if(properties[name]) properties[name] = {"min" : -Number.MAX_VALUE, "max" : Number.MAX_VALUE}
		if(value < this.properties[name].min) value = this.properties[name].min
		if(value > this.properties[name].max) value = this.properties[name].max

		this.properties[name].value = value;
	}

	getValue(name)
	{
		return this.properties[name].value
	}

	isZero()
	{
		return this.properties[name].value == 0;
	}

	isMin()
	{
		return this.properties[name].value == this.properties[name].min;
	}

	isMax()
	{
		return this.properties[name].value == this.properties[name].max;
	}

	isGreaterZero()
	{
		return this.properties[name].value > 0;
	}

	isLessZero()
	{
		return this.properties[name].value < 0;
	}

	setZero()
	{
		this.setValue(0)
	}

	setMax()
	{
		this.setValue(this.properties[name].max)
	}

	setMin()
	{
		this.setValue(this.properties[name].min)
	}
}

/* Watcher Component */
class SoundComponent extends ComponentBase
{
	sound = null;
	autoplay = false;
	loop = false;

	play()
	{
		let audio = Resources.getAudio(this.sound)
		audio.currentTime=0;
		audio.play();
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
		let speed = Time.delta_time * 50;

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
		if(Input.isKeysPressed(["KeyQ"])) Game.setFullScreen(true);
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

/* Buffer Component */
class BufferComponent extends ComponentBase
{
	buffer = {}

	setValue(vec, obj)
	{
		if(!this.buffer[vec.x]) this.buffer[vec.x] = {}
		this.buffer[vec.x][vec.y] = obj;
	}

	getValue(vec)
	{
		let row = this.buffer[vec.x]
		if(row)
		{
			return row[vec.y]
		}
		return row
	}

	clear()
	{
		this.buffer = {};
	}

	update()
	{
		console.log(this.owner.childs.length);
	}
}

/* Buffer Component */
class BufferedComponent extends ComponentBase
{
	point = new Vector2(null, null)

	init()
	{
		this.join("TransformComponent")
	}

	update()
	{
		let pos = this.joined["TransformComponent"].getRealPosition()
		if(!this.point.equals(pos))
		{
			this.point = pos;

			if(this.owner.parent.getComponent("BufferComponent").getValue(pos))
			{
				this.owner.parent.deleteChild(this.owner)
			}
			else
			{
				this.owner.parent.getComponent("BufferComponent").setValue(pos, this.owner)
			}
		}
	}
}

/* Gravity component */
class ReproductionComponent extends ComponentBase
{
	init()
	{
		this.join("TransformComponent")
	}

	divide(vec)
	{
		let cell = new Entity("cell")
		cell.addComponent(new TransformComponent(), {"position" : vec, "size" : new Vector2(10, 10), "position_type" : VALUE_TILE})
		cell.addComponent(new RectShapeComponent(), {"line_width" : 0})
		cell.addComponent(new ReproductionComponent())
		cell.addComponent(new BufferedComponent())
		this.owner.parent.addChild(cell);
	}

	update()
	{
		let buffer = this.owner.parent.getComponent("BufferComponent")
		let transform = this.joined["TransformComponent"]
		let vec = transform.getRealPosition();

		if(!buffer.getValue(vec.add(new Vector2(-1, 0))))
		{
			this.divide(vec.add(new Vector2(-1, 0)))
		}
		if(!buffer.getValue(vec.add(new Vector2(1, 0))))
		{
			this.divide(vec.add(new Vector2(1, 0)))
		}
		if(!buffer.getValue(vec.add(new Vector2(0, -1))))
		{
			this.divide(vec.add(new Vector2(0, -1)))
		}
		if(!buffer.getValue(vec.add(new Vector2(0, 1))))
		{
			this.divide(vec.add(new Vector2(0, 1)))
		}

		this.setEnabled(false);
	}
}
