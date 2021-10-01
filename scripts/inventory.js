class InventoryWidget extends WindowsSection
{
	static slots = []

	static init()
	{
		let main = this.addWindow("main", new Frame(null, "text-align: right;"))
		main.setDisplay("inline-block")
		main.setSize(99, 1, "%")
		Game.addWidget(main)
		this.addAction("main", this.updateInventory)

		for(let i=0; i<6; i++)
		{
			let slot = main.addChild(new Frame(null, "border: 2px solid green; border-radius: 10px; background-color: rgba(0,0,0,0.6); margin: 2px; "))
			slot.setDisplay("inline-block")
			slot.setSize(64, 64)
			this.slots.push(slot)
		}
	}

	static updateInventory(params)
	{
		let actor = Game.entities_named["actor"]
		if(actor.hasComponent("ArrayPropertiesComponent"))
		{
			let arr = actor.getComponent("ArrayPropertiesComponent")
			let size = arr.size("inventory")
			for(let i=0; i<size; i++)
			{
				let item = arr.get("inventory", i)
				//alert(item.constructor.name)
				if(item.hasComponent("DrawableComponent"))
				{
					let drawable = item.getComponent("DrawableComponent")
					let texture = Resources.getTexture(drawable.texture)
					let widget = this.slots[i].getWidget()
					widget.innerHTML = "<img style='width: 100%; height: 100%;' src='" + texture.src  + "'/>"
				}
			}
		}
	}
}
