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

/* Properties Component */
class ArrayPropertiesComponent extends PropertiesComponent
{
	add(name, value)
	{
		if(!this.properties[name]) this.properties[name] = []
		this.properties[name].push(value)
	}

	get(name, index)
	{
		if(this.properties[name])
		{
			return this.properties[name][index]
		}
		return null
	}

	size(name)
	{
		if(this.properties[name])
		{
			return this.properties[name].length;
		}
		return 0;
	}

	set(name, index, value)
	{
		if(!this.properties[name]) this.properties[name] = []
		this.properties[name][index] = value;
	}

	index(name, value)
	{
		if(this.properties[name])
		{
			return this.properties[name].indexOf(value)
		}
		return -1
	}

	has(name, value)
	{
		return this.index(value) >= 0;
	}
}
