/* Drawable сomponent */
class DrawableComponent extends ComponentBase
{
	name = "DrawableComponent"
	fill_color = new Color(255, 255, 255)
	stroke_color = new Color(0, 0, 0)
	line_width = 1.0;
	opacity = 1.0;
	autodraw = true;
	is_drawn = false;

	getOpacity()
	{
		return this.opacity
	}

	setFillColor(color)
	{
		this.fill_color = color;
	}

	setStrokeColor(color)
	{
		this.stroke_color = color;
	}

	setLineWidth(value)
	{
		this.line_width = value
	}

	setOpacity(value)
	{
		this.opacity = value
	}

	isVisible()
	{
		return this.opacity > 0.0;
	}

	redraw()
	{
		this.is_drawn = true;
	}

	update()
	{
		if(this.isVisible() && (this.autodraw || this.is_drawn))
		{
			/* Get data */
			let transform_component = this.joined["TransformComponent"]
			let position = transform_component.getPosition()
			let size = transform_component.getSize()

			/* Settings */
			this.applyStyles();
			this.applyTransformation()

			this.draw(position, size);

			/* Reset*/
			Game.context.resetTransform();
			this.is_drawn = false;
		}
	}

	applyStyles()
	{
		Game.context.globalAlpha = this.opacity;
		Game.context.fillStyle = this.fill_color;
		Game.context.strokeStyle = this.stroke_color;
		Game.context.lineWidth = this.line_width;
	}

	applyTransformation()
	{
		let transform_component = this.joined["TransformComponent"]
		let position = transform_component.getPosition()
		let size = transform_component.getSize()
		let angle = transform_component.getAngle()
		let axis = transform_component.getAxis()

		Camera.apply_transform()

		Game.context.translate(position.x + size.x * axis.x, position.y + size.y * axis.y)
		Game.context.rotate(Math.PI / 180 * angle);
		Game.context.translate(-size.x * axis.x - position.x, -size.y * axis.y - position.y)
	}
}

/* Rect shape */
class RectShapeComponent extends DrawableComponent
{
	init()
	{
		this.join("TransformComponent")
	}

	draw(position, size)
	{
		Game.context.fillRect(position.x, position.y, size.x, size.y);
		if(this.line_width > 0.0) Game.context.strokeRect(position.x, position.y, size.x, size.y);
	}
}

/* Circle shape */
class CircleShapeComponent extends DrawableComponent
{
	init()
	{
		this.join("TransformComponent")
	}

	draw(position, size)
	{
		Game.context.beginPath();
		Game.context.ellipse(position.x, position.y, size.x/2, size.y/2, Math.PI, 0, Math.PI * 2, true);
		Game.context.fill();
		Game.context.stroke();
	}
}

/* Image component */
class ImageComponent extends DrawableComponent
{
	texture = null;
	line_width = 0.0;

	init()
	{
		let transform = this.join("TransformComponent")
		if(!transform.size)
		{
			let image = Resources.getTexture(this.texture)
			transform.setSize(new Vector2(image.width, image.height))
		}
	}

	isVisible()
	{
		return this.texture && this.opacity > 0.0
	}

	draw(position, size)
	{
		let image = Resources.bitmaps[this.texture] ? Resources.bitmaps[this.texture]  : Resources.getTexture(this.texture)
		if(image)
		{
			Game.context.drawImage(image, position.x, position.y);
			//if(this.line_width > 0.0) Game.context.strokeRect(rect.x, rect.y, rect.w, rect.h);
		}
	}
}

/* Text component */
class TextComponent extends DrawableComponent
{
	text = "";
	font = "14px Arial"
	outline = true;

	init()
	{
		let transform = this.join("TransformComponent")
		this.applyStyles();

		Game.context.font = this.font;
		let metrics = Game.context.measureText(this.text);
		transform.setSize(new Vector2(metrics.width, metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent))
		//transform.setPosition(transform.getPosition().add(new Vector2(0, size.y)))
	}

	isVisible()
	{
		return this.text.length && this.opacity > 0.0 && this.font;
	}

