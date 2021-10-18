/* Native classes */
Object.copy = function(obj, target = null)
{
	if(target == null) target = new obj.constructor()

	for(let i in obj)
	{
		if(obj[i] instanceof Function)
		{
			target[i] = obj[i];
			continue;
		}
		if(obj[i] instanceof Array)
		{
			target[i] = Object.copy(obj[i], []);
			continue;
		}
		if(obj[i] instanceof Object)
		{
			target[i] = Object.copy(obj[i], new obj[i].constructor());
			continue;
		}
		target[i] = obj[i];
	}
	return target;
}

/* Entity class */
class Entity
{
	name = ""
	enabled = true;
	parent = null;
	components = {};
	childs = []
	delete_queue = []
	swap_queue = []
	entities_named = []
	// onUpdate = null;

	constructor(name = null)
	{
		this.name = name;
	}

	init()
	{
		for(var key in this.components) this.components[key].init();
	}

	reset()
	{
		for(var key in this.components) this.components[key].reset();
	}

	swap(a, b)
	{
		this.swap_queue.push([a, b])
	}

	update()
	{
		// Swap childs
		if(this.swap_queue.length)
		{
			for(let i in this.swap_queue)
			{
				let pair = this.swap_queue[i]

				let a = this.childs[pair[0]]
				this.childs[pair[0]] = this.childs[pair[1]]
				this.childs[pair[1]] = a;
			}
			this.swap_queue = []
		}

		// Deleting childs
		if(this.delete_queue.length)
		{
			for(let i in this.delete_queue)
			{
				let index = this.childs.indexOf(this.delete_queue[i])
				this.childs.splice(index, 1)
			}
			this.delete_queue = []
		}

		// Update components
		for(var key in this.components)
		{
			if(this.components[key].isEnabled())
			{
				if(this.components[key].onUpdate) this.components[key].onUpdate();
				this.components[key].update();
			}
		}

		// Update childs
		if(this.childs)
		{
			for(let i in this.childs)
			{
				if(this.childs[i].isEnabled()) this.childs[i].update();
			}
		}
	}

	addComponent(name, data={})
	{
		let component = eval("new " + name + "()")
		if(component.name.length > 0) name = component.name;

		this.components[name] = component;
		component.setOwner(this);
		component.setData(data);
		return component;
	}

	addNamed(obj)
	{
		this.entities_named[obj.name] = obj;
		if(this.parent) this.parent.addNamed(obj)
	}

	getNamed(name)
	{
		return this.entities_named[name];
	}

	addChild(obj)
	{
		if(obj.name)
		{
			Game.entities_named[obj.name] = obj;
			this.addNamed(obj)
		}
		this.childs.push(obj)
		obj.parent = this;
		obj.reset();
		obj.init();
	}

	deleteChild(obj)
	{
		this.delete_queue.push(obj);
	}

	hasChild(obj)
	{
		return this.childs.indexOf(obj) != -1
	}

	hasComponent(name)
	{
		return this.components.hasOwnProperty(name);
	}

	setEnabled(value)
	{
		this.enabled = value;
	}

	getComponent(name)
	{
		if(!this.hasComponent(name)) console.log("WARNING. Object '" + this.name + "' has not '" + name + "' component!")
		return this.components[name];
	}

	getParent()
	{
		return this.parent
	}

	getChild(name)
	{
		for(let i in this.childs)
		{
			if(this.childs[i].name == name) return this.entities[i];
		}
		return null
	}

	getChildByIndex(index)
	{
		return this.childs[index]
	}

	isEnabled()
	{
		return this.enabled
	}
}

/* --------------------------------- Matrix entity  -------------------------------------- */
class MatrixEntity extends Entity
{
	matrix = {}
	size = new Vector2(32, 32)
	rect = new Rect(Number.MAX_VALUE, Number.MAX_VALUE, 0, 0)

	constructor(name = null, size = new Vector2(32, 32))
	{
		super(name);
		this.size = size;
	}

