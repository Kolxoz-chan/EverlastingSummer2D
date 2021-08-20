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