	draw(position, size)
	{
		Game.context.font = this.font;
		if(this.outline) Game.context.strokeText(this.text, position.x, position.y + size.y);
		Game.context.fillText(this.text, position.x, position.y + size.y);
	}
}   

/* Polygon component */
class PolygonComponent extends DrawableComponent
{
	points = []
	closed = false
	line_width = 1.0

	init()
	{
		let transform = this.join("TransformComponent")
	}

	addPoint(point)
	{
		this.points.push(point)
	}

	deletePoint(index)
	{
		if(index < 0) index = this.points.length + index
		this.points.splice(index, 1);
	}

	setPoint(index, point)
	{
		if(index < 0) index = this.points.length + index
		this.points[index] = point;
	}

	isVisible()
	{
		return this.opacity > 0 && this.points.length > 0
	}

	draw(position, size)
	{
		Game.context.beginPath();
		Game.context.moveTo(this.points[0].x, this.points[0].y);
		for(let i=1; i<this.points.length; i++)
		{
			Game.context.lineTo(this.points[i].x, this.points[i].y);
		}
		if(this.closed) Game.context.closePath();
		Game.context.fill();
		Game.context.stroke();
	}
}

/* Spline component */
class SplineComponent extends PolygonComponent
{
	init()
	{
		let transform = this.join("TransformComponent")
	}

	generateSpline()
	{
		let arr = [];

		if(this.points.length > 2)
		{
			for(let i=1; i<this.points.length - 1; i++)
			{
				let new_arr = this.getSpline(this.points[i - 1], this.points[i], this.points[i + 1])
				arr = arr.concat(new_arr);
			}
		}

		if(this.closed)
		{

		}
		else
		{
			arr.unshift(this.points[0], this.points[0]);
			arr.push(this.points[this.points.length - 1], this.points[this.points.length - 1]);
		}

		return arr;
	}

	getSpline(a, b, c)
	{
		let arr = []

		let dirA = Vector2.getBisector(a, b, c).toDirectionVector()
		let dirB = Vector2.fromAngle(dirA.getDirectionalAngle() - 90)

		if(this.test)
		{
			this.test = false
			//console.log(Vector2.getAngle(a, b, c))
			console.log(dirA)
			setTimeout(() => {this.test = true}, 500)
		}

		let parallel = new Line(b, b.add(dirB))
		let lineA = new Line(a, a.add(dirA))
		let lineB = new Line(c, c.add(dirA))

		a = lineA.getIntersectsPoint(parallel);
		c = lineB.getIntersectsPoint(parallel);

		lineA = new Line(b, a);
		lineB = new Line(b, c);

		arr.push(lineA.getPart(0.4).p2)
		arr.push(b)
		arr.push(lineB.getPart(0.4).p2)

		/*arr.push(lineA.getPart(1.0).p2)
		arr.push(b)
		arr.push(lineB.getPart(1.0).p2)*/

		return arr;
	}

	update()
	{
		if(this.isVisible())
		{
			/* Get data */
/*			let transform_component = this.joined["TransformComponent"]
			let position = transform_component.getPosition()
			let size = transform_component.getSize()
			*/

			/* Settings */
			this.applyStyles();
			//this.applyTransformation()

			/* Draw */
			Game.context.beginPath();

			let arr = this.generateSpline();
			Game.context.moveTo(arr[0].x, arr[0].y);
			for(let i=1; i<arr.length; i += 3)
			{
				Game.context.bezierCurveTo(arr[i].x, arr[i].y, arr[i + 1].x, arr[i + 1].y, arr[i + 2].x, arr[i + 2].y);
			}

			/*for(let i=1; i<arr.length; i++)
			{
				Game.context.lineTo(arr[i].x, arr[i].y);
			}*/

			if(this.closed) Game.context.closePath();
			Game.context.fill();
			Game.context.stroke();

			for(let i=0; i<this.points.length; i++)
			{
				Game.context.beginPath();
				Game.context.fillStyle = 'red';
				Game.context.arc(this.points[i].x, this.points[i].y, 3, 0, 2 * Math.PI, false);
				Game.context.closePath();
				Game.context.fill();
				Game.context.stroke();
			}

			/* Reset*/
			Game.context.resetTransform();
		}
	}
}

/* BackgroundColorComponent 
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
*/