	setEntity(obj, vec)
	{
		if(obj.name) Game.entities_named[obj.name] = obj;
		if(!this.matrix[vec.x]) this.matrix[vec.x] = {};
		if(obj.hasComponent("TransformComponent"))
		{
			let transform = obj.getComponent("TransformComponent")
			transform.setPosition(vec.mulVec(this.size))
			transform.setSize(this.size)
		}
		else
		{
			obj.addComponent("TransformComponent", {"position" : vec.mulVec(this.size), "size" : this.size})
		}

		this.matrix[vec.x][vec.y] = obj
		obj.parent = this;
		obj.reset();
		obj.init();
	}

	getEntity(vec)
	{
		if(this.matrix[vec.x])
		{
			return this.matrix[vec.x][vec.y]
		}
		return null
	}

	update()
	{
		// Deleting childs
		if(this.delete_queue.length)
		{
			for(let i in this.delete_queue)
			{
				let index = this.childs.indexOf(this.delete_queue[i])
				this.childs.splice(index, 1)
			}
			this.delete_queue = []
		}

		// Update components
		for(var key in this.components)
		{
			if(this.components[key].isEnabled())
			{
				if(this.components[key].onUpdate) this.components[key].onUpdate();
				this.components[key].update();
			}
		}

		// Update matrix
		let rect = Camera.getRect().divVec(this.size)

		rect.x = Math.ceil(rect.x)
		rect.y = Math.ceil(rect.y)
		rect.w = Math.ceil(rect.x + rect.w);
		rect.h = Math.ceil(rect.y + rect.h);

		//alert(rect.x + " " + rect.y + " " + rect.w + " " + rect.h)
		for(let x=rect.x - 1; x<rect.w; x++)
		{
			if(this.matrix[x])
			{
				for(let y=rect.y - 1; y<rect.h; y++)
				{
					if(this.matrix[x][y])
					{
						if(this.matrix[x][y].isEnabled())
						{
							this.matrix[x][y].update();
						}
					}
				}
			}
		}

		/*for(let x in this.matrix)
		{
			for(let y in this.matrix[x])
			{
				if(this.matrix[x][y].isEnabled())
				{
					this.matrix[x][y].update();
				}
			}
		}*/

		// Update childs
		for(let i in this.childs)
		{
			if(this.childs[i].isEnabled()) this.childs[i].update();
		}
	}
}

/* --------------------------------- Other classes  -------------------------------------- */
class Vector2
{
	x = 0;
	y = 0;

	constructor(x = 0, y = 0)
	{
		this.x = x;
		this.y = y;
	}

	copy()
	{
		return new Vector2(this.x, this.y);
	}

	equals(point)
	{
		return point.x == this.x && point.y == this.y;
	}

	add(vector)
	{
		return new Vector2(this.x + vector.x, this.y + vector.y)
	}

	sub(vector)
	{
		return new Vector2(this.x - vector.x, this.y - vector.y)
	}

	mul(value)
	{
		return new Vector2(this.x * value, this.y * value)
	}

	abs()
	{
		return new Vector2(Math.abs(this.x), Math.abs(this.y));
	}

	mulVec(vector)
	{
		return new Vector2(this.x * vector.x, this.y * vector.y)
	}

	invert()
	{
		return new Vector2(-this.x, -this.y)
	}

	positive()
	{
		return new Vector2(Math.abs(this.x), Math.abs(this.y))
	}

	getDistance(point)
	{
		return Math.sqrt(Math.pow(this.x - point.x, 2) + Math.pow(this.y - point.y, 2))
	}

	getDirection(point)
	{
		return Math.atan2(point.y - this.y, point.x - this.x) * 180 / Math.PI + 90;
	}

