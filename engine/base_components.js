/* --------------------------------- Components  -------------------------------------- */
class ComponentBase
{
	name = ""
	enabled = true;
	joined = {};
	default_properties = {};
	properties = {};

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
		this.properties = Object.copy(this.default_properties)
	}

	join(name)
	{
		this.joined[name] = this.owner.getComponent(name)
		return this.joined[name];
	}

	setProperty(name, value)
	{
		if(this.default_properties[name])
		{
			this.properties[name] = value
		}
		else
		{
			alert(this.constructor.name + ` hasn't property '${name}'`)
		}
	}

	getProperty(name)
	{
		if(this.default_properties[name])
		{
			return this.properties[name]
		}
		else
		{
			alert(this.constructor.name + ` hasn't property '${name}'`)
			return null;
		}
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
			this.default_properties[name] = data[name]
		}
	}
}
