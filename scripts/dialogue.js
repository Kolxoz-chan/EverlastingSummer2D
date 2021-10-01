class Dialogue
{
	author = ""
	author_color = "yellow"
	message = ""
	prev = null
	next = []

	constructor(author, color, msg)
	{
		this.author = author
		this.author_color = color
		this.message = msg
	}

	addNext(obj)
	{
		this.next.push(obj)
		obj.prev = this;

		return obj;
	}

	callNext()
	{
		return this.next
	}

	callPrev()
	{
		return this.prev
	}
}

class DialogueMenu
{
	static dialogue = null;

	static init()
	{
		DialogueMenu.main = new Frame("dialogue_widget", "border: 2px solid green; background: rgba(0, 0, 0, 0.6); ")
		DialogueMenu.main.setPosition(50, 95, "%")
		DialogueMenu.main.setSize(80, 15, "%")
		DialogueMenu.main.hide()
		Game.addWidget(DialogueMenu.main)
		DialogueMenu.main.addEvent("onclick", function()
		{
			if(DialogueMenu.dialogue)
			{
				DialogueMenu.call(DialogueMenu.dialogue.callNext()[0])
			}
		})

		DialogueMenu.dialogue_author = new Label("dialogue_author", "", "margin: 10px; margin-bottom: 0px; color: red; text-shadow: 1px 1px 1px black;")
		DialogueMenu.main.addChild(DialogueMenu.dialogue_author)

		DialogueMenu.dialogue_text = new Label("dialogue_text", "", "margin: 10px; margin-top: 0px; color: white; text-shadow: 1px 1px 1px black;")
		DialogueMenu.main.addChild(DialogueMenu.dialogue_text)
	}

	static call(dialogue)
	{
		DialogueMenu.dialogue = dialogue;
		if(dialogue)
		{
			DialogueMenu.dialogue_author.setText(dialogue.author)
			DialogueMenu.dialogue_author.getWidget().style.color = dialogue.author_color;
			DialogueMenu.dialogue_text.setText(dialogue.message)
			DialogueMenu.main.show()
			Game.entities_named["actor"].getComponent("PlayerControlComponent").setEnabled(false)
		}
		else
		{
			DialogueMenu.main.hide()
			Game.entities_named["actor"].getComponent("PlayerControlComponent").setEnabled(true)
		}

	}
}