	getLength()
	{
		return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2))
	}

	getVectorTo(point)
	{
		let x = point.x - this.x
		let y = point.y - this.y
		let sum = Math.abs(x) + Math.abs(y);

		if(sum == 0) return new Vector2(0, 0);
		else return new Vector2(x / sum, y / sum);
	}

	toDirectionVector()
	{
		let sum = Math.abs(this.x) + Math.abs(this.y);

		if(sum == 0) return new Vector2(0, 0);
		else return new Vector2(this.x / sum, this.y / sum);
	}

 	getDirectionalAngle()
	{
		return Math.atan2(this.y, this.x) * 180 / Math.PI + 90;
	}
/*
	isOpposite(vec)
	{
		return
			this.x / Math.abs(this.x) != vec.x / Math.abs(vec.x) ||
			this.y / Math.abs(this.y) != vec.y / Math.abs(vec.y)
	}*/

	static random(as_dirrection = false)
	{
		var x = (Math.random() * 2) - 1;
		var y = (Math.random() * 2) - 1;
		var sum = as_dirrection ? Math.abs(x) + Math.abs(y) : 1;

		if(sum > 0) return new Vector2(x / sum, y / sum);
		else return new Vector2(0, 0);
	}

	static fromAngle(angle)
	{
		let rad = (angle - 90) * Math.PI / 180;
		return new Vector2(Math.cos(rad), Math.sin(rad))
	}

	static getAngle(A,B,C)
	{
	    var AB = A.getDistance(B);
	    var BC = B.getDistance(C);
	    var AC = A.getDistance(C);
	    return Math.acos((Math.pow(BC, 2) + Math.pow(AB, 2) - Math.pow(AC, 2)) / (2 * BC * AB)) * 180 / Math.PI;
	}

	static getBisector(A,B,C)
	{
		A = B.sub(A).getDirectionalAngle()
		C = B.sub(C).getDirectionalAngle()
		return Vector2.fromAngle((A + C) / 2);
	}
}

/* Line class */
class Line
{
	constructor(p1, p2)
	{
		this.p1 = p1;
		this.p2 = p2;
	}

	getPart(proportion)
	{
		let p3 = this.p2.sub(this.p1).mul(proportion);
		return new Line(this.p1, this.p1.add(p3))
	}

	getIntersectsPoint(l2)
	{
		let a1 = this.p2.y - this.p1.y;
		let b1 = this.p1.x - this.p2.x;
		let c1 = -this.p1.x * this.p2.y + this.p1.y * this.p2.x;

		let a2 = l2.p2.y - l2.p1.y;
		let b2 = l2.p1.x - l2.p2.x;
		let c2 = -l2.p1.x * l2.p2.y + l2.p1.y * l2.p2.x;

		let det = (a1 * b2 - a2 * b1)

		let point = new Vector2();
		point.x = (b1 * c2 - b2 * c1) / det;
		point.y = (a2 * c1 - a1 * c2) / det;

		return point
	}

	static isParallel(l1, l2)
	{
		let a1 = l1.p2.y - l1.p1.y;
		let b1 = l1.p1.x - l1.p2.x;
		let a2 = l2.p2.y - l2.p1.y;
		let b2 = l2.p1.x - l2.p2.x;

		return a1 / a2 == b1 / b2
	}
}

/* Rect class */
class Rect
{
	x = 0;
	y = 0;
	w = 0;
	h = 0;

	constructor(x = 0, y = 0, w = 0, h = 0)
	{
		this.x = x
		this.y = y
		this.w = w
		this.h = h
	}

	getPosition()
	{
		return new Vector2(this.x, this.y)
	}

	getSize()
	{
		return new Vector2(Math.abs(this.w), Math.abs(this.h))
	}

	leftTop()
	{
		return new Vector2(this.x, this.y)
	}

	leftBottom()
	{
		return new Vector2(this.x, this.y + this.h)
	}

	rightTop()
	{
		return new Vector2(this.x + this.w, this.y)
	}

	rightBottom()
	{
		return new Vector2(this.x + this.w, this.y + this.h)
	}

	left()
	{
		return this.x;
	}

	right()
	{
		return this.x + this.w;
	}

	top()
	{
		return this.y;
	}

	bottom()
	{
		return this.y + this.h;
	}

