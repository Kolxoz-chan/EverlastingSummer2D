class MainMenu
{
	static init()
	{
		/* ------------------------------ Background ------------------------------ */
		let bg = new Frame(null, "background-image: url(resources/textures/bg/bg_01.jpg); background-size: cover;")
		bg.setPosition(0, 0)
		bg.setSize(100, 100, "%")
		Game.addWidget(bg)

		let title = new Label("title", "Everlasting Summer Stories", "color: lightgreen; text-shadow: 1px 1px 1px black; font-size: 36pt; font-family: 'es_font', cursive;")
		title.setPosition(50, 5, "%")
		bg.addChild(title)

		/* ------------------------------ Main menu ------------------------------ */
		let main_menu = new Frame(null, "background-color: #f2e8c9dd; border: 2px solid green; padding: 10px; box-shadow: 0 0 10px black;")
		main_menu.setPosition(50, 50, "%")
		bg.addChild(main_menu)

		MainMenu.addWidget(main_menu, "Истории", function()
		{
			main_menu.hide();
			stories_menu.show();
		})

		MainMenu.addWidget(main_menu, "Загрузить", function()
		{

		})

		MainMenu.addWidget(main_menu, "Настройки", function()
		{

		})

		MainMenu.addWidget(main_menu, "Поддержать нас", function()
		{
			window.open('https://www.patreon.com/kolxoz');
		})

		MainMenu.addWidget(main_menu, "Выход", function()
		{
			window.close()
		})

		/* ------------------------------ Stories menu ------------------------------ */
		let stories_menu = new Frame(null, "background-color: #f2e8c9dd; border: 2px solid green; padding: 10px; box-shadow: 0 0 10px black;")
		stories_menu.setPosition(50, 50, "%")
		stories_menu.setSize(200, 300)
		stories_menu.hide()
		bg.addChild(stories_menu)

		let stories_title = new Label("dialogue_author", "Истории", "display: block; color: green; text-shadow: 1px 1px 1px black; font-size: 24pt; text-align: center; font-family: 'es_font', cursive;")
		stories_menu.addChild(stories_title)

		let stories_list = new Frame(null, "padding: 5px;")
		stories_menu.addChild(stories_list)

		let stories_back = new Button("dialogue_author", "Назад", "border: none; background: none; font-size: 16pt; color: green; font-size: 20pt;")
		stories_back.setSize(100, 0, "%")
		stories_back.setPosition(50, 85, "%")
		stories_menu.addChild(stories_back)
		stories_back.addEvent("onclick", function()
		{
			stories_menu.hide()
			main_menu.show()

		})

		Resources.loadByURL("settings.json", "json", function(data)
		{
			for(let i in data.stories)
			{
				let src = "stories/" + data.stories[i];
				let button = new Button(null, data.stories[i], "border: none; background: none; font-size: 16pt;")
				button.setSize(100, 10, "%")
				button.hide()
				stories_list.addChild(button)
				button.addEvent("onclick", function()
				{
					Resources.loadByURL(src + "/main.js", "text", function(data)
					{
						eval(data);
					})
					bg.hide();
				})

				Resources.loadByURL(src + "/settings.json", "json", function(data)
				{
					if(data)
					{
						button.setText(data.name)
						button.show();
					}
				});

			}
		})
	}

	static addWidget(parent, text, action)
	{
		let obj = new Button(null, text, "font-size: 18pt; background: none; border: none;")
		obj.setSize(200, 50)
		parent.addChild(obj)
		obj.addEvent("onclick", action)

		return obj;
	}
}