	divVec(vec)
	{
		return new Rect(this.x / vec.x, this.y / vec.y, this.w / vec.x, this.h / vec.y)
	}

	addRect(rect)
	{
		return new Rect(this.x + rect.x, this.y + rect.y, this.w + rect.w - rect.x, this.h + rect.h -rect.y)
	}

	isConteined(point)
	{
		let A = this.leftTop()
		let B = this.rightBottom()

		return A.x <= point.x && B.x >= point.x && A.y <= point.y && B.y >= point.y
	}

	isIntersects(rect)
	{
		let A1 = this.leftTop();
		let B1 = this.rightBottom();

		let A2 = rect.leftTop();
		let B2 = rect.rightBottom();

		return A1.x <= B2.x && A1.y <= B2.y && B1.x >= A2.x && B1.y >= A2.y
	}

	equals(rect)
	{
		return rect.x == this.x && rect.y == this.y && rect.w == this.w && rect.h == this.h;
	}

	round()
	{
		return new Rect(~~this.x, ~~this.y, ~~this.w, ~~this.h)
	}

	isNullSize()
	{
		return this.w == 0 && this.h == 0;
	}

	getCommon(rect)
	{
		let result = new Rect(0, 0, 0, 0);

		if(this.isIntersects(rect))
		{
			let A1 = this.leftTop();
			let B1 = this.rightBottom();

			let A2 = rect.leftTop();
			let B2 = rect.rightBottom();

			result.x = Math.max(A1.x, A2.x);
			result.y = Math.max(A1.y, A2.y);
	        result.w = Math.min(B1.x, B2.x) - result.x;
	        result.h = Math.min(B1.y, B2.y) - result.y;
		}
		return result;
	}
}

/* Color class */
class Color
{
	r = 0;
	g = 0;
	b = 0;
	a = 255;

	constructor(r = 0, g = 0, b = 0, a=255)
	{
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	}

	toString()
	{
		return "rgba(" + this.r + "," + this.g + "," + this.b + "," + this.a + ")";
	}
}

class Gradient
{
	spectrum = {}

	static create(begin = new Vector2(0, 0), end = new Vector2(0, 1))
	{
		return new Gradient(begin, end)
	}

	constructor(begin = new Vector2(0, 0), end = new Vector2(0, 1))
	{
		this.begin = begin
		this.end = end
	}

	add(coef, color)
	{
		this.spectrum[coef] = color
		return this;
	}

	get(size = new Vector2(1, 1))
	{
		let grd = Game.context.createLinearGradient(size.x * this.begin.x, size.y * this.begin.y, size.x * this.end.x, size.y * this.end.y);
		for(let i in this.spectrum)
		{
			grd.addColorStop(i, this.spectrum[i]);
		}

		return grd;
	}
}

/* Font class */
class Font
{
	name = ""
	size = 14
	style = 0

	constructor(name, size=14, style=0)
	{
		this.name = name
		this.size = size
		this.style = style
	}

	toString()
	{
		return `${this.size}px ${this.name}`
	}
}

/* Textures class */
class Texture
{
	name = ""
	rect = new Rect()

	constructor(name, rect = null)
	{
		this.name = name
		this.rect = rect
	}

	draw(position, size = null)
	{
		if(size) Game.context.drawImage(Resources.getTexture(this.name), position.x, position.y, size.x, size.y);
		else Game.context.drawImage(Resources.getTexture(this.name), position.x, position.y);
	}
}

/* Prefab class */
class Prefab
{
	name = ""
	components = {}

	constructor(name = "")
	{
		this.name = name
	}

	addComponent(name, props = {})
	{
		this.components[name] = props
		return this.components[name];
	}

	getEntity(props = {})
	{
		let comps = Object.copy(this.components);

		for(let i in props)
		{
			for(let x in props[i])
			{
				comps[i][x] = props[i][x]
			}
		}

		let obj = new Entity()
		for(let i in comps)
		{
			obj.addComponent(eval("new " + i + "()"), comps[i])
		}

		return obj;
	}
}